import prisma from '../prisma';

export class FixturesService {
  async getFixtures(torneoId?: number) {
    return await prisma.fixture.findMany({
      where: torneoId ? { torneoId } : undefined,
      orderBy: { generadoEn: 'desc' },
    });
  }

  async generarFixture(torneoId: number, partidos: any[], formato: string) {
    // Eliminar partidos anteriores del torneo si existían
    await prisma.partido.deleteMany({ where: { torneoId } });
    
    const partidosReales = partidos.filter(
      (p: any) => p.equipo_local_id > 0 && p.equipo_visitante_id > 0
    );
    
    // Guardar los partidos generados
    await prisma.partido.createMany({
      data: partidosReales.map((p: any) => ({
        torneoId:          torneoId,
        equipoLocalId:     p.equipo_local_id,
        equipoVisitanteId: p.equipo_visitante_id,
        espacioId:         p.espacio_id ?? null,
        fecha:             new Date(p.fecha),
        hora:              p.hora,
        jornada:           p.jornada,
        fase:              p.fase ?? 'grupos',
        grupo:             p.grupo ?? null,
        estado:            'programado',
      })),
    });

    // Registrar el fixture
    const fixture = await prisma.fixture.create({
      data: {
        torneoId:      torneoId,
        formato,
        totalPartidos: partidosReales.length,
      },
    });

    return { fixture, totalPartidos: partidosReales.length };
  }
}

export const fixturesService = new FixturesService();
