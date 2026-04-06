import React, { useEffect, useRef, useState } from "react";
import {
  Autocomplete,
  Avatar,
  Button,
  Grid,
  TextField,
  Typography,
  IconButton,
  CircularProgress,
} from "@mui/material";
import { useUser } from "../hooks/useUser";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";
import {
  Edit as EditIcon,
  Check as CheckIcon,
  Image as ImageIcon,
} from "@mui/icons-material";
import ErrorMessage from "../components/ErrorMessage";
import InterestItem from "../components/InterestItem";
import { useAppTheme } from "../hooks/useAppTheme";

export default function EditUserPage() {
  const { loggedUser, setLoggedUser } = useUser();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [edited, setEdited] = useState(false);
  const theme = useAppTheme();

  const [errorState, setErrorState] = useState({ open: false, msg: "" });
  const [allInterests, setAllInterests] = useState([]);
  const [editedUser, setEditedUser] = useState(null);
  const [editedUserInterests, setEditedUserInterests] = useState([]);
  const limites = { name: 50, short_sentece: 50, bio: 500, goals: 500 };
  const [ui, setUi] = useState({ editingName: false, avatarHovered: false, loading: false });
  const [avatar, setAvatar] = useState({ file: null, preview: null });

  const inputStyle = {
    background: theme.tertiaryBack,
    borderRadius: 2,
    "& .MuiOutlinedInput-root": { borderRadius: 2 },
    "& .MuiOutlinedInput-notchedOutline": { border: "none" },
    "& .MuiInputBase-input": {
      color: theme.fieldsText,
      "&:-webkit-autofill": {
        WebkitBoxShadow: `0 0 0 1000px ${theme.tertiaryBack} inset`,
        WebkitTextFillColor: theme.fieldsText,
      },
    },
    "& .MuiInputLabel-root": { color: theme.fieldsText },
    "& .MuiInputLabel-root.Mui-focused": { color: theme.primaryText },
  };

  useEffect(() => {
    if (!loggedUser) return;
    setEditedUser({ ...loggedUser, first_login: 0 });
  }, [loggedUser]);

  useEffect(() => {
    if (!loggedUser) return;
    async function fetchData() {
      try {
        setUi((prev) => ({ ...prev, loading: true }));
        const [resInterests, resUserInterests] = await Promise.all([
          api.get("/interests"),
          api.get("/users/" + loggedUser.id + "/interests"),
        ]);
        setAllInterests(resInterests.data.datos);
        setEditedUserInterests(resUserInterests.data.datos);
      } catch (e) {
        setErrorState({ msg: "Error al obtener la información del servidor", open: true });
      } finally {
        setUi((prev) => ({ ...prev, loading: false }));
      }
    }
    fetchData();
  }, [loggedUser]);

  if (!editedUser) {
    return (
      <Grid container justifyContent="center" alignItems="center" sx={{ height: "100vh" }}>
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Cargando datos de perfil...</Typography>
      </Grid>
    );
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (value.length <= (limites[name] || 999)) {
      setEditedUser((prev) => ({ ...prev, [name]: value }));
      setEdited(true);
    }
  };

  const handleUsernameExist = async () => {
    const name = editedUser.name?.trim();
    if (!name) return setErrorState({ msg: "El nombre no puede estar vacío", open: true });
    if (/[^a-zA-Z0-9_]/.test(name)) return setErrorState({ msg: "Solo letras, números y _", open: true });
    if (name.toLowerCase() === loggedUser.name.toLowerCase()) {
      setUi({ ...ui, editingName: false });
      setErrorState({ msg: "", open: false });
      return;
    }
    try {
      const res = await api.get("/users/search/" + name);
      if (res.data.datos) {
        return setErrorState({ msg: "Ese nombre de usuario ya está en uso", open: true });
      } else {
        setUi({ ...ui, editingName: false });
      }
    } catch (error) {
      if (error.response?.status === 404) {
        setUi({ ...ui, editingName: false });
        setErrorState({ msg: "", open: false });
      } else {
        setErrorState({ msg: "Error al verificar el nombre", open: true });
      }
    }
  };

  const editarUsuario = async () => {
    if (ui.editingName) return setErrorState({ msg: "Confirma el nombre antes de guardar", open: true });
    setUi({ ...ui, loading: true });

    try {
      const { id, url_image, created_at, role, password, email, banned, ...dataToSend } = editedUser;

      const cleanData = {};
      Object.keys(dataToSend).forEach((key) => {
        cleanData[key] = typeof dataToSend[key] === "string" ? dataToSend[key].trim() : dataToSend[key];
      });

      await api.put("/users/" + loggedUser.id, cleanData);

      let nuevaUrl = editedUser.url_image;

      if (avatar.file) {
        const form = new FormData();
        form.append("avatar", avatar.file);
        const resAvatar = await api.put(`/users/${loggedUser.id}/avatar`, form);
        nuevaUrl = resAvatar.data.url || resAvatar.data.url_image || resAvatar.data.datos?.url_image;
      }

      await api.delete(`/users/${loggedUser.id}/interests`);

      if (editedUserInterests.length > 0) {
        await api.post(`/users/${loggedUser.id}/interests`, {
          interestIds: editedUserInterests.map((i) => i.id),
        });
      }

      setLoggedUser({
        ...loggedUser,
        name: cleanData.name || loggedUser.name,
        url_image: nuevaUrl,
        first_login: 0,
        bio: cleanData.bio,
        goals: cleanData.goals,
        short_sentece: cleanData.short_sentece,
      });

      navigate("/app/" + loggedUser.id);
    } catch (e) {
      if (e.response?.status === 401) {
        setLoggedUser(null);
        navigate("/login");
        return;
      }
      setErrorState({ msg: e.response?.data?.mensaje || "Error al guardar cambios", open: true });
      setUi({ ...ui, loading: false });
    }
  };

  return (
    <Grid container sx={{ px: 7, py: 3 }} direction="column" alignItems="center">
      <Grid
        sx={{ position: "relative", width: 150, height: 150, cursor: "pointer" }}
        onClick={() => fileInputRef.current.click()}
        onMouseEnter={() => setUi((prev) => ({ ...prev, avatarHovered: true }))}
        onMouseLeave={() => setUi((prev) => ({ ...prev, avatarHovered: false }))}
      >
        <Avatar
          src={avatar.preview || editedUser.url_image || "/no_user_avatar_image.png"}
          sx={{ width: 150, height: 150, border: `${theme.primaryText} 2px solid` }}
        />
        {ui.avatarHovered && (
          <Grid sx={{
            position: "absolute", top: 0, left: 0, width: "100%", height: "100%",
            borderRadius: "50%", background: "rgba(0,0,0,0.4)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <ImageIcon sx={{ color: "white" }} />
          </Grid>
        )}
        <input
          type="file" accept="image/*" ref={fileInputRef} style={{ display: "none" }}
          onChange={(e) => {
            if (e.target.files[0]) {
              setAvatar({ file: e.target.files[0], preview: URL.createObjectURL(e.target.files[0]) });
              setEdited(true);
            }
          }}
        />
      </Grid>

      <Grid container alignItems="center" justifyContent="center" sx={{ mt: 2 }}>
        {ui.editingName ? (
          <Grid sx={{ display: "flex", alignItems: "center" }}>
            <TextField name="name" value={editedUser.name} onChange={handleChange} size="small" sx={inputStyle} />
            <IconButton onClick={handleUsernameExist} sx={{ color: theme.primaryText }}>
              <CheckIcon />
            </IconButton>
          </Grid>
        ) : (
          <>
            <Typography sx={{ fontWeight: "bold", fontSize: "1.5rem", color: theme.primaryText }}>
              @{editedUser.name}
            </Typography>
            <IconButton onClick={() => setUi((prev) => ({ ...prev, editingName: true }))} sx={{ color: theme.primaryText }}>
              <EditIcon />
            </IconButton>
          </>
        )}
      </Grid>

      <ErrorMessage
        message={errorState.msg}
        open={errorState.open}
        setOpen={(isOpen) => setErrorState({ ...errorState, open: isOpen })}
      />

      <Grid container spacing={3} justifyContent="center" sx={{ p: 3, mt: 3, borderRadius: 2, background: theme.secondaryBack, width: { xs: "100%", md: "75%" } }}>
        <Grid container direction="column" alignItems="center" sx={{ width: "100%" }}>

          <Grid item sx={{ width: "100%", mt: 1 }}>
            <Grid container justifyContent="space-between">
              <Typography sx={{ fontWeight: "bold", mb: 0.5, color: theme.primaryText }}>Descripción</Typography>
              <Typography sx={{ fontWeight: "bold", mb: 0.5, color: theme.primaryText }}>{editedUser.bio?.length || 0}/{limites.bio}</Typography>
            </Grid>
            <TextField name="bio" fullWidth multiline rows={3} value={editedUser.bio || ""} onChange={handleChange} sx={inputStyle} />
          </Grid>

          <Grid item sx={{ width: "100%", mt: 2 }}>
            <Grid container justifyContent="space-between">
              <Typography sx={{ fontWeight: "bold", mb: 0.5, color: theme.primaryText }}>Frase Corta</Typography>
              <Typography sx={{ fontWeight: "bold", mb: 0.5, color: theme.primaryText }}>{editedUser.short_sentece?.length || 0}/{limites.short_sentece}</Typography>
            </Grid>
            <TextField name="short_sentece" fullWidth value={editedUser.short_sentece || ""} onChange={handleChange} sx={inputStyle} />
          </Grid>

          <Grid item sx={{ width: "100%", mt: 2 }}>
            <Grid container justifyContent="space-between">
              <Typography sx={{ fontWeight: "bold", mb: 0.5, color: theme.primaryText }}>Objetivos</Typography>
              <Typography sx={{ fontWeight: "bold", mb: 0.5, color: theme.primaryText }}>{editedUser.goals?.length || 0}/{limites.goals}</Typography>
            </Grid>
            <TextField name="goals" fullWidth multiline rows={3} value={editedUser.goals || ""} onChange={handleChange} sx={inputStyle} />
          </Grid>

          <Grid container direction="column" sx={{ width: "100%", mt: 3, background: theme.primaryBack, borderRadius: 2, p: 2 }}>
            <Typography sx={{ fontWeight: "bold", color: "#fff", mb: 2 }}>Añadir intereses</Typography>
            <Autocomplete
              fullWidth
              options={allInterests}
              getOptionLabel={(o) => o.name || ""}
              onChange={(_, v) => {
                if (v && !editedUserInterests.find((i) => i.id === v.id)) {
                  setEditedUserInterests([...editedUserInterests, v]);
                  setEdited(true);
                }
              }}
              renderInput={(p) => (
                <TextField {...p} placeholder="Buscar intereses" sx={{ ...inputStyle, borderRadius: 100 }} />
              )}
            />
            <Grid container justifyContent="center" spacing={1} sx={{ mt: 2 }}>
              {editedUserInterests.map((i) => (
                <InterestItem
                  key={i.id} title={i.name} color={i.color}
                  onDelete={() => {
                    setEditedUserInterests(editedUserInterests.filter((x) => x.id !== i.id));
                    setEdited(true);
                  }}
                />
              ))}
            </Grid>
          </Grid>

          <Grid container justifyContent={loggedUser.first_login === 1 ? "flex-end" : "space-between"} sx={{ mt: 4, width: "100%" }}>
            {loggedUser.first_login !== 1 && (
              <Button variant="contained" onClick={() => navigate("/app/" + loggedUser.id)} sx={{ background: theme.variantBack, "&:hover": { background: theme.buttonHover } }}>
                Volver
              </Button>
            )}
            <Button
              disabled={ui.loading} variant="contained" onClick={editarUsuario}
              sx={{ background: theme.variantBack, "&:hover": { background: theme.buttonHover }, minWidth: 150 }}
            >
              {ui.loading ? <CircularProgress size={24} color="inherit" /> : loggedUser.first_login === 1 && !edited ? "Saltar" : "Aplicar cambios"}
            </Button>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
}