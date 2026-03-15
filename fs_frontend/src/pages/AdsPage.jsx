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
  // Sacamos el usuario loggeado
  const { loggedUser } = useUser();

  // Estado para guardar todos los intereses para mostrarlos en el select
  const [allInterests, setAllInterests] = useState([]);

  // Estado para guardar los intereses seleccionados en el select
  const [selectedInterests, setSelectedInterests] = useState([0]);

  // Estado para guardar todos los anuncios de la app
  const [allAds, setAllAds] = useState([]);

  // Estado para guardar los anuncios que se van a mostrar
  const [adsToShow, setAdsToShow] = useState([]);

  // Esto es para mostrar que está cargando el listado
  const [isLoading, setIsLoading] = useState(true);

  // Este estado guarda la palabra que se va a buscar, esta puede ser un nombre de usuario, palabra dentro dle titulo del anuncio o del cuerpo
  const [wordToSearch, setWordToSearch] = useState("");

  // Sacamos el theme actual
  const theme = useAppTheme();

  // Variable para ajustar el formulario en relacion a la altura del navBar
  const navbarHeight = "160px";

  // Este estado es para guardar un array de intereses con los intereses del usuario loggeado
  const [userInterests, setUserInterests] = useState([]);

  // UseEffect para cargar los intereses del usuario loggeado
  useEffect(() => {
    async function fetchUser() {
      try {
        if (!loggedUser) return;

        // Hacemos una  peticion para sacar los intereses del usuario si es que en este punto existe
        const res2 = await api.get(`/users/${loggedUser.id}/interests`);

        // Si devuelve algo se muestra ese o si no será un array vacio.
        setUserInterests(res2.data.datos || []);
      } catch (error) {
        console.log(error.message);
      }
    }
    fetchUser();
  }, [loggedUser]);

  // UseEffect para sacar todos los intereses para el select
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

  // Función que será reutilizable para sacar todos los anuncios actuales
  const fetchAllAds = async () => {
    setIsLoading(true);
    try {
      const response = await api.get("/ads");
      //--BORRAR--
      console.log(response);
      if (response.data?.datos) setAllAds(response.data.datos);
    } catch (error) {
      console.error(error);
    } finally {
      setTimeout(() => setIsLoading(false), 300);
    }
  };

  // Cargamos todos los anuncios en el primer renderizado
  useEffect(() => {
    fetchAllAds();
  }, []);

  // Cada vez que buscamos traemos una lista de anuncios estos pasaran un filtrado cada vez que se cambien los parametros de búsquedas
  useEffect(() => {
    // Sacamos la palabra a buscar y la limpiamos para asegurarnos
    const busqueda = wordToSearch.toLowerCase().trim();

    // Filtramos los anuncios por los parámetros de filtrado
    const filtrados = allAds.filter((ad) => {
      // Boleano para saber si el texto coincide
      const coincideTexto =
        busqueda === "" ||
        ad.title?.toLowerCase().includes(busqueda) ||
        ad.user?.name?.toLowerCase().includes(busqueda) ||
        ad.body?.toLowerCase().includes(busqueda);

      // Boleano para saber si los intereses seleccionados coinciden
      const coincideInteres =
        selectedInterests.includes(-1) ||
        ad.interests?.some((interesDelAnuncio) => {
          const idAnuncio =
            interesDelAnuncio.id || interesDelAnuncio.interest_id;
          if (selectedInterests.includes(0)) {
            const misIntereses = userInterests || [];
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

  // Funcion para controlar seleccion de intereses
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

  // Funcion para conseguir el texto segun los intereses selecionados
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
                background: theme.secondaryText,
              },
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
                  initial={{ opacity: 0, y: 7 }}
                  animate={{ opacity: 1, y: 9 }}
                  exit={{ opacity: 0, scale: 0.0 }}
                  transition={{ duration: 0.5 }}
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
