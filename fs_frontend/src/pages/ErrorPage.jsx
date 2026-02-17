

import { useNavigate, useRouteError } from "react-router-dom";
import { Container, Typography, Button, Box } from "@mui/material";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import HomeIcon from "@mui/icons-material/Home";
import React from "react";


function ErrorPage() {
  // Hook para obtener información del error de la ruta
  const error = useRouteError();
  
  // Hook para navegar programáticamente
  const navigate = useNavigate();
  
  // Registrar error en consola para debugging
  console.error(error);

  return (
    <>
      {/* Barra de navegación */}
      <h1>HEADER</h1>
      {/* Contenedor con imagen de fondo */}
      <Box
        sx={{
          minHeight: "calc(100vh - 100px)",
          backgroundImage: `url(${""})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundAttachment: "fixed",
          display: "flex",
          justifyContent: "center",
        }}
      >
        {/* Contenedor del contenido de error */}
        <Container maxWidth="sm" sx={{ position: "relative", zIndex: 2 }}>
          <Box sx={{ textAlign: "center", mt:3 }}>
            {/* Título de error */}
            <Typography variant="h4" sx={{ mb:2, color: "black" }}>
              Lo sentimos, parece que ha ocurrido un error
            </Typography>
            
            {/* Detalles del error */}
            <Typography
              variant="body1"
              sx={{
                mb: 4,
                p: 2,
                backgroundColor: "rgba(255, 107, 107, 0.2)",
                borderRadius: 2,
                border: "1px solid #ff6b6b",
              }}
            >
              <strong>{error.statusText || error.message}</strong>
            </Typography>
            
            {/* Botón para volver a inicio */}
            <Button
              variant="contained"
              color="primary"
              size="large"
              startIcon={<HomeIcon />}
              onClick={() => navigate("/")}
              sx={{
                backgroundColor: "#1976d2",
                "&:hover": {
                  backgroundColor: "#1565c0",
                },
              }}
            >
              Volver a la página de inicio
            </Button>
          </Box>
        </Container>
      </Box>
    </>
  );
}

export default ErrorPage;
