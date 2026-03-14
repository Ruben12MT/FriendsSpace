import api from "../utils/api";
import useAuthStore from "../store/useAuthStore";

export function useUser() {
  const loggedUser = useAuthStore((state) => state.loggedUser);
  const setLoggedUser = useAuthStore((state) => state.setLoggedUser);

  
  return { loggedUser, setLoggedUser };
}