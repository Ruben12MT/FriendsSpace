import { Grid, Typography, IconButton } from "@mui/material";
import React, { useState } from "react";
import DeleteIcon from "@mui/icons-material/Delete";
import {useAppTheme} from "../hooks/useAppTheme"


export default function InterestItem({ title, onDelete, variant }) {
  const [hovered, setHovered] = useState(false);
  const theme = useAppTheme();
  return (
    <Grid
      sx={{
        color: theme.fieldsText,
        borderRadius: 100,
        border: "solid 2px",
        background: theme.primaryBack,
        p: 0.5,
        position: "relative",
        display: "inline-flex",
        alignItems: "center",
        cursor: onDelete ? "pointer" : "default",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onDelete}
    >
      <Typography sx={{ px: 1 }}>{title}</Typography>
      {hovered && onDelete && (
        <DeleteIcon fontSize="small" sx={{ color: "red" }} />
      )}
    </Grid>
  );
}
