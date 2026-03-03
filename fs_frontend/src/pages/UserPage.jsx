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
  const [userInterests, setUserInterests] = useState([]);

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
  }, [userIdAct]);

  const userToShow = isLoggedUser ? loggedUser : visitedUser;

  if (!userToShow.email) return null;

  return (
    // Fondo exterior
    <Grid container width="100%" justifyContent="center" sx={{ py: 3, px: 4, minHeight: "100%" }}>

      {/* Columna central con fondo mas claro */}
      <Grid
        container
        direction="column"
        spacing={2}
        size={{ xs: 12, md: 7 }}
        sx={{ background: "#79DECE", borderRadius: 3, p: 3 }}
      >

        {/* Tarjeta principal de info */}
        <Grid size={{ xs: 12 }}>
          <Grid sx={{ background: "#50C2AF", borderRadius: "12px 12px 0 0", height: "12px" }} />
          <Grid container spacing={2} sx={{ background: "#FFFFFF", borderRadius: "0 0 12px 12px", p: 3 }}>

            {/* Avatar y datos principales */}
            <Grid container direction="row" size={{ xs: 12 }} spacing={2} alignItems="flex-start">
              <Grid>
                <Avatar
                  src={userToShow.url_image ?? "/no_user_avatar_image.png"}
                  sx={{ width: 90, height: 90, border: "#50C2AF solid 3px"}}
                  
                />
              </Grid>
              <Grid container direction="column" justifyContent="center" size={{ xs: "grow" }} spacing={0.5}>
                <Typography sx={{ fontWeight: "bold", fontSize: "1.4rem", color: "#50C2AF" }}>
                  {"@" + userToShow.name}
                </Typography>
                {isLoggedUser && (
                  <Typography sx={{ color: "#888", fontSize: "0.9rem" }}>
                    {loggedUser.email}
                  </Typography>
                )}
                <Typography sx={{ color: "#555", fontSize: "0.9rem" }}>
                  13 Conexiones
                </Typography>
              </Grid>
              <Grid container direction="column" alignItems="flex-end" justifyContent="space-between" size={{ xs: "grow" }}>
                <Typography sx={{ color: "#50C2AF", fontSize: "0.85rem", fontWeight: "bold" }}>
                  Miembro desde{" "}
                  {new Date(userToShow.created_at).toLocaleDateString("es-ES", {
                    day: "numeric", month: "long", year: "numeric",
                  })}
                </Typography>
                {isLoggedUser && (
                  <Button
                    variant="contained"
                    sx={{ mt: 1, background: "#50C2AF", "&:hover": { background: "#79DECE" }, borderRadius: 2 }}
                    onClick={() => navigate("/app/" + userIdAct + "/edit")}
                  >
                    Editar perfil
                  </Button>
                )}
              </Grid>
            </Grid>

            {/* Sobre mi */}
            {userToShow.bio && userToShow.bio.trim() !== "" && (
              <Grid size={{ xs: 12 }}>
                <Typography sx={{ fontWeight: "bold", mb: 1 }}>Sobre mí:</Typography>
                <Grid sx={{ background: "#F5F5F5", p: 2, borderRadius: 3 }}>
                  <Typography sx={{ whiteSpace: "pre-wrap", color: "#333" }}>
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
            <Grid container direction="column" spacing={1} sx={{ background: "#50C2AF", borderRadius: 1000, py: 3, px: 4 }}>
              <Typography sx={{ fontWeight: "bold", color: "#FFFFFF", mb: 1 }}>
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

        {/* Objetivos personales */}
        {userToShow.goals && userToShow.goals.trim() !== "" && (
          <Grid size={{ xs: 12 }}>
            <Typography sx={{ fontWeight: "bold", mb: 1, color: "#FFFFFF" }}>Objetivos personales</Typography>
            <Grid sx={{ background: "#FFFFFF", borderRadius: 3, py: 2, px: 3 }}>
              <Typography sx={{ whiteSpace: "pre-wrap", color: "#333" }}>
                {userToShow.goals}
              </Typography>
            </Grid>
          </Grid>
        )}

        {/* Frase publica */}
        {userToShow.short_sentece && userToShow.short_sentece.trim() !== "" && (
          <Grid size={{ xs: 12 }}>
            <Typography sx={{ fontWeight: "bold", mb: 1, color: "#FFFFFF" }}>Frase pública</Typography>
            <Grid sx={{ background: "#FFFFFF", borderRadius: 3, py: 2, px: 3 }}>
              <Typography sx={{ color: "#333" }}>
                {userToShow.short_sentece}
              </Typography>
            </Grid>
          </Grid>
        )}

      </Grid>
    </Grid>
  );
}