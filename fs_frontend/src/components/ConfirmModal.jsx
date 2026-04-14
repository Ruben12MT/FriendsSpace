import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Button,
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useAppTheme } from "../hooks/useAppTheme";

export default function ConfirmModal({
  open,
  handleClose,
  onCancel = () => {},
  onConfirm,
  title,
  message,
  cancelLabel = "Cancelar",
}) {
  const theme = useAppTheme();
  const accent = theme.accent || theme.primaryBack;
  const isDark = theme.name === "dark";

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      PaperProps={{
        sx: {
          borderRadius: "20px",
          background: theme.secondaryBack,
          border: `1px solid ${accent}20`,
          boxShadow: isDark
            ? "0 24px 60px rgba(0,0,0,0.6)"
            : "0 24px 60px rgba(0,0,0,0.12)",
          minWidth: { xs: "90vw", sm: 420 },
          maxWidth: 480,
        },
      }}
    >
      <DialogTitle sx={{ pb: 1, pt: 2.5, px: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography
            sx={{
              fontWeight: 700,
              fontSize: "1.1rem",
              color: theme.primaryText,
            }}
          >
            {title}
          </Typography>
          <IconButton
            size="small"
            onClick={handleClose}
            sx={{
              color: theme.mutedText,
              "&:hover": { color: theme.primaryText },
            }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ px: 3, py: 1.5 }}>
        <Box
          sx={{ color: theme.fieldsText, fontSize: "0.9rem", lineHeight: 1.6 }}
        >
          {message}
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3, pt: 1.5, gap: 1.5 }}>
        <Button
          fullWidth
          variant="outlined"
          onClick={() => {
            onCancel();
            handleClose();
          }}
          sx={{
            borderColor: `${accent}40`,
            color: theme.mutedText,
            borderRadius: "10px",
            textTransform: "none",
            fontWeight: 600,
            "&:hover": {
              borderColor: accent,
              color: accent,
              background: `${accent}08`,
            },
          }}
        >
          {cancelLabel}
        </Button>
        <Button
          fullWidth
          variant="contained"
          onClick={onConfirm}
          sx={{
            background: `linear-gradient(135deg, ${accent}, ${theme.variantBack || accent})`,
            color: isDark ? "#1a1200" : "#fff",
            borderRadius: "10px",
            textTransform: "none",
            fontWeight: 700,
            boxShadow: `0 4px 12px ${accent}40`,
            "&:hover": { opacity: 0.9 },
          }}
        >
          Confirmar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
