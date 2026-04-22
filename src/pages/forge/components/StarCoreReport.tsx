import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getClientId } from '@/lib/clientId';
import { analyzeProfile, fetchLatestReport, type SoulReport } from '@/lib/reportApi';

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

const ANALYZE_PHASES = [
  '正在整理你的分身标签...',
  '正在读取已绑定的平台链接...',
  '正在抓取公开主页中的可见信息...',
  '正在汇总人格线索并生成报告...',
];

function buildQuestionnaireSummary(profile: Profile) {
  return Object.entries(profile.answers || {})
    .filter(([, value]) => Boolean(value))
    .map(([key, value], index) => `Q${index + 1}【${key}】${value}`)
    .join('\n\n');
}

export default function StarCoreReport() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [starId] = useState(
    () =>
      `STAR-${Math.floor(1000 + Math.random() * 9000)}-${String.fromCharCode(
        65 + Math.floor(Math.random() * 26),
      )}${String.fromCharCode(65 + Math.floor(Math.random() * 26))}`,
  );
  const [revealed, setRevealed] = useState(false);
  const [report, setReport] = useState<SoulReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [debugSummary, setDebugSummary] = useState('');

  useEffect(() => {
    const raw = localStorage.getItem('star_profile');
    if (raw) setProfile(JSON.parse(raw) as Profile);
    const t = setTimeout(() => setRevealed(true), 400);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!profile) return;
    let active = true;
    const phaseTimer = window.setInterval(() => {
      setPhaseIndex((prev) => (prev + 1 < ANALYZE_PHASES.length ? prev + 1 : prev));
    }, 1100);

    void (async () => {
      try {
        setLoading(true);
        setError('');
        const clientId = getClientId();
        const cached = await fetchLatestReport(clientId).catch(() => null);
        if (cached?.report && active) {
          setReport(cached.report);
          setDebugSummary(cached.debug?.scrapeSummary || '');
        }
        const result = await analyzeProfile({
          clientId,
          profile,
          questionnaireSummary: buildQuestionnaireSummary(profile),
          openTextSummary: [profile.nickname, ...(profile.tags || [])].filter(Boolean).join(' / '),
        });
        if (!active) return;
        setReport(result.report);
        setDebugSummary(result.debug?.scrapeSummary || '');
      } catch (err) {
        if (!active) return;
        setError(err instanceof Error ? err.message : '报告生成失败');
      } finally {
        if (!active) return;
        setLoading(false);
        window.clearInterval(phaseTimer);
      }
    })();

    return () => {
      active = false;
      window.clearInterval(phaseTimer);
    };
  }, [profile]);

  const handleLaunch = () => {
    localStorage.setItem('star_activated', '1');
    localStorage.setItem('star_id', starId);
    navigate('/avatar');
  };

  const avatarCfg = AVATAR_CONFIG[profile?.avatar || 'constellation'] || AVATAR_CONFIG.constellation;
  const reportHeadline = useMemo(() => {
    if (report?.title) return report.title;
    if (profile?.tags?.length >= 2) return `${profile.tags[0]} × ${profile.tags[1]} 的稀有混合体`;
    return '低噪音、高辨识度的稀有型分身';
  }, [profile, report]);

  if (!profile) return null;

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-start pb-16 px-4 pt-8"
      style={{ opacity: revealed ? 1 : 0, transition: 'opacity 0.6s ease' }}
    >
      <div className="text-center mb-8">
        <div
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full mb-4"
          style={{ background: 'rgba(0,209,255,0.12)', border: '1px solid rgba(0,209,255,0.35)' }}
        >
          <i className="ri-sparkling-2-line text-xs" style={{ color: '#00D1FF' }} />
          <span className="text-xs font-orbitron tracking-widest" style={{ color: '#00D1FF' }}>
            {loading ? '星核报告生成中' : '星核报告已生成'}
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

      <div className="relative w-40 h-40 flex items-center justify-center mb-8">
        <div className="absolute inset-0 rounded-full animate-orbit" style={{ border: `1px solid ${avatarCfg.color}30` }} />
        <div className="absolute inset-4 rounded-full animate-orbit-reverse" style={{ border: `1px solid ${avatarCfg.color}20` }} />
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
      </div>

      <div className="w-full max-w-sm mb-4">
        <div className="flex flex-wrap gap-2 justify-center">
          {(report?.avatarTags?.length ? report.avatarTags : profile.tags.slice(0, 8)).map((tag) => (
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

      <div className="w-full max-w-sm flex flex-col gap-3 mb-8">
        <div className="p-4 rounded-2xl" style={GLASS_CARD}>
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: '分身形态', value: avatarCfg.name, icon: avatarCfg.icon, color: avatarCfg.color },
              { label: '报告人格', value: report?.mbti || '分析中', icon: 'ri-brain-line', color: '#00D1FF' },
              { label: '平台线索', value: debugSummary ? `${debugSummary.split('|').length}个` : '读取中', icon: 'ri-radar-line', color: '#A29BFE' },
              { label: '兴趣标签', value: `${(report?.avatarTags || profile.tags).length}个`, icon: 'ri-price-tag-3-line', color: '#74B9FF' },
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
              {loading ? '分析中' : '已接后端'}
            </span>
          </div>

          <div className="rounded-2xl px-3.5 py-3 mb-3" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div className="text-[11px] font-noto mb-1.5" style={{ color: 'rgba(224,239,255,0.48)' }}>
              星核主结论
            </div>
            <div className="text-sm font-noto font-bold leading-relaxed" style={{ color: '#E0EFFF' }}>
              {reportHeadline}
            </div>
            <p className="text-xs font-noto mt-2 leading-relaxed" style={{ color: 'rgba(224,239,255,0.68)' }}>
              {loading ? ANALYZE_PHASES[phaseIndex] : report?.overall || '报告已生成，可继续进入模拟器校准人物画像。'}
            </p>
          </div>

          {error && (
            <div className="rounded-2xl px-3.5 py-3 mb-3" style={{ background: 'rgba(255,118,117,0.06)', border: '1px solid rgba(255,118,117,0.16)' }}>
              <p className="text-xs font-noto leading-relaxed" style={{ color: '#FFB0B0' }}>{error}</p>
            </div>
          )}

          {!loading && report?.blocks?.length ? (
            <div className="grid grid-cols-1 gap-2.5">
              {report.blocks.slice(0, 4).map((item) => (
                <div key={`${item.source}-${item.title}`} className="rounded-2xl px-3.5 py-3" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span style={{ fontSize: '13px' }}>{item.icon}</span>
                    <span className="text-xs font-noto font-semibold" style={{ color: '#E0EFFF' }}>{item.source}</span>
                  </div>
                  <p className="text-[11px] font-noto mb-1" style={{ color: '#9adcf6' }}>{item.title}</p>
                  <p className="text-xs font-noto leading-relaxed" style={{ color: 'rgba(224,239,255,0.62)' }}>
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-2.5">
              {ANALYZE_PHASES.map((item, index) => (
                <div key={item} className="rounded-2xl px-3.5 py-3" style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${index <= phaseIndex ? 'rgba(0,209,255,0.2)' : 'rgba(255,255,255,0.07)'}` }}>
                  <div className="flex items-center gap-2 mb-1.5">
                    <i className={`${index < phaseIndex ? 'ri-checkbox-circle-line' : index === phaseIndex ? 'ri-loader-4-line animate-spin' : 'ri-time-line'}`} style={{ color: index <= phaseIndex ? '#00D1FF' : 'rgba(224,239,255,0.4)', fontSize: '13px' }} />
                    <span className="text-xs font-noto font-semibold" style={{ color: '#E0EFFF' }}>分析步骤 {index + 1}</span>
                  </div>
                  <p className="text-xs font-noto leading-relaxed" style={{ color: 'rgba(224,239,255,0.62)' }}>{item}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {report?.article?.section4?.finalCard && (
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
            <div className="flex items-center gap-2 mb-3">
              <i className="ri-radar-line text-xs" style={{ color: '#A29BFE' }} />
              <span className="text-xs font-orbitron tracking-wider" style={{ color: '#A29BFE' }}>
                最终建议
              </span>
            </div>
            <p className="text-xs font-noto leading-relaxed mb-2" style={{ color: 'rgba(224,239,255,0.75)' }}>
              {report.article.section4.finalCard.intro}
            </p>
            <div className="flex flex-col gap-1.5">
              {(report.article.section4.finalCard.summaryLines || []).map((line) => (
                <div key={line} className="flex items-start gap-2">
                  <i className="ri-sparkling-line mt-0.5" style={{ color: '#C3B5FF', fontSize: '11px' }} />
                  <span className="text-xs font-noto" style={{ color: 'rgba(224,239,255,0.68)' }}>{line}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

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
            const text = `我的星核报告\nID: ${starId}\n标题: ${reportHeadline}\n概述: ${report?.overall || ''}`;
            navigator.clipboard?.writeText(text).catch(() => {});
          }}
        >
          <span className="flex items-center justify-center gap-2">
            <i className="ri-share-line" />
            分享报告
          </span>
        </button>
      </div>

      {debugSummary && (
        <div className="mt-6 w-full max-w-sm rounded-2xl px-4 py-3" style={{ background: 'rgba(0,209,255,0.05)', border: '1px solid rgba(0,209,255,0.12)' }}>
          <div className="flex items-center gap-2 mb-2">
            <i className="ri-terminal-box-line text-xs" style={{ color: '#00D1FF' }} />
            <span className="text-xs font-orbitron tracking-wider" style={{ color: '#00D1FF' }}>抓取摘要</span>
          </div>
          <p className="text-[11px] font-noto leading-relaxed" style={{ color: 'rgba(224,239,255,0.55)' }}>{debugSummary}</p>
        </div>
      )}

      <div className="mt-8 flex items-center gap-2">
        <i className="ri-shield-keyhole-line text-xs" style={{ color: 'rgba(0,209,255,0.5)' }} />
        <span className="text-xs font-noto" style={{ color: 'rgba(224,239,255,0.4)' }}>
          星核守护 · 当前版本已接入后端分析链，可继续补充更多平台登录态提升抓取稳定性
        </span>
      </div>
    </div>
  );
}
