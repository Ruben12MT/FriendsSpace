import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import useAuthStore from "../store/useAuthStore";
 
export function useFirstLogin() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const loggedUser = useAuthStore((state) => state.loggedUser);
 
  useEffect(() => {
    if (!loggedUser) return;
    if (pathname.endsWith("/edit")) return;
 
    if (loggedUser.first_login === 1) {
      navigate("/app/user/edit", { replace: true });
    }
  }, [loggedUser, pathname, navigate]);
}