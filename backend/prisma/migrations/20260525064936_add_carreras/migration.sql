/*
  Warnings:

  - You are about to drop the column `carrera` on the `equipos` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[torneo_id,carrera_id]` on the table `equipos` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "equipos_torneo_id_carrera_key";

-- AlterTable
ALTER TABLE "equipos" DROP COLUMN "carrera",
ADD COLUMN     "carrera_id" INTEGER;

-- CreateTable
CREATE TABLE "carreras" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(150) NOT NULL,
    "facultad" VARCHAR(100) NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "carreras_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "carreras_nombre_key" ON "carreras"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "equipos_torneo_id_carrera_id_key" ON "equipos"("torneo_id", "carrera_id");

-- AddForeignKey
ALTER TABLE "equipos" ADD CONSTRAINT "equipos_carrera_id_fkey" FOREIGN KEY ("carrera_id") REFERENCES "carreras"("id") ON DELETE SET NULL ON UPDATE CASCADE;
