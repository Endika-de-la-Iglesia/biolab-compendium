import { jwtDecode } from "jwt-decode";
import axios from "axios";
const config = require("../../../env");

const getUserInfoFromToken = async () => {
  const token = localStorage.getItem("authToken");
  const apiUrl = config.apiUrl;

  if (token) {
    try {
      const decodedToken = jwtDecode(token);
      const currentTime = Date.now() / 1000;

      if (decodedToken.exp < currentTime) {
        localStorage.removeItem("authToken");
        return null;
      }

      try {
        const response = await axios.get(
          `${apiUrl}/api/auth/user/${decodedToken.id}`
        );
        if (response.data) {
          return { userInfo: decodedToken, token: token };
        }
      } catch (error) {
        localStorage.removeItem("authToken");
        return null;
      }
    } catch (error) {
      localStorage.removeItem("authToken");
      return null;
    }
  }

  return null;
};

const isAuthenticated = async () => {
  const userInfo = await getUserInfoFromToken();
  return !!userInfo;
};

export { getUserInfoFromToken, isAuthenticated };
