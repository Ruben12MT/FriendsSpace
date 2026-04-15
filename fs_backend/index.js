if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}
const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const path = require("path");
const cookieParser = require("cookie-parser");

const userRoutes = require("./routes/userRoutes");
const interestRoutes = require("./routes/interestRoutes");
const adRoutes = require("./routes/adRoutes");
const requestRoutes = require("./routes/requestRoutes");
const connectionRoutes = require("./routes/connectionRoutes");
const messageRoutes = require("./routes/messageRoutes");

const app = express();
const port = process.env.PORT || 3000;
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

const corsOptions = {
  origin: function (origin, callback) {
    if (
      !origin ||
      origin === FRONTEND_URL ||
      origin.endsWith(".vercel.app") ||
      origin.endsWith(".amazonaws.com") ||
      origin === "http://localhost:5173"
    ) {
      callback(null, true);
    } else {
      callback(new Error("No permitido por CORS"));
    }
  },
  credentials: true,
};

const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: corsOptions,
});

app.set("socketio", io);

app.use(express.json());
app.use(cookieParser());
app.use(cors(corsOptions));

io.on("connection", (socket) => {
  console.log("🟢 Usuario conectado al socket:", socket.id);

  socket.on("join", (userId) => {
    socket.join(`user_${userId}`);
    console.log(`Usuario ${userId} ha entrado en su sala privada`);
  });

  socket.on("join_chat", (connectionId) => {
    socket.join(`chat_${connectionId}`);
    console.log(`Usuario entró al chat_${connectionId}`);
  });

  socket.on("leave_chat", (connectionId) => {
    socket.leave(`chat_${connectionId}`);
  });

  socket.on("disconnect", () => {
    console.log("🔴 Usuario desconectado");
  });
});

app.use("/api/users", userRoutes);
app.use("/api/interests", interestRoutes);
app.use("/api/ads", adRoutes);
app.use("/api/requests", requestRoutes);
app.use("/api/connections", connectionRoutes);
app.use("/api/messages", messageRoutes);

app.use(express.static(path.join(__dirname, "public")));

app.use((req, res) => {
  res.status(404).json({
    ok: false,
    mensaje: "La ruta solicitada no existe en el servidor",
  });
});

httpServer.listen(port, () => {
  console.log(`---Servidor y Sockets escuchando en el puerto ${port}---`);
});