import {
  Avatar,
  Button,
  Grid,
  Typography,
  Backdrop,
  CircularProgress,
  Box,
  TextField,
} from "@mui/material";
import React, { useEffect, useState, useContext } from "react";
import { useUser } from "../hooks/useUser";
import InterestItem from "../components/InterestItem";
import { useNavigate, useParams } from "react-router-dom";
import api from "../utils/api";
import { useAppTheme } from "../hooks/useAppTheme";
import GradeIcon from "@mui/icons-material/Grade";
import ConfirmModal from "../components/ConfirmModal";
import { SocketContext } from "../context/SocketContext";

export default function UserPage() {
  const navigate = useNavigate();
  const { loggedUser } = useUser();
  const { socket } = useContext(SocketContext);
  const [openZoom, setOpenZoom] = useState(false);
  const { id: userIdAct } = useParams();
  const isLoggedUser = String(loggedUser?.id) === String(userIdAct);
  const theme = useAppTheme();

  const [visitedUser, setVisitedUser] = useState({});
  const [userInterests, setUserInterests] = useState([]);

  const [activeConnId, setActiveConnId] = useState(null);
  const [pendingReqData, setPendingReqData] = useState(null);
  const [buttonDisable, setButtonDisable] = useState(false);

  const [openConfirm, setOpenConfirm] = useState(false);
  const [modalMode, setModalMode] = useState("SEND");
  const [requestBody, setRequestBody] = useState("Hola, me gustaría conectar contigo.");

  const [buttonConfig, setButtonConfig] = useState({
    text: "Enviar Solicitud",
    actionType: "SEND",
  });

  const handleButtonClick = () => {
    if (buttonConfig.actionType === "SEND") {
      setModalMode("SEND");
      setOpenConfirm(true);
    } else if (buttonConfig.actionType === "ACCEPT") {
      setModalMode("ACCEPT");
      setOpenConfirm(true);
    } else if (buttonConfig.actionType === "DELETE") {
      setModalMode("DELETE");
      setOpenConfirm(true);
    }
  };

  const alConfirmarModal = async () => {
    setOpenConfirm(false);
    setButtonDisable(true);
    try {
      if (modalMode === "SEND") {
        await api.post("/requests", { receiver_id: userIdAct, body: requestBody });
      } else if (modalMode === "ACCEPT") {
        await api.put(`/requests/${pendingReqData.id}/accept`);
      } else if (modalMode === "DELETE") {
        await api.put(`/connections/${activeConnId}/finish`);
      }
      await refrescarEstadoBoton();
    } catch (error) {
      console.error(error);
    } finally {
      setButtonDisable(false);
    }
  };

  const alCancelarORechazar = async () => {
    setOpenConfirm(false);
    if (modalMode === "ACCEPT") {
      setButtonDisable(true);
      try {
        await api.put(`/requests/${pendingReqData.id}/reject`);
        await refrescarEstadoBoton();
      } catch (error) {
        console.error(error);
      } finally {
        setButtonDisable(false);
      }
    }
  };

  const refrescarEstadoBoton = async () => {
    if (!userIdAct || isLoggedUser) return;
    try {
      setButtonDisable(true);
      const resEsAmigo = await api.get("/connections/check/" + userIdAct);
      if (resEsAmigo.data.exists) {
        setActiveConnId(resEsAmigo.data.connection_id);
        setButtonConfig({ text: "Eliminar amigo", actionType: "DELETE" });
      } else {
        const resHaySolicitud = await api.get("/requests/check-pending/" + userIdAct);
        if (resHaySolicitud.data.exists) {
          setPendingReqData(resHaySolicitud.data.data);
          if (resHaySolicitud.data.type === "SENT") {
            setButtonConfig({ text: "Solicitud Pendiente", actionType: "NONE" });
          } else {
            setButtonConfig({ text: "Responder Solicitud", actionType: "ACCEPT" });
          }
        } else {
          setButtonConfig({ text: "Enviar Solicitud", actionType: "SEND" });
        }
      }
    } catch (error) {
      console.error("Error comprobando:", error);
    } finally {
      setButtonDisable(false);
    }
  };

  useEffect(() => {
    const hacerComprobaciones = async () => {
      if (!userIdAct || isLoggedUser) return;
      try {
        setButtonDisable(true);
        const resEsAmigo = await api.get("/connections/check/" + userIdAct);
        if (resEsAmigo.data.exists) {
          setActiveConnId(resEsAmigo.data.connection_id);
          setButtonConfig({ text: "Eliminar amigo", actionType: "DELETE" });
        } else {
          const resHaySolicitud = await api.get("/requests/check-pending/" + userIdAct);
          if (resHaySolicitud.data.exists) {
            setPendingReqData(resHaySolicitud.data.data);
            if (resHaySolicitud.data.type === "SENT") {
              setButtonConfig({ text: "Solicitud Pendiente", actionType: "NONE" });
            } else {
              setButtonConfig({ text: "Responder Solicitud", actionType: "ACCEPT" });
            }
          } else {
            setButtonConfig({ text: "Enviar Solicitud", actionType: "SEND" });
          }
        }
      } catch (error) {
        console.error("Error comprobando:", error);
      } finally {
        setButtonDisable(false);
      }
    };

    const fetchInicial = async () => {
      try {
        const res = await api.get("/users/" + userIdAct);
        setVisitedUser(res.data.usuario || res.data);
        const res2 = await api.get(`/users/${userIdAct}/interests`);
        setUserInterests(res2.data.datos || []);
        await hacerComprobaciones();
      } catch (error) {
        console.error(error);
      }
    };

    fetchInicial();

    if (socket) {
      const escucharSocket = (payload) => {
        const sId = payload.data?.sender_id || payload.sender_id;
        const rId = payload.data?.receiver_id || payload.receiver_id;
        if (
          String(sId) === String(userIdAct) &&
          String(rId) === String(loggedUser?.id)
        ) {
          hacerComprobaciones();
        }
      };
      socket.on("nueva_solicitud", escucharSocket);
      return () => socket.off("nueva_solicitud", escucharSocket);
    }
  }, [userIdAct, socket, loggedUser?.id, isLoggedUser]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Grid container maxWidth="xxl" justifyContent="center" sx={{ minHeight: "100%" }}>
      <Grid container direction="column" spacing={2} size={{ xs: 12, md: 9 }} sx={{ background: theme.secondaryBack, borderRadius: 3, p: 3 }}>

        <Grid size={{ xs: 12 }}>
          <Grid sx={{ background: theme.primaryBack, borderRadius: "12px 12px 0 0", height: "12px" }} />
          <Grid container spacing={2} justifyContent="end" sx={{ background: theme.tertiaryBack, borderRadius: "0 0 12px 12px", p: 3 }}>
            <Grid container direction="row" size={{ xs: 12 }} spacing={2} alignItems="flex-start">
              <Grid>
                <Avatar
                  src={visitedUser.url_image ?? "/no_user_avatar_image.png"}
                  onClick={() => setOpenZoom(true)}
                  sx={{ width: 90, height: 90, border: theme.primaryBack + " solid 3px", cursor: "pointer" }}
                />
              </Grid>
              <Grid container direction="column" size={{ xs: "grow" }} spacing={0.5}>
                <Typography sx={{ fontWeight: "bold", fontSize: "1.4rem", color: theme.primaryText }}>
                  @{visitedUser.name}{" "}
                  {visitedUser.role === "ADMIN" && (
                    <GradeIcon sx={{ color: "#FFD700", fontSize: "1rem", ml: 0.5 }} />
                  )}
                </Typography>
                {isLoggedUser && (
                  <Typography sx={{ color: theme.secondaryText, fontSize: "0.9rem" }}>
                    {visitedUser.email}
                  </Typography>
                )}
                <Typography sx={{ color: theme.fieldsText, fontSize: "0.9rem" }}>
                  {visitedUser.connections_count || 0} Conexiones
                </Typography>
              </Grid>
              <Grid container direction="column" alignItems="flex-end" justifyContent="space-between" size={{ xs: "grow" }}>
                <Typography sx={{ color: theme.secondaryText, fontSize: "0.85rem" }}>
                  Se unió a nosotros el{" "}
                  {visitedUser.created_at && new Date(visitedUser.created_at).toLocaleDateString("es-ES", {
                    day: "numeric", month: "long", year: "numeric",
                  })}
                </Typography>
                {!isLoggedUser ? (
                  <Button variant="contained" disabled={buttonDisable}
                    sx={{ mt: 1, background: theme.variantBack, borderRadius: 2 }}
                    onClick={handleButtonClick}>
                    {buttonDisable ? <CircularProgress size={20} color="inherit" /> : buttonConfig.text}
                  </Button>
                ) : (
                  <Button variant="contained"
                    sx={{ mt: 1, background: theme.variantBack, borderRadius: 2 }}
                    onClick={() => navigate("/app/user/edit")}>
                    Editar perfil
                  </Button>
                )}
              </Grid>
            </Grid>
          </Grid>
        </Grid>

        {visitedUser.bio && (
          <Grid size={{ xs: 12 }} sx={{ mt: 2 }}>
            <Typography sx={{ fontWeight: "bold", mb: 1, color: theme.primaryText }}>Sobre mí:</Typography>
            <Box sx={{ background: theme.secondaryBack, p: 2, borderRadius: 3 }}>
              <Typography sx={{ whiteSpace: "pre-wrap", color: theme.fieldsText }}>{visitedUser.bio}</Typography>
            </Box>
          </Grid>
        )}

        {userInterests.length > 0 && (
          <Grid size={{ xs: 12 }} sx={{ mt: 2 }}>
            <Box sx={{ background: theme.primaryBack, borderRadius: 12, p: 3 }}>
              <Typography sx={{ fontWeight: "bold", color: theme.variantText, mb: 1 }}>Intereses</Typography>
              <Grid container spacing={1}>
                {userInterests.map((i) => (
                  <InterestItem key={i.id} title={i.interest?.name || i.name} />
                ))}
              </Grid>
            </Box>
          </Grid>
        )}

        {visitedUser.goals && (
          <Grid size={{ xs: 12 }} sx={{ mt: 2 }}>
            <Typography sx={{ fontWeight: "bold", mb: 1, color: theme.primaryText }}>Objetivos personales</Typography>
            <Box sx={{ background: theme.tertiaryBack, p: 2, borderRadius: 3 }}>
              <Typography sx={{ whiteSpace: "pre-wrap", color: theme.fieldsText }}>{visitedUser.goals}</Typography>
            </Box>
          </Grid>
        )}

        {visitedUser.short_sentece && visitedUser.short_sentece.trim() !== "" && (
          <Grid size={{ xs: 12 }} sx={{ mt: 2 }}>
            <Typography sx={{ fontWeight: "bold", mb: 1, color: theme.primaryText }}>Frase pública</Typography>
            <Box sx={{ background: theme.tertiaryBack, p: 2, borderRadius: 3 }}>
              <Typography sx={{ color: theme.fieldsText }}>{visitedUser.short_sentece}</Typography>
            </Box>
          </Grid>
        )}

      </Grid>

      <ConfirmModal
        open={openConfirm}
        handleClose={() => setOpenConfirm(false)}
        onConfirm={alConfirmarModal}
        onCancel={alCancelarORechazar}
        title={
          modalMode === "SEND" ? "Enviar solicitud" :
          modalMode === "DELETE" ? "Eliminar amigo" :
          "Responder solicitud"
        }
        message={
          modalMode === "SEND" ? (
            <Box sx={{ pt: 1 }}>
              <Typography sx={{ mb: 2 }}>Personaliza tu mensaje para @{visitedUser.name}:</Typography>
              <TextField fullWidth multiline rows={3} value={requestBody} onChange={(e) => setRequestBody(e.target.value)} />
            </Box>
          ) : modalMode === "DELETE" ? (
            `¿Estás seguro de que quieres eliminar la conexión con @${visitedUser.name}?`
          ) : (
            <Box>
              <Typography>@{visitedUser.name} dice:</Typography>
              <Typography sx={{ fontStyle: "italic", my: 2, p: 1, bgcolor: "action.hover", borderRadius: 1 }}>
                "{pendingReqData?.body || "Sin mensaje"}"
              </Typography>
              <Typography>¿Quieres aceptar la conexión?</Typography>
            </Box>
          )
        }
      />

      <Backdrop sx={{ zIndex: 9999 }} open={openZoom} onClick={() => setOpenZoom(false)}>
        <img src={visitedUser.url_image ?? "/no_user_avatar_image.png"} style={{ width: "500px", borderRadius: "50%" }} alt="Zoom" />
      </Backdrop>
    </Grid>
  );
}