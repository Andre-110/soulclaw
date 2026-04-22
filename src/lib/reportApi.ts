export type PlatformBindingPayload = {
  profileUrl: string;
  extractedId?: string;
  platform: string;
  rawInput?: string;
};

export type SoulBlock = {
  source: string;
  icon: string;
  tags: string[];
  title: string;
  description: string;
};

export type SoulReport = {
  mbti: string;
  title: string;
  avatarTags: string[];
  overall: string;
  blocks: SoulBlock[];
  article?: {
    headline?: string;
    guaranteeIntro?: string;
    section2?: {
      title?: string;
      celebrities?: Array<{ name: string; recommendReason: string }>;
    };
    section3?: {
      fourHumorTheory?: { type: string; note: string };
      lovePersona16?: { type: string; note: string };
      animalPersona?: { type: string; note: string };
      todayFortune?: { love: string; career: string; wealth: string };
    };
    section4?: {
      personaName?: string;
      personaCore?: string;
      dayParts?: Array<{ clock: string; slot: string; paragraph: string; sourceTag: string; detailTags?: string[] }>;
      finalCard?: { intro?: string; summaryLines?: string[]; closingLine?: string };
    };
  };
};

export async function savePlatformBinding(clientId: string, platformId: string, rawInput: string) {
  const res = await fetch('/api/upload', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      clientId,
      type: `platform:${platformId}`,
      content: {
        rawInput,
        platform: platformId,
        profileUrl: rawInput,
      },
    }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || '绑定失败');
  return data.upload;
}

export async function analyzeProfile(params: {
  clientId: string;
  profile: { nickname: string; avatar: string; tags: string[]; answers: Record<string, string> };
  questionnaireSummary?: string;
  openTextSummary?: string;
}) {
  const res = await fetch('/api/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || '报告生成失败');
  return data as { success: true; report: SoulReport; debug?: { uploadCount: number; scrapeCount: number; scrapeSummary: string } };
}

export async function fetchLatestReport(clientId: string) {
  const res = await fetch(`/api/report?clientId=${encodeURIComponent(clientId)}`);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || '读取报告失败');
  return data.report as { report: SoulReport; debug?: { uploadCount: number; scrapeCount: number; scrapeSummary: string } } | null;
}
