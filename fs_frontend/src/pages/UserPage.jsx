import React, { useEffect, useState, useContext, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Avatar,
  Button,
  Typography,
  Backdrop,
  CircularProgress,
  Box,
  TextField,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from "@mui/material";
import {
  Grade as GradeIcon,
  MoreVert as MoreVertIcon,
  Block as BlockIcon,
  LockOpen as LockOpenIcon,
  People as PeopleIcon,
  CalendarToday as CalendarTodayIcon,
  Flag as FlagIcon,
  Close as CloseIcon,
} from "@mui/icons-material";
import { useUser } from "../hooks/useUser";
import { useAppTheme } from "../hooks/useAppTheme";
import api from "../utils/api";
import { SocketContext } from "../context/SocketContext";
import InterestItem from "../components/InterestItem";
import ConfirmModal from "../components/ConfirmModal";

export default function UserPage() {
  const { id: visitedUserId } = useParams();
  const navigate = useNavigate();
  const { loggedUser } = useUser();
  const { socket } = useContext(SocketContext);
  const theme = useAppTheme();

  const isOwnProfile = String(loggedUser?.id) === String(visitedUserId);
  const accent = theme.accent || theme.primaryBack;
  const isDark = theme.name === "dark";

  const [visitedUser, setVisitedUser] = useState({});
  const [userInterests, setUserInterests] = useState([]);
  const [activeConnectionId, setActiveConnectionId] = useState(null);
  const [pendingRequestData, setPendingRequestData] = useState(null);
  const [isButtonLoading, setIsButtonLoading] = useState(false);
  const [isFriend, setIsFriend] = useState(false);
  const [isBanned, setIsBanned] = useState(false);
  const [isAvatarZoomed, setIsAvatarZoomed] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [confirmModalMode, setConfirmModalMode] = useState("SEND");
  const [requestBodyText, setRequestBodyText] = useState(
    "Hola, me gustaría conectar contigo.",
  );
  const [moreOptionsAnchor, setMoreOptionsAnchor] = useState(null);
  const [primaryButton, setPrimaryButton] = useState({
    text: "Enviar Solicitud",
    type: "SEND",
  });
  const [reportConnectionId, setReportConnectionId] = useState(null);

  const isMoreOptionsOpen = Boolean(moreOptionsAnchor);
  const visitedUserIsAdminOrDev =
    visitedUser?.role === "ADMIN" || visitedUser?.role === "DEVELOPER";
  const currentUserIsAdminOrDev =
    loggedUser?.role === "ADMIN" || loggedUser?.role === "DEVELOPER";
  const loggedUserIsNormalUser = loggedUser?.role === "USER";

  const [blockReportDialog, setBlockReportDialog] = useState(false);
  const [blockReportMotivo, setBlockReportMotivo] = useState("");
  const [blockReportSending, setBlockReportSending] = useState(false);

  const puedeGestionar = () => {
    if (isOwnProfile || !visitedUser.role) return false;
    const roles = { DEVELOPER: 3, ADMIN: 2, USER: 1 };
    return roles[loggedUser?.role] > roles[visitedUser?.role];
  };

  const refreshButtonState = useCallback(async () => {
    if (isOwnProfile) return;
    try {
      setIsButtonLoading(true);
      if (visitedUserIsAdminOrDev && loggedUserIsNormalUser) {
        const { data: pending } = await api.get(
          `/requests/check-pending/${visitedUserId}`,
        );
        if (
          pending.exists &&
          pending.data?.is_report &&
          pending.data?.connection_id
        )
          setReportConnectionId(pending.data.connection_id);
        else setReportConnectionId(null);
        return;
      }
      const { data: friendship } = await api.get(
        `/connections/check/${visitedUserId}`,
      );
      if (friendship.exists) {
        setActiveConnectionId(friendship.connection_id);
        if (friendship.status === "BLOCKED") {
          const blockedByMe = friendship.blocked_by === loggedUser.id;
          setIsFriend(false);
          setPrimaryButton(
            blockedByMe
              ? { text: "Desbloquear usuario", type: "UNBLOCK" }
              : { text: "Usuario no disponible", type: "NONE" },
          );
        } else {
          setIsFriend(true);
          setPrimaryButton({ text: "Enviar mensaje", type: "MESSAGE" });
        }
      } else {
        setIsFriend(false);
        const { data: pending } = await api.get(
          `/requests/check-pending/${visitedUserId}`,
        );
        if (pending.exists) {
          setPendingRequestData(pending.data);
          setPrimaryButton(
            pending.type === "SENT"
              ? { text: "Solicitud Pendiente", type: "NONE" }
              : { text: "Responder Solicitud", type: "ACCEPT" },
          );
        } else setPrimaryButton({ text: "Enviar Solicitud", type: "SEND" });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsButtonLoading(false);
    }
  }, [
    visitedUserId,
    isOwnProfile,
    loggedUser?.id,
    visitedUserIsAdminOrDev,
    loggedUserIsNormalUser,
  ]);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const { data } = await api.get(`/users/${visitedUserId}`);
        const user = data.usuario || data;
        setVisitedUser(user);
        setIsBanned(!!user.banned);
        const { data: ints } = await api.get(
          `/users/${visitedUserId}/interests`,
        );
        setUserInterests(ints.datos || []);
        refreshButtonState();
      } catch (e) {}
    };
    loadUser();
    if (socket) {
      const handleNuevaSolicitud = (payload) => {
        const data = payload.data || payload;
        if (
          String(data.sender_id) === String(visitedUserId) ||
          String(data.receiver_id) === String(visitedUserId)
        )
          refreshButtonState();
      };
      const handleConexionBloqueada = ({ connectionId }) => {
        refreshButtonState();
      };
      const handleConexionActivada = ({ connectionId }) => {
        refreshButtonState();
      };
      socket.on("nueva_solicitud", handleNuevaSolicitud);
      socket.on("conexion_bloqueada", handleConexionBloqueada);
      socket.on("conexion_activada", handleConexionActivada);
      return () => {
        socket.off("nueva_solicitud", handleNuevaSolicitud);
        socket.off("conexion_bloqueada", handleConexionBloqueada);
        socket.off("conexion_activada", handleConexionActivada);
      };
    }
  }, [visitedUserId, socket, refreshButtonState]);

  const handleAction = async () => {
    setIsConfirmModalOpen(false);
    setIsButtonLoading(true);
    try {
      switch (confirmModalMode) {
        case "SEND":
          await api.post("/requests", {
            receiver_id: visitedUserId,
            body: requestBodyText,
          });
          break;
        case "ACCEPT":
          await api.put(`/requests/${pendingRequestData.id}/accept`);
          break;
        case "DELETE_FRIEND":
          await api.put(`/connections/${activeConnectionId}/finish`);
          break;
        case "BLOCK":
          await api.put(`/connections/${activeConnectionId}/block`);
          break;
        case "UNBLOCK":
          await api.put(`/connections/${activeConnectionId}/activate`);
          break;
        case "BAN":
          await api.put(`/users/${visitedUserId}/ban`);
          setIsBanned(true);
          break;
        case "UNBAN":
          await api.put(`/users/${visitedUserId}/unban`);
          setIsBanned(false);
          break;
        default:
          break;
      }
      await refreshButtonState();
    } catch (e) {
    } finally {
      setIsButtonLoading(false);
    }
  };

  const handleBlockAndReport = async () => {
    if (!blockReportMotivo.trim()) return;
    setBlockReportSending(true);
    try {
      await api.put(`/connections/${activeConnectionId}/block`);
      await api.post("/requests/report", {
        body: blockReportMotivo.trim(),
        infoReport: {
          type: "USER",
          user_id: visitedUser.id,
          user_name: visitedUser.name,
        },
      });
      setBlockReportDialog(false);
      setBlockReportMotivo("");
      await refreshButtonState();
    } catch (e) {
    } finally {
      setBlockReportSending(false);
    }
  };

  const getModalContent = () => {
    const cfg = {
      SEND: {
        title: "Enviar solicitud",
        msg: (
          <Box sx={{ pt: 1 }}>
            <Typography mb={2}>Mensaje para @{visitedUser.name}:</Typography>
            <TextField
              fullWidth
              multiline
              rows={3}
              value={requestBodyText}
              onChange={(e) => setRequestBodyText(e.target.value)}
            />
          </Box>
        ),
      },
      ACCEPT: {
        title: "Responder solicitud",
        msg: (
          <Box>
            <Typography>@{visitedUser.name} dice:</Typography>
            <Typography
              sx={{
                fontStyle: "italic",
                my: 2,
                p: 1.5,
                bgcolor: theme.tertiaryBack,
                borderRadius: 2,
                borderLeft: `3px solid ${accent}`,
              }}
            >
              "{pendingRequestData?.body || "Sin mensaje"}"
            </Typography>
            <Typography>¿Quieres aceptar la conexión?</Typography>
          </Box>
        ),
      },
      DELETE_FRIEND: {
        title: "Eliminar amigo",
        msg: `¿Eliminar amistad con @${visitedUser.name}?`,
      },
      BLOCK: {
        title: "Bloquear usuario",
        msg: `¿Bloquear a @${visitedUser.name}? No podrá contactarte.`,
      },
      BAN: {
        title: "Banear usuario",
        msg: `¿Suspender a @${visitedUser.name}?`,
      },
      UNBAN: {
        title: "Desbanear usuario",
        msg: `¿Restaurar acceso a @${visitedUser.name}?`,
      },
      UNBLOCK: {
        title: "Desbloquear",
        msg: `¿Permitir contacto de @${visitedUser.name}?`,
      },
    };
    return cfg[confirmModalMode] || { title: "", msg: "" };
  };

  const Section = ({ title, children, empty, emptyMsg }) => (
    <Box
      sx={{
        mb: 2,
        p: 2.5,
        borderRadius: "16px",
        bgcolor: theme.secondaryBack,
        border: `1px solid ${accent}15`,
      }}
    >
      <Typography
        sx={{
          fontWeight: 700,
          fontSize: "0.75rem",
          color: accent,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          mb: 1,
        }}
      >
        {title}
      </Typography>
      {empty ? (
        <Typography
          sx={{
            color: theme.mutedText,
            fontSize: "0.875rem",
            fontStyle: "italic",
          }}
        >
          {emptyMsg}
        </Typography>
      ) : (
        children
      )}
    </Box>
  );

  return (
    <Box
      sx={{
        maxWidth: 960,
        mx: "auto",
        width: "100%",
        px: { xs: 2, md: 4 },
        py: { xs: 2, md: 4 },
        pb: { xs: 3, md: 4 },
      }}
    >
      <Box
        sx={{
          borderRadius: "20px",
          overflow: "hidden",
          bgcolor: theme.secondaryBack,
          border: `1px solid ${isBanned ? "#f4433650" : accent + "20"}`,
          mb: 2,
        }}
      >
        <Box
          sx={{
            height: { xs: 70, md: 100 },
            background: isBanned
              ? "linear-gradient(135deg, #f4433640, #f4433610)"
              : `linear-gradient(135deg, ${accent}25, ${accent}05)`,
          }}
        />
        <Box sx={{ px: { xs: 2, md: 3 }, pb: 3 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-end",
              mt: { xs: "-35px", md: "-45px" },
              mb: 2,
            }}
          >
            <Avatar
              src={visitedUser.url_image ?? "/no_user_avatar_image.png"}
              onClick={() => setIsAvatarZoomed(true)}
              sx={{
                width: { xs: 70, md: 90 },
                height: { xs: 70, md: 90 },
                border: `4px solid ${theme.secondaryBack}`,
                boxShadow: `0 4px 16px ${accent}30`,
                cursor: "pointer",
                filter: isBanned ? "grayscale(100%)" : "none",
                transition: "transform 0.2s",
                "&:hover": { transform: "scale(1.05)" },
              }}
            />
            <Box display="flex" gap={1}>
              {!isOwnProfile ? (
                <>
                  {visitedUserIsAdminOrDev && loggedUserIsNormalUser ? (
                    reportConnectionId && (
                      <Button
                        variant="contained"
                        onClick={() =>
                          navigate("/app/chats", {
                            state: { openConnectionId: reportConnectionId },
                          })
                        }
                        sx={{
                          background: `linear-gradient(135deg, ${accent}, ${theme.variantBack || accent})`,
                          color: isDark ? "#1a1200" : "#ffffff",
                          borderRadius: "10px",
                          textTransform: "none",
                          fontWeight: 600,
                          boxShadow: `0 4px 12px ${accent}40`,
                          "&:hover": { opacity: 0.9 },
                          fontSize: { xs: "0.78rem", md: "0.875rem" },
                        }}
                      >
                        Ir al chat de investigación
                      </Button>
                    )
                  ) : (
                    <>
                      {!isBanned && (
                        <Button
                          variant="contained"
                          disabled={
                            isButtonLoading || primaryButton.type === "NONE"
                          }
                          onClick={() => {
                            if (primaryButton.type === "MESSAGE")
                              navigate("/app/chats", {
                                state: { openConnectionId: activeConnectionId },
                              });
                            else {
                              setConfirmModalMode(primaryButton.type);
                              setIsConfirmModalOpen(true);
                            }
                          }}
                          sx={{
                            background: `linear-gradient(135deg, ${accent}, ${theme.variantBack || accent})`,
                            color: isDark ? "#1a1200" : "#ffffff",
                            borderRadius: "10px",
                            textTransform: "none",
                            fontWeight: 600,
                            boxShadow: `0 4px 12px ${accent}40`,
                            "&:hover": { opacity: 0.9 },
                            "&.Mui-disabled": {
                              background: theme.tertiaryBack,
                              color: theme.mutedText,
                            },
                            fontSize: { xs: "0.78rem", md: "0.875rem" },
                          }}
                        >
                          {isButtonLoading ? (
                            <CircularProgress
                              size={20}
                              sx={{ color: "inherit" }}
                            />
                          ) : (
                            primaryButton.text
                          )}
                        </Button>
                      )}
                      {(isFriend || puedeGestionar()) && (
                        <>
                          <IconButton
                            onClick={(e) =>
                              setMoreOptionsAnchor(e.currentTarget)
                            }
                            sx={{
                              border: `1px solid ${accent}25`,
                              borderRadius: "8px",
                              color: theme.mutedText,
                              "&:hover": { color: accent },
                            }}
                          >
                            <MoreVertIcon />
                          </IconButton>
                          <Menu
                            anchorEl={moreOptionsAnchor}
                            open={isMoreOptionsOpen}
                            onClose={() => setMoreOptionsAnchor(null)}
                            PaperProps={{
                              sx: {
                                minWidth: 180,
                                borderRadius: "12px",
                                background: theme.secondaryBack,
                                border: `1px solid ${accent}20`,
                              },
                            }}
                          >
                            {isFriend &&
                              !isBanned &&
                              !visitedUserIsAdminOrDev && (
                                <MenuItem
                                  onClick={() => {
                                    setConfirmModalMode("DELETE_FRIEND");
                                    setIsConfirmModalOpen(true);
                                    setMoreOptionsAnchor(null);
                                  }}
                                  sx={{
                                    color: theme.primaryText,
                                    "&:hover": { color: accent },
                                  }}
                                >
                                  Eliminar amigo
                                </MenuItem>
                              )}
                            {isFriend &&
                              !isBanned &&
                              !visitedUserIsAdminOrDev && (
                                <MenuItem
                                  onClick={() => {
                                    setConfirmModalMode("BLOCK");
                                    setIsConfirmModalOpen(true);
                                    setMoreOptionsAnchor(null);
                                  }}
                                  sx={{
                                    color: theme.primaryText,
                                    "&:hover": { color: accent },
                                  }}
                                >
                                  Bloquear
                                </MenuItem>
                              )}
                            {isFriend &&
                              !isBanned &&
                              !visitedUserIsAdminOrDev &&
                              !currentUserIsAdminOrDev && (
                                <MenuItem
                                  onClick={() => {
                                    setMoreOptionsAnchor(null);
                                    setBlockReportDialog(true);
                                  }}
                                  sx={{ color: "#f44336" }}
                                >
                                  Bloquear y reportar
                                </MenuItem>
                              )}
                            {puedeGestionar() && (
                              <MenuItem
                                onClick={() => {
                                  setConfirmModalMode(
                                    isBanned ? "UNBAN" : "BAN",
                                  );
                                  setIsConfirmModalOpen(true);
                                  setMoreOptionsAnchor(null);
                                }}
                                sx={{ color: isBanned ? "#4caf50" : "#f44336" }}
                              >
                                {isBanned ? (
                                  <>
                                    <LockOpenIcon
                                      sx={{ fontSize: 15, mr: 1 }}
                                    />
                                    Desbanear
                                  </>
                                ) : (
                                  <>
                                    <BlockIcon sx={{ fontSize: 15, mr: 1 }} />
                                    Banear
                                  </>
                                )}{" "}
                                usuario
                              </MenuItem>
                            )}
                          </Menu>
                        </>
                      )}
                    </>
                  )}
                </>
              ) : (
                <Button
                  variant="outlined"
                  onClick={() => navigate("/app/user/edit")}
                  sx={{
                    borderColor: `${accent}50`,
                    color: accent,
                    borderRadius: "10px",
                    textTransform: "none",
                    fontWeight: 600,
                    fontSize: { xs: "0.78rem", md: "0.875rem" },
                    "&:hover": {
                      borderColor: accent,
                      background: `${accent}10`,
                    },
                  }}
                >
                  Editar perfil
                </Button>
              )}
            </Box>
          </Box>

          <Box display="flex" alignItems="center" gap={1} mb={1}>
            <Typography
              variant="h5"
              fontWeight={800}
              sx={{
                color: theme.primaryText,
                fontSize: { xs: "1.2rem", md: "1.5rem" },
              }}
            >
              @{visitedUser.name}
            </Typography>
            {visitedUser.role !== "USER" && (
              <GradeIcon
                sx={{
                  color: visitedUser.role === "ADMIN" ? "#FFD700" : "#00bcd4",
                }}
              />
            )}
            {isBanned && (
              <Box
                sx={{
                  bgcolor: "#f4433620",
                  color: "#f44336",
                  px: 1,
                  borderRadius: "6px",
                  fontSize: "0.7rem",
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  gap: 0.5,
                }}
              >
                <BlockIcon sx={{ fontSize: 11 }} /> SUSPENDIDO
              </Box>
            )}
          </Box>

          {isOwnProfile && (
            <Typography
              sx={{ color: theme.mutedText, fontSize: "0.85rem", mb: 0.5 }}
            >
              {visitedUser.email}
            </Typography>
          )}

          <Box display="flex" gap={2} sx={{ color: theme.mutedText }}>
            <Box display="flex" alignItems="center" gap={0.5}>
              <PeopleIcon sx={{ fontSize: 15 }} />
              <Typography variant="caption">
                <strong style={{ color: theme.primaryText }}>
                  {visitedUser.connections_count || 0}
                </strong>{" "}
                conexiones
              </Typography>
            </Box>
            <Box display="flex" alignItems="center" gap={0.5}>
              <CalendarTodayIcon sx={{ fontSize: 13 }} />
              <Typography variant="caption">
                Desde{" "}
                {visitedUser.created_at
                  ? new Date(visitedUser.created_at).getFullYear()
                  : "..."}
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>

      <Section
        title="Sobre mí"
        empty={!visitedUser.bio}
        emptyMsg={
          isOwnProfile
            ? "No has definido una descripción todavía."
            : "Este usuario no ha definido una descripción."
        }
      >
        <Typography
          sx={{
            whiteSpace: "pre-wrap",
            color: theme.fieldsText,
            lineHeight: 1.7,
          }}
        >
          {visitedUser.bio}
        </Typography>
      </Section>
      <Section
        title="Intereses"
        empty={userInterests.length === 0}
        emptyMsg={
          isOwnProfile
            ? "No has añadido ningún interés todavía."
            : "Este usuario no ha añadido intereses."
        }
      >
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75 }}>
          {userInterests.map((i) => (
            <InterestItem
              key={i.id}
              title={i.interest?.name || i.name}
              variant="deselect"
            />
          ))}
        </Box>
      </Section>
      <Section
        title="Objetivos personales"
        empty={!visitedUser.goals}
        emptyMsg={
          isOwnProfile
            ? "No has definido tus objetivos todavía."
            : "Este usuario no ha definido sus objetivos."
        }
      >
        <Typography
          sx={{
            whiteSpace: "pre-wrap",
            color: theme.fieldsText,
            lineHeight: 1.7,
          }}
        >
          {visitedUser.goals}
        </Typography>
      </Section>
      <Section
        title="Frase pública"
        empty={!visitedUser.short_sentece?.trim()}
        emptyMsg={
          isOwnProfile
            ? "No has definido una frase pública todavía."
            : "Este usuario no ha definido una frase pública."
        }
      >
        <Typography
          sx={{
            fontStyle: "italic",
            color: theme.fieldsText,
            borderLeft: `3px solid ${accent}40`,
            pl: 2,
            lineHeight: 1.6,
          }}
        >
          "{visitedUser.short_sentece}"
        </Typography>
      </Section>

      <ConfirmModal
        open={isConfirmModalOpen}
        handleClose={() => setIsConfirmModalOpen(false)}
        onConfirm={handleAction}
        title={getModalContent().title}
        message={getModalContent().msg}
      />

      <Dialog
        open={blockReportDialog}
        onClose={() => {
          setBlockReportDialog(false);
          setBlockReportMotivo("");
        }}
        PaperProps={{
          sx: {
            borderRadius: "16px",
            background: theme.secondaryBack,
            border: `1px solid ${accent}20`,
            minWidth: { xs: "90vw", sm: 380 },
          },
        }}
      >
        <DialogTitle sx={{ color: theme.primaryText, fontWeight: 700, pb: 1 }}>
          <Box display="flex" alignItems="center" gap={1}>
            <FlagIcon sx={{ color: "#f44336", fontSize: 20 }} />
            Bloquear y reportar
            <Box sx={{ flex: 1 }} />
            <IconButton
              size="small"
              onClick={() => {
                setBlockReportDialog(false);
                setBlockReportMotivo("");
              }}
              sx={{ color: theme.mutedText }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <DialogContentText
            sx={{ color: theme.mutedText, fontSize: "0.875rem", mb: 2 }}
          >
            Indica el motivo del reporte contra{" "}
            <strong>@{visitedUser.name}</strong>. El asunto es obligatorio.
          </DialogContentText>
          <TextField
            fullWidth
            multiline
            rows={3}
            placeholder="Describe el motivo..."
            value={blockReportMotivo}
            onChange={(e) => setBlockReportMotivo(e.target.value)}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: "10px",
                color: theme.primaryText,
                "& fieldset": { borderColor: `${accent}40` },
                "&:hover fieldset": { borderColor: accent },
                "&.Mui-focused fieldset": { borderColor: accent },
              },
              "& .MuiInputBase-input": { fontSize: "0.875rem" },
            }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 2, pb: 2, gap: 1 }}>
          <Button
            onClick={() => {
              setBlockReportDialog(false);
              setBlockReportMotivo("");
            }}
            sx={{
              color: theme.mutedText,
              textTransform: "none",
              borderRadius: "8px",
            }}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleBlockAndReport}
            disabled={!blockReportMotivo.trim() || blockReportSending}
            variant="contained"
            sx={{
              background: "#f44336",
              color: "#fff",
              textTransform: "none",
              borderRadius: "8px",
              fontWeight: 600,
              "&:hover": { background: "#c62828" },
              "&.Mui-disabled": { background: "#f4433640", color: "#fff8" },
            }}
          >
            {blockReportSending ? (
              <CircularProgress size={18} sx={{ color: "#fff" }} />
            ) : (
              "Bloquear y reportar"
            )}
          </Button>
        </DialogActions>
      </Dialog>

      <Backdrop
        sx={{ zIndex: 9999, color: "#fff" }}
        open={isAvatarZoomed}
        onClick={() => setIsAvatarZoomed(false)}
      >
        <img
          src={visitedUser.url_image ?? "/no_user_avatar_image.png"}
          style={{
            width: "min(90%, 450px)",
            borderRadius: "50%",
            boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
          }}
          alt="Zoom"
        />
      </Backdrop>
    </Box>
  );
}
