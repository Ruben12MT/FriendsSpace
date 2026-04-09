import {
  Avatar, Box, Typography, Button, TextField, 
  Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions,
} from "@mui/material";
import React, { useState } from "react";
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

export default function AdCard({ ad, onDelete, setOpenFormAd, onSelect }) {
  const { loggedUser } = useUser();
  const theme = useAppTheme();
  const navigate = useNavigate();

  const accent = theme.accent || theme.primaryBack;
  const isDark = theme.name === "dark";

  const [reportOpen, setReportOpen] = useState(false);
  const [reportMotivo, setReportMotivo] = useState("");
  const [reportSending, setReportSending] = useState(false);

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return new Intl.DateTimeFormat("es-ES", { day: "2-digit", month: "short", year: "numeric" })
      .format(date).replace(".", "");
  };

  const fechaFormateada = ad.created_at ? formatDate(ad.created_at) : "No registrada";
  const hasBody = ad.body && ad.body.trim() !== "";
  const isLoggedUser = loggedUser && ad.user_id === loggedUser.id;
  const isAdmin = loggedUser?.role === "ADMIN" || loggedUser?.role === "DEVELOPER";
  const adOwnerIsAdminOrDev = ad.user?.role === "ADMIN" || ad.user?.role === "DEVELOPER";
  const puedeReportar = !isLoggedUser && !isAdmin && !adOwnerIsAdminOrDev;

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
      <Box
        sx={{
          width: "100%",
          background: theme.secondaryBack,
          borderRadius: "16px",
          border: `1px solid ${accent}25`,
          boxShadow: isDark ? "0 2px 12px rgba(0,0,0,0.25)" : `0 2px 12px rgba(184,134,11,0.08)`,
          px: 3, pt: 2.5, pb: 2.5,
          display: "flex", flexDirection: "column",
          gap: hasBody ? 2 : 1.5,
        }}
      >
        <Box
          component={motion.div}
          onClick={() => navigate("/app/" + ad.user_id)}
          whileHover={{ scale: 0.99, transition: { duration: 0.1 } }}
          sx={{
            display: "flex", alignItems: "center", gap: 2,
            background: theme.tertiaryBack,
            borderRadius: "12px",
            border: `1px solid ${accent}20`,
            p: 1.5, cursor: "pointer",
          }}
        >
          <Avatar
            sx={{ width: 52, height: 52, flexShrink: 0, border: `2px solid ${accent}30` }}
            src={ad.user.url_image ?? "/no_user_avatar_image.png"}
          />
          <Box sx={{ flexGrow: 1, display: "flex", flexDirection: "column", gap: 0.75 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Typography sx={{ color: theme.primaryText, fontWeight: 600, fontSize: "0.95rem" }}>
                {ad.user.name}
                {ad.user.role === "ADMIN" && <GradeIcon sx={{ color: "#FFD700", fontSize: "0.85rem", ml: 0.5 }} />}
                {ad.user.role === "DEVELOPER" && <GradeIcon sx={{ color: "#00bcd4", fontSize: "0.85rem", ml: 0.5 }} />}
              </Typography>
              <Typography sx={{ color: theme.mutedText, fontSize: "0.8rem" }}>
                {fechaFormateada}
              </Typography>
            </Box>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75 }}>
              {ad.interests.map((interest) => (
                <InterestItem key={interest.id} title={interest.name} variant="ad" />
              ))}
            </Box>
          </Box>
        </Box>

        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
          <Typography sx={{ fontWeight: 700, fontSize: "1.1rem", color: theme.primaryText }}>
            {ad.title}
          </Typography>
          {hasBody && (
            <Box sx={{
              p: 1.5,
              border: `1px solid ${accent}20`,
              background: theme.tertiaryBack,
              borderRadius: "10px",
              maxHeight: "180px", overflowY: "auto",
              "&::-webkit-scrollbar": { width: "3px" },
              "&::-webkit-scrollbar-thumb": { backgroundColor: `${accent}60`, borderRadius: "10px" },
            }}>
              <Typography sx={{ whiteSpace: "pre-line", color: theme.fieldsText, fontSize: "0.9rem", lineHeight: 1.6, wordBreak: "break-word" }}>
                {ad.body}
              </Typography>
            </Box>
          )}
        </Box>

        <Box>
          <Box sx={{ height: "1px", background: `${accent}20`, mb: 1.5 }} />
          <Box sx={{ display: "flex", gap: 1, justifyContent: "space-between", alignItems: "center" }}>
            {(isLoggedUser || isAdmin) && (
              <>
                <Button
                  onClick={() => { onSelect(ad.id); setOpenFormAd(true); }}
                  startIcon={<EditIcon fontSize="small" />}
                  sx={{ color: theme.primaryText, borderRadius: "8px", textTransform: "none", fontSize: "0.85rem", px: 1.5, "&:hover": { background: `${accent}10` } }}
                >
                  Editar
                </Button>
                <Button
                  onClick={() => onDelete(ad.id)}
                  startIcon={<DeleteIcon fontSize="small" />}
                  sx={{ color: "#f44336", borderRadius: "8px", textTransform: "none", fontSize: "0.85rem", px: 1.5, "&:hover": { background: "rgba(244,67,54,0.08)" } }}
                >
                  Eliminar
                </Button>
              </>
            )}
            {puedeReportar && (
              <Box sx={{ ml: "auto" }}>
                <Button
                  onClick={() => setReportOpen(true)}
                  startIcon={<FlagIcon fontSize="small" />}
                  sx={{ color: theme.mutedText, borderRadius: "8px", textTransform: "none", fontSize: "0.85rem", px: 1.5, "&:hover": { color: "#f44336", background: "rgba(244,67,54,0.06)" } }}
                >
                  Reportar
                </Button>
              </Box>
            )}
          </Box>
        </Box>
      </Box>

      <Dialog
        open={reportOpen}
        onClose={() => { setReportOpen(false); setReportMotivo(""); }}
        PaperProps={{ sx: { borderRadius: "16px", background: theme.secondaryBack, minWidth: 360 } }}
      >
        <DialogTitle sx={{ color: theme.primaryText, fontWeight: 700 }}>
          <Box display="flex" alignItems="center" gap={1}>
            <FlagIcon sx={{ color: "#f44336", fontSize: 20 }} />
            Reportar anuncio
          </Box>
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ color: theme.mutedText, fontSize: "0.875rem", mb: 2 }}>
            Anuncio de <strong style={{ color: theme.primaryText }}>@{ad.user?.name}</strong>: "{ad.title}"
          </DialogContentText>
          <TextField
            fullWidth multiline rows={3}
            placeholder="Describe el motivo del reporte..."
            value={reportMotivo}
            onChange={(e) => setReportMotivo(e.target.value)}
            sx={{
              "& .MuiOutlinedInput-root": { borderRadius: "10px", background: theme.tertiaryBack },
              "& .MuiInputBase-input": { color: theme.primaryText },
              "& fieldset": { borderColor: `${accent}30` },
            }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 2, pb: 2, gap: 1 }}>
          <Button onClick={() => { setReportOpen(false); setReportMotivo(""); }} sx={{ color: theme.mutedText, textTransform: "none", borderRadius: "8px" }}>
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