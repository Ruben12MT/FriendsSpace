import { Avatar, Button, Grid, Typography, Backdrop } from "@mui/material";
import React, { useEffect, useState } from "react";
import { useUser } from "../hooks/useUser";
import InterestItem from "../components/InterestItem";
import { useNavigate, useParams } from "react-router-dom";
import api from "../utils/api";
import { useAppTheme } from "../hooks/useAppTheme";

export default function UserPage() {
  const navigate = useNavigate();
  const { loggedUser } = useUser();
  const [openZoom, setOpenZoom] = useState(false);
  const { id: userIdAct } = useParams();

  const isLoggedUser = loggedUser?.id == userIdAct;

  const [visitedUser, setVisitedUser] = useState({});
  const [userInterests, setUserInterests] = useState([]);
  const theme = useAppTheme();
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
  }, [isLoggedUser, userIdAct]);

  // Cargar intereses del usuario visitado o del propio usuario
  useEffect(() => {
    async function fetchUserInterest() {
      try {
        const res = await api.get(`/userInterests/${userIdAct}/interests`);
        setUserInterests(res.data.datos);
      } catch (error) {
        console.log(error.message);
      }
    }
    fetchUserInterest();
  }, [userIdAct]);

  // Usuario a mostrar (propio o visitado)
  const userToShow = isLoggedUser ? loggedUser : visitedUser;

  if (!userToShow?.email) return <div>Cargando usuario...</div>;

  return (
    <Grid
      container
      maxWidth="xxl"
      justifyContent="center"
      sx={{ minHeight: "100%" }}
    >
      <Grid
        container
        direction="column"
        spacing={2}
        size={{ xs: 12, md: 7 }}
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
                  src={userToShow.url_image ?? "/no_user_avatar_image.png"}
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
                  @{userToShow.name}
                </Typography>

                {isLoggedUser && (
                  <Typography
                    sx={{ color: theme.secondaryText, fontSize: "0.9rem" }}
                  >
                    {loggedUser.email}
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
                  {new Date(userToShow.created_at).toLocaleDateString("es-ES", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
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
            {userToShow.bio?.trim() && (
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
                    {userToShow.bio}
                  </Typography>
                </Grid>
              </Grid>
            )}
          </Grid>
        </Grid>

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
                    key={interestRec.interest_id}
                    color={interestRec.interest.color}
                    title={interestRec.interest.name}
                  />
                ))}
              </Grid>
            </Grid>
          </Grid>
        )}

        {/* Objetivos */}
        {userToShow.goals?.trim() && (
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
                {userToShow.goals}
              </Typography>
            </Grid>
          </Grid>
        )}

        {/* Frase pública */}
        {userToShow.short_sentece?.trim() && (
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
                {userToShow.short_sentece}
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
          src={userToShow.url_image ?? "/no_user_avatar_image.png"}
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
