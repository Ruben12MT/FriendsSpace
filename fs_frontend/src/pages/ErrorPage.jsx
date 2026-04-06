import React from "react";
import { useNavigate, useRouteError } from "react-router-dom";
import { Container, Typography, Button, Box } from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";

function ErrorPage() {
  const error = useRouteError();
  const navigate = useNavigate();
  
  console.error(error);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        p: 3,
        background: "#fdfdfd"
      }}
    >
      <Container maxWidth="sm">
        <Typography variant="h4" sx={{ mb: 2, fontWeight: 700, color: "#1a1a1a" }}>
          Lo sentimos, parece que ha ocurrido un error
        </Typography>
        
        <Typography
          variant="body1"
          sx={{
            mb: 4,
            p: 2,
            backgroundColor: "rgba(255, 107, 107, 0.1)",
            borderRadius: 2,
            border: "1px solid #ff6b6b",
            color: "#d32f2f",
            fontFamily: "monospace"
          }}
        >
          <strong>{error.statusText || error.message}</strong>
        </Typography>
        
        <Button
          variant="contained"
          size="large"
          startIcon={<HomeIcon />}
          onClick={() => navigate("/")}
          sx={{
            textTransform: "none",
            borderRadius: "10px",
            px: 4,
            backgroundColor: "#1976d2",
            "&:hover": {
              backgroundColor: "#1565c0",
            },
          }}
        >
          Volver a la página de inicio
        </Button>
      </Container>
    </Box>
  );
}

export default ErrorPage;