import React, { useState, useEffect, useContext, useCallback } from "react";
import { Box, Typography, Button, ButtonGroup, Tooltip, Chip } from "@mui/material";
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

export default function RequestsPages() {
  const theme = useAppTheme();
  const { loggedUser } = useUser();
  const { socket } = useContext(SocketContext);
  const navigate = useNavigate();
  const resetUnread = useAuthStore((state) => state.resetUnread);

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
    flex: 1, py: 1.25, fontWeight: 700, fontSize: "0.8rem",
    textTransform: "none",
    backgroundColor: filter === type ? accent : theme.secondaryBack,
    color: filter === type ? (isDark ? "#1a1200" : "#ffffff") : theme.primaryText,
    border: `1px solid ${accent}40 !important`,
    transition: "all 0.2s ease",
    "&:hover": {
      backgroundColor: filter === type ? accent : `${accent}15`,
      color: filter === type ? (isDark ? "#1a1200" : "#ffffff") : accent,
    },
  });

  const sortRequests = (lista) =>
    ([...lista].sort((a, b) => new Date(b.updated_at || b.created_at) - new Date(a.updated_at || a.created_at)));

  const fetchAll = useCallback(async () => {
    try {
      const res = await api.get("/requests/list");
      if (res.data.ok && loggedUser) {
        const solicitudes = res.data.datos.filter((r) => !r.is_report);
        const reportes = res.data.datos.filter((r) => r.is_report && r.receiver_id === loggedUser.id);
        setAllUserRequests(sortRequests(solicitudes));
        if (isAdmin) setAllReports(sortRequests(reportes));
      }
    } catch (error) { console.error(error.message); }
  }, [loggedUser, isAdmin]);

  useEffect(() => {
    if (loggedUser) fetchAll();
  }, [fetchAll]);

  useEffect(() => {
    if (!socket || !loggedUser) return;

    const handleNewRequest = (payload) => {
      const data = payload.data || payload;
      if (data.is_report) {
        if (isAdmin) setAllReports(prev => prev.find(r => r.id === data.id) ? prev : sortRequests([data, ...prev]));
      } else {
        const fmt = { ...data, sender: data.sender || { id: data.sender_id, name: "Usuario" }, created_at: data.created_at || new Date().toISOString() };
        setAllUserRequests(prev => prev.find(r => r.id === fmt.id) ? prev : sortRequests([fmt, ...prev]));
      }
    };

    const handleUpdatedRequest = (payload) => {
      const data = payload.data || payload;
      const updateFn = prev => sortRequests(prev.map(r => r.id === data.id ? { ...r, ...data } : r));
      setAllUserRequests(updateFn);
      setAllReports(updateFn);
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

  useEffect(() => {
    api.put("/requests/read-all", {}).catch(() => {});
    resetUnread();
  }, [resetUnread]);

  useEffect(() => {
    if (activeView === "reportes") {
      setRequestsToShow(allReports);
    } else {
      const filtered = filter === "ALL" 
        ? allUserRequests 
        : allUserRequests.filter(r => r.status === filter);
      setRequestsToShow(filtered);
    }
  }, [allUserRequests, allReports, filter, activeView]);

  const confirmDelete = async () => {
    if (!requestToDelete) return;
    try {
      const res = await api.put(`/requests/${requestToDelete}/invisible`);
      if (res.data.ok) {
        setAllUserRequests(prev => prev.filter(r => r.id !== requestToDelete));
        setAllReports(prev => prev.filter(r => r.id !== requestToDelete));
      }
    } catch (e) { console.error(e); }
    finally { setOpenDeleteModal(false); setRequestToDelete(null); }
  };

  const confirmClearAll = async () => {
    const toClear = allUserRequests.filter(r => r.status !== "PENDING");
    try {
      await Promise.all(toClear.map(r => api.put(`/requests/${r.id}/invisible`)));
      setAllUserRequests(prev => prev.filter(r => r.status === "PENDING"));
    } catch (e) { console.error(e); }
    finally { setOpenClearModal(false); }
  };

  const onAction = async (idReq, action) => {
    try {
      const res = await api.put(`/requests/${idReq}/${action}`);
      if (res.data.ok) {
        const changes = { status: action === "accept" ? "ACCEPTED" : "REJECTED", updated_at: new Date().toISOString() };
        const update = prev => sortRequests(prev.map(r => r.id === idReq ? { ...r, ...changes } : r));
        setAllUserRequests(update);
        setAllReports(update);

        if (action === "accept" && activeView === "reportes") {
          const report = allReports.find(r => r.id === idReq);
          if (report) {
            const conn = await api.get(`/connections/check/${report.sender_id}`);
            if (conn.data.exists) navigate("/app/chats", { state: { openConnectionId: conn.data.connection_id } });
          }
        }
      }
    } catch (e) { console.error(e); }
  };

  const pendingReports = allReports.filter(r => r.status === "PENDING").length;
  const pendingRequests = allUserRequests.filter(r => r.status === "PENDING").length;

  return (
    <Box sx={{
      position: "fixed", top: "52px", left: "68px", right: 0, bottom: 0,
      display: "flex", flexDirection: "column", alignItems: "center",
      p: 3, overflowY: "auto", background: theme.primaryBack,
    }}>
      <ConfirmModal open={openDeleteModal} handleClose={() => setOpenDeleteModal(false)} onConfirm={confirmDelete} title="Eliminar notificación" message="¿Estás seguro de que quieres ocultar esta notificación?" />
      <ConfirmModal open={openClearModal} handleClose={() => setOpenClearModal(false)} onConfirm={confirmClearAll} title="Limpiar notificaciones" message="Se ocultarán todas las notificaciones leídas." />

      <Box sx={{ width: { xs: "100%", md: "80%", lg: "65%" }, flexShrink: 0 }}>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
          <Typography sx={{ fontWeight: 800, fontSize: "1.6rem", color: theme.primaryText }}>
            {activeView === "reportes" ? "Reportes asignados" : "Notificaciones"}
          </Typography>
          {activeView === "solicitudes" && allUserRequests.some(r => r.status !== "PENDING") && (
            <Button size="small" startIcon={<DeleteSweepIcon />} onClick={() => setOpenClearModal(true)}
              sx={{ color: theme.mutedText, textTransform: "none", borderRadius: "10px" }}>
              Limpiar leídas
            </Button>
          )}
        </Box>

        {isAdmin && (
          <Box display="flex" gap={1} mb={3}>
            <Button
              startIcon={<NotificationsIcon />} onClick={() => setActiveView("solicitudes")}
              variant={activeView === "solicitudes" ? "contained" : "outlined"}
              sx={{ borderRadius: "10px", textTransform: "none", background: activeView === "solicitudes" ? accent : "transparent", color: activeView === "solicitudes" ? (isDark ? "#1a1200" : "#fff") : accent }}
            >
              Solicitudes {pendingRequests > 0 && <Chip label={pendingRequests} size="small" sx={{ ml: 1, height: 18 }} />}
            </Button>
            <Button
              startIcon={<ReportIcon />} onClick={() => setActiveView("reportes")}
              variant={activeView === "reportes" ? "contained" : "outlined"}
              sx={{ borderRadius: "10px", textTransform: "none", background: activeView === "reportes" ? "#f44336" : "transparent", color: activeView === "reportes" ? "#fff" : "#f44336" }}
            >
              Reportes {pendingReports > 0 && <Chip label={pendingReports} size="small" sx={{ ml: 1, height: 18 }} />}
            </Button>
          </Box>
        )}

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
            <RequestCard 
              key={req.id} 
              request={req} 
              onAccept={() => onAction(req.id, "accept")} 
              onReject={() => onAction(req.id, "reject")} 
              onDelete={() => { setRequestToDelete(req.id); setOpenDeleteModal(true); }} 
            />
          ))
        ) : (
          <Box sx={{ textAlign: "center", mt: 8, opacity: 0.5 }}>
            <NotificationsIcon sx={{ fontSize: 48, color: theme.mutedText, mb: 1 }} />
            <Typography sx={{ color: theme.mutedText }}>
              {activeView === "reportes" ? "Sin reportes asignados" : "Sin notificaciones"}
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
}