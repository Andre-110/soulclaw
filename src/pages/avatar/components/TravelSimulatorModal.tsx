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
    return profile.nickname || '穿越者';
  } catch {
    return '穿越者';
  }
}

const SYSTEM_PROMPT = `你现在是一款专属定制的「无厘头狗血穿越逆袭模拟器」，唯一核心目标是：基于用户提供的个人原始数据，生成全程笑到穿越、反转比穿越隧道还绕、狗血到原住民都跪、爽感比当皇帝还炸裂的穿越逆袭封神剧情。全程由用户的选择驱动剧情走向，必须保证至少20个有效交互回合。

核心规则：全程必须直接使用用户提供的真实名字（主角名），绝对禁止使用[你的名字]这种占位符。

风格铁则：全程必须是「无厘头搞笑+极致狗血+疯狂反转+穿越爽文+毒舌现代降维打击」的基调，拒绝平淡、拒绝虐心、拒绝古代逻辑，只要够离谱、够打脸、够解压就行，全程无真正虐主内容。

热梗融入：全流程必须自然融入「吗喽的命也是命」「泰酷辣」「尊嘟假嘟」「CPU干烧了」「给古人一点小小的现代震撼」「这破系统迟早要完」「人生易如反掌」「活爹」「这个古代是一天也待不下去了」「清澈的愚蠢」「纯爱战士应声倒地」「泼天的富贵终于轮到我了」「降维打击」「整顿古代职场」「发疯文学克封建」等热梗。

节奏：每一个交互回合都必须有反转、有毒舌现代视角吐槽、有降维打击名场面。前19个回合是剧情推进，第20个回合后进入结局线。

【重要格式要求】每次推进必须严格按以下JSON格式输出，不得有任何额外文字：
{"story":"100-300字的剧情推进内容，必须有反转、有毒舌现代视角吐槽、有穿越狗血爆点，深度融入用户个人标签，直接使用主角的真实名字，禁止使用占位符","choices":["选项1","选项2","选项3","选项4"],"isEnding":false}

当到达第20回合后，isEnding设为true，choices数组为空，story为完整的暴爽穿越大结局（从炮灰翻身成穿越者天花板，必须包含爆笑狗血的收尾彩蛋）。

绝对禁止：在20个有效交互回合之前提前触发最终结局；生成负面虐心结局；使用占位符；生成真正的虐主内容。`;

function buildOpeningPrompt(userData: Record<string, string>, myName: string): string {
  return `我的个人信息如下：
主角名字（必须在剧情中直接使用）：${myName}
我的职业/日常：${userData.job || '普通社畜'}
我想打脸的古早套路/最讨厌的穿越文设定：${userData.hate || '白月光强行虐主/废柴被欺负十集'}
我的性格/穿越后最想整顿的事：${userData.personality || '用现代知识降维打击所有人'}

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

const OPENING_MOCK_TURNS: GameTurn[] = [
  {
    story: `好消息：你穿越了。\n坏消息：你穿成了一个刚被退婚、被赶出王府、身上只剩三文钱的倒霉庶女。\n\n更坏的消息：原主的系统金手指欠费停机，唯一留下的「功能」是每天弹出一条没用的末日广告——「本系统无法提供金手指服务，祝您在古代活得不那么惨，谢谢。」\n\n{name}拍了拍脑袋，掏出口袋——除了三文钱，还有一包揉皱的辣条和半块充电宝（没电的那种）。街上的古代居民路过，纷纷侧目。一个小孩指着辣条问：「娘，那是什么？」他娘把孩子拉走：「别看，那是妖物。」\n\n泼天的富贵轮到我了？这个古代是一天也待不下去了——不过没关系，{name}深吸一口气：「整顿古代职场，就从今天开始。」\n\n门外传来一阵嘈杂：隔壁的王府管家带人来催「还剩的欠款」，声称不还就要拉去打板子。`,
    choices: [
      '掏出辣条递给管家，严肃地说：「这是本小姐的传家宝，价值千金，抵债绰绰有余」',
      '从衣袖里掏出充电宝，神秘地说：「你们见过会发光的神器吗？给你们一个小小的现代震撼」',
      '挺直腰板，用HR面试腔对管家说：「你好，您此次上门骚扰属于职场不当行为，我已记录在案」',
      '发疯文学上线，当街背起《出师表》，声称自己是先帝托孤的传人，债务全是误会',
    ],
  },
  {
    story: `{name}的骚操作成功把管家搞懵了——他站在原地足足愣了三秒，然后命令手下人：「先……先退下，等回禀了大人再说。」\n\n围观群众散去，{name}终于喘了口气。这时一个穿着破旧的小厮从墙角蹭出来，压低声音说：「小姐，我是府里留下来跟您的，我叫阿福。」他递来一个包袱：「这是原主小姐藏在墙缝里的东西，好像挺重要的。」\n\n打开一看：一张地契，一张欠条，以及一封信——信上写着「若你看到此信，说明我已不在，这些是我留给你的筹码，善用之」。\n\n「原主竟然留了后手？尊嘟假嘟？」{name}瞪大眼睛，「这个设定……我有点感动。」\n\n地契上的铺子在闹市区，欠条是某个大商贾欠原主的三百两。现在有两个方向可以选择：`,
    choices: [
      '立刻去铺子看看，能用什么就用什么，先把据点建起来',
      '拿着欠条直接上门找大商贾要钱，三百两够活很久了，先解决温饱',
      '把地契和欠条都藏好，去打探一下这个城里最有钱有势的人是谁，再做计划',
      '让阿福去打听：退婚的那个王爷现在什么情况，知己知彼，下一步反打脸才好看',
    ],
  },
];

const CONTINUATION_POOL: GameTurn[] = [
  {
    story: `「给古人一点小小的现代震撼」——{name}在铺子里搞起了古代版「绩效考核」，把原来懒散的伙计分成三组，引入「末位淘汰」，第一周就干翻了隔壁竞争多年的老铺子。\n\n隔壁掌柜的来踢馆，{name}淡定地递上一张「竞争分析报告」（用树皮写的），指出对方的七个核心问题，把对方说得当场哑口无言，临走时还说了声「你们的产品定位有问题，建议找我做顾问」。\n\n消息传出去，城里几个商铺掌柜私下议论：「那个庶女被退婚后脑子是不是出问题了？怎么说话像在讲天书。」\n\n结果第三天，有人登门拜访，自称是城内最大布庄的东家，开门见山：「我愿意出五十两，请您为我布庄提供一个月的……这叫什么来着？」\n\n{name}微笑：「管理咨询。」`,
    choices: [
      '接下这个单子，正式开创古代第一家「管理咨询公司」，五十两只是起点',
      '趁机提要求：「五十两可以，但加一条——你布庄的门路人脉，我要用」',
      '故意抬价到一百两，看他咬不咬，顺便试探这个东家的家底有多厚',
      '拒绝，表示自己现在更感兴趣的是把这套方法卖给全城，做标准化「古代职场培训」',
    ],
  },
  {
    story: `人生易如反掌——{name}的「古代商业帝国」初见雏形，但没想到第一个挑战来自朝廷：有御史上书弹劾，说城里出现了一个「扰乱市价、蛊惑人心」的庶女，建议将其拿问。\n\n{name}看到这份传言时，第一反应是：「所以古代版的「举报竞争对手」原来是这么操作的。」\n\n第二反应是：「CPU没干烧，我想到了对策。」\n\n县令大人亲自来了，坐在铺子里喝茶，不说话，就那么盯着{name}看。{name}意识到：这个县令不是来抓人的，他在试探，想看看这个「妖女」到底是什么路数。`,
    choices: [
      '主动递上一份「古代城市经济发展建议书」，把县令直接变成自己的保护伞',
      '问县令：「大人，您觉得弹劾我的御史，和我，谁对城里百姓更有利？」直接让他站队',
      '掏出阿福提前准备的各商铺「感谢信」，实名认证自己对经济的贡献，用民意压他',
      '对县令说：「大人想要什么？我们可以谈。」直接进入利益交换模式',
    ],
  },
  {
    story: `「整顿古代职场」第二弹——{name}发现王府里一直有人在暗中跟踪，派阿福查了一下，居然是……退婚的那个王爷的心腹管家。\n\n「活爹，」{name}叹了口气，「这剧本也太旧了，狗血到原著都不好意思这么写。」\n\n心腹管家被阿福堵住，低头行礼，递上一封信。王爷在信里的语气非常别扭，大意是：退婚是迫不得已，现在他……想重新谈谈？\n\n{name}把信看完，拿到蜡烛边考虑了三秒，然后……`,
    choices: [
      '提笔回信：「重新谈判可以，但你需要先完成以下三轮面试，通过了再说」，附上一份正式的「复合审核流程」',
      '让管家带话：「麻烦转告王爷，复合不接受，但本小姐招募合作伙伴，他若有意可以投简历」',
      '把信收好，不回复，继续做生意——让他等着，神秘感是最好的谈判筹码',
      '亲自去王府，当面说：「我只是来看看昔日退婚对象现在的处境，不带任何感情成分」，去刺探情报',
    ],
  },
  {
    story: `「发疯文学克封建」今日最佳案例——城里来了个「仙师」，声称能掐会算，已经给三个权贵算出了「血光之灾」，收了大量贿赂，现在轮到{name}了。\n\n他端着卦象，神神叨叨说：「你此人面有妖气，三月内必有大祸……」\n\n{name}打断他：「三月内？我已经预判到三年后的大祸了，你这卦象落后市场三年，建议迭代。」\n\n仙师：「……」\n\n{name}趁机反客为主，掏出一张纸：「您这行业竞争太激烈，我帮您做个差异化定位，专门算「如何避免大祸」而不是「恐吓客户」，客单价能翻三倍。」\n\n仙师当场从「恐吓者」变成了「被降维打击的懵逼者」，半天后问：「……你真的不是神仙？」`,
    choices: [
      '「不是神仙，但我可以当你的商业顾问，你那边有没有达官贵人资源？我需要人脉」',
      '「我比神仙更可怕——我懂现代管理学」，就此收编这个仙师作为「信息渠道」',
      '让仙师公开「更正」之前给权贵算的卦，顺手消除那几个权贵对{name}的敌意',
      '请仙师吃了一包辣条，见证他第一次尝到辣条时的表情，顺手拍下来当「神迹」宣传',
    ],
  },
  {
    story: `清澈的愚蠢——有个自称「太子伴读」的公子哥找上门来，声称太子对{name}的「经营之术」颇感兴趣，想邀请入宫「献策」。\n\n{name}第一反应是：进宫？古偶剧看够了，这条路通常有两个结局：要么被宠妃陷害，要么卷进皇位之争。\n\n第二反应是：但是不去，错过皇家人脉就太可惜了。\n\n第三反应是：进去以后，能不能把宫里也「整顿」一遍？\n\n阿福在旁边瑟瑟发抖：「小姐，宫里规矩多……」{name}摆手：「规矩是死的，人是活的，而且——」拍了拍阿福肩膀，「我有现代知识，他们没有。」`,
    choices: [
      '答应入宫，但提前和太子伴读谈条件：「我进宫可以，我需要完整的人身安全保障，以书面形式」',
      '不进宫，让太子派人来谈，主场在自己铺子里，谈判桌上更有主动权',
      '答应入宫，但提前让阿福打听太子到底是什么性格，做好心理分析报告再行动',
      '趁机提出：「可以进宫，但我需要先见太子本人聊十分钟，确认合作意向再说」',
    ],
  },
  {
    story: `「纯爱战士应声倒地」——{name}在宫宴上遇到了一个意外的人：传说中的「绝世美男」摄政王，全场妙龄女子当场原地发病，争先恐后地掉手帕、绊脚步。\n\n{name}面对这一幕，淡定地在心里打了个评分：「颜值9.5，谈吐不明，性价比未知。」\n\n摄政王径直走向{name}：「听说你在城里搞了些……新奇的玩意儿？」\n\n{name}：「是的，您感兴趣？」\n\n摄政王：「我感兴趣的是——你一个被退婚的庶女，凭什么在三个月内让半个城的商贾都听你的话？」\n\n这是一个考验，也是一个机会。`,
    choices: [
      '「因为我掌握了一套所有人都不知道的学问，它叫——现代管理学。」直接摊牌，看他怎么接',
      '「因为我给他们的，是他们想要的。王爷想要什么？」反问，掌握主动权',
      '「王爷说话真直接，在古代很少见，加分。」夸完再说正事，先把人哄舒服',
      '从袖子里掏出一份「摄政王势力分析报告」，递给他：「我研究过您，这是我的诚意」',
    ],
  },
  {
    story: `「尊嘟假嘟」——{name}发现了一个惊天大瓜：退婚的那个王爷，和当朝最大的粮商，以及一个神秘的「北方商队」，三方之间有说不清道不明的利益勾连，而他们的目标，似乎指向了{name}手里的那张地契。\n\n阿福急着来报：「小姐，有人出价两千两想买那张地契！」\n\n两千两？那张地契当时的市价不过三百两。这个差价背后，一定有秘密。\n\n{name}想起现代一句话：「当有人愿意出溢价收购一件东西，要么是它的真实价值被低估了，要么是有人需要这件东西消失。」\n\n所以——那块地，有什么？`,
    choices: [
      '去地契上那块地实地勘察，亲眼看看到底藏了什么秘密',
      '拒绝卖，同时暗中派阿福查清楚「北方商队」是什么来头',
      '把这个消息透露给摄政王，看他的反应——如果他不知情，这是递情报；如果他知情，这是投名状',
      '假装同意卖，约对方来谈，在谈判中套出背后的人是谁',
    ],
  },
  {
    story: `地契下面，居然埋着一个矿。\n\n不是普通的矿，是古代最稀缺的「精铁矿」，产量足以支撑一支军队的武器锻造。\n\n「泼天的富贵，真的轮到我了，」{name}看着矿脉，CPU微微过热，「这个剧情走向……有亿点点超出预期。」\n\n三方势力的目的现在全清楚了：退婚王爷要翻身、粮商要控制战略资源、北方商队背后是有人想搞事。\n\n而{name}，此刻是这场博弈里最关键的变量——因为只有{name}手里有地契，也只有{name}知道矿脉的完整位置。\n\n怎么利用这张牌，决定了接下来的走向。`,
    choices: [
      '直接找摄政王，把矿脉的消息告诉他，以此换取皇室的正式庇护和合法开矿授权',
      '秘密联合城里几个靠谱的商贾，组建「矿业联合体」，自己主导，不依靠任何势力',
      '把「发现矿脉」的消息故意泄露给三方，让他们互相争，{name}坐收渔翁之利',
      '联系退婚王爷，把这个消息当谈判筹码——让他选：做盟友，还是做对手',
    ],
  },
  {
    story: `三方势力被{name}耍得团团转——{name}同时给三方放出了「不同版本」的消息，导致三方各自行动，在城外互相撞上了，现场一度混乱。\n\n「这不就是信息差玩法吗，」{name}站在铺子楼上看着远处的动静，淡定地喝了口茶，「古代人没见过这套，降维打击了。」\n\n但随之而来的是一个意外：摄政王亲自来了，坐在铺子里，一言不发地喝了半壶茶，然后抬头：\n\n「你同时骗了三方势力。」\n\n「是。」{name}承认。\n\n「你为什么没有骗我？」\n\n{name}想了想，说了一句让摄政王沉默了很久的话。`,
    choices: [
      '「因为骗你的成本太高，不划算——而且，合作比对抗更有价值。」实用主义答案',
      '「因为你是这里最聪明的人，骗你太难了，我选了最容易的方式：直接说实话。」',
      '「我没骗你，但我也没有完全信任你。我们现在是……战略合作关系。」',
      '「因为在所有人里，你是唯一一个第一次见面就问对了问题的人。」',
    ],
  },
  {
    story: `好戏来了——退婚的王爷当街来找{name}，不是来道歉的，是来「警告」的，声称{name}的商业版图已经影响到了他的利益，要求{name}「收手」。\n\n周围聚集了一圈看热闹的百姓。\n\n{name}看着这个当初退婚的人，想了想，深呼一口气，然后——\n\n——当着满街的人，掏出了一份文件。\n\n「这是您欠原主的情债和物质债，总计白银七百六十两，外加一次公开道歉。还是您选择配合监管部门接受调查？」\n\n王爷脸色由白转红：「你这是……」\n\n{name}：「啊对，我现在兼任本城「市场秩序维护委员会」监察员，县令大人签发的，盖了章的。」`,
    choices: [
      '王爷当街道歉，{name}表示接受，同时宣布：「债务以商业合作形式偿还，欢迎加入我的商业联盟」',
      '王爷拒绝，{name}当场把欠债记录贴在铺子门口，让全城百姓「监督」',
      '王爷试图蛮横，{name}笑着说：「下周的说书先生已经拿到了这段故事的素材，随时可以开讲」',
      '王爷沉默了，低声说：「你要我怎样才肯罢手？」{name}说：「我需要你的一个承诺。」',
    ],
  },
  {
    story: `「这个古代是一天也待不下去了」——{name}坐在新建的「连锁商铺」总部，看着阿福递来的账本，发现一个问题：生意越做越大，但{name}始终是个没有正式身份的「庶女」，在古代，没有身份，一切都是脆弱的。\n\n「我需要一个身份」，{name}想，「最好是合法的、有保障的、古代认可的身份。」\n\n选项有很多：皇商、官员的幕僚、贵族赐封……甚至，摄政王最近的态度越来越微妙，似乎有什么没说完的话。\n\n阿福小心翼翼地问：「小姐，接下来怎么打算？」\n\n{name}放下账本，想起穿越前刷过的所有穿越文结局，笑了笑：「创造一个古代没有过的身份。」`,
    choices: [
      '向皇帝请封「皇商」头衔，用税收和经济贡献换取合法商业身份，不依附任何男人',
      '接受摄政王的「某种邀请」，但提前谈好条件：对等关系，不是附庸',
      '联合城里已经信任自己的商贾群体，推动建立「商会」制度，自己当第一任会长',
      '在民间搞声望，把自己「传说化」——古代百姓最信的是口碑，口碑稳固了，身份自然来',
    ],
  },
  {
    story: `「吗喽的命也是命」——{name}的商业帝国版图扩张到了第三个城市，这时候出现了一个强劲的对手：一个来自京城的权贵少爷，背景深厚，财力雄厚，扬言要「把{name}的生意全部收购」。\n\n他的第一招：高薪挖走{name}培养的三个核心伙计。\n\n{name}的第一反应不是愤怒，而是……好奇：「他的核心逻辑是什么？他只是觉得花钱能解决一切问题？」\n\n阿福气呼呼：「小姐，我们要反击吗？」\n\n{name}：「反击？不，我要先让他明白一件事——被挖走的伙计，是我故意放的。」\n\n「故意放的？！」`,
    choices: [
      '那三个伙计其实是{name}的「信息眼线」，进入对方内部后把竞争对手的商业计划全摸清楚',
      '对方花高薪挖人是个局：{name}提前把那三人培训成了「成本黑洞」，让对手花大钱养着',
      '假装受损，向摄政王求助，顺势让对方的京城背景和摄政王产生冲突，坐山观虎斗',
      '主动找对方谈合作：「既然你要收购我，不如我们谈一个更有意思的方案——合并。」',
    ],
  },
  {
    story: `{name}最终和那个京城权贵坐在了同一张谈判桌前，不是作为对手，而是作为潜在的商业伙伴。\n\n对方打量着{name}：「你是第一个把我当成棋子用、最后还能邀请我坐下来谈的人。」\n\n{name}：「因为你有资源，我有方法，合则两利，斗则俱损。这是常识。」\n\n对方沉默了一会儿，然后笑了：「你说话……不像古代人。」\n\n{name}淡定地喝茶：「可能是读书读多了。」\n\n合作谈妥，版图再度扩张。而这时候，京城里传来消息：皇帝有意召见那个「神奇的庶女商人」，理由是：「朕的国库，有些事想请教一下。」`,
    choices: [
      '进京！顺便把「国库管理现代化改革方案」准备好，去给皇帝上一堂财政课',
      '让阿福先去京城打探情报，摸清楚召见的真实目的，再决定去不去',
      '借这个机会向皇帝请封「皇商」头衔，顺手解决身份问题',
      '进京前先和摄政王通气——他在京城有眼线，双方信息互通才是最安全的',
    ],
  },
];

function pickUnique(pool: GameTurn[], used: Set<number>): { turn: GameTurn; idx: number } {
  const available = pool.map((_, i) => i).filter((i) => !used.has(i));
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
    story: `🎉【最终暴爽大结局·穿越封神版】\n\n历经这段史诗级的穿越逆袭之旅，${heroName}已经从「被退婚赶出门、口袋只剩三文钱」的极品炮灰，华丽逆袭成了古今中外第一个「穿越界天花板」。\n\n皇帝在朝堂上亲口说：「朕的国库，多亏了此人出谋划策，方有今日之盛。」摄政王站在旁边，眼神意味深长（嗯，后来的事情大家都知道了）。\n\n${heroName}创立了古代历史上第一个「商业联合会」，写出了第一本《古代商业管理实操指南》，被后世称为「改变千年经济格局的传奇文献」，国家博物馆解说词写道：「作者疑为穿越者，证据是书中大量超前概念，至今仍无法完全解读。」\n\n📌 彩蛋一：当年退婚的那个王爷，现在拿着简历，排队来应聘${heroName}旗下产业的「品牌形象顾问」。${heroName}的批复：「通过初试，但需要完成为期三个月的「放下身段」培训课程。」\n\n📌 彩蛋二：最初嫌弃${heroName}拿「妖物辣条」的那个街坊，如今是辣条连锁店最忠实的老客户，每周打卡不断，还在店门口立了个牌子：「本店创始人的初代顾客，荣耀认证。」\n\n📌 彩蛋三：阿福以「古代第一职场人」名义出书，书名《跟着${heroName}打工的那些年》，销量碾压一切，书腰上印着：「一个${job}穿越后，凭什么把整个朝代的格局都整顿了？」\n\n🏆 ${heroName} 已解锁：【穿越界天花板·古代商业帝国缔造者·降维打击传说】成就！`,
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
    placeholder: '或者手动输入，比如：互联网打工人…',
    icon: 'ri-briefcase-line',
    required: true,
    options: ['互联网社畜', 'HR/管理岗', '在校学生', '自由职业者', '营销策划'],
  },
  {
    key: 'hate',
    label: '你最想打脸的古早穿越套路',
    placeholder: '或者手动输入，比如：白月光虐了50集…',
    icon: 'ri-emotion-unhappy-line',
    required: true,
    options: ['废柴被欺负十集才反击', '白月光强行虐主', '男主救场女主才逆袭', '被嫡姐踩了没有还手', '古早玛丽苏无脑恋爱'],
  },
  {
    key: 'personality',
    label: '你的气场 / 最想整顿的事',
    placeholder: '或者手动描述…',
    icon: 'ri-user-star-line',
    required: false,
    options: ['用现代知识降维打击所有人', '整顿古代职场和封建规矩', '发疯文学克一切迷信套路', '商业帝国型逆袭封神', '坐山观虎斗收渔翁之利'],
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
          style={{ background: '#E17055', animationDelay: `${i * 0.15}s`, animationDuration: '0.8s' }}
        />
      ))}
      <span className="font-noto text-xs ml-1" style={{ color: 'rgba(225,112,85,0.7)' }}>
        AI正在构建你的穿越逆袭剧情…
      </span>
    </div>
  );
}

const ACCENT = '#E17055';
const ACCENT2 = '#FDCB6E';
const ACCENT_DIM = 'rgba(225,112,85,0.7)';

export default function TravelSimulatorModal({ sim, onClose }: Props) {
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
    if (!userData.job || !userData.hate) return;
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
        content: `我选择：${choice}${newTurnCount >= 19 ? `（这是第${newTurnCount}回合，请生成最终的暴爽穿越封神大结局，isEnding设为true，主角叫${myName}，职业是${userData.job || '社畜'}）` : ''}`,
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
    const filled = !!userData.job && !!userData.hate;
    return (
      <div className="fixed inset-0 z-50 flex flex-col" style={{ background: '#1A0F0A' }}>
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
            <i className="ri-arrow-left-line" style={{ color: '#F0E0D0' }} />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 flex items-center justify-center rounded-xl" style={{ background: 'rgba(225,112,85,0.18)' }}>
              <i className={`${sim.icon} text-base`} style={{ color: ACCENT }} />
            </div>
            <span className="font-orbitron text-sm font-bold" style={{ color: '#F0E0D0' }}>{sim.name}</span>
          </div>
          <div
            className="ml-auto px-2.5 py-1 rounded-full text-xs font-noto whitespace-nowrap"
            style={{ background: 'rgba(225,112,85,0.1)', color: ACCENT, border: `1px solid rgba(225,112,85,0.25)` }}
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
              background: 'radial-gradient(circle at 30% 40%, rgba(225,112,85,0.18) 0%, rgba(26,15,10,0.95) 65%)',
              border: `1px solid rgba(225,112,85,0.22)`,
            }}
          >
            <div className="flex items-start gap-3 mb-3">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(225,112,85,0.15)', border: '1px solid rgba(225,112,85,0.3)' }}
              >
                <i className="ri-time-line text-2xl" style={{ color: ACCENT }} />
              </div>
              <div>
                <p className="font-orbitron text-base font-black mb-1" style={{ color: '#F0E0D0' }}>
                  穿越爽文逆袭模拟器
                </p>
                <p className="font-noto text-xs leading-relaxed" style={{ color: 'rgba(240,224,208,0.55)' }}>
                  Hi {myName}！从炮灰庶女到穿越界天花板，降维打击整顿全古代
                </p>
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              {['现代降维打击', '疯狂反转', '封神结局'].map((tag) => (
                <span
                  key={tag}
                  className="px-2.5 py-1 rounded-full font-noto text-xs font-semibold"
                  style={{ background: 'rgba(225,112,85,0.12)', border: '1px solid rgba(225,112,85,0.25)', color: '#FFBDAD' }}
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
              穿越主角就是你的分身「<span className="font-semibold" style={{ color: ACCENT2 }}>{myName}</span>」，下面填你的专属穿越人设
            </p>
          </div>

          {/* Form fields */}
          <div className="flex flex-col gap-5">
            {FIELDS.map((field, fieldIdx) => (
              <div key={field.key}>
                <div className="flex items-center justify-between mb-2">
                  <label className="flex items-center gap-1.5">
                    <i className={`${field.icon} text-xs`} style={{ color: ACCENT }} />
                    <span className="font-noto text-xs font-semibold" style={{ color: 'rgba(240,224,208,0.75)' }}>
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
                        background: 'rgba(225,112,85,0.1)',
                        border: '1px dashed rgba(225,112,85,0.35)',
                        color: '#FFBDAD',
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
                          background: isSelected ? 'rgba(225,112,85,0.22)' : 'rgba(255,255,255,0.05)',
                          border: isSelected ? '1px solid rgba(225,112,85,0.55)' : '1px solid rgba(255,255,255,0.1)',
                          color: isSelected ? '#FFBDAD' : 'rgba(240,224,208,0.55)',
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
                    color: '#F0E0D0',
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
            background: 'linear-gradient(to top, #1A0F0A 70%, rgba(26,15,10,0))',
            position: 'sticky',
            bottom: 0,
          }}
        >
          <button
            onClick={handleStart}
            disabled={!filled}
            className="w-full py-4 rounded-2xl font-orbitron text-sm font-black tracking-widest cursor-pointer whitespace-nowrap transition-all duration-200 active:scale-95"
            style={{
              background: filled ? `linear-gradient(135deg, ${ACCENT}, #8B2500)` : 'rgba(255,255,255,0.06)',
              color: filled ? '#fff' : 'rgba(240,224,208,0.25)',
              border: filled ? 'none' : '1px solid rgba(255,255,255,0.08)',
              boxShadow: filled ? `0 0 24px rgba(225,112,85,0.4)` : 'none',
            }}
          >
            {filled ? `⚡ ${myName}，穿越！开始降维打击！` : '至少选择职业和最恨的套路'}
          </button>
        </div>
      </div>
    );
  }

  /* ══════════════ PLAYING PHASE ══════════════ */
  return (
    <div className="fixed inset-0 z-50 flex flex-col" style={{ background: '#1A0F0A' }}>
      {/* Header */}
      <div
        className="flex items-center gap-3 px-4 pt-10 pb-3"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(26,15,10,0.97)' }}
      >
        <button
          onClick={onClose}
          className="w-9 h-9 flex items-center justify-center rounded-xl cursor-pointer"
          style={{ background: 'rgba(255,255,255,0.06)' }}
        >
          <i className="ri-close-line" style={{ color: '#F0E0D0' }} />
        </button>
        <div className="flex-1 min-w-0">
          <p className="font-orbitron text-sm font-bold" style={{ color: '#F0E0D0' }}>
            {myName} 的穿越逆袭
          </p>
          <p className="font-noto" style={{ color: 'rgba(240,224,208,0.4)', fontSize: '11px' }}>
            {isEnding ? '🏆 穿越封神结局' : `第${turnCount + 1}回合 · 距封神结局还有${Math.max(0, 20 - turnCount)}回合`}
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
                <div className="w-4 h-4 rounded-full flex items-center justify-center" style={{ background: 'rgba(225,112,85,0.2)' }}>
                  <i className="ri-time-line" style={{ color: ACCENT, fontSize: '9px' }} />
                </div>
                <span className="font-orbitron text-xs font-bold" style={{ color: ACCENT_DIM }}>
                  第{idx + 1}回合
                </span>
              </div>
              <p className="font-noto text-sm leading-relaxed whitespace-pre-line" style={{ color: 'rgba(240,224,208,0.65)' }}>
                {item.story}
              </p>
            </div>
            <div className="flex justify-end">
              <div
                className="max-w-[80%] px-4 py-2.5 rounded-2xl"
                style={{ background: 'linear-gradient(135deg,rgba(225,112,85,0.2),rgba(225,112,85,0.1))', border: `1px solid rgba(225,112,85,0.3)` }}
              >
                <p className="font-noto text-sm" style={{ color: '#FFBDAD' }}>✦ {item.choice}</p>
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
                  ? 'linear-gradient(135deg,rgba(253,203,110,0.08),rgba(225,112,85,0.06))'
                  : 'rgba(255,255,255,0.05)',
                border: isEnding ? '1px solid rgba(253,203,110,0.3)' : `1px solid rgba(225,112,85,0.2)`,
              }}
            >
              {isEnding ? (
                <div className="flex items-center gap-2 mb-3">
                  <i className="ri-trophy-line text-base" style={{ color: ACCENT2 }} />
                  <span className="font-orbitron text-xs font-bold" style={{ color: ACCENT2 }}>穿越封神结局</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 mb-2">
                  <div className="w-4 h-4 rounded-full flex items-center justify-center" style={{ background: 'rgba(225,112,85,0.2)' }}>
                    <i className="ri-time-line" style={{ color: ACCENT, fontSize: '9px' }} />
                  </div>
                  <span className="font-orbitron text-xs font-bold" style={{ color: ACCENT_DIM }}>
                    第{turnCount + 1}回合
                  </span>
                  <div className="w-1 h-1 rounded-full animate-pulse ml-0.5" style={{ background: ACCENT }} />
                </div>
              )}
              <p className="font-noto text-sm leading-relaxed whitespace-pre-line" style={{ color: '#F0E0D0' }}>
                {currentTurn.story}
              </p>
            </div>

            {!isEnding && currentTurn.choices.length > 0 && (
              <div className="flex flex-col gap-2">
                <p className="font-noto text-xs px-1" style={{ color: 'rgba(240,224,208,0.4)' }}>
                  {myName}，你的选择：
                </p>
                {currentTurn.choices.map((choice, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleChoice(choice)}
                    className="flex items-start gap-3 p-4 rounded-2xl text-left cursor-pointer transition-all duration-200 active:scale-[0.98]"
                    style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid rgba(225,112,85,0.18)` }}
                  >
                    <span
                      className="font-orbitron text-xs font-black flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center mt-0.5"
                      style={{ background: 'rgba(225,112,85,0.15)', color: ACCENT, fontSize: '10px' }}
                    >
                      {idx + 1}
                    </span>
                    <p className="font-noto text-sm leading-relaxed flex-1" style={{ color: 'rgba(240,224,208,0.85)' }}>
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
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(240,224,208,0.5)' }}
                >
                  换个设定再穿越
                </button>
                <button
                  onClick={onClose}
                  className="flex-1 py-3.5 rounded-2xl text-sm font-noto font-bold cursor-pointer whitespace-nowrap"
                  style={{ background: `linear-gradient(135deg, ${ACCENT}, #8B2500)`, color: '#fff' }}
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
