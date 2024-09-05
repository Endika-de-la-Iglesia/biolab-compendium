import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import iconHelper from "./helpers/icon-helper";

iconHelper();

export default function Loading() {
  return (
    <div className="loading-container">
      <div className="loading-icon">
        <FontAwesomeIcon className="beat-animation" icon="fa-flask" size="5x" animation="beat"/>
      </div>
      <div className="loading-message">
        <h2>Cargando...</h2>
      </div>
    </div>
  );
}
