import React, { useEffect, useRef, useState } from "react";
import {
  Autocomplete, Avatar, Button, Box,
  TextField, Typography, IconButton, CircularProgress,
} from "@mui/material";
import { useUser } from "../hooks/useUser";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";
import { Edit as EditIcon, Check as CheckIcon, Image as ImageIcon, Lock as LockIcon } from "@mui/icons-material";
import ErrorMessage from "../components/ErrorMessage";
import InterestItem from "../components/InterestItem";
import { useAppTheme } from "../hooks/useAppTheme";

export default function EditUserPage() {
  const { loggedUser, setLoggedUser } = useUser();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [edited, setEdited] = useState(false);
  const theme = useAppTheme();

  const accent = theme.accent || theme.primaryBack;
  const isDark = theme.name === "dark";

  const [errorState, setErrorState] = useState({ open: false, msg: "" });
  const [allInterests, setAllInterests] = useState([]);
  const [editedUser, setEditedUser] = useState(null);
  const [editedUserInterests, setEditedUserInterests] = useState([]);
  const limites = { name: 50, short_sentece: 50, bio: 500, goals: 500 };
  const [ui, setUi] = useState({ editingName: false, avatarHovered: false, loading: false });
  const [avatar, setAvatar] = useState({ file: null, preview: null });

  const inputStyle = {
    "& .MuiOutlinedInput-root": {
      borderRadius: "12px",
      background: theme.tertiaryBack,
      "& fieldset": { borderColor: `${accent}30`, borderWidth: 1.5 },
      "&:hover fieldset": { borderColor: `${accent}60` },
      "&.Mui-focused fieldset": { borderColor: accent, borderWidth: 2 },
    },
    "& .MuiInputBase-input": {
      color: theme.fieldsText,
      "&:-webkit-autofill": {
        WebkitBoxShadow: `0 0 0 1000px ${theme.tertiaryBack} inset`,
        WebkitTextFillColor: theme.fieldsText,
      },
    },
    "& .MuiInputLabel-root": { color: theme.mutedText },
    "& .MuiInputLabel-root.Mui-focused": { color: accent },
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
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", gap: 2 }}>
        <CircularProgress sx={{ color: accent }} />
        <Typography sx={{ color: theme.mutedText }}>Cargando datos de perfil...</Typography>
      </Box>
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
        await api.post(`/users/${loggedUser.id}/interests`, { interestIds: editedUserInterests.map((i) => i.id) });
      }
      setLoggedUser({ ...loggedUser, name: cleanData.name || loggedUser.name, url_image: nuevaUrl, first_login: 0, bio: cleanData.bio, goals: cleanData.goals, short_sentece: cleanData.short_sentece });
      navigate("/app/" + loggedUser.id);
    } catch (e) {
      if (e.response?.status === 401) { setLoggedUser(null); navigate("/login"); return; }
      setErrorState({ msg: e.response?.data?.mensaje || "Error al guardar cambios", open: true });
      setUi({ ...ui, loading: false });
    }
  };

  const sectionSx = {
    p: 2.5, borderRadius: "16px",
    background: theme.secondaryBack,
    border: `1px solid ${accent}15`,
    mb: 2,
  };

  const labelSx = {
    fontWeight: 700, fontSize: "0.75rem", color: accent,
    letterSpacing: "0.08em", textTransform: "uppercase", mb: 1,
    display: "block",
  };

  const counterSx = {
    fontSize: "0.75rem", color: theme.mutedText, textAlign: "right", mt: 0.5,
  };

  return (
    <Box sx={{ maxWidth: 960, mx: "auto", width: "100%", px: { xs: 2, md: 4, lg: 6 }, py: 4 }}>

      <Box sx={{ borderRadius: "20px", overflow: "hidden", background: theme.secondaryBack, border: `1px solid ${accent}20`, boxShadow: isDark ? "0 4px 24px rgba(0,0,0,0.3)" : `0 4px 24px ${accent}10`, mb: 2 }}>
        <Box sx={{ height: 100, background: isDark ? `linear-gradient(135deg, ${accent}25, ${accent}08)` : `linear-gradient(135deg, ${accent}20, ${accent}06)` }} />

        <Box sx={{ px: 3, pb: 3 }}>
          <Box sx={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 2, mt: "-45px", mb: 2 }}>
            <Box sx={{ display: "flex", alignItems: "flex-end", gap: 2 }}>
              <Box
                sx={{ position: "relative", cursor: "pointer", flexShrink: 0 }}
                onClick={() => fileInputRef.current.click()}
                onMouseEnter={() => setUi((prev) => ({ ...prev, avatarHovered: true }))}
                onMouseLeave={() => setUi((prev) => ({ ...prev, avatarHovered: false }))}
              >
                <Avatar
                  src={avatar.preview || editedUser.url_image || "/no_user_avatar_image.png"}
                  sx={{ width: 90, height: 90, border: `4px solid ${theme.secondaryBack}`, boxShadow: `0 4px 16px ${accent}30` }}
                />
                {ui.avatarHovered && (
                  <Box sx={{ position: "absolute", inset: 0, borderRadius: "50%", background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <ImageIcon sx={{ color: "#fff", fontSize: 28 }} />
                  </Box>
                )}
                <input type="file" accept="image/*" ref={fileInputRef} style={{ display: "none" }}
                  onChange={(e) => {
                    if (e.target.files[0]) {
                      setAvatar({ file: e.target.files[0], preview: URL.createObjectURL(e.target.files[0]) });
                      setEdited(true);
                    }
                  }}
                />
              </Box>

              <Box>
                {ui.editingName ? (
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <TextField name="name" value={editedUser.name} onChange={handleChange} size="small" placeholder="Nombre de usuario" sx={{ ...inputStyle, maxWidth: 260 }} />
                    <IconButton onClick={handleUsernameExist} sx={{ background: accent, color: isDark ? "#1a1200" : "#fff", borderRadius: "10px", width: 36, height: 36, "&:hover": { opacity: 0.9 } }}>
                      <CheckIcon fontSize="small" />
                    </IconButton>
                  </Box>
                ) : (
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    <Typography sx={{ fontWeight: 800, fontSize: "1.3rem", color: theme.primaryText, letterSpacing: "-0.02em" }}>
                      @{editedUser.name}
                    </Typography>
                    <IconButton onClick={() => setUi((prev) => ({ ...prev, editingName: true }))} size="small" sx={{ color: theme.mutedText, "&:hover": { color: accent } }}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Box>
                )}
                <Typography sx={{ fontSize: "0.82rem", color: theme.mutedText, mt: 0.25 }}>
                  {editedUser.email}
                </Typography>
              </Box>
            </Box>

            {loggedUser.first_login !== 1 && (
              <Button
                variant="outlined"
                startIcon={<LockIcon fontSize="small" />}
                onClick={() => navigate("/app/user/changePassword")}
                sx={{
                  borderColor: `${accent}40`, color: accent,
                  borderRadius: "10px", textTransform: "none", fontWeight: 600,
                  fontSize: "0.82rem", px: 2, alignSelf: "flex-end", mb: 0.5,
                  "&:hover": { borderColor: accent, background: `${accent}10` },
                }}
              >
                Cambiar contraseña
              </Button>
            )}
          </Box>

          <ErrorMessage message={errorState.msg} open={errorState.open} setOpen={(isOpen) => setErrorState({ ...errorState, open: isOpen })} />
        </Box>
      </Box>

      <Box sx={sectionSx}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
          <Typography component="span" sx={labelSx}>Descripción</Typography>
          <Typography sx={counterSx}>{editedUser.bio?.length || 0}/{limites.bio}</Typography>
        </Box>
        <TextField name="bio" fullWidth multiline rows={3} placeholder="Cuéntanos algo sobre ti..." value={editedUser.bio || ""} onChange={handleChange} sx={inputStyle} />
      </Box>

      <Box sx={sectionSx}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
          <Typography component="span" sx={labelSx}>Frase pública</Typography>
          <Typography sx={counterSx}>{editedUser.short_sentece?.length || 0}/{limites.short_sentece}</Typography>
        </Box>
        <TextField name="short_sentece" fullWidth placeholder="Una frase que te defina..." value={editedUser.short_sentece || ""} onChange={handleChange} sx={inputStyle} />
      </Box>

      <Box sx={sectionSx}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
          <Typography component="span" sx={labelSx}>Objetivos personales</Typography>
          <Typography sx={counterSx}>{editedUser.goals?.length || 0}/{limites.goals}</Typography>
        </Box>
        <TextField name="goals" fullWidth multiline rows={3} placeholder="¿Qué quieres conseguir?" value={editedUser.goals || ""} onChange={handleChange} sx={inputStyle} />
      </Box>

      <Box sx={{ ...sectionSx, mb: 3 }}>
        <Typography component="span" sx={labelSx}>Intereses</Typography>
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
          renderInput={(p) => <TextField {...p} placeholder="Buscar y añadir intereses..." sx={inputStyle} />}
        />
        {editedUserInterests.length > 0 && (
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75, mt: 1.5 }}>
            {editedUserInterests.map((i) => (
              <InterestItem key={i.id} title={i.name} color={i.color}
                onDelete={() => { setEditedUserInterests(editedUserInterests.filter((x) => x.id !== i.id)); setEdited(true); }}
              />
            ))}
          </Box>
        )}
      </Box>

      <Box sx={{ display: "flex", justifyContent: loggedUser.first_login === 1 ? "flex-end" : "space-between" }}>
        {loggedUser.first_login !== 1 && (
          <Button variant="outlined" onClick={() => navigate("/app/" + loggedUser.id)}
            sx={{ borderColor: `${accent}50`, color: accent, borderRadius: "10px", textTransform: "none", fontWeight: 600, px: 3, "&:hover": { borderColor: accent, background: `${accent}10` } }}>
            Volver
          </Button>
        )}
        <Button
          disabled={ui.loading} variant="contained" onClick={editarUsuario}
          sx={{ background: `linear-gradient(135deg, ${accent}, ${theme.variantBack || accent})`, color: isDark ? "#1a1200" : "#fff", borderRadius: "10px", textTransform: "none", fontWeight: 700, px: 4, minWidth: 160, boxShadow: `0 4px 12px ${accent}40`, "&:hover": { opacity: 0.9 }, "&.Mui-disabled": { background: theme.tertiaryBack, color: theme.mutedText } }}
        >
          {ui.loading ? <CircularProgress size={22} color="inherit" /> : loggedUser.first_login === 1 && !edited ? "Saltar" : "Aplicar cambios"}
        </Button>
      </Box>
    </Box>
  );
}