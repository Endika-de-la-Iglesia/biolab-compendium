import React, { useEffect, useState } from "react";
import { useLocation, useParams, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useSelector } from "react-redux";
import NavBar from "../navigation/NavBar";
import BottomBar from "../BottomBar";
import SearchBar from "../navigation/SearchBar";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Loading from "../Loading";
import DeletionModal from "../Modal/DeletionModal";
import TravelToTop from "../navigation/TravelToTop";
import useTokenValidation from "../helpers/useTokenValidation";
const config = require("../../../env");

const ProtocolContainer = ({ showFavouritesOnly }) => {
  const apiUrl = config.apiUrl;
  const { category } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [protocols, setProtocols] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [currentCategory, setCurrentCategory] = useState(category);
  const [areFavourites, setAreFavourites] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [protocolDeletedId, setProtocolDeletedId] = useState(null);
  const [selectedProtocol, setSelectedProtocol] = useState({
    id: "",
    title: "",
  });
  const [noFavouriteProtocolId, setNoFavouriteProtocolId] = useState(null);
  const { token, role, isAuthenticated } = useSelector((state) => state.auth);
  const validateToken = useTokenValidation();

  const getButtonClass = (category) => {
    if (category === currentCategory) {
      return "btn-active";
    } else if (
      currentCategory === "all-categories" &&
      category === "Todas las categorías"
    ) {
      return "btn-active";
    } else {
      return "btn";
    }
  };

  const handleSearch = (query) => {
    if (!showFavouritesOnly) {
      setCurrentCategory(null);
      navigate(`/protocols?search=${query}`);
    } else {
      setCurrentCategory(null);
      navigate(`/favourites?search=${query}`);
    }
  };

  const handleProtocolDeleteClick = (protocolId, protocolTitle) => {
    setSelectedProtocol({ id: protocolId, title: protocolTitle });
    setModalOpen(true);
  };

  const handleSuccesfulProtocolDeletion = (deletedProtocolId) => {
    setProtocolDeletedId(deletedProtocolId);
  };

  const handleModalClose = () => {
    setModalOpen(false);
  };

  const handleFavouriteClick = (id) => {
    const isFavourite = areFavourites[id];

    if (!isFavourite && validateToken()) {
      axios
        .post(`${apiUrl}/api/protocols/favourite`, { protocol_id: id })
        .then((response) => {
          setAreFavourites((prevFavourites) => ({
            ...prevFavourites,
            [id]: true,
          }));
        })
        .catch((error) => {
          alert("Error marcando como favorito:", error);
        });
    } else if (validateToken) {
      axios
        .delete(`${apiUrl}/api/protocols/favourite`, {
          data: { protocol_id: id },
        })
        .then((response) => {
          setAreFavourites((prevFavourites) => ({
            ...prevFavourites,
            [id]: false,
          }));
          setNoFavouriteProtocolId(id);
        })
        .catch((error) => {
          alert("Error eliminando de favoritos:", error);
        });
    }
  };

  useEffect(() => {
    if (isAuthenticated && role === "admin" && protocolDeletedId) {
      setProtocols((prevProtocols) =>
        prevProtocols.filter((protocol) => protocol.id !== protocolDeletedId)
      );
    }
  }, [isAuthenticated, role, protocolDeletedId, setProtocols]);

  useEffect(() => {
    if (isAuthenticated && showFavouritesOnly && noFavouriteProtocolId) {
      setProtocols((prevProtocols) =>
        prevProtocols.filter(
          (protocol) => protocol.id !== noFavouriteProtocolId
        )
      );
    }
  }, [isAuthenticated, noFavouriteProtocolId, setProtocols]);

  const categories = [
    "Biomoléculas-DNA",
    "Biomoléculas-Proteínas",
    "Microbiología",
    "Cultivos celulares",
    "Todas las categorías",
  ];

  useEffect(() => {
    const query = new URLSearchParams(location.search).get("search");

    const fetchProtocols = async () => {
      try {
        const params = {};

        if (query) {
          params.search = query;
        } else if (currentCategory) {
          params.category = currentCategory;
        }

        const response = await axios.get(`${apiUrl}/api/protocols`, {
          params: {
            ...params,
            favourites: showFavouritesOnly,
          },
        });
        const protocols = response.data;
        setProtocols(protocols);

        if (token && protocols) {
          const favouriteStatuses = {};

          for (const protocol of protocols) {
            try {
              const favouriteResponse = await axios.post(
                `${apiUrl}/api/protocols/favourite/check`,
                { protocol_id: protocol.id }
              );
              favouriteStatuses[protocol.id] =
                favouriteResponse.data.isFavourite;
            } catch (error) {
              console.error(
                `Error chequeando el estado de favorito del protocolo ${protocol.id}`,
                error
              );
            }
          }
          setAreFavourites(favouriteStatuses);
        }

        setIsLoading(false);
      } catch (error) {
        console.error("Error obteniendo protocolos", error);
      }
    };
    fetchProtocols();
  }, [location.search, currentCategory]);

  const protocolsList = () => {
    return (
      <ul className="protocols-list">
        {protocols.map((protocol) => (
          <li key={protocol.id} className="protocol-wrapper">
            <DeletionModal
              isOpen={modalOpen}
              handleModalClose={handleModalClose}
              protocolId={selectedProtocol.id}
              protocolTitle={selectedProtocol.title}
              handleSuccesfulProtocolDeletion={handleSuccesfulProtocolDeletion}
              token={token}
              callingComponent="protocols"
            />

            <div className="protocol-title">
              <h3>
                <Link to={`/protocols/protocol/${protocol.id}`}>
                  {protocol.title}{" "}
                </Link>
              </h3>

              {isAuthenticated ? (
                areFavourites[protocol.id] ? (
                  <div className="favourite-icon">
                    <FontAwesomeIcon
                      className="empty-heart-icon activity-icon"
                      onClick={() => handleFavouriteClick(protocol.id)}
                      icon="fas fa-heart"
                      size="lg"
                    />
                  </div>
                ) : (
                  <div className="favourite-icon">
                    <FontAwesomeIcon
                      className="empty-heart-icon activity-icon"
                      onClick={() => handleFavouriteClick(protocol.id)}
                      icon="far fa-heart"
                      size="lg"
                    />
                  </div>
                )
              ) : null}

              {isAuthenticated && role === "admin" ? (
                <div className="admin-activity-icons">
                  <div className="activity-icon">
                    <Link to={`/update-protocol/${protocol.id}`}>
                      <FontAwesomeIcon icon="fa-file-pen" size="lg" />
                    </Link>
                  </div>

                  <div className="activity-icon">
                    <FontAwesomeIcon
                      onClick={() =>
                        handleProtocolDeleteClick(protocol.id, protocol.title)
                      }
                      icon="fa-trash"
                      size="lg"
                    />
                  </div>
                </div>
              ) : null}
            </div>

            <p>{protocol.objective}</p>
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div className="protocols-container-container container">
      <TravelToTop />
      <NavBar />
      <div className="protocols-container-wrapper main-wrapper">
        <h2>Categorías</h2>
        <div className="protocols-select-category-btns">
          {categories.map((category) =>
            category !== "Todas las categorías" ? (
              <button
                key={category}
                className={getButtonClass(category)}
                type="button"
                onClick={
                  showFavouritesOnly
                    ? () => {
                        navigate(`/favourites/${category}`);
                        setCurrentCategory(category);
                      }
                    : () => {
                        navigate(`/protocols/${category}`);
                        setCurrentCategory(category);
                      }
                }
              >
                {category}
              </button>
            ) : (
              <button
                key={category}
                className={getButtonClass(category)}
                type="button"
                onClick={
                  showFavouritesOnly
                    ? () => {
                        navigate(`/favourites/all-categories`);
                        setCurrentCategory("all-categories");
                      }
                    : () => {
                        navigate(`/protocols/all-categories`);
                        setCurrentCategory("all-categories");
                      }
                }
              >
                {category}
              </button>
            )
          )}
        </div>
        <div className="title">
          {currentCategory === "all-categories" || !currentCategory ? (
            <h2>Lista de protocolos</h2>
          ) : (
            <h2>Lista de protocolos ({currentCategory})</h2>
          )}
        </div>

        <SearchBar onSearch={handleSearch} />

        {isAuthenticated && role === "admin" ? (
          <div className="new-protocol-icon">
            <Link className="activity-icon" to="/new-protocol">
              <FontAwesomeIcon icon="fa-circle-plus" size="3x" />
            </Link>
          </div>
        ) : null}

        {isLoading ? (
          <Loading />
        ) : protocols.length === 0 ? (
          <div className="no-protocols-found">
            No se han encontrado protocolos que cumplan los criterios
            establecidos.
          </div>
        ) : (
          protocolsList()
        )}
      </div>
      <BottomBar />
    </div>
  );
};

export default ProtocolContainer;
