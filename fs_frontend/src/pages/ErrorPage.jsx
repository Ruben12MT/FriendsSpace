import React from "react";
import { useNavigate, useRouteError } from "react-router-dom";
import { Box, Typography, Button } from "@mui/material";
import { useAppTheme } from "../hooks/useAppTheme";

function ErrorPage() {
  const error = useRouteError();
  const navigate = useNavigate();
  const theme = useAppTheme();
  const accent = theme.accent || "#c9a84c";
  const isDark = theme.name === "dark";

  const errorText = error?.statusText || error?.message || "Error desconocido";
  const is404 = error?.status === 404 || errorText.toLowerCase().includes("not found");

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: isDark
          ? "radial-gradient(ellipse at 60% 40%, #1a1200 0%, #0a0a0a 70%)"
          : "radial-gradient(ellipse at 60% 40%, #fffdf5 0%, #f5f0e8 70%)",
        overflow: "hidden",
        position: "relative",
        px: 3,
      }}
    >
      {/* Fondo decorativo */}
      <Box sx={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        pointerEvents: "none",
        zIndex: 0,
      }}>
        {/* Número gigante de fondo */}
        <Typography sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          fontSize: { xs: "40vw", md: "28vw" },
          fontWeight: 900,
          
          color: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.04)",
          userSelect: "none",
          lineHeight: 1,
          letterSpacing: "-0.05em",
        }}>
          {is404 ? "404" : "!"}
        </Typography>

        {/* Líneas decorativas */}
        <Box sx={{
          position: "absolute",
          top: "15%",
          right: "10%",
          width: 120,
          height: 120,
          borderRadius: "50%",
          border: `1px solid ${accent}20`,
        }} />
        <Box sx={{
          position: "absolute",
          top: "18%",
          right: "13%",
          width: 60,
          height: 60,
          borderRadius: "50%",
          border: `1px solid ${accent}30`,
        }} />
        <Box sx={{
          position: "absolute",
          bottom: "20%",
          left: "8%",
          width: 80,
          height: 80,
          borderRadius: "50%",
          border: `1px solid ${accent}20`,
        }} />
      </Box>

      {/* Contenido */}
      <Box sx={{
        position: "relative",
        zIndex: 1,
        maxWidth: 520,
        width: "100%",
        textAlign: "center",
      }}>
        {/* Código de error */}
        <Typography sx={{
          fontSize: { xs: "0.75rem", md: "0.8rem" },
          fontWeight: 700,
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          color: accent,
          mb: 2,
          
        }}>
          {is404 ? "Página no encontrada" : "Error del sistema"}
        </Typography>

        {/* Título */}
        <Typography sx={{
          fontSize: { xs: "2rem", md: "2.8rem" },
          fontWeight: 800,
          
          color: isDark ? "#f5f0e8" : "#1a1200",
          lineHeight: 1.15,
          mb: 2,
          letterSpacing: "-0.02em",
        }}>
          {is404
            ? "Esta página no existe"
            : "Algo ha salido mal"}
        </Typography>

        {/* Descripción */}
        <Typography sx={{
          fontSize: "1rem",
          color: isDark ? "rgba(245,240,232,0.55)" : "rgba(26,18,0,0.5)",
          lineHeight: 1.7,
          mb: 3,
          
        }}>
          {is404
            ? "La ruta que buscas no existe o ha sido eliminada. Vuelve al inicio y continúa desde allí."
            : "Ha ocurrido un error inesperado en la aplicación. Puedes intentar volver al inicio."}
        </Typography>

        {/* Detalle técnico */}
        {errorText && (
          <Box sx={{
            mb: 4,
            px: 2,
            py: 1.25,
            borderRadius: "10px",
            background: isDark ? "rgba(244,67,54,0.08)" : "rgba(244,67,54,0.06)",
            border: "1px solid rgba(244,67,54,0.2)",
            display: "inline-block",
          }}>
            <Typography sx={{
              fontSize: "0.78rem",
              color: "#f44336",
              fontFamily: "monospace",
              letterSpacing: "0.03em",
            }}>
              {errorText}
            </Typography>
          </Box>
        )}

        {/* Botón */}
        <Box>
          <Button
            onClick={() => navigate("/")}
            variant="contained"
            sx={{
              background: `linear-gradient(135deg, ${accent}, ${isDark ? "#8a6a00" : "#a07800"})`,
              color: isDark ? "#1a1200" : "#fff",
              borderRadius: "12px",
              textTransform: "none",
              fontWeight: 700,
              fontSize: "0.95rem",
              px: 4,
              py: 1.4,
              boxShadow: `0 4px 20px ${accent}40`,
              
              letterSpacing: "0.02em",
              "&:hover": {
                opacity: 0.88,
                transform: "translateY(-1px)",
                boxShadow: `0 6px 28px ${accent}55`,
              },
              transition: "all 0.2s",
            }}
          >
            Volver al inicio
          </Button>
        </Box>
      </Box>
    </Box>
  );
}

export default ErrorPage;