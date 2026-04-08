import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  CircularProgress,
  Container,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  IconButton,
  Grid,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CloseIcon from "@mui/icons-material/Close";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import { useAppTheme } from "../hooks/useAppTheme";
import UserCard from "../components/UserCard";
import MainSearchBar from "../components/MainSearchBar";
import api from "../utils/api";
import { useUser } from "../hooks/useUser";

export default function AdminsPage() {
  const theme = useAppTheme();
  const accent = theme.accent || theme.primaryBack;
  const isDark = theme.name === "dark";

  const [adminList, setAdminList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [successDialog, setSuccessDialog] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [formErrors, setFormErrors] = useState({
    name: false,
    email: false,
    password: false,
  });

  const { loggedUser } = useUser();
  const isDeveloper = loggedUser?.role === "DEVELOPER";

  const fetchAdmins = async () => {
    setIsLoading(true);
    try {
      const res = await api.get("/users/admins");
      if (res.data.ok) setAdminList(res.data.datos);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const filteredAdmins = adminList
    .filter((a) => a.name?.toLowerCase().includes(query.toLowerCase().trim()))
    .sort((a, b) => b.role.localeCompare(a.role));

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setFormErrors({ ...formErrors, [e.target.name]: false });
    setErrorMsg("");
  };

  const handleCreateAdmin = async () => {
    const errors = {
      name: !form.name.trim(),
      email: !form.email.trim(),
      password: !form.password.trim(),
    };
    setFormErrors(errors);
    if (Object.values(errors).some(Boolean)) return;
    setIsSending(true);
    setErrorMsg("");
    try {
      await api.post("/users/create-admin", form);
      setModalOpen(false);
      setForm({ name: "", email: "", password: "" });
      setSuccessDialog(true);
      fetchAdmins();
    } catch (err) {
      setErrorMsg(err.response?.data?.mensaje || "Error al crear el admin");
    } finally {
      setIsSending(false);
    }
  };

  const closeModal = () => {
    setModalOpen(false);
    setErrorMsg("");
    setForm({ name: "", email: "", password: "" });
  };

  const inputSx = (hasError) => ({
    "& .MuiOutlinedInput-root": {
      borderRadius: "12px",
      background: theme.tertiaryBack,
      "& fieldset": {
        borderColor: hasError ? "#e53935" : `${accent}35`,
        borderWidth: 1.5,
      },
      "&:hover fieldset": { borderColor: hasError ? "#e53935" : `${accent}70` },
      "&.Mui-focused fieldset": {
        borderColor: hasError ? "#e53935" : accent,
        borderWidth: 2,
      },
    },
    "& .MuiInputBase-input": { color: theme.primaryText },
    "& .MuiInputLabel-root": { color: theme.mutedText },
    "& .MuiInputLabel-root.Mui-focused": {
      color: hasError ? "#e53935" : accent,
    },
  });

  return (
    <Box
      sx={{
        position: "fixed",
        top: "52px",
        left: "68px",
        right: 0,
        bottom: 0,
        display: "flex",
        overflow: "hidden",
      }}
    >
      <Container
        maxWidth="lg"
        sx={{ height: "100%", display: "flex", flexDirection: "column", py: 3 }}
      >
        {/* Header */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2.5,
          }}
        >
          <Box>
            <Typography
              sx={{
                fontWeight: 700,
                fontSize: "1.5rem",
                color: theme.primaryText,
                lineHeight: 1.2,
              }}
            >
              Gestión de administradores
            </Typography>
            <Typography
              sx={{ fontSize: "0.85rem", color: theme.mutedText, mt: 0.25 }}
            >
              {isLoading
                ? "Cargando..."
                : `${filteredAdmins.length} miembro${filteredAdmins.length !== 1 ? "s" : ""} del equipo`}
            </Typography>
          </Box>
          {isDeveloper && (

          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setModalOpen(true)}
            sx={{
              background: `linear-gradient(135deg, ${accent}, ${theme.variantBack || accent})`,
              color: isDark ? "#1a1200" : "#fff",
              borderRadius: "10px",
              textTransform: "none",
              fontWeight: 600,
              boxShadow: `0 4px 12px ${accent}40`,
              "&:hover": { opacity: 0.9 },
            }}
          >
            Nuevo admin
          </Button>
          )}
        </Box>

        {/* Barra de búsqueda */}
        <MainSearchBar
          placeholder="Buscar administrador..."
          searchValue={query}
          onSearchChange={setQuery}
          onReset={() => setQuery("")}
          showAdd={false}
          variant="searchAdmins"
        />

        {/* Listado con scroll */}
        <Box
          sx={{
            flexGrow: 1,
            overflowY: "auto",
            mt: 3,
            pr: 0.5,
            pt: 0.5,
            "&::-webkit-scrollbar": { width: "4px" },
            "&::-webkit-scrollbar-thumb": {
              background: `${accent}40`,
              borderRadius: "10px",
            },
            "&::-webkit-scrollbar-track": { background: "transparent" },
          }}
        >
          {isLoading ? (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                mt: 12,
                gap: 2,
              }}
            >
              <CircularProgress sx={{ color: accent }} size={36} />
              <Typography sx={{ color: theme.mutedText, fontSize: "0.875rem" }}>
                Cargando administradores...
              </Typography>
            </Box>
          ) : filteredAdmins.length === 0 ? (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                mt: 12,
                gap: 2,
                opacity: 0.5,
              }}
            >
              <AdminPanelSettingsIcon
                sx={{ fontSize: 52, color: theme.mutedText }}
              />
              <Typography sx={{ color: theme.mutedText, fontSize: "0.9rem" }}>
                {query
                  ? "No se encontraron administradores"
                  : "No hay administradores todavía"}
              </Typography>
            </Box>
          ) : (
            <Grid container spacing={2}>
              {filteredAdmins.map((admin) => (
                <Grid item sx={{ width: "160px" }} key={admin.id}>
                  <UserCard user={admin} variant="adminCard" />
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      </Container>

      {/* Modal crear admin */}
      <Dialog
        open={modalOpen}
        onClose={closeModal}
        PaperProps={{
          sx: {
            borderRadius: "20px",
            background: theme.secondaryBack,
            minWidth: 400,
            border: `1px solid ${accent}20`,
          },
        }}
      >
        <DialogTitle sx={{ color: theme.primaryText, fontWeight: 700, pb: 1 }}>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            Crear nuevo administrador
            <IconButton
              size="small"
              onClick={closeModal}
              sx={{ color: theme.mutedText }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 2,
            pt: "12px !important",
          }}
        >
          <Typography sx={{ fontSize: "0.82rem", color: theme.mutedText }}>
            El nuevo admin deberá completar su perfil al iniciar sesión por
            primera vez.
          </Typography>
          <TextField
            name="name"
            label="Nombre de usuario"
            fullWidth
            value={form.name}
            onChange={handleChange}
            error={formErrors.name}
            sx={inputSx(formErrors.name)}
          />
          <TextField
            name="email"
            label="Correo electrónico"
            fullWidth
            value={form.email}
            onChange={handleChange}
            error={formErrors.email}
            sx={inputSx(formErrors.email)}
          />
          <TextField
            name="password"
            label="Contraseña inicial"
            type="password"
            fullWidth
            value={form.password}
            onChange={handleChange}
            error={formErrors.password}
            sx={inputSx(formErrors.password)}
          />
          {errorMsg && (
            <Typography
              sx={{
                fontSize: "0.82rem",
                color: "#f44336",
                textAlign: "center",
              }}
            >
              {errorMsg}
            </Typography>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
          <Button
            onClick={closeModal}
            sx={{
              color: theme.mutedText,
              textTransform: "none",
              borderRadius: "8px",
            }}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleCreateAdmin}
            disabled={isSending}
            variant="contained"
            sx={{
              background: `linear-gradient(135deg, ${accent}, ${theme.variantBack || accent})`,
              color: isDark ? "#1a1200" : "#fff",
              textTransform: "none",
              borderRadius: "8px",
              fontWeight: 600,
              px: 3,
              "&:hover": { opacity: 0.9 },
            }}
          >
            {isSending ? (
              <CircularProgress size={18} color="inherit" />
            ) : (
              "Crear administrador"
            )}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog éxito */}
      <Dialog
        open={successDialog}
        onClose={() => setSuccessDialog(false)}
        PaperProps={{
          sx: {
            borderRadius: "20px",
            background: theme.secondaryBack,
            minWidth: 340,
            textAlign: "center",
            border: `1px solid ${accent}20`,
          },
        }}
      >
        <DialogContent sx={{ pt: 4, pb: 2 }}>
          <CheckCircleIcon sx={{ fontSize: 52, color: "#2e7d32", mb: 1.5 }} />
          <Typography
            sx={{
              fontWeight: 700,
              fontSize: "1.1rem",
              color: theme.primaryText,
              mb: 0.5,
            }}
          >
            Admin creado correctamente
          </Typography>
          <Typography
            sx={{
              fontSize: "0.85rem",
              color: theme.mutedText,
              lineHeight: 1.6,
            }}
          >
            El nuevo administrador ya puede iniciar sesión y completar su
            perfil.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ justifyContent: "center", pb: 3 }}>
          <Button
            onClick={() => setSuccessDialog(false)}
            variant="contained"
            sx={{
              background: `linear-gradient(135deg, ${accent}, ${theme.variantBack || accent})`,
              color: isDark ? "#1a1200" : "#fff",
              textTransform: "none",
              borderRadius: "8px",
              fontWeight: 600,
              px: 4,
            }}
          >
            Entendido
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
