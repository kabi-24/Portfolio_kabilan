import { useEffect, useRef, useState } from 'react';
import { Pause, Play } from 'lucide-react';

interface BagBox {
  x: number;
  w: number;
  conf: number;
}

export default function BagCounterPreview() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [paused, setPaused] = useState(false);
  const pausedRef = useRef(false);
  pausedRef.current = paused;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const width = 480;
    const height = 260;
    const lineX = 308;

    const bags: BagBox[] = Array.from({ length: 5 }, (_, i) => ({
      x: -60 + i * 130,
      w: 62 + (i % 3) * 7,
      conf: 0.91 + (i % 4) * 0.02,
    }));

    let count = 0;
    let flash = 0;
    let fps = 32;
    let lastTime = performance.now();
    let visible = false;
    let rafId = 0;

    const drawFrame = (now: number) => {
      if (!visible) return;
      const dt = Math.min(0.05, Math.max(0.001, (now - lastTime) / 1000));
      lastTime = now;

      if (!pausedRef.current) {
        fps += (1 / dt - fps) * 0.05;
      }

      ctx.fillStyle = '#050a14';
      ctx.fillRect(0, 0, width, height);

      // Calibration grid
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.1)';
      ctx.lineWidth = 1;
      for (let gx = 0; gx < width; gx += 24) {
        ctx.beginPath();
        ctx.moveTo(gx, 0);
        ctx.lineTo(gx, height);
        ctx.stroke();
      }

      // Conveyor belt surface
      ctx.fillStyle = '#0d1626';
      ctx.fillRect(0, 76, width, 114);

      // Virtual tripwire
      ctx.setLineDash([6, 5]);
      ctx.strokeStyle = '#8b5cf6';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(lineX, 46);
      ctx.lineTo(lineX, 218);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.font = '600 11px "JetBrains Mono", monospace';
      const speed = pausedRef.current ? 0 : reduceMotion ? 18 : 72;

      for (const bag of bags) {
        const prevX = bag.x;
        bag.x += speed * dt;
        if (prevX < lineX && bag.x >= lineX) {
          count += 1;
          flash = 1;
        }
        if (bag.x > width + 32) {
          bag.x -= 650;
          bag.conf = 0.91 + Math.random() * 0.08;
        }

        // Bag mesh representation
        ctx.fillStyle = '#1e2f48';
        ctx.fillRect(bag.x, 100, bag.w, 68);
        ctx.fillStyle = '#294061';
        ctx.fillRect(bag.x + 6, 106, bag.w - 12, 10);

        // YOLOv8 bounding box
        ctx.lineWidth = 1.75;
        ctx.strokeStyle = '#38bdf8';
        ctx.strokeRect(bag.x - 4, 96, bag.w + 8, 76);

        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(bag.x - 4, 80, 68, 16);
        ctx.fillStyle = '#04070e';
        ctx.fillText(`bag ${bag.conf.toFixed(2)}`, bag.x, 91);
      }

      if (!pausedRef.current) {
        flash = Math.max(0, flash - dt * 2.5);
      }
      ctx.fillStyle = `rgba(139, 92, 246, ${0.12 + flash * 0.35})`;
      ctx.fillRect(lineX - 3, 46, 6, 172);

      // Overlay readouts
      ctx.fillStyle = '#f1f5f9';
      ctx.font = '700 18px "JetBrains Mono", monospace';
      ctx.fillText(`COUNT ${String(count).padStart(3, '0')}`, 14, 30);

      ctx.font = '500 11px "JetBrains Mono", monospace';
      ctx.fillStyle = '#94a3b8';
      const shownFps = pausedRef.current ? 0 : Math.round(Math.max(30, Math.min(fps, 60)));
      ctx.fillText(`YOLOv8 · ${shownFps} FPS`, 14, 244);

      rafId = requestAnimationFrame(drawFrame);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        visible = entries[0]?.isIntersecting ?? false;
        if (visible) {
          lastTime = performance.now();
          rafId = requestAnimationFrame(drawFrame);
        } else {
          cancelAnimationFrame(rafId);
        }
      },
      { threshold: 0.05 }
    );

    observer.observe(canvas);
    return () => {
      cancelAnimationFrame(rafId);
      observer.disconnect();
    };
  }, []);

  return (
    <div className="relative overflow-hidden rounded-lg border border-slate-800 bg-[#050a14]">
      <div className="flex items-center justify-between border-b border-slate-800/80 px-3 py-2 text-xs text-slate-400">
        <span>Simulated YOLOv8 detection feed</span>
        <button
          type="button"
          onClick={() => setPaused((p) => !p)}
          className="inline-flex items-center gap-1.5 rounded px-2 py-1 text-xs font-medium text-slate-200 hover:bg-slate-800 transition-colors focus-visible:outline-2 focus-visible:outline-cyan-400"
        >
          {paused ? (
            <>
              <Play className="h-3.5 w-3.5 text-cyan-400" />
              <span>Resume</span>
            </>
          ) : (
            <>
              <Pause className="h-3.5 w-3.5 text-cyan-400" />
              <span>Pause</span>
            </>
          )}
        </button>
      </div>
      <canvas
        ref={canvasRef}
        width={480}
        height={260}
        aria-label="Simulated YOLOv8 detection feed counting bags on a conveyor belt"
        className="block w-full h-auto"
      />
    </div>
  );
}
