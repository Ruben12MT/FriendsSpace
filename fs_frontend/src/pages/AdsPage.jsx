import React, { useEffect, useState } from "react";
import {
  Grid,
  TextField,
  MenuItem,
  Box,
  Typography,
  IconButton,
} from "@mui/material";
import { useAppTheme } from "../hooks/useAppTheme";
import AdCard from "../components/AdCard";
import { motion } from "framer-motion";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import { useUser } from "../hooks/useUser";
import api from "../utils/api";
export default function AdsPage() {
  const { loggedUser } = useUser();
  const [allInterests, setAllInterests] = useState([]);
  const [loggedUserInterests, setLoggedUserInterests] = useState([]);
  const [selectedInterests, setSelectedInterests] = useState([0]);
  const [allAds, setAllAds] = useState([]);
  const [isSearchingInterests, setIsSearchingInterests] = useState(true);

  useEffect(() => {
    const fetchAllInterest = async () => {
      try {
        const response = await api.get("/interests");

        if (response.data && response.data.datos) {
          setAllInterests(response.data.datos);
        }
      } catch (error) {
        console.error("Error al obtener todos los intereses:", error);
      }
    };

    fetchAllInterest();
  }, []);

  useEffect(() => {
    const fetchAllAds = async () => {
      try {
        const response = await api.get("/ads");

        if (response.data && response.data.datos) {
          setIsSearchingInterests(false);
          setAllAds(response.data.datos);
        }
      } catch (error) {
        console.error("Error al obtener todos los intereses:", error);
      }
    };

    fetchAllAds();
  }, []);

  const handleSelectInterest = (e) => {
    const nuevosValores = e.target.value;

    // Lo ultimo pulsado
    const ultimaSeleccion = nuevosValores[nuevosValores.length - 1];

    // Si fue mis intereses:
    if (ultimaSeleccion === 0) {
      // Si ya estaba seleccionado solo el 0, lo quitamos (deseleccionar)
      if (selectedInterests.length === 1 && selectedInterests[0] === 0) {
        setSelectedInterests([]);
      } else {
        setSelectedInterests([0]);
      }
    }
    // Si pulsó todos
    else if (ultimaSeleccion === -1) {
      // Si ya estaba seleccionado solo el -1, lo quitamos
      if (selectedInterests.length === 1 && selectedInterests[0] === -1) {
        setSelectedInterests([]);
      } else {
        setSelectedInterests([-1]);
      }
    }
    // Si seleccionó un interés normal
    else {
      // Quitamos todos y los nuestros
      const filtrados = nuevosValores.filter((id) => id !== 0 && id !== -1);
      setSelectedInterests(filtrados);
    }
  };

  const theme = useAppTheme();
  const navbarHeight = "160px";

  const baseContainerStyle = {
    borderRadius: 4,
    display: "flex",
    width: "100%",
    overflow: "hidden",
  };

  const noBorderInput = {
    background: theme.tertiaryBack,
    borderRadius: 4,
    "& .MuiOutlinedInput-notchedOutline": { border: "none" },
    "& .MuiInputBase-input": { color: theme.fieldsText, px: 2 },
  };

  const getInterestText = () => {
    if (selectedInterests.includes(0)) return "Mis intereses";
    if (selectedInterests.includes(-1)) return "Todos";

    if (selectedInterests.length > 0) {
      const nombres = selectedInterests.map((id) => {
        const interest = allInterests.find((o) => o.id === id);
        return interest ? interest.name || interest.nombre : id;
      });

      if (selectedInterests.length > 4) {
        return nombres.slice(0, 4).join(", ") + "...";
      }

      return nombres.slice(0, 4).join(", ");
    }

    return "Tus intereses";
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
            ...baseContainerStyle,
            gridRow: "2",
            px: 3,
            display: "flex",
            alignItems: "center",
            gap: 2,
            background: theme.secondaryBack,
            border: `1px solid ${theme.primaryBack}44`,
          }}
        >
          <TextField
            fullWidth
            placeholder="Buscar por palabra clave o usuario"
            autoComplete="off"
            value={""}
            onChange={() => {}}
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
            onClick={() => {}}
            sx={{
              backgroundColor: theme.primaryBack,
              color: theme.primaryText,
              width: 45,
              height: 45,
              flexShrink: 0,
              border: `1px solid ${theme.primaryText}44`,
              "&:hover": {
                backgroundColor: theme.secondaryText,
                color: theme.secondaryBack,
              },
            }}
          >
            <SearchIcon sx={{ color: "white" }} />
          </IconButton>

          {/* Botón añadir nuevo*/}
          <IconButton
            sx={{
              backgroundColor: theme.primaryText,
              color: theme.variantText,
              width: 45,
              height: 45,
              flexShrink: 0,
              "&:hover": { backgroundColor: theme.secondaryText },
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
            Mostrando {allAds.length} anuncios...
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
            ...baseContainerStyle,
            gridRow: "4",
            p: 2,
            mb: 2,
            background: theme.tertiaryBack,
            borderTop: theme.primaryText + " solid 3px",

            overflowX: "hidden",
            overflowY: "auto",
            display: "flex",
            flexWrap: "wrap",
            alignContent: allAds.length < 1 ? "center" : "flex-start",
            justifyContent: allAds.length < 1 ? "center" : "flex",

            gap: 3,
            "&::-webkit-scrollbar": {
              width: "3px",
            },
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
          {isSearchingInterests && (
            <Typography variant="h5" sx={{ color: theme.primaryText }}>
              Cargando...
            </Typography>
          )}
          {allAds.length < 1 && !isSearchingInterests && (
            <Typography variant="h5" sx={{ color: theme.primaryText }}>
              No se ha encontrado ningun anuncio
            </Typography>
          )}
          {allAds.length >= 1 &&
            allAds.map((ad) => {
              return <AdCard key={ad.id} ad={ad} />;
            })}
        </Box>
      </Grid>
    </Box>
  );
}
