import { Grid, Typography, IconButton } from "@mui/material";
import React, { useState } from "react";
import DeleteIcon from "@mui/icons-material/Delete";
import { useAppTheme } from "../hooks/useAppTheme";

export default function InterestItem({ title, onDelete, variant }) {
  const [hovered, setHovered] = useState(false);
  const theme = useAppTheme();
  return (
    <Grid
      justifyContent={"center"}
      sx={{
        color: theme.fieldsText,
        borderRadius: 100,
        border: "solid 2px",
        background: theme.secondaryBack,
        py: 0.5,
        px: 1,
        position: "relative",
        alignItems: "center",
        display: "flex",
        cursor: onDelete ? "pointer" : "default",
        "&:hover": { background: onDelete &&  theme.tertiaryBack },
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onDelete}
    >
      <Typography sx={{ px: 1 }}>{title}</Typography>
      {onDelete && (
        <DeleteIcon
          fontSize="small"
          sx={{
            color: "red",
            visibility: hovered ? "visible" : "hidden",
            opacity: hovered ? 1 : 0,
            transition: "opacity 0.5s",
          }}
        />
      )}
    </Grid>
  );
}
