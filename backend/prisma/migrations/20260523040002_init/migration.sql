-- CreateTable
CREATE TABLE "disciplinas" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(50) NOT NULL,
    "descripcion" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "orden" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "disciplinas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "categorias" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(50) NOT NULL,
    "edad_min" INTEGER NOT NULL,
    "edad_max" INTEGER NOT NULL,
    "descripcion" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "categorias_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "espacios" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "ubicacion" TEXT,
    "capacidad" INTEGER,
    "horario_apertura" VARCHAR(5) NOT NULL DEFAULT '07:00',
    "horario_cierre" VARCHAR(5) NOT NULL DEFAULT '22:00',
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "espacios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "torneos" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(150) NOT NULL,
    "disciplina_id" INTEGER NOT NULL,
    "categoria_id" INTEGER NOT NULL,
    "tipo" VARCHAR(30) NOT NULL DEFAULT 'intercarreras',
    "formato" VARCHAR(30) NOT NULL DEFAULT 'liga',
    "temporada" VARCHAR(20) NOT NULL,
    "fecha_inicio" DATE NOT NULL,
    "fecha_fin" DATE NOT NULL,
    "estado" VARCHAR(20) NOT NULL DEFAULT 'planificado',
    "reglas" TEXT,
    "creado_por_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "torneos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "equipos" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "carrera" VARCHAR(100),
    "torneo_id" INTEGER NOT NULL,
    "entrenador_id" INTEGER,
    "delegado_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "equipos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "equipo_jugadores" (
    "id" SERIAL NOT NULL,
    "equipo_id" INTEGER NOT NULL,
    "deportista_id" INTEGER NOT NULL,
    "deportista_ci" VARCHAR(20) NOT NULL,
    "deportista_nombre" VARCHAR(150) NOT NULL,
    "numero_camiseta" INTEGER,
    "posicion" VARCHAR(50),
    "fecha_inscripcion" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_baja" DATE,
    "habilitado" BOOLEAN NOT NULL DEFAULT true,
    "matricula_validada" BOOLEAN NOT NULL DEFAULT false,
    "fecha_validacion" TIMESTAMP(3),

    CONSTRAINT "equipo_jugadores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "partidos" (
    "id" SERIAL NOT NULL,
    "torneo_id" INTEGER NOT NULL,
    "equipo_local_id" INTEGER NOT NULL,
    "equipo_visitante_id" INTEGER NOT NULL,
    "espacio_id" INTEGER,
    "fecha" DATE NOT NULL,
    "hora" VARCHAR(5) NOT NULL,
    "jornada" INTEGER NOT NULL DEFAULT 1,
    "fase" VARCHAR(20) NOT NULL DEFAULT 'grupos',
    "grupo" VARCHAR(5),
    "goles_local" INTEGER NOT NULL DEFAULT 0,
    "goles_visitante" INTEGER NOT NULL DEFAULT 0,
    "estado" VARCHAR(20) NOT NULL DEFAULT 'programado',
    "acta_url" TEXT,
    "anotador_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "partidos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "estadisticas_partido" (
    "id" SERIAL NOT NULL,
    "partido_id" INTEGER NOT NULL,
    "equipo_id" INTEGER NOT NULL,
    "deportista_id" INTEGER NOT NULL,
    "deportista_ci" VARCHAR(20) NOT NULL,
    "deportista_nombre" VARCHAR(150) NOT NULL,
    "tipo" VARCHAR(30) NOT NULL,
    "minuto" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "estadisticas_partido_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fixtures" (
    "id" SERIAL NOT NULL,
    "torneo_id" INTEGER NOT NULL,
    "generado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "formato" VARCHAR(30) NOT NULL,
    "total_partidos" INTEGER NOT NULL DEFAULT 0,
    "observaciones" TEXT,

    CONSTRAINT "fixtures_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tabla_posiciones" (
    "id" SERIAL NOT NULL,
    "torneo_id" INTEGER NOT NULL,
    "equipo_id" INTEGER NOT NULL,
    "partidos_jugados" INTEGER NOT NULL DEFAULT 0,
    "partidos_ganados" INTEGER NOT NULL DEFAULT 0,
    "partidos_empatados" INTEGER NOT NULL DEFAULT 0,
    "partidos_perdidos" INTEGER NOT NULL DEFAULT 0,
    "goles_favor" INTEGER NOT NULL DEFAULT 0,
    "goles_contra" INTEGER NOT NULL DEFAULT 0,
    "diferencia_goles" INTEGER NOT NULL DEFAULT 0,
    "puntos" INTEGER NOT NULL DEFAULT 0,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tabla_posiciones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sesiones" (
    "id" SERIAL NOT NULL,
    "equipo_id" INTEGER NOT NULL,
    "espacio_id" INTEGER,
    "disciplina_id" INTEGER NOT NULL,
    "entrenador_id" INTEGER,
    "fecha" DATE NOT NULL,
    "hora_inicio" VARCHAR(5) NOT NULL,
    "hora_fin" VARCHAR(5) NOT NULL,
    "observaciones" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sesiones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "asistencia" (
    "id" SERIAL NOT NULL,
    "sesion_id" INTEGER NOT NULL,
    "deportista_id" INTEGER NOT NULL,
    "deportista_ci" VARCHAR(20) NOT NULL,
    "deportista_nombre" VARCHAR(150) NOT NULL,
    "presente" BOOLEAN NOT NULL DEFAULT true,
    "observacion" TEXT,
    "registrado_por_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "asistencia_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "disciplinas_nombre_key" ON "disciplinas"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "categorias_nombre_key" ON "categorias"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "equipos_torneo_id_carrera_key" ON "equipos"("torneo_id", "carrera");

-- CreateIndex
CREATE UNIQUE INDEX "equipo_jugadores_equipo_id_deportista_ci_key" ON "equipo_jugadores"("equipo_id", "deportista_ci");

-- CreateIndex
CREATE UNIQUE INDEX "tabla_posiciones_torneo_id_equipo_id_key" ON "tabla_posiciones"("torneo_id", "equipo_id");

-- CreateIndex
CREATE UNIQUE INDEX "asistencia_sesion_id_deportista_ci_key" ON "asistencia"("sesion_id", "deportista_ci");

-- AddForeignKey
ALTER TABLE "torneos" ADD CONSTRAINT "torneos_disciplina_id_fkey" FOREIGN KEY ("disciplina_id") REFERENCES "disciplinas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "torneos" ADD CONSTRAINT "torneos_categoria_id_fkey" FOREIGN KEY ("categoria_id") REFERENCES "categorias"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "equipos" ADD CONSTRAINT "equipos_torneo_id_fkey" FOREIGN KEY ("torneo_id") REFERENCES "torneos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "equipo_jugadores" ADD CONSTRAINT "equipo_jugadores_equipo_id_fkey" FOREIGN KEY ("equipo_id") REFERENCES "equipos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "partidos" ADD CONSTRAINT "partidos_torneo_id_fkey" FOREIGN KEY ("torneo_id") REFERENCES "torneos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "partidos" ADD CONSTRAINT "partidos_equipo_local_id_fkey" FOREIGN KEY ("equipo_local_id") REFERENCES "equipos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "partidos" ADD CONSTRAINT "partidos_equipo_visitante_id_fkey" FOREIGN KEY ("equipo_visitante_id") REFERENCES "equipos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "partidos" ADD CONSTRAINT "partidos_espacio_id_fkey" FOREIGN KEY ("espacio_id") REFERENCES "espacios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "estadisticas_partido" ADD CONSTRAINT "estadisticas_partido_partido_id_fkey" FOREIGN KEY ("partido_id") REFERENCES "partidos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "estadisticas_partido" ADD CONSTRAINT "estadisticas_partido_equipo_id_fkey" FOREIGN KEY ("equipo_id") REFERENCES "equipos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fixtures" ADD CONSTRAINT "fixtures_torneo_id_fkey" FOREIGN KEY ("torneo_id") REFERENCES "torneos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tabla_posiciones" ADD CONSTRAINT "tabla_posiciones_torneo_id_fkey" FOREIGN KEY ("torneo_id") REFERENCES "torneos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tabla_posiciones" ADD CONSTRAINT "tabla_posiciones_equipo_id_fkey" FOREIGN KEY ("equipo_id") REFERENCES "equipos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sesiones" ADD CONSTRAINT "sesiones_equipo_id_fkey" FOREIGN KEY ("equipo_id") REFERENCES "equipos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sesiones" ADD CONSTRAINT "sesiones_espacio_id_fkey" FOREIGN KEY ("espacio_id") REFERENCES "espacios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sesiones" ADD CONSTRAINT "sesiones_disciplina_id_fkey" FOREIGN KEY ("disciplina_id") REFERENCES "disciplinas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asistencia" ADD CONSTRAINT "asistencia_sesion_id_fkey" FOREIGN KEY ("sesion_id") REFERENCES "sesiones"("id") ON DELETE CASCADE ON UPDATE CASCADE;
