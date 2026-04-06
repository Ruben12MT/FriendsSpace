import React, { useState } from "react";
import {
  Avatar, Box, Typography, Button, Grid,
  IconButton, Badge, TextField, Dialog,
  DialogTitle, DialogContent, DialogContentText, DialogActions,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import DeleteIcon from "@mui/icons-material/Delete";
import ReportIcon from "@mui/icons-material/Report";
import FlagIcon from "@mui/icons-material/Flag";
import { X, Check } from "lucide-react";
import { useAppTheme } from "../hooks/useAppTheme";
import { useUser } from "../hooks/useUser";
import api from "../utils/api";

// Helper para el tiempo transcurrido
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

  const [reportOpen, setReportOpen] = useState(false);
  const [reportMotivo, setReportMotivo] = useState("");
  const [reportSending, setReportSending] = useState(false);

  const { is_report: esReporte, status, sender_id, receiver_id, body, id } = request;
  const pendiente = status === "PENDING";
  const rechazada = status === "REJECTED";
  const aceptada = status === "ACCEPTED";
  const soyEmisor = sender_id === loggedUser.id;
  const soyReceptor = receiver_id === loggedUser.id;

  const usuarioReferencia = soyEmisor ? request.receiver : request.sender;
  if (!usuarioReferencia) return null;

  let infoReport = null;
  if (esReporte && request.info_report) {
    try { infoReport = JSON.parse(request.info_report); } catch (e) {}
  }

  const handleSendMessage = async () => {
    try {
      const res = await api.get(`/connections/check/${usuarioReferencia.id}`);
      const connectionId = res.data.exists ? res.data.connection_id : null;
      navigate("/app/chats", { state: { openConnectionId: connectionId } });
    } catch {
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
          request_id: id,
          sender_id: sender_id,
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
        return aceptada ? " — reporte en investigación." : " — reporte desestimado.";
      }
      if (pendiente) return " — tu reporte está siendo revisado.";
      return aceptada ? " — tu reporte ha sido aceptado." : " — tu reporte ha sido desestimado.";
    }
    if (soyReceptor) {
      if (pendiente) return " te ha enviado una solicitud de amistad.";
      return aceptada ? " y tú sois buenos amigos ahora." : "Has rechazado la solicitud de amistad de ";
    }
    return aceptada ? " ha aceptado tu solicitud de amistad." : " ha rechazado tu solicitud de amistad.";
  };

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
          minHeight: "120px",
        }}
      >
        {esReporte && (
          <Box display="flex" alignItems="center" gap={0.5} mb={1}>
            <ReportIcon sx={{ fontSize: 14, color: "#f44336" }} />
            <Typography sx={{ fontSize: "0.72rem", color: "#f44336", fontWeight: 600 }}>REPORTE</Typography>
          </Box>
        )}

        <Box display="flex" gap="10px" alignItems="center" sx={{ width: "100%", mb: 1.5 }}>
          <Badge
            color="error" variant="dot" overlap="circular"
            invisible={soyEmisor ? request.is_read_sender : request.is_read_receiver}
            sx={{ "& .MuiBadge-badge": { border: `2px solid ${theme.secondaryBack}` } }}
          >
            <Avatar
              src={usuarioReferencia?.url_image || "/no_user_avatar_image.png"}
              sx={{ width: 40, height: 40, border: `1px solid ${theme.primaryBack}`, cursor: "pointer" }}
              onClick={() => navigate(`/app/${usuarioReferencia?.id}`)}
            />
          </Badge>

          <Typography sx={{ color: theme.primaryText, flex: 1 }}>
            {!(soyReceptor && rechazada && !esReporte) && <strong>@{usuarioReferencia.name}</strong>}
            {getStatusMessage()}
            {soyReceptor && rechazada && !esReporte && <strong>@{usuarioReferencia.name}</strong>}
          </Typography>

          {!esReporte && (
            <>
              {rechazada && <X size={16} color="#ff0000" strokeWidth={1.75} />}
              {aceptada && <Check size={16} color="#009e12" strokeWidth={1.75} />}
            </>
          )}

          {((!pendiente && !esReporte) || (esReporte && !pendiente)) && (
            <IconButton onClick={() => onDelete(id)}>
              <DeleteIcon sx={{ color: "#ff0000" }} />
            </IconButton>
          )}
        </Box>

        {/* Cuerpos de mensaje / Pruebas */}
        {(esReporte || (body && pendiente)) && (
          <Box sx={{ 
            background: esReporte ? "rgba(244,67,54,0.06)" : theme.tertiaryBack, 
            p: 1.5, borderRadius: 2, mb: 1.5,
            border: esReporte ? "1px solid rgba(244,67,54,0.15)" : "none"
          }}>
            <Typography variant="body2" sx={{ color: theme.fieldsText }}>
              {esReporte && <strong>Motivo: </strong>}{body}
            </Typography>
          </Box>
        )}

        {/* Acciones */}
        <Box sx={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Box display="flex" gap="10px">
            {esReporte && soyReceptor && pendiente ? (
              <>
                <Button variant="contained" size="small" onClick={() => onAccept(id)} sx={{ bgcolor: "#f44336" }}>Investigar</Button>
                <Button variant="contained" size="small" onClick={() => onReject(id)} sx={{ bgcolor: theme.secondaryText }}>Desestimar</Button>
              </>
            ) : esReporte && soyReceptor && aceptada ? (
              <Button variant="contained" size="small" onClick={handleSendMessage} sx={{ bgcolor: "#f44336" }}>Ver chat</Button>
            ) : !esReporte && !rechazada ? (
              <>
                <Button 
                  variant="contained" size="small" 
                  onClick={pendiente ? () => onAccept(id) : handleSendMessage}
                  sx={{ bgcolor: theme.primaryText, color: theme.secondaryBack }}
                >
                  {aceptada ? "Enviar mensaje" : "Aceptar"}
                </Button>
                {pendiente && <Button variant="contained" size="small" onClick={() => onReject(id)} sx={{ bgcolor: theme.secondaryText }}>Rechazar</Button>}
              </>
            ) : null}

            {puedeReportar && (
              <Button size="small" onClick={() => setReportOpen(true)} startIcon={<FlagIcon fontSize="small" />} sx={{ color: theme.secondaryText }}>
                Reportar
              </Button>
            )}
          </Box>

          <Typography variant="caption" sx={{ color: theme.secondaryText, fontStyle: "italic" }}>
            {getTimeAgo(request.updated_at || request.created_at)}
          </Typography>
        </Box>
      </Grid>

      {/* Modal de Reporte */}
      <Dialog open={reportOpen} onClose={() => setReportOpen(false)} PaperProps={{ sx: { borderRadius: "16px", background: theme.secondaryBack, minWidth: 360 } }}>
        <DialogTitle sx={{ color: theme.primaryText, fontWeight: 700 }}>Reportar solicitud</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>Solicitud de @{usuarioReferencia.name}</DialogContentText>
          <TextField
            fullWidth multiline rows={3}
            placeholder="Describe el motivo del reporte..."
            value={reportMotivo}
            onChange={(e) => setReportMotivo(e.target.value)}
            sx={{ "& .MuiInputBase-input": { color: theme.primaryText } }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 2, pb: 2 }}>
          <Button onClick={() => setReportOpen(false)}>Cancelar</Button>
          <Button onClick={handleReport} disabled={!reportMotivo.trim() || reportSending} variant="contained" sx={{ bgcolor: "#f44336" }}>Enviar reporte</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}