import React, { useState } from "react";
import {
  Avatar,
  Box,
  Typography,
  Button,
  Grid,
  IconButton,
  Badge,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import DeleteIcon from "@mui/icons-material/Delete";
import ReportIcon from "@mui/icons-material/Report";
import FlagIcon from "@mui/icons-material/Flag";
import ChatIcon from "@mui/icons-material/Chat";
import CloseIcon from "@mui/icons-material/Close";
import { X, Check } from "lucide-react";
import { useAppTheme } from "../hooks/useAppTheme";
import { useUser } from "../hooks/useUser";
import api from "../utils/api";

const getTimeAgo = (dateString) => {
  if (!dateString) return "fecha desconocida";
  const past = new Date(dateString);
  if (isNaN(past.getTime())) return "fecha desconocida";
  const diff = Math.floor((new Date() - past) / 1000);
  if (diff < 60) return "ahora mismo";
  const mins = Math.floor(diff / 60);
  if (mins < 60) return `hace ${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `hace ${hours}h`;
  const days = Math.floor(hours / 24);
  return days < 7 ? `hace ${days}d` : `hace ${Math.floor(days / 7)} sem`;
};

export default function RequestCard({ request, onAccept, onReject, onDelete }) {
  const theme = useAppTheme();
  const { loggedUser } = useUser();
  const navigate = useNavigate();
  const accent = theme.accent || theme.primaryBack;
  const isDark = theme.name === "dark";

  const [reportOpen, setReportOpen] = useState(false);
  const [reportMotivo, setReportMotivo] = useState("");
  const [reportSending, setReportSending] = useState(false);

  const {
    is_report: esReporte,
    status,
    sender_id,
    receiver_id,
    body,
    id,
    connection_id,
  } = request;
  const pendiente = status === "PENDING";
  const rechazada = status === "REJECTED";
  const aceptada = status === "ACCEPTED";
  const soyEmisor = sender_id === loggedUser.id;
  const soyReceptor = receiver_id === loggedUser.id;

  const usuarioReferencia = soyEmisor ? request.receiver : request.sender;
  if (!usuarioReferencia) return null;

  let infoReport = null;
  if (esReporte && request.info_report) {
    try {
      infoReport = JSON.parse(request.info_report);
    } catch (e) {
      console.error("Error al parsear info_report:", e);
    }
  }

  const irAlChat = () => {
    if (connection_id)
      navigate("/app/chats", { state: { openConnectionId: connection_id } });
    else navigate("/app/chats");
  };

  const handleReport = async () => {
    if (!reportMotivo.trim()) return;
    setReportSending(true);
    try {
      await api.post("/requests/report", {
        body: reportMotivo.trim(),
        infoReport: {
          type: "REQUEST",
          request_id: id,
          sender_id,
          sender_name: request.sender?.name,
          request_body: body,
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

  const getStatusMessage = () => {
    if (esReporte) {
      if (soyReceptor) {
        if (pendiente) return " ha enviado un reporte.";
        return aceptada
          ? " — reporte en investigación."
          : " — reporte desestimado.";
      }
      if (pendiente) return " — tu reporte está siendo revisado.";
      return aceptada
        ? " — tu reporte ha sido aceptado."
        : " — tu reporte ha sido desestimado.";
    }
    if (soyReceptor) {
      if (pendiente) return " te ha enviado una solicitud de amistad.";
      return aceptada
        ? " y tú sois buenos amigos ahora."
        : "Has rechazado la solicitud de amistad de ";
    }
    return aceptada
      ? " ha aceptado tu solicitud de amistad."
      : " ha rechazado tu solicitud de amistad.";
  };

  const puedeReportar = soyReceptor && pendiente && !esReporte;

  return (
    <>
      <Grid
        container
        flexDirection="column"
        sx={{
          background: theme.secondaryBack,
          border: esReporte
            ? "1px solid rgba(244,67,54,0.2)"
            : `1px solid ${accent}10`,
          p: 2,
          borderRadius: "16px",
          mb: 2,
          width: "100%",
          minHeight: "120px",
        }}
      >
        {esReporte && (
          <Box display="flex" alignItems="center" gap={0.5} mb={1}>
            <ReportIcon sx={{ fontSize: 14, color: "#f44336" }} />
            <Typography
              sx={{ fontSize: "0.72rem", color: "#f44336", fontWeight: 600 }}
            >
              REPORTE
            </Typography>
          </Box>
        )}

        <Box
          display="flex"
          gap="10px"
          alignItems="center"
          sx={{ width: "100%", mb: 1.5 }}
        >
          <Badge
            color="error"
            variant="dot"
            overlap="circular"
            invisible={
              soyEmisor ? request.is_read_sender : request.is_read_receiver
            }
            sx={{
              "& .MuiBadge-badge": {
                border: `2px solid ${theme.secondaryBack}`,
              },
            }}
          >
            <Avatar
              src={usuarioReferencia?.url_image || "/no_user_avatar_image.png"}
              sx={{
                width: 40,
                height: 40,
                border: `1px solid ${accent}20`,
                cursor: "pointer",
              }}
              onClick={() => navigate(`/app/${usuarioReferencia?.id}`)}
            />
          </Badge>

          <Typography sx={{ color: theme.primaryText, flex: 1 }}>
            {!(soyReceptor && rechazada && !esReporte) && (
              <strong>@{usuarioReferencia.name}</strong>
            )}
            {getStatusMessage()}
            {soyReceptor && rechazada && !esReporte && (
              <strong>@{usuarioReferencia.name}</strong>
            )}
          </Typography>

          {!esReporte && (
            <>
              {rechazada && <X size={16} color="#ff0000" strokeWidth={1.75} />}
              {aceptada && (
                <Check size={16} color="#009e12" strokeWidth={1.75} />
              )}
            </>
          )}

          {((!pendiente && !esReporte) || (esReporte && !pendiente)) && (
            <IconButton onClick={() => onDelete(id)} size="small">
              <DeleteIcon sx={{ color: "#f44336", fontSize: 18 }} />
            </IconButton>
          )}
        </Box>

        {(esReporte || (body && pendiente)) && (
          <Box
            sx={{
              background: esReporte
                ? "rgba(244,67,54,0.06)"
                : theme.tertiaryBack,
              p: 1.5,
              borderRadius: "10px",
              mb: 1.5,
              border: esReporte
                ? "1px solid rgba(244,67,54,0.15)"
                : `1px solid ${accent}10`,
            }}
          >
            <Typography variant="body2" sx={{ color: theme.fieldsText }}>
              {esReporte && <strong>Motivo: </strong>}
              {body}
            </Typography>
          </Box>
        )}

        {esReporte && infoReport && soyReceptor && (
          <Box
            sx={{
              background: theme.tertiaryBack,
              p: 1.5,
              borderRadius: "10px",
              mb: 1.5,
              border: `1px solid ${accent}10`,
            }}
          >
            <Typography
              variant="body2"
              sx={{
                color: theme.mutedText,
                fontSize: "0.75rem",
                mb: 0.5,
                fontWeight: 600,
              }}
            >
              PRUEBA APORTADA — {infoReport.type}
            </Typography>
            {infoReport.type === "USER" && (
              <Typography
                variant="body2"
                sx={{ color: theme.fieldsText, fontSize: "0.8rem" }}
              >
                Usuario: @{"ID "+infoReport.user_id + " - " + infoReport.user_name}
              </Typography>
            )}
            {infoReport.type === "AD" && (
              <>
                <Typography
                  variant="body2"
                  sx={{ color: theme.fieldsText, fontSize: "0.8rem" }}
                >
                  Anuncio: "{infoReport.ad_title}" de @{infoReport.ad_user_name}
                </Typography>
                {infoReport.ad_body && (
                  <Typography
                    variant="body2"
                    sx={{
                      color: theme.mutedText,
                      fontSize: "0.75rem",
                      mt: 0.5,
                      fontStyle: "italic",
                    }}
                  >
                    "{"ID "+infoReport.ad_id + " - " + infoReport.ad_body}"
                  </Typography>
                )}
              </>
            )}
            {infoReport.type === "REQUEST" && (
              <Typography
                variant="body2"
                sx={{ color: theme.fieldsText, fontSize: "0.8rem" }}
              >
                Solicitud de @{"ID "+infoReport.request_id + " - " + infoReport.sender_name}: "
                {infoReport.request_body}"
              </Typography>
            )}
          </Box>
        )}

        <Box
          sx={{
            width: "100%",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Box display="flex" gap={1}>
            {esReporte && soyReceptor && pendiente ? (
              <>
                <Button
                  variant="contained"
                  size="small"
                  onClick={() => onAccept(id)}
                  sx={{
                    bgcolor: "#f44336",
                    textTransform: "none",
                    borderRadius: "8px",
                  }}
                >
                  Investigar
                </Button>
                <Button
                  variant="contained"
                  size="small"
                  onClick={() => onReject(id)}
                  sx={{
                    bgcolor: theme.secondaryText,
                    textTransform: "none",
                    borderRadius: "8px",
                  }}
                >
                  Desestimar
                </Button>
              </>
            ) : esReporte && soyReceptor && aceptada ? (
              <Button
                variant="contained"
                size="small"
                onClick={irAlChat}
                startIcon={<ChatIcon fontSize="small" />}
                sx={{
                  bgcolor: "#f44336",
                  textTransform: "none",
                  borderRadius: "8px",
                }}
              >
                Ver chat
              </Button>
            ) : esReporte && soyEmisor && aceptada ? (
              <Button
                variant="contained"
                size="small"
                onClick={irAlChat}
                startIcon={<ChatIcon fontSize="small" />}
                sx={{
                  bgcolor: "#f44336",
                  textTransform: "none",
                  borderRadius: "8px",
                  fontWeight: 600,
                }}
              >
                Ir al chat de investigación
              </Button>
            ) : !esReporte && !rechazada ? (
              <>
                <Button
                  variant="contained"
                  size="small"
                  onClick={pendiente ? () => onAccept(id) : irAlChat}
                  sx={{
                    bgcolor: theme.primaryText,
                    color: theme.secondaryBack,
                    textTransform: "none",
                    borderRadius: "8px",
                  }}
                >
                  {aceptada ? "Enviar mensaje" : "Aceptar"}
                </Button>
                {pendiente && (
                  <Button
                    variant="contained"
                    size="small"
                    onClick={() => onReject(id)}
                    sx={{
                      bgcolor: theme.secondaryText,
                      textTransform: "none",
                      borderRadius: "8px",
                    }}
                  >
                    Rechazar
                  </Button>
                )}
              </>
            ) : null}

            {puedeReportar && (
              <Button
                size="small"
                onClick={() => setReportOpen(true)}
                startIcon={<FlagIcon fontSize="small" />}
                sx={{
                  color: theme.secondaryText,
                  textTransform: "none",
                  borderRadius: "8px",
                  "&:hover": {
                    color: "#f44336",
                    background: "rgba(244,67,54,0.06)",
                  },
                }}
              >
                Reportar
              </Button>
            )}
          </Box>

          <Typography
            variant="caption"
            sx={{ color: theme.mutedText, fontStyle: "italic" }}
          >
            {getTimeAgo(request.updated_at || request.created_at)}
          </Typography>
        </Box>
      </Grid>

      <Dialog
        open={reportOpen}
        onClose={(event, reason) => {
          if (reason === "backdropClick") return;
          setReportOpen(false);
          setReportMotivo("");
        }}
        disableEscapeKeyDown
        PaperProps={{
          sx: {
            borderRadius: "20px",
            background: theme.secondaryBack,
            border: `1px solid ${accent}20`,
            minWidth: { xs: "90vw", sm: 420 },
            boxShadow: isDark
              ? "0 24px 60px rgba(0,0,0,0.6)"
              : "0 24px 60px rgba(0,0,0,0.12)",
          },
        }}
      >
        <DialogTitle sx={{ pb: 1, pt: 2.5, px: 3 }}>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <Box display="flex" alignItems="center" gap={1}>
              <FlagIcon sx={{ color: "#f44336", fontSize: 20 }} />
              <Typography
                sx={{
                  fontWeight: 700,
                  fontSize: "1.1rem",
                  color: theme.primaryText,
                }}
              >
                Reportar solicitud
              </Typography>
            </Box>
            <IconButton
              size="small"
              onClick={() => {
                setReportOpen(false);
                setReportMotivo("");
              }}
              sx={{ color: theme.mutedText }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent sx={{ px: 3, py: 2 }}>
          <Typography
            sx={{ fontSize: "0.85rem", color: theme.mutedText, mb: 2 }}
          >
            Solicitud de{" "}
            <strong style={{ color: theme.primaryText }}>
              @{usuarioReferencia.name}
            </strong>
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={3}
            placeholder="Describe el motivo del reporte..."
            value={reportMotivo}
            onChange={(e) => setReportMotivo(e.target.value)}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: "12px",
                background: theme.tertiaryBack,
                "& fieldset": { borderColor: `${accent}30` },
                "&.Mui-focused fieldset": { borderColor: accent },
              },
              "& .MuiInputBase-input": { color: theme.primaryText },
            }}
          />
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3, pt: 1, gap: 1.5 }}>
          <Button
            fullWidth
            variant="outlined"
            onClick={() => {
              setReportOpen(false);
              setReportMotivo("");
            }}
            sx={{
              borderColor: `${accent}40`,
              color: theme.mutedText,
              borderRadius: "10px",
              textTransform: "none",
              fontWeight: 600,
              "&:hover": { borderColor: accent, color: accent },
            }}
          >
            Cancelar
          </Button>
          <Button
            fullWidth
            variant="contained"
            onClick={handleReport}
            disabled={!reportMotivo.trim() || reportSending}
            sx={{
              background: "#f44336",
              color: "#fff",
              borderRadius: "10px",
              textTransform: "none",
              fontWeight: 700,
              "&:hover": { background: "#c62828" },
              "&.Mui-disabled": { background: theme.tertiaryBack },
            }}
          >
            Enviar reporte
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
