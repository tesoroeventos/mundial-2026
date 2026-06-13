/**
 * API
 * Obtiene el fixture completo (config, equipos, grupos, estadios,
 * partidos, posiciones, eliminatorias) desde el backend de Apps
 * Script. Si no hay API configurada, o falla la conexión (modo
 * offline), usa lo último guardado en localStorage o, si no hay
 * nada, los datos de ejemplo.
 */

function apiConfigurada() {
  return CONFIG.API_URL && !CONFIG.API_URL.includes('PEGA_AQUI');
}

function obtenerCache() {
  try {
    const guardado = localStorage.getItem(CONFIG.CLAVE_CACHE);
    return guardado ? JSON.parse(guardado) : null;
  } catch (err) {
    return null;
  }
}

function guardarCache(data) {
  try {
    localStorage.setItem(CONFIG.CLAVE_CACHE, JSON.stringify(data));
    localStorage.setItem(CONFIG.CLAVE_CACHE_FECHA, new Date().toISOString());
  } catch (err) {
    console.warn('No se pudo guardar en caché:', err);
  }
}

async function obtenerFixture() {
  if (!apiConfigurada()) {
    console.warn('CONFIG.API_URL no está configurada todavía (js/config.js). Mostrando datos de ejemplo.');
    return obtenerCache() || DATOS_EJEMPLO;
  }

  try {
    const resp = await fetch(`${CONFIG.API_URL}?recurso=fixture`);
    if (!resp.ok) throw new Error('Respuesta no OK: ' + resp.status);
    const data = await resp.json();
    guardarCache(data);
    return data;
  } catch (err) {
    console.warn('No se pudo conectar a la API, usando datos guardados:', err);
    return obtenerCache() || DATOS_EJEMPLO;
  }
}

function fechaUltimaActualizacion() {
  return localStorage.getItem(CONFIG.CLAVE_CACHE_FECHA);
}
