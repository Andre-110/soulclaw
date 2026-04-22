import { useState, useEffect, useRef } from 'react';

interface Props {
  onComplete: () => void;
}

const SCAN_TEXTS = [
  '正在连接星际匹配网络...',
  '扫描宇宙频率共振波段...',
  '分析 2,847 位星友的灵魂图谱...',
  '比对三观契合度矩阵...',
  '捕捉深空中的同频信号...',
  '过滤宇宙噪声，锁定目标星体...',
  '量子纠缠验证中...',
  '星际通道建立成功，载入数据...',
  '发现高匹配星友，解码信息包...',
  '星轨对齐完毕，匹配结果就绪！',
];

const FOUND_COUNT = 3;
const TOTAL_DURATION = 10000;

export default function StarSearchLoading({ onComplete }: Props) {
  const [progress, setProgress] = useState(0);
  const [currentText, setCurrentText] = useState(SCAN_TEXTS[0]);
  const [textIndex, setTextIndex] = useState(0);
  const [particles, setParticles] = useState<{ id: number; x: number; y: number; size: number; opacity: number; speed: number }[]>([]);
  const [rings, setRings] = useState<{ id: number; scale: number; opacity: number }[]>([]);
  const [foundStars, setFoundStars] = useState<number[]>([]);
  const [pulsing, setPulsing] = useState(false);
  const animFrameRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);

  // Init particles
  useEffect(() => {
    const pts = Array.from({ length: 60 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 2.5 + 0.5,
      opacity: Math.random() * 0.7 + 0.1,
      speed: Math.random() * 0.015 + 0.005,
    }));
    setParticles(pts);

    const ringsData = Array.from({ length: 4 }, (_, i) => ({
      id: i,
      scale: 0.3 + i * 0.25,
      opacity: 0.6 - i * 0.1,
    }));
    setRings(ringsData);
  }, []);

  // Progress animation
  useEffect(() => {
    const animate = (timestamp: number) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp;
      const elapsed = timestamp - startTimeRef.current;
      const pct = Math.min((elapsed / TOTAL_DURATION) * 100, 100);
      setProgress(pct);

      // reveal found stars
      if (pct > 55 && !foundStars.includes(0)) setFoundStars([0]);
      if (pct > 75 && !foundStars.includes(1)) setFoundStars([0, 1]);
      if (pct > 90 && !foundStars.includes(2)) setFoundStars([0, 1, 2]);

      if (pct < 100) {
        animFrameRef.current = requestAnimationFrame(animate);
      } else {
        setTimeout(onComplete, 400);
      }
    };
    animFrameRef.current = requestAnimationFrame(animate);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Cycle scan texts
  useEffect(() => {
    const interval = TOTAL_DURATION / SCAN_TEXTS.length;
    const timer = setInterval(() => {
      setTextIndex((prev) => {
        const next = Math.min(prev + 1, SCAN_TEXTS.length - 1);
        setCurrentText(SCAN_TEXTS[next]);
        setPulsing(true);
        setTimeout(() => setPulsing(false), 400);
        return next;
      });
    }, interval);
    return () => clearInterval(timer);
  }, []);

  const STAR_COLORS = ['#00D1FF', '#A29BFE', '#FF7675'];
  const STAR_IDS = ['STAR-2918-HN', 'STAR-5537-QV', 'STAR-8064-LT'];
  const STAR_SCORES = [91, 84, 78];
  const STAR_TAGS = [
    ['宇宙探索', '深夜哲学'],
    ['独立音乐', '极简生活'],
    ['城市漫步', '冥想正念'],
  ];
  const STAR_ICONS = ['ri-star-fill', 'ri-bubble-chart-fill', 'ri-record-circle-fill'];

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden"
      style={{ background: 'radial-gradient(ellipse at 50% 40%, #0D0B2B 0%, #0A0818 40%, #060612 100%)' }}
    >
      {/* Starfield particles */}
      <div className="absolute inset-0 pointer-events-none">
        {particles.map((p) => (
          <div
            key={p.id}
            className="absolute rounded-full"
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: `${p.size}px`,
              height: `${p.size}px`,
              background: p.id % 3 === 0 ? '#A29BFE' : p.id % 3 === 1 ? '#00D1FF' : '#ffffff',
              opacity: p.opacity,
              animation: `twinkle ${2 + p.speed * 100}s ease-in-out infinite`,
              animationDelay: `${p.id * 0.08}s`,
            }}
          />
        ))}
      </div>

      {/* Nebula glow background */}
      <div
        className="absolute rounded-full pointer-events-none"
        style={{
          width: '600px',
          height: '600px',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: 'radial-gradient(circle, rgba(108,92,231,0.08) 0%, rgba(0,209,255,0.05) 40%, transparent 70%)',
          filter: 'blur(40px)',
        }}
      />

      {/* Main content */}
      <div className="relative flex flex-col items-center gap-8 px-6 w-full max-w-sm">

        {/* Orbit rings + center core */}
        <div className="relative flex items-center justify-center" style={{ width: '220px', height: '220px' }}>
          {/* Rings */}
          {rings.map((ring, i) => (
            <div
              key={ring.id}
              className="absolute rounded-full"
              style={{
                width: `${60 + i * 44}px`,
                height: `${60 + i * 44}px`,
                border: `1px solid rgba(162,155,254,${ring.opacity * 0.4})`,
                animation: `spin-${i % 2 === 0 ? 'cw' : 'ccw'} ${8 + i * 4}s linear infinite`,
                boxShadow: i === 0 ? '0 0 12px rgba(108,92,231,0.3)' : 'none',
              }}
            >
              {/* Dot on ring */}
              {i < 3 && (
                <div
                  className="absolute rounded-full"
                  style={{
                    width: `${5 - i}px`,
                    height: `${5 - i}px`,
                    top: '-2px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: STAR_COLORS[i % 3],
                    boxShadow: `0 0 8px ${STAR_COLORS[i % 3]}`,
                  }}
                />
              )}
            </div>
          ))}

          {/* Core orb */}
          <div
            className="relative z-10 flex items-center justify-center rounded-full"
            style={{
              width: '64px',
              height: '64px',
              background: 'linear-gradient(135deg, rgba(108,92,231,0.4), rgba(0,209,255,0.3))',
              backdropFilter: 'blur(16px)',
              border: '1.5px solid rgba(162,155,254,0.6)',
              boxShadow: '0 0 30px rgba(108,92,231,0.4), 0 0 60px rgba(0,209,255,0.15), inset 0 1px 0 rgba(255,255,255,0.2)',
              animation: 'pulse-core 2s ease-in-out infinite',
            }}
          >
            <i className="ri-radar-line text-2xl" style={{ color: '#A29BFE', filter: 'drop-shadow(0 0 6px rgba(162,155,254,0.8))' }} />
          </div>

          {/* Scan beam */}
          <div
            className="absolute rounded-full pointer-events-none"
            style={{
              width: '200px',
              height: '200px',
              background: 'conic-gradient(from 0deg, transparent 340deg, rgba(0,209,255,0.12) 355deg, rgba(0,209,255,0.25) 360deg)',
              animation: 'spin-cw 3s linear infinite',
              top: '10px',
              left: '10px',
            }}
          />
        </div>

        {/* Scan text */}
        <div className="text-center">
          <p
            className="font-orbitron text-base font-bold mb-1"
            style={{
              color: '#E0EFFF',
              filter: 'drop-shadow(0 0 8px rgba(162,155,254,0.5))',
              transition: 'opacity 0.3s',
              opacity: pulsing ? 0.4 : 1,
            }}
          >
            星际搜索中
          </p>
          <p
            className="font-noto text-xs leading-relaxed"
            style={{
              color: 'rgba(162,155,254,0.85)',
              minHeight: '20px',
              transition: 'opacity 0.2s',
              opacity: pulsing ? 0 : 1,
            }}
          >
            {currentText}
          </p>
        </div>

        {/* Progress bar */}
        <div className="w-full">
          <div className="flex items-center justify-between mb-2">
            <span className="font-orbitron text-xs" style={{ color: 'rgba(162,155,254,0.7)' }}>
              扫描进度
            </span>
            <span className="font-orbitron text-xs font-bold" style={{ color: '#00D1FF' }}>
              {Math.floor(progress)}%
            </span>
          </div>
          <div
            className="w-full h-1.5 rounded-full overflow-hidden"
            style={{ background: 'rgba(255,255,255,0.06)' }}
          >
            <div
              className="h-full rounded-full transition-all duration-200"
              style={{
                width: `${progress}%`,
                background: 'linear-gradient(90deg, #6C5CE7, #00D1FF)',
                boxShadow: '0 0 8px rgba(0,209,255,0.6)',
              }}
            />
          </div>
        </div>

        {/* Found stars preview */}
        <div className="w-full flex flex-col gap-2.5">
          <p className="font-noto text-xs text-center" style={{ color: 'rgba(224,239,255,0.45)' }}>
            {foundStars.length > 0 ? `已发现 ${foundStars.length} 位同频星友` : '搜寻星际信号中...'}
          </p>
          {foundStars.map((idx) => (
            <div
              key={idx}
              className="flex items-center gap-3 p-3 rounded-2xl"
              style={{
                background: 'linear-gradient(135deg,rgba(255,255,255,0.07),rgba(255,255,255,0.04))',
                backdropFilter: 'blur(16px)',
                border: `1px solid ${STAR_COLORS[idx]}40`,
                boxShadow: `0 0 12px ${STAR_COLORS[idx]}15`,
                animation: 'slide-in 0.4s ease-out',
              }}
            >
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{
                  background: `linear-gradient(135deg,${STAR_COLORS[idx]}30,${STAR_COLORS[idx]}15)`,
                  border: `1px solid ${STAR_COLORS[idx]}50`,
                }}
              >
                <i className={`${STAR_ICONS[idx]} text-base`} style={{ color: STAR_COLORS[idx] }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-orbitron text-xs font-bold mb-1" style={{ color: '#E0EFFF' }}>{STAR_IDS[idx]}</p>
                <div className="flex gap-1 flex-wrap">
                  {STAR_TAGS[idx].map((tag) => (
                    <span
                      key={tag}
                      className="font-noto rounded-full"
                      style={{ background: 'rgba(108,92,231,0.18)', color: '#C4BBFF', border: '1px solid rgba(108,92,231,0.25)', fontSize: '9px', padding: '1px 7px' }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <p
                  className="font-orbitron text-lg font-black"
                  style={{ color: STAR_COLORS[idx], filter: `drop-shadow(0 0 6px ${STAR_COLORS[idx]}80)` }}
                >
                  {STAR_SCORES[idx]}
                </p>
                <p style={{ color: 'rgba(224,239,255,0.4)', fontSize: '9px' }} className="font-noto">契合度</p>
              </div>
            </div>
          ))}
        </div>

        {/* Step dots */}
        <div className="flex items-center gap-2">
          {SCAN_TEXTS.map((_, i) => (
            <div
              key={i}
              className="rounded-full transition-all duration-300"
              style={{
                width: i === textIndex ? '16px' : '4px',
                height: '4px',
                background: i <= textIndex
                  ? `linear-gradient(90deg, #6C5CE7, #00D1FF)`
                  : 'rgba(255,255,255,0.15)',
              }}
            />
          ))}
        </div>
      </div>

      <style>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.2; transform: scale(1); }
          50% { opacity: 0.9; transform: scale(1.3); }
        }
        @keyframes spin-cw {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes spin-ccw {
          from { transform: rotate(0deg); }
          to { transform: rotate(-360deg); }
        }
        @keyframes pulse-core {
          0%, 100% { box-shadow: 0 0 30px rgba(108,92,231,0.4), 0 0 60px rgba(0,209,255,0.15), inset 0 1px 0 rgba(255,255,255,0.2); }
          50% { box-shadow: 0 0 45px rgba(108,92,231,0.65), 0 0 80px rgba(0,209,255,0.25), inset 0 1px 0 rgba(255,255,255,0.2); }
        }
        @keyframes slide-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
