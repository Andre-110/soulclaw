import { useState } from 'react';

export interface DeepAnswers {
  musicStyle: string;
  movieType: string;
  nicheArtist: string;
  bookType: string;
  nicheHobby: string;
  lifeImportant: string;
  consumeAttitude: string;
  lifeStyle: string;
  promiseAttitude: string;
  idealRelation: string;
  relationRole: string;
  redLine: string;
  attractFirst: string;
}

const EMPTY_ANSWERS: DeepAnswers = {
  musicStyle: '', movieType: '', nicheArtist: '', bookType: '', nicheHobby: '',
  lifeImportant: '', consumeAttitude: '', lifeStyle: '', promiseAttitude: '',
  idealRelation: '', relationRole: '', redLine: '', attractFirst: '',
};

const QUESTIONS: {
  key: keyof DeepAnswers;
  label: string;
  icon: string;
  options: string[];
  placeholder: string;
}[] = [
  {
    key: 'musicStyle',
    label: '你平时最爱听的音乐风格更偏向？',
    icon: 'ri-music-2-line',
    options: ['独立/民谣', '电子/合成波', 'Jazz/蓝调', '流行/古典'],
    placeholder: '描述你的音乐口味…',
  },
  {
    key: 'movieType',
    label: '你最喜欢的电影类型是？',
    icon: 'ri-movie-line',
    options: ['文艺/作者电影', '科幻/悬疑', '爱情/纪录片', '动画/动作'],
    placeholder: '说说你最爱的电影类型…',
  },
  {
    key: 'nicheArtist',
    label: '你有一直在追的冷门歌手/乐队吗？',
    icon: 'ri-headphone-line',
    options: ['有，冷门但我超爱', '有一些小众的', '我就是追大众的', '随机听，不固定'],
    placeholder: '说说他们的名字或风格…',
  },
  {
    key: 'bookType',
    label: '你平时会读什么类型的书/内容？',
    icon: 'ri-book-open-line',
    options: ['文学/小说', '哲学/社科', '科技/心理学', '不怎么读书'],
    placeholder: '描述你的阅读偏好…',
  },
  {
    key: 'nicheHobby',
    label: '你有什么别人很少知道的小众爱好？',
    icon: 'ri-seedling-line',
    options: ['收藏/复古相机', '骑行/户外探索', '手工/自制音乐', '天文/游戏开发'],
    placeholder: '分享你的小众世界…',
  },
  {
    key: 'lifeImportant',
    label: '你认为人生最重要的是？',
    icon: 'ri-compass-3-line',
    options: ['自由与自我实现', '深度的人际连接', '内心的平静', '爱与被爱'],
    placeholder: '用你的语言表达…',
  },
  {
    key: 'consumeAttitude',
    label: '你对消费的态度更接近？',
    icon: 'ri-shopping-bag-line',
    options: ['极简主义，少而精', '体验优先，不买物品', '品质控，宁缺毋滥', '随性，看心情'],
    placeholder: '描述你的消费观…',
  },
  {
    key: 'lifeStyle',
    label: '你更喜欢规律生活还是随性生活？',
    icon: 'ri-calendar-check-line',
    options: ['很规律，习惯控', '大体规律，有弹性', '随性为主，偶尔规律', '完全随性，抗拒计划'],
    placeholder: '描述你的生活节奏…',
  },
  {
    key: 'promiseAttitude',
    label: '你对承诺的态度是？',
    icon: 'ri-shield-star-line',
    options: ['说到做到，非常重视', '尽力践行，但看情况', '不轻易承诺', '承诺是一种束缚'],
    placeholder: '说说你对承诺的看法…',
  },
  {
    key: 'idealRelation',
    label: '你理想中的相处模式是？',
    icon: 'ri-heart-2-line',
    options: ['保持独立+高质量陪伴', '随时黏在一起', '各自生活，定期相聚', '深度精神共鸣为主'],
    placeholder: '描述你向往的相处方式…',
  },
  {
    key: 'relationRole',
    label: '你在关系中更偏向？',
    icon: 'ri-user-heart-line',
    options: ['给予型，照顾对方', '被照顾型', '完全平等互给', '视情况而定'],
    placeholder: '说说你在关系里的角色…',
  },
  {
    key: 'redLine',
    label: '你最不能接受的相处雷点是？',
    icon: 'ri-error-warning-line',
    options: ['不尊重边界', 'PUA/控制欲强', '缺乏共鸣/交流', '不守时/不靠谱'],
    placeholder: '说说你的相处底线…',
  },
  {
    key: 'attractFirst',
    label: '你心动的第一特质是？',
    icon: 'ri-sparkling-2-line',
    options: ['有趣/幽默感', '聪明/有想法', '独立/有自己的世界', '温柔/善良'],
    placeholder: '什么会让你第一眼心动…',
  },
];

interface Props {
  initialAnswers?: Partial<DeepAnswers>;
  onClose: () => void;
  onSave: (answers: DeepAnswers) => void;
}

export default function DeepQuestionModal({ initialAnswers, onClose, onSave }: Props) {
  const [answers, setAnswers] = useState<DeepAnswers>({ ...EMPTY_ANSWERS, ...initialAnswers });
  const [current, setCurrent] = useState(0);
  const [customMode, setCustomMode] = useState(false);
  const [customInput, setCustomInput] = useState('');

  const q = QUESTIONS[current];
  const answered = QUESTIONS.filter((q) => answers[q.key] !== '').length;
  const progress = Math.round((answered / QUESTIONS.length) * 100);

  const setAnswer = (val: string) => {
    setAnswers((prev) => ({ ...prev, [q.key]: val }));
    setCustomMode(false);
    setCustomInput('');
    // Auto-advance to next question after a short delay
    setTimeout(() => {
      if (current < QUESTIONS.length - 1) {
        setCurrent((c) => c + 1);
      }
    }, 300);
  };

  const handleCustomConfirm = () => {
    if (customInput.trim()) {
      setAnswer(customInput.trim());
    }
  };

  const goNext = () => {
    if (current < QUESTIONS.length - 1) setCurrent(current + 1);
    else onSave(answers);
  };

  const goPrev = () => { if (current > 0) setCurrent(current - 1); };

  const handleSaveAll = () => onSave(answers);

  return (
    <div className="fixed inset-0 z-50 flex flex-col" style={{ background: '#0F0F1E' }}>
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-10 pb-3 shrink-0">
        <button onClick={onClose} className="w-9 h-9 flex items-center justify-center rounded-xl cursor-pointer" style={{ background: 'rgba(255,255,255,0.06)' }}>
          <i className="ri-arrow-left-line" style={{ color: '#E0EFFF' }} />
        </button>
        <div className="flex-1">
          <p className="font-orbitron text-sm font-bold" style={{ color: '#E0EFFF' }}>深度问题了解</p>
          <p className="text-xs font-noto" style={{ color: 'rgba(224,239,255,0.4)' }}>已回答 {answered}/{QUESTIONS.length}</p>
        </div>
        <button
          onClick={handleSaveAll}
          className="px-3 py-1.5 rounded-xl text-xs font-noto font-semibold cursor-pointer whitespace-nowrap"
          style={{ background: 'rgba(108,92,231,0.25)', border: '1px solid rgba(108,92,231,0.4)', color: '#C4BBFF' }}
        >
          保存退出
        </button>
      </div>

      {/* Progress bar */}
      <div className="px-4 mb-4 shrink-0">
        <div className="h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${progress}%`, background: 'linear-gradient(90deg, #6C5CE7, #00D1FF)' }}
          />
        </div>
        <div className="flex justify-between mt-1.5">
          <span className="text-xs font-noto" style={{ color: 'rgba(224,239,255,0.35)' }}>第 {current + 1} / {QUESTIONS.length} 题</span>
          <span className="text-xs font-noto" style={{ color: 'rgba(224,239,255,0.35)' }}>了解度 {progress}%</span>
        </div>
      </div>

      {/* Question dots nav */}
      <div className="px-4 mb-4 shrink-0">
        <div className="flex gap-1.5 flex-wrap">
          {QUESTIONS.map((q2, i) => (
            <button
              key={q2.key}
              onClick={() => { setCurrent(i); setCustomMode(false); }}
              className="w-7 h-7 flex items-center justify-center rounded-full cursor-pointer transition-all duration-150 text-xs font-orbitron"
              style={{
                background: i === current
                  ? 'rgba(108,92,231,0.5)'
                  : answers[q2.key]
                    ? 'rgba(0,209,255,0.2)'
                    : 'rgba(255,255,255,0.06)',
                border: i === current
                  ? '1px solid rgba(108,92,231,0.7)'
                  : answers[q2.key]
                    ? '1px solid rgba(0,209,255,0.3)'
                    : '1px solid rgba(255,255,255,0.1)',
                color: i === current ? '#C4BBFF' : answers[q2.key] ? '#00D1FF' : 'rgba(224,239,255,0.35)',
                fontSize: '10px',
              }}
            >
              {answers[q2.key] ? <i className="ri-check-line" style={{ fontSize: '10px' }} /> : i + 1}
            </button>
          ))}
        </div>
      </div>

      {/* Question body */}
      <div className="flex-1 overflow-y-auto px-4 pb-6">
        <div className="flex flex-col gap-4">
          {/* Question card */}
          <div className="p-4 rounded-2xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 flex items-center justify-center rounded-xl shrink-0" style={{ background: 'rgba(108,92,231,0.2)', border: '1px solid rgba(108,92,231,0.3)' }}>
                <i className={`${q.icon} text-sm`} style={{ color: '#A29BFE' }} />
              </div>
              <p className="text-sm font-noto font-semibold leading-relaxed flex-1" style={{ color: '#E0EFFF', paddingTop: '6px' }}>
                {q.label}
              </p>
            </div>
          </div>

          {/* Current answer display */}
          {answers[q.key] && !customMode && (
            <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl"
              style={{ background: 'rgba(0,209,255,0.08)', border: '1px solid rgba(0,209,255,0.25)' }}>
              <i className="ri-checkbox-circle-line text-sm" style={{ color: '#00D1FF' }} />
              <span className="text-sm font-noto flex-1" style={{ color: '#00D1FF' }}>{answers[q.key]}</span>
              <button onClick={() => setAnswer('')} className="cursor-pointer">
                <i className="ri-close-line" style={{ color: 'rgba(0,209,255,0.6)', fontSize: '14px' }} />
              </button>
            </div>
          )}

          {/* Options */}
          <div className="flex flex-col gap-2">
            {q.options.map((opt) => (
              <button
                key={opt}
                onClick={() => setAnswer(opt)}
                className="px-4 py-3 rounded-xl text-left text-sm font-noto cursor-pointer transition-all duration-150 active:scale-98"
                style={{
                  background: answers[q.key] === opt ? 'rgba(108,92,231,0.25)' : 'rgba(255,255,255,0.04)',
                  border: answers[q.key] === opt ? '1px solid rgba(108,92,231,0.5)' : '1px solid rgba(255,255,255,0.08)',
                  color: answers[q.key] === opt ? '#C4BBFF' : 'rgba(224,239,255,0.7)',
                }}
              >
                {opt}
              </button>
            ))}

            {/* Custom input toggle */}
            {!customMode ? (
              <button
                onClick={() => { setCustomMode(true); setCustomInput(answers[q.key] || ''); }}
                className="px-4 py-3 rounded-xl text-left text-sm font-noto cursor-pointer transition-all duration-150"
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1.5px dashed rgba(255,255,255,0.12)',
                  color: 'rgba(224,239,255,0.4)',
                }}
              >
                <i className="ri-edit-line mr-2" style={{ fontSize: '13px' }} />
                自定义回答
              </button>
            ) : (
              <div className="flex flex-col gap-2">
                <textarea
                  value={customInput}
                  onChange={(e) => setCustomInput(e.target.value)}
                  placeholder={q.placeholder}
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl text-sm font-noto outline-none resize-none"
                  style={{
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(108,92,231,0.4)',
                    color: '#E0EFFF',
                  }}
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => { setCustomMode(false); setCustomInput(''); }}
                    className="flex-1 py-2.5 rounded-xl text-xs font-noto cursor-pointer whitespace-nowrap"
                    style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(224,239,255,0.5)' }}
                  >
                    取消
                  </button>
                  <button
                    onClick={handleCustomConfirm}
                    disabled={!customInput.trim()}
                    className="flex-1 py-2.5 rounded-xl text-xs font-noto font-semibold cursor-pointer whitespace-nowrap"
                    style={{
                      background: customInput.trim() ? 'rgba(108,92,231,0.35)' : 'rgba(255,255,255,0.06)',
                      border: customInput.trim() ? '1px solid rgba(108,92,231,0.5)' : '1px solid transparent',
                      color: customInput.trim() ? '#C4BBFF' : 'rgba(224,239,255,0.3)',
                    }}
                  >
                    确认
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom nav */}
      <div className="px-4 pb-8 shrink-0 flex gap-3">
        <button
          onClick={goPrev}
          disabled={current === 0}
          className="w-12 h-12 flex items-center justify-center rounded-2xl cursor-pointer whitespace-nowrap transition-all duration-150"
          style={{
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.1)',
            opacity: current === 0 ? 0.3 : 1,
          }}
        >
          <i className="ri-arrow-left-s-line" style={{ color: 'rgba(224,239,255,0.7)', fontSize: '20px' }} />
        </button>
        <button
          onClick={goNext}
          className="flex-1 h-12 flex items-center justify-center rounded-2xl cursor-pointer whitespace-nowrap font-noto font-semibold text-sm transition-all duration-150 active:scale-98 gap-2"
          style={{
            background: 'linear-gradient(135deg,rgba(108,92,231,0.7),rgba(0,209,255,0.5))',
            border: '1px solid rgba(108,92,231,0.5)',
            color: '#E0EFFF',
          }}
        >
          {current < QUESTIONS.length - 1 ? (
            <>下一题 <i className="ri-arrow-right-s-line" style={{ fontSize: '18px' }} /></>
          ) : (
            <>完成并保存 <i className="ri-check-line" style={{ fontSize: '16px' }} /></>
          )}
        </button>
      </div>
    </div>
  );
}
