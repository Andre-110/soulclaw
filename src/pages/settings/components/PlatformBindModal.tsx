import { useState, useRef } from 'react';
import { getClientId } from '@/lib/clientId';
import { savePlatformBinding } from '@/lib/reportApi';

export interface PlatformData {
  id: string;
  name: string;
  icon: string;
  color: string;
  link: string;
  screenshot: string;
  bound: boolean;
}

interface Props {
  platform: PlatformData;
  onClose: () => void;
  onSave: (updated: PlatformData) => Promise<void> | void;
}

export default function PlatformBindModal({ platform, onClose, onSave }: Props) {
  const [link, setLink] = useState(platform.link || '');
  const [screenshot, setScreenshot] = useState(platform.screenshot || '');
  const [screenshotName, setScreenshotName] = useState('');
  const [tab, setTab] = useState<'link' | 'screenshot'>('link');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setScreenshotName(file.name);
    const reader = new FileReader();
    reader.onload = (ev) => setScreenshot(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const canSave = link.trim() !== '' || screenshot !== '';

  const handleSave = () => {
    void (async () => {
      try {
        setSaving(true);
        setError('');
        const cleanedLink = link.trim();
        if (cleanedLink) {
          await savePlatformBinding(getClientId(), platform.id, cleanedLink);
        }
        await onSave({
          ...platform,
          link: cleanedLink,
          screenshot,
          bound: canSave,
        });
        onClose();
      } catch (err) {
        setError(err instanceof Error ? err.message : '绑定失败');
      } finally {
        setSaving(false);
      }
    })();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center"
      style={{ background: 'rgba(8,7,20,0.85)', backdropFilter: 'blur(12px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="w-full max-w-md rounded-t-3xl p-6 pb-8"
        style={{
          background: 'linear-gradient(180deg,rgba(22,18,48,0.98) 0%,rgba(14,12,32,0.98) 100%)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderBottom: 'none',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 flex items-center justify-center rounded-xl" style={{ background: `${platform.color}20`, border: `1px solid ${platform.color}40` }}>
              <i className={`${platform.icon} text-base`} style={{ color: platform.color }} />
            </div>
            <div>
              <p className="font-orbitron text-sm font-bold" style={{ color: '#E0EFFF' }}>绑定 {platform.name}</p>
              <p className="text-xs font-noto" style={{ color: 'rgba(224,239,255,0.4)' }}>提供主页链接或截图</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-xl cursor-pointer" style={{ background: 'rgba(255,255,255,0.07)' }}>
            <i className="ri-close-line" style={{ color: 'rgba(224,239,255,0.6)' }} />
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex gap-1 mb-5 p-1 rounded-xl" style={{ background: 'rgba(255,255,255,0.05)' }}>
          {(['link', 'screenshot'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className="flex-1 py-2 rounded-lg text-xs font-noto font-medium cursor-pointer transition-all duration-200 whitespace-nowrap"
              style={{
                background: tab === t ? 'rgba(108,92,231,0.3)' : 'transparent',
                color: tab === t ? '#C4BBFF' : 'rgba(224,239,255,0.4)',
                border: tab === t ? '1px solid rgba(108,92,231,0.4)' : '1px solid transparent',
              }}
            >
              {t === 'link' ? '贴入主页链接' : '上传主页截图'}
            </button>
          ))}
        </div>

        {tab === 'link' && (
          <div className="flex flex-col gap-3">
            <p className="text-xs font-noto" style={{ color: 'rgba(224,239,255,0.5)' }}>
              将你的 {platform.name} 主页链接粘贴到下方，AI 将分析你的内容偏好
            </p>
            <input
              value={link}
              onChange={(e) => setLink(e.target.value)}
              placeholder={`粘贴 ${platform.name} 主页链接…`}
              className="w-full px-4 py-3 rounded-xl text-sm font-noto outline-none"
              style={{
                background: 'rgba(255,255,255,0.06)',
                border: `1px solid ${link ? 'rgba(108,92,231,0.5)' : 'rgba(255,255,255,0.1)'}`,
                color: '#E0EFFF',
              }}
            />
            {link && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl" style={{ background: 'rgba(0,209,255,0.08)', border: '1px solid rgba(0,209,255,0.2)' }}>
                <i className="ri-checkbox-circle-line text-sm" style={{ color: '#00D1FF' }} />
                <span className="text-xs font-noto" style={{ color: '#00D1FF' }}>已输入链接，保存后会进入真实分析链路</span>
              </div>
            )}
          </div>
        )}

        {tab === 'screenshot' && (
          <div className="flex flex-col gap-3">
            <p className="text-xs font-noto" style={{ color: 'rgba(224,239,255,0.5)' }}>
              截取你的 {platform.name} 个人主页截图，AI 将通过图像分析你的喜好
            </p>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
            {screenshot ? (
              <div className="relative rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(108,92,231,0.4)' }}>
                <img src={screenshot} alt="截图预览" className="w-full max-h-40 object-cover" style={{ objectPosition: 'top' }} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-3">
                  <span className="text-xs font-noto text-white/80">{screenshotName}</span>
                </div>
                <button
                  onClick={() => { setScreenshot(''); setScreenshotName(''); }}
                  className="absolute top-2 right-2 w-7 h-7 flex items-center justify-center rounded-full cursor-pointer"
                  style={{ background: 'rgba(0,0,0,0.6)' }}
                >
                  <i className="ri-close-line text-white" style={{ fontSize: '12px' }} />
                </button>
              </div>
            ) : (
              <button
                onClick={() => fileRef.current?.click()}
                className="w-full py-8 rounded-2xl flex flex-col items-center gap-2 cursor-pointer transition-all duration-200 active:scale-98"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1.5px dashed rgba(255,255,255,0.15)' }}
              >
                <i className="ri-image-add-line text-2xl" style={{ color: 'rgba(224,239,255,0.4)' }} />
                <span className="text-sm font-noto" style={{ color: 'rgba(224,239,255,0.5)' }}>点击上传截图</span>
                <span className="text-xs font-noto" style={{ color: 'rgba(224,239,255,0.3)' }}>支持 JPG / PNG</span>
              </button>
            )}
          </div>
        )}

        {error && (
          <div
            className="mt-4 px-3 py-2 rounded-xl text-xs font-noto"
            style={{ background: 'rgba(255,118,117,0.08)', border: '1px solid rgba(255,118,117,0.18)', color: '#FF9AA2' }}
          >
            {error}
          </div>
        )}

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 py-3.5 rounded-2xl text-sm font-noto cursor-pointer whitespace-nowrap"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(224,239,255,0.5)' }}
          >
            取消
          </button>
          <button
            onClick={handleSave}
            disabled={!canSave || saving}
            className="flex-1 py-3.5 rounded-2xl text-sm font-noto font-bold cursor-pointer whitespace-nowrap transition-all duration-200"
            style={{
              background: canSave && !saving ? 'linear-gradient(135deg,rgba(108,92,231,0.8),rgba(0,209,255,0.6))' : 'rgba(255,255,255,0.07)',
              color: canSave && !saving ? '#E0EFFF' : 'rgba(224,239,255,0.3)',
              border: canSave && !saving ? '1px solid rgba(108,92,231,0.5)' : '1px solid transparent',
            }}
          >
            {saving ? '保存中...' : '确认绑定'}
          </button>
        </div>
      </div>
    </div>
  );
}
