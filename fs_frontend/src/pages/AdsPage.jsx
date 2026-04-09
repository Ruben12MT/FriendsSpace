import React, { useEffect, useState, useRef, useCallback } from "react";
import {
  TextField,
  MenuItem,
  Box,
  Typography,
  IconButton,
  CircularProgress,
  Container,
} from "@mui/material";
import { useAppTheme } from "../hooks/useAppTheme";
import AdCard from "../components/AdCard";
import { motion, AnimatePresence } from "framer-motion";
import AddIcon from "@mui/icons-material/Add";
import { useUser } from "../hooks/useUser";
import api from "../utils/api";
import { RotateCcw } from "lucide-react";
import FormAdCard from "../components/FormAdCard";
import ConfirmModal from "../components/ConfirmModal";

export default function AdsPage() {
  const { loggedUser } = useUser();
  const theme = useAppTheme();

  const accent = theme.accent || theme.primaryBack;
  const isDark = theme.name === "dark";

  const [selectedAdId, setSelectedAdId] = useState(null);
  const [allInterests, setAllInterests] = useState([]);
  const [selectedInterests, setSelectedInterests] = useState([0]);
  const [ads, setAds] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [wordToSearch, setWordToSearch] = useState("");
  const [userInterests, setUserInterests] = useState([]);
  const [openFormAd, setOpenFormAd] = useState(false);
  const [toast, setToast] = useState({ open: false, message: "" });
  const [confirmDelete, setConfirmDelete] = useState({
    open: false,
    adId: null,
  });

  const sentinelRef = useRef(null);
  const searchTimeoutRef = useRef(null);

  useEffect(() => {
    if (!loggedUser) return;
    api
      .get(`/users/${loggedUser.id}/interests`)
      .then((res) => setUserInterests(res.data.datos || []))
      .catch(console.error);
  }, [loggedUser]);

  useEffect(() => {
    api
      .get("/interests")
      .then((res) => {
        if (res.data?.datos) setAllInterests(res.data.datos);
      })
      .catch(console.error);
  }, []);

  const buildParams = useCallback(
    (pageNum) => {
      const params = { page: pageNum, limit: 20 };
      if (wordToSearch.trim()) params.search = wordToSearch.trim();
      return params;
    },
    [wordToSearch],
  );

  const fetchAds = useCallback(
    async (pageNum = 1, reset = false) => {
      if (pageNum === 1) setIsLoading(true);
      else setIsLoadingMore(true);

      try {
        const res = await api.get("/ads", { params: buildParams(pageNum) });
        if (res.data?.ok) {
          // Filtrar por intereses en el frontend (el filtro server-side es solo por texto)
          const nuevos = res.data.datos.filter((ad) => {
            return (
              selectedInterests.includes(-1) ||
              ad.interests?.some((interesDelAnuncio) => {
                const idAnuncio =
                  interesDelAnuncio.id || interesDelAnuncio.interest_id;
                if (selectedInterests.includes(0)) {
                  return userInterests.some(
                    (uInt) =>
                      Number(uInt.id || uInt.interest_id) === Number(idAnuncio),
                  );
                }
                return selectedInterests.includes(Number(idAnuncio));
              })
            );
          });
          setAds((prev) => (reset ? nuevos : [...prev, ...nuevos]));
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
    [buildParams, selectedInterests, userInterests],
  );

  // Debounce búsqueda
  useEffect(() => {
    clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => {
      fetchAds(1, true);
    }, 400);
    return () => clearTimeout(searchTimeoutRef.current);
  }, [wordToSearch, selectedInterests]);

  // IntersectionObserver scroll infinito
  useEffect(() => {
    if (!sentinelRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && hasMore && !isLoadingMore && !isLoading) {
          fetchAds(page + 1);
        }
      },
      { threshold: 0.1 },
    );
    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [hasMore, isLoadingMore, isLoading, page, fetchAds]);

  const handleDeleteAd = async () => {
    try {
      await api.delete(`/ads/${confirmDelete.adId}`);
      setAds((prev) => prev.filter((a) => a.id !== confirmDelete.adId));
      setConfirmDelete({ open: false, adId: null });
    } catch (error) {
      setToast({ open: true, message: "Error al eliminar el anuncio" });
      setTimeout(() => setToast({ open: false, message: "" }), 5000);
      setConfirmDelete({ open: false, adId: null });
    }
  };

  const handleSelectInterest = (e) => {
    const nuevosValores = e.target.value;
    const ultimaSeleccion = nuevosValores[nuevosValores.length - 1];
    if (nuevosValores.length === 0) setSelectedInterests([-1]);
    else if (ultimaSeleccion === 0) setSelectedInterests([0]);
    else if (ultimaSeleccion === -1) setSelectedInterests([-1]);
    else
      setSelectedInterests(nuevosValores.filter((id) => id !== 0 && id !== -1));
  };

  const getInterestText = () => {
    if (selectedInterests.includes(0)) return "Mis intereses";
    if (selectedInterests.includes(-1)) return "Todos";
    const nombres = selectedInterests.map((id) => {
      const interest = allInterests.find((o) => o.id === id);
      return interest ? interest.name : id;
    });
    return nombres.length > 3
      ? `${nombres.slice(0, 3).join(", ")}...`
      : nombres.join(", ");
  };

  const noBorderInput = {
    background: theme.tertiaryBack,
    borderRadius: 2,
    "& .MuiOutlinedInput-notchedOutline": { border: "none" },
    "& .MuiInputBase-input": { color: theme.fieldsText, px: 2 },
    "& .MuiSelect-icon": { color: theme.fieldsText },
  };

  return (
    <Box
      sx={{
        position: "fixed",
        top: "52px",
        left: "68px",
        right: 0,
        bottom: 0,
        overflow: "hidden",
      }}
    >
      <Container
        maxWidth="lg"
        sx={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
          py: 3,
          overflow: "hidden",
        }}
      >
        <Typography
          sx={{
            fontWeight: 700,
            fontSize: "1.4rem",
            color: theme.primaryText,
            mb: 2,
          }}
        >
          ¿Tienes algo que decir? ¡Anúnciate!
        </Typography>

        <Box
          sx={{
            display: "flex",
            width: "100%",
            px: 1.5,
            py: 0.5,
            alignItems: "center",
            gap: 1.5,
            background: theme.secondaryBack,
            border: `1px solid ${accent}25`,
            borderRadius: "14px",
            flexShrink: 0,
            mb: 1,
          }}
        >
          <TextField
            fullWidth
            placeholder="Buscar por palabra clave o usuario"
            autoComplete="off"
            value={wordToSearch}
            onChange={(e) => setWordToSearch(e.target.value)}
            sx={{ ...noBorderInput, flex: 7 }}
          />
          <TextField
            select
            fullWidth
            value={selectedInterests}
            onChange={handleSelectInterest}
            slotProps={{
              select: {
                displayEmpty: true,
                sx: { color: theme.fieldsText },
                multiple: true,
                MenuProps: {
                  PaperProps: {
                    sx: {
                      background: theme.secondaryBack,
                      borderRadius: "12px",
                      "& .MuiMenuItem-root": {
                        color: theme.primaryText,
                        "&:hover": { background: `${accent}15` },
                        "&.Mui-selected": { background: `${accent}20` },
                      },
                    },
                  },
                },
              },
            }}
            sx={{ ...noBorderInput, flex: 2 }}
          >
            <MenuItem value={0} sx={{ color: theme.secondaryText }}>
              Mis intereses
            </MenuItem>
            <MenuItem value={-1} sx={{ color: theme.secondaryText }}>
              Todos los Intereses
            </MenuItem>
            {allInterests.map((interest) => (
              <MenuItem
                key={interest.id}
                value={interest.id}
                sx={{ color: isDark ? theme.primaryText : "#1a1200" }}
              >
                {interest.name}
              </MenuItem>
            ))}
          </TextField>

          <IconButton
            onClick={() => fetchAds(1, true)}
            sx={{
              background: accent,
              color: isDark ? "#1a1200" : "#ffffff",
              width: 42,
              height: 42,
              flexShrink: 0,
              borderRadius: "10px",
              "&:hover": { opacity: 0.9 },
            }}
          >
            <RotateCcw size={18} />
          </IconButton>
          <IconButton
            onClick={() => {
              setSelectedAdId(null);
              setOpenFormAd(true);
            }}
            sx={{
              background: theme.primaryText,
              color: theme.secondaryBack,
              width: 42,
              height: 42,
              flexShrink: 0,
              borderRadius: "10px",
              "&:hover": { opacity: 0.85 },
            }}
          >
            <AddIcon fontSize="small" />
          </IconButton>
        </Box>

        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            px: 1,
            mb: 1,
            flexShrink: 0,
          }}
        >
          <Typography sx={{ color: theme.mutedText, fontSize: "0.82rem" }}>
            {isLoading
              ? "Buscando..."
              : `${ads.length} anuncio${ads.length !== 1 ? "s" : ""}`}
          </Typography>
          <Typography sx={{ color: theme.mutedText, fontSize: "0.82rem" }}>
            Intereses:{" "}
            <span style={{ fontWeight: 700, color: theme.primaryText }}>
              {getInterestText()}
            </span>
          </Typography>
        </Box>

        <Box
          component={motion.div}
          layout
          sx={{
            flex: 1,
            overflowY: "auto",
            borderRadius: "12px",
            background: theme.tertiaryBack,
            borderTop: `3px solid ${accent}`,
            p: 2,
            display: "flex",
            flexDirection: "column",
            gap: 2,
            alignItems: isLoading && ads.length === 0 ? "center" : "stretch",
            justifyContent:
              isLoading && ads.length === 0 ? "center" : "flex-start",
            "&::-webkit-scrollbar": { width: "4px" },
            "&::-webkit-scrollbar-thumb": {
              backgroundColor: accent,
              borderRadius: "10px",
            },
            "&::-webkit-scrollbar-track": { backgroundColor: "transparent" },
          }}
        >
          {isLoading && ads.length === 0 ? (
            <Box sx={{ textAlign: "center" }}>
              <CircularProgress sx={{ color: accent, mb: 2 }} />
              <Typography sx={{ color: theme.primaryText }}>
                Cargando anuncios...
              </Typography>
            </Box>
          ) : ads.length > 0 ? (
            <AnimatePresence mode="popLayout">
              {ads.map((ad) => (
                <motion.div
                  key={ad.id}
                  initial={{ opacity: 0, y: 7 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                >
                  <AdCard
                    ad={ad}
                    onChange={() => fetchAds(1, true)}
                    onSelect={setSelectedAdId}
                    setOpenFormAd={setOpenFormAd}
                    onDelete={() =>
                      setConfirmDelete({ open: true, adId: ad.id })
                    }
                  />
                </motion.div>
              ))}

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
            </AnimatePresence>
          ) : (
            <Typography sx={{ color: theme.mutedText, textAlign: "center" }}>
              No se ha encontrado ningún anuncio
            </Typography>
          )}
        </Box>
      </Container>

      <FormAdCard
        key={selectedAdId || "nuevo"}
        adId={selectedAdId}
        handleFinish={() => fetchAds(1, true)}
        open={openFormAd}
        handleOpen={setOpenFormAd}
      />
      <ConfirmModal
        open={confirmDelete.open}
        handleClose={() => setConfirmDelete({ open: false, adId: null })}
        onConfirm={handleDeleteAd}
        title="¿Eliminar anuncio?"
        message="Esta acción no se puede deshacer. ¿Estás seguro de que quieres borrar este anuncio?"
      />

      <AnimatePresence>
        {toast.open && (
          <Box
            component={motion.div}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            transition={{ duration: 0.5 }}
            sx={{
              position: "fixed",
              bottom: 40,
              right: 40,
              backgroundColor: "#d32f2f",
              color: "white",
              p: 2,
              borderRadius: 2,
              boxShadow: 3,
              zIndex: 9999,
            }}
          >
            <Typography>{toast.message}</Typography>
          </Box>
        )}
      </AnimatePresence>
    </Box>
  );
}
