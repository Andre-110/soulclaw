import { useState, useRef, useEffect } from 'react';

export interface DeepChatTags {
  [questionIndex: number]: string;
}

const DEEP_QUESTIONS: { text: string; options: string[] }[] = [
  {
    text: '你觉得人这一生，最不能丢掉的东西是什么？',
    options: ['真实的自我', '好奇心', '对爱的能力', '自由意志'],
  },
  {
    text: '如果抛开所有世俗标准，你真正想活成的样子是？',
    options: ['自由漫游者', '专注创造者', '深度探索者', '安静生活者'],
  },
  {
    text: '你心中「真正的自由」，到底是什么样子的？',
    options: ['不被任何人绑架', '经济完全独立', '内心不再焦虑', '能做自己喜欢的事'],
  },
  {
    text: '什么事情会让你瞬间感受到「活着真好」？',
    options: ['深夜好音乐突然响起', '和人发生真正的共鸣', '自然里的某一刻', '被人真正理解'],
  },
  {
    text: '你会为了迎合别人，改变自己的核心观念吗？',
    options: ['绝对不会', '极少情况下', '会适度妥协', '视关系深浅而定'],
  },
  {
    text: '你最了解自己的一个缺点，是什么？',
    options: ['拖延 / 惰惰不决', '过度思考放不下', '不够直接表达', '敏感易受伤'],
  },
  {
    text: '你最想和过去的自己，说一句什么话？',
    options: ['你已经够好了', '别那么用力讨好别人', '多爱自己一点', '你比你想的更强'],
  },
  {
    text: '什么样的细节，会让你对一个人彻底死心？',
    options: ['撒谎欺骗', '不尊重边界', '冷漠对待', '不守承诺'],
  },
  {
    text: '你喜欢「直球表达」还是「含蓄试探」？',
    options: ['我很直球', '偏直球但留余地', '含蓄为主', '看对象和关系'],
  },
  {
    text: '你觉得好的感情，是互补还是同频？',
    options: ['同频更重要', '互补更重要', '两者都需要', '三观同频+性格互补'],
  },
  {
    text: '你会为了利益，放弃自己的初心吗？',
    options: ['从不', '极少', '有过纠结', '曾经妥协过'],
  },
  {
    text: '你有什么专属自己的「精神避难所」？',
    options: ['音乐/歌单', '某个独属的地方', '写作/记录', '游戏/创作'],
  },
  {
    text: '你内心最柔软的一块地方，留给了什么？',
    options: ['某段无法忘记的回忆', '某个特别的人', '一个一直在追的梦想', '还没找到'],
  },
  {
    text: '有什么经历，彻底改变了你的观念？',
    options: ['一次失去了什么', '一段让我成长的关系', '一次出走/旅行', '还没有这种经历'],
  },
  {
    text: '有哪件事，是你至今想起仍会遗憾的？',
    options: ['没说出口的话', '错过的某个人', '放弃的某件事', '我不后悔什么'],
  },
  {
    text: '如果可以，你想对未来的自己说什么？',
    options: ['希望你还是你', '希望你找到了答案', '希望你不孤独', '希望你没辜负现在'],
  },
];

interface Message {
  role: 'ai' | 'user';
  text: string;
  questionIndex?: number;
  options?: string[];
}

interface Props {
  initialTags?: DeepChatTags;
  onClose: () => void;
  onSave: (tags: DeepChatTags) => void;
}

export default function DeepChatModal({ initialTags, onClose, onSave }: Props) {
  const [tags, setTags] = useState<DeepChatTags>(initialTags || {});
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [currentQ, setCurrentQ] = useState(0);
  const [started, setStarted] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [voiceActive, setVoiceActive] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const answered = Object.keys(tags).length;
  const progress = Math.round((answered / DEEP_QUESTIONS.length) * 100);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const pushAI = (text: string, questionIndex?: number, options?: string[]) => {
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      setMessages((prev) => [...prev, { role: 'ai', text, questionIndex, options }]);
    }, 900);
  };

  const startChat = () => {
    setStarted(true);
    // Find first unanswered question
    const firstUnanswered = DEEP_QUESTIONS.findIndex((_, i) => !(i in tags));
    const startIdx = firstUnanswered === -1 ? 0 : firstUnanswered;
    setCurrentQ(startIdx);
    setMessages([{
      role: 'ai',
      text: `你好，我是你的星核分身。\n接下来我会问你一些关于内心深处的问题，没有对错，只是想更深地认识你。\n\n随时可以选择选项或者直接打字回答，也可以语音说给我听。\n\n${DEEP_QUESTIONS[startIdx].text}`,
      questionIndex: startIdx,
      options: DEEP_QUESTIONS[startIdx].options,
    }]);
  };

  const handleAnswer = (answer: string, qIndex: number) => {
    // Add user message
    setMessages((prev) => [...prev, { role: 'user', text: answer }]);
    // Record tag
    const newTags = { ...tags, [qIndex]: answer };
    setTags(newTags);

    // Next question
    const nextQ = DEEP_QUESTIONS.findIndex((_, i) => !(i in newTags));
    if (nextQ === -1) {
      // All done
      setTimeout(() => {
        setIsTyping(true);
        setTimeout(() => {
          setIsTyping(false);
          setMessages((prev) => [...prev, {
            role: 'ai',
            text: `谢谢你如此真诚地回答了每一个问题。\n\n这些答案会成为你分身了解你的核心标签，帮助匹配到真正和你同频的人。\n\n随时可以回来补充或修改。`,
          }]);
          onSave(newTags);
        }, 1200);
      }, 600);
    } else {
      setCurrentQ(nextQ);
      setTimeout(() => {
        const ackPhrases = [
          '明白了。', '嗯，记下来了。', '好的，我懂你。', '有意思，继续。', '了解了。',
        ];
        const ack = ackPhrases[Math.floor(Math.random() * ackPhrases.length)];
        pushAI(`${ack}\n\n${DEEP_QUESTIONS[nextQ].text}`, nextQ, DEEP_QUESTIONS[nextQ].options);
      }, 600);
    }
  };

  const handleSend = () => {
    const text = input.trim();
    if (!text) return;
    setInput('');
    handleAnswer(text, currentQ);
  };

  const handleVoice = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setInput('（语音识别暂不支持，请直接输入）');
      return;
    }
    const SpeechRecognition = (window as unknown as { SpeechRecognition?: new () => SpeechRecognition; webkitSpeechRecognition?: new () => SpeechRecognition }).SpeechRecognition
      || (window as unknown as { webkitSpeechRecognition?: new () => SpeechRecognition }).webkitSpeechRecognition;
    if (!SpeechRecognition) return;
    const recognition = new SpeechRecognition();
    recognition.lang = 'zh-CN';
    recognition.interimResults = false;
    recognition.onstart = () => setVoiceActive(true);
    recognition.onend = () => setVoiceActive(false);
    recognition.onresult = (e: SpeechRecognitionEvent) => {
      const transcript = e.results[0][0].transcript;
      setInput(transcript);
      inputRef.current?.focus();
    };
    recognition.start();
  };

  const handleSaveExit = () => {
    onSave(tags);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col" style={{ background: '#0F0F1E' }}>
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-10 pb-3 shrink-0">
        <button onClick={onClose} className="w-9 h-9 flex items-center justify-center rounded-xl cursor-pointer" style={{ background: 'rgba(255,255,255,0.06)' }}>
          <i className="ri-arrow-left-line" style={{ color: '#E0EFFF' }} />
        </button>
        <div className="flex items-center gap-2 flex-1">
          <div className="w-8 h-8 flex items-center justify-center rounded-xl" style={{ background: 'rgba(108,92,231,0.2)', border: '1px solid rgba(108,92,231,0.35)' }}>
            <i className="ri-robot-line text-sm" style={{ color: '#A29BFE' }} />
          </div>
          <div>
            <p className="font-orbitron text-sm font-bold" style={{ color: '#E0EFFF' }}>分身深度对话</p>
            <p className="text-xs font-noto" style={{ color: 'rgba(224,239,255,0.4)' }}>已完成 {answered}/{DEEP_QUESTIONS.length} 题</p>
          </div>
        </div>
        <button
          onClick={handleSaveExit}
          className="px-3 py-1.5 rounded-xl text-xs font-noto font-semibold cursor-pointer whitespace-nowrap"
          style={{ background: 'rgba(108,92,231,0.2)', border: '1px solid rgba(108,92,231,0.35)', color: '#C4BBFF' }}
        >
          保存退出
        </button>
      </div>

      {/* Progress */}
      <div className="px-4 mb-3 shrink-0">
        <div className="h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{ width: `${progress}%`, background: 'linear-gradient(90deg,#6C5CE7,#A29BFE)' }}
          />
        </div>
        <p className="text-xs font-noto mt-1" style={{ color: 'rgba(224,239,255,0.3)' }}>深度了解 {progress}%</p>
      </div>

      {/* Chat area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 pb-4">
        {!started ? (
          <div className="flex flex-col items-center justify-center h-full gap-6 pb-8">
            <div className="w-20 h-20 flex items-center justify-center rounded-full" style={{ background: 'rgba(108,92,231,0.15)', border: '1px solid rgba(108,92,231,0.3)' }}>
              <i className="ri-robot-line text-4xl" style={{ color: '#A29BFE' }} />
            </div>
            <div className="text-center">
              <p className="font-orbitron text-base font-bold mb-2" style={{ color: '#E0EFFF' }}>分身深度对话</p>
              <p className="text-sm font-noto leading-relaxed" style={{ color: 'rgba(224,239,255,0.55)' }}>
                我会以对话的方式向你提问，帮助分身真正了解你的内心。
                {answered > 0 && `\n\n你已完成 ${answered} 题，继续从上次中断处开始。`}
              </p>
            </div>
            <div className="flex gap-2 flex-wrap justify-center">
              {['灵魂追问', '16 个问题', '随时退出', '支持语音'].map((tag) => (
                <span key={tag} className="px-3 py-1.5 rounded-full text-xs font-noto"
                  style={{ background: 'rgba(108,92,231,0.15)', border: '1px solid rgba(108,92,231,0.25)', color: '#C4BBFF' }}>
                  {tag}
                </span>
              ))}
            </div>
            <button
              onClick={startChat}
              className="px-8 py-4 rounded-2xl font-orbitron text-sm font-bold cursor-pointer whitespace-nowrap transition-all duration-200 active:scale-95"
              style={{
                background: 'linear-gradient(135deg,rgba(108,92,231,0.7),rgba(162,155,254,0.5))',
                border: '1px solid rgba(108,92,231,0.5)',
                color: '#E0EFFF',
                boxShadow: '0 0 20px rgba(108,92,231,0.3)',
              }}
            >
              {answered > 0 ? '继续对话' : '开始对话'}
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-3 pt-2">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} flex-col gap-2`}>
                {msg.role === 'ai' && (
                  <div className="flex items-start gap-2.5">
                    <div className="w-7 h-7 flex items-center justify-center rounded-full shrink-0 mt-0.5"
                      style={{ background: 'rgba(108,92,231,0.25)', border: '1px solid rgba(108,92,231,0.4)' }}>
                      <i className="ri-robot-line" style={{ color: '#A29BFE', fontSize: '12px' }} />
                    </div>
                    <div className="flex flex-col gap-2 flex-1">
                      <div className="px-4 py-3 rounded-2xl rounded-tl-none max-w-xs"
                        style={{ background: 'rgba(108,92,231,0.15)', border: '1px solid rgba(108,92,231,0.25)' }}>
                        <p className="text-sm font-noto leading-relaxed whitespace-pre-line" style={{ color: 'rgba(224,239,255,0.85)' }}>
                          {msg.text}
                        </p>
                      </div>
                      {/* Quick choice options */}
                      {msg.options && msg.questionIndex !== undefined && !(msg.questionIndex in tags) && (
                        <div className="flex flex-wrap gap-1.5">
                          {msg.options.map((opt) => (
                            <button
                              key={opt}
                              onClick={() => handleAnswer(opt, msg.questionIndex!)}
                              className="px-3 py-1.5 rounded-full text-xs font-noto cursor-pointer transition-all duration-150 active:scale-95 whitespace-nowrap"
                              style={{
                                background: 'rgba(255,255,255,0.06)',
                                border: '1px solid rgba(255,255,255,0.12)',
                                color: 'rgba(224,239,255,0.65)',
                              }}
                            >
                              {opt}
                            </button>
                          ))}
                        </div>
                      )}
                      {/* Answered badge */}
                      {msg.questionIndex !== undefined && (msg.questionIndex in tags) && (
                        <div className="flex items-center gap-1.5">
                          <i className="ri-checkbox-circle-line text-xs" style={{ color: '#00D1FF' }} />
                          <span className="text-xs font-noto" style={{ color: '#00D1FF' }}>已记录：{tags[msg.questionIndex]}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                {msg.role === 'user' && (
                  <div className="flex justify-end">
                    <div className="px-4 py-3 rounded-2xl rounded-tr-none max-w-xs"
                      style={{ background: 'rgba(0,209,255,0.15)', border: '1px solid rgba(0,209,255,0.25)' }}>
                      <p className="text-sm font-noto leading-relaxed" style={{ color: 'rgba(224,239,255,0.9)' }}>
                        {msg.text}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {isTyping && (
              <div className="flex items-start gap-2.5">
                <div className="w-7 h-7 flex items-center justify-center rounded-full shrink-0"
                  style={{ background: 'rgba(108,92,231,0.25)', border: '1px solid rgba(108,92,231,0.4)' }}>
                  <i className="ri-robot-line" style={{ color: '#A29BFE', fontSize: '12px' }} />
                </div>
                <div className="px-4 py-3 rounded-2xl rounded-tl-none" style={{ background: 'rgba(108,92,231,0.15)', border: '1px solid rgba(108,92,231,0.25)' }}>
                  <div className="flex gap-1 items-center h-4">
                    {[0, 1, 2].map((i) => (
                      <div key={i} className="w-1.5 h-1.5 rounded-full animate-bounce"
                        style={{ background: '#A29BFE', animationDelay: `${i * 0.15}s` }} />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Input area */}
      {started && (
        <div className="px-4 pb-8 pt-3 shrink-0" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
          <div className="flex gap-2 items-center">
            <button
              onClick={handleVoice}
              className="w-11 h-11 flex items-center justify-center rounded-xl cursor-pointer transition-all duration-200"
              style={{
                background: voiceActive ? 'rgba(108,92,231,0.4)' : 'rgba(255,255,255,0.07)',
                border: voiceActive ? '1px solid rgba(108,92,231,0.6)' : '1px solid rgba(255,255,255,0.1)',
              }}
            >
              <i className={voiceActive ? 'ri-mic-fill' : 'ri-mic-line'}
                style={{ color: voiceActive ? '#A29BFE' : 'rgba(224,239,255,0.5)', fontSize: '18px' }} />
            </button>
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleSend(); }}
              placeholder="输入你的回答…"
              className="flex-1 px-4 py-3 rounded-xl text-sm font-noto outline-none"
              style={{
                background: 'rgba(255,255,255,0.07)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: '#E0EFFF',
              }}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim()}
              className="w-11 h-11 flex items-center justify-center rounded-xl cursor-pointer transition-all duration-150"
              style={{
                background: input.trim() ? 'linear-gradient(135deg,rgba(108,92,231,0.7),rgba(0,209,255,0.5))' : 'rgba(255,255,255,0.07)',
                border: input.trim() ? '1px solid rgba(108,92,231,0.5)' : '1px solid rgba(255,255,255,0.1)',
              }}
            >
              <i className="ri-send-plane-line" style={{ color: input.trim() ? '#E0EFFF' : 'rgba(224,239,255,0.3)', fontSize: '18px' }} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
