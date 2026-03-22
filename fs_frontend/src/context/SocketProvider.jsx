import React, {useState } from 'react';
import { io } from 'socket.io-client';
import { SocketContext } from './SocketContext';

export const SocketProvider = ({ children }) => {

  const [socket] = useState(() => io("http://localhost:3000", {
    withCredentials: true,
    autoConnect: true
  }));

  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  );
};