import {
  Avatar,
  Box,
  Grid,
  Typography,
  IconButton,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from "@mui/material";
import React, { useState, useEffect } from "react";
import { useAppTheme } from "../hooks/useAppTheme";
import InterestItem from "../components/InterestItem";
import { useUser } from "../hooks/useUser";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import GradeIcon from "@mui/icons-material/Grade";
import FlagIcon from "@mui/icons-material/Flag";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";
import FormAdCard from "./FormAdCard";

export default function AdCard({ ad, onDelete, setOpenFormAd, onSelect }) {
  const { loggedUser } = useUser();
  const theme = useAppTheme();
  const navigate = useNavigate();
  const [allInterests, setAllInterests] = useState([]);
  const [reportOpen, setReportOpen] = useState(false);
  const [reportMotivo, setReportMotivo] = useState("");
  const [reportSending, setReportSending] = useState(false);

  useEffect(() => {
    if (allInterests.length === 0) {
      api.get("/interests")
        .then((res) => { if (res.data?.datos) setAllInterests(res.data.datos); })
        .catch(console.error);
    }
  }, [allInterests.length]);

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return new Intl.DateTimeFormat("es-ES", { day: "2-digit", month: "short", year: "numeric" })
      .format(date).replace(".", "");
  };

  const fechaFormateada = ad.created_at ? formatDate(ad.created_at) : "No registrada";
  const hasBody = ad.body && ad.body.trim() !== "";
  const isLoggedUser = loggedUser && ad.user_id === loggedUser.id;
  const isAdmin = loggedUser?.role === "ADMIN" || loggedUser?.role === "DEVELOPER";
  const puedeReportar = !isLoggedUser && !isAdmin;

  const handleReport = async () => {
    if (!reportMotivo.trim()) return;
    setReportSending(true);
    try {
      await api.post("/requests/report", {
        body: reportMotivo.trim(),
        infoReport: {
          type: "AD",
          ad_id: ad.id,
          ad_title: ad.title,
          ad_body: ad.body,
          ad_user_id: ad.user_id,
          ad_user_name: ad.user?.name,
        },
      });
      setReportOpen(false);
      setReportMotivo("");
    } catch (e) {
      console.error(e);
    } finally {
      setReportSending(false);
    }
  };

  return (
    <>
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
          px: 4, pt: 3, pb: 3,
          gap: hasBody ? 2 : 1,
        }}
      >
        {/* Cabecera */}
        <Box
          component={motion.div}
          onClick={() => navigate("/app/" + ad.user_id)}
          whileHover={{ scale: 0.98, transition: { duration: 0.1 } }}
          sx={{
            display: "flex", alignItems: "center", width: "100%", gap: 2,
            border: "solid 2px " + theme.primaryText, borderRadius: 1000,
            p: 1.5, mb: 1, background: theme.secondaryBack, cursor: "pointer",
          }}
        >
          <Avatar sx={{ width: 70, height: 70, flexShrink: 0 }} src={ad.user.url_image ?? "/no_user_avatar_image.png"} />
          <Box sx={{ flexGrow: 1, display: "flex", flexDirection: "column", gap: 1 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <Typography sx={{ color: theme.primaryText, fontWeight: 500, lineHeight: 1.2 }}>
                {ad.user.name}
                {ad.user.role === "ADMIN" && <GradeIcon sx={{ color: "#FFD700", fontSize: "0.9rem", ml: 0.5 }} />}
                {ad.user.role === "DEVELOPER" && <GradeIcon sx={{ color: "#00bcd4", fontSize: "0.9rem", ml: 0.5 }} />}
                <Box component="span" sx={{ color: theme.textSecondary, fontWeight: 400, ml: 2, fontSize: "0.85rem" }}>
                  {fechaFormateada}
                </Box>
              </Typography>
            </Box>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, width: "100%" }}>
              {ad.interests.map((interest) => (
                <InterestItem key={interest.id} title={interest.name} variant="ad" />
              ))}
            </Box>
          </Box>
        </Box>

        {/* Contenido */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1, mb: 2 }}>
          <Typography sx={{ fontWeight: "bold", fontSize: "20px", color: theme.primaryText }}>
            {ad.title}
          </Typography>
          {hasBody && (
            <Box sx={{
              p: 2, border: theme.primaryText + " 2px solid", background: theme.secondaryBack,
              borderRadius: 4, maxHeight: "180px", overflowY: "auto",
              "&::-webkit-scrollbar": { width: "3px" },
              "&::-webkit-scrollbar-thumb": { backgroundColor: theme.secondaryText, borderRadius: "10px" },
            }}>
              <Typography sx={{ whiteSpace: "pre-line", color: theme.fieldsText, fontSize: "0.95rem", lineHeight: 1.6, wordBreak: "break-word" }}>
                {ad.body}
              </Typography>
            </Box>
          )}
        </Box>

        {/* Acciones */}
        <Box sx={{ mt: "auto", pt: 1 }}>
          <Box sx={{ width: "100%", height: "2px", borderRadius: 1000, background: theme.primaryText, opacity: 0.15, mb: 2 }} />
          <Box sx={{ display: "flex", gap: 1, justifyContent: "space-between", alignItems: "center" }}>

            {/* Botones de propietario o admin */}
            {(isLoggedUser || isAdmin) && (
              <>
                <Button onClick={() => { onSelect(ad.id); setOpenFormAd(true); }} sx={{ color: theme.primaryText, borderRadius: 1000, px: 2 }}>
                  <Typography sx={{ mr: 1, fontSize: "0.9rem", textTransform: "none" }}>Editar anuncio</Typography>
                  <EditIcon fontSize="small" />
                </Button>
                <Button onClick={() => onDelete(ad.id)} sx={{ color: "#ff4444", borderRadius: 1000, px: 2 }}>
                  <Typography sx={{ mr: 1, fontSize: "0.9rem", textTransform: "none" }}>Eliminar anuncio</Typography>
                  <DeleteIcon fontSize="small" />
                </Button>
              </>
            )}

            {/* Botón reportar para usuarios normales sobre anuncios ajenos */}
            {puedeReportar && (
              <Box sx={{ ml: "auto" }}>
                <Button
                  onClick={() => setReportOpen(true)}
                  sx={{ color: theme.secondaryText, borderRadius: 1000, px: 2, "&:hover": { color: "#f44336" } }}
                >
                  <Typography sx={{ mr: 1, fontSize: "0.9rem", textTransform: "none" }}>Reportar</Typography>
                  <FlagIcon fontSize="small" />
                </Button>
              </Box>
            )}
          </Box>
        </Box>
      </Grid>

      {/* Modal de reporte */}
      <Dialog
        open={reportOpen}
        onClose={() => { setReportOpen(false); setReportMotivo(""); }}
        PaperProps={{
          sx: {
            borderRadius: "16px",
            background: theme.secondaryBack,
            minWidth: 360,
          },
        }}
      >
        <DialogTitle sx={{ color: theme.primaryText, fontWeight: 700 }}>
          <Box display="flex" alignItems="center" gap={1}>
            <FlagIcon sx={{ color: "#f44336", fontSize: 20 }} />
            Reportar anuncio
          </Box>
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ color: theme.secondaryText, fontSize: "0.875rem", mb: 2 }}>
            Anuncio de <strong style={{ color: theme.primaryText }}>@{ad.user?.name}</strong>: "{ad.title}"
          </DialogContentText>
          <TextField
            fullWidth multiline rows={3}
            placeholder="Describe el motivo del reporte..."
            value={reportMotivo}
            onChange={(e) => setReportMotivo(e.target.value)}
            sx={{
              "& .MuiOutlinedInput-root": { borderRadius: "10px" },
              "& .MuiInputBase-input": { color: theme.primaryText },
            }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 2, pb: 2, gap: 1 }}>
          <Button
            onClick={() => { setReportOpen(false); setReportMotivo(""); }}
            sx={{ color: theme.secondaryText, textTransform: "none", borderRadius: "8px" }}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleReport}
            disabled={!reportMotivo.trim() || reportSending}
            variant="contained"
            sx={{ background: "#f44336", color: "#fff", textTransform: "none", borderRadius: "8px", fontWeight: 600, "&:hover": { background: "#c62828" } }}
          >
            Enviar reporte
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}