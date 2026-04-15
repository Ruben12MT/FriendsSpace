import React from "react";
import {
  Dialog, DialogTitle, DialogContent, DialogContentText,
  DialogActions, Button, Box,
} from "@mui/material";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import { useError } from "../context/ErrorContext";
import { useAppTheme } from "../hooks/useAppTheme";

export default function ErrorDialog() {
  const { error, clearError } = useError();
  const theme = useAppTheme();
  const accent = theme.accent || theme.primaryBack;
  const isDark = theme.name === "dark";
  const dialogBg = isDark ? "#2c2c2c" : theme.secondaryBack;

  return (
    <Dialog
      open={!!error}
      onClose={clearError}
      PaperProps={{
        sx: {
          borderRadius: "20px",
          background: dialogBg,
          border: "1px solid rgba(244,67,54,0.3)",
          minWidth: { xs: "90vw", sm: 400 },
          maxWidth: 480,
          textAlign: "center",
        },
      }}
    >
      <DialogTitle sx={{ pt: 3.5, pb: 1, color: theme.primaryText, fontWeight: 700 }}>
        <Box display="flex" flexDirection="column" alignItems="center" gap={1}>
          <ErrorOutlineIcon sx={{ fontSize: 48, color: "#f44336" }} />
          Algo ha salido mal
        </Box>
      </DialogTitle>
      <DialogContent sx={{ pb: 1 }}>
        <DialogContentText sx={{ color: theme.primaryText, fontWeight: 500, mb: 1.5, fontSize: "0.95rem" }}>
          {error?.message}
        </DialogContentText>
        <DialogContentText sx={{ color: theme.mutedText, fontSize: "0.85rem", lineHeight: 1.6 }}>
          {error?.advice}
        </DialogContentText>
      </DialogContent>
      <DialogActions sx={{ justifyContent: "center", pb: 3, pt: 1 }}>
        <Button
          onClick={clearError}
          variant="contained"
          sx={{
            background: "#f44336",
            color: "#fff",
            borderRadius: "10px",
            textTransform: "none",
            fontWeight: 700,
            px: 4,
            "&:hover": { background: "#c62828" },
          }}
        >
          Entendido
        </Button>
      </DialogActions>
    </Dialog>
  );
}
