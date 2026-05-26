import { Router } from 'express';
import prisma from '../prisma';

const router = Router();

// GET /api/partidos?torneoId=1
router.get('/', async (req, res) => {
  try {
    const { torneoId } = req.query;
    const partidos = await prisma.partido.findMany({
      where: torneoId ? { torneoId: Number(torneoId) } : undefined,
      include: {
        equipoLocal:     true,
        equipoVisitante: true,
        espacio:         true,
        estadisticas:    true,
      },
      orderBy: [{ fecha: 'asc' }, { hora: 'asc' }],
    });
    res.json(partidos);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener partidos' });
  }
});

// PUT /api/partidos/:id — registrar resultado
router.put('/:id', async (req, res) => {
  try {
    const { golesLocal, golesVisitante, estado, estadisticas } = req.body;
    const id = Number(req.params.id);

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
      await recalcularTabla(partido.torneoId, partido.equipoLocalId);
      await recalcularTabla(partido.torneoId, partido.equipoVisitanteId);
    }

    res.json(partido);
  } catch (error) {
    res.status(500).json({ error: 'Error al registrar resultado' });
  }
});

// Función para recalcular tabla de posiciones
async function recalcularTabla(torneoId: number, equipoId: number) {
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
    const golesPropios   = esLocal ? p.golesLocal     : p.golesVisitante;
    const golesRivales   = esLocal ? p.golesVisitante  : p.golesLocal;
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

export default router;