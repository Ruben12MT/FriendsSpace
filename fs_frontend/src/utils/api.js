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
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn("Sesión no válida o expirada.");
    } else if (error.response?.status === 500) {
      console.error("Error de conexión con el servidor.");
    }
    return Promise.reject(error);
  },
);

export default api;
