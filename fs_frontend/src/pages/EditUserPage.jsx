import { Avatar, Button, Grid, TextField, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";
import { useUser } from "../hooks/useUser";
import InterestItem from "../components/interestItem";
import { useNavigate, useParams } from "react-router-dom";
import api from "../utils/api";
import EditIcon from "@mui/icons-material/Edit";
import CheckIcon from "@mui/icons-material/Check";
import { IconButton } from "@mui/material";
import ErrorMessage from "../components/ErrorMessage";
export default function UserPage() {
  const [errorOpen, setErrorOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const { loggedUser } = useUser();

  const [editedUser, setEditedUser] = useState({ ...loggedUser });

  useEffect(() => {
    if (loggedUser?.id) {
      setEditedUser({ ...loggedUser });
    }
  }, [loggedUser]);

  const handleChange = (e) => {
    setEditedUser({ ...editedUser, [e.target.name]: e.target.value });
  };
  const [editingName, setEditingName] = useState(false);

  const handleUsernameExist = async () => {
    if (/[^a-zA-Z0-9_]/.test(editedUser.name)) {
      setErrorMsg(
        "El nombre de usuario solo puede contener letras, números y guiones bajos.",
      );
      setErrorOpen(true);
      return;
    }
    try {
      const res = await api.get("/users/search/" + editedUser.name);
      console.log("res.data.datos:", res.data.datos);
      console.log("editedUser.name:", editedUser.name);
      console.log("loggedUser.name:", loggedUser.name);
      if (!res.data.datos || editedUser.name === loggedUser.name) {
        setEditingName(false);
      } else {
        setErrorMsg("Ese nombre ya existe, ponga otro.");
        setErrorOpen(true);
      }
    } catch (error) {
      console.log(error.message);
      // 404 significa que no existe, perfecto
      setEditingName(false);
    }
  };
  return (
    <Grid
      container
      width={"100%"}
      height={"100%"}
      sx={{ px: 7 }}
      justifyContent={"center"}
    >
      <Grid
        container
        spacing={3}
        justifyContent={"center"}
        alignContent="flex-start"
        sx={{
          p: 3,
          mt: "20px",
          borderRadius: 2,
          background: "#d7fcf6",
          width: "75%",
        }}
      >
        <Grid
          container
          direction={"column"}
          alignItems={"center"}
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
                    value={editedUser.name}
                    onChange={handleChange}
                    size="small"
                    sx={{
                      background: "white",
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
                    {editedUser.name}
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
          {
            // Descripción del usuario
          }
          <Grid container spacing={1} sx={{ width: "100%" }}>
            <Typography sx={{ fontWeight: "bold", mb: 0.5, color: "#1976d2" }}>
              Descripción
            </Typography>
            <TextField
              id="bio"
              name="bio"
              variant="outlined"
              type="text"
              fullWidth
              multiline
              value={editedUser.bio}
              onChange={handleChange}
              sx={{
                background: "white",
                borderRadius: 2,
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                },
                "& .MuiOutlinedInput-notchedOutline": {
                  border: "none",
                },
              }}
            ></TextField>
          </Grid>
          <Grid container spacing={1} sx={{ width: "100%" }}>
            <Typography sx={{ fontWeight: "bold", mb: 0.5, color: "#1976d2" }}>
              Frase Corta
            </Typography>
            <TextField
              id="short_sentece"
              name="short_sentece"
              variant="outlined"
              type="text"
              fullWidth
              multiline
              value={editedUser.short_sentece}
              sx={{
                background: "white",
                borderRadius: 2,
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                },
                "& .MuiOutlinedInput-notchedOutline": {
                  border: "none",
                },
              }}
              onChange={handleChange}
            ></TextField>
          </Grid>
          <Grid container spacing={1} sx={{ width: "100%" }}>
            <Typography sx={{ fontWeight: "bold", mb: 0.5, color: "#1976d2" }}>
              Objetivos
            </Typography>
            <TextField
              id="goals"
              name="goals"
              variant="outlined"
              type="text"
              fullWidth
              multiline
              value={editedUser.goals}
              sx={{
                background: "white",
                borderRadius: 2,
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                },
                "& .MuiOutlinedInput-notchedOutline": {
                  border: "none",
                },
              }}
              onChange={handleChange}
            />
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
}
