import { Grid } from "@mui/material";
import React from "react";
import { useUser } from "../hooks/useUser";

export default function UserPage() {
  const { user } = useUser();

  return (
    <Grid
      container
      width={"100%"}
      height={"100%"}
      sx={{ px: 7 }}
    >
      <h1>Hola Mundo soy: {user.name}</h1>
    </Grid>
  );
}
