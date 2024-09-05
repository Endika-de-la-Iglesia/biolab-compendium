import React from "react";
import ReactModal from "react-modal";
import axios from "axios";
import { logout } from "../../actions/authAction";
import { useDispatch } from "react-redux";
import useTokenValidation from "../helpers/useTokenValidation";
const config = require("../../../env");

ReactModal.setAppElement(".app-wrapper");

const DeletionModal = ({
  isOpen,
  handleModalClose,
  userId,
  token,
  callingComponent,
  username,
  protocolId,
  protocolTitle,
  handleSuccesfulProtocolDeletion,
}) => {
  const customStyles = {
    content: {
      top: "50%",
      left: "50%",
      right: "auto",
      marginRight: "-50%",
      transform: "translate(-50%, -50%)",
      width: "580px",
      height: "300px",
      backgroundColor: "#f5c6cb",
      color: "#8902f1",
      borderRadius: "8px",
      padding: "18px",
      boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
    },
    overlay: {
      backgroundColor: "rgba(1, 1, 1, 0.75)",
    },
  };

  const apiUrl = config.apiUrl;
  const dispatch = useDispatch();
  const validateToken = useTokenValidation();

  let item = "";
  if (callingComponent === "Users-user" || callingComponent === "Users-admin") {
    item = "usuario";
  } else if (callingComponent === "protocols") {
    item = "protocolo";
  }

  const deleteUser = async (id) => {

    if (validateToken()) {
      try {
        await axios.delete(`${apiUrl}/api/auth/delete-user/${id}`);
        handleModalClose();
        alert("Usuario eliminado correctamente");

        if (callingComponent === "Users-user") {
          handleLogout();
        }
      } catch (error) {
        alert(`Error eliminando usuario: ${error.message}`);
      }
    }
  };

  const deleteProtocol = async (id) => {

    if (validateToken()) {
      try {
        await axios.delete(`${apiUrl}/api/protocols/${id}`);
        handleSuccesfulProtocolDeletion(id);
        handleModalClose();
        alert("Protocolo eliminado correctamente");
      } catch (error) {
        alert(`Error eliminando protocolo: ${error.message}`);
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    dispatch(logout());
  };

  return (
    <ReactModal
      style={customStyles}
      onRequestClose={handleModalClose}
      isOpen={isOpen}
    >
      <div className="modal-content">
        <h2>{`Eliminar ${item}: ${
          callingComponent === "protocols" ? protocolTitle : username
        }`}</h2>
        <p>{`¿Estás seguro de que quieres eliminar este ${item}?`}</p>

        <button
          className="btn delete-btn"
          onClick={
            callingComponent !== "Users-user" &&
            callingComponent !== "Users-admin"
              ? () => deleteProtocol(protocolId)
              : () => deleteUser(userId)
          }
        >
          Borrar
        </button>
        <button className="btn cancel-btn" onClick={handleModalClose}>
          Cancelar
        </button>
      </div>
    </ReactModal>
  );
};

export default DeletionModal;
