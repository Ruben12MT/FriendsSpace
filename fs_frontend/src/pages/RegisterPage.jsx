import React, { useState } from "react";
import { Box, IconButton, InputAdornment, TextField, Typography } from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import ErrorMessage from "../components/ErrorMessage";
import BackgroundVideo from "../components/BackgroundVideo";
import api from "../utils/api";
import { useAppTheme } from "../hooks/useAppTheme";
import ThemeToggler from "../components/ThemeToggler";

export default function RegisterPage() {
  const theme = useAppTheme();
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfPassword, setShowConfPassword] = useState(false);
  const [errorOpen, setErrorOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [form, setForm] = useState({ email: "", username: "", password: "", confirmPassword: "" });
  const [errorsBool, setErrorsBool] = useState({ email: false, username: false, password: false, confirmPassword: false });

  const accent = theme.accent || theme.primaryBack;
  const inputBg = theme.tertiaryBack;
  const textMain = theme.primaryText;
  const textMuted = theme.mutedText || theme.secondaryText;
  const isDark = theme.name === "dark";

  const passwordsMatch = form.confirmPassword !== "" && form.confirmPassword === form.password;

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrorsBool({ ...errorsBool, [e.target.name]: false });
  };

  const inputSx = (hasError, isSuccess = false) => ({
    "& .MuiInputBase-input": {
      color: hasError ? "#e53935" : isSuccess ? "#2e7d32" : textMain,
      fontSize: "0.95rem",
      "&:-webkit-autofill": {
        WebkitBoxShadow: `0 0 0 1000px ${inputBg} inset`,
        WebkitTextFillColor: hasError ? "#e53935" : textMain,
      },
    },
    "& .MuiInputLabel-root": {
      color: hasError ? "#e53935" : isSuccess ? "#2e7d32" : textMuted,
      fontSize: "0.9rem",
    },
    "& .MuiInputLabel-root.Mui-focused": {
      color: hasError ? "#e53935" : isSuccess ? "#2e7d32" : accent,
    },
    "& .MuiOutlinedInput-root": {
      background: inputBg,
      borderRadius: "12px",
      "& fieldset": {
        borderColor: hasError ? "#e53935" : isSuccess ? "#2e7d32" : `${accent}40`,
        borderWidth: 1.5,
      },
      "&:hover fieldset": {
        borderColor: hasError ? "#e53935" : isSuccess ? "#2e7d32" : `${accent}80`,
      },
      "&.Mui-focused fieldset": {
        borderColor: hasError ? "#e53935" : isSuccess ? "#2e7d32" : accent,
        borderWidth: 2,
      },
    },
    "& .MuiIconButton-root": { color: textMuted },
  });

  const registrarUsuario = async () => {
    const hasErrors = {
      email: form.email === "",
      name: form.username === "",
      password: form.password === "",
      confirmPassword: form.confirmPassword === "",
    };
    
    setErrorsBool(hasErrors);
    if (Object.values(hasErrors).some(Boolean)) return;

    if (form.password !== form.confirmPassword) {
      setErrorMsg("Las contraseñas no coinciden");
      setErrorOpen(true);
      return;
    }

    setIsLoading(true);
    setErrorOpen(false);
    try {
      await api.post("/users/register/", { email: form.email, name: form.username, password: form.password });
      navigate("/login");
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

      <Box sx={{
        position: "fixed", inset: 0, zIndex: 2000,
        display: "flex", alignItems: "center", justifyContent: "center",
        p: 2, overflowY: "auto",
      }}>
        <Box sx={{
          width: "100%", maxWidth: 420, my: "auto",
          background: isDark ? "rgba(30,28,24,0.92)" : "rgba(255,253,247,0.92)",
          backdropFilter: "blur(20px)",
          borderRadius: "24px",
          border: `1px solid ${accent}25`,
          boxShadow: isDark 
            ? `0 24px 64px rgba(0,0,0,0.6)` 
            : `0 24px 64px rgba(184,134,11,0.12)`,
          p: "40px 36px",
          display: "flex", flexDirection: "column",
        }}>

          <Box sx={{ textAlign: "center", mb: 4 }}>
            <Box component={Link} to="/" sx={{ display: "inline-block", mb: 2 }}>
              <Box
                component="img" src="/logo.png"
                sx={{
                  width: 80, height: 80, borderRadius: "50%",
                  border: `2px solid ${accent}50`,
                  boxShadow: `0 4px 20px ${accent}30`,
                }}
              />
            </Box>
            <Typography sx={{ fontSize: "1.6rem", fontWeight: 700, color: textMain }}>
              Crear cuenta
            </Typography>
            <Typography sx={{ fontSize: "0.875rem", color: textMuted, mt: 0.5 }}>
              Únete a Friends Space
            </Typography>
          </Box>

          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField
              name="username" label="Nombre de usuario" variant="outlined"
              fullWidth required onChange={handleChange}
              error={errorsBool.username} sx={inputSx(errorsBool.username)}
            />
            <TextField
              name="email" label="Correo electrónico" variant="outlined"
              fullWidth required onChange={handleChange}
              error={errorsBool.email} sx={inputSx(errorsBool.email)}
            />
            <TextField
              name="password" label="Contraseña" variant="outlined"
              type={showPassword ? "text" : "password"}
              fullWidth required onChange={handleChange}
              error={errorsBool.password}
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
              sx={inputSx(errorsBool.password)}
            />
            <TextField
              name="confirmPassword" label="Confirmar contraseña" variant="outlined"
              type={showConfPassword ? "text" : "password"}
              fullWidth required value={form.confirmPassword}
              onChange={handleChange} error={errorsBool.confirmPassword}
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      {passwordsMatch 
                        ? <CheckCircleOutlineIcon sx={{ color: "#2e7d32", fontSize: 20 }} />
                        : (
                          <IconButton onClick={() => setShowConfPassword(!showConfPassword)} edge="end">
                            {showConfPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        )
                      }
                    </InputAdornment>
                  ),
                },
              }}
              sx={inputSx(errorsBool.confirmPassword, passwordsMatch)}
            />
          </Box>

          <ErrorMessage message={errorMsg} open={errorOpen} setOpen={setErrorOpen} />

          <Box
            component="button" onClick={registrarUsuario} disabled={isLoading}
            sx={{
              mt: 3, width: "100%", py: "14px",
              background: `linear-gradient(135deg, ${accent}, ${theme.variantBack || accent})`,
              color: isDark ? "#1a1200" : "#fff",
              border: "none", borderRadius: "12px",
              fontSize: "1rem", fontWeight: 700,
              cursor: isLoading ? "not-allowed" : "pointer",
              opacity: isLoading ? 0.7 : 1,
              transition: "all 0.15s",
              boxShadow: `0 4px 16px ${accent}40`,
              "&:hover": !isLoading ? { transform: "translateY(-1px)", boxShadow: `0 6px 24px ${accent}55` } : {},
            }}
          >
            {isLoading ? "Registrando..." : "Crear cuenta"}
          </Box>

          <Typography sx={{ textAlign: "center", mt: 3, fontSize: "0.875rem", color: textMuted }}>
            ¿Ya tienes cuenta?{" "}
            <Link to="/login" style={{ color: accent, textDecoration: "none", fontWeight: 600 }}>
              Inicia sesión aquí
            </Link>
          </Typography>
        </Box>
      </Box>
    </>
  );
}