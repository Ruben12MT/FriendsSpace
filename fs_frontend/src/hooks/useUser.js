import api from "../utils/api";
import useAuthStore from "../store/useAuthStore";

export function useUser() {
  const loggedUser = useAuthStore((state) => state.loggedUser);
  const setLoggedUser = useAuthStore((state) => state.setLoggedUser);

  // Solo pedimos los datos si loggedUser es null por ejemplo, al iniciar la app
  
  return { loggedUser, setLoggedUser };
}