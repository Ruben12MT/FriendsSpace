import { Avatar, Button, Grid, Typography, Backdrop } from "@mui/material";
import React, { useEffect, useState } from "react";
import { useUser } from "../hooks/useUser";
import InterestItem from "../components/InterestItem";
import { useNavigate, useParams } from "react-router-dom";
import api from "../utils/api";
import { useAppTheme } from "../hooks/useAppTheme";
import GradeIcon from "@mui/icons-material/Grade";


export default function UserPage() {
  const navigate = useNavigate();

  // Sacamos a loggedUser por que para comparar el usuario buscado don el logged
  const { loggedUser } = useUser();

  // Estado para el zoom a la imagen del usuario
  const [openZoom, setOpenZoom] = useState(false);

  // El id de los parametros
  const { id: userIdAct } = useParams();

  // Con esta variable se decidira que opciones de ven y que opciones no
  const isLoggedUser = loggedUser?.id == userIdAct;

  // Este estado es para almacenar el objeto completo del usuario visitado, ya seamos nosotros o uno ajeno
  const [visitedUser, setVisitedUser] = useState({});

  // Este estado es para guardar un array de intereses con los intereses del usuario de la página
  const [userInterests, setUserInterests] = useState([]);

  // Usamos el hook useAppTheme para tomar el tema de colores actual
  const theme = useAppTheme();

  // Este useEffect busca el usuario por el id que esta en los parametros de la ruta del navegador y sus intereses
  useEffect(() => {
    async function fetchUser() {
      try {
        // Hacemos la peticion a la base de datos a traves de api.js
        const res = await api.get("/users/" + userIdAct);
        const usuarioBuscado = res.data.usuario;

        // Comprobamos si el usuario existe
        if (usuarioBuscado) {
          console.log("Se ha encontrado ese usuario");
          // Setteamos el estado con el usuario encontrado
          setVisitedUser(usuarioBuscado);
        } else {
          // Si no se encuentra el usuario pues omitimos todo lo siguiente
          return;
        }

        // Hacemos una segunda peticion para sacar los intereses del usuario si es que en este punto existe
        const res2 = await api.get(`/users/${userIdAct}/interests`);

        // Si devuelve algo se muestra ese o si no será un array vacio.
        setUserInterests(res2.data.datos || []);
      } catch (error) {
        console.log(error.message);
      }
    }
    fetchUser();
  }, [userIdAct]);

  return (
    // Contenedor principal
    <Grid
      container
      maxWidth="xxl"
      justifyContent="center"
      sx={{ minHeight: "100%" }}
    >
      {/* Columna central */}
      <Grid
        container
        direction="column"
        spacing={2}
        size={{ xs: 12, md: 9 }}
        sx={{ background: theme.secondaryBack, borderRadius: 3, p: 3 }}
      >
        {/* Tarjeta principal */}
        <Grid size={{ xs: 12 }}>
          <Grid
            sx={{
              background: theme.primaryBack,
              borderRadius: "12px 12px 0 0",
              height: "12px",
            }}
          />
          <Grid
            container
            spacing={2}
            justifyContent={"end"}
            sx={{
              background: theme.tertiaryBack,
              borderRadius: "0 0 12px 12px",
              p: 3,
            }}
          >
            {/* Avatar + info */}
            <Grid
              container
              direction="row"
              size={{ xs: 12 }}
              spacing={2}
              alignItems="flex-start"
            >
              <Grid>
                <Avatar
                  src={visitedUser.url_image ?? "/no_user_avatar_image.png"}
                  onClick={() => setOpenZoom(true)}
                  sx={{
                    width: 90,
                    height: 90,
                    border: theme.primaryBack + " solid 3px",
                    cursor: "pointer",
                    ":hover": { border: theme.primaryText + " solid 3px" },
                  }}
                />
              </Grid>

              <Grid
                container
                direction="column"
                size={{ xs: "grow" }}
                spacing={0.5}
              >
                <Typography
                  sx={{
                    fontWeight: "bold",
                    fontSize: "1.4rem",
                    color: theme.primaryText,
                  }}
                >
                  @{visitedUser.name}
                  {visitedUser.role === "ADMIN" && (
                  <GradeIcon
                    sx={{ color: "#FFD700", fontSize: "1rem", ml: 0.5 }}
                  />
                )}
                </Typography>
                
                {/* Mostramos el email si lo tenemos (el controller ahora lo manda) */}
                {visitedUser.email && (
                  <Typography
                    sx={{ color: theme.secondaryText, fontSize: "0.9rem" }}
                  >
                    {visitedUser.email}
                  </Typography>
                )}

                <Typography
                  sx={{ color: theme.fieldsText, fontSize: "0.9rem" }}
                >
                  13 Conexiones
                </Typography>
              </Grid>

              <Grid
                container
                direction="column"
                alignItems="flex-end"
                justifyContent="space-between"
                size={{ xs: "grow" }}
              >
                <Typography
                  sx={{
                    color: theme.secondaryText,
                    fontSize: "0.85rem",
                    fontWeight: "bold",
                  }}
                >
                  Miembro desde{" "}
                  {visitedUser.created_at
                    ? new Date(visitedUser.created_at).toLocaleDateString(
                        "es-ES",
                        {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        },
                      )
                    : "Reciente"}
                </Typography>

                {/* Ruta correcta para editar */}
                {isLoggedUser ? (
                  <Button
                    variant="contained"
                    sx={{
                      mt: 1,
                      background: theme.variantBack,
                      "&:hover": { background: theme.buttonHover },
                      borderRadius: 2,
                    }}
                    onClick={() => navigate("/app/user/edit")}
                  >
                    Editar perfil
                  </Button>
                ) : (
                  <Button
                    variant="contained"
                    sx={{
                      mt: 1,
                      background: theme.variantBack,
                      "&:hover": { background: theme.buttonHover },
                      borderRadius: 2,
                    }}
                    onClick={() => {}}
                  >
                    Enviar solicitud
                  </Button>
                )}
              </Grid>
            </Grid>

            {/* Sobre mí */}
            {visitedUser.bio?.trim() && (
              <Grid size={{ xs: 12 }}>
                <Typography
                  sx={{ fontWeight: "bold", mb: 1, color: theme.primaryText }}
                >
                  Sobre mí:
                </Typography>
                <Grid
                  sx={{
                    background: theme.secondaryBack,
                    p: 2,
                    borderRadius: 3,
                  }}
                >
                  <Typography
                    sx={{ whiteSpace: "pre-wrap", color: theme.fieldsText }}
                  >
                    {visitedUser.bio}
                  </Typography>
                </Grid>
              </Grid>
            )}
          </Grid>
        </Grid>

        {/* Intereses */}
        {/* Intereses */}
        {userInterests.length > 0 && (
          <Grid size={{ xs: 12 }}>
            <Grid
              container
              direction="column"
              spacing={1}
              sx={{
                background: theme.primaryBack,
                borderRadius: 12,
                py: 3,
                px: 4,
              }}
            >
              <Typography
                sx={{ fontWeight: "bold", color: theme.variantText, mb: 1 }}
              >
                Intereses
              </Typography>

              <Grid container spacing={1}>
                {userInterests.map((interestRec) => (
                  <InterestItem
                    key={interestRec.interest_id || interestRec.id}
                    title={interestRec.interest?.name || interestRec.name}
                  />
                ))}
              </Grid>
            </Grid>
          </Grid>
        )}

        {visitedUser.goals?.trim() && (
          <Grid size={{ xs: 12 }}>
            <Typography
              sx={{ fontWeight: "bold", mb: 1, color: theme.primaryText }}
            >
              Objetivos personales
            </Typography>
            <Grid
              sx={{
                background: theme.tertiaryBack,
                borderRadius: 3,
                py: 2,
                px: 3,
              }}
            >
              <Typography
                sx={{ whiteSpace: "pre-wrap", color: theme.fieldsText }}
              >
                {visitedUser.goals}
              </Typography>
            </Grid>
          </Grid>
        )}

        {/* Frase pública - Corregido a short_sentece según BD */}
        {visitedUser.short_sentece?.trim() && (
          <Grid size={{ xs: 12 }}>
            <Typography
              sx={{ fontWeight: "bold", mb: 1, color: theme.primaryText }}
            >
              Frase pública
            </Typography>
            <Grid
              sx={{
                background: theme.tertiaryBack,
                borderRadius: 3,
                py: 2,
                px: 3,
              }}
            >
              <Typography sx={{ color: theme.fieldsText }}>
                {visitedUser.short_sentece}
              </Typography>
            </Grid>
          </Grid>
        )}
      </Grid>
      {/* Vista ampliada del avatar */}
      <Backdrop
        sx={{
          color: "#fff",
          zIndex: (theme) => theme.zIndex.drawer + 100,
          backgroundColor: "rgba(0, 0, 0, 0.8)",
        }}
        open={openZoom}
        onClick={() => setOpenZoom(false)}
      >
        <img
          src={visitedUser.url_image ?? "/no_user_avatar_image.png"}
          alt="Avatar Zoom"
          style={{
            width: "500px",
            height: "500px",
            borderRadius: 1000,
            boxShadow: "0 0 30px rgba(0,0,0,0.7)",
          }}
        />
      </Backdrop>
    </Grid>
  );
}
