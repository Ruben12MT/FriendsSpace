import { Avatar, Grid, Paper } from "@mui/material";
import React, { cloneElement } from "react";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import { Link } from "react-router-dom";

export default function RegisterPage() {
  return (
    <Grid
      container
      spacing={2}
      justifyContent="center"
      alignItems="center"
      style={{
        minHeight: "100vh",
        backgroundImage: "url(/background.png)",
        backgroundSize: "cover",
      }}
    >
      <Paper
        elevation={4}
        sx={{ padding: 3, maxWidth: 400, margin: "20px auto" , borderRadius: "20px"}}
      >
        {
          // Titulo y logo de la pagina
        }

        <Grid container justifyContent="center" spacing={2} sx={{ mb: 1 }}>
          <Button
            component={Link}
            to="/"
            style={{ textDecoration: "none", color: "inherit" }}
          >
            <Avatar
              src="/logo.png"
              sx={{ width: 100, height: 100, margin: "0 auto" }}
            />
          </Button>
        </Grid>
        <Grid container justifyContent="center" sx={{ mb: 2 }}>
          <Typography
            variant="h5"
            component="div"
            gutterBottom
            sx={{ color: "#50C2AF" }}
          >
            Registrar nueva cuenta
          </Typography>
        </Grid>

        {/* Formulario de registro */}
        <Grid container spacing={2}>
          <TextField
            id="username"
            name="username"
            label="Nombre de usuario"
            variant="outlined"
            fullWidth
          ></TextField>

          <TextField
            id="email"
            name="email"
            label="Correo electrónico"
            variant="outlined"
            fullWidth
          ></TextField>

          <TextField
            id="password"
            name="password"
            label="Contraseña"
            variant="outlined"
            type="password"
            fullWidth
          ></TextField>

          <TextField
            id="confirmPassword"
            name="confirmPassword"
            label="Confirmar contraseña"
            variant="outlined"
            type="password"
            fullWidth
          ></TextField>
        </Grid>

        <Grid container justifyContent="center" sx={{ mt: 1 }} spacing={2}>
          <Button variant="contained" color="primary" sx={{ marginTop: 2 }}>
            Registrar Usuario
          </Button>
        </Grid>

        <Grid container justifyContent="center" sx={{ mt: 2 }}>
          <Typography variant="body2" color="textSecondary">
            ¿Ya tienes cuenta?{" "}
            <Link
              to="/login"
              style={{ textDecoration: "none", color: "#50C2AF" }}
            >
              Inicia sesión aquí
            </Link>
          </Typography>
        </Grid>
      </Paper>
    </Grid>
  );
}
