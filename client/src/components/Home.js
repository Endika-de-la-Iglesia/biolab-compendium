import React from "react";
import { useNavigate } from "react-router-dom";

import NavBar from "./navigation/NavBar";
import SearchBar from "./navigation/SearchBar";
import BottomBar from "./BottomBar";
import { Link } from "react-router-dom";
import TravelToTop from "./navigation/TravelToTop";

function Home() {
  const featuredCategories = {
    "Biomoléculas-DNA":
      "https://res.cloudinary.com/djvd0bsml/image/upload/v1725813019/adn_luh3bi.jpg",
    "Biomoléculas-Proteínas":
      "https://res.cloudinary.com/djvd0bsml/image/upload/v1725813021/prote%C3%ADna_bdk6uu.jpg",
    Microbiología:
      "https://res.cloudinary.com/djvd0bsml/image/upload/v1725813020/microbiolog%C3%ADa_g1tgcq.jpg",
    "Cultivos celulares":
      "https://res.cloudinary.com/djvd0bsml/image/upload/v1725813019/c%C3%A9lula_eucariota_vtcfhh.jpg",
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
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url("https://res.cloudinary.com/djvd0bsml/image/upload/v1725813020/home-background_o3iqea.jpg")`,
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
