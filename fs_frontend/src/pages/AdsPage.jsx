import React, { useEffect, useState, useRef, useCallback } from "react";
import { Box, Typography, CircularProgress, Container } from "@mui/material";
import { useAppTheme } from "../hooks/useAppTheme";
import AdCard from "../components/AdCard";
import { motion, AnimatePresence } from "framer-motion";
import { useUser } from "../hooks/useUser";
import api from "../utils/api";
import FormAdCard from "../components/FormAdCard";
import ConfirmModal from "../components/ConfirmModal";
import { useError } from "../context/ErrorContext";
import MainSearchBar from "../components/MainSearchBar";

export default function AdsPage() {
  const { loggedUser } = useUser();
  const { showError } = useError();
  const theme = useAppTheme();
  const accent = theme.accent || theme.primaryBack;

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
      .catch(() => {});
  }, [loggedUser]);

  useEffect(() => {
    api
      .get("/interests")
      .then((res) => {
        if (res.data?.datos) setAllInterests(res.data.datos);
      })
      .catch(() => {});
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
          const nuevos = res.data.datos.filter((ad) => {
            // Filtrar por "Mis anuncios" (solo del usuario actual)
            if (selectedInterests.includes(-2)) {
              return loggedUser && ad.user_id === loggedUser.id;
            }
            // Mostrar todos los anuncios
            if (selectedInterests.includes(-1)) {
              return true;
            }
            // Filtrar por intereses del usuario o específicos
            return ad.interests?.some((interesDelAnuncio) => {
              const idAnuncio =
                interesDelAnuncio.id || interesDelAnuncio.interest_id;
              if (selectedInterests.includes(0))
                return userInterests.some(
                  (uInt) =>
                    Number(uInt.id || uInt.interest_id) === Number(idAnuncio),
                );
              return selectedInterests.includes(Number(idAnuncio));
            });
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
    [buildParams, selectedInterests, userInterests, loggedUser],
  );

  useEffect(() => {
    clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => {
      fetchAds(1, true);
    }, 400);
    return () => clearTimeout(searchTimeoutRef.current);
  }, [wordToSearch, selectedInterests, fetchAds]);

  useEffect(() => {
    if (!sentinelRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && hasMore && !isLoadingMore && !isLoading)
          fetchAds(page + 1);
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
      showError(
        "No se pudo eliminar el anuncio.",
        "Inténtalo de nuevo más tarde.",
      );
      setConfirmDelete({ open: false, adId: null });
    }
  };

  const handleSelectInterest = (e) => {
    const nuevosValores = e.target.value;
    const ultimaSeleccion = nuevosValores[nuevosValores.length - 1];
    // Manejo de opciones exclusivas
    if (nuevosValores.length === 0 || ultimaSeleccion === -1)
      setSelectedInterests([-1]); // Mostrar todos
    else if (ultimaSeleccion === 0) setSelectedInterests([0]); // Mis intereses
    else if (ultimaSeleccion === -2) setSelectedInterests([-2]); // Mis anuncios
    else
      // Filtrar intereses específicos (excluyendo las opciones especiales)
      setSelectedInterests(nuevosValores.filter((id) => id !== 0 && id !== -1 && id !== -2));
  };

  const handleReset = () => {
    setWordToSearch("");
    setSelectedInterests([0]);
    fetchAds(1, true);
  };

  /**
   * Crea la lista extendida de intereses que incluye opciones especiales.
   * Combina "Mis intereses", "Todos", "Mis anuncios" con los intereses reales.
   */
  const interestesExtendidos = [
    { id: -2, name: "Mis anuncios" },
    ...allInterests,
  ];

  const getInterestText = () => {
    if (selectedInterests.includes(0)) return "Mis intereses";
    if (selectedInterests.includes(-1)) return "Todos";
    if (selectedInterests.includes(-2)) return "Mis anuncios";

    const nombres = selectedInterests.map((id) => {
      const interest = allInterests.find((o) => o.id === id);
      return interest ? interest.name : id;
    });
    return nombres.length > 3
      ? `${nombres.slice(0, 3).join(", ")}...`
      : nombres.join(", ");
  };

  return (
    <Box
      sx={{
        position: "fixed",
        top: "52px",
        left: { xs: 0, sm: "68px" },
        right: 0,
        bottom: { xs: "56px", sm: 0 },
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
          overflow: "hidden",
        }}
      >
        <Typography
          sx={{
            fontWeight: 700,
            fontSize: { xs: "1.1rem", md: "1.4rem" },
            color: theme.primaryText,
            mb: 2,
          }}
        >
          ¿Tienes algo que decir? ¡Anúnciate!
        </Typography>

        <MainSearchBar
          placeholder="Buscar por palabra clave o usuario"
          searchValue={wordToSearch}
          onSearchChange={setWordToSearch}
          onReset={handleReset}
          onAdd={() => {
            setSelectedAdId(null);
            setOpenFormAd(true);
          }}
          showAdd={true}
          interests={interestesExtendidos}
          selectedInterests={selectedInterests}
          onInterestChange={handleSelectInterest}
        />

        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            px: 1,
            mt: 1,
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
            "&::-webkit-scrollbar": { width: "4px" },
            "&::-webkit-scrollbar-thumb": {
              backgroundColor: accent,
              borderRadius: "10px",
            },
            "&::-webkit-scrollbar-track": { backgroundColor: "transparent" },
          }}
        >
          {isLoading && ads.length === 0 ? (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                height: "100%",
                gap: 2,
              }}
            >
              <CircularProgress sx={{ color: accent }} />
              <Typography sx={{ color: theme.primaryText }}>
                Cargando anuncios...
              </Typography>
            </Box>
          ) : ads.length > 0 ? (
            <>
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: {
                    xs: "1fr",
                    lg: "repeat(2, 1fr)",
                  },
                  gap: 2,
                  alignItems: "start",
                }}
              >
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
                </AnimatePresence>
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
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                height: "100%",
              }}
            >
              <Typography sx={{ color: theme.mutedText, textAlign: "center" }}>
                No se ha encontrado ningún anuncio
              </Typography>
            </Box>
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
              bottom: { xs: 70, sm: 40 },
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
