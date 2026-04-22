import { useRef, useState } from 'react';

const PLATFORMS = [
  { id: 'wechat', name: '朋友圈', icon: 'ri-wechat-line', color: '#07C160' },
  { id: 'netease', name: '网易云', icon: 'ri-music-line', color: '#FF4D4D' },
  { id: 'zhihu', name: '知乎', icon: 'ri-question-answer-line', color: '#4FACFE' },
  { id: 'weibo', name: '微博', icon: 'ri-weibo-line', color: '#FF6B6B' },
  { id: 'xiaohongshu', name: '小红书', icon: 'ri-leaf-line', color: '#FF7A9A' },
  { id: 'douyin', name: '抖音', icon: 'ri-tiktok-line', color: '#A29BFE' },
];

const GLASS: React.CSSProperties = {
  backdropFilter: 'blur(24px) saturate(180%)',
  WebkitBackdropFilter: 'blur(24px) saturate(180%)',
  background: 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%)',
  border: '1px solid rgba(255,255,255,0.12)',
  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.1)',
};

type InputMode = 'link' | 'screenshot';

interface PlatformData {
  mode: InputMode;
  link: string;
  screenshots: string[]; // base64 preview urls
}

interface Props {
  onNext: () => void;
}

export default function StepUpload({ onNext }: Props) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [platformData, setPlatformData] = useState<Record<string, PlatformData>>({});
  const [analyzing, setAnalyzing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const activePlatformRef = useRef<string>('');

  const completedCount = Object.keys(platformData).filter((id) => {
    const d = platformData[id];
    return (d.mode === 'link' && d.link.trim()) || (d.mode === 'screenshot' && d.screenshots.length > 0);
  }).length;

  const getPlatformData = (id: string): PlatformData =>
    platformData[id] ?? { mode: 'link', link: '', screenshots: [] };

  const updatePlatform = (id: string, patch: Partial<PlatformData>) => {
    setPlatformData((prev) => ({
      ...prev,
      [id]: { ...getPlatformData(id), ...patch },
    }));
  };

  const handleScreenshotUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    const pid = activePlatformRef.current;
    if (!pid || files.length === 0) return;
    const readers = files.map(
      (file) =>
        new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = (ev) => resolve(ev.target?.result as string);
          reader.readAsDataURL(file);
        })
    );
    Promise.all(readers).then((urls) => {
      const current = getPlatformData(pid).screenshots;
      updatePlatform(pid, { screenshots: [...current, ...urls].slice(0, 4) });
    });
    e.target.value = '';
  };

  const removeScreenshot = (pid: string, idx: number) => {
    const shots = [...getPlatformData(pid).screenshots];
    shots.splice(idx, 1);
    updatePlatform(pid, { screenshots: shots });
  };

  const handleAnalyze = () => {
    if (completedCount === 0) return;
    setAnalyzing(true);
    setTimeout(() => {
      setAnalyzing(false);
      onNext();
    }, 1800);
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="rounded-2xl p-5 text-center" style={GLASS}>
        <div
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-3"
          style={{ background: 'rgba(108,92,231,0.2)', border: '1px solid rgba(108,92,231,0.4)' }}
        >
          <i className="ri-upload-cloud-line text-sm" style={{ color: '#A29BFE' }} />
          <span className="text-xs font-noto" style={{ color: '#A29BFE' }}>AI自动提取人格标签</span>
        </div>
        <h2 className="font-orbitron text-xl font-bold mb-1" style={{ color: '#E0EFFF' }}>
          上传社交素材
        </h2>
        <p className="text-xs font-noto" style={{ color: 'rgba(224,239,255,0.55)' }}>
          粘贴主页链接 或 上传截图，AI自动解析你的人格
        </p>
      </div>

      {/* Platform list */}
      <div className="flex flex-col gap-2">
        {PLATFORMS.map((p) => {
          const data = getPlatformData(p.id);
          const isOpen = expanded === p.id;
          const isDone =
            (data.mode === 'link' && data.link.trim()) ||
            (data.mode === 'screenshot' && data.screenshots.length > 0);

          return (
            <div key={p.id} className="rounded-2xl overflow-hidden" style={GLASS}>
              {/* Platform row */}
              <button
                className="w-full flex items-center gap-3 px-4 py-3.5 cursor-pointer transition-all duration-200"
                style={{ background: 'transparent' }}
                onClick={() => setExpanded(isOpen ? null : p.id)}
              >
                <div
                  className="w-9 h-9 flex items-center justify-center rounded-xl flex-shrink-0"
                  style={{ background: `${p.color}22` }}
                >
                  <i className={`${p.icon} text-lg`} style={{ color: p.color }} />
                </div>
                <span className="flex-1 text-sm font-noto text-left" style={{ color: 'rgba(224,239,255,0.9)' }}>
                  {p.name}
                </span>

                {isDone ? (
                  <div
                    className="flex items-center gap-1 px-2.5 py-1 rounded-full"
                    style={{ background: 'rgba(0,209,255,0.12)', border: '1px solid rgba(0,209,255,0.35)' }}
                  >
                    <i className="ri-check-line" style={{ color: '#00D1FF', fontSize: '11px' }} />
                    <span className="text-xs font-noto" style={{ color: '#00D1FF' }}>
                      {data.mode === 'screenshot' ? `${data.screenshots.length}张截图` : '已填链接'}
                    </span>
                  </div>
                ) : (
                  <i
                    className={isOpen ? 'ri-arrow-up-s-line text-sm' : 'ri-arrow-down-s-line text-sm'}
                    style={{ color: 'rgba(224,239,255,0.4)' }}
                  />
                )}
              </button>

              {/* Expanded panel */}
              {isOpen && (
                <div
                  className="px-4 pb-4 flex flex-col gap-3"
                  style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}
                >
                  {/* Mode toggle */}
                  <div className="flex gap-2 pt-3">
                    {(['link', 'screenshot'] as InputMode[]).map((mode) => (
                      <button
                        key={mode}
                        onClick={() => updatePlatform(p.id, { mode })}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-noto cursor-pointer transition-all duration-200 whitespace-nowrap"
                        style={{
                          background: data.mode === mode ? 'rgba(108,92,231,0.25)' : 'rgba(255,255,255,0.05)',
                          border: data.mode === mode ? '1px solid rgba(108,92,231,0.6)' : '1px solid rgba(255,255,255,0.1)',
                          color: data.mode === mode ? '#C3B5FF' : 'rgba(224,239,255,0.55)',
                        }}
                      >
                        <i className={mode === 'link' ? 'ri-links-line' : 'ri-image-line'} style={{ fontSize: '12px' }} />
                        {mode === 'link' ? '粘贴链接' : '上传截图'}
                      </button>
                    ))}
                  </div>

                  {/* Link input */}
                  {data.mode === 'link' && (
                    <input
                      type="text"
                      value={data.link}
                      onChange={(e) => updatePlatform(p.id, { link: e.target.value })}
                      placeholder={`粘贴${p.name}主页链接...`}
                      className="w-full px-4 py-3 rounded-xl text-sm font-noto outline-none"
                      style={{
                        background: 'rgba(255,255,255,0.06)',
                        border: '1px solid rgba(255,255,255,0.12)',
                        color: '#E0EFFF',
                      }}
                    />
                  )}

                  {/* Screenshot upload */}
                  {data.mode === 'screenshot' && (
                    <div className="flex flex-col gap-2">
                      {/* Previews */}
                      {data.screenshots.length > 0 && (
                        <div className="grid grid-cols-2 gap-2">
                          {data.screenshots.map((src, idx) => (
                            <div key={idx} className="relative rounded-xl overflow-hidden" style={{ height: '90px' }}>
                              <img src={src} alt="" className="w-full h-full object-cover" />
                              <button
                                onClick={() => removeScreenshot(p.id, idx)}
                                className="absolute top-1 right-1 w-5 h-5 flex items-center justify-center rounded-full cursor-pointer"
                                style={{ background: 'rgba(0,0,0,0.65)' }}
                              >
                                <i className="ri-close-line text-white" style={{ fontSize: '11px' }} />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}

                      {data.screenshots.length < 4 && (
                        <button
                          onClick={() => {
                            activePlatformRef.current = p.id;
                            fileInputRef.current?.click();
                          }}
                          className="w-full py-3 rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all duration-200"
                          style={{
                            background: 'rgba(255,255,255,0.04)',
                            border: '1px dashed rgba(255,255,255,0.2)',
                          }}
                        >
                          <i className="ri-add-line" style={{ color: 'rgba(162,155,254,0.8)', fontSize: '16px' }} />
                          <span className="text-xs font-noto" style={{ color: 'rgba(224,239,255,0.55)' }}>
                            点击上传截图（最多4张）
                          </span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleScreenshotUpload}
      />

      {/* Progress hint */}
      {completedCount > 0 && (
        <div
          className="flex items-center gap-2 px-4 py-3 rounded-xl"
          style={{
            background: 'rgba(0,209,255,0.08)',
            border: '1px solid rgba(0,209,255,0.25)',
          }}
        >
          <i className="ri-sparkling-2-line" style={{ color: '#00D1FF', fontSize: '14px' }} />
          <span className="text-xs font-noto" style={{ color: '#81ECEC' }}>
            已收集 {completedCount} 个平台素材，AI将提取你的人格标签
          </span>
        </div>
      )}

      {/* CTA */}
      <button
        onClick={handleAnalyze}
        disabled={completedCount === 0}
        className="w-full py-4 rounded-2xl font-orbitron text-sm font-bold tracking-widest cursor-pointer transition-all duration-300 active:scale-95 whitespace-nowrap relative overflow-hidden"
        style={{
          background: completedCount > 0 ? 'linear-gradient(135deg, #6C5CE7, #00D1FF)' : 'rgba(255,255,255,0.06)',
          color: completedCount > 0 ? '#fff' : 'rgba(224,239,255,0.3)',
          boxShadow: completedCount > 0 ? '0 0 24px rgba(108,92,231,0.5)' : 'none',
        }}
      >
        {analyzing ? (
          <span className="flex items-center justify-center gap-2">
            <i className="ri-loader-4-line animate-spin" />
            AI解析中...
          </span>
        ) : (
          <span className="flex items-center justify-center gap-2">
            <i className="ri-cpu-line" />
            开始AI解析
          </span>
        )}
      </button>

      <button
        onClick={onNext}
        className="text-center text-xs font-noto cursor-pointer py-1 whitespace-nowrap"
        style={{ color: 'rgba(224,239,255,0.4)' }}
      >
        跳过，直接回答问题 &rarr;
      </button>
    </div>
  );
}
