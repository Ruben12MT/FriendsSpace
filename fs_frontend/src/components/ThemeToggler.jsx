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

export default function ThemeToggler({block}) {
  const [anchorEl, setAnchorEl] = useState(null);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const theme = useAppTheme();
  const setAppTheme = appThemeStore((state) => state.setAppTheme);

  const open = Boolean(anchorEl);
  const id = open ? "simple-popover" : undefined;
  const sx = block ? {position: "block"} : {
        position: "fixed",
        top: "16px",
        right: "16px",
        zIndex: 2000,
      };
  return (
    <Box
      sx={sx}
    >
      <IconButton
        aria-describedby={id}
        aria-label="Cambiar tema"
        onClick={handleClick}
      >
        <Tooltip title={open ? "" : "Cambiar el tema de la app"}>
          <ContrastIcon sx={{ color: block ? theme.primaryText : theme.fieldsText }} />
        </Tooltip>
      </IconButton>
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
      >
        <Grid>
          {Object.entries(themes).map(([key, value]) => {
            return (
              <Tooltip key={key} title={'"' + key + '"'}>
                <IconButton
                  aria-describedby={id}
                  aria-label="Cambiar tema"
                  onClick={() => {
                    setAppTheme(key);
                  }}
                  sx={{}}
                >
                  {key === theme.name ? (
                    <SentimentVerySatisfiedTwoToneIcon
                      sx={{ color: value.primaryBack , fontSize: "30px" , borderRadius: 1000}}
                    />
                  ) : (
                    <SentimentSatisfiedAltTwoToneIcon
                      sx={{ color: value.primaryBack }}
                    />
                  )}
                </IconButton>
              </Tooltip>
            );
          })}
        </Grid>
      </Popover>
    </Box>
  );
}
