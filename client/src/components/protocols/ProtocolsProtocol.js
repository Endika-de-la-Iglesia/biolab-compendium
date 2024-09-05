import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { useSelector } from "react-redux";
import "quill/dist/quill.snow.css";

import NavBar from "../navigation/NavBar";
import TravelToTop from "../navigation/TravelToTop";
import BottomBar from "../BottomBar";
import Loading from "../Loading";
import DeletionModal from "../Modal/DeletionModal";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import useTokenValidation from "../helpers/useTokenValidation";
import {
  unitConversionFactors,
  concentrationUnitsMatching,
  correctConcentrationLogic,
  calculateReactiveVolume,
  decimalCommaToDot,
  convertVolumeUnits,
} from "../helpers/reactives-concentration-helper";
import { useHandlePrint } from "../helpers/usePrint";
const config = require("../../../env");

const ProtocolsProtocol = () => {
  const componentRef = useRef();
  const [selectorsToHide, setSelectorsToHide] = useState([]);
  const handlePrint = useHandlePrint(componentRef, selectorsToHide);

  const { id } = useParams();
  const navigate = useNavigate();
  const [protocol, setProtocol] = useState(null);
  const apiUrl = config.apiUrl;
  const [updatedReactions, setUpdatedReactions] = useState([
    {
      title: "",
      reactives: [
        {
          name: "",
          initial_concentration_value: 0,
          initial_concentration_units: "",
          final_concentration_value: 0,
          final_concentration_units: "",
          eliminate_from_mix: false,
          reactive_volume_value: 0,
          reactive_volume_units: "",
        },
      ],
      reaction_volume_value: 0,
      reaction_volume_units: "",
      solvent: "",
      solvent_volume_value: 0,
      solvent_volume_units: "",
      premix_volume_value: 0,
      premix_volume_units: "",
      extra_percent: 10,
      number_samples: 1,
    },
  ]);

  const [isLoathing, setIsLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [isFavourite, setIsFavourite] = useState(false);
  const [printTrigger, setPrintTrigger] = useState(false);

  const { token, role, isAuthenticated } = useSelector((state) => state.auth);
  const validateToken = useTokenValidation();

  const concentrationOptions = Object.keys(
    unitConversionFactors.concentration
  ).reduce((acc, key) => {
    return [...acc, ...Object.keys(unitConversionFactors.concentration[key])];
  }, []);

  const volumeOptions = Object.keys(unitConversionFactors.volume);

  useEffect(() => {
    axios
      .get(`${apiUrl}/api/protocols/${id}`)
      .then((response) => {
        setProtocol(response.data);
        const mergedReactions = mergeWithDefaults(response.data.reactions);
        setUpdatedReactions(mergedReactions);

        if (token && isAuthenticated && validateToken()) {
          axios
            .post(`${apiUrl}/api/protocols/favourite/check`, {
              protocol_id: response.data.id,
            })
            .then((response) => {
              setIsFavourite(response.data.isFavourite);
            });
        }
        setIsLoading(false);
      })
      .catch((error) => {
        alert("Error obteniendo protocolo:", error);
        navigate("/protocols");
      });
  }, [id]);

  const mergeWithDefaults = (reactionsFromAPI) => {
    const initialReactions = reactionsFromAPI.map((reaction) => ({
      ...updatedReactions[0],
      ...reaction,
      solvent_volume_units: reaction.reaction_volume_units,
      premix_volume_units: reaction.reaction_volume_units,
      reactives: reaction.reactives.map((reactive) => ({
        ...updatedReactions[0].reactives[0],
        ...reactive,
        reactive_volume_units: reaction.reaction_volume_units,
      })),
    }));

    return initialReactions.map((reaction) => {
      return recalculateVolumes(reaction);
    });
  };

  const recalculateVolumes = (reaction) => {
    const updatedReactives = reaction.reactives.map((reactive) => {
      const calculatedValue = handleReactiveVolumeCalculation(
        reaction.extra_percent,
        reaction.number_samples,
        reaction.reaction_volume_value,
        reaction.reaction_volume_units,
        reactive.initial_concentration_value,
        reactive.initial_concentration_units,
        reactive.final_concentration_value,
        reactive.final_concentration_units
      );

      const finalReactiveVolume = convertVolumeUnits(
        calculatedValue,
        reaction.reaction_volume_units,
        reactive.reactive_volume_units
      );

      return {
        ...reactive,
        reactive_volume_value: parseFloat(finalReactiveVolume.toFixed(3)),
      };
    });

    const totalReactiveVolume = updatedReactives.reduce(
      (total, reactive) =>
        total +
        convertVolumeUnits(
          reactive.reactive_volume_value || 0,
          reactive.reactive_volume_units,
          reaction.reaction_volume_units
        ),
      0
    );

    const solventVolumeValue = convertVolumeUnits(
      ((reaction.reaction_volume_value * (reaction.extra_percent + 100)) /
        100) *
        reaction.number_samples -
        totalReactiveVolume,
      reaction.reaction_volume_units,
      reaction.solvent_volume_units
    );

    const totalReactiveVolumeSeparate = updatedReactives.reduce(
      (total, reactive) => {
        if (reactive.eliminate_from_mix) {
          return (
            total +
            convertVolumeUnits(
              reactive.reactive_volume_value || 0,
              reactive.reactive_volume_units,
              reaction.reaction_volume_units
            )
          );
        }
        return total;
      },
      0
    );

    const premixVolumeValue = convertVolumeUnits(
      (totalReactiveVolume + solventVolumeValue - totalReactiveVolumeSeparate) /
        ((reaction.number_samples * (reaction.extra_percent + 100)) / 100),
      reaction.reaction_volume_units,
      reaction.premix_volume_units
    );

    return {
      ...reaction,
      reactives: updatedReactives,
      solvent_volume_value: parseFloat(solventVolumeValue.toFixed(3)),
      premix_volume_value: parseFloat(premixVolumeValue.toFixed(3)),
    };
  };

  const handleReactionReactiveChange = (
    reactionIndex,
    reactiveIndex,
    field,
    value
  ) => {
    setUpdatedReactions((prevReactions) => {
      const newReactions = prevReactions.map((reaction, rIdx) => {
        if (rIdx !== reactionIndex) return reaction;

        let updatedReaction = { ...reaction };
        // Cambio a nivel de reacción
        if (reactiveIndex === null) {
          if (field === "reaction_volume_units") {
            const newVolumeValue = convertVolumeUnits(
              reaction.reaction_volume_value,
              reaction.reaction_volume_units,
              value
            );

            updatedReaction = {
              ...reaction,
              reaction_volume_value: parseFloat(newVolumeValue.toFixed(3)),
              [field]: value,
            };
          } else if (field === "solvent_volume_units") {
            const newVolumeValue = convertVolumeUnits(
              reaction.solvent_volume_value,
              reaction.solvent_volume_units,
              value
            );

            updatedReaction = {
              ...reaction,
              solvent_volume_value: parseFloat(newVolumeValue.toFixed(3)),
              [field]: value,
            };
          } else if (field === "premix_volume_units") {
            const newVolumeValue = convertVolumeUnits(
              reaction.premix_volume_value,
              reaction.premix_volume_units,
              value
            );

            updatedReaction = {
              ...reaction,
              premix_volume_value: parseFloat(newVolumeValue.toFixed(3)),
              [field]: value,
            };
          } else {
            updatedReaction = {
              ...reaction,
              [field]: value,
            };
          }
        } else {
          // cambio a nivel de reactivo
          updatedReaction = {
            ...reaction,
            reactives: reaction.reactives.map((reactive, reIdx) => {
              if (reIdx === reactiveIndex) {
                if (field === "reactive_volume_units") {
                  const newVolumeValue = convertVolumeUnits(
                    reactive.reactive_volume_value,
                    reactive.reactive_volume_units,
                    value
                  );
                  return {
                    ...reactive,
                    reactive_volume_value: parseFloat(
                      newVolumeValue.toFixed(3)
                    ),
                    [field]: value,
                  };
                }
                return {
                  ...reactive,
                  [field]: value,
                };
              }
              return reactive;
            }),
          };
        }

        return recalculateVolumes(updatedReaction);
      });

      return newReactions;
    });
  };

  const addReactive = (reactions, reactionIndex) => {
    const updatedReactions = [...reactions];
    const reaction = updatedReactions[reactionIndex];

    updatedReactions[reactionIndex].reactives.push({
      name: "Nuevo reactivo",
      initial_concentration_value: 0,
      initial_concentration_units: "M",
      final_concentration_value: 0,
      final_concentration_units: "M",
      eliminate_from_mix: false,
      reactive_volume_value: 0,
      reactive_volume_units: reaction.reaction_volume_units || "nL",
    });

    setUpdatedReactions(updatedReactions);
  };

  const deleteReactive = (reactions, reactionIndex, reactiveIndex) => {
    const updatedReactions = [...reactions];
    const reaction = updatedReactions[reactionIndex];
    const reactive = reaction.reactives[reactiveIndex];
    const reactiveVolumeValue = reactive.reactive_volume_value;
    const reactiveVolumeUnits = reactive.reactive_volume_units;

    updatedReactions[reactionIndex].reactives = updatedReactions[
      reactionIndex
    ].reactives.filter((_, index) => index !== reactiveIndex);

    updatedReactions[reactionIndex] = {
      ...reaction,
      solvent_volume_value: parseFloat(
        (
          reaction.solvent_volume_value +
          convertVolumeUnits(
            reactiveVolumeValue,
            reactiveVolumeUnits,
            reaction.solvent_volume_units
          )
        ).toFixed(3)
      ),
    };

    setUpdatedReactions(updatedReactions);
  };

  const eliminateOrAddReactiveMix = (reactionIndex, reactiveIndex) => {
    setUpdatedReactions((prevReactions) => {
      const updatedReactions = prevReactions.map((reaction, rIdx) => {
        if (rIdx !== reactionIndex) return reaction;

        const updatedReactives = reaction.reactives.map((reactive, reIdx) => {
          if (reIdx === reactiveIndex) {
            return {
              ...reactive,
              eliminate_from_mix: !reactive.eliminate_from_mix,
            };
          }
          return reactive;
        });

        const updatedReaction = {
          ...reaction,
          reactives: updatedReactives,
        };

        return recalculateVolumes(updatedReaction);
      });

      return updatedReactions;
    });
  };

  const handleDeleteClick = () => {
    setModalOpen(true);
  };

  const handleSuccesfulProtocolDeletion = () => {
    navigate("/protocols");
  };

  const handleModalClose = () => {
    setModalOpen(false);
  };

  const handleEditClick = (id) => {
    navigate(`/update-protocol/${id}`);
  };

  const handleFavouriteClick = (id) => {
    if (!isFavourite && validateToken()) {
      axios
        .post(`${apiUrl}/api/protocols/favourite`, { protocol_id: id })
        .then((response) => {
          setIsFavourite(true);
        })
        .catch((error) => {
          alert("Error marcando como favorito:", error);
        });
    } else if (validateToken()) {
      axios
        .delete(`${apiUrl}/api/protocols/favourite`, {
          data: { protocol_id: id },
        })
        .then((response) => {
          setIsFavourite(false);
        })
        .catch((error) => {
          alert("Error eliminando de favoritos:", error);
        });
    }
  };

  const handleReactiveVolumeCalculation = (
    extraPercent,
    numberSamples,
    reactionVolumeValue,
    reactionVolumeUnits,
    initialConcentrationValue,
    initialConcentrationUnits,
    finalConcentrationValue,
    finalConcentrationUnits
  ) => {
    const normalizedExtraPercent = decimalCommaToDot(extraPercent);
    const normalizedNumberSamples = decimalCommaToDot(numberSamples);
    const normalizedInitialConcentrationValue = decimalCommaToDot(
      initialConcentrationValue
    );
    const normalizedFinalConcentrationValue = decimalCommaToDot(
      finalConcentrationValue
    );
    const normalizedReactionVolumeValue =
      decimalCommaToDot(reactionVolumeValue);

    if (
      concentrationUnitsMatching(
        initialConcentrationUnits,
        finalConcentrationUnits
      ) &&
      correctConcentrationLogic(
        normalizedInitialConcentrationValue,
        initialConcentrationUnits,
        normalizedFinalConcentrationValue,
        finalConcentrationUnits
      )
    ) {
      const { reactiveVolumeValue } = calculateReactiveVolume(
        normalizedReactionVolumeValue,
        reactionVolumeUnits,
        normalizedInitialConcentrationValue,
        initialConcentrationUnits,
        normalizedFinalConcentrationValue,
        finalConcentrationUnits
      );

      const finalResult =
        reactiveVolumeValue *
        normalizedNumberSamples *
        ((100 + normalizedExtraPercent) / 100);

      return finalResult;
    } else {
      return 0;
    }
  };

  const tableRender = (
    reactions,
    reactionIndex,
    reactive,
    reactiveIndex,
    eliminatedFromMix
  ) => {
    return (
      <React.Fragment key={reactiveIndex}>
        <div className="grid-row">
          <input
            className="reactive-name"
            type="text"
            value={reactive.name}
            onChange={(e) =>
              handleReactionReactiveChange(
                reactionIndex,
                reactiveIndex,
                "name",
                e.target.value
              )
            }
          />

          <input
            type="number"
            value={
              reactive.reactive_volume_value !== 0
                ? eliminatedFromMix
                  ? parseFloat(
                      (
                        reactive.reactive_volume_value /
                        (((reactions[reactionIndex].extra_percent + 100) *
                          reactions[reactionIndex].number_samples) /
                          100)
                      ).toFixed(3)
                    )
                  : reactive.reactive_volume_value
                : ""
            }
            readOnly
          />

          <select
            value={reactive.reactive_volume_units}
            onChange={(e) =>
              handleReactionReactiveChange(
                reactionIndex,
                reactiveIndex,
                "reactive_volume_units",
                e.target.value
              )
            }
          >
            {volumeOptions.map((unit, index) => (
              <option key={index} value={unit}>
                {unit}
              </option>
            ))}
          </select>

          <input
            type="number"
            step="0.01"
            value={reactive.initial_concentration_value}
            onChange={(e) =>
              handleReactionReactiveChange(
                reactionIndex,
                reactiveIndex,
                "initial_concentration_value",
                decimalCommaToDot(e.target.value)
              )
            }
          />

          <select
            value={reactive.initial_concentration_units}
            onChange={(e) =>
              handleReactionReactiveChange(
                reactionIndex,
                reactiveIndex,
                "initial_concentration_units",
                e.target.value
              )
            }
          >
            {concentrationOptions.map((unit, index) => (
              <option key={index} value={unit}>
                {unit}
              </option>
            ))}
          </select>

          <input
            type="number"
            step="0.01"
            value={reactive.final_concentration_value}
            onChange={(e) =>
              handleReactionReactiveChange(
                reactionIndex,
                reactiveIndex,
                "final_concentration_value",
                decimalCommaToDot(e.target.value)
              )
            }
          />

          <select
            value={reactive.final_concentration_units}
            onChange={(e) =>
              handleReactionReactiveChange(
                reactionIndex,
                reactiveIndex,
                "final_concentration_units",
                e.target.value
              )
            }
          >
            {concentrationOptions.map((unit, index) => (
              <option key={index} value={unit}>
                {unit}
              </option>
            ))}
          </select>
        </div>

        <div className="grid-row-btns">
          <button
            className="btn"
            onClick={() =>
              eliminateOrAddReactiveMix(reactionIndex, reactiveIndex)
            }
          >
            {reactive.eliminate_from_mix
              ? "Añadir al premix"
              : "Quitar del premix"}
          </button>

          <button
            className="btn"
            onClick={() =>
              deleteReactive(reactions, reactionIndex, reactiveIndex)
            }
          >
            Quitar de la reacción
          </button>
        </div>
      </React.Fragment>
    );
  };

  const getYouTubeVideoID = (url) => {
    const regex =
      /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const match = url.match(regex);
    return match ? `https://www.youtube.com/embed/${match[1]}` : null;
  };

  const handleDownload = (infoToDownload) => {
    let commonSelectorsToHide = [
      ".btn",
      ".navbar-wrapper",
      ".youtube-video-wrapper",
      ".protocol-featured-image",
      ".download-wrapper",
    ];

    if (infoToDownload === "pdf-complete") {
      setSelectorsToHide([...commonSelectorsToHide]);
    } else if (infoToDownload === "pdf-protocol") {
      setSelectorsToHide([
        ...commonSelectorsToHide,
        ".calculation-to-download",
      ]);
    } else if (infoToDownload === "pdf-reactions") {
      setSelectorsToHide([...commonSelectorsToHide, ".protocol-to-download"]);
    }

    setPrintTrigger(true);
  };

  useEffect(() => {
    if (printTrigger) {
      handlePrint();
      setPrintTrigger(false);
    }
  }, [printTrigger, handlePrint]);

  return (
    <div ref={componentRef} className="protocol-container container">
      <NavBar />

      {!isLoathing && protocol ? (
        <div className="protocol-wrapper main-wrapper protocol-complete-to-download">
          <DeletionModal
            isOpen={modalOpen}
            handleModalClose={handleModalClose}
            protocolId={protocol.id}
            protocolTitle={protocol.title}
            handleSuccesfulProtocolDeletion={handleSuccesfulProtocolDeletion}
            token={token}
            callingComponent="protocols"
          />
          <TravelToTop />

          <div className="protocol-top-wrapper protocol-to-download">
            <div className="protocol-title-wrapper">
              <div className="protocol-title">
                <h2>{protocol.title}</h2>
              </div>

              <div className="protocol-activity-icons-wrapper">
                {role === "admin" ? (
                  <h4>{protocol.publication_state}</h4>
                ) : null}
                <div className="protocol-action-elements">
                  {isAuthenticated && role === "admin" ? (
                    <div className="admin-icons">
                      <FontAwesomeIcon
                        className="edition-icon activity-icon"
                        onClick={() => handleEditClick(protocol.id)}
                        icon="fa-file-pen"
                        size="lg"
                      />

                      <FontAwesomeIcon
                        className="delete-icon activity-icon"
                        onClick={handleDeleteClick}
                        icon="fa-trash"
                        size="lg"
                      />
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          </div>

          {protocol.featured_image && (
            <div className="protocol-featured-image">
              <img src={protocol.featured_image} alt="Featured-img" />
            </div>
          )}

          <div className="download-wrapper">
            {isAuthenticated ? (
              isFavourite ? (
                <FontAwesomeIcon
                  className="empty-heart-icon activity-icon favourite-icon"
                  onClick={() => handleFavouriteClick(protocol.id)}
                  icon="fas fa-heart"
                  size="lg"
                />
              ) : (
                <FontAwesomeIcon
                  className="empty-heart-icon activity-icon favourite-icon"
                  onClick={() => handleFavouriteClick(protocol.id)}
                  icon="far fa-heart"
                  size="lg"
                />
              )
            ) : null}

            <div
              className="download-icon activity-icon"
              onClick={() => handleDownload("pdf-complete")}
            >
              <FontAwesomeIcon icon="fa-file-pdf" size="lg" /> Completo
            </div>

            <div
              className="download-icon activity-icon"
              onClick={() => handleDownload("pdf-protocol")}
            >
              <FontAwesomeIcon icon="fa-file-pdf" size="lg" /> Protocolo
            </div>

            <div
              className="download-icon activity-icon"
              onClick={() => handleDownload("pdf-reactions")}
            >
              <FontAwesomeIcon icon="fa-file-pdf" size="lg" /> Cálculos
            </div>
          </div>

          <div className="protocol-objective protocol-to-download">
            <h3>Objetivo</h3>
            <p>{protocol.objective}</p>
          </div>

          <div className="protocol-info protocol-to-download">
            <h3>Procedimiento experimental</h3>
            <div
              className="protocol-info-text ql-editor"
              dangerouslySetInnerHTML={{ __html: protocol.info }}
            />
          </div>

          {updatedReactions.length !== 0 ? (
            <div className="protocol-reactions calculation-to-download">
              <h4>Reacciones</h4>

              {updatedReactions.map((reaction, reactionIndex) => {
                const excludedReactives = reaction.reactives.filter(
                  (reactive) => reactive.eliminate_from_mix === true
                );

                return (
                  <div key={reactionIndex} className="reaction">
                    <h5>{reaction.title}</h5>
                    <div className="reaction-header-wrapper">
                      <div className="extra-percent-wrapper">
                        <h5>Porcentaje extra (%)</h5>
                        <input
                          type="number"
                          step="1"
                          value={reaction.extra_percent}
                          onChange={(e) =>
                            handleReactionReactiveChange(
                              reactionIndex,
                              null,
                              "extra_percent",
                              decimalCommaToDot(e.target.value)
                            )
                          }
                        />
                      </div>
                      <div className="reaction-volume-wrapper">
                        <h5>Volumen de reacción</h5>
                        <input
                          type="number"
                          step="0.01"
                          value={reaction.reaction_volume_value}
                          onChange={(e) =>
                            handleReactionReactiveChange(
                              reactionIndex,
                              null,
                              "reaction_volume_value",
                              decimalCommaToDot(e.target.value)
                            )
                          }
                        />
                        <select
                          value={reaction.reaction_volume_units}
                          onChange={(e) =>
                            handleReactionReactiveChange(
                              reactionIndex,
                              null,
                              "reaction_volume_units",
                              e.target.value
                            )
                          }
                        >
                          {volumeOptions.map((unit, index) => (
                            <option key={index} value={unit}>
                              {unit}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="number-samples">
                        <h5>Número de muestras</h5>
                        <input
                          type="number"
                          value={reaction.number_samples}
                          onChange={(e) =>
                            handleReactionReactiveChange(
                              reactionIndex,
                              null,
                              "number_samples",
                              decimalCommaToDot(e.target.value)
                            )
                          }
                        />
                      </div>
                    </div>

                    <h4>Reactivos incluidos en el premix</h4>
                    <span className="small-note">
                      Nota: si un volumen de reactivo desaparece, revisa sus
                      unidades
                    </span>
                    <div className="reaction-table-container">
                      <div className="reaction-table reaction-table-inside-mix">
                        <div className="grid-header">
                          <div>Reactivo</div>
                          <div>Volumen</div>
                          <div>Concentración Inicial</div>
                          <div>Concentración Final</div>
                        </div>

                        {reaction.reactives.map((reactive, reactiveIndex) =>
                          !reactive.eliminate_from_mix
                            ? tableRender(
                                updatedReactions,
                                reactionIndex,
                                reactive,
                                reactiveIndex,
                                reactive.eliminate_from_mix
                              )
                            : null
                        )}

                        <div className="grid-row">
                          <input
                            type="text"
                            value={reaction.solvent}
                            onChange={(e) =>
                              handleReactionReactiveChange(
                                reactionIndex,
                                null,
                                "name",
                                e.target.value
                              )
                            }
                          />

                          <input
                            type="number"
                            value={reaction.solvent_volume_value}
                            readOnly
                          />

                          <select
                            value={reaction.solvent_volume_units}
                            onChange={(e) =>
                              handleReactionReactiveChange(
                                reactionIndex,
                                null,
                                "solvent_volume_units",
                                e.target.value
                              )
                            }
                          >
                            {volumeOptions.map((unit, index) => (
                              <option key={index} value={unit}>
                                {unit}
                              </option>
                            ))}
                          </select>
                        </div>

                        <button
                          className="btn"
                          onClick={() =>
                            addReactive(updatedReactions, reactionIndex)
                          }
                          style={{ marginTop: "20px" }}
                        >
                          Añadir nuevo reactivo
                        </button>
                      </div>
                    </div>

                    {excludedReactives.length > 0 ? (
                      <div className="excluded-reactions-table-container">
                        <div key={`premix-${reactionIndex}`}>
                          <h4>Volumen de premix por muestra</h4>

                          <input
                            type="number"
                            value={reaction.premix_volume_value}
                            readOnly
                          />

                          <select
                            value={reaction.premix_volume_units}
                            onChange={(e) =>
                              handleReactionReactiveChange(
                                reactionIndex,
                                null,
                                "premix_volume_units",
                                e.target.value
                              )
                            }
                          >
                            {volumeOptions.map((unit, index) => (
                              <option key={index} value={unit}>
                                {unit}
                              </option>
                            ))}
                          </select>
                        </div>

                        <h4>
                          Reactivos excluidos del mix (añadir por separado)
                        </h4>

                        <div className="reaction-table-container">
                          <div className="reaction-table reaction-table-outside-mix">
                            <div className="grid-header">
                              <div>Reactivo</div>
                              <div>Volumen</div>
                              <div>Concentración Inicial</div>
                              <div>Concentración Final</div>
                            </div>

                            {reaction.reactives.map((reactive, reactiveIndex) =>
                              reactive.eliminate_from_mix
                                ? tableRender(
                                    updatedReactions,
                                    reactionIndex,
                                    reactive,
                                    reactiveIndex,
                                    reactive.eliminate_from_mix
                                  )
                                : null
                            )}
                          </div>
                        </div>
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          ) : null}

          {protocol.youtube_link ? (
            <div className="youtube-video-wrapper">
              <div className="youtube-video-title">
                <h4>Vídeo explicativo</h4>
              </div>

              <div className="youtube-video-text">
                Vídeo en el que se explica la teoría relacionada con el
                procedimiento experimental.
              </div>

              <div className="youtube-video-embeded-video">
                <iframe
                  width="560"
                  height="315"
                  src={getYouTubeVideoID(protocol.youtube_link)}
                  title="YouTube video player"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                ></iframe>
              </div>
            </div>
          ) : null}
        </div>
      ) : (
        <Loading />
      )}

      <BottomBar />
    </div>
  );
};

export default ProtocolsProtocol;
