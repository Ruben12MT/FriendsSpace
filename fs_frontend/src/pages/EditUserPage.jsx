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
import InterestItem from "../components/InterestItem";
import { useAppTheme } from "../hooks/useAppTheme";

export default function EditUserPage() {
  // Sacamos el loggedUser para hacer la consulta y sacar todos los datos ya que este objeto esta incompleto
  const { loggedUser, setLoggedUser } = useUser();

  // navigate es para navegar entre paginas
  const navigate = useNavigate();

  // Para el input de imágenes
  const fileInputRef = useRef(null);

  // Booleano para mostrar otro texto en el botón cuando edites por primera vez si es tu primer login en la app.
  const [edited, setEdited] = useState(false);

  // Constante que guarda el tema de color actual
  const theme = useAppTheme();

  // Estado para abrir o cerrar el mensaje de error de la app
  const [errorState, setErrorState] = useState({
    open: false,
    msg: "",
  });

  // Estado que guarda un array con todos los intereses para el select de intereses
  const [allInterests, setAllInterests] = useState([]);

  // Estado para guardar el usuario resultante con todos los cambios que se emviarán al backend para aplicarse
  const [editedUser, setEditedUser] = useState(null); // Empezamos en null para saber si ya cargó

  // Estado que guarda un array de intereses propios del usuario que se está editando y que se enviará al backend para sobrescribir si hay cambios
  const [editedUserInterests, setEditedUserInterests] = useState([]);

  // Objeto con los limites que tienen que tener los textfields de cada uno de los datos que se pueden cambiar en esta página
  const limites = { name: 50, short_sentece: 50, bio: 500, goals: 500 };

  // Estados para la ui de botones al editar avatar y nombre de este
  const [ui, setUi] = useState({
    editingName: false,
    avatarHovered: false,
    loading: false,
  });

  // Este estado guarda un objeto con el archivo de la foto antes de mandar al backend y la preview que es la ruta a la imagen para mostrarla al usuario
  const [avatar, setAvatar] = useState({
    file: null,
    preview: null,
  });

  // Para no repetir estilos se guarda en una variable y se reusa cuando se necesita
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

  // Cargamos todos los intereses para el select
  useEffect(() => {
    if (!loggedUser) return;

    async function fetchAllInterests() {
      try {
        // Hacemos la consulta

        const res = await api.get("/interests");

        console.log(res.data.datos);

        setAllInterests(res.data.datos);
      } catch (e) {
        console.error("Error cargando datos:", e);
        setErrorState({
          msg: "Error al obtener la información del servidor",
          open: true,
        });
      } finally {
        // Una vez acabado dejamos de cargar.
        setUi((prev) => ({ ...prev, loading: false }));
      }
    }

    fetchAllInterests();
  }, [loggedUser]);

  // Cargar todo los datos que el usuario tiene actualmente.
  useEffect(() => {
    // loggedUser no existe no se hace nada
    if (!loggedUser) return;

    // Si loggedUser existe
    async function loadFullData() {
      try {
        // Mientras no da resultado activamos que la ui esta cargando
        setUi((prev) => ({ ...prev, loading: true }));

        // Obtenemos todos los datos básicos del usuario
        const conAllBasicData = await api.get("/users/" + loggedUser.id);
        const allUserData = conAllBasicData.data.usuario;
        setEditedUser({...allUserData, first_login: 0});

        // Obtenemos todos sus intereses
        const conAllUserInterests = await api.get(
          "/users/" + loggedUser.id + "/interests",
        );
        const allUserInterests = conAllUserInterests.data.datos;
        setEditedUserInterests(allUserInterests);
      } catch (e) {
        console.error("Error cargando datos:", e);
        setErrorState({
          msg: "Error al obtener la información del servidor",
          open: true,
        });
      } finally {
        // Una vez acabado dejamos de cargar.
        setUi((prev) => ({ ...prev, loading: false }));
      }
    }

    loadFullData();
  }, [loggedUser]);

  // Si todavia no se ha obtenido el usuario completo se queda cargando
  if (!editedUser) {
    return (
      <Grid
        container
        justifyContent="center"
        alignItems="center"
        sx={{ height: "100vh" }}
      >
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Cargando datos de perfil...</Typography>
      </Grid>
    );
  }

  // Manejamos los cambios
  const handleChange = (e) => {
    // Sacamos el nombre y el valor actual de el componente que causa el evento y lo guardamos en dos variables.
    const { name, value } = e.target;

    // Capamos el limite de caracteres con el objeto que creamos anterior
    if (value.length <= (limites[name] || 999)) {
      setEditedUser((prev) => ({ ...prev, [name]: value }));
      setEdited(true);
    }
  };

  // Con esta funcion podremos comprobar si el nombre del usuario esta en uso y es el nuestro actual.
  const handleUsernameExist = async () => {
    // Limpiamos el nombre del usuario
    const name = editedUser.name?.trim();

    // Si el nombre del usuario está vacio se abre un mensaje de error y no se realiza la actualización.
    if (!name)
      return setErrorState({
        msg: "El nombre no puede estar vacío",
        open: true,
      });

    // Comprobamos si el nombre del usuario tiene solo letras, numeros y "_"
    if (/[^a-zA-Z0-9_]/.test(name))
      return setErrorState({ msg: "Solo letras, números y _", open: true });

    // Si el nombre es el mismo que el del usuario loggeado se deja pasar
    if (name.toLowerCase() === loggedUser.name.toLowerCase()) {
      setUi({ ...ui, editingName: false });
      setErrorState({
        msg: "",
        open: false,
      });
      return;
    }

    // Ahora si comprobamos si existe el nombre si no es el de nuestro usuari
    try {
      const res = await api.get("/users/search/" + name);

      // Si el usuario buscado por el nombre es recibido significa que existe y lanza,ps eñ ,emsake de error
      if (res.data.datos) {
        return setErrorState({
          msg: "Ese nombre de usuario ya está en uso",
          open: true,
        });
      } else {
        // Si no, terminamos cerrando la accion de edicion del nombre
        setUi({ ...ui, editingName: false });
      }
    } catch (error) {
      if (error.response?.status === 404) {
        setUi({ ...ui, editingName: false });
        setErrorState({
          msg: "",
          open: false,
        });
      } else {
        setErrorState({ msg: "Error al verificar el nombre", open: true });
      }
    }
  };

  // Función para editar el usuario
  const editarUsuario = async () => {
    // Si se esta editando el nombre decimos que confirme el nombre antes de guardar cambios
    if (ui.editingName)
      return setErrorState({
        msg: "Confirma el nombre antes de guardar",
        open: true,
      });

    // Activamos el estado de loading
    setUi({ ...ui, loading: true });

    try {
      // Limpiamos los datos por precaución los datos que no vamos a editar
      const {
        id,
        url_image,
        created_at,
        role,
        password,
        email,
        ...dataToSend
      } = editedUser;

      // Quitamos los posibles espacios de estos datos.
      const cleanData = {};
      Object.keys(dataToSend).forEach((key) => {
        cleanData[key] =
          typeof dataToSend[key] === "string"
            ? dataToSend[key].trim()
            : dataToSend[key];
      });

      // Lanzamos la edición del usuario
      const resEditedUser = await api.put("/users/" + loggedUser.id, cleanData);

      //--BORRAR--
      console.log("Respuesta de edición del del usuario");
      console.log(resEditedUser);

      // La nueva URL de la imagen, habiendo seleccionado una nueva imagen
      let nuevaUrl = editedUser.url_image;

      // Si hay un archivo seleccionado nuevo.
      if (avatar.file) {
        const form = new FormData();
        form.append("avatar", avatar.file);
        const resAvatar = await api.put(`/users/${loggedUser.id}/avatar`, form);

        //--BORRAR--
        console.log("Respuesta de edición del avatar");
        console.log(resAvatar);

        nuevaUrl =
          resAvatar.data.url ||
          resAvatar.data.url_image ||
          resAvatar.data.datos?.url_image;
      }

      // Borramos todos los intereses del usuario para sobrescribirlos con los nuevos del usuario editado
      await api.delete(`/users/${loggedUser.id}/interests`);

      // Si los intereses que se aplicarán al usuario son mayores que 0 se enviaran a editar.
      if (editedUserInterests.length > 0) {
        await api.post(`/users/${loggedUser.id}/interests`, {
          interestIds: editedUserInterests.map((i) => i.id),
        });
      }

      setLoggedUser({
        ...loggedUser,
        name: editedUser.name,
        url_image: nuevaUrl,
      });

      navigate("/app/" + loggedUser.id);
    } catch (e) {
      // Verificamos si el error es 401 (Token expirado o inexistente)
      if (e.response?.status === 401) {
        // Limpiamos el usuario en Zustand para evitar inconsistencias
        setLoggedUser(null);
        // Redirigimos al login
        navigate("/login");
        return;
      }

      // Si es cualquier otro error mostramos el mensaje
      setErrorState({
        msg: e.response?.data?.mensaje || "Error al guardar cambios",
        open: true,
      });
      setUi({ ...ui, loading: false });
    }
  };

  return (
    <Grid
      container
      sx={{ px: 7, py: 3 }}
      direction="column"
      alignItems="center"
    >
      {/* SECCIÓN AVATAR */}
      <Grid
        sx={{
          position: "relative",
          width: 150,
          height: 150,
          cursor: "pointer",
        }}
        onClick={() => fileInputRef.current.click()}
        onMouseEnter={() => setUi((prev) => ({ ...prev, avatarHovered: true }))}
        onMouseLeave={() =>
          setUi((prev) => ({ ...prev, avatarHovered: false }))
        }
      >
        <Avatar
          src={
            avatar.preview ||
            editedUser.url_image ||
            "/no_user_avatar_image.png"
          }
          sx={{
            width: 150,
            height: 150,
            border: `${theme.primaryText} 2px solid`,
          }}
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
          accept="image/*"
          ref={fileInputRef}
          style={{ display: "none" }}
          onChange={(e) => {
            if (e.target.files[0]) {
              setAvatar({
                file: e.target.files[0],
                preview: URL.createObjectURL(e.target.files[0]),
              });
              setEdited(true);
            }
          }}
        />
      </Grid>

      {/* SECCIÓN NOMBRE */}
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
              value={editedUser.name}
              onChange={handleChange}
              size="small"
              sx={inputStyle}
            />
            <IconButton
              onClick={handleUsernameExist}
              sx={{ color: theme.primaryText }}
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
                color: theme.primaryText,
              }}
            >
              @{editedUser.name}
            </Typography>
            <IconButton
              onClick={() => setUi((prev) => ({ ...prev, editingName: true }))}
              sx={{ color: theme.primaryText }}
            >
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

      {/* FORMULARIO */}
      <Grid
        container
        spacing={3}
        justifyContent="center"
        sx={{
          p: 3,
          mt: 3,
          borderRadius: 2,
          background: theme.secondaryBack,
          width: { xs: "100%", md: "75%" },
        }}
      >
        <Grid
          container
          direction="column"
          alignItems="center"
          sx={{ width: "100%" }}
        >
          {/* DESCRIPCIÓN */}
          <Grid item sx={{ width: "100%", mt: 1 }}>
            <Grid container justifyContent="space-between">
              <Typography
                sx={{ fontWeight: "bold", mb: 0.5, color: theme.primaryText }}
              >
                Descripción
              </Typography>
              <Typography
                sx={{ fontWeight: "bold", mb: 0.5, color: theme.primaryText }}
              >
                {editedUser.bio?.length || 0}/{limites.bio}
              </Typography>
            </Grid>
            <TextField
              name="bio"
              fullWidth
              multiline
              rows={3}
              value={editedUser.bio}
              onChange={handleChange}
              sx={inputStyle}
            />
          </Grid>

          {/* FRASE CORTA */}
          <Grid item sx={{ width: "100%", mt: 2 }}>
            <Grid container justifyContent="space-between">
              <Typography
                sx={{ fontWeight: "bold", mb: 0.5, color: theme.primaryText }}
              >
                Frase Corta
              </Typography>
              <Typography
                sx={{ fontWeight: "bold", mb: 0.5, color: theme.primaryText }}
              >
                {editedUser.short_sentece?.length || 0}/{limites.short_sentece}
              </Typography>
            </Grid>
            <TextField
              name="short_sentece"
              fullWidth
              value={editedUser.short_sentece}
              onChange={handleChange}
              sx={inputStyle}
            />
          </Grid>

          {/* OBJETIVOS */}
          <Grid item sx={{ width: "100%", mt: 2 }}>
            <Grid container justifyContent="space-between">
              <Typography
                sx={{ fontWeight: "bold", mb: 0.5, color: theme.primaryText }}
              >
                Objetivos
              </Typography>
              <Typography
                sx={{ fontWeight: "bold", mb: 0.5, color: theme.primaryText }}
              >
                {editedUser.goals?.length || 0}/{limites.goals}
              </Typography>
            </Grid>
            <TextField
              name="goals"
              fullWidth
              multiline
              rows={3}
              value={editedUser.goals}
              onChange={handleChange}
              sx={inputStyle}
            />
          </Grid>

          {/* INTERESES */}
          <Grid
            container
            direction="column"
            sx={{
              width: "100%",
              mt: 3,
              background: theme.primaryBack,
              borderRadius: 2,
              p: 2,
            }}
          >
            <Typography sx={{ fontWeight: "bold", color: "#fff", mb: 2 }}>
              Añadir intereses
            </Typography>
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
                <TextField
                  {...p}
                  placeholder="Buscar intereses"
                  sx={{ ...inputStyle, borderRadius: 100 }}
                />
              )}
            />
            <Grid container justifyContent="center" spacing={1} sx={{ mt: 2 }}>
              {editedUserInterests.map((i) => (
                <InterestItem
                  key={i.id}
                  title={i.name}
                  color={i.color}
                  onDelete={() => {
                    setEditedUserInterests(
                      editedUserInterests.filter((x) => x.id !== i.id),
                    );
                    setEdited(true);
                  }}
                />
              ))}
            </Grid>
          </Grid>

          {/* BOTONES ACCIÓN */}
          <Grid
            container
            justifyContent={
              loggedUser.first_login === 1 ? "flex-end" : "space-between"
            }
            sx={{ mt: 4, width: "100%" }}
          >
            {loggedUser.first_login !== 1 && (
              <Button
                variant="contained"
                onClick={() => navigate("/app/" + loggedUser.id)}
                sx={{
                  background: theme.variantBack,
                  "&:hover": { background: theme.buttonHover },
                }}
              >
                Volver
              </Button>
            )}
            <Button
              disabled={ui.loading}
              variant="contained"
              onClick={editarUsuario}
              sx={{
                background: theme.variantBack,
                "&:hover": { background: theme.buttonHover },
                minWidth: 150,
              }}
            >
              {ui.loading ? (
                <CircularProgress size={24} color="inherit" />
              ) : loggedUser.first_login === 1 && !edited ? (
                "Saltar"
              ) : (
                "Aplicar cambios"
              )}
            </Button>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
}
