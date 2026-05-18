-- phpMyAdmin SQL Dump
-- version 5.2.3
-- https://www.phpmyadmin.net/
--
-- Servidor: db
-- Tiempo de generación: 18-05-2026 a las 11:08:23
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
-- Estructura de tabla para la tabla `ad`
--

CREATE TABLE `ad` (
  `id` int NOT NULL,
  `user_id` int DEFAULT NULL,
  `title` varchar(100) DEFAULT NULL,
  `body` text,
  `created_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `ad_interest`
--

CREATE TABLE `ad_interest` (
  `ad_id` int NOT NULL,
  `interest_id` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `connection`
--

CREATE TABLE `connection` (
  `id` int NOT NULL,
  `status` enum('ACTIVE','BLOCKED','FINISHED') DEFAULT 'ACTIVE',
  `created_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Volcado de datos para la tabla `connection`
--

INSERT INTO `connection` (`id`, `status`, `created_at`) VALUES
(109, 'ACTIVE', '2026-05-12 07:48:28'),
(110, 'ACTIVE', '2026-05-18 11:06:10');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `interest`
--

CREATE TABLE `interest` (
  `id` int NOT NULL,
  `name` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Volcado de datos para la tabla `interest`
--

INSERT INTO `interest` (`id`, `name`) VALUES
(80, 'Anime'),
(76, 'Arte'),
(85, 'Astronomía'),
(70, 'Cine'),
(74, 'Cocina'),
(69, 'Deporte'),
(82, 'Emprendimiento'),
(79, 'Fitness'),
(73, 'Fotografía'),
(83, 'Idiomas'),
(71, 'Lectura'),
(77, 'Moda'),
(67, 'Música'),
(78, 'Naturaleza'),
(84, 'Podcast'),
(81, 'Programación'),
(75, 'Tecnología'),
(72, 'Viajes'),
(68, 'Videojuegos'),
(86, 'Voluntariado');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `message`
--

CREATE TABLE `message` (
  `id` int NOT NULL,
  `connection_id` int DEFAULT NULL,
  `user_id` int DEFAULT NULL,
  `type` enum('TEXT','IMAGE','VIDEO','AUDIO','FILE') NOT NULL DEFAULT 'TEXT',
  `body` text,
  `url` varchar(500) DEFAULT NULL,
  `reply_id` int DEFAULT NULL,
  `deleted` tinyint(1) DEFAULT '0',
  `is_edited` tinyint(1) DEFAULT '0',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `is_read` tinyint(1) NOT NULL DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `request`
--

CREATE TABLE `request` (
  `id` int NOT NULL,
  `sender_id` int DEFAULT NULL,
  `receiver_id` int DEFAULT NULL,
  `is_report` tinyint(1) DEFAULT '0',
  `status` enum('PENDING','ACCEPTED','REJECTED') DEFAULT 'PENDING',
  `created_at` datetime DEFAULT NULL,
  `body` text,
  `info_report` text,
  `visible_sender` tinyint(1) DEFAULT '0',
  `visible_receiver` tinyint(1) DEFAULT '1',
  `updated_at` datetime DEFAULT NULL,
  `is_read_sender` tinyint(1) DEFAULT '0',
  `is_read_receiver` tinyint(1) DEFAULT '0',
  `connection_id` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

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
(131, 'fs_admin', 'fs_admin@gmail.com', '$2b$10$a7p9Hs74Yd988ESSMvoybOsICYLkHvj5KodEbDl9fkgqTRAImJMOC', NULL, NULL, 'ADMIN', 0, '2026-05-18 11:06:10', NULL, NULL, 0, 0);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `user_connection`
--

CREATE TABLE `user_connection` (
  `user_id` int NOT NULL,
  `connection_id` int NOT NULL,
  `blocked_by` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Volcado de datos para la tabla `user_connection`
--

INSERT INTO `user_connection` (`user_id`, `connection_id`, `blocked_by`) VALUES
(121, 109, NULL),
(121, 110, NULL),
(129, 109, NULL),
(131, 110, NULL);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `user_interest`
--

CREATE TABLE `user_interest` (
  `user_id` int NOT NULL,
  `interest_id` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Volcado de datos para la tabla `user_interest`
--

INSERT INTO `user_interest` (`user_id`, `interest_id`) VALUES
(121, 76),
(121, 80);

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `ad`
--
ALTER TABLE `ad`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indices de la tabla `ad_interest`
--
ALTER TABLE `ad_interest`
  ADD PRIMARY KEY (`ad_id`,`interest_id`),
  ADD KEY `interest_id` (`interest_id`);

--
-- Indices de la tabla `connection`
--
ALTER TABLE `connection`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `interest`
--
ALTER TABLE `interest`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`);

--
-- Indices de la tabla `message`
--
ALTER TABLE `message`
  ADD PRIMARY KEY (`id`),
  ADD KEY `connection_id` (`connection_id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `fk_message_reply` (`reply_id`) USING BTREE;

--
-- Indices de la tabla `request`
--
ALTER TABLE `request`
  ADD PRIMARY KEY (`id`),
  ADD KEY `sender_id` (`sender_id`),
  ADD KEY `receiver_id` (`receiver_id`),
  ADD KEY `fk_request_connection` (`connection_id`);

--
-- Indices de la tabla `user`
--
ALTER TABLE `user`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indices de la tabla `user_connection`
--
ALTER TABLE `user_connection`
  ADD PRIMARY KEY (`user_id`,`connection_id`),
  ADD KEY `connection_id` (`connection_id`),
  ADD KEY `blocked_by` (`blocked_by`);

--
-- Indices de la tabla `user_interest`
--
ALTER TABLE `user_interest`
  ADD PRIMARY KEY (`user_id`,`interest_id`),
  ADD KEY `interest_id` (`interest_id`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `ad`
--
ALTER TABLE `ad`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=71;

--
-- AUTO_INCREMENT de la tabla `connection`
--
ALTER TABLE `connection`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=111;

--
-- AUTO_INCREMENT de la tabla `interest`
--
ALTER TABLE `interest`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=87;

--
-- AUTO_INCREMENT de la tabla `message`
--
ALTER TABLE `message`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=94;

--
-- AUTO_INCREMENT de la tabla `request`
--
ALTER TABLE `request`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=25;

--
-- AUTO_INCREMENT de la tabla `user`
--
ALTER TABLE `user`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=132;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `ad`
--
ALTER TABLE `ad`
  ADD CONSTRAINT `ad_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `ad_interest`
--
ALTER TABLE `ad_interest`
  ADD CONSTRAINT `ad_interest_ibfk_1` FOREIGN KEY (`ad_id`) REFERENCES `ad` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `ad_interest_ibfk_2` FOREIGN KEY (`interest_id`) REFERENCES `interest` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `message`
--
ALTER TABLE `message`
  ADD CONSTRAINT `message_ibfk_3` FOREIGN KEY (`connection_id`) REFERENCES `connection` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `message_ibfk_4` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `message_ibfk_5` FOREIGN KEY (`reply_id`) REFERENCES `message` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Filtros para la tabla `request`
--
ALTER TABLE `request`
  ADD CONSTRAINT `fk_request_connection` FOREIGN KEY (`connection_id`) REFERENCES `connection` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `request_ibfk_1` FOREIGN KEY (`sender_id`) REFERENCES `user` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `request_ibfk_2` FOREIGN KEY (`receiver_id`) REFERENCES `user` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Filtros para la tabla `user_connection`
--
ALTER TABLE `user_connection`
  ADD CONSTRAINT `user_connection_ibfk_2` FOREIGN KEY (`connection_id`) REFERENCES `connection` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `user_connection_ibfk_3` FOREIGN KEY (`blocked_by`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `user_interest`
--
ALTER TABLE `user_interest`
  ADD CONSTRAINT `user_interest_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `user_interest_ibfk_2` FOREIGN KEY (`interest_id`) REFERENCES `interest` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
