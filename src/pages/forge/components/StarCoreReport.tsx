import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface Profile {
  nickname: string;
  avatar: string;
  tags: string[];
  answers: Record<string, string>;
}

const AVATAR_CONFIG: Record<string, { color: string; icon: string; name: string }> = {
  nebula: { color: '#6C5CE7', icon: 'ri-bubble-chart-fill', name: '星云态' },
  constellation: { color: '#00D1FF', icon: 'ri-star-fill', name: '星座态' },
  ring: { color: '#A29BFE', icon: 'ri-record-circle-fill', name: '星环态' },
  comet: { color: '#74B9FF', icon: 'ri-flashlight-fill', name: '彗星态' },
  blackhole: { color: '#8B7CF8', icon: 'ri-focus-3-fill', name: '黑洞态' },
};

const GLASS_CARD: React.CSSProperties = {
  backdropFilter: 'blur(24px) saturate(180%)',
  WebkitBackdropFilter: 'blur(24px) saturate(180%)',
  background: 'linear-gradient(135deg, rgba(255,255,255,0.09) 0%, rgba(255,255,255,0.04) 100%)',
  border: '1px solid rgba(255,255,255,0.13)',
  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.12)',
};

export default function StarCoreReport() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [starId] = useState(
    () =>
      `STAR-${Math.floor(1000 + Math.random() * 9000)}-${String.fromCharCode(
        65 + Math.floor(Math.random() * 26)
      )}${String.fromCharCode(65 + Math.floor(Math.random() * 26))}`
  );
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem('star_profile');
    if (raw) setProfile(JSON.parse(raw) as Profile);
    const t = setTimeout(() => setRevealed(true), 400);
    return () => clearTimeout(t);
  }, []);

  const handleLaunch = () => {
    localStorage.setItem('star_activated', '1');
    localStorage.setItem('star_id', starId);
    navigate('/avatar');
  };

  if (!profile) return null;

  const avatarCfg = AVATAR_CONFIG[profile.avatar] || AVATAR_CONFIG.constellation;
  const personalityStyle = ['幽默风趣', '温柔细腻', '理性深刻', '高冷神秘'][
    Math.floor(Math.random() * 4)
  ];
  const personalityBase = ['内省型', '探索型', '创作型', '观察型'][
    Math.floor(Math.random() * 4)
  ];
  const reportHeadline = profile.tags.length >= 2
    ? `${profile.tags[0]} × ${profile.tags[1]} 的稀有混合体`
    : '低噪音、高辨识度的稀有型分身';
  const socialHint = personalityStyle.includes('理性')
    ? '更适合从共同兴趣切入，先建立稳定话题，再逐步打开情绪层。'
    : '更适合从情绪共鸣切入，用细节和氛围感建立好感。';
  const storyHint = personalityBase.includes('创作')
    ? '最适合进入高反转、高表达欲、强风格化的剧情支线。'
    : '更适合进入需要观察、判断和持续推进的剧情支线。';

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-start pb-16 px-4 pt-8"
      style={{ opacity: revealed ? 1 : 0, transition: 'opacity 0.6s ease' }}
    >
      {/* Header */}
      <div className="text-center mb-8">
        <div
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full mb-4"
          style={{ background: 'rgba(0,209,255,0.12)', border: '1px solid rgba(0,209,255,0.35)' }}
        >
          <i className="ri-sparkling-2-line text-xs" style={{ color: '#00D1FF' }} />
          <span className="text-xs font-orbitron tracking-widest" style={{ color: '#00D1FF' }}>
            星核报告已生成
          </span>
        </div>
        <h1 className="font-orbitron text-2xl font-black mb-1" style={{ color: '#E0EFFF' }}>
          {profile.nickname}
        </h1>
        <div className="flex items-center justify-center gap-2">
          <span className="text-xs font-noto" style={{ color: 'rgba(224,239,255,0.6)' }}>
            星核ID
          </span>
          <span className="font-orbitron text-sm" style={{ color: '#A29BFE' }}>
            {starId}
          </span>
        </div>
      </div>

      {/* Avatar display */}
      <div className="relative w-40 h-40 flex items-center justify-center mb-8">
        <div
          className="absolute inset-0 rounded-full animate-orbit"
          style={{ border: `1px solid ${avatarCfg.color}30` }}
        />
        <div
          className="absolute inset-4 rounded-full animate-orbit-reverse"
          style={{ border: `1px solid ${avatarCfg.color}20` }}
        />
        <div
          className="w-24 h-24 rounded-full flex items-center justify-center animate-breathe"
          style={{
            background: `radial-gradient(circle, ${avatarCfg.color}33 0%, ${avatarCfg.color}11 70%)`,
            border: `2px solid ${avatarCfg.color}66`,
            boxShadow: `0 0 30px ${avatarCfg.color}44, 0 0 60px ${avatarCfg.color}22`,
          }}
        >
          <i className={`${avatarCfg.icon} text-4xl`} style={{ color: avatarCfg.color }} />
        </div>
        <div
          className="absolute w-3 h-3 rounded-full animate-orbit"
          style={{
            top: '10px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: avatarCfg.color,
            boxShadow: `0 0 8px ${avatarCfg.color}`,
          }}
        />
      </div>

      {/* Tags */}
      <div className="w-full max-w-sm mb-4">
        <div className="flex flex-wrap gap-2 justify-center">
          {profile.tags.slice(0, 8).map((tag) => (
            <span
              key={tag}
              className="px-3 py-1 rounded-full text-xs font-noto"
              style={{
                background: 'rgba(108,92,231,0.18)',
                border: '1px solid rgba(108,92,231,0.38)',
                color: '#C3B5FF',
              }}
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Report cards */}
      <div className="w-full max-w-sm flex flex-col gap-3 mb-8">
        {/* Core stats */}
        <div className="p-4 rounded-2xl" style={GLASS_CARD}>
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: '分身形态', value: avatarCfg.name, icon: avatarCfg.icon, color: avatarCfg.color },
              { label: '聊天风格', value: personalityStyle, icon: 'ri-chat-smile-3-line', color: '#00D1FF' },
              { label: '性格底色', value: personalityBase, icon: 'ri-heart-line', color: '#A29BFE' },
              { label: '兴趣标签', value: `${profile.tags.length}个`, icon: 'ri-price-tag-3-line', color: '#74B9FF' },
            ].map((item) => (
              <div key={item.label} className="flex flex-col gap-1">
                <div className="flex items-center gap-1.5">
                  <i className={`${item.icon} text-xs`} style={{ color: item.color }} />
                  <span className="text-xs font-noto" style={{ color: 'rgba(224,239,255,0.6)' }}>
                    {item.label}
                  </span>
                </div>
                <span className="text-sm font-noto font-bold" style={{ color: '#E0EFFF' }}>
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Report generation module */}
        <div
          className="p-4 rounded-2xl"
          style={{
            backdropFilter: 'blur(24px) saturate(180%)',
            WebkitBackdropFilter: 'blur(24px) saturate(180%)',
            background: 'linear-gradient(135deg, rgba(116,185,255,0.11) 0%, rgba(108,92,231,0.08) 100%)',
            border: '1px solid rgba(116,185,255,0.22)',
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.08)',
          }}
        >
          <div className="flex items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-2">
              <i className="ri-file-chart-line text-xs" style={{ color: '#74B9FF' }} />
              <span className="text-xs font-orbitron tracking-wider" style={{ color: '#74B9FF' }}>
                报告生成模块
              </span>
            </div>
            <span
              className="px-2.5 py-1 rounded-full text-[10px] font-noto font-semibold"
              style={{ background: 'rgba(116,185,255,0.14)', border: '1px solid rgba(116,185,255,0.22)', color: '#81ECEC' }}
            >
              已深化
            </span>
          </div>

          <div
            className="rounded-2xl px-3.5 py-3 mb-3"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <div className="text-[11px] font-noto mb-1.5" style={{ color: 'rgba(224,239,255,0.48)' }}>
              星核主结论
            </div>
            <div className="text-sm font-noto font-bold leading-relaxed" style={{ color: '#E0EFFF' }}>
              {reportHeadline}
            </div>
            <p className="text-xs font-noto mt-2 leading-relaxed" style={{ color: 'rgba(224,239,255,0.68)' }}>
              你的资料不是“高热闹型”人格，更像会在少数特定圈层中迅速被识别的高密度表达者。
            </p>
          </div>

          <div className="grid grid-cols-1 gap-2.5">
            {[
              {
                icon: 'ri-radar-line',
                title: '社交触发点',
                body: socialHint,
                color: '#00D1FF',
              },
              {
                icon: 'ri-quill-pen-line',
                title: '剧情适配度',
                body: storyHint,
                color: '#A29BFE',
              },
              {
                icon: 'ri-lightbulb-flash-line',
                title: '后续建议',
                body: '先保留这份报告，再去模拟器里测试不同玩法，后续可以反向校准你的分身画像。',
                color: '#FDCB6E',
              },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-2xl px-3.5 py-3"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <i className={item.icon} style={{ color: item.color, fontSize: '13px' }} />
                  <span className="text-xs font-noto font-semibold" style={{ color: '#E0EFFF' }}>{item.title}</span>
                </div>
                <p className="text-xs font-noto leading-relaxed" style={{ color: 'rgba(224,239,255,0.62)' }}>
                  {item.body}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Answers highlight */}
        {Object.entries(profile.answers).length > 0 && (
          <div
            className="p-4 rounded-2xl"
            style={{
              backdropFilter: 'blur(24px) saturate(180%)',
              WebkitBackdropFilter: 'blur(24px) saturate(180%)',
              background: 'linear-gradient(135deg, rgba(0,209,255,0.1) 0%, rgba(0,209,255,0.04) 100%)',
              border: '1px solid rgba(0,209,255,0.2)',
              boxShadow: 'inset 0 1px 0 rgba(0,209,255,0.15)',
            }}
          >
            <div className="flex items-center gap-2 mb-3">
              <i className="ri-sparkling-line text-xs" style={{ color: '#00D1FF' }} />
              <span className="text-xs font-orbitron tracking-wider" style={{ color: '#00D1FF' }}>
                小众标签
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {Object.values(profile.answers)
                .filter(Boolean)
                .map((v, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 rounded-full text-xs font-noto"
                    style={{
                      background: 'rgba(0,209,255,0.12)',
                      border: '1px solid rgba(0,209,255,0.3)',
                      color: '#81ECEC',
                    }}
                  >
                    {v}
                  </span>
                ))}
            </div>
          </div>
        )}

        {/* Match prediction */}
        <div
          className="p-4 rounded-2xl"
          style={{
            backdropFilter: 'blur(24px) saturate(180%)',
            WebkitBackdropFilter: 'blur(24px) saturate(180%)',
            background: 'linear-gradient(135deg, rgba(108,92,231,0.12) 0%, rgba(108,92,231,0.05) 100%)',
            border: '1px solid rgba(108,92,231,0.22)',
            boxShadow: 'inset 0 1px 0 rgba(162,155,254,0.12)',
          }}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <i className="ri-radar-line text-xs" style={{ color: '#A29BFE' }} />
              <span className="text-xs font-orbitron tracking-wider" style={{ color: '#A29BFE' }}>
                匹配预测
              </span>
            </div>
            <span
              className="font-orbitron text-sm font-bold"
              style={{ color: '#C3B5FF', textShadow: '0 0 10px rgba(162,155,254,0.6)' }}
            >
              HIGH
            </span>
          </div>
          <p className="text-xs font-noto leading-relaxed" style={{ color: 'rgba(224,239,255,0.75)' }}>
            基于你的{profile.tags.slice(0, 2).join('、')}标签，
            预计将在宇宙匹配池找到高契合度同好，分身即将开始代聊旅程。
          </p>
        </div>
      </div>

      {/* Buttons */}
      <div className="w-full max-w-sm flex flex-col gap-3">
        <button
          onClick={handleLaunch}
          className="w-full py-4 rounded-2xl font-orbitron text-sm font-bold tracking-widest cursor-pointer transition-all duration-300 active:scale-95 whitespace-nowrap"
          style={{
            background: 'linear-gradient(135deg, #6C5CE7, #00D1FF)',
            color: '#fff',
            boxShadow: '0 0 28px rgba(108,92,231,0.55)',
          }}
        >
          <span className="flex items-center justify-center gap-2">
            <i className="ri-rocket-2-line" />
            启动分身 · 进入宇宙
          </span>
        </button>
        <button
          className="w-full py-3 rounded-2xl text-xs font-noto cursor-pointer whitespace-nowrap transition-all duration-200"
          style={{
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.12)',
            color: 'rgba(224,239,255,0.65)',
          }}
          onClick={() => {
            const text = `我的星核报告\nID: ${starId}\n分身形态: ${avatarCfg.name}\n兴趣: ${profile.tags
              .slice(0, 4)
              .join('、')}`;
            navigator.clipboard?.writeText(text).catch(() => {});
          }}
        >
          <span className="flex items-center justify-center gap-2">
            <i className="ri-share-line" />
            分享报告
          </span>
        </button>
      </div>

      {/* Bottom guard */}
      <div className="mt-8 flex items-center gap-2">
        <i className="ri-shield-keyhole-line text-xs" style={{ color: 'rgba(0,209,255,0.5)' }} />
        <span className="text-xs font-noto" style={{ color: 'rgba(224,239,255,0.4)' }}>
          星核守护 · 所有数据本地加密，真人信息全程脱敏
        </span>
      </div>
    </div>
  );
}
