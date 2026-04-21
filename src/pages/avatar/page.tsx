import { useState, useRef, useEffect } from 'react';
import StarBackground from '@/components/feature/StarBackground';
import BottomTabBar from '@/components/feature/BottomTabBar';
import SimulatorCard from './components/SimulatorCard';
import SimulatorModal from './components/SimulatorModal';
import PuaSimulatorModal from './components/PuaSimulatorModal';
import LoveShowSimulatorModal from './components/LoveShowSimulatorModal';
import DoomsdaySimulatorModal from './components/DoomsdaySimulatorModal';
import TravelSimulatorModal from './components/TravelSimulatorModal';
import AnthologySimulatorModal from './components/AnthologySimulatorModal';
import { SIMULATORS } from '@/mocks/starData';

interface Simulator {
  id: number;
  name: string;
  icon: string;
  color: string;
  desc: string;
}

interface CheckInRecord {
  id: number;
  date: string;
  label: string;
  color: string;
}

const STAR_COLORS = ['#A29BFE', '#00D1FF', '#FDCB6E', '#FF7675', '#55EFC4', '#74B9FF', '#FD79A8'];

function getInitialCheckIns(): CheckInRecord[] {
  try {
    const raw = localStorage.getItem('checkin_records');
    if (raw) return JSON.parse(raw) as CheckInRecord[];
  } catch { /* empty */ }
  return [
    { id: 1, date: '04/15', label: '第1颗星辰', color: '#A29BFE' },
    { id: 2, date: '04/17', label: '第2颗星辰', color: '#00D1FF' },
    { id: 3, date: '04/19', label: '第3颗星辰', color: '#FDCB6E' },
  ];
}

export default function AvatarPage() {
  const [activeSimulator, setActiveSimulator] = useState<Simulator | null>(null);
  const [checkIns, setCheckIns] = useState<CheckInRecord[]>(getInitialCheckIns);
  const [sayHiDone, setSayHiDone] = useState(() => localStorage.getItem('say_hi_today') === new Date().toDateString());
  const [showHiToast, setShowHiToast] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [editingNickname, setEditingNickname] = useState('');
  const nameInputRef = useRef<HTMLInputElement>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const profile = (() => {
    try { return JSON.parse(localStorage.getItem('star_profile') || '{}'); } catch { return ; }
  })();

  const [nickname, setNickname] = useState<string>(profile.nickname || '深夜漫游者');

  const avatarColors: Record<string, string> = {
    nebula: '#6C5CE7', constellation: '#00D1FF', ring: '#A29BFE', comet: '#74B9FF', blackhole: '#8B7CF8',
  };
  const avatarIcons: Record<string, string> = {
    nebula: 'ri-bubble-chart-fill', constellation: 'ri-star-fill', ring: 'ri-record-circle-fill',
    comet: 'ri-flashlight-fill', blackhole: 'ri-focus-3-fill',
  };
  const avatarType = profile.avatar || 'constellation';
  const avatarColor = avatarColors[avatarType] || '#00D1FF';
  const avatarIcon = avatarIcons[avatarType] || 'ri-star-fill';

  useEffect(() => {
    if (editingName && nameInputRef.current) nameInputRef.current.focus();
  }, [editingName]);

  const handleStartEditName = () => {
    setEditingNickname(nickname);
    setEditingName(true);
  };

  const handleSaveName = () => {
    const trimmed = editingNickname.trim();
    if (trimmed) {
      setNickname(trimmed);
      try {
        const p = JSON.parse(localStorage.getItem('star_profile') || '{}');
        p.nickname = trimmed;
        localStorage.setItem('star_profile', JSON.stringify(p));
      } catch { /* empty */ }
    }
    setEditingName(false);
  };

  const handleSayHi = () => {
    if (sayHiDone) return;
    setSayHiDone(true);
    localStorage.setItem('say_hi_today', new Date().toDateString());

    const newRecord: CheckInRecord = {
      id: Date.now(),
      date: `${new Date().getMonth() + 1}/${String(new Date().getDate()).padStart(2, '0')}`,
      label: `第${checkIns.length + 1}颗星辰`,
      color: STAR_COLORS[checkIns.length % STAR_COLORS.length],
    };
    const updated = [...checkIns, newRecord];
    setCheckIns(updated);
    localStorage.setItem('checkin_records', JSON.stringify(updated));

    setShowHiToast(true);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setShowHiToast(false), 2800);
  };

  const totalStars = checkIns.length;
  const unlocked = totalStars >= 7;
  const progressStars = Math.min(totalStars, 7);

  return (
    <>
      {activeSimulator?.id === 1 ? (
        <PuaSimulatorModal sim={activeSimulator} onClose={() => setActiveSimulator(null)} />
      ) : activeSimulator?.id === 2 ? (
        <LoveShowSimulatorModal sim={activeSimulator} onClose={() => setActiveSimulator(null)} />
      ) : activeSimulator?.id === 3 ? (
        <DoomsdaySimulatorModal sim={activeSimulator} onClose={() => setActiveSimulator(null)} />
      ) : activeSimulator?.id === 4 ? (
        <TravelSimulatorModal sim={activeSimulator} onClose={() => setActiveSimulator(null)} />
      ) : activeSimulator?.id === 21 ? (
        <AnthologySimulatorModal sim={activeSimulator} onClose={() => setActiveSimulator(null)} />
      ) : activeSimulator ? (
        <SimulatorModal sim={activeSimulator} onClose={() => setActiveSimulator(null)} />
      ) : (
        <div className="min-h-screen pb-20 relative overflow-x-hidden" style={{ background: '#0F0F1E' }}>
          <StarBackground particleCount={40} />

          {/* SAY HI Toast */}
          <div
            className="fixed top-16 left-1/2 z-50 transition-all duration-500"
            style={{
              transform: `translateX(-50%) translateY(${showHiToast ? '0' : '-80px'})`,
              opacity: showHiToast ? 1 : 0,
              pointerEvents: 'none',
            }}
          >
            <div
              className="px-5 py-3 rounded-2xl flex items-center gap-2.5 whitespace-nowrap"
              style={{
                backdropFilter: 'blur(24px) saturate(180%)',
                WebkitBackdropFilter: 'blur(24px) saturate(180%)',
                background: 'linear-gradient(135deg, rgba(108,92,231,0.35) 0%, rgba(0,209,255,0.25) 100%)',
                border: '1px solid rgba(255,255,255,0.2)',
                boxShadow: '0 0 30px rgba(108,92,231,0.4), inset 0 1px 0 rgba(255,255,255,0.15)',
              }}
            >
              <div className="w-6 h-6 flex items-center justify-center rounded-full" style={{ background: 'rgba(253,203,110,0.25)' }}>
                <i className="ri-star-fill text-xs" style={{ color: '#FDCB6E', filter: 'drop-shadow(0 0 4px #FDCB6E)' }} />
              </div>
              <span className="text-sm font-noto font-semibold" style={{ color: '#E0EFFF' }}>
                今天也和「<span style={{ color: '#C3B5FF' }}>{nickname}</span>」SAY HI 了~
              </span>
              <i className="ri-sparkling-2-line text-xs" style={{ color: '#FDCB6E' }} />
            </div>
          </div>

          <div className="relative z-10 max-w-md mx-auto px-4 pt-12">

            {/* ── Avatar card — expands before check-in, collapses after ── */}
            <div
              className="mb-6 rounded-2xl overflow-hidden transition-all duration-500"
              style={{
                background: 'linear-gradient(135deg,rgba(108,92,231,0.18) 0%,rgba(20,18,48,0.72) 60%,rgba(0,209,255,0.07) 100%)',
                backdropFilter: 'blur(28px) saturate(200%)',
                WebkitBackdropFilter: 'blur(28px) saturate(200%)',
                border: '1px solid rgba(108,92,231,0.28)',
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.1)',
              }}
            >
              {sayHiDone ? (
                /* ── Collapsed state (post check-in) ── */
                <div className="flex items-center gap-3 px-4 py-3">
                  {/* Avatar icon small */}
                  <div
                    className="w-9 h-9 shrink-0 rounded-xl flex items-center justify-center"
                    style={{
                      background: `linear-gradient(135deg,${avatarColor}38,${avatarColor}18)`,
                      border: `1.5px solid ${avatarColor}55`,
                    }}
                  >
                    <i className={`${avatarIcon} text-base`} style={{ color: avatarColor }} />
                  </div>
                  {/* Name */}
                  <span className="font-orbitron text-sm font-semibold truncate flex-1" style={{ color: '#E0EFFF' }}>{nickname}</span>
                  {/* Tags */}
                  <div className="flex gap-1.5 shrink-0">
                    {(profile.tags || ['深夜哲学', '宇宙探索']).slice(0, 2).map((tag: string) => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 rounded-full"
                        style={{ background: 'rgba(108,92,231,0.2)', border: '1px solid rgba(108,92,231,0.3)', color: '#C4BBFF', fontSize: '9px' }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  {/* Check-in count */}
                  <div className="flex items-center gap-1 shrink-0 ml-1">
                    <i className="ri-star-fill" style={{ color: '#FDCB6E', fontSize: '11px' }} />
                    <span className="font-orbitron font-semibold" style={{ color: '#FDCB6E', fontSize: '11px' }}>{totalStars}</span>
                  </div>
                </div>
              ) : (
                /* ── Expanded state (before check-in) ── */
                <div className="flex items-center gap-3 px-4 py-3.5">
                  {/* Avatar icon */}
                  <div
                    className="w-12 h-12 shrink-0 rounded-xl flex items-center justify-center animate-breathe"
                    style={{
                      background: `linear-gradient(135deg,${avatarColor}38,${avatarColor}18)`,
                      border: `1.5px solid ${avatarColor}55`,
                      boxShadow: `0 0 16px ${avatarColor}30`,
                    }}
                  >
                    <i className={`${avatarIcon} text-xl`} style={{ color: avatarColor }} />
                  </div>

                  {/* Name + tags */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      {editingName ? (
                        <input
                          ref={nameInputRef}
                          value={editingNickname}
                          onChange={(e) => setEditingNickname(e.target.value)}
                          onBlur={handleSaveName}
                          onKeyDown={(e) => { if (e.key === 'Enter') handleSaveName(); }}
                          maxLength={16}
                          className="font-orbitron text-sm font-semibold bg-transparent outline-none border-b"
                          style={{ color: '#E0EFFF', borderColor: 'rgba(108,92,231,0.6)', width: '120px' }}
                        />
                      ) : (
                        <span className="font-orbitron text-sm font-semibold truncate" style={{ color: '#E0EFFF' }}>
                          {nickname}
                        </span>
                      )}
                      <button
                        onClick={handleStartEditName}
                        className="w-5 h-5 flex items-center justify-center rounded-md shrink-0 cursor-pointer"
                        style={{ background: 'rgba(255,255,255,0.07)' }}
                      >
                        <i className="ri-pencil-line" style={{ color: 'rgba(224,239,255,0.5)', fontSize: '10px' }} />
                      </button>
                    </div>
                    <p className="text-xs mt-0.5 truncate" style={{ color: 'rgba(224,239,255,0.45)', fontFamily: "'Inter','Noto Sans SC',sans-serif" }}>
                      {localStorage.getItem('star_id') || 'STAR-0000-XX'}
                    </p>
                    <div className="flex gap-1.5 mt-1.5 flex-wrap">
                      {(profile.tags || ['深夜哲学', '宇宙探索']).slice(0, 3).map((tag: string) => (
                        <span
                          key={tag}
                          className="px-2 py-0.5 rounded-full font-medium"
                          style={{ background: 'rgba(108,92,231,0.2)', border: '1px solid rgba(108,92,231,0.35)', color: '#C4BBFF', fontSize: '10px' }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* SAY HI button */}
                  <button
                    onClick={handleSayHi}
                    className="shrink-0 flex flex-col items-center gap-1 px-3 py-2 rounded-xl cursor-pointer transition-all duration-300 active:scale-90 whitespace-nowrap"
                    style={{
                      background: 'linear-gradient(135deg, rgba(108,92,231,0.5), rgba(0,209,255,0.35))',
                      border: '1px solid rgba(108,92,231,0.5)',
                      boxShadow: '0 0 16px rgba(108,92,231,0.35)',
                    }}
                  >
                    <i
                      className="ri-hand-heart-line"
                      style={{
                        color: '#C3B5FF',
                        fontSize: '16px',
                        filter: 'drop-shadow(0 0 6px rgba(162,155,254,0.7))',
                      }}
                    />
                    <span className="font-orbitron font-semibold" style={{ color: '#C3B5FF', fontSize: '9px' }}>SAY HI</span>
                  </button>
                </div>
              )}
            </div>

            {/* ── Simulators ── */}
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-orbitron text-base font-bold" style={{ color: '#E0EFFF' }}>人生模拟器</h2>
                <p className="text-xs font-noto mt-0.5" style={{ color: 'rgba(224,239,255,0.55)' }}>多款场景，AI分身全程代入</p>
              </div>
              <div
                className="px-3 py-1.5 rounded-full text-xs font-noto font-semibold"
                style={{ background: 'rgba(0,209,255,0.1)', border: '1px solid rgba(0,209,255,0.22)', color: '#00D1FF', backdropFilter: 'blur(8px)' }}
              >
                持续更新
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {SIMULATORS.filter((sim) => sim.id === 1 || sim.id === 2 || sim.id === 3 || sim.id === 4).map((sim) => (
                <SimulatorCard key={sim.id} sim={sim} onClick={setActiveSimulator} />
              ))}
            </div>

            {/* ── Star check-in section ── */}
            <div className="mt-8 px-1">
              {/* Header */}
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <i className="ri-star-fill text-sm" style={{ color: '#FDCB6E', filter: 'drop-shadow(0 0 6px #FDCB6E88)' }} />
                  <span className="text-sm font-orbitron font-bold" style={{ color: '#FDCB6E' }}>星辰打卡记录</span>
                </div>
                <span className="font-orbitron text-xs font-bold" style={{ color: unlocked ? '#FDCB6E' : 'rgba(253,203,110,0.5)' }}>
                  {totalStars}/7
                </span>
              </div>
              <p className="text-xs font-noto mb-4" style={{ color: 'rgba(224,239,255,0.6)' }}>
                {unlocked ? '恭喜！已激活分身高级权益 ✦' : `每次 SAY HI 生成专属星辰，集满7颗激活高级权益`}
              </p>

              {/* Progress bar */}
              <div className="relative h-1.5 rounded-full mb-4 overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
                <div
                  className="absolute inset-y-0 left-0 rounded-full transition-all duration-700"
                  style={{
                    width: `${(progressStars / 7) * 100}%`,
                    background: 'linear-gradient(90deg, #A29BFE, #FDCB6E)',
                    boxShadow: '0 0 6px rgba(253,203,110,0.5)',
                  }}
                />
              </div>

              {/* 7-star slots */}
              <div className="flex gap-2 mb-4 justify-between">
                {Array.from({ length: 7 }).map((_, i) => {
                  const record = checkIns[i];
                  const filled = !!record;
                  return (
                    <div key={i} className="flex flex-col items-center gap-1">
                      <div
                        className="w-8 h-8 flex items-center justify-center rounded-full transition-all duration-500"
                        style={
                          filled
                            ? {
                                background: `${record.color}22`,
                                border: `1.5px solid ${record.color}66`,
                                boxShadow: `0 0 10px ${record.color}44`,
                              }
                            : {
                                background: 'rgba(255,255,255,0.04)',
                                border: '1.5px dashed rgba(253,203,110,0.2)',
                              }
                        }
                      >
                        {filled ? (
                          <i className="ri-star-fill text-xs" style={{ color: record.color, filter: `drop-shadow(0 0 4px ${record.color})` }} />
                        ) : (
                          <i className="ri-star-line text-xs" style={{ color: 'rgba(253,203,110,0.2)' }} />
                        )}
                      </div>
                      {filled && (
                        <span className="font-noto" style={{ color: 'rgba(224,239,255,0.45)', fontSize: '8px' }}>
                          {record.date}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Extra stars beyond 7 */}
              {totalStars > 7 && (
                <div className="flex flex-wrap gap-2 pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                  {checkIns.slice(7).map((record) => (
                    <div
                      key={record.id}
                      className="flex items-center gap-1.5 px-2.5 py-1 rounded-full"
                      style={{ background: `${record.color}15`, border: `1px solid ${record.color}30` }}
                    >
                      <i className="ri-star-fill" style={{ color: record.color, fontSize: '9px' }} />
                      <span className="font-noto" style={{ color: record.color, fontSize: '9px' }}>{record.date}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Premium badge if unlocked */}
              {unlocked && (
                <div
                  className="mt-3 flex items-center gap-2 px-3 py-2 rounded-xl"
                  style={{
                    background: 'linear-gradient(135deg, rgba(253,203,110,0.15), rgba(162,155,254,0.1))',
                    border: '1px solid rgba(253,203,110,0.3)',
                  }}
                >
                  <i className="ri-vip-crown-2-line" style={{ color: '#FDCB6E' }} />
                  <span className="text-xs font-noto font-semibold" style={{ color: '#FDCB6E' }}>高级权益已激活 · 星辰匹配加速</span>
                </div>
              )}
            </div>

            <div className="pb-6" />
          </div>

          <BottomTabBar />
        </div>
      )}
    </>
  );
}
