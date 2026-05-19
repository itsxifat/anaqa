import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads');

const VALID_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];

export async function saveFileToPublic(file) {
  if (!file || file.size === 0) return null;

  if (!VALID_TYPES.includes(file.type)) return null;

  const buffer = Buffer.from(await file.arrayBuffer());
  const ext = file.name.split('.').pop().toLowerCase();
  const secureName = `${crypto.randomUUID()}.${ext}`;
  const fullPath = path.join(UPLOAD_DIR, secureName);

  try {
    // 0o755 ensures the directory is traversable by all users (including the optimizer)
    await fs.mkdir(UPLOAD_DIR, { recursive: true, mode: 0o755 });

    // 0o644: owner can write, everyone (including Next.js image optimizer) can read
    await fs.writeFile(fullPath, buffer, { mode: 0o644 });

    return `/uploads/${secureName}`;
  } catch (error) {
    console.error('[STORAGE] Save error:', error);
    return null;
  }
}

export async function deleteFileFromPublic(fileUrl) {
  if (!fileUrl || typeof fileUrl !== 'string') return;

  const relativePath = fileUrl.startsWith('/') ? fileUrl.slice(1) : fileUrl;
  const fullPath = path.join(process.cwd(), 'public', relativePath);

  try {
    await fs.unlink(fullPath);
  } catch (error) {
    if (error.code !== 'ENOENT') {
      console.error('[STORAGE] Delete error:', error);
    }
  }
}
