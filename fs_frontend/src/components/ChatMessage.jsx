import React from "react";
import { Box, Avatar, Typography } from "@mui/material";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import DownloadIcon from "@mui/icons-material/Download";
import { useAppTheme } from "../hooks/useAppTheme";

export default function ChatMessage({ message, isMine, friendAvatarUrl, onContextMenu }) {
  const theme = useAppTheme();
  const accent = theme.accent || theme.primaryBack;
  const isDark = theme.name === "dark";

  const myBubbleBg = isDark ? accent : `linear-gradient(135deg, ${accent}, ${theme.variantBack || accent})`;
  const myBubbleText = isDark ? "#1a1200" : "#ffffff";
  const theirBubbleBg = theme.secondaryBack;
  const textColor = theme.primaryText;
  const subtleColor = theme.mutedText || theme.secondaryText;

  const handleDownload = async (messageId, fileName) => {
    try {
      const res = await fetch(
        `${window.__APP_CONFIG__?.API_URL}/messages/${messageId}/download`,
        { credentials: "include" }
      );
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = fileName || "archivo";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);
    } catch (e) {
      console.error(e);
    }
  };

  const renderMessageContent = () => {
    if (message.deleted) {
      return (
        <Typography sx={{ fontSize: "0.82rem", fontStyle: "italic", opacity: 0.5, color: isMine ? myBubbleText : textColor }}>
          Mensaje eliminado
        </Typography>
      );
    }

    switch (message.type) {
      case "IMAGE":
        return (
          <Box
            component="img"
            src={message.url}
            sx={{ maxWidth: 220, maxHeight: 200, borderRadius: "10px", display: "block", cursor: "pointer" }}
            onClick={() => window.open(message.url, "_blank")}
          />
        );
      case "VIDEO":
        return <Box component="video" src={message.url} controls sx={{ maxWidth: 220, borderRadius: "10px", display: "block" }} />;
      case "AUDIO":
        return <Box component="audio" src={message.url} controls sx={{ width: 200, display: "block" }} />;
      case "FILE":
        return (
          <Box
            display="flex" alignItems="center" gap={1.5}
            onClick={() => handleDownload(message.id, message.body)}
            sx={{ cursor: "pointer", p: 0.5, borderRadius: "8px", transition: "opacity 0.15s", "&:hover": { opacity: 0.75 } }}
          >
            <Box sx={{ width: 36, height: 36, borderRadius: "8px", background: isMine ? "rgba(255,255,255,0.2)" : `${accent}25`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <InsertDriveFileIcon sx={{ color: isMine ? myBubbleText : accent, fontSize: 20 }} />
            </Box>
            <Box sx={{ minWidth: 0 }}>
              <Typography sx={{ fontSize: "0.82rem", color: isMine ? myBubbleText : textColor, fontWeight: 600, lineHeight: 1.3 }} noWrap>
                {message.body || "Archivo"}
              </Typography>
              <Box display="flex" alignItems="center" gap={0.5}>
                <DownloadIcon sx={{ fontSize: 11, color: isMine ? `${myBubbleText}99` : subtleColor }} />
                <Typography sx={{ fontSize: "0.7rem", color: isMine ? `${myBubbleText}99` : subtleColor }}>Descargar</Typography>
              </Box>
            </Box>
          </Box>
        );
      default:
        return (
          <Typography sx={{ fontSize: "0.875rem", color: isMine ? myBubbleText : textColor, wordBreak: "break-word", lineHeight: 1.5 }}>
            {message.body}
          </Typography>
        );
    }
  };

  const hasReply = message.parent_message && !message.parent_message.deleted;
  const bubbleBorderRadius = isMine
    ? hasReply ? "0 0 4px 12px" : "12px 4px 12px 12px"
    : hasReply ? "0 0 12px 4px" : "4px 12px 12px 12px";

  return (
    <Box
      sx={{ display: "flex", justifyContent: isMine ? "flex-end" : "flex-start", mb: 0.25 }}
    >
      {!isMine && (
        <Avatar src={friendAvatarUrl || "/no_user_avatar_image.png"} sx={{ width: 24, height: 24, mr: 0.75, mt: 0.5, flexShrink: 0 }} />
      )}

      <Box
        sx={{ maxWidth: "65%" }}
        onContextMenu={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onContextMenu(e, message);
        }}
      >
        {hasReply && (
          <Box sx={{ mb: 0.5, px: 1.5, py: 0.75, borderLeft: `3px solid ${accent}`, borderRadius: "8px 8px 0 0", background: `${accent}18` }}>
            <Typography sx={{ fontSize: "0.72rem", fontWeight: 700, color: accent, mb: 0.25 }}>
              {message.parent_message.author?.name}
            </Typography>
            <Typography sx={{ fontSize: "0.75rem", color: textColor, opacity: 0.8 }} noWrap>
              {message.parent_message.body || "Archivo multimedia"}
            </Typography>
          </Box>
        )}

        <Box
          sx={{
            px: 1.5, py: 1,
            background: isMine ? myBubbleBg : theirBubbleBg,
            borderRadius: bubbleBorderRadius,
            boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
            cursor: "context-menu",
          }}
        >
          {renderMessageContent()}

          <Box display="flex" alignItems="center" justifyContent="flex-end" gap={0.5} mt={0.25}>
            {message.is_edited && !message.deleted && (
              <Typography sx={{ fontSize: "0.65rem", color: isMine ? (isDark ? "rgba(26,18,0,0.6)" : "rgba(255,255,255,0.6)") : subtleColor }}>
                editado
              </Typography>
            )}
            <Typography sx={{ fontSize: "0.65rem", color: isMine ? (isDark ? "rgba(26,18,0,0.6)" : "rgba(255,255,255,0.65)") : subtleColor }}>
              {message.createdAt ? new Date(message.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : ""}
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
