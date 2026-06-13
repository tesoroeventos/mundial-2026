/**
 * APP PRINCIPAL
 * Carga el fixture, arma índices rápidos (equipos y estadios por id),
 * renderiza la pantalla de inicio y maneja la navegación inferior.
 */

let FIXTURE = null;
let EQUIPOS_POR_ID = {};
let ESTADIOS_POR_ID = {};

const DIAS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

document.addEventListener('DOMContentLoaded', iniciar);

async function iniciar() {
  FIXTURE = await obtenerFixture();
  indexarDatos();

  const nombreTorneo = (FIXTURE.config && FIXTURE.config.nombre_torneo) || 'Mundial 2026';
  document.getElementById('titulo-torneo').textContent = nombreTorneo;

  renderInicio();
  renderGrupos();
  renderCalendario();
  renderLlaves();
  configurarNavegacion();
  ocultarPantallaCarga();
  registrarServiceWorker();
}

function indexarDatos() {
  EQUIPOS_POR_ID = {};
  (FIXTURE.equipos || []).forEach(eq => { EQUIPOS_POR_ID[eq.id_equipo] = eq; });

  ESTADIOS_POR_ID = {};
  (FIXTURE.estadios || []).forEach(es => { ESTADIOS_POR_ID[es.id_estadio] = es; });
}

function ocultarPantallaCarga() {
  const pantalla = document.getElementById('pantalla-carga');
  const app = document.getElementById('app');
  pantalla.classList.add('oculto');
  app.classList.remove('oculto');
}

// ============================================================
// PANTALLA PRINCIPAL: próximos partidos + resultados recientes
// ============================================================
function renderInicio() {
  const partidos = FIXTURE.partidos || [];

  const enVivo = partidos.filter(p => p.estado === 'jugando');

  const proximos = partidos
    .filter(p => p.estado === 'pendiente' && p.fecha)
    .sort((a, b) => fechaHoraComo(a) - fechaHoraComo(b))
    .slice(0, CONFIG.MAX_PROXIMOS);

  const recientes = partidos
    .filter(p => p.estado === 'finalizado' && p.fecha)
    .sort((a, b) => fechaHoraComo(b) - fechaHoraComo(a))
    .slice(0, CONFIG.MAX_RECIENTES);

  const contEnVivo = document.getElementById('bloque-en-vivo');
  const contProximos = document.getElementById('proximos-partidos');
  const contRecientes = document.getElementById('resultados-recientes');

  contEnVivo.innerHTML = enVivo.length
    ? `<h2>En vivo</h2><div class="lista-partidos">${enVivo.map(p => tarjetaPartido(p, 'jugando')).join('')}</div>`
    : '';

  contProximos.innerHTML = proximos.length
    ? proximos.map(p => tarjetaPartido(p, 'proximo')).join('')
    : '<p class="placeholder">No hay partidos con fecha cargada todavía. Completá las columnas fecha y hora en la hoja Partidos.</p>';

  contRecientes.innerHTML = recientes.length
    ? recientes.map(p => tarjetaPartido(p, 'finalizado')).join('')
    : '<p class="placeholder">Todavía no hay resultados cargados.</p>';
}

function fechaHoraComo(partido) {
  const hora = partido.hora || '00:00';
  const valor = new Date(`${partido.fecha}T${hora}:00`);
  return isNaN(valor.getTime()) ? 0 : valor.getTime();
}

function tipoPartido(estado) {
  if (estado === 'finalizado') return 'finalizado';
  if (estado === 'jugando') return 'jugando';
  return 'proximo';
}

// Devuelve "73'", "45+3'" (tiempo agregado), o "En vivo" si no hay minuto cargado
function textoMinuto(partido) {
  const minuto = partido.minuto;
  if (minuto === null || minuto === undefined) return 'En vivo';

  const extra = partido.tiempo_extra;
  if (extra) return `${minuto}+${extra}'`;
  return `${minuto}'`;
}

function tarjetaPartido(partido, tipo) {
  const local = equipoInfo(partido.local);
  const visitante = equipoInfo(partido.visitante);
  const estadio = ESTADIOS_POR_ID[partido.id_estadio];

  const etiquetaFase = partido.grupo
    ? `Grupo ${partido.grupo} · Jornada ${partido.jornada || ''}`.trim()
    : etiquetaFaseEliminatoria(partido.fase);

  let centro;
  if (tipo === 'finalizado' || tipo === 'jugando') {
    const gl = partido.goles_local ?? 0;
    const gv = partido.goles_visitante ?? 0;
    centro = `<span class="resultado">${gl} - ${gv}</span>`;
  } else {
    centro = '<span class="vs">vs</span>';
  }

  let metaDerecha;
  if (tipo === 'finalizado') {
    metaDerecha = '<span class="badge-finalizado">Finalizado</span>';
  } else if (tipo === 'jugando') {
    metaDerecha = `<span class="badge-vivo"><span class="punto-vivo" aria-hidden="true"></span>${textoMinuto(partido)}</span>`;
  } else {
    metaDerecha = `<span class="badge-hora">${formatearFechaHora(partido.fecha, partido.hora)}</span>`;
  }

  return `
    <div class="partido-card">
      <div class="partido-meta">
        <span>${etiquetaFase}</span>
        ${metaDerecha}
      </div>
      <div class="partido-equipos">
        <div class="equipo">
          ${escudoHtml(local)}
          <span>${local.nombre}</span>
        </div>
        ${centro}
        <div class="equipo equipo-visitante">
          <span>${visitante.nombre}</span>
          ${escudoHtml(visitante)}
        </div>
      </div>
      ${estadio ? `<p class="partido-estadio">${estadio.nombre}${estadio.ciudad ? ', ' + estadio.ciudad : ''}</p>` : ''}
    </div>
  `;
}

function equipoInfo(idEquipo) {
  const equipo = EQUIPOS_POR_ID[idEquipo];
  if (equipo) return equipo;
  // Placeholder de eliminatorias todavía no resuelto (ej: "1A", "GAN-R32-1")
  return { id_equipo: idEquipo, nombre: idEquipo || 'Por definir', bandera_url: null };
}

function escudoHtml(equipo) {
  if (equipo.bandera_url) {
    return `<img src="${equipo.bandera_url}" alt="" class="bandera">`;
  }
  return `<span class="bandera bandera-vacia" aria-hidden="true"></span>`;
}

function etiquetaFaseEliminatoria(fase) {
  const nombres = {
    r32: 'Dieciseisavos',
    octavos: 'Octavos de final',
    cuartos: 'Cuartos de final',
    semifinal: 'Semifinal',
    tercer_puesto: 'Tercer puesto',
    final: 'Final'
  };
  return nombres[fase] || fase || '';
}

function formatearFechaHora(fecha, hora) {
  if (!fecha) return '';
  const d = new Date(`${fecha}T${hora || '00:00'}:00`);
  if (isNaN(d.getTime())) return fecha;

  const hoy = new Date();
  const esHoy = d.toDateString() === hoy.toDateString();
  const mañana = new Date(hoy);
  mañana.setDate(hoy.getDate() + 1);
  const esMañana = d.toDateString() === mañana.toDateString();

  const horaTxt = hora ? ` ${hora}` : '';

  if (esHoy) return `Hoy${horaTxt}`;
  if (esMañana) return `Mañana${horaTxt}`;

  return `${d.getDate()} ${MESES[d.getMonth()]}${horaTxt}`;
}

// ============================================================
// TABLA DE GRUPOS
// ============================================================
function renderGrupos() {
  const posiciones = FIXTURE.posiciones || [];
  const grupos = [...new Set(posiciones.map(p => p.grupo))].sort();

  const selector = document.getElementById('selector-grupo');

  if (selector.options.length === 0) {
    grupos.forEach(g => {
      const opcion = document.createElement('option');
      opcion.value = g;
      opcion.textContent = `Grupo ${g}`;
      selector.appendChild(opcion);
    });

    // Por defecto, el grupo de Argentina si existe
    selector.value = grupos.includes('J') ? 'J' : grupos[0];

    selector.addEventListener('change', () => renderTablaGrupo(selector.value));
  }

  renderTablaGrupo(selector.value);
}

function renderTablaGrupo(grupo) {
  const filas = (FIXTURE.posiciones || [])
    .filter(p => p.grupo === grupo)
    .sort((a, b) => a.posicion - b.posicion);

  const contenedor = document.getElementById('tabla-grupo');

  if (!filas.length) {
    contenedor.innerHTML = '<p class="placeholder">Sin datos para este grupo todavía.</p>';
    return;
  }

  const filasHtml = filas.map(f => {
    const equipo = equipoInfo(f.id_equipo);
    return `
      <tr class="pos-${f.posicion}">
        <td class="col-pos">${f.posicion}</td>
        <td class="col-equipo">
          <div class="equipo-celda">
            ${escudoHtml(equipo)}
            <span>${equipo.nombre}</span>
          </div>
        </td>
        <td>${f.pj}</td>
        <td>${f.pg}</td>
        <td>${f.pe}</td>
        <td>${f.pp}</td>
        <td>${f.gf}</td>
        <td>${f.gc}</td>
        <td>${f.dif}</td>
        <td class="col-pts">${f.pts}</td>
      </tr>
    `;
  }).join('');

  contenedor.innerHTML = `
    <table class="tabla-posiciones">
      <thead>
        <tr>
          <th class="col-pos">#</th>
          <th class="col-equipo">Equipo</th>
          <th>PJ</th>
          <th>G</th>
          <th>E</th>
          <th>P</th>
          <th>GF</th>
          <th>GC</th>
          <th>DIF</th>
          <th class="col-pts">Pts</th>
        </tr>
      </thead>
      <tbody>${filasHtml}</tbody>
    </table>
  `;
}

// ============================================================
// CALENDARIO
// ============================================================
function renderCalendario() {
  const partidos = FIXTURE.partidos || [];
  const selector = document.getElementById('selector-calendario');

  if (selector.options.length === 0) {
    const grupos = [...new Set(partidos.filter(p => p.grupo).map(p => p.grupo))].sort();

    const opciones = [
      { value: 'todos', label: 'Todos los partidos' },
      ...grupos.map(g => ({ value: `grupo-${g}`, label: `Grupo ${g}` })),
      { value: 'eliminatorias', label: 'Eliminatorias' }
    ];

    opciones.forEach(o => {
      const opcion = document.createElement('option');
      opcion.value = o.value;
      opcion.textContent = o.label;
      selector.appendChild(opcion);
    });

    selector.addEventListener('change', () => renderListaCalendario(selector.value));
  }

  renderListaCalendario(selector.value);
}

function renderListaCalendario(filtro) {
  let partidos = FIXTURE.partidos || [];

  if (filtro && filtro.startsWith('grupo-')) {
    const grupo = filtro.replace('grupo-', '');
    partidos = partidos.filter(p => p.grupo === grupo);
  } else if (filtro === 'eliminatorias') {
    partidos = partidos.filter(p => p.fase !== 'grupos');
  }

  const conFecha = partidos
    .filter(p => p.fecha)
    .sort((a, b) => fechaHoraComo(a) - fechaHoraComo(b));
  const sinFecha = partidos.filter(p => !p.fecha);

  const contenedor = document.getElementById('lista-calendario');

  if (!conFecha.length && !sinFecha.length) {
    contenedor.innerHTML = '<p class="placeholder">No hay partidos para mostrar.</p>';
    return;
  }

  let html = '';
  let fechaActual = null;
  let bufferDia = [];

  const cerrarDia = () => {
    if (!bufferDia.length) return;
    html += `<h3 class="fecha-calendario">${formatearFechaLarga(fechaActual)}</h3>`;
    html += `<div class="lista-partidos">${bufferDia.join('')}</div>`;
    bufferDia = [];
  };

  conFecha.forEach(p => {
    if (p.fecha !== fechaActual) {
      cerrarDia();
      fechaActual = p.fecha;
    }
    bufferDia.push(tarjetaPartido(p, tipoPartido(p.estado)));
  });
  cerrarDia();

  if (sinFecha.length) {
    html += `<h3 class="fecha-calendario">Fecha a confirmar</h3>`;
    html += `<div class="lista-partidos">${sinFecha.map(p => tarjetaPartido(p, tipoPartido(p.estado))).join('')}</div>`;
  }

  contenedor.innerHTML = html;
}

function formatearFechaLarga(fecha) {
  const d = new Date(`${fecha}T00:00:00`);
  if (isNaN(d.getTime())) return fecha;
  const dia = DIAS[d.getDay()];
  const diaCapitalizado = dia.charAt(0).toUpperCase() + dia.slice(1);
  return `${diaCapitalizado} ${d.getDate()} de ${MESES[d.getMonth()]}`;
}

// ============================================================
// LLAVES ELIMINATORIAS
// ============================================================
const ORDEN_FASES_ELIMINATORIAS = ['r32', 'octavos', 'cuartos', 'semifinal', 'tercer_puesto', 'final'];

function renderLlaves() {
  const eliminatorias = FIXTURE.eliminatorias || [];
  const selector = document.getElementById('selector-ronda');

  if (selector.options.length === 0) {
    const fasesDisponibles = new Set(eliminatorias.map(e => e.fase));
    const fasesOrdenadas = ORDEN_FASES_ELIMINATORIAS.filter(f => fasesDisponibles.has(f));

    fasesOrdenadas.forEach(f => {
      const opcion = document.createElement('option');
      opcion.value = f;
      opcion.textContent = etiquetaFaseEliminatoria(f);
      selector.appendChild(opcion);
    });

    selector.addEventListener('change', () => renderListaLlaves(selector.value));
  }

  renderListaLlaves(selector.value);
}

function renderListaLlaves(fase) {
  const cruces = (FIXTURE.eliminatorias || [])
    .filter(e => e.fase === fase)
    .sort((a, b) => (a.orden || 0) - (b.orden || 0));

  const contenedor = document.getElementById('lista-llaves');

  if (!cruces.length) {
    contenedor.innerHTML = '<p class="placeholder">No hay cruces para esta ronda.</p>';
    return;
  }

  contenedor.innerHTML = `<div class="lista-partidos">${cruces.map(tarjetaLlave).join('')}</div>`;
}

function tarjetaLlave(cruce) {
  const partido = cruce.partido || {};
  const local = equipoOPlaceholder(partido.local, cruce.local_origen);
  const visitante = equipoOPlaceholder(partido.visitante, cruce.visitante_origen);

  let centro;
  if (partido.estado === 'finalizado' || partido.estado === 'jugando') {
    const gl = partido.goles_local ?? 0;
    const gv = partido.goles_visitante ?? 0;
    let texto = `${gl} - ${gv}`;
    if (huboTandaPenales(partido)) {
      texto += ` <span class="penales">(${partido.penales_local}-${partido.penales_visitante} pen.)</span>`;
    }
    centro = `<span class="resultado">${texto}</span>`;
  } else {
    centro = '<span class="vs">vs</span>';
  }

  let metaDerecha;
  if (partido.estado === 'finalizado') {
    metaDerecha = '<span class="badge-finalizado">Finalizado</span>';
  } else if (partido.estado === 'jugando') {
    metaDerecha = `<span class="badge-vivo"><span class="punto-vivo" aria-hidden="true"></span>${textoMinuto(partido)}</span>`;
  } else {
    metaDerecha = partido.fecha ? `<span class="badge-hora">${formatearFechaHora(partido.fecha, partido.hora)}</span>` : '';
  }

  const estadio = ESTADIOS_POR_ID[partido.id_estadio];

  return `
    <div class="partido-card">
      <div class="partido-meta">
        <span>${etiquetaFaseEliminatoria(cruce.fase)}</span>
        ${metaDerecha}
      </div>
      <div class="partido-equipos">
        <div class="equipo">
          ${local.bandera}
          <span>${local.nombre}</span>
        </div>
        ${centro}
        <div class="equipo equipo-visitante">
          <span>${visitante.nombre}</span>
          ${visitante.bandera}
        </div>
      </div>
      ${estadio ? `<p class="partido-estadio">${estadio.nombre}${estadio.ciudad ? ', ' + estadio.ciudad : ''}</p>` : ''}
    </div>
  `;
}

function huboTandaPenales(partido) {
  return partido.penales_local !== null && partido.penales_local !== undefined
    && partido.penales_visitante !== null && partido.penales_visitante !== undefined;
}

// Si el equipo ya está resuelto (id_equipo real), muestra bandera + nombre.
// Si no, muestra una descripción legible del código de origen (ej: "1° Grupo A").
function equipoOPlaceholder(idEquipo, codigoOrigen) {
  const equipo = idEquipo ? EQUIPOS_POR_ID[idEquipo] : null;
  if (equipo) {
    return { nombre: equipo.nombre, bandera: escudoHtml(equipo) };
  }
  return {
    nombre: descripcionOrigen(codigoOrigen),
    bandera: '<span class="bandera bandera-vacia" aria-hidden="true"></span>'
  };
}

function descripcionOrigen(codigo) {
  if (!codigo) return 'Por definir';
  codigo = String(codigo).trim();

  let m = codigo.match(/^([1-4])([A-L])$/);
  if (m) return `${m[1]}° Grupo ${m[2]}`;

  m = codigo.match(/^3M-(\d+)$/);
  if (m) return `Mejor 3° #${m[1]}`;

  m = codigo.match(/^GAN-(.+)$/);
  if (m) return `Ganador ${etiquetaCruceCorto(m[1])}`;

  m = codigo.match(/^PERD-(.+)$/);
  if (m) return `Perdedor ${etiquetaCruceCorto(m[1])}`;

  return codigo;
}

function etiquetaCruceCorto(idLlave) {
  const m = idLlave.match(/^([A-Z]+)-(\d+)$/);
  if (!m) return idLlave;

  const nombres = {
    R32: 'Dieciseisavos',
    OCT: 'Octavos',
    CUA: 'Cuartos',
    SEMI: 'Semifinal',
    TERCER: '3er puesto',
    FINAL: 'Final'
  };

  return `${nombres[m[1]] || m[1]} #${m[2]}`;
}

// ============================================================
// NAVEGACIÓN ENTRE PANTALLAS
// ============================================================
function configurarNavegacion() {
  const botones = document.querySelectorAll('.nav-item');
  botones.forEach(boton => {
    boton.addEventListener('click', () => {
      const vista = boton.dataset.vista;
      cambiarVista(vista);

      botones.forEach(b => b.classList.remove('nav-activo'));
      boton.classList.add('nav-activo');
    });
  });
}

function cambiarVista(vista) {
  document.querySelectorAll('.vista').forEach(seccion => {
    seccion.classList.toggle('vista-activa', seccion.id === `vista-${vista}`);
  });
}

// ============================================================
// SERVICE WORKER (modo offline)
// ============================================================
function registrarServiceWorker() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('service-worker.js').catch(err => {
      console.warn('No se pudo registrar el service worker:', err);
    });
  }
}
