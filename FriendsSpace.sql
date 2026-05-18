-- phpMyAdmin SQL Dump
-- version 5.2.3
-- https://www.phpmyadmin.net/
--
-- Servidor: db
-- Tiempo de generación: 18-05-2026 a las 11:27:22
-- Versión del servidor: 8.0.44
-- Versión de PHP: 8.3.26

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `FriendsSpace`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `user`
--

CREATE TABLE `user` (
  `id` int NOT NULL,
  `name` varchar(50) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `url_image` varchar(500) DEFAULT NULL,
  `bio` text,
  `role` enum('USER','ADMIN','DEVELOPER') NOT NULL DEFAULT 'USER',
  `banned` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `goals` text,
  `short_sentece` varchar(50) DEFAULT NULL,
  `first_login` tinyint NOT NULL DEFAULT '1',
  `token_version` int NOT NULL DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Volcado de datos para la tabla `user`
--

INSERT INTO `user` (`id`, `name`, `email`, `password`, `url_image`, `bio`, `role`, `banned`, `created_at`, `goals`, `short_sentece`, `first_login`, `token_version`) VALUES
(121, 'fs_developer', 'fsdev@gmail.com', '$2b$10$B7H7uKN4v..VQfYqh5V8VOGBWfimEYAIKczil2/cxrJVi161gy3T6', NULL, 'Creador de la app.', 'DEVELOPER', 0, '2026-04-14 08:23:12', NULL, 'Programar también puede ser arte.', 0, 1),
(130, 'fs_user', 'fsuser@gmail.com', '$2b$10$B7H7uKN4v..VQfYqh5V8VOGBWfimEYAIKczil2/cxrJVi161gy3T6', NULL, NULL, 'USER', 0, '2026-05-16 19:57:30', NULL, NULL, 0, 0),
(131, 'fs_admin', 'fsadmin@gmail.com', '$2b$10$a7p9Hs74Yd988ESSMvoybOsICYLkHvj5KodEbDl9fkgqTRAImJMOC', NULL, NULL, 'ADMIN', 0, '2026-05-18 11:06:10', NULL, NULL, 0, 0);

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `user`
--
ALTER TABLE `user`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `user`
--
ALTER TABLE `user`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=132;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
