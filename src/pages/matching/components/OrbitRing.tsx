import { useEffect, useRef } from 'react';

interface OrbitRingProps {
  matched?: boolean;
  scanCount?: number;
}

export default function OrbitRing({ matched = false, scanCount = 2847 }: OrbitRingProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const timeRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const SIZE = 360;
    canvas.width = SIZE;
    canvas.height = SIZE;
    const cx = SIZE / 2;
    const cy = SIZE / 2;

    interface FloatParticle {
      angle: number;
      orbitR: number;
      speed: number;
      size: number;
      color: string;
      opacity: number;
    }

    const floatParticles: FloatParticle[] = Array.from({ length: 40 }, () => ({
      angle: Math.random() * Math.PI * 2,
      orbitR: Math.random() * 80 + 60,
      speed: (Math.random() - 0.5) * 0.008,
      size: Math.random() * 2 + 0.5,
      color: Math.random() > 0.5 ? '#6C5CE7' : '#00D1FF',
      opacity: Math.random() * 0.6 + 0.2,
    }));

    const draw = () => {
      timeRef.current += 0.012;
      ctx.clearRect(0, 0, SIZE, SIZE);

      // Outer glow
      const outerGrad = ctx.createRadialGradient(cx, cy, 100, cx, cy, 180);
      outerGrad.addColorStop(0, 'rgba(0, 209, 255, 0.04)');
      outerGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = outerGrad;
      ctx.fillRect(0, 0, SIZE, SIZE);

      // Orbit rings
      const rings = [
        { r: 155, color: 'rgba(0, 209, 255, 0.15)', width: 1 },
        { r: 130, color: 'rgba(108, 92, 231, 0.2)', width: 1.5 },
        { r: 105, color: 'rgba(0, 209, 255, 0.1)', width: 1 },
      ];

      rings.forEach(({ r, color, width }) => {
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.strokeStyle = color;
        ctx.lineWidth = width;
        ctx.stroke();
      });

      // Rotating arc on outer ring
      ctx.beginPath();
      ctx.arc(cx, cy, 155, timeRef.current, timeRef.current + Math.PI * 0.6);
      ctx.strokeStyle = 'rgba(0, 209, 255, 0.6)';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(cx, cy, 130, -timeRef.current * 0.7, -timeRef.current * 0.7 + Math.PI * 0.4);
      ctx.strokeStyle = 'rgba(108, 92, 231, 0.7)';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Float particles
      floatParticles.forEach((p) => {
        p.angle += p.speed;
        const x = cx + Math.cos(p.angle) * p.orbitR;
        const y = cy + Math.sin(p.angle) * p.orbitR * 0.7;
        const twinkle = Math.sin(timeRef.current * 3 + p.angle) * 0.3 + 0.7;
        ctx.beginPath();
        ctx.arc(x, y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color + Math.floor(p.opacity * twinkle * 200).toString(16).padStart(2, '0');
        ctx.fill();
      });

      // Center core
      const coreGrad = ctx.createRadialGradient(cx - 10, cy - 10, 0, cx, cy, 50);
      const breathe = Math.sin(timeRef.current * 1.5) * 0.15 + 0.85;
      coreGrad.addColorStop(0, `rgba(224, 239, 255, ${0.9 * breathe})`);
      coreGrad.addColorStop(0.4, `rgba(108, 92, 231, ${0.8 * breathe})`);
      coreGrad.addColorStop(0.8, `rgba(0, 209, 255, ${0.5 * breathe})`);
      coreGrad.addColorStop(1, 'rgba(15, 15, 30, 0.9)');
      ctx.beginPath();
      ctx.arc(cx, cy, 50, 0, Math.PI * 2);
      ctx.fillStyle = coreGrad;
      ctx.fill();

      // Orbit dot on outer ring
      const dotX = cx + Math.cos(timeRef.current * 0.6) * 155;
      const dotY = cy + Math.sin(timeRef.current * 0.6) * 155;
      ctx.beginPath();
      ctx.arc(dotX, dotY, 4, 0, Math.PI * 2);
      ctx.fillStyle = '#00D1FF';
      ctx.fill();
      ctx.beginPath();
      ctx.arc(dotX, dotY, 8, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0, 209, 255, 0.2)';
      ctx.fill();

      // Matched: second dot approaching
      if (matched) {
        const matchAngle = timeRef.current * 0.6 + Math.PI * 0.8;
        const mDotX = cx + Math.cos(matchAngle) * 155;
        const mDotY = cy + Math.sin(matchAngle) * 155;
        ctx.beginPath();
        ctx.arc(mDotX, mDotY, 4, 0, Math.PI * 2);
        ctx.fillStyle = '#6C5CE7';
        ctx.fill();
        ctx.beginPath();
        ctx.arc(mDotX, mDotY, 8, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(108, 92, 231, 0.2)';
        ctx.fill();
      }

      animRef.current = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(animRef.current);
  }, [matched]);

  return <canvas ref={canvasRef} style={{ width: 360, height: 360 }} />;
}
