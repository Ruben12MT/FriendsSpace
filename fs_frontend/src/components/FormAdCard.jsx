import * as React from "react";
import { useState, useEffect } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Modal from "@mui/material/Modal";
import { IconButton, TextField, Tooltip, Grid } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import PublishIcon from "@mui/icons-material/Publish";
import CheckIcon from "@mui/icons-material/Check";
import { useAppTheme } from "../hooks/useAppTheme";
import InterestItem from "./InterestItem";
import api from "../utils/api";
import ErrorMessage from "../components/ErrorMessage";

export default function FormAdCard({ open, handleOpen, adId, handleFinish }) {
  const theme = useAppTheme();
  const [ogAd, setOgAd] = useState({});
  const [allInterests, setAllInterests] = useState([]);
  const [editedAd, setEditedAd] = useState({
    title: "",
    body: "",
    interests: [],
  });
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
              setOgAd(response.data?.datos);
              setEditedAd(response.data.datos);
            }
          } catch (err) {
            setLocalError({
              open: true,
              message: "No se pudo cargar el anuncio.",
            });
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

  const adInterestIds = new Set(
    (editedAd.interests || []).map((i) => i.id || i.interest_id),
  );
  const restInterests = allInterests.filter((i) => !adInterestIds.has(i.id));

  const handleClose = () => {
    setLocalError({ open: false, message: "" });
    handleOpen(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const limit = name === "title" ? 100 : 500;
    if (value.length <= limit) {
      setEditedAd((prev) => ({ ...prev, [name]: value }));
    }
  };

  const addInterest = (interest) => {
    setEditedAd((prev) => ({
      ...prev,
      interests: [...prev.interests, interest],
    }));
  };

  const removeInterest = (interest) => {
    setEditedAd((prev) => ({
      ...prev,
      interests: prev.interests.filter(
        (i) =>
          (i.id || i.interest_id) !== (interest.id || interest.interest_id),
      ),
    }));
  };

  const handleSubmit = async () => {
    if (!editedAd.title || editedAd.interests.length === 0) {
      setLocalError({
        open: true,
        message: "El título y al menos un interés son obligatorios.",
      });
      return;
    }

    const dataToSend = {
      ...editedAd,
      interests: editedAd.interests.map((i) => i.id || i.interest_id),
    };
    try {
      if (adId) {
        await api.put(`/ads/${adId}`, dataToSend);
      } else {
        await api.post("/ads", dataToSend);
      }
      handleFinish();
      handleClose();
    } catch (error) {
      setLocalError({
        open: true,
        message:
          error.response?.data?.message ||
          "Ocurrió un error al guardar el anuncio.",
      });
    }
  };

  const inputStyle = {
    background: theme.tertiaryBack,
    border: theme.primaryText + " 2px solid",
    borderRadius: 2,
    "& .MuiOutlinedInput-notchedOutline": { border: "none" },
    "& .MuiInputBase-input": {
      color: theme.fieldsText,
      "&:-webkit-autofill": {
        WebkitBoxShadow: `0 0 0 1000px ${theme.tertiaryBack} inset`,
        WebkitTextFillColor: theme.fieldsText,
      },
    },
  };

  if (loading) return null;

  return (
    <Modal open={open} onClose={handleClose}>
      <Box
        justifyItems={"center"}
        alignContent={"center"}
        sx={{ height: "100%", width: "100%", outline: "none" }}
      >
        <Box
          display={"flex"}
          flexDirection={"column"}
          justifyContent={"space-between"}
          sx={{
            p: 3,
            borderRadius: 4,
            height: "825px",
            width: "65%",
            border: theme.primaryText + " 2px solid",
            background: theme.secondaryBack,
          }}
        >
          <Box
            display={"flex"}
            justifyContent="space-between"
            alignItems={"center"}
            width={"100%"}
          >
            <Typography variant="h5" sx={{ color: theme.primaryText }}>
              {adId ? "Editar Anuncio" : "Crear un nuevo anuncio"}
            </Typography>
            <IconButton onClick={handleClose}>
              <CloseIcon sx={{ color: theme.primaryText }} />
            </IconButton>
          </Box>

          <Box sx={{ flexGrow: 1 }}>
            <Grid item sx={{ width: "100%", mt: 3 }}>
              <Grid container justifyContent="space-between">
                <Typography
                  sx={{ fontWeight: "bold", mb: 0.5, color: theme.primaryText }}
                >
                  Escribe un asunto
                </Typography>
                <Typography
                  sx={{ fontWeight: "bold", mb: 0.5, color: theme.primaryText }}
                >
                  {editedAd.title?.length || 0}/100
                </Typography>
              </Grid>
              <TextField
                name="title"
                fullWidth
                value={editedAd.title || ""}
                onChange={handleChange}
                sx={inputStyle}
              />
            </Grid>
            <Grid item sx={{ width: "100%", mt: 3 }}>
              <Grid container justifyContent="space-between">
                <Typography
                  sx={{ fontWeight: "bold", mb: 0.5, color: theme.primaryText }}
                >
                  Selecciona los intereses del anuncio (Mínimo 1)
                </Typography>
                <Typography
                  sx={{ fontWeight: "bold", mb: 0.5, color: theme.primaryText }}
                >
                  {editedAd.interests?.length || 0}/{allInterests.length}
                </Typography>
              </Grid>
              <Grid
                container
                spacing={2}
                alignContent={"center"}
                justifyContent={"space-between"}
                sx={{ borderRadius: 4, height: "200px", py: 2 }}
              >
                <Grid
                  container
                  size={{ xs: 8 }}
                  sx={{
                    background: theme.tertiaryBack,
                    border: theme.primaryText + " 2px solid",
                    borderRadius: 4,
                    height: "175px",
                    p: 2,
                    overflowY: "auto",
                  }}
                >
                  {editedAd.interests.map((int) => (
                    <Box
                      key={int.id || int.interest_id}
                      onClick={() => removeInterest(int)}
                      sx={{ p: 0.5, cursor: "pointer" }}
                    >
                      <InterestItem
                        title={int.name || int.nombre}
                        variant="default"
                        onDelete={() => {}}
                      />
                    </Box>
                  ))}
                </Grid>

                <Grid
                  container
                  spacing={2}
                  size={{ xs: 4 }}
                  sx={{
                    background: theme.primaryBack,
                    border: theme.primaryText + " 2px solid",
                    borderRadius: 4,
                    height: "175px",
                    py: 1,
                    pl: 0.25,
                    overflowY: "auto",
                    display: "block",
                    "&::-webkit-scrollbar": { width: "6px" },
                    "&::-webkit-scrollbar-thumb": {
                      borderRadius: "10px",
                      background: theme.primaryText,
                    },
                  }}
                >
                  {restInterests.map((int) => (
                    <Box
                      key={int.id || int.interest_id}
                      onClick={() => addInterest(int)}
                      sx={{ p: 0.5, cursor: "pointer" }}
                    >
                      <InterestItem
                        title={int.name || int.nombre}
                        variant="select"
                      />
                    </Box>
                  ))}
                </Grid>
              </Grid>
            </Grid>
            <Grid item sx={{ width: "100%", mt: 3 }}>
              <Grid container justifyContent="space-between">
                <Typography
                  sx={{ fontWeight: "bold", mb: 0.5, color: theme.primaryText }}
                >
                  Añade un cuerpo (Opcional)
                </Typography>
                <Typography
                  sx={{ fontWeight: "bold", mb: 0.5, color: theme.primaryText }}
                >
                  {editedAd.body?.length || 0}/500
                </Typography>
              </Grid>
              <TextField
                name="body"
                fullWidth
                multiline
                rows={6}
                value={editedAd.body || ""}
                onChange={handleChange}
                sx={inputStyle}
              />
            </Grid>
            <ErrorMessage
              message={localError.message}
              open={localError.open}
              setOpen={(val) =>
                setLocalError((prev) => ({ ...prev, open: val }))
              }
            />
          </Box>

          <Box
            width={"100%"}
            display={"flex"}
            justifyContent="center"
            alignItems={"center"}
            gap={6}
            sx={{ pt: 3, borderTop: theme.primaryText + " solid 2px" }}
          >
            <Tooltip title="Restablecer cambios" arrow placement="top">
              <IconButton
                onClick={() =>
                  adId
                    ? setEditedAd(ogAd)
                    : setEditedAd({ title: "", body: "", interests: [] })
                }
                sx={{
                  backgroundColor: theme.primaryBack,
                  width: 55,
                  height: 55,
                  transition: "all 0.3s ease",
                  "&:hover": {
                    backgroundColor: "#f44336",
                    transform: "rotate(-45deg)",
                    boxShadow: "0px 4px 15px rgba(244, 67, 54, 0.4)",
                  },
                }}
              >
                <RestartAltIcon sx={{ color: theme.primaryText, fontSize: 30 }} />
              </IconButton>
            </Tooltip>

            <Tooltip
              title={adId ? "Aplicar Cambios" : "Publicar Anuncio"}
              arrow
              placement="top"
            >
              <IconButton 
                onClick={handleSubmit}
                sx={{
                  backgroundColor: theme.primaryText,
                  width: 55,
                  height: 55,
                  transition: "all 0.3s ease",
                  "&:hover": {
                    backgroundColor: theme.secondaryText || "#4caf50",
                    transform: "scale(1.1)",
                    boxShadow: `0px 4px 15px ${theme.primaryText}66`,
                  },
                }}
              >
                {adId ? (
                  <CheckIcon sx={{ color: theme.secondaryBack, fontSize: 32 }} />
                ) : (
                  <PublishIcon sx={{ color: theme.secondaryBack, fontSize: 32 }} />
                )}
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      </Box>
    </Modal>
  );
}