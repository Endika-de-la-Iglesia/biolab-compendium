import React, { useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useLocation, useNavigate } from "react-router";
import { logout } from "../../actions/authAction";

import BottomBar from "../BottomBar";
import NavBar from "../navigation/NavBar";
import { useSelector, useDispatch } from "react-redux";

export default function EmailSent() {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { token } = useSelector((state) => state.auth);

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    dispatch(logout());
  };

  useEffect(() => {
    if (!location.state || !location.state.fromRegistration) {
      navigate("/");
      return undefined;
    }

    if (token) {
      handleLogout();
    }
  }, [token]);

  return (
    <div className="email-sent-container">
      <NavBar />
      <div className="email-sent-page">
        <h2>Email de verificación enviado</h2>
        <FontAwesomeIcon icon="fa-envelope" size="5x" />
        <p>
          ¡Gracias por registrarte! Se te ha enviado un email de confirmación
          para que puedas continuar con el proceso de registro.
        </p>
      </div>
      <BottomBar />
    </div>
  );
}
