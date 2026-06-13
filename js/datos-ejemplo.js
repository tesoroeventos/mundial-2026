/**
 * DATOS DE EJEMPLO
 * Se usan solo si CONFIG.API_URL no está configurada, o si falla
 * la conexión y no hay nada guardado en caché todavía. Sirven para
 * ver la app funcionando antes de conectarla a tu Sheet.
 */
const DATOS_EJEMPLO = {
  config: {
    nombre_torneo: 'Mundial 2026'
  },
  equipos: [
    { id_equipo: 'ARG', nombre: 'Argentina', bandera_url: 'https://flagcdn.com/w320/ar.png' },
    { id_equipo: 'ALG', nombre: 'Argelia', bandera_url: 'https://flagcdn.com/w320/dz.png' },
    { id_equipo: 'BRA', nombre: 'Brasil', bandera_url: 'https://flagcdn.com/w320/br.png' },
    { id_equipo: 'MAR', nombre: 'Marruecos', bandera_url: 'https://flagcdn.com/w320/ma.png' },
    { id_equipo: 'MEX', nombre: 'México', bandera_url: 'https://flagcdn.com/w320/mx.png' },
    { id_equipo: 'RSA', nombre: 'Sudáfrica', bandera_url: 'https://flagcdn.com/w320/za.png' },
    { id_equipo: 'CAN', nombre: 'Canadá', bandera_url: 'https://flagcdn.com/w320/ca.png' },
    { id_equipo: 'QAT', nombre: 'Catar', bandera_url: 'https://flagcdn.com/w320/qa.png' },
    { id_equipo: 'USA', nombre: 'Estados Unidos', bandera_url: 'https://flagcdn.com/w320/us.png' },
    { id_equipo: 'PAR', nombre: 'Paraguay', bandera_url: 'https://flagcdn.com/w320/py.png' },
    { id_equipo: 'AUT', nombre: 'Austria', bandera_url: 'https://flagcdn.com/w320/at.png' },
    { id_equipo: 'JOR', nombre: 'Jordania', bandera_url: 'https://flagcdn.com/w320/jo.png' },
    { id_equipo: 'KOR', nombre: 'Corea del Sur', bandera_url: 'https://flagcdn.com/w320/kr.png' },
    { id_equipo: 'CZE', nombre: 'República Checa', bandera_url: 'https://flagcdn.com/w320/cz.png' }
  ],
  estadios: [
    { id_estadio: 'ATT', nombre: 'AT&T Stadium', ciudad: 'Arlington, TX' },
    { id_estadio: 'HRS', nombre: 'Hard Rock Stadium', ciudad: 'Miami Gardens, FL' },
    { id_estadio: 'AZT', nombre: 'Estadio Azteca', ciudad: 'Ciudad de México' }
  ],
  partidos: [
    {
      id_partido: 'J-J1-1', fase: 'grupos', grupo: 'J', jornada: 1,
      fecha: '2026-06-12', hora: '16:00', id_estadio: 'ATT',
      local: 'ARG', visitante: 'ALG',
      goles_local: null, goles_visitante: null, estado: 'pendiente'
    },
    {
      id_partido: 'C-J1-1', fase: 'grupos', grupo: 'C', jornada: 1,
      fecha: '2026-06-12', hora: '19:00', id_estadio: 'HRS',
      local: 'BRA', visitante: 'MAR',
      goles_local: null, goles_visitante: null, estado: 'pendiente'
    },
    {
      id_partido: 'A-J1-1', fase: 'grupos', grupo: 'A', jornada: 1,
      fecha: '2026-06-11', hora: '13:00', id_estadio: 'AZT',
      local: 'MEX', visitante: 'RSA',
      goles_local: 2, goles_visitante: 0, estado: 'finalizado'
    },
    {
      id_partido: 'B-J1-1', fase: 'grupos', grupo: 'B', jornada: 1,
      fecha: '2026-06-11', hora: '16:00', id_estadio: 'ATT',
      local: 'CAN', visitante: 'QAT',
      goles_local: 1, goles_visitante: 1, estado: 'finalizado'
    },
    {
      id_partido: 'D-J1-1', fase: 'grupos', grupo: 'D', jornada: 1,
      fecha: '2026-06-11', hora: '20:00', id_estadio: 'HRS',
      local: 'USA', visitante: 'PAR',
      goles_local: 3, goles_visitante: 1, estado: 'finalizado'
    }
  ],
  posiciones: [
    { grupo: 'A', posicion: 1, id_equipo: 'MEX', pj: 1, pg: 1, pe: 0, pp: 0, gf: 2, gc: 0, dif: 2, pts: 3 },
    { grupo: 'A', posicion: 2, id_equipo: 'KOR', pj: 1, pg: 1, pe: 0, pp: 0, gf: 2, gc: 1, dif: 1, pts: 3 },
    { grupo: 'A', posicion: 3, id_equipo: 'CZE', pj: 1, pg: 0, pe: 0, pp: 1, gf: 1, gc: 2, dif: -1, pts: 0 },
    { grupo: 'A', posicion: 4, id_equipo: 'RSA', pj: 1, pg: 0, pe: 0, pp: 1, gf: 0, gc: 2, dif: -2, pts: 0 },
    { grupo: 'J', posicion: 1, id_equipo: 'ARG', pj: 0, pg: 0, pe: 0, pp: 0, gf: 0, gc: 0, dif: 0, pts: 0 },
    { grupo: 'J', posicion: 2, id_equipo: 'AUT', pj: 0, pg: 0, pe: 0, pp: 0, gf: 0, gc: 0, dif: 0, pts: 0 },
    { grupo: 'J', posicion: 3, id_equipo: 'ALG', pj: 0, pg: 0, pe: 0, pp: 0, gf: 0, gc: 0, dif: 0, pts: 0 },
    { grupo: 'J', posicion: 4, id_equipo: 'JOR', pj: 0, pg: 0, pe: 0, pp: 0, gf: 0, gc: 0, dif: 0, pts: 0 }
  ]
};
