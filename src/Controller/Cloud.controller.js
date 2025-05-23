import fs from 'fs';
import path from 'path';
import { generateUniqueFilename } from '../Utils/generateFilename.js';

const baseURL = 'https://cloud.mystorages.my.id/';
const uploadDir = 'bucket';

export const handleUpload = (req, res) => {
  if (req.method === 'OPTIONS') return res.sendStatus(200);

  const apiKey = req.headers['genta'];
  if (apiKey !== 'Genta@456') {
    return res.status(401).json({ status: 'Unauthorized', message: '-' });
  }

  const singleFile = req.files['file']?.[0];
  const multiFiles = req.files['file[]'] || [];

  if (!singleFile && multiFiles.length === 0) {
    return res.status(400).json({ status: 'error', message: 'Tidak ada file yang diupload' });
  }

  const processFile = (file) => {
    const newName = generateUniqueFilename(uploadDir, file.originalname);
    const newPath = path.join(uploadDir, newName);
    fs.renameSync(file.path, newPath);
    return baseURL + newPath;
  };

  try {
    if (singleFile && multiFiles.length === 0) {
      // 🔥 Kalo cuma satu file (field `file`)
      const url = processFile(singleFile);
      return res.json({
        status: 'success',
        message: 'File berhasil diupload',
        file_url: url,
      });
    }

    // 🔥 Kalo banyak file (field `file[]`)
    const result = multiFiles.map(f => ({
      status: 'uploaded',
      file_url: processFile(f),
    }));

    return res.json({
      status: 'success',
      message: 'Proses upload selesai',
      files: result,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ status: 'error', message: 'Gagal mengupload file' });
  }
};

export const handleDelete = (req, res) => {
  const apiKey = req.headers['genta'];
  if (apiKey !== 'Genta@456') return res.status(401).json({ status: 'Unauthorized', message: '-' });

  const { filename, filenames } = req.body;
  let toDelete = [];

  if (Array.isArray(filenames)) {
    toDelete = filenames;
  } else if (typeof filename === 'string') {
    toDelete = [filename];
  } else {
    return res.status(400).json({
      status: 'error',
      message: "Parameter 'filename' atau 'filenames' tidak valid",
    });
  }

  const filesInDir = fs.readdirSync(uploadDir);
  const results = [];

  toDelete.forEach((id) => {
    let found = false;

    for (const file of filesInDir) {
      if (file.includes(id) && fs.statSync(path.join(uploadDir, file)).isFile()) {
        try {
          fs.unlinkSync(path.join(uploadDir, file));
          results.push({ filename: file, status: 'deleted' });
        } catch {
          results.push({ filename: file, status: 'failed' });
        }
        found = true;
        break;
      }
    }

    if (!found) {
      results.push({ filename: id, status: 'not_found' });
    }
  });

  return res.json({
    status: 'multi_status',
    message: 'Proses penghapusan selesai',
    results,
  });
};
