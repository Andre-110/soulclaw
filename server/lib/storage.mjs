import fs from 'node:fs';
import path from 'node:path';

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_PATH = path.join(DATA_DIR, 'soulclaw-db.json');

function ensureDbFile() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(DB_PATH)) {
    fs.writeFileSync(DB_PATH, JSON.stringify({ uploads: [], reports: [] }, null, 2));
  }
}

export function readDb() {
  ensureDbFile();
  try {
    return JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
  } catch {
    return { uploads: [], reports: [] };
  }
}

export function writeDb(nextDb) {
  ensureDbFile();
  fs.writeFileSync(DB_PATH, JSON.stringify(nextDb, null, 2));
}

export function appendUpload(upload) {
  const db = readDb();
  db.uploads.push(upload);
  writeDb(db);
  return upload;
}

export function listUploadsByClient(clientId) {
  const db = readDb();
  return db.uploads.filter((item) => item.clientId === clientId).sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

export function saveReport(reportEntry) {
  const db = readDb();
  db.reports = db.reports.filter((item) => item.clientId !== reportEntry.clientId);
  db.reports.push(reportEntry);
  writeDb(db);
  return reportEntry;
}

export function getLatestReport(clientId) {
  const db = readDb();
  const items = db.reports.filter((item) => item.clientId === clientId).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return items[0] || null;
}
