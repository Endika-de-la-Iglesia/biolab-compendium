import React, { useState } from "react";

const SearchBar = ({ onSearch }) => {
  const [query, setQuery] = useState("");

  const handleFormSubmit = (event) => {
    event.preventDefault();
    setQuery("");
    onSearch(query);
  };

  return (
    <div className="search-bar-wrapper">
      <form className="search-bar" onSubmit={handleFormSubmit}>
        <input
          type="text"
          placeholder="Escribir aquí términos de búsqueda"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button className="btn" type="submit">
          Buscar
        </button>
      </form>
    </div>
  );
};

export default SearchBar;
