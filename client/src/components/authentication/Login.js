import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { useDispatch } from "react-redux";
import { setUserInfo } from "../../actions/authAction";
const config = require("../../../env");

import NavBar from "../navigation/NavBar";
import BottomBar from "../BottomBar";
import TravelToTop from "../navigation/TravelToTop";

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const apiUrl = config.apiUrl;

  const [loginPasswordVisible, setLoginPasswordVisible] = useState(false);
  const [registrationPasswordVisible, setRegistrationPasswordVisible] =
    useState(false);

  const companyDomains = {
    Google: "gmail.com",
  };

  const [loginForm, setLoginForm] = useState({
    email: "",
    password: "",
  });

  const [registrationForm, setRegistrationForm] = useState({
    username: "",
    email: "",
    password: "",
    company: "no",
  });

  const validateEmailDomain = (email) => {
    const domain = email.split("@")[1];
    return domain === companyDomains[registrationForm.company];
  };

  const passwordRegex =
    /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&¿!#^])[A-Za-z\d@$!%*?&¿!#^]{10,100}$/;

  const checkPasswordRequirements = (password) => {
    return passwordRegex.test(password);
  };

  const handleLoginChange = (e) => {
    const { name, value } = e.target;
    setLoginForm({
      ...loginForm,
      [name]: value,
    });
  };

  const handleRegistrationChange = (e) => {
    const { name, value } = e.target;
    setRegistrationForm({
      ...registrationForm,
      [name]: value,
    });
  };

  const handleLoginFormSubmission = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        `${apiUrl}/api/auth/login`,
        loginForm
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

      navigate("/");
    } catch (error) {
      if (error.response && error.response.data && error.response.data.error) {
        alert(`Error en el login: ${error.response.data.error}`);
      } else {
        alert(`Error en el login: ${error.message}`);
      }
    }
  };

  const handleRegistrationFormSubmission = async (e) => {
    e.preventDefault();
    if (
      registrationForm.company !== "no" &&
      !validateEmailDomain(registrationForm.email)
    ) {
      alert("Email no válido para la compañía seleccionada.");
      return;
    }
    try {
      const response = await axios.post(
        `${apiUrl}/api/auth/register`,
        registrationForm
      );
      navigate("/email-sent", { state: { fromRegistration: true } });
    } catch (error) {
      if (error.response && error.response.data && error.response.data.error) {
        alert(`Error en el registro: ${error.response.data.error}`);
      } else {
        alert(`Error en el registro: ${error.message}`);
      }
    }
  };

  const toggleLoginPasswordVisibility = () => {
    setLoginPasswordVisible(!loginPasswordVisible);
  };

  const toggleRegistrationPasswordVisibility = () => {
    setRegistrationPasswordVisible(!registrationPasswordVisible);
  };

  return (
    <div className="auth-page-wrapper">
      <TravelToTop />

      <NavBar />

      <div className="auth-forms-wrapper">
        <div className="login-form form">
          <h2 className="title">Inicio de sesión</h2>
          <form onSubmit={handleLoginFormSubmission}>
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={loginForm.email}
              onChange={handleLoginChange}
            />
            <div className="password-field">
              <input
                type={loginPasswordVisible ? "text" : "password"}
                name="password"
                placeholder="Contraseña"
                value={loginForm.password}
                onChange={handleLoginChange}
              />
              <button
                className="btn"
                type="button"
                onClick={toggleLoginPasswordVisibility}
              >
                {loginPasswordVisible
                  ? "Ocultar contraseña"
                  : "Mostrar contraseña"}
              </button>
            </div>
            <button className="btn" type="submit">
              Login
            </button>
          </form>
        </div>

        <div className="registration-form form">
          <h2 className="title">Registro de nuevos usuarios</h2>
          <form onSubmit={handleRegistrationFormSubmission}>
            <input
              type="text"
              name="username"
              placeholder="Nombre de usuario"
              value={registrationForm.username}
              onChange={handleRegistrationChange}
            />
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={registrationForm.email}
              onChange={handleRegistrationChange}
            />
            {!validateEmailDomain(registrationForm.email) &&
            registrationForm.company !== "no" ? (
              <div className="warning-msg active">
                Email no válido para la compañía seleccionada.
              </div>
            ) : (
              <div className="warning-msg inactive">
                Email no válido para la compañía seleccionada.
              </div>
            )}

            <input
              type={registrationPasswordVisible ? "text" : "password"}
              name="password"
              placeholder="Password"
              value={registrationForm.password}
              onChange={handleRegistrationChange}
            />
            {checkPasswordRequirements(registrationForm.password) ? (
              <div className="warning-msg good">
                La contraseña tiene que tener entre 10 y 100 caracteres,
                contener al menos un número, una letra y un carácter especial.
              </div>
            ) : (
              <div className="warning-msg bad">
                La contraseña tiene que tener entre 10 y 100 caracteres,
                contener al menos un número, una letra y un carácter especial.
              </div>
            )}
            <button
              className="btn"
              type="button"
              onClick={toggleRegistrationPasswordVisibility}
            >
              {registrationPasswordVisible
                ? "Ocultar contraseña"
                : "Mostrar contraseña"}
            </button>

            <div className="select-element select-company">
              <select
                name="company"
                value={registrationForm.company}
                onChange={handleRegistrationChange}
              >
                <option value="no">No</option>
                <option value="Google">Google</option>
              </select>
            </div>

            <button className="btn" type="submit">
              Registrarse
            </button>
          </form>
        </div>
      </div>
      <BottomBar />
    </div>
  );
};

export default Login;
