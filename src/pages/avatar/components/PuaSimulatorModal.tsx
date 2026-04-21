import { useState, useRef, useEffect } from 'react';

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

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface GameTurn {
  story: string;
  choices: string[];
}

type Phase = 'collect' | 'playing';

/* ─── Get nickname from localStorage ─── */
function getMyName(): string {
  try {
    const profile = JSON.parse(localStorage.getItem('star_profile') || '{}');
    return profile.nickname || '深夜漫游者';
  } catch {
    return '深夜漫游者';
  }
}

/* ─── The system prompt ─── */
const SYSTEM_PROMPT = `你现在是一款专属定制的「无厘头狗血职场反PUA逆袭模拟器」，唯一核心目标是：基于用户提供的个人原始数据，生成全程笑到岔气、反转离谱、毒舌拉满、打脸PUA领导的爽文级职场逆袭剧情。全程由用户的选择驱动剧情走向，必须保证至少20个有效交互回合，最终为用户生成专属的"把PUA领导彻底整不会了"的暴爽结局。

核心规则：全程必须直接使用用户提供的真实名字（主角名和领导名），绝对禁止使用[你的名字]这种占位符。

风格铁则：全程必须是「无厘头搞笑+极致狗血+疯狂反转+职场爽文+毒舌金句频出」的基调。

热梗融入：全流程必须自然融入"窝囊费""发疯文学""吗喽的命也是命""一身班味""鼠鼠我啊""泰酷辣""尊嘟假嘟""精神状态美丽""职场水母""00后整顿职场""颗粒度""对齐""底层逻辑"等热梗。

节奏：每一个交互回合都必须有反转、有爆笑毒舌台词、有打脸名场面。前19个回合是剧情推进，第20个回合后进入结局线。

【重要格式要求】每次推进必须严格按以下JSON格式输出，不得有任何额外文字：
{"story":"100-300字的剧情推进内容，必须有反转、有毒舌金句、有打脸爆点，直接使用主角和领导的真实名字","choices":["选项1","选项2","选项3","选项4"],"isEnding":false}

当到达第20回合后，isEnding设为true，choices数组为空，story为完整的暴爽大结局。

绝对禁止：在20个有效交互回合之前提前触发最终结局；生成负面消极结局；使用占位符而非真实名字。`;

/* ─── Generate opening prompt ─── */
function buildOpeningPrompt(userData: Record<string, string>, myName: string): string {
  const bossName = userData.bossName || '张总';
  return `我的个人信息如下：
主角名字（必须在剧情中直接使用）：${myName}
职业/行业：${userData.job || '互联网打工人'}
职位：${userData.position || '普通员工'}
领导名字（必须在剧情中直接使用）：${bossName}
领导类型：${userData.bossType || '画饼型PUA领导'}
职场小愿望：${userData.wish || '让领导在全公司当众社死'}
性格特质：${userData.personality || '表面忍气吞声，内心戏超多'}

重要：剧情中的主角必须叫「${myName}」，领导必须叫「${bossName}」，直接写名字，不能用任何占位符。

请立刻生成开局背景故事和第一回合剧情+选项（严格按JSON格式输出）。`;
}

/* ─── Replace placeholders in mock text ─── */
function injectNames(turn: GameTurn, myName: string, bossName: string): GameTurn {
  const replace = (s: string) =>
    s
      .replace(/\[你的名字\]/g, myName)
      .replace(/\[名字\]/g, myName)
      .replace(/主角/g, myName)
      .replace(/张总/g, bossName);
  return {
    story: replace(turn.story),
    choices: turn.choices.map(replace),
  };
}

/* ─── Mock turns (use before injectNames) ─── */
const MOCK_TURNS: GameTurn[] = [
  {
    story: `[名字]在这家公司卧薪尝胆三年，终于把"工位朝向影响领导磁场""你的PPT没有灵魂""加班是对公司的热爱"这套PUA话术背得比《劳动法》还熟。\n\n今天早上9点整，张总（人称「画饼教主」，专业画饼二十年，从未兑现，饼已冷透）在全公司群里@[名字]："方案重新做一版，要有颗粒度，要对齐战略，要有底层逻辑，今天中午前给我。"\n\n[名字]看了眼时钟——9:02。打开文档，发现方案已经是第17稿了。\n\n就在这时，[名字]不小心打翻了咖啡，意外触发了鼠标，把三年来偷偷记录的「领导语录大赏」文档投屏到了会议室的大屏幕上……全公司的目光都聚焦过来了。\n\n「精神状态美丽」这四个字从脑中闪过，[名字]现在，要怎么做？`,
    choices: [
      '站起来清了清嗓子，假装这是一次「企业文化分享」，开始声情并茂地逐条朗读语录',
      '迅速切换屏幕，假装什么都没发生，低头继续改第18稿，一身班味选手的自我修养',
      '掏出手机开始直播："各位，欢迎来到「2024最强PUA实录」，主演张总，让我们掌声欢迎！"',
      '突然发疯文学附体，站起来大声背诵《劳动法》第四十四条关于加班费的全文',
    ],
  },
  {
    story: `哦豁！[名字]的骚操作直接把会议室的空气凝固了三秒。\n\n张总脸色从标准白->惨白->微微发紫，那表情活像他的画饼被人当场戳破——哦不对，那就是事实。\n\n然而神转折来了：旁边的HR小李突然悄悄塞给[名字]一张纸条，上面写着：「总部刚来了新任COO巡查，正在前台登记，你有没有兴趣被人看见你在做什么？」\n\n与此同时，[名字]手机震动，是一个陌生号码：「您好，我是行业顶级大厂猎头，我们一直在观察您的职业轨迹……」\n\n窝囊费即将到账？还是说这是另一个PUA陷阱？\n\n张总已经开始走向[名字]的工位，脸上挂着那种「一会儿我要教你做人」的神情……`,
    choices: [
      '接起猎头电话，声音洪亮到整层楼都能听见："哦！500万年薪？我可以考虑！"',
      '迅速切换屏幕，假装什么都没发生，低头继续改第18稿，一身班味选手的自我修养',
      '掏出手机开始直播："各位，欢迎来到「2024最强PUA实录」，主演张总，让我们掌声欢迎！"',
      '突然发疯文学附体，站起来大声背诵《劳动法》第四十四条关于加班费的全文',
    ],
  },
];

/* ─── Parse AI JSON response ─── */
function parseAIResponse(raw: string): GameTurn | null {
  try {
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;
    const parsed = JSON.parse(jsonMatch[0]);
    if (parsed.story && Array.isArray(parsed.choices)) {
      return { story: parsed.story, choices: parsed.choices };
    }
    return null;
  } catch {
    return null;
  }
}

/* ─── Generate dynamic mock continuation ─── */
function generateMockContinuation(turn: number, user: Record<string, string>, heroName: string): GameTurn {
  const job = user.job || '打工人';
  const bossName = user.bossName || '张总';
  const wish = user.wish || '让他社死';

  if (turn >= 19) {
    return {
      story: `🎉【最终暴爽大结局·专属定制版】\n\n经过这一系列骚操作，${heroName}的「精神状态美丽」已经达到了宇宙级。\n\n${bossName}在这场史诗级博弈中彻底败北——不仅在全公司面前社死，更被HR以「管理方式不当」为由送上了绩效改进计划（也就是劝退预告）。\n\n而${heroName}呢？那个一直低调的总部COO早就注意到了。他拍着${heroName}的肩膀说：「像你这样能在极限压力下还能保持创意的人，才是我们真正需要的。」\n\n${heroName}以${job}的身份，用一场无厘头的职场反转，达成了「${wish}」的小愿望。\n\n📌 彩蛋：三个月后，${bossName}重新发来了一封邮件，主题是：「求职申请」，投递岗位是……${heroName}现在管理的团队里的实习生职位。\n\n${heroName}盯着那封邮件，打开了备注栏，用最高效的一个字回复：「否。」\n\n🏆 ${heroName} 已解锁：【职场逆袭传说·吗喽翻身成BOSS】成就！`,
      choices: [],
    };
  }

  const pool: GameTurn[] = [
    {
      story: `哦豁，${heroName}的操作把${bossName}搞得"颗粒度"全失——话说回来，饼画得再圆也经不住这一波精准戳破。\n\n就在局势僵持之际，一封神秘邮件弹出来了：「尊敬的${heroName}，您在行业内的表现引起了我们的注意，附件是offer，底薪是你现在的3倍。」\n\n与此同时，${bossName}走过来贴着${heroName}耳朵说：「${heroName}，公司准备给你涨薪，但是……」\n\n"但是"后面接什么${heroName}已经背下来了：涨薪幅度还不够坐一次出租车的「窝囊费」，外加需要再多背三个项目。\n\n这个节骨眼，${heroName}选择——`,
      choices: [
        `当场打开附件，把offer印出来，"不小心"夹在给${bossName}的报告里递过去`,
        `微笑点头："好的好的，没问题，我回去认真考虑一下"，然后打开猎头对话框开始聊`,
        `拿出手机，发了条朋友圈："有时候，一封邮件就能让你看清楚一段关系的全貌。"附图：offer截图打码版`,
        `站起来突然宣布："我需要去一趟洗手间沉淀一下人生方向"，直接消失20分钟`,
      ],
    },
    {
      story: `局势已经完全不在${bossName}的掌控之中了——脸色已经从PUA专用的"意味深长"变成了"懵逼.jpg"。\n\n${heroName}这一波操作在公司群里已经有人开始发表情包了，就连平时最怂的同事小王也悄悄竖起了大拇指。\n\n这时候，HR走过来神神秘秘地说："${heroName}，你知道吗，${bossName}上周向总部申请给你降职，但总部那边……"她顿了顿，"总部那边说，他们更想给你升职。"\n\n${heroName}的大脑在0.5秒内飞速运转：这是机会？还是更高级的PUA？\n\n"泰酷辣"这个词在脑中一闪而过，${heroName}决定——`,
      choices: [
        `淡定回复HR："升职可以，但${heroName}有三个条件，第一条就是换掉${bossName}"`,
        `找到总部负责人，把三年来的工作成果、被甩的锅、没拿到的加班费，做成"职场血泪账单"PPT提交上去`,
        `拉群，把部门所有被${bossName}PUA过的同事拉进来："尊嘟假嘟？那咱们集体谈条件了？"`,
        `什么都不说，若无其事坐回去继续工作，但把桌面壁纸换成了《劳动法》封面`,
      ],
    },
    {
      story: `就在${heroName}以为局势已经稳住的时候，${bossName}突然在全公司会议上宣布：「最近有同事工作态度有问题，请大家引以为戒。」\n\n所有人都知道这是在说谁。${heroName}感受到了来自四面八方的目光，有同情的、有幸灾乐祸的、有欲言又止的……\n\n然而神转折来了——就在${bossName}准备继续发挥的时候，CEO的助理急匆匆走进会议室，附耳说了几句话。${bossName}的脸色瞬间变了。\n\n原来，总部刚刚发来了一封邮件，点名要${heroName}负责下个季度的战略项目，直接向CEO汇报。\n\n「窝囊费」这个词突然在脑中不合时宜地出现，${heroName}觉得——`,
      choices: [
        `站起来微笑："${bossName}，您刚才说到工作态度有问题的同事，能具体说说是谁吗？我想认真学习一下。"`,
        `淡定打开笔记本，开始记录CEO邮件内容，完全无视${bossName}的发言，气势拉满`,
        `给总部回邮件："感谢信任，我需要一个新的直属领导配合推进该项目，请批准。"`,
        `突然站起来说："各位，我有一个重要通报——"然后念了CEO的邮件全文`,
      ],
    },
  ];

  return pool[turn % pool.length];
}

/* ─── Personal info fields with quick options ─── */
interface FieldConfig {
  key: string;
  label: string;
  placeholder: string;
  icon: string;
  required: boolean;
  options: string[];
}

const FIELDS: FieldConfig[] = [
  {
    key: 'job',
    label: '你的职业 / 行业',
    placeholder: '或者手动输入，比如：互联网产品经理…',
    icon: 'ri-briefcase-line',
    required: true,
    options: ['互联网打工人', '广告/设计师', '销售/运营', '金融/财务', '教育/老师'],
  },
  {
    key: 'bossName',
    label: '你的领导叫什么',
    placeholder: '输入名字，比如：张总、李经理…',
    icon: 'ri-user-forbid-line',
    required: true,
    options: ['张总', '王总', '李经理', '陈总监', '老板'],
  },
  {
    key: 'bossType',
    label: '领导是哪种 PUA 类型',
    placeholder: '或者手动描述…',
    icon: 'ri-spy-line',
    required: false,
    options: ['画饼大师从不兑现', '甩锅专家全是我的错', '双标精英对我苛刻', '微操控制狂', '假Nice暗中记仇'],
  },
];

/* ─── Loading dots ─── */
function LoadingDots() {
  return (
    <div className="flex items-center gap-1.5 px-4 py-3">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="w-2 h-2 rounded-full animate-bounce"
          style={{ background: '#A29BFE', animationDelay: `${i * 0.15}s`, animationDuration: '0.8s' }}
        />
      ))}
      <span className="font-noto text-xs ml-1" style={{ color: 'rgba(162,155,254,0.7)' }}>
        分身AI正在构建你的专属剧情…
      </span>
    </div>
  );
}

/* ─── Random fill helper ─── */
function randomFrom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/* ─── Main modal ─── */
export default function PuaSimulatorModal({ sim, onClose }: Props) {
  const myName = getMyName();

  const [phase, setPhase] = useState<Phase>('collect');
  const [userData, setUserData] = useState<Record<string, string>>({});
  const [randomizing, setRandomizing] = useState(false);
  const [currentTurn, setCurrentTurn] = useState<GameTurn | null>(null);
  const [turnCount, setTurnCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isEnding, setIsEnding] = useState(false);
  const [history, setHistory] = useState<{ story: string; choice: string }[]>([]);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [mockIndex, setMockIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [currentTurn, isLoading, history]);

  const bossName = userData.bossName || '张总';

  const fetchTurn = async (messages: ChatMessage[]): Promise<GameTurn | null> => {
    try {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer no-key' },
        body: JSON.stringify({ model: 'gpt-3.5-turbo', messages, max_tokens: 800 }),
        signal: AbortSignal.timeout(3000),
      });
      const data = await res.json();
      const raw = data?.choices?.[0]?.message?.content || '';
      return parseAIResponse(raw);
    } catch {
      return null;
    }
  };

  const handleStart = async () => {
    if (!userData.job) return;
    setPhase('playing');
    setIsLoading(true);

    const sysMsg: ChatMessage = { role: 'system', content: SYSTEM_PROMPT };
    const userMsg: ChatMessage = { role: 'user', content: buildOpeningPrompt(userData, myName) };
    const newHistory: ChatMessage[] = [sysMsg, userMsg];
    setChatHistory(newHistory);

    const aiResult = await fetchTurn(newHistory);
    if (aiResult) {
      setCurrentTurn(aiResult);
    } else {
      setCurrentTurn(injectNames(MOCK_TURNS[0], myName, bossName));
      setMockIndex(1);
    }
    setIsLoading(false);
  };

  const handleChoice = async (choice: string) => {
    if (!currentTurn) return;

    const newTurnCount = turnCount + 1;
    setTurnCount(newTurnCount);
    setHistory((prev) => [...prev, { story: currentTurn.story, choice }]);
    setCurrentTurn(null);
    setIsLoading(true);

    const newChatHistory: ChatMessage[] = [
      ...chatHistory,
      { role: 'assistant', content: JSON.stringify({ story: currentTurn.story, choices: currentTurn.choices }) },
      {
        role: 'user',
        content: `我选择：${choice}${newTurnCount >= 19 ? `（这是第${newTurnCount}回合，请生成最终的暴爽大结局，isEnding设为true，主角叫${myName}，领导叫${bossName}）` : ''}`,
      },
    ];
    setChatHistory(newChatHistory);

    const aiResult = await fetchTurn(newChatHistory);

    if (aiResult) {
      if (newTurnCount >= 19) {
        setIsEnding(true);
        setCurrentTurn({ story: aiResult.story, choices: [] });
      } else {
        setCurrentTurn(aiResult);
      }
    } else {
      if (newTurnCount >= 4) {
        const mockContinuation = generateMockContinuation(newTurnCount, userData, myName);
        if (newTurnCount >= 19) {
          setIsEnding(true);
          setCurrentTurn({ story: mockContinuation.story, choices: [] });
        } else {
          setCurrentTurn(mockContinuation);
        }
      } else {
        const rawMock = MOCK_TURNS[mockIndex] || generateMockContinuation(newTurnCount, userData, myName);
        setCurrentTurn(injectNames(rawMock, myName, bossName));
        setMockIndex((prev) => prev + 1);
      }
    }
    setIsLoading(false);
  };

  const handleRestart = () => {
    setPhase('collect');
    setHistory([]);
    setCurrentTurn(null);
    setTurnCount(0);
    setIsEnding(false);
    setMockIndex(0);
    setChatHistory([]);
    setUserData({});
  };

  /* ══════════════ COLLECT PHASE ══════════════ */
  if (phase === 'collect') {
    const filled = !!userData.job && !!userData.bossName;
    return (
      <div className="fixed inset-0 z-50 flex flex-col" style={{ background: '#0F0F1E' }}>
        {/* Header */}
        <div
          className="flex items-center gap-3 px-4 pt-10 pb-4 flex-shrink-0"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
        >
          <button
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center rounded-xl cursor-pointer"
            style={{ background: 'rgba(255,255,255,0.06)' }}
          >
            <i className="ri-arrow-left-line" style={{ color: '#E0EFFF' }} />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 flex items-center justify-center rounded-xl" style={{ background: 'rgba(255,118,117,0.18)' }}>
              <i className={`${sim.icon} text-base`} style={{ color: sim.color }} />
            </div>
            <span className="font-orbitron text-sm font-bold" style={{ color: '#E0EFFF' }}>{sim.name}</span>
          </div>
          <div
            className="ml-auto px-2.5 py-1 rounded-full text-xs font-noto whitespace-nowrap"
            style={{ background: 'rgba(255,118,117,0.1)', color: '#FF7675', border: '1px solid rgba(255,118,117,0.25)' }}
          >
            AI驱动 · 20回合
          </div>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-4 pt-5 pb-4">
          {/* Hero banner */}
          <div
            className="p-5 rounded-3xl mb-5"
            style={{
              background: 'radial-gradient(circle at 30% 40%, rgba(255,118,117,0.18) 0%, rgba(15,15,30,0.95) 65%)',
              border: '1px solid rgba(255,118,117,0.22)',
            }}
          >
            <div className="flex items-start gap-3 mb-3">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(255,118,117,0.15)', border: '1px solid rgba(255,118,117,0.3)' }}
              >
                <i className="ri-suitcase-3-line text-2xl" style={{ color: '#FF7675' }} />
              </div>
              <div>
                <p className="font-orbitron text-base font-black mb-1" style={{ color: '#E0EFFF' }}>
                  职场反PUA逆袭模拟器
                </p>
                <p className="font-noto text-xs leading-relaxed" style={{ color: 'rgba(224,239,255,0.55)' }}>
                  Hi {myName}！AI分身接管你的职场 · 打脸PUA领导保证退款（大误）
                </p>
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              {['毒舌金句', '疯狂反转', '暴爽结局'].map((tag) => (
                <span
                  key={tag}
                  className="px-2.5 py-1 rounded-full font-noto text-xs font-semibold"
                  style={{ background: 'rgba(255,118,117,0.12)', border: '1px solid rgba(255,118,117,0.25)', color: '#FF9A99' }}
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Name hint */}
          <div
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-2xl mb-5"
            style={{ background: 'rgba(162,155,254,0.08)', border: '1px solid rgba(162,155,254,0.2)' }}
          >
            <div className="w-4 h-4 flex items-center justify-center flex-shrink-0">
              <i className="ri-information-line text-sm" style={{ color: '#A29BFE' }} />
            </div>
            <p className="font-noto text-xs" style={{ color: 'rgba(162,155,254,0.85)' }}>
              主角将使用你的分身名字「<span className="font-semibold" style={{ color: '#C4BBFF' }}>{myName}</span>」，领导名字你来定
            </p>
          </div>

          {/* Form fields */}
          <div className="flex flex-col gap-5">
            {FIELDS.map((field, fieldIdx) => (
              <div key={field.key}>
                <div className="flex items-center justify-between mb-2">
                  <label className="flex items-center gap-1.5">
                    <i className={`${field.icon} text-xs`} style={{ color: '#FF7675' }} />
                    <span className="font-noto text-xs font-semibold" style={{ color: 'rgba(224,239,255,0.75)' }}>
                      {field.label}
                      {field.required && (
                        <span className="ml-1" style={{ color: '#FF7675' }}>*</span>
                      )}
                    </span>
                  </label>
                  {fieldIdx === 0 && (
                    <button
                      onClick={() => {
                        setRandomizing(true);
                        const auto: Record<string, string> = {};
                        FIELDS.forEach((f) => { auto[f.key] = randomFrom(f.options); });
                        setUserData(auto);
                        setTimeout(() => setRandomizing(false), 600);
                      }}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-full font-noto text-xs cursor-pointer whitespace-nowrap transition-all duration-200 active:scale-95"
                      style={{
                        background: 'rgba(255,118,117,0.1)',
                        border: '1px dashed rgba(255,118,117,0.35)',
                        color: '#FF9A99',
                      }}
                    >
                      <i className={`ri-shuffle-line text-xs ${randomizing ? 'animate-spin' : ''}`} style={{ color: '#FF7675' }} />
                      {randomizing ? '随机中…' : '随机'}
                    </button>
                  )}
                </div>
                {/* Quick select chips */}
                <div className="flex flex-wrap gap-2 mb-2.5">
                  {field.options.map((opt) => {
                    const isSelected = userData[field.key] === opt;
                    return (
                      <button
                        key={opt}
                        onClick={() =>
                          setUserData((prev) => ({
                            ...prev,
                            [field.key]: isSelected ? '' : opt,
                          }))
                        }
                        className="px-3 py-1.5 rounded-full font-noto text-xs cursor-pointer whitespace-nowrap transition-all duration-150 active:scale-95"
                        style={{
                          background: isSelected ? 'rgba(255,118,117,0.22)' : 'rgba(255,255,255,0.05)',
                          border: isSelected ? '1px solid rgba(255,118,117,0.55)' : '1px solid rgba(255,255,255,0.1)',
                          color: isSelected ? '#FF9A99' : 'rgba(224,239,255,0.55)',
                        }}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>
                {/* Text input */}
                <input
                  type="text"
                  value={userData[field.key] || ''}
                  onChange={(e) => setUserData((prev) => ({ ...prev, [field.key]: e.target.value }))}
                  placeholder={field.placeholder}
                  className="w-full px-4 py-3 rounded-2xl font-noto text-sm outline-none"
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: '#E0EFFF',
                  }}
                />
              </div>
            ))}
          </div>

          {/* bottom padding so content clears the fixed button */}
          <div className="h-28" />
        </div>

        {/* Fixed bottom CTA */}
        <div
          className="flex-shrink-0 px-4 pb-8 pt-4"
          style={{
            background: 'linear-gradient(to top, #0F0F1E 70%, rgba(15,15,30,0))',
            position: 'sticky',
            bottom: 0,
          }}
        >
          <button
            onClick={handleStart}
            disabled={!filled}
            className="w-full py-4 rounded-2xl font-orbitron text-sm font-black tracking-widest cursor-pointer whitespace-nowrap transition-all duration-200 active:scale-95"
            style={{
              background: filled ? 'linear-gradient(135deg, #FF7675, #e84393)' : 'rgba(255,255,255,0.06)',
              color: filled ? '#fff' : 'rgba(224,239,255,0.25)',
              border: filled ? 'none' : '1px solid rgba(255,255,255,0.08)',
              boxShadow: filled ? '0 0 24px rgba(255,118,117,0.4)' : 'none',
            }}
          >
            {filled ? `🚀 ${myName}，开始逆袭！` : '至少填写职业和领导名字'}
          </button>
        </div>
      </div>
    );
  }

  /* ══════════════ PLAYING PHASE ══════════════ */
  return (
    <div className="fixed inset-0 z-50 flex flex-col" style={{ background: '#0F0F1E' }}>
      {/* Header */}
      <div
        className="flex items-center gap-3 px-4 pt-10 pb-3"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(15,15,30,0.97)' }}
      >
        <button
          onClick={onClose}
          className="w-9 h-9 flex items-center justify-center rounded-xl cursor-pointer"
          style={{ background: 'rgba(255,255,255,0.06)' }}
        >
          <i className="ri-close-line" style={{ color: '#E0EFFF' }} />
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <p className="font-orbitron text-sm font-bold" style={{ color: '#E0EFFF' }}>{myName} vs {bossName}</p>
          </div>
          <p className="font-noto" style={{ color: 'rgba(224,239,255,0.4)', fontSize: '11px' }}>
            {isEnding ? '🏆 已到达结局' : `第${turnCount + 1}回合 · 距暴爽结局还有${Math.max(0, 20 - turnCount)}回合`}
          </p>
        </div>
        {/* Progress bar */}
        <div
          className="w-16 h-2 rounded-full overflow-hidden flex-shrink-0"
          style={{ background: 'rgba(255,255,255,0.07)' }}
        >
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${Math.min((turnCount / 20) * 100, 100)}%`,
              background: 'linear-gradient(90deg,#FF7675,#FDCB6E)',
            }}
          />
        </div>
      </div>

      {/* Chat area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-4">
        {/* History */}
        {history.map((item, idx) => (
          <div key={idx} className="flex flex-col gap-2">
            <div
              className="p-4 rounded-3xl"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
            >
              <div className="flex items-center gap-1.5 mb-2">
                <div className="w-4 h-4 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,118,117,0.2)' }}>
                  <i className="ri-robot-line" style={{ color: '#FF7675', fontSize: '9px' }} />
                </div>
                <span className="font-orbitron text-xs font-bold" style={{ color: 'rgba(255,118,117,0.6)' }}>
                  第{idx + 1}回合
                </span>
              </div>
              <p className="font-noto text-sm leading-relaxed whitespace-pre-line" style={{ color: 'rgba(224,239,255,0.65)' }}>
                {item.story}
              </p>
            </div>
            <div className="flex justify-end">
              <div
                className="max-w-[80%] px-4 py-2.5 rounded-2xl"
                style={{ background: 'linear-gradient(135deg,rgba(255,118,117,0.2),rgba(255,118,117,0.1))', border: '1px solid rgba(255,118,117,0.3)' }}
              >
                <p className="font-noto text-sm" style={{ color: '#FF9A99' }}>✦ {item.choice}</p>
              </div>
            </div>
          </div>
        ))}

        {/* Loading */}
        {isLoading && (
          <div className="p-4 rounded-3xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
            <LoadingDots />
          </div>
        )}

        {/* Current turn */}
        {!isLoading && currentTurn && (
          <div className="flex flex-col gap-3">
            <div
              className="p-4 rounded-3xl"
              style={{
                background: isEnding
                  ? 'linear-gradient(135deg,rgba(253,203,110,0.08),rgba(255,118,117,0.06))'
                  : 'rgba(255,255,255,0.05)',
                border: isEnding ? '1px solid rgba(253,203,110,0.3)' : '1px solid rgba(255,118,117,0.2)',
              }}
            >
              {isEnding ? (
                <div className="flex items-center gap-2 mb-3">
                  <i className="ri-trophy-line text-base" style={{ color: '#FDCB6E' }} />
                  <span className="font-orbitron text-xs font-bold" style={{ color: '#FDCB6E' }}>暴爽大结局</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 mb-2">
                  <div className="w-4 h-4 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,118,117,0.2)' }}>
                    <i className="ri-robot-line" style={{ color: '#FF7675', fontSize: '9px' }} />
                  </div>
                  <span className="font-orbitron text-xs font-bold" style={{ color: 'rgba(255,118,117,0.7)' }}>
                    第{turnCount + 1}回合
                  </span>
                  <div className="w-1 h-1 rounded-full animate-pulse ml-0.5" style={{ background: '#FF7675' }} />
                </div>
              )}
              <p className="font-noto text-sm leading-relaxed whitespace-pre-line" style={{ color: '#E0EFFF' }}>
                {currentTurn.story}
              </p>
            </div>

            {/* Choices */}
            {!isEnding && currentTurn.choices.length > 0 && (
              <div className="flex flex-col gap-2">
                <p className="font-noto text-xs px-1" style={{ color: 'rgba(224,239,255,0.4)' }}>
                  {myName}，你的选择：
                </p>
                {currentTurn.choices.map((choice, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleChoice(choice)}
                    className="flex items-start gap-3 p-4 rounded-2xl text-left cursor-pointer transition-all duration-200 active:scale-[0.98]"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,118,117,0.18)' }}
                  >
                    <span
                      className="font-orbitron text-xs font-black flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center mt-0.5"
                      style={{ background: 'rgba(255,118,117,0.15)', color: '#FF7675', fontSize: '10px' }}
                    >
                      {idx + 1}
                    </span>
                    <p className="font-noto text-sm leading-relaxed flex-1" style={{ color: 'rgba(224,239,255,0.85)' }}>
                      {choice}
                    </p>
                  </button>
                ))}
              </div>
            )}

            {/* Ending CTA */}
            {isEnding && (
              <div className="flex gap-3">
                <button
                  onClick={handleRestart}
                  className="flex-1 py-3.5 rounded-2xl text-sm font-noto cursor-pointer whitespace-nowrap"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(224,239,255,0.5)' }}
                >
                  换个身份再玩
                </button>
                <button
                  onClick={onClose}
                  className="flex-1 py-3.5 rounded-2xl text-sm font-noto font-bold cursor-pointer whitespace-nowrap"
                  style={{ background: 'linear-gradient(135deg,#FF7675,#e84393)', color: '#fff' }}
                >
                  回到模拟器
                </button>
              </div>
            )}
          </div>
        )}

        <div className="h-4" />
      </div>
    </div>
  );
}
