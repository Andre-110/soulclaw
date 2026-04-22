import express from 'express';
import { randomUUID } from 'node:crypto';
import { appendUpload, getLatestReport, listUploadsByClient, saveReport } from './lib/storage.mjs';
import { normalizePlatformKey, resolvePlatformUrl } from './lib/platformUrls.mjs';
import { scrapeFromPlatformUploads, summarizeScrapesForLog } from './lib/profileScrape.mjs';
import { buildFallbackSoulReport, tryOpenAISoulReport } from './lib/soulReportOpenAI.mjs';
import { continueDynamicStory } from './lib/storyEngine.mjs';

const app = express();
const port = Number(process.env.API_PORT || 3001);

app.use(express.json({ limit: '6mb' }));

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'soulclaw-api', time: new Date().toISOString() });
});

app.get('/api/uploads', (req, res) => {
  const clientId = String(req.query.clientId || '').trim();
  if (!clientId) return res.status(400).json({ error: '缺少 clientId' });
  return res.json({ uploads: listUploadsByClient(clientId) });
});

app.post('/api/upload', (req, res) => {
  const { clientId, type, content } = req.body || {};
  if (!clientId || !type) return res.status(400).json({ error: '缺少 clientId 或 type' });

  let nextContent = content;
  if (String(type).startsWith('platform:')) {
    const rawPlatform = String(type).slice('platform:'.length);
    const parsedInput = typeof content === 'string' ? JSON.parse(content) : content;
    const rawInput = String(parsedInput?.rawInput || parsedInput?.profileUrl || '').trim();
    const resolved = resolvePlatformUrl(rawPlatform, rawInput);
    if (!resolved.ok) return res.status(400).json({ error: resolved.error });
    nextContent = JSON.stringify({
      profileUrl: resolved.url,
      extractedId: resolved.extractedId,
      platform: normalizePlatformKey(resolved.platform || rawPlatform),
      rawInput,
    });
  }

  const upload = appendUpload({
    id: randomUUID(),
    clientId,
    type,
    content: typeof nextContent === 'string' ? nextContent : JSON.stringify(nextContent || {}),
    createdAt: new Date().toISOString(),
  });

  return res.json({ success: true, upload });
});

app.get('/api/report', (req, res) => {
  const clientId = String(req.query.clientId || '').trim();
  if (!clientId) return res.status(400).json({ error: '缺少 clientId' });
  const report = getLatestReport(clientId);
  return res.json({ report });
});

app.post('/api/analyze', async (req, res) => {
  try {
    const { clientId, profile = {}, questionnaireSummary = '', openTextSummary = '' } = req.body || {};
    if (!clientId) return res.status(400).json({ error: '缺少 clientId' });

    const uploads = listUploadsByClient(clientId);
    const scrapes = await scrapeFromPlatformUploads(uploads);
    const userTexts = [questionnaireSummary, openTextSummary].map((item) => String(item || '').trim()).filter(Boolean);

    let report = await tryOpenAISoulReport({ profile, scrapes, userTexts });
    if (!report) {
      report = buildFallbackSoulReport({ profile, scrapes, userTexts });
    }

    const reportEntry = saveReport({
      id: randomUUID(),
      clientId,
      createdAt: new Date().toISOString(),
      report,
      debug: {
        uploadCount: uploads.length,
        scrapeCount: scrapes.length,
        scrapeSummary: summarizeScrapesForLog(scrapes),
      },
    });

    return res.json({ success: true, report: reportEntry.report, debug: reportEntry.debug, scrapes });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return res.status(500).json({ error: '分析失败', detail: message });
  }
});

app.post('/api/story/continue', async (req, res) => {
  try {
    const result = await continueDynamicStory(req.body || {});
    return res.json({ success: true, ...result });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return res.status(500).json({ error: '故事续写失败', detail: message });
  }
});

app.listen(port, '0.0.0.0', () => {
  console.log(`[soulclaw-api] listening on http://0.0.0.0:${port}`);
});
