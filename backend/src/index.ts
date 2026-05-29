import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import carrerasRoutes from './routes/carreras.routes';
import torneosRoutes  from './routes/torneos.routes';
import equiposRoutes  from './routes/equipos.routes';
import partidosRoutes from './routes/partidos.routes';
import { disciplinasRouter } from './routes/disciplinas.routes';
import { categoriasRouter } from './routes/categorias.routes';
import fixturesRoutes from './routes/fixrure.routes';
import sesionesRoutes   from './routes/sesiones.routes';
import asistenciaRoutes from './routes/asistencia.routes';


dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/carreras', carrerasRoutes);
app.use('/api/torneos',  torneosRoutes);
app.use('/api/equipos',  equiposRoutes);
app.use('/api/partidos', partidosRoutes);
app.use('/api/disciplinas', disciplinasRouter);
app.use('/api/categorias', categoriasRouter);
app.use('/api/fixtures',    fixturesRoutes);
app.use('/api/sesiones',    sesionesRoutes);
app.use('/api/asistencia',  asistenciaRoutes);
 
app.get('/', (_req, res) => {
  res.json({ message: 'API Grupo 2 – UCB Deportes ', status: 'ok', sprint: 1 });
});

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
 