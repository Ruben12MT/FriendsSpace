import React, { useState, useEffect, useContext } from "react";
import { Box, Typography, Button, ButtonGroup, Tooltip } from "@mui/material";
import { useAppTheme } from "../hooks/useAppTheme";
import { useUser } from "../hooks/useUser";
import api from "../utils/api";
import RequestCard from "../components/RequestCard";
import ConfirmModal from "../components/ConfirmModal";
import { SocketContext } from "../context/SocketContext";
import useAuthStore from "../store/useAuthStore";
import DeleteSweepIcon from "@mui/icons-material/DeleteSweep";

export default function RequestsPages() {
  const navbarHeight = "140px";
  const theme = useAppTheme();
  const { loggedUser } = useUser();
  const { socket } = useContext(SocketContext);

  const [allUserRequests, setAllUserRequests] = useState([]);
  const [requestsToShow, setRequestsToShow] = useState([]);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [openClearModal, setOpenClearModal] = useState(false);
  const [requestToDelete, setRequestToDelete] = useState(null);

  const resetUnread = useAuthStore((state) => state.resetUnread);

  const [types, setTypes] = useState({
    ALL: true,
    PENDING: false,
    ACCEPTED: false,
    REJECTED: false,
  });

  const staticButtonStyle = {
    flex: 1,
    py: 1.5,
    fontWeight: "bold",
    backgroundColor: theme.secondaryBack,
    color: theme.primaryText,
    border: `1px solid ${theme.primaryBack} !important`,
    transition: "all 0.2s ease",
    "&:hover": {
      backgroundColor: theme.secondaryText,
      color: theme.tertiaryBack,
    },
  };

  const ordenarRequestsPorFecha = (lista) => {
    return [...lista].sort((a, b) => {
      const fechaA = new Date(a.updated_at || a.created_at);
      const fechaB = new Date(b.updated_at || b.created_at);
      return fechaB - fechaA;
    });
  };

  // Cargar requests al entrar en la página
  useEffect(() => {
    async function fetchMyRequests() {
      try {
        const res = await api.get("/requests/list");
        if (res.data.ok && loggedUser) {
          setAllUserRequests(ordenarRequestsPorFecha(res.data.datos));
        }
      } catch (error) {
        console.error(error.message);
      }
    }
    fetchMyRequests();
  }, [loggedUser?.id]);

  // Escuchar eventos de socket
  useEffect(() => {
    if (!socket || !loggedUser) return;

    const onNuevaSolicitud = (payload) => {
      const data = payload.data || payload;

      const nuevaReqFormateada = {
        ...data,
        sender: data.sender || {
          id: data.sender_id,
          name: data.sender_name || "Usuario",
          url_image: data.sender_image || null,
        },
        created_at: data.created_at || new Date().toISOString(),
      };

      setAllUserRequests((prev) => {
        if (prev.find((r) => r.id === nuevaReqFormateada.id)) return prev;
        return ordenarRequestsPorFecha([nuevaReqFormateada, ...prev]);
      });
    };

    const onSolicitudRespondida = (payload) => {
      const data = payload.data || payload;

      setAllUserRequests((prev) => {
        const existe = prev.find((r) => r.id === data.id);
        if (existe) {
          const actualizadas = prev.map((r) =>
            r.id === data.id ? { ...r, ...data } : r,
          );
          return ordenarRequestsPorFecha(actualizadas);
        }
        return ordenarRequestsPorFecha([data, ...prev]);
      });
    };

    socket.on("nueva_solicitud", onNuevaSolicitud);
    socket.on("solicitud_respondida", onSolicitudRespondida);

    return () => {
      socket.off("nueva_solicitud", onNuevaSolicitud);
      socket.off("solicitud_respondida", onSolicitudRespondida);
    };
  }, [socket, loggedUser?.id]);

  // Al salir de la página: marcar todas como leídas y resetear el contador
  useEffect(() => {
    api.put("/requests/read-all", {}).catch(() => {});
    resetUnread();
  }, [resetUnread]);

  // Filtrar por tipo
  useEffect(() => {
    let filtradas = [...allUserRequests];
    if (types.PENDING)
      filtradas = allUserRequests.filter((r) => r.status === "PENDING");
    else if (types.ACCEPTED)
      filtradas = allUserRequests.filter((r) => r.status === "ACCEPTED");
    else if (types.REJECTED)
      filtradas = allUserRequests.filter((r) => r.status === "REJECTED");
    setRequestsToShow(filtradas);
  }, [allUserRequests, types]);

  const handleOpenDelete = (idReq) => {
    setRequestToDelete(idReq);
    setOpenDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!requestToDelete) return;
    try {
      const res = await api.put(`/requests/${requestToDelete}/invisible`);
      if (res.data.ok) {
        setAllUserRequests((prev) =>
          prev.filter((req) => req.id !== requestToDelete),
        );
      }
    } catch (error) {
      console.error(error);
    } finally {
      setOpenDeleteModal(false);
      setRequestToDelete(null);
    }
  };

  // Limpiar todas las no-pendientes de golpe
  const confirmClearAll = async () => {
    const noP = allUserRequests.filter((r) => r.status !== "PENDING");
    try {
      await Promise.all(noP.map((r) => api.put(`/requests/${r.id}/invisible`)));
      setAllUserRequests((prev) => prev.filter((r) => r.status === "PENDING"));
    } catch (e) {
      console.error(e);
    } finally {
      setOpenClearModal(false);
    }
  };

  const hayLeidas = allUserRequests.some((r) => r.status !== "PENDING");

  const onAccept = async (idReq) => {
    try {
      const res = await api.put(`/requests/${idReq}/accept`);
      if (res.data.ok) {
        setAllUserRequests((prev) => {
          const nuevas = prev.map((req) =>
            req.id === idReq
              ? {
                  ...req,
                  status: "ACCEPTED",
                  is_read_receiver: true,
                  is_read_sender: false,
                  updated_at: new Date().toISOString(),
                }
              : req,
          );
          return ordenarRequestsPorFecha(nuevas);
        });
      }
    } catch (error) {
      console.error(error);
    }
  };

  const onReject = async (idReq) => {
    try {
      const res = await api.put(`/requests/${idReq}/reject`);
      if (res.data.ok) {
        setAllUserRequests((prev) => {
          const nuevas = prev.map((req) =>
            req.id === idReq
              ? {
                  ...req,
                  status: "REJECTED",
                  is_read_receiver: true,
                  is_read_sender: false,
                  updated_at: new Date().toISOString(),
                }
              : req,
          );
          return ordenarRequestsPorFecha(nuevas);
        });
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Box
      sx={{
        position: "fixed",
        top: navbarHeight,
        left: 0,
        right: 0,
        bottom: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        p: 2,
        overflowY: "auto",
        width: "100%",
      }}
    >
      <ConfirmModal
        open={openDeleteModal}
        handleClose={() => setOpenDeleteModal(false)}
        onConfirm={confirmDelete}
        title="Eliminar notificación"
        message="¿Estás seguro de que quieres ocultar esta notificación?"
      />
      <ConfirmModal
        open={openClearModal}
        handleClose={() => setOpenClearModal(false)}
        onConfirm={confirmClearAll}
        title="Limpiar notificaciones"
        message="Se ocultarán todas las notificaciones leídas (aceptadas y rechazadas). Las pendientes se conservan."
      />

      <Box
        sx={{
          width: { xs: "100%", md: "80%", lg: "70%" },
          mt: 2,
          flexShrink: 0,
        }}
      >
        {/* Header con título y botón limpiar */}
        <Box
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          mb={3}
        >
          <Typography
            variant="h4"
            sx={{ fontWeight: "bold", color: theme.primaryText }}
          >
            Notificaciones
          </Typography>

          {hayLeidas && (
            <Tooltip title="Ocultar todas las notificaciones leídas">
              <Button
                size="small"
                startIcon={<DeleteSweepIcon fontSize="small" />}
                onClick={() => setOpenClearModal(true)}
                sx={{
                  color: theme.secondaryText,
                  border: `1px solid ${theme.secondaryText}40`,
                  borderRadius: "10px",
                  textTransform: "none",
                  fontSize: "0.8rem",
                  px: 1.5,
                  py: 0.6,
                  "&:hover": {
                    color: "#f44336",
                    borderColor: "#f44336",
                    background: "rgba(244,67,54,0.06)",
                  },
                }}
              >
                Limpiar leídas
              </Button>
            </Tooltip>
          )}
        </Box>

        <ButtonGroup
          variant="contained"
          fullWidth
          disableElevation
          sx={{ mb: 4, borderRadius: 2, overflow: "hidden" }}
        >
          <Button
            sx={{
              ...staticButtonStyle,
              backgroundColor: types.ALL
                ? theme.primaryBack
                : theme.secondaryBack,
            }}
            onClick={() =>
              setTypes({
                ALL: true,
                PENDING: false,
                ACCEPTED: false,
                REJECTED: false,
              })
            }
          >
            TODAS
          </Button>
          <Button
            sx={{
              ...staticButtonStyle,
              backgroundColor: types.PENDING
                ? theme.primaryBack
                : theme.secondaryBack,
            }}
            onClick={() =>
              setTypes({
                ALL: false,
                PENDING: true,
                ACCEPTED: false,
                REJECTED: false,
              })
            }
          >
            PENDIENTES
          </Button>
          <Button
            sx={{
              ...staticButtonStyle,
              backgroundColor: types.ACCEPTED
                ? theme.primaryBack
                : theme.secondaryBack,
            }}
            onClick={() =>
              setTypes({
                ALL: false,
                PENDING: false,
                ACCEPTED: true,
                REJECTED: false,
              })
            }
          >
            ACEPTADAS
          </Button>
          <Button
            sx={{
              ...staticButtonStyle,
              backgroundColor: types.REJECTED
                ? theme.primaryBack
                : theme.secondaryBack,
            }}
            onClick={() =>
              setTypes({
                ALL: false,
                PENDING: false,
                ACCEPTED: false,
                REJECTED: true,
              })
            }
          >
            RECHAZADAS
          </Button>
        </ButtonGroup>
      </Box>

      <Box
        sx={{
          width: { xs: "100%", md: "80%", lg: "70%" },
          display: "flex",
          flexDirection: "column",
          gap: 2,
          pb: 4,
        }}
      >
        {requestsToShow.length > 0 ? (
          requestsToShow.map((req) => (
            <RequestCard
              key={req.id}
              request={req}
              onAccept={onAccept}
              onReject={onReject}
              onDelete={handleOpenDelete}
            />
          ))
        ) : (
          <Typography
            sx={{ color: theme.secondaryText, textAlign: "center", mt: 4 }}
          >
            No tienes notificaciones
          </Typography>
        )}
      </Box>
    </Box>
  );
}
