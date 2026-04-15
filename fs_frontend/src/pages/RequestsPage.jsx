import React, { useState, useEffect, useContext, useCallback } from "react";
import { Box, Typography, Button, ButtonGroup, Chip } from "@mui/material";
import { useNavigate } from "react-router-dom";
import DeleteSweepIcon from "@mui/icons-material/DeleteSweep";
import ReportIcon from "@mui/icons-material/Report";
import NotificationsIcon from "@mui/icons-material/Notifications";
import { useAppTheme } from "../hooks/useAppTheme";
import { useUser } from "../hooks/useUser";
import api from "../utils/api";
import RequestCard from "../components/RequestCard";
import ConfirmModal from "../components/ConfirmModal";
import { SocketContext } from "../context/SocketContext";
import useAuthStore from "../store/useAuthStore";
import { useError } from "../context/ErrorContext";

export default function RequestsPages() {
  const theme = useAppTheme();
  const { loggedUser } = useUser();
  const { socket } = useContext(SocketContext);
  const navigate = useNavigate();
  const resetUnread = useAuthStore((state) => state.resetUnread);
  const { showError } = useError();

  const accent = theme.accent || theme.primaryBack;
  const isDark = theme.name === "dark";
  const isAdmin = loggedUser?.role === "ADMIN" || loggedUser?.role === "DEVELOPER";

  const [activeView, setActiveView] = useState("solicitudes");
  const [allUserRequests, setAllUserRequests] = useState([]);
  const [allReports, setAllReports] = useState([]);
  const [requestsToShow, setRequestsToShow] = useState([]);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [openClearModal, setOpenClearModal] = useState(false);
  const [requestToDelete, setRequestToDelete] = useState(null);
  const [filter, setFilter] = useState("ALL");

  const filterBtnSx = (type) => ({
    flex: 1, py: 1.25, fontWeight: 700, fontSize: { xs: "0.7rem", sm: "0.8rem" },
    textTransform: "none",
    backgroundColor: filter === type ? accent : theme.secondaryBack,
    color: filter === type ? (isDark ? "#1a1200" : "#ffffff") : theme.primaryText,
    border: `1px solid ${accent}40 !important`,
    transition: "all 0.2s ease",
    "&:hover": { backgroundColor: filter === type ? accent : `${accent}15`, color: filter === type ? (isDark ? "#1a1200" : "#ffffff") : accent },
  });

  const sortRequests = (lista) => [...lista].sort((a, b) => new Date(b.updated_at || b.created_at) - new Date(a.updated_at || a.created_at));

  const fetchAll = useCallback(async () => {
    try {
      const res = await api.get("/requests/list");
      if (res.data.ok && loggedUser) {
        const todasLasRequests = res.data.datos;
        const solicitudes = todasLasRequests.filter((r) => !r.is_report);
        const reportes = todasLasRequests.filter((r) => {
          if (!r.is_report) return false;
          if (isAdmin && r.receiver_id === loggedUser.id) return true;
          if (!isAdmin && r.sender_id === loggedUser.id) return true;
          return false;
        });
        setAllUserRequests(sortRequests(solicitudes));
        setAllReports(sortRequests(reportes));
      }
    } catch (error) { console.error(error.message); }
  }, [loggedUser, isAdmin]);

  useEffect(() => { if (loggedUser) fetchAll(); }, [fetchAll]);

  useEffect(() => {
    if (!socket || !loggedUser) return;
    const handleNewRequest = (payload) => {
      const data = payload.data || payload;
      if (data.is_report) {
        setAllReports((prev) => prev.find((r) => r.id === data.id) ? prev : sortRequests([data, ...prev]));
      } else {
        const fmt = { ...data, sender: data.sender || { id: data.sender_id, name: "Usuario" }, created_at: data.created_at || new Date().toISOString() };
        setAllUserRequests((prev) => prev.find((r) => r.id === fmt.id) ? prev : sortRequests([fmt, ...prev]));
      }
    };
    const handleUpdatedRequest = (payload) => {
      const data = payload.data || payload;
      if (data.is_report && data.sender_id === loggedUser?.id) setActiveView("reportes");
      if (data.is_report) {
        setAllReports((prev) => {
          const existe = prev.find((r) => r.id === data.id);
          if (existe) return sortRequests(prev.map((r) => r.id === data.id ? { ...r, ...data } : r));
          if (data.sender_id === loggedUser?.id) return sortRequests([data, ...prev]);
          return prev;
        });
      } else {
        setAllUserRequests((prev) => sortRequests(prev.map((r) => r.id === data.id ? { ...r, ...data } : r)));
      }
    };
    socket.on("nueva_solicitud", handleNewRequest);
    socket.on("solicitud_respondida", handleUpdatedRequest);
    socket.on("nuevo_reporte", handleNewRequest);
    return () => {
      socket.off("nueva_solicitud", handleNewRequest);
      socket.off("solicitud_respondida", handleUpdatedRequest);
      socket.off("nuevo_reporte", handleNewRequest);
    };
  }, [socket, loggedUser, isAdmin]);

  useEffect(() => { api.put("/requests/read-all", {}).catch(() => {}); resetUnread(); }, [resetUnread]);

  useEffect(() => {
    if (activeView === "reportes") setRequestsToShow(allReports);
    else {
      const filtered = filter === "ALL" ? allUserRequests : allUserRequests.filter((r) => r.status === filter);
      setRequestsToShow(filtered);
    }
  }, [allUserRequests, allReports, filter, activeView]);

  const handleViewReportes = () => {
    setActiveView("reportes");
    setAllReports((prev) => prev.map((r) => ({ ...r, is_read_sender: true, is_read_receiver: true })));
  };

  const confirmDelete = async () => {
    if (!requestToDelete) return;
    try {
      const res = await api.put(`/requests/${requestToDelete}/invisible`);
      if (res.data.ok) {
        setAllUserRequests((prev) => prev.filter((r) => r.id !== requestToDelete));
        setAllReports((prev) => prev.filter((r) => r.id !== requestToDelete));
      }
    } catch (e) { showError("No se pudo eliminar la notificación.", "Inténtalo de nuevo más tarde."); }
    finally { setOpenDeleteModal(false); setRequestToDelete(null); }
  };

  const confirmClearAll = async () => {
    if (activeView === "reportes") {
      const reportesAccionados = allReports.filter((r) => r.status !== "PENDING");
      try { await Promise.all(reportesAccionados.map((r) => api.put(`/requests/${r.id}/invisible`))); setAllReports((prev) => prev.filter((r) => r.status === "PENDING")); }
      catch (e) { showError("No se pudieron limpiar los reportes.", "Inténtalo de nuevo más tarde."); } finally { setOpenClearModal(false); }
    } else {
      const solicitudesLeidas = allUserRequests.filter((r) => r.status !== "PENDING");
      try { await Promise.all(solicitudesLeidas.map((r) => api.put(`/requests/${r.id}/invisible`))); setAllUserRequests((prev) => prev.filter((r) => r.status === "PENDING")); }
      catch (e) { showError("No se pudieron limpiar las notificaciones.", "Inténtalo de nuevo más tarde."); } finally { setOpenClearModal(false); }
    }
  };

  const onAction = async (idReq, action) => {
    try {
      const res = await api.put(`/requests/${idReq}/${action}`);
      if (res.data.ok) {
        const connectionId = res.data.connectionId;
        const changes = { status: action === "accept" ? "ACCEPTED" : "REJECTED", updated_at: new Date().toISOString(), ...(connectionId && { connection_id: connectionId }) };
        const update = (prev) => sortRequests(prev.map((r) => r.id === idReq ? { ...r, ...changes } : r));
        setAllUserRequests(update);
        setAllReports(update);
        if (action === "accept" && activeView === "reportes" && connectionId) navigate("/app/chats", { state: { openConnectionId: connectionId } });
      }
    } catch (e) { showError("No se pudo procesar la solicitud.", "Inténtalo de nuevo más tarde."); }
  };

  const unreadReports = allReports.filter((r) => isAdmin ? !r.is_read_receiver : !r.is_read_sender).length;
  const pendingRequests = allUserRequests.filter((r) => r.status === "PENDING").length;
  const hayReportesAccionados = allReports.some((r) => r.status !== "PENDING");
  const haySolicitudesLeidas = allUserRequests.some((r) => r.status !== "PENDING");

  return (
    <Box sx={{ position: "fixed", top: "52px", left: { xs: 0, sm: "68px" }, right: 0, bottom: { xs: "56px", sm: 0 }, display: "flex", flexDirection: "column", alignItems: "center", p: { xs: 2, md: 3 }, overflowY: "auto", background: theme.primaryBack }}>
      <ConfirmModal open={openDeleteModal} handleClose={() => setOpenDeleteModal(false)} onConfirm={confirmDelete} title="Eliminar notificación" message="¿Estás seguro de que quieres ocultar esta notificación?" />
      <ConfirmModal open={openClearModal} handleClose={() => setOpenClearModal(false)} onConfirm={confirmClearAll}
        title={activeView === "reportes" ? "Limpiar reportes respondidos" : "Limpiar notificaciones"}
        message={activeView === "reportes" ? "Se ocultarán todos los reportes aceptados y desestimados." : "Se ocultarán todas las notificaciones leídas."} />

      <Box sx={{ width: { xs: "100%", md: "80%", lg: "65%" }, flexShrink: 0 }}>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
          <Typography sx={{ fontWeight: 800, fontSize: { xs: "1.3rem", md: "1.6rem" }, color: theme.primaryText }}>
            {activeView === "reportes" ? (isAdmin ? "Reportes asignados" : "Mis reportes") : "Notificaciones"}
          </Typography>
          {activeView === "solicitudes" && haySolicitudesLeidas && (
            <Button size="small" startIcon={<DeleteSweepIcon />} onClick={() => setOpenClearModal(true)} sx={{ color: theme.mutedText, textTransform: "none", borderRadius: "10px", fontSize: { xs: "0.75rem", sm: "0.875rem" } }}>
              Limpiar leídas
            </Button>
          )}
          {activeView === "reportes" && hayReportesAccionados && (
            <Button size="small" startIcon={<DeleteSweepIcon />} onClick={() => setOpenClearModal(true)} sx={{ color: theme.mutedText, textTransform: "none", borderRadius: "10px", fontSize: { xs: "0.75rem", sm: "0.875rem" } }}>
              Limpiar respondidos
            </Button>
          )}
        </Box>

        <Box display="flex" gap={1} mb={3}>
          <Button startIcon={<NotificationsIcon />} onClick={() => setActiveView("solicitudes")} variant={activeView === "solicitudes" ? "contained" : "outlined"}
            sx={{ borderRadius: "10px", textTransform: "none", background: activeView === "solicitudes" ? accent : "transparent", borderColor: accent, color: activeView === "solicitudes" ? (isDark ? "#1a1200" : "#fff") : accent, "&:hover": { background: accent, color: isDark ? "#1a1200" : "#fff" }, fontSize: { xs: "0.75rem", sm: "0.875rem" } }}>
            Solicitudes{" "}
            {pendingRequests > 0 && <Chip label={pendingRequests} size="small" sx={{ ml: 1, height: 18, fontSize: "0.68rem", background: activeView === "solicitudes" ? "rgba(0,0,0,0.2)" : accent, color: "#fff", fontWeight: 700 }} />}
          </Button>
          <Button startIcon={<ReportIcon />} onClick={handleViewReportes} variant={activeView === "reportes" ? "contained" : "outlined"}
            sx={{ borderRadius: "10px", textTransform: "none", background: activeView === "reportes" ? "#f44336" : "transparent", borderColor: "#f44336", color: activeView === "reportes" ? "#fff" : "#f44336", "&:hover": { background: "#f44336", color: "#fff" }, fontSize: { xs: "0.75rem", sm: "0.875rem" } }}>
            Reportes{" "}
            {unreadReports > 0 && <Chip label={unreadReports} size="small" sx={{ ml: 1, height: 18, fontSize: "0.68rem", background: activeView === "reportes" ? "rgba(0,0,0,0.2)" : "#f44336", color: "#fff", fontWeight: 700 }} />}
          </Button>
        </Box>

        {activeView === "solicitudes" && (
          <ButtonGroup fullWidth sx={{ mb: 3, borderRadius: "12px", overflow: "hidden" }}>
            {["ALL", "PENDING", "ACCEPTED", "REJECTED"].map((type) => (
              <Button key={type} sx={filterBtnSx(type)} onClick={() => setFilter(type)}>
                {type === "ALL" ? "Todas" : type === "PENDING" ? "Pendientes" : type === "ACCEPTED" ? "Aceptadas" : "Rechazadas"}
              </Button>
            ))}
          </ButtonGroup>
        )}
      </Box>

      <Box sx={{ width: { xs: "100%", md: "80%", lg: "65%" }, display: "flex", flexDirection: "column", gap: 1.5, pb: 4 }}>
        {requestsToShow.length > 0 ? (
          requestsToShow.map((req) => (
            <RequestCard key={req.id} request={req} onAccept={() => onAction(req.id, "accept")} onReject={() => onAction(req.id, "reject")} onDelete={() => { setRequestToDelete(req.id); setOpenDeleteModal(true); }} />
          ))
        ) : (
          <Box sx={{ textAlign: "center", mt: 8, opacity: 0.5 }}>
            <NotificationsIcon sx={{ fontSize: 48, color: theme.mutedText, mb: 1 }} />
            <Typography sx={{ color: theme.mutedText }}>
              {activeView === "reportes" ? "No tienes reportes" : "Sin notificaciones"}
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
}