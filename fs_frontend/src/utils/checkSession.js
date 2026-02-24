import api from "./api";

export const checkSession = async () => {
  try {
    const response = await api.get("/users/check-auth");
    console.log(response.usuario);
    return { isAuth: true, user: response.usuario };
  } catch (error) {
    return { isAuth: false, user: null };
  }
};