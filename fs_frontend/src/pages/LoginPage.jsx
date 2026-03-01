import { Avatar, Grid, IconButton, InputAdornment, Paper } from "@mui/material";
import React, { useRef } from "react";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import ErrorMessage from "../components/ErrorMessage";
import api from "../utils/api";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };
  const navigate = useNavigate();
  const [emailOrUsername, setEmailOrUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorOpen, setErrorOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [errorsBool, setErrorsBool] = useState({
    emailOrUsername: false,
    password: false,
  });

  const iniciarSesion = async () => {
  try {
    setErrorsBool({
      emailOrUsername: emailOrUsername === "",
      password: password === "",
    });

    setErrorOpen(false);
    await api.post("/users/login/", {
      emailOrUsername,
      password,
    });
    navigate("/app/searchnewfriends");
  } catch (error) {
    setErrorMsg(error.response?.data?.mensaje || "Error al conectar");
    setErrorOpen(true);
  }
};

  // La referencia a password
  const passwordRef = useRef(null);

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
        sx={{
          padding: 3,
          maxWidth: 400,
          margin: "20px auto",
          borderRadius: "20px",
        }}
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
            value={emailOrUsername}
            error={errorsBool.emailOrUsername}
            onChange={(e) => setEmailOrUsername(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") passwordRef.current.focus();
            }}
          ></TextField>
          <TextField
            id="password"
            name="password"
            label="Contraseña"
            variant="outlined"
            type={showPassword ? "text" : "password"}
            sx={{ marginTop: 2 }}
            fullWidth
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={errorsBool.password}
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="cambiar visibilidad de contraseña"
                      onClick={handleClickShowPassword}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
            inputRef={passwordRef}
            onKeyDown={(e) => {
              if (e.key === "Enter") iniciarSesion();
            }}
          ></TextField>
          <ErrorMessage
            message={errorMsg}
            open={errorOpen}
            setOpen={setErrorOpen}
          />
        </Grid>

        <Grid container justifyContent="center" sx={{ mt: 1 }} spacing={2}>
          <Button
            variant="contained"
            color="primary"
            sx={{ marginTop: 2 }}
            onClick={iniciarSesion}
          >
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
