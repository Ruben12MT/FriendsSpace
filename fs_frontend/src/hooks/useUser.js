import { useEffect, useState } from "react";
import userAuthStore from "../store/useAuthStore";
import api from "../utils/api";

export function useUser() {
  const userId = userAuthStore((state) => state.userId);
  const [loggedUser, setLoggedUser] = useState({});

  useEffect(() => {
    if (!userId) return;
    async function findUser() {
      try {
        const res = await api.get("/users/" + userId);
        setLoggedUser(res.data.datos);
      } catch (error) {
        console.log(error.message);
      }
    }
    findUser();
  }, [userId]);

  return { loggedUser };
}