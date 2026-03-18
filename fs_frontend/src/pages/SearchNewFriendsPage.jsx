import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  Typography,
  Grid,
  CircularProgress,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import ViewModuleIcon from "@mui/icons-material/ViewModule";
import ViewStreamIcon from "@mui/icons-material/ViewStream";
import { useAppTheme } from "../hooks/useAppTheme";
import { useUser } from "../hooks/useUser";
import UserCard from "../components/UserCard";
import MainSearchBar from "../components/MainSearchBar";
import api from "../utils/api";
import { AnimatePresence } from "framer-motion";

export default function SearchNewFriendsPage() {
  const theme = useAppTheme();
  const { loggedUser } = useUser();

  const [allUsers, setAllUsers] = useState([]);
  const [usersToShow, setUsersToShow] = useState([]);
  const [allInterests, setAllInterests] = useState([]);
  const [userInterests, setUserInterests] = useState([]);
  const [query, setQuery] = useState("");
  const [selectedInterests, setSelectedInterests] = useState([-1]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState("card");

  const navbarHeight = "160px";

  const fetchAllUsers = async () => {
    setIsLoading(true);
    try {
      const res = await api.get("/users");
      if (res.data?.ok) setAllUsers(res.data.datos);
    } catch (err) {
      console.error(err);
    } finally {
      setTimeout(() => setIsLoading(false), 300);
    }
  };

  const fetchAllInterests = async () => {
    try {
      const res = await api.get("/interests");
      if (res.data?.datos) setAllInterests(res.data.datos);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (loggedUser) {
      api
        .get(`/users/${loggedUser.id}/interests`)
        .then((res) => setUserInterests(res.data.datos || []))
        .catch((err) => console.log(err));
    }
    fetchAllUsers();
    fetchAllInterests();
  }, [loggedUser]);

  useEffect(() => {
    const busqueda = query.toLowerCase().trim();
    const filtrados = allUsers.filter((user) => {
      if (loggedUser && user.id === loggedUser.id) return false;
      const coincideTexto =
        busqueda === "" ||
        user.username?.toLowerCase().includes(busqueda) ||
        user.name?.toLowerCase().includes(busqueda);
      const coincideInteres =
        selectedInterests.includes(-1) ||
        user.interests?.some((uInt) => {
          const idInt = uInt.id || uInt.interest_id;
          if (selectedInterests.includes(0)) {
            return userInterests.some(
              (myInt) => (myInt.id || myInt.interest_id) === idInt,
            );
          }
          return selectedInterests.includes(Number(idInt));
        });
      return coincideTexto && coincideInteres;
    });
    setUsersToShow(filtrados);
  }, [allUsers, query, selectedInterests, loggedUser, userInterests]);

  const handleSelectInterest = (e) => {
    const nuevosValores = e.target.value;
    const ultimaSeleccion = nuevosValores[nuevosValores.length - 1];
    if (nuevosValores.length === 0 || ultimaSeleccion === -1) {
      setSelectedInterests([-1]);
    } else if (ultimaSeleccion === 0) {
      setSelectedInterests([0]);
    } else {
      setSelectedInterests(nuevosValores.filter((id) => id !== 0 && id !== -1));
    }
  };

  return (
    <Box
      sx={{
        position: "fixed",
        top: navbarHeight,
        left: 0,
        right: 0,
        bottom: 0,
        display: "flex",
        overflow: "hidden",
      }}
    >
      <Container
        maxWidth="lg"
        sx={{ height: "100%", display: "flex", flexDirection: "column", py: 3 }}
      >
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          sx={{ mb: 2 }}
        >
          <Typography
            variant="h4"
            sx={{ color: theme.primaryText, fontWeight: "bold" }}
          >
            ¡Encuentra tu friend!
          </Typography>

          <ToggleButtonGroup
            value={viewMode}
            exclusive
            onChange={(e, v) => v && setViewMode(v)}
            sx={{
              background: theme.tertiaryBack,
              borderRadius: 3,
              p: 0.5,
              height: 40,
            }}
          >
            <ToggleButton value="card" sx={{ border: "none" }}>
              <ViewModuleIcon sx={{ color: theme.primaryText }} />
            </ToggleButton>
            <ToggleButton value="row" sx={{ border: "none" }}>
              <ViewStreamIcon sx={{ color: theme.primaryText }} />
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>

        <MainSearchBar
          placeholder="Busca por nombre..."
          searchValue={query}
          onSearchChange={setQuery}
          onReset={() => {
            setQuery("");
            setSelectedInterests([-1]);
            fetchAllUsers();
          }}
          showAdd={false}
          interests={allInterests}
          selectedInterests={selectedInterests}
          onInterestChange={handleSelectInterest}
        />

        <Box
          sx={{
            flexGrow: 1,
            overflowY: "auto",
            mt: 3,
            pr: 1,
            "&::-webkit-scrollbar": { width: "6px" },
            "&::-webkit-scrollbar-thumb": {
              backgroundColor: "rgba(255,255,255,0.2)",
              borderRadius: "10px",
            },
          }}
        >
          {isLoading ? (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}>
              <CircularProgress sx={{ color: "#fff" }} />
            </Box>
          ) : (
            <Grid container spacing={2} sx={{ minHeight: "auto" }}>
              {usersToShow.map((user) => {
                return (
                  <Grid
                    key={user.id}
                    size={{ xs: viewMode === "card" ? 6 : 12, md: viewMode === "card" ? 6 : 12 , lg: viewMode === "card" ? 4 : 12 }}
                    sx={{ pt: 1 }}
                  >
                    <UserCard user={user} variant={viewMode} />
                  </Grid>
                );
              })}
            </Grid>
          )}
        </Box>
      </Container>
    </Box>
  );
}
