export const SET_USER_INFO = "SET_USER_INFO";
export const LOGOUT = "LOGOUT";
export const FINISH_AUTH_LOADING = "FINISH_AUTH_LOADING";

export const setUserInfo = (userInfo) => ({
  type: SET_USER_INFO,
  payload: userInfo,
});

export const logout = () => ({
  type: LOGOUT,
});

export const finishAuthLoading = () => ({
  type: FINISH_AUTH_LOADING,
});
