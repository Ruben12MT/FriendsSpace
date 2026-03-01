import { Avatar, Button, Grid, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";
import { useUser } from "../hooks/useUser";
import InterestItem from "../components/interestItem";
import { useNavigate, useParams } from "react-router-dom";
import api from "../utils/api";

export default function UserPage() {
  const navigate = useNavigate();
  const { loggedUser } = useUser();
  const userIdParam = useParams("id");
  const userIdAct = userIdParam.id;
  const isLoggedUser = loggedUser.id == userIdAct;

  const [visitedUser, setVisitedUser] = useState({});

  useEffect(() => {
    async function fetchUser() {
      try {
        if (isLoggedUser) return;
        const res = await api.get("/users/" + userIdAct);
        setVisitedUser(res.data.datos);
      } catch (error) {
        console.log(error.message);
      }
    }
    fetchUser();
  }, []);

  const userToShow = isLoggedUser ? loggedUser : visitedUser;

  const [userInterests, setUserInterests] = useState([]);

  useEffect(() => {
    async function fetchUserInterest() {
      try {
        const res = await api.get("/userInterests/" + userIdAct + "/interests");
        setUserInterests(res.data.datos);
      } catch (error) {
        console.log(error.message);
      }
    }
    fetchUserInterest();
  }, []);

  if (!userToShow.email) return null;
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
        {
          //Info del usuario básica (Foto, Nombre, NumConexiones, Desde cuando es miembro)
        }
        <Grid size={{ xs: 12 }}>
          <Grid
            sx={{
              background: "#50c2af",
              width: "100%",
              height: "30px",
              borderRadius: { borderTopLeftRadius: 3, borderTopRightRadius: 3 },
            }}
          ></Grid>

          <Grid
            container
            spacing={2}
            sx={{
              background: "#ffffff",
              width: "100%",
              minHeight: "100px",
              borderRadius: {
                borderBottomLeftRadius: 3,
                borderBottomRightRadius: 3,
              },
              p: 3,
            }}
          >
            {
              //Columna 1: Foto de perfil, Nombre, Correo (solo si es él mismo)
            }
            <Grid
              container
              direction={"row"}
              size={{ xs: 6 }}
              sx={{
                minHeight: "100px",
                borderRadius: {
                  borderBottomLeftRadius: 3,
                  borderBottomRightRadius: 3,
                },
              }}
            >
              <Grid size={{ xs: 4 }}>
                <Avatar
                  src="/logo.png"
                  style={{ width: "100%", height: "100%" }}
                />
              </Grid>
              <Grid
                container
                justifyContent={"space-between"}
                direction="column"
                size={{ xs: 8 }}
                sx={{
                  minHeight: "100px",
                }}
              >
                <Typography>{userToShow.name}</Typography>
                {
                  //Si el usuario es el mismo que el que está logueado el email se muestra.
                  isLoggedUser && <Typography>{loggedUser.email}</Typography>
                }
                <Typography>100 Friends</Typography>
              </Grid>
            </Grid>
            {
              //Columna 2: Fecha de registro, botón de editar perfil (solo si es él mismo)
            }
            <Grid
              container
              direction="column"
              justifyContent="space-between"
              alignItems="flex-end"
              size={{ xs: 6 }}
              sx={{
                minHeight: "100px",
                borderBottomLeftRadius: 3,
                borderBottomRightRadius: 3,
              }}
            >
              <Typography>
                {" "}
                Miembro desde{" "}
                {new Date(userToShow.created_at).toLocaleDateString("es-ES", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </Typography>
              {isLoggedUser && (
                <Button
                  variant="contained"
                  color="primary"
                  sx={{}}
                  onClick={() => {navigate("/app/"+userIdAct+"/edit")}}
                >
                  Editar Perfil
                </Button>
              )}
            </Grid>
            {
              //Fila: (Si tiene) Información "Sobre Mi"
            }
            {userToShow.bio && userToShow.bio.trim() !== "" && (
              <Grid
                spacing={0}
                container
                direction={"column"}
                size={{ xs: 12 }}
                sx={{
                  minHeight: "100px",
                  borderRadius: {
                    borderBottomLeftRadius: 3,
                    borderBottomRightRadius: 3,
                  },
                }}
              >
                <Typography sx={{ fontWeight: "bold" }}>Sobre mí:</Typography>{" "}
                <Grid
                  sx={{
                    background: "#d8d8d8",
                    minHeight: "60px",
                    p: 2,
                    borderRadius: 4,
                  }}
                >
                  Pues soy un usuario creativo
                </Grid>
              </Grid>
            )}
          </Grid>
        </Grid>

        {
          // Intereses del usuario
          true && (
            <Grid
              container
              direction={"column"}
              spacing={1}
              size={{ xs: 12 }}
              sx={{
                background: "#50c2af",
                borderRadius: 1000,
                py: 3,
                px: 4,
              }}
            >
              <Typography sx={{ fontWeight: "bold", color: "white" }}>
                Intereses
              </Typography>

              <Grid container spacing={1}>
                {userInterests.map((interestRec) => {
                  return (
                    <InterestItem
                      key={interestRec.interest_id}
                      color={interestRec.interest.color}
                      title={interestRec.interest.name}
                    />
                  );
                })}
              </Grid>
            </Grid>
          )
        }
        {
          // (Si tiene) Objetivos personales del usuario
          userToShow.goals && userToShow.goals.trim() !== "" && (
            <Grid
              container
              spacing={1}
              size={{ xs: 12 }}
              sx={{
                borderRadius: 1000,
              }}
            >
              <Typography sx={{ fontWeight: "bold", px: 4 }}>
                Objetivos personales
              </Typography>
              <Grid
                container
                direction={"column"}
                spacing={1}
                size={{ xs: 12 }}
                sx={{
                  background: "#ffffff",
                  borderRadius: 1000,
                  py: 3,
                  px: 4,
                }}
              >
                <Typography sx={{ whiteSpace: "pre-wrap" }}>
                  {userToShow.goals}
                </Typography>
              </Grid>
            </Grid>
          )
        }

        {
          // (Si tiene) Frase pública del usuario
          userToShow.short_sentece &&
            userToShow.short_sentece.trim() !== "" && (
              <Grid
                container
                spacing={1}
                sx={{
                  width: "100%",
                  borderRadius: 1000,
                }}
              >
                <Typography sx={{ fontWeight: "bold", px: 4 }}>
                  Frase pública
                </Typography>
                <Grid
                  container
                  direction={"column"}
                  spacing={1}
                  sx={{
                    background: "#ffffff",
                    width: "100%",
                    borderRadius: 1000,
                    py: 3,
                    px: 4,
                  }}
                >
                  <Typography sx={{}}>{userToShow.short_sentece}</Typography>
                </Grid>
              </Grid>
            )
        }
      </Grid>
    </Grid>
  );
}
