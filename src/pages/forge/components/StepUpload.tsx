import { useState } from 'react';

const PLATFORMS = [
  { id: 'wechat', name: '朋友圈', icon: 'ri-wechat-line', color: '#07C160' },
  { id: 'netease', name: '网易云', icon: 'ri-music-line', color: '#FF4D4D' },
  { id: 'zhihu', name: '知乎', icon: 'ri-question-answer-line', color: '#4FACFE' },
  { id: 'weibo', name: '微博', icon: 'ri-weibo-line', color: '#FF6B6B' },
  { id: 'xiaohongshu', name: '小红书', icon: 'ri-leaf-line', color: '#FF7A9A' },
  { id: 'douyin', name: '抖音', icon: 'ri-tiktok-line', color: '#A29BFE' },
];

const GLASS_CARD =
  'backdrop-blur-xl saturate-150 bg-gradient-to-br from-white/8 to-white/3 border border-white/12 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]';

interface Props {
  onNext: () => void;
}

export default function StepUpload({ onNext }: Props) {
  const [uploaded, setUploaded] = useState<string[]>([]);
  const [linkInput, setLinkInput] = useState('');
  const [analyzing, setAnalyzing] = useState(false);

  const handleUpload = (platformId: string) => {
    if (uploaded.includes(platformId)) return;
    setUploaded((prev) => [...prev, platformId]);
  };

  const handleAnalyze = () => {
    if (uploaded.length === 0 && !linkInput) return;
    setAnalyzing(true);
    setTimeout(() => {
      setAnalyzing(false);
      onNext();
    }, 1800);
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Header card */}
      <div
        className={`${GLASS_CARD} rounded-2xl p-5 text-center`}
        style={{
          backdropFilter: 'blur(24px) saturate(180%)',
          WebkitBackdropFilter: 'blur(24px) saturate(180%)',
        }}
      >
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
        <p className="text-xs font-noto" style={{ color: 'rgba(224,239,255,0.65)' }}>
          支持截图或主页链接，AI自动解析
        </p>
      </div>

      {/* Platform grid */}
      <div
        className={`${GLASS_CARD} rounded-2xl p-4`}
        style={{
          backdropFilter: 'blur(24px) saturate(180%)',
          WebkitBackdropFilter: 'blur(24px) saturate(180%)',
        }}
      >
        <div className="flex items-center gap-2 mb-4">
          <i className="ri-apps-2-line text-sm" style={{ color: 'rgba(0,209,255,0.8)' }} />
          <span className="text-xs font-noto font-bold" style={{ color: 'rgba(224,239,255,0.85)' }}>
            选择平台（点击即上传）
          </span>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {PLATFORMS.map((p) => {
            const done = uploaded.includes(p.id);
            return (
              <button
                key={p.id}
                onClick={() => handleUpload(p.id)}
                className="flex flex-col items-center gap-2 p-4 rounded-xl cursor-pointer transition-all duration-200 active:scale-95"
                style={{
                  backdropFilter: 'blur(12px)',
                  WebkitBackdropFilter: 'blur(12px)',
                  background: done
                    ? 'rgba(108,92,231,0.2)'
                    : 'rgba(255,255,255,0.05)',
                  border: done
                    ? '1px solid rgba(108,92,231,0.55)'
                    : '1px solid rgba(255,255,255,0.1)',
                  boxShadow: done ? `0 0 14px rgba(108,92,231,0.3)` : 'none',
                }}
              >
                <div
                  className="w-10 h-10 flex items-center justify-center rounded-xl relative"
                  style={{ background: `${p.color}25` }}
                >
                  <i className={`${p.icon} text-lg`} style={{ color: p.color }} />
                  {done && (
                    <div
                      className="absolute -top-1 -right-1 w-4 h-4 flex items-center justify-center rounded-full"
                      style={{
                        background: 'linear-gradient(135deg, #6C5CE7, #00D1FF)',
                        boxShadow: '0 0 6px rgba(108,92,231,0.7)',
                      }}
                    >
                      <i className="ri-check-line text-white" style={{ fontSize: '10px' }} />
                    </div>
                  )}
                </div>
                <span
                  className="text-xs font-noto"
                  style={{ color: done ? '#A29BFE' : 'rgba(224,239,255,0.65)' }}
                >
                  {p.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Link input */}
      <div
        className={`${GLASS_CARD} rounded-2xl p-4`}
        style={{
          backdropFilter: 'blur(24px) saturate(180%)',
          WebkitBackdropFilter: 'blur(24px) saturate(180%)',
        }}
      >
        <label className="block text-xs font-noto mb-2" style={{ color: 'rgba(224,239,255,0.75)' }}>
          或直接输入主页链接
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={linkInput}
            onChange={(e) => setLinkInput(e.target.value)}
            placeholder="粘贴知乎/小红书主页链接..."
            className="flex-1 px-4 py-3 rounded-xl text-sm font-noto outline-none"
            style={{
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.12)',
              color: '#E0EFFF',
            }}
          />
          <button
            onClick={() => { if (linkInput) setLinkInput(linkInput); }}
            className="px-4 rounded-xl cursor-pointer whitespace-nowrap text-sm font-noto"
            style={{
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              background: 'rgba(0,209,255,0.12)',
              border: '1px solid rgba(0,209,255,0.35)',
              color: '#00D1FF',
            }}
          >
            解析
          </button>
        </div>
      </div>

      {/* Status */}
      {uploaded.length > 0 && (
        <div
          className="flex items-center gap-2 px-4 py-3 rounded-xl"
          style={{
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            background: 'rgba(0,209,255,0.08)',
            border: '1px solid rgba(0,209,255,0.25)',
          }}
        >
          <i className="ri-checkbox-circle-line" style={{ color: '#00D1FF' }} />
          <span className="text-xs font-noto" style={{ color: '#81ECEC' }}>
            已上传 {uploaded.length} 个平台素材，AI正在提取标签...
          </span>
        </div>
      )}

      <button
        onClick={handleAnalyze}
        disabled={uploaded.length === 0 && !linkInput}
        className="w-full py-4 rounded-2xl font-orbitron text-sm font-bold tracking-widest cursor-pointer transition-all duration-300 active:scale-95 whitespace-nowrap"
        style={{
          background:
            uploaded.length > 0 || linkInput
              ? 'linear-gradient(135deg, #6C5CE7, #00D1FF)'
              : 'rgba(255,255,255,0.06)',
          color: uploaded.length > 0 || linkInput ? '#fff' : 'rgba(224,239,255,0.3)',
          boxShadow:
            uploaded.length > 0 || linkInput ? '0 0 24px rgba(108,92,231,0.5)' : 'none',
        }}
      >
        {analyzing ? (
          <span className="flex items-center justify-center gap-2">
            <i className="ri-loader-4-line animate-spin" />
            AI解析中...
          </span>
        ) : (
          'AI自动解析 →'
        )}
      </button>

      <button
        onClick={onNext}
        className="text-center text-xs font-noto cursor-pointer"
        style={{ color: 'rgba(224,239,255,0.45)' }}
      >
        跳过，手动填写问卷 &rarr;
      </button>
    </div>
  );
}
