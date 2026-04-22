export const PLATFORM_ALIASES = {
  xiaohongshu: 'xhs',
  xhs: 'xhs',
  weibo: 'weibo',
  douyin: 'douyin',
  netease: 'netease',
  zhihu: 'zhihu',
  douban: 'douban',
  wechat: 'wechat',
  moreading: 'moreading',
};

export function normalizePlatformKey(platform) {
  return PLATFORM_ALIASES[String(platform || '').trim().toLowerCase()] || String(platform || '').trim().toLowerCase();
}

const CANON = {
  weibo: (id) => `https://weibo.com/u/${id}`,
  douyin: (id) => `https://www.douyin.com/user/${id}`,
  netease: (id) => `https://music.163.com/#/user/home?id=${id}`,
  douban: (id) => `https://www.douban.com/people/${id}/`,
  zhihu: (id) => `https://www.zhihu.com/people/${id}`,
};

function normalizeHttpsUrl(raw) {
  const t = String(raw || '').trim();
  if (/^https?:\/\//i.test(t)) return t;
  return `https://${t.replace(/^\/+/, '')}`;
}

function extractDigitsSegment(s) {
  const m = String(s || '').match(/^\d+$/);
  return m ? m[0] : null;
}

function extractDoubanPeople(pathOrFull) {
  const m = String(pathOrFull || '').match(/\/people\/([^/?#]+)\/?/);
  if (m) return decodeURIComponent(m[1]);
  const t = String(pathOrFull || '').trim().replace(/^\/+|\/+$/g, '');
  return t || null;
}

export function isXhsShareLink(candidate) {
  const t = String(candidate || '').trim();
  return /^(https?:\/\/)?xhslink\.com\/(m\/[A-Za-z0-9]+|user\/profile\/)/i.test(t);
}

export function resolvePlatformUrl(platform, input) {
  const normalizedPlatform = normalizePlatformKey(platform);
  let raw = String(input || '').trim();
  if (!raw) return { ok: false, error: '请粘贴主页链接或填写用户 ID' };

  if (!/^https?:\/\//i.test(raw) && /\.[a-z]{2,}/i.test(raw)) {
    raw = `https://${raw.replace(/^\/+/, '')}`;
  }

  const lower = raw.toLowerCase();

  try {
    if (lower.includes('weibo.com')) {
      const m = raw.match(/weibo\.com\/u\/(\d+)/i);
      const id = m?.[1];
      if (!id) return { ok: false, error: '无法从微博链接解析用户 ID' };
      return { ok: true, url: CANON.weibo(id), extractedId: id, platform: 'weibo' };
    }

    if (lower.includes('xhslink.com')) {
      const url = normalizeHttpsUrl(raw).split('?')[0];
      if (!/\/m\/[A-Za-z0-9]+/i.test(new URL(url).pathname)) {
        return { ok: false, error: '小红书请粘贴 App 分享短链（xhslink.com/m/...）' };
      }
      return { ok: true, url, extractedId: url, platform: 'xhs' };
    }

    if (lower.includes('xiaohongshu.com')) {
      const normalized = normalizeHttpsUrl(raw);
      const parsed = new URL(normalized);
      if (/\/user\/profile\//i.test(parsed.pathname)) {
        return { ok: true, url: normalized, extractedId: normalized, platform: 'xhs' };
      }
      return { ok: false, error: '小红书请使用主页链接或 App 分享短链' };
    }

    if (lower.includes('douyin.com')) {
      const m = raw.match(/douyin\.com\/user\/([^/?#]+)/i);
      const id = m?.[1];
      if (!id) return { ok: false, error: '无法从抖音链接解析用户段' };
      return { ok: true, url: CANON.douyin(id), extractedId: id, platform: 'douyin' };
    }

    if (lower.includes('music.163.com')) {
      const m = raw.match(/[?&#]id=(\d+)/);
      const id = m?.[1];
      if (!id) return { ok: false, error: '无法从网易云链接解析数字 ID' };
      return { ok: true, url: CANON.netease(id), extractedId: id, platform: 'netease' };
    }

    if (lower.includes('douban.com')) {
      const id = extractDoubanPeople(raw);
      if (!id) return { ok: false, error: '无法从豆瓣链接解析 people 标识' };
      return { ok: true, url: CANON.douban(id), extractedId: id, platform: 'douban' };
    }

    if (lower.includes('zhihu.com')) {
      const m = raw.match(/zhihu\.com\/people\/([^/?#]+)/i);
      const id = m?.[1];
      if (!id) return { ok: false, error: '无法从知乎链接解析用户名' };
      return { ok: true, url: CANON.zhihu(id), extractedId: id, platform: 'zhihu' };
    }
  } catch {
    // fall through to plain id parsing
  }

  if (normalizedPlatform === 'weibo') {
    const id = extractDigitsSegment(raw);
    return id ? { ok: true, url: CANON.weibo(id), extractedId: id, platform: 'weibo' } : { ok: false, error: '微博用户 ID 应为数字' };
  }
  if (normalizedPlatform === 'xhs') {
    return { ok: false, error: '请粘贴小红书主页链接或 App 分享短链' };
  }
  if (normalizedPlatform === 'douyin') {
    return { ok: true, url: CANON.douyin(raw), extractedId: raw, platform: 'douyin' };
  }
  if (normalizedPlatform === 'netease') {
    const id = extractDigitsSegment(raw);
    return id ? { ok: true, url: CANON.netease(id), extractedId: id, platform: 'netease' } : { ok: false, error: '网易云用户 id 应为数字' };
  }
  if (normalizedPlatform === 'douban') {
    const id = extractDoubanPeople(raw);
    return id ? { ok: true, url: CANON.douban(id), extractedId: id, platform: 'douban' } : { ok: false, error: '豆瓣 people 标识无效' };
  }
  if (normalizedPlatform === 'zhihu') {
    const id = raw.replace(/^\/+|\/+$/g, '');
    return id ? { ok: true, url: CANON.zhihu(id), extractedId: id, platform: 'zhihu' } : { ok: false, error: '知乎用户名不能为空' };
  }

  return { ok: true, url: raw, extractedId: raw, platform: normalizedPlatform || 'unknown' };
}
