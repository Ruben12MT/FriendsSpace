import React, { useEffect, useState, useContext } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  Box,
  Avatar,
  Typography,
  IconButton,
  Tooltip,
  Badge,
  Menu,
  MenuItem,
  Divider,
  useMediaQuery,
  useTheme as useMuiTheme,
} from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";
import PersonSearchIcon from "@mui/icons-material/PersonSearch";
import CampaignIcon from "@mui/icons-material/Campaign";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import LogoutIcon from "@mui/icons-material/Logout";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import { SocketContext } from "../context/SocketContext.jsx";
import useAuthStore from "../store/useAuthStore.js";
import { useUser } from "../hooks/useUser";
import { useAppTheme } from "../hooks/useAppTheme";
import ThemeToggler from "../components/ThemeToggler";
import { useFirstLogin } from "../hooks/useFirstLogin";
import api from "../utils/api";

const SIDEBAR_W = 68;
const TOPBAR_H = 52;
const BOTTOM_NAV_H = 56;

export default function UserBar() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { loggedUser } = useUser();
  const theme = useAppTheme();
  const muiTheme = useMuiTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down("sm"));
  const { socket } = useContext(SocketContext);

  const unreadCount = useAuthStore((s) => s.unreadCount);
  const setUnreadCount = useAuthStore((s) => s.setUnreadCount);
  const incrementUnread = useAuthStore((s) => s.incrementUnread);
  const clearAuth = useAuthStore((s) => s.clearAuth);

  const [anchorElUser, setAnchorElUser] = useState(null);

  useFirstLogin();

  const estaEnRequests = pathname === "/app/requests";
  const isAdminOrDev =
    loggedUser?.role === "DEVELOPER" || loggedUser?.role === "ADMIN";

  const navItems = [
    {
      path: "/app/searchnewfriends",
      icon: <PersonSearchIcon />,
      label: isAdminOrDev ? "Buscar usuarios" : "Buscar amigos",
    },
    { path: "/app/ads", icon: <CampaignIcon />, label: "Anuncios" },
    { path: "/app/chats", icon: <ChatBubbleOutlineIcon />, label: "Chats" },
    ...(isAdminOrDev
      ? [
          {
            path: "/app/admins",
            icon: <AdminPanelSettingsIcon />,
            label: "Gestión de admins",
          },
        ]
      : []),
  ];

  useEffect(() => {
    if (unreadCount > 0) return;
    api
      .get("/requests/withoutread")
      .then((res) => setUnreadCount(res.data.numRequests))
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (!socket) return;
    const inc = () => {
      if (!estaEnRequests) incrementUnread();
    };
    socket.on("nueva_solicitud", inc);
    socket.on("solicitud_respondida", inc);
    socket.on("nuevo_reporte", inc);
    return () => {
      socket.off("nueva_solicitud", inc);
      socket.off("solicitud_respondida", inc);
      socket.off("nuevo_reporte", inc);
    };
  }, [socket, estaEnRequests, incrementUnread]);

  const logout = async () => {
    try {
      setAnchorElUser(null);
      await api.post("/users/logout/");
      if (socket) socket.disconnect();
      clearAuth();
      navigate("/");
    } catch (e) {
      console.error(e);
    }
  };

  const bg = theme.navBar.backColor;
  const fg = theme.navBar.textColor;
  const accent = theme.accent || theme.navBar.activeColor;
  const border = theme.navBar.borderColor;
  const hoverBg = theme.navBar.hoverBg;
  const activeBg = theme.navBar.activeBg;
  const isDark = theme.name === "dark";

  const isActive = (path) => pathname.startsWith(path);

  const SideNavBtn = ({ path, icon, label }) => {
    const active = isActive(path);
    return (
      <Tooltip title={label} placement="right">
        <Box
          sx={{
            position: "relative",
            width: "100%",
            display: "flex",
            justifyContent: "center",
          }}
        >
          {active && (
            <Box
              sx={{
                position: "absolute",
                left: 0,
                top: "50%",
                transform: "translateY(-50%)",
                width: 3,
                height: 22,
                borderRadius: "0 3px 3px 0",
                background: accent,
              }}
            />
          )}
          <IconButton
            onClick={() => navigate(path)}
            sx={{
              width: 44,
              height: 44,
              borderRadius: "12px",
              color: active ? accent : fg,
              background: active ? activeBg : "transparent",
              border: `1px solid ${active ? accent + "40" : "transparent"}`,
              transition: "all 0.15s ease",
              "&:hover": { background: hoverBg, color: accent },
            }}
          >
            {icon}
          </IconButton>
        </Box>
      </Tooltip>
    );
  };

  const BottomNavBtn = ({ path, icon, label }) => {
    const active = isActive(path);
    return (
      <Box
        onClick={() => navigate(path)}
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 0.25,
          cursor: "pointer",
          py: 0.5,
          color: active ? accent : fg,
          transition: "color 0.15s",
          "&:hover": { color: accent },
        }}
      >
        <Box
          sx={{
            position: "relative",
            width: 36,
            height: 36,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "10px",
            background: active ? activeBg : "transparent",
          }}
        >
          {React.cloneElement(icon, { sx: { fontSize: 22 } })}
        </Box>
        <Typography
          sx={{
            fontSize: "0.6rem",
            fontWeight: active ? 700 : 400,
            lineHeight: 1,
          }}
        >
          {label}
        </Typography>
      </Box>
    );
  };

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <Box
        sx={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          height: TOPBAR_H,
          zIndex: 1200,
          background: bg,
          borderBottom: `1px solid ${border}`,
          display: "flex",
          alignItems: "center",
          pl: isMobile ? 2 : `${SIDEBAR_W}px`,
          pr: 2,
          gap: 1,
        }}
      >
        {isMobile ? (
          <Box
            onClick={() => navigate("/")}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              cursor: "pointer",
              "&:hover": { opacity: 0.75 },
            }}
          >
            <Avatar src="/logo.png" sx={{ width: 28, height: 28 }} />
            <Typography
              variant="h6"
              sx={{
                color: theme.primaryText,
                fontWeight: 900,
                letterSpacing: -1,
              }}
            >
              Friends Space
            </Typography>
          </Box>
        ) : (
          <>
            <Box
              onClick={() => navigate("/")}
              sx={{
                position: "absolute",
                left: 0,
                top: 0,
                width: SIDEBAR_W,
                height: TOPBAR_H,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                transition: "opacity 0.15s",
                "&:hover": { opacity: 0.75 },
              }}
            >
              <Avatar src="/logo.png" sx={{ width: 30, height: 30 }} />
            </Box>
            <Typography
              onClick={() => navigate("/")}
              sx={{
                fontFamily: "monospace",
                fontWeight: 700,
                fontSize: "0.95rem",
                color: fg,
                letterSpacing: "0.06em",
                cursor: "pointer",
                userSelect: "none",
                "&:hover": { color: accent },
              }}
            >
              Friends Space
            </Typography>
          </>
        )}

        <Box sx={{ flex: 1 }} />

        <Tooltip title="Notificaciones">
          <IconButton
            onClick={() => navigate("/app/requests")}
            sx={{
              width: 36,
              height: 36,
              borderRadius: "10px",
              color: estaEnRequests ? accent : fg,
              background: estaEnRequests ? activeBg : "transparent",
              border: `1px solid ${estaEnRequests ? accent + "50" : "transparent"}`,
              transition: "all 0.15s",
              "&:hover": { background: hoverBg, color: accent },
            }}
          >
            <Badge
              badgeContent={unreadCount}
              color="error"
              sx={{
                "& .MuiBadge-badge": {
                  fontSize: "0.6rem",
                  minWidth: 15,
                  height: 15,
                  padding: "0 3px",
                },
              }}
            >
              <NotificationsIcon sx={{ fontSize: 19 }} />
            </Badge>
          </IconButton>
        </Tooltip>

        {isMobile && (
          <IconButton
            onClick={(e) => setAnchorElUser(e.currentTarget)}
            sx={{
              width: 36,
              height: 36,
              borderRadius: "10px",
              p: "4px",
              border: anchorElUser
                ? `2px solid ${accent}`
                : `2px solid transparent`,
              "&:hover": { border: `2px solid ${accent}70` },
            }}
          >
            <Avatar
              src={loggedUser?.url_image || "/no_user_avatar_image.png"}
              sx={{ width: 26, height: 26 }}
            />
          </IconButton>
        )}

        <ThemeToggler block={true} />
      </Box>

      {!isMobile && (
        <Box
          sx={{
            position: "fixed",
            top: 0,
            left: 0,
            width: SIDEBAR_W,
            height: "100vh",
            zIndex: 1100,
            background: bg,
            borderRight: `1px solid ${border}`,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            pt: `${TOPBAR_H}px`,
            pb: 2,
            boxSizing: "border-box",
          }}
        >
          <Box
            sx={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 0.5,
              pt: 2,
              width: "100%",
              px: "10px",
            }}
          >
            {navItems.map((item) => (
              <SideNavBtn key={item.path} {...item} />
            ))}
          </Box>
          <Box sx={{ width: "100%", px: "10px" }}>
            <Divider sx={{ mb: 1.5, borderColor: border }} />
            <Box sx={{ display: "flex", justifyContent: "center" }}>
              <Tooltip
                title={loggedUser?.name || "Mi perfil"}
                placement="right"
              >
                <IconButton
                  onClick={(e) => setAnchorElUser(e.currentTarget)}
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: "12px",
                    p: "4px",
                    border: anchorElUser
                      ? `2px solid ${accent}`
                      : `2px solid transparent`,
                    transition: "border 0.15s",
                    "&:hover": { border: `2px solid ${accent}70` },
                  }}
                >
                  <Avatar
                    src={loggedUser?.url_image || "/no_user_avatar_image.png"}
                    sx={{ width: 32, height: 32 }}
                  />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
        </Box>
      )}

      {isMobile && (
        <Box
          sx={{
            position: "fixed",
            bottom: 0,
            left: 0,
            right: 0,
            height: BOTTOM_NAV_H,
            zIndex: 1200,
            background: bg,
            borderTop: `1px solid ${border}`,
            display: "flex",
            alignItems: "stretch",
            px: 1,
          }}
        >
          {navItems.map((item) => (
            <BottomNavBtn key={item.path} {...item} />
          ))}
        </Box>
      )}

      <Menu
        anchorEl={anchorElUser}
        open={Boolean(anchorElUser)}
        onClose={() => setAnchorElUser(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{
          vertical: isMobile ? "bottom" : "bottom",
          horizontal: isMobile ? "right" : "left",
        }}
        PaperProps={{
          sx: {
            ml: isMobile ? 0 : "8px",
            borderRadius: "14px",
            background: bg,
            border: `1px solid ${border}`,
            boxShadow: isDark
              ? "0 8px 32px rgba(0,0,0,0.6)"
              : "0 8px 32px rgba(0,0,0,0.14)",
            minWidth: 190,
            overflow: "hidden",
          },
        }}
      >
        <Box sx={{ px: 2, py: 1.5, borderBottom: `1px solid ${border}` }}>
          <Typography
            sx={{
              fontWeight: 700,
              color: fg,
              fontSize: "0.875rem",
              lineHeight: 1.3,
            }}
          >
            {loggedUser?.name}
          </Typography>
          <Typography
            sx={{
              color: theme.mutedText || theme.secondaryText,
              fontSize: "0.72rem",
              mt: 0.25,
            }}
          >
            {loggedUser?.email || ""}
          </Typography>
        </Box>
        <MenuItem
          onClick={() => {
            setAnchorElUser(null);
            navigate("/app/" + loggedUser?.id);
          }}
          sx={{
            gap: 1.5,
            py: 1.2,
            color: fg,
            fontSize: "0.85rem",
            "&:hover": { background: hoverBg, color: accent },
          }}
        >
          <AccountCircleIcon fontSize="small" sx={{ opacity: 0.65 }} />
          Ver perfil
        </MenuItem>
        <Divider sx={{ borderColor: border }} />
        <MenuItem
          onClick={logout}
          sx={{
            gap: 1.5,
            py: 1.2,
            color: "#f44336",
            fontSize: "0.85rem",
            "&:hover": { background: "rgba(244,67,54,0.08)" },
          }}
        >
          <LogoutIcon fontSize="small" sx={{ opacity: 0.75 }} />
          Cerrar sesión
        </MenuItem>
      </Menu>

      <Box
        component="main"
        sx={{
          flex: 1,
          ml: isMobile ? 0 : `${SIDEBAR_W}px`,
          mt: `${TOPBAR_H}px`,
          mb: isMobile ? `${BOTTOM_NAV_H}px` : 0,
          minHeight: `calc(100vh - ${TOPBAR_H}px${isMobile ? ` - ${BOTTOM_NAV_H}px` : ""})`,
          display: "flex",
          flexDirection: "column",
          boxSizing: "border-box",
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
}
