import React, { useState } from "react";
import { Grid, Typography } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { useAppTheme } from "../hooks/useAppTheme";

export default function InterestItem({ title, onDelete, variant = "default" }) {
  const [hovered, setHovered] = useState(false);
  const theme = useAppTheme();
  const accent = theme.accent || theme.primaryBack;
  const isDark = theme.name === "dark";

  const baseStyles = {
    position: "relative",
    alignItems: "center",
    display: "flex",
    cursor: onDelete ? "pointer" : "default",
  };

  const variants = {
    default: {
      ...baseStyles,
      color: theme.primaryText,
      borderRadius: 100,
      border: `2px solid ${accent}50`,
      background: theme.secondaryBack,
      py: 0.5, px: 1,
      "&:hover": { background: onDelete ? `${accent}20` : theme.secondaryBack },
    },
    ad: {
      ...baseStyles,
      color: isDark ? "#1a1200" : "#ffffff",
      borderRadius: 100,
      border: "none",
      background: accent,
      py: 0.25, px: 1,
      fontSize: "small",
    },
    select: {
      ...baseStyles,
      color: theme.primaryText,
      borderRadius: 2,
      background: theme.secondaryBack,
      border: `1px solid ${accent}30`,
      py: 0.5, px: 1,
      "&:hover": { color: accent, borderColor: `${accent}60` },
    },
    deselect: {
      ...baseStyles,
      color: theme.primaryText,
      borderRadius: 2,
      border: `1.5px solid ${accent}45`,
      background: `${accent}10`,
      py: 0.25, px: 0.75,
      "&:hover": { background: onDelete ? `${accent}25` : `${accent}10` },
    },
  };

  return (
    <Grid
      justifyContent="center"
      sx={variants[variant]}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onDelete}
    >
      <Typography sx={{ px: 0.5, fontSize: "0.8rem", lineHeight: 1.4, whiteSpace: "nowrap" }}>
        {title}
      </Typography>
      {onDelete && (
        <DeleteIcon
          fontSize="small"
          sx={{
            color: "red",
            ml: 0.25,
            visibility: hovered ? "visible" : "hidden",
            opacity: hovered ? 1 : 0,
            transition: "opacity 0.2s",
          }}
        />
      )}
    </Grid>
  );
}