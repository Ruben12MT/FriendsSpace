import React, { useEffect, useState } from "react";
import {
  Grid,
  TextField,
  MenuItem,
  Box,
  Typography,
  IconButton,
  CircularProgress,
} from "@mui/material";
import { useAppTheme } from "../hooks/useAppTheme";
import AdCard from "../components/AdCard";
import { motion, AnimatePresence } from "framer-motion";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import { useUser } from "../hooks/useUser";
import api from "../utils/api";

export default function AdsPage() {
  const { loggedUser } = useUser();
  const [allInterests, setAllInterests] = useState([]);
  const [selectedInterests, setSelectedInterests] = useState([0]);
  const [allAds, setAllAds] = useState([]);
  const [adsToShow, setAdsToShow] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [wordToSearch, setWordToSearch] = useState("");

  const theme = useAppTheme();
  const navbarHeight = "160px";

  useEffect(() => {
    const fetchAllInterest = async () => {
      try {
        const response = await api.get("/interests");
        if (response.data?.datos) setAllInterests(response.data.datos);
      } catch (error) {
        console.error(error);
      }
    };
    fetchAllInterest();
  }, []);

  const fetchAllAds = async () => {
    setIsLoading(true);
    try {
      const response = await api.get("/ads");
      if (response.data?.datos) setAllAds(response.data.datos);
    } catch (error) {
      console.error(error);
    } finally {
      setTimeout(() => setIsLoading(false), 300);
    }
  };

  useEffect(() => {
    fetchAllAds();
  }, []);

  useEffect(() => {
    const busqueda = wordToSearch.toLowerCase().trim();
    const filtrados = allAds.filter((ad) => {
      const coincideTexto =
        busqueda === "" ||
        ad.title?.toLowerCase().includes(busqueda) ||
        ad.user?.name?.toLowerCase().includes(busqueda) ||
        ad.body?.toLowerCase().includes(busqueda);

      const coincideInteres =
        selectedInterests.includes(-1) ||
        ad.interest_id_interests?.some((interesDelAnuncio) => {
          const idAnuncio =
            interesDelAnuncio.id || interesDelAnuncio.interest_id;
          if (selectedInterests.includes(0)) {
            const misIntereses = loggedUser?.interests || [];
            return misIntereses.some((uInt) => {
              const idUsuarioInt = uInt.id || uInt.interest_id;
              return Number(idUsuarioInt) === Number(idAnuncio);
            });
          }
          return selectedInterests.includes(Number(idAnuncio));
        });
      return coincideTexto && coincideInteres;
    });
    setAdsToShow(filtrados);
  }, [allAds, selectedInterests, wordToSearch, loggedUser]);

  const handleSelectInterest = (e) => {
    const nuevosValores = e.target.value;
    const ultimaSeleccion = nuevosValores[nuevosValores.length - 1];
    if (nuevosValores.length === 0) {
      setSelectedInterests([-1]);
    } else if (ultimaSeleccion === 0) {
      setSelectedInterests([0]);
    } else if (ultimaSeleccion === -1) {
      setSelectedInterests([-1]);
    } else {
      setSelectedInterests(nuevosValores.filter((id) => id !== 0 && id !== -1));
    }
  };

  const getInterestText = () => {
    if (selectedInterests.includes(0)) return "Mis intereses";
    if (selectedInterests.includes(-1)) return "Todos";
    const nombres = selectedInterests.map((id) => {
      const interest = allInterests.find((o) => o.id === id);
      return interest ? interest.name || interest.nombre : id;
    });
    return nombres.length > 3
      ? `${nombres.slice(0, 3).join(", ")}...`
      : nombres.join(", ");
  };

  const noBorderInput = {
    background: theme.tertiaryBack,
    borderRadius: 4,
    "& .MuiOutlinedInput-notchedOutline": { border: "none" },
    "& .MuiInputBase-input": { color: theme.fieldsText, px: 2 },
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
        justifyContent: "center",
        width: "100%",
      }}
    >
      <Grid
        container
        sx={{
          pb: 2,
          width: "75%",
          display: "grid",
          gridTemplateColumns: "1fr",
          gridTemplateRows: "auto 80px 30px 1fr",
          gap: 2,
          boxSizing: "border-box",
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            gridRow: "1",
            display: "flex",
            alignItems: "center",
            ml: 1,
            mt: 1,
          }}
        >
          <Typography
            variant="h6"
            sx={{ color: theme.primaryText, fontWeight: "bold" }}
          >
            ¿Tienes algo que decir? ¡Anúnciate!
          </Typography>
        </Box>

        <Box
          sx={{
            gridRow: "2",
            display: "flex",
            width: "100%",
            overflow: "hidden",
            px: 3,
            alignItems: "center",
            gap: 2,
            background: theme.secondaryBack,
            border: `1px solid ${theme.primaryBack}44`,
            borderRadius: 4,
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
                sx={{ color: "black" }}
              >
                {interest.name}
              </MenuItem>
            ))}
          </TextField>
          <IconButton
            onClick={fetchAllAds}
            sx={{
              backgroundColor: theme.primaryBack,
              color: "white",
              width: 45,
              height: 45,
              flexShrink: 0,
              "&:hover": { backgroundColor: theme.secondaryText },
            }}
          >
            <SearchIcon />
          </IconButton>
          <IconButton
            sx={{
              backgroundColor: theme.primaryText,
              width: 45,
              height: 45,
              flexShrink: 0,
              ":hover": {
                background: theme.secondaryText
              }
            }}
          >
            <AddIcon sx={{ color: theme.secondaryBack }} />
          </IconButton>
        </Box>

        <Box
          sx={{
            gridRow: "3",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            px: 2,
          }}
        >
          <Typography
            sx={{
              color: theme.primaryText,
              fontWeight: 500,
              fontSize: "0.85rem",
            }}
          >
            {isLoading
              ? "Buscando..."
              : `Mostrando ${adsToShow.length} anuncios`}
          </Typography>
          <Typography
            sx={{
              color: theme.primaryText,
              fontWeight: 500,
              fontSize: "0.85rem",
            }}
          >
            Intereses:{" "}
            <span style={{ fontWeight: "bold" }}>{getInterestText()}</span>
          </Typography>
        </Box>

        <Box
          component={motion.div}
          layout
          sx={{
            gridRow: "4",
            p: 2,
            mb: 2,
            width: "100%",
            display: "flex",
            flexWrap: "wrap",
            gap: 3,
            overflowY: "auto",
            borderRadius: 4,
            background: theme.tertiaryBack,
            borderTop: `${theme.primaryText} solid 3px`,
            alignContent:
              isLoading || adsToShow.length < 1 ? "center" : "flex-start",
            justifyContent:
              isLoading || adsToShow.length < 1 ? "center" : "flex-start",
            "&::-webkit-scrollbar": { width: "4px" },
            "&::-webkit-scrollbar-thumb": {
              backgroundColor: theme.primaryText,
              borderRadius: "10px",
            },

            "&::-webkit-scrollbar-track": {
              backgroundColor: "transparent",
              margin: "10px 0",
            },
          }}
        >
          {isLoading ? (
            <Box sx={{ textAlign: "center", width: "100%" }}>
              <CircularProgress sx={{ color: theme.primaryText, mb: 2 }} />
              <Typography variant="h5" sx={{ color: theme.primaryText }}>
                Cargando anuncios...
              </Typography>
            </Box>
          ) : adsToShow.length > 0 ? (
            <AnimatePresence mode="popLayout">
              {adsToShow.map((ad) => (
                <motion.div
                  key={ad.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  style={{ width: "100%" }}
                >
                  <AdCard ad={ad} />
                </motion.div>
              ))}
            </AnimatePresence>
          ) : (
            <Typography
              variant="h5"
              sx={{
                color: theme.primaryText,
                textAlign: "center",
                width: "100%",
              }}
            >
              No se ha encontrado ningún anuncio que coincida
            </Typography>
          )}
        </Box>
      </Grid>
    </Box>
  );
}
