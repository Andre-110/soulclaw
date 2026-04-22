import { useEffect, useRef } from 'react';

interface Props {
  particleCount?: number;
  showNebula?: boolean;
}

export default function StarBackground({ particleCount = 60, showNebula = false }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const stars = Array.from({ length: particleCount }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.5 + 0.3,
      alpha: Math.random(),
      speed: Math.random() * 0.5 + 0.1,
      twinkleSpeed: Math.random() * 0.02 + 0.005,
      twinkleDir: 1,
    }));

    let animId: number;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      stars.forEach((s) => {
        s.alpha += s.twinkleSpeed * s.twinkleDir;
        if (s.alpha >= 1) s.twinkleDir = -1;
        if (s.alpha <= 0.1) s.twinkleDir = 1;

        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(224,239,255,${s.alpha})`;
        ctx.fill();
      });

      if (showNebula) {
        const grad1 = ctx.createRadialGradient(
          canvas.width * 0.8, canvas.height * 0.2, 0,
          canvas.width * 0.8, canvas.height * 0.2, canvas.width * 0.4
        );
        grad1.addColorStop(0, 'rgba(108,92,231,0.06)');
        grad1.addColorStop(1, 'rgba(108,92,231,0)');
        ctx.fillStyle = grad1;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const grad2 = ctx.createRadialGradient(
          canvas.width * 0.2, canvas.height * 0.7, 0,
          canvas.width * 0.2, canvas.height * 0.7, canvas.width * 0.35
        );
        grad2.addColorStop(0, 'rgba(0,209,255,0.05)');
        grad2.addColorStop(1, 'rgba(0,209,255,0)');
        ctx.fillStyle = grad2;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      animId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, [particleCount, showNebula]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 0 }}
    />
  );
}
