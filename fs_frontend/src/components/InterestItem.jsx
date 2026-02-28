import { Grid, Typography } from "@mui/material";
import React from "react";

export default function InterestItem({ title, color, variant }) {
  return (
    <Grid sx={{color: color, borderRadius: 100, background: "white", p:0.5}}>
      <Typography sx={{ px: 1}}>{title}</Typography>
    </Grid>
  );
}
