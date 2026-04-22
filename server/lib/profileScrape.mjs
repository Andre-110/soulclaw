import * as cheerio from 'cheerio';
import { normalizePlatformKey } from './platformUrls.mjs';

const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

const PUBLIC_LABEL = {
  weibo: '微博',
  xhs: '小红书',
  douyin: '抖音',
  netease: '网易云音乐',
  douban: '豆瓣',
  zhihu: '知乎',
  wechat: '朋友圈',
  moreading: '微信读书',
};

export function scrapeOutcomeToDisplayName(outcome) {
  return PUBLIC_LABEL[outcome.platform] || outcome.platform;
}

export function summarizeScrapesForLog(scrapes) {
  return scrapes.map((o) => `${o.platform}:${o.ok ? 'ok' : 'fail'}/${o.method || '-'}/excerpt=${(o.excerpt || '').length}`).join(' | ');
}

function getCookieHeader(platform) {
  const envKey = `COOKIE_${String(platform || '').toUpperCase()}`;
  return process.env[envKey] || '';
}

function clip(text, max = 2400) {
  const normalized = String(text || '').replace(/\s+/g, ' ').trim();
  return normalized.length <= max ? normalized : `${normalized.slice(0, max)}…`;
}

async function fetchWithTimeout(url, init = {}, ms = 18000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  try {
    return await fetch(url, { ...init, signal: controller.signal, redirect: 'follow' });
  } finally {
    clearTimeout(timer);
  }
}

function looksLikeLoginOrShell(text) {
  const t = String(text || '').trim();
  if (t.length < 40) return true;
  return /登录|扫码登录|请登录|验证|403|404|429|安全验证/i.test(t);
}

async function scrapeViaJinaReader(targetUrl) {
  try {
    const url = `https://r.jina.ai/http://${String(targetUrl || '').replace(/^https?:\/\//, '').replace(/^\/+/, '')}`;
    const res = await fetchWithTimeout(
      url,
      {
        headers: {
          'User-Agent': UA,
          Accept: 'text/plain,text/markdown,*/*',
          'X-Return-Format': 'markdown',
        },
      },
      30000,
    );
    if (!res.ok) return '';
    let text = await res.text();
    const idx = text.indexOf('Markdown Content:');
    if (idx !== -1) text = text.slice(idx + 'Markdown Content:'.length).trim();
    text = text.replace(/\n{3,}/g, '\n\n').trim();
    return looksLikeLoginOrShell(text) ? '' : clip(text, 2400);
  } catch {
    return '';
  }
}

async function scrapeHtmlDirect(url, cookie) {
  try {
    const res = await fetchWithTimeout(url, {
      headers: {
        'User-Agent': UA,
        Accept: 'text/html,*/*',
        'Accept-Language': 'zh-CN,zh;q=0.9',
        ...(cookie ? { Cookie: cookie } : {}),
      },
    });
    if (!res.ok) return '';
    const html = await res.text();
    const $ = cheerio.load(html);
    const title = $('title').first().text().trim();
    const desc = $('meta[name="description"]').attr('content') || $('meta[property="og:description"]').attr('content') || '';
    $('script,noscript,style').remove();
    const body = $('body').text().replace(/\s+/g, ' ').trim();
    const chunk = [title, desc, body.slice(0, 2000)].filter(Boolean).join('\n');
    return looksLikeLoginOrShell(chunk) ? '' : clip(chunk);
  } catch {
    return '';
  }
}

async function directThenReader(url, cookie) {
  const htmlText = await scrapeHtmlDirect(url, cookie);
  if (htmlText.length >= 120) return { text: htmlText, method: 'http-html' };
  const readerText = await scrapeViaJinaReader(url);
  if (readerText.length >= 80) return { text: readerText, method: 'reader-proxy' };
  return { text: htmlText || readerText || '', method: htmlText ? 'http-html' : readerText ? 'reader-proxy' : 'none' };
}

async function scrapeGeneric(platform, profileUrl) {
  const cookie = getCookieHeader(platform);
  const { text, method } = await directThenReader(profileUrl, cookie);
  return {
    platform,
    url: profileUrl,
    ok: text.length >= 40,
    excerpt: text,
    method,
  };
}

export async function scrapeWeibo(extractedId, profileUrl) {
  const cookie = getCookieHeader('weibo');
  if (extractedId) {
    try {
      const res = await fetchWithTimeout(`https://weibo.com/ajax/profile/info?uid=${encodeURIComponent(extractedId)}`, {
        headers: {
          'User-Agent': UA,
          Referer: 'https://weibo.com/',
          Accept: 'application/json, text/plain, */*',
          'X-Requested-With': 'XMLHttpRequest',
          ...(cookie ? { Cookie: cookie } : {}),
        },
      });
      if (res.ok) {
        const data = await res.json();
        const u = data?.data?.user;
        if (u?.screen_name) {
          const parts = [
            `昵称：${u.screen_name}`,
            u.description && `简介：${u.description}`,
            u.location && `地区：${u.location}`,
            u.followers_count != null && `粉丝数：${u.followers_count}`,
            u.friends_count != null && `关注数：${u.friends_count}`,
            u.statuses_count != null && `微博数：${u.statuses_count}`,
          ].filter(Boolean);
          return { platform: 'weibo', url: profileUrl, ok: true, excerpt: clip(parts.join('\n')), method: 'weibo-ajax-api' };
        }
      }
    } catch {
      // fallback below
    }
  }
  return scrapeGeneric('weibo', profileUrl);
}

export async function scrapeNetease(extractedId, profileUrl) {
  const cookie = getCookieHeader('netease');
  if (extractedId) {
    try {
      const res = await fetchWithTimeout(`https://music.163.com/api/v1/user/detail/${encodeURIComponent(extractedId)}`, {
        headers: { 'User-Agent': UA, Referer: 'https://music.163.com/', ...(cookie ? { Cookie: cookie } : {}) },
      });
      if (res.ok) {
        const data = await res.json();
        const p = data?.profile;
        if (p?.nickname) {
          const parts = [
            `昵称：${p.nickname}`,
            p.signature && `签名：${p.signature}`,
            p.followeds != null && `粉丝数：${p.followeds}`,
            p.follows != null && `关注数：${p.follows}`,
            data.listenSongs != null && `听歌数：${data.listenSongs}`,
            data.level != null && `等级：${data.level}`,
          ].filter(Boolean);
          return { platform: 'netease', url: profileUrl, ok: true, excerpt: clip(parts.join('\n')), method: 'netease-api-v1' };
        }
      }
    } catch {
      // fallback below
    }
  }
  return scrapeGeneric('netease', profileUrl);
}

export async function scrapeZhihu(extractedId, profileUrl) {
  const cookie = getCookieHeader('zhihu');
  if (extractedId) {
    try {
      const apiUrl = `https://www.zhihu.com/api/v4/members/${encodeURIComponent(extractedId)}?include=headline,answer_count,articles_count,follower_count,voteup_count`;
      const res = await fetchWithTimeout(apiUrl, {
        headers: {
          'User-Agent': UA,
          Referer: 'https://www.zhihu.com/',
          Accept: 'application/json',
          ...(cookie ? { Cookie: cookie } : {}),
        },
      });
      if (res.ok) {
        const data = await res.json();
        if (data?.name) {
          const parts = [
            `昵称：${data.name}`,
            data.headline && `一句话介绍：${data.headline}`,
            data.description && `个人简介：${data.description}`,
            data.answer_count != null && `回答数：${data.answer_count}`,
            data.articles_count != null && `文章数：${data.articles_count}`,
            data.follower_count != null && `关注者：${data.follower_count}`,
            data.voteup_count != null && `获赞数：${data.voteup_count}`,
          ].filter(Boolean);
          return { platform: 'zhihu', url: profileUrl, ok: true, excerpt: clip(parts.join('\n')), method: 'zhihu-api' };
        }
      }
    } catch {
      // fallback below
    }
  }
  return scrapeGeneric('zhihu', profileUrl);
}

export async function scrapeDouban(extractedId, profileUrl) {
  const cookie = getCookieHeader('douban');
  if (extractedId) {
    try {
      const apiUrl = `https://m.douban.com/rexxar/api/v2/user/${encodeURIComponent(extractedId)}`;
      const res = await fetchWithTimeout(apiUrl, {
        headers: {
          'User-Agent': UA,
          Referer: 'https://www.douban.com/',
          Accept: 'application/json',
          ...(cookie ? { Cookie: cookie } : {}),
        },
      });
      if (res.ok) {
        const data = await res.json();
        if (data?.name) {
          const parts = [
            `昵称：${data.name}`,
            data.intro && `简介：${data.intro}`,
            data.loc?.name && `地区：${data.loc.name}`,
            data.reg_time && `注册时间：${data.reg_time}`,
          ].filter(Boolean);
          return { platform: 'douban', url: profileUrl, ok: true, excerpt: clip(parts.join('\n')), method: 'douban-api' };
        }
      }
    } catch {
      // fallback below
    }
  }
  return scrapeGeneric('douban', profileUrl);
}

export async function scrapeXhs(_extractedId, profileUrl) {
  const { text, method } = await directThenReader(profileUrl, '');
  if (text.length >= 40) {
    return { platform: 'xhs', url: profileUrl, ok: true, excerpt: text, method };
  }
  return {
    platform: 'xhs',
    url: profileUrl,
    ok: false,
    excerpt: '小红书主页常常需要分享短链或登录态，当前环境未拿到足够正文，建议补充截图或文字自述。',
    method: method === 'none' ? 'xhs-limited' : method,
  };
}

export async function scrapeDouyin(_extractedId, profileUrl) {
  const { text, method } = await directThenReader(profileUrl, getCookieHeader('douyin'));
  if (text.length >= 40) {
    return { platform: 'douyin', url: profileUrl, ok: true, excerpt: text, method };
  }
  return {
    platform: 'douyin',
    url: profileUrl,
    ok: false,
    excerpt: '抖音主页在服务端环境下经常触发签名验证或人机校验，当前未获取到稳定正文；建议搭配截图或更多自述一起分析。',
    method: method === 'none' ? 'douyin-limited' : method,
  };
}

function parsePlatformPayload(content) {
  try {
    const payload = typeof content === 'string' ? JSON.parse(content) : content;
    if (payload?.profileUrl) {
      return {
        platform: normalizePlatformKey(payload.platform),
        url: payload.profileUrl,
        extractedId: payload.extractedId || '',
      };
    }
  } catch {
    // ignore
  }
  return null;
}

export async function scrapeFromPlatformUploads(uploads) {
  const latestPayloads = new Map();
  for (const row of uploads) {
    if (!row?.type?.startsWith('platform:')) continue;
    const payload = parsePlatformPayload(row.content);
    if (!payload) continue;
    latestPayloads.set(payload.platform, payload);
  }

  const results = [];
  for (const [platform, payload] of latestPayloads.entries()) {
    switch (platform) {
      case 'weibo':
        results.push(await scrapeWeibo(payload.extractedId, payload.url));
        break;
      case 'netease':
        results.push(await scrapeNetease(payload.extractedId, payload.url));
        break;
      case 'zhihu':
        results.push(await scrapeZhihu(payload.extractedId, payload.url));
        break;
      case 'douban':
        results.push(await scrapeDouban(payload.extractedId, payload.url));
        break;
      case 'xhs':
        results.push(await scrapeXhs(payload.extractedId, payload.url));
        break;
      case 'douyin':
        results.push(await scrapeDouyin(payload.extractedId, payload.url));
        break;
      default:
        results.push(await scrapeGeneric(platform, payload.url));
        break;
    }
  }
  return results;
}
