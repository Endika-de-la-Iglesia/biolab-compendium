import { useDispatch } from "react-redux";
import { jwtDecode } from "jwt-decode";
import { logout } from "../../actions/authAction";
import { useNavigate } from "react-router";

const useTokenValidation = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const validateToken = () => {
    const token = localStorage.getItem("authToken");
    if (token) {
      const decodedToken = jwtDecode(token);
      const currentTime = Date.now() / 1000;

      if (decodedToken.exp < currentTime) {
        localStorage.removeItem("authToken");
        navigate("/");
        dispatch(logout());
        return false;
      }
      return true;
    }
    return false;
  };

  return validateToken;
};

export default useTokenValidation;
