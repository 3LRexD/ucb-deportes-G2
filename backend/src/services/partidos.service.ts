import prisma from '../prisma';

export class PartidosService {
  async getPartidos(torneoId?: number) {
    return await prisma.partido.findMany({
      where: torneoId ? { torneoId } : undefined,
      include: {
        equipoLocal:     true,
        equipoVisitante: true,
        espacio:         true,
        estadisticas:    true,
      },
      orderBy: [{ fecha: 'asc' }, { hora: 'asc' }],
    });
  }

  async registrarResultado(id: number, data: { golesLocal: number; golesVisitante: number; estado: string; estadisticas?: any[] }) {
    const { golesLocal, golesVisitante, estado, estadisticas } = data;

    // Actualizar partido
    const partido = await prisma.partido.update({
      where: { id },
      data:  { golesLocal, golesVisitante, estado },
    });

    // Guardar estadísticas (goles, tarjetas)
    if (estadisticas && estadisticas.length > 0) {
      await prisma.estadisticaPartido.deleteMany({ where: { partidoId: id } });
      await prisma.estadisticaPartido.createMany({ data: estadisticas.map((e: any) => ({ ...e, partidoId: id })) });
    }

    // Recalcular tabla si el partido está finalizado
    if (estado === 'finalizado') {
      await this.recalcularTabla(partido.torneoId, partido.equipoLocalId);
      await this.recalcularTabla(partido.torneoId, partido.equipoVisitanteId);
    }

    return partido;
  }

  private async recalcularTabla(torneoId: number, equipoId: number) {
    const partidos = await prisma.partido.findMany({
      where: {
        torneoId,
        estado: 'finalizado',
        OR: [{ equipoLocalId: equipoId }, { equipoVisitanteId: equipoId }],
      },
    });

    let pj = 0, pg = 0, pe = 0, pp = 0, gf = 0, gc = 0;

    for (const p of partidos) {
      pj++;
      const esLocal = p.equipoLocalId === equipoId;
      const golesPropios   = esLocal ? (p.golesLocal || 0)     : (p.golesVisitante || 0);
      const golesRivales   = esLocal ? (p.golesVisitante || 0)  : (p.golesLocal || 0);
      gf += golesPropios;
      gc += golesRivales;
      if (golesPropios > golesRivales) pg++;
      else if (golesPropios === golesRivales) pe++;
      else pp++;
    }

    await prisma.tablaPosiciones.upsert({
      where:  { torneoId_equipoId: { torneoId, equipoId } },
      create: { torneoId, equipoId, partidosJugados: pj, partidosGanados: pg, partidosEmpatados: pe, partidosPerdidos: pp, golesFavor: gf, golesContra: gc, diferenciaGoles: gf - gc, puntos: pg * 3 + pe },
      update: { partidosJugados: pj, partidosGanados: pg, partidosEmpatados: pe, partidosPerdidos: pp, golesFavor: gf, golesContra: gc, diferenciaGoles: gf - gc, puntos: pg * 3 + pe },
    });
  }
}

export const partidosService = new PartidosService();
