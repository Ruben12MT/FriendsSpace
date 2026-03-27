import React from "react";
import { Box, Avatar, Typography } from "@mui/material";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import { useAppTheme } from "../hooks/useAppTheme";

export default function ChatMessage({ message, isMine, friendAvatarUrl, onContextMenu }) {
  const theme = useAppTheme();
  const accentColor = theme.primaryBack;
  const textColor = theme.primaryText;
  const subtleColor = theme.secondaryText;

  const renderMessageContent = () => {
    if (message.deleted) {
      return (
        <Typography sx={{ fontSize: "0.82rem", fontStyle: "italic", opacity: 0.5, color: textColor }}>
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
        return (
          <Box
            component="video"
            src={message.url}
            controls
            sx={{ maxWidth: 220, borderRadius: "10px", display: "block" }}
          />
        );
      case "AUDIO":
        return (
          <Box component="audio" src={message.url} controls sx={{ width: 200, display: "block" }} />
        );
      case "FILE":
        return (
          <Box
            display="flex"
            alignItems="center"
            gap={1}
            sx={{ cursor: "pointer" }}
            onClick={() => window.open(message.url, "_blank")}
          >
            <InsertDriveFileIcon sx={{ color: accentColor }} />
            <Typography sx={{ fontSize: "0.82rem", color: textColor }}>Descargar archivo</Typography>
          </Box>
        );
      default:
        return (
          <Typography sx={{ fontSize: "0.875rem", color: textColor, wordBreak: "break-word", lineHeight: 1.5 }}>
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
      onContextMenu={(e) => onContextMenu(e, message)}
      sx={{ display: "flex", justifyContent: isMine ? "flex-end" : "flex-start", mb: 0.25 }}
    >
      {!isMine && (
        <Avatar
          src={friendAvatarUrl || "/no_user_avatar_image.png"}
          sx={{ width: 24, height: 24, mr: 0.75, mt: 0.5, flexShrink: 0 }}
        />
      )}

      <Box sx={{ maxWidth: "65%" }}>
        {hasReply && (
          <Box sx={{
            mb: 0.5, px: 1.5, py: 0.75,
            borderLeft: `3px solid ${accentColor}`,
            borderRadius: "8px 8px 0 0",
            background: `${accentColor}18`,
          }}>
            <Typography sx={{ fontSize: "0.72rem", fontWeight: 700, color: accentColor, mb: 0.25 }}>
              {message.parent_message.author?.name}
            </Typography>
            <Typography sx={{ fontSize: "0.75rem", color: textColor, opacity: 0.8 }} noWrap>
              {message.parent_message.body || "Archivo multimedia"}
            </Typography>
          </Box>
        )}

        <Box sx={{
          px: 1.5, py: 1,
          background: isMine
            ? `linear-gradient(135deg, ${accentColor}, ${theme.variantBack})`
            : theme.secondaryBack,
          borderRadius: bubbleBorderRadius,
          boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
          cursor: "context-menu",
        }}>
          {renderMessageContent()}

          <Box display="flex" alignItems="center" justifyContent="flex-end" gap={0.5} mt={0.25}>
            {message.is_edited && !message.deleted && (
              <Typography sx={{ fontSize: "0.65rem", color: isMine ? "rgba(255,255,255,0.6)" : subtleColor }}>
                editado
              </Typography>
            )}
            <Typography sx={{ fontSize: "0.65rem", color: isMine ? "rgba(255,255,255,0.65)" : subtleColor }}>
              {message.createdAt
                ? new Date(message.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                : ""}
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
