// data/mockDataSprint3.ts
// Datos mock NUEVOS del Sprint 3 — importar junto con mockData.ts
// TODO: reemplazar con llamadas reales a la API

import type { Categoria, Espacio, Sesion, RegistroAsistencia } from '@/types';

export const mockCategorias: Categoria[] = [
  { id: 1, nombre: 'Sub-13',  edad_min: 10, edad_max: 13, descripcion: 'Categoría infantil', activo: true },
  { id: 2, nombre: 'Sub-15',  edad_min: 14, edad_max: 15, descripcion: 'Categoría pre-juvenil', activo: true },
  { id: 3, nombre: 'Juvenil', edad_min: 16, edad_max: 17, descripcion: 'Categoría juvenil', activo: true },
  { id: 4, nombre: 'Mayor',   edad_min: 18, edad_max: 99, descripcion: 'Categoría adultos', activo: true },
  { id: 5, nombre: 'Veterano',edad_min: 35, edad_max: 99, descripcion: 'Categoría veteranos', activo: false },
];

export const mockEspacios: Espacio[] = [
  {
    id: 1,
    nombre: 'Coliseo UCB',
    ubicacion: 'Campus principal, pabellón deportivo',
    horario_apertura: '07:00',
    horario_cierre: '22:00',
    activo: true,
  },
  {
    id: 2,
    nombre: 'Cancha Arquitectura',
    ubicacion: 'Facultad de Arquitectura, planta baja',
    horario_apertura: '08:00',
    horario_cierre: '20:00',
    activo: true,
  },
];

export const mockSesiones: Sesion[] = [
  {
    id: 1,
    equipo_id: 1,
    equipo_nombre: 'Sistemas FC',
    disciplina_id: 1,
    disciplina_nombre: 'Fútsal',
    entrenador_id: 10,
    entrenador_nombre: 'Prof. García',
    espacio_id: 1,
    espacio_nombre: 'Coliseo UCB',
    fecha: '2026-05-17',
    hora_inicio: '08:00',
    hora_fin: '10:00',
    observaciones: 'Entrenamiento previo al partido',
  },
  {
    id: 2,
    equipo_id: 2,
    equipo_nombre: 'Derecho United',
    disciplina_id: 1,
    disciplina_nombre: 'Fútsal',
    entrenador_id: 11,
    entrenador_nombre: 'Prof. Quispe',
    espacio_id: 2,
    espacio_nombre: 'Cancha Arquitectura',
    fecha: '2026-05-17',
    hora_inicio: '10:00',
    hora_fin: '12:00',
  },
  {
    id: 3,
    equipo_id: 1,
    equipo_nombre: 'Sistemas FC',
    disciplina_id: 1,
    disciplina_nombre: 'Fútsal',
    entrenador_id: 10,
    entrenador_nombre: 'Prof. García',
    espacio_id: 1,
    espacio_nombre: 'Coliseo UCB',
    fecha: '2026-05-19',
    hora_inicio: '09:00',
    hora_fin: '11:00',
  },
];

export const mockAsistencias: RegistroAsistencia[] = [
  { sesion_id: 1, deportista_ci: '1234567', deportista_nombre: 'Carlos Pérez',  presente: true },
  { sesion_id: 1, deportista_ci: '7654321', deportista_nombre: 'Ana Gómez',     presente: true },
  { sesion_id: 1, deportista_ci: '1122334', deportista_nombre: 'María Flores',  presente: false, observacion: 'Justificada' },
];

// Equipos extra para demos de fixture con más equipos
export const mockEquiposExtra = [
  { id: 3, nombre: 'Medicina Stars',      carrera: 'Medicina',                  delegado_id: 4, delegado_nombre: 'Ana Ríos',      torneo_id: 2, jugadores: [] },
  { id: 4, nombre: 'Arquitectura FC',     carrera: 'Arquitectura',              delegado_id: 5, delegado_nombre: 'Luis Vera',      torneo_id: 2, jugadores: [] },
  { id: 5, nombre: 'Economía United',     carrera: 'Economía',                  delegado_id: 6, delegado_nombre: 'Sara Copa',      torneo_id: 2, jugadores: [] },
  { id: 6, nombre: 'Administración FC',   carrera: 'Administración de Empresas',delegado_id: 7, delegado_nombre: 'Marco Flores',   torneo_id: 2, jugadores: [] },
  { id: 7, nombre: 'Civil Engineering',   carrera: 'Ingeniería Civil',          delegado_id: 8, delegado_nombre: 'Paola Ramos',   torneo_id: 2, jugadores: [] },
  { id: 8, nombre: 'Psicología FC',       carrera: 'Psicología',                delegado_id: 9, delegado_nombre: 'Diego Chávez',  torneo_id: 2, jugadores: [] },
];