import prisma from '../prisma';

export class TorneosService {
  async getTorneos() {
    return await prisma.torneo.findMany({
      include: {
        disciplina: true,
        categoria: true,
        equipos: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getTorneoById(id: number) {
    return await prisma.torneo.findUnique({
      where: { id },
      include: {
        disciplina: true,
        categoria: true,
        equipos: { include: { jugadores: true } },
        partidos: true,
      },
    });
  }

  async createTorneo(data: { nombre: string; disciplinaId: number; categoriaId: number; tipo: string; formato: string; temporada?: string; fechaInicio: Date; fechaFin: Date; estado?: string; reglas?: string }) {
    return await prisma.torneo.create({
      data: {
        ...data,
        estado: data.estado ?? 'planificado',
      },
      include: { disciplina: true, categoria: true },
    });
  }

  async updateTorneo(id: number, data: { nombre?: string; disciplinaId?: number; categoriaId?: number; tipo?: string; formato?: string; temporada?: string; fechaInicio?: Date; fechaFin?: Date; estado?: string; reglas?: string }) {
    return await prisma.torneo.update({
      where: { id },
      data,
      include: { disciplina: true, categoria: true },
    });
  }

  async updateEstado(id: number, estado: string) {
    return await prisma.torneo.update({
      where: { id },
      data:  { estado },
    });
  }
}

export const torneosService = new TorneosService();
