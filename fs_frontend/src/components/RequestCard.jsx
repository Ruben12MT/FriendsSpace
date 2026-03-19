import { Avatar, Box, Typography, Button, Grid } from "@mui/material";
import React from "react";
import { useAppTheme } from "../hooks/useAppTheme";
import { useUser } from "../hooks/useUser";
import { X, Check } from "lucide-react";
export default function RequestCard({ request }) {
  const theme = useAppTheme();
  const { loggedUser } = useUser();

  const obtenerTiempoTranscurrido = (fechaString) => {
    const ahora = new Date();
    const pasado = new Date(fechaString);
    const diferenciaEnSegundos = Math.floor((ahora - pasado) / 1000);

    if (diferenciaEnSegundos < 60) return "ahora mismo";
    const minutos = Math.floor(diferenciaEnSegundos / 60);
    if (minutos < 60) return `hace ${minutos}m`;
    const horas = Math.floor(minutos / 60);
    if (horas < 24) return `hace ${horas}h`;
    const dias = Math.floor(horas / 24);
    if (dias < 7) return `hace ${dias}d`;
    const semanas = Math.floor(dias / 7);
    return `hace ${semanas} sem`;
  };

  const pendiente = request.status === "PENDING" && !request.is_report;
  const rechazada = request.status === "REJECTED" && !request.is_report;
  const aceptada = request.status === "ACCEPTED" && !request.is_report;

  const soyEmisor = request.sender_id === loggedUser.id;
  const soyReceptor = request.receiver_id === loggedUser.id;

  const obtenerMensaje = () => {
    if (soyReceptor && pendiente)
      return " te ha enviado una solicitud de amistad.";
    if (soyReceptor && aceptada) return " y tú sois buenos amigos ahora.";
    if (soyReceptor && rechazada)
      return "Has rechazado la solicitud de amistad de ";
    if (soyEmisor && rechazada) return " ha rechazado tu solicitud de amistad.";
    if (soyEmisor && aceptada) return " ha aceptado tu solicitud de amistad.";
  };

  return (
    <Grid
      container
      flexDirection="column"
      sx={{
        background: theme.secondaryBack,
        p: 2,
        borderRadius: 2,
        mb: 2,
        width: "100%",
        display: "flex",
        justifyContent: "center",
        minHeight: "120px",
      }}
    >
      <Box
        display="flex"
        gap="10px"
        alignItems="center"
        sx={{ width: "100%", mb: 1.5 }}
      >
        <Avatar
          src={
            soyReceptor ? request.sender.url_image : request.receiver.url_image
          }
          sx={{
            width: 40,
            height: 40,
            border: `1px solid ${theme.primaryBack}`,
          }}
        />
        <Typography sx={{ color: theme.primaryText }}>
          {!(soyReceptor && rechazada) && (
            <span style={{ fontWeight: "bold" }}>
              @{soyReceptor ? request.sender.name : request.receiver.name}
            </span>
          )}
          {obtenerMensaje()}
          {soyReceptor && rechazada && (
            <>
              <span style={{ fontWeight: "bold" }}>
                @{soyReceptor ? request.sender.name : request.receiver.name}
              </span>
              .
            </>
          )}
        </Typography>
        {rechazada && <X size={16} color="#ff0000" strokeWidth={1.75} />}
        {aceptada && <Check size={16} color="#009e12" strokeWidth={1.75} />}
      </Box>

      {request.body && pendiente && (
        <Box
          sx={{
            background: theme.tertiaryBack,
            p: 1.5,
            width: "100%",
            borderRadius: 2,
            color: theme.fieldsText,
            mb: 1.5,
          }}
        >
          <Typography variant="body2">{request.body}</Typography>
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
        <Box display="flex" gap="10px">
          {!rechazada && (
            <>
              <Button
                variant="contained"
                size="small"
                sx={{
                  backgroundColor: theme.primaryText,
                  color: theme.secondaryBack,
                  textTransform: "none",
                  fontWeight: "bold",
                  "&:hover": {
                    backgroundColor: theme.primaryText,
                    opacity: 0.8,
                  },
                }}
              >
                 {aceptada ? "Enviar mensaje" : "Aceptar"}
              </Button>

              {pendiente && (
                <Button
                  variant="contained"
                  size="small"
                  sx={{
                    backgroundColor: theme.secondaryText,
                    color: "white",
                    textTransform: "none",
                    fontWeight: "bold",
                    "&:hover": { backgroundColor: "#c62828" },
                  }}
                >
                  Rechazar
                </Button>
              )}
            </>
          )}
        </Box>

        <Typography
          variant="caption"
          sx={{ color: theme.secondaryText, fontStyle: "italic" }}
        >
          {obtenerTiempoTranscurrido(request.created_at)}
        </Typography>
      </Box>
    </Grid>
  );
}
