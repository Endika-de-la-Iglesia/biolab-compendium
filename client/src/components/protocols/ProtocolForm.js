import React, { useCallback, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

import NavBar from "../navigation/NavBar";
import BottomBar from "../BottomBar";
import MyDropzone from "../helpers/dropzone-component";
import {
  unitConversionFactors,
  concentrationUnitsMatching,
  correctConcentrationLogic,
  decimalCommaToDot,
} from "../helpers/reactives-concentration-helper";
import MyEditor from "../helpers/MyEditor";
import TravelToTop from "../navigation/TravelToTop";
import Loading from "../Loading";
import useTokenValidation from "../helpers/useTokenValidation";
const config = require("../../../env");

export default function ProtocolForm({ mode }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const apiUrl = config.apiUrl;
  const validateToken = useTokenValidation();

  const [protocol, setProtocol] = useState({
    title: "",
    category: "Biomoléculas-DNA",
    publication_state: "Borrador",
    objective: "",
    info: "",
    confidential: "no",
    youtube_link: "",
  });

  const [featuredImage, setFeaturedImage] = useState(null);
  const [previousServerImage, setPreviousServerImage] = useState();
  const [reactions, setReactions] = useState([]);
  const [removeImage, setRemoveImage] = useState(false);
  const [prevText, setPrevText] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (mode === "edit" && id && validateToken()) {
      axios
        .get(`${apiUrl}/api/protocols/${id}`)
        .then((response) => {
          setProtocol(response.data);
          setReactions(response.data.reactions || []);
          setPreviousServerImage(response.data.featured_image);
          setPrevText(response.data.info);
          setIsLoading(false);
        })
        .catch((error) => {
          alert("Error al recuperar protocolo:", error);
          setIsLoading(false);
        });
    } else {
      setIsLoading(false);
    }
  }, [mode, id]);

  const handleImgDrop = (acceptedFiles) => {
    if (acceptedFiles && acceptedFiles.length > 0) {
      setFeaturedImage(acceptedFiles[0]);
    } else {
      setFeaturedImage(null);
      setRemoveImage(true);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    for (let i = 0; i < reactions.length; i++) {
      const reaction = reactions[i];
      for (let j = 0; j < reaction.reactives.length; j++) {
        const reactive = reaction.reactives[j];

        const {
          initial_concentration_value,
          initial_concentration_units,
          final_concentration_value,
          final_concentration_units,
        } = reactive;

        if (
          !concentrationUnitsMatching(
            initial_concentration_units,
            final_concentration_units
          )
        ) {
          alert(
            `Error: Las unidades de concentración inicial y final no coinciden para el reactivo ${
              j + 1
            } en la reacción ${i + 1}.`
          );
          return;
        }

        if (
          !correctConcentrationLogic(
            initial_concentration_value,
            initial_concentration_units,
            final_concentration_value,
            final_concentration_units
          )
        ) {
          alert(
            `Error: La concentración final debe ser menor o igual que la concentración inicial para el reactivo ${
              j + 1
            } en la reacción ${i + 1}.`
          );
          return;
        }
      }
    }

    setIsLoading(true);

    const formData = new FormData();
    formData.append("title", protocol.title);
    formData.append("category", protocol.category);
    formData.append("publication_state", protocol.publication_state);
    formData.append("objective", protocol.objective);
    formData.append("info", protocol.info);
    formData.append("confidential", protocol.confidential);
    formData.append("youtube_link", protocol.youtube_link);

    if (featuredImage) {
      formData.append("featured_image", featuredImage);
    } else {
      formData.append("removeImage", removeImage);
    }

    formData.append("reactions", JSON.stringify(reactions));

    try {
      let response;
      if (mode === "creation" && validateToken()) {
        response = await axios.post(`${apiUrl}/api/protocols`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        if (response.status === 201 || response.status === 200) {
          alert("Protocolo creado");
          navigate(`/protocols/all-categories`);
          setIsLoading(false);
        }
      } else if (mode === "edit" && validateToken()) {
        response = await axios.put(`${apiUrl}/api/protocols/${id}`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        if (response.status === 201 || response.status === 200) {
          alert("Protocolo actualizado");
          navigate(`/protocols/protocol/${response.data.id}`);
          setIsLoading(false);
        }
      }
      resetFormState();
    } catch (error) {
      console.error("Error Details:", error);
      alert("Error al enviar el formulario:", error.message);
    }
  };

  const addReaction = () => {
    setReactions([
      ...reactions,
      {
        title: "",
        reactives: [
          {
            name: "",
            initial_concentration_value: "",
            initial_concentration_units: "",
            final_concentration_value: "",
            final_concentration_units: "",
          },
        ],
        reaction_volume_value: "",
        reaction_volume_units: "",
        solvent: "",
      },
    ]);
  };

  const deleteReaction = (reactionIndex) => {
    const updatedReactions = reactions.filter(
      (_, index) => index !== reactionIndex
    );
    setReactions(updatedReactions);
  };

  const updateReaction = (index, field, value) => {
    const updatedReactions = [...reactions];
    updatedReactions[index][field] = value;
    setReactions(updatedReactions);
  };

  const addReactive = (reactionIndex) => {
    const updatedReactions = [...reactions];
    updatedReactions[reactionIndex].reactives.push({
      name: "",
      initial_concentration_value: "",
      initial_concentration_units: "",
      final_concentration_value: "",
      final_concentration_units: "",
    });
    setReactions(updatedReactions);
  };

  const deleteReactive = (reactionIndex, reactiveIndex) => {
    const updatedReactions = [...reactions];
    updatedReactions[reactionIndex].reactives = updatedReactions[
      reactionIndex
    ].reactives.filter((_, index) => index !== reactiveIndex);
    setReactions(updatedReactions);
  };

  const updateReactiveField = (reactionIndex, reactiveIndex, field, value) => {
    const hasNumbers = /\d/.test(value);
    let normalizedValue = value;

    if (hasNumbers) {
      normalizedValue = decimalCommaToDot(value);
    }

    const updatedReactions = [...reactions];
    updatedReactions[reactionIndex].reactives[reactiveIndex][field] =
      normalizedValue;
    setReactions(updatedReactions);
  };

  const resetFormState = () => {
    setProtocol({
      title: "",
      category: "Biomoléculas-DNA",
      publication_state: "Borrador",
      objective: "",
      info: "",
      confidential: "no",
      youtube_link: "",
    });

    setReactions([]);
    setFeaturedImage(null);
    setRemoveImage(false);
  };

  const concentrationOptions = Object.keys(
    unitConversionFactors.concentration
  ).reduce((acc, key) => {
    return [...acc, ...Object.keys(unitConversionFactors.concentration[key])];
  }, []);

  const volumeOptions = Object.keys(unitConversionFactors.volume);

  const handleTextInput = useCallback((text) => {
    setProtocol((prevProtocol) => ({ ...prevProtocol, info: text }));
  }, []);

  return (
    <div className="protocol-form-container container">
      <NavBar />
      {isLoading ? (
        <Loading />
      ) : (
        <div className="protocol-form-wrapper main-wrapper">
          <TravelToTop />
          <h2>{mode === "edit" ? "Modificar protocolo" : "Nuevo protocolo"}</h2>
          <form onSubmit={handleSubmit}>
            <div className="protocol-title">
              <h4>Título</h4>

              <input
                placeholder="Título"
                type="text"
                value={protocol.title}
                onChange={(e) =>
                  setProtocol({ ...protocol, title: e.target.value })
                }
                required
              />
            </div>

            <div className="protocol-category">
              <h4>Categoría</h4>

              <select
                name="category"
                value={protocol.category}
                onChange={(e) =>
                  setProtocol({ ...protocol, category: e.target.value })
                }
              >
                <option value="Biomoléculas-DNA">Biomoléculas-DNA</option>
                <option value="Biomoléculas-Proteínas">
                  Biomoléculas-Proteínas
                </option>
                <option value="Microbiología">Microbiología</option>
                <option value="Cultivos celulares">Cultivos celulares</option>
              </select>
            </div>

            <div className="protocol-publication-state">
              <h4>Estado de publicación:</h4>

              <select
                name="publication_state"
                value={protocol.publication_state}
                onChange={(e) =>
                  setProtocol({
                    ...protocol,
                    publication_state: e.target.value,
                  })
                }
              >
                <option value="Borrador">Borrador</option>
                <option value="Publicado">Publicado</option>
              </select>
            </div>

            <div className="protocol-objective">
              <h4>Objetivo</h4>

              <input
                placeholder="Objetivo"
                type="text"
                value={protocol.objective}
                onChange={(e) =>
                  setProtocol({ ...protocol, objective: e.target.value })
                }
                required
              />
            </div>

            <div className="protocol-info">
              <h4>Texto</h4>

              <MyEditor
                handleTextInput={handleTextInput}
                prevText={mode === "edit" ? prevText : ""}
              />
            </div>

            <div className="protocol-featured-img">
              <h4>Imagen de portada:</h4>
              <div className="featured-img-uploader">
                <MyDropzone
                  onDrop={handleImgDrop}
                  previousImg={previousServerImage}
                />
              </div>
            </div>

            <div className="protocol-confidential">
              <h4>Confidencialidad:</h4>

              <select
                name="confidential"
                value={protocol.confidential}
                onChange={(e) =>
                  setProtocol({ ...protocol, confidential: e.target.value })
                }
              >
                <option value="no">No</option>
                <option value="Google">Google</option>
              </select>
            </div>

            <div className="protocol-youtube-link">
              <h4>Link youtube:</h4>

              <input
                placeholder="YouTube Link"
                type="text"
                value={protocol.youtube_link}
                onChange={(e) =>
                  setProtocol({ ...protocol, youtube_link: e.target.value })
                }
              />
            </div>

            {/* Reactions section */}
            <div className="protocol-reactions">
              <h4>Reacciones</h4>

              {reactions.map((reaction, reactionIndex) => (
                <div key={reactionIndex} className="reaction">
                  <h5>Reacción {reactionIndex + 1}</h5>
                  <input
                    placeholder="Nombre de la reacción"
                    type="text"
                    value={reaction.title}
                    onChange={(e) =>
                      updateReaction(reactionIndex, "title", e.target.value)
                    }
                    required
                  />

                  {reaction.reactives.map((reactive, reactiveIndex) => (
                    <div key={reactiveIndex} className="reactive">
                      <h6>Reactivo {reactiveIndex + 1}</h6>
                      <input
                        placeholder="Nombre"
                        type="text"
                        value={reactive.name}
                        onChange={(e) =>
                          updateReactiveField(
                            reactionIndex,
                            reactiveIndex,
                            "name",
                            e.target.value
                          )
                        }
                        required
                      />
                      <input
                        placeholder="Concentración inicial (valor)"
                        type="number"
                        step="0.01"
                        value={reactive.initial_concentration_value}
                        onChange={(e) =>
                          updateReactiveField(
                            reactionIndex,
                            reactiveIndex,
                            "initial_concentration_value",
                            e.target.value
                          )
                        }
                        required
                      />

                      <select
                        value={reactive.initial_concentration_units}
                        onChange={(e) =>
                          updateReactiveField(
                            reactionIndex,
                            reactiveIndex,
                            "initial_concentration_units",
                            e.target.value
                          )
                        }
                        required
                      >
                        <option value="">
                          Concentración inicial (unidades)
                        </option>
                        {concentrationOptions.map((unit, index) => (
                          <option key={index} value={unit}>
                            {unit}
                          </option>
                        ))}
                      </select>

                      <input
                        placeholder="Concentración final (valor)"
                        type="number"
                        step="0.01"
                        value={reactive.final_concentration_value}
                        onChange={(e) =>
                          updateReactiveField(
                            reactionIndex,
                            reactiveIndex,
                            "final_concentration_value",
                            e.target.value
                          )
                        }
                        required
                      />

                      <select
                        value={reactive.final_concentration_units}
                        onChange={(e) =>
                          updateReactiveField(
                            reactionIndex,
                            reactiveIndex,
                            "final_concentration_units",
                            e.target.value
                          )
                        }
                        required
                      >
                        <option value="">Concentración final (unidades)</option>
                        {concentrationOptions.map((unit, index) => (
                          <option key={index} value={unit}>
                            {unit}
                          </option>
                        ))}
                      </select>

                      <button
                        className="btn"
                        type="button"
                        onClick={() =>
                          deleteReactive(reactionIndex, reactiveIndex)
                        }
                      >
                        Eliminar Reactivo
                      </button>
                    </div>
                  ))}

                  <button
                    className="btn"
                    type="button"
                    onClick={() => addReactive(reactionIndex)}
                  >
                    Añadir Reactivo
                  </button>

                  <input
                    placeholder="Volumen total reacción (valor)"
                    type="number"
                    step="0.01"
                    value={reaction.reaction_volume_value}
                    onChange={(e) =>
                      updateReaction(
                        reactionIndex,
                        "reaction_volume_value",
                        e.target.value
                      )
                    }
                    required
                  />

                  <select
                    value={reaction.reaction_volume_units}
                    onChange={(e) =>
                      updateReaction(
                        reactionIndex,
                        "reaction_volume_units",
                        e.target.value
                      )
                    }
                    required
                  >
                    <option value="">Volumen total reacción (unidades)</option>
                    {volumeOptions.map((unit, index) => (
                      <option key={index} value={unit}>
                        {unit}
                      </option>
                    ))}
                  </select>

                  <input
                    placeholder="Solvente de la reacción"
                    type="text"
                    value={reaction.solvent}
                    onChange={(e) =>
                      updateReaction(reactionIndex, "solvent", e.target.value)
                    }
                    required
                  />

                  <button
                    className="btn"
                    type="button"
                    onClick={() => deleteReaction(reactionIndex)}
                  >
                    Eliminar Reacción
                  </button>
                </div>
              ))}
              <button className="btn" type="button" onClick={addReaction}>
                Añadir reacción
              </button>
            </div>

            <button className="btn" type="submit">
              {mode === "creation" ? "Crear protocolo" : "Actualizar protocolo"}
            </button>
          </form>
        </div>
      )}
      <BottomBar />
    </div>
  );
}
