import {
  Autocomplete,
  Avatar,
  Button,
  Grid,
  TextField,
  Typography,
} from "@mui/material";
import React, { useEffect, useRef, useState } from "react";
import { useUser } from "../hooks/useUser";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";
import EditIcon from "@mui/icons-material/Edit";
import CheckIcon from "@mui/icons-material/Check";
import { IconButton } from "@mui/material";
import ErrorMessage from "../components/ErrorMessage";
import InterestItem from "../components/interestItem";
import ImageIcon from "@mui/icons-material/Image";

export default function EditUserPage() {
  // Error general (botón guardar)
  const [errorOpen, setErrorOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Error del nombre de usuario
  const [nameErrorOpen, setNameErrorOpen] = useState(false);
  const [nameErrorMsg, setNameErrorMsg] = useState("");

  const { loggedUser } = useUser();
  const navigate = useNavigate();

  // Lista de todos los intereses disponibles
  const [allInterests, setAllInterests] = useState([]);

  // Datos del usuario que se están editando
  const [editedUser, setEditedUser] = useState({});

  // Intereses seleccionados por el usuario
  const [editedUserInterests, setEditedUserInterests] = useState([]);

  // Control del modo edición del nombre
  const [editingName, setEditingName] = useState(false);

  // Control del hover del avatar
  const [avatarHovered, setAvatarHovered] = useState(false);

  // Referencia al input de archivo oculto
  const fileInputRef = useRef(null);

  // Archivo de imagen seleccionado y su preview local
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);

  // Control del botón de guardar para evitar doble click
  const [loading, setLoading] = useState(false);

  // Cuando loggedUser carga, inicializamos el formulario con sus datos
  useEffect(() => {
    if (loggedUser?.id) {
      setEditedUser({ ...loggedUser, first_login: 0 });
    }
  }, [loggedUser]);

  // Cargamos todos los intereses disponibles al montar el componente
  useEffect(() => {
    async function fetchAllInterests() {
      try {
        const res = await api.get("/interests");
        setAllInterests(res.data.datos);
      } catch (error) {
        console.log(error.message);
      }
    }
    fetchAllInterests();
  }, []);

  // Cargamos los intereses del usuario cuando tenemos su id
  useEffect(() => {
    if (!loggedUser.id) return;
    async function fetchUserInterests() {
      try {
        const res = await api.get(
          "/userInterests/" + loggedUser.id + "/interests",
        );
        const array = res.data.datos.map((r) => r.interest);
        setEditedUserInterests(array);
      } catch (error) {
        console.log(error.message);
      }
    }
    fetchUserInterests();
  }, [loggedUser.id]);

  // Actualiza el campo correspondiente del formulario al escribir
  const handleChange = (e) => {
    setEditedUser({ ...editedUser, [e.target.name]: e.target.value });
  };

  // Valida el nombre de usuario y comprueba si ya existe
  const handleUsernameExist = async () => {
    if (editedUser.name.trim() === "") {
      setNameErrorMsg("El nombre de usuario no puede estar vacío");
      setNameErrorOpen(true);
      return;
    }
    if (/[^a-zA-Z0-9_]/.test(editedUser.name)) {
      setNameErrorMsg(
        "El nombre solo puede contener letras, números y guiones bajos.",
      );
      setNameErrorOpen(true);
      return;
    }
    try {
      const res = await api.get("/users/search/" + editedUser.name);
      if (
        !res.data.datos ||
        editedUser.name.toLowerCase() === loggedUser.name.toLowerCase()
      ) {
        setEditingName(false);
        setNameErrorOpen(false);
      } else {
        setNameErrorMsg("Ese nombre ya existe, ponga otro.");
        setNameErrorOpen(true);
      }
    } catch (error) {
      // 404 significa que el nombre no existe, podemos usarlo
      setEditingName(false);
      setNameErrorOpen(false);
    }
  };

  // Añade un interés a la lista si no está ya
  function anyadirInteres(interest) {
    if (!editedUserInterests.find((i) => i.id === interest.id)) {
      setEditedUserInterests([...editedUserInterests, interest]);
    }
  }

  // Elimina un interés de la lista
  function quitarInteres(interestId) {
    setEditedUserInterests(
      editedUserInterests.filter((i) => i.id !== interestId),
    );
  }

  // Guarda todos los cambios: datos del usuario, avatar e intereses
  const editarUsuario = async () => {
    if (editingName) {
      setErrorMsg("Confirma el nombre de usuario antes de guardar.");
      setErrorOpen(true);
      setLoading(false);
      return;
    }
    try {
      if (!loggedUser?.id) throw new Error("Sesión no válida");

      // Eliminamos campos que no deben enviarse al la modificación del usuario
      const {
        id,
        url_image,
        created_at,
        createdAt,
        role,
        password,
        email,
        ...datosPermitidos
      } = editedUser;

      //IMPORTANTE SEGUIR EL ORDEN.
      // 1. Actualizamos los datos del usuario
      await api.put("/users/" + loggedUser.id, datosPermitidos);

      
      // 2. Si hay una nueva imagen la subimos a Cloudinary
      if (avatarFile) {
        const formData = new FormData();
        formData.append("avatar", avatarFile);
        await api.put("/users/" + loggedUser.id + "/avatar", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      // 3. Reemplazamos los intereses del usuario
      await api.delete(`/userinterests/${loggedUser.id}/interests`);
      const interestIds = editedUserInterests.map((i) => i.id);
      if (interestIds.length > 0) {
        await api.post(`/userinterests/${loggedUser.id}/interests`, {
          interestIds,
        });
      }

      navigate("/app/" + loggedUser.id);
    } catch (error) {
      console.error("Error detallado:", error);
      setErrorMsg(error.response?.data?.mensaje || "Error al guardar cambios");
      setErrorOpen(true);
      setLoading(false);
    }
  };

  // Guarda el archivo seleccionado y genera una preview local
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  return (
    <Grid
      container
      width="100%"
      height="100%"
      sx={{ px: 7 }}
      justifyContent="center"
    >
      <Grid
        container
        spacing={3}
        justifyContent="center"
        alignContent="flex-start"
        sx={{
          p: 3,
          mt: "20px",
          borderRadius: 2,
          background: "#D9FCF6",
          width: "75%",
        }}
      >
        <Grid
          container
          direction="column"
          alignItems="center"
          sx={{ width: "100%" }}
        >
          {/* Avatar con overlay al hacer hover */}
          <Grid
            sx={{
              position: "relative",
              width: "150px",
              height: "150px",
              cursor: "pointer",
              borderRadius: "50%",
            }}
            onMouseEnter={() => setAvatarHovered(true)}
            onMouseLeave={() => setAvatarHovered(false)}
            onClick={() => fileInputRef.current.click()}
          >
            <Avatar
              src={
                avatarPreview ||
                editedUser.url_image ||
                "/no_user_avatar_image.png"
              }
              style={{ width: "150px", height: "150px" }}
            />
            {avatarHovered && (
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
                <ImageIcon sx={{ color: "white", fontSize: "2rem" }} />
              </Grid>
            )}
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              style={{ display: "none" }}
              onChange={handleImageChange}
            />
          </Grid>

          {/* Nombre de usuario editable */}
          <Grid
            container
            alignItems="center"
            justifyContent="center"
            spacing={1}
          >
            {editingName ? (
              <>
                <Grid>
                  <TextField
                    name="name"
                    value={editedUser.name ?? ""}
                    onChange={handleChange}
                    size="small"
                    sx={{
                      background: "#FFFFFF",
                      borderRadius: 2,
                      "& .MuiOutlinedInput-root": { borderRadius: 2 },
                      "& .MuiOutlinedInput-notchedOutline": { border: "none" },
                    }}
                  />
                </Grid>
                <Grid>
                  <IconButton
                    onClick={handleUsernameExist}
                    sx={{ color: "#50C2AF" }}
                  >
                    <CheckIcon />
                  </IconButton>
                </Grid>
                {/* Error especifico del nombre */}
                <ErrorMessage
                  message={nameErrorMsg}
                  open={nameErrorOpen}
                  setOpen={setNameErrorOpen}
                />
              </>
            ) : (
              <>
                <Grid>
                  <Typography
                    sx={{
                      fontWeight: "bold",
                      fontSize: "1.5rem",
                      color: "#50C2AF",
                    }}
                  >
                    {"@" + editedUser.name}
                  </Typography>
                </Grid>
                <Grid>
                  <IconButton
                    onClick={() => setEditingName(true)}
                    sx={{ color: "#50C2AF" }}
                  >
                    <EditIcon />
                  </IconButton>
                </Grid>
              </>
            )}
          </Grid>

          {/* Descripcion */}
          <Grid container spacing={1} sx={{ width: "100%", mt: 1 }}>
            <Typography sx={{ fontWeight: "bold", mb: 0.5, color: "#50C2AF" }}>
              Descripción
            </Typography>
            <TextField
              id="bio"
              name="bio"
              variant="outlined"
              fullWidth
              multiline
              value={editedUser.bio ?? ""}
              onChange={handleChange}
              sx={{
                background: "#FFFFFF",
                borderRadius: 2,
                "& .MuiOutlinedInput-root": { borderRadius: 2 },
                "& .MuiOutlinedInput-notchedOutline": { border: "none" },
              }}
            />
          </Grid>

          {/* Frase corta */}
          <Grid container spacing={1} sx={{ width: "100%", mt: 1 }}>
            <Typography sx={{ fontWeight: "bold", mb: 0.5, color: "#50C2AF" }}>
              Frase Corta
            </Typography>
            <TextField
              id="short_sentece"
              name="short_sentece"
              variant="outlined"
              fullWidth
              multiline
              value={editedUser.short_sentece ?? ""}
              onChange={handleChange}
              sx={{
                background: "#FFFFFF",
                borderRadius: 2,
                "& .MuiOutlinedInput-root": { borderRadius: 2 },
                "& .MuiOutlinedInput-notchedOutline": { border: "none" },
              }}
            />
          </Grid>

          {/* Objetivos */}
          <Grid container spacing={1} sx={{ width: "100%", mt: 1 }}>
            <Typography sx={{ fontWeight: "bold", mb: 0.5, color: "#50C2AF" }}>
              Objetivos
            </Typography>
            <TextField
              id="goals"
              name="goals"
              variant="outlined"
              fullWidth
              multiline
              value={editedUser.goals ?? ""}
              onChange={handleChange}
              sx={{
                background: "#FFFFFF",
                borderRadius: 2,
                "& .MuiOutlinedInput-root": { borderRadius: 2 },
                "& .MuiOutlinedInput-notchedOutline": { border: "none" },
              }}
            />
          </Grid>

          {/* Seccion de intereses */}
          <Grid
            container
            spacing={2}
            sx={{
              width: "100%",
              mt: 1,
              background: "#50C2AF",
              borderRadius: 2,
              p: 2,
            }}
          >
            <Grid size={{ xs: 12 }}>
              <Typography
                sx={{ fontWeight: "bold", mb: 0.5, color: "#FFFFFF" }}
              >
                Añadir intereses
              </Typography>
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Autocomplete
                options={allInterests}
                getOptionLabel={(option) => option.name}
                onChange={(event, value) => {
                  if (value) anyadirInteres(value);
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    placeholder="Buscar interés"
                    sx={{
                      background: "#FFFFFF",
                      borderRadius: 1000,
                      "& .MuiOutlinedInput-root": { borderRadius: 1000 },
                      "& .MuiOutlinedInput-notchedOutline": {
                        borderColor: "#50C2AF",
                      },
                      "&:hover .MuiOutlinedInput-notchedOutline": {
                        borderColor: "#79DECE",
                      },
                      "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline":
                        { borderColor: "#50C2AF" },
                    }}
                  />
                )}
              />
            </Grid>
            {/* Lista de intereses seleccionados */}
            {editedUserInterests.length > 0 && (
              <Grid
                container
                spacing={2}
                size={{ xs: 12 }}
                sx={{ p: 2, borderRadius: 2 }}
              >
                {editedUserInterests.map((interest) => (
                  <InterestItem
                    key={interest.id}
                    title={interest.name}
                    color={interest.color}
                    onDelete={() => quitarInteres(interest.id)}
                  />
                ))}
              </Grid>
            )}
          </Grid>

          {/* Error general al guardar */}
          <ErrorMessage
            message={errorMsg}
            open={errorOpen}
            setOpen={setErrorOpen}
          />

          {/* Botones de accion */}
          <Grid
            container
            justifyContent= {loggedUser.first_login == 1 ? "end" :"space-between"}
            sx={{ pt: 2, width: "100%" }}
          >
            {loggedUser && loggedUser.first_login == 0 && (
              <Button
                variant="contained"
                sx={{
                  background: "#50C2AF",
                  "&:hover": { background: "#79DECE" },
                }}
                onClick={() => navigate("/app/" + loggedUser.id)}
              >
                Volver
              </Button>
            )}
            <Button
              disabled={loading}
              variant="contained"
              sx={{
                background: "#50C2AF",
                "&:hover": { background: "#79DECE" },
              }}
              onClick={() => {
                setLoading(true);
                editarUsuario();
              }}
            >
              Aplicar cambios
            </Button>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
}
