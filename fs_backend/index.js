//.env
require('dotenv').config();

// Importar librería express --> web server
const express = require("express");

// [SOCKET] Importar http nativo de Node para envolver Express
const { createServer } = require("http"); 

// Importar socket IO
const { Server } = require("socket.io"); // La librería que instalaste

// Importar libreria CORS
const cors = require("cors");

// Importar librería path, para manejar rutas de ficheros en el servidor
const path = require("path");

// Importar cookie-parser para manejar cookies
const cookieParser = require("cookie-parser");

// Importar gestores de rutas
const userRoutes = require("./routes/userRoutes");
const interestRoutes = require("./routes/interestRoutes");
const adRoutes = require("./routes/adRoutes");
const requestRoutes = require("./routes/requestRoutes");
const connectionRoutes = require("./routes/connectionRoutes");

const app = express();
const port = process.env.PORT || 3000;

// Creamos el servidor HTTP que permite usar WebSockets y Express a la vez
const httpServer = createServer(app);

// Configuramos el servidor de Sockets con el puerto de Vite (5173)
const io = new Server(httpServer, {
  cors: {
    origin: 'http://localhost:5173', 
    credentials: true
  }
});

// Guardamos el objeto 'io' en la app para usarlo en los Controllers (req.app.get("socketio"))
app.set("socketio", io);

app.use(express.json()); 

// Configurar cookie-parser para manejar cookies
app.use(cookieParser());

// Configurar CORS para admitir cualquier origen
app.use(cors({
  origin: 'http://localhost:5173', 
  credentials: true
}));

// Lógica de conexión: aquí gestionamos quién entra y quién sale
io.on("connection", (socket) => {
  console.log("🟢 Usuario conectado al socket:", socket.id);

  // Escuchamos cuando el usuario se identifica para meterlo en su 'habitación' privada
  socket.on("join", (userId) => {
    socket.join(`user_${userId}`);
    console.log(`Usuario ${userId} ha entrado en su sala privada`);
  });

  socket.on("disconnect", () => {
    console.log("🔴 Usuario desconectado");
  });
});

// Configurar rutas de la API Rest
app.use("/api/users", userRoutes);
app.use("/api/interests", interestRoutes);
app.use("/api/ads", adRoutes);
app.use("/api/requests", requestRoutes);
app.use("/api/connections", connectionRoutes);

// Configurar el middleware para servir archivos estáticos desde el directorio 'public'
app.use(express.static(path.join(__dirname, "public")));

// Ruta para manejar las solicitudes al archivo index.html
app.use((req, res) => {
  res.status(404).json({
    ok: false,
    mensaje: "La ruta solicitada no existe en el servidor",
  });
});

// Usamos httpServer.listen en lugar de app.listen
httpServer.listen(port, () => {
  console.log(`---Servidor y Sockets escuchando en el puerto ${port}---`);
});