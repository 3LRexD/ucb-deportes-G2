import type {
  Carrera,
  Torneo,
  Equipo,
  Delegado,
  JugadorEquipo,
  CrearEquipoPayload,
  AsignarDelegadoPayload,
  AgregarJugadorPayload,
} from '../types/equipos.types';

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3002/api';

// ─── Helper ───────────────────────────────────────────────────────────────────

async function http<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${url}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body?.error ?? `Error ${res.status}`);
  }

  // 204 No Content no tiene body
  if (res.status === 204) return undefined as T;

  return res.json();
}

// ─── Carreras (de la BD real) ─────────────────────────────────────────────────

export async function getCarreras(): Promise<Carrera[]> {
  return http<Carrera[]>('/carreras');
}

// ─── Torneos (API real) ───────────────────────────────────────────────────────

export async function getTorneos(): Promise<Torneo[]> {
  // 1. Guardamos la respuesta cruda del backend
  const respuesta = await http<any>('/torneos');
  
  // 2. Imprimimos en consola para ver la estructura real (revisa F12)
  console.log("Respuesta del backend (/torneos):", respuesta);

  // 3. Extraemos el arreglo. 
  // Si tu backend envía { data: [...] }, usamos respuesta.data
  // Si envía el arreglo directo, usamos respuesta
  const arregloTorneos = respuesta.data ? respuesta.data : respuesta; 

  // Si por alguna razón sigue sin ser un arreglo, evitamos que la página se rompa
  if (!Array.isArray(arregloTorneos)) {
    console.error("Error: El backend no devolvió un arreglo de torneos", arregloTorneos);
    return []; 
  }

  // 4. Ahora sí, mapeamos de forma segura
  return arregloTorneos.map((t: any) => ({
    id_torneo:         t.id_torneo,
    nombre:            t.nombre,
    disciplina_nombre: t.disciplina_nombre ?? '',
    tipo:              t.tipo,
    formato:           t.formato,
    categoria:         t.categoria_nombre ?? '',
    temporada:         t.temporada,
    fecha_inicio:      t.fecha_inicio,
    fecha_fin:         t.fecha_fin,
    estado:            t.estado,
  }));
}

// ─── Equipos ──────────────────────────────────────────────────────────────────

export async function getEquiposByTorneo(torneoId: number): Promise<Equipo[]> {
  const data = await http<any[]>(`/equipos?torneo_id=${torneoId}`);

  return data.map((e) => ({
    id_equipo:      e.id_equipo,
    nombre:         e.nombre,
    torneo_id:      e.torneo_id,
    carrera_id:     e.carrera_id,
    carrera_nombre: e.carrera_nombre,
    delegado: e.delegado_id
      ? {
          id_usuario:      e.delegado_id,
          nombre_completo: e.delegado_nombre,
          ci:              e.delegado_ci,
          email:           e.delegado_email,
        }
      : null,
    jugadores: (e.jugadores ?? []).map((j: any): JugadorEquipo => ({
      id_equipo_jugador: j.id_equipo_jugador,
      deportista_id:     j.deportista_id,
      deportista_ci:     j.deportista_ci,
      deportista_nombre: j.deportista_nombre,
      numero_camiseta:   j.numero_camiseta,
      posicion:          j.posicion,
      fecha_inscripcion: j.fecha_inscripcion,
      habilitado:        j.habilitado,
      matricula_validada: j.matricula_activa,
    })),
    created_at: e.created_at,
  }));
}

export async function crearEquipo(payload: CrearEquipoPayload): Promise<Equipo> {
  const data = await http<any>('/equipos', {
    method: 'POST',
    body: JSON.stringify({
      nombre:     payload.nombre,
      torneo_id:  payload.torneo_id,
      carrera_id: payload.carrera_id,
    }),
  });

  return {
    id_equipo:      data.id_equipo,
    nombre:         data.nombre,
    torneo_id:      data.torneo_id,
    carrera_id:     data.carrera_id,
    carrera_nombre: data.carrera_nombre ?? null,
    delegado:       null,
    jugadores:      [],
    created_at:     data.created_at,
  };
}

export async function eliminarEquipo(equipoId: number): Promise<void> {
  await http<void>(`/equipos/${equipoId}`, { method: 'DELETE' });
}

// ─── Delegado ─────────────────────────────────────────────────────────────────

export async function buscarUsuarioPorCI(ci: string): Promise<Delegado | null> {
  try {
    const data = await http<any>(`/equipos/buscar-usuario?ci=${ci}`);
    return {
      id_usuario:      data.id,
      nombre_completo: data.nombre_completo,
      ci:              data.ci,
      email:           data.email,
    };
  } catch (e: any) {
    if (e?.message?.includes('404') || e?.message?.includes('encontró')) return null;
    throw e;
  }
}

export async function asignarDelegado(
  equipoId: number,
  payload: AsignarDelegadoPayload
): Promise<void> {
  await http<void>(`/equipos/${equipoId}/delegado`, {
    method: 'PUT',
    body: JSON.stringify({ ci: payload.ci }),
  });
}

// ─── Jugadores ────────────────────────────────────────────────────────────────

export async function buscarDeportistaPorCI(ci: string): Promise<{
  ci: string;
  nombre: string;
  carrera: string;
  matricula_activa: boolean;
} | null> {
  try {
    const data = await http<any>(`/equipos/buscar-deportista?ci=${ci}`);
    return {
      ci:               data.ci,
      nombre:           data.nombre_completo,
      carrera:          data.carrera ?? '',
      matricula_activa: data.matricula_activa,
    };
  } catch (e: any) {
    if (e?.message?.includes('404') || e?.message?.includes('encontró')) return null;
    throw e;
  }
}

export async function agregarJugador(
  equipoId: number,
  payload: AgregarJugadorPayload
): Promise<JugadorEquipo> {
  const data = await http<any>(`/equipos/${equipoId}/jugadores`, {
    method: 'POST',
    body: JSON.stringify({ ci: payload.ci }),
  });

  return {
    id_equipo_jugador: data.id ?? 0,
    deportista_id:     data.deportista?.id ?? 0,
    deportista_ci:     data.deportista?.ci ?? payload.ci,
    deportista_nombre: data.deportista?.nombre_completo ?? '',
    numero_camiseta:   null,
    posicion:          null,
    fecha_inscripcion: new Date().toISOString().split('T')[0],
    habilitado:        true,
    matricula_validada: data.deportista?.matricula_activa ?? false,
  };
}

export async function quitarJugador(
  equipoId: number,
  jugadorId: number
): Promise<void> {
  await http<void>(`/equipos/${equipoId}/jugadores/${jugadorId}`, {
    method: 'DELETE',
  });
}

// ─── Vista delegado ───────────────────────────────────────────────────────────

export async function loginDelegado(
  ci: string,
  _password: string // TODO: auth real en Sprint 4
): Promise<{ delegado: Delegado; equipo: Equipo } | null> {
  try {
    const equipo = await http<any>(`/equipos/mi-equipo?ci=${ci}`);

    const delegado: Delegado = {
      id_usuario:      equipo.delegado_id,
      nombre_completo: equipo.delegado_nombre,
      ci:              equipo.delegado_ci,
      email:           equipo.delegado_email,
    };

    return {
      delegado,
      equipo: {
        id_equipo:      equipo.id_equipo,
        nombre:         equipo.nombre,
        torneo_id:      equipo.torneo_id,
        carrera_id:     equipo.carrera_id,
        carrera_nombre: equipo.carrera_nombre,
        delegado,
        jugadores: (equipo.jugadores ?? []).map((j: any): JugadorEquipo => ({
          id_equipo_jugador: j.id_equipo_jugador,
          deportista_id:     j.deportista_id,
          deportista_ci:     j.deportista_ci,
          deportista_nombre: j.deportista_nombre,
          numero_camiseta:   j.numero_camiseta,
          posicion:          j.posicion,
          fecha_inscripcion: j.fecha_inscripcion,
          habilitado:        j.habilitado,
          matricula_validada: j.matricula_activa,
        })),
        created_at: equipo.created_at,
      },
    };
  } catch (e: any) {
    if (e?.message?.includes('404') || e?.message?.includes('encontró')) return null;
    throw e;
  }
}
