import React from "react";
import { Modal, Box, Typography, IconButton, Tooltip } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import CheckIcon from "@mui/icons-material/Check";
import { useAppTheme } from "../hooks/useAppTheme";

export default function ConfirmModal({
  open,
  handleClose,
  onCancel = () => {},
  onConfirm,
  title,
  message,
}) {
  const theme = useAppTheme();

  return (
    <Modal open={open} onClose={handleClose}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 400,
          background: theme.secondaryBack,
          border: `${theme.primaryText} 2px solid`,
          borderRadius: 4,
          boxShadow: 24,
          p: 4,
          outline: "none",
        }}
      >
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={2}
        >
          <Typography
            variant="h6"
            sx={{ color: theme.primaryText, fontWeight: "bold" }}
          >
            {title}
          </Typography>
          <IconButton onClick={handleClose}>
            <CloseIcon sx={{ color: theme.primaryText }} />
          </IconButton>
        </Box>

        <Box sx={{ color: theme.fieldsText, mb: 4 }}>{message}</Box>

        <Box display="flex" justifyContent="space-around">
          <Tooltip title="Rechazar" arrow>
            <IconButton
              onClick={() => {
                onCancel();
                handleClose();
              }}
            >
              <CloseIcon sx={{ color: "#d32f2f" }} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Confirmar" arrow>
            <IconButton onClick={onConfirm}>
              <CheckIcon sx={{ color: "#2e7d32" }} />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
    </Modal>
  );
}
