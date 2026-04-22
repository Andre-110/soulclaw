import { useCallback, useEffect, useRef, useState } from 'react';

interface Props {
  onStart: () => void;
}

interface Star {
  x: number; y: number; r: number;
  baseAlpha: number; alpha: number;
  twinkleSpeed: number; twinkleDir: number;
  twinkleOffset: number;
  layer: number; // 0=far 1=mid 2=near
  hasCross: boolean;
}

interface OrbParticle {
  orbitRadius: number;
  orbitTilt: number;
  orbitAngle: number;
  orbitSpeed: number;
  size: number;
  color: string;
  trailLength: number;
  trail: { x: number; y: number; a: number }[];
}

interface Nebula {
  x: number; y: number;
  rx: number; ry: number;
  color: string;
  driftX: number; driftY: number;
  alpha: number;
}

interface BurstParticle {
  x: number; y: number;
  vx: number; vy: number;
  color: string;
  size: number;
  alpha: number;
  life: number;
  maxLife: number;
  trailX: number[]; trailY: number[];
}

interface ShockWave {
  r: number;
  maxR: number;
  alpha: number;
  color: string;
}

interface BurstState {
  active: boolean;
  phase: 'explode' | 'settle' | 'idle';
  flashAlpha: number;
  particles: BurstParticle[];
  shockWaves: ShockWave[];
  progress: number;
}

export default function ForgeIntro({ onStart }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>(0);
  const timeRef = useRef<number>(0);
  const starsRef = useRef<Star[]>([]);
  const orbParticlesRef = useRef<OrbParticle[]>([]);
  const nebulasRef = useRef<Nebula[]>([]);
  const burstRef = useRef<BurstState>({
    active: false,
    phase: 'idle',
    flashAlpha: 0,
    particles: [],
    shockWaves: [],
    progress: 0,
  });
  const orbCenterRef = useRef<{ cx: number; cy: number; R: number }>({ cx: 0, cy: 0, R: 72 });
  const [visible, setVisible] = useState(false);
  const [burstHint, setBurstHint] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 80);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };
    resize();

    const W = canvas.offsetWidth;
    const H = canvas.offsetHeight;
    const cx = W / 2;
    const cy = H * 0.46;

    // --- Stars ---
    const STAR_COUNT = 220;
    starsRef.current = Array.from({ length: STAR_COUNT }, () => {
      const layer = Math.floor(Math.random() * 3);
      const r = layer === 0 ? 0.4 + Math.random() * 0.6
                : layer === 1 ? 0.7 + Math.random() * 1.0
                : 1.2 + Math.random() * 1.8;
      const baseAlpha = layer === 0 ? 0.2 + Math.random() * 0.4
                      : layer === 1 ? 0.35 + Math.random() * 0.45
                      : 0.5 + Math.random() * 0.5;
      return {
        x: Math.random() * W,
        y: Math.random() * H,
        r,
        baseAlpha,
        alpha: baseAlpha,
        twinkleSpeed: 0.004 + Math.random() * 0.018,
        twinkleDir: Math.random() > 0.5 ? 1 : -1,
        twinkleOffset: Math.random() * Math.PI * 2,
        layer,
        hasCross: layer === 2 && Math.random() > 0.55,
      };
    });

    // --- Nebulas ---
    nebulasRef.current = [
      { x: W * 0.15, y: H * 0.2, rx: W * 0.35, ry: H * 0.28, color: '108,92,231', driftX: 0.04, driftY: 0.02, alpha: 0.07 },
      { x: W * 0.85, y: H * 0.75, rx: W * 0.3, ry: H * 0.25, color: '0,209,255', driftX: -0.03, driftY: 0.015, alpha: 0.06 },
      { x: W * 0.5, y: H * 0.1, rx: W * 0.4, ry: H * 0.2, color: '162,155,254', driftX: 0.02, driftY: 0.025, alpha: 0.05 },
      { x: W * 0.2, y: H * 0.85, rx: W * 0.28, ry: H * 0.2, color: '253,121,168', driftX: 0.035, driftY: -0.02, alpha: 0.04 },
    ];

    // --- Orb particles ---
    const COLORS = ['#6C5CE7', '#00D1FF', '#A29BFE', '#74B9FF', '#FD79A8', '#00CEC9', '#FDCB6E'];
    orbParticlesRef.current = Array.from({ length: 120 }, (_, i) => {
      const orbitRadius = 72 + Math.random() * 100;
      const tilt = (Math.random() - 0.5) * Math.PI * 0.9;
      const orbitSpeed = (0.004 + Math.random() * 0.007) * (Math.random() > 0.5 ? 1 : -1);
      return {
        orbitRadius,
        orbitTilt: tilt,
        orbitAngle: (i / 120) * Math.PI * 2 + Math.random() * 0.5,
        orbitSpeed,
        size: 0.6 + Math.random() * 2.0,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        trailLength: 6 + Math.floor(Math.random() * 10),
        trail: [],
      };
    });

    // Helper: hex to rgb parts
    const hexToRgb = (hex: string) => {
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);
      return `${r},${g},${b}`;
    };

    const draw = () => {
      timeRef.current += 0.012;
      const t = timeRef.current;

      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;

      ctx.clearRect(0, 0, w, h);

      // Deep space background gradient
      const bgGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(w, h) * 0.85);
      bgGrad.addColorStop(0, '#1a1040');
      bgGrad.addColorStop(0.4, '#0d0b24');
      bgGrad.addColorStop(1, '#050510');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      // --- Nebulas (drifting) ---
      nebulasRef.current.forEach((nb) => {
        nb.x += nb.driftX * 0.016;
        nb.y += nb.driftY * 0.016;
        const grad = ctx.createRadialGradient(nb.x, nb.y, 0, nb.x, nb.y, nb.rx);
        grad.addColorStop(0, `rgba(${nb.color},${nb.alpha * 1.4})`);
        grad.addColorStop(0.5, `rgba(${nb.color},${nb.alpha * 0.7})`);
        grad.addColorStop(1, `rgba(${nb.color},0)`);
        ctx.save();
        ctx.scale(1, nb.ry / nb.rx);
        ctx.beginPath();
        ctx.arc(nb.x, nb.y * (nb.rx / nb.ry), nb.rx, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();
        ctx.restore();
      });

      // Stars removed

      // ============= SPHERE =============
      const R = 72; // sphere radius

      // Far glow halos
      for (let i = 4; i >= 1; i--) {
        const hr = R + i * 28;
        const hGrad = ctx.createRadialGradient(cx, cy, R * 0.5, cx, cy, hr);
        hGrad.addColorStop(0, `rgba(108,92,231,${0.025 * i})`);
        hGrad.addColorStop(0.5, `rgba(0,209,255,${0.018 * i})`);
        hGrad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.beginPath();
        ctx.arc(cx, cy, hr, 0, Math.PI * 2);
        ctx.fillStyle = hGrad;
        ctx.fill();
      }

      // Atmosphere glow
      const atmGrad = ctx.createRadialGradient(cx, cy, R * 0.8, cx, cy, R * 1.35);
      atmGrad.addColorStop(0, 'rgba(108,92,231,0)');
      atmGrad.addColorStop(0.4, 'rgba(80,60,200,0.18)');
      atmGrad.addColorStop(0.75, 'rgba(0,209,255,0.22)');
      atmGrad.addColorStop(1, 'rgba(0,209,255,0)');
      ctx.beginPath();
      ctx.arc(cx, cy, R * 1.35, 0, Math.PI * 2);
      ctx.fillStyle = atmGrad;
      ctx.fill();

      // Main sphere body
      const mainGrad = ctx.createRadialGradient(cx - R * 0.28, cy - R * 0.28, R * 0.05, cx, cy, R);
      mainGrad.addColorStop(0, 'rgba(210,195,255,0.98)');
      mainGrad.addColorStop(0.18, 'rgba(140,110,255,0.95)');
      mainGrad.addColorStop(0.45, 'rgba(60,40,160,0.92)');
      mainGrad.addColorStop(0.72, 'rgba(12,8,50,0.95)');
      mainGrad.addColorStop(1, 'rgba(0,180,230,0.75)');
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.fillStyle = mainGrad;
      ctx.fill();

      // Cloud layer 1 — flowing horizontal bands
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.clip();
      for (let band = 0; band < 5; band++) {
        const by = cy - R + (band / 4) * R * 2;
        const bw = Math.sqrt(Math.max(0, R * R - (by - cy) * (by - cy)));
        const bAlpha = 0.04 + band % 2 * 0.03;
        const bOffset = Math.sin(t * 0.3 + band * 1.2) * bw * 0.4;
        const bandGrad = ctx.createLinearGradient(cx - bw + bOffset, by, cx + bw + bOffset, by);
        bandGrad.addColorStop(0, `rgba(162,155,254,0)`);
        bandGrad.addColorStop(0.3, `rgba(162,155,254,${bAlpha})`);
        bandGrad.addColorStop(0.6, `rgba(0,209,255,${bAlpha * 0.8})`);
        bandGrad.addColorStop(1, `rgba(162,155,254,0)`);
        ctx.fillStyle = bandGrad;
        ctx.fillRect(cx - bw, by - 6, bw * 2, 12);
      }
      ctx.restore();

      // Cloud layer 2 — swirling vortex
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.clip();
      for (let v = 0; v < 3; v++) {
        const va = t * 0.12 + v * (Math.PI * 2 / 3);
        const vx = cx + Math.cos(va) * R * 0.3;
        const vy = cy + Math.sin(va) * R * 0.15;
        const vGrad = ctx.createRadialGradient(vx, vy, 0, vx, vy, R * 0.4);
        vGrad.addColorStop(0, `rgba(108,92,231,0.08)`);
        vGrad.addColorStop(1, 'rgba(108,92,231,0)');
        ctx.fillStyle = vGrad;
        ctx.fill();
      }
      ctx.restore();

      // Specular highlight
      const hlGrad = ctx.createRadialGradient(cx - R * 0.3, cy - R * 0.32, 0, cx - R * 0.3, cy - R * 0.32, R * 0.55);
      hlGrad.addColorStop(0, 'rgba(255,255,255,0.38)');
      hlGrad.addColorStop(0.4, 'rgba(255,255,255,0.12)');
      hlGrad.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.fillStyle = hlGrad;
      ctx.fill();

      // Secondary rim light
      const rimGrad = ctx.createRadialGradient(cx + R * 0.25, cy + R * 0.3, R * 0.5, cx + R * 0.25, cy + R * 0.3, R * 1.1);
      rimGrad.addColorStop(0, 'rgba(0,209,255,0)');
      rimGrad.addColorStop(0.6, 'rgba(0,209,255,0.18)');
      rimGrad.addColorStop(1, 'rgba(0,209,255,0)');
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.fillStyle = rimGrad;
      ctx.fill();

      // Meridian lines
      for (let m = 0; m < 8; m++) {
        const mAngle = (m / 8) * Math.PI + t * 0.08;
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(mAngle);
        ctx.beginPath();
        ctx.ellipse(0, 0, R * 0.12, R, 0, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(162,155,254,0.07)';
        ctx.lineWidth = 0.7;
        ctx.stroke();
        ctx.restore();
      }

      // Latitude lines
      for (let l = 1; l <= 4; l++) {
        const ly = (l / 5) * R * 2 - R;
        const lw = Math.sqrt(Math.max(0, R * R - ly * ly));
        ctx.beginPath();
        ctx.ellipse(cx, cy + ly, lw, lw * 0.25, 0, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(0,209,255,0.07)';
        ctx.lineWidth = 0.6;
        ctx.stroke();
      }

      // --- Planetary rings ---
      const ringDefs = [
        { rx: R * 1.55, ry: R * 0.22, tilt: -0.25, color: '0,209,255', alpha: 0.55, w: 2.0 },
        { rx: R * 1.78, ry: R * 0.26, tilt: -0.25, color: '108,92,231', alpha: 0.38, w: 1.4 },
        { rx: R * 2.05, ry: R * 0.30, tilt: -0.25, color: '162,155,254', alpha: 0.22, w: 1.0 },
        { rx: R * 1.3, ry: R * 0.18, tilt: -0.25, color: '253,121,168', alpha: 0.28, w: 1.2 },
      ];

      // Draw back half of rings (behind sphere)
      ringDefs.forEach((ring) => {
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(ring.tilt);
        ctx.beginPath();
        ctx.ellipse(0, 0, ring.rx, ring.ry, 0, Math.PI, Math.PI * 2);
        const rg = ctx.createLinearGradient(-ring.rx, 0, ring.rx, 0);
        rg.addColorStop(0, `rgba(${ring.color},0)`);
        rg.addColorStop(0.25, `rgba(${ring.color},${ring.alpha * 0.5})`);
        rg.addColorStop(0.5, `rgba(${ring.color},${ring.alpha})`);
        rg.addColorStop(0.75, `rgba(${ring.color},${ring.alpha * 0.5})`);
        rg.addColorStop(1, `rgba(${ring.color},0)`);
        ctx.strokeStyle = rg;
        ctx.lineWidth = ring.w;
        ctx.stroke();
        ctx.restore();
      });

      // Draw sphere clip (for front rings)
      // Front half of rings (in front of sphere)
      ringDefs.forEach((ring) => {
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(ring.tilt);
        ctx.beginPath();
        ctx.ellipse(0, 0, ring.rx, ring.ry, 0, 0, Math.PI);
        const rg2 = ctx.createLinearGradient(-ring.rx, 0, ring.rx, 0);
        rg2.addColorStop(0, `rgba(${ring.color},0)`);
        rg2.addColorStop(0.25, `rgba(${ring.color},${ring.alpha * 0.6})`);
        rg2.addColorStop(0.5, `rgba(${ring.color},${ring.alpha * 1.1})`);
        rg2.addColorStop(0.75, `rgba(${ring.color},${ring.alpha * 0.6})`);
        rg2.addColorStop(1, `rgba(${ring.color},0)`);
        ctx.strokeStyle = rg2;
        ctx.lineWidth = ring.w;
        ctx.stroke();
        ctx.restore();
      });

      // Ring scan light
      const scanAngle = t * 0.6;
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(-0.25);
      const scanX = Math.cos(scanAngle) * R * 1.55;
      const scanY = Math.sin(scanAngle) * R * 0.22;
      const scanGrd = ctx.createRadialGradient(scanX, scanY, 0, scanX, scanY, 18);
      scanGrd.addColorStop(0, 'rgba(255,255,255,0.55)');
      scanGrd.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = scanGrd;
      ctx.beginPath();
      ctx.arc(scanX, scanY, 18, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // --- Orbit particles with trails ---
      orbParticlesRef.current.forEach((p) => {
        p.orbitAngle += p.orbitSpeed;

        // Compute 3D orbit position
        const cosA = Math.cos(p.orbitAngle);
        const sinA = Math.sin(p.orbitAngle);
        const cosT = Math.cos(p.orbitTilt);
        const sinT = Math.sin(p.orbitTilt);

        const x3 = p.orbitRadius * cosA;
        const y3 = p.orbitRadius * sinA * cosT;
        const z3 = p.orbitRadius * sinA * sinT;

        const px = cx + x3;
        const py = cy + y3;
        const depth = (z3 / p.orbitRadius + 1) * 0.5;
        const finalAlpha = 0.25 + depth * 0.75;

        // Add to trail
        p.trail.push({ x: px, y: py, a: finalAlpha });
        if (p.trail.length > p.trailLength) p.trail.shift();

        // Draw trail
        if (p.trail.length > 1) {
          for (let ti = 1; ti < p.trail.length; ti++) {
            const tp = p.trail[ti - 1];
            const tc = p.trail[ti];
            const trailAlpha = (ti / p.trail.length) * finalAlpha * 0.5;
            ctx.beginPath();
            ctx.moveTo(tp.x, tp.y);
            ctx.lineTo(tc.x, tc.y);
            ctx.strokeStyle = `rgba(${hexToRgb(p.color)},${trailAlpha})`;
            ctx.lineWidth = p.size * 0.6;
            ctx.stroke();
          }
        }

        // Draw particle glow
        const grd = ctx.createRadialGradient(px, py, 0, px, py, p.size * 4);
        grd.addColorStop(0, `rgba(${hexToRgb(p.color)},${finalAlpha * 0.6})`);
        grd.addColorStop(1, `rgba(${hexToRgb(p.color)},0)`);
        ctx.beginPath();
        ctx.arc(px, py, p.size * 4, 0, Math.PI * 2);
        ctx.fillStyle = grd;
        ctx.fill();

        // Draw core
        ctx.beginPath();
        ctx.arc(px, py, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${hexToRgb(p.color)},${finalAlpha})`;
        ctx.fill();
      });

      // Pulse rings from sphere
      for (let pr = 0; pr < 3; pr++) {
        const pulseProgress = ((t * 0.4 + pr / 3) % 1);
        const pulseR = R + pulseProgress * R * 2.0;
        const pulseAlpha = (1 - pulseProgress) * 0.18;
        ctx.beginPath();
        ctx.arc(cx, cy, pulseR, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(108,92,231,${pulseAlpha})`;
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      // ============= BURST EFFECT =============
      const burst = burstRef.current;
      if (burst.active) {
        burst.progress += 1;

        // Flash white overlay on sphere
        if (burst.flashAlpha > 0) {
          burst.flashAlpha = Math.max(0, burst.flashAlpha - 0.06);
          const flashGrd = ctx.createRadialGradient(cx, cy, 0, cx, cy, R * 2.2);
          flashGrd.addColorStop(0, `rgba(255,255,255,${burst.flashAlpha * 0.95})`);
          flashGrd.addColorStop(0.35, `rgba(200,180,255,${burst.flashAlpha * 0.7})`);
          flashGrd.addColorStop(0.7, `rgba(0,209,255,${burst.flashAlpha * 0.3})`);
          flashGrd.addColorStop(1, 'rgba(0,0,0,0)');
          ctx.beginPath();
          ctx.arc(cx, cy, R * 2.2, 0, Math.PI * 2);
          ctx.fillStyle = flashGrd;
          ctx.fill();
        }

        // Shock waves
        burst.shockWaves = burst.shockWaves.filter((sw) => sw.alpha > 0.01);
        burst.shockWaves.forEach((sw) => {
          const expandRate = (sw.maxR - sw.r) * 0.065;
          sw.r += Math.max(expandRate, 0.8);
          const fadeRate = sw.r / sw.maxR;
          sw.alpha = Math.max(0, sw.alpha * (1 - fadeRate * 0.055));

          // Glow ring
          ctx.beginPath();
          ctx.arc(cx, cy, sw.r, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(${sw.color},${sw.alpha})`;
          ctx.lineWidth = 2.5;
          ctx.shadowColor = `rgba(${sw.color},${sw.alpha * 0.8})`;
          ctx.shadowBlur = 12;
          ctx.stroke();
          ctx.shadowBlur = 0;
        });

        // Burst particles
        burst.particles = burst.particles.filter((p) => p.life < p.maxLife);
        burst.particles.forEach((p) => {
          p.life += 1;
          const lifeRatio = p.life / p.maxLife;

          // Gravity + deceleration
          p.vx *= 0.96;
          p.vy *= 0.96;
          p.vy += 0.04; // subtle gravity pull

          p.x += p.vx;
          p.y += p.vy;
          p.alpha = (1 - lifeRatio) * 0.9;

          // Trail
          p.trailX.push(p.x);
          p.trailY.push(p.y);
          if (p.trailX.length > 8) { p.trailX.shift(); p.trailY.shift(); }

          const rgb = p.color.startsWith('#')
            ? `${parseInt(p.color.slice(1, 3), 16)},${parseInt(p.color.slice(3, 5), 16)},${parseInt(p.color.slice(5, 7), 16)}`
            : p.color;

          // Draw trail
          for (let ti = 1; ti < p.trailX.length; ti++) {
            const trAlpha = (ti / p.trailX.length) * p.alpha * 0.5;
            ctx.beginPath();
            ctx.moveTo(p.trailX[ti - 1], p.trailY[ti - 1]);
            ctx.lineTo(p.trailX[ti], p.trailY[ti]);
            ctx.strokeStyle = `rgba(${rgb},${trAlpha})`;
            ctx.lineWidth = p.size * 0.5;
            ctx.stroke();
          }

          // Glow halo
          const pGrd = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 4);
          pGrd.addColorStop(0, `rgba(${rgb},${p.alpha * 0.8})`);
          pGrd.addColorStop(1, `rgba(${rgb},0)`);
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * 4, 0, Math.PI * 2);
          ctx.fillStyle = pGrd;
          ctx.fill();

          // Core dot
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * (1 - lifeRatio * 0.5), 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${rgb},${p.alpha})`;
          ctx.fill();
        });

        // Energy surge — sphere brightens during burst
        if (burst.progress < 25) {
          const surgeAlpha = (1 - burst.progress / 25) * 0.45;
          const surgeGrd = ctx.createRadialGradient(cx, cy, 0, cx, cy, R);
          surgeGrd.addColorStop(0, `rgba(255,240,255,${surgeAlpha})`);
          surgeGrd.addColorStop(0.5, `rgba(108,92,231,${surgeAlpha * 0.6})`);
          surgeGrd.addColorStop(1, 'rgba(0,0,0,0)');
          ctx.beginPath();
          ctx.arc(cx, cy, R, 0, Math.PI * 2);
          ctx.fillStyle = surgeGrd;
          ctx.fill();
        }

        // Check if burst is finished
        if (burst.particles.length === 0 && burst.shockWaves.length === 0 && burst.flashAlpha <= 0) {
          burst.active = false;
          burst.phase = 'idle';
          burst.progress = 0;
        }
      }

      animFrameRef.current = requestAnimationFrame(draw);
    };

    // Store orb center for click detection
    orbCenterRef.current = { cx, cy, R: 72 };

    draw();

    return () => cancelAnimationFrame(animFrameRef.current);
  }, []);

  const triggerBurst = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const { cx, cy, R } = orbCenterRef.current;
    const burst = burstRef.current;
    if (burst.active) return; // prevent double trigger

    setBurstHint(false);

    const BURST_COLORS = ['#FFD700', '#FF6B9D', '#00D1FF', '#6C5CE7', '#A29BFE', '#FD79A8', '#FDCB6E', '#00CEC9', '#ffffff'];

    // Create burst particles — multi-directional explosion
    const particles: BurstParticle[] = [];
    for (let i = 0; i < 80; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 2.5 + Math.random() * 6.5;
      const color = BURST_COLORS[Math.floor(Math.random() * BURST_COLORS.length)];
      // Some particles start from sphere edge, some from center
      const spawnR = Math.random() > 0.4 ? R * (0.6 + Math.random() * 0.5) : R * Math.random() * 0.4;
      particles.push({
        x: cx + Math.cos(angle) * spawnR,
        y: cy + Math.sin(angle) * spawnR,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color,
        size: 1.2 + Math.random() * 3.5,
        alpha: 0.85 + Math.random() * 0.15,
        life: 0,
        maxLife: 45 + Math.floor(Math.random() * 35),
        trailX: [],
        trailY: [],
      });
    }

    // Shock waves — 3 rings expanding outward
    const shockWaves: ShockWave[] = [
      { r: R, maxR: R * 4.5, alpha: 0.9, color: '255,255,255' },
      { r: R * 0.8, maxR: R * 3.8, alpha: 0.65, color: '108,92,231' },
      { r: R * 0.6, maxR: R * 2.8, alpha: 0.5, color: '0,209,255' },
    ];

    burst.active = true;
    burst.phase = 'explode';
    burst.flashAlpha = 1.0;
    burst.particles = particles;
    burst.shockWaves = shockWaves;
    burst.progress = 0;
  }, []);

  const handleCanvasInteract = useCallback((clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    const { cx, cy, R } = orbCenterRef.current;
    const dist = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
    // Hit area slightly larger than sphere for easier tapping on mobile
    if (dist <= R * 1.4) {
      triggerBurst();
    }
  }, [triggerBurst]);

  const handleStart = () => {
    setVisible(false);
    setTimeout(onStart, 350);
  };

  return (
    <div
      className="fixed inset-0 z-20 overflow-hidden"
      style={{
        opacity: visible ? 1 : 0,
        transition: 'opacity 0.4s ease',
      }}
    >
      {/* Full-screen canvas — background + sphere */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ display: 'block', cursor: 'pointer', zIndex: 1 }}
        onClick={(e) => handleCanvasInteract(e.clientX, e.clientY)}
        onTouchStart={(e) => {
          const touch = e.touches[0];
          if (touch) handleCanvasInteract(touch.clientX, touch.clientY);
        }}
      />

      {/* Content overlay — pointer-events-none so canvas click still works, except interactive children */}
      <div className="absolute inset-0 flex flex-col items-center h-full pt-16 pb-32 pointer-events-none" style={{ zIndex: 2 }}>

        {/* Title */}
        <div
          className="flex flex-col items-center mb-8"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? 'translateY(0)' : 'translateY(-18px)',
            transition: 'opacity 0.7s ease 0.2s, transform 0.7s ease 0.2s',
          }}
        >
          <div className="flex items-center gap-2.5 mb-4">
            <div
              className="w-9 h-9 flex items-center justify-center rounded-full"
              style={{
                background: 'linear-gradient(135deg, #6C5CE7, #00D1FF)',
                boxShadow: '0 0 22px rgba(108,92,231,0.8), 0 0 44px rgba(0,209,255,0.3)',
              }}
            >
              <i className="ri-star-fill text-white" style={{ fontSize: '15px' }} />
            </div>
            <h1
              className="font-orbitron font-black tracking-widest"
              style={{
                fontSize: '24px',
                background: 'linear-gradient(135deg, #F0EAFF 0%, #00D1FF 45%, #E0EFFF 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                textShadow: 'none',
                filter: 'drop-shadow(0 0 12px rgba(108,92,231,0.5))',
              }}
            >
              元识・星分身
            </h1>
          </div>
          <p
            className="font-noto text-center leading-relaxed"
            style={{ color: 'rgba(224,239,255,0.88)', fontSize: '14px', letterSpacing: '0.1em' }}
          >
            不见其人，先见其魂
          </p>
          <p
            className="font-noto text-center mt-1.5"
            style={{ color: 'rgba(162,155,254,0.75)', fontSize: '12px', letterSpacing: '0.05em' }}
          >
            铸造一个分身，帮你在宇宙里寻缘
          </p>
        </div>

        {/* Spacer for sphere area */}
        <div className="flex-1" />

        {/* Privacy hint — sits just below sphere visually */}
        <div
          className="flex flex-col items-center gap-4 mb-4"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? 'translateY(0)' : 'translateY(14px)',
            transition: 'opacity 0.7s ease 0.5s, transform 0.7s ease 0.5s',
          }}
        >
          <div
            className="flex items-center gap-1.5 px-4 py-2 rounded-full"
            style={{
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              background: 'rgba(0,209,255,0.06)',
              border: '1px solid rgba(0,209,255,0.22)',
            }}
          >
            <i className="ri-shield-check-fill" style={{ color: '#00D1FF', fontSize: '12px' }} />
            <span className="font-noto" style={{ color: 'rgba(0,209,255,0.9)', fontSize: '11px' }}>
              全程100%隐私保护，无风险
            </span>
          </div>

          {/* Feature pills */}
          <div className="flex gap-2 flex-wrap justify-center px-6">
            {[
              { icon: 'ri-robot-line', text: 'AI人格铸造' },
              { icon: 'ri-shield-keyhole-line', text: '匿名运行' },
              { icon: 'ri-sparkling-2-line', text: '灵魂匹配' },
            ].map((item) => (
              <div
                key={item.text}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
                style={{
                  backdropFilter: 'blur(16px)',
                  WebkitBackdropFilter: 'blur(16px)',
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.1)',
                }}
              >
                <i className={item.icon} style={{ color: '#A29BFE', fontSize: '12px' }} />
                <span className="font-noto text-xs" style={{ color: 'rgba(224,239,255,0.7)' }}>
                  {item.text}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA button — fixed bottom, above canvas */}
      <div
        className="fixed bottom-0 left-0 right-0 px-6 pb-10 pt-6"
        style={{
          zIndex: 10,
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0)' : 'translateY(24px)',
          transition: 'opacity 0.7s ease 0.7s, transform 0.7s ease 0.7s',
          background: 'linear-gradient(to top, rgba(5,5,16,0.97) 55%, transparent)',
          pointerEvents: 'auto',
        }}
      >
        <button
          onClick={handleStart}
          className="w-full py-4 rounded-2xl font-orbitron text-sm font-black tracking-widest cursor-pointer transition-all duration-200 active:scale-95 whitespace-nowrap relative overflow-hidden"
          style={{
            background: 'linear-gradient(125deg, #3D1FA3 0%, #7B3FBE 30%, #C8527A 65%, #E8935A 100%)',
            color: '#fff',
            boxShadow: '0 0 32px rgba(120,60,180,0.65), 0 0 64px rgba(200,82,122,0.3)',
            maxWidth: '400px',
            margin: '0 auto',
            display: 'block',
          }}
        >
          <span className="relative z-10 flex items-center justify-center gap-2">
            <i className="ri-rocket-line" style={{ fontSize: '16px' }} />
            开始铸造
          </span>
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'linear-gradient(105deg, transparent 25%, rgba(255,255,255,0.18) 50%, transparent 75%)',
              animation: 'shimmerBtn 2.8s infinite',
            }}
          />
        </button>
      </div>

      <style>{`
        @keyframes shimmerBtn {
          0% { transform: translateX(-120%); }
          100% { transform: translateX(220%); }
        }
        @keyframes pulseHint {
          0%, 100% { opacity: 0.55; transform: scale(1); }
          50% { opacity: 0.9; transform: scale(1.04); }
        }
      `}</style>
    </div>
  );
}
