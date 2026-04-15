import React, { useRef, useState } from "react";
import {
  Box,
  IconButton,
  InputAdornment,
  TextField,
  Typography,
} from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import ErrorMessage from "../components/ErrorMessage";
import BackgroundVideo from "../components/BackgroundVideo";
import api from "../utils/api";
import { useAppTheme } from "../hooks/useAppTheme";
import ThemeToggler from "../components/ThemeToggler";
import { useUser } from "../hooks/useUser";

export default function LoginPage() {
  const theme = useAppTheme();
  const navigate = useNavigate();
  const { setLoggedUser } = useUser();
  const passwordRef = useRef(null);

  const [showPassword, setShowPassword] = useState(false);
  const [emailOrUsername, setEmailOrUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorOpen, setErrorOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [errorsBool, setErrorsBool] = useState({
    emailOrUsername: false,
    password: false,
  });
  const [isLoading, setIsLoading] = useState(false);

  const accent = theme.accent || theme.primaryBack;
  const inputBg = theme.tertiaryBack;
  const textMain = theme.primaryText;
  const textMuted = theme.mutedText || theme.secondaryText;
  const isDark = theme.name === "dark";

  const inputSx = (hasError) => ({
    "& .MuiInputBase-input": {
      color: hasError ? "#e53935" : textMain,
      fontSize: "0.95rem",
      "&:-webkit-autofill": {
        WebkitBoxShadow: `0 0 0 1000px ${inputBg} inset`,
        WebkitTextFillColor: hasError ? "#e53935" : textMain,
        caretColor: textMain,
        transition: "background-color 5000s ease-in-out 0s",
      },
      "&:-webkit-autofill:focus": {
        WebkitBoxShadow: `0 0 0 1000px ${inputBg} inset`,
        WebkitTextFillColor: hasError ? "#e53935" : textMain,
      },
      "&:-webkit-autofill:hover": {
        WebkitBoxShadow: `0 0 0 1000px ${inputBg} inset`,
        WebkitTextFillColor: hasError ? "#e53935" : textMain,
      },
    },
    "& .MuiInputLabel-root": {
      color: hasError ? "#e53935" : textMuted,
      fontSize: "0.9rem",
    },
    "& .MuiInputLabel-root.Mui-focused": {
      color: hasError ? "#e53935" : accent,
    },
    "& .MuiOutlinedInput-root": {
      background: inputBg,
      borderRadius: "12px",
      "& fieldset": {
        borderColor: hasError ? "#e53935" : `${accent}40`,
        borderWidth: 1.5,
      },
      "&:hover fieldset": { borderColor: hasError ? "#e53935" : `${accent}80` },
      "&.Mui-focused fieldset": {
        borderColor: hasError ? "#e53935" : accent,
        borderWidth: 2,
      },
      "& input": { color: hasError ? "#e53935" : textMain },
    },
    "& .MuiIconButton-root": { color: textMuted },
  });

  const iniciarSesion = async () => {
    const hasErrors = {
      emailOrUsername: emailOrUsername === "",
      password: password === "",
    };
    setErrorsBool(hasErrors);
    if (hasErrors.emailOrUsername || hasErrors.password) return;

    setIsLoading(true);
    setErrorOpen(false);
    try {
      const res = await api.post("/users/login/", {
        emailOrUsername,
        password,
      });
      setLoggedUser(res.data.usuario);
      navigate(
        res.data.usuario?.first_login == 1
          ? "/app/user/edit"
          : "/app/searchnewfriends",
      );
    } catch (error) {
      setErrorMsg(error.response?.data?.mensaje || "Error al conectar");
      setErrorOpen(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <ThemeToggler />
      {theme.backgroundVideo && <BackgroundVideo src={theme.backgroundVideo} />}

      <Box
        sx={{
          position: "fixed",
          inset: 0,
          zIndex: 2000,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          p: 2,
        }}
      >
        <Box
          sx={{
            width: "100%",
            maxWidth: 420,
            background: isDark
              ? "rgba(30,28,24,0.92)"
              : "rgba(255,253,247,0.92)",
            backdropFilter: "blur(20px)",
            borderRadius: "24px",
            border: `1px solid ${accent}25`,
            boxShadow: isDark
              ? `0 24px 64px rgba(0,0,0,0.6), 0 0 0 1px ${accent}15`
              : `0 24px 64px rgba(184,134,11,0.12), 0 0 0 1px ${accent}20`,
            p: "40px 36px",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Box sx={{ textAlign: "center", mb: 4 }}>
            <Box
              component={Link}
              to="/"
              sx={{ display: "inline-block", mb: 2, textDecoration: "none" }}
            >
              <Box
                component="img"
                src="/logo.png"
                sx={{
                  width: 80,
                  height: 80,
                  borderRadius: "50%",
                  border: `2px solid ${accent}50`,
                  boxShadow: `0 4px 20px ${accent}30`,
                  transition: "transform 0.2s",
                  "&:hover": {
                    transform: "scale(1.05)",
                    boxShadow: `0 6px 28px ${accent}50`,
                  },
                }}
              />
            </Box>
            <Typography
              sx={{
                fontSize: "1.6rem",
                fontWeight: 700,
                color: textMain,
                letterSpacing: "-0.02em",
                lineHeight: 1.2,
              }}
            >
              Bienvenido de nuevo
            </Typography>
            <Typography
              sx={{ fontSize: "0.875rem", color: textMuted, mt: 0.5 }}
            >
              Inicia sesión en Friends Space
            </Typography>
          </Box>

          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField
              label="Correo o nombre de usuario"
              variant="outlined"
              fullWidth
              value={emailOrUsername}
              error={errorsBool.emailOrUsername}
              onChange={(e) => {
                setEmailOrUsername(e.target.value);
                setErrorsBool((p) => ({ ...p, emailOrUsername: false }));
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") passwordRef.current?.focus();
              }}
              sx={inputSx(errorsBool.emailOrUsername)}
            />
            <TextField
              label="Contraseña"
              variant="outlined"
              fullWidth
              type={showPassword ? "text" : "password"}
              value={password}
              error={errorsBool.password}
              onChange={(e) => {
                setPassword(e.target.value);
                setErrorsBool((p) => ({ ...p, password: false }));
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") iniciarSesion();
              }}
              inputRef={passwordRef}
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
              sx={inputSx(errorsBool.password)}
            />
          </Box>

          <ErrorMessage
            message={errorMsg}
            open={errorOpen}
            setOpen={setErrorOpen}
          />

          <Box
            component="button"
            onClick={iniciarSesion}
            disabled={isLoading}
            sx={{
              mt: 3,
              width: "100%",
              py: "14px",
              background: `linear-gradient(135deg, ${accent}, ${theme.variantBack || accent})`,
              color: isDark ? "#1a1200" : "#fff",
              border: "none",
              borderRadius: "12px",
              fontSize: "1rem",
              fontWeight: 700,
              cursor: isLoading ? "not-allowed" : "pointer",
              opacity: isLoading ? 0.7 : 1,
              transition: "all 0.15s",
              boxShadow: `0 4px 16px ${accent}40`,
              "&:hover": !isLoading
                ? {
                    transform: "translateY(-1px)",
                    boxShadow: `0 6px 24px ${accent}55`,
                  }
                : {},
            }}
          >
            {isLoading ? "Entrando..." : "Acceder"}
          </Box>

          <Typography
            sx={{
              textAlign: "center",
              mt: 3,
              fontSize: "0.875rem",
              color: textMuted,
            }}
          >
            ¿No tienes cuenta?{" "}
            <Link
              to="/register"
              style={{ color: accent, textDecoration: "none", fontWeight: 600 }}
            >
              Regístrate aquí
            </Link>
          </Typography>
        </Box>
      </Box>
    </>
  );
}