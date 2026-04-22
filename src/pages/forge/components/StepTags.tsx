import { useState } from 'react';

const QUESTIONS = [
  {
    id: 'q1',
    icon: 'ri-moon-foggy-line',
    color: '#A29BFE',
    question: '深夜独处时，你最常做的事是？',
    options: [
      '反复听一首歌直到麻木',
      '在日记本写不会发出去的话',
      '看天花板想一些无解的事',
      '刷到凌晨，直到困到关屏',
    ],
  },
  {
    id: 'q2',
    icon: 'ri-compass-discover-line',
    color: '#00D1FF',
    question: '如果可以消失一周，你会去做什么？',
    options: [
      '一个人去没去过的城市发呆',
      '把所有想看的书一口气读完',
      '在山里或海边什么都不做',
      '拍很多照片，不发任何平台',
    ],
  },
  {
    id: 'q3',
    icon: 'ri-heart-2-line',
    color: '#FD79A8',
    question: '你觉得怦然心动的瞬间是？',
    options: [
      '对方记得你随口说过的小事',
      '两个人沉默也不觉得尴尬',
      '聊到某个点，感觉被看见了',
      '对方的某个细节突然击中你',
    ],
  },
];

const GLASS: React.CSSProperties = {
  backdropFilter: 'blur(24px) saturate(180%)',
  WebkitBackdropFilter: 'blur(24px) saturate(180%)',
  background: 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%)',
  border: '1px solid rgba(255,255,255,0.12)',
  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.1)',
};

interface Props {
  onNext: () => void;
}

export default function StepTags({ onNext }: Props) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [customInputs, setCustomInputs] = useState<Record<string, string>>({});

  const answeredCount = Object.keys(answers).filter((k) => answers[k]?.trim()).length;
  const canNext = answeredCount >= 3;

  const handleSelect = (qid: string, val: string) => {
    setAnswers((prev) => ({ ...prev, [qid]: val }));
  };

  const handleNext = () => {
    localStorage.setItem('star_questions', JSON.stringify(answers));
    onNext();
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="rounded-2xl p-5 text-center" style={GLASS}>
        <div
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-3"
          style={{ background: 'rgba(253,121,168,0.15)', border: '1px solid rgba(253,121,168,0.4)' }}
        >
          <i className="ri-sparkling-2-line text-sm" style={{ color: '#FD79A8' }} />
          <span className="text-xs font-noto" style={{ color: '#FD79A8' }}>灵魂校准</span>
        </div>
        <h2 className="font-orbitron text-xl font-bold mb-1" style={{ color: '#E0EFFF' }}>
          3道灵魂追问
        </h2>
        <p className="text-xs font-noto" style={{ color: 'rgba(224,239,255,0.55)' }}>
          没有对错，只是让AI更懂你
        </p>
      </div>

      {/* Progress bar */}
      <div className="flex items-center gap-3 px-1">
        {QUESTIONS.map((q, i) => {
          const done = !!answers[q.id]?.trim();
          return (
            <div key={q.id} className="flex-1 flex flex-col items-center gap-1.5">
              <div
                className="w-full h-1 rounded-full transition-all duration-500"
                style={{
                  background: done
                    ? `linear-gradient(90deg, ${q.color}, ${q.color}99)`
                    : 'rgba(255,255,255,0.1)',
                }}
              />
              <span className="text-xs font-noto" style={{ color: done ? q.color : 'rgba(224,239,255,0.35)', fontSize: '10px' }}>
                Q{i + 1}
              </span>
            </div>
          );
        })}
      </div>

      {/* Questions */}
      <div className="flex flex-col gap-4">
        {QUESTIONS.map((q) => {
          const selected = answers[q.id];
          return (
            <div
              key={q.id}
              className="rounded-2xl p-4 transition-all duration-300"
              style={{
                ...GLASS,
                border: selected
                  ? `1px solid ${q.color}55`
                  : '1px solid rgba(255,255,255,0.12)',
                background: selected
                  ? `linear-gradient(135deg, ${q.color}12 0%, rgba(255,255,255,0.03) 100%)`
                  : 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%)',
              }}
            >
              {/* Question title */}
              <div className="flex items-start gap-2.5 mb-4">
                <div
                  className="w-8 h-8 flex items-center justify-center rounded-xl flex-shrink-0 mt-0.5"
                  style={{ background: `${q.color}20` }}
                >
                  <i className={`${q.icon}`} style={{ color: q.color, fontSize: '14px' }} />
                </div>
                <p className="text-sm font-noto leading-relaxed" style={{ color: 'rgba(224,239,255,0.92)' }}>
                  {q.question}
                </p>
              </div>

              {/* Options */}
              <div className="flex flex-col gap-2">
                {q.options.map((opt) => {
                  const isSelected = selected === opt;
                  return (
                    <button
                      key={opt}
                      onClick={() => handleSelect(q.id, opt)}
                      className="w-full text-left px-4 py-3 rounded-xl text-sm font-noto cursor-pointer transition-all duration-200 active:scale-98 whitespace-normal"
                      style={{
                        background: isSelected ? `${q.color}25` : 'rgba(255,255,255,0.05)',
                        border: isSelected ? `1px solid ${q.color}70` : '1px solid rgba(255,255,255,0.1)',
                        color: isSelected ? '#E0EFFF' : 'rgba(224,239,255,0.7)',
                        boxShadow: isSelected ? `0 0 12px ${q.color}30` : 'none',
                      }}
                    >
                      <span
                        className="inline-block w-4 h-4 rounded-full mr-2.5 flex-shrink-0 align-middle"
                        style={{
                          background: isSelected ? q.color : 'rgba(255,255,255,0.12)',
                          boxShadow: isSelected ? `0 0 6px ${q.color}80` : 'none',
                          display: 'inline-block',
                          verticalAlign: 'middle',
                          marginBottom: '2px',
                        }}
                      />
                      {opt}
                    </button>
                  );
                })}

                {/* Custom input */}
                <input
                  type="text"
                  placeholder="说出你的答案..."
                  value={customInputs[q.id] || ''}
                  onChange={(e) => {
                    const val = e.target.value;
                    setCustomInputs((prev) => ({ ...prev, [q.id]: val }));
                    handleSelect(q.id, val);
                  }}
                  className="w-full px-4 py-2.5 rounded-xl text-sm font-noto outline-none"
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px dashed rgba(255,255,255,0.15)',
                    color: '#E0EFFF',
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* CTA */}
      <button
        onClick={handleNext}
        disabled={!canNext}
        className="w-full py-4 rounded-2xl font-orbitron text-sm font-bold tracking-widest cursor-pointer transition-all duration-300 active:scale-95 whitespace-nowrap"
        style={{
          background: canNext ? 'linear-gradient(135deg, #6C5CE7, #FD79A8)' : 'rgba(255,255,255,0.06)',
          color: canNext ? '#fff' : 'rgba(224,239,255,0.3)',
          boxShadow: canNext ? '0 0 28px rgba(108,92,231,0.5), 0 0 50px rgba(253,121,168,0.2)' : 'none',
        }}
      >
        <span className="flex items-center justify-center gap-2">
          <i className="ri-flashlight-line" />
          开始铸造分身
        </span>
      </button>

      {!canNext && (
        <p className="text-center text-xs font-noto" style={{ color: 'rgba(224,239,255,0.4)' }}>
          请回答全部3道问题
        </p>
      )}
    </div>
  );
}
