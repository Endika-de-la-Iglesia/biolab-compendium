import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import NavBar from "../navigation/NavBar";
import BottomBar from "../BottomBar";
import axios from "axios";
import DeletionModal from "../Modal/DeletionModal";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Loading from "../Loading";
import TravelToTop from "../navigation/TravelToTop";
import useTokenValidation from "../helpers/useTokenValidation";
const config = require("../../../env");

export default function AccountManagement() {
  const [usersList, setUsersList] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState({
    userId: "",
    username: "",
  });

  const { token, username } = useSelector((state) => state.auth);
  const apiUrl = config.apiUrl;
  const validateToken = useTokenValidation();

  useEffect(() => {
    if (token) {
      getAllUsers();
    }
  }, [token]);

  const getAllUsers = async () => {

    if (validateToken()) {
      try {
        const response = await axios.get(`${apiUrl}/api/auth/users`);
        const data = response.data;
        setUsersList(data);
        setIsLoading(false);
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
        setIsLoading(false);
      }
    }
  };

  const handleError = (error) => {
    if (error.response && error.response.data && error.response.data.error) {
      alert(`Error: ${error.response.data.error}`);
    } else {
      alert(`Error: ${error.message}`);
    }
  };

  const updateUserRole = async (userId, newRole) => {

    if (validateToken()) {
      try {
        const response = await axios.patch(
          `${apiUrl}/api/auth/users/update-role/${userId}`,
          { newRole }
        );
        alert(response.data.message);
        getAllUsers();
      } catch (error) {
        handleError(error);
      }
    }
  };

  const handleRoleChange = (userId, newRole) => {
    updateUserRole(userId, newRole);
  };

  const handleDeleteClick = (userId, username) => {
    setSelectedUser({
      userId,
      username,
    });
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    getAllUsers();
  };

  const users = (usersList) => {
    const user = usersList.map((user) => {
      if (user.username !== username) {
        return (
          <div key={user.id} className="user-wrapper">
            <DeletionModal
              isOpen={modalOpen}
              handleModalClose={handleModalClose}
              userId={selectedUser.userId}
              username={selectedUser.username}
              token={token}
              callingComponent="Users-admin"
            />

            <div className="user-username">
              <span className="bold">Nombre usuario: </span> {user.username}
            </div>
            <div className="user-email">
              <span className="bold">Email: </span>
              {user.email}
            </div>
            <div className="user-role">
              <div className="select-element select-company">
                <span className="bold">Rol: </span>
                <select
                  name="role"
                  value={user.role}
                  onChange={(e) => handleRoleChange(user.id, e.target.value)}
                >
                  <option value="user">Usuario</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>
            </div>
            <div
              className="delete-icon activity-icon"
              onClick={() => handleDeleteClick(user.id, user.username)}
            >
              <FontAwesomeIcon icon="fa-trash" />
            </div>
          </div>
        );
      }
    });
    return user;
  };

  return (
    <div className="users-management-container">
      <TravelToTop />
      <NavBar />

      <div className="users-list-wrapper">
        <h2>Lista de usuarios</h2>
        {!isLoading ? (
          <div className="users-list-users">{users(usersList)}</div>
        ) : (
          <Loading />
        )}
      </div>

      <BottomBar />
    </div>
  );
}
