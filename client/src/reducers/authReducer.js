import {
  SET_USER_INFO,
  LOGOUT,
  FINISH_AUTH_LOADING,
} from "../actions/authAction";

const initialState = {
  role: null,
  company: null,
  username: null,
  email: null,
  isAuthenticated: false,
  token: null,
  authLoading: true,
};

const authReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_USER_INFO:
      return {
        ...state,
        role: action.payload.role,
        company: action.payload.company,
        username: action.payload.username,
        email: action.payload.email,
        id: action.payload.id,
        isAuthenticated: true,
        token: action.payload.token,
        authLoading: false,
      };
    case LOGOUT:
      return {
        ...initialState,
        authLoading: false,
      };
    case FINISH_AUTH_LOADING:
      return {
        ...state,
        authLoading: false,
      };
    default:
      return state;
  }
};

export default authReducer;
