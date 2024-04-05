import fs from 'fs';
import express from 'express';
import multer from 'multer';
import path from 'path'
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { parseIPAddress } from '../utils/parse_ip.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const router = express.Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'streaming/')
  },
  filename: function (req, file, cb) {
    cb(null, parseIPAddress(req.ip) + path.extname(file.originalname))
  }
})

const upload = multer({ storage: storage })

router.post('/streaming/upload', upload.single('file'), async (req, res) => {
  if (req.file) {
    // File uploaded successfully
    res.status(200).send('ok');
  } else {
    // No file was uploaded
    res.status(400).send('No file was uploaded.');
  }
})

router.get('/streaming/:deviceId', async (req, res) => {
  const filePath = path.join(__dirname, '../streaming', `${req.params.deviceId}`);
  const defaultImagePath = path.join(__dirname, '..', 'king_crimson.jpg');

  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      // File does not exist, send default image
      res.sendFile(defaultImagePath);
    } else {
      // File exists, send it
      res.sendFile(filePath);
    }
  });
})

export default router;