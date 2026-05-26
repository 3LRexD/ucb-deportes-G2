import prisma from '../prisma';

export class EquiposService {
  async getEquipos(torneoId?: number) {
    return await prisma.equipo.findMany({
      where: torneoId ? { torneoId } : undefined,
      include: { jugadores: true, torneo: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createEquipo(data: { nombre: string; carrera: string; torneoId: number; delegadoId?: number; entrenadorId?: number }) {
    return await prisma.equipo.create({
      data,
      include: { jugadores: true },
    });
  }

  async addJugador(data: { equipoId: number; deportistaId: number; deportistaCi: string; deportistaNombre: string; numeroCamiseta?: string; posicion?: string }) {
    return await prisma.equipoJugador.create({
      data: {
        ...data,
        matriculaValidada: false,
      },
    });
  }

  async removeJugador(equipoId: number, deportistaCi: string) {
    return await prisma.equipoJugador.deleteMany({
      where: {
        equipoId,
        deportistaCi,
      },
    });
  }
}

export const equiposService = new EquiposService();
