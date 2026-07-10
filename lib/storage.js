import fs from 'fs/promises';
import path from 'path';
import { uploadToCDN, deleteFromCDN, isCdnUrl } from './cdn';

// Media is now stored on the EnCDN CDN instead of the local disk. These two
// functions keep their original names/signatures so every caller keeps working —
// `saveFileToPublic` just returns a CDN URL instead of a `/uploads/...` path.

// Upload a file (web File/Blob) and return its CDN URL, or null if invalid/empty.
export async function saveFileToPublic(file) {
  return uploadToCDN(file);
}

// Remove a previously stored asset.
export async function deleteFileFromPublic(fileUrl) {
  if (!fileUrl || typeof fileUrl !== 'string') return;

  // CDN-hosted asset → delete from the CDN.
  if (isCdnUrl(fileUrl)) {
    await deleteFromCDN(fileUrl);
    return;
  }

  // Legacy local upload (pre-migration) → remove from disk.
  if (fileUrl.startsWith('/uploads/') || fileUrl.startsWith('uploads/')) {
    const relativePath = fileUrl.startsWith('/') ? fileUrl.slice(1) : fileUrl;
    const fullPath = path.join(process.cwd(), 'public', relativePath);
    try {
      await fs.unlink(fullPath);
    } catch (error) {
      if (error.code !== 'ENOENT') console.error('[STORAGE] Delete error:', error);
    }
  }
  // External URLs (http...) are left untouched.
}
