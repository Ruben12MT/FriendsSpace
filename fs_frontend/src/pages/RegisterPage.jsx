import { Avatar, Grid, IconButton, InputAdornment, Paper } from "@mui/material";
import React from "react";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import { Link } from "react-router-dom";
import { useState } from "react";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import api from "../utils/api";
import { useNavigate } from "react-router-dom";
import ErrorMessage from "../components/ErrorMessage";

export default function RegisterPage() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfPassword, setShowConfPassword] = useState(false);
  const [errorOpen, setErrorOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  // Estado de los atributos de un nuevo usuario:
  const [form, setForm] = useState({
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
  });

  const [errorsBool, setErrorsBool] = useState({
    email: false,
    username: false,
    password: false,
    confirmPassword: false,
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleClickShowConfPassword = () => {
    setShowConfPassword(!showConfPassword);
  };

  // Llamamos un metodo al pulsar el botón registrar usuario
  async function registrarUsuario() {
    try {
      setErrorsBool({
        email: form.email == "",
        username: form.username == "",
        password: form.password == "",
        confirmPassword: form.confirmPassword == "",
      });
      if (form.password !== form.confirmPassword) {
        setErrorMsg("La contraseña no coincide");
        setErrorOpen(true);
        return;
      }
      setErrorOpen(false);
      await api.post("/users/register/", {
        email: form.email,
        name: form.username,
        password: form.password,
      });
      navigate("/login");
    } catch (error) {
      setErrorMsg(error.response?.data?.mensaje || "Error al conectar");
      setErrorOpen(true);
    }
  }

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
            required
            onChange={handleChange}
            error={errorsBool.username}
          ></TextField>

          <TextField
            id="email"
            name="email"
            label="Correo electrónico"
            variant="outlined"
            fullWidth
            required
            onChange={handleChange}
            error={errorsBool.email}
          ></TextField>

          <TextField
            id="password"
            name="password"
            label="Contraseña"
            variant="outlined"
            type={showPassword ? "text" : "password"}
            sx={{ marginTop: 2 }}
            fullWidth
            required
            onChange={handleChange}
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
            error={errorsBool.password}
          ></TextField>

          <TextField
            required
            id="confirmPassword"
            name="confirmPassword"
            label="Confirmar contraseña"
            variant="outlined"
            type={showConfPassword ? "text" : "password"}
            sx={{ marginTop: 2 }}
            fullWidth
            onChange={handleChange}
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="cambiar visibilidad de contraseña"
                      onClick={handleClickShowConfPassword}
                      edge="end"
                    >
                      {showConfPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
            color={
              form.confirmPassword !== "" &&
              form.confirmPassword === form.password
                ? "success"
                : "primary"
            }
            focused={
              form.confirmPassword !== "" &&
              form.confirmPassword === form.password
            }
            error={errorsBool.confirmPassword}
          ></TextField>
        </Grid>
        <ErrorMessage
          message={errorMsg}
          open={errorOpen}
          setOpen={setErrorOpen}
        />
        <Grid container justifyContent="center" sx={{ mt: 1 }} spacing={2}>
          <Button
            variant="contained"
            onClick={registrarUsuario}
            color="primary"
            sx={{ marginTop: 2 }}
          >
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
