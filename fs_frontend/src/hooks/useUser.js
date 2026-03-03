import { useEffect, useState } from "react";
import api from "../utils/api";
import userAuthStore from "../store/useAuthStore";

export function useUser() {
  const userId = userAuthStore((state) => state.userId);
  const [loggedUser, setLoggedUser] = useState(null);

  useEffect(() => {
    async function loadUser() {
      if (!userId) return;

      try {
        const res = await api.get("/users/" + userId);
        setLoggedUser(res.data.datos);
      } catch (err) {
        setLoggedUser(null);
      }
    }

    loadUser();
  }, [userId]);

  return { loggedUser, setLoggedUser };
}
