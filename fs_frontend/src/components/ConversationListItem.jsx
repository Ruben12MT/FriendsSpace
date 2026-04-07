import React from "react";
import { Box, Avatar, Typography } from "@mui/material";
import BlockIcon from "@mui/icons-material/Block";
import GradeIcon from "@mui/icons-material/Grade";
import { useAppTheme } from "../hooks/useAppTheme";
import { useUser } from "../hooks/useUser";

export default function ConversationListItem({ conversation, isActive, onSelect }) {
  const theme = useAppTheme();
  const { loggedUser } = useUser();
  const accent = theme.accent || theme.primaryBack;
  const textColor = theme.primaryText;
  const subtleColor = theme.mutedText || theme.secondaryText;

  const isBlocked = conversation.isBlocked;
  const lastMessage = conversation.last_message;
  const friendRole = conversation.friend?.role;
  const isAdmin = friendRole === "ADMIN";
  const isDeveloper = friendRole === "DEVELOPER";

  const formatTime = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    if (isToday) return date.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    if (diffDays < 7) return date.toLocaleDateString("es-ES", { weekday: "short" });
    return date.toLocaleDateString("es-ES", { day: "2-digit", month: "2-digit" });
  };

  const getLastMessagePreview = () => {
    if (!lastMessage) return null;
    const isMine = lastMessage.user_id === loggedUser?.id;
    const prefix = isMine ? "Tú: " : "";
    switch (lastMessage.type) {
      case "IMAGE": return `${prefix}📷 Imagen`;
      case "VIDEO": return `${prefix}🎥 Vídeo`;
      case "AUDIO": return `${prefix}🎵 Audio`;
      case "FILE": return `${prefix}📎 Archivo`;
      default: return `${prefix}${lastMessage.body || ""}`;
    }
  };

  const preview = getLastMessagePreview();

  return (
    <Box
      onClick={() => onSelect(conversation)}
      sx={{
        display: "flex", alignItems: "center", gap: 1.5,
        px: 2, py: 1.25, cursor: "pointer",
        opacity: isBlocked ? 0.45 : 1,
        background: isActive ? `${accent}18` : "transparent",
        borderLeft: `3px solid ${isActive ? accent : "transparent"}`,
        transition: "all 0.15s",
        "&:hover": { background: `${accent}10` },
      }}
    >
      <Box sx={{ position: "relative", flexShrink: 0 }}>
        <Avatar
          src={conversation.friend?.url_image || "/no_user_avatar_image.png"}
          sx={{ width: 42, height: 42, filter: isBlocked ? "grayscale(100%)" : "none" }}
        />
        {isBlocked && (
          <Box sx={{ position: "absolute", bottom: -2, right: -2, width: 16, height: 16, borderRadius: "50%", background: "#f44336", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <BlockIcon sx={{ fontSize: 10, color: "#fff" }} />
          </Box>
        )}
        {(isAdmin || isDeveloper) && !isBlocked && (
          <Box sx={{ position: "absolute", bottom: -2, right: -2, width: 16, height: 16, borderRadius: "50%", background: theme.secondaryBack, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <GradeIcon sx={{ fontSize: 12, color: isDeveloper ? "#00bcd4" : "#FFD700" }} />
          </Box>
        )}
      </Box>

      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box display="flex" alignItems="center" gap={0.5}>
            <Typography sx={{ fontWeight: 600, color: isBlocked ? subtleColor : textColor, fontSize: "0.875rem" }} noWrap>
              {conversation.friend?.name}
            </Typography>
            {(isAdmin || isDeveloper) && (
              <GradeIcon sx={{ fontSize: 12, color: isDeveloper ? "#00bcd4" : "#FFD700", flexShrink: 0 }} />
            )}
          </Box>
          {lastMessage && (
            <Typography sx={{ fontSize: "0.68rem", color: subtleColor, flexShrink: 0, ml: 1 }}>
              {formatTime(lastMessage.created_at)}
            </Typography>
          )}
        </Box>

        {isBlocked ? (
          <Typography sx={{ fontSize: "0.72rem", color: "#f44336", opacity: 0.8 }}>
            {conversation.blockedByMe ? "Bloqueado" : "No disponible"}
          </Typography>
        ) : preview ? (
          <Typography sx={{ fontSize: "0.75rem", color: subtleColor, opacity: 0.8 }} noWrap>
            {preview}
          </Typography>
        ) : (
          
          <Typography sx={{ fontSize: "0.75rem", color: subtleColor, opacity: 0.5, fontStyle: "italic" }}>
            Sin mensajes aún
          </Typography>
        )}
      </Box>
    </Box>
  );
}
