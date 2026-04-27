/* Para cambiar a modo producción
1. Descomenta la URL de producción y comenta la URL de desarrollo.
2. Hacer un build de la aplicación con `npm run build`.
3. En vercel se aplica por un commit a main.
4. En aws se sube el build a s3 al bucket correspondiente.
*/

/* Para cambiar a modo desarrollo
 1. Descomenta la URL de desarrollo y comenta la URL de producción.
 2. Ejecuta la aplicación con `npm run dev`.
 3. No hagas commit sin haber cambiado a modo producción, o la aplicación en producción dejará de funcionar.
 */
window.__APP_CONFIG__ = {
  // URL de la API en producción
  //API_URL: "https://friendsspace-production.up.railway.app/api"

  // URL de la API en desarrollo
  API_URL: "http://localhost:3000/api",
};
