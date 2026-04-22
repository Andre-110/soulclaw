// Simulator intro copy
const CARD_INTROS: Record<number, string> = {
  1:  'PUA领导让你载几个锅？今天逆风翻盘！',
  2:  '一份PPT，能走多远的路？',
  3:  '车库里的idea，能不能改变世界？',
  4:  '如果当年你是那个男神/女神……',
  5:  '公司台阶只剩了2块5，结局走向千亿富翁',
  21: '多玩法并行，独立故事线随时切换',
  22: '青椒一年不只拼论文，还拼心气和体力',
  23: '成绩、热搜、状态曲线，一起决定赛季命运',
  24: '现金流见底之前，先把方向找对',
  25: '拍片最怕的不是没钱，是每个决定都像事故前夜',
  26: '重建不是修东西，是修回人对系统的信任',
  27: '每个人都说想改革，真动起来时所有阻力都会现形',
  5:  '背包一包，灵魂去流浪',
  6:  '孤岛，几头猪，亿万富翁的起点',
  7:  '从无名素人到万人宠粉',
  8:  '高考最后一晚，你会选择睡觉吗？',
  9:  '一件T恤，能不能撑起整条街？',
  10: '荒野深处，只剩自己和星空',
  11: '一个人，一辆车，318国道',
  12: '下午3点，属于你的那杯咖啡',
  13: '台下800人，你要不要开嗓？',
  14: '把院子做成全网最美民宿',
  15: '油门到底，前方直道弯道都不停',
  16: '把脑海里的世界画出来给全世界看',
  17: '你杀了我，还是我杀了你？',
  18: '把每个日落都变成人生high光',
  19: '一只猫带来的，意想不到的治愈',
  20: '凌晨4点，银河在你头顶流过',
};

// iOS-style liquid glass color themes — vibrant tints with high-saturation accents
const CARD_THEMES: Record<number, {
  tint: string;       // accent color (for icon bg, border, label)
  glass: string;      // glass card bg gradient
  shimmer: string;    // subtle top-edge shimmer
  dot: string;        // label dot color
}> = {
  1:  { tint: '#FF6B6B', glass: 'linear-gradient(145deg, rgba(255,107,107,0.18) 0%, rgba(18,16,40,0.72) 100%)', shimmer: 'rgba(255,160,130,0.28)', dot: '#FF6B6B' },
  2:  { tint: '#00D2FF', glass: 'linear-gradient(145deg, rgba(0,210,255,0.16) 0%, rgba(16,18,42,0.74) 100%)', shimmer: 'rgba(0,210,255,0.25)', dot: '#00D2FF' },
  3:  { tint: '#A78BFA', glass: 'linear-gradient(145deg, rgba(167,139,250,0.18) 0%, rgba(18,16,42,0.72) 100%)', shimmer: 'rgba(167,139,250,0.26)', dot: '#A78BFA' },
  4:  { tint: '#F472B6', glass: 'linear-gradient(145deg, rgba(244,114,182,0.16) 0%, rgba(20,16,40,0.74) 100%)', shimmer: 'rgba(244,114,182,0.24)', dot: '#F472B6' },
  5:  { tint: '#FDCB6E', glass: 'linear-gradient(145deg, rgba(253,203,110,0.18) 0%, rgba(20,16,36,0.74) 100%)', shimmer: 'rgba(253,203,110,0.28)', dot: '#FDCB6E' },
  21: { tint: '#74B9FF', glass: 'linear-gradient(145deg, rgba(116,185,255,0.18) 0%, rgba(15,18,42,0.74) 100%)', shimmer: 'rgba(116,185,255,0.28)', dot: '#74B9FF' },
  22: { tint: '#6EE7B7', glass: 'linear-gradient(145deg, rgba(110,231,183,0.17) 0%, rgba(16,20,40,0.74) 100%)', shimmer: 'rgba(110,231,183,0.25)', dot: '#6EE7B7' },
  23: { tint: '#A78BFA', glass: 'linear-gradient(145deg, rgba(167,139,250,0.18) 0%, rgba(18,16,42,0.74) 100%)', shimmer: 'rgba(167,139,250,0.26)', dot: '#A78BFA' },
  24: { tint: '#F97316', glass: 'linear-gradient(145deg, rgba(249,115,22,0.17) 0%, rgba(20,14,36,0.74) 100%)', shimmer: 'rgba(249,115,22,0.26)', dot: '#F97316' },
  25: { tint: '#38BDF8', glass: 'linear-gradient(145deg, rgba(56,189,248,0.16) 0%, rgba(14,18,42,0.74) 100%)', shimmer: 'rgba(56,189,248,0.24)', dot: '#38BDF8' },
  26: { tint: '#4ADE80', glass: 'linear-gradient(145deg, rgba(74,222,128,0.16) 0%, rgba(14,20,36,0.74) 100%)', shimmer: 'rgba(74,222,128,0.24)', dot: '#4ADE80' },
  27: { tint: '#FBBF24', glass: 'linear-gradient(145deg, rgba(251,191,36,0.17) 0%, rgba(20,18,36,0.74) 100%)', shimmer: 'rgba(251,191,36,0.26)', dot: '#FBBF24' },
  5:  { tint: '#FB923C', glass: 'linear-gradient(145deg, rgba(251,146,60,0.17) 0%, rgba(20,16,36,0.74) 100%)', shimmer: 'rgba(251,146,60,0.26)', dot: '#FB923C' },
  6:  { tint: '#34D399', glass: 'linear-gradient(145deg, rgba(52,211,153,0.16) 0%, rgba(16,20,38,0.74) 100%)', shimmer: 'rgba(52,211,153,0.24)', dot: '#34D399' },
  7:  { tint: '#FBBF24', glass: 'linear-gradient(145deg, rgba(251,191,36,0.17) 0%, rgba(20,18,36,0.74) 100%)', shimmer: 'rgba(251,191,36,0.26)', dot: '#FBBF24' },
  8:  { tint: '#6EE7B7', glass: 'linear-gradient(145deg, rgba(110,231,183,0.16) 0%, rgba(16,20,40,0.74) 100%)', shimmer: 'rgba(110,231,183,0.24)', dot: '#6EE7B7' },
  9:  { tint: '#F87171', glass: 'linear-gradient(145deg, rgba(248,113,113,0.17) 0%, rgba(20,16,38,0.74) 100%)', shimmer: 'rgba(248,113,113,0.25)', dot: '#F87171' },
  10: { tint: '#67E8F9', glass: 'linear-gradient(145deg, rgba(103,232,249,0.16) 0%, rgba(14,20,42,0.74) 100%)', shimmer: 'rgba(103,232,249,0.24)', dot: '#67E8F9' },
  11: { tint: '#818CF8', glass: 'linear-gradient(145deg, rgba(129,140,248,0.18) 0%, rgba(16,16,42,0.72) 100%)', shimmer: 'rgba(129,140,248,0.26)', dot: '#818CF8' },
  12: { tint: '#FCD34D', glass: 'linear-gradient(145deg, rgba(252,211,77,0.17) 0%, rgba(20,18,36,0.74) 100%)', shimmer: 'rgba(252,211,77,0.26)', dot: '#FCD34D' },
  13: { tint: '#F97316', glass: 'linear-gradient(145deg, rgba(249,115,22,0.17) 0%, rgba(20,14,36,0.74) 100%)', shimmer: 'rgba(249,115,22,0.26)', dot: '#F97316' },
  14: { tint: '#4ADE80', glass: 'linear-gradient(145deg, rgba(74,222,128,0.16) 0%, rgba(14,20,36,0.74) 100%)', shimmer: 'rgba(74,222,128,0.24)', dot: '#4ADE80' },
  15: { tint: '#FCA5A5', glass: 'linear-gradient(145deg, rgba(252,165,165,0.16) 0%, rgba(20,14,38,0.74) 100%)', shimmer: 'rgba(252,165,165,0.24)', dot: '#FCA5A5' },
  16: { tint: '#E879F9', glass: 'linear-gradient(145deg, rgba(232,121,249,0.16) 0%, rgba(20,14,40,0.74) 100%)', shimmer: 'rgba(232,121,249,0.24)', dot: '#E879F9' },
  17: { tint: '#C084FC', glass: 'linear-gradient(145deg, rgba(192,132,252,0.18) 0%, rgba(18,12,40,0.74) 100%)', shimmer: 'rgba(192,132,252,0.26)', dot: '#C084FC' },
  18: { tint: '#38BDF8', glass: 'linear-gradient(145deg, rgba(56,189,248,0.16) 0%, rgba(14,18,42,0.74) 100%)', shimmer: 'rgba(56,189,248,0.24)', dot: '#38BDF8' },
  19: { tint: '#FDE68A', glass: 'linear-gradient(145deg, rgba(253,230,138,0.16) 0%, rgba(20,18,36,0.74) 100%)', shimmer: 'rgba(253,230,138,0.24)', dot: '#FDE68A' },
  20: { tint: '#A5B4FC', glass: 'linear-gradient(145deg, rgba(165,180,252,0.18) 0%, rgba(16,14,42,0.72) 100%)', shimmer: 'rgba(165,180,252,0.26)', dot: '#A5B4FC' },
};

interface Simulator {
  id: number;
  name: string;
  icon: string;
  color: string;
  desc: string;
}

interface Props {
  sim: Simulator;
  onClick: (sim: Simulator) => void;
}

export default function SimulatorCard({ sim, onClick }: Props) {
  const theme = CARD_THEMES[sim.id] || CARD_THEMES[1];
  const intro = CARD_INTROS[sim.id] || sim.desc;

  return (
    <button
      onClick={() => onClick(sim)}
      className="flex flex-col gap-2 p-3 rounded-2xl cursor-pointer transition-all duration-200 active:scale-95 text-left w-full relative overflow-hidden"
      style={{
        background: theme.glass,
        backdropFilter: 'blur(40px) saturate(220%) brightness(1.08)',
        WebkitBackdropFilter: 'blur(40px) saturate(220%) brightness(1.08)',
        border: `1px solid ${theme.tint}38`,
        boxShadow: [
          `0 8px 32px rgba(0,0,0,0.45)`,
          `0 2px 8px rgba(0,0,0,0.3)`,
          `inset 0 1.5px 0 ${theme.shimmer}`,
          `inset 0 -1px 0 rgba(0,0,0,0.25)`,
          `0 0 0 0.5px ${theme.tint}18`,
          `0 4px 24px ${theme.tint}18`,
        ].join(','),
        minHeight: '108px',
      }}
    >
      {/* Top specular highlight strip — iOS liquid glass signature */}
      <div
        className="absolute top-0 left-0 right-0 pointer-events-none"
        style={{
          height: '40%',
          background: `linear-gradient(180deg, ${theme.shimmer} 0%, transparent 100%)`,
          opacity: 0.18,
          borderRadius: '16px 16px 40% 40%',
        }}
      />
      {/* Bright specular line */}
      <div
        className="absolute top-0 left-4 right-4 pointer-events-none"
        style={{
          height: '1.5px',
          background: `linear-gradient(90deg, transparent 0%, ${theme.shimmer} 30%, rgba(255,255,255,0.55) 50%, ${theme.shimmer} 70%, transparent 100%)`,
          borderRadius: '0 0 8px 8px',
        }}
      />

      {/* Icon row */}
      <div className="flex items-center justify-between">
        <div
          className="w-7 h-7 flex items-center justify-center rounded-xl"
          style={{
            background: `${theme.tint}1A`,
            border: `1px solid ${theme.tint}30`,
          }}
        >
          <i className={`${sim.icon} text-xs`} style={{ color: theme.tint }} />
        </div>
        {/* Subtle accent dot */}
        <div
          className="w-1.5 h-1.5 rounded-full"
          style={{ background: theme.tint, opacity: 0.55, boxShadow: `0 0 6px ${theme.tint}` }}
        />
      </div>

      {/* Name */}
      <p
        className="text-sm leading-tight"
        style={{
          color: '#ECF0FF',
          fontFamily: "'Inter','Noto Sans SC',sans-serif",
          fontWeight: 600,
          letterSpacing: '-0.01em',
        }}
      >
        {sim.name}
      </p>

      {/* Intro copy */}
      <p
        className="text-xs leading-snug flex-1"
        style={{
          color: 'rgba(220,228,255,0.58)',
          fontFamily: "'Inter','Noto Sans SC',sans-serif",
          fontWeight: 400,
        }}
      >
        {intro}
      </p>

      {/* CTA micro label */}
      <div className="flex items-center gap-1">
        <span
          className="text-xs"
          style={{
            color: theme.tint,
            fontFamily: "'Inter','Noto Sans SC',sans-serif",
            fontWeight: 500,
            fontSize: '10px',
            opacity: 0.85,
          }}
        >
          开始模拟
        </span>
        <i className="ri-arrow-right-line" style={{ color: theme.tint, fontSize: '10px', opacity: 0.7 }} />
      </div>
    </button>
  );
}
