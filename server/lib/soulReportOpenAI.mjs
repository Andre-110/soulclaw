import { scrapeOutcomeToDisplayName } from './profileScrape.mjs';

function blockIcon(platform) {
  if (platform === 'netease' || platform === 'douyin') return '🎵';
  if (platform === 'douban') return '🎬';
  if (platform === 'weibo') return '👀';
  if (platform === 'zhihu') return '💡';
  return '📕';
}

function inferMbti(tagsText) {
  const text = String(tagsText || '');
  if (/社交|表达|热闹|舞台/.test(text)) return 'ENFP';
  if (/理性|系统|规划|效率/.test(text)) return 'INTJ';
  if (/温柔|共情|治愈|关系/.test(text)) return 'INFJ';
  if (/创作|审美|电影|音乐|文字/.test(text)) return 'INFP';
  return 'ISFP';
}

function buildOverall(profile, scrapes) {
  const boundCount = scrapes.length;
  const okCount = scrapes.filter((item) => item.ok).length;
  const tagText = (profile.tags || []).slice(0, 4).join('、') || '低噪音表达';
  const nickname = profile.nickname || '这位使用者';
  return `${nickname} 的线上痕迹呈现出明显的 ${tagText} 倾向。当前共接入 ${boundCount} 个平台，其中 ${okCount} 个拿到了可读线索；综合可见内容，这是一类更依赖氛围、兴趣和表达密度被识别的人，不是靠高频社交取胜，而是靠持续稳定的内容气质积累辨识度。`;
}

export function buildFallbackSoulReport({ profile, scrapes, userTexts }) {
  const joinedText = [
    profile.nickname || '',
    ...(profile.tags || []),
    ...Object.values(profile.answers || {}),
    ...(userTexts || []),
    ...scrapes.map((item) => item.excerpt || ''),
  ].join(' ');

  const mbti = inferMbti(joinedText);
  const tags = Array.from(new Set([...(profile.tags || []), ...Object.values(profile.answers || {})].filter(Boolean))).slice(0, 8);
  const blocks = scrapes.map((outcome) => ({
    source: `${scrapeOutcomeToDisplayName(outcome)} · 公开页摘录`,
    icon: blockIcon(outcome.platform),
    tags: outcome.ok ? ['平台线索', '公开内容'] : ['读取受限'],
    title: outcome.ok ? '抓取到的可见内容' : '当前未读取到稳定正文',
    description: outcome.ok
      ? outcome.excerpt
      : `${scrapeOutcomeToDisplayName(outcome)} 当前只拿到有限信息。建议继续补充主页截图、问卷自述或稳定可访问的主页链接。`,
  }));

  if (userTexts?.length) {
    blocks.push({
      source: '用户自述 · 侧写补足',
      icon: '✍️',
      tags: ['主观输入', '建档材料'],
      title: '你主动提供的补充信息',
      description: userTexts.join('\n\n').slice(0, 1800),
    });
  }

  return {
    mbti,
    title: `${(profile.nickname || '你的分身')} 的多平台星核报告`,
    avatarTags: tags.length ? tags.slice(0, 3) : ['低噪音', '高辨识度', '兴趣驱动'],
    overall: buildOverall(profile, scrapes),
    blocks,
    article: {
      headline: '灵魂画像已完成聚合',
      guaranteeIntro: '这份报告基于平台公开信息、你主动补充的内容，以及现有可解析的主页文本生成。若平台有登录墙或反爬，报告会明确标注信息边界。',
      section2: {
        title: '可见吸引力',
        celebrities: [
          {
            name: '高辨识度表达者',
            recommendReason: '你的内容不是高频轰炸型，而是更容易在特定同温层里被快速识别。',
          },
          {
            name: '氛围型连接者',
            recommendReason: '相比直接推销自己，你更适合通过审美、兴趣和日常痕迹建立连接。',
          },
        ],
      },
      section3: {
        fourHumorTheory: { type: '慢热高密度', note: '越往后越能看出一致的表达方向。' },
        lovePersona16: { type: mbti, note: '由平台文本与自述共同推断，适合作为初版人格标签。' },
        animalPersona: { type: '夜航鸟', note: '擅长在安静环境里稳定输出自己的世界观。' },
        todayFortune: {
          love: '适合从共同兴趣切入，而不是硬聊。',
          career: '你的优势在于风格一致性，不在于曝光量。',
          wealth: '适合把长期积累的内容气质转成信任资产。',
        },
      },
      section4: {
        personaName: `${profile.nickname || '你的分身'} · 星核版`,
        personaCore: buildOverall(profile, scrapes),
        dayParts: [
          {
            clock: '08:30',
            slot: '晨间信号',
            paragraph: '你的线上痕迹不像热闹的广场，更像精选过的窗口。别人点进来后，首先感受到的是稳定的气质，而不是密集的自我介绍。',
            sourceTag: '平台聚合',
            detailTags: tags.slice(0, 3),
          },
          {
            clock: '21:40',
            slot: '夜间浓度',
            paragraph: '越靠近夜晚，你的表达越容易显出真实浓度。这个分身更适合进入剧情感、情绪感和兴趣感更强的互动场景。',
            sourceTag: '报告推断',
            detailTags: ['慢热', '氛围感', '可持续连接'],
          },
        ],
        finalCard: {
          intro: '你适合先被理解，再被喜欢。',
          summaryLines: [
            '适合从兴趣与审美入场，而不是直接自我营销。',
            '更适合深聊型关系，不适合噪音式社交。',
            '可以继续用模拟器剧情反向校准这份画像。',
          ],
          closingLine: '这是一份可以继续迭代的星核档案，而不是一次性结论。',
        },
      },
    },
  };
}

async function callOpenAI(apiKey, model, prompt) {
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
        temperature: 0.7,
        max_tokens: 2200,
        response_format: { type: 'json_object' },
        messages: [
          {
            role: 'system',
            content: '你是 SoulClaw 的报告生成器。请根据输入的用户标签、平台抓取线索与问卷内容，输出 JSON，字段必须包含 mbti、title、avatarTags、overall、blocks。blocks 为数组，每项包含 source、icon、tags、title、description。措辞具体，不要空泛。',
          },
          { role: 'user', content: prompt },
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

export async function tryOpenAISoulReport({ profile, scrapes, userTexts }) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;
  const prompt = JSON.stringify({ profile, scrapes, userTexts }, null, 2);
  const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';
  return callOpenAI(apiKey, model, prompt);
}
