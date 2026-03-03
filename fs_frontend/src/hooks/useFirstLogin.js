import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { checkSession } from "../utils/checkSession";

export function useFirstLogin() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    async function verify() {
      const res = await checkSession();

      if (!res.isAuth) return;

      const user = res.user;

      if (user?.first_login === 1 && !location.pathname.endsWith("/edit")) {
        navigate("/app/user/edit", { replace: true });
      }
    }

    verify();
  }, [navigate, location.pathname]);
}
