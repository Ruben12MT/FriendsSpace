import React, { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { checkSession } from "../utils/checkSession";
import { CircularProgress, Box } from "@mui/material";
import { useUser } from "../hooks/useUser";
import { useFirstLogin } from "../hooks/useFirstLogin";
import { useContext } from "react";
import { SocketContext } from "../context/SocketContext";

const ProtectedRoute = ({ children }) => {
  // Hook personalizado que maneja lógica de primer login (si lo tienes)
  useFirstLogin();
  const { socket } = useContext(SocketContext);

  // Obtenemos la ruta actual. Cada vez que cambie, el useEffect se disparará.
  const { pathname } = useLocation();

  const [loading, setLoading] = useState(true);
  const [isAuth, setIsAuth] = useState(false);

  // Accedemos al estado global del usuario
  const { loggedUser, setLoggedUser } = useUser();

  useEffect(() => {
    async function validate() {
      setLoading(true);

      const crearSalaUsuario = async (idUsuario) => {
        if (idUsuario && socket) {
          // Si el socket por lo que sea está desconectado, lo reconectamos
          if (!socket.connected) {
            socket.connect();
          }

          console.log("Enviando evento join para ID:", idUsuario);
          socket.emit("join", idUsuario);
        } else {
          console.error("Error: No hay socket o ID de usuario");
        }
      };

      try {
        // Llamamos a tu utilidad que hace el GET a /check-auth
        const res = await checkSession();

        if (!res.isAuth) {
          // Si el servidor dice que no hay sesión:
          setIsAuth(false);
          setLoggedUser(null); // Limpiamos Zustand para que la App sepa que no hay nadie
          if (socket) socket.disconnect();
        } else {
          // Si la sesión es válida:
          setLoggedUser(res.user); // Sincronizamos los datos del usuario
          setIsAuth(true);
          crearSalaUsuario(res.user.id);
        }
      } catch (err) {
        // Si hay un error de red o el servidor responde con error
        setIsAuth(false);
        setLoggedUser(null);
      } finally {
        // Quitamos el estado de carga
        setLoading(false);
      }
    }

    validate();

    // Al poner 'pathname' aquí, la validación se ejecuta cada vez que el usuario navega
  }, [pathname, setLoggedUser, socket]);

  // Mientras se está validando la primera vez, mostramos el spinner
  if (loading) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <CircularProgress sx={{ color: "#C9A227" }} />
      </Box>
    );
  }

  // Si después de validar no estamos autenticados, redirigimos al login
  // El 'replace' evita que el usuario pueda volver atrás a la ruta protegida con el botón del navegador
  if (!isAuth) {
    return <Navigate to="/login" replace />;
  }

  // Si todo está bien, renderizamos los componentes hijos (la página protegida)
  return children;
};

export default ProtectedRoute;
