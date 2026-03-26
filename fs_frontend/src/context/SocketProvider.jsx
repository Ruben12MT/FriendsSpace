import React, { useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { SocketContext } from "./SocketContext";
import useAuthStore from "../store/useAuthStore";

export const SocketProvider = ({ children }) => {
  const { loggedUser } = useAuthStore();
  // useRef para que el socket persista entre renders sin causar re-renders
  const socketRef = useRef(null);
  // Segundo ref para exponer el socket al contexto y forzar re-render solo cuando cambia
  const [socket, setSocket] = React.useState(null);

  useEffect(() => {
    // Si hay usuario logueado y aún no hay socket conectado, creamos la conexión
    if (loggedUser?.id && !socketRef.current) {
      const newSocket = io("http://localhost:3000", {
        withCredentials: true,
        autoConnect: true,
        transports: ["websocket"],
      });

      newSocket.on("connect", () => {
        console.log("🟢 Socket conectado:", newSocket.id);
        // Unirse a la sala privada del usuario
        newSocket.emit("join", loggedUser.id);
      });

      newSocket.on("disconnect", () => {
        console.log("🔴 Socket desconectado");
      });

      socketRef.current = newSocket;
      setSocket(newSocket);
    }

    // Si no hay usuario (logout), desconectamos y limpiamos
    if (!loggedUser?.id && socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
      setSocket(null);
    }

    // Limpieza al desmontar el componente
    return () => {
      if (socketRef.current && !loggedUser?.id) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [loggedUser?.id]); // Solo reacciona cuando cambia el ID del usuario (login/logout)

  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  );
};