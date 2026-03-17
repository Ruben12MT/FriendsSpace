import * as React from "react";
import Popover from "@mui/material/Popover";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import ContrastIcon from "@mui/icons-material/Contrast";
import { Grid, IconButton, Box, Tooltip } from "@mui/material";
import SentimentVerySatisfiedTwoToneIcon from "@mui/icons-material/SentimentVerySatisfiedTwoTone";
import SentimentSatisfiedAltTwoToneIcon from "@mui/icons-material/SentimentSatisfiedAltTwoTone";
import themes, { useAppTheme } from "../hooks/useAppTheme";
import appThemeStore from "../store/appThemeStore";
import { useState } from "react";
import {useEffect, useRef } from "react";

export default function ThemeToggler({ block }) {
  const [anchorEl, setAnchorEl] = useState(null);
  const timerRef = useRef(null); // Ref para guardar el temporizador

  const theme = useAppTheme();
  const setAppTheme = appThemeStore((state) => state.setAppTheme);

  const open = Boolean(anchorEl);

  // Función para cerrar el popover
  const handleClose = () => {
    setAnchorEl(null);
    if (timerRef.current) clearTimeout(timerRef.current);
  };

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  // Función que inicia la cuenta atrás
  const startTimer = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      handleClose();
    }, 5000); // 5 segundos
  };

  // Función que detiene la cuenta atrás si el ratón entra
  const stopTimer = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
  };

  // Iniciar temporizador cuando se abre el popover
  useEffect(() => {
    if (open) {
      startTimer();
    }
    return () => stopTimer();
  }, [open]);

  const sx = block
    ? { display: "inline-block" }
    : {
        position: "fixed",
        top: "16px",
        right: "16px",
        zIndex: 2000,
      };

  return (
    <Box sx={sx}>
      <IconButton onClick={handleClick}>
        <Tooltip title={open ? "" : "Cambiar el tema de la app"}>
          <ContrastIcon sx={{ color: block ? theme.primaryText : theme.fieldsText }} />
        </Tooltip>
      </IconButton>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        disableRestoreFocus
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        // Eventos para controlar el ratón sobre el menú
        slotProps={{
          paper: {
            onMouseEnter: stopTimer, // Si el ratón entra, paramos el reloj
            onMouseLeave: startTimer, // Si el ratón sale, empieza la cuenta atrás
            sx: { p: 1 }
          }
        }}
      >
        <Box sx={{ display: 'flex', gap: 1 }}>
          {Object.entries(themes).map(([key, value]) => (
            <Tooltip key={key} title={'"' + key + '"'}>
              <IconButton
                onClick={() => {
                  setAppTheme(key);
                  handleClose();
                }}
              >
                {key === theme.name ? (
                  <SentimentVerySatisfiedTwoToneIcon
                    sx={{ color: value.primaryBack, fontSize: "30px" }}
                  />
                ) : (
                  <SentimentSatisfiedAltTwoToneIcon
                    sx={{ color: value.primaryBack }}
                  />
                )}
              </IconButton>
            </Tooltip>
          ))}
        </Box>
      </Popover>
    </Box>
  );
}