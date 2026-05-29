import type { Carrera, Torneo, Equipo, Delegado } from "../types/equipos.types";

// ─── Carreras UCB (fijas, vienen de la BD) ───────────────────────────────────
export const MOCK_CARRERAS: Carrera[] = [
  { id_carrera: 1, nombre: "Ingeniería de Sistemas", facultad: "Ciencias Exactas e Ingeniería", activo: true },
  { id_carrera: 2, nombre: "Ingeniería Civil", facultad: "Ciencias Exactas e Ingeniería", activo: true },
  { id_carrera: 3, nombre: "Ingeniería Industrial", facultad: "Ciencias Exactas e Ingeniería", activo: true },
  { id_carrera: 4, nombre: "Arquitectura", facultad: "Arquitectura y Diseño", activo: true },
  { id_carrera: 5, nombre: "Diseño Gráfico", facultad: "Arquitectura y Diseño", activo: true },
  { id_carrera: 6, nombre: "Derecho", facultad: "Ciencias Jurídicas y Políticas", activo: true },
  { id_carrera: 7, nombre: "Administración de Empresas", facultad: "Ciencias Económicas", activo: true },
  { id_carrera: 8, nombre: "Contaduría Pública", facultad: "Ciencias Económicas", activo: true },
  { id_carrera: 9, nombre: "Medicina", facultad: "Ciencias de la Salud", activo: true },
  { id_carrera: 10, nombre: "Enfermería", facultad: "Ciencias de la Salud", activo: true },
  { id_carrera: 11, nombre: "Psicología", facultad: "Ciencias Humanas y de la Educación", activo: true },
  { id_carrera: 12, nombre: "Comunicación Social", facultad: "Ciencias Humanas y de la Educación", activo: true },
];

// ─── Torneos de ejemplo ───────────────────────────────────────────────────────
export const MOCK_TORNEOS: Torneo[] = [
  {
    id_torneo: 1,
    nombre: "Intercarreras 2026",
    disciplina_nombre: "Fútsal",
    tipo: "intercarreras",
    formato: "grupos_eliminacion",
    categoria: "mayor",
    temporada: "2026",
    fecha_inicio: "2026-05-01",
    fecha_fin: "2026-06-30",
    estado: "planificado",
  },
  {
    id_torneo: 2,
    nombre: "Torneo Interno Básquet",
    disciplina_nombre: "Básquetbol",
    tipo: "amistoso",
    formato: "liga",
    categoria: "mayor",
    temporada: "2026",
    fecha_inicio: "2026-05-15",
    fecha_fin: "2026-07-15",
    estado: "planificado",
  },
];

// ─── Delegados disponibles ────────────────────────────────────────────────────
export const MOCK_DELEGADOS: Delegado[] = [
  { id_usuario: 10, nombre_completo: "Carlos Mendoza Quispe", ci: "8123456", email: "carlos.mendoza@ucb.edu.bo" },
  { id_usuario: 11, nombre_completo: "Ana Flores Rojas", ci: "7654321", email: "ana.flores@ucb.edu.bo" },
  { id_usuario: 12, nombre_completo: "Miguel Torrez Lima", ci: "9234567", email: "miguel.torrez@ucb.edu.bo" },
];

// ─── Equipos de ejemplo ───────────────────────────────────────────────────────
export const MOCK_EQUIPOS: Equipo[] = [
  {
    id_equipo: 1,
    nombre: "Sistemas FC",
    torneo_id: 1,
    carrera_id: 1,
    carrera_nombre: "Ingeniería de Sistemas",
    delegado: { id_usuario: 10, nombre_completo: "Carlos Mendoza Quispe", ci: "8123456", email: "carlos.mendoza@ucb.edu.bo" },
    jugadores: [
      { id_equipo_jugador: 1, deportista_id: 101, deportista_ci: "12345678", deportista_nombre: "Juan Pablo Ramos", numero_camiseta: 10, posicion: "Delantero", fecha_inscripcion: "2026-05-01", habilitado: true, matricula_validada: true },
      { id_equipo_jugador: 2, deportista_id: 102, deportista_ci: "23456789", deportista_nombre: "Pedro Huanca Mamani", numero_camiseta: 1, posicion: "Portero", fecha_inscripcion: "2026-05-01", habilitado: true, matricula_validada: true },
    ],
    created_at: "2026-05-01T10:00:00",
  },
  {
    id_equipo: 2,
    nombre: "Arquitectura United",
    torneo_id: 1,
    carrera_id: 4,
    carrera_nombre: "Arquitectura",
    delegado: null,
    jugadores: [],
    created_at: "2026-05-02T10:00:00",
  },
];

// ─── Simula buscar deportista por CI (mock de API académica) ─────────────────
export const MOCK_DEPORTISTAS_LOOKUP: Record<string, { ci: string; nombre: string; carrera: string; matricula_activa: boolean }> = {
  "11111111": { ci: "11111111", nombre: "Luis Alberto Vega", carrera: "Ingeniería de Sistemas", matricula_activa: true },
  "22222222": { ci: "22222222", nombre: "Sofía Ríos Condori", carrera: "Medicina", matricula_activa: true },
  "33333333": { ci: "33333333", nombre: "Roberto Chávez", carrera: "Derecho", matricula_activa: false },
  "44444444": { ci: "44444444", nombre: "María Fernanda Loza", carrera: "Administración de Empresas", matricula_activa: true },
};

// ─── Simula buscar usuario delegado por CI ────────────────────────────────────
export const MOCK_USUARIOS_LOOKUP: Record<string, Delegado> = {
  "8123456": { id_usuario: 10, nombre_completo: "Carlos Mendoza Quispe", ci: "8123456", email: "carlos.mendoza@ucb.edu.bo" },
  "7654321": { id_usuario: 11, nombre_completo: "Ana Flores Rojas", ci: "7654321", email: "ana.flores@ucb.edu.bo" },
  "9234567": { id_usuario: 12, nombre_completo: "Miguel Torrez Lima", ci: "9234567", email: "miguel.torrez@ucb.edu.bo" },
};

// ─── Usuarios mock para layouts ──────────────────────────────────────────────
export const mockUsuarioAdmin = {
  id: 1,
  nombre: "Admin UCB",
  rol: "admin" as const,
};

export const mockUsuarioDelegado = {
  id: 2,
  nombre: "Juan Mamani",
  rol: "delegado" as const,
  carrera: "Ingeniería de Sistemas",
};