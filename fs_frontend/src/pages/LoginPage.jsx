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
import BackgroundVideo from "../components/BackgroundVideo";
import api from "../utils/api";
import { useAppTheme } from "../hooks/useAppTheme";
import ThemeToggler from "../components/themeToggler";
import { useUser } from "../hooks/useUser";
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

  const { setLoggedUser } = useUser();

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

      setLoggedUser(res.data.usuario);

      if (res.data.usuario && res.data.usuario.first_login == 0) {
        console.log("El usuario ya ha iniciado sesión antes");
        navigate("/app/searchnewfriends");
      } else if(res.data.usuario.first_login == 1) {
        console.log("El usuario a entrado por primera vez");

        navigate("/app/user/edit");
      }
      
      if(res.data.ok){
              console.log("MENSAJE: El login se ha llevado a cabo de manera exitosa");
      }
    } catch (error) {
      setErrorMsg(error.response?.data?.mensaje || "Error al conectar");
      setErrorOpen(true);
    }
  };

  const passwordRef = useRef(null);

  return (
    <>
      <ThemeToggler />
      {theme.backgroundVideo && <BackgroundVideo src={theme.backgroundVideo} />}
      
      <Paper
        elevation={8}
        sx={{
          padding: 3,
          maxWidth: 400,
          margin: "20px auto",
          borderRadius: "20px",
          background: theme.secondaryBack ,

          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",

          zIndex: 2000,
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
            onChange={(e) => {
              setEmailOrUsername(e.target.value);
              setErrorsBool({ ...errorsBool, emailOrUsername: false });
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") passwordRef.current.focus();
            }}
            sx={{
              marginTop: 2,
              background: theme.tertiaryBack,
              borderRadius: "4px",

              "& .MuiInputBase-input": {
                color: errorsBool.emailOrUsername ? "red" : theme.fieldsText,
                "&:-webkit-autofill": {
                  WebkitBoxShadow: `0 0 0 1000px ${theme.tertiaryBack} inset`,
                  WebkitTextFillColor: errorsBool.emailOrUsername
                    ? "red"
                    : theme.fieldsText,
                  transition:
                    "background-color 5000s ease-in-out 0s, color 5000s ease-in-out 0s",
                },
                "&:-webkit-autofill:hover, &:-webkit-autofill:focus, &:-webkit-autofill:active":
                  {
                    WebkitBoxShadow: `0 0 0 1000px ${theme.tertiaryBack} inset`,
                    WebkitTextFillColor: errorsBool.emailOrUsername
                      ? "red"
                      : theme.fieldsText,
                  },
                "&:-webkit-autofill:focus": {
                  WebkitTextFillColor: errorsBool.emailOrUsername
                    ? "red"
                    : theme.fieldsText,
                },
              },

              "& .MuiInputLabel-root": {
                color: errorsBool.emailOrUsername ? "red" : theme.fieldsText,
              },
              "& .MuiInputLabel-root.Mui-focused": {
                color: errorsBool.emailOrUsername ? "red" : theme.primaryText,
              },

              "& .MuiOutlinedInput-root": {
                "& fieldset": {
                  borderColor: errorsBool.emailOrUsername
                    ? "red"
                    : theme.fieldsText,
                },
                "&:hover fieldset": {
                  borderColor: errorsBool.emailOrUsername
                    ? "red"
                    : theme.primaryText,
                },
                "&.Mui-focused fieldset": {
                  borderColor: errorsBool.emailOrUsername
                    ? "red"
                    : theme.primaryText,
                },
              },

              "& .MuiIconButton-root": {
                color: errorsBool.emailOrUsername ? "red" : theme.primaryText,
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
            fullWidth
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setErrorsBool({ ...errorsBool, password: false });
            }}
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
    </>
  );
}
