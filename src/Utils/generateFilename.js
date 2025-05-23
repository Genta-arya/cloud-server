import fs from 'fs';
import path from 'path';

export const generateUniqueFilename = (dir, originalName) => {
  const ext = path.extname(originalName);
  const base = path.basename(originalName, ext).replace(/[^a-zA-Z0-9.\\-_]/g, '_');
  const tanggal = new Date().toLocaleDateString('id-ID').replaceAll('/', '-');
  const jam = new Date().toLocaleTimeString('id-ID', { hour12: false }).replaceAll(':', '');
  let newName, fullPath;
  do {
    const random = Math.random().toString(36).substring(2, 12);
    newName = `${base}_${tanggal}_${jam}_${random}${ext}`;
    fullPath = path.join(dir, newName);
  } while (fs.existsSync(fullPath));
  return newName;
};
