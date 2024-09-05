const cloudinary = require("cloudinary").v2;
const { Sequelize } = require("sequelize");
const Protocol = require("../models/Protocol");
const Reaction = require("../models/Reaction");
const Reactive = require("../models/reactive");
const Favourite = require("../models/Favourite");
const User = require("../models/User");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const Op = Sequelize.Op;

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME_CLOUDINARY,
  api_key: process.env.API_KEY_CLOUDINARY,
  api_secret: process.env.API_SECRET_CLOUDINARY,
});

const getProtocols = async (req, res) => {
  try {
    let whereClause = {};
    let includeClause = [];

    const authHeader = req.header("Authorization");
    if (authHeader) {
      const token = authHeader.replace("Bearer ", "");

      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        const { company, role, id } = req.user;

        whereClause =
          role === "admin"
            ? { publication_state: { [Op.or]: ["Borrador", "Publicado"] } }
            : {
                confidential: {
                  [Op.or]: ["no", company],
                },
                publication_state: "Publicado",
              };

        if (req.query.favourites) {
          includeClause.push({
            model: User,
            as: "Favourites",
            through: {
              model: Favourite,
              where: { user_id: id },
            },
            required: true,
          });
        }
      } catch (error) {
        whereClause = {
          confidential: "no",
          publication_state: "Publicado",
        };
      }
    } else {
      whereClause = {
        confidential: "no",
        publication_state: "Publicado",
      };
    }

    if (req.query.search) {
      const search = req.query.search.toLowerCase();
      whereClause = {
        ...whereClause,
        [Op.or]: [
          Sequelize.where(
            Sequelize.fn("LOWER", Sequelize.col("title")),
            "LIKE",
            `%${search}%`
          ),
          Sequelize.where(
            Sequelize.fn("LOWER", Sequelize.col("objective")),
            "LIKE",
            `%${search}%`
          ),
          Sequelize.where(
            Sequelize.fn("LOWER", Sequelize.col("info")),
            "LIKE",
            `%${search}%`
          ),
        ],
      };
    } else if (req.query.category) {
      const category = req.query.category;
      whereClause = {
        ...whereClause,
        ...(category !== "all-categories" && { category }),
      };
    }

    const order = req.query.order || "DESC";

    const protocols = await Protocol.findAll({
      where: whereClause,
      include: includeClause,
      order: [["createdAt", order]],
    });
    res.json(protocols);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getProtocolById = async (req, res) => {
  try {
    let whereClause = { id: req.params.protocolId };

    const authHeader = req.header("Authorization");
    if (authHeader) {
      const token = authHeader.replace("Bearer ", "");

      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;

        const { company, role } = req.user;
        whereClause =
          role === "admin"
            ? {
                ...whereClause,
                publication_state: { [Op.or]: ["Borrador", "Publicado"] },
              }
            : {
                ...whereClause,
                confidential: {
                  [Op.or]: ["no", company],
                },
                publication_state: "Publicado",
              };
      } catch (error) {
        console.warn("Token inválido, procediendo como usuario no autenticado");
        whereClause = {
          ...whereClause,
          confidential: "no",
          publication_state: "Publicado",
        };
      }
    } else {
      whereClause = {
        ...whereClause,
        confidential: "no",
        publication_state: "Publicado",
      };
    }

    const protocol = await Protocol.findOne({
      where: whereClause,
      include: {
        model: Reaction,
        include: [Reactive],
      },
    });

    if (!protocol) {
      return res
        .status(404)
        .json({ error: "Protocolo no encontrado o acceso denegado" });
    }

    const protocolData = protocol.get({ plain: true });

    protocolData.reactions = protocolData.Reactions;
    delete protocolData.Reactions;

    protocolData.reactions.forEach((reaction) => {
      reaction.reactives = reaction.Reactives;
      delete reaction.Reactives;
    });

    res.json(protocolData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const createProtocol = async (req, res) => {
  try {
    const { ...protocolData } = req.body;
    let { reactions } = req.body;

    console.log("req.body", req.body);

    if (typeof reactions === "string") {
      reactions = JSON.parse(reactions);
    }

    let imageUrl = null;

    if (req.file) {
      const result = await new Promise((resolve, reject) => {
        cloudinary.uploader
          .upload_stream({ folder: "protocol_images" }, (error, result) => {
            if (error) {
              console.log("Cloudinary error:", error);
              reject(new Error("Fallo subiendo imagen a Cloudinary"));
            } else {
              resolve(result.secure_url);
            }
          })
          .end(req.file.buffer);
      });
      imageUrl = result;
    }

    const protocol = await Protocol.create({
      ...protocolData,
      featured_image: imageUrl,
    });

    if (reactions && reactions.length > 0) {
      for (const reactionData of reactions) {
        const { reactives, ...reactionDetails } = reactionData;
        const reaction = await Reaction.create({
          ...reactionDetails,
          protocol_id: protocol.id,
        });

        if (reactives && reactives.length > 0) {
          for (const reactive of reactives) {
            await Reactive.create({
              ...reactive,
              reaction_id: reaction.id,
            });
          }
        }
      }
    }

    res.json(protocol);
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({ error: error.message });
  }
};

const updateProtocol = async (req, res) => {
  try {
    const { removeImage, ...protocolData } = req.body;
    const protocol = await Protocol.findByPk(req.params.id);
    let { reactions } = req.body;
    if (typeof reactions === "string") {
      reactions = JSON.parse(reactions);
    }

    if (!protocol) {
      return res.status(404).json({ error: "Protocolo no encontrado" });
    }

    let imageUrl = protocol.featured_image;

    if (req.file) {
      if (protocol.featured_image) {
        const publicIdWithFolder = protocol.featured_image
          .split("/")
          .slice(-2)
          .join("/")
          .split(".")[0];
        await cloudinary.uploader.destroy(publicIdWithFolder);
      }

      imageUrl = await new Promise((resolve, reject) => {
        cloudinary.uploader
          .upload_stream({ folder: "protocol_images" }, (error, result) => {
            if (error) {
              reject(new Error("Failed to upload image to Cloudinary"));
            } else {
              resolve(result.secure_url);
            }
          })
          .end(req.file.buffer);
      });
    } else if (!req.file && removeImage && protocol.featured_image) {
      const publicIdWithFolder = protocol.featured_image
        .split("/")
        .slice(-2)
        .join("/")
        .split(".")[0];
      await cloudinary.uploader.destroy(publicIdWithFolder);

      imageUrl = null;
    }

    await protocol.update({ ...protocolData, featured_image: imageUrl });

    for (const reactionData of reactions) {
      const { id, reactives, ...reactionDetails } = reactionData;

      if (id) {
        const reaction = await Reaction.findByPk(id);
        if (reaction) {
          await reaction.update(reactionDetails);

          const existingReactives = await Reactive.findAll({
            where: { reaction_id: reaction.id },
          });

          const reactivesIds = reactives
            .map((reactive) => reactive.id)
            .filter((id) => id);

          for (const existingReactive of existingReactives) {
            if (!reactivesIds.includes(existingReactive.id)) {
              await existingReactive.destroy();
            }
          }

          for (const reactive of reactives) {
            if (reactive.id) {
              const existingReactive = await Reactive.findByPk(reactive.id);
              if (existingReactive) {
                await existingReactive.update(reactive);
              }
            } else {
              await Reactive.create({
                ...reactive,
                reaction_id: reaction.id,
              });
            }
          }
        } else {
          const newReaction = await Reaction.create({
            ...reactionDetails,
            protocol_id: protocol.id,
          });

          for (const reactive of reactives) {
            await Reactive.create({
              ...reactive,
              reaction_id: newReaction.id,
            });
          }
        }
      }
      const existingReactions = await Reaction.findAll({
        where: { protocol_id: protocol.id },
      });

      const updatedReactionIds = reactions
        .map((reaction) => reaction.id)
        .filter((id) => id);

      for (const existingReaction of existingReactions) {
        if (!updatedReactionIds.includes(existingReaction.id)) {
          await existingReaction.destroy();
        }
      }
    }
    res.json(protocol);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteProtocol = async (req, res) => {
  try {
    const protocol = await Protocol.findByPk(req.params.id);

    if (!protocol) {
      return res.status(404).json({ error: "Protocolo no encontrado" });
    }

    const reactions = await Reaction.findAll({
      where: { protocol_id: protocol.id },
    });
    for (const reaction of reactions) {
      await Reactive.destroy({ where: { reaction_id: reaction.id } });
      await reaction.destroy();
    }

    await Favourite.destroy({ where: { protocol_id: protocol.id } });

    if (protocol.featured_image) {
      const publicIdWithFolder = protocol.featured_image
        .split("/")
        .slice(-2)
        .join("/")
        .split(".")[0];
      await cloudinary.uploader.destroy(publicIdWithFolder);
    }

    await protocol.destroy();
    res.sendStatus(204);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const addProtocolToFavourite = async (req, res) => {
  const { protocol_id } = req.body;
  const user_id = req.user.id;

  if (!user_id || !protocol_id) {
    return res
      .status(400)
      .json({ error: "Se requieren IDs de usuario y de protocolo." });
  }

  try {
    const existingFavourite = await Favourite.findOne({
      where: {
        user_id,
        protocol_id,
      },
    });

    if (existingFavourite) {
      return res
        .status(200)
        .json({ message: "El protocolo ya está en favoritos." });
    }

    const newFavourite = await Favourite.create({ user_id, protocol_id });
    res.status(201).json({
      message: "Protocolo añadido a favoritos.",
      favourite: newFavourite,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteProtocolFromFavourite = async (req, res) => {
  const { protocol_id } = req.body;
  const user_id = req.user.id;

  if (!user_id || !protocol_id) {
    return res
      .status(400)
      .json({ error: "Se requieren IDs de usuario y de protocolo." });
  }

  try {
    const favourite = await Favourite.findOne({
      where: {
        user_id,
        protocol_id,
      },
    });

    if (!favourite) {
      return res.status(404).json({ error: "Favorito no encontrado." });
    }

    await favourite.destroy();

    res.status(200).json({ message: "Favorito eliminado satisfactoriamente." });
  } catch (error) {
    console.error("Error eliminando favorito:", error);
    res.status(500).json({ error: error.message });
  }
};

const isProtocolFavourite = async (req, res) => {
  const { protocol_id } = req.body;
  const user_id = req.user.id;

  if (!user_id || !protocol_id) {
    return res
      .status(400)
      .json({ error: "Se requieren IDs de usuario y de protocolo." });
  }

  try {
    const favourite = await Favourite.findOne({
      where: {
        user_id,
        protocol_id,
      },
    });

    if (favourite) {
      return res.status(200).json({
        isFavourite: true,
        message: "El protocolo es favorito del usuario.",
      });
    } else {
      return res.status(200).json({
        isFavourite: false,
        message: "El protocolo no es favorito del usuario.",
      });
    }
  } catch (error) {
    console.error("Error comprobando favorito:", error);
    res.status(500).json({ error: error.message });
  }
};

const protocolQuillImageUpload = async (req, res) => {
  try {
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: "No se ha subido ningún archivo" });
    }

    const imageUrl = await new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            folder: "protocols_quill_images",
          },
          (error, result) => {
            if (error) {
              console.error("Cloudinary error:", error);
              reject(new Error("Error subiendo imagen a cloudinary"));
            } else {
              resolve(result.secure_url);
            }
          }
        )
        .end(file.buffer);
    });

    console.log(imageUrl);
    res.status(200).json({
      message: "Imagen subida correctamente",
      secure_url: imageUrl,
    });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Fallo subiendo imagen", details: error.message });
  }
};

const protocolQuillImageDeletion = async (req, res) => {
  const { img_url } = req.body;

  try {
    if (img_url) {
      const publicIdWithFolder = img_url
        .split("/")
        .slice(-2)
        .join("/")
        .split(".")[0];
      await cloudinary.uploader.destroy(publicIdWithFolder);
    }
    res.status(200).send({ message: "Imagen eliminada correctamente" });
  } catch (error) {
    res.status(500).send({ error: "Fallo para eliminar imagen" });
  }
};

module.exports = {
  getProtocols,
  getProtocolById,
  createProtocol,
  updateProtocol,
  deleteProtocol,
  addProtocolToFavourite,
  deleteProtocolFromFavourite,
  isProtocolFavourite,
  protocolQuillImageUpload,
  protocolQuillImageDeletion,
};
