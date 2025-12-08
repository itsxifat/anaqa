// anaqa/lib/storage.js
import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';

export async function saveFileToPublic(file) {
  if (!file || file.size === 0) return null;

  // 1. Validate File Type
  const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  if (!validTypes.includes(file.type)) {
    throw new Error(`Invalid file type: ${file.type}`);
  }

  // 2. Generate Unguessable Filename (UUID)
  const buffer = Buffer.from(await file.arrayBuffer());
  const uuid = crypto.randomUUID();
  const ext = file.name.split('.').pop(); // Get extension
  const secureName = `${uuid}.${ext}`;
  
  // 3. Define Path (public/uploads)
  // process.cwd() works in Node.js runtime (Server Actions)
  const uploadDir = path.join(process.cwd(), 'public', 'uploads');
  
  // Ensure directory exists
  try {
    await fs.access(uploadDir);
  } catch {
    await fs.mkdir(uploadDir, { recursive: true });
  }

  const filePath = path.join(uploadDir, secureName);

  // 4. Write File
  await fs.writeFile(filePath, buffer);

  // 5. Return Public Path
  return `/uploads/${secureName}`;
}