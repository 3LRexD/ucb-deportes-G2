import { Router } from 'express';
import {
  getEquipos,
  crearEquipo,
  eliminarEquipo,
  buscarUsuario,
  asignarDelegado,
  buscarDeportista,
  agregarJugador,
  quitarJugador,
  getMiEquipo,
} from '../controllers/equipos.controller';

const router = Router();

// ── Equipos ───────────────────────────────────────────
// GET    /api/equipos?torneo_id=1
// POST   /api/equipos
// DELETE /api/equipos/:id
router.get('/',      getEquipos);
router.post('/',     crearEquipo);
router.delete('/:id', eliminarEquipo);

// ── Búsquedas (antes de /:id para no colisionar) ──────
// GET /api/equipos/buscar-usuario?ci=123
// GET /api/equipos/buscar-deportista?ci=123
// GET /api/equipos/mi-equipo?ci=123
router.get('/buscar-usuario',     buscarUsuario);
router.get('/buscar-deportista',  buscarDeportista);
router.get('/mi-equipo',          getMiEquipo);

// ── Delegado ──────────────────────────────────────────
// PUT /api/equipos/:id/delegado
router.put('/:id/delegado', asignarDelegado);

// ── Jugadores ─────────────────────────────────────────
// POST   /api/equipos/:id/jugadores
// DELETE /api/equipos/:id/jugadores/:jugadorId
router.post('/:id/jugadores',                agregarJugador);
router.delete('/:id/jugadores/:jugadorId',   quitarJugador);

export default router;
