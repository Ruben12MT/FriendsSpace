import {
  Autocomplete,
  Avatar,
  Button,
  Grid,
  TextField,
  Typography,
  IconButton,
} from "@mui/material";
import React, { useEffect, useRef, useState } from "react";
import { useUser } from "../hooks/useUser";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";
import {
  Edit as EditIcon,
  Check as CheckIcon,
  Image as ImageIcon,
} from "@mui/icons-material";
import ErrorMessage from "../components/ErrorMessage";
import InterestItem from "../components/interestItem";

const inputStyle = {
  background: "#FFFFFF",
  borderRadius: 2,
  "& .MuiOutlinedInput-root": { borderRadius: 2 },
  "& .MuiOutlinedInput-notchedOutline": { border: "none" },
};

export default function EditUserPage() {
  const { loggedUser, setLoggedUser } = useUser();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [edited, setEdited] = useState(false);
  const [state, setState] = useState({
    errorOpen: false,
    errorMsg: "",
    nameErrorOpen: false,
    nameErrorMsg: "",
  });

  const [allInterests, setAllInterests] = useState([]);
  const [editedUser, setEditedUser] = useState({});
  const [editedUserInterests, setEditedUserInterests] = useState([]);

  const [ui, setUi] = useState({
    editingName: false,
    avatarHovered: false,
    loading: false,
  });

  const [avatar, setAvatar] = useState({
    file: null,
    preview: null,
  });

  // Hook 1: copiar loggedUser cuando llega
  useEffect(() => {
    if (loggedUser?.id) {
      setEditedUser({ ...loggedUser, first_login: 0 });
    }
  }, [loggedUser]);

  // Hook 2: cargar intereses
  useEffect(() => {
    if (!loggedUser?.id) return;

    async function load() {
      try {
        const [resInt, resUserInt] = await Promise.all([
          api.get("/interests"),
          api.get(`/userInterests/${loggedUser.id}/interests`),
        ]);

        setAllInterests(resInt.data.datos);
        setEditedUserInterests(resUserInt.data.datos.map((r) => r.interest));
      } catch (e) {
        console.log(e.message);
      }
    }

    load();
  }, [loggedUser?.id]);

  // Protección después de los hooks
  if (!loggedUser) {
    return <div>Cargando usuario...</div>;
  }

  const handleChange = (e) => {
    setEditedUser({ ...editedUser, [e.target.name]: e.target.value });
    setEdited(true);
  };

  const handleUsernameExist = async () => {
    const name = editedUser.name?.trim();

    if (!name) {
      return setState({
        ...state,
        nameErrorMsg: "El nombre no puede estar vacío",
        nameErrorOpen: true,
      });
    }

    if (/[^a-zA-Z0-9_]/.test(name)) {
      return setState({
        ...state,
        nameErrorMsg: "Caracteres inválidos",
        nameErrorOpen: true,
      });
    }

    try {
      const res = await api.get("/users/search/" + name);

      if (
        res.data.datos &&
        name.toLowerCase() !== loggedUser.name.toLowerCase()
      ) {
        throw new Error();
      }

      setUi({ ...ui, editingName: false });
      setState({ ...state, nameErrorOpen: false });
    } catch {
      setState({
        ...state,
        nameErrorMsg: "Ese nombre ya existe",
        nameErrorOpen: true,
      });
    }
  };

  const editarUsuario = async () => {
    if (ui.editingName) {
      return setState({
        ...state,
        errorMsg: "Confirma el nombre antes de guardar",
        errorOpen: true,
      });
    }

    setUi({ ...ui, loading: true });

    try {
      const {
        id,
        url_image,
        created_at,
        createdAt,
        role,
        password,
        email,
        ...data
      } = editedUser;

      await api.put("/users/" + loggedUser.id, data);

      if (avatar.file) {
        const form = new FormData();
        form.append("avatar", avatar.file);

        await api.put(`/users/${loggedUser.id}/avatar`, form, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      await api.delete(`/userinterests/${loggedUser.id}/interests`);

      if (editedUserInterests.length) {
        await api.post(`/userinterests/${loggedUser.id}/interests`, {
          interestIds: editedUserInterests.map((i) => i.id),
        });
      }

      // Recargar usuario actualizado
      const res = await api.get("/users/" + loggedUser.id);
      setLoggedUser(res.data.datos);

      navigate("/app/" + loggedUser.id);
    } catch (e) {
      setState({
        ...state,
        errorMsg: e.response?.data?.mensaje || "Error al guardar cambios",
        errorOpen: true,
      });
      setUi({ ...ui, loading: false });
    }
  };

  const CustomField = ({ label, name, value }) => (
    <Grid container spacing={1} sx={{ width: "100%", mt: 1 }}>
      <Typography sx={{ fontWeight: "bold", mb: 0.5, color: "#50C2AF" }}>
        {label}
      </Typography>
      <TextField
        name={name}
        fullWidth
        multiline
        value={value ?? ""}
        onChange={handleChange}
        sx={inputStyle}
      />
    </Grid>
  );

  return (
    <Grid container sx={{ px: 7, py: 3 }} justifyContent="center">
      <Grid
        container
        spacing={3}
        justifyContent="center"
        sx={{
          p: 3,
          mt: 3,
          borderRadius: 2,
          background: "#D9FCF6",
          width: "75%",
        }}
      >
        <Grid container direction="column" alignItems="center">
          <Grid
            sx={{
              position: "relative",
              width: 150,
              height: 150,
              cursor: "pointer",
            }}
            onClick={() => fileInputRef.current.click()}
            onMouseEnter={() => setUi({ ...ui, avatarHovered: true })}
            onMouseLeave={() => setUi({ ...ui, avatarHovered: false })}
          >
            <Avatar
              src={
                avatar.preview ||
                editedUser.url_image ||
                "/no_user_avatar_image.png"
              }
              sx={{ width: 150, height: 150 }}
            />

            {ui.avatarHovered && (
              <Grid
                sx={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                  borderRadius: "50%",
                  background: "rgba(0,0,0,0.4)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <ImageIcon sx={{ color: "white" }} />
              </Grid>
            )}

            <input
              type="file"
              ref={fileInputRef}
              style={{ display: "none" }}
              onChange={(e) =>
                setAvatar({
                  file: e.target.files[0],
                  preview: URL.createObjectURL(e.target.files[0]),
                })
              }
            />
          </Grid>

          <Grid
            container
            alignItems="center"
            justifyContent="center"
            sx={{ mt: 2 }}
          >
            {ui.editingName ? (
              <Grid sx={{ display: "flex", alignItems: "center" }}>
                <TextField
                  name="name"
                  value={editedUser.name ?? ""}
                  onChange={handleChange}
                  size="small"
                  sx={inputStyle}
                />
                <IconButton
                  onClick={handleUsernameExist}
                  sx={{ color: "#50C2AF" }}
                >
                  <CheckIcon />
                </IconButton>
              </Grid>
            ) : (
              <>
                <Typography
                  sx={{
                    fontWeight: "bold",
                    fontSize: "1.5rem",
                    color: "#50C2AF",
                  }}
                >
                  @{editedUser.name}
                </Typography>
                <IconButton
                  onClick={() => setUi({ ...ui, editingName: true })}
                  sx={{ color: "#50C2AF" }}
                >
                  <EditIcon />
                </IconButton>
              </>
            )}
          </Grid>

          <CustomField label="Descripción" name="bio" value={editedUser.bio} />
          <CustomField
            label="Frase Corta"
            name="short_sentece"
            value={editedUser.short_sentece}
          />
          <CustomField
            label="Objetivos"
            name="goals"
            value={editedUser.goals}
          />

          <Grid
            container
            spacing={2}
            sx={{
              width: "100%",
              mt: 2,
              background: "#50C2AF",
              borderRadius: 2,
              p: 2,
            }}
          >
            <Grid item xs={12}>
              <Typography sx={{ fontWeight: "bold", color: "#fff" }}>
                Añadir intereses
              </Typography>
            </Grid>

            <Autocomplete
              fullWidth
              options={allInterests}
              getOptionLabel={(o) => o.name}
              onChange={(_, v) =>
                v &&
                !editedUserInterests.find((i) => i.id === v.id) &&
                setEditedUserInterests([...editedUserInterests, v])
              }
              renderInput={(p) => (
                <TextField {...p} sx={{ ...inputStyle, borderRadius: 100 }} />
              )}
            />

            <Grid container spacing={1} sx={{ mt: 1 }}>
              {editedUserInterests.map((i) => (
                <InterestItem
                  key={i.id}
                  title={i.name}
                  color={i.color}
                  onDelete={() =>
                    setEditedUserInterests(
                      editedUserInterests.filter((x) => x.id !== i.id),
                    )
                  }
                />
              ))}
            </Grid>
          </Grid>

          <Grid
            container
            justifyContent={
              loggedUser.first_login == 1 ? "end" : "space-between"
            }
            sx={{ mt: 3, width: "100%" }}
          >
            <Button
              variant="contained"
              onClick={() => navigate("/app/" + loggedUser.id)}
              sx={{
                background: "#50C2AF",
                display: loggedUser.first_login == 1 ? "none" : "flex",
              }}
            >
              Volver
            </Button>

            <Button
              disabled={ui.loading}
              variant="contained"
              onClick={editarUsuario}
              sx={{ background: "#50C2AF" }}
            >
              {loggedUser.first_login == 1 && !edited
                ? "Saltar"
                : "Aplicar cambios"}
            </Button>
          </Grid>
        </Grid>
      </Grid>

      <ErrorMessage
        message={state.nameErrorMsg || state.errorMsg}
        open={state.errorOpen || state.nameErrorOpen}
        setOpen={() =>
          setState({
            ...state,
            errorOpen: false,
            nameErrorOpen: false,
          })
        }
      />
    </Grid>
  );
}
