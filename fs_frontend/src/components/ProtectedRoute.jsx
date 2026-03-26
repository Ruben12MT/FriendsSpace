import React from "react";
import { Navigate } from "react-router-dom";
import { CircularProgress, Box } from "@mui/material";
import useAuthStore from "../store/useAuthStore";
 
const ProtectedRoute = ({ children }) => {
  const { loggedUser, isLoading } = useAuthStore();
 
  // Mientras AuthProvider verifica la sesión al arrancar, mostramos spinner
  if (isLoading) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <CircularProgress sx={{ color: "#C9A227" }} />
      </Box>
    );
  }
 
  // Si no hay usuario logueado, redirigir al login
  if (!loggedUser) return <Navigate to="/login" replace />;
 
  // Si hay sesión, renderizar la página normalmente
  return children;
};
 
export default ProtectedRoute;