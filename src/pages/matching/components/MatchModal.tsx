import { useNavigate } from 'react-router-dom';
import { MOCK_MATCH } from '@/mocks/starData';

interface MatchModalProps {
  onClose: () => void;
}

export default function MatchModal({ onClose }: MatchModalProps) {
  const navigate = useNavigate();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: 'rgba(15,15,30,0.85)', backdropFilter: 'blur(8px)' }}>
      <div
        className="relative w-full max-w-md rounded-3xl p-8 animate-slide-in-up animate-holo"
        style={{
          background: 'linear-gradient(135deg, rgba(15,15,30,0.98), rgba(30,20,60,0.98))',
          border: '1px solid rgba(0,209,255,0.4)',
          boxShadow: '0 0 60px rgba(0,209,255,0.15), 0 0 120px rgba(108,92,231,0.1)',
        }}
      >
        {/* Scan line effect */}
        <div className="absolute inset-0 rounded-3xl overflow-hidden pointer-events-none">
          <div
            className="absolute left-0 right-0 h-px opacity-30"
            style={{
              background: 'linear-gradient(90deg, transparent, #00D1FF, transparent)',
              animation: 'scan-line 3s linear infinite',
            }}
          />
        </div>

        {/* Corner decorations */}
        {['top-3 left-3', 'top-3 right-3', 'bottom-3 left-3', 'bottom-3 right-3'].map((pos, i) => (
          <div
            key={i}
            className={`absolute ${pos} w-4 h-4`}
            style={{
              borderTop: i < 2 ? '1px solid rgba(0,209,255,0.6)' : 'none',
              borderBottom: i >= 2 ? '1px solid rgba(0,209,255,0.6)' : 'none',
              borderLeft: i % 2 === 0 ? '1px solid rgba(0,209,255,0.6)' : 'none',
              borderRight: i % 2 === 1 ? '1px solid rgba(0,209,255,0.6)' : 'none',
            }}
          />
        ))}

        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-4"
            style={{ background: 'rgba(0,209,255,0.1)', border: '1px solid rgba(0,209,255,0.3)' }}>
            <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#00D1FF' }} />
            <span className="font-orbitron text-xs tracking-widest" style={{ color: '#00D1FF' }}>
              MATCH LOCKED
            </span>
          </div>
          <h2 className="font-orbitron text-2xl font-black mb-2" style={{ color: '#E0EFFF' }}>
            已锁定同频星友
          </h2>
          <p className="text-sm font-noto" style={{ color: 'rgba(224,239,255,0.5)' }}>
            AI 分身已出发，星语对话中
          </p>
        </div>

        {/* Match avatar */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div
              className="w-24 h-24 rounded-full flex items-center justify-center animate-breathe"
              style={{
                background: 'radial-gradient(circle, rgba(0,209,255,0.3), rgba(108,92,231,0.2))',
                border: '2px solid rgba(0,209,255,0.5)',
                boxShadow: '0 0 30px rgba(0,209,255,0.3)',
              }}
            >
              <i className="ri-star-fill text-4xl" style={{ color: '#00D1FF' }} />
            </div>
            <div
              className="absolute -bottom-1 -right-1 px-2 py-0.5 rounded-full text-xs font-orbitron"
              style={{ background: 'rgba(0,209,255,0.2)', border: '1px solid rgba(0,209,255,0.4)', color: '#00D1FF' }}
            >
              {MOCK_MATCH.starId}
            </div>
          </div>
        </div>

        {/* Countdown */}
        <div className="text-center mb-6">
          <p className="text-xs font-noto mb-3" style={{ color: 'rgba(224,239,255,0.4)' }}>
            分身对话倒计时
          </p>
          <div className="flex items-center justify-center gap-3">
            {[
              { value: MOCK_MATCH.timeLeft.hours, label: 'H' },
              { value: MOCK_MATCH.timeLeft.minutes, label: 'M' },
              { value: MOCK_MATCH.timeLeft.seconds, label: 'S' },
            ].map(({ value, label }, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="text-center">
                  <div
                    className="w-14 h-14 rounded-xl flex items-center justify-center font-orbitron text-2xl font-black animate-countdown"
                    style={{
                      background: 'rgba(0,209,255,0.1)',
                      border: '1px solid rgba(0,209,255,0.3)',
                      color: '#00D1FF',
                      textShadow: '0 0 20px rgba(0,209,255,0.8)',
                    }}
                  >
                    {String(value).padStart(2, '0')}
                  </div>
                  <span className="text-xs font-orbitron mt-1 block" style={{ color: 'rgba(0,209,255,0.5)' }}>
                    {label}
                  </span>
                </div>
                {i < 2 && (
                  <span className="font-orbitron text-xl font-bold mb-4" style={{ color: 'rgba(0,209,255,0.4)' }}>:</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Progress bar */}
        <div className="mb-6">
          <div className="flex justify-between text-xs font-noto mb-2" style={{ color: 'rgba(224,239,255,0.4)' }}>
            <span>聊天进度</span>
            <span style={{ color: '#6C5CE7' }}>{MOCK_MATCH.chatProgress}%</span>
          </div>
          <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
            <div
              className="h-full rounded-full transition-all duration-1000"
              style={{
                width: `${MOCK_MATCH.chatProgress}%`,
                background: 'linear-gradient(90deg, #6C5CE7, #00D1FF)',
                boxShadow: '0 0 8px rgba(0,209,255,0.5)',
              }}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex-1 py-3 rounded-xl font-noto text-sm font-medium transition-all duration-200 cursor-pointer whitespace-nowrap"
            style={{
              background: 'linear-gradient(135deg, #6C5CE7, #00D1FF)',
              color: '#fff',
              boxShadow: '0 0 20px rgba(0,209,255,0.3)',
            }}
          >
            查看星语看板
          </button>
          <button
            onClick={onClose}
            className="px-5 py-3 rounded-xl font-noto text-sm transition-all duration-200 cursor-pointer whitespace-nowrap"
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              color: 'rgba(224,239,255,0.5)',
            }}
          >
            继续等待
          </button>
        </div>
      </div>
    </div>
  );
}
