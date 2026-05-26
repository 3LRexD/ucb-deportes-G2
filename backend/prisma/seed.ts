import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  // Disciplinas
  await prisma.disciplina.createMany({
    data: [
      { nombre: 'Fútsal',     descripcion: 'Fútbol sala 5 vs 5',            orden: 1 },
      { nombre: 'Básquetbol', descripcion: 'Básquetbol 5 vs 5',             orden: 2 },
      { nombre: 'Voleibol',   descripcion: 'Voleibol 6 vs 6',               orden: 3 },
      { nombre: 'Ajedrez',    descripcion: 'Ajedrez individual por equipos', orden: 4 },
    ],
    skipDuplicates: true,
  });

  // Categorias
  await prisma.categoria.createMany({
    data: [
      { nombre: 'Sub-13',  edadMin: 10, edadMax: 13, descripcion: 'Categoría infantil' },
      { nombre: 'Sub-15',  edadMin: 14, edadMax: 15, descripcion: 'Categoría pre-juvenil' },
      { nombre: 'Juvenil', edadMin: 16, edadMax: 17, descripcion: 'Categoría juvenil' },
      { nombre: 'Mayor',   edadMin: 18, edadMax: 99, descripcion: 'Sin límite de edad superior' },
    ],
    skipDuplicates: true,
  });

  // Carreras UCB
  await prisma.carrera.createMany({
    data: [
      { nombre: 'Administración de Empresas',              facultad: 'Ciencias Económicas y Financieras' },
      { nombre: 'Administración Turística',                facultad: 'Ciencias Económicas y Financieras' },
      { nombre: 'Contaduría Pública',                      facultad: 'Ciencias Económicas y Financieras' },
      { nombre: 'Economía',                                facultad: 'Ciencias Económicas y Financieras' },
      { nombre: 'Economía e Inteligencia de Negocios',     facultad: 'Ciencias Económicas y Financieras' },
      { nombre: 'Ingeniería Comercial',                    facultad: 'Ciencias Económicas y Financieras' },
      { nombre: 'Ingeniería en Innovación Empresarial',    facultad: 'Ciencias Económicas y Financieras' },
      { nombre: 'Marketing y Medios Digitales',            facultad: 'Ciencias Económicas y Financieras' },
      { nombre: 'Ingeniería Ambiental',                    facultad: 'Ingeniería' },
      { nombre: 'Ingeniería Biomédica',                    facultad: 'Ingeniería' },
      { nombre: 'Ingeniería Bioquímica y de Bioprocesos',  facultad: 'Ingeniería' },
      { nombre: 'Ingeniería Civil',                        facultad: 'Ingeniería' },
      { nombre: 'Ingeniería de Sistemas',                  facultad: 'Ingeniería' },
      { nombre: 'Ingeniería en Logística de Cadenas de Suministro', facultad: 'Ingeniería' },
      { nombre: 'Ingeniería en Multimedia e Interactividad Digital', facultad: 'Ingeniería' },
      { nombre: 'Ingeniería Industrial',                   facultad: 'Ingeniería' },
      { nombre: 'Ingeniería Química',                      facultad: 'Ingeniería' },
      { nombre: 'Ingeniería Mecatrónica',                  facultad: 'Ingeniería' },
      { nombre: 'Ingeniería en Telecomunicaciones',        facultad: 'Ingeniería' },
      { nombre: 'Comunicación Social',                     facultad: 'Ciencias Sociales y Humanas' },
      { nombre: 'Comunicación Digital Multimedia',         facultad: 'Ciencias Sociales y Humanas' },
      { nombre: 'Psicología',                              facultad: 'Ciencias Sociales y Humanas' },
      { nombre: 'Psicopedagogía',                          facultad: 'Ciencias Sociales y Humanas' },
      { nombre: 'Ciencias Políticas y Relaciones Internacionales', facultad: 'Derecho y Ciencias Políticas' },
      { nombre: 'Derecho',                                 facultad: 'Derecho y Ciencias Políticas' },
      { nombre: 'Arquitectura',                            facultad: 'Arquitectura y Diseño' },
      { nombre: 'Diseño Digital',                          facultad: 'Arquitectura y Diseño' },
      { nombre: 'Diseño Gráfico y Comunicación Visual',    facultad: 'Arquitectura y Diseño' },
      { nombre: 'Medicina',                                facultad: 'Salud' },
      { nombre: 'Nutrición Clínica y Dietética',           facultad: 'Salud' },
      { nombre: 'Antropología',                            facultad: 'Salud' },
      { nombre: 'Filosofía y Letras',                      facultad: 'Salud' },
    ],
    skipDuplicates: true,
  });

  await prisma.espacio.createMany({
    data: [
      { nombre: 'Coliseo UCB',         ubicacion: 'Campus principal, pabellón deportivo',  horarioApertura: '07:00', horarioCierre: '22:00' },
      { nombre: 'Cancha Arquitectura', ubicacion: 'Facultad de Arquitectura, planta baja', horarioApertura: '08:00', horarioCierre: '20:00' },
    ],
    skipDuplicates: true,
  });

  console.log('Seed completado');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

  