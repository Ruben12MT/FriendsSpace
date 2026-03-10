import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { checkSession } from "../utils/checkSession";
import { CircularProgress, Box } from "@mui/material";
import userAuthStore from "../store/useAuthStore";
import { useFirstLogin } from "../hooks/useFirstLogin";
import { useUser } from "../hooks/useUser";

const ProtectedRoute = ({ children }) => {
  useFirstLogin();

  const [loading, setLoading] = useState(true);
  const [isAuth, setIsAuth] = useState(false);

  const {loggedUser, setLoggedUser} = useUser();

  useEffect(() => {
    async function validate() {
      if (loggedUser) {
        setIsAuth(true);
        setLoading(false);
        return;
      }

      // Si no hay loggedUser validar sesión
      try {
        const res = await checkSession();

        if (!res.isAuth) {
          setIsAuth(false);
          setLoading(false);
          return;
        }

        // Guardar user en Zustand y localStorage
        setLoggedUser(res.user);

        setIsAuth(true);
        setLoading(false);

      } catch (err) {
        setIsAuth(false);
        setLoading(false);
      }
    }

    validate();
  }, [loggedUser, setLoggedUser]);

  if (loading) {
    return (
      <Box sx={{ minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "center" }}>
        <CircularProgress sx={{ color: "#C9A227" }} />
      </Box>
    );
  }

  if (!isAuth) return <Navigate to="/login" replace />;

  return children;
};

export default ProtectedRoute;
