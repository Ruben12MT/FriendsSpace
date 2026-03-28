import React from "react";
import { Box, Avatar, Typography } from "@mui/material";
import BlockIcon from "@mui/icons-material/Block";
import { useAppTheme } from "../hooks/useAppTheme";

export default function ConversationListItem({ conversation, isActive, onSelect }) {
  const theme = useAppTheme();
  const accentColor = theme.primaryBack;
  const textColor = theme.primaryText;
  const subtleColor = theme.secondaryText;

  const isBlocked = conversation.isBlocked;

  return (
    <Box
      onClick={() => onSelect(conversation)}
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1.5,
        px: 2,
        py: 1.5,
        cursor: "pointer",
        opacity: isBlocked ? 0.45 : 1,
        background: isActive ? `${accentColor}18` : "transparent",
        borderLeft: `3px solid ${isActive ? accentColor : "transparent"}`,
        transition: "all 0.15s",
        "&:hover": { background: `${accentColor}10` },
      }}
    >
      <Box sx={{ position: "relative", flexShrink: 0 }}>
        <Avatar
          src={conversation.friend?.url_image || "/no_user_avatar_image.png"}
          sx={{
            width: 40,
            height: 40,
            filter: isBlocked ? "grayscale(100%)" : "none",
          }}
        />
        {isBlocked && (
          <Box sx={{
            position: "absolute",
            bottom: -2, right: -2,
            width: 16, height: 16,
            borderRadius: "50%",
            background: "#f44336",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}>
            <BlockIcon sx={{ fontSize: 10, color: "#fff" }} />
          </Box>
        )}
      </Box>

      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Typography
          sx={{
            fontWeight: 600,
            color: isBlocked ? subtleColor : textColor,
            fontSize: "0.875rem",
          }}
          noWrap
        >
          {conversation.friend?.name}
        </Typography>
        {isBlocked && (
          <Typography sx={{ fontSize: "0.72rem", color: "#f44336", opacity: 0.8 }}>
            {conversation.blockedByMe ? "Bloqueado" : "No disponible"}
          </Typography>
        )}
      </Box>
    </Box>
  );
}