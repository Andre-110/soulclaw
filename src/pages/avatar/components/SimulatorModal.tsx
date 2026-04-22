import { useState } from 'react';
import { SIMULATOR_STORY } from '@/mocks/starData';

interface Simulator {
  id: number;
  name: string;
  icon: string;
  color: string;
  desc: string;
}

interface Props {
  sim: Simulator;
  onClose: () => void;
}

type GamePhase = 'intro' | 'choice' | 'result';

const RESULT_MAP: Record<string, { title: string; content: string; reward: string }> = {
  a: {
    title: '逆袭结局',
    content: '你果断翻墙，跟着神秘男人走进了一家创业公司。发现里面都是和你一样的年轻人——他们正在用AI改变教育行业。三年后，你成为了这家公司的联合创始人，而那个高三的下午成了你人生的转折点。',
    reward: '解锁：创业大亨皮肤',
  },
  b: {
    title: '学霸结局',
    content: '你回到教室，认真完成了最后一个学期。考入了理想大学，在图书馆遇到了改变你一生的人。平静的选择，有时候才是最勇敢的。',
    reward: '解锁：学霸勋章',
  },
  c: {
    title: '团队结局',
    content: '你叫上了三个死党一起逃课，四个人跟着神秘男人探索了半个城市。那个下午成为你们友情最深刻的印记，多年后你们开了一家公司，名字叫「那个下午」。',
    reward: '解锁：星尘纪念 +1',
  },
};

export default function SimulatorModal({ sim, onClose }: Props) {
  const [phase, setPhase] = useState<GamePhase>('intro');
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);

  const result = selectedChoice ? RESULT_MAP[selectedChoice] : null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col" style={{ background: '#0F0F1E' }}>
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-10 pb-4">
        <button
          onClick={onClose}
          className="w-9 h-9 flex items-center justify-center rounded-xl cursor-pointer"
          style={{ background: 'rgba(255,255,255,0.06)' }}
        >
          <i className="ri-arrow-left-line" style={{ color: '#E0EFFF' }} />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 flex items-center justify-center rounded-xl" style={{ background: `${sim.color}22` }}>
            <i className={`${sim.icon} text-base`} style={{ color: sim.color }} />
          </div>
          <span className="font-orbitron text-sm font-bold" style={{ color: '#E0EFFF' }}>{sim.name}</span>
        </div>
        <div className="ml-auto px-2.5 py-1 rounded-full text-xs font-noto"
          style={{ background: 'rgba(108,92,231,0.15)', color: '#A29BFE', border: '1px solid rgba(108,92,231,0.25)' }}>
          AI驱动
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-8">
        {phase === 'intro' && (
          <div className="flex flex-col gap-6 pt-4">
            {/* Scene illustration area */}
            <div className="w-full h-44 rounded-3xl flex items-center justify-center relative overflow-hidden"
              style={{ background: `radial-gradient(circle at 50% 60%, ${sim.color}22 0%, rgba(15,15,30,0.9) 70%)`, border: `1px solid ${sim.color}33` }}>
              <div className="absolute inset-0 flex items-center justify-center">
                <i className={`${sim.icon}`} style={{ fontSize: '80px', color: `${sim.color}33` }} />
              </div>
              <div className="relative z-10 text-center px-6">
                <i className={`${sim.icon} text-5xl mb-3 block`} style={{ color: sim.color }} />
                <p className="text-sm font-noto font-bold" style={{ color: '#E0EFFF' }}>{sim.desc}</p>
              </div>
            </div>

            {/* Story */}
            <div className="p-5 rounded-3xl"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <div className="flex items-center gap-2 mb-3">
                <i className="ri-quill-pen-line text-sm" style={{ color: '#6C5CE7' }} />
                <span className="text-xs font-orbitron tracking-wider" style={{ color: '#6C5CE7' }}>故事背景</span>
              </div>
              <p className="text-sm font-noto leading-relaxed" style={{ color: 'rgba(224,239,255,0.7)' }}>
                {SIMULATOR_STORY.intro}
              </p>
            </div>

            <button
              onClick={() => setPhase('choice')}
              className="w-full py-4 rounded-2xl font-orbitron text-sm font-bold tracking-widest cursor-pointer whitespace-nowrap"
              style={{
                background: `linear-gradient(135deg, ${sim.color}cc, ${sim.color}66)`,
                color: '#fff',
                boxShadow: `0 0 20px ${sim.color}44`,
              }}
            >
              进入剧情 →
            </button>
          </div>
        )}

        {phase === 'choice' && (
          <div className="flex flex-col gap-5 pt-4">
            <div className="p-5 rounded-3xl"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: '#00D1FF' }} />
                <span className="text-xs font-orbitron tracking-wider" style={{ color: '#00D1FF' }}>剧情冲突</span>
              </div>
              <p className="text-sm font-noto font-bold leading-relaxed" style={{ color: '#E0EFFF' }}>
                学校门口，一个穿风衣的中年男人向你走来：
                「同学，你看起来不像是想待在这里的人，跟我走，我带你看看真实的世界。」
              </p>
            </div>

            <div className="flex flex-col gap-3">
              {SIMULATOR_STORY.choices.map((c) => (
                <button
                  key={c.id}
                  onClick={() => { setSelectedChoice(c.id); setPhase('result'); }}
                  className="flex items-center gap-4 p-4 rounded-2xl cursor-pointer transition-all duration-200 active:scale-95 text-left"
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.09)',
                  }}
                >
                  <div className="w-10 h-10 flex items-center justify-center rounded-xl shrink-0"
                    style={{ background: `${sim.color}22` }}>
                    <i className={`${c.icon} text-lg`} style={{ color: sim.color }} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-noto font-bold mb-0.5" style={{ color: '#E0EFFF' }}>{c.text}</p>
                    <p className="text-xs font-noto" style={{ color: 'rgba(224,239,255,0.35)' }}>→ {c.result}</p>
                  </div>
                  <i className="ri-arrow-right-s-line" style={{ color: 'rgba(224,239,255,0.3)' }} />
                </button>
              ))}
            </div>
          </div>
        )}

        {phase === 'result' && result && (
          <div className="flex flex-col gap-5 pt-4">
            {/* Result banner */}
            <div className="p-6 rounded-3xl text-center"
              style={{
                background: `radial-gradient(circle at 50% 30%, ${sim.color}22 0%, rgba(15,15,30,0.95) 70%)`,
                border: `1px solid ${sim.color}44`,
              }}>
              <div className="w-14 h-14 flex items-center justify-center rounded-full mx-auto mb-4"
                style={{ background: `${sim.color}22`, border: `2px solid ${sim.color}66` }}>
                <i className="ri-trophy-line text-2xl" style={{ color: sim.color }} />
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full mb-3"
                style={{ background: `${sim.color}22`, border: `1px solid ${sim.color}44` }}>
                <i className="ri-sparkling-line text-xs" style={{ color: sim.color }} />
                <span className="text-xs font-orbitron tracking-wider" style={{ color: sim.color }}>结局达成</span>
              </div>
              <h3 className="font-orbitron text-lg font-bold mb-3" style={{ color: '#E0EFFF' }}>
                {result.title}
              </h3>
              <p className="text-sm font-noto leading-relaxed" style={{ color: 'rgba(224,239,255,0.65)' }}>
                {result.content}
              </p>
            </div>

            {/* Reward */}
            <div className="flex items-center gap-3 p-4 rounded-2xl"
              style={{ background: 'rgba(253,203,110,0.08)', border: '1px solid rgba(253,203,110,0.2)' }}>
              <i className="ri-gift-line text-lg" style={{ color: '#FDCB6E' }} />
              <div>
                <p className="text-xs font-noto" style={{ color: 'rgba(224,239,255,0.4)' }}>专属奖励</p>
                <p className="text-sm font-noto font-bold" style={{ color: '#FDCB6E' }}>{result.reward}</p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => { setPhase('choice'); setSelectedChoice(null); }}
                className="flex-1 py-3.5 rounded-2xl text-sm font-noto cursor-pointer whitespace-nowrap"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(224,239,255,0.5)' }}
              >
                再玩一次
              </button>
              <button
                onClick={onClose}
                className="flex-1 py-3.5 rounded-2xl text-sm font-noto font-bold cursor-pointer whitespace-nowrap"
                style={{ background: `linear-gradient(135deg, #6C5CE7, #00D1FF)`, color: '#fff' }}
              >
                返回模拟器
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
