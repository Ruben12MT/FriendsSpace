import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Box,
  Container,
  Typography,
  CircularProgress,
  ToggleButton,
  ToggleButtonGroup,
  useMediaQuery,
  useTheme,
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
  const muiTheme = useTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down("md"));
  const { loggedUser } = useUser();

  const [users, setUsers] = useState([]);
  const [allInterests, setAllInterests] = useState([]);
  const [userInterests, setUserInterests] = useState([]);
  const [query, setQuery] = useState("");
  const [selectedInterests, setSelectedInterests] = useState([-1]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [viewMode, setViewMode] = useState("card");

  const effectiveViewMode = isMobile ? "row" : viewMode;

  const sentinelRef = useRef(null);
  const searchTimeoutRef = useRef(null);

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

  const buildParams = useCallback(
    (pageNum) => {
      const params = { page: pageNum, limit: 20 };
      if (query.trim()) params.search = query.trim();

      if (selectedInterests.includes(0)) {
        const misIds = userInterests
          .map((i) => i.id || i.interest_id)
          .filter(Boolean);
        if (misIds.length > 0) params.interests = misIds.join(",");
      } else {
        const interestIds = selectedInterests.filter((i) => i > 0);
        if (interestIds.length > 0) params.interests = interestIds.join(",");
      }

      return params;
    },
    [query, selectedInterests, userInterests],
  );

  const fetchUsers = useCallback(
    async (pageNum = 1, reset = false) => {
      if (pageNum === 1) setIsLoading(true);
      else setIsLoadingMore(true);
      try {
        const res = await api.get("/users", { params: buildParams(pageNum) });
        if (res.data?.ok) {
          const nuevos = res.data.datos.filter((u) => u.id !== loggedUser?.id);
          setUsers((prev) => (reset ? nuevos : [...prev, ...nuevos]));
          setHasMore(res.data.hasMore);
          setPage(pageNum);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    },
    [buildParams, loggedUser],
  );

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
        .catch(console.error);
    }
    fetchAllInterests();
  }, [loggedUser]);

  useEffect(() => {
    clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => {
      fetchUsers(1, true);
    }, 400);
    return () => clearTimeout(searchTimeoutRef.current);
  }, [query, selectedInterests]);

  useEffect(() => {
    if (!sentinelRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && hasMore && !isLoadingMore && !isLoading)
          fetchUsers(page + 1);
      },
      { threshold: 0.1 },
    );
    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [hasMore, isLoadingMore, isLoading, page, fetchUsers]);

  const handleSelectInterest = (e) => {
    const nuevosValores = e.target.value;
    const ultimaSeleccion = nuevosValores[nuevosValores.length - 1];
    if (nuevosValores.length === 0 || ultimaSeleccion === -1)
      setSelectedInterests([-1]);
    else if (ultimaSeleccion === 0) setSelectedInterests([0]);
    else
      setSelectedInterests(nuevosValores.filter((id) => id !== 0 && id !== -1));
  };

  const handleReset = () => {
    setQuery("");
    setSelectedInterests([-1]);
  };

  return (
    <Box
      sx={{
        position: "fixed",
        top: "52px",
        left: { xs: 0, sm: "68px" },
        right: 0,
        bottom: { xs: "56px", sm: 0 },
        display: "flex",
        overflow: "hidden",
      }}
    >
      <Container
        maxWidth="xl"
        sx={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
          py: { xs: 2, md: 3 },
          px: { xs: 2, md: 4 },
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2.5,
          }}
        >
          <Box>
            <Typography
              sx={{
                fontWeight: 700,
                fontSize: { xs: "1.2rem", md: "1.5rem" },
                color: textMain,
                lineHeight: 1.2,
              }}
            >
              {loggedUser?.role === "DEVELOPER" || loggedUser?.role === "ADMIN"
                ? "Buscar usuarios"
                : "Encuentra tu friend"}
            </Typography>
            <Typography
              sx={{ fontSize: "0.85rem", color: textMuted, mt: 0.25 }}
            >
              {isLoading
                ? "Buscando..."
                : users.length > 0
                  ? `${users.length} usuario${users.length !== 1 ? "s" : ""} cargados`
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
              display: { xs: "none", md: "flex" },
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
          onReset={handleReset}
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
            pr: 0.5,
            pt: 0.5,
            "&::-webkit-scrollbar": { width: "4px" },
            "&::-webkit-scrollbar-thumb": {
              background: `${accent}40`,
              borderRadius: "10px",
            },
            "&::-webkit-scrollbar-track": { background: "transparent" },
          }}
        >
          {isLoading ? (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                mt: 12,
                gap: 2,
              }}
            >
              <CircularProgress sx={{ color: accent }} size={36} />
              <Typography sx={{ color: textMuted, fontSize: "0.875rem" }}>
                Cargando usuarios...
              </Typography>
            </Box>
          ) : users.length === 0 ? (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                mt: 12,
                gap: 2,
                opacity: 0.5,
              }}
            >
              <PeopleOutlineIcon sx={{ fontSize: 52, color: textMuted }} />
              <Typography sx={{ color: textMuted, fontSize: "0.9rem" }}>
                No se encontraron usuarios
              </Typography>
            </Box>
          ) : effectiveViewMode === "card" ? (
            <>
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: {
                    xs: "1fr",
                    sm: "repeat(2, 1fr)",
                    md: "repeat(3, 1fr)",
                    lg: "repeat(4, 1fr)",
                    xl: "repeat(5, 1fr)",
                  },
                  gap: 2,
                }}
              >
                {users.map((user) => (
                  <UserCard key={user.id} user={user} variant="card" />
                ))}
              </Box>
              <Box
                ref={sentinelRef}
                sx={{
                  height: 40,
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  mt: 2,
                }}
              >
                {isLoadingMore && (
                  <CircularProgress size={24} sx={{ color: accent }} />
                )}
              </Box>
            </>
          ) : (
            <>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 1,
                  maxWidth: 800,
                  mx: "auto",
                }}
              >
                {users.map((user) => (
                  <UserCard key={user.id} user={user} variant="row" />
                ))}
              </Box>
              <Box
                ref={sentinelRef}
                sx={{
                  height: 40,
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  mt: 2,
                }}
              >
                {isLoadingMore && (
                  <CircularProgress size={24} sx={{ color: accent }} />
                )}
              </Box>
            </>
          )}
        </Box>
      </Container>
    </Box>
  );
}
