import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { useDispatch, useSelector } from "react-redux";
import { setUserInfo } from "../../actions/authAction";
const config = require("../../../env");

import NavBar from "../navigation/NavBar";
import BottomBar from "../BottomBar";
import TravelToTop from "../navigation/TravelToTop";
import DeletionModal from "../Modal/DeletionModal";
import useTokenValidation from "../helpers/useTokenValidation";

export default function AccountManagement() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const apiUrl = config.apiUrl;
  const validateToken = useTokenValidation();

  const { username, id, email, company, token } = useSelector(
    (state) => state.auth
  );

  const [modalOpen, setModalOpen] = useState(false);
  const [oldPasswordVisible, setOldPasswordVisible] = useState(false);
  const [newPasswordVisible, setNewPasswordVisible] = useState(false);

  const [passwordField, setPasswordField] = useState({
    oldPassword: "",
    newPassword: "",
  });

  const [emailField, setEmailField] = useState({
    oldEmail: email,
    newEmail: email,
    company: company,
  });

  const [usernameField, setUsernameField] = useState({
    newUsername: username,
    oldUsername: username,
  });

  const companyDomains = {
    Google: "gmail.com",
  };

  const validateEmailDomain = (email) => {
    const domain = email.split("@")[1];
    return domain === companyDomains[emailField.company];
  };

  const passwordRegex =
    /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&¿!#^])[A-Za-z\d@$!%*?&¿!#^]{10,100}$/;

  const checkPasswordRequirements = (password) => {
    return passwordRegex.test(password);
  };

  const handlePasswordInput = (e) => {
    const { name, value } = e.target;
    setPasswordField({
      ...passwordField,
      [name]: value,
    });
  };

  const handleUsernameInput = (e) => {
    const { name, value } = e.target;
    setUsernameField({
      ...usernameField,
      [name]: value,
    });
  };

  const handleEmailInput = (e) => {
    const { name, value } = e.target;
    setEmailField({
      ...emailField,
      [name]: value,
    });
  };

  const handleUsernameChangeSubmission = async (e) => {
    e.preventDefault();
    const { newUsername, oldUsername } = usernameField;

    if (newUsername === oldUsername) {
      alert("Error: el nuevo nombre de usuario y el antiguo son iguales.");
    } else if (validateToken()) {
      try {
        const response = await axios.patch(
          `${apiUrl}/api/auth/update-username/${id}`,
          { usernameField }
        );
        const data = response.data;
        localStorage.setItem("authToken", data.token);

        const decodedToken = jwtDecode(data.token);
        dispatch(
          setUserInfo({
            id: decodedToken.id,
            role: decodedToken.role,
            company: decodedToken.company,
            username: decodedToken.username,
            email: decodedToken.email,
            token: data.token,
          })
        );

        alert(data.message);
        setUsernameField({
          newUsername: decodedToken.username,
          oldUsername: decodedToken.username,
        });
      } catch (error) {
        if (
          error.response &&
          error.response.data &&
          error.response.data.error
        ) {
          alert(`Error: ${error.response.data.error}`);
        } else {
          alert(`Error: ${error.message}`);
        }
      }
    }
  };

  const handlePasswordChangeSubmission = async (e) => {
    e.preventDefault();

    const { oldPassword, newPassword } = passwordField;

    if (oldPassword === newPassword) {
      alert("Error: la nueva contraseña y la antigua son iguales.");
    } else if (validateToken()) {
      try {
        const response = await axios.patch(
          `${apiUrl}/api/auth/change-password/${id}`,
          { passwordField }
        );
        setPasswordField({
          newPassword: "",
          oldPassword: "",
        });
        const data = response.data;
        alert(data.message);
      } catch (error) {
        if (
          error.response &&
          error.response.data &&
          error.response.data.error
        ) {
          alert(`Error: ${error.response.data.error}`);
        } else {
          alert(`Error: ${error.message}`);
        }
      }
    }
  };

  const handleEmailChangeSubmission = async (e) => {
    e.preventDefault();

    const { oldEmail, newEmail } = emailField;

    if (oldEmail === newEmail) {
      alert("Error: el nuevo email y el antiguo son iguales.");
    } else if (validateToken()) {
      try {
        const response = await axios.patch(
          `${apiUrl}/api/auth/update-email/${id}`,
          { emailField }
        );
        const data = response.data;
        alert(data.message);
        navigate("/email-sent", { state: { fromRegistration: true } });
      } catch (error) {
        if (
          error.response &&
          error.response.data &&
          error.response.data.error
        ) {
          alert(`Error: ${error.response.data.error}`);
        } else {
          alert(`Error: ${error.message}`);
        }
      }
    }
  };

  const toggleOldPasswordVisibility = () => {
    setOldPasswordVisible(!oldPasswordVisible);
  };

  const toggleNewPasswordVisibility = () => {
    setNewPasswordVisible(!newPasswordVisible);
  };

  const handleDeleteClick = () => {
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
  };

  return (
    <div className="account-management-container">
      <DeletionModal
        isOpen={modalOpen}
        handleModalClose={handleModalClose}
        userId={id}
        username={username}
        token={token}
        callingComponent="Users-user"
      />

      <TravelToTop />

      <NavBar />

      <div className="account-management-wrapper">
        <h2 className="title">Configuración de la cuenta</h2>
        <div className="email-field-wrapper">
          <h3>Email</h3>
          <input
            type="email"
            name="newEmail"
            placeholder="Email"
            value={emailField.newEmail}
            onChange={handleEmailInput}
          />
          {!validateEmailDomain(emailField.newEmail) &&
          emailField.company !== "no" ? (
            <div className="warning-msg active">
              Email no válido para la compañía seleccionada.
            </div>
          ) : (
            <div className="warning-msg inactive">
              Email válido para la compañía seleccionada.
            </div>
          )}

          <select
            name="company"
            value={emailField.company}
            onChange={handleEmailInput}
          >
            <option value="no">No</option>
            <option value="Google">Google</option>
          </select>

          <button
            className="btn"
            type="button"
            onClick={handleEmailChangeSubmission}
          >
            Confirmar cambio email
          </button>
        </div>

        <div className="username-field-wrapper">
          <h3>Nombre de usuario</h3>
          <input
            type="username"
            name="newUsername"
            placeholder="Nombre de usuario"
            value={usernameField.newUsername}
            onChange={handleUsernameInput}
          />

          <button
            className="btn"
            type="button"
            onClick={handleUsernameChangeSubmission}
          >
            Confirmar cambio nombre usuario
          </button>
        </div>

        <h3>Contraseña</h3>
        <div className="password-wrapper old-password-wrapper">
          <input
            type={oldPasswordVisible ? "text" : "password"}
            name="oldPassword"
            placeholder="Contraseña antigua"
            value={passwordField.oldPassword}
            onChange={handlePasswordInput}
          />
          <button
            className="btn"
            type="button"
            onClick={toggleOldPasswordVisibility}
          >
            {oldPasswordVisible ? "Ocultar contraseña" : "Mostrar contraseña"}
          </button>
        </div>

        <div className="password-wrapper new-password-wrapper">
          <input
            type={newPasswordVisible ? "text" : "password"}
            name="newPassword"
            placeholder="Nueva contraseña"
            value={passwordField.newPassword}
            onChange={handlePasswordInput}
          />
          {checkPasswordRequirements(passwordField.newPassword) ? (
            <div className="warning-msg good">
              La contraseña tiene que tener entre 10 y 100 caracteres, contener
              al menos un número, una letra y un carácter especial.
            </div>
          ) : (
            <div className="warning-msg bad">
              La contraseña tiene que tener entre 10 y 100 caracteres, contener
              al menos un número, una letra y un carácter especial.
            </div>
          )}
          <button
            className="btn"
            type="button"
            onClick={toggleNewPasswordVisibility}
          >
            {newPasswordVisible ? "Ocultar contraseña" : "Mostrar contraseña"}
          </button>

          <button
            className="btn"
            type="button"
            onClick={handlePasswordChangeSubmission}
          >
            Confirmar cambio contraseña
          </button>

          <div className="delete-account">
            <button
              className="btn"
              type="button"
              onClick={() => handleDeleteClick()}
            >
              Eliminar cuenta
            </button>
          </div>
        </div>
      </div>

      <BottomBar />
    </div>
  );
}
