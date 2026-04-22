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

function getMyName(): string {
  try {
    const profile = JSON.parse(localStorage.getItem('star_profile') || '{}');
    return profile.nickname || '深夜漫游者';
  } catch {
    return '深夜漫游者';
  }
}

const SYSTEM_PROMPT = `你现在是一款专属定制的「无厘头狗血末日求生逆袭模拟器」，唯一核心目标是：基于用户提供的个人原始数据，生成全程笑到缺氧、反转比丧尸还密集、狗血到丧尸都摇头、爽感比捡到军火库还炸裂的末日废土逆袭剧情。全程由用户的选择驱动剧情走向，必须保证至少20个有效交互回合。

核心规则：全程必须直接使用用户提供的真实名字（主角名），绝对禁止使用[你的名字]这种占位符。

风格铁则：全程必须是「无厘头搞笑+极致狗血+疯狂反转+末日爽文+毒舌生存法则」的基调，拒绝平淡、拒绝绝望、拒绝现实逻辑，只要够离谱、够打脸、够解压就行，全程无血腥恐怖。

热梗融入：全流程必须自然融入「吗喽的命也是命」「鼠鼠我啊真的要变异了」「泰酷辣」「尊嘟假嘟」「精神状态美丽」「CPU干烧了」「班味儿太重连丧尸都不吃」「人生易如反掌」「家人们谁懂啊捡到军火库了」「活爹别追了」「这个末日是一天也待不下去了」「清澈的愚蠢」「泼天的富贵终于轮到我了」等热梗。

节奏：每一个交互回合都必须有反转、有毒舌末日金句、有骚操作名场面。前19个回合是剧情推进，第20个回合后进入结局线。

【重要格式要求】每次推进必须严格按以下JSON格式输出，不得有任何额外文字：
{"story":"100-300字的剧情推进内容，必须有反转、有毒舌末日吐槽、有狗血废土爆点，深度融入用户个人标签，直接使用主角的真实名字，禁止使用占位符","choices":["选项1","选项2","选项3","选项4"],"isEnding":false}

当到达第20回合后，isEnding设为true，choices数组为空，story为完整的暴爽末日大结局（从炮灰翻身成末日霸主，必须包含爆笑狗血的收尾彩蛋）。

绝对禁止：在20个有效交互回合之前提前触发最终结局；生成负面绝望结局；使用占位符；生成血腥恐怖内容。`;

function buildOpeningPrompt(userData: Record<string, string>, myName: string): string {
  return `我的个人信息如下：
主角名字（必须在剧情中直接使用）：${myName}
我的职业/日常：${userData.job || '普通社畜'}
我的末日求生技能幻想：${userData.skill || '靠嘴皮子说服一切'}
我性格特质：${userData.personality || '表面社恐内心极其能打'}

重要：剧情中的主角必须叫「${myName}」，直接写名字，不能用任何占位符。

请立刻生成开局背景故事和第一回合剧情+选项（严格按JSON格式输出）。`;
}

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

/* ── 开局 mock（固定两条，之后走动态池） ── */
const OPENING_MOCK_TURNS: GameTurn[] = [
  {
    story: `末日第1天，${'{name}'}正在厕所蹲坑刷手机，屏幕上满是「城市已封锁」「疏散通知」的推送。\n\n手机没电了。\n\n出来一看，走廊里一半的邻居已经变成了「精神状态美丽」的丧尸，另一半在争抢最后一箱泡面。${'{name}'}的初始装备清单：一把尖叫鸡、半瓶防晒霜、三张外卖优惠券，以及一只还没充电的充电宝。\n\n「班味儿太重连丧尸都不吃我，」${'{name}'}若有所思地看着身边一只丧尸绕开自己继续追别人，「这算是优势吗？」\n\n就在这时，对面邻居张奶奶拉开门缝塞来一张纸条：「楼顶有储物间，我儿子以前囤了很多东西，码是生日0614，你去取吧，我腿脚不好。」\n\n泼天的富贵！${'{name}'}手心冒汗，现在要怎么行动？`,
    choices: [
      '攥着尖叫鸡冲向楼梯，一路捏响尖叫鸡当声呐探路，三步并两步往楼顶冲',
      '先收集每层走廊里没人要的外卖包装袋，做一套「末日迷彩服」，伪装成快递小哥再出发',
      '打开外卖App发现还能用——下单「末日生存礼包」，配送费一颗丧尸牙齿，预计20分钟送达',
      '对着走廊里的丧尸们大声宣布：「我是居委会的！大家安静排队！」，用纯社区管理气场压场',
    ],
  },
  {
    story: `${'{name}'}的第一波骚操作已经让废楼里的幸存者们集体沉默了——弹幕弹出：「清澈的愚蠢，但结果是对的」。\n\n楼顶储物间成功开锁，里面除了大量物资，还有一台破旧对讲机和一张手绘地图，上面标着「安全基地·距此3公里·入场需资产审核」。\n\n资产审核？末日了还要审核？${'{name}'}把地图翻过来，背面写着：「凭实力入场，不收难民，我们这里有规矩。」\n\n这个基地的「规矩」闻起来就像职场PUA的末日复刻版，${'{name}'}皱了皱眉。就在这时，对讲机突然响了：「喂——有没有人？我是3楼的，我会修电路，我需要帮助……」\n\n活爹别追了，先处理眼前这摊事——${'{name}'}怎么选？`,
    choices: [
      '回应对讲机，和3楼的电路工兵汇合，有技术加持才能谈未来',
      '无视对讲机，独自拎着物资杀向那个「审核制基地」，看看他们到底在审核什么',
      '在储物间设置「临时据点」，用对讲机广播招募幸存者，自己先当一把末日居委会主任',
      '研究那张手绘地图，发现还有个没标注的路线——去探索那个「？」标记的神秘地点',
    ],
  },
];

/* ── 动态续集 pool（15条，每次按 turnCount % pool长度 + 上次index偏移避免重复） ── */
const CONTINUATION_POOL: GameTurn[] = [
  {
    story: `「家人们谁懂啊——」${'{name}'}差点没绷住，这个基地的「入场考核」居然是：当场解一道小学数学应用题，外加展示你的「末日核心竞争力」。\n\n前面那个壮汉因为说「我会打架」被轰走了——考官说：「丧尸比你能打，滚。」\n\n轮到${'{name}'}了，考官斜着眼睛：「你有什么不可替代的能力？」\n\n${'{name}'}想了三秒，说出了一个让全场哑口无言的答案……`,
    choices: [
      '「我会调解纠纷——末日基地最容易出事的就是内部矛盾，你需要一个末日居委会主任」',
      '掏出手机展示外卖APP：「我有末日稳定物资渠道，配送费只要一颗丧尸牙齿」',
      '「我熟悉所有职场PUA话术，能帮你识别基地里的内鬼和心机分子」',
      '什么都没说，直接把捏响尖叫鸡——全场丧尸为之侧目，没有一只靠近',
    ],
  },
  {
    story: `泰酷辣！${'{name}'}的答案让基地首领当场沉默了五秒，然后说了句：「……你进来吧。」\n\n进了基地才发现：这里表面是末日避难所，实际上派系内斗比公司年会还刺激。A派说要开荒种地，B派说要垄断物资做生意，C派刚刚因为抢厕所使用权爆发了小规模冲突。\n\n首领看向${'{name}'}：「你刚才说能调解矛盾？现在就有活儿干了。」\n\n尊嘟假嘟，${'{name}'}就这样成了末日基地的编外调解员，而且发现这仨派系的矛盾……其实和职场一模一样。`,
    choices: [
      '先单独约谈三派代表，弄清楚每个派系真正想要什么，然后设计一个「三赢方案」',
      '在基地广场拉个横幅：「内部矛盾不解决，丧尸不用攻，我们自己先塌了」，用恐吓法统一思想',
      '暗中给每个派系都画了一张大饼，让他们以为自己是最大赢家，实际上全都绑在一条船上',
      '直接宣布：「从今天起厕所排班制，开荒和物资各管一摊，C派负责安保，利益绑定，散会」',
    ],
  },
  {
    story: `${'{name}'}没想到，末日基地的调解工作比想象中顺利——因为${'{name}'}发现了一个规律：所有人的底层需求都是「安全感」和「被看见」，跟职场那套没啥区别。\n\n就在局势刚刚稳定的时候，基地外传来消息：附近出现了一支「末日商队」，他们有药品、电池和……一台移动冰淇淋机。\n\n「精神状态美丽，」基地里当场出现了50米长的心理咨询队列，全是「我需要冰淇淋维持生命体征」的诉求。\n\n首领头疼：「去跟他们谈判的人要有胆有谋，${'{name}'}，你去吧。」`,
    choices: [
      '带着尖叫鸡作为「礼物」出发谈判，用奇特的外交礼仪建立信任',
      '先打探商队底细，发现他们其实也缺粮，于是设计一个「以物易物+互惠联盟」方案',
      '直接问商队首领：「你们最缺什么？」然后用基地资源换来所有药品和电池，冰淇淋当赠品',
      '谈判中途发现商队里有人是变异体，但还能正常交流，于是开创了末日史上首个「人与变异体合作协议」',
    ],
  },
  {
    story: `谈判超级顺利，人生易如反掌——商队和基地达成了同盟，但代价是${'{name}'}要帮商队解决一个麻烦：他们的「移动仓库」被一群变异鸽子占领了，这些鸽子变异后拥有了定点投弹能力，专炸人头顶，商队三天没能进去取货。\n\n「这不就是个选题一样的问题吗，」${'{name}'}抬头看了看头顶盘旋的十几只变异鸽，CPU微微过热。\n\n基地里所有人都在看${'{name}'}怎么处理这个烫手山芋——`,
    choices: [
      '从外卖APP订了一袋饲料，利用鸽子残存的喂食记忆，三分钟把群鸽驯服成「末日信鸽」',
      '播放《本草纲目》广场舞版，变异鸽子被节奏搞懵，趁乱冲进去取完货',
      '把尖叫鸡套在杆子上举着晃，鸽子们认为这是同类信号，排队跟着走，直接带离现场',
      '和变异鸽「谈判」：你们守这里，我每周送一次麦当劳薯条，互不侵犯',
    ],
  },
  {
    story: `${'{name}'}的操作把基地的经济秩序搞定了，但随之而来的是新麻烦：有个自称「丧尸心理学家」的幸存者找上门来，声称他研究发现，丧尸其实保留了部分情感记忆，特别对「熟悉的声音」有反应。\n\n「你们基地有没有人想试试和丧尸沟通？」他问。\n\n全场沉默了。\n\n然后所有人的目光都转向了${'{name}'}……\n\n「CPU干烧了，」${'{name}'}感受到了这份沉甸甸的期待，「好，我来试试。但我有条件。」`,
    choices: [
      '要求心理学家先证明他的理论——让他自己跟一只丧尸沟通成功，再考虑下一步',
      '同意试验，用「自我介绍+社区公告播报」的方式跟门外的丧尸们说话，发现真的有反应',
      '趁机提出：「如果能和丧尸对话，我要建立「人丧协商委员会」，和平解决边界问题」',
      '请心理学家分析一下那只变异鸽的行为模式，顺便研究一下能不能把变异鸽训练成外交使者',
    ],
  },
  {
    story: `事情越来越离谱——${'{name}'}居然真的「对话」成功了。那只丧尸在听到${'{name}'}广播「下午茶时间到，请各位有序排队」时停下来了，歪着头，发出了一声听起来像「哦」的音节。\n\n全基地炸了。\n\n「末日最强社牛？」「丧尸界的知音？」各种封号满天飞。\n\n更关键的是，消息传到了「末日政府」那边，他们立刻改口：「我们希望邀请${'{name}'}担任末日人际关系大使，全权负责人丧外交事务。」\n\n一份带薪职位——薪资是每周一箱物资和三个安全通行证。`,
    choices: [
      '接受任命，但提出附加条件：「所有丧尸居住区要有基本的人道主义保障」',
      '拒绝官方任命，以「独立顾问」身份运作，保持自主权',
      '答应考虑，同时私下把这个消息告诉基地首领，让基地方面也加入谈判桌',
      '当场反问「末日政府」代表：「你们自己有没有和丧尸坐下来谈过？先做了再来找我」',
    ],
  },
  {
    story: `「泼天的富贵终于轮到我了，」${'{name}'}站在末日最大的谈判桌前，左边是基地联盟，右边是「末日政府」，对面是……三只能部分交流的变异代表（其中一只还带来了一束野花，不确定是外交礼节还是别的什么）。\n\n会议的第一个议题是：「如何划定人类与变异体的共存边界」。\n\n大家都看向了${'{name}'}——因为${'{name}'}是目前唯一一个三方都信任的人。\n\n这种感觉……有点像上班前的早会，只是利害关系稍微大了那么一点。`,
    choices: [
      '拿出一张纸，画了一个「三圈同心圆」边界模型，解释「缓冲区」概念，让三方都接受',
      '先问那只带来野花的变异代表：「这是什么意思？」——弄清楚对方的真实想法',
      '提议建立「末日居委会」，三方各出一名代表，定期开会解决边界纠纷',
      '发现这次会议完全没有议事规则，当场起草了一份「末日协商议程」，强迫大家按流程来',
    ],
  },
  {
    story: `会议出奇地顺利——也许是因为丧尸代表的野花打破了僵局，大家都笑了一下，气氛立刻不那么剑拔弩张了。\n\n协议初步达成：人类聚居区和变异体活动区各有划定，缓冲地带设立「中立市集」，双方可以用物资交换，禁止单方面挑衅行为。\n\n「家人们谁懂啊，」${'{name}'}签完协议，心里感慨，「这不就是小区业委会的升级版吗。」\n\n就在${'{name}'}准备松口气，新问题出现了：外面来了一个陌生的单人幸存者，自称是「前末日观察员」，手里拿着一套影像资料，声称可以证明「这场末日其实是一个综艺节目」……`,
    choices: [
      '「尊嘟假嘟？」——把他请进来，看完资料再做判断',
      '不管真假，先把这个人的资料复制一份秘密存档，以防这是某种陷阱',
      '如果是综艺，那制作组在哪？${\'name\'}决定去找导演组谈一谈「主角待遇」问题',
      '召集基地所有人开会，把这个消息公开，大家一起决定怎么应对',
    ],
  },
  {
    story: `「这不巧了吗，」${'{name}'}看完影像资料，发现了一个惊人的事实：这个所谓的「综艺末日」的确存在幕后制作组，但制作组早已失联——他们自己也被困在了这个「剧本」里，根本没有人在掌控结局。\n\n换句话说，末日是真实的，只是起源于一个失控的实验。\n\n那个前观察员叹了口气：「我们需要找到实验的核心数据，才能研究出对抗变异病毒的方案。那个数据在城市中心的旧研究所里。」\n\n城市中心。丧尸密度最高的地方。\n\n基地里所有人再次看向${'{name}'}……`,
    choices: [
      '组织一支「最强外交团」，尝试通过谈判让变异体协助开路，和平进入研究所',
      '发动全基地的后勤能力，搜集所有有用的防护装备，武装突入',
      '联系商队和其他幸存者联盟，组成「末日联合行动队」，多线同时推进',
      '让观察员描述研究所的内部结构，想办法从地下管道等「非常规路线」悄悄渗透进去',
    ],
  },
  {
    story: `行动出发前夜，${'{name}'}收到了一条意想不到的对讲机信号——是一个熟悉的声音：当初那个把${'{name}'}赶出基地的「末日审核官」。\n\n「我知道你们要去研究所，」他说，「我有一份内部地图，但我需要加入你们的队伍。」\n\n「活爹，」${'{name}'}捏了捏尖叫鸡，「就你？」\n\n他沉默了一秒：「……我在研究所工作过。我知道密码。」\n\n队伍里顿时出现了意见分歧——有人说带他，有人说这是圈套，最终所有人看向了${'{name}'}。`,
    choices: [
      '同意他加入，但设置「知情限制」——他只能在必要时提供密码，不参与其他决策',
      '拒绝他加入，但交换条件：把地图和密码给我，你在安全地带等结果',
      '让他先证明自己——单独进入一个已知区域完成一个小任务，验证情报真实性',
      '把这个情况公开给基地所有人投票决定，民主末日，讲究的',
    ],
  },
  {
    story: `研究所门口，${'{name}'}面对着末日以来最复杂的局面：密码确实正确，门开了；但里面的情况比预想的复杂十倍——研究所内部的丧尸似乎对研究所有某种「守护」本能，完全不理会外面的和平协议。\n\n「班味儿太重连丧尸都不吃我，」${'{name}'}想起自己的特技，深吸一口气，「那我就以职场人的方式跟他们谈。」\n\n${'{name}'}打开随身带着的那台破旧对讲机，切换到一个低频广播：「各位，这里是${'{name}'}，今天我们来这里不是抢资源，是来完成一项可以拯救所有人的任务，包括你们。请给我五分钟。」\n\n整个研究所安静了……`,
    choices: [
      '趁着安静，团队迅速分工，有人找数据，有人维持通道，五分钟内完成任务撤退',
      '继续广播，把整个事情原原本本说清楚，争取让里面的变异体真正理解并配合',
      '注意到其中一只变异体走向了某个特定房间——跟上去，它可能在指引数据的位置',
      '数据找到了，但是加密的，需要一段时间破解——就地设立「临时营地」，守住阵线等待',
    ],
  },
  {
    story: `数据到手了！\n\n「泼天的富贵！」${'{name}'}抱着数据硬盘，感觉比捡到军火库还激动。\n\n但撤退路上，${'{name}'}遇到了末日以来最奇葩的拦路——不是丧尸，是那三只变异代表，他们拦在出口，用各种肢体动作比划着，似乎在说：数据可以带走，但有个条件。\n\n那只一直带野花的变异代表，这次带来的是一张皱巴巴的纸，上面用极其潦草的字写着：「记得我们。」\n\n${'{name}'}眼眶有点热，但还要保持冷静处理后续……`,
    choices: [
      '郑重承诺：「研究出成果后，你们的名字会出现在里面」，然后握手离开',
      '约定：「等疫苗研发出来，第一批给你们试」，这不是承诺，这是合作',
      '掏出手机拍下那张纸：「我会的，这是我见过的末日里最让人想努力的理由」',
      '回过头问：「你们愿不愿意也参与研发过程？你们对病毒的了解可能比任何人都多」',
    ],
  },
  {
    story: `${'{name}'}的队伍带着数据安全撤回基地，基地里的欢呼声响彻末日的夜空。\n\n研究员们说：数据完整，有了这份数据，三到六个月内可以研发出初步抗体方案。\n\n「人生易如反掌，」${'{name}'}靠在基地的墙上，看着头顶的星星，「不过下一步怎么走，得好好想想了。」\n\n基地首领走来：「${'{name}'}，整个联盟都在问，接下来谁来主持大局？」\n\n所有人的目光，第一百次落在了${'{name}'}身上。这次，${'{name}'}没有习惯性地说「我随便」——`,
    choices: [
      '「建立联席委员会，我可以作为协调人，但最终决策必须是集体的」',
      '「先把疫苗做出来，这期间我负责对外协调，之后再谈架构」',
      '「推举首领你来，我帮你出谋划策，幕后运作比台前更适合我」',
      '「现在不是说这个的时候，先开庆功宴，吃饱了再谈天下」',
    ],
  },
];

/* ── 用已用索引集合避免短期重复 ── */
function pickUnique(pool: GameTurn[], used: Set<number>): { turn: GameTurn; idx: number } {
  const available = pool
    .map((_, i) => i)
    .filter((i) => !used.has(i));
  if (available.length === 0) {
    used.clear();
    return pickUnique(pool, used);
  }
  const idx = available[Math.floor(Math.random() * available.length)];
  return { turn: pool[idx], idx };
}

function injectHero(turn: GameTurn, name: string): GameTurn {
  const rep = (s: string) =>
    s
      .replace(/\{['"]?name['"]?\}/g, name)
      .replace(/\$\{['"]{0,1}name['"]{0,1}\}/g, name)
      .replace(/\[你的名字\]/g, name)
      .replace(/\[名字\]/g, name)
      .replace(/主角/g, name);
  return { story: rep(turn.story), choices: turn.choices.map(rep) };
}

function buildEndingMock(heroName: string, job: string): GameTurn {
  return {
    story: `🎉【最终暴爽大结局·末日封神版】\n\n经过这段史诗级的末日历程，${heroName}已经从「厕所蹲坑遭遇末日」的倒霉社畜，华丽逆袭成了整个废土上最不可或缺的人。\n\n疫苗研发成功！接种率突破80%的那天，三方联合广场上爆发出了末日以来最大的欢呼声。\n\n${heroName}站在台上，手里握着那只陪伴了整个末日的尖叫鸡，发表了简短的感言：「本来只是去厕所蹲了个坑，没想到蹲出了一个新世界。感谢丧尸同志们的配合，感谢变异鸽的情报工作，感谢外卖App在末日还保持稳定运营……」\n\n📌 彩蛋一：当年把${heroName}赶出来的「末日审核官」，现在拿着简历排队来应聘${heroName}创立的「末日和谐发展委员会」厕所清洁管理专员。${heroName}的回复：「可以，薪资是每天一颗糖，另有绩效。」\n\n📌 彩蛋二：那只尖叫鸡被末日博物馆收藏，解说词：「末日人类反击的第一声号角，同时也是迄今为止最吵的外交道具。」\n\n📌 彩蛋三：${heroName}随口说的「班味儿太重连丧尸都不吃我」被印在了新世界的文明史第一章，成为新生代必背金句，朗朗上口，意义深远，彻底改变了后代对${job}的认知。\n\n🏆 ${heroName} 已解锁：【末日废土传说·人丧共和国缔造者】成就！`,
    choices: [],
  };
}

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
    label: '你的职业 / 日常状态',
    placeholder: '或者手动输入，比如：互联网摸鱼专家…',
    icon: 'ri-briefcase-line',
    required: true,
    options: ['互联网社畜', '外卖骑手', '在校学生', '自由职业者', '慢性失业'],
  },
  {
    key: 'skill',
    label: '你幻想过的末日求生技能',
    placeholder: '或者手动输入，比如：用嘴皮子说服所有人…',
    icon: 'ri-sword-line',
    required: true,
    options: ['嘴炮无敌说服一切', '游戏理解预判丧尸', '外卖经验熟悉地形', '发疯不按逻辑出牌', '摆烂式反向操作'],
  },
  {
    key: 'personality',
    label: '你的性格/专属气场',
    placeholder: '或者手动描述…',
    icon: 'ri-user-smile-line',
    required: false,
    options: ['表面社恐内心极其能打', '社牛型末日居委会体质', '一身班味丧尸绕着走', '发疯文学治愈系', '玄学锦鲤躺赢王'],
  },
];

function randomFrom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function LoadingDots() {
  return (
    <div className="flex items-center gap-1.5 px-4 py-3">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="w-2 h-2 rounded-full animate-bounce"
          style={{ background: '#00CEC9', animationDelay: `${i * 0.15}s`, animationDuration: '0.8s' }}
        />
      ))}
      <span className="font-noto text-xs ml-1" style={{ color: 'rgba(0,206,201,0.7)' }}>
        AI正在构建你的末日逆袭剧情…
      </span>
    </div>
  );
}

const ACCENT = '#00CEC9';
const ACCENT2 = '#FDCB6E';
const ACCENT_DIM = 'rgba(0,206,201,0.7)';

export default function DoomsdaySimulatorModal({ sim, onClose }: Props) {
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
  const [openingIdx, setOpeningIdx] = useState(0);
  /* 已用的 continuation pool 索引，防重复 */
  const usedIdxRef = useRef<Set<number>>(new Set());

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [currentTurn, isLoading, history]);

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
    if (!userData.job || !userData.skill) return;
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
      const raw = OPENING_MOCK_TURNS[0];
      setCurrentTurn(injectHero(raw, myName));
      setOpeningIdx(1);
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
        content: `我选择：${choice}${newTurnCount >= 19 ? `（这是第${newTurnCount}回合，请生成最终的暴爽末日封神大结局，isEnding设为true，主角叫${myName}，职业是${userData.job || '社畜'}）` : ''}`,
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
      /* AI unavailable, use mock pool with anti-repeat */
      if (newTurnCount >= 19) {
        setIsEnding(true);
        setCurrentTurn(buildEndingMock(myName, userData.job || '社畜'));
      } else if (openingIdx < OPENING_MOCK_TURNS.length) {
        const raw = OPENING_MOCK_TURNS[openingIdx];
        setCurrentTurn(injectHero(raw, myName));
        setOpeningIdx((prev) => prev + 1);
      } else {
        const { turn, idx } = pickUnique(CONTINUATION_POOL, usedIdxRef.current);
        usedIdxRef.current.add(idx);
        setCurrentTurn(injectHero(turn, myName));
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
    setOpeningIdx(0);
    usedIdxRef.current.clear();
    setChatHistory([]);
    setUserData({});
  };

  /* ══════════════ COLLECT PHASE ══════════════ */
  if (phase === 'collect') {
    const filled = !!userData.job && !!userData.skill;
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
            <div className="w-8 h-8 flex items-center justify-center rounded-xl" style={{ background: 'rgba(0,206,201,0.18)' }}>
              <i className={`${sim.icon} text-base`} style={{ color: ACCENT }} />
            </div>
            <span className="font-orbitron text-sm font-bold" style={{ color: '#E0EFFF' }}>{sim.name}</span>
          </div>
          <div
            className="ml-auto px-2.5 py-1 rounded-full text-xs font-noto whitespace-nowrap"
            style={{ background: 'rgba(0,206,201,0.1)', color: ACCENT, border: `1px solid rgba(0,206,201,0.25)` }}
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
              background: 'radial-gradient(circle at 30% 40%, rgba(0,206,201,0.18) 0%, rgba(15,15,30,0.95) 65%)',
              border: `1px solid rgba(0,206,201,0.22)`,
            }}
          >
            <div className="flex items-start gap-3 mb-3">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(0,206,201,0.15)', border: '1px solid rgba(0,206,201,0.3)' }}
              >
                <i className="ri-skull-line text-2xl" style={{ color: ACCENT }} />
              </div>
              <div>
                <p className="font-orbitron text-base font-black mb-1" style={{ color: '#E0EFFF' }}>
                  末日求生逆袭模拟器
                </p>
                <p className="font-noto text-xs leading-relaxed" style={{ color: 'rgba(224,239,255,0.55)' }}>
                  Hi {myName}！从厕所蹲坑遭遇末日，到废土霸主封神传奇
                </p>
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              {['末日废土热梗', '疯狂反转', '霸主结局'].map((tag) => (
                <span
                  key={tag}
                  className="px-2.5 py-1 rounded-full font-noto text-xs font-semibold"
                  style={{ background: 'rgba(0,206,201,0.12)', border: '1px solid rgba(0,206,201,0.25)', color: '#7FFFFC' }}
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
              末日主角就是你的分身「<span className="font-semibold" style={{ color: ACCENT2 }}>{myName}</span>」，下面填你的末日人设
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
                      {field.required && <span className="ml-1" style={{ color: ACCENT }}>*</span>}
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
                        background: 'rgba(0,206,201,0.1)',
                        border: '1px dashed rgba(0,206,201,0.35)',
                        color: '#7FFFFC',
                      }}
                    >
                      <i className={`ri-shuffle-line text-xs ${randomizing ? 'animate-spin' : ''}`} style={{ color: ACCENT }} />
                      {randomizing ? '随机中…' : '随机'}
                    </button>
                  )}
                </div>
                <div className="flex flex-wrap gap-2 mb-2.5">
                  {field.options.map((opt) => {
                    const isSelected = userData[field.key] === opt;
                    return (
                      <button
                        key={opt}
                        onClick={() =>
                          setUserData((prev) => ({ ...prev, [field.key]: isSelected ? '' : opt }))
                        }
                        className="px-3 py-1.5 rounded-full font-noto text-xs cursor-pointer whitespace-nowrap transition-all duration-150 active:scale-95"
                        style={{
                          background: isSelected ? 'rgba(0,206,201,0.22)' : 'rgba(255,255,255,0.05)',
                          border: isSelected ? '1px solid rgba(0,206,201,0.55)' : '1px solid rgba(255,255,255,0.1)',
                          color: isSelected ? '#7FFFFC' : 'rgba(224,239,255,0.55)',
                        }}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>
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
              background: filled ? `linear-gradient(135deg, ${ACCENT}, #006666)` : 'rgba(255,255,255,0.06)',
              color: filled ? '#fff' : 'rgba(224,239,255,0.25)',
              border: filled ? 'none' : '1px solid rgba(255,255,255,0.08)',
              boxShadow: filled ? `0 0 24px rgba(0,206,201,0.4)` : 'none',
            }}
          >
            {filled ? `☢ ${myName}，开始末日逆袭！` : '至少选择职业和技能'}
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
          <p className="font-orbitron text-sm font-bold" style={{ color: '#E0EFFF' }}>
            {myName} 的末日逆袭
          </p>
          <p className="font-noto" style={{ color: 'rgba(224,239,255,0.4)', fontSize: '11px' }}>
            {isEnding ? '🏆 末日霸主封神结局' : `第${turnCount + 1}回合 · 距霸主结局还有${Math.max(0, 20 - turnCount)}回合`}
          </p>
        </div>
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
        {history.map((item, idx) => (
          <div key={idx} className="flex flex-col gap-2">
            <div
              className="p-4 rounded-3xl"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
            >
              <div className="flex items-center gap-1.5 mb-2">
                <div className="w-4 h-4 rounded-full flex items-center justify-center" style={{ background: 'rgba(0,206,201,0.2)' }}>
                  <i className="ri-skull-line" style={{ color: ACCENT, fontSize: '9px' }} />
                </div>
                <span className="font-orbitron text-xs font-bold" style={{ color: ACCENT_DIM }}>
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
                style={{ background: 'linear-gradient(135deg,rgba(0,206,201,0.2),rgba(0,206,201,0.1))', border: `1px solid rgba(0,206,201,0.3)` }}
              >
                <p className="font-noto text-sm" style={{ color: '#7FFFFC' }}>✦ {item.choice}</p>
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="p-4 rounded-3xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
            <LoadingDots />
          </div>
        )}

        {!isLoading && currentTurn && (
          <div className="flex flex-col gap-3">
            <div
              className="p-4 rounded-3xl"
              style={{
                background: isEnding
                  ? 'linear-gradient(135deg,rgba(253,203,110,0.08),rgba(0,206,201,0.06))'
                  : 'rgba(255,255,255,0.05)',
                border: isEnding ? '1px solid rgba(253,203,110,0.3)' : `1px solid rgba(0,206,201,0.2)`,
              }}
            >
              {isEnding ? (
                <div className="flex items-center gap-2 mb-3">
                  <i className="ri-trophy-line text-base" style={{ color: ACCENT2 }} />
                  <span className="font-orbitron text-xs font-bold" style={{ color: ACCENT2 }}>末日封神结局</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 mb-2">
                  <div className="w-4 h-4 rounded-full flex items-center justify-center" style={{ background: 'rgba(0,206,201,0.2)' }}>
                    <i className="ri-skull-line" style={{ color: ACCENT, fontSize: '9px' }} />
                  </div>
                  <span className="font-orbitron text-xs font-bold" style={{ color: ACCENT_DIM }}>
                    第{turnCount + 1}回合
                  </span>
                  <div className="w-1 h-1 rounded-full animate-pulse ml-0.5" style={{ background: ACCENT }} />
                </div>
              )}
              <p className="font-noto text-sm leading-relaxed whitespace-pre-line" style={{ color: '#E0EFFF' }}>
                {currentTurn.story}
              </p>
            </div>

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
                    style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid rgba(0,206,201,0.18)` }}
                  >
                    <span
                      className="font-orbitron text-xs font-black flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center mt-0.5"
                      style={{ background: 'rgba(0,206,201,0.15)', color: ACCENT, fontSize: '10px' }}
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
                  style={{ background: `linear-gradient(135deg, ${ACCENT}, #006666)`, color: '#fff' }}
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
