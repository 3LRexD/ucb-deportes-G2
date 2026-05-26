import prisma from '../prisma';

export class CarrerasService {
  async getActiveCarreras() {
    return await prisma.carrera.findMany({
      where:   { activo: true },
      orderBy: { nombre: 'asc' },
    });
  }
}

export const carrerasService = new CarrerasService();
