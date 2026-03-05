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
import userAuthStore from "../store/useAuthStore";
import { useAppTheme } from "../hooks/useAppTheme";
import ThemeToggler from "../components/themeToggler";
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

  const setUserId = userAuthStore((state) => state.setUserId);

  const theme = useAppTheme();

  const iniciarSesion = async () => {
    try {
      setErrorsBool({
        emailOrUsername: emailOrUsername === "",
        password: password === "",
      });

      setErrorOpen(false);
      const res = await api.post("/users/login/", {
        emailOrUsername,
        password,
      });

      // Guardar el id en Zustand
      setUserId(res.data.user.id);

      if (res.data.user.first_login == 0) {
        navigate("/app/searchnewfriends");
      } else {
        navigate("/app/user/edit");
      }
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
      direction={"column"}
      spacing={2}
      justifyContent="center"
      alignItems="center"
      style={{
        minHeight: "100vh",
        backgroundImage: "url(" + theme.backgroundImage + ")",
        backgroundSize: "cover",
      }}
    >
      <ThemeToggler />
      <Paper
        elevation={8}
        sx={{
          padding: 3,
          maxWidth: 400,
          margin: "20px auto",
          borderRadius: "20px",
          background: theme.secondaryBack,
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
              sx={{
                width: 100,
                height: 100,
                margin: "0 auto",
                border: "2px solid " + theme.primaryText,
              }}
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
            sx={{
              marginTop: 2,
              // Fondo general del componente
              background: theme.tertiaryBack,
              borderRadius: "4px", // Para que el fondo no se salga de los bordes redondeados

              // 1. Estilos del INPUT y AUTOFILL
              "& .MuiInputBase-input": {
                color: theme.fieldsText,
                "&:-webkit-autofill": {
                  WebkitBoxShadow: `0 0 0 1000px ${theme.tertiaryBack} inset`, // "Tapa" el blanco del navegador
                  WebkitTextFillColor: theme.fieldsText, // Color del texto autocompletado
                  transition: "background-color 5000s ease-in-out 0s", // Evita el parpadeo de color
                },
              },

              // 2. Estilos de la ETIQUETA (Label)
              "& .MuiInputLabel-root": {
                color: theme.fieldsText,
              },
              "& .MuiInputLabel-root.Mui-focused": {
                color: theme.fieldsText,
              },

              // 3. Estilos del BORDE (OutlinedInput)
              "& .MuiOutlinedInput-root": {
                "& fieldset": {
                  borderColor: theme.fieldsText,
                },
                "&:hover fieldset": {
                  borderColor: theme.primaryText,
                },
                "&.Mui-focused fieldset": {
                  borderColor: theme.primaryText,
                },
              },

              // 4. Color de ICONOS (si los hubiera, como el de visibilidad)
              "& .MuiIconButton-root": {
                color: theme.primaryText,
              },
            }}
          />
          <TextField
            id="password"
            name="password"
            label="Contraseña"
            variant="outlined"
            type={showPassword ? "text" : "password"}
            sx={{
              marginTop: 2,
              // Fondo del campo
              background: theme.tertiaryBack,
              // Color del texto que escribe el usuario
              "& .MuiInputBase-input": {
                color: theme.fieldsText,
              },
              // Color de la etiqueta (Label) cuando no está enfocada
              "& .MuiInputLabel-root": {
                color: theme.fieldsText,
              },
              // Color de la etiqueta cuando está enfocada (shrink)
              "& .MuiInputLabel-root.Mui-focused": {
                color: theme.fieldsText,
              },
              // Estilos del borde (OutlinedInput)
              "& .MuiOutlinedInput-root": {
                "& fieldset": {
                  borderColor: theme.fieldsText, // Borde normal
                },
                "&:hover fieldset": {
                  borderColor: theme.primaryText, // Borde al pasar el mouse
                },
                "&.Mui-focused fieldset": {
                  borderColor: theme.primaryText, // Borde al hacer click
                },
              },
              // Color del icono de visibilidad
              "& .MuiIconButton-root": {
                color: theme.primaryText,
              },
            }}
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
            sx={{ marginTop: 2, background: theme.variantBack }}
            onClick={iniciarSesion}
          >
            Acceder
          </Button>
        </Grid>

        <Grid container justifyContent="center" sx={{ mt: 2 }}>
          <Typography variant="body2" sx={{ color: theme.primaryText }}>
            ¿No tienes cuenta?{" "}
            <Link
              to="/register"
              style={{ textDecoration: "none", color: theme.links }}
            >
              Regístrate aquí
            </Link>
          </Typography>
        </Grid>
      </Paper>
    </Grid>
  );
}
