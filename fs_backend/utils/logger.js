// Este archivo centraliza cómo nuestra app "habla" por la consola

const logger = {
    // Para mensajes de éxito, información o desarrollo (Se apagan en producción)
    info: (mensaje, datos = "") => {
        if (process.env.NODE_ENV !== 'production') {
            console.log(`🟢 [INFO] ${mensaje}`, datos);
        }
    },

    // Para advertencias (Cosas raras pero que no rompen la app)
    warn: (mensaje, datos = "") => {
         if (process.env.NODE_ENV !== 'production') {
            console.warn(`🟠 [WARN] ${mensaje}`, datos);
        }
    },

    // Para errores graves (Estos SIEMPRE se imprimen, incluso en producción)
    error: (contexto, error) => {
        // Extraemos el mensaje real del error si existe
        const detalleError = error?.message || error;
        console.error(`🔴 [ERROR - ${contexto}]:`, detalleError);
    }
};

module.exports = logger;