import React, { useState } from "react";
import { Box, Typography, TextField, Button, CircularProgress, IconButton, InputAdornment } from "@mui/material";
import { Visibility, VisibilityOff, Lock as LockIcon, CheckCircle as CheckCircleIcon } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useUser } from "../hooks/useUser";
import { useAppTheme } from "../hooks/useAppTheme";
import api from "../utils/api";
import useAuthStore from "../store/useAuthStore";

export default function ChangePasswordPage() {
  const theme = useAppTheme();
  const { loggedUser, setLoggedUser } = useUser();
  const navigate = useNavigate();
  const clearAuth = useAuthStore((s) => s.clearAuth);

  const accent = theme.accent || theme.primaryBack;
  const isDark = theme.name === "dark";

  const [form, setForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [showPasswords, setShowPasswords] = useState({ current: false, new: false, confirm: false });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const inputSx = (hasError) => ({
    "& .MuiOutlinedInput-root": {
      borderRadius: "12px",
      background: theme.tertiaryBack,
      "& fieldset": { borderColor: hasError ? "#e53935" : `${accent}30`, borderWidth: 1.5 },
      "&:hover fieldset": { borderColor: hasError ? "#e53935" : `${accent}60` },
      "&.Mui-focused fieldset": { borderColor: hasError ? "#e53935" : accent, borderWidth: 2 },
    },
    "& .MuiInputBase-input": { color: theme.fieldsText },
    "& .MuiInputLabel-root": { color: theme.mutedText },
    "& .MuiInputLabel-root.Mui-focused": { color: hasError ? "#e53935" : accent },
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async () => {
    if (!form.currentPassword || !form.newPassword || !form.confirmPassword) {
      setError("Todos los campos son obligatorios");
      return;
    }
    if (form.newPassword !== form.confirmPassword) {
      setError("Las contraseñas nuevas no coinciden");
      return;
    }
    if (form.newPassword.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres");
      return;
    }

    setIsLoading(true);
    setError("");
    try {
      await api.put(`/users/${loggedUser.id}/change-password`, {
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
        confirmPassword: form.confirmPassword,
      });
      setSuccess(true);
      setTimeout(() => {
        clearAuth();
        setLoggedUser(null);
        navigate("/login");
      }, 2500);
    } catch (err) {
      setError(err.response?.data?.mensaje || "Error al cambiar la contraseña");
    } finally {
      setIsLoading(false);
    }
  };

  const sectionSx = {
    p: 2.5, borderRadius: "16px",
    background: theme.secondaryBack,
    border: `1px solid ${accent}15`, mb: 2,
  };

  if (success) {
    return (
      <Box sx={{ maxWidth: 480, mx: "auto", px: { xs: 2, md: 4 }, py: 8, textAlign: "center" }}>
        <CheckCircleIcon sx={{ fontSize: 64, color: "#2e7d32", mb: 2 }} />
        <Typography sx={{ fontWeight: 700, fontSize: "1.3rem", color: theme.primaryText, mb: 1 }}>
          Contraseña actualizada
        </Typography>
        <Typography sx={{ color: theme.mutedText, fontSize: "0.9rem" }}>
          Tu contraseña ha sido cambiada correctamente. Todas las sesiones activas han sido cerradas. Redirigiendo al login...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 480, mx: "auto", px: { xs: 2, md: 4 }, py: 4 }}>

      <Box sx={{ borderRadius: "20px", overflow: "hidden", background: theme.secondaryBack, border: `1px solid ${accent}20`, mb: 3 }}>
        <Box sx={{ height: 80, background: `linear-gradient(135deg, ${accent}25, ${accent}05)` }} />
        <Box sx={{ px: 3, pb: 3, mt: "-20px" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1 }}>
            <Box sx={{ width: 44, height: 44, borderRadius: "12px", background: `${accent}20`, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <LockIcon sx={{ color: accent, fontSize: 22 }} />
            </Box>
            <Box>
              <Typography sx={{ fontWeight: 800, fontSize: "1.3rem", color: theme.primaryText }}>
                Cambiar contraseña
              </Typography>
              <Typography sx={{ fontSize: "0.82rem", color: theme.mutedText }}>
                Se cerrará sesión en todos los dispositivos
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>

      <Box sx={sectionSx}>
        <Typography sx={{ fontWeight: 700, fontSize: "0.75rem", color: accent, letterSpacing: "0.08em", textTransform: "uppercase", mb: 2 }}>
          Contraseña actual
        </Typography>
        <TextField
          name="currentPassword" label="Contraseña actual" type={showPasswords.current ? "text" : "password"}
          fullWidth value={form.currentPassword} onChange={handleChange}
          slotProps={{ input: { endAdornment: <InputAdornment position="end"><IconButton onClick={() => setShowPasswords((p) => ({ ...p, current: !p.current }))} edge="end" sx={{ color: theme.mutedText }}>{showPasswords.current ? <VisibilityOff /> : <Visibility />}</IconButton></InputAdornment> } }}
          sx={inputSx(false)}
        />
      </Box>

      <Box sx={sectionSx}>
        <Typography sx={{ fontWeight: 700, fontSize: "0.75rem", color: accent, letterSpacing: "0.08em", textTransform: "uppercase", mb: 2 }}>
          Nueva contraseña
        </Typography>
        <TextField
          name="newPassword" label="Nueva contraseña" type={showPasswords.new ? "text" : "password"}
          fullWidth value={form.newPassword} onChange={handleChange} sx={{ ...inputSx(false), mb: 2 }}
          slotProps={{ input: { endAdornment: <InputAdornment position="end"><IconButton onClick={() => setShowPasswords((p) => ({ ...p, new: !p.new }))} edge="end" sx={{ color: theme.mutedText }}>{showPasswords.new ? <VisibilityOff /> : <Visibility />}</IconButton></InputAdornment> } }}
        />
        <TextField
          name="confirmPassword" label="Confirmar nueva contraseña" type={showPasswords.confirm ? "text" : "password"}
          fullWidth value={form.confirmPassword} onChange={handleChange}
          error={form.confirmPassword.length > 0 && form.newPassword !== form.confirmPassword}
          slotProps={{ input: { endAdornment: <InputAdornment position="end"><IconButton onClick={() => setShowPasswords((p) => ({ ...p, confirm: !p.confirm }))} edge="end" sx={{ color: theme.mutedText }}>{showPasswords.confirm ? <VisibilityOff /> : <Visibility />}</IconButton></InputAdornment> } }}
          sx={inputSx(form.confirmPassword.length > 0 && form.newPassword !== form.confirmPassword)}
        />
      </Box>

      {error && (
        <Typography sx={{ color: "#f44336", fontSize: "0.85rem", textAlign: "center", mb: 2 }}>
          {error}
        </Typography>
      )}

      <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2 }}>
        <Button
          variant="outlined" onClick={() => navigate(-1)}
          sx={{ borderColor: `${accent}50`, color: accent, borderRadius: "10px", textTransform: "none", fontWeight: 600, px: 3, "&:hover": { borderColor: accent, background: `${accent}10` } }}
        >
          Volver
        </Button>
        <Button
          variant="contained" onClick={handleSubmit} disabled={isLoading}
          sx={{ background: `linear-gradient(135deg, ${accent}, ${theme.variantBack || accent})`, color: isDark ? "#1a1200" : "#fff", borderRadius: "10px", textTransform: "none", fontWeight: 700, px: 4, flex: 1, "&:hover": { opacity: 0.9 }, "&.Mui-disabled": { background: theme.tertiaryBack, color: theme.mutedText } }}
        >
          {isLoading ? <CircularProgress size={22} color="inherit" /> : "Cambiar contraseña"}
        </Button>
      </Box>
    </Box>
  );
}
