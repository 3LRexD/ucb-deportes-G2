import { Request, Response } from 'express';
import * as equiposService from '../services/equipos.service';

export async function getEquipos(req: Request, res: Response): Promise<void> {
  const torneoId = Number(req.query.torneo_id);
  if (!torneoId) {
    res.status(400).json({ error: 'Se requiere torneo_id como query param' });
    return;
  }
  try {
    const equipos = await equiposService.getEquiposByTorneo(torneoId);
    res.json(equipos);
  } catch (error) {
    console.error('[equipos] getEquipos:', error);
    res.status(500).json({ error: 'Error al obtener equipos' });
  }
}

export async function crearEquipo(req: Request, res: Response): Promise<void> {
  const { nombre, torneo_id, carrera_id } = req.body;
  if (!nombre || !torneo_id) {
    res.status(400).json({ error: 'nombre y torneo_id son requeridos' });
    return;
  }
  try {
    const equipo = await equiposService.crearEquipo(
      nombre,
      Number(torneo_id),
      carrera_id ? Number(carrera_id) : null
    );
    res.status(201).json(equipo);
  } catch (error: any) {
    console.error('[equipos] crearEquipo:', error);
    const esConflicto = error?.message?.includes('Ya existe');
    res.status(esConflicto ? 409 : 500).json({ error: error.message ?? 'Error al crear equipo' });
  }
}

export async function eliminarEquipo(req: Request, res: Response): Promise<void> {
  const id = Number(req.params.id);
  try {
    await equiposService.eliminarEquipo(id);
    res.status(204).send();
  } catch (error) {
    console.error('[equipos] eliminarEquipo:', error);
    res.status(500).json({ error: 'Error al eliminar equipo' });
  }
}

export async function buscarUsuario(req: Request, res: Response): Promise<void> {
  const ci = String(req.query.ci ?? '').trim();
  if (!ci) {
    res.status(400).json({ error: 'Se requiere ci como query param' });
    return;
  }
  try {
    const usuario = await equiposService.buscarUsuarioPorCI(ci);
    if (!usuario) {
      res.status(404).json({ error: 'No se encontró un usuario con ese CI' });
      return;
    }
    res.json(usuario);
  } catch (error) {
    console.error('[equipos] buscarUsuario:', error);
    res.status(500).json({ error: 'Error al buscar usuario' });
  }
}

export async function asignarDelegado(req: Request, res: Response): Promise<void> {
  const equipoId = Number(req.params.id);
  const { ci } = req.body;
  if (!ci) {
    res.status(400).json({ error: 'ci es requerido' });
    return;
  }
  try {
    const usuario = await equiposService.buscarUsuarioPorCI(ci);
    if (!usuario) {
      res.status(404).json({ error: 'No se encontró un usuario con ese CI' });
      return;
    }
    await equiposService.asignarDelegado(equipoId, usuario.id);
    res.json({ message: 'Delegado asignado correctamente', delegado: usuario });
  } catch (error) {
    console.error('[equipos] asignarDelegado:', error);
    res.status(500).json({ error: 'Error al asignar delegado' });
  }
}

export async function buscarDeportista(req: Request, res: Response): Promise<void> {
  const ci = String(req.query.ci ?? '').trim();
  if (!ci) {
    res.status(400).json({ error: 'Se requiere ci como query param' });
    return;
  }
  try {
    const deportista = await equiposService.buscarDeportistaPorCI(ci);
    if (!deportista) {
      res.status(404).json({ error: 'No se encontró un deportista con ese CI' });
      return;
    }
    res.json(deportista);
  } catch (error) {
    console.error('[equipos] buscarDeportista:', error);
    res.status(500).json({ error: 'Error al buscar deportista' });
  }
}

export async function agregarJugador(req: Request, res: Response): Promise<void> {
  const equipoId = Number(req.params.id);
  const { ci } = req.body;
  if (!ci) {
    res.status(400).json({ error: 'ci es requerido' });
    return;
  }
  try {
    const deportista = await equiposService.buscarDeportistaPorCI(ci);
    if (!deportista) {
      res.status(404).json({ error: 'No se encontró un deportista con ese CI' });
      return;
    }
    await equiposService.agregarJugador(equipoId, deportista);
    res.status(201).json({ message: 'Jugador agregado correctamente', deportista });
  } catch (error: any) {
    console.error('[equipos] agregarJugador:', error);
    const esConflicto = error?.message?.includes('ya está inscrito');
    res.status(esConflicto ? 409 : 500).json({ error: error.message ?? 'Error al agregar jugador' });
  }
}

export async function quitarJugador(req: Request, res: Response): Promise<void> {
  const equipoId = Number(req.params.id);
  const jugadorId = Number(req.params.jugadorId);
  try {
    await equiposService.quitarJugador(equipoId, jugadorId);
    res.status(204).send();
  } catch (error) {
    console.error('[equipos] quitarJugador:', error);
    res.status(500).json({ error: 'Error al quitar jugador' });
  }
}

export async function getMiEquipo(req: Request, res: Response): Promise<void> {
  const ci = String(req.query.ci ?? '').trim();
  if (!ci) {
    res.status(400).json({ error: 'Se requiere ci como query param' });
    return;
  }
  try {
    const equipo = await equiposService.getEquipoByDelegadoCI(ci);
    if (!equipo) {
      res.status(404).json({ error: 'No se encontró un equipo asignado a este delegado' });
      return;
    }
    res.json(equipo);
  } catch (error) {
    console.error('[equipos] getMiEquipo:', error);
    res.status(500).json({ error: 'Error al obtener el equipo del delegado' });
  }
}
