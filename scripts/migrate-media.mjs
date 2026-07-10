#!/usr/bin/env node
/**
 * One-time (re-runnable) media migration: EnCDN.
 *
 * Walks every collection/field that stores a local `/uploads/...` path, uploads
 * the file from `public/uploads` to the EnCDN CDN, and rewrites the field in
 * MongoDB to the new lifetime-signed CDN URL.
 *
 * Idempotent — values already on the CDN (or external http URLs) are skipped, so
 * it is safe to run repeatedly until everything reports migrated.
 *
 * Usage:
 *   npm run migrate:media            # perform the migration
 *   npm run migrate:media -- --dry-run   # report only, no uploads/writes
 *
 * Requires env: MONGODB_URI, CDN_API_KEY, CDN_API_SECRET (CDN_BASE_URL optional).
 * These are read from your shell and/or .env.local.
 */

import crypto from 'crypto';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import { loadEnvConfig } from '@next/env';

const PROJECT_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
loadEnvConfig(PROJECT_ROOT);

const DRY_RUN = process.argv.includes('--dry-run');

const CDN_BASE = (process.env.CDN_BASE_URL || 'https://cdn.enfinito.cloud').replace(/\/+$/, '');
const CDN_KEY = process.env.CDN_API_KEY;
const CDN_SECRET = process.env.CDN_API_SECRET;
const MONGODB_URI = process.env.MONGODB_URI;
const LIFETIME_EXPIRES = 253402300799;
const UPLOADS_DIR = path.join(PROJECT_ROOT, 'public', 'uploads');

// Collections and the fields within them that hold media paths.
//  - scalar:   a string field holding one path
//  - array:    a string[] field of paths
//  - subarray: an array of sub-documents, each with a `subKey` path field
const TARGETS = [
  { collection: 'products', fields: [{ path: 'images', kind: 'array' }] },
  { collection: 'heros', fields: [{ path: 'image', kind: 'scalar' }, { path: 'mobileImage', kind: 'scalar' }] },
  { collection: 'featuredsections', fields: [{ path: 'image', kind: 'scalar' }] },
  { collection: 'videosections', fields: [{ path: 'videoUrl', kind: 'scalar' }, { path: 'videoPoster', kind: 'scalar' }] },
  { collection: 'pagecontents', fields: [{ path: 'heroImage', kind: 'scalar' }, { path: 'teamMembers', kind: 'subarray', subKey: 'image' }] },
  { collection: 'categories', fields: [{ path: 'image', kind: 'scalar' }] },
  { collection: 'orders', fields: [{ path: 'items', kind: 'subarray', subKey: 'image' }] },
];

const EXT_MIME = {
  jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', gif: 'image/gif', webp: 'image/webp',
  mp4: 'video/mp4', webm: 'video/webm', ogv: 'video/ogg',
  mp3: 'audio/mpeg', wav: 'audio/wav', aac: 'audio/aac', flac: 'audio/flac', ogg: 'audio/ogg',
};

const stats = { uploaded: 0, skipped: 0, missing: 0, errors: 0, docsUpdated: 0 };
// localPath -> cdnUrl, so a file referenced from several places uploads only once.
const uploadCache = new Map();

function isLocalUpload(value) {
  return typeof value === 'string' && (value.startsWith('/uploads/') || value.startsWith('uploads/'));
}

function parseCdnUrl(url) {
  try {
    const parts = new URL(url).pathname.split('/').filter(Boolean);
    if (parts[0] !== 'd' || parts.length < 3) return null;
    return { clientId: parts[1], filename: parts.slice(2).join('/') };
  } catch {
    return null;
  }
}

function signLifetimeUrl(clientId, filename) {
  const token = crypto
    .createHmac('sha256', CDN_SECRET)
    .update(`${clientId}/${filename}|${LIFETIME_EXPIRES}`)
    .digest('hex');
  return `${CDN_BASE}/d/${clientId}/${filename}?expires=${LIFETIME_EXPIRES}&token=${token}`;
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function uploadBuffer(buffer, filename, contentType) {
  let attempt = 0;
  // Retry transient failures (rate limit / 5xx) with backoff.
  while (true) {
    attempt++;
    const form = new FormData();
    form.append('file', new Blob([buffer], { type: contentType }), filename);

    const res = await fetch(`${CDN_BASE}/api/media/upload`, {
      method: 'POST',
      headers: { 'X-CDN-API-Key': CDN_KEY, 'X-CDN-API-Secret': CDN_SECRET },
      body: form,
    });

    if (res.ok) {
      const data = await res.json();
      const publicUrl = data?.media?.publicUrl;
      if (!publicUrl) throw new Error('upload returned no publicUrl');
      const parsed = parseCdnUrl(publicUrl);
      return parsed ? signLifetimeUrl(parsed.clientId, parsed.filename) : publicUrl;
    }

    if ((res.status === 429 || res.status >= 500) && attempt < 4) {
      await sleep(500 * attempt);
      continue;
    }
    const detail = await res.text().catch(() => '');
    throw new Error(`upload failed (${res.status}): ${detail}`);
  }
}

// Migrate one stored value. Returns the new CDN URL, or the original value if it
// can't / shouldn't be migrated.
async function migrateValue(value) {
  if (!isLocalUpload(value)) {
    stats.skipped++;
    return value; // already CDN, external, or empty
  }
  if (uploadCache.has(value)) {
    return uploadCache.get(value); // reuse: same file referenced elsewhere
  }

  const filename = value.split('/').pop();
  const diskPath = path.join(UPLOADS_DIR, filename);

  let buffer;
  try {
    buffer = await fs.readFile(diskPath);
  } catch {
    console.warn(`  ⚠ missing on disk, left as-is: ${value}`);
    stats.missing++;
    return value;
  }

  const ext = (filename.split('.').pop() || '').toLowerCase();
  const contentType = EXT_MIME[ext] || 'application/octet-stream';

  if (DRY_RUN) {
    console.log(`  would upload: ${value} (${contentType}, ${buffer.length} bytes)`);
    stats.uploaded++;
    const placeholder = `[CDN]${value}`;
    uploadCache.set(value, placeholder);
    return placeholder;
  }

  try {
    const cdnUrl = await uploadBuffer(buffer, filename, contentType);
    uploadCache.set(value, cdnUrl);
    stats.uploaded++;
    console.log(`  ✓ ${value} → ${cdnUrl.slice(0, 72)}…`);
    return cdnUrl;
  } catch (err) {
    console.error(`  ✗ upload error for ${value}: ${err.message}`);
    stats.errors++;
    return value;
  }
}

async function migrateField(doc, field) {
  if (field.kind === 'scalar') {
    const current = doc[field.path];
    if (!isLocalUpload(current)) return undefined;
    const next = await migrateValue(current);
    return next !== current ? { [field.path]: next } : undefined;
  }

  if (field.kind === 'array') {
    const arr = doc[field.path];
    if (!Array.isArray(arr) || !arr.some(isLocalUpload)) return undefined;
    let changed = false;
    const nextArr = [];
    for (const item of arr) {
      const next = await migrateValue(item);
      if (next !== item) changed = true;
      nextArr.push(next);
    }
    return changed ? { [field.path]: nextArr } : undefined;
  }

  if (field.kind === 'subarray') {
    const arr = doc[field.path];
    if (!Array.isArray(arr) || !arr.some((it) => it && isLocalUpload(it[field.subKey]))) return undefined;
    let changed = false;
    const nextArr = [];
    for (const item of arr) {
      if (item && isLocalUpload(item[field.subKey])) {
        const next = await migrateValue(item[field.subKey]);
        if (next !== item[field.subKey]) changed = true;
        nextArr.push({ ...item, [field.subKey]: next });
      } else {
        nextArr.push(item);
      }
    }
    return changed ? { [field.path]: nextArr } : undefined;
  }

  return undefined;
}

async function migrateCollection(db, target) {
  const exists = await db.listCollections({ name: target.collection }).hasNext();
  if (!exists) {
    console.log(`\n• ${target.collection}: not found, skipping`);
    return;
  }

  const col = db.collection(target.collection);
  const projection = target.fields.reduce((p, f) => ({ ...p, [f.path]: 1 }), { _id: 1 });
  // Only pull docs that actually contain a local path in one of the target fields.
  // For sub-document arrays, match the dotted element path (e.g. `items.image`).
  const orFilter = target.fields.map((f) => {
    const matchPath = f.kind === 'subarray' ? `${f.path}.${f.subKey}` : f.path;
    return { [matchPath]: { $regex: '(^|/)uploads/', $options: 'i' } };
  });

  const cursor = col.find({ $or: orFilter }, { projection });
  let count = 0;

  console.log(`\n• ${target.collection}`);
  for await (const doc of cursor) {
    const update = {};
    for (const field of target.fields) {
      const partial = await migrateField(doc, field);
      if (partial) Object.assign(update, partial);
    }
    if (Object.keys(update).length === 0) continue;

    count++;
    stats.docsUpdated++;
    if (!DRY_RUN) {
      await col.updateOne({ _id: doc._id }, { $set: update });
    }
  }
  console.log(`  ${count} document(s) ${DRY_RUN ? 'would be' : ''} updated`);
}

async function main() {
  const missing = [];
  if (!MONGODB_URI) missing.push('MONGODB_URI');
  if (!CDN_KEY) missing.push('CDN_API_KEY');
  if (!CDN_SECRET) missing.push('CDN_API_SECRET');
  if (missing.length) {
    console.error(`Missing required env: ${missing.join(', ')}`);
    console.error('Set them in your shell or .env.local and re-run.');
    process.exit(1);
  }

  console.log(`EnCDN media migration${DRY_RUN ? ' (DRY RUN — no uploads/writes)' : ''}`);
  console.log(`CDN: ${CDN_BASE}`);

  await mongoose.connect(MONGODB_URI);
  const db = mongoose.connection.db;

  try {
    for (const target of TARGETS) {
      await migrateCollection(db, target);
    }
  } finally {
    await mongoose.disconnect();
  }

  console.log('\n── Summary ──────────────────────────────');
  console.log(`  files uploaded : ${stats.uploaded}`);
  console.log(`  values skipped : ${stats.skipped} (already CDN / external)`);
  console.log(`  missing files  : ${stats.missing}`);
  console.log(`  upload errors  : ${stats.errors}`);
  console.log(`  docs updated   : ${stats.docsUpdated}`);
  if (stats.errors > 0) process.exitCode = 1;
}

main().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
