import React, { useState, useEffect, useContext } from "react";
import { Box, Typography, Button, ButtonGroup, Tooltip, Chip } from "@mui/material";
import { useAppTheme } from "../hooks/useAppTheme";
import { useUser } from "../hooks/useUser";
import api from "../utils/api";
import RequestCard from "../components/RequestCard";
import ConfirmModal from "../components/ConfirmModal";
import { SocketContext } from "../context/SocketContext";
import useAuthStore from "../store/useAuthStore";
import { useNavigate } from "react-router-dom";
import DeleteSweepIcon from "@mui/icons-material/DeleteSweep";
import ReportIcon from "@mui/icons-material/Report";
import NotificationsIcon from "@mui/icons-material/Notifications";

export default function RequestsPages() {
  const navbarHeight = "140px";
  const theme = useAppTheme();
  const { loggedUser } = useUser();
  const { socket } = useContext(SocketContext);
  const navigate = useNavigate();

  const isAdmin = loggedUser?.role === "ADMIN" || loggedUser?.role === "DEVELOPER";
  const [activeView, setActiveView] = useState("solicitudes");

  const [allUserRequests, setAllUserRequests] = useState([]);
  const [allReports, setAllReports] = useState([]);
  const [requestsToShow, setRequestsToShow] = useState([]);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [openClearModal, setOpenClearModal] = useState(false);
  const [requestToDelete, setRequestToDelete] = useState(null);

  const resetUnread = useAuthStore((state) => state.resetUnread);

  const [types, setTypes] = useState({ ALL: true, PENDING: false, ACCEPTED: false, REJECTED: false });

  const staticButtonStyle = {
    flex: 1, py: 1.5, fontWeight: "bold",
    backgroundColor: theme.secondaryBack, color: theme.primaryText,
    border: `1px solid ${theme.primaryBack} !important`, transition: "all 0.2s ease",
    "&:hover": { backgroundColor: theme.secondaryText, color: theme.tertiaryBack },
  };

  const ordenarRequestsPorFecha = (lista) =>
    [...lista].sort((a, b) => new Date(b.updated_at || b.created_at) - new Date(a.updated_at || a.created_at));

  const fetchAll = async () => {
    try {
      const res = await api.get("/requests/list");
      if (res.data.ok && loggedUser) {
        const solicitudes = res.data.datos.filter((r) => !r.is_report);
        const reportes = res.data.datos.filter((r) => r.is_report && r.receiver_id === loggedUser.id);
        setAllUserRequests(ordenarRequestsPorFecha(solicitudes));
        if (isAdmin) setAllReports(ordenarRequestsPorFecha(reportes));
      }
    } catch (error) { console.error(error.message); }
  };

  useEffect(() => {
    if (!loggedUser) return;
    fetchAll();
  }, [loggedUser?.id]);

  useEffect(() => {
    if (!socket || !loggedUser) return;

    const onNuevaSolicitud = (payload) => {
      const data = payload.data || payload;
      if (data.is_report) return;
      const fmt = { ...data, sender: data.sender || { id: data.sender_id, name: "Usuario", url_image: null }, created_at: data.created_at || new Date().toISOString() };
      setAllUserRequests((prev) => prev.find((r) => r.id === fmt.id) ? prev : ordenarRequestsPorFecha([fmt, ...prev]));
    };

    const onSolicitudRespondida = (payload) => {
      const data = payload.data || payload;
      setAllUserRequests((prev) => {
        if (prev.find((r) => r.id === data.id)) return ordenarRequestsPorFecha(prev.map((r) => r.id === data.id ? { ...r, ...data } : r));
        return ordenarRequestsPorFecha([data, ...prev]);
      });
    };

    const onNuevoReporte = (payload) => {
      const data = payload.data || payload;
      if (!isAdmin) return;
      setAllReports((prev) => prev.find((r) => r.id === data.id) ? prev : ordenarRequestsPorFecha([data, ...prev]));
    };

    socket.on("nueva_solicitud", onNuevaSolicitud);
    socket.on("solicitud_respondida", onSolicitudRespondida);
    socket.on("nuevo_reporte", onNuevoReporte);

    return () => {
      socket.off("nueva_solicitud", onNuevaSolicitud);
      socket.off("solicitud_respondida", onSolicitudRespondida);
      socket.off("nuevo_reporte", onNuevoReporte);
    };
  }, [socket, loggedUser?.id]);

  useEffect(() => {
    api.put("/requests/read-all", {}).catch(() => {});
    resetUnread();
  }, [resetUnread]);

  useEffect(() => {
    if (activeView === "reportes") { setRequestsToShow(allReports); return; }
    let filtradas = [...allUserRequests];
    if (types.PENDING) filtradas = allUserRequests.filter((r) => r.status === "PENDING");
    else if (types.ACCEPTED) filtradas = allUserRequests.filter((r) => r.status === "ACCEPTED");
    else if (types.REJECTED) filtradas = allUserRequests.filter((r) => r.status === "REJECTED");
    setRequestsToShow(filtradas);
  }, [allUserRequests, allReports, types, activeView]);

  const handleOpenDelete = (idReq) => { setRequestToDelete(idReq); setOpenDeleteModal(true); };

  const confirmDelete = async () => {
    if (!requestToDelete) return;
    try {
      const res = await api.put(`/requests/${requestToDelete}/invisible`);
      if (res.data.ok) {
        setAllUserRequests((prev) => prev.filter((r) => r.id !== requestToDelete));
        setAllReports((prev) => prev.filter((r) => r.id !== requestToDelete));
      }
    } catch (e) { console.error(e); }
    finally { setOpenDeleteModal(false); setRequestToDelete(null); }
  };

  const confirmClearAll = async () => {
    const noP = allUserRequests.filter((r) => r.status !== "PENDING");
    try {
      await Promise.all(noP.map((r) => api.put(`/requests/${r.id}/invisible`)));
      setAllUserRequests((prev) => prev.filter((r) => r.status === "PENDING"));
    } catch (e) { console.error(e); }
    finally { setOpenClearModal(false); }
  };

  const updateInLists = (idReq, changes) => {
    setAllUserRequests((prev) => ordenarRequestsPorFecha(prev.map((r) => r.id === idReq ? { ...r, ...changes } : r)));
    setAllReports((prev) => ordenarRequestsPorFecha(prev.map((r) => r.id === idReq ? { ...r, ...changes } : r)));
  };

  const onAccept = async (idReq) => {
    try {
      const res = await api.put(`/requests/${idReq}/accept`);
      if (res.data.ok) {
        updateInLists(idReq, { status: "ACCEPTED", is_read_receiver: true, is_read_sender: false, updated_at: new Date().toISOString() });

        // Si es un reporte, navegar al chat con el reportador
        const reporte = allReports.find((r) => r.id === idReq);
        if (reporte) {
          try {
            const connRes = await api.get(`/connections/check/${reporte.sender_id}`);
            if (connRes.data.exists) {
              navigate("/app/chats", { state: { openConnectionId: connRes.data.connection_id } });
            }
          } catch (e) { console.error(e); }
        }
      }
    } catch (error) { console.error(error); }
  };

  const onReject = async (idReq) => {
    try {
      const res = await api.put(`/requests/${idReq}/reject`);
      if (res.data.ok) {
        updateInLists(idReq, { status: "REJECTED", is_read_receiver: true, is_read_sender: false, updated_at: new Date().toISOString() });
      }
    } catch (e) { console.error(e); }
  };

  const hayLeidas = allUserRequests.some((r) => r.status !== "PENDING");
  const reportesPendientes = allReports.filter((r) => r.status === "PENDING").length;
  const solicitudesPendientes = allUserRequests.filter((r) => r.status === "PENDING").length;

  return (
    <Box sx={{ position: "fixed", top: navbarHeight, left: 0, right: 0, bottom: 0, display: "flex", flexDirection: "column", alignItems: "center", p: 2, overflowY: "auto", width: "100%" }}>
      <ConfirmModal open={openDeleteModal} handleClose={() => setOpenDeleteModal(false)} onConfirm={confirmDelete} title="Eliminar notificación" message="¿Estás seguro de que quieres ocultar esta notificación?" />
      <ConfirmModal open={openClearModal} handleClose={() => setOpenClearModal(false)} onConfirm={confirmClearAll} title="Limpiar notificaciones" message="Se ocultarán todas las notificaciones leídas. Las pendientes se conservan." />

      <Box sx={{ width: { xs: "100%", md: "80%", lg: "70%" }, mt: 2, flexShrink: 0 }}>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
          <Typography variant="h4" sx={{ fontWeight: "bold", color: theme.primaryText }}>
            {activeView === "reportes" ? "Reportes asignados" : "Notificaciones"}
          </Typography>
          {hayLeidas && activeView === "solicitudes" && (
            <Tooltip title="Ocultar todas las notificaciones leídas">
              <Button size="small" startIcon={<DeleteSweepIcon fontSize="small" />} onClick={() => setOpenClearModal(true)}
                sx={{ color: theme.secondaryText, border: `1px solid ${theme.secondaryText}40`, borderRadius: "10px", textTransform: "none", fontSize: "0.8rem", px: 1.5, py: 0.6, "&:hover": { color: "#f44336", borderColor: "#f44336", background: "rgba(244,67,54,0.06)" } }}>
                Limpiar leídas
              </Button>
            </Tooltip>
          )}
        </Box>

        {/* Selector de vista para admins */}
        {isAdmin && (
          <Box display="flex" gap={1} mb={3}>
            <Button
              startIcon={<NotificationsIcon fontSize="small" />}
              onClick={() => setActiveView("solicitudes")}
              variant={activeView === "solicitudes" ? "contained" : "outlined"}
              sx={{ borderRadius: "10px", textTransform: "none", fontWeight: 600, background: activeView === "solicitudes" ? theme.primaryBack : "transparent", borderColor: theme.primaryBack, color: activeView === "solicitudes" ? "#fff" : theme.primaryBack, "&:hover": { background: theme.primaryBack, color: "#fff" } }}
            >
              Solicitudes
              {solicitudesPendientes > 0 && (
                <Chip label={solicitudesPendientes} size="small" sx={{ ml: 1, height: 18, fontSize: "0.68rem", background: "rgba(255,255,255,0.25)", color: "inherit" }} />
              )}
            </Button>
            <Button
              startIcon={<ReportIcon fontSize="small" />}
              onClick={() => setActiveView("reportes")}
              variant={activeView === "reportes" ? "contained" : "outlined"}
              sx={{ borderRadius: "10px", textTransform: "none", fontWeight: 600, background: activeView === "reportes" ? "#f44336" : "transparent", borderColor: "#f44336", color: activeView === "reportes" ? "#fff" : "#f44336", "&:hover": { background: "#f44336", color: "#fff" } }}
            >
              Reportes
              {reportesPendientes > 0 && (
                <Chip label={reportesPendientes} size="small" sx={{ ml: 1, height: 18, fontSize: "0.68rem", background: "rgba(255,255,255,0.25)", color: "inherit" }} />
              )}
            </Button>
          </Box>
        )}

        {activeView === "solicitudes" && (
          <ButtonGroup variant="contained" fullWidth disableElevation sx={{ mb: 4, borderRadius: 2, overflow: "hidden" }}>
            <Button sx={{ ...staticButtonStyle, backgroundColor: types.ALL ? theme.primaryBack : theme.secondaryBack }} onClick={() => setTypes({ ALL: true, PENDING: false, ACCEPTED: false, REJECTED: false })}>TODAS</Button>
            <Button sx={{ ...staticButtonStyle, backgroundColor: types.PENDING ? theme.primaryBack : theme.secondaryBack }} onClick={() => setTypes({ ALL: false, PENDING: true, ACCEPTED: false, REJECTED: false })}>PENDIENTES</Button>
            <Button sx={{ ...staticButtonStyle, backgroundColor: types.ACCEPTED ? theme.primaryBack : theme.secondaryBack }} onClick={() => setTypes({ ALL: false, PENDING: false, ACCEPTED: true, REJECTED: false })}>ACEPTADAS</Button>
            <Button sx={{ ...staticButtonStyle, backgroundColor: types.REJECTED ? theme.primaryBack : theme.secondaryBack }} onClick={() => setTypes({ ALL: false, PENDING: false, ACCEPTED: false, REJECTED: true })}>RECHAZADAS</Button>
          </ButtonGroup>
        )}

        {activeView === "reportes" && reportesPendientes > 0 && (
          <Box sx={{ mb: 2, p: 1.5, background: "rgba(244,67,54,0.08)", borderRadius: "10px", border: "1px solid rgba(244,67,54,0.2)" }}>
            <Typography sx={{ fontSize: "0.82rem", color: "#f44336" }}>
              Tienes {reportesPendientes} reporte{reportesPendientes !== 1 ? "s" : ""} pendiente{reportesPendientes !== 1 ? "s" : ""}.
              Al aceptar uno se abrirá automáticamente el chat con el reportador.
            </Typography>
          </Box>
        )}
      </Box>

      <Box sx={{ width: { xs: "100%", md: "80%", lg: "70%" }, display: "flex", flexDirection: "column", gap: 2, pb: 4 }}>
        {requestsToShow.length > 0 ? (
          requestsToShow.map((req) => (
            <RequestCard key={req.id} request={req} onAccept={onAccept} onReject={onReject} onDelete={handleOpenDelete} />
          ))
        ) : (
          <Typography sx={{ color: theme.secondaryText, textAlign: "center", mt: 4 }}>
            {activeView === "reportes" ? "No tienes reportes asignados" : "No tienes notificaciones"}
          </Typography>
        )}
      </Box>
    </Box>
  );
}