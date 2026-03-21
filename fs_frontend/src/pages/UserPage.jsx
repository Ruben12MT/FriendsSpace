import { Avatar, Button, Grid, Typography, Backdrop, CircularProgress, Box } from "@mui/material";
import React, { useEffect, useState, useCallback } from "react";
import { useUser } from "../hooks/useUser";
import InterestItem from "../components/InterestItem";
import { useNavigate, useParams } from "react-router-dom";
import api from "../utils/api";
import { useAppTheme } from "../hooks/useAppTheme";
import GradeIcon from "@mui/icons-material/Grade";
import ConfirmModal from "../components/ConfirmModal";

export default function UserPage() {
  const navigate = useNavigate();
  const { loggedUser } = useUser();
  const [openZoom, setOpenZoom] = useState(false);
  const { id: userIdAct } = useParams();
  const isLoggedUser = loggedUser?.id == userIdAct;
  const [visitedUser, setVisitedUser] = useState({});
  const [userInterests, setUserInterests] = useState([]);
  const theme = useAppTheme();

  const [activeConnId, setActiveConnId] = useState(null); // Guardamos el id de la conexion si ya son amigos para poder finalizarla
  const [pendingReqData, setPendingReqData] = useState(null); // Guardamos los datos de la solicitud pendiente para usar su ID o mensaje
  const [buttonDisable, setButtonDisable] = useState(true); // Controlamos si el boton principal esta bloqueado mientras carga la api
  const [openConfirm, setOpenConfirm] = useState(false); // Estado para abrir o cerrar el modal de confirmacion
  const [modalMode, setModalMode] = useState("DELETE"); // Controlamos si el modal se comporta como borrar amigo o aceptar solicitud

  const enviarSolicitud = async () => {
    try {
      setButtonDisable(true);
      await api.post("/requests", { 
        receiver_id: userIdAct,
        body: "Hola, me gustaría conectar contigo." 
      });

      setOtherUserButton({
        text: "Solicitud Pendiente",
        function: () => {},
      });

      await hacerComprobaciones();
    } catch (error) {
      console.error(error);
    } finally {
      setButtonDisable(false);
    }
  };

  const gestionarSolicitud = async (action) => {
    setOpenConfirm(false);
    try {
      setButtonDisable(true);
      if (action === "accept") {
        await api.put(`/requests/${pendingReqData.id}/accept`);
      } else {
        await api.put(`/requests/${pendingReqData.id}/reject`);
      }
      await hacerComprobaciones(); 
    } catch (error) {
      console.error(error);
    } finally {
      setButtonDisable(false);
    }
  };

  const eliminarAmigo = async () => {
    setOpenConfirm(false);
    if (!activeConnId) return;
    try {
      setButtonDisable(true);
      await api.put(`/connections/${activeConnId}/finish`);
      
      setOtherUserButton({
        text: "Enviar Solicitud",
        function: enviarSolicitud,
      });

      setActiveConnId(null);
      await hacerComprobaciones();
    } catch (error) {
      console.error(error);
    } finally {
      setButtonDisable(false);
    }
  };

  const [otherUserButton, setOtherUserButton] = useState({
    text: "Enviar Solicitud",
    function: enviarSolicitud,
  }); // Estado que maneja que texto y que funcion dispara el boton segun la relacion de los usuarios

  const hacerComprobaciones = useCallback(async () => {
    if (!userIdAct || loggedUser?.id == userIdAct) return;
    try {
      setButtonDisable(true);

      const resEsAmigo = await api.get("/connections/check/" + userIdAct);
      if (resEsAmigo.data.exists) {
        setActiveConnId(resEsAmigo.data.connection_id);
        return setOtherUserButton({
          text: "Eliminar amigo",
          function: () => { setModalMode("DELETE"); setOpenConfirm(true); },
        });
      }

      const resHaySolicitud = await api.get("/requests/check-pending/" + userIdAct);
      if (resHaySolicitud.data.exists) {
        setPendingReqData(resHaySolicitud.data.data);
        if (resHaySolicitud.data.type === "SENT") {
          return setOtherUserButton({
            text: "Solicitud Pendiente",
            function: () => {},
          });
        } else {
          return setOtherUserButton({
            text: "Responder Solicitud",
            function: () => { setModalMode("ACCEPT"); setOpenConfirm(true); }
          });
        }
      }

      setOtherUserButton({
        text: "Enviar Solicitud",
        function: enviarSolicitud,
      });
    } catch (error) {
      console.error(error);
    } finally {
      setButtonDisable(false);
    }
  }, [userIdAct, loggedUser]);

  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await api.get("/users/" + userIdAct);
        const usuarioBuscado = res.data.usuario;

        if (usuarioBuscado) {
          setVisitedUser(usuarioBuscado);
        } else {
          return;
        }

        const res2 = await api.get(`/users/${userIdAct}/interests`);
        setUserInterests(res2.data.datos || []);
      } catch (error) {
        console.log(error.message);
      }
    }
    fetchUser();
  }, [userIdAct]);

  useEffect(() => {
    hacerComprobaciones();
  }, [visitedUser, loggedUser, hacerComprobaciones]);

  return (
    <Grid container maxWidth="xxl" justifyContent="center" sx={{ minHeight: "100%" }}>
      <Grid container direction="column" spacing={2} size={{ xs: 12, md: 9 }} sx={{ background: theme.secondaryBack, borderRadius: 3, p: 3 }}>
        <Grid size={{ xs: 12 }}>
          <Grid sx={{ background: theme.primaryBack, borderRadius: "12px 12px 0 0", height: "12px" }} />
          <Grid container spacing={2} justifyContent={"end"} sx={{ background: theme.tertiaryBack, borderRadius: "0 0 12px 12px", p: 3 }}>
            <Grid container direction="row" size={{ xs: 12 }} spacing={2} alignItems="flex-start" >
              <Grid>
                <Avatar src={visitedUser.url_image ?? "/no_user_avatar_image.png"} onClick={() => setOpenZoom(true)} sx={{ width: 90, height: 90, border: theme.primaryBack + " solid 3px", cursor: "pointer", ":hover": { border: theme.primaryText + " solid 3px" } }} />
              </Grid>

              <Grid container direction="column" size={{ xs: "grow" }} spacing={0.5}>
                <Typography sx={{ fontWeight: "bold", fontSize: "1.4rem", color: theme.primaryText }}>
                  @{visitedUser.name}
                  {visitedUser.role === "ADMIN" && <GradeIcon sx={{ color: "#FFD700", fontSize: "1rem", ml: 0.5 }} />}
                </Typography>
                {visitedUser.email && <Typography sx={{ color: theme.secondaryText, fontSize: "0.9rem" }}>{visitedUser.email}</Typography>}
                <Typography sx={{ color: theme.fieldsText, fontSize: "0.9rem" }}>13 Conexiones</Typography>
              </Grid>

              <Grid container direction="column" alignItems="flex-end" justifyContent="space-between" size={{ xs: "grow" }}>
                <Typography sx={{ color: theme.secondaryText, fontSize: "0.85rem", fontWeight: "bold" }}>
                  Miembro desde {visitedUser.created_at ? new Date(visitedUser.created_at).toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" }) : "Reciente"}
                </Typography>

                {isLoggedUser ? (
                  <Button variant="contained" sx={{ mt: 1, background: theme.variantBack, "&:hover": { background: theme.buttonHover }, borderRadius: 2 }} onClick={() => navigate("/app/user/edit")}>Editar perfil</Button>
                ) : (
                  <Button variant="contained" disabled={buttonDisable} sx={{ mt: 1, background: theme.variantBack, "&:hover": { background: theme.buttonHover }, borderRadius: 2 }} onClick={() => otherUserButton.function()}>
                    {buttonDisable ? <CircularProgress size={20} color="inherit" /> : otherUserButton.text}
                  </Button>
                )}
              </Grid>
            </Grid>

            {visitedUser.bio?.trim() && (
              <Grid size={{ xs: 12 }}>
                <Typography sx={{ fontWeight: "bold", mb: 1, color: theme.primaryText }}>Sobre mí:</Typography>
                <Grid sx={{ background: theme.secondaryBack, p: 2, borderRadius: 3 }}>
                  <Typography sx={{ whiteSpace: "pre-wrap", color: theme.fieldsText }}>{visitedUser.bio}</Typography>
                </Grid>
              </Grid>
            )}
          </Grid>
        </Grid>

        {userInterests.length > 0 && (
          <Grid size={{ xs: 12 }}>
            <Grid container direction="column" spacing={1} sx={{ background: theme.primaryBack, borderRadius: 12, py: 3, px: 4 }}>
              <Typography sx={{ fontWeight: "bold", color: theme.variantText, mb: 1 }}>Intereses</Typography>
              <Grid container spacing={1}>
                {userInterests.map((interestRec) => (
                  <InterestItem key={interestRec.interest_id || interestRec.id} title={interestRec.interest?.name || interestRec.name} />
                ))}
              </Grid>
            </Grid>
          </Grid>
        )}
      </Grid>

      <ConfirmModal 
        open={openConfirm}
        handleClose={() => setOpenConfirm(false)}
        onConfirm={modalMode === "DELETE" ? eliminarAmigo : () => gestionarSolicitud("accept")}
        onCancel={()=> gestionarSolicitud("reject")}
        title={modalMode === "DELETE" ? "Eliminar amigo" : "Responder Solicitud"}
        message={
          modalMode === "DELETE" 
          ? `¿Estás seguro de que quieres eliminar a @${visitedUser.name}?`
          : (
            <Box>
              <Typography sx={{mb: 2, color: theme.primaryText}}>@{visitedUser.name} te envió una solicitud:</Typography>
              <Typography sx={{fontStyle: 'italic', background: 'rgba(0,0,0,0.1)', p: 1, borderRadius: 1, color: theme.fieldsText, mb: 2}}>
                "{pendingReqData?.body || 'Sin mensaje'}"
              </Typography>
              <Typography sx={{mb: 2, color: theme.primaryText}}>¿Quieres aceptar la conexión?</Typography>
            </Box>
          )
        }
      />

      <Backdrop sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 100, backgroundColor: "rgba(0, 0, 0, 0.8)" }} open={openZoom} onClick={() => setOpenZoom(false)}>
        <img src={visitedUser.url_image ?? "/no_user_avatar_image.png"} alt="Avatar Zoom" style={{ width: "500px", height: "500px", borderRadius: 1000, boxShadow: "0 0 30px rgba(0,0,0,0.7)" }} />
      </Backdrop>
    </Grid>
  );
}