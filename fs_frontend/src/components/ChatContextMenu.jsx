import React from "react";
import { Box } from "@mui/material";
import ReplyIcon from "@mui/icons-material/Reply";
import EditIcon from "@mui/icons-material/Edit";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import { useAppTheme } from "../hooks/useAppTheme";

export default function ChatContextMenu({ x, y, message, isMine, onReply, onEdit, onDelete, onClose }) {
  const theme = useAppTheme();
  const accent = theme.accent || theme.primaryBack;
  const textColor = theme.primaryText;
  const backgroundColor = theme.secondaryBack;
  const borderColor = theme.name === "dark" ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.08)";

  const menuItemStyle = {
    display: "flex", alignItems: "center", gap: 1.5,
    px: 2, py: 1, cursor: "pointer", fontSize: "0.85rem",
  };

  return (
    <Box
      onClick={(e) => e.stopPropagation()}
      sx={{
        position: "fixed", top: y, left: x, zIndex: 9999,
        background: backgroundColor, border: `1px solid ${borderColor}`,
        borderRadius: "12px", boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
        minWidth: 160, overflow: "hidden", py: 0.5,
      }}
    >
      <Box
        onClick={() => { onReply(message); onClose(); }}
        sx={{ ...menuItemStyle, color: textColor, "&:hover": { background: `${accent}15`, color: accent } }}
      >
        <ReplyIcon fontSize="small" sx={{ opacity: 0.7 }} />
        Responder
      </Box>

      {isMine && message.type === "TEXT" && (
        <Box
          onClick={() => { onEdit(message); onClose(); }}
          sx={{ ...menuItemStyle, color: textColor, "&:hover": { background: `${accent}15`, color: accent } }}
        >
          <EditIcon fontSize="small" sx={{ opacity: 0.7 }} />
          Editar
        </Box>
      )}

      {isMine && (
        <Box
          onClick={() => { onDelete(message); onClose(); }}
          sx={{ ...menuItemStyle, color: "#f44336", "&:hover": { background: "rgba(244,67,54,0.08)" } }}
        >
          <DeleteOutlineIcon fontSize="small" sx={{ opacity: 0.8 }} />
          Borrar para todos
        </Box>
      )}
    </Box>
  );
}
