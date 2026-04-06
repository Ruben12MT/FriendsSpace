import React from "react";
import { IconButton, Box, Tooltip } from "@mui/material";
import NightlightIcon from '@mui/icons-material/Nightlight';
import SunnyIcon from '@mui/icons-material/Sunny';
import { useAppTheme } from "../hooks/useAppTheme";
import appThemeStore from "../store/appThemeStore";

export default function ThemeToggler({ block }) {
  const theme = useAppTheme();
  const setAppTheme = appThemeStore((state) => state.setAppTheme);

  const isDark = theme.name === "dark";

  const containerSx = block
    ? { display: "inline-block" }
    : {
        position: "fixed",
        top: "16px",
        right: "16px",
        zIndex: 9999,
      };

  const handleToggle = () => {
    setAppTheme(isDark ? "default" : "dark");
  };

  return (
    <Box sx={containerSx}>
      <Tooltip title="Cambiar el tema de la app">
        <IconButton onClick={handleToggle}>
          {!isDark ? (
            <SunnyIcon 
              sx={{ 
                color: block ? theme.primaryText : theme.primaryBack, 
                fontSize: 19 
              }} 
            />
          ) : (
            <NightlightIcon 
              sx={{ 
                color: block ? theme.primaryText : theme.fieldsText, 
                fontSize: 19 
              }} 
            />
          )}
        </IconButton>
      </Tooltip>
    </Box>
  );
}