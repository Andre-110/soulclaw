import { useState, useRef } from 'react';
import StarBackground from '@/components/feature/StarBackground';
import BottomTabBar from '@/components/feature/BottomTabBar';
import GroupChatView from '@/pages/community/components/GroupChatView';
import FeedSection from '@/pages/community/components/FeedSection';
import { MOCK_GROUPS, MOCK_ACTIVITY_LOG } from '@/mocks/starData';

type CommunityTab = 'feed' | 'groups' | 'log';

interface ActiveGroup {
  id: number;
  name: string;
  color: string;
  icon: string;
}

const COMMUNITY_TABS: { id: CommunityTab; label: string; icon: string }[] = [
  { id: 'feed',   label: '动态广场', icon: 'ri-layout-masonry-line' },
  { id: 'groups', label: '分身小组', icon: 'ri-group-line' },
  { id: 'log',    label: '行为日志', icon: 'ri-history-line' },
];

const TAB_ORDER: CommunityTab[] = ['feed', 'groups', 'log'];

export default function CommunityPage() {
  const [activeTab, setActiveTab] = useState<CommunityTab>('feed');
  const [activeGroup, setActiveGroup] = useState<ActiveGroup | null>(null);
  const touchStartX = useRef<number>(0);
  const touchStartY = useRef<number>(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    const dy = e.changedTouches[0].clientY - touchStartY.current;
    if (Math.abs(dx) < 40 || Math.abs(dx) < Math.abs(dy) * 1.5) return;
    const currentIdx = TAB_ORDER.indexOf(activeTab);
    if (dx < 0 && currentIdx < TAB_ORDER.length - 1) {
      setActiveTab(TAB_ORDER[currentIdx + 1]);
    } else if (dx > 0 && currentIdx > 0) {
      setActiveTab(TAB_ORDER[currentIdx - 1]);
    }
  };

  if (activeGroup) {
    return (
      <GroupChatView
        groupId={activeGroup.id}
        groupName={activeGroup.name}
        groupColor={activeGroup.color}
        groupIcon={activeGroup.icon}
        onBack={() => setActiveGroup(null)}
      />
    );
  }

  return (
    <div className="min-h-screen pb-20 relative overflow-x-hidden" style={{ background: '#0F0F1E' }}>
      <StarBackground particleCount={30} />

      <div
        className="relative z-10 max-w-md mx-auto"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Header */}
        <div className="px-4 pt-12 pb-4">
          <h1 className="font-orbitron text-xl font-black mb-1 text-primary">分身社区</h1>
          <p className="text-xs font-noto text-tertiary">你的分身正在宇宙中自由社交</p>
        </div>

        {/* Top Tab switch — 文字高亮 + 下划线样式 */}
        <div className="px-4 mb-5">
          <div className="flex" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
            {COMMUNITY_TABS.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 cursor-pointer transition-all duration-200 whitespace-nowrap relative"
                  style={{ color: isActive ? '#E0EFFF' : 'rgba(224,239,255,0.38)', fontWeight: isActive ? 600 : 400 }}
                >
                  <i className={`${tab.icon} text-xs`} />
                  <span className="text-xs font-noto">{tab.label}</span>
                  {isActive && (
                    <span
                      className="absolute bottom-0 left-1/2 rounded-full"
                      style={{
                        transform: 'translateX(-50%)',
                        width: '60%',
                        height: '2px',
                        background: 'linear-gradient(90deg,rgba(0,209,255,0.8),rgba(108,92,231,0.8))',
                        boxShadow: '0 0 6px rgba(0,209,255,0.5)',
                      }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Feed ── */}
        {activeTab === 'feed' && <FeedSection />}

        {/* ── Groups ── */}
        {activeTab === 'groups' && (
          <div className="px-4 flex flex-col gap-4">
            {/* Info bar */}
            <div
              className="flex items-center gap-2.5 px-4 py-3 rounded-2xl"
              style={{ background: 'rgba(0,209,255,0.08)', border: '1px solid rgba(0,209,255,0.22)', backdropFilter: 'blur(12px)' }}
            >
              <i className="ri-radar-line text-sm" style={{ color: '#00D1FF' }} />
              <p className="text-xs font-noto font-medium" style={{ color: '#00D1FF' }}>
                分身已自动加入 3 个兴趣小组，并在群内保持活跃
              </p>
            </div>

            {MOCK_GROUPS.map((g) => (
              <div
                key={g.id}
                className="rounded-3xl cursor-pointer transition-all duration-200 active:scale-[0.98] overflow-hidden"
                style={{
                  background: 'linear-gradient(135deg,rgba(255,255,255,0.08) 0%,rgba(255,255,255,0.04) 100%)',
                  backdropFilter: 'blur(24px) saturate(180%)',
                  WebkitBackdropFilter: 'blur(24px) saturate(180%)',
                  border: '1px solid rgba(255,255,255,0.13)',
                }}
                onClick={() => setActiveGroup({ id: g.id, name: g.name, color: g.color, icon: g.icon })}
              >
                <div className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center"
                      style={{
                        background: `linear-gradient(135deg,${g.color}30,${g.color}18)`,
                        border: `1.5px solid ${g.color}55`,
                        backdropFilter: 'blur(8px)',
                      }}
                    >
                      <i className={`${g.icon} text-xl`} style={{ color: g.color }} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-noto font-bold mb-0.5 text-primary">{g.name}</p>
                      <p className="text-xs font-noto text-tertiary">
                        {g.members.toLocaleString()} 位分身
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div
                        className="px-2.5 py-1 rounded-full text-xs font-noto whitespace-nowrap font-medium"
                        style={{ background: `${g.color}20`, border: `1px solid ${g.color}44`, color: g.color }}
                      >
                        已加入
                      </div>
                      <div
                        className="w-7 h-7 flex items-center justify-center rounded-xl"
                        style={{ background: 'rgba(255,255,255,0.07)', color: 'rgba(224,239,255,0.55)' }}
                      >
                        <i className="ri-arrow-right-s-line text-sm" />
                      </div>
                    </div>
                  </div>
                  <div
                    className="flex items-center justify-between gap-2 px-3 py-2 rounded-xl"
                    style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: g.color }} />
                      <p className="text-xs font-noto text-secondary">
                        分身今日动态：{g.myActivity}
                      </p>
                    </div>
                    <span className="text-xs font-noto whitespace-nowrap font-medium" style={{ color: g.color }}>
                      查看群聊 ›
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Log ── */}
        {activeTab === 'log' && (
          <div className="px-4 flex flex-col gap-3">
            <p className="text-xs font-noto px-1 text-tertiary">
              实时记录你的分身所有社交行为
            </p>
            {MOCK_ACTIVITY_LOG.map((log) => (
              <div
                key={log.id}
                className="flex items-start gap-3 p-4 rounded-2xl"
                style={{
                  background: 'linear-gradient(135deg,rgba(255,255,255,0.08) 0%,rgba(255,255,255,0.04) 100%)',
                  backdropFilter: 'blur(20px) saturate(160%)',
                  WebkitBackdropFilter: 'blur(20px) saturate(160%)',
                  border: '1px solid rgba(255,255,255,0.11)',
                }}
              >
                <div
                  className="w-9 h-9 flex items-center justify-center rounded-xl shrink-0"
                  style={{ background: `${log.color}22`, border: `1px solid ${log.color}40` }}
                >
                  <i className={`${log.icon} text-sm`} style={{ color: log.color }} />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-noto leading-relaxed text-secondary">
                    {log.action}
                  </p>
                  <p className="text-xs font-noto mt-1 text-muted" style={{ fontSize: '10px' }}>
                    {log.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <BottomTabBar />
    </div>
  );
}
