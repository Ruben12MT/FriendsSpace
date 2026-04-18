import { useEffect } from "react";
import { checkSession } from "../utils/checkSession";
import useAuthStore from "../store/useAuthStore";

export function AuthProvider({ children }) {
  const { setLoggedUser, clearAuth, setIsLoading } = useAuthStore();

  useEffect(() => {
    async function verificarSesion() {
      setIsLoading(true);
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
  }, []);

  return children;
}