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

const storyLabHref = `${__BASE_PATH__}storylab/scenario_sandbox.html`;

export default function AnthologySimulatorModal({ sim, onClose }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col" style={{ background: '#0B1020' }}>
      <div className="flex items-center gap-3 px-4 pt-10 pb-4">
        <button
          onClick={onClose}
          className="w-9 h-9 flex items-center justify-center rounded-xl cursor-pointer"
          style={{ background: 'rgba(255,255,255,0.06)' }}
        >
          <i className="ri-arrow-left-line" style={{ color: '#E0EFFF' }} />
        </button>
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-8 h-8 flex items-center justify-center rounded-xl" style={{ background: `${sim.color}22` }}>
            <i className={`${sim.icon} text-base`} style={{ color: sim.color }} />
          </div>
          <div className="min-w-0">
            <div className="font-orbitron text-sm font-bold truncate" style={{ color: '#E0EFFF' }}>{sim.name}</div>
            <div className="text-xs truncate" style={{ color: 'rgba(224,239,255,0.5)' }}>{sim.desc}</div>
          </div>
        </div>
        <a
          href={storyLabHref}
          target="_blank"
          rel="noreferrer"
          className="ml-auto px-3 py-1.5 rounded-full text-xs font-noto whitespace-nowrap"
          style={{ background: 'rgba(116,185,255,0.16)', color: '#74B9FF', border: '1px solid rgba(116,185,255,0.25)' }}
        >
          新开查看
        </a>
      </div>

      <div className="px-4 pb-3">
        <div
          className="rounded-3xl p-4"
          style={{
            background: 'linear-gradient(135deg, rgba(116,185,255,0.12), rgba(108,92,231,0.08))',
            border: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          <div className="flex items-center gap-2 mb-2">
            <i className="ri-sparkling-2-line" style={{ color: '#74B9FF' }} />
            <span className="text-xs font-orbitron tracking-wider" style={{ color: '#74B9FF' }}>ANTHOLOGY MODE</span>
          </div>
          <p className="text-sm leading-relaxed" style={{ color: 'rgba(224,239,255,0.72)' }}>
            这里接入了我们新做的多玩法剧情模拟器，包含狗血逆袭、青椒生存、电竞经理、创业转型、片场制作、灾后重建、校园治理等独立玩法。
          </p>
        </div>
      </div>

      <div className="flex-1 px-4 pb-4 min-h-0">
        <div
          className="h-full rounded-3xl overflow-hidden"
          style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.08)',
            boxShadow: '0 20px 60px rgba(0,0,0,0.35)',
          }}
        >
          <iframe
            title="多玩法剧情剧场"
            src={storyLabHref}
            className="w-full h-full border-0"
          />
        </div>
      </div>
    </div>
  );
}
