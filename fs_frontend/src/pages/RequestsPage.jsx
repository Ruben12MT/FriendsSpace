import React from "react";
import { Grid, Box, Typography, Button, ButtonGroup } from "@mui/material";
import { useAppTheme } from "../hooks/useAppTheme";
import { useUser } from "../hooks/useUser";
import { useState } from "react";
import { useEffect } from "react";
import api from "../utils/api";
import RequestCard from "../components/RequestCard";

export default function RequestsPages() {
  const navbarHeight = "160px";
  const theme = useAppTheme();
  const { loggedUser } = useUser();

  const [allUserRequests, setAllUserRequests] = useState([]);
  const [loadingReq, setLoadingReq] = useState(false);

  const [types, setTypes] = useState({
    ALL: false,
    PENDING: false,
    ACCEPTED: false,
    REJECTED: false,
  });

  const staticButtonStyle = {
    flex: 1,
    py: 1.5,
    fontWeight: "bold",
    backgroundColor: theme.secondaryBack,
    color: theme.primaryText,
    border: `1px solid ${theme.primaryBack} !important`,
    transition: "all 0.2s ease",
    "&:hover": {
      backgroundColor: theme.secondaryText,
      color: theme.tertiaryBack,
    },
  };

  useEffect(() => {
    async function fetchMyRequests() {
      try {
        const res = await api.get("/requests/list");

        if (!loggedUser) return;
        setAllUserRequests(res.data.datos);
      } catch (error) {
        console.error(error.message);
      }
    }

    fetchMyRequests();
  }, [loggedUser]);

  console.log(allUserRequests);

  return (
    <Box
      sx={{
        position: "fixed",
        top: navbarHeight,
        left: 0,
        right: 0,
        bottom: 0,
        display: "flex",
        flexDirection: "column", 
        alignItems: "center",
        p: 2,
        overflowY: "auto", 
        width: "100%",
      }}
    >
      <Box
        sx={{
          width: { xs: "100%", md: "80%", lg: "70%" },
          mt: 2,
          flexShrink: 0,
        }}
      >
        <Typography
          variant="h4"
          sx={{
            mb: 3,
            fontWeight: "bold",
            textAlign: "left",
            color: theme.primaryText,
          }}
        >
          Notificaciones
        </Typography>

        <ButtonGroup
          variant="contained"
          fullWidth
          disableElevation
          sx={{
            mb: 4,
            borderRadius: 2,
            overflow: "hidden",
            boxShadow: "none",
            backgroundColor: "transparent",
          }}
        >
          <Button sx={staticButtonStyle}>TODAS</Button>
          <Button sx={staticButtonStyle}>PENDIENTES</Button>
          <Button sx={staticButtonStyle}>ACEPTADAS</Button>
          <Button sx={staticButtonStyle}>RECHAZADAS</Button>
          {loggedUser.role === "ADMIN" && (
            <Button sx={staticButtonStyle}>REPORTES</Button>
          )}
        </ButtonGroup>
      </Box>

      <Box
        sx={{
          width: { xs: "100%", md: "80%", lg: "70%" },
          display: "flex",
          flexDirection: "column",
          gap: 2,
          pb: 4,
        }}
      >
        {allUserRequests.length > 0 ? (
          allUserRequests.map((req) => (
            <RequestCard key={req.id} request={req} />
          ))
        ) : (
          <Typography
            sx={{ color: theme.secondaryText, textAlign: "center", mt: 4 }}
          >
            No tienes notificaciones
          </Typography>
        )}
      </Box>
    </Box>
  );
}
