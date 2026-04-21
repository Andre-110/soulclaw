import { useState, useEffect } from 'react';

interface Props {
  matchId: string;
  onBack: () => void;
}

const ICE_BREAKERS = [
  '你说的「城市冥想」，我最近也在实践，你通常会去哪里？',
  '「主动孤独是充电」这个观点，你是什么时候想明白的？',
  '如果有机会重温那次深夜散步，你最想聊什么？',
];

export default function StarUnlock({ matchId, onBack }: Props) {
  const [myStatus, setMyStatus] = useState<'pending' | 'confirmed'>('pending');
  const [theirStatus, setTheirStatus] = useState<'pending' | 'confirmed'>('pending');
  const [unlocked, setUnlocked] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState([
    { side: 'right', text: '嗯，你好！分身帮我们打了个好底，哈哈', time: '刚刚' },
  ]);

  useEffect(() => {
    if (myStatus === 'confirmed') {
      const t = setTimeout(() => {
        setTheirStatus('confirmed');
        setTimeout(() => setUnlocked(true), 800);
      }, 1500);
      return () => clearTimeout(t);
    }
  }, [myStatus]);

  const sendMessage = () => {
    if (!chatInput.trim()) return;
    setChatMessages((prev) => [...prev, { side: 'left', text: chatInput.trim(), time: '刚刚' }]);
    setChatInput('');
    setTimeout(() => {
      setChatMessages((prev) => [...prev, {
        side: 'right',
        text: '哈哈，你说的那个地方我也去过！下次可以一起？',
        time: '刚刚',
      }]);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-30 flex flex-col" style={{ background: '#0F0F1E' }}>
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-10 pb-4"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <button onClick={onBack} className="w-9 h-9 flex items-center justify-center rounded-xl cursor-pointer"
          style={{ background: 'rgba(255,255,255,0.06)' }}>
          <i className="ri-arrow-left-line" style={{ color: '#E0EFFF' }} />
        </button>
        <div>
          <p className="font-orbitron text-sm font-bold" style={{ color: '#E0EFFF' }}>星联解锁</p>
          <p className="text-xs font-noto" style={{ color: 'rgba(224,239,255,0.35)', fontSize: '10px' }}>{matchId}</p>
        </div>
        {unlocked && (
          <div className="ml-auto flex items-center gap-1.5 px-3 py-1 rounded-full"
            style={{ background: 'rgba(0,209,255,0.12)', border: '1px solid rgba(0,209,255,0.3)' }}>
            <i className="ri-lock-unlock-line text-xs" style={{ color: '#00D1FF' }} />
            <span className="text-xs font-noto" style={{ color: '#00D1FF' }}>已解锁</span>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-4 pt-6 pb-4 flex flex-col gap-5 max-w-md mx-auto w-full">
        {!unlocked ? (
          <>
            {/* Dual confirm */}
            <div className="p-5 rounded-3xl flex flex-col gap-4"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <div className="flex items-center gap-2 mb-1">
                <i className="ri-link-m text-sm" style={{ color: '#6C5CE7' }} />
                <span className="text-xs font-orbitron tracking-wider" style={{ color: '#6C5CE7' }}>双向确认</span>
              </div>
              <p className="text-xs font-noto" style={{ color: 'rgba(224,239,255,0.45)' }}>
                双方同时确认，才能开启真人聊天。杜绝单向尴尬。
              </p>

              <div className="flex items-center gap-4">
                {/* Me */}
                <div className="flex-1 flex flex-col items-center gap-2 p-3 rounded-2xl"
                  style={{
                    background: myStatus === 'confirmed' ? 'rgba(108,92,231,0.12)' : 'rgba(255,255,255,0.04)',
                    border: `1px solid ${myStatus === 'confirmed' ? 'rgba(108,92,231,0.4)' : 'rgba(255,255,255,0.08)'}`,
                  }}>
                  <div className="w-10 h-10 rounded-2xl flex items-center justify-center"
                    style={{ background: 'rgba(108,92,231,0.2)', border: '1.5px solid rgba(108,92,231,0.5)' }}>
                    <i className="ri-star-fill text-lg" style={{ color: '#6C5CE7' }} />
                  </div>
                  <span className="text-xs font-noto" style={{ color: 'rgba(224,239,255,0.5)' }}>我</span>
                  {myStatus === 'confirmed'
                    ? <i className="ri-checkbox-circle-fill text-lg" style={{ color: '#6C5CE7' }} />
                    : <i className="ri-time-line text-lg" style={{ color: 'rgba(224,239,255,0.3)' }} />
                  }
                </div>

                {/* Link icon */}
                <div className="flex flex-col items-center gap-1">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center"
                    style={{
                      background: unlocked ? 'linear-gradient(135deg, #6C5CE7, #00D1FF)' : 'rgba(255,255,255,0.06)',
                    }}
                  >
                    <i className={`${unlocked ? 'ri-link-m' : 'ri-lock-line'} text-sm`}
                      style={{ color: unlocked ? '#fff' : 'rgba(224,239,255,0.3)' }} />
                  </div>
                  {myStatus === 'confirmed' && theirStatus === 'pending' && (
                    <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#00D1FF' }} />
                  )}
                </div>

                {/* Them */}
                <div className="flex-1 flex flex-col items-center gap-2 p-3 rounded-2xl"
                  style={{
                    background: theirStatus === 'confirmed' ? 'rgba(0,209,255,0.08)' : 'rgba(255,255,255,0.04)',
                    border: `1px solid ${theirStatus === 'confirmed' ? 'rgba(0,209,255,0.3)' : 'rgba(255,255,255,0.08)'}`,
                  }}>
                  <div className="w-10 h-10 rounded-2xl flex items-center justify-center"
                    style={{ background: 'rgba(0,209,255,0.15)', border: '1.5px solid rgba(0,209,255,0.4)' }}>
                    <i className="ri-star-fill text-lg" style={{ color: '#00D1FF' }} />
                  </div>
                  <span className="text-xs font-noto" style={{ color: 'rgba(224,239,255,0.5)' }}>对方</span>
                  {theirStatus === 'confirmed'
                    ? <i className="ri-checkbox-circle-fill text-lg" style={{ color: '#00D1FF' }} />
                    : <i className="ri-time-line text-lg animate-pulse" style={{ color: 'rgba(224,239,255,0.3)' }} />
                  }
                </div>
              </div>

              {myStatus === 'pending' && (
                <button
                  onClick={() => setMyStatus('confirmed')}
                  className="w-full py-3.5 rounded-2xl text-sm font-orbitron font-bold cursor-pointer whitespace-nowrap"
                  style={{ background: 'linear-gradient(135deg, #6C5CE7, #00D1FF)', color: '#fff', boxShadow: '0 0 20px rgba(108,92,231,0.4)' }}
                >
                  确认开启星联
                </button>
              )}
              {myStatus === 'confirmed' && theirStatus === 'pending' && (
                <div className="text-center py-2">
                  <p className="text-xs font-noto" style={{ color: 'rgba(224,239,255,0.4)' }}>
                    <span className="animate-pulse" style={{ color: '#00D1FF' }}>等待对方确认</span> · 正在实时同步...
                  </p>
                </div>
              )}
            </div>

            {/* Ice breakers */}
            <div className="p-5 rounded-3xl"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <div className="flex items-center gap-2 mb-3">
                <i className="ri-fire-line text-sm" style={{ color: '#FF7675' }} />
                <span className="text-xs font-orbitron tracking-wider" style={{ color: '#FF7675' }}>专属破冰话题</span>
              </div>
              <p className="text-xs font-noto mb-3" style={{ color: 'rgba(224,239,255,0.4)' }}>
                基于24h对聊内容，分身为你生成了3个不尬聊开场白
              </p>
              <div className="flex flex-col gap-2">
                {ICE_BREAKERS.map((ib, i) => (
                  <div key={i} className="flex items-start gap-2.5 p-3 rounded-xl cursor-pointer"
                    style={{ background: 'rgba(255,118,117,0.06)', border: '1px solid rgba(255,118,117,0.15)' }}
                    onClick={() => setChatInput(ib)}>
                    <span className="font-orbitron text-xs mt-0.5 shrink-0" style={{ color: '#FF7675' }}>0{i + 1}</span>
                    <p className="text-xs font-noto leading-relaxed" style={{ color: 'rgba(224,239,255,0.6)' }}>{ib}</p>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Unlocked */}
            <div className="p-5 rounded-3xl text-center"
              style={{ background: 'rgba(0,209,255,0.06)', border: '1px solid rgba(0,209,255,0.25)' }}>
              <i className="ri-lock-unlock-line text-3xl mb-2 block" style={{ color: '#00D1FF' }} />
              <h3 className="font-orbitron text-base font-bold mb-1" style={{ color: '#E0EFFF' }}>星联已解锁</h3>
              <p className="text-xs font-noto" style={{ color: 'rgba(224,239,255,0.45)' }}>真人聊天已开启，开始你们的第一次对话</p>
            </div>

            {/* Chat area */}
            <div className="flex flex-col gap-3 p-4 rounded-3xl"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', minHeight: '200px' }}>
              {chatMessages.map((msg, i) => (
                <div key={i} className={`flex ${msg.side === 'left' ? '' : 'flex-row-reverse'} gap-2`}>
                  <div className="max-w-[75%] px-4 py-2.5 rounded-2xl text-sm font-noto"
                    style={{
                      background: msg.side === 'left' ? 'rgba(108,92,231,0.2)' : 'rgba(0,209,255,0.12)',
                      color: '#E0EFFF',
                    }}>
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>

            {/* Ice breakers quick */}
            <div className="flex flex-col gap-1.5">
              {ICE_BREAKERS.map((ib, i) => (
                <button key={i} onClick={() => setChatInput(ib)}
                  className="text-left px-3 py-2 rounded-xl text-xs font-noto cursor-pointer"
                  style={{ background: 'rgba(255,118,117,0.06)', border: '1px solid rgba(255,118,117,0.12)', color: 'rgba(255,118,117,0.7)' }}>
                  {ib}
                </button>
              ))}
            </div>

            {/* Input */}
            <div className="flex gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') sendMessage(); }}
                placeholder="说点什么..."
                className="flex-1 px-4 py-3 rounded-2xl text-sm font-noto outline-none"
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: '#E0EFFF',
                }}
              />
              <button
                onClick={sendMessage}
                className="w-12 h-12 flex items-center justify-center rounded-2xl cursor-pointer"
                style={{ background: 'linear-gradient(135deg, #6C5CE7, #00D1FF)' }}
              >
                <i className="ri-send-plane-fill text-white" />
              </button>
            </div>

            {/* Privacy */}
            <button className="flex items-center justify-center gap-2 py-3 rounded-2xl cursor-pointer"
              style={{ background: 'rgba(255,75,75,0.06)', border: '1px solid rgba(255,75,75,0.15)', color: 'rgba(255,100,100,0.6)' }}>
              <i className="ri-shield-keyhole-line text-sm" />
              <span className="text-xs font-noto">随时断开星联，退回分身模式</span>
            </button>
          </>
        )}
      </div>
    </div>
  );
}
