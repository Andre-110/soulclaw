import { useState, useRef } from 'react';
import { MOCK_MATCHES, NEW_MATCHES, MatchItem } from '@/mocks/starData';

const AVATAR_CONFIG: Record<string, { color: string; icon: string }> = {
  nebula:        { color: '#6C5CE7', icon: 'ri-bubble-chart-fill' },
  constellation: { color: '#00D1FF', icon: 'ri-star-fill' },
  ring:          { color: '#A29BFE', icon: 'ri-record-circle-fill' },
  comet:         { color: '#74B9FF', icon: 'ri-flashlight-fill' },
  blackhole:     { color: '#8B7CF8', icon: 'ri-focus-3-fill' },
};

type FilterTab = 'all' | 'new' | 'ai' | 'human';

interface Props {
  onSelect: (matchId: string, mode?: 'ai' | 'human') => void;
  extraMatches?: MatchItem[];
  onSearch?: () => void;
}

/* ─── Destroy confirm modal ─── */
function DestroyModal({
  match,
  onConfirm,
  onCancel,
}: {
  match: MatchItem;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const cfg = AVATAR_CONFIG[match.avatarType] || AVATAR_CONFIG.constellation;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-6"
      style={{ background: 'rgba(0,0,0,0.72)', backdropFilter: 'blur(8px)' }}
      onClick={onCancel}
    >
      <div
        className="w-full max-w-xs p-6 rounded-3xl flex flex-col items-center gap-5"
        style={{
          background: 'linear-gradient(145deg,rgba(20,16,40,0.98),rgba(15,15,30,0.99))',
          border: '1px solid rgba(255,75,75,0.22)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* warning icon */}
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center"
          style={{
            background: 'rgba(255,75,75,0.1)',
            border: '1px solid rgba(255,75,75,0.25)',
          }}
        >
          <i className="ri-delete-bin-line text-3xl" style={{ color: '#FF4B4B' }} />
        </div>

        <div className="text-center">
          <p className="font-orbitron text-base font-bold mb-2" style={{ color: '#E0EFFF' }}>
            销毁星友
          </p>
          <p className="font-noto text-sm leading-relaxed" style={{ color: 'rgba(224,239,255,0.6)' }}>
            将从你的星球直接销毁{' '}
            <span className="font-semibold" style={{ color: cfg.color }}>{match.id}</span>
            ，此操作不可撤销。
          </p>
        </div>

        <div className="flex gap-3 w-full">
          <button
            onClick={onCancel}
            className="flex-1 py-3 rounded-2xl font-noto text-sm font-semibold whitespace-nowrap cursor-pointer transition-all duration-200 active:scale-95"
            style={{
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.12)',
              color: 'rgba(224,239,255,0.6)',
            }}
          >
            再想想
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-3 rounded-2xl font-noto text-sm font-bold whitespace-nowrap cursor-pointer transition-all duration-200 active:scale-95"
            style={{
              background: 'linear-gradient(135deg,rgba(255,75,75,0.2),rgba(255,75,75,0.12))',
              border: '1px solid rgba(255,75,75,0.4)',
              color: '#FF7575',
              boxShadow: '0 0 12px rgba(255,75,75,0.15)',
            }}
          >
            确认销毁
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── compact thumbnail card (>24h) ─── */
function ThumbCard({
  m,
  avatarCfg,
  onClick,
}: {
  m: MatchItem;
  avatarCfg: { color: string; icon: string };
  onClick: () => void;
}) {
  const hoursOld = (Date.now() - new Date(m.addedAt).getTime()) / 3600000;
  const isExpiring = hoursOld > 48;

  return (
    <button
      onClick={onClick}
      className="flex-shrink-0 flex flex-row items-center gap-2 px-2.5 py-1.5 rounded-xl cursor-pointer transition-all duration-200 active:scale-95 relative overflow-hidden"
      style={{
        minWidth: '120px',
        maxWidth: '150px',
        background: `linear-gradient(160deg,${avatarCfg.color}1A 0%,rgba(20,16,42,0.82) 100%)`,
        backdropFilter: 'blur(32px) saturate(200%)',
        WebkitBackdropFilter: 'blur(32px) saturate(200%)',
        border: `1px solid ${isExpiring ? 'rgba(253,203,110,0.5)' : avatarCfg.color + '45'}`,
        boxShadow: [
          `0 4px 16px rgba(0,0,0,0.45)`,
          `0 1px 4px rgba(0,0,0,0.3)`,
          `inset 0 1px 0 rgba(255,255,255,0.1)`,
          `0 0 10px ${avatarCfg.color}14`,
        ].join(','),
      }}
    >
      {/* Glass top line */}
      <div
        className="absolute top-0 left-2 right-2 pointer-events-none"
        style={{ height: '1px', background: `linear-gradient(90deg,transparent,rgba(255,255,255,0.35),transparent)` }}
      />
      {/* Avatar icon */}
      <div
        className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{
          background: `linear-gradient(135deg,${avatarCfg.color}25,${avatarCfg.color}10)`,
          border: `1.5px solid ${avatarCfg.color}45`,
        }}
      >
        <i className={`${avatarCfg.icon} text-xs`} style={{ color: avatarCfg.color }} />
      </div>
      {/* Info */}
      <div className="flex flex-col min-w-0">
        <span className="font-orbitron text-[9px] font-medium leading-tight truncate" style={{ color: 'rgba(224,239,255,0.65)' }}>
          {m.id.replace('STAR-', '')}
        </span>
        <div className="flex items-center gap-1">
          <span className="font-orbitron text-[11px] font-black" style={{ color: m.matchScore >= 85 ? '#00D1FF' : '#A29BFE' }}>
            {m.matchScore}
          </span>
          <span className="font-noto text-[8px]" style={{ color: 'rgba(224,239,255,0.35)' }}>%</span>
          {isExpiring && (
            <span className="font-noto font-medium" style={{ color: '#FDCB6E', fontSize: '8px' }}>·快过期</span>
          )}
          {m.aiChatActive && (
            <span className="font-noto" style={{ color: '#00D1FF', fontSize: '8px' }}>·AI</span>
          )}
          {m.humanChatActive && (
            <span className="font-noto" style={{ color: '#A29BFE', fontSize: '8px' }}>·真人</span>
          )}
        </div>
      </div>
    </button>
  );
}

/* ─── full card ─── */
function FullCard({
  m,
  avatarCfg,
  chatModes,
  onSelect,
  onStartAI,
  onStartHuman,
  onNotInterested,
}: {
  m: MatchItem;
  avatarCfg: { color: string; icon: string };
  chatModes: { ai: boolean; human: boolean };
  onSelect: () => void;
  onStartAI: (e: React.MouseEvent) => void;
  onStartHuman: (e: React.MouseEvent) => void;
  onNotInterested: (e: React.MouseEvent) => void;
}) {
  const aiActive = m.aiChatActive || chatModes.ai;
  const humanActive = m.humanChatActive || chatModes.human;

  const cardBorder = humanActive
    ? 'rgba(162,155,254,0.35)'
    : aiActive
    ? 'rgba(0,209,255,0.32)'
    : m.isNew
    ? avatarCfg.color + '40'
    : 'rgba(255,255,255,0.1)';

  const cardBg = humanActive
    ? `linear-gradient(135deg,rgba(162,155,254,0.1) 0%,rgba(255,255,255,0.05) 100%)`
    : aiActive
    ? `linear-gradient(135deg,rgba(0,209,255,0.1) 0%,rgba(108,92,231,0.07) 100%)`
    : m.isNew
    ? `linear-gradient(135deg,${avatarCfg.color}12 0%,rgba(255,255,255,0.05) 100%)`
    : 'linear-gradient(135deg,rgba(255,255,255,0.07) 0%,rgba(255,255,255,0.04) 100%)';

  const glowColor = humanActive
    ? 'rgba(162,155,254,0.2)'
    : aiActive
    ? 'rgba(0,209,255,0.18)'
    : m.isNew
    ? `${avatarCfg.color}15`
    : 'rgba(108,92,231,0.1)';

  const shimmerColor = humanActive
    ? 'rgba(162,155,254,0.35)'
    : aiActive
    ? 'rgba(0,209,255,0.32)'
    : m.isNew
    ? `${avatarCfg.color}40`
    : 'rgba(255,255,255,0.15)';

  return (
    <button
      onClick={onSelect}
      className="flex flex-col gap-2.5 p-3 rounded-2xl cursor-pointer transition-all duration-200 active:scale-[0.98] text-left w-full relative overflow-hidden"
      style={{
        background: cardBg,
        backdropFilter: 'blur(40px) saturate(200%) brightness(1.04)',
        WebkitBackdropFilter: 'blur(40px) saturate(200%) brightness(1.04)',
        border: `1px solid ${cardBorder}`,
        boxShadow: [
          `0 8px 32px rgba(0,0,0,0.5)`,
          `0 2px 8px rgba(0,0,0,0.3)`,
          `inset 0 1.5px 0 ${shimmerColor}`,
          `inset 0 -1px 0 rgba(0,0,0,0.2)`,
          `0 0 24px ${glowColor}`,
        ].join(','),
      }}
    >
      {/* Specular highlight line */}
      <div
        className="absolute top-0 left-4 right-4 pointer-events-none"
        style={{
          height: '1px',
          background: `linear-gradient(90deg, transparent, ${shimmerColor}, rgba(255,255,255,0.4), ${shimmerColor}, transparent)`,
        }}
      />

      {/* ── Row 1: Avatar + ID/badges + score ── */}
      <div className="flex items-center gap-2.5">
        {/* Avatar */}
        <div className="relative flex-shrink-0">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{
              background: `linear-gradient(135deg,${avatarCfg.color}28,${avatarCfg.color}10)`,
              border: `1.5px solid ${avatarCfg.color}45`,
            }}
          >
            <i className={`${avatarCfg.icon} text-sm`} style={{ color: avatarCfg.color }} />
          </div>
          {m.isNew && (
            <div
              className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full"
              style={{ background: avatarCfg.color, boxShadow: `0 0 4px ${avatarCfg.color}` }}
            />
          )}
        </div>

        {/* ID + badges */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1 flex-wrap">
            <span className="font-orbitron font-normal" style={{ color: 'rgba(224,239,255,0.4)', fontSize: '10px' }}>
              {m.id}
            </span>
            {m.isNew && (
              <span className="px-1.5 py-0.5 rounded-full font-noto font-medium whitespace-nowrap" style={{ background: `${avatarCfg.color}20`, color: avatarCfg.color, fontSize: '9px', border: `1px solid ${avatarCfg.color}40` }}>
                新
              </span>
            )}
            {aiActive && (
              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full font-noto font-medium whitespace-nowrap" style={{ background: 'rgba(0,209,255,0.12)', color: '#00D1FF', fontSize: '9px', border: '1px solid rgba(0,209,255,0.3)' }}>
                <span className="w-1 h-1 rounded-full animate-pulse inline-block" style={{ background: '#00D1FF' }} />
                AI中
              </span>
            )}
            {humanActive && (
              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full font-noto font-medium whitespace-nowrap" style={{ background: 'rgba(162,155,254,0.14)', color: '#C4BBFF', fontSize: '9px', border: '1px solid rgba(162,155,254,0.35)' }}>
                <span className="w-1 h-1 rounded-full animate-pulse inline-block" style={{ background: '#C4BBFF' }} />
                真人中
              </span>
            )}
          </div>
          {/* Tags inline */}
          <div className="flex gap-1 flex-wrap mt-1">
            {m.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="font-noto font-normal"
                style={{ color: `${avatarCfg.color}CC`, fontSize: '10px' }}
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>

        {/* Score */}
        <div className="flex items-baseline gap-0.5 flex-shrink-0">
          <span
            className="font-orbitron font-black"
            style={{
              fontSize: '22px',
              lineHeight: 1,
              color: m.matchScore >= 85 ? '#00D1FF' : '#A29BFE',
              filter: `drop-shadow(0 0 6px ${m.matchScore >= 85 ? 'rgba(0,209,255,0.45)' : 'rgba(162,155,254,0.4)'})`,
            }}
          >
            {m.matchScore}
          </span>
          <span className="font-noto font-normal" style={{ color: 'rgba(224,239,255,0.25)', fontSize: '10px' }}>%</span>
        </div>
      </div>

      {/* ── Row 2: Reason ── */}
      <p
        className="font-noto font-normal leading-snug line-clamp-2"
        style={{ color: 'rgba(224,239,255,0.65)', fontSize: '11px' }}
      >
        <i className="ri-sparkling-2-line mr-1" style={{ color: avatarCfg.color, fontSize: '10px' }} />
        {m.reason}
      </p>

      {/* ── Row 3: Action buttons ── */}
      <div onClick={(e) => e.stopPropagation()} className="flex gap-1.5">
        <button
          onClick={onStartAI}
          className="flex-1 flex items-center justify-center gap-1 py-2 rounded-xl whitespace-nowrap transition-all duration-200 active:scale-95 cursor-pointer"
          style={{
            background: aiActive ? 'rgba(0,209,255,0.15)' : 'rgba(0,209,255,0.06)',
            border: `1px solid ${aiActive ? 'rgba(0,209,255,0.4)' : 'rgba(0,209,255,0.18)'}`,
            boxShadow: aiActive ? '0 0 10px rgba(0,209,255,0.15)' : 'none',
          }}
        >
          <i className="ri-robot-line" style={{ color: '#00D1FF', fontSize: '12px' }} />
          <span className="font-noto font-medium" style={{ color: '#00D1FF', fontSize: '11px' }}>
            {aiActive ? 'AI中' : 'AI代聊'}
          </span>
        </button>

        <button
          onClick={onStartHuman}
          className="flex-1 flex items-center justify-center gap-1 py-2 rounded-xl whitespace-nowrap transition-all duration-200 active:scale-95 cursor-pointer"
          style={{
            background: humanActive ? 'rgba(162,155,254,0.18)' : 'rgba(162,155,254,0.06)',
            border: `1px solid ${humanActive ? 'rgba(162,155,254,0.45)' : 'rgba(162,155,254,0.18)'}`,
            boxShadow: humanActive ? '0 0 10px rgba(162,155,254,0.15)' : 'none',
          }}
        >
          <i className="ri-user-voice-line" style={{ color: '#C4BBFF', fontSize: '12px' }} />
          <span className="font-noto font-medium" style={{ color: '#C4BBFF', fontSize: '11px' }}>
            {humanActive ? '真人中' : '真人开聊'}
          </span>
        </button>

        <button
          onClick={onNotInterested}
          className="w-9 flex items-center justify-center rounded-xl transition-all duration-200 active:scale-95 cursor-pointer"
          style={{ background: 'rgba(255,75,75,0.05)', border: '1px solid rgba(255,75,75,0.15)' }}
          title="不感兴趣"
        >
          <i className="ri-close-line" style={{ color: 'rgba(255,100,100,0.45)', fontSize: '14px' }} />
        </button>
      </div>
    </button>
  );
}

const FILTER_TABS: { key: FilterTab; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'new', label: '新增星友' },
  { key: 'ai', label: 'AI代聊' },
  { key: 'human', label: '已真人开聊' },
];

const FILTER_ORDER: FilterTab[] = ['all', 'new', 'ai', 'human'];

export default function MatchList({ onSelect, extraMatches = [], onSearch }: Props) {
  const [filter, setFilter] = useState<FilterTab>('all');
  const swipeTouchStartX = useRef<number>(0);
  const swipeTouchStartY = useRef<number>(0);

  const handleSwipeStart = (e: React.TouchEvent) => {
    swipeTouchStartX.current = e.touches[0].clientX;
    swipeTouchStartY.current = e.touches[0].clientY;
  };

  const handleSwipeEnd = (e: React.TouchEvent) => {
    const dx = e.changedTouches[0].clientX - swipeTouchStartX.current;
    const dy = e.changedTouches[0].clientY - swipeTouchStartY.current;
    if (Math.abs(dx) < 40 || Math.abs(dx) < Math.abs(dy) * 1.5) return;
    const currentIdx = FILTER_ORDER.indexOf(filter);
    if (dx < 0 && currentIdx < FILTER_ORDER.length - 1) {
      setFilter(FILTER_ORDER[currentIdx + 1]);
    } else if (dx > 0 && currentIdx > 0) {
      setFilter(FILTER_ORDER[currentIdx - 1]);
    }
  };
  const [localModes, setLocalModes] = useState<Record<string, { ai: boolean; human: boolean }>>({});
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const [destroyTarget, setDestroyTarget] = useState<MatchItem | null>(null);
  const thumbScrollRef = useRef<HTMLDivElement>(null);

  const allMatches: MatchItem[] = [
    ...extraMatches,
    ...MOCK_MATCHES,
  ]
    .filter((m) => !dismissed.has(m.id))
    .sort((a, b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime());

  const now = Date.now();
  const recentMatches = allMatches.filter((m) => now - new Date(m.addedAt).getTime() < 24 * 3600 * 1000);
  const oldMatches = allMatches.filter((m) => now - new Date(m.addedAt).getTime() >= 24 * 3600 * 1000);

  const getMode = (id: string) => localModes[id] || { ai: false, human: false };
  const isAiActive = (m: MatchItem) => m.aiChatActive || getMode(m.id).ai;
  const isHumanActive = (m: MatchItem) => m.humanChatActive || getMode(m.id).human;

  const applyFilter = (list: MatchItem[]) => {
    if (filter === 'new') return list.filter((m) => m.isNew);
    if (filter === 'ai') return list.filter((m) => isAiActive(m));
    if (filter === 'human') return list.filter((m) => isHumanActive(m));
    return list;
  };

  const filteredRecent = applyFilter(recentMatches);
  const filteredOld = applyFilter(oldMatches);

  const handleStartAI = (e: React.MouseEvent, m: MatchItem) => {
    e.stopPropagation();
    setLocalModes((prev) => ({
      ...prev,
      [m.id]: { ai: true, human: prev[m.id]?.human || false },
    }));
    setTimeout(() => onSelect(m.id, 'ai'), 300);
  };

  const handleStartHuman = (e: React.MouseEvent, m: MatchItem) => {
    e.stopPropagation();
    setLocalModes((prev) => ({
      ...prev,
      [m.id]: { ai: prev[m.id]?.ai || false, human: true },
    }));
    setTimeout(() => onSelect(m.id, 'human'), 300);
  };

  const handleNotInterested = (e: React.MouseEvent, m: MatchItem) => {
    e.stopPropagation();
    setDestroyTarget(m);
  };

  const confirmDestroy = () => {
    if (destroyTarget) {
      setDismissed((prev) => new Set([...prev, destroyTarget.id]));
      setDestroyTarget(null);
    }
  };

  return (
    <div
      className="flex flex-col gap-0 pb-6"
      onTouchStart={handleSwipeStart}
      onTouchEnd={handleSwipeEnd}
    >
      {/* ── Header ── */}
      <div className="px-4 pt-12 pb-4">
        <h1 className="font-orbitron text-xl font-black mb-1 text-primary">星轨匹配</h1>
        <p className="text-xs font-noto text-tertiary">AI分身已为你物色了同频星友</p>
      </div>

      {/* ── Status bar ── */}
      <div
        className="mx-4 mb-4 flex items-center gap-3 p-3 rounded-2xl"
        style={{
          background: 'linear-gradient(135deg,rgba(0,209,255,0.1),rgba(108,92,231,0.07))',
          backdropFilter: 'blur(14px)',
          WebkitBackdropFilter: 'blur(14px)',
          border: '1px solid rgba(0,209,255,0.22)',
        }}
      >
        <div className="w-1.5 h-1.5 rounded-full animate-pulse flex-shrink-0" style={{ background: '#00D1FF' }} />
        <span className="text-xs font-noto font-medium" style={{ color: '#00D1FF' }}>
          分身匹配中 · 宇宙匹配池已扫描 2,847 位同好
        </span>
      </div>

      {/* ── Filter tabs ── */}
      <div className="px-4 mb-4">
        <div className="flex" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          {FILTER_TABS.map((tab) => {
            const isActive = filter === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                className="flex-1 py-2 font-noto text-xs whitespace-nowrap transition-all duration-200 cursor-pointer relative"
                style={{
                  color: isActive ? '#E0EFFF' : 'rgba(224,239,255,0.38)',
                  fontWeight: isActive ? 600 : 400,
                }}
              >
                {tab.label}
                {isActive && (
                  <span
                    className="absolute bottom-0 left-1/2 rounded-full transition-all duration-300"
                    style={{
                      transform: 'translateX(-50%)',
                      width: '60%',
                      height: '2px',
                      background: 'linear-gradient(90deg,rgba(0,209,255,0.8),rgba(108,92,231,0.8))',
                      boxShadow: '0 0 6px rgba(0,209,255,0.5)',
                    }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Recent matches (< 24h) ── */}
      {filteredRecent.length > 0 && (
        <div className="px-4 mb-5">
          <p className="font-noto text-xs font-semibold mb-3" style={{ color: 'rgba(224,239,255,0.5)' }}>
            <i className="ri-time-line mr-1" />24小时内新增
          </p>
          <div className="flex flex-col gap-3">
            {filteredRecent.map((m) => {
              const cfg = AVATAR_CONFIG[m.avatarType] || AVATAR_CONFIG.constellation;
              return (
                <FullCard
                  key={m.id}
                  m={m}
                  avatarCfg={cfg}
                  chatModes={getMode(m.id)}
                  onSelect={() => onSelect(m.id)}
                  onStartAI={(e) => handleStartAI(e, m)}
                  onStartHuman={(e) => handleStartHuman(e, m)}
                  onNotInterested={(e) => handleNotInterested(e, m)}
                />
              );
            })}
          </div>
        </div>
      )}

      {/* ── Old matches (>24h) thumbnail row ── */}
      {filteredOld.length > 0 && (
        <div className="mb-5">
          <div className="px-4 mb-2 flex items-center justify-between">
            <p className="font-noto text-xs font-semibold" style={{ color: 'rgba(224,239,255,0.5)' }}>
              <i className="ri-archive-line mr-1" />超过24小时
            </p>
            <span className="font-noto" style={{ color: 'rgba(253,203,110,0.7)', fontSize: '10px' }}>
              <i className="ri-alert-line mr-0.5" />
              无操作超过72小时将自动移除
            </span>
          </div>
          <div
            ref={thumbScrollRef}
            className="flex gap-2 px-4 overflow-x-auto pb-1"
            style={{ scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}
          >
            {filteredOld.map((m) => {
              const cfg = AVATAR_CONFIG[m.avatarType] || AVATAR_CONFIG.constellation;
              return (
                <ThumbCard
                  key={m.id}
                  m={m}
                  avatarCfg={cfg}
                  onClick={() => onSelect(m.id)}
                />
              );
            })}
          </div>
          <p className="text-center font-noto mt-1.5" style={{ color: 'rgba(224,239,255,0.25)', fontSize: '10px' }}>
            左右滑动查看更多
          </p>
        </div>
      )}

      {/* ── Empty state ── */}
      {filteredRecent.length === 0 && filteredOld.length === 0 && (
        <div className="mx-4 py-10 flex flex-col items-center gap-2">
          <i className="ri-search-line text-3xl" style={{ color: 'rgba(162,155,254,0.3)' }} />
          <p className="font-noto text-sm" style={{ color: 'rgba(224,239,255,0.35)' }}>暂无符合条件的星友</p>
        </div>
      )}

      {/* ── 72h warning banner ── */}
      {oldMatches.some((m) => (Date.now() - new Date(m.addedAt).getTime()) / 3600000 > 48) && (
        <div
          className="mx-4 mb-4 flex items-start gap-2.5 p-3 rounded-2xl"
          style={{
            background: 'linear-gradient(135deg,rgba(253,203,110,0.1),rgba(253,203,110,0.06))',
            border: '1px solid rgba(253,203,110,0.25)',
          }}
        >
          <div className="w-4 h-4 flex items-center justify-center flex-shrink-0 mt-0.5">
            <i className="ri-alert-fill text-sm" style={{ color: '#FDCB6E' }} />
          </div>
          <p className="font-noto text-xs leading-relaxed" style={{ color: 'rgba(253,203,110,0.85)' }}>
            你有星友即将从星球核散出——无操作超过<strong className="font-semibold">72小时</strong>的星友将自动解除连接，快去打个招呼吧！
          </p>
        </div>
      )}

      {/* ── Find more (radar style) ── */}
      <button
        onClick={onSearch}
        className="mx-4 flex items-center justify-center gap-3 py-3.5 cursor-pointer transition-all duration-200 active:scale-95 relative overflow-hidden"
        style={{ background: 'transparent' }}
      >
        {/* Radar rings */}
        <div className="relative flex items-center justify-center flex-shrink-0" style={{ width: '36px', height: '36px' }}>
          {/* Outer pulse ring 1 */}
          <div
            className="absolute rounded-full animate-ping"
            style={{
              width: '36px', height: '36px',
              border: '1px solid rgba(162,155,254,0.25)',
              animationDuration: '2s',
            }}
          />
          {/* Outer pulse ring 2 */}
          <div
            className="absolute rounded-full animate-ping"
            style={{
              width: '26px', height: '26px',
              border: '1px solid rgba(108,92,231,0.35)',
              animationDuration: '2s',
              animationDelay: '0.5s',
            }}
          />
          {/* Center dot */}
          <div
            className="relative w-4 h-4 rounded-full flex items-center justify-center"
            style={{
              background: 'radial-gradient(circle,rgba(162,155,254,0.6),rgba(108,92,231,0.3))',
              border: '1px solid rgba(162,155,254,0.5)',
              boxShadow: '0 0 8px rgba(162,155,254,0.4)',
            }}
          >
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#C4BBFF' }} />
          </div>
          {/* Radar sweep line */}
          <div
            className="absolute top-1/2 left-1/2 origin-left"
            style={{
              width: '16px',
              height: '1px',
              background: 'linear-gradient(90deg,rgba(162,155,254,0.7),transparent)',
              transform: 'translateY(-50%)',
              animation: 'spin 3s linear infinite',
            }}
          />
        </div>
        <span className="text-sm font-noto font-medium" style={{ color: 'rgba(162,155,254,0.8)' }}>探索更多同频星友</span>
        <div className="flex gap-0.5 items-center">
          <div className="w-1 h-1 rounded-full animate-bounce" style={{ background: 'rgba(162,155,254,0.6)', animationDelay: '0ms' }} />
          <div className="w-1 h-1 rounded-full animate-bounce" style={{ background: 'rgba(162,155,254,0.4)', animationDelay: '150ms' }} />
          <div className="w-1 h-1 rounded-full animate-bounce" style={{ background: 'rgba(162,155,254,0.25)', animationDelay: '300ms' }} />
        </div>
      </button>

      {/* ── Destroy modal ── */}
      {destroyTarget && (
        <DestroyModal
          match={destroyTarget}
          onConfirm={confirmDestroy}
          onCancel={() => setDestroyTarget(null)}
        />
      )}
    </div>
  );
}
