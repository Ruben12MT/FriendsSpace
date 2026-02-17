// ============================================
// IMPORTACIONES
// ============================================
const express = require("express");
const path = require("path");
const cors = require("cors");

// Rutas de la API
const userRoutes = require("./routes/userRoutes");

// ============================================
// INICIALIZACIÓN
// ============================================
const app = express();
const port = process.env.PORT || 3000;

// ============================================
// MIDDLEWARE - PARSEO
// ============================================
app.use(express.json());

// ============================================
// MIDDLEWARE - CORS - Cualquier origen
// ============================================

app.use(cors());


// ============================================
// MIDDLEWARE - ARCHIVOS ESTÁTICOS
// ============================================
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ============================================
// RUTAS - API REST
// ============================================
app.use("/api/users", userRoutes);


// ============================================
// RUTAS - SPA (Catch-all)
// ============================================
// app.get("*", (req, res) => {
//   res.sendFile(path.join(__dirname, "public", "index.html"));
// });

// ============================================
// SERVIDOR
// ============================================

if (process.env.NODE_ENV !== "test") {
  app.listen(port, () => {
    console.log(`Servidor escuchando en el puerto ${port}`);
  });
}
module.exports = app;

