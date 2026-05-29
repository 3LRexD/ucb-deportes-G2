import type { Partido } from '@/types/partidos.types';
import { useRef, useEffect, useImperativeHandle, forwardRef } from 'react';


interface Props {
  partidos: Partido[];
  grupo: string;
  torneo_nombre: string;
  disciplina_nombre?: string;
  fecha_label?: string;
  ratio: '9:16' | '4:3';
}

export interface FixtureCanvasHandle {
  exportarImagen: (formato: 'png' | 'jpg') => void;
  exportarPDF: () => void;
  getCanvas: () => HTMLCanvasElement | null;
}

const UCB_AZUL = '#003DA5';
const UCB_AMARILLO = '#FFD100';
const GRIS_FONDO = '#F5F5F0';

function abreviar(nombre: string, max = 3): string {
  // Si ya es corto, usarlo directo
  if (nombre.length <= max) return nombre.toUpperCase();
  // Siglas de palabras
  const palabras = nombre.trim().split(/\s+/);
  if (palabras.length > 1) return palabras.map(p => p[0]).join('').toUpperCase().slice(0, max);
  return nombre.slice(0, max).toUpperCase();
}

export const FixtureCanvas = forwardRef<FixtureCanvasHandle, Props>(
  ({ partidos, grupo, torneo_nombre, disciplina_nombre, fecha_label, ratio }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const getDims = () => {
      if (ratio === '9:16') return { w: 900, h: 1600 };
      return { w: 1200, h: 900 };
    };

    const dibujar = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const { w, h } = getDims();
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d')!;

      // ── Fondo ─────────────────────────────────────────────────────────────
      ctx.fillStyle = GRIS_FONDO;
      ctx.fillRect(0, 0, w, h);

      // ── Silueta Bolivia (fondo decorativo) ────────────────────────────────
      ctx.save();
      ctx.globalAlpha = 0.06;
      ctx.fillStyle = UCB_AZUL;
      // Silueta simplificada Bolivia
      const bx = w * 0.55, by = h * 0.18, bs = h * 0.65;
      ctx.beginPath();
      ctx.moveTo(bx + bs * 0.1, by);
      ctx.lineTo(bx + bs * 0.45, by + bs * 0.05);
      ctx.lineTo(bx + bs * 0.5, by + bs * 0.2);
      ctx.lineTo(bx + bs * 0.4, by + bs * 0.35);
      ctx.lineTo(bx + bs * 0.5, by + bs * 0.5);
      ctx.lineTo(bx + bs * 0.35, by + bs * 0.65);
      ctx.lineTo(bx + bs * 0.2, by + bs * 0.7);
      ctx.lineTo(bx, by + bs * 0.55);
      ctx.lineTo(bx - bs * 0.05, by + bs * 0.3);
      ctx.lineTo(bx + bs * 0.05, by + bs * 0.1);
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      if (ratio === '9:16') {
        dibujar916(ctx, w, h, partidos, grupo, torneo_nombre, disciplina_nombre, fecha_label);
      } else {
        dibujar43(ctx, w, h, partidos, grupo, torneo_nombre, disciplina_nombre, fecha_label);
      }
    };

    function dibujar916(
      ctx: CanvasRenderingContext2D, w: number, h: number,
      partidos: Partido[], grupo: string, torneo: string, disciplina?: string, fecha?: string
    ) {
      const pad = 60;

      // ── Logo UCB (círculo placeholder) ────────────────────────────────────
      ctx.save();
      ctx.beginPath();
      ctx.arc(pad + 55, 80, 55, 0, Math.PI * 2);
      ctx.fillStyle = UCB_AZUL;
      ctx.fill();
      ctx.fillStyle = UCB_AMARILLO;
      ctx.font = 'bold 11px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('UCB', pad + 55, 76);
      ctx.fillText('LOGO', pad + 55, 90);
      ctx.restore();

      // ── Header UCB ────────────────────────────────────────────────────────
      ctx.fillStyle = UCB_AZUL;
      ctx.font = 'bold 18px Arial';
      ctx.textAlign = 'left';
      ctx.fillText('UNIVERSIDAD', pad + 130, 60);
      ctx.font = 'bold 28px Arial';
      ctx.fillText('CATÓLICA', pad + 130, 90);
      ctx.font = '22px Arial';
      ctx.letterSpacing = '8px';
      ctx.fillText('BOLIVIANA', pad + 130, 115);
      ctx.letterSpacing = '0px';

      // Línea separadora vertical
      ctx.fillStyle = UCB_AZUL;
      ctx.fillRect(pad + 120, 30, 3, 100);

      // ── GRUPO ─────────────────────────────────────────────────────────────
      ctx.fillStyle = UCB_AZUL;
      ctx.font = 'bold 110px Impact';
      ctx.textAlign = 'center';
      ctx.fillText(`GRUPO ${grupo}`, w / 2, 290);

      // ── Info disciplina/fecha ──────────────────────────────────────────────
      ctx.font = 'bold 22px Arial';
      ctx.fillStyle = UCB_AZUL;
      ctx.textAlign = 'center';
      const infoLines = [];
      if (fecha) infoLines.push(fecha.toUpperCase());
      if (disciplina) infoLines.push(disciplina.toUpperCase());
      infoLines.forEach((line, i) => ctx.fillText(line, w / 2, 320 + i * 30));

      // ── Partidos ──────────────────────────────────────────────────────────
      const startY = 400;
      const rowH = (h - startY - 120) / Math.max(partidos.length, 1);
      const clampedRowH = Math.min(rowH, 160);

      partidos.forEach((p, i) => {
        const y = startY + i * clampedRowH;
        const localAbr = abreviar(p.equipo_local_nombre);
        const visitAbr = abreviar(p.equipo_visitante_nombre);

        // Hora
        ctx.fillStyle = UCB_AZUL;
        ctx.font = '20px Arial';
        ctx.textAlign = 'left';
        ctx.fillText(p.hora, pad, y + 20);

        // Equipo local
        ctx.font = 'bold 54px Impact';
        ctx.fillStyle = UCB_AZUL;
        ctx.textAlign = 'left';
        ctx.fillText(localAbr, pad, y + 75);

        // Cuadros de marcador
        const midX = w / 2 - 60;
        const boxW = 58, boxH = 58, gap = 8;
        ctx.fillStyle = UCB_AMARILLO;
        ctx.fillRect(midX, y + 20, boxW, boxH);
        ctx.fillRect(midX + boxW + gap, y + 20, boxW, boxH);

        // Si hay resultado
        if (p.estado === 'finalizado') {
          ctx.fillStyle = UCB_AZUL;
          ctx.font = 'bold 36px Arial';
          ctx.textAlign = 'center';
          ctx.fillText(String(p.goles_local), midX + boxW / 2, y + 57);
          ctx.fillText(String(p.goles_visitante), midX + boxW + gap + boxW / 2, y + 57);
        }

        // Equipo visitante
        ctx.font = 'bold 54px Impact';
        ctx.fillStyle = UCB_AZUL;
        ctx.textAlign = 'right';
        ctx.fillText(visitAbr, w - pad, y + 75);

        // Separador
        if (i < partidos.length - 1) {
          ctx.strokeStyle = '#ddd';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(pad, y + clampedRowH - 10);
          ctx.lineTo(w - pad, y + clampedRowH - 10);
          ctx.stroke();
        }
      });

      // ── Footer ────────────────────────────────────────────────────────────
      ctx.fillStyle = UCB_AZUL;
      ctx.font = 'bold 36px Impact';
      ctx.textAlign = 'center';
      ctx.fillText(`FIXTURE ${new Date().getFullYear()}`, w / 2, h - 30);
    }

    function dibujar43(
      ctx: CanvasRenderingContext2D, w: number, h: number,
      partidos: Partido[], grupo: string, torneo: string, disciplina?: string, fecha?: string
    ) {
      const pad = 60;
      const colDerX = w * 0.35;

      // ── Header izquierda ──────────────────────────────────────────────────
      ctx.fillStyle = UCB_AZUL;
      ctx.font = 'bold 16px Arial';
      ctx.textAlign = 'left';
      ctx.fillText('UNIVERSIDAD', pad, 50);
      ctx.font = 'bold 24px Arial';
      ctx.fillText('CATÓLICA', pad, 76);
      ctx.font = '18px Arial';
      ctx.fillText('BOLIVIANA', pad, 98);

      // Línea vertical separadora
      ctx.fillRect(colDerX - 20, 20, 3, 90);

      // GRUPO (lado derecho del header)
      ctx.font = 'bold 80px Impact';
      ctx.textAlign = 'left';
      ctx.fillText(`GRUPO ${grupo}`, colDerX + 10, 95);

      // Info
      ctx.font = 'bold 18px Arial';
      ctx.textAlign = 'right';
      const infoLines = [fecha, disciplina].filter(Boolean) as string[];
      infoLines.forEach((line, i) =>
        ctx.fillText(line.toUpperCase(), w - pad, 50 + i * 26)
      );

      // ── Partidos en grid ──────────────────────────────────────────────────
      const startY = 150;
      const cols = partidos.length <= 4 ? 1 : 2;
      const colW = (w - pad * 2) / cols;
      const rowH = (h - startY - 80) / Math.ceil(partidos.length / cols);

      partidos.forEach((p, i) => {
        const col = i % cols;
        const row = Math.floor(i / cols);
        const x = pad + col * colW;
        const y = startY + row * rowH;
        const localAbr = abreviar(p.equipo_local_nombre);
        const visitAbr = abreviar(p.equipo_visitante_nombre);

        ctx.fillStyle = UCB_AZUL;
        ctx.font = '16px Arial';
        ctx.textAlign = 'left';
        ctx.fillText(p.hora, x, y + 18);

        ctx.font = 'bold 42px Impact';
        ctx.fillText(localAbr, x, y + 62);

        const boxW = 44, boxH = 44, midX = x + colW * 0.42;
        ctx.fillStyle = UCB_AMARILLO;
        ctx.fillRect(midX, y + 20, boxW, boxH);
        ctx.fillRect(midX + boxW + 6, y + 20, boxW, boxH);

        if (p.estado === 'finalizado') {
          ctx.fillStyle = UCB_AZUL;
          ctx.font = 'bold 28px Arial';
          ctx.textAlign = 'center';
          ctx.fillText(String(p.goles_local), midX + boxW / 2, y + 48);
          ctx.fillText(String(p.goles_visitante), midX + boxW + 6 + boxW / 2, y + 48);
        }

        ctx.fillStyle = UCB_AZUL;
        ctx.font = 'bold 42px Impact';
        ctx.textAlign = 'right';
        ctx.fillText(visitAbr, x + colW - 10, y + 62);
      });

      // ── Footer ────────────────────────────────────────────────────────────
      ctx.fillStyle = UCB_AZUL;
      ctx.font = 'bold 30px Impact';
      ctx.textAlign = 'center';
      ctx.fillText(`FIXTURE ${new Date().getFullYear()}`, w / 2, h - 20);
    }

    useEffect(() => { dibujar(); }, [partidos, grupo, ratio, disciplina_nombre, fecha_label]);

    useImperativeHandle(ref, () => ({
      exportarImagen: (formato: 'png' | 'jpg') => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const mime = formato === 'jpg' ? 'image/jpeg' : 'image/png';
        const url = canvas.toDataURL(mime, 0.95);
        const a = document.createElement('a');
        a.href = url;
        a.download = `fixture_grupo_${grupo}.${formato}`;
        a.click();
      },
      exportarPDF: async () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        // Usar jsPDF si disponible, sino fallback a imagen
        try {
          const { jsPDF } = await import('jspdf');
          const { w, h } = getDims();
          const orient = ratio === '9:16' ? 'p' : 'l';
          const pdf = new jsPDF({ orientation: orient, unit: 'px', format: [w, h] });
          const imgData = canvas.toDataURL('image/jpeg', 0.95);
          pdf.addImage(imgData, 'JPEG', 0, 0, w, h);
          pdf.save(`fixture_grupo_${grupo}.pdf`);
        } catch {
          // Fallback: abrir imagen en nueva tab
          const url = canvas.toDataURL('image/jpeg', 0.95);
          const win = window.open();
          if (win) win.document.write(`<img src="${url}" style="width:100%">`);
        }
      },
      getCanvas: () => canvasRef.current,
    }));

    const { w, h } = getDims();
    const maxPreviewH = 600;
    const scale = maxPreviewH / h;

    return (
      <div className="flex justify-center">
        <canvas
          ref={canvasRef}
          style={{ width: w * scale, height: h * scale, border: '1px solid #e5e7eb', borderRadius: 8 }}
        />
      </div>
    );
  }
);

FixtureCanvas.displayName = 'FixtureCanvas';