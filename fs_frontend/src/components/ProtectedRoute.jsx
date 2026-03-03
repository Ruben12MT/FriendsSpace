import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { checkSession } from "../utils/checkSession";
import { CircularProgress, Box } from "@mui/material";
import userAuthStore from "../store/useAuthStore";

const ProtectedRoute = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [isAuth, setIsAuth] = useState(false);

  const setUserId = userAuthStore((state) => state.setUserId);
  const userId = userAuthStore((state) => state.userId);

  useEffect(() => {
    async function validate() {
      // Si Zustand ya tiene userId → guardarlo en localStorage
      if (userId) {
        localStorage.setItem("userId", userId);
        setIsAuth(true);
        setLoading(false);
        return;
      }

      // Si NO hay userId → validar sesión
      try {
        const res = await checkSession();

        if (!res.isAuth) {
          setIsAuth(false);
          setLoading(false);
          return;
        }

        // Guardar id en Zustand y localStorage
        setUserId(res.user.id);
        localStorage.setItem("userId", res.user.id);

        setIsAuth(true);
        setLoading(false);

      } catch (err) {
        setIsAuth(false);
        setLoading(false);
      }
    }

    validate();
  }, [userId, setUserId]);

  if (loading) {
    return (
      <Box sx={{ minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "center" }}>
        <CircularProgress sx={{ color: "#50C2AF" }} />
      </Box>
    );
  }

  if (!isAuth) return <Navigate to="/login" replace />;

  return children;
};

export default ProtectedRoute;
