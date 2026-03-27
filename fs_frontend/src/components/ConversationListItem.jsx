import React from "react";
import { Box, Avatar, Typography } from "@mui/material";
import { useAppTheme } from "../hooks/useAppTheme";

export default function ConversationListItem({ conversation, isActive, onSelect }) {
  const theme = useAppTheme();
  const accentColor = theme.primaryBack;
  const textColor = theme.primaryText;

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
        background: isActive ? `${accentColor}18` : "transparent",
        borderLeft: `3px solid ${isActive ? accentColor : "transparent"}`,
        transition: "all 0.15s",
        "&:hover": { background: `${accentColor}10` },
      }}
    >
      <Avatar
        src={conversation.friend?.url_image || "/no_user_avatar_image.png"}
        sx={{ width: 40, height: 40 }}
      />
      <Typography sx={{ fontWeight: 600, color: textColor, fontSize: "0.875rem" }} noWrap>
        {conversation.friend?.name}
      </Typography>
    </Box>
  );
}
