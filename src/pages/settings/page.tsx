import { useState } from 'react';
import StarBackground from '@/components/feature/StarBackground';
import BottomTabBar from '@/components/feature/BottomTabBar';
import PlatformBindModal, { type PlatformData } from './components/PlatformBindModal';
import DeepQuestionModal, { type DeepAnswers } from './components/DeepQuestionModal';
import DeepChatModal, { type DeepChatTags } from './components/DeepChatModal';

// ── Storage helpers ──────────────────────────────────────────────────────────
const STORAGE_PLATFORMS = 'settings_platforms';
const STORAGE_DEEP_ANSWERS = 'settings_deep_answers';
const STORAGE_DEEP_CHAT = 'settings_deep_chat';

function loadPlatforms(): PlatformData[] {
  const defaults: PlatformData[] = [
    { id: 'netease',     name: '网易云',   icon: 'ri-music-line',          color: '#FF6B6B', link: '', screenshot: '', bound: false },
    { id: 'zhihu',       name: '知乎',     icon: 'ri-question-answer-line', color: '#74B9FF', link: '', screenshot: '', bound: false },
    { id: 'xiaohongshu', name: '小红书',   icon: 'ri-leaf-line',            color: '#FF7675', link: '', screenshot: '', bound: false },
    { id: 'weibo',       name: '微博',     icon: 'ri-weibo-line',           color: '#FF9AA2', link: '', screenshot: '', bound: false },
    { id: 'douyin',      name: '抖音',     icon: 'ri-tiktok-line',          color: '#E0EFFF', link: '', screenshot: '', bound: false },
    { id: 'moreading',   name: '微信读书', icon: 'ri-book-read-line',       color: '#55EFC4', link: '', screenshot: '', bound: false },
  ];
  try {
    const raw = localStorage.getItem(STORAGE_PLATFORMS);
    if (!raw) {
      // Seed with profile data
      const profile = JSON.parse(localStorage.getItem('star_profile') || '{}');
      const seeded = defaults.map((p) => {
        if (p.id === 'netease' && profile.netease) return { ...p, link: profile.netease, bound: true };
        if (p.id === 'xiaohongshu' && profile.xiaohongshu) return { ...p, link: profile.xiaohongshu, bound: true };
        if (p.id === 'zhihu' && profile.zhihu) return { ...p, link: profile.zhihu, bound: true };
        if (p.id === 'weibo' && profile.weibo) return { ...p, link: profile.weibo, bound: true };
        if (p.id === 'douyin' && profile.douyin) return { ...p, link: profile.douyin, bound: true };
        if (p.id === 'moreading' && profile.moreading) return { ...p, link: profile.moreading, bound: true };
        return p;
      });
      return seeded;
    }
    const saved: PlatformData[] = JSON.parse(raw);
    return defaults.map((d) => saved.find((s) => s.id === d.id) || d);
  } catch { return defaults; }
}

function savePlatforms(data: PlatformData[]) {
  localStorage.setItem(STORAGE_PLATFORMS, JSON.stringify(data));
}

function loadDeepAnswers(): Partial<DeepAnswers> {
  try { return JSON.parse(localStorage.getItem(STORAGE_DEEP_ANSWERS) || '{}'); } catch { return {}; }
}

function loadDeepChat(): DeepChatTags {
  try { return JSON.parse(localStorage.getItem(STORAGE_DEEP_CHAT) || '{}'); } catch { return {}; }
}

// ── Understanding score computation ─────────────────────────────────────────
function computeScore(platforms: PlatformData[], deepAnswers: Partial<DeepAnswers>, chatTags: DeepChatTags): number {
  const platformScore = (platforms.filter((p) => p.bound).length / platforms.length) * 40;
  const deepAnswerKeys = Object.values(deepAnswers).filter((v) => v && v !== '').length;
  const deepAnswerScore = (deepAnswerKeys / 13) * 35;
  const chatScore = (Object.keys(chatTags).length / 16) * 25;
  return Math.min(100, Math.round(platformScore + deepAnswerScore + chatScore));
}

// ── Sub-components ───────────────────────────────────────────────────────────
const GLASS_CARD: React.CSSProperties = {
  background: 'linear-gradient(135deg,rgba(255,255,255,0.09) 0%,rgba(255,255,255,0.05) 50%,rgba(255,255,255,0.07) 100%)',
  backdropFilter: 'blur(24px) saturate(180%)',
  WebkitBackdropFilter: 'blur(24px) saturate(180%)',
  border: '1px solid rgba(255,255,255,0.13)',
};

function ToggleSwitch({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!value)}
      className="w-12 h-6 rounded-full relative cursor-pointer transition-all duration-300 shrink-0"
      style={{
        background: value ? 'linear-gradient(135deg,#6C5CE7,#00D1FF)' : 'rgba(255,255,255,0.1)',
        border: value ? '1px solid rgba(108,92,231,0.5)' : '1px solid rgba(255,255,255,0.1)',
        boxShadow: value ? '0 0 10px rgba(108,92,231,0.3)' : 'none',
      }}
    >
      <div
        className="absolute top-1 w-4 h-4 rounded-full bg-white transition-all duration-300"
        style={{ left: value ? '26px' : '4px', boxShadow: '0 1px 4px rgba(0,0,0,0.3)' }}
      />
    </button>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-orbitron tracking-widest mb-3 font-semibold" style={{ color: 'rgba(224,239,255,0.55)' }}>
      {children}
    </p>
  );
}

function RowDivider() {
  return <div style={{ height: '1px', background: 'rgba(255,255,255,0.07)' }} />;
}

function SelectRow({ label, options, value, onChange }: {
  label: string; options: string[]; value: string; onChange: (v: string) => void;
}) {
  return (
    <div className="flex items-center justify-between py-3">
      <span className="text-sm font-noto font-medium" style={{ color: 'rgba(224,239,255,0.65)' }}>{label}</span>
      <div className="flex gap-1.5 flex-wrap justify-end">
        {options.map((opt) => (
          <button
            key={opt}
            onClick={() => onChange(opt)}
            className="px-2.5 py-1 rounded-full text-xs font-noto font-medium cursor-pointer whitespace-nowrap transition-all duration-150"
            style={{
              background: value === opt ? 'rgba(108,92,231,0.28)' : 'rgba(255,255,255,0.07)',
              border: value === opt ? '1px solid rgba(108,92,231,0.5)' : '1px solid rgba(255,255,255,0.1)',
              color: value === opt ? '#C4BBFF' : 'rgba(224,239,255,0.55)',
            }}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}

function ToggleRow({ label, value, onChange, last = false }: {
  label: string; value: boolean; onChange: (v: boolean) => void; last?: boolean;
}) {
  return (
    <>
      <div className="flex items-center justify-between py-3">
        <span className="text-sm font-noto font-medium" style={{ color: 'rgba(224,239,255,0.65)' }}>{label}</span>
        <ToggleSwitch value={value} onChange={onChange} />
      </div>
      {!last && <RowDivider />}
    </>
  );
}

// ── Score ring ───────────────────────────────────────────────────────────────
function ScoreRing({ score }: { score: number }) {
  const r = 28;
  const circumference = 2 * Math.PI * r;
  const filled = (score / 100) * circumference;

  const color = score >= 80 ? '#00D1FF' : score >= 50 ? '#A29BFE' : '#FDCB6E';
  const label = score >= 80 ? '深度了解' : score >= 50 ? '初步了解' : '了解中';

  return (
    <div className="flex items-center gap-3">
      <div className="relative w-16 h-16 flex items-center justify-center">
        <svg width="64" height="64" className="absolute inset-0" style={{ transform: 'rotate(-90deg)' }}>
          <circle cx="32" cy="32" r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="4" />
          <circle
            cx="32" cy="32" r={r}
            fill="none"
            stroke={color}
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={`${filled} ${circumference - filled}`}
            style={{ transition: 'stroke-dasharray 0.8s ease', filter: `drop-shadow(0 0 4px ${color}88)` }}
          />
        </svg>
        <span className="font-orbitron text-sm font-black" style={{ color }}>{score}</span>
      </div>
      <div>
        <p className="font-orbitron text-base font-bold" style={{ color: '#E0EFFF' }}>AI分身了解程度</p>
        <p className="text-xs font-noto mt-0.5" style={{ color }}>
          {label} · {score}%
        </p>
      </div>
    </div>
  );
}

// ── Main page ────────────────────────────────────────────────────────────────
export default function SettingsPage() {
  const [platforms, setPlatforms] = useState<PlatformData[]>(loadPlatforms);
  const [deepAnswers, setDeepAnswers] = useState<Partial<DeepAnswers>>(loadDeepAnswers);
  const [chatTags, setChatTags] = useState<DeepChatTags>(loadDeepChat);

  const [editPlatform, setEditPlatform] = useState<PlatformData | null>(null);
  const [showDeepQ, setShowDeepQ] = useState(false);
  const [showDeepChat, setShowDeepChat] = useState(false);

  const [maxMatches, setMaxMatches] = useState('10');
  const [matchMode, setMatchMode] = useState('AI代聊');
  const [chatStyle, setChatStyle] = useState('幽默');
  const [activity, setActivity] = useState('中');
  const [desensitize, setDesensitize] = useState(true);
  const [encrypt, setEncrypt] = useState(true);
  const [notifyMatch, setNotifyMatch] = useState(true);
  const [notifyChat, setNotifyChat] = useState(true);
  const [theme, setTheme] = useState('深空暗调');
  const [showDestroyConfirm, setShowDestroyConfirm] = useState(false);
  const [destroyed, setDestroyed] = useState(false);

  const score = computeScore(platforms, deepAnswers, chatTags);

  const handlePlatformSave = (updated: PlatformData) => {
    const next = platforms.map((p) => p.id === updated.id ? updated : p);
    setPlatforms(next);
    savePlatforms(next);
  };

  const handleDeepAnswersSave = (answers: DeepAnswers) => {
    setDeepAnswers(answers);
    localStorage.setItem(STORAGE_DEEP_ANSWERS, JSON.stringify(answers));
    setShowDeepQ(false);
  };

  const handleDeepChatSave = (tags: DeepChatTags) => {
    setChatTags(tags);
    localStorage.setItem(STORAGE_DEEP_CHAT, JSON.stringify(tags));
  };

  const handleDestroyConfirm = () => {
    localStorage.clear();
    setDestroyed(true);
    setShowDestroyConfirm(false);
    setTimeout(() => window.location.reload(), 1200);
  };

  const profile = (() => {
    try { return JSON.parse(localStorage.getItem('star_profile') || '{}'); } catch { return {}; }
  })();
  const dustCount = parseInt(localStorage.getItem('star_dust_count') || '3');

  const deepAnswerCount = Object.values(deepAnswers).filter((v) => v && v !== '').length;
  const chatAnswerCount = Object.keys(chatTags).length;

  return (
    <>
      <div className="min-h-screen pb-24 relative overflow-x-hidden" style={{ background: '#0F0F1E' }}>
        <StarBackground particleCount={25} />

        <div className="relative z-10 max-w-md mx-auto px-4 pt-12">

          {/* ══ AI 分身了解程度 ══ */}
          <div className="mb-6">
            <div
              className="p-4 rounded-3xl"
              style={{
                background: 'linear-gradient(135deg,rgba(108,92,231,0.12) 0%,rgba(0,209,255,0.06) 100%)',
                backdropFilter: 'blur(24px) saturate(180%)',
                WebkitBackdropFilter: 'blur(24px) saturate(180%)',
                border: '1px solid rgba(108,92,231,0.22)',
              }}
            >
              <ScoreRing score={score} />

              {/* ── 社交平台绑定 ── */}
              <div className="mt-5">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-orbitron tracking-widest font-semibold" style={{ color: 'rgba(224,239,255,0.55)' }}>
                    社交平台绑定
                  </p>
                  <span className="text-xs font-noto" style={{ color: 'rgba(224,239,255,0.4)' }}>
                    {platforms.filter((p) => p.bound).length}/{platforms.length} 已绑定
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-1.5">
                  {platforms.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => setEditPlatform(p)}
                      className="flex items-center gap-2 px-2.5 py-2 rounded-xl cursor-pointer transition-all duration-200 active:scale-95 relative"
                      style={{
                        background: p.bound
                          ? `linear-gradient(135deg,${p.color}20,${p.color}0d)`
                          : 'rgba(255,255,255,0.05)',
                        border: p.bound ? `1px solid ${p.color}44` : '1px solid rgba(255,255,255,0.09)',
                      }}
                    >
                      <div className="relative shrink-0">
                        <i className={`${p.icon} text-sm`} style={{ color: p.bound ? p.color : 'rgba(224,239,255,0.35)' }} />
                        {p.bound && (
                          <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full flex items-center justify-center"
                            style={{ background: 'linear-gradient(135deg,#6C5CE7,#00D1FF)' }}>
                            <i className="ri-check-line text-white" style={{ fontSize: '6px' }} />
                          </div>
                        )}
                      </div>
                      <span className="font-noto font-medium truncate" style={{ color: p.bound ? p.color : 'rgba(224,239,255,0.35)', fontSize: '11px' }}>
                        {p.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* ── 深度对话了解 ── */}
              <div className="mt-5">
                <p className="text-xs font-orbitron tracking-widest font-semibold mb-3" style={{ color: 'rgba(224,239,255,0.55)' }}>
                  深度对话了解
                </p>
                <div className="flex flex-col gap-2.5">

                  {/* 深度问题板块 */}
                  <button
                    onClick={() => setShowDeepQ(true)}
                    className="flex items-center gap-3 p-3.5 rounded-2xl cursor-pointer transition-all duration-200 active:scale-98 text-left"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)' }}
                  >
                    <div className="w-10 h-10 flex items-center justify-center rounded-xl shrink-0"
                      style={{ background: 'rgba(253,203,110,0.15)', border: '1px solid rgba(253,203,110,0.25)' }}>
                      <i className="ri-questionnaire-line text-base" style={{ color: '#FDCB6E' }} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-noto font-semibold" style={{ color: '#E0EFFF' }}>深度问题板块</p>

                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <i className="ri-arrow-right-s-line" style={{ color: 'rgba(224,239,255,0.3)' }} />
                    </div>
                  </button>

                  {/* 分身深度对话板块 */}
                  <button
                    onClick={() => setShowDeepChat(true)}
                    className="flex items-center gap-3 p-3.5 rounded-2xl cursor-pointer transition-all duration-200 active:scale-98 text-left"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)' }}
                  >
                    <div className="w-10 h-10 flex items-center justify-center rounded-xl shrink-0"
                      style={{ background: 'rgba(108,92,231,0.18)', border: '1px solid rgba(108,92,231,0.3)' }}>
                      <i className="ri-robot-line text-base" style={{ color: '#A29BFE' }} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-noto font-semibold" style={{ color: '#E0EFFF' }}>分身深度对话</p>

                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <i className="ri-arrow-right-s-line" style={{ color: 'rgba(224,239,255,0.3)' }} />
                    </div>
                  </button>
                </div>
              </div>

              {/* Progress hint */}
              {score < 100 && (
                <div className="mt-4 px-3 py-2.5 rounded-xl flex items-center gap-2"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                  <i className="ri-information-line text-xs" style={{ color: 'rgba(224,239,255,0.4)' }} />
                  <p className="text-xs font-noto" style={{ color: 'rgba(224,239,255,0.45)' }}>
                    {score < 40 ? '绑定更多平台，了解度+40%' : score < 70 ? '完成深度问题，了解度+35%' : '完成分身对话，了解度达到100%'}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* ── Matching settings ── */}
          <div className="mb-6">
            <SectionLabel>匹配机制设置</SectionLabel>
            <div className="px-4 rounded-3xl" style={GLASS_CARD}>
              <SelectRow label="最大匹配数量" options={['5', '10', '15']} value={maxMatches} onChange={setMaxMatches} />
              <RowDivider />
              <SelectRow label="默认匹配模式" options={['AI代聊', '直接真人']} value={matchMode} onChange={setMatchMode} />
            </div>
          </div>

          {/* ── Avatar settings ── */}
          <div className="mb-6">
            <SectionLabel>分身设置</SectionLabel>
            <div className="px-4 rounded-3xl" style={GLASS_CARD}>
              <SelectRow label="说话风格" options={['幽默', '温柔', '高冷', '理性']} value={chatStyle} onChange={setChatStyle} />
              <RowDivider />
              <SelectRow label="社交活跃度" options={['高', '中', '低']} value={activity} onChange={setActivity} />
            </div>
          </div>

          {/* ── Privacy ── */}
          <div className="mb-6">
            <SectionLabel>星核守护 · 隐私安全</SectionLabel>
            <div className="px-4 rounded-3xl" style={GLASS_CARD}>
              <ToggleRow label="真人信息脱敏" value={desensitize} onChange={setDesensitize} />
              <ToggleRow label="数据本地加密" value={encrypt} onChange={setEncrypt} last />
              <div className="py-3">
                <button
                  onClick={() => setShowDestroyConfirm(true)}
                  className="w-full py-3 rounded-2xl text-sm font-noto font-medium cursor-pointer whitespace-nowrap transition-all duration-150 active:scale-95"
                  style={{ background: 'rgba(255,75,75,0.1)', border: '1px solid rgba(255,75,75,0.28)', color: 'rgba(255,120,120,0.9)' }}
                >
                  <span className="flex items-center justify-center gap-2">
                    <i className="ri-delete-bin-6-line" />
                    一键销毁所有分身数据
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* ── Other settings ── */}
          <div className="mb-6">
            <SectionLabel>其他设置</SectionLabel>
            <div className="px-4 rounded-3xl" style={GLASS_CARD}>
              <SelectRow label="主题" options={['深空暗调', '星云亮调']} value={theme} onChange={setTheme} />
              <RowDivider />
              <ToggleRow label="匹配成功提醒" value={notifyMatch} onChange={setNotifyMatch} />
              <ToggleRow label="代聊进度提醒" value={notifyChat} onChange={setNotifyChat} last />
            </div>
          </div>


        </div>

        <BottomTabBar />
      </div>

      {/* ── Platform bind modal ── */}
      {editPlatform && (
        <PlatformBindModal
          platform={editPlatform}
          onClose={() => setEditPlatform(null)}
          onSave={handlePlatformSave}
        />
      )}

      {/* ── Deep questions modal ── */}
      {showDeepQ && (
        <DeepQuestionModal
          initialAnswers={deepAnswers}
          onClose={() => setShowDeepQ(false)}
          onSave={handleDeepAnswersSave}
        />
      )}

      {/* ── Deep chat modal ── */}
      {showDeepChat && (
        <DeepChatModal
          initialTags={chatTags}
          onClose={() => { setShowDeepChat(false); }}
          onSave={handleDeepChatSave}
        />
      )}

      {/* ── Destroy confirm ── */}
      {showDestroyConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-6"
          style={{ background: 'rgba(8,7,20,0.88)', backdropFilter: 'blur(12px)' }}
        >
          <div
            className="w-full max-w-sm p-6 rounded-3xl"
            style={{
              background: 'linear-gradient(135deg,rgba(40,20,30,0.92),rgba(20,15,30,0.88))',
              backdropFilter: 'blur(28px) saturate(180%)',
              WebkitBackdropFilter: 'blur(28px) saturate(180%)',
              border: '1px solid rgba(255,75,75,0.32)',
            }}
          >
            <div className="text-center mb-5">
              <div className="w-12 h-12 flex items-center justify-center rounded-full mx-auto mb-3"
                style={{ background: 'rgba(255,75,75,0.14)', border: '1px solid rgba(255,75,75,0.28)' }}>
                <i className="ri-error-warning-line text-2xl" style={{ color: 'rgba(255,120,120,0.9)' }} />
              </div>
              <h3 className="font-orbitron text-base font-bold mb-2" style={{ color: '#E0EFFF' }}>确认销毁？</h3>
              <p className="text-xs font-noto leading-relaxed" style={{ color: 'rgba(224,239,255,0.5)' }}>
                这将清除所有本地分身数据、聊天记录、匹配历史，操作不可撤销。
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDestroyConfirm(false)}
                className="flex-1 py-3 rounded-2xl text-sm font-noto font-medium cursor-pointer whitespace-nowrap"
                style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(224,239,255,0.65)' }}
              >
                取消
              </button>
              <button
                onClick={handleDestroyConfirm}
                className="flex-1 py-3 rounded-2xl text-sm font-noto font-bold cursor-pointer whitespace-nowrap"
                style={{ background: 'rgba(255,75,75,0.18)', border: '1px solid rgba(255,75,75,0.38)', color: 'rgba(255,130,130,0.95)' }}
              >
                确认销毁
              </button>
            </div>
          </div>
        </div>
      )}

      {destroyed && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(15,15,30,0.97)', backdropFilter: 'blur(20px)' }}>
          <div className="text-center">
            <i className="ri-delete-bin-6-line text-5xl mb-4 block" style={{ color: 'rgba(255,120,120,0.8)' }} />
            <p className="font-orbitron text-base font-bold mb-1" style={{ color: '#E0EFFF' }}>分身数据已销毁</p>
            <p className="text-xs font-noto" style={{ color: 'rgba(224,239,255,0.45)' }}>正在重置应用...</p>
          </div>
        </div>
      )}
    </>
  );
}
