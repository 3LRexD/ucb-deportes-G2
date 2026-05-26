import type { Espacio } from '@/types';

export interface EquipoBasico { id: number; nombre: string; }

export interface PartidoFixture {
  id: string;
  equipo_local_id: number;
  equipo_local_nombre: string;
  equipo_visitante_id: number;
  equipo_visitante_nombre: string;
  fecha: string;
  hora: string;
  espacio_id: number;
  espacio_nombre: string;
  jornada: number;
  fase: string;
  grupo?: string;
  colisiones: ColisionHorario[];
}

export interface ColisionHorario { tipo: 'espacio' | 'jugador'; descripcion: string; }

export interface ConfigFixture {
  torneoId: number;
  torneoNombre: string;
  equipos: EquipoBasico[];
  formato: 'liga' | 'eliminacion_directa' | 'grupos_eliminacion';
  fechaInicio: string;
  horaInicio: string;
  duracionMinutos: number;
  espacios: Espacio[];
}

export interface GrupoFixture {
  nombre: string;
  equipos: EquipoBasico[];
  partidos: PartidoFixture[];
}

export interface ResultadoFixture {
  formato: string;
  grupos: GrupoFixture[];
  eliminatorias: PartidoFixture[];
  todos: PartidoFixture[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function sumarDias(fecha: string, dias: number): string {
  const d = new Date(fecha + 'T12:00:00');
  d.setDate(d.getDate() + dias);
  return d.toISOString().split('T')[0];
}

function sumarMinutos(hora: string, minutos: number): string {
  const [h, m] = hora.split(':').map(Number);
  const total = h * 60 + m + minutos;
  return `${String(Math.floor(total / 60) % 24).padStart(2,'0')}:${String(total % 60).padStart(2,'0')}`;
}

function horaMin(hora: string): number {
  const [h, m] = hora.split(':').map(Number);
  return h * 60 + m;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ─── Scheduler sin solapamiento ───────────────────────────────────────────────
class Scheduler {
  private nextSlot: Map<string, string[]> = new Map();
  private espacios: Espacio[];
  private horaInicio: string;
  private duracion: number;
  private descanso: number;

  constructor(
    espacios: Espacio[],
    horaInicio: string,
    duracion: number,
    descanso = 15,
  ) {
    this.espacios = espacios;
    this.horaInicio = horaInicio;
    this.duracion = duracion;
    this.descanso = descanso;
  }

  get(fecha: string): { hora: string; espacio: Espacio } {
    if (!this.nextSlot.has(fecha)) {
      this.nextSlot.set(fecha, this.espacios.map(() => this.horaInicio));
    }
    const slots = this.nextSlot.get(fecha)!;
    // Elegir espacio con el slot más temprano
    const idx = slots.reduce((mi, h, i) => horaMin(h) < horaMin(slots[mi]) ? i : mi, 0);
    const espacio = this.espacios[idx];
    const hora = slots[idx];

    // Verificar cierre
    if (horaMin(hora) + this.duracion > horaMin(espacio.horario_cierre)) {
      const nuevaFecha = sumarDias(fecha, 1);
      this.nextSlot.delete(nuevaFecha);
      return this.get(nuevaFecha);
    }

    slots[idx] = sumarMinutos(hora, this.duracion + this.descanso);
    return { hora, espacio };
  }
}

// ─── Round-Robin ──────────────────────────────────────────────────────────────
function roundRobin(
  equipos: EquipoBasico[],
  grupo: string,
  torneoId: number,
  scheduler: Scheduler,
  fechaInicio: string,
  jornadaBase = 1,
): PartidoFixture[] {
  const lista = shuffle([...equipos]);
  if (lista.length % 2 !== 0) lista.push({ id: -1, nombre: 'BYE' });
  const n = lista.length;
  const partidos: PartidoFixture[] = [];
  let fechaActual = fechaInicio;
  let pid = 0;

  for (let r = 0; r < n - 1; r++) {
    for (let i = 0; i < n / 2; i++) {
      const local = lista[i];
      const vis = lista[n - 1 - i];
      if (local.id === -1 || vis.id === -1) continue;
      const { hora, espacio } = scheduler.get(fechaActual);
      partidos.push({
        id: `rr-${grupo}-${torneoId}-${pid++}`,
        equipo_local_id: local.id, equipo_local_nombre: local.nombre,
        equipo_visitante_id: vis.id, equipo_visitante_nombre: vis.nombre,
        fecha: fechaActual, hora,
        espacio_id: espacio.id, espacio_nombre: espacio.nombre,
        jornada: jornadaBase + r, fase: 'grupos', grupo, colisiones: [],
      });
    }
    fechaActual = sumarDias(fechaActual, 7);
    lista.splice(1, 0, lista.pop()!);
  }
  return partidos;
}

// ─── Eliminación ──────────────────────────────────────────────────────────────
function eliminacion(
  equipos: EquipoBasico[],
  fase: string,
  torneoId: number,
  scheduler: Scheduler,
  fecha: string,
  jornada = 1,
): PartidoFixture[] {
  const lista = shuffle([...equipos]);
  const partidos: PartidoFixture[] = [];
  let pid = 0;

  for (let i = 0; i + 1 < lista.length; i += 2) {
    const { hora, espacio } = scheduler.get(fecha);
    partidos.push({
      id: `elim-${fase}-${torneoId}-${pid++}`,
      equipo_local_id: lista[i].id, equipo_local_nombre: lista[i].nombre,
      equipo_visitante_id: lista[i+1].id, equipo_visitante_nombre: lista[i+1].nombre,
      fecha, hora,
      espacio_id: espacio.id, espacio_nombre: espacio.nombre,
      jornada, fase, colisiones: [],
    });
  }
  // Bye si impar
  if (lista.length % 2 !== 0) {
    const bye = lista[lista.length - 1];
    const { hora, espacio } = scheduler.get(fecha);
    partidos.push({
      id: `bye-${fase}-${torneoId}-${pid++}`,
      equipo_local_id: bye.id, equipo_local_nombre: bye.nombre,
      equipo_visitante_id: -1, equipo_visitante_nombre: 'BYE',
      fecha, hora,
      espacio_id: espacio.id, espacio_nombre: espacio.nombre,
      jornada, fase, colisiones: [],
    });
  }
  return partidos;
}

function numGrupos(n: number): number {
  if (n <= 4) return 1;
  if (n <= 8) return 2;
  if (n <= 12) return 3;
  return 4;
}

// ─── FUNCIÓN PRINCIPAL ────────────────────────────────────────────────────────
export function generarFixture(config: ConfigFixture): ResultadoFixture {
  const { torneoId, equipos, formato, fechaInicio, horaInicio, duracionMinutos, espacios } = config;
  const sched = new Scheduler(espacios, horaInicio, duracionMinutos);

  if (formato === 'liga') {
    const partidos = roundRobin(equipos, 'LIGA', torneoId, sched, fechaInicio);
    return { formato, grupos: [{ nombre: 'LIGA', equipos, partidos }], eliminatorias: [], todos: partidos };
  }

  if (formato === 'eliminacion_directa') {
    let actual = shuffle([...equipos]);
    let fecha = fechaInicio;
    let jornada = 1;
    const todos: PartidoFixture[] = [];

    while (actual.length > 1) {
      const fase = actual.length === 2 ? 'final' : actual.length <= 4 ? 'semis' : actual.length <= 8 ? 'cuartos' : 'eliminacion';
      const ronda = eliminacion(actual, fase, torneoId, sched, fecha, jornada);
      todos.push(...ronda);
      actual = ronda
        .filter(p => p.equipo_visitante_id !== -1)
        .map((p, i) => ({ id: -(i + jornada * 100), nombre: `Ganador ${p.equipo_local_nombre.split(' ')[0]} vs ${p.equipo_visitante_nombre.split(' ')[0]}` }));
      fecha = sumarDias(fecha, 7);
      jornada++;
    }
    return { formato, grupos: [], eliminatorias: todos, todos };
  }

  // grupos_eliminacion
  const ng = numGrupos(equipos.length);
  const letras = ['A','B','C','D'];
  const equiposMezclados = shuffle([...equipos]);
  const grupos: GrupoFixture[] = [];

  for (let i = 0; i < ng; i++) {
    const miembros = equiposMezclados.filter((_, idx) => idx % ng === i);
    const partidos = roundRobin(miembros, letras[i], torneoId, sched, fechaInicio);
    grupos.push({ nombre: letras[i], equipos: miembros, partidos });
  }

  const maxJornada = grupos.reduce((max, g) =>
    Math.max(max, ...g.partidos.map(p => p.jornada)), 0);

  const fechaSemis = sumarDias(fechaInicio, maxJornada * 7);
  const clasificados = grupos.flatMap(g =>
    g.equipos.slice(0, 2).map(e => ({ ...e }))
  );

  const semis = eliminacion(clasificados, 'semis', torneoId, sched, fechaSemis, maxJornada + 1);

  const fechaFinal = sumarDias(fechaSemis, 7);
  const schedFinal = new Scheduler(espacios, horaInicio, duracionMinutos);
  const finalistas = [
    { id: -901, nombre: 'Ganador Semi 1' },
    { id: -902, nombre: 'Ganador Semi 2' },
  ];
  const final = eliminacion(finalistas, 'final', torneoId, schedFinal, fechaFinal, maxJornada + 2);

  const eliminatorias = [...semis, ...final];
  const todos = [...grupos.flatMap(g => g.partidos), ...eliminatorias];

  return { formato, grupos, eliminatorias, todos };
}