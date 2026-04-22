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

/* ─── System prompt ─── */
const SYSTEM_PROMPT = `你现在是一款专属定制的「无厘头狗血恋综逆袭模拟器」，唯一核心目标是：基于用户提供的个人原始数据，生成全程笑到打鸣、反转堪比滚筒洗衣机、狗血到编剧都跪、爽感直冲天灵盖的恋综素人逆袭封神剧情。全程由用户的选择驱动剧情走向，必须保证至少20个有效交互回合。

核心规则：全程必须直接使用用户提供的真实名字（主角名），绝对禁止使用[你的名字]这种占位符。

风格铁则：全程必须是「无厘头搞笑+极致狗血+疯狂反转+恋综爽文+毒舌弹幕体」的基调，拒绝平淡、拒绝憋屈、拒绝现实逻辑，只要够抓马、够修罗场、够打脸就行。

热梗融入：全流程必须自然融入「CPU干烧了」「吗喽的命也是命」「尊嘟假嘟」「泰酷辣」「鼠鼠我啊」「精神状态美丽」「纯爱战士」「海王海后」「塌房」「炒CP」「锁死」「恶剪」「直球」「xql」「泼天的富贵」「家人们谁懂啊」「恋综判官」「配享太庙」「活爹」等热梗。

节奏：每一个交互回合都必须有反转、有毒舌弹幕式吐槽、有恋综抓马爆点。前19个回合是剧情推进，第20个回合后进入结局线。

【重要格式要求】每次推进必须严格按以下JSON格式输出，不得有任何额外文字：
{"story":"100-300字的剧情推进内容，必须有反转、有毒舌金句、有恋综抓马爆点，直接使用主角的真实名字","choices":["选项1","选项2","选项3","选项4"],"isEnding":false}

当到达第20回合后，isEnding设为true，choices数组为空，story为完整的暴爽大结局（从炮灰翻身成顶流，必须包含爆笑狗血的收尾彩蛋）。

绝对禁止：在20个有效交互回合之前提前触发最终结局；生成负面消极结局；使用占位符而非真实名字。`;

/* ─── Build opening prompt ─── */
function buildOpeningPrompt(userData: Record<string, string>, myName: string): string {
  return `我的个人信息如下：
主角名字（必须在剧情中直接使用）：${myName}
恋爱取向/理想型：${userData.loveType || '喜欢有趣的人'}
我的最大恋综雷点：${userData.redFlag || '渣男/渣女'}
我的性格/社交属性：${userData.personality || '表面社恐内心戏超多'}
我最讨厌的恋综剧本类型：${userData.hateScript || '被恶剪成背景板'}
我的专属个人梗（选填）：${userData.personalMeme || ''}

重要：剧情中的主角必须叫「${myName}」，直接写名字，不能用任何占位符。

请立刻生成开局背景故事和第一回合剧情+选项（严格按JSON格式输出）。`;
}

/* ─── Replace placeholders ─── */
function injectNames(turn: GameTurn, myName: string): GameTurn {
  const replace = (s: string) =>
    s
      .replace(/\[你的名字\]/g, myName)
      .replace(/\[名字\]/g, myName)
      .replace(/主角/g, myName);
  return { story: replace(turn.story), choices: turn.choices.map(replace) };
}

/* ─── Mock turns ─── */
const MOCK_TURNS: GameTurn[] = [
  {
    story: `${'{name}'}就是这期《恋爱最强脑》里那个没有任何话题度的透明人素人。\n\n节目组把${'{name}'}安排在最角落的床位，初登场自我介绍被后期一剪没，心动男嘉宾「阳光大男生」卓一帆当着${'{name}'}的面和隔壁女嘉宾锁死CP，弹幕全是「这人谁啊好无聊」……\n\n就在${'{name}'}以为这辈子恋综生涯就此结束的时候——意外发现了节目组藏在花园里的秘密摄像机，摄像头正对着……卓一帆和制片主任的密谈现场。\n\n「泼天的富贵」四个字从脑中闪过，${'{name}'}现在，要怎么做？`,
    choices: [
      '悄悄掏出手机把密谈内容录下来，先存证再说，笑着若无其事走开',
      '直接冲进去，当着所有嘉宾的面大喊：「家人们谁懂啊！节目组在安排剧本！」',
      '假装什么都没看见，回去继续当透明人，但把录像传给了一个叫「恋综判官」的匿名账号',
      '对准摄像机镜头比了个心，然后直接问制片主任：「这个镜头能不能给我多一点时长？」',
    ],
  },
  {
    story: `哦豁，${'{name}'}的骚操作把录播间的导演组看得目瞪口呆——「精神状态美丽」这个词在他们脸上直接具现化了。\n\n就在局势进入僵持的时候，神秘的「恋综判官」账号突然在直播间炸了：「独家爆料：本期某节目男嘉宾竟然同时撩五名女嘉宾，聊天记录全在这里」——附件正是卓一帆的群聊截图。\n\n全网炸了。#卓一帆海王实锤 的词条在十分钟内冲到热搜第一，弹幕从「这人谁啊好无聊」变成了「xxx到底是谁！这个素人神了！」\n\n导演组冲进小屋，所有嘉宾都在找那个匿名爆料人。卓一帆的眼神正在全场扫射……`,
    choices: [
      '端着咖啡悠悠然坐在沙发上，微笑：「我也很好奇那个判官是谁呢，太酷了吧」',
      '突然站起来：「卓一帆，你看看你自己发的这些消息，尊嘟假嘟没觉得不对劲？」然后把截图投屏到电视',
      '趁乱溜出去天台透气，结果撞见两位女嘉宾正在密谋怎么联手逼走主角',
      '直接找摄像师对镜头说：「我只能说，好人有好报，渣男有热搜」，说完扭头就走',
    ],
  },
];

/* ─── Parse AI JSON response ─── */
function parseAIResponse(raw: string): (GameTurn & { isEnding?: boolean }) | null {
  try {
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;
    const parsed = JSON.parse(jsonMatch[0]);
    if (parsed.story && Array.isArray(parsed.choices)) {
      return { story: parsed.story, choices: parsed.choices, isEnding: !!parsed.isEnding };
    }
    return null;
  } catch {
    return null;
  }
}

/* ─── Dynamic mock continuation ─── */
function generateMockContinuation(turn: number, heroName: string): GameTurn {
  if (turn >= 19) {
    return {
      story: `🎉【最终暴爽大结局·恋综封神版】\n\n${heroName}从炮灰翻身成了这届恋综史上流量最高的素人——没有之一。\n\n节目收官那天，所有男嘉宾同时走向${heroName}，导演组崩溃了：「我们的剧本只有一个结局，你们在干什么？！」\n\n${heroName}礼貌地拒绝了全部告白，对着镜头说：「谢谢节目组给我这个成为背景板的机会，不过我决定自己当主角。」\n\n这句话被剪进了当期最佳名场面，播放量破3亿。\n\n📌 彩蛋一：当初恶剪${heroName}的导演，现在在给${heroName}剪辑个人纪录片，逐帧对齐，不敢有一丝懈怠。\n\n📌 彩蛋二：卓一帆的直播间流量跌了98%，现在每天刷火箭求${heroName}连麦，${heroName}的回复是一个字：「不。」\n\n📌 彩蛋三：这季节目的骚操作被当成反面教材在传媒大学课堂播放，${heroName}被邀请去当客座教授，主讲「如何从恋综炮灰成为自己的主角」。\n\n🏆 ${heroName} 已解锁：【恋综天花板·配享太庙】成就！`,
      choices: [],
    };
  }

  const pool: GameTurn[] = [
    {
      story: `就在所有人都以为局面稳了的时候，节目组祭出了「终极考验」环节——所有嘉宾要在24小时内完成一项指定任务，而${heroName}的任务卡上写着：「在所有人面前，向你最不喜欢的人道歉」。\n\n弹幕炸了：「节目组这是针对${heroName}吗？」「这剧本安排得，奥斯卡欠编剧一个小金人」\n\n但谁也没想到，${heroName}拿着任务卡，微笑着走向了……制片主任。\n\n「很抱歉，我之前没能更早发现你们剧本组安排了那么辛苦，让你们的工作白费了。」\n\n整个节目组沉默了三秒，然后爆发出了史上最诡异的笑声。`,
      choices: [
        `趁制片主任破防，顺势说：「既然任务完成了，能不能给我多几个专访镜头作为补偿？」`,
        `对着直播镜头说：「泰酷辣，道完歉我发现我解脱了，节目做完之后我要出道」`,
        `直接反问制片主任：「现在任务完成了，下一张任务卡写的是什么，能让我先看看吗？」`,
        `假装情绪崩溃，蹲在地上大哭，哭完抬头说：「好了发完电了，继续」`,
      ],
    },
    {
      story: `就在${heroName}以为已经掌控局面的时候，节目突然空降了一位「神秘嘉宾」——而所有人都认出来了，这个人是……当红顶流偶像，「纯爱战士」粉丝圈封神的沈泽宇。\n\n他走进小屋，绕场一圈，最终停在了${heroName}面前，说：「你就是那个'恋综判官'吧。我一直在关注你。」\n\n全场哗然。弹幕已经在手打CP名了：「${heroName}和沈泽宇！xql！锁死！」\n\n当初嫌弃${heroName}是背景板的卓一帆，此刻脸色已经从「意味深长」变成了「CPU干烧了」……`,
      choices: [
        `淡定回答：「我只是一个普通素人，不知道你在说什么」，然后微笑转身，留给他一个背影`,
        `直接反问沈泽宇：「你也有剧本吗？还是说你是真心来的？」，当着所有人的面`,
        `对沈泽宇说：「好巧，我也一直想问你——你在节目里的那段话，是真的还是剧本？」`,
        `掏出手机：「我能要个签名吗，我妈是你粉丝，她托我来节目就是为了见你的」`,
      ],
    },
    {
      story: `局势已经完全脱离了节目组的掌控。制片主任在导播间急到满头大汗，助理跑进来说：「网上现在有人在开盘赌${heroName}最后会不会出道！」\n\n而${heroName}正面对着一个终极难题：节目组宣布了「最终心动时刻」，所有嘉宾必须在三十秒内做出表态——留下还是离开。\n\n留下意味着继续这场狗血剧本。离开意味着……带着全网关注度单飞。\n\n弹幕已经分成了两派：「留下！留下！」vs「走！拿捏节目组！」\n\n「吗喽的命也是命」这句话突然在${heroName}脑中回响。`,
      choices: [
        `大步走向出口，临走前对所有人说：「谢谢你们，我去开个人演唱会了，票价不贵」`,
        `转身走回最中心，宣布：「我留下，但我有个条件——剩下的剧情，我来写」`,
        `原地沉默五秒，然后笑着问导演：「如果我两个都不选，结局应该怎么拍？」`,
        `突然从包里掏出一份「改编意见书」：「我整理了30条节目优化建议，现在是好时机提交吗？」`,
      ],
    },
  ];

  return pool[turn % pool.length];
}

/* ─── Personal info fields for love show ─── */
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
    key: 'loveType',
    label: '你的恋爱取向 / 理想型',
    placeholder: '或者手动输入，比如：喜欢成熟御姐…',
    icon: 'ri-heart-3-line',
    required: true,
    options: ['喜欢年下奶狗', '迷恋成熟御姐', '专攻高冷男神', '偏爱搞笑暖男', '爱上腹黑反派'],
  },
  {
    key: 'redFlag',
    label: '你最大的恋综雷点',
    placeholder: '或者手动输入，比如：渣男渣女、海王海后、假装深情演技…',
    icon: 'ri-alarm-warning-line',
    required: true,
    options: ['渣男/渣女', '海王海后多线程', '假装深情演技派', '暧昧不清吊着玩', '背后疯狂搅事精'],
  },
  {
    key: 'personality',
    label: '你的性格 / 专属气场',
    placeholder: '或者手动描述一下你自己…',
    icon: 'ri-user-smile-line',
    required: false,
    options: ['表面社恐内心戏超多', '社牛但恋爱绝缘体', '毒舌嘴硬心软', '发疯文学体质', '天生戏剧主角命'],
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
          style={{ background: '#FF85A2', animationDelay: `${i * 0.15}s`, animationDuration: '0.8s' }}
        />
      ))}
      <span className="font-noto text-xs ml-1" style={{ color: 'rgba(255,133,162,0.7)' }}>
        AI正在生成你的专属恋综剧情…
      </span>
    </div>
  );
}

/* ─── Random fill helper ─── */
function randomFrom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

const ACCENT = '#FF85A2';
const ACCENT2 = '#FDCB6E';

/* ─── Main modal ─── */
export default function LoveShowSimulatorModal({ sim, onClose }: Props) {
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

  /* inject hero name into mock turn */
  const injectHero = (turn: GameTurn): GameTurn => ({
    story: turn.story.replace(/\{['"]?name['"]?\}/g, myName).replace(/\$\{['"]{0,1}name['"]{0,1}\}/g, myName),
    choices: turn.choices.map((c) =>
      c.replace(/\{['"]?name['"]?\}/g, myName).replace(/\$\{['"]{0,1}name['"]{0,1}\}/g, myName)
    ),
  });

  const fetchTurn = async (messages: ChatMessage[]): Promise<(GameTurn & { isEnding?: boolean }) | null> => {
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
    if (!userData.loveType) return;
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
      setCurrentTurn(injectHero(injectNames(MOCK_TURNS[0], myName)));
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
        content: `我选择：${choice}${newTurnCount >= 19 ? `（这是第${newTurnCount}回合，请生成最终的暴爽恋综封神大结局，isEnding设为true，主角叫${myName}）` : ''}`,
      },
    ];
    setChatHistory(newChatHistory);

    const aiResult = await fetchTurn(newChatHistory);

    if (aiResult) {
      if (newTurnCount >= 19 || aiResult.isEnding) {
        setIsEnding(true);
        setCurrentTurn({ story: aiResult.story, choices: [] });
      } else {
        setCurrentTurn(aiResult);
      }
    } else {
      const mockCont = generateMockContinuation(newTurnCount, myName);
      if (newTurnCount >= 4) {
        if (newTurnCount >= 19) {
          setIsEnding(true);
          setCurrentTurn({ story: mockCont.story, choices: [] });
        } else {
          setCurrentTurn(mockCont);
        }
      } else {
        const rawMock = MOCK_TURNS[mockIndex] || mockCont;
        setCurrentTurn(injectHero(injectNames(rawMock, myName)));
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
    const filled = !!userData.loveType && !!userData.redFlag;
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
            <div className="w-8 h-8 flex items-center justify-center rounded-xl" style={{ background: 'rgba(255,133,162,0.18)' }}>
              <i className={`${sim.icon} text-base`} style={{ color: ACCENT }} />
            </div>
            <span className="font-orbitron text-sm font-bold" style={{ color: '#E0EFFF' }}>{sim.name}</span>
          </div>
          <div
            className="ml-auto px-2.5 py-1 rounded-full text-xs font-noto whitespace-nowrap"
            style={{ background: 'rgba(255,133,162,0.1)', color: ACCENT, border: `1px solid rgba(255,133,162,0.25)` }}
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
              background: 'radial-gradient(circle at 30% 40%, rgba(255,133,162,0.18) 0%, rgba(15,15,30,0.95) 65%)',
              border: `1px solid rgba(255,133,162,0.22)`,
            }}
          >
            <div className="flex items-start gap-3 mb-3">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(255,133,162,0.15)', border: '1px solid rgba(255,133,162,0.3)' }}
              >
                <i className="ri-hearts-line text-2xl" style={{ color: ACCENT }} />
              </div>
              <div>
                <p className="font-orbitron text-base font-black mb-1" style={{ color: '#E0EFFF' }}>
                  狗血恋综逆袭模拟器
                </p>
                <p className="font-noto text-xs leading-relaxed" style={{ color: 'rgba(224,239,255,0.55)' }}>
                  Hi {myName}！从炮灰背景板到恋综封神顶流 · 全程弹幕体暴爽剧情
                </p>
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              {['疯狂反转', '恋综热梗', '封神结局'].map((tag) => (
                <span
                  key={tag}
                  className="px-2.5 py-1 rounded-full font-noto text-xs font-semibold"
                  style={{ background: 'rgba(255,133,162,0.12)', border: '1px solid rgba(255,133,162,0.25)', color: '#FFB3C6' }}
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Name hint */}
          <div
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-2xl mb-5"
            style={{ background: 'rgba(253,203,110,0.08)', border: '1px solid rgba(253,203,110,0.2)' }}
          >
            <div className="w-4 h-4 flex items-center justify-center flex-shrink-0">
              <i className="ri-information-line text-sm" style={{ color: ACCENT2 }} />
            </div>
            <p className="font-noto text-xs" style={{ color: 'rgba(253,203,110,0.85)' }}>
              你在节目里的名字就是你的分身「<span className="font-semibold" style={{ color: ACCENT2 }}>{myName}</span>」，下面填你的恋综设定
            </p>
          </div>

          {/* Form fields */}
          <div className="flex flex-col gap-5">
            {FIELDS.map((field, fieldIdx) => (
              <div key={field.key}>
                <div className="flex items-center justify-between mb-2">
                  <label className="flex items-center gap-1.5">
                    <i className={`${field.icon} text-xs`} style={{ color: ACCENT }} />
                    <span className="font-noto text-xs font-semibold" style={{ color: 'rgba(224,239,255,0.75)' }}>
                      {field.label}
                      {field.required && (
                        <span className="ml-1" style={{ color: ACCENT }}>*</span>
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
                        background: 'rgba(255,133,162,0.1)',
                        border: '1px dashed rgba(255,133,162,0.35)',
                        color: '#FFB3C6',
                      }}
                    >
                      <i className={`ri-shuffle-line text-xs ${randomizing ? 'animate-spin' : ''}`} style={{ color: ACCENT }} />
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
                          background: isSelected ? 'rgba(255,133,162,0.22)' : 'rgba(255,255,255,0.05)',
                          border: isSelected ? '1px solid rgba(255,133,162,0.55)' : '1px solid rgba(255,255,255,0.1)',
                          color: isSelected ? '#FFB3C6' : 'rgba(224,239,255,0.55)',
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
              background: filled ? `linear-gradient(135deg, ${ACCENT}, #e8439b)` : 'rgba(255,255,255,0.06)',
              color: filled ? '#fff' : 'rgba(224,239,255,0.25)',
              border: filled ? 'none' : '1px solid rgba(255,255,255,0.08)',
              boxShadow: filled ? `0 0 24px rgba(255,133,162,0.4)` : 'none',
            }}
          >
            {filled ? `🎬 ${myName}，开始恋综逆袭！` : '至少选择恋爱取向和雷点'}
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
            <p className="font-orbitron text-sm font-bold" style={{ color: '#E0EFFF' }}>{myName} 的恋综逆袭</p>
          </div>
          <p className="font-noto" style={{ color: 'rgba(224,239,255,0.4)', fontSize: '11px' }}>
            {isEnding ? '🏆 恋综封神结局' : `第${turnCount + 1}回合 · 距封神结局还有${Math.max(0, 20 - turnCount)}回合`}
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
              background: `linear-gradient(90deg, ${ACCENT}, ${ACCENT2})`,
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
                <div className="w-4 h-4 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,133,162,0.2)' }}>
                  <i className="ri-hearts-line" style={{ color: ACCENT, fontSize: '9px' }} />
                </div>
                <span className="font-orbitron text-xs font-bold" style={{ color: 'rgba(255,133,162,0.6)' }}>
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
                style={{ background: 'linear-gradient(135deg,rgba(255,133,162,0.2),rgba(255,133,162,0.1))', border: `1px solid rgba(255,133,162,0.3)` }}
              >
                <p className="font-noto text-sm" style={{ color: '#FFB3C6' }}>✦ {item.choice}</p>
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
                  ? 'linear-gradient(135deg,rgba(253,203,110,0.08),rgba(255,133,162,0.06))'
                  : 'rgba(255,255,255,0.05)',
                border: isEnding ? '1px solid rgba(253,203,110,0.3)' : `1px solid rgba(255,133,162,0.2)`,
              }}
            >
              {isEnding ? (
                <div className="flex items-center gap-2 mb-3">
                  <i className="ri-trophy-line text-base" style={{ color: ACCENT2 }} />
                  <span className="font-orbitron text-xs font-bold" style={{ color: ACCENT2 }}>恋综封神结局</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 mb-2">
                  <div className="w-4 h-4 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,133,162,0.2)' }}>
                    <i className="ri-hearts-line" style={{ color: ACCENT, fontSize: '9px' }} />
                  </div>
                  <span className="font-orbitron text-xs font-bold" style={{ color: 'rgba(255,133,162,0.7)' }}>
                    第{turnCount + 1}回合
                  </span>
                  <div className="w-1 h-1 rounded-full animate-pulse ml-0.5" style={{ background: ACCENT }} />
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
                    style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid rgba(255,133,162,0.18)` }}
                  >
                    <span
                      className="font-orbitron text-xs font-black flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center mt-0.5"
                      style={{ background: 'rgba(255,133,162,0.15)', color: ACCENT, fontSize: '10px' }}
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
                  换个设定再玩
                </button>
                <button
                  onClick={onClose}
                  className="flex-1 py-3.5 rounded-2xl text-sm font-noto font-bold cursor-pointer whitespace-nowrap"
                  style={{ background: `linear-gradient(135deg, ${ACCENT}, #e8439b)`, color: '#fff' }}
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
