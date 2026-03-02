import { Grid, Typography, IconButton } from "@mui/material";
import React, { useState } from "react";
import DeleteIcon from "@mui/icons-material/Delete";

export default function InterestItem({ title, color, variant, onDelete  }) {
  const [hovered, setHovered] = useState(false);

  return (
    <Grid
      sx={{
        color: color,
        borderRadius: 100,
        border: "solid 2px",
        background: "white",
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
