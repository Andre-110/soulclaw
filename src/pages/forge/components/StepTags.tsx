import { useState } from 'react';

const LONG_TAIL_QUESTIONS = [
  {
    id: 'movie',
    question: '你最喜欢的冷门电影是什么？',
    icon: 'ri-film-line',
    options: ['《请以你的名字呼唤我》', '《蜂蜜》', '《少年时代》', '《燃烧》'],
  },
  {
    id: 'music',
    question: '你最爱的欧美歌手是？',
    icon: 'ri-headphone-line',
    options: ['Cigarettes After Sex', 'Bon Iver', 'The 1975', 'Lana Del Rey'],
  },
  {
    id: 'hobby',
    question: '你私下最爱做的小众爱好？',
    icon: 'ri-heart-3-line',
    options: ['深夜录播客', '手冲咖啡研究', '城市废墟探索', '观测天象'],
  },
  {
    id: 'view',
    question: '你最在意的三观观点？',
    icon: 'ri-compass-3-line',
    options: ['不将就的生活方式', '慢下来感受当下', '持续成长比稳定更重要', '关系不需要太多人'],
  },
];

const INTEREST_TAGS = [
  '深夜哲学', '宇宙探索', '独立音乐', '文学漫游', '极简生活',
  '电影美学', '城市漫步', '冥想正念', '科技前沿', '艺术创作',
  '骑行', '咖啡', '读书', '摄影', '露营', '游戏', '健身', '旅行',
];

const GLASS_CARD: React.CSSProperties = {
  backdropFilter: 'blur(24px) saturate(180%)',
  WebkitBackdropFilter: 'blur(24px) saturate(180%)',
  background: 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%)',
  border: '1px solid rgba(255,255,255,0.12)',
  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.1)',
};

interface Props {
  onNext: () => void;
}

export default function StepTags({ onNext }: Props) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [customInputs, setCustomInputs] = useState<Record<string, string>>({});
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [nickname, setNickname] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('constellation');

  const AVATAR_TYPES = [
    { id: 'nebula', name: '星云', color: '#6C5CE7', icon: 'ri-bubble-chart-fill' },
    { id: 'constellation', name: '星座', color: '#00D1FF', icon: 'ri-star-fill' },
    { id: 'ring', name: '星环', color: '#A29BFE', icon: 'ri-record-circle-fill' },
    { id: 'comet', name: '彗星', color: '#74B9FF', icon: 'ri-flashlight-fill' },
    { id: 'blackhole', name: '黑洞', color: '#8B7CF8', icon: 'ri-focus-3-fill' },
  ];

  const handleSelect = (id: string, val: string) => {
    setAnswers((prev) => ({ ...prev, [id]: val }));
  };

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const canNext =
    nickname.trim().length > 0 &&
    selectedTags.length >= 2 &&
    Object.keys(answers).length >= 2;

  const handleNext = () => {
    const profile = {
      nickname: nickname.trim(),
      avatar: selectedAvatar,
      tags: selectedTags,
      answers,
    };
    localStorage.setItem('star_profile', JSON.stringify(profile));
    onNext();
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Nickname */}
      <div className="rounded-2xl p-4" style={GLASS_CARD}>
        <label className="block text-xs font-noto mb-2" style={{ color: 'rgba(224,239,255,0.8)' }}>
          给你的分身起个代号
        </label>
        <input
          type="text"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          placeholder="例：深夜漫游者、宇宙观察员..."
          maxLength={16}
          className="w-full px-4 py-3 rounded-xl text-sm font-noto outline-none"
          style={{
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.12)',
            color: '#E0EFFF',
          }}
        />
      </div>

      {/* Avatar type */}
      <div className="rounded-2xl p-4" style={GLASS_CARD}>
        <label className="block text-xs font-noto mb-3" style={{ color: 'rgba(224,239,255,0.8)' }}>
          选择分身形态
        </label>
        <div className="flex gap-2 justify-between">
          {AVATAR_TYPES.map((a) => (
            <button
              key={a.id}
              onClick={() => setSelectedAvatar(a.id)}
              className="flex-1 flex flex-col items-center gap-1.5 py-3 rounded-xl cursor-pointer transition-all duration-200 active:scale-95"
              style={{
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                background:
                  selectedAvatar === a.id ? `${a.color}28` : 'rgba(255,255,255,0.05)',
                border:
                  selectedAvatar === a.id
                    ? `1px solid ${a.color}70`
                    : '1px solid rgba(255,255,255,0.1)',
                boxShadow:
                  selectedAvatar === a.id ? `0 0 14px ${a.color}40` : 'none',
              }}
            >
              <div
                className="w-8 h-8 flex items-center justify-center rounded-full"
                style={{ background: `${a.color}22` }}
              >
                <i className={`${a.icon} text-base`} style={{ color: a.color }} />
              </div>
              <span
                className="font-noto"
                style={{
                  color: selectedAvatar === a.id ? a.color : 'rgba(224,239,255,0.6)',
                  fontSize: '10px',
                }}
              >
                {a.name}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Long tail questions */}
      <div className="rounded-2xl p-4" style={GLASS_CARD}>
        <div className="flex items-center gap-2 mb-4">
          <i className="ri-sparkling-line text-sm" style={{ color: '#A29BFE' }} />
          <span className="text-xs font-noto font-bold" style={{ color: 'rgba(224,239,255,0.9)' }}>
            长尾标签补全
          </span>
          <span className="text-xs font-noto" style={{ color: 'rgba(224,239,255,0.5)' }}>
            选2题即可
          </span>
        </div>
        <div className="flex flex-col gap-3">
          {LONG_TAIL_QUESTIONS.map((q) => (
            <div
              key={q.id}
              className="p-4 rounded-xl"
              style={{
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                background: answers[q.id]
                  ? 'rgba(108,92,231,0.12)'
                  : 'rgba(255,255,255,0.04)',
                border: answers[q.id]
                  ? '1px solid rgba(108,92,231,0.4)'
                  : '1px solid rgba(255,255,255,0.08)',
                transition: 'all 0.25s ease',
              }}
            >
              <div className="flex items-center gap-2 mb-3">
                <i
                  className={`${q.icon} text-sm`}
                  style={{ color: answers[q.id] ? '#A29BFE' : 'rgba(224,239,255,0.55)' }}
                />
                <span className="text-xs font-noto" style={{ color: 'rgba(224,239,255,0.85)' }}>
                  {q.question}
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {q.options.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => handleSelect(q.id, opt)}
                    className="px-3 py-1.5 rounded-full text-xs font-noto cursor-pointer transition-all duration-200 whitespace-nowrap"
                    style={{
                      background:
                        answers[q.id] === opt
                          ? 'rgba(108,92,231,0.3)'
                          : 'rgba(255,255,255,0.06)',
                      border:
                        answers[q.id] === opt
                          ? '1px solid rgba(108,92,231,0.65)'
                          : '1px solid rgba(255,255,255,0.12)',
                      color:
                        answers[q.id] === opt ? '#C3B5FF' : 'rgba(224,239,255,0.7)',
                      boxShadow:
                        answers[q.id] === opt
                          ? '0 0 8px rgba(108,92,231,0.35)'
                          : 'none',
                    }}
                  >
                    {opt}
                  </button>
                ))}
                <input
                  type="text"
                  placeholder="自定义..."
                  value={customInputs[q.id] || ''}
                  onChange={(e) => {
                    setCustomInputs((prev) => ({ ...prev, [q.id]: e.target.value }));
                    handleSelect(q.id, e.target.value);
                  }}
                  className="px-3 py-1.5 rounded-full text-xs font-noto outline-none w-20"
                  style={{
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.12)',
                    color: '#E0EFFF',
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Interest tags */}
      <div className="rounded-2xl p-4" style={GLASS_CARD}>
        <div className="flex items-center gap-2 mb-3">
          <i className="ri-price-tag-3-line text-sm" style={{ color: '#00D1FF' }} />
          <span className="text-xs font-noto font-bold" style={{ color: 'rgba(224,239,255,0.9)' }}>
            兴趣星域
          </span>
          <span className="text-xs font-noto" style={{ color: 'rgba(224,239,255,0.55)' }}>
            多选
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {INTEREST_TAGS.map((tag) => (
            <button
              key={tag}
              onClick={() => toggleTag(tag)}
              className="px-3 py-1.5 rounded-full text-xs font-noto cursor-pointer transition-all duration-200 whitespace-nowrap"
              style={{
                background: selectedTags.includes(tag)
                  ? 'rgba(0,209,255,0.18)'
                  : 'rgba(255,255,255,0.05)',
                border: selectedTags.includes(tag)
                  ? '1px solid rgba(0,209,255,0.55)'
                  : '1px solid rgba(255,255,255,0.1)',
                color: selectedTags.includes(tag) ? '#7FFFFF' : 'rgba(224,239,255,0.65)',
                boxShadow: selectedTags.includes(tag)
                  ? '0 0 8px rgba(0,209,255,0.3)'
                  : 'none',
              }}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={handleNext}
        disabled={!canNext}
        className="w-full py-4 rounded-2xl font-orbitron text-sm font-bold tracking-widest cursor-pointer transition-all duration-300 active:scale-95 whitespace-nowrap"
        style={{
          background: canNext
            ? 'linear-gradient(135deg, #6C5CE7, #00D1FF)'
            : 'rgba(255,255,255,0.06)',
          color: canNext ? '#fff' : 'rgba(224,239,255,0.3)',
          boxShadow: canNext ? '0 0 24px rgba(108,92,231,0.5)' : 'none',
        }}
      >
        生成星核报告 →
      </button>

      {!canNext && (
        <p className="text-center text-xs font-noto" style={{ color: 'rgba(224,239,255,0.45)' }}>
          请填写代号 + 至少2道问卷 + 至少2个兴趣标签
        </p>
      )}
    </div>
  );
}
