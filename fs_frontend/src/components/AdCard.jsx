import {
  Avatar,
  Box,
  Grid,
  Typography,
  IconButton,
  Button,
  Backdrop,
  Portal,
  TextField,
  Stack,
  MenuItem,
  Select,
  FormControl,
  Chip,
} from "@mui/material";
import React, { useState, useEffect } from "react";
import { useAppTheme } from "../hooks/useAppTheme";
import InterestItem from "../components/InterestItem";
import { useUser } from "../hooks/useUser";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import GradeIcon from "@mui/icons-material/Grade";
import CloseIcon from "@mui/icons-material/Close";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";
import StarIcon from "@mui/icons-material/Star";
import FormAdCard from "./FormAdCard";

export default function AdCard({ ad, onDelete, setOpenFormAd, onSelect }) {
  const { loggedUser } = useUser();
  const theme = useAppTheme();
  const navigate = useNavigate();
  const [allInterests, setAllInterests] = useState([]);

  // Carga de intereses al abrir el modal
  useEffect(() => {
    if (allInterests.length === 0) {
      const fetchInterests = async () => {
        try {
          const response = await api.get("/interests");

          if (response.data?.datos) setAllInterests(response.data.datos);
        } catch (error) {
          console.error("Error cargando intereses:", error);
        }
      };
      fetchInterests();
    }
  }, [allInterests.length]);

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
    : "No registrada";
  const hasBody = ad.body && ad.body.trim() !== "";
  const isLoggedUser = loggedUser && ad.user_id === loggedUser.id;

  return (
    <Grid
      container
      sx={{
        backgroundColor: theme.tertiaryBack,
        width: "100%",
        minHeight: hasBody ? "200px" : "140px",
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
      {/* Cabecera: Avatar y Usuario */}
      <Box
        component={motion.div}
        onClick={() => navigate("/app/" + ad.user_id)}
        whileHover={{ scale: 0.98, transition: { duration: 0.1 } }}
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
                <GradeIcon
                  sx={{ color: "#FFD700", fontSize: "0.9rem", ml: 0.5 }}
                />
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
            sx={{ display: "flex", flexWrap: "wrap", gap: 1, width: "100%" }}
          >
            {ad.interests.map((interest) => (
              <InterestItem
                key={interest.id}
                title={interest.name}
                variant={"ad"}
              />
            ))}
          </Box>
        </Box>
      </Box>

      {/* Contenido del Anuncio */}
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
              maxHeight: "180px",
              overflowY: "auto",
              "&::-webkit-scrollbar": { width: "3px" },
              "&::-webkit-scrollbar-thumb": {
                backgroundColor: theme.secondaryText,
                borderRadius: "10px",
              },
            }}
          >
            <Typography
              sx={{
                whiteSpace: "pre-line",
                color: theme.fieldsText,
                fontSize: "0.95rem",
                lineHeight: 1.6,
                wordBreak: "break-word",
                overflowWrap: "anywhere",
              }}
            >
              {ad.body}
            </Typography>
          </Box>
        )}
      </Box>

      {/* Acciones para el dueño del anuncio */}
      {(isLoggedUser || loggedUser.role === "ADMIN") && (
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
              onClick={() => {
                onSelect(ad.id);
                setOpenFormAd(true);
              }}
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
