import { useState, useRef, useEffect, useCallback } from 'react';
import { MOCK_CHAT_MESSAGES } from '@/mocks/starData';

/* ────────── Quick reply suggestion data ────────── */
const REPLY_POOLS: Record<number, { emoji: string; text: string }[]> = {
  // after msg 1 (宇宙有意识)
  1: [
    { emoji: '🌌', text: '我觉得它会选孤独者——孤独让人更敏感' },
    { emoji: '🤔', text: '有意识的宇宙……那它是旁观者还是参与者？' },
    { emoji: '✨', text: '有趣的问题。也许宇宙只选那些还没找到答案的人' },
  ],
  // after msg 3 (不急着找答案)
  3: [
    { emoji: '💭', text: '对，答案往往是在放弃追问的那一刻出现的' },
    { emoji: '🌊', text: '即时满足真的在侵蚀我们的深度思考能力' },
    { emoji: '🎯', text: '这种能力可以重新习得吗？还是会永远失去？' },
  ],
  // after msg 5 (深夜散步)
  5: [
    { emoji: '🌙', text: '不带耳机的散步真的很不一样，脑子会自动运转' },
    { emoji: '🏙️', text: '城市夜晚有一种特别的频率，很难用语言描述' },
    { emoji: '🤫', text: '我也喜欢这样，但很少有人理解……' },
  ],
  // after msg 7 (孤独)
  7: [
    { emoji: '💡', text: '主动选择的孤独是一种奢侈，不是每个人都能做到' },
    { emoji: '🌊', text: '水边真的有一种特别的静，声音反而会让你更专注' },
    { emoji: '🪐', text: '孤独和寂寞是两种完全不同的状态' },
  ],
};

// Fallback suggestions based on conversation themes
const FALLBACK_REPLIES = [
  { emoji: '🌌', text: '你这句话让我停了一下……说得太准了' },
  { emoji: '🤝', text: '我也有过类似的感受，但没想到能这样表达出来' },
  { emoji: '💬', text: '继续聊，我想听你展开说说' },
];

interface Props {
  matchId: string;
  initialMode?: 'ai' | 'human';
  isFirstAiEntry?: boolean;
  onViewReport: () => void;
  onBack: () => void;
}

const STYLE_OPTIONS = ['再幽默些', '更温柔些', '高冷一点', '理性分析'];
const TOPIC_OPTIONS = ['多聊骑行', '多聊音乐', '多聊电影', '多聊旅行'];

/* ────────── Style preset modal ────────── */
const PRESET_STYLES = [
  { id: 'warm', label: '温柔治愈', icon: 'ri-heart-3-line', desc: '轻声细语，给人安全感', color: '#FF7E9D' },
  { id: 'cool', label: '高冷理性', icon: 'ri-brain-line', desc: '克制且有深度', color: '#74B9FF' },
  { id: 'humor', label: '幽默活泼', icon: 'ri-emotion-laugh-line', desc: '机智好玩，氛围活跃', color: '#FDCB6E' },
  { id: 'deep', label: '深邃哲思', icon: 'ri-moon-foggy-line', desc: '直击灵魂的对话方式', color: '#A29BFE' },
  { id: 'relax', label: '随性松弛', icon: 'ri-leaf-line', desc: '不刻意，自然流淌', color: '#55EFC4' },
  { id: 'direct', label: '直接坦率', icon: 'ri-flashlight-line', desc: '说真话，不绕弯子', color: '#00D1FF' },
];

function StylePresetModal({
  mode,
  onConfirm,
}: {
  mode: 'ai' | 'human';
  onConfirm: (styleId: string) => void;
}) {
  const [selected, setSelected] = useState('');

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center"
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(10px)' }}
    >
      <div
        className="w-full max-w-sm pb-safe"
        style={{
          background: 'linear-gradient(180deg,rgba(18,14,38,0.99) 0%,rgba(12,10,28,1) 100%)',
          borderTop: '1px solid rgba(162,155,254,0.2)',
          borderRadius: '28px 28px 0 0',
        }}
      >
        {/* handle */}
        <div className="flex justify-center pt-3 pb-4">
          <div className="w-10 h-1 rounded-full" style={{ background: 'rgba(255,255,255,0.15)' }} />
        </div>

        {/* header */}
        <div className="px-6 mb-5">
          <div className="flex items-center gap-2.5 mb-1.5">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: mode === 'ai' ? 'rgba(0,209,255,0.12)' : 'rgba(162,155,254,0.12)', border: mode === 'ai' ? '1px solid rgba(0,209,255,0.3)' : '1px solid rgba(162,155,254,0.3)' }}
            >
              <i className={mode === 'ai' ? 'ri-robot-line text-sm' : 'ri-user-voice-line text-sm'} style={{ color: mode === 'ai' ? '#00D1FF' : '#C4BBFF' }} />
            </div>
            <div>
              <p className="font-orbitron text-sm font-bold" style={{ color: '#E0EFFF' }}>
                {mode === 'ai' ? '设定AI代聊风格' : '设定真人聊天基调'}
              </p>
              <p className="font-noto" style={{ color: 'rgba(224,239,255,0.45)', fontSize: '11px' }}>
                {mode === 'ai' ? '分身将以此风格代你开启对话' : '让对方感知你的能量状态'}
              </p>
            </div>
          </div>
        </div>

        {/* style grid */}
        <div className="px-5 grid grid-cols-2 gap-2.5 mb-6">
          {PRESET_STYLES.map((s) => {
            const isSelected = selected === s.id;
            return (
              <button
                key={s.id}
                onClick={() => setSelected(s.id)}
                className="flex items-center gap-3 p-3 rounded-2xl text-left cursor-pointer transition-all duration-200 active:scale-95"
                style={{
                  background: isSelected
                    ? `linear-gradient(135deg,${s.color}18,${s.color}08)`
                    : 'rgba(255,255,255,0.04)',
                  border: isSelected ? `1.5px solid ${s.color}55` : '1.5px solid rgba(255,255,255,0.08)',
                  boxShadow: isSelected ? `0 0 12px ${s.color}20` : 'none',
                }}
              >
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: `${s.color}15`, border: `1px solid ${s.color}30` }}
                >
                  <i className={`${s.icon} text-sm`} style={{ color: s.color }} />
                </div>
                <div className="min-w-0">
                  <p className="font-noto text-xs font-semibold mb-0.5" style={{ color: isSelected ? '#E0EFFF' : 'rgba(224,239,255,0.7)' }}>
                    {s.label}
                  </p>
                  <p className="font-noto leading-tight" style={{ color: 'rgba(224,239,255,0.38)', fontSize: '10px' }}>
                    {s.desc}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* confirm */}
        <div className="px-5 pb-8">
          <button
            onClick={() => selected && onConfirm(selected)}
            disabled={!selected}
            className="w-full py-4 rounded-2xl font-noto text-sm font-bold whitespace-nowrap cursor-pointer transition-all duration-200 active:scale-95"
            style={{
              background: selected
                ? 'linear-gradient(135deg,#6C5CE7,#00D1FF)'
                : 'rgba(255,255,255,0.06)',
              color: selected ? '#fff' : 'rgba(224,239,255,0.25)',
              border: selected ? 'none' : '1px solid rgba(255,255,255,0.08)',
            }}
          >
            {selected ? '启动对话' : '请先选择风格'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ────────── Mode switch confirm ────────── */
function ModeSwitchBanner({
  currentMode,
  onSwitch,
  onDismiss,
}: {
  currentMode: 'ai' | 'human';
  onSwitch: () => void;
  onDismiss: () => void;
}) {
  const isAI = currentMode === 'ai';
  return (
    <div
      className="mx-4 mt-3 mb-1 flex items-center gap-3 px-4 py-3 rounded-2xl"
      style={{
        background: isAI ? 'rgba(255,75,75,0.07)' : 'rgba(0,209,255,0.07)',
        border: isAI ? '1px solid rgba(255,75,75,0.2)' : '1px solid rgba(0,209,255,0.22)',
      }}
    >
      <i
        className={`${isAI ? 'ri-robot-line' : 'ri-user-voice-line'} text-base flex-shrink-0`}
        style={{ color: isAI ? '#FF7575' : '#00D1FF' }}
      />
      <p className="font-noto text-xs flex-1 leading-snug" style={{ color: isAI ? 'rgba(255,120,120,0.9)' : 'rgba(0,209,255,0.9)' }}>
        {isAI ? '确定终止AI代聊，切换为真人直聊？' : '让AI帮聊一会？分身将接管本次对话'}
      </p>
      <div className="flex gap-2 flex-shrink-0">
        <button
          onClick={onDismiss}
          className="px-2.5 py-1 rounded-lg font-noto text-xs cursor-pointer whitespace-nowrap"
          style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(224,239,255,0.5)' }}
        >
          取消
        </button>
        <button
          onClick={onSwitch}
          className="px-2.5 py-1 rounded-lg font-noto text-xs font-semibold cursor-pointer whitespace-nowrap"
          style={{
            background: isAI ? 'rgba(255,75,75,0.2)' : 'rgba(0,209,255,0.18)',
            color: isAI ? '#FF7575' : '#00D1FF',
            border: isAI ? '1px solid rgba(255,75,75,0.35)' : '1px solid rgba(0,209,255,0.35)',
          }}
        >
          确认
        </button>
      </div>
    </div>
  );
}

/* ────────── Main ProxyChat ────────── */
export default function ProxyChat({ matchId, initialMode = 'ai', isFirstAiEntry = false, onViewReport, onBack }: Props) {
  const [chatMode, setChatMode] = useState<'ai' | 'human'>(initialMode);
  const [messages, setMessages] = useState(MOCK_CHAT_MESSAGES);
  const [showIntervene, setShowIntervene] = useState(false);
  const [activeStyle, setActiveStyle] = useState('');
  const [activeTopic, setActiveTopic] = useState('');
  const [quickReplies, setQuickReplies] = useState<{ emoji: string; text: string }[]>(
    REPLY_POOLS[MOCK_CHAT_MESSAGES[MOCK_CHAT_MESSAGES.length - 1].id] || FALLBACK_REPLIES
  );
  const [quickReplyUsed, setQuickReplyUsed] = useState<string | null>(null);
  const [isGeneratingReplies, setIsGeneratingReplies] = useState(false);
  const [highlighted, setHighlighted] = useState<number[]>([2, 5, 8]);
  const [humanInput, setHumanInput] = useState('');
  const [showSwitchBanner, setShowSwitchBanner] = useState(false);
  // Only show preset on very first AI chat entry (isFirstAiEntry prop)
  const [showPreset, setShowPreset] = useState<'ai' | 'human' | null>(initialMode === 'ai' && isFirstAiEntry ? 'ai' : null);
  // track which modes have been preset
  const [presetDone, setPresetDone] = useState<Set<'ai' | 'human'>>(new Set());

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const isAI = chatMode === 'ai';

  // Regenerate quick replies after new AI message
  const refreshQuickReplies = useCallback((lastMsgId: number) => {
    setIsGeneratingReplies(true);
    setQuickReplyUsed(null);
    setTimeout(() => {
      const pool = REPLY_POOLS[lastMsgId];
      setQuickReplies(pool || FALLBACK_REPLIES);
      setIsGeneratingReplies(false);
    }, 800);
  }, []);

  const handleQuickReply = (reply: { emoji: string; text: string }) => {
    setQuickReplyUsed(reply.text);
    // inject as user message
    const userMsg = {
      id: messages.length + 1,
      side: 'right' as const,
      color: '#00D1FF',
      text: reply.text,
      time: '刚刚',
      highlight: false,
    };
    setMessages((prev) => [...prev, userMsg]);
    // simulate AI follow-up after short delay
    setTimeout(() => {
      const aiFollowUps: string[] = [
        '说到这里，我其实一直想问你——你觉得真正的「懂得」是一种感觉还是一种能力？',
        '嗯……你这样说让我想到，我们可能都在用不同的方式试图解开同一个谜。',
        '对。而且我发现，能这样聊天的人，反而都有一种内在的安静。你平时也是这样吗？',
        '有意思。那你有没有遇到过一个人，第一次聊就觉得「这人我已经认识很久了」？',
        '你说的这个，让我突然想起——孤独感最强的时刻，反而是在人群里，不是一个人的时候。',
      ];
      const aiMsg = {
        id: messages.length + 2,
        side: 'left' as const,
        color: '#6C5CE7',
        text: aiFollowUps[Math.floor(Math.random() * aiFollowUps.length)],
        time: '刚刚',
        highlight: false,
      };
      setMessages((prev) => [...prev, aiMsg]);
      refreshQuickReplies(aiMsg.id);
    }, 1200);
  };

  const handlePresetConfirm = (styleId: string) => {
    const mode = showPreset!;
    // close modal immediately
    setShowPreset(null);
    setPresetDone((prev) => new Set([...prev, mode]));
    // always switch to this mode
    setChatMode(mode);
    // inject opener message
    const styleLabel = PRESET_STYLES.find((s) => s.id === styleId)?.label || styleId;
    const newMsg = {
      id: messages.length + 1,
      side: 'left' as const,
      color: mode === 'ai' ? '#6C5CE7' : '#A29BFE',
      text: mode === 'ai'
        ? `（分身已设定为「${styleLabel}」风格）${PRESET_OPENERS[styleId] || '那就从这里开始吧。'}`
        : `（你以「${styleLabel}」状态进入真人对话）`,
      time: '刚刚',
      highlight: false,
    };
    setMessages((prev) => [...prev, newMsg]);
  };

  const handleIntervene = (type: 'style' | 'topic', value: string) => {
    if (type === 'style') setActiveStyle(value);
    else setActiveTopic(value);
    const newMsg = {
      id: messages.length + 1,
      side: 'left' as const,
      color: '#6C5CE7',
      text: type === 'style'
        ? `（分身切换为「${value}」模式）那说真的，你觉得人的性格是天生的还是后天塑造的？`
        : `对了，说到${value.replace('多聊', '')}，你最近有什么特别的经历？`,
      time: '实时',
      highlight: false,
    };
    setMessages((prev) => [...prev, newMsg]);
    refreshQuickReplies(newMsg.id);
    setShowIntervene(false);
  };

  const toggleHighlight = (id: number) => {
    setHighlighted((prev) =>
      prev.includes(id) ? prev.filter((h) => h !== id) : [...prev, id]
    );
  };

  const handleSendHuman = () => {
    const text = humanInput.trim();
    if (!text) return;
    const newMsg = {
      id: messages.length + 1,
      side: 'right' as const,
      color: '#00D1FF',
      text,
      time: '刚刚',
      highlight: false,
    };
    setMessages((prev) => [...prev, newMsg]);
    setHumanInput('');
    inputRef.current?.focus();
  };

  // request mode switch
  const handleModeSwitchRequest = () => {
    setShowSwitchBanner(true);
    setShowIntervene(false);
  };

  const handleModeSwitchConfirm = () => {
    const newMode: 'ai' | 'human' = isAI ? 'human' : 'ai';
    setShowSwitchBanner(false);
    // Never auto-show preset when switching; just change mode directly
    setChatMode(newMode);
    setPresetDone((prev) => new Set([...prev, newMode]));
  };

  return (
    <div className="fixed inset-0 z-30 flex flex-col" style={{ background: '#0F0F1E' }}>
      {/* ── Header ── */}
      <div
        className="flex items-center gap-3 px-4 pt-10 pb-3"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(15,15,30,0.97)', backdropFilter: 'blur(12px)' }}
      >
        <button
          onClick={onBack}
          className="w-9 h-9 flex items-center justify-center rounded-xl cursor-pointer flex-shrink-0"
          style={{ background: 'rgba(255,255,255,0.06)' }}
        >
          <i className="ri-arrow-left-line" style={{ color: '#E0EFFF' }} />
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-0.5">
            <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: isAI ? '#00D1FF' : '#A29BFE' }} />
            <span className="font-orbitron text-sm font-bold" style={{ color: '#E0EFFF' }}>
              {matchId}
            </span>
            {/* mode badge */}
            <span
              className="px-2 py-0.5 rounded-full font-noto text-xs font-semibold whitespace-nowrap"
              style={{
                background: isAI ? 'rgba(0,209,255,0.12)' : 'rgba(162,155,254,0.12)',
                border: isAI ? '1px solid rgba(0,209,255,0.28)' : '1px solid rgba(162,155,254,0.3)',
                color: isAI ? '#00D1FF' : '#C4BBFF',
                fontSize: '10px',
              }}
            >
              {isAI ? 'AI代聊中' : '真人直聊'}
            </span>
          </div>
          <p className="font-noto" style={{ color: 'rgba(224,239,255,0.35)', fontSize: '10px' }}>
            {isAI ? '分身代你对话 · 可随时干预' : '你在直接对话 · 可让AI接管'}
          </p>
        </div>

        {/* right actions */}
        <div className="flex gap-2 flex-shrink-0">
          {/* mode switch button */}
          <button
            onClick={handleModeSwitchRequest}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-noto font-semibold cursor-pointer whitespace-nowrap transition-all duration-200 active:scale-95"
            style={{
              background: isAI
                ? 'linear-gradient(135deg,rgba(255,75,75,0.14),rgba(255,75,75,0.07))'
                : 'linear-gradient(135deg,rgba(0,209,255,0.14),rgba(0,209,255,0.07))',
              border: isAI ? '1px solid rgba(255,75,75,0.3)' : '1px solid rgba(0,209,255,0.3)',
              color: isAI ? '#FF7575' : '#00D1FF',
            }}
          >
            <i className={`${isAI ? 'ri-stop-circle-line' : 'ri-robot-line'} text-xs`} />
            {isAI ? '终止代聊' : '让AI帮聊'}
          </button>

          {/* report */}
          <button
            onClick={onViewReport}
            className="px-3 py-2 rounded-xl text-xs font-noto cursor-pointer whitespace-nowrap"
            style={{ background: 'linear-gradient(135deg,#6C5CE7,#00D1FF)', color: '#fff' }}
          >
            报告
          </button>
        </div>
      </div>

      {/* ── Switch confirm banner ── */}
      {showSwitchBanner && (
        <ModeSwitchBanner
          currentMode={chatMode}
          onSwitch={handleModeSwitchConfirm}
          onDismiss={() => setShowSwitchBanner(false)}
        />
      )}

      {/* ── Intervene button row (AI only) — prominent ── */}
      {isAI && !showSwitchBanner && (
        <div
          className="px-4 py-2.5 flex items-center gap-2"
          style={{ background: 'rgba(15,15,30,0.9)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}
        >
          <button
            onClick={() => setShowIntervene(!showIntervene)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl font-noto text-sm font-bold cursor-pointer whitespace-nowrap transition-all duration-200 active:scale-95"
            style={{
              background: showIntervene
                ? 'linear-gradient(135deg,rgba(108,92,231,0.35),rgba(0,209,255,0.2))'
                : 'linear-gradient(135deg,rgba(108,92,231,0.22),rgba(0,209,255,0.12))',
              border: showIntervene
                ? '1.5px solid rgba(108,92,231,0.6)'
                : '1.5px solid rgba(108,92,231,0.4)',
              color: '#C4BBFF',
              boxShadow: showIntervene
                ? '0 0 16px rgba(108,92,231,0.3)'
                : '0 0 8px rgba(108,92,231,0.15)',
            }}
          >
            <div className="w-5 h-5 flex items-center justify-center">
              <i className="ri-settings-3-line text-base" style={{ color: '#A29BFE' }} />
            </div>
            <span>干预分身</span>
            {showIntervene
              ? <i className="ri-arrow-up-s-line text-sm" style={{ color: 'rgba(162,155,254,0.6)' }} />
              : <i className="ri-arrow-down-s-line text-sm" style={{ color: 'rgba(162,155,254,0.6)' }} />
            }
          </button>
          <div className="flex-1" />
          <span className="font-noto text-xs" style={{ color: 'rgba(224,239,255,0.3)' }}>
            对话进度
          </span>
          <span className="font-orbitron text-xs font-bold" style={{ color: '#00D1FF' }}>68%</span>
        </div>
      )}

      {/* ── Intervene panel (AI only) ── */}
      {isAI && showIntervene && (
        <div
          className="px-4 py-3"
          style={{ background: 'rgba(108,92,231,0.07)', borderBottom: '1px solid rgba(108,92,231,0.14)' }}
        >
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-noto" style={{ color: 'rgba(224,239,255,0.5)' }}>切换说话风格</p>
            <button
              onClick={() => setShowPreset('ai')}
              className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-noto cursor-pointer whitespace-nowrap"
              style={{ background: 'rgba(108,92,231,0.2)', border: '1px solid rgba(108,92,231,0.4)', color: '#A29BFE' }}
            >
              <i className="ri-edit-2-line" style={{ fontSize: '10px' }} />
              修改代聊风格
            </button>
          </div>
          <div className="flex gap-2 flex-wrap mb-3">
            {STYLE_OPTIONS.map((opt) => (
              <button
                key={opt}
                onClick={() => handleIntervene('style', opt)}
                className="px-3 py-1.5 rounded-full text-xs font-noto cursor-pointer whitespace-nowrap"
                style={{
                  background: activeStyle === opt ? 'rgba(108,92,231,0.3)' : 'rgba(255,255,255,0.06)',
                  border: activeStyle === opt ? '1px solid rgba(108,92,231,0.6)' : '1px solid rgba(255,255,255,0.1)',
                  color: activeStyle === opt ? '#A29BFE' : 'rgba(224,239,255,0.5)',
                }}
              >
                {opt}
              </button>
            ))}
          </div>
          <p className="text-xs font-noto mb-2" style={{ color: 'rgba(224,239,255,0.5)' }}>定向话题</p>
          <div className="flex gap-2 flex-wrap">
            {TOPIC_OPTIONS.map((opt) => (
              <button
                key={opt}
                onClick={() => handleIntervene('topic', opt)}
                className="px-3 py-1.5 rounded-full text-xs font-noto cursor-pointer whitespace-nowrap"
                style={{
                  background: activeTopic === opt ? 'rgba(0,209,255,0.15)' : 'rgba(255,255,255,0.06)',
                  border: activeTopic === opt ? '1px solid rgba(0,209,255,0.4)' : '1px solid rgba(255,255,255,0.1)',
                  color: activeTopic === opt ? '#00D1FF' : 'rgba(224,239,255,0.5)',
                }}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Human mode hint ── */}
      {!isAI && !showSwitchBanner && (
        <div
          className="mx-4 mt-3 mb-1 flex items-center gap-2 px-3 py-2 rounded-xl"
          style={{ background: 'rgba(162,155,254,0.1)', border: '1px solid rgba(162,155,254,0.22)' }}
        >
          <i className="ri-user-voice-line text-sm flex-shrink-0" style={{ color: '#C4BBFF' }} />
          <p className="font-noto text-xs" style={{ color: 'rgba(162,155,254,0.85)' }}>
            你正在真人直聊 · 点右上角「让AI帮聊」可随时切回AI代聊
          </p>
        </div>
      )}

      {/* ── Chat area ── */}
      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3">
        <div className="flex items-center justify-center">
          <span
            className="px-3 py-1 rounded-full text-xs font-noto"
            style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(224,239,255,0.3)' }}
          >
            {isAI ? 'AI分身代聊中 · 仅观察，可干预' : '真人直聊模式 · 现在是你在说话'}
          </span>
        </div>

        {messages.map((msg, idx) => (
          <div
            key={msg.id}
            className={`flex items-end gap-2.5 ${msg.side === 'right' ? 'flex-row-reverse' : ''}`}
            style={{ animationDelay: `${idx * 0.06}s` }}
          >
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
              style={{ background: `${msg.color}22`, border: `1px solid ${msg.color}55` }}
            >
              <div className="w-2.5 h-2.5 rounded-full" style={{ background: msg.color }} />
            </div>

            <div className="relative max-w-[72%] group">
              <div
                className="px-4 py-3 rounded-2xl text-sm font-noto leading-relaxed"
                style={{
                  background: msg.side === 'left'
                    ? 'rgba(108,92,231,0.15)'
                    : 'rgba(0,209,255,0.12)',
                  border: `1px solid ${msg.color}33`,
                  color: '#E0EFFF',
                }}
              >
                {msg.text}
              </div>
              {isAI && (
                <button
                  onClick={() => toggleHighlight(msg.id)}
                  className="absolute -top-2 right-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 w-5 h-5 flex items-center justify-center rounded-full cursor-pointer"
                  style={{ background: highlighted.includes(msg.id) ? '#FDCB6E' : 'rgba(255,255,255,0.1)' }}
                >
                  <i className="ri-star-line" style={{ fontSize: '10px', color: highlighted.includes(msg.id) ? '#fff' : 'rgba(224,239,255,0.5)' }} />
                </button>
              )}
              <p
                className={`text-xs font-noto mt-1 ${msg.side === 'right' ? 'text-right' : ''}`}
                style={{ color: 'rgba(224,239,255,0.25)', fontSize: '10px' }}
              >
                {msg.time}
              </p>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* ── Quick reply bar (AI mode only) ── */}
      {isAI && !showSwitchBanner && (
        <div
          className="px-4 pt-2.5 pb-1"
          style={{ background: 'rgba(10,8,24,0.95)', borderTop: '1px solid rgba(255,255,255,0.05)' }}
        >
          {/* label */}
          <div className="flex items-center gap-1.5 mb-2">
            <div className="w-1 h-1 rounded-full animate-pulse" style={{ background: '#A29BFE' }} />
            <span className="font-noto" style={{ color: 'rgba(162,155,254,0.55)', fontSize: '10px' }}>
              分身建议你这样接话
            </span>
            {isGeneratingReplies && (
              <div className="w-3 h-3 flex items-center justify-center">
                <i className="ri-loader-4-line text-xs animate-spin" style={{ color: 'rgba(162,155,254,0.5)' }} />
              </div>
            )}
          </div>

          {/* suggestion chips */}
          <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
            {isGeneratingReplies
              ? [1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="flex-shrink-0 h-8 rounded-2xl animate-pulse"
                    style={{ width: `${80 + i * 24}px`, background: 'rgba(255,255,255,0.05)' }}
                  />
                ))
              : quickReplies.map((reply) => {
                  const isUsed = quickReplyUsed === reply.text;
                  return (
                    <button
                      key={reply.text}
                      onClick={() => !isUsed && handleQuickReply(reply)}
                      disabled={isUsed || quickReplyUsed !== null}
                      className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-2xl whitespace-nowrap font-noto text-xs font-medium cursor-pointer transition-all duration-200 active:scale-95"
                      style={{
                        background: isUsed
                          ? 'linear-gradient(135deg,rgba(108,92,231,0.25),rgba(0,209,255,0.15))'
                          : 'rgba(255,255,255,0.06)',
                        border: isUsed
                          ? '1px solid rgba(108,92,231,0.45)'
                          : '1px solid rgba(255,255,255,0.1)',
                        color: isUsed ? '#E0EFFF' : 'rgba(224,239,255,0.65)',
                        opacity: quickReplyUsed !== null && !isUsed ? 0.35 : 1,
                      }}
                    >
                      <span style={{ fontSize: '13px' }}>{reply.emoji}</span>
                      <span>{reply.text.length > 16 ? reply.text.slice(0, 16) + '…' : reply.text}</span>
                      {isUsed && (
                        <div className="w-3.5 h-3.5 flex items-center justify-center">
                          <i className="ri-check-line" style={{ fontSize: '10px', color: '#00D1FF' }} />
                        </div>
                      )}
                    </button>
                  );
                })}
          </div>
        </div>
      )}

      {/* ── Bottom bar ── */}
      <div
        className="px-4 py-3"
        style={{ background: 'rgba(15,15,30,0.97)' }}
      >
        {isAI ? (
          <div className="flex gap-2">
            <button
              onClick={onViewReport}
              className="flex-1 py-3 rounded-xl text-sm font-noto font-bold cursor-pointer whitespace-nowrap"
              style={{ background: 'linear-gradient(135deg,#6C5CE7,#00D1FF)', color: '#fff' }}
            >
              查看星鉴报告
            </button>
          </div>
        ) : (
          <div className="flex gap-2 items-end">
            <input
              ref={inputRef}
              type="text"
              value={humanInput}
              onChange={(e) => setHumanInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendHuman()}
              placeholder="直接发消息..."
              className="flex-1 px-4 py-3 rounded-2xl text-sm font-noto outline-none"
              style={{
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(162,155,254,0.3)',
                color: '#E0EFFF',
              }}
            />
            <button
              onClick={handleSendHuman}
              disabled={!humanInput.trim()}
              className="w-11 h-11 flex items-center justify-center rounded-2xl flex-shrink-0 cursor-pointer transition-all duration-200 active:scale-90"
              style={{
                background: humanInput.trim()
                  ? 'linear-gradient(135deg,#A29BFE,#6C5CE7)'
                  : 'rgba(255,255,255,0.06)',
                border: humanInput.trim() ? 'none' : '1px solid rgba(255,255,255,0.1)',
              }}
            >
              <i className="ri-send-plane-fill text-base" style={{ color: humanInput.trim() ? '#fff' : 'rgba(224,239,255,0.3)' }} />
            </button>
          </div>
        )}
      </div>

      {/* ── Style preset modal (fullscreen overlay) ── */}
      {showPreset !== null && (
        <StylePresetModal
          mode={showPreset}
          onConfirm={handlePresetConfirm}
        />
      )}
    </div>
  );
}

const PRESET_OPENERS: Record<string, string> = {
  warm: '你好，很高兴遇见你。有什么想聊的吗？',
  cool: '你好。我们可以直接跳到有意思的话题。',
  humor: '嘿，终于碰上了！你是怎么被宇宙挑中的？',
  deep: '如果宇宙是有意识的，它今天为什么把你推到了我面前？',
  relax: '你好，随便聊聊就好，没有主题。',
  direct: '你好。说说你自己最真实的状态吧。',
};
