import React from "react";
import { Box, Typography, Button } from "@mui/material";
import BlockIcon from "@mui/icons-material/Block";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../store/useAuthStore";
import api from "../utils/api";

export default function BannedPage() {
  const { clearAuth } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await api.post("/users/logout");
    } catch {}
    clearAuth();
    navigate("/login", { replace: true });
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        px: 3,
        gap: 3,
      }}
    >
      <BlockIcon sx={{ fontSize: 80, color: "#f44336", opacity: 0.85 }} />

      <Typography variant="h4" sx={{ fontWeight: 700, color: "#f44336" }}>
        Cuenta suspendida
      </Typography>

      <Typography
        sx={{
          maxWidth: 480,
          fontSize: "1rem",
          opacity: 0.8,
          lineHeight: 1.7,
        }}
      >
        Lo sentimos, tu cuenta ha sido suspendida por incumplir las normas de la
        comunidad de FriendsSpace.
      </Typography>

      <Button
        variant="outlined"
        onClick={handleLogout}
        sx={{
          borderColor: "#f44336",
          color: "#f44336",
          borderRadius: "10px",
          textTransform: "none",
          fontWeight: 600,
          px: 3,
          "&:hover": { background: "rgba(244,67,54,0.08)", borderColor: "#f44336" },
        }}
      >
        Cerrar sesión
      </Button>
    </Box>
  );
}
