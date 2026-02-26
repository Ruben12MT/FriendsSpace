import { Grid } from "@mui/material";
import React from "react";
import { useUser } from "../hooks/useUser";

export default function UserPage() {
  const { user } = useUser();


  return (
    <>
      <Grid
        container
        sx={{
          mx: 7,
        }}
      >
        <h1>Hola Mundo soy: {user.name}</h1>
      </Grid>
    </>
  );
}
