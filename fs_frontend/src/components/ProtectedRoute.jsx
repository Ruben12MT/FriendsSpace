import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { checkSession } from "../utils/checkSession";
import { CircularProgress, Box } from "@mui/material"; // Importamos los componentes de carga

const ProtectedRoute = ({ children }) => {
  const [auth, setAuth] = useState({ loading: true, isAuth: false });

  useEffect(() => {
    checkSession().then((res) => {
      setAuth({ loading: false, isAuth: res.isAuth });
    });
  }, []);

  if (auth.loading) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#f5f5f5", // Un gris muy suave para que sea elegante
        }}
      >
        {/* El icono de carga animado */}
        <CircularProgress sx={{ color: "#50C2AF" }} /> 
      </Box>
    );
  }

  return auth.isAuth ? children : <Navigate to="/login" replace />;
};

export default ProtectedRoute;