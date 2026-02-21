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

export default function LoginPage() {
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
            <Button component={Link} to="/" style={{ textDecoration: "none", color: "inherit" }}>
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
            Iniciar sesión
          </Typography>
        </Grid>

        <Grid>
          <TextField
            id="emailOrUsername"
            name="emailOrUsername"
            label="Correo electrónico o nombre de usuario"
            variant="outlined"
            fullWidth
          ></TextField>
          <TextField
            id="password"
            name="password"
            label="Contraseña"
            variant="outlined"
            type="password"
            sx={{ marginTop: 2 }}
            fullWidth
          ></TextField>
        </Grid>

        <Grid container justifyContent="center" sx={{ mt: 1 }} spacing={2}>
          <Button variant="contained" color="primary" sx={{ marginTop: 2 }}>
            Acceder
          </Button>
        </Grid>

        <Grid container justifyContent="center" sx={{ mt: 2 }}>
          <Typography variant="body2" color="textSecondary">
            ¿No tienes cuenta?{" "}
            <Link
              to="/register"
              style={{ textDecoration: "none", color: "#50C2AF" }}
            >
              Regístrate aquí
            </Link>
          </Typography>
        </Grid>
      </Paper>
    </Grid>
  );
}
