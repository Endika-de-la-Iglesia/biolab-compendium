import React from "react";
import { useNavigate } from "react-router-dom";

import NavBar from "./navigation/NavBar";
import SearchBar from "./navigation/SearchBar";
import BottomBar from "./BottomBar";
import { Link } from "react-router-dom";
import TravelToTop from "./navigation/TravelToTop";

function Home() {
  const featuredCategories = {
    "Biomoléculas-DNA": "/assets/images/adn.jpg",
    "Biomoléculas-Proteínas": "/assets/images/proteína.jpg",
    Microbiología: "/assets/images/microbiología.jpg",
    "Cultivos celulares": "/assets/images/célula_eucariota.jpg",
  };

  const navigate = useNavigate();

  const handleSearch = (query) => {
    navigate(`/protocols?search=${query}`);
  };

  function featuredCategoryRender() {
    const featuredCategoryElements = Object.entries(featuredCategories).map(
      ([category, url]) => {
        return (
          <div className="featured-category" key={category}>
            <Link
              to={{
                pathname: `/protocols/${category}`,
              }}
            >
              <div className="featured-category-img">
                <img src={url} alt={`Image for ${category}`} />
              </div>
              <div className="featured-category-txt">{category}</div>
            </Link>
          </div>
        );
      }
    );
    return (
      <div className="featured-categories-wrapper">
        {featuredCategoryElements}
      </div>
    );
  }
  
  return (
    <div className="home-wrapper">
      <TravelToTop />

      <div className="home-top-wrapper">
        <NavBar />
      </div>

      <div
        className="home-info-wrapper"
        style={{
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url("/assets/images/home-background.jpg")`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <p>
          ¡Bienvenido a BioLab Compendium! Aquí encontrarás una selección de
          protocolos de laboratorio. Prueba a buscar un término de interés o a
          explorar las diferentes categorías.
        </p>
      </div>

      <div className="home-search-featured-wrapper">
        <SearchBar onSearch={handleSearch} />

        {featuredCategoryRender()}
      </div>

      <BottomBar />
    </div>
  );
}

export default Home;
