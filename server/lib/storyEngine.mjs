function stableHash(value) {
  const text = String(value || '');
  let hash = 0;
  for (let index = 0; index < text.length; index += 1) {
    hash = (hash * 31 + text.charCodeAt(index)) % 2147483647;
  }
  return hash;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function pick(list, seed) {
  if (!list.length) return '';
  return list[Math.abs(seed) % list.length];
}

function normalizeStyle(rawStyle = {}) {
  return {
    language: rawStyle.language || 'zh-CN',
    tone: rawStyle.tone || '戏剧张力强',
    voice: rawStyle.voice || '第三人称近景',
    extra: rawStyle.extra || '',
  };
}

function normalizeState(rawState = {}) {
  return {
    momentum: clamp(Number(rawState.momentum ?? 42), 0, 100),
    tension: clamp(Number(rawState.tension ?? 36), 0, 100),
    clue: clamp(Number(rawState.clue ?? 1), 0, 100),
    bond: clamp(Number(rawState.bond ?? 28), 0, 100),
    stability: clamp(Number(rawState.stability ?? 62), 0, 100),
    round_count: Math.max(1, Number(rawState.round_count ?? 1)),
    max_time: Math.max(6, Number(rawState.max_time ?? 12)),
  };
}

function buildPromptEnvelope(params) {
  const style = normalizeStyle(params.style);
  const state = normalizeState(params.state);
  return {
    background: {
      sourceType: params.background?.sourceType || 'system',
      title: params.background?.title || '未命名模拟器',
      genre: params.background?.genre || '互动故事',
      opening: params.background?.opening || params.background?.background || '',
      referenceSummary: params.background?.referenceSummary || '',
    },
    style,
    history: Array.isArray(params.history) ? params.history.slice(-6) : [],
    selectedChoice: params.selectedChoice || null,
    turn: Math.max(1, Number(params.turn || 1)),
    state,
  };
}

function buildSystemPrompt() {
  return [
    '你是 SoulClaw 的统一故事延续引擎。',
    '你的任务是根据给定背景、风格要求、历史剧情、当前状态和用户上一步选择，续写下一轮互动故事。',
    '必须输出 JSON，不得输出 JSON 之外的解释。',
    'JSON 字段必须包含：story、choices、state、hint、isEnding。',
    'choices 必须是 2 到 4 个对象数组，每项包含 id、text、desc、tag。',
    'state 必须返回 momentum、tension、clue、bond、stability、round_count、max_time。',
    'story 需要承接上一轮，体现用户指定的语言风格、语气和叙述方式。',
    '当 round_count >= max_time 时，可以输出结局，并将 isEnding 设为 true，choices 设为空数组。',
    '除非已经到结局线，否则不要提前结束。',
  ].join(' ');
}

function buildUserPrompt(params) {
  return JSON.stringify(buildPromptEnvelope(params), null, 2);
}

async function callOpenAI(params) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;
  const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';
  const baseUrl = (process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1').replace(/\/+$/, '');
  try {
    const res = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        temperature: 0.85,
        max_tokens: 1600,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: buildSystemPrompt() },
          { role: 'user', content: buildUserPrompt(params) },
        ],
      }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    const raw = data?.choices?.[0]?.message?.content;
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function buildChoiceTextPool(style) {
  const toneMap = {
    戏剧张力强: ['正面硬刚', '顺势设局', '借机放大影响', '先稳住再反击'],
    克制冷静: ['先观察再动手', '保留筹码', '问清边界', '低调推进'],
    黑色幽默: ['一本正经地离谱', '把局面演得更荒诞', '借梗反刺', '假装配合实际拆台'],
    热血爽文: ['直接提速', '拉满气场', '当场改写规则', '把主动权抢回来'],
    悬疑压迫: ['先藏信息', '试探对方真实意图', '制造误判', '沿着线索继续下探'],
    治愈慢热: ['先接住情绪', '留一点余地', '做一个小而稳的选择', '把关系重新扶起来'],
  };
  return toneMap[style.tone] || toneMap['戏剧张力强'];
}

function fallbackDynamicTurn(params) {
  const envelope = buildPromptEnvelope(params);
  const { background, style } = envelope;
  const state = normalizeState(envelope.state);
  const choiceSeed = stableHash(JSON.stringify(envelope.history) + JSON.stringify(envelope.selectedChoice));
  const actionPool = buildChoiceTextPool(style);
  const focusWord = pick((background.opening || background.referenceSummary || background.title).split(/[，。；、\s\n]+/).filter(Boolean), choiceSeed) || background.title;
  const narratorLead = style.voice === '第一人称沉浸' ? '我' : background.title;
  const lastChoiceText = envelope.selectedChoice?.text || envelope.selectedChoice || '你刚刚做出的选择';

  if (state.round_count >= state.max_time) {
    return {
      story: `${narratorLead}把一路积攒下来的线索、情绪和主动权一次性收拢。围绕“${focusWord}”爆开的所有支线终于在这一刻扣回主线，之前那些看似离散的决定，都被证明是在替这个结局铺路。最终局面没有回到最初的样子，而是被你亲手改写成了更符合这套背景和风格的版本。那些曾经压在头顶的限制，如今只剩下被拿来当彩蛋回看的份。`,
      choices: [],
      hint: '故事已经收束成结局，可以重开或切换另一种交互模式继续测试。',
      state: { ...state, round_count: state.max_time },
      isEnding: true,
    };
  }

  const tensionShift = stableHash(lastChoiceText) % 9 - 3;
  const momentumShift = stableHash(background.title + lastChoiceText) % 11 - 2;
  const clueShift = stableHash(background.opening) % 4;
  const bondShift = stableHash(style.extra + focusWord) % 7 - 2;
  const stabilityShift = stableHash(style.voice + lastChoiceText) % 9 - 4;

  const nextState = normalizeState({
    ...state,
    momentum: state.momentum + momentumShift,
    tension: state.tension + tensionShift,
    clue: state.clue + clueShift,
    bond: state.bond + bondShift,
    stability: state.stability + stabilityShift,
    round_count: state.round_count + 1,
  });

  const bridgeLineMap = {
    戏剧张力强: `上一轮你选择了“${lastChoiceText}”，局面没有变简单，反而把隐藏矛盾一起扯到了台前。`,
    克制冷静: `你刚刚用“${lastChoiceText}”把节奏稳了一下，但水面下的变化已经开始累积。`,
    黑色幽默: `“${lastChoiceText}”这一步看起来离谱，实际效果却比所有正经方案都快。`,
    热血爽文: `你一把把“${lastChoiceText}”推到底，气场直接把原本的被动局面翻了过来。`,
    悬疑压迫: `“${lastChoiceText}”像是轻轻拨动了一根线，更多没显形的东西也跟着晃了起来。`,
    治愈慢热: `你先用“${lastChoiceText}”接住了眼前这一步，于是故事开始出现一点缓慢但真实的松动。`,
  };

  const atmosphereLine = `${style.voice}的叙述视角让这一轮更贴近“${style.tone}”的质感，围绕“${focusWord}”延展出来的新状况，让故事同时出现了推进、试探和重新分配主动权的空间。`;
  const stateLine = `眼下最明显的变化是：推进势能 ${nextState.momentum}，紧张值 ${nextState.tension}，线索值 ${nextState.clue}，关系值 ${nextState.bond}，稳定度 ${nextState.stability}。`;
  const extraStyleLine = style.extra ? `另外，你之前指定的额外风格要求是“${style.extra}”，所以这一轮也要继续保留这种语言气味。` : '';

  const choiceObjects = actionPool.map((label, index) => ({
    id: `dyn_${nextState.round_count}_${index + 1}`,
    text: `${label}：围绕“${focusWord}”把这一轮往${index % 2 === 0 ? '更主动' : '更隐蔽'}的方向推进`,
    desc: `${index === 0 ? '适合想抢节奏' : index === 1 ? '适合继续试探' : index === 2 ? '适合放大冲突' : '适合留后手'}，同时保持当前的${style.tone}叙述质感。`,
    tag: index === 0 ? '推进' : index === 1 ? '试探' : index === 2 ? '反转' : '蓄力',
  })).slice(0, 4);

  return {
    story: [bridgeLineMap[style.tone] || bridgeLineMap['戏剧张力强'], atmosphereLine, stateLine, extraStyleLine].filter(Boolean).join(' '),
    choices: choiceObjects,
    hint: nextState.round_count >= nextState.max_time - 1 ? '你已经接近结局线，这一轮之后很可能进入收束阶段。' : `下一轮更适合继续围绕“${focusWord}”做推进，但别忘了维持你指定的 ${style.tone} 语气。`,
    state: nextState,
    isEnding: false,
  };
}

function normalizeTurnResult(result, fallbackState) {
  if (!result) return null;
  const normalizedState = normalizeState(result.state || fallbackState);
  const rawChoices = Array.isArray(result.choices) ? result.choices : [];
  const choices = rawChoices.map((choice, index) => {
    if (typeof choice === 'string') {
      return {
        id: `choice_${normalizedState.round_count}_${index + 1}`,
        text: choice,
        desc: '继续把故事往新的方向推进。',
        tag: '动态生成',
      };
    }
    return {
      id: choice.id || `choice_${normalizedState.round_count}_${index + 1}`,
      text: choice.text || choice.name || `选项 ${index + 1}`,
      desc: choice.desc || '继续把故事往新的方向推进。',
      tag: choice.tag || '动态生成',
    };
  }).slice(0, 4);
  return {
    story: String(result.story || ''),
    choices,
    state: normalizedState,
    hint: result.hint || '下一轮会根据你刚才的选择继续生成。',
    isEnding: Boolean(result.isEnding),
  };
}

export async function continueDynamicStory(params) {
  const fallback = fallbackDynamicTurn(params);
  const remote = await callOpenAI(params);
  return normalizeTurnResult(remote, fallback.state) || fallback;
}
