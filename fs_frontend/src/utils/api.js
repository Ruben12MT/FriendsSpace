/**
 * @fileoverview Módulo de configuración de Axios para comunicación con el backend
 *
 * Este módulo exporta una instancia configurada de Axios que se utiliza en toda la aplicación
 * para realizar peticiones HTTP al servidor backend. Incluye interceptores para el manejo
 * centralizado de errores y normalización de respuestas.
 *
 * @module api
 * @requires axios
 */

import axios from "axios";

/**
 * Instancia configurada de Axios para comunicación con el backend
 *
 * Características:
 * - Base URL: http://localhost:3000/api
 * - Timeout: 5000ms (5 segundos)
 * - Content-Type: application/json
 * - Incluye interceptores para manejo de errores
 *
 * @type {AxiosInstance}
 * @constant
 */
const api = axios.create({
  baseURL: window.__APP_CONFIG__?.API_URL,
  timeout: 5000,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Interceptor de respuesta para manejo centralizado de errores y normalización de datos
 *
 * Este interceptor se aplica a todas las respuestas de Axios y:
 * 1. Extrae los datos del response en caso de éxito
 * 2. Maneja diferentes tipos de errores (4xx, 5xx, sin respuesta, etc.)
 * 3. Genera mensajes de error descriptivos
 * 4. Registra información en consola para debugging
 *
 * @callback responseInterceptor
 * @param {AxiosResponse} response - Respuesta exitosa del servidor
 * @returns {Object} Los datos normalizados de la respuesta
 */
api.interceptors.response.use(
  (response) => {
    // Si la respuesta es exitosa, retornamos los datos normalizados
    return response.data;
  },
  (error) => {
    // Inicializamos un objeto de error estándar
    let respuestaError = {
      ok: false,
      datos: null,
      mensaje: "Error desconocido",
    };

    // Manejo centralizado de errores según su tipo
    if (error.response) {
      // El servidor respondió con un código de estado fuera del rango 2xx
      respuestaError.mensaje =
        error.response.data?.mensaje ||
        `Error: ${error.response.status} ${error.response.statusText}`;

      // Registros específicos según el código de estado HTTP
      if (error.response.status === 404) {
        console.warn(`Recurso no encontrado (404): ${error.config.url}`);
      } else if (error.response.status === 400) {
        console.warn(`Solicitud inválida (400): ${error.config.url}`);
      } else if (error.response.status >= 500) {
        console.error(
          `Error del servidor (${error.response.status}): ${error.config.url}`,
        );
      }
    } else if (error.request) {
      // La solicitud fue realizada pero el servidor no respondió
      respuestaError.mensaje =
        "No hay respuesta del servidor. Verifica tu conexión.";
      console.error("No hay respuesta del servidor:", error.request);
    } else {
      // Algo sucedió al preparar la solicitud (ej: construcción de la URL)
      respuestaError.mensaje =
        error.message || "Error al realizar la solicitud";
      console.error("Error en la preparación de la solicitud:", error.message);
    }

    return Promise.reject(respuestaError);
  },
);

export default api;
