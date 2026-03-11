import {
  Avatar,
  Box,
  Grid,
  Typography,
  IconButton,
  Button,
} from "@mui/material";
import React from "react";
import { useAppTheme } from "../hooks/useAppTheme";
import InterestItem from "../components/InterestItem";
import { useUser } from "../hooks/useUser";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import GradeIcon from "@mui/icons-material/Grade";
import { motion } from "framer-motion";
import { green } from "@mui/material/colors";
import { useNavigate } from "react-router-dom";
export default function AdCard({ ad, onEdit, onDelete }) {
  const { loggedUser } = useUser();
  const theme = useAppTheme();
  const navigate = useNavigate();

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return new Intl.DateTimeFormat("es-ES", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
      .format(date)
      .replace(".", "");
  };

  const fechaFormateada = ad.created_at
    ? formatDate(ad.created_at)
    : "No se ha registrado una fecha";

  const hasBody = ad.body && ad.body.trim() !== "";
  const isLoggedUser = loggedUser && ad.user_id === loggedUser.id;

  let alturaMinima = "140px";
  if (hasBody) {
    alturaMinima = "200px";
  } else if (isLoggedUser) {
    alturaMinima = "240px";
  }
  return (
    <Grid
      container
      sx={{
        backgroundColor: theme.tertiaryBack,
        width: "100%",
        minHeight: alturaMinima,
        display: "flex",
        flexDirection: "column",
        borderRadius: 2,
        border: "solid 2px " + theme.primaryText,

        boxShadow: 6,
        px: 4,
        pt: 3,
        pb: 3,

        gap: hasBody ? 2 : 1,
      }}
    >
      {/*Avatar e Intereses */}
      <Box
        component={motion.div} // <-- Esta es la clave
        onClick={() => {
          navigate("/app/" + ad.user_id);
        }}
        whileHover={{
          scale: 0.98,
          transition: { duration: 0.1 },
        }}
        sx={{
          display: "flex",
          alignItems: "center",
          width: "100%",
          gap: 2,
          border: "solid 2px " + theme.primaryText,
          borderRadius: 1000,
          p: 1.5,
          mb: 1,
          background: theme.secondaryBack,
          cursor: "pointer",
        }}
      >
        <Avatar
          sx={{ width: 70, height: 70, flexShrink: 0 }}
          src={ad.user.url_image ?? "/no_user_avatar_image.png"}
        />
        <Box
          sx={{ flexGrow: 1, display: "flex", flexDirection: "column", gap: 1 }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <Typography
              sx={{
                color: theme.primaryText,
                fontWeight: 500,
                lineHeight: 1.2,
              }}
            >
              {ad.user.name}
              {ad.user.role === "ADMIN" && (
                <GradeIcon sx={{ color: "#FFD700", fontSize: "0.9rem" }} />
              )}
              <Box
                component="span"
                sx={{
                  color: theme.textSecondary,
                  fontWeight: 400,
                  ml: 2,
                  fontSize: "0.85rem",
                }}
              >
                {fechaFormateada}
              </Box>
            </Typography>
          </Box>

          <Box
            sx={{
              display: "flex",
              flexDirection: "row",
              flexWrap: "wrap",
              gap: 1,
              width: "100%",
            }}
          >
            {ad.interest_id_interests.map((interest) => (
              <Box key={interest.id} sx={{ width: "auto" }}>
                <InterestItem title={interest.name} variant={"ad"} />
              </Box>
            ))}
          </Box>
        </Box>
      </Box>

      {/*Título y Body */}
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1, mb: 2 }}>
        <Typography
          sx={{
            fontWeight: "bold",
            fontSize: "20px",
            color: theme.primaryText,
          }}
        >
          {ad.title}
        </Typography>

        {hasBody && (
          <Box
            sx={{
              p: 2,
              border: theme.primaryText + " 2px solid",

              background: theme.secondaryBack,
              borderRadius: 4,
              height: "180px",
              overflowY: "auto",

              "&::-webkit-scrollbar": {
                width: "3px",
              },
              "&::-webkit-scrollbar-thumb": {
                backgroundColor: theme.secondaryText,
                borderRadius: "10px",
              },

              "&::-webkit-scrollbar-track": {
                backgroundColor: "transparent",
                margin: "10px 0",
              },
            }}
          >
            <Typography
              sx={{
                whiteSpace: "pre-line",
                color: theme.fieldsText,
                wordBreak: "break-word",
                fontSize: "0.95rem",
                lineHeight: 1.6,
              }}
            >
              {ad.body}
            </Typography>
          </Box>
        )}
      </Box>

      {/*Botones y línea */}
      {isLoggedUser && (
        <Box sx={{ mt: "auto", pt: 1 }}>
          <Box
            sx={{
              width: "100%",
              height: "2px",
              borderRadius: 1000,
              background: theme.primaryText,
              opacity: 0.15,
              mb: 2,
            }}
          />
          <Box
            sx={{
              display: "flex",
              gap: 1,
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Button
              onClick={() => onEdit(ad)}
              sx={{ color: theme.primaryText, borderRadius: 1000, px: 2 }}
            >
              <Typography
                sx={{ mr: 1, fontSize: "0.9rem", textTransform: "none" }}
              >
                Editar anuncio
              </Typography>
              <EditIcon fontSize="small" />
            </Button>
            <Button
              onClick={() => onDelete(ad.id)}
              sx={{ color: "#ff4444", borderRadius: 1000, px: 2 }}
            >
              <Typography
                sx={{ mr: 1, fontSize: "0.9rem", textTransform: "none" }}
              >
                Eliminar anuncio
              </Typography>
              <DeleteIcon fontSize="small" />
            </Button>
          </Box>
        </Box>
      )}
    </Grid>
  );
}
