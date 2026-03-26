import { useEffect } from "react";
import { checkSession } from "../utils/checkSession";
import useAuthStore from "../store/useAuthStore";

export function AuthProvider({ children }) {
  const { setLoggedUser, clearAuth } = useAuthStore();

  useEffect(() => {
    async function verificarSesion() {
      try {
        const res = await checkSession();
        if (res.isAuth) {
          setLoggedUser(res.user);
        } else {
          clearAuth();
        }
      } catch {
        clearAuth();
      }
    }

    verificarSesion();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return children;
}