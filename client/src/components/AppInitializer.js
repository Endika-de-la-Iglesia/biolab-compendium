import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import axios from "axios";

import "../style/main.scss";
import { setUserInfo } from "../actions/authAction";
import {
  getUserInfoFromToken,
  isAuthenticated as checkAuth,
} from "./helpers/jwt-decoder";
import { jwtDecode } from "jwt-decode";

import Home from "./Home";
import Login from "./authentication/Login";
import ProtocolsContainer from "./protocols/ProtocolsContainer";
import iconHelper from "./helpers/icon-helper";
import EmailSent from "./authentication/EmailSent";
import UsersManagement from "./users/UsersManagement";
import AccountManagement from "./users/AccountManagement";
import Loading from "./Loading";
import ProtocolForm from "./protocols/ProtocolForm";
import ProtocolsProtocol from "./protocols/ProtocolsProtocol";
import { logout } from "../actions/authAction";

const AppInitializer = () => {
  const dispatch = useDispatch();
  const [localAuthLoading, setLocalAuthLoading] = useState(true);

  const { role, isAuthenticated, authLoading } = useSelector(
    (state) => state.auth
  );

  iconHelper();

  axios.interceptors.request.use(
    async (config) => {
      const token = localStorage.getItem("authToken");

      if (token) {
        const decodedToken = jwtDecode(token);
        const currentTime = Date.now() / 1000;

        if (decodedToken.exp < currentTime) {
          localStorage.removeItem("authToken");
          store.dispatch(logout());
          return Promise.reject("Token expirado. Por favor, inicia sesión de nuevo.");
        } else {
          config.headers["Authorization"] = `Bearer ${token}`;
        }
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const isAuth = await checkAuth();
        if (isAuth) {
          const { userInfo, token } = await getUserInfoFromToken();
          if (userInfo && token) {
            dispatch(
              setUserInfo({
                id: userInfo.id,
                role: userInfo.role,
                company: userInfo.company,
                username: userInfo.username,
                email: userInfo.email,
                token: token,
              })
            );
          }
        } else {
          dispatch({ type: "FINISH_AUTH_LOADING" });
        }
      } catch (error) {
        console.error("Error initializing auth:", error);
      } finally {
        setLocalAuthLoading(false);
      }
    };

    initializeAuth();
  }, [dispatch]);

  const combinedLoadingState = localAuthLoading || authLoading;

  const routesGuard = (role, isAuthenticated, loading) => {
    const commonRoutes = [
      <Route key="home" path="/" element={<Home />} />,
      <Route
        key="protocols-category"
        path="/protocols/:category"
        element={<ProtocolsContainer />}
      />,
      <Route
        key="protocols-search"
        path="/protocols"
        element={<ProtocolsContainer />}
      />,
      <Route
        key="protocols-protocol"
        path="/protocols/protocol/:id"
        element={<ProtocolsProtocol />}
      />,
      <Route key="email-sent" path="/email-sent" element={<EmailSent />} />,
    ];

    const nonAuthRoutes = [
      <Route key="login" path="/login" element={<Login />} />,
    ];

    const authUserRoutes = [
      <Route
        key="favourites-category"
        path="/favourites/:category"
        element={
          <ProtocolsContainer
            key={`favourites-search-${location.pathname}`}
            showFavouritesOnly={true}
          />
        }
      />,
      <Route
        key="favourites-search"
        path="/favourites"
        element={
          <ProtocolsContainer
            key={`favourites-search-${location.pathname}`}
            showFavouritesOnly={true}
          />
        }
      />,
      <Route
        key="account-management"
        path="/account-management"
        element={<AccountManagement />}
      />,
    ];

    const authAdminRoutes = [
      <Route
        key="users-management"
        path="/users-management"
        element={<UsersManagement />}
      />,
      <Route
        key="protocol-creation"
        path="/new-protocol"
        element={<ProtocolForm mode="creation" />}
      />,
      <Route
        key="protocol-update"
        path="/update-protocol/:id"
        element={<ProtocolForm mode="edit" />}
      />,
    ];

    const notFoundRoutes = [
      <Route key="not-found" path="*" element={<Navigate to="/" replace />} />,
    ];

    if (!loading) {
      {
        if (!isAuthenticated) {
          return [...commonRoutes, ...nonAuthRoutes, ...notFoundRoutes];
        } else if (isAuthenticated && role === "admin") {
          return [
            ...commonRoutes,
            ...authUserRoutes,
            ...authAdminRoutes,
            ...notFoundRoutes,
          ];
        } else if (isAuthenticated && role === "user") {
          return [...commonRoutes, ...authUserRoutes, ...notFoundRoutes];
        } else {
          return [...nonAuthRoutes, ...commonRoutes, ...notFoundRoutes];
        }
      }
    }
  };

  return (
    <BrowserRouter>
      <Routes>
        {combinedLoadingState ? (
          <Route key="loading" path="*" element={<Loading />} />
        ) : (
          routesGuard(role, isAuthenticated, combinedLoadingState)
        )}
      </Routes>
    </BrowserRouter>
  );
};

export default AppInitializer;
