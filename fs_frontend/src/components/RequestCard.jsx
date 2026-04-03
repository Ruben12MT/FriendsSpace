import {
  Avatar, Box, Typography, Button, Grid,
  IconButton, Badge, TextField, Dialog,
  DialogTitle, DialogContent, DialogContentText, DialogActions,
} from "@mui/material";
import React, { useState } from "react";
import { useAppTheme } from "../hooks/useAppTheme";
import { useUser } from "../hooks/useUser";
import DeleteIcon from "@mui/icons-material/Delete";
import ReportIcon from "@mui/icons-material/Report";
import FlagIcon from "@mui/icons-material/Flag";
import { X, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";

export default function RequestCard({ request, onAccept, onReject, onDelete }) {
  const theme = useAppTheme();
  const { loggedUser } = useUser();
  const navigate = useNavigate();

  const [reportOpen, setReportOpen] = useState(false);
  const [reportMotivo, setReportMotivo] = useState("");
  const [reportSending, setReportSending] = useState(false);

  const obtenerTiempoTranscurrido = (fechaString) => {
    if (!fechaString) return "fecha desconocida";
    const pasado = new Date(fechaString);
    if (isNaN(pasado.getTime())) return "fecha desconocida";
    const ahora = new Date();
    const diferenciaEnSegundos = Math.floor((ahora - pasado) / 1000);
    if (diferenciaEnSegundos < 60) return "ahora mismo";
    const minutos = Math.floor(diferenciaEnSegundos / 60);
    if (minutos < 60) return `hace ${minutos}m`;
    const horas = Math.floor(minutos / 60);
    if (horas < 24) return `hace ${horas}h`;
    const dias = Math.floor(horas / 24);
    if (dias < 7) return `hace ${dias}d`;
    return `hace ${Math.floor(dias / 7)} sem`;
  };

  const esReporte = request.is_report;
  const pendiente = request.status === "PENDING";
  const rechazada = request.status === "REJECTED";
  const aceptada = request.status === "ACCEPTED";

  const soyEmisor = request.sender_id === loggedUser.id;
  const soyReceptor = request.receiver_id === loggedUser.id;

  const usuarioReferencia = soyEmisor ? request.receiver : request.sender;
  if (!usuarioReferencia) return null;

  let infoReport = null;
  if (esReporte && request.info_report) {
    try { infoReport = JSON.parse(request.info_report); } catch {}
  }

  const handleSendMessage = async () => {
    try {
      const res = await api.get(`/connections/check/${usuarioReferencia.id}`);
      const connectionId = res.data.exists ? res.data.connection_id : null;
      navigate("/app/chats", { state: { openConnectionId: connectionId } });
    } catch (e) {
      navigate("/app/chats");
    }
  };

  const handleReport = async () => {
    if (!reportMotivo.trim()) return;
    setReportSending(true);
    try {
      await api.post("/requests/report", {
        body: reportMotivo.trim(),
        infoReport: {
          type: "REQUEST",
          request_id: request.id,
          sender_id: request.sender_id,
          sender_name: request.sender?.name,
          request_body: request.body,
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

  const obtenerMensaje = () => {
    if (esReporte) {
      if (soyReceptor && pendiente) return " ha enviado un reporte.";
      if (soyReceptor && aceptada) return " — reporte en investigación.";
      if (soyReceptor && rechazada) return " — reporte desestimado.";
      if (soyEmisor && pendiente) return " — tu reporte está siendo revisado.";
      if (soyEmisor && aceptada) return " — tu reporte ha sido aceptado.";
      if (soyEmisor && rechazada) return " — tu reporte ha sido desestimado.";
    }
    if (soyReceptor && pendiente) return " te ha enviado una solicitud de amistad.";
    if (soyReceptor && aceptada) return " y tú sois buenos amigos ahora.";
    if (soyReceptor && rechazada) return "Has rechazado la solicitud de amistad de ";
    if (soyEmisor && rechazada) return " ha rechazado tu solicitud de amistad.";
    if (soyEmisor && aceptada) return " ha aceptado tu solicitud de amistad.";
    return "";
  };

  // Puede reportar si es receptor de una solicitud pendiente que no es reporte
  const puedeReportar = soyReceptor && pendiente && !esReporte;

  return (
    <>
      <Grid
        container
        flexDirection="column"
        sx={{
          background: theme.secondaryBack,
          border: esReporte ? "1px solid rgba(244,67,54,0.2)" : "none",
          p: 2, borderRadius: 2, mb: 2, width: "100%",
          display: "flex", justifyContent: "center", minHeight: "120px",
        }}
      >
        {esReporte && (
          <Box display="flex" alignItems="center" gap={0.5} mb={1}>
            <ReportIcon sx={{ fontSize: 14, color: "#f44336" }} />
            <Typography sx={{ fontSize: "0.72rem", color: "#f44336", fontWeight: 600 }}>
              REPORTE
            </Typography>
          </Box>
        )}

        <Box display="flex" gap="10px" alignItems="center" sx={{ width: "100%", mb: 1.5 }}>
          <Badge
            color="error" variant="dot" overlap="circular"
            anchorOrigin={{ vertical: "top", horizontal: "right" }}
            invisible={soyEmisor ? request.is_read_sender : request.is_read_receiver}
            sx={{ "& .MuiBadge-badge": { border: `2px solid ${theme.secondaryBack}`, padding: "4px 4px", borderRadius: 999 } }}
          >
            <Avatar
              src={usuarioReferencia?.url_image || "/no_user_avatar_image.png"}
              sx={{ width: 40, height: 40, border: `1px solid ${theme.primaryBack}`, cursor: "pointer" }}
              onClick={() => navigate("/app/" + usuarioReferencia?.id)}
            />
          </Badge>

          <Typography sx={{ color: theme.primaryText, flex: 1 }}>
            {!(soyReceptor && rechazada && !esReporte) && (
              <span style={{ fontWeight: "bold" }}>@{usuarioReferencia.name}</span>
            )}
            {obtenerMensaje()}
            {soyReceptor && rechazada && !esReporte && (
              <span style={{ fontWeight: "bold" }}>@{usuarioReferencia.name}</span>
            )}
          </Typography>

          {rechazada && !esReporte && <X size={16} color="#ff0000" strokeWidth={1.75} />}
          {aceptada && !esReporte && <Check size={16} color="#009e12" strokeWidth={1.75} />}

          {((!pendiente && !esReporte) || (esReporte && !pendiente)) && (
            <Box display="flex" flexGrow={1} justifyContent="flex-end">
              <IconButton aria-label="delete" size="large" onClick={() => onDelete(request.id)}>
                <DeleteIcon fontSize="inherit" sx={{ color: "#ff0000" }} />
              </IconButton>
            </Box>
          )}
        </Box>

        {esReporte && request.body && (
          <Box sx={{ background: "rgba(244,67,54,0.06)", p: 1.5, width: "100%", borderRadius: 2, mb: 1.5, border: "1px solid rgba(244,67,54,0.15)" }}>
            <Typography variant="body2" sx={{ color: theme.fieldsText, fontSize: "0.82rem" }}>
              <strong>Motivo:</strong> {request.body}
            </Typography>
          </Box>
        )}

        {esReporte && infoReport && soyReceptor && (
          <Box sx={{ background: theme.tertiaryBack, p: 1.5, width: "100%", borderRadius: 2, mb: 1.5 }}>
            <Typography variant="body2" sx={{ color: theme.secondaryText, fontSize: "0.75rem", mb: 0.5, fontWeight: 600 }}>
              PRUEBA APORTADA — {infoReport.type}
            </Typography>
            {infoReport.type === "USER" && (
              <Typography variant="body2" sx={{ color: theme.fieldsText, fontSize: "0.8rem" }}>
                Usuario: @{infoReport.user_name} (ID: {infoReport.user_id})
              </Typography>
            )}
            {infoReport.type === "AD" && (
              <Typography variant="body2" sx={{ color: theme.fieldsText, fontSize: "0.8rem" }}>
                Anuncio: "{infoReport.ad_title}" de @{infoReport.ad_user_name}
              </Typography>
            )}
            {infoReport.type === "REQUEST" && (
              <Typography variant="body2" sx={{ color: theme.fieldsText, fontSize: "0.8rem" }}>
                Solicitud de @{infoReport.sender_name}: "{infoReport.request_body}"
              </Typography>
            )}
          </Box>
        )}

        {request.body && pendiente && !esReporte && (
          <Box sx={{ background: theme.tertiaryBack, p: 1.5, width: "100%", borderRadius: 2, color: theme.fieldsText, mb: 1.5 }}>
            <Typography variant="body2">{request.body}</Typography>
          </Box>
        )}

        <Box sx={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Box display="flex" gap="10px" alignItems="center">
            {esReporte && soyReceptor && pendiente && (
              <>
                <Button variant="contained" size="small" onClick={() => onAccept(request.id)}
                  sx={{ backgroundColor: "#f44336", color: "white", textTransform: "none", fontWeight: "bold", "&:hover": { backgroundColor: "#c62828" } }}>
                  Investigar
                </Button>
                <Button variant="contained" size="small" onClick={() => onReject(request.id)}
                  sx={{ backgroundColor: theme.secondaryText, color: "white", textTransform: "none", fontWeight: "bold", "&:hover": { backgroundColor: "#555" } }}>
                  Desestimar
                </Button>
              </>
            )}

            {esReporte && soyReceptor && aceptada && (
              <Button variant="contained" size="small" onClick={handleSendMessage}
                sx={{ backgroundColor: "#f44336", color: "white", textTransform: "none", fontWeight: "bold", "&:hover": { backgroundColor: "#c62828" } }}>
                Ver chat
              </Button>
            )}

            {!esReporte && !rechazada && (
              <>
                <Button variant="contained" size="small"
                  onClick={pendiente ? () => onAccept(request.id) : handleSendMessage}
                  sx={{ backgroundColor: theme.primaryText, color: theme.secondaryBack, textTransform: "none", fontWeight: "bold", "&:hover": { backgroundColor: theme.primaryText, opacity: 0.8 } }}>
                  {aceptada ? "Enviar mensaje" : "Aceptar"}
                </Button>
                {pendiente && (
                  <Button variant="contained" size="small" onClick={() => onReject(request.id)}
                    sx={{ backgroundColor: theme.secondaryText, color: "white", textTransform: "none", fontWeight: "bold", "&:hover": { backgroundColor: "#c62828" } }}>
                    Rechazar
                  </Button>
                )}
              </>
            )}

            {puedeReportar && (
              <Button size="small" onClick={() => setReportOpen(true)}
                startIcon={<FlagIcon fontSize="small" />}
                sx={{ color: theme.secondaryText, textTransform: "none", "&:hover": { color: "#f44336" } }}>
                Reportar
              </Button>
            )}
          </Box>

          <Typography variant="caption" sx={{ color: theme.secondaryText, fontStyle: "italic" }}>
            {obtenerTiempoTranscurrido(request.updated_at || request.created_at)}
          </Typography>
        </Box>
      </Grid>

      <Dialog
        open={reportOpen}
        onClose={() => { setReportOpen(false); setReportMotivo(""); }}
        PaperProps={{ sx: { borderRadius: "16px", background: theme.secondaryBack, minWidth: 360 } }}
      >
        <DialogTitle sx={{ color: theme.primaryText, fontWeight: 700 }}>
          <Box display="flex" alignItems="center" gap={1}>
            <FlagIcon sx={{ color: "#f44336", fontSize: 20 }} />
            Reportar solicitud
          </Box>
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ color: theme.secondaryText, fontSize: "0.875rem", mb: 2 }}>
            Solicitud de <strong style={{ color: theme.primaryText }}>@{usuarioReferencia.name}</strong>
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
          <Button onClick={() => { setReportOpen(false); setReportMotivo(""); }}
            sx={{ color: theme.secondaryText, textTransform: "none", borderRadius: "8px" }}>
            Cancelar
          </Button>
          <Button onClick={handleReport} disabled={!reportMotivo.trim() || reportSending}
            variant="contained"
            sx={{ background: "#f44336", color: "#fff", textTransform: "none", borderRadius: "8px", fontWeight: 600, "&:hover": { background: "#c62828" } }}>
            Enviar reporte
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}