import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import carrerasRoutes from './routes/carreras.routes';
import torneosRoutes    from './routes/torneos.routes';
import categoriasRoutes from './routes/categorias.routes';
import equiposRoutes    from './routes/equipos.routes';
import partidosRoutes   from './routes/partidos.routes';
import fixturesRoutes from './routes/fixtures.routes';
import espaciosRoutes from './routes/espacios.routes';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/carreras', carrerasRoutes);
app.use('/api/torneos',    torneosRoutes);
app.use('/api/categorias', categoriasRoutes);
app.use('/api/fixtures', fixturesRoutes);
app.use('/api/equipos',    equiposRoutes);
app.use('/api/partidos',   partidosRoutes);
app.use('/api/espacios', espaciosRoutes);
app.get('/', (_req, res) => {
  res.json({ message: 'API Grupo 2 - UCB Deportes 🏆', status: 'ok' });
});

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});