import React, { useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { SocketContext } from "./SocketContext";
import useAuthStore from "../store/useAuthStore";

const SOCKET_URL = window.__APP_CONFIG__?.API_URL
  ? window.__APP_CONFIG__.API_URL.replace("/api", "")
  : "http://localhost:3000";

export const SocketProvider = ({ children }) => {
  const { loggedUser } = useAuthStore();
  const socketRef = useRef(null);
  const [socket, setSocket] = React.useState(null);

  useEffect(() => {
    if (loggedUser?.id && !socketRef.current) {
      const newSocket = io(SOCKET_URL, {
        withCredentials: true,
        autoConnect: true,
        transports: ["websocket"],
      });

      newSocket.on("connect", () => {
        console.log("🟢 Socket conectado:", newSocket.id);
        newSocket.emit("join", loggedUser.id);
      });

      newSocket.on("disconnect", () => {
        console.log("🔴 Socket desconectado");
      });

      socketRef.current = newSocket;
      setSocket(newSocket);
    }

    if (!loggedUser?.id && socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
      setSocket(null);
    }

    return () => {
      if (socketRef.current && !loggedUser?.id) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [loggedUser?.id]);

  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  );
};