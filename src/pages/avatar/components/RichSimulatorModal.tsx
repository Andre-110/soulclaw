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

// ─── 用户画像收集 ───────────────────────────────────────────────────────────
interface UserProfile {
  name: string;
  age: string;
  job: string;
  hobby: string;
  pet: string;
  catchphrase: string;
  enemy: string;
}

// ─── 剧情数据库（20回合完整剧情树） ─────────────────────────────────────────
interface Choice {
  id: string;
  text: string;
  icon: string;
  tag: string;
}

interface Round {
  id: number;
  story: (profile: UserProfile, prevChoice: string) => string;
  choices: Choice[];
}

const STORY_ROUNDS: Round[] = [
  {
    id: 1,
    story: (p) =>
      `你刚被老板以「你的呼吸影响了公司风水」为由开除，兜里只剩2块5，连矿泉水都买不起。更惨的是，你养的${p.pet || '猫'}被前任带走了，还顺手卷走了你最爱的${p.hobby || '游戏机'}。你坐在公司楼下的台阶上，正准备用2块5买包榨菜当晚饭……突然，一个穿黑西装的大叔走过来，把一个破旧的信封塞进你手里，低声说：「${p.name || '朋友'}，你祖上留了点东西，今晚12点，废弃仓库，来不来随你。」说完转身消失在人群里。`,
    choices: [
      { id: 'a', text: '立刻冲去废弃仓库，管他是不是骗局', icon: 'ri-run-line', tag: '冒险向' },
      { id: 'b', text: '先把信封卖给路边收废品的大爷，换钱买榨菜', icon: 'ri-money-cny-circle-line', tag: '摆烂向' },
      { id: 'c', text: '打开信封，发现里面是一张彩票，立刻去兑奖', icon: 'ri-ticket-line', tag: '整活向' },
      { id: 'd', text: '跟踪黑西装大叔，看他到底是什么来头', icon: 'ri-spy-line', tag: '剑走偏锋' },
    ],
  },
  {
    id: 2,
    story: (p, prev) => {
      if (prev === 'a') return `你冲到废弃仓库，发现里面灯火通明，坐着十几个西装革履的人。黑西装大叔站在中间，指着一幅巨大的家族族谱说：「你是${p.name || '你'}家第七代传人，祖上在民国时期藏了一批宝贝，就在这仓库地下。」话音未落，地板突然塌了，你掉进了一个密室……`;
      if (prev === 'b') return `收废品大爷接过信封，眼睛突然瞪圆了：「小伙子，你知道这是什么吗？！」他颤抖着打开信封，里面是一张泛黄的地契，上面写着你的名字，地址是——市中心黄金地段一栋楼！大爷当场跪下：「大爷我有眼不识泰山！」`;
      if (prev === 'c') return `你拿着彩票冲进便利店，店员扫了一下，脸色突变，颤抖着说：「先……先生，这张彩票……是上上上期的特等奖，一直没人来兑，奖金已经滚到了……」他把计算器推过来，你看到了一个让你腿软的数字。`;
      return `你跟踪黑西装大叔，发现他钻进了一辆劳斯莱斯。车窗摇下来，里面坐着一个老太太，她看了你一眼，突然哭了：「找到了！找了三十年！你长得和你爷爷一模一样！」`;
    },
    choices: [
      { id: 'a', text: '在密室里大喊「我是来继承遗产的！」', icon: 'ri-megaphone-line', tag: '整活向' },
      { id: 'b', text: '冷静检查密室，寻找机关和出口', icon: 'ri-search-eye-line', tag: '正经向' },
      { id: 'c', text: '掏出手机直播「我在密室里继承遗产」', icon: 'ri-live-line', tag: '整活向' },
      { id: 'd', text: '坐下来等，反正饿了这么久，先睡一觉', icon: 'ri-zzz-line', tag: '摆烂向' },
    ],
  },
  {
    id: 3,
    story: (p, prev) => {
      if (prev === 'a') return `你大喊一声，密室里的机关被声波触发，墙壁缓缓打开，露出一个巨大的宝库。里面堆满了金条、古董、还有一个装着${p.hobby || '游戏卡带'}的玻璃柜——你祖上居然也是${p.hobby || '游戏'}爱好者！黑西装大叔从暗门走出来：「恭喜你通过了第一关测试。」`;
      if (prev === 'b') return `你发现密室墙上有一幅画，画的是一只${p.pet || '猫'}。你按了一下，墙壁打开，里面是一个保险箱，密码提示是「你最爱的东西」。你输入了${p.hobby || '游戏'}，保险箱弹开了，里面是一本账本，记录着一笔天文数字的存款。`;
      if (prev === 'c') return `你开始直播，没想到三分钟内涌入了50万观众，全网都在看「密室继承人」。一个投资人在评论区留言：「我出10亿买你的故事版权！」你的手机被打爆了，全是媒体和投资人的电话。`;
      return `你睡着了，梦里${p.pet || '猫'}回来了，还带着一张藏宝图。你醒来发现，藏宝图真的压在你屁股底下——是黑西装大叔趁你睡着塞进来的。`;
    },
    choices: [
      { id: 'a', text: '要求立刻签遗产继承协议，一分不少', icon: 'ri-file-text-line', tag: '正经向' },
      { id: 'b', text: '先把金条揣几根，以防万一', icon: 'ri-coin-line', tag: '整活向' },
      { id: 'c', text: '问黑西装大叔：「我那只${p.pet || "猫"}在哪？」', icon: 'ri-question-line', tag: '剑走偏锋' },
      { id: 'd', text: '假装晕倒，看他们怎么处理', icon: 'ri-emotion-unhappy-line', tag: '摆烂向' },
    ],
  },
  {
    id: 4,
    story: (p, prev) => {
      if (prev === 'a') return `律师当场拿出合同，你签字的瞬间，手机收到了一条银行短信：「您的账户到账：壹亿贰仟叁佰万元整。」你盯着屏幕看了三秒，然后淡定地说：「能帮我叫个外卖吗，我饿了一天了。」全场沉默。`;
      if (prev === 'b') return `你揣了三根金条，刚走出仓库，被一个记者拍到了。第二天头条：「神秘继承人怀揣金条淡定离场」，配图是你一脸淡然的背影，全网疯传，粉丝暴涨200万。`;
      if (prev === 'c') return `黑西装大叔愣了一下，然后打了个电话。五分钟后，一辆豪车停在门口，你的${p.pet || '猫'}从车里跳出来，还戴着一个钻石项圈。「它一直在我们这里，等你来认领。」`;
      return `你假装晕倒，被抬上了一辆救护车。救护车里坐着一个老医生，他看了你一眼说：「你没晕，但你确实需要休息。顺便说一句，我是你祖上遗嘱里指定的财产托管人，你的遗产我保管了三十年了。」`;
    },
    choices: [
      { id: 'a', text: '用第一笔钱去把前任的新对象买通，要回${p.pet || "猫"}', icon: 'ri-heart-3-line', tag: '狗血向' },
      { id: 'b', text: '低调租个普通公寓，先观察局势', icon: 'ri-home-line', tag: '正经向' },
      { id: 'c', text: '直接买下前公司，把${p.enemy || "前老板"}变成你的下属', icon: 'ri-building-line', tag: '爽文向' },
      { id: 'd', text: '去买一大堆${p.hobby || "游戏"}，先爽三天再说', icon: 'ri-gamepad-line', tag: '摆烂向' },
    ],
  },
  {
    id: 5,
    story: (p, prev) => {
      if (prev === 'a') return `你找到前任，对方一看到你的银行卡余额，当场分手了新对象，跪下来说要复合。你淡淡地说：「不了，我只是来接${p.pet || '猫'}的。」然后抱着${p.pet || '猫'}扬长而去，全程被路人拍下来，成了当天最火的短视频。`;
      if (prev === 'b') return `你租了个普通公寓，结果发现隔壁住的是一个神秘的老奶奶，她每天给你送饭，还说：「我认识你祖上，他当年托我照顾他的后代。」老奶奶的儿子是某科技公司的CEO，正在找合伙人。`;
      if (prev === 'c') return `你买下了前公司，${p.enemy || '前老板'}颤抖着站在你面前。你指了指前台的位置：「去那里报到吧。」全公司员工集体鼓掌，这一幕被人拍下来，全网爆了。`;
      return `你买了一屋子${p.hobby || '游戏'}，正爽着，突然接到一个电话：「您好，我们是某某投资公司，听说您对${p.hobby || '游戏'}很有研究，想请您担任我们游戏板块的顾问，年薪……」`;
    },
    choices: [
      { id: 'a', text: '接受顾问邀请，顺便把自己的爱好变成事业', icon: 'ri-briefcase-line', tag: '正经向' },
      { id: 'b', text: '拒绝，自己开公司，做${p.hobby || "游戏"}相关的生意', icon: 'ri-store-line', tag: '创业向' },
      { id: 'c', text: '要求对方先请你吃顿好的，再谈合作', icon: 'ri-restaurant-line', tag: '整活向' },
      { id: 'd', text: '假装考虑，同时偷偷研究竞争对手', icon: 'ri-spy-line', tag: '剑走偏锋' },
    ],
  },
  {
    id: 6,
    story: (p, prev) => {
      if (prev === 'a') return `你成了顾问，第一天上班就发现公司里有个内鬼在偷卖用户数据。你用${p.hobby || '游戏'}里学到的「侦探思维」，三小时内锁定了内鬼。CEO当场宣布：「从今天起，你是我们的首席安全官，薪资翻三倍。」`;
      if (prev === 'b') return `你开了一家${p.hobby || '游戏'}相关的公司，第一天就有人来谈收购，出价5000万。你说：「不卖，但可以合作。」对方愣了三秒，然后说：「好，我入股，你继续做。」`;
      if (prev === 'c') return `对方请你去了一家米其林三星餐厅，结果你在餐厅里遇到了一个大明星，对方认出了你（因为之前的新闻），当场说要投资你的任何项目。`;
      return `你研究竞争对手时，发现对方公司有一个巨大的漏洞——他们的核心技术专利快到期了，而你祖上的遗产里，恰好有一份相关的原始专利文件。`;
    },
    choices: [
      { id: 'a', text: '用专利文件和竞争对手谈判，要求入股', icon: 'ri-file-paper-line', tag: '商业向' },
      { id: 'b', text: '把专利文件公开，让整个行业都能用', icon: 'ri-global-line', tag: '情怀向' },
      { id: 'c', text: '先找律师评估专利价值，再决定怎么用', icon: 'ri-scales-line', tag: '正经向' },
      { id: 'd', text: '把专利文件做成NFT，在网上拍卖', icon: 'ri-nft-line', tag: '整活向' },
    ],
  },
  {
    id: 7,
    story: (p, prev) => {
      if (prev === 'a') return `竞争对手CEO看到专利文件，脸色大变，当场同意入股，还额外给了你一个董事席位。你坐在董事会上，旁边坐着的正是……你的${p.enemy || '前老板'}，他现在是这家公司的小股东，看到你的眼神里全是震惊。`;
      if (prev === 'b') return `你公开了专利，全行业沸腾了，媒体称你为「行业救世主」。三天内，十几家公司找上门来，要给你冠名权、顾问费、股权……你的手机被打爆了。`;
      if (prev === 'c') return `律师评估完说：「这份专利价值保守估计在8亿到12亿之间。」你淡定地说：「那就按12亿算吧。」律师：「……您真的很有商业头脑。」`;
      return `你把专利做成NFT，没想到被一个神秘买家以3000万的价格拍走了。买家揭晓身份：是一个硅谷华人科技大佬，他说：「我就是要支持有创意的年轻人。」`;
    },
    choices: [
      { id: 'a', text: '在董事会上当众让${p.enemy || "前老板"}给你倒茶', icon: 'ri-cup-line', tag: '爽文向' },
      { id: 'b', text: '大度地和${p.enemy || "前老板"}握手，表示既往不咎', icon: 'ri-shake-hands-line', tag: '格局向' },
      { id: 'c', text: '假装不认识${p.enemy || "前老板"}，让他自我介绍', icon: 'ri-emotion-normal-line', tag: '整活向' },
      { id: 'd', text: '当场宣布收购${p.enemy || "前老板"}的股份，让他出局', icon: 'ri-close-circle-line', tag: '狗血向' },
    ],
  },
  {
    id: 8,
    story: (p, prev) => {
      if (prev === 'a') return `${p.enemy || '前老板'}颤抖着给你倒茶，全场沉默。这一幕被人偷拍发到网上，标题是「被开除员工逆袭成老板，让前老板倒茶」，24小时内播放量破亿，你成了全网最火的励志人物。`;
      if (prev === 'b') return `你大度地握手，${p.enemy || '前老板'}感动得差点哭了，当场表示愿意把他手里的资源全部对接给你。结果你发现他手里有一个价值连城的项目，一直没人接手。`;
      if (prev === 'c') return `${p.enemy || '前老板'}尴尬地自我介绍，你一脸茫然地说：「哦，你就是那个以风水为由开除员工的老板？我在新闻上看到过你。」全场哄堂大笑。`;
      return `你收购了${p.enemy || '前老板'}的股份，他出局了。临走前他说：「你赢了。」你说：「不，我只是回到了我本来应该在的位置。」这句话后来被做成了励志海报。`;
    },
    choices: [
      { id: 'a', text: '接受媒体采访，讲述逆袭故事，顺便推广${p.hobby || "爱好"}', icon: 'ri-camera-line', tag: '曝光向' },
      { id: 'b', text: '拒绝采访，低调继续扩张商业版图', icon: 'ri-shield-line', tag: '低调向' },
      { id: 'c', text: '开一个直播，现场讲述全部经历', icon: 'ri-live-line', tag: '整活向' },
      { id: 'd', text: '写一本书，书名就叫《${p.catchphrase || "就这？"}》', icon: 'ri-book-open-line', tag: '文艺向' },
    ],
  },
  {
    id: 9,
    story: (p, prev) => {
      if (prev === 'a') return `你接受了采访，顺口提到了自己对${p.hobby || '游戏'}的热爱。没想到这句话引爆了整个${p.hobby || '游戏'}圈，粉丝们自发组织了一个「${p.name || '你'}的${p.hobby || '游戏'}宇宙」社群，三天内涌入了50万人。`;
      if (prev === 'b') return `你低调扩张，三个月内悄悄收购了七家公司。某天，一个财经媒体发现了你的动作，头条是：「神秘商业天才悄然布局，已控制三个行业」。`;
      if (prev === 'c') return `你开了直播，全程讲述经历，最高同时在线人数达到800万。直播结束时，你的账号涨粉1200万，广告商排队找你，报价一条广告500万。`;
      return `你的书出版了，书名《${p.catchphrase || '就这？'}》，首周销量破百万册，被翻译成23种语言。出版商说：「这是今年最畅销的励志书，没有之一。」`;
    },
    choices: [
      { id: 'a', text: '把社群变成一个${p.hobby || "游戏"}相关的商业平台', icon: 'ri-community-line', tag: '商业向' },
      { id: 'b', text: '用流量做公益，帮助和你一样曾经落魄的人', icon: 'ri-heart-line', tag: '情怀向' },
      { id: 'c', text: '和顶流明星合作，把影响力扩大到娱乐圈', icon: 'ri-star-line', tag: '娱乐向' },
      { id: 'd', text: '突然宣布「退网隐居」，看看会发生什么', icon: 'ri-logout-box-line', tag: '整活向' },
    ],
  },
  {
    id: 10,
    story: (p, prev) => {
      if (prev === 'a') return `你的平台上线了，第一天注册用户就突破了100万。一个风险投资人找上门来，说要给你估值50亿，你淡定地说：「100亿，少一分不谈。」对方沉默了三秒，说：「成交。」`;
      if (prev === 'b') return `你发起了一个公益项目，专门帮助被无理由开除的员工。项目上线一周，收到了10万个申请，同时也收到了政府的表彰和一笔巨额公益基金。`;
      if (prev === 'c') return `你和顶流明星合作，对方粉丝和你的粉丝合并，形成了一个超级流量矩阵。你们联合推出的${p.hobby || '游戏'}周边产品，首日销售额破亿。`;
      return `你宣布退网，全网哗然。三天后，你「复出」，粉丝暴涨500万，广告报价翻了三倍。你对助理说：「这招叫饥饿营销。」`;
    },
    choices: [
      { id: 'a', text: '用100亿估值融资，开始全球扩张', icon: 'ri-global-line', tag: '商业向' },
      { id: 'b', text: '把公司上市，让普通人也能分享你的成功', icon: 'ri-stock-line', tag: '格局向' },
      { id: 'c', text: '先给自己放个假，去找${p.pet || "猫"}玩三天', icon: 'ri-bear-smile-line', tag: '摆烂向' },
      { id: 'd', text: '神秘宣布：「我要做一件改变世界的事」', icon: 'ri-rocket-line', tag: '剑走偏锋' },
    ],
  },
  {
    id: 11,
    story: (p, prev) => {
      if (prev === 'a') return `你开始全球扩张，第一站选了日本。在东京的发布会上，你用${p.hobby || '游戏'}里学到的策略分析市场，台下的日本商界大佬们集体鼓掌，说：「这是我们见过最有趣的商业逻辑。」`;
      if (prev === 'b') return `你的公司上市了，开盘当天股价涨了300%。你的老邻居、曾经嘲笑你的大妈，在电视上看到新闻，当场晕了过去。`;
      if (prev === 'c') return `你带着${p.pet || '猫'}去度假，在海边遇到了一个神秘老人，他说他是你祖上的老朋友，还有一批「更大的宝贝」没有交给你。`;
      return `你神秘宣布要「改变世界」，全网猜测你要做什么。三天后揭晓：你要把${p.hobby || '游戏'}和AI结合，做一个「让所有人都能实现梦想」的平台。`;
    },
    choices: [
      { id: 'a', text: '在日本找到合作伙伴，把业务扩展到亚洲', icon: 'ri-map-line', tag: '商业向' },
      { id: 'b', text: '跟着神秘老人去找「更大的宝贝」', icon: 'ri-treasure-map-line', tag: '冒险向' },
      { id: 'c', text: '把AI平台的想法做成PPT，去硅谷路演', icon: 'ri-presentation-line', tag: '创业向' },
      { id: 'd', text: '先回国，因为${p.pet || "猫"}发来了一条奇怪的消息', icon: 'ri-message-line', tag: '整活向' },
    ],
  },
  {
    id: 12,
    story: (p, prev) => {
      if (prev === 'a') return `你在日本找到了合作伙伴，对方是一个百年家族企业的继承人。他说：「我们家族和你祖上有一个未完成的合作，现在终于可以续上了。」这个合作价值……300亿。`;
      if (prev === 'b') return `神秘老人带你去了一个山洞，里面有一批古代字画，经专家鉴定，价值超过50亿。老人说：「这是你祖上托我保管的，等了六十年，终于等到你来了。」`;
      if (prev === 'c') return `你去硅谷路演，台下坐着全球最顶级的投资人。你讲完，全场沉默了三秒，然后所有人同时举手：「我要投！」最终融资金额：20亿美元。`;
      return `你回国后发现，${p.pet || '猫'}的项圈上有一个芯片，里面存着你祖上留下的最后一份遗嘱：「还有一笔钱，在${p.pet || '猫'}最喜欢待的地方。」`;
    },
    choices: [
      { id: 'a', text: '签下300亿合作，成为亚洲最年轻的商业大亨', icon: 'ri-trophy-line', tag: '商业向' },
      { id: 'b', text: '把字画捐给博物馆，换取政府的特殊支持', icon: 'ri-government-line', tag: '格局向' },
      { id: 'c', text: '用20亿美元融资，开始疯狂招募全球顶尖人才', icon: 'ri-team-line', tag: '创业向' },
      { id: 'd', text: '跟着${p.pet || "猫"}找到最后那笔钱', icon: 'ri-map-pin-line', tag: '整活向' },
    ],
  },
  {
    id: 13,
    story: (p, prev) => {
      if (prev === 'a') return `你成了亚洲最年轻的商业大亨，登上了《福布斯》封面。记者问你成功秘诀，你说：「${p.catchphrase || '就这？'}」这句话成了年度最火的商业金句，被印在了无数励志海报上。`;
      if (prev === 'b') return `政府给了你一个特殊支持：一块价值千亿的土地开发权。你站在那块地上，想起了当年坐在公司台阶上啃榨菜的自己，笑了。`;
      if (prev === 'c') return `你招募了全球顶尖人才，其中有一个天才程序员，他说：「我一直在等一个值得我效力的老板，你就是那个人。」他带来的技术，让你的平台估值直接翻了十倍。`;
      return `${p.pet || '猫'}带你找到了一个地下室，里面有一个保险箱，密码是${p.pet || '猫'}的生日。打开后，里面是一张存折，余额：壹拾亿元整。旁边还有一张纸条：「给我最乖的曾孙，和它的${p.pet || '猫'}。」`;
    },
    choices: [
      { id: 'a', text: '宣布成立慈善基金，回馈社会', icon: 'ri-heart-2-line', tag: '情怀向' },
      { id: 'b', text: '开始布局下一个风口行业', icon: 'ri-line-chart-line', tag: '商业向' },
      { id: 'c', text: '给自己买一座岛，实现「岛主梦」', icon: 'ri-ship-line', tag: '爽文向' },
      { id: 'd', text: '突然想起${p.hobby || "爱好"}，决定把它做成全球顶级品牌', icon: 'ri-award-line', tag: '整活向' },
    ],
  },
  {
    id: 14,
    story: (p, prev) => {
      if (prev === 'a') return `你的慈善基金成立了，第一个项目就是帮助被无理由开除的员工。消息一出，全网感动，你的品牌价值暴涨，有机构评估你的个人品牌价值已经超过500亿。`;
      if (prev === 'b') return `你布局了下一个风口——太空旅游。你宣布：「三年内，我要让普通人也能去太空。」马斯克看到新闻，发了一条推特：「有意思的对手。」`;
      if (prev === 'c') return `你买了一座岛，命名为「${p.name || '你'}岛」。岛上建了一个${p.hobby || '游戏'}主题乐园，开业第一天，全球游客排队，门票被黄牛炒到了十万一张。`;
      return `你把${p.hobby || '爱好'}做成了全球顶级品牌，第一季产品发布，全球限量1000件，开售三秒售罄。时尚界称你为「最懂${p.hobby || '爱好'}的商业天才」。`;
    },
    choices: [
      { id: 'a', text: '和马斯克公开「友好竞争」，互相推高热度', icon: 'ri-rocket-2-line', tag: '整活向' },
      { id: 'b', text: '专注做好一件事，把${p.hobby || "爱好"}品牌做到极致', icon: 'ri-focus-line', tag: '专注向' },
      { id: 'c', text: '宣布要竞选某个重要职位，用影响力改变规则', icon: 'ri-government-line', tag: '剑走偏锋' },
      { id: 'd', text: '突然消失三个月，去做一件没人知道的事', icon: 'ri-question-mark', tag: '神秘向' },
    ],
  },
  {
    id: 15,
    story: (p, prev) => {
      if (prev === 'a') return `你和马斯克的「友好竞争」成了全球最火的商业话题。你们约定：谁先实现某个目标，另一方就要做一件对方指定的事。结果你赢了，你让马斯克在社交媒体上发了一条：「${p.catchphrase || '就这？'}」`;
      if (prev === 'b') return `你专注做${p.hobby || '爱好'}品牌，三年后，它成了全球最具影响力的文化品牌之一，估值超过1000亿，被称为「来自中国的苹果」。`;
      if (prev === 'c') return `你宣布参选，竞选宣言只有一句话：「${p.catchphrase || '就这？'}」全网沸腾，支持率在一周内飙升到了第一。`;
      return `你消失的三个月里，悄悄做了一件事：把你祖上留下的所有资产整合成了一个超级控股集团，涵盖科技、文化、地产、金融四大板块，总资产超过2000亿。`;
    },
    choices: [
      { id: 'a', text: '宣布公司上市，让全球投资者分享成果', icon: 'ri-stock-line', tag: '商业向' },
      { id: 'b', text: '开始布局「下一个十年」的战略', icon: 'ri-calendar-line', tag: '战略向' },
      { id: 'c', text: '给${p.pet || "猫"}开一个专属账号，让它成为品牌代言人', icon: 'ri-bear-smile-line', tag: '整活向' },
      { id: 'd', text: '回到当年那个公司台阶，拍一张照片发朋友圈', icon: 'ri-camera-line', tag: '情怀向' },
    ],
  },
  {
    id: 16,
    story: (p, prev) => {
      if (prev === 'a') return `公司上市，开盘当天市值突破万亿。你成了中国最年轻的万亿富翁，登上了全球富豪榜前十。有记者问：「您最大的遗憾是什么？」你说：「当年那包榨菜，我没舍得买。」`;
      if (prev === 'b') return `你的「下一个十年」战略发布，全球媒体称之为「最具野心的商业蓝图」。你计划在十年内，让你的品牌进入全球每一个家庭。`;
      if (prev === 'c') return `${p.pet || '猫'}的账号一夜涨粉500万，成了全球最火的宠物网红。品牌联名、代言费、周边产品……${p.pet || '猫'}一年的收入，比你当年被开除前的年薪高了一万倍。`;
      return `你回到那个台阶，拍了一张照片，配文：「从这里开始，到这里结束。」这条朋友圈被截图转发了一千万次，成了年度最感人的励志故事。`;
    },
    choices: [
      { id: 'a', text: '宣布退休，把公司交给年轻人，自己去环游世界', icon: 'ri-plane-line', tag: '洒脱向' },
      { id: 'b', text: '继续战斗，目标是全球富豪榜第一', icon: 'ri-trophy-line', tag: '进取向' },
      { id: 'c', text: '开始写回忆录，把所有狗血经历都写进去', icon: 'ri-quill-pen-line', tag: '文艺向' },
      { id: 'd', text: '突然宣布：「我要做一件比赚钱更重要的事」', icon: 'ri-heart-3-line', tag: '情怀向' },
    ],
  },
  {
    id: 17,
    story: (p, prev) => {
      if (prev === 'a') return `你宣布退休，开始环游世界。第一站，你去了一个没有网络的小岛，在那里遇到了一个老渔夫，他说：「我认识你祖上，他当年也来过这里，说这里有世界上最美的日落。」你看着日落，突然想到了一个新的商业点子。`;
      if (prev === 'b') return `你继续战斗，三年后登上了全球富豪榜第一。颁奖典礼上，你说：「感谢当年那个以风水为由开除我的老板，是他给了我最好的礼物。」台下的${p.enemy || '前老板'}……正在给你端茶。`;
      if (prev === 'c') return `你的回忆录出版，书名《从2块5到万亿》，首周销量破千万册，被改编成电影、电视剧、游戏……你的故事成了这个时代最传奇的逆袭神话。`;
      return `你宣布要做「比赚钱更重要的事」——建立一个全球最大的${p.hobby || '游戏'}文化基金，让每一个热爱${p.hobby || '游戏'}的人都能实现梦想。`;
    },
    choices: [
      { id: 'a', text: '把新点子付诸实践，开启人生第二章', icon: 'ri-restart-line', tag: '进取向' },
      { id: 'b', text: '享受当下，和${p.pet || "猫"}一起看日落', icon: 'ri-sun-line', tag: '洒脱向' },
      { id: 'c', text: '把基金做成全球最有影响力的文化机构', icon: 'ri-building-4-line', tag: '情怀向' },
      { id: 'd', text: '给当年的自己写一封信，放进时间胶囊', icon: 'ri-mail-line', tag: '文艺向' },
    ],
  },
  {
    id: 18,
    story: (p, prev) => {
      if (prev === 'a') return `你开启了人生第二章，这次你要做的事更疯狂：把${p.hobby || '游戏'}和元宇宙结合，创造一个「人人都能逆袭的虚拟世界」。发布会上，全球同时在线观看人数破亿。`;
      if (prev === 'b') return `你和${p.pet || '猫'}一起看日落，这一幕被人拍下来，成了全球最火的照片。有人说：「这是这个时代最治愈的画面。」你的品牌价值因为这张照片，又涨了100亿。`;
      if (prev === 'c') return `你的基金成立了，第一批资助了1000个${p.hobby || '游戏'}相关的创业者。其中一个人后来成了下一个时代的商业传奇，他在采访中说：「是${p.name || '你'}给了我第一桶金。」`;
      return `你写完了那封信，放进时间胶囊，埋在了当年那个公司台阶下。你说：「二十年后，如果有人挖出来，希望他们知道，逆袭不需要理由，只需要一个开始。」`;
    },
    choices: [
      { id: 'a', text: '元宇宙项目大获成功，成为下一个时代的开创者', icon: 'ri-glasses-line', tag: '科技向' },
      { id: 'b', text: '宣布把一半财富捐出去，成为全球最慷慨的富豪', icon: 'ri-gift-line', tag: '情怀向' },
      { id: 'c', text: '开始筹备一个「全球逆袭者大会」，邀请所有草根英雄', icon: 'ri-group-2-line', tag: '格局向' },
      { id: 'd', text: '突然接到一个电话，是来自外太空的信号……', icon: 'ri-signal-wifi-line', tag: '整活向' },
    ],
  },
  {
    id: 19,
    story: (p, prev) => {
      if (prev === 'a') return `你的元宇宙项目改变了世界，被称为「第二次互联网革命」。你站在发布会的舞台上，想起了当年那个坐在台阶上啃榨菜的自己，说了一句话：「${p.catchphrase || '就这？'}」全场沸腾。`;
      if (prev === 'b') return `你捐出了一半财富，成为全球最受尊敬的富豪。有人问你：「你不心疼吗？」你说：「我当年兜里只有2块5，现在捐出去的每一分钱，都是赚来的，不心疼。」`;
      if (prev === 'c') return `「全球逆袭者大会」成了年度最盛大的活动，来自全球的草根英雄齐聚一堂。你在台上说：「我们都曾经是那个坐在台阶上的人，但我们都站起来了。」`;
      return `那个「外太空信号」其实是一个神秘投资人发来的加密信息，他说他代表一个「星际文明」，想投资你的下一个项目，预算：无上限。`;
    },
    choices: [
      { id: 'a', text: '接受星际投资，开启人类历史上最疯狂的项目', icon: 'ri-rocket-line', tag: '整活向' },
      { id: 'b', text: '回顾这一切，感谢那个以风水开除你的老板', icon: 'ri-heart-line', tag: '情怀向' },
      { id: 'c', text: '宣布：「我的故事到这里结束，但你们的故事才刚开始」', icon: 'ri-flag-line', tag: '格局向' },
      { id: 'd', text: '带着${p.pet || "猫"}，去找下一个「废弃仓库」', icon: 'ri-map-2-line', tag: '冒险向' },
    ],
  },
  {
    id: 20,
    story: (p, prev) => {
      const endings: Record<string, string> = {
        a: `你接受了星际投资，开启了人类历史上最疯狂的项目——把${p.hobby || '游戏'}带到宇宙。发布会上，你说：「从2块5到宇宙，这就是我的故事。」`,
        b: `你找到了${p.enemy || '前老板'}，真诚地说了一句谢谢。他愣了很久，然后哭了。你说：「没有你，就没有今天的我。」这一幕成了这个时代最动人的和解故事。`,
        c: `你站在舞台上，说完最后一句话，台下掌声雷动。你知道，你的故事已经成为了一个传奇，而这个传奇，将激励无数个「当年的你」。`,
        d: `你带着${p.pet || '猫'}，找到了下一个「废弃仓库」。里面什么都没有，但你笑了——因为你知道，真正的宝藏，从来都不在仓库里，而在你自己身上。`,
      };
      return endings[prev] || endings.c;
    },
    choices: [],
  },
];

// ─── 用户画像输入表单 ─────────────────────────────────────────────────────────
function ProfileForm({ onSubmit }: { onSubmit: (p: UserProfile) => void }) {
  const [form, setForm] = useState<UserProfile>({
    name: '', age: '', job: '', hobby: '', pet: '', catchphrase: '', enemy: '',
  });

  const fields: { key: keyof UserProfile; label: string; placeholder: string; icon: string }[] = [
    { key: 'name', label: '你的名字/昵称', placeholder: '比如：小明、打工人、宇宙第一帅', icon: 'ri-user-line' },
    { key: 'age', label: '年龄', placeholder: '比如：25岁', icon: 'ri-calendar-line' },
    { key: 'job', label: '职业/现状', placeholder: '比如：程序员、失业中、摸鱼专家', icon: 'ri-briefcase-line' },
    { key: 'hobby', label: '最爱的爱好', placeholder: '比如：打游戏、追剧、养猫、骑行', icon: 'ri-heart-line' },
    { key: 'pet', label: '宠物/最宝贝的东西', placeholder: '比如：橘猫、Switch、手办', icon: 'ri-bear-smile-line' },
    { key: 'catchphrase', label: '口头禅/人生格言', placeholder: '比如：就这？、OMG、随便', icon: 'ri-chat-quote-line' },
    { key: 'enemy', label: '最讨厌的人/事', placeholder: '比如：前老板、加班、PUA', icon: 'ri-emotion-unhappy-line' },
  ];

  const handleSubmit = () => {
    if (!form.name.trim()) return;
    onSubmit(form);
  };

  return (
    <div className="flex flex-col gap-4 pt-2">
      <div className="p-4 rounded-2xl" style={{ background: 'rgba(253,203,110,0.08)', border: '1px solid rgba(253,203,110,0.2)' }}>
        <div className="flex items-center gap-2 mb-2">
          <i className="ri-sparkling-2-line text-sm" style={{ color: '#FDCB6E' }} />
          <span className="text-xs font-orbitron tracking-wider" style={{ color: '#FDCB6E' }}>填入你的个人数据，AI将为你生成专属剧情</span>
        </div>
        <p className="text-xs font-noto" style={{ color: 'rgba(224,239,255,0.5)' }}>
          越真实越好玩！你的信息只用于生成专属剧情，不会被保存。
        </p>
      </div>

      {fields.map((f) => (
        <div key={f.key} className="flex flex-col gap-1.5">
          <div className="flex items-center gap-1.5">
            <i className={`${f.icon} text-xs`} style={{ color: '#FDCB6E' }} />
            <span className="text-xs font-noto font-medium" style={{ color: 'rgba(224,239,255,0.7)' }}>{f.label}</span>
            {f.key === 'name' && <span className="text-xs" style={{ color: '#FF7675' }}>*必填</span>}
          </div>
          <input
            value={form[f.key]}
            onChange={(e) => setForm((prev) => ({ ...prev, [f.key]: e.target.value }))}
            placeholder={f.placeholder}
            className="w-full px-3 py-2.5 rounded-xl text-sm font-noto outline-none transition-all duration-200"
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              color: '#E0EFFF',
              fontSize: '13px',
            }}
            onFocus={(e) => { e.currentTarget.style.borderColor = 'rgba(253,203,110,0.4)'; }}
            onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}
          />
        </div>
      ))}

      <button
        onClick={handleSubmit}
        disabled={!form.name.trim()}
        className="w-full py-4 rounded-2xl font-orbitron text-sm font-bold tracking-widest cursor-pointer whitespace-nowrap mt-2 transition-all duration-300 active:scale-95"
        style={{
          background: form.name.trim()
            ? 'linear-gradient(135deg, #FDCB6E, #E17055)'
            : 'rgba(255,255,255,0.08)',
          color: form.name.trim() ? '#1a1a2e' : 'rgba(224,239,255,0.3)',
          boxShadow: form.name.trim() ? '0 0 24px rgba(253,203,110,0.4)' : 'none',
        }}
      >
        开始我的逆袭人生 →
      </button>
    </div>
  );
}

// ─── 主模态框 ─────────────────────────────────────────────────────────────────
export default function RichSimulatorModal({ sim, onClose }: Props) {
  const [phase, setPhase] = useState<'intro' | 'profile' | 'game' | 'ending'>('intro');
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [currentRound, setCurrentRound] = useState(0);
  const [choiceHistory, setChoiceHistory] = useState<string[]>([]);
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);
  const [storyText, setStoryText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showChoices, setShowChoices] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const typingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const TINT = '#FDCB6E';

  // 打字机效果
  const typeText = (text: string, onDone?: () => void) => {
    setIsTyping(true);
    setShowChoices(false);
    setStoryText('');
    let i = 0;
    const speed = Math.max(12, Math.min(28, Math.floor(3000 / text.length)));
    const tick = () => {
      if (i <= text.length) {
        setStoryText(text.slice(0, i));
        i++;
        typingTimer.current = setTimeout(tick, speed);
      } else {
        setIsTyping(false);
        setShowChoices(true);
        onDone?.();
      }
    };
    tick();
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [storyText, showChoices]);

  useEffect(() => () => { if (typingTimer.current) clearTimeout(typingTimer.current); }, []);

  const startGame = (p: UserProfile) => {
    setProfile(p);
    setCurrentRound(0);
    setChoiceHistory([]);
    setPhase('game');
    const round = STORY_ROUNDS[0];
    const text = round.story(p, '');
    setTimeout(() => typeText(text), 300);
  };

  const handleChoice = (choiceId: string) => {
    if (isTyping || selectedChoice) return;
    setSelectedChoice(choiceId);
    const newHistory = [...choiceHistory, choiceId];
    setChoiceHistory(newHistory);

    setTimeout(() => {
      const nextRoundIdx = currentRound + 1;
      setCurrentRound(nextRoundIdx);
      setSelectedChoice(null);

      if (nextRoundIdx >= STORY_ROUNDS.length - 1) {
        // 最终结局
        const endRound = STORY_ROUNDS[STORY_ROUNDS.length - 1];
        const endText = endRound.story(profile!, choiceId);
        typeText(endText, () => {
          setTimeout(() => setPhase('ending'), 800);
        });
      } else {
        const nextRound = STORY_ROUNDS[nextRoundIdx];
        const text = nextRound.story(profile!, choiceId);
        typeText(text);
      }
    }, 400);
  };

  const skipTyping = () => {
    if (!isTyping) return;
    if (typingTimer.current) clearTimeout(typingTimer.current);
    const round = STORY_ROUNDS[currentRound];
    const prevChoice = choiceHistory[choiceHistory.length - 1] || '';
    setStoryText(round.story(profile!, prevChoice));
    setIsTyping(false);
    setShowChoices(true);
  };

  const currentRoundData = STORY_ROUNDS[currentRound];
  const progress = Math.round((currentRound / (STORY_ROUNDS.length - 1)) * 100);

  // ── 结局内容 ──────────────────────────────────────────────────────────────
  const getEnding = () => {
    if (!profile) return null;
    const lastChoice = choiceHistory[choiceHistory.length - 1] || 'c';
    const endingMap: Record<string, { title: string; type: string; egg: string }> = {
      a: {
        title: '星际商业帝国结局',
        type: '【宇宙级暴富】',
        egg: `彩蛋：当年那个以「风水」开除你的${profile.enemy || '前老板'}，现在是你公司的保洁大叔，每天负责擦你办公室的落地窗。你的${profile.pet || '猫'}有专属私人飞机，${profile.hobby || '爱好'}已经成了全球最火的文化产业。`,
      },
      b: {
        title: '草根逆袭传奇结局',
        type: '【情怀暴富】',
        egg: `彩蛋：${profile.enemy || '前老板'}在你的慈善晚宴上，亲手给你颁了一个「最佳逆袭奖」，全程笑容僵硬。你的${profile.pet || '猫'}代言了全球最贵的宠物品牌，${profile.hobby || '爱好'}被联合国列为「人类非物质文化遗产」。`,
      },
      c: {
        title: '全球精神领袖结局',
        type: '【影响力暴富】',
        egg: `彩蛋：你的口头禅「${profile.catchphrase || '就这？'}」被收录进了牛津词典，释义是「一种来自东方的淡定哲学」。${profile.enemy || '前老板'}开了一个账号，专门转发你的励志语录，粉丝只有12个。`,
      },
      d: {
        title: '天降遗产躺平结局',
        type: '【玄学暴富】',
        egg: `彩蛋：你带着${profile.pet || '猫'}找到的那个「废弃仓库」，后来被发现是一个古代宝库，里面有一件文物，上面刻着你的名字——你祖上早就算到了这一天。${profile.enemy || '前老板'}现在是你家的司机，每天接送你去${profile.hobby || '爱好'}俱乐部。`,
      },
    };
    return endingMap[lastChoice] || endingMap.c;
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col" style={{ background: '#0F0F1E' }}>
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-10 pb-3 shrink-0">
        <button
          onClick={onClose}
          className="w-9 h-9 flex items-center justify-center rounded-xl cursor-pointer"
          style={{ background: 'rgba(255,255,255,0.06)' }}
        >
          <i className="ri-arrow-left-line" style={{ color: '#E0EFFF' }} />
        </button>
        <div className="flex items-center gap-2 flex-1">
          <div className="w-8 h-8 flex items-center justify-center rounded-xl" style={{ background: `${TINT}22` }}>
            <i className={`${sim.icon} text-base`} style={{ color: TINT }} />
          </div>
          <span className="font-orbitron text-sm font-bold" style={{ color: '#E0EFFF' }}>{sim.name}</span>
        </div>
        {phase === 'game' && (
          <div className="flex items-center gap-2">
            <span className="font-orbitron text-xs" style={{ color: 'rgba(224,239,255,0.4)' }}>
              {currentRound + 1}/{STORY_ROUNDS.length}
            </span>
            <div className="w-16 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${progress}%`, background: `linear-gradient(90deg, ${TINT}, #E17055)` }}
              />
            </div>
          </div>
        )}
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 pb-8">

        {/* ── 介绍页 ── */}
        {phase === 'intro' && (
          <div className="flex flex-col gap-5 pt-2">
            <div
              className="w-full h-44 rounded-3xl flex items-center justify-center relative overflow-hidden"
              style={{
                background: `radial-gradient(circle at 50% 60%, ${TINT}22 0%, rgba(15,15,30,0.9) 70%)`,
                border: `1px solid ${TINT}33`,
              }}
            >
              <div className="absolute inset-0 flex items-center justify-center">
                <i className={`${sim.icon}`} style={{ fontSize: '80px', color: `${TINT}22` }} />
              </div>
              <div className="relative z-10 text-center px-6">
                <i className={`${sim.icon} text-5xl mb-3 block`} style={{ color: TINT }} />
                <p className="text-sm font-noto font-bold" style={{ color: '#E0EFFF' }}>草根逆袭 · 狗血暴富</p>
                <p className="text-xs font-noto mt-1" style={{ color: 'rgba(224,239,255,0.5)' }}>20回合 · AI专属剧情 · 反转无上限</p>
              </div>
            </div>

            <div className="p-5 rounded-3xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <div className="flex items-center gap-2 mb-3">
                <i className="ri-sparkling-line text-sm" style={{ color: TINT }} />
                <span className="text-xs font-orbitron tracking-wider" style={{ color: TINT }}>模拟器说明</span>
              </div>
              <p className="text-sm font-noto leading-relaxed" style={{ color: 'rgba(224,239,255,0.7)' }}>
                基于你的个人数据，AI将为你生成一段<strong style={{ color: '#E0EFFF' }}>专属的草根逆袭暴富剧情</strong>。
                全程爆笑拉满、反转无上限、狗血浓度超标，至少20个交互回合，最终落地你的专属暴富结局。
              </p>
              <div className="flex gap-2 mt-3 flex-wrap">
                {['无厘头搞笑', '极致狗血', '疯狂反转', '爽文逆袭'].map((tag) => (
                  <span key={tag} className="px-2.5 py-1 rounded-full text-xs font-noto"
                    style={{ background: `${TINT}15`, border: `1px solid ${TINT}30`, color: TINT }}>
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: 'ri-user-line', label: '填入个人数据', desc: '越真实越好玩' },
                { icon: 'ri-gamepad-line', label: '20回合交互', desc: '每回合都有反转' },
                { icon: 'ri-sparkling-2-line', label: 'AI专属剧情', desc: '深度贴合你的标签' },
                { icon: 'ri-trophy-line', label: '专属暴富结局', desc: '多种结局路径' },
              ].map((item) => (
                <div key={item.label} className="p-3 rounded-2xl flex items-start gap-2.5"
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div className="w-7 h-7 flex items-center justify-center rounded-lg shrink-0" style={{ background: `${TINT}18` }}>
                    <i className={`${item.icon} text-xs`} style={{ color: TINT }} />
                  </div>
                  <div>
                    <p className="text-xs font-noto font-semibold" style={{ color: '#E0EFFF' }}>{item.label}</p>
                    <p className="text-xs font-noto" style={{ color: 'rgba(224,239,255,0.4)', fontSize: '10px' }}>{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => setPhase('profile')}
              className="w-full py-4 rounded-2xl font-orbitron text-sm font-bold tracking-widest cursor-pointer whitespace-nowrap transition-all duration-300 active:scale-95"
              style={{
                background: `linear-gradient(135deg, ${TINT}cc, #E17055cc)`,
                color: '#1a1a2e',
                boxShadow: `0 0 24px ${TINT}44`,
              }}
            >
              填入我的数据，开始逆袭 →
            </button>
          </div>
        )}

        {/* ── 填写画像 ── */}
        {phase === 'profile' && (
          <div className="pt-2">
            <div className="mb-4">
              <h3 className="font-orbitron text-base font-bold mb-1" style={{ color: '#E0EFFF' }}>填入你的个人数据</h3>
              <p className="text-xs font-noto" style={{ color: 'rgba(224,239,255,0.45)' }}>AI将基于这些信息为你生成专属剧情</p>
            </div>
            <ProfileForm onSubmit={startGame} />
          </div>
        )}

        {/* ── 游戏主体 ── */}
        {phase === 'game' && profile && (
          <div className="flex flex-col gap-4 pt-2">
            {/* 回合标记 */}
            <div className="flex items-center gap-2">
              <div className="px-2.5 py-1 rounded-full flex items-center gap-1.5"
                style={{ background: `${TINT}18`, border: `1px solid ${TINT}30` }}>
                <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: TINT }} />
                <span className="font-orbitron text-xs" style={{ color: TINT }}>
                  第 {currentRound + 1} 回合
                </span>
              </div>
              {currentRound >= 15 && (
                <div className="px-2.5 py-1 rounded-full"
                  style={{ background: 'rgba(255,118,118,0.15)', border: '1px solid rgba(255,118,118,0.3)' }}>
                  <span className="font-orbitron text-xs" style={{ color: '#FF7675' }}>结局临近</span>
                </div>
              )}
            </div>

            {/* 剧情文本 */}
            <div
              className="p-5 rounded-3xl cursor-pointer"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', minHeight: '120px' }}
              onClick={skipTyping}
            >
              <p className="text-sm font-noto leading-relaxed" style={{ color: 'rgba(224,239,255,0.85)' }}>
                {storyText}
                {isTyping && (
                  <span className="inline-block w-0.5 h-4 ml-0.5 animate-pulse align-middle" style={{ background: TINT }} />
                )}
              </p>
              {isTyping && (
                <p className="text-xs font-noto mt-3" style={{ color: 'rgba(224,239,255,0.25)' }}>点击跳过</p>
              )}
            </div>

            {/* 选项 */}
            {showChoices && currentRoundData?.choices && currentRoundData.choices.length > 0 && (
              <div className="flex flex-col gap-2.5">
                <div className="flex items-center gap-2 mb-1">
                  <i className="ri-question-line text-xs" style={{ color: 'rgba(224,239,255,0.4)' }} />
                  <span className="text-xs font-orbitron tracking-wider" style={{ color: 'rgba(224,239,255,0.4)' }}>你的选择</span>
                </div>
                {currentRoundData.choices.map((choice) => (
                  <button
                    key={choice.id}
                    onClick={() => handleChoice(choice.id)}
                    disabled={!!selectedChoice}
                    className="flex items-center gap-3 p-4 rounded-2xl cursor-pointer transition-all duration-200 active:scale-98 text-left"
                    style={{
                      background: selectedChoice === choice.id
                        ? `${TINT}18`
                        : 'rgba(255,255,255,0.04)',
                      border: selectedChoice === choice.id
                        ? `1px solid ${TINT}55`
                        : '1px solid rgba(255,255,255,0.08)',
                      opacity: selectedChoice && selectedChoice !== choice.id ? 0.4 : 1,
                    }}
                  >
                    <div className="w-9 h-9 flex items-center justify-center rounded-xl shrink-0"
                      style={{ background: `${TINT}18` }}>
                      <i className={`${choice.icon} text-sm`} style={{ color: TINT }} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-noto" style={{ color: '#E0EFFF', lineHeight: 1.5 }}>{choice.text}</p>
                      <span className="text-xs font-noto mt-0.5 inline-block"
                        style={{ color: TINT, opacity: 0.7, fontSize: '10px' }}>
                        {choice.tag}
                      </span>
                    </div>
                    <i className="ri-arrow-right-s-line shrink-0" style={{ color: 'rgba(224,239,255,0.25)' }} />
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── 结局页 ── */}
        {phase === 'ending' && profile && (() => {
          const ending = getEnding();
          if (!ending) return null;
          return (
            <div className="flex flex-col gap-5 pt-2">
              {/* 结局横幅 */}
              <div className="p-6 rounded-3xl text-center"
                style={{
                  background: `radial-gradient(circle at 50% 30%, ${TINT}22 0%, rgba(15,15,30,0.95) 70%)`,
                  border: `1px solid ${TINT}44`,
                }}>
                <div className="w-16 h-16 flex items-center justify-center rounded-full mx-auto mb-4"
                  style={{ background: `${TINT}22`, border: `2px solid ${TINT}66` }}>
                  <i className="ri-trophy-line text-3xl" style={{ color: TINT }} />
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full mb-3"
                  style={{ background: `${TINT}22`, border: `1px solid ${TINT}44` }}>
                  <i className="ri-sparkling-line text-xs" style={{ color: TINT }} />
                  <span className="text-xs font-orbitron tracking-wider" style={{ color: TINT }}>结局达成</span>
                </div>
                <p className="text-xs font-noto mb-2" style={{ color: TINT, opacity: 0.8 }}>{ending.type}</p>
                <h3 className="font-orbitron text-lg font-bold mb-3" style={{ color: '#E0EFFF' }}>{ending.title}</h3>
                <p className="text-sm font-noto leading-relaxed" style={{ color: 'rgba(224,239,255,0.7)' }}>
                  {storyText}
                </p>
              </div>

              {/* 彩蛋 */}
              <div className="p-4 rounded-2xl"
                style={{ background: 'rgba(253,203,110,0.08)', border: '1px solid rgba(253,203,110,0.25)' }}>
                <div className="flex items-center gap-2 mb-2">
                  <i className="ri-gift-2-line text-sm" style={{ color: '#FDCB6E' }} />
                  <span className="text-xs font-orbitron tracking-wider" style={{ color: '#FDCB6E' }}>专属狗血彩蛋</span>
                </div>
                <p className="text-sm font-noto leading-relaxed" style={{ color: 'rgba(224,239,255,0.7)' }}>
                  {ending.egg}
                </p>
              </div>

              {/* 统计 */}
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: '完成回合', value: `${STORY_ROUNDS.length}回合`, icon: 'ri-gamepad-line' },
                  { label: '逆袭指数', value: '999%', icon: 'ri-line-chart-line' },
                  { label: '狗血浓度', value: '超标', icon: 'ri-drop-line' },
                ].map((stat) => (
                  <div key={stat.label} className="p-3 rounded-2xl text-center"
                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                    <i className={`${stat.icon} text-base mb-1 block`} style={{ color: TINT }} />
                    <p className="font-orbitron text-sm font-bold" style={{ color: '#E0EFFF' }}>{stat.value}</p>
                    <p className="text-xs font-noto" style={{ color: 'rgba(224,239,255,0.4)', fontSize: '10px' }}>{stat.label}</p>
                  </div>
                ))}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setPhase('profile');
                    setCurrentRound(0);
                    setChoiceHistory([]);
                    setStoryText('');
                    setShowChoices(false);
                  }}
                  className="flex-1 py-3.5 rounded-2xl text-sm font-noto cursor-pointer whitespace-nowrap"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(224,239,255,0.5)' }}
                >
                  换个人生再玩
                </button>
                <button
                  onClick={onClose}
                  className="flex-1 py-3.5 rounded-2xl text-sm font-noto font-bold cursor-pointer whitespace-nowrap"
                  style={{ background: `linear-gradient(135deg, ${TINT}cc, #E17055cc)`, color: '#1a1a2e' }}
                >
                  返回模拟器
                </button>
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
}
