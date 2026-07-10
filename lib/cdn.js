import crypto from 'crypto';

// ── EnCDN media CDN client ──────────────────────────────────────────────────
// All media (images / video / audio) lives on the EnCDN server, not the local
// disk. Uploads return a *lifetime signed URL* so delivery works everywhere:
//  - next/image optimizes by fetching the URL server-side (no Referer header),
//    which whitelist mode would block — a signed URL bypasses domain locking.
//  - direct browser address-bar loads (also no Referer) work too.
// Signing is a plain offline HMAC keyed with the API secret, so it needs no
// extra round-trip. See https://cdn.enfinito.cloud docs.

const CDN_BASE = (process.env.CDN_BASE_URL || 'https://cdn.enfinito.cloud').replace(/\/+$/, '');
const CDN_KEY = process.env.CDN_API_KEY;
const CDN_SECRET = process.env.CDN_API_SECRET;

// Far-future expiry used for "lifetime" (never-expiring) signed links.
const LIFETIME_EXPIRES = 253402300799;

// Formats EnCDN accepts (max 100 MB). SVG is intentionally absent — unsupported.
const VALID_TYPES = new Set([
  'image/jpeg', 'image/png', 'image/gif', 'image/webp',
  'video/mp4', 'video/webm', 'video/ogg',
  'audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/x-wav',
  'audio/aac', 'audio/flac', 'audio/ogg',
]);

function assertConfigured() {
  if (!CDN_KEY || !CDN_SECRET) {
    throw new Error('CDN not configured: set CDN_API_KEY and CDN_API_SECRET');
  }
}

// True for a delivery URL that belongs to our CDN (`${CDN}/d/...`).
export function isCdnUrl(value) {
  return typeof value === 'string' && value.startsWith(`${CDN_BASE}/d/`);
}

// Pull { clientId, filename } out of `${CDN}/d/:clientId/:filename` (ignores query).
export function parseCdnUrl(url) {
  try {
    const { pathname } = new URL(url);
    const parts = pathname.split('/').filter(Boolean); // ['d', clientId, filename]
    if (parts[0] !== 'd' || parts.length < 3) return null;
    return { clientId: parts[1], filename: parts.slice(2).join('/') };
  } catch {
    return null;
  }
}

// The CDN filename = last path segment, minus any query string.
export function cdnFilenameFromUrl(url) {
  if (typeof url !== 'string') return null;
  return url.split('?')[0].split('/').pop() || null;
}

// Build a never-expiring signed delivery URL offline (no API call).
export function signLifetimeUrl(clientId, filename) {
  assertConfigured();
  const stringToSign = `${clientId}/${filename}|${LIFETIME_EXPIRES}`;
  const token = crypto.createHmac('sha256', CDN_SECRET).update(stringToSign).digest('hex');
  return `${CDN_BASE}/d/${clientId}/${filename}?expires=${LIFETIME_EXPIRES}&token=${token}`;
}

// Upload raw bytes. Returns a lifetime signed delivery URL.
export async function uploadBufferToCDN(buffer, filename, contentType) {
  assertConfigured();

  const form = new FormData();
  const blob = new Blob([buffer], { type: contentType || 'application/octet-stream' });
  form.append('file', blob, filename);

  const res = await fetch(`${CDN_BASE}/api/media/upload`, {
    method: 'POST',
    headers: { 'X-CDN-API-Key': CDN_KEY, 'X-CDN-API-Secret': CDN_SECRET },
    body: form,
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => '');
    throw new Error(`CDN upload failed (${res.status}): ${detail}`);
  }

  const data = await res.json();
  const publicUrl = data?.media?.publicUrl;
  if (!publicUrl) throw new Error('CDN upload returned no publicUrl');

  const parsed = parseCdnUrl(publicUrl);
  return parsed ? signLifetimeUrl(parsed.clientId, parsed.filename) : publicUrl;
}

// Upload a web File/Blob (e.g. from a server-action FormData).
// Returns the CDN URL, or null for empty / unsupported input.
export async function uploadToCDN(file) {
  if (!file || typeof file.arrayBuffer !== 'function' || file.size === 0) return null;
  if (file.type && !VALID_TYPES.has(file.type)) return null;

  const buffer = Buffer.from(await file.arrayBuffer());
  const ext = (file.name?.split('.').pop() || 'bin').toLowerCase();
  const filename = `${crypto.randomUUID()}.${ext}`;
  return uploadBufferToCDN(buffer, filename, file.type);
}

// Delete a CDN asset by its delivery URL (or bare filename).
// Idempotent — a 404 just means it was already gone.
export async function deleteFromCDN(urlOrFilename) {
  if (!urlOrFilename || typeof urlOrFilename !== 'string') return;
  assertConfigured();

  const filename = cdnFilenameFromUrl(urlOrFilename);
  if (!filename) return;

  try {
    const res = await fetch(`${CDN_BASE}/api/media/file/${filename}`, {
      method: 'DELETE',
      headers: { 'X-CDN-API-Key': CDN_KEY, 'X-CDN-API-Secret': CDN_SECRET },
    });
    if (!res.ok && res.status !== 404) {
      const detail = await res.text().catch(() => '');
      console.error(`[CDN] delete failed (${res.status}): ${detail}`);
    }
  } catch (err) {
    console.error('[CDN] delete error:', err);
  }
}
