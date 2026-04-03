import {
  Avatar,
  Button,
  Grid,
  Typography,
  Backdrop,
  CircularProgress,
  Box,
  TextField,
  IconButton,
  Menu,
  MenuItem,
} from "@mui/material";
import React, { useEffect, useState, useContext } from "react";
import { useUser } from "../hooks/useUser";
import InterestItem from "../components/InterestItem";
import { useNavigate, useParams } from "react-router-dom";
import api from "../utils/api";
import { useAppTheme } from "../hooks/useAppTheme";
import GradeIcon from "@mui/icons-material/Grade";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import BlockIcon from "@mui/icons-material/Block";
import LockOpenIcon from "@mui/icons-material/LockOpen";
import ConfirmModal from "../components/ConfirmModal";
import { SocketContext } from "../context/SocketContext";

export default function UserPage() {
  const navigate = useNavigate();
  const { loggedUser } = useUser();
  const { socket } = useContext(SocketContext);
  const [isAvatarZoomed, setIsAvatarZoomed] = useState(false);
  const { id: visitedUserId } = useParams();
  const isOwnProfile = String(loggedUser?.id) === String(visitedUserId);
  const theme = useAppTheme();

  const [visitedUser, setVisitedUser] = useState({});
  const [userInterests, setUserInterests] = useState([]);
  const [activeConnectionId, setActiveConnectionId] = useState(null);
  const [pendingRequestData, setPendingRequestData] = useState(null);
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);
  const [isFriend, setIsFriend] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  const [isBanned, setIsBanned] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [confirmModalMode, setConfirmModalMode] = useState("SEND");
  const [requestBodyText, setRequestBodyText] = useState(
    "Hola, me gustaría conectar contigo.",
  );
  const [reportMotivo, setReportMotivo] = useState("");
  const [moreOptionsAnchor, setMoreOptionsAnchor] = useState(null);
  const isMoreOptionsOpen = Boolean(moreOptionsAnchor);

  const [primaryButtonConfig, setPrimaryButtonConfig] = useState({
    text: "Enviar Solicitud",
    actionType: "SEND",
  });

  const puedeGestionar = () => {
    if (isOwnProfile || !visitedUser.role) return false;
    if (loggedUser?.role === "DEVELOPER" && visitedUser.role !== "DEVELOPER")
      return true;
    if (loggedUser?.role === "ADMIN" && visitedUser.role === "USER")
      return true;
    return false;
  };

  const openMoreOptions = (e) => setMoreOptionsAnchor(e.currentTarget);
  const closeMoreOptions = () => setMoreOptionsAnchor(null);

  const handlePrimaryButtonClick = () => {
    if (primaryButtonConfig.actionType === "SEND") {
      setConfirmModalMode("SEND");
      setIsConfirmModalOpen(true);
    } else if (primaryButtonConfig.actionType === "ACCEPT") {
      setConfirmModalMode("ACCEPT");
      setIsConfirmModalOpen(true);
    } else if (primaryButtonConfig.actionType === "MESSAGE") {
      navigate("/app/chats", {
        state: { openConnectionId: activeConnectionId },
      });
    } else if (primaryButtonConfig.actionType === "UNBLOCK") {
      setConfirmModalMode("UNBLOCK");
      setIsConfirmModalOpen(true);
    }
  };

  const handleConfirmModal = async () => {
    setIsConfirmModalOpen(false);
    setIsButtonDisabled(true);
    try {
      if (confirmModalMode === "SEND") {
        await api.post("/requests", {
          receiver_id: visitedUserId,
          body: requestBodyText,
        });
      } else if (confirmModalMode === "ACCEPT") {
        await api.put(`/requests/${pendingRequestData.id}/accept`);
      } else if (confirmModalMode === "DELETE_FRIEND") {
        await api.put(`/connections/${activeConnectionId}/finish`);
      } else if (confirmModalMode === "BLOCK") {
        await api.put(`/connections/${activeConnectionId}/block`);
      } else if (confirmModalMode === "UNBLOCK") {
        await api.put(`/connections/${activeConnectionId}/activate`);
      } else if (confirmModalMode === "BLOCK_AND_REPORT") {
        await api.put(`/connections/${activeConnectionId}/block`);
        await api.post("/requests/report", {
          body: reportMotivo,
          infoReport: {
            type: "USER",
            user_id: visitedUser.id,
            user_name: visitedUser.name,
            user_email: visitedUser.email,
          },
        });
        setReportMotivo("");
      } else if (confirmModalMode === "BAN") {
        await api.put(`/users/${visitedUserId}/ban`);
        setIsBanned(true);
        return;
      } else if (confirmModalMode === "UNBAN") {
        await api.put(`/users/${visitedUserId}/unban`);
        setIsBanned(false);
        return;
      }
      await refreshButtonState();
    } catch (error) {
      console.error(error);
    } finally {
      setIsButtonDisabled(false);
    }
  };

  const handleCancelOrReject = async () => {
    setIsConfirmModalOpen(false);
    setReportMotivo("");
    if (confirmModalMode === "ACCEPT") {
      setIsButtonDisabled(true);
      try {
        await api.put(`/requests/${pendingRequestData.id}/reject`);
        await refreshButtonState();
      } catch (error) {
        console.error(error);
      } finally {
        setIsButtonDisabled(false);
      }
    }
  };

  const handleDeleteFriend = () => {
    closeMoreOptions();
    setConfirmModalMode("DELETE_FRIEND");
    setIsConfirmModalOpen(true);
  };
  const handleBlock = () => {
    closeMoreOptions();
    setConfirmModalMode("BLOCK");
    setIsConfirmModalOpen(true);
  };
  const handleBlockAndReport = () => {
    closeMoreOptions();
    setReportMotivo("");
    setConfirmModalMode("BLOCK_AND_REPORT");
    setIsConfirmModalOpen(true);
  };
  const handleBan = () => {
    closeMoreOptions();
    setConfirmModalMode("BAN");
    setIsConfirmModalOpen(true);
  };
  const handleUnban = () => {
    closeMoreOptions();
    setConfirmModalMode("UNBAN");
    setIsConfirmModalOpen(true);
  };

  const refreshButtonState = async () => {
    if (!visitedUserId || isOwnProfile) return;
    try {
      setIsButtonDisabled(true);
      const friendshipRes = await api.get(
        "/connections/check/" + visitedUserId,
      );
      if (friendshipRes.data.exists) {
        setActiveConnectionId(friendshipRes.data.connection_id);
        if (friendshipRes.data.status === "BLOCKED") {
          const blockedByMe = friendshipRes.data.blocked_by === loggedUser.id;
          setIsFriend(false);
          setIsBlocked(true);
          if (blockedByMe) {
            setPrimaryButtonConfig({
              text: "Desbloquear usuario",
              actionType: "UNBLOCK",
            });
          } else {
            setPrimaryButtonConfig({
              text: "Usuario no disponible",
              actionType: "NONE",
            });
          }
        } else {
          setIsFriend(true);
          setIsBlocked(false);
          setPrimaryButtonConfig({
            text: "Enviar mensaje",
            actionType: "MESSAGE",
          });
        }
      } else {
        setIsFriend(false);
        setIsBlocked(false);
        setActiveConnectionId(null);
        const pendingRes = await api.get(
          "/requests/check-pending/" + visitedUserId,
        );
        if (pendingRes.data.exists) {
          setPendingRequestData(pendingRes.data.data);
          setPrimaryButtonConfig(
            pendingRes.data.type === "SENT"
              ? { text: "Solicitud Pendiente", actionType: "NONE" }
              : { text: "Responder Solicitud", actionType: "ACCEPT" },
          );
        } else {
          setPrimaryButtonConfig({
            text: "Enviar Solicitud",
            actionType: "SEND",
          });
        }
      }
    } catch (error) {
      console.error("Error comprobando estado:", error);
    } finally {
      setIsButtonDisabled(false);
    }
  };

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        if (isOwnProfile) {
          setVisitedUser(loggedUser);
        } else {
          const userRes = await api.get("/users/" + visitedUserId);
          const userData = userRes.data.usuario || userRes.data;
          setVisitedUser(userData);
          setIsBanned(userData.banned === true || userData.banned === 1);
        }
        const interestsRes = await api.get(`/users/${visitedUserId}/interests`);
        setUserInterests(interestsRes.data.datos || []);
        await refreshButtonState();
      } catch (error) {
        console.error(error);
      }
    };

    fetchInitialData();

    if (socket) {
      const onNewRequest = (payload) => {
        const senderId = payload.data?.sender_id || payload.sender_id;
        const receiverId = payload.data?.receiver_id || payload.receiver_id;
        if (
          String(senderId) === String(visitedUserId) &&
          String(receiverId) === String(loggedUser?.id)
        ) {
          refreshButtonState();
        }
      };
      socket.on("nueva_solicitud", onNewRequest);
      return () => socket.off("nueva_solicitud", onNewRequest);
    }
  }, [visitedUserId, socket, loggedUser?.id, isOwnProfile]);

  const getConfirmModalTitle = () => {
    switch (confirmModalMode) {
      case "SEND":
        return "Enviar solicitud";
      case "ACCEPT":
        return "Responder solicitud";
      case "DELETE_FRIEND":
        return "Eliminar amigo";
      case "BLOCK":
        return "Bloquear usuario";
      case "UNBLOCK":
        return "Desbloquear usuario";
      case "BLOCK_AND_REPORT":
        return "Bloquear y reportar";
      case "BAN":
        return "Banear usuario";
      case "UNBAN":
        return "Desbanear usuario";
      default:
        return "";
    }
  };

  const getConfirmModalMessage = () => {
    switch (confirmModalMode) {
      case "SEND":
        return (
          <Box sx={{ pt: 1 }}>
            <Typography sx={{ mb: 2 }}>
              Personaliza tu mensaje para @{visitedUser.name}:
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={3}
              value={requestBodyText}
              onChange={(e) => setRequestBodyText(e.target.value)}
            />
          </Box>
        );
      case "DELETE_FRIEND":
        return `¿Estás seguro de que quieres eliminar tu amistad con @${visitedUser.name}?`;
      case "BLOCK":
        return `¿Estás seguro de que quieres bloquear a @${visitedUser.name}? Ya no podrá contactarte.`;
      case "UNBLOCK":
        return `¿Quieres desbloquear a @${visitedUser.name}?`;
      case "BAN":
        return (
          <Box sx={{ pt: 1 }}>
            <Typography sx={{ mb: 1 }}>
              ¿Estás seguro de que quieres banear a{" "}
              <strong>@{visitedUser.name}</strong>?
            </Typography>
            <Typography sx={{ fontSize: "0.85rem", color: "#f44336" }}>
              Esta acción impedirá al usuario acceder a la plataforma hasta que
              sea desbaneado.
            </Typography>
          </Box>
        );
      case "UNBAN":
        return (
          <Box sx={{ pt: 1 }}>
            <Typography sx={{ mb: 1 }}>
              ¿Quieres desbanear a <strong>@{visitedUser.name}</strong>?
            </Typography>
            <Typography
              sx={{ fontSize: "0.85rem", color: theme.secondaryText }}
            >
              El usuario recuperará el acceso completo a la plataforma.
            </Typography>
          </Box>
        );
      case "BLOCK_AND_REPORT":
        return (
          <Box sx={{ pt: 1 }}>
            <Typography sx={{ mb: 1 }}>
              Se bloqueará a <strong>@{visitedUser.name}</strong> y se enviará
              un reporte al equipo de administración.
            </Typography>
            <Typography
              sx={{ mb: 2, fontSize: "0.85rem", color: theme.secondaryText }}
            >
              Describe el motivo del reporte:
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={3}
              placeholder="Describe por qué reportas a este usuario..."
              value={reportMotivo}
              onChange={(e) => setReportMotivo(e.target.value)}
            />
          </Box>
        );
      case "ACCEPT":
        return (
          <Box>
            <Typography>@{visitedUser.name} dice:</Typography>
            <Typography
              sx={{
                fontStyle: "italic",
                my: 2,
                p: 1,
                bgcolor: "action.hover",
                borderRadius: 1,
              }}
            >
              "{pendingRequestData?.body || "Sin mensaje"}"
            </Typography>
            <Typography>¿Quieres aceptar la conexión?</Typography>
          </Box>
        );
      default:
        return "";
    }
  };

  return (
    <Grid
      container
      maxWidth="xxl"
      justifyContent="center"
      sx={{ minHeight: "100%" }}
    >
      <Grid
        container
        direction="column"
        spacing={2}
        size={{ xs: 12, md: 9 }}
        sx={{ background: theme.secondaryBack, p: 3 }}
      >
        <Grid size={{ xs: 12 }}>
          <Grid
            sx={{
              background: isBanned ? "#f44336" : theme.primaryBack,
              borderRadius: "12px 12px 0 0",
              height: "12px",
            }}
          />
          <Grid
            container
            spacing={2}
            justifyContent="end"
            sx={{
              background: theme.tertiaryBack,
              borderRadius: "0 0 12px 12px",
              p: 3,
            }}
          >
            <Grid
              container
              direction="row"
              size={{ xs: 12 }}
              spacing={2}
              alignItems="flex-start"
            >
              <Grid>
                <Avatar
                  src={visitedUser.url_image ?? "/no_user_avatar_image.png"}
                  onClick={() => setIsAvatarZoomed(true)}
                  sx={{
                    width: 90,
                    height: 90,
                    border: theme.primaryBack + " solid 3px",
                    cursor: "pointer",
                    filter: isBanned ? "grayscale(100%)" : "none",
                    opacity: isBanned ? 0.6 : 1,
                  }}
                />
              </Grid>

              <Grid
                container
                direction="column"
                size={{ xs: "grow" }}
                spacing={0.5}
              >
                <Box display="flex" alignItems="center" gap={1} flexWrap="wrap">
                  <Typography
                    sx={{
                      fontWeight: "bold",
                      fontSize: "1.4rem",
                      color: theme.primaryText,
                    }}
                  >
                    @{visitedUser.name}{" "}
                    {visitedUser.role === "ADMIN" && (
                      <GradeIcon
                        sx={{ color: "#FFD700", fontSize: "1rem", ml: 0.5 }}
                      />
                    )}
                    {visitedUser.role === "DEVELOPER" && (
                      <GradeIcon
                        sx={{ color: "#00bcd4", fontSize: "1rem", ml: 0.5 }}
                      />
                    )}
                  </Typography>
                  {isBanned && (
                    <Box
                      display="flex"
                      alignItems="center"
                      gap={0.5}
                      sx={{
                        background: "rgba(244,67,54,0.1)",
                        border: "1px solid rgba(244,67,54,0.3)",
                        borderRadius: "8px",
                        px: 1,
                        py: 0.25,
                      }}
                    >
                      <BlockIcon sx={{ fontSize: 12, color: "#f44336" }} />
                      <Typography
                        sx={{
                          fontSize: "0.72rem",
                          color: "#f44336",
                          fontWeight: 600,
                        }}
                      >
                        BANEADO
                      </Typography>
                    </Box>
                  )}
                </Box>
                {isOwnProfile && (
                  <Typography
                    sx={{ color: theme.secondaryText, fontSize: "0.9rem" }}
                  >
                    {visitedUser.email}
                  </Typography>
                )}
                <Typography
                  sx={{ color: theme.fieldsText, fontSize: "0.9rem" }}
                >
                  {visitedUser.connections_count || 0} Conexiones
                </Typography>
              </Grid>

              <Grid
                container
                direction="column"
                alignItems="flex-end"
                justifyContent="space-between"
                size={{ xs: "grow" }}
              >
                <Typography
                  sx={{ color: theme.secondaryText, fontSize: "0.85rem" }}
                >
                  Se unió el{" "}
                  {visitedUser.created_at &&
                    new Date(visitedUser.created_at).toLocaleDateString(
                      "es-ES",
                      { day: "numeric", month: "long", year: "numeric" },
                    )}
                </Typography>

                {!isOwnProfile ? (
                  <Box display="flex" alignItems="center" gap={1} mt={1}>
                    {!isBanned && (
                      <Button
                        variant="contained"
                        disabled={
                          isButtonDisabled ||
                          primaryButtonConfig.actionType === "NONE"
                        }
                        sx={{ background: theme.variantBack, borderRadius: 2 }}
                        onClick={handlePrimaryButtonClick}
                      >
                        {isButtonDisabled ? (
                          <CircularProgress size={20} color="inherit" />
                        ) : (
                          primaryButtonConfig.text
                        )}
                      </Button>
                    )}

                    {(isFriend || puedeGestionar()) && (
                      <>
                        <IconButton
                          onClick={openMoreOptions}
                          size="small"
                          sx={{ color: theme.primaryText }}
                        >
                          <MoreVertIcon />
                        </IconButton>
                        <Menu
                          anchorEl={moreOptionsAnchor}
                          open={isMoreOptionsOpen}
                          onClose={closeMoreOptions}
                          anchorOrigin={{
                            vertical: "bottom",
                            horizontal: "right",
                          }}
                          transformOrigin={{
                            vertical: "top",
                            horizontal: "right",
                          }}
                          PaperProps={{
                            sx: {
                              borderRadius: "12px",
                              background: theme.secondaryBack,
                              border: `1px solid ${theme.primaryBack}30`,
                              boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                              minWidth: 180,
                            },
                          }}
                        >
                          {isFriend && !isBanned && (
                            <MenuItem
                              onClick={handleDeleteFriend}
                              sx={{
                                color: theme.primaryText,
                                fontSize: "0.875rem",
                                py: 1.25,
                              }}
                            >
                              Eliminar amigo
                            </MenuItem>
                          )}
                          {isFriend && !isBanned && (
                            <MenuItem
                              onClick={handleBlock}
                              sx={{
                                color: theme.primaryText,
                                fontSize: "0.875rem",
                                py: 1.25,
                              }}
                            >
                              Bloquear
                            </MenuItem>
                          )}
                          {isFriend && !isBanned && (
                            <MenuItem
                              onClick={handleBlockAndReport}
                              sx={{
                                color: "#f44336",
                                fontSize: "0.875rem",
                                py: 1.25,
                              }}
                            >
                              Bloquear y reportar
                            </MenuItem>
                          )}
                          {puedeGestionar() && !isBanned && (
                            <MenuItem
                              onClick={handleBan}
                              sx={{
                                color: "#f44336",
                                fontSize: "0.875rem",
                                py: 1.25,
                                borderTop: isFriend
                                  ? `1px solid ${theme.primaryBack}20`
                                  : "none",
                              }}
                            >
                              <BlockIcon sx={{ fontSize: 16, mr: 1 }} /> Banear
                              usuario
                            </MenuItem>
                          )}
                          {puedeGestionar() && isBanned && (
                            <MenuItem
                              onClick={handleUnban}
                              sx={{
                                color: "#4caf50",
                                fontSize: "0.875rem",
                                py: 1.25,
                              }}
                            >
                              <LockOpenIcon sx={{ fontSize: 16, mr: 1 }} />{" "}
                              Desbanear usuario
                            </MenuItem>
                          )}
                        </Menu>
                      </>
                    )}
                  </Box>
                ) : (
                  <Button
                    variant="contained"
                    sx={{
                      mt: 1,
                      background: theme.variantBack,
                      borderRadius: 2,
                    }}
                    onClick={() => navigate("/app/user/edit")}
                  >
                    Editar perfil
                  </Button>
                )}
              </Grid>
            </Grid>
          </Grid>
        </Grid>

        {visitedUser.bio && (
          <Grid size={{ xs: 12 }} sx={{ mt: 2 }}>
            <Typography
              sx={{ fontWeight: "bold", mb: 1, color: theme.primaryText }}
            >
              Sobre mí:
            </Typography>
            <Box
              sx={{ background: theme.secondaryBack, p: 2, borderRadius: 3 }}
            >
              <Typography
                sx={{ whiteSpace: "pre-wrap", color: theme.fieldsText }}
              >
                {visitedUser.bio}
              </Typography>
            </Box>
          </Grid>
        )}

        {userInterests.length > 0 && (
          <Grid size={{ xs: 12 }} sx={{ mt: 2 }}>
            <Box sx={{ background: theme.primaryBack, borderRadius: 12, p: 3 }}>
              <Typography
                sx={{ fontWeight: "bold", color: theme.variantText, mb: 1 }}
              >
                Intereses
              </Typography>
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
            <Typography
              sx={{ fontWeight: "bold", mb: 1, color: theme.primaryText }}
            >
              Objetivos personales
            </Typography>
            <Box sx={{ background: theme.tertiaryBack, p: 2, borderRadius: 3 }}>
              <Typography
                sx={{ whiteSpace: "pre-wrap", color: theme.fieldsText }}
              >
                {visitedUser.goals}
              </Typography>
            </Box>
          </Grid>
        )}

        {visitedUser.short_sentece &&
          visitedUser.short_sentece.trim() !== "" && (
            <Grid size={{ xs: 12 }} sx={{ mt: 2 }}>
              <Typography
                sx={{ fontWeight: "bold", mb: 1, color: theme.primaryText }}
              >
                Frase pública
              </Typography>
              <Box
                sx={{ background: theme.tertiaryBack, p: 2, borderRadius: 3 }}
              >
                <Typography sx={{ color: theme.fieldsText }}>
                  {visitedUser.short_sentece}
                </Typography>
              </Box>
            </Grid>
          )}
      </Grid>

      <ConfirmModal
        open={isConfirmModalOpen}
        handleClose={() => {
          setIsConfirmModalOpen(false);
          setReportMotivo("");
        }}
        onConfirm={handleConfirmModal}
        onCancel={handleCancelOrReject}
        title={getConfirmModalTitle()}
        message={getConfirmModalMessage()}
      />

      <Backdrop
        sx={{ zIndex: 9999 }}
        open={isAvatarZoomed}
        onClick={() => setIsAvatarZoomed(false)}
      >
        <img
          src={visitedUser.url_image ?? "/no_user_avatar_image.png"}
          style={{ width: "500px", borderRadius: "50%" }}
          alt="Zoom"
        />
      </Backdrop>
    </Grid>
  );
}
