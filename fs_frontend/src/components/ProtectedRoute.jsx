import React, { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { checkSession } from "../utils/checkSession";
import { CircularProgress, Box } from "@mui/material";
import { useUser } from "../hooks/useUser";
import { useFirstLogin } from "../hooks/useFirstLogin";
import { useContext } from "react";
import { SocketContext } from "../context/SocketContext";

const ProtectedRoute = ({ children }) => {
  useFirstLogin();
  const { socket } = useContext(SocketContext);
  const { pathname } = useLocation();
  const [loading, setLoading] = useState(true);
  const [isAuth, setIsAuth] = useState(false);
  const { loggedUser, setLoggedUser } = useUser();

  useEffect(() => {
    async function validate() {
      setLoading(true);

      const crearSalaUsuario = (idUsuario) => {
        if (idUsuario && socket) {
          if (!socket.connected) socket.connect();
          socket.emit("join", idUsuario);
        }
      };

      try {
        const res = await checkSession();

        if (!res.isAuth) {
          setIsAuth(false);
          setLoggedUser(null);
          if (socket) socket.disconnect();
        } else {
          // Solo actualizamos Zustand si los datos han cambiado
          if (JSON.stringify(res.user) !== JSON.stringify(loggedUser)) {
            setLoggedUser(res.user);
          }
          setIsAuth(true);
          crearSalaUsuario(res.user.id);
        }
      } catch (err) {
        setIsAuth(false);
        setLoggedUser(null);
      } finally {
        setLoading(false);
      }
    }

    validate();
  }, [pathname, setLoggedUser, socket]);

  useEffect(() => {
    if (!socket || !loggedUser?.id) return;

    const onReconnect = () => {
      socket.emit("join", loggedUser.id);
    };

    socket.on("connect", onReconnect);
    return () => socket.off("connect", onReconnect);
  }, [socket, loggedUser?.id]);

  if (loading) {
    return (
      <Box sx={{ minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "center" }}>
        <CircularProgress sx={{ color: "#C9A227" }} />
      </Box>
    );
  }

  if (!isAuth) return <Navigate to="/login" replace />;

  return children;
};

export default ProtectedRoute;