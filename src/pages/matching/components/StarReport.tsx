import { useState } from 'react';

interface Props {
  matchId: string;
  onUnlock: () => void;
  onBack: () => void;
}

const RADAR_DATA = [
  { label: '三观契合率', value: 88, desc: '价值观高度共鸣，生活观念相近' },
  { label: '聊天适配度', value: 91, desc: '语气节奏和谐，话题推进自然' },
  { label: '发展潜力值', value: 79, desc: '适合深度交流，具备长期可能' },
];

const HIGHLIGHTS = [
  {
    left: '如果宇宙是有意识的，它会选什么样的人来观察它？',
    right: '它会选愿意仰望星空却不急着找答案的人。',
    tag: '哲学共鸣',
  },
  {
    left: '深夜散步，不带耳机，让城市声音自然流进来。',
    right: '我叫它「城市冥想」，找有水的地方效果最好。',
    tag: '生活方式契合',
  },
  {
    left: '孤独是一种需要治愈的状态还是享受的状态？',
    right: '主动的孤独是充电，被迫的孤独是消耗。',
    tag: '情感观点共振',
  },
];

export default function StarReport({ matchId, onUnlock, onBack }: Props) {
  const [decision, setDecision] = useState<'none' | 'unlock' | 'pass'>('none');

  return (
    <div className="fixed inset-0 z-30 overflow-y-auto" style={{ background: '#0F0F1E' }}>
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-10 pb-4 sticky top-0 z-10"
        style={{ background: 'rgba(15,15,30,0.95)', backdropFilter: 'blur(10px)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <button onClick={onBack} className="w-9 h-9 flex items-center justify-center rounded-xl cursor-pointer"
          style={{ background: 'rgba(255,255,255,0.06)' }}>
          <i className="ri-arrow-left-line" style={{ color: '#E0EFFF' }} />
        </button>
        <div>
          <p className="font-orbitron text-sm font-bold" style={{ color: '#E0EFFF' }}>星鉴报告</p>
          <p className="text-xs font-noto" style={{ color: 'rgba(224,239,255,0.35)', fontSize: '10px' }}>{matchId}</p>
        </div>
        <div className="ml-auto px-2.5 py-1 rounded-full text-xs font-noto"
          style={{ background: 'rgba(0,209,255,0.1)', border: '1px solid rgba(0,209,255,0.25)', color: '#00D1FF' }}>
          24h 已完成
        </div>
      </div>

      <div className="px-4 pb-32 pt-6 max-w-md mx-auto flex flex-col gap-5">
        {/* Total score */}
        <div className="p-6 rounded-3xl text-center"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(0,209,255,0.2)' }}>
          <p className="text-xs font-noto mb-2" style={{ color: 'rgba(224,239,255,0.4)' }}>同频总分</p>
          <div className="relative inline-flex items-center justify-center">
            <span className="font-orbitron text-6xl font-black" style={{
              background: 'linear-gradient(135deg, #6C5CE7, #00D1FF)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>87</span>
            <span className="font-orbitron text-xl font-bold ml-1 self-end mb-2" style={{ color: 'rgba(224,239,255,0.4)' }}>/100</span>
          </div>
          <div className="flex items-center justify-center gap-2 mt-2">
            <div className="w-2 h-2 rounded-full" style={{ background: '#00D1FF' }} />
            <span className="text-sm font-noto font-bold" style={{ color: '#00D1FF' }}>高度同频</span>
          </div>
        </div>

        {/* Radar bars */}
        <div className="p-5 rounded-3xl flex flex-col gap-4"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
          <div className="flex items-center gap-2 mb-1">
            <i className="ri-bar-chart-grouped-line text-sm" style={{ color: '#6C5CE7' }} />
            <span className="text-xs font-orbitron tracking-wider" style={{ color: '#6C5CE7' }}>三维评估</span>
          </div>
          {RADAR_DATA.map((item, i) => (
            <div key={item.label}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-sm font-noto font-bold" style={{ color: '#E0EFFF' }}>{item.label}</span>
                <span className="font-orbitron text-base font-black" style={{ color: i === 1 ? '#00D1FF' : '#A29BFE' }}>
                  {item.value}
                </span>
              </div>
              <div className="w-full h-2 rounded-full mb-1" style={{ background: 'rgba(255,255,255,0.07)' }}>
                <div className="h-full rounded-full transition-all duration-1000"
                  style={{
                    width: `${item.value}%`,
                    background: i === 1
                      ? 'linear-gradient(90deg, #6C5CE7, #00D1FF)'
                      : 'linear-gradient(90deg, #6C5CE7, #A29BFE)',
                  }} />
              </div>
              <p className="text-xs font-noto" style={{ color: 'rgba(224,239,255,0.38)' }}>{item.desc}</p>
            </div>
          ))}
        </div>

        {/* Highlights */}
        <div className="p-5 rounded-3xl flex flex-col gap-4"
          style={{ background: 'rgba(253,203,110,0.04)', border: '1px solid rgba(253,203,110,0.15)' }}>
          <div className="flex items-center gap-2">
            <i className="ri-star-smile-line text-sm" style={{ color: '#FDCB6E' }} />
            <span className="text-xs font-orbitron tracking-wider" style={{ color: '#FDCB6E' }}>聊天名场面</span>
          </div>
          {HIGHLIGHTS.map((h, i) => (
            <div key={i} className="flex flex-col gap-2 p-3 rounded-2xl"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <div className="flex gap-2">
                <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                  style={{ background: 'rgba(108,92,231,0.2)' }}>
                  <div className="w-2 h-2 rounded-full" style={{ background: '#6C5CE7' }} />
                </div>
                <p className="text-xs font-noto italic" style={{ color: 'rgba(224,239,255,0.6)' }}>「{h.left}」</p>
              </div>
              <div className="flex gap-2">
                <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                  style={{ background: 'rgba(0,209,255,0.15)' }}>
                  <div className="w-2 h-2 rounded-full" style={{ background: '#00D1FF' }} />
                </div>
                <p className="text-xs font-noto italic" style={{ color: 'rgba(224,239,255,0.6)' }}>「{h.right}」</p>
              </div>
              <div className="flex justify-end">
                <span className="px-2 py-0.5 rounded-full text-xs font-noto"
                  style={{ background: 'rgba(253,203,110,0.12)', color: '#FDCB6E', fontSize: '10px' }}>
                  {h.tag}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* AI suggestion */}
        <div className="p-5 rounded-3xl"
          style={{ background: 'rgba(0,209,255,0.05)', border: '1px solid rgba(0,209,255,0.2)' }}>
          <div className="flex items-center gap-2 mb-3">
            <i className="ri-robot-line text-sm" style={{ color: '#00D1FF' }} />
            <span className="text-xs font-orbitron tracking-wider" style={{ color: '#00D1FF' }}>分身建议</span>
          </div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: '#00D1FF' }} />
            <span className="text-sm font-noto font-bold" style={{ color: '#00D1FF' }}>建议联结</span>
          </div>
          <p className="text-xs font-noto leading-relaxed" style={{ color: 'rgba(224,239,255,0.55)' }}>
            两个分身在24小时内达成了深度哲学共鸣，聊天节奏高度契合，生活方式重叠度极高。
            三观评估显示，你们对「主动孤独」「城市感知」「慢生活」持相同态度。
            AI强烈建议开启真人联结。
          </p>
        </div>
      </div>

      {/* Bottom actions - fixed */}
      <div className="fixed bottom-0 left-0 right-0 px-4 py-4"
        style={{ background: 'rgba(15,15,30,0.97)', backdropFilter: 'blur(20px)', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="max-w-md mx-auto flex gap-3">
          <button
            onClick={() => setDecision('pass')}
            className="flex-1 py-3.5 rounded-2xl text-sm font-noto cursor-pointer whitespace-nowrap transition-all"
            style={{
              background: decision === 'pass' ? 'rgba(255,75,75,0.15)' : 'rgba(255,255,255,0.05)',
              border: decision === 'pass' ? '1px solid rgba(255,75,75,0.3)' : '1px solid rgba(255,255,255,0.1)',
              color: decision === 'pass' ? 'rgba(255,100,100,0.8)' : 'rgba(224,239,255,0.45)',
            }}
          >
            放弃
          </button>
          <button
            onClick={() => { setDecision('unlock'); onUnlock(); }}
            className="flex-[2] py-3.5 rounded-2xl text-sm font-noto font-bold cursor-pointer whitespace-nowrap"
            style={{ background: 'linear-gradient(135deg, #6C5CE7, #00D1FF)', color: '#fff', boxShadow: '0 0 20px rgba(108,92,231,0.4)' }}
          >
            <span className="flex items-center justify-center gap-2">
              <i className="ri-link-m" />
              开启星联 · 真人开聊
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
