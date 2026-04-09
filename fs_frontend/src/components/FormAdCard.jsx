import * as React from "react";
import { useState, useEffect } from "react";
import {
  Box, Typography, Dialog, DialogTitle, DialogContent, DialogActions,
  IconButton, TextField, Button, Grid, Zoom, Fade,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import PublishIcon from "@mui/icons-material/Publish";
import CheckIcon from "@mui/icons-material/Check";
import { TransitionGroup } from "react-transition-group";
import { useAppTheme } from "../hooks/useAppTheme";
import InterestItem from "./InterestItem";
import api from "../utils/api";
import ErrorMessage from "../components/ErrorMessage";

export default function FormAdCard({ open, handleOpen, adId, handleFinish }) {
  const theme = useAppTheme();
  const accent = theme.accent || theme.primaryBack;
  const isDark = theme.name === "dark";

  const [ogAd, setOgAd] = useState({});
  const [allInterests, setAllInterests] = useState([]);
  const [editedAd, setEditedAd] = useState({ title: "", body: "", interests: [] });
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState({ open: false, message: "" });

  useEffect(() => {
    const fetchInterests = async () => {
      try {
        const response = await api.get("/interests");
        if (response.data?.datos) setAllInterests(response.data.datos);
      } catch (error) {
        console.error(error);
      }
    };
    fetchInterests();
  }, []);

  useEffect(() => {
    const fetchAd = async () => {
      if (open) {
        if (adId) {
          setLoading(true);
          try {
            const response = await api.get(`/ads/${adId}`);
            if (response.data?.datos) {
              setOgAd(response.data.datos);
              setEditedAd(response.data.datos);
            }
          } catch (err) {
            setLocalError({ open: true, message: "No se pudo cargar el anuncio." });
          } finally {
            setLoading(false);
          }
        } else {
          setEditedAd({ title: "", body: "", interests: [] });
        }
      }
    };
    fetchAd();
  }, [open, adId]);

  const adInterestIds = new Set((editedAd.interests || []).map((i) => i.id || i.interest_id));
  const restInterests = allInterests.filter((i) => !adInterestIds.has(i.id));

  const handleClose = () => {
    setLocalError({ open: false, message: "" });
    handleOpen(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const limit = name === "title" ? 100 : 500;
    if (value.length <= limit) setEditedAd((prev) => ({ ...prev, [name]: value }));
  };

  const addInterest = (interest) => setEditedAd((prev) => ({ ...prev, interests: [...prev.interests, interest] }));
  const removeInterest = (interest) => setEditedAd((prev) => ({ ...prev, interests: prev.interests.filter((i) => (i.id || i.interest_id) !== (interest.id || interest.interest_id)) }));

  const handleSubmit = async () => {
    if (!editedAd.title) {
      setLocalError({ open: true, message: "El título es obligatorio." });
      return;
    }
    const dataToSend = { ...editedAd, interests: (editedAd.interests || []).map((i) => i.id || i.interest_id) };
    try {
      if (adId) await api.put(`/ads/${adId}`, dataToSend);
      else await api.post("/ads", dataToSend);
      handleFinish();
      handleClose();
    } catch (error) {
      setLocalError({ open: true, message: error.response?.data?.message || "Ocurrió un error al guardar el anuncio." });
    }
  };

  const inputStyle = {
    "& .MuiOutlinedInput-root": {
      borderRadius: "12px", background: theme.tertiaryBack,
      "& fieldset": { borderColor: `${accent}30`, borderWidth: 1.5 },
      "&:hover fieldset": { borderColor: `${accent}60` },
      "&.Mui-focused fieldset": { borderColor: accent, borderWidth: 2 },
    },
    "& .MuiInputBase-input": {
      color: theme.fieldsText,
      "&:-webkit-autofill": { WebkitBoxShadow: `0 0 0 1000px ${theme.tertiaryBack} inset`, WebkitTextFillColor: theme.fieldsText },
    },
  };

  const labelSx = { fontWeight: 700, fontSize: "0.75rem", color: accent, letterSpacing: "0.08em", textTransform: "uppercase" };
  const counterSx = { fontSize: "0.75rem", color: theme.mutedText };

  if (loading) return null;

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: "20px",
          background: theme.secondaryBack,
          border: `1px solid ${accent}20`,
          boxShadow: isDark ? "0 24px 60px rgba(0,0,0,0.6)" : "0 24px 60px rgba(0,0,0,0.12)",
          height: { xs: "90vh", md: "80vh" },
          maxHeight: "800px",
        },
      }}
    >
      <DialogTitle sx={{ pb: 1, pt: 2.5, px: 3, borderBottom: `1px solid ${accent}15` }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography sx={{ fontWeight: 700, fontSize: "1.1rem", color: theme.primaryText }}>
            {adId ? "Editar anuncio" : "Crear nuevo anuncio"}
          </Typography>
          <IconButton size="small" onClick={handleClose} sx={{ color: theme.mutedText, "&:hover": { color: theme.primaryText } }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ px: 3, py: 2.5, display: "flex", flexDirection: "column", gap: 3, overflowY: "auto" }}>

        {/* Título */}
        <Box>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
            <Typography sx={labelSx}>Asunto</Typography>
            <Typography sx={counterSx}>{editedAd.title?.length || 0}/100</Typography>
          </Box>
          <TextField name="title" placeholder="Escribe un asunto para tu anuncio..." fullWidth value={editedAd.title || ""} onChange={handleChange} sx={inputStyle} />
        </Box>

        {/* Intereses */}
        <Box>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
            <Typography sx={labelSx}>Intereses <span style={{ textTransform: "none", fontWeight: 400, color: theme.mutedText }}>(opcional)</span></Typography>
            <Typography sx={counterSx}>{editedAd.interests?.length || 0}/{allInterests.length}</Typography>
          </Box>
          <Grid container spacing={1.5} sx={{ minHeight: 150 }}>
            {editedAd.interests?.length > 0 && (
              <Grid item xs={12} sm={7}>
                <Box sx={{ background: theme.tertiaryBack, border: `1px solid ${accent}25`, borderRadius: "12px", p: 1.5, minHeight: 130, maxHeight: 160, overflowY: "auto", "&::-webkit-scrollbar": { width: "3px" }, "&::-webkit-scrollbar-thumb": { background: `${accent}40`, borderRadius: "10px" } }}>
                  <Typography sx={{ fontSize: "0.7rem", color: theme.mutedText, mb: 1 }}>Seleccionados — pulsa para quitar</Typography>
                  <TransitionGroup component={null}>
                    {editedAd.interests.map((int) => (
                      <Zoom key={int.id || int.interest_id}>
                        <Box onClick={() => removeInterest(int)} sx={{ p: 0.4, cursor: "pointer", display: "inline-block" }}>
                          <InterestItem title={int.name || int.nombre} variant="deselect" />
                        </Box>
                      </Zoom>
                    ))}
                  </TransitionGroup>
                </Box>
              </Grid>
            )}
            <Grid item xs={12} sm={editedAd.interests?.length === 0 ? 12 : 5}>
              <Box sx={{ background: theme.primaryBack, border: `1px solid ${accent}20`, borderRadius: "12px", p: 1.5, minHeight: 130, maxHeight: 160, overflowY: "auto", "&::-webkit-scrollbar": { width: "3px" }, "&::-webkit-scrollbar-thumb": { background: `${accent}40`, borderRadius: "10px" } }}>
                <Typography sx={{ fontSize: "0.7rem", color: theme.mutedText, mb: 1 }}>Disponibles — pulsa para añadir</Typography>
                <TransitionGroup component={null}>
                  {restInterests.map((int) => (
                    <Zoom key={int.id || int.interest_id}>
                      <Box onClick={() => addInterest(int)} sx={{ p: 0.4, cursor: "pointer", display: "inline-block" }}>
                        <InterestItem title={int.name || int.nombre} variant="select" />
                      </Box>
                    </Zoom>
                  ))}
                </TransitionGroup>
              </Box>
            </Grid>
          </Grid>
        </Box>

        {/* Cuerpo */}
        <Box>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
            <Typography sx={labelSx}>Cuerpo <span style={{ textTransform: "none", fontWeight: 400, color: theme.mutedText }}>(opcional)</span></Typography>
            <Typography sx={counterSx}>{editedAd.body?.length || 0}/500</Typography>
          </Box>
          <TextField placeholder="Añade más detalles a tu anuncio..." name="body" fullWidth multiline rows={5} value={editedAd.body || ""} onChange={handleChange} sx={inputStyle} />
        </Box>

        <ErrorMessage message={localError.message} open={localError.open} setOpen={(val) => setLocalError((prev) => ({ ...prev, open: val }))} />
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3, pt: 1.5, borderTop: `1px solid ${accent}15`, gap: 1.5 }}>
        <Button
          variant="outlined"
          startIcon={<RestartAltIcon />}
          onClick={() => adId ? setEditedAd(ogAd) : setEditedAd({ title: "", body: "", interests: [] })}
          sx={{ borderColor: `${accent}40`, color: theme.mutedText, borderRadius: "10px", textTransform: "none", fontWeight: 600, "&:hover": { borderColor: "#f44336", color: "#f44336", background: "rgba(244,67,54,0.06)" } }}
        >
          Restablecer
        </Button>
        <Button
          variant="contained"
          startIcon={adId ? <CheckIcon /> : <PublishIcon />}
          onClick={handleSubmit}
          sx={{ background: `linear-gradient(135deg, ${accent}, ${theme.variantBack || accent})`, color: isDark ? "#1a1200" : "#fff", borderRadius: "10px", textTransform: "none", fontWeight: 700, px: 3, flex: 1, "&:hover": { opacity: 0.9 } }}
        >
          {adId ? "Aplicar cambios" : "Publicar anuncio"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}