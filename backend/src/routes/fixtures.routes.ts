import { Router } from 'express';
import prisma from '../prisma';

const router = Router();



// GET /api/fixtures?torneoId=1
router.get('/', async (req, res) => {
  try {
    const { torneoId } = req.query;
    const fixtures = await prisma.fixture.findMany({
      where: torneoId ? { torneoId: Number(torneoId) } : undefined,
      orderBy: { generadoEn: 'desc' },
    });
    res.json(fixtures);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener fixtures' });
  }
});


// POST /api/fixtures/generar
router.post('/generar', async (req, res) => {
  try {
    const { torneoId, partidos, formato } = req.body;
    console.log('Partidos recibidos:', JSON.stringify(partidos[0], null, 2));
    // Eliminar partidos anteriores del torneo si existían
    await prisma.partido.deleteMany({ where: { torneoId: Number(torneoId) } });
    const partidosReales = partidos.filter(
      (p: any) => p.equipo_local_id > 0 && p.equipo_visitante_id > 0
    );
    // Guardar los partidos generados
    await prisma.partido.createMany({
      data: partidosReales.map((p: any) => ({
        torneoId:          Number(torneoId),
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
        torneoId:      Number(torneoId),
        formato,
        totalPartidos: partidosReales.length,
      },
    });

    res.status(201).json({ fixture, totalPartidos: partidosReales.length });
  } catch (error) {
    console.error('ERROR generar fixture:', error);
    res.status(500).json({ error: 'Error al generar fixture' });
  }
});

export default router;