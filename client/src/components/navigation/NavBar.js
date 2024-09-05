import React from "react";
import { NavLink, Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logout } from "../../actions/authAction";

export default function NavBar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { role, isAuthenticated } = useSelector(
    (state) => state.auth
  );

  const classIsActive = ({ isActive }) =>
    isActive ? "nav-link-active" : "nav-link-inactive";

  const handleLogOut = () => {
    localStorage.removeItem("authToken");
    dispatch(logout());
    navigate("/");
  };

  return (
    <div className="navbar-wrapper">
      <div className="logo">
        <Link to="/">
          <img src="/assets/images/logo.png" alt="logo" />
        </Link>
      </div>

      <div className="navlinks-wrapper">
        <NavLink to="/" className={classIsActive}>
          Inicio
        </NavLink>
        <NavLink to="/protocols/all-categories" className={classIsActive}>
          Explora
        </NavLink>

        {isAuthenticated ? (
          <NavLink to="/favourites/all-categories" className={classIsActive}>
            Favoritos
          </NavLink>
        ) : null}

        {role === "admin" && isAuthenticated ? (
          <NavLink to="/users-management" className={classIsActive}>
            Usuarios
          </NavLink>
        ) : null}

        {isAuthenticated ? (
          <div className="logged-in-user">
            <div className="user-icon">
              <div className="activity-icon">
                <Link to="/account-management">
                  <FontAwesomeIcon icon="fa-user" size="lg" />
                </Link>
              </div>
            </div>
            <div className="logout-icon" onClick={handleLogOut}>
              <div className="activity-icon">
                <FontAwesomeIcon icon="fa-right-from-bracket" size="lg" />
              </div>
            </div>
          </div>
        ) : (
          <div className="login-icon">
            <NavLink to="/login" className={classIsActive}>
              <div className="activity-icon">
                <FontAwesomeIcon icon="fa-right-to-bracket" size="xl" />
              </div>
            </NavLink>
          </div>
        )}
      </div>
    </div>
  );
}
