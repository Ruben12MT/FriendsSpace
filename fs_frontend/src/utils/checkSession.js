import api from "./api";

export const checkSession = async () => {
  try {
    const response = await api.get("/users/check-auth");
    return { isAuth: true, user: response.data.usuario };
  } catch (error) {
    return { isAuth: false, user: null };
  }
};