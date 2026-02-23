// Importar librería express --> web server
const express = require("express");

// Importar libreria CORS
const cors = require("cors");

// Importar librería path, para manejar rutas de ficheros en el servidor
const path = require("path");

// Importar cookie-parser para manejar cookies
const cookieParser = require("cookie-parser");

// Importar gestores de rutas
const userRoutes = require("./routes/userRoutes");

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(cookieParser()); 

app.use("/api/users", userRoutes);

// Configurar cookie-parser para manejar cookies
app.use(cookieParser());

// Configurar CORS para admitir cualquier origen

app.use(cors({
  origin: 'http://localhost:5173', 
  credentials: true
}));

// Configurar rutas de la API Rest
app.use("/api/users", userRoutes);
// Configurar el middleware para servir archivos estáticos desde el directorio 'public'
app.use(express.static(path.join(__dirname, "public")));

// Ruta para manejar las solicitudes al archivo index.html
// app.get('/', (req, res) => {
app.use((req, res) => {
  res.status(404).json({
    ok: false,
    mensaje: "La ruta solicitada no existe en el servidor",
  });
});

// Iniciar el servidor
app.listen(port, () => {
  console.log(`Servidor escuchando en el puerto ${port}`);
});
