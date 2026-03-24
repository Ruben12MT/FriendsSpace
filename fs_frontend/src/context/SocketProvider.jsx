
import React from "react";
import { socket } from "../socket.js";
import { SocketContext } from "./SocketContext";

export const SocketProvider = ({ children }) => {
  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  );
};
