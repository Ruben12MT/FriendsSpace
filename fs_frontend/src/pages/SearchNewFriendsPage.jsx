import React, { useState, useEffect } from "react";
import {
  Box, Container, Typography, Grid,
  CircularProgress, ToggleButton, ToggleButtonGroup,
} from "@mui/material";
import ViewModuleIcon from "@mui/icons-material/ViewModule";
import ViewStreamIcon from "@mui/icons-material/ViewStream";
import PeopleOutlineIcon from "@mui/icons-material/PeopleOutline";
import { useAppTheme } from "../hooks/useAppTheme";
import { useUser } from "../hooks/useUser";
import UserCard from "../components/UserCard";
import MainSearchBar from "../components/MainSearchBar";
import api from "../utils/api";

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

  const accent = theme.accent || theme.primaryBack;
  const textMain = theme.primaryText;
  const textMuted = theme.mutedText || theme.secondaryText;

  const toggleButtonSx = {
    border: "none",
    borderRadius: "8px !important",
    color: textMuted,
    background: "transparent",
    "&.Mui-selected": {
      color: textMain,
      background: `${accent}20`,
      "&:hover": { background: `${accent}30` },
    },
    "&:hover": { background: `${accent}10` },
    px: 1.25,
  };

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
      api.get(`/users/${loggedUser.id}/interests`)
        .then((res) => setUserInterests(res.data.datos || []))
        .catch(console.error);
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
            return userInterests.some((myInt) => (myInt.id || myInt.interest_id) === idInt);
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
    <Box sx={{
      position: "fixed", top: "52px", left: "68px", right: 0, bottom: 0,
      display: "flex", overflow: "hidden",
    }}>
      <Container maxWidth="lg" sx={{ height: "100%", display: "flex", flexDirection: "column", py: 3 }}>

        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2.5 }}>
          <Box>
            <Typography sx={{ fontWeight: 700, fontSize: "1.5rem", color: textMain, lineHeight: 1.2 }}>
              Encuentra tu friend
            </Typography>
            <Typography sx={{ fontSize: "0.85rem", color: textMuted, mt: 0.25 }}>
              {usersToShow.length > 0 && !isLoading
                ? `${usersToShow.length} usuario${usersToShow.length !== 1 ? "s" : ""} encontrado${usersToShow.length !== 1 ? "s" : ""}`
                : "Busca por nombre o intereses"}
            </Typography>
          </Box>

          <ToggleButtonGroup
            value={viewMode}
            exclusive
            onChange={(e, v) => v && setViewMode(v)}
            sx={{
              background: theme.tertiaryBack,
              borderRadius: "12px",
              p: 0.5,
              height: 38,
              border: `1px solid ${accent}20`,
            }}
          >
            <ToggleButton value="card" sx={toggleButtonSx}>
              <ViewModuleIcon fontSize="small" />
            </ToggleButton>
            <ToggleButton value="row" sx={toggleButtonSx}>
              <ViewStreamIcon fontSize="small" />
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>

        <MainSearchBar
          placeholder="Busca por nombre..."
          searchValue={query}
          onSearchChange={setQuery}
          onReset={() => { setQuery(""); setSelectedInterests([-1]); fetchAllUsers(); }}
          showAdd={false}
          interests={allInterests}
          selectedInterests={selectedInterests}
          onInterestChange={handleSelectInterest}
        />

        <Box sx={{
          flexGrow: 1, overflowY: "auto", mt: 3, pr: 0.5, pt: 0.5,
          "&::-webkit-scrollbar": { width: "4px" },
          "&::-webkit-scrollbar-thumb": { background: `${accent}40`, borderRadius: "10px" },
          "&::-webkit-scrollbar-track": { background: "transparent" },
        }}>
          {isLoading ? (
            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", mt: 12, gap: 2 }}>
              <CircularProgress sx={{ color: accent }} size={36} />
              <Typography sx={{ color: textMuted, fontSize: "0.875rem" }}>Cargando usuarios...</Typography>
            </Box>
          ) : usersToShow.length === 0 ? (
            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", mt: 12, gap: 2, opacity: 0.5 }}>
              <PeopleOutlineIcon sx={{ fontSize: 52, color: textMuted }} />
              <Typography sx={{ color: textMuted, fontSize: "0.9rem" }}>No se encontraron usuarios</Typography>
            </Box>
          ) : (
            <Grid container spacing={2}>
              {usersToShow.map((user) => (
                <Grid
                  key={user.id}
                  size={{
                    xs: viewMode === "card" ? 6 : 12,
                    md: viewMode === "card" ? 6 : 12,
                    lg: viewMode === "card" ? 4 : 12,
                  }}
                >
                  <UserCard user={user} variant={viewMode} />
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      </Container>
    </Box>
  );
}