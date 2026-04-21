import { useState, useRef, useEffect } from 'react';
import { MOCK_GROUP_CHATS } from '@/mocks/starData';

interface GroupChatViewProps {
  groupId: number;
  groupName: string;
  groupColor: string;
  groupIcon: string;
  onBack: () => void;
}

const AVATAR_CONFIG: Record<string, { color: string; icon: string }> = {
  nebula:        { color: '#6C5CE7', icon: 'ri-bubble-chart-fill' },
  constellation: { color: '#00D1FF', icon: 'ri-star-fill' },
  ring:          { color: '#A29BFE', icon: 'ri-record-circle-fill' },
  comet:         { color: '#74B9FF', icon: 'ri-flashlight-fill' },
  blackhole:     { color: '#8B7CF8', icon: 'ri-focus-3-fill' },
};

const STRATEGY_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  '深度引导': { bg: 'rgba(108,92,231,0.2)',  text: '#C4BBFF', border: 'rgba(108,92,231,0.38)' },
  '价值输出': { bg: 'rgba(0,209,255,0.15)',  text: '#00D1FF', border: 'rgba(0,209,255,0.32)'  },
  '观点输出': { bg: 'rgba(116,185,255,0.15)',text: '#74B9FF', border: 'rgba(116,185,255,0.32)' },
  '精准破冰': { bg: 'rgba(162,155,254,0.18)',text: '#C4BBFF', border: 'rgba(162,155,254,0.38)' },
  '经验分享': { bg: 'rgba(0,206,201,0.15)',  text: '#00CEC9', border: 'rgba(0,206,201,0.32)'  },
  '暖心贴士': { bg: 'rgba(253,203,110,0.15)',text: '#FDCB6E', border: 'rgba(253,203,110,0.32)' },
};

export default function GroupChatView({ groupId, groupName, groupColor, groupIcon, onBack }: GroupChatViewProps) {
  const [expandedAnalysis, setExpandedAnalysis] = useState<number[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);
  const chatData = MOCK_GROUP_CHATS[groupId];

  useEffect(() => {
    setTimeout(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, 100);
  }, []);

  const toggleAnalysis = (id: number) =>
    setExpandedAnalysis((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);

  const myMessages = chatData?.messages.filter((m) => m.isMine) ?? [];

  return (
    <div className="flex flex-col h-screen" style={{ background: '#0F0F1E' }}>

      {/* ── Header ── */}
      <div
        className="flex items-center gap-3 px-4 pt-10 pb-3 shrink-0"
        style={{
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          background: 'linear-gradient(180deg,rgba(20,18,45,0.95),rgba(15,15,30,0.88))',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
        }}
      >
        <button
          onClick={onBack}
          className="w-8 h-8 flex items-center justify-center rounded-xl cursor-pointer transition-all duration-150 active:scale-90"
          style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', color: '#E0EFFF' }}
        >
          <i className="ri-arrow-left-s-line text-base" />
        </button>
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ background: `linear-gradient(135deg,${groupColor}28,${groupColor}14)`, border: `1.5px solid ${groupColor}55`, backdropFilter: 'blur(8px)' }}
        >
          <i className={`${groupIcon} text-base`} style={{ color: groupColor }} />
        </div>
        <div className="flex-1">
          <p className="font-noto text-sm font-bold text-primary">{groupName}</p>
          <p className="font-noto text-tertiary" style={{ fontSize: '10px' }}>
            分身已代你发言 {myMessages.length} 次
          </p>
        </div>
        <div
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-full"
          style={{ background: 'rgba(108,92,231,0.22)', border: '1px solid rgba(108,92,231,0.4)' }}
        >
          <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#6C5CE7' }} />
          <span className="font-noto font-semibold" style={{ color: '#C4BBFF', fontSize: '10px' }}>分身在线</span>
        </div>
      </div>

      {/* ── Strategy hint ── */}
      <div
        className="mx-4 mt-3 mb-1 px-3 py-2.5 rounded-2xl flex items-start gap-2.5 shrink-0"
        style={{
          background: 'linear-gradient(135deg,rgba(108,92,231,0.18),rgba(0,209,255,0.06))',
          border: '1px solid rgba(108,92,231,0.28)',
          backdropFilter: 'blur(14px)',
          WebkitBackdropFilter: 'blur(14px)',
        }}
      >
        <i className="ri-robot-line text-sm mt-0.5 shrink-0" style={{ color: '#A29BFE' }} />
        <div>
          <p className="font-noto text-xs font-bold mb-0.5" style={{ color: '#C4BBFF' }}>分身策略摘要</p>
          <p className="font-noto leading-relaxed text-tertiary" style={{ fontSize: '10px' }}>
            点击带
            <span className="inline-flex items-center gap-0.5 mx-1 px-1.5 py-0.5 rounded-full" style={{ background: 'rgba(108,92,231,0.28)', color: '#C4BBFF', fontSize: '9px', border: '1px solid rgba(108,92,231,0.42)' }}>
              <i className="ri-sparkling-line" />分身发言
            </span>
            标识的消息，展开查看分身的判断依据和对你的帮助
          </p>
        </div>
      </div>

      {/* ── Messages ── */}
      <div className="flex-1 overflow-y-auto px-4 py-3" style={{ scrollbarWidth: 'none' }}>
        <div className="flex flex-col gap-2">
          {chatData?.messages.map((msg) => {
            const avatarCfg = AVATAR_CONFIG[msg.avatarType] || AVATAR_CONFIG.constellation;
            const isExpanded = expandedAnalysis.includes(msg.id);
            const strategyStyle = msg.analysis
              ? STRATEGY_COLORS[msg.analysis.strategyTag] || STRATEGY_COLORS['深度引导']
              : null;

            if (msg.isMine) {
              return (
                <div key={msg.id} className="flex flex-col items-end gap-1">
                  {/* Label */}
                  <div className="flex items-center gap-1.5 mr-1">
                    <span className="font-noto font-medium" style={{ color: 'rgba(196,187,255,0.7)', fontSize: '9px' }}>你的分身</span>
                    <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#6C5CE7' }} />
                  </div>

                  {/* Bubble row */}
                  <div className="flex items-end gap-2 max-w-[85%]">
                    {/* Info toggle */}
                    {msg.highlight && msg.analysis && (
                      <button
                        onClick={() => toggleAnalysis(msg.id)}
                        className="w-7 h-7 flex items-center justify-center rounded-xl cursor-pointer shrink-0 transition-all duration-200"
                        style={{
                          background: isExpanded ? 'rgba(108,92,231,0.38)' : 'rgba(108,92,231,0.18)',
                          border: `1px solid ${isExpanded ? 'rgba(108,92,231,0.6)' : 'rgba(108,92,231,0.32)'}`,
                          color: '#C4BBFF',
                        }}
                      >
                        <i className={`${isExpanded ? 'ri-information-fill' : 'ri-information-line'} text-xs`} />
                      </button>
                    )}

                    <div className="flex flex-col gap-1">
                      {/* Strategy tag */}
                      {msg.highlight && msg.analysis && strategyStyle && (
                        <div
                          className="self-end flex items-center gap-1 px-2 py-0.5 rounded-full"
                          style={{ background: strategyStyle.bg, border: `1px solid ${strategyStyle.border}` }}
                        >
                          <i className="ri-sparkling-line" style={{ color: strategyStyle.text, fontSize: '9px' }} />
                          <span className="font-noto font-semibold" style={{ color: strategyStyle.text, fontSize: '9px' }}>
                            {msg.analysis.strategyTag}
                          </span>
                        </div>
                      )}

                      {/* Bubble */}
                      <div
                        className="px-3.5 py-2.5 rounded-2xl rounded-br-md"
                        style={
                          msg.highlight
                            ? {
                                background: 'linear-gradient(135deg,rgba(108,92,231,0.52),rgba(108,92,231,0.32))',
                                backdropFilter: 'blur(16px) saturate(180%)',
                                WebkitBackdropFilter: 'blur(16px) saturate(180%)',
                                border: '1.5px solid rgba(108,92,231,0.6)',
                                boxShadow: '0 0 16px rgba(108,92,231,0.22)',
                              }
                            : {
                                background: 'linear-gradient(135deg,rgba(108,92,231,0.3),rgba(108,92,231,0.16))',
                                backdropFilter: 'blur(12px)',
                                WebkitBackdropFilter: 'blur(12px)',
                                border: '1px solid rgba(108,92,231,0.32)',
                              }
                        }
                      >
                        <p className="font-noto text-sm leading-relaxed text-primary">{msg.text}</p>
                        <p className="font-noto mt-1 text-right text-muted" style={{ fontSize: '9px' }}>{msg.time}</p>
                      </div>
                    </div>

                    {/* Avatar */}
                    <div
                      className="w-8 h-8 rounded-2xl flex items-center justify-center shrink-0"
                      style={{ background: 'linear-gradient(135deg,rgba(108,92,231,0.32),rgba(108,92,231,0.18))', border: '1.5px solid rgba(108,92,231,0.55)', boxShadow: '0 0 10px rgba(108,92,231,0.28)' }}
                    >
                      <i className="ri-bubble-chart-fill text-sm" style={{ color: '#A29BFE' }} />
                    </div>
                  </div>

                  {/* Analysis panel */}
                  <div style={{ maxHeight: isExpanded ? '320px' : '0px', overflow: 'hidden', transition: 'max-height 0.35s cubic-bezier(0.4,0,0.2,1)', width: '100%' }}>
                    {msg.analysis && (
                      <div
                        className="mt-1 mr-10 rounded-2xl rounded-tr-md overflow-hidden"
                        style={{
                          background: 'linear-gradient(135deg,rgba(20,18,48,0.88),rgba(15,15,30,0.78))',
                          backdropFilter: 'blur(20px) saturate(160%)',
                          WebkitBackdropFilter: 'blur(20px) saturate(160%)',
                          border: '1px solid rgba(108,92,231,0.3)',
                        }}
                      >
                        <div
                          className="flex items-center gap-2 px-3 py-2"
                          style={{ borderBottom: '1px solid rgba(108,92,231,0.18)', background: 'rgba(108,92,231,0.18)' }}
                        >
                          <i className="ri-robot-line text-xs" style={{ color: '#C4BBFF' }} />
                          <span className="font-noto text-xs font-bold" style={{ color: '#C4BBFF' }}>分身决策解析</span>
                        </div>

                        <div className="p-3 flex flex-col gap-3">
                          <div>
                            <div className="flex items-center gap-1.5 mb-1.5">
                              <i className="ri-lightbulb-flash-line" style={{ color: '#FDCB6E', fontSize: '12px' }} />
                              <span className="font-noto font-bold text-secondary" style={{ fontSize: '11px' }}>判断依据</span>
                            </div>
                            <p className="font-noto text-xs leading-relaxed pl-5 text-secondary">{msg.analysis.reason}</p>
                          </div>
                          <div style={{ height: '1px', background: 'rgba(108,92,231,0.15)' }} />
                          <div>
                            <div className="flex items-center gap-1.5 mb-1.5">
                              <i className="ri-heart-pulse-line" style={{ color: '#00D1FF', fontSize: '12px' }} />
                              <span className="font-noto font-bold text-secondary" style={{ fontSize: '11px' }}>对你的帮助</span>
                            </div>
                            <p className="font-noto text-xs leading-relaxed pl-5 text-secondary">{msg.analysis.benefit}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            }

            // Others
            return (
              <div key={msg.id} className="flex items-end gap-2 max-w-[82%]">
                <div
                  className="w-8 h-8 rounded-2xl flex items-center justify-center shrink-0"
                  style={{ background: `linear-gradient(135deg,${avatarCfg.color}22,${avatarCfg.color}10)`, border: `1.5px solid ${avatarCfg.color}40` }}
                >
                  <i className={`${avatarCfg.icon} text-xs`} style={{ color: avatarCfg.color }} />
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="font-orbitron pl-1 text-muted" style={{ fontSize: '9px' }}>{msg.starId}</span>
                  <div
                    className="px-3.5 py-2.5 rounded-2xl rounded-bl-md"
                    style={{
                      background: 'linear-gradient(135deg,rgba(255,255,255,0.09),rgba(255,255,255,0.05))',
                      backdropFilter: 'blur(14px)',
                      WebkitBackdropFilter: 'blur(14px)',
                      border: '1px solid rgba(255,255,255,0.12)',
                    }}
                  >
                    <p className="font-noto text-sm leading-relaxed text-secondary">{msg.text}</p>
                    <p className="font-noto mt-1 text-muted" style={{ fontSize: '9px' }}>{msg.time}</p>
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>
      </div>

      {/* ── Input bar ── */}
      <div
        className="mx-4 mb-6 mt-2 shrink-0 flex items-center gap-3 px-4 py-3 rounded-2xl"
        style={{
          background: 'linear-gradient(135deg,rgba(255,255,255,0.07),rgba(255,255,255,0.04))',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: '1px solid rgba(255,255,255,0.1)',
        }}
      >
        <i className="ri-lock-line text-sm" style={{ color: 'rgba(224,239,255,0.45)' }} />
        <p className="flex-1 font-noto text-xs text-tertiary">分身正在代你发言，真人不可干预</p>
        <div
          className="flex items-center gap-1 px-2.5 py-1 rounded-full"
          style={{ background: 'rgba(108,92,231,0.22)', border: '1px solid rgba(108,92,231,0.38)' }}
        >
          <div className="w-1 h-1 rounded-full animate-pulse" style={{ background: '#6C5CE7' }} />
          <span className="font-noto font-semibold" style={{ color: '#C4BBFF', fontSize: '9px' }}>分身代管中</span>
        </div>
      </div>
    </div>
  );
}
