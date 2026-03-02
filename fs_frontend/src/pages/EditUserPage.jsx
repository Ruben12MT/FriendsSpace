import {
  Autocomplete,
  Avatar,
  Button,
  Grid,
  TextField,
  Typography,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { useUser } from "../hooks/useUser";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";
import EditIcon from "@mui/icons-material/Edit";
import CheckIcon from "@mui/icons-material/Check";
import { IconButton } from "@mui/material";
import ErrorMessage from "../components/ErrorMessage";
import InterestItem from "../components/interestItem";

export default function EditUserPage() {
  const [errorOpen, setErrorOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const { loggedUser } = useUser();
  const navigate = useNavigate();
  const [allInterests, setAllInterests] = useState([]);
  const [editedUser, setEditedUser] = useState({});
  const [editedUserInterests, setEditedUserInterests] = useState([]);
  const [editingName, setEditingName] = useState(false);

  useEffect(() => {
    if (loggedUser?.id) {
      setEditedUser({ ...loggedUser });
    }
  }, [loggedUser]);

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

  const handleChange = (e) => {
    setEditedUser({ ...editedUser, [e.target.name]: e.target.value });
  };

  const handleUsernameExist = async () => {
    if (editedUser.name.trim() === "") {
      setErrorMsg("El nombre de usuario no puede estar vacío");
      setErrorOpen(true);
      return;
    }
    if (/[^a-zA-Z0-9_]/.test(editedUser.name)) {
      setErrorMsg(
        "El nombre solo puede contener letras, números y guiones bajos.",
      );
      setErrorOpen(true);
      return;
    }
    try {
      const res = await api.get("/users/search/" + editedUser.name);
      if (
        !res.data.datos ||
        editedUser.name.toLowerCase() === loggedUser.name.toLowerCase()
      ) {
        setEditingName(false);
      } else {
        setErrorMsg("Ese nombre ya existe, ponga otro.");
        setErrorOpen(true);
      }
    } catch (error) {
      setEditingName(false);
      setErrorOpen(false);
    }
  };

  function anyadirInteres(interest) {
    if (!editedUserInterests.find((i) => i.id === interest.id)) {
      setEditedUserInterests([...editedUserInterests, interest]);
    }
  }

  function quitarInteres(interestId) {
    setEditedUserInterests(
      editedUserInterests.filter((i) => i.id !== interestId),
    );
  }

  const editarUsuario = async () => {
    if (editingName) {
      setErrorMsg("Confirma el nombre de usuario antes de guardar.");
      setErrorOpen(true);
      return;
    }
    try {
      await api.put("/users/" + loggedUser.id, editedUser);
      await api.delete("/userinterests/" + loggedUser.id + "/interests");
      const interestIds = editedUserInterests.map((i) => i.id);
      await api.post("/userinterests/" + loggedUser.id + "/interests", {
        interestIds,
      });
      navigate("/app/" + loggedUser.id);
    } catch (error) {
      setErrorMsg(error.response?.data?.mensaje || "Error al guardar cambios");
      setErrorOpen(true);
    }
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
          <Avatar src="/logo.png" style={{ width: "150px", height: "150px" }} />

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
                <ErrorMessage
                  message={errorMsg}
                  open={errorOpen}
                  setOpen={setErrorOpen}
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
                    {"@"+editedUser.name}
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

          <Grid
            container
            justifyContent="space-between"
            sx={{ pt: 4, width: "100%" }}
          >
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
            <Button
              variant="contained"
              sx={{
                background: "#50C2AF",
                "&:hover": { background: "#79DECE" },
              }}
              onClick={editarUsuario}
            >
              Aplicar cambios
            </Button>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
}
