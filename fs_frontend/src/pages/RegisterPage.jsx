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
import ThemeToggler from "../components/ThemeToggler";
import { useAppTheme } from "../hooks/useAppTheme";

export default function RegisterPage() {
  const theme = useAppTheme();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfPassword, setShowConfPassword] = useState(false);
  const [errorOpen, setErrorOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
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
    setErrorsBool({ ...errorsBool, [e.target.name]: false });
  };

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleClickShowConfPassword = () => {
    setShowConfPassword(!showConfPassword);
  };

  async function registrarUsuario() {
    try {
      setErrorsBool({
        email: form.email === "",
        username: form.username === "",
        password: form.password === "",
        confirmPassword: form.confirmPassword === "",
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
    <>
      <ThemeToggler />

      <Paper
        elevation={4}
        sx={{
          padding: 3,
          maxWidth: 400,
          margin: "20px auto",
          borderRadius: "20px",
          background: theme.secondaryBack,
          position: "fixed",
          top: "50%", 
          left: "50%", 
          transform: "translate(-50%, -50%)", 
        }}
      >
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
            sx={{ color: theme.primaryText }}
          >
            Registrar nueva cuenta
          </Typography>
        </Grid>

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
            sx={{
              marginTop: 2,
              background: theme.tertiaryBack,
              "& .MuiInputBase-input": {
                color: errorsBool.username ? "red" : theme.fieldsText,
                "&:-webkit-autofill": {
                  WebkitBoxShadow: `0 0 0 1000px ${theme.tertiaryBack} inset`,
                  WebkitTextFillColor: errorsBool.username
                    ? "red"
                    : theme.fieldsText,
                  transition: "background-color 5000s ease-in-out 0s",
                },
              },
              "& .MuiInputLabel-root": {
                color: errorsBool.username ? "red" : theme.fieldsText,
              },
              "& .MuiInputLabel-root.Mui-focused": {
                color: errorsBool.username ? "red" : theme.primaryText,
              },
              "& .MuiOutlinedInput-root": {
                "& fieldset": {
                  borderColor: errorsBool.username ? "red" : theme.fieldsText,
                },
                "&:hover fieldset": {
                  borderColor: errorsBool.username ? "red" : theme.primaryText,
                },
                "&.Mui-focused fieldset": {
                  borderColor: errorsBool.username ? "red" : theme.primaryText,
                },
              },
            }}
          />
          <TextField
            id="email"
            name="email"
            label="Correo electrónico"
            variant="outlined"
            fullWidth
            required
            onChange={handleChange}
            error={errorsBool.email}
            sx={{
              marginTop: 2,
              background: theme.tertiaryBack,
              "& .MuiInputBase-input": {
                color: errorsBool.email ? "red" : theme.fieldsText,
                "&:-webkit-autofill": {
                  WebkitBoxShadow: `0 0 0 1000px ${theme.tertiaryBack} inset`,
                  WebkitTextFillColor: errorsBool.email
                    ? "red"
                    : theme.fieldsText,
                  transition: "background-color 5000s ease-in-out 0s",
                },
              },
              "& .MuiInputLabel-root": {
                color: errorsBool.email ? "red" : theme.fieldsText,
              },
              "& .MuiInputLabel-root.Mui-focused": {
                color: errorsBool.email ? "red" : theme.primaryText,
              },
              "& .MuiOutlinedInput-root": {
                "& fieldset": {
                  borderColor: errorsBool.email ? "red" : theme.fieldsText,
                },
                "&:hover fieldset": {
                  borderColor: errorsBool.email ? "red" : theme.primaryText,
                },
                "&.Mui-focused fieldset": {
                  borderColor: errorsBool.email ? "red" : theme.primaryText,
                },
              },
            }}
          />

          <TextField
            id="password"
            name="password"
            label="Contraseña"
            variant="outlined"
            type={showPassword ? "text" : "password"}
            fullWidth
            required
            onChange={handleChange}
            error={errorsBool.password}
            sx={{
              marginTop: 2,
              background: theme.tertiaryBack,
              "& .MuiInputBase-input": {
                color: errorsBool.password ? "red" : theme.fieldsText,
              },
              "& .MuiInputLabel-root": {
                color: errorsBool.password ? "red" : theme.fieldsText,
              },
              "& .MuiInputLabel-root.Mui-focused": {
                color: errorsBool.password ? "red" : theme.primaryText,
              },
              "& .MuiOutlinedInput-root": {
                "& fieldset": {
                  borderColor: errorsBool.password ? "red" : theme.fieldsText,
                },
                "&:hover fieldset": {
                  borderColor: errorsBool.password ? "red" : theme.primaryText,
                },
                "&.Mui-focused fieldset": {
                  borderColor: errorsBool.password ? "red" : theme.primaryText,
                },
              },
              "& .MuiIconButton-root": {
                color: theme.primaryText,
              },
            }}
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={handleClickShowPassword} edge="end">
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
          />

          <TextField
            id="confirmPassword"
            name="confirmPassword"
            label="Confirmar contraseña"
            variant="outlined"
            fullWidth
            required
            type={showConfPassword ? "text" : "password"}
            value={form.confirmPassword || ""}
            onChange={handleChange}
            error={errorsBool.confirmPassword}
            color={
              form.confirmPassword !== "" &&
              form.confirmPassword === form.password
                ? "success"
                : "primary"
            }
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={handleClickShowConfPassword}
                      edge="end"
                      sx={{ color: theme.primaryText }}
                    >
                      {showConfPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
            sx={{
              marginTop: 2,
              background: theme.tertiaryBack,
              borderRadius: "4px",

              "& .MuiInputBase-input": {
                color: errorsBool.confirmPassword
                  ? "red"
                  : form.confirmPassword !== "" &&
                      form.confirmPassword === form.password
                    ? "#4caf50"
                    : theme.fieldsText,
              },

              "& .MuiInputLabel-root": {
                color: errorsBool.confirmPassword
                  ? "red"
                  : form.confirmPassword !== "" &&
                      form.confirmPassword === form.password
                    ? "#4caf50"
                    : theme.fieldsText,
              },
              "& .MuiInputLabel-root.Mui-focused": {
                color: errorsBool.confirmPassword
                  ? "red"
                  : form.confirmPassword !== "" &&
                      form.confirmPassword === form.password
                    ? "#4caf50"
                    : theme.primaryText,
              },

              "& .MuiOutlinedInput-root": {
                "& fieldset": {
                  borderColor: errorsBool.confirmPassword
                    ? "red"
                    : form.confirmPassword !== "" &&
                        form.confirmPassword === form.password
                      ? "#4caf50"
                      : theme.fieldsText,
                },
                "&:hover fieldset": {
                  borderColor: errorsBool.confirmPassword
                    ? "red"
                    : form.confirmPassword !== "" &&
                        form.confirmPassword === form.password
                      ? "#4caf50"
                      : theme.primaryText,
                },
                "&.Mui-focused fieldset": {
                  borderColor: errorsBool.confirmPassword
                    ? "red"
                    : form.confirmPassword !== "" &&
                        form.confirmPassword === form.password
                      ? "#4caf50"
                      : theme.primaryText,
                },
              },
            }}
          />
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
            sx={{ marginTop: 2, background: theme.variantBack }}
          >
            Registrar Usuario
          </Button>
        </Grid>

        <Grid container justifyContent="center" sx={{ mt: 2 }}>
          <Typography variant="body2" sx={{ color: theme.primaryText }}>
            ¿Ya tienes cuenta?{" "}
            <Link
              to="/login"
              style={{ textDecoration: "none", color: theme.links }}
            >
              Inicia sesión aquí
            </Link>
          </Typography>
        </Grid>
      </Paper>
    </>
  );
}
