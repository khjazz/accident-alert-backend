import fs from 'fs';
import express from 'express';
import multer from 'multer';
import path from 'path'
import { GridFSBucket, ObjectId } from 'mongodb'
import db from '../db/conn.mjs'
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { parseIPAddress } from '../utils/parse_ip.mjs';
import DeviceService from '../services/deviceService.mjs';

const router = express.Router();

const upload = multer()

router.post('/streaming/upload', upload.single('file'), async (req, res) => {
  const file = req.file
  if (!file) {
    res.status(400).send({ 'error': 'No file' })
    return
  }

  const ip = parseIPAddress(req.ip);
  const bucket = new GridFSBucket(db, { bucketName: 'streaming' });

  bucket.find({ 'metadata.ip': ip }).toArray((err, files) => {
    if (err) {
      res.status(500).send({ 'error': 'Internal server error' });
      return;
    }

    if (files.length > 0) {
      const fileId = files[0]._id;
      bucket.delete(fileId, (err) => {
        if (err) {
          res.status(500).send({ 'error': 'Internal server error' });
          return;
        }
        console.log(`Deleted file with IP address: ${ip}`);
      });
    }

    // Upload the new file
    const uploadStream = bucket.openUploadStreamWithId(new ObjectId(), file.originalname, {
      contentType: file.mimetype,
      metadata: { ip: ip }
    });
    const readStream = fs.createReadStream(file.path);
    readStream.pipe(uploadStream);

    uploadStream.on('error', (err) => {
      res.status(500).send({ 'error': 'Internal server error' });
    });

    uploadStream.on('finish', () => {
      res.status(200).send({ 'message': 'File uploaded successfully' });
    });
  });
})

router.get('/streaming/:ip', async (req, res) => {
  try {
    const { ip } = req.params;
    const bucket = new GridFSBucket(db, { bucketName: 'streaming' });

    const file = await bucket.find({ 'metadata.ip': ip }).sort({ uploadDate: -1 }).limit(1).toArray();
    if (!file || file.length === 0) {
      return res.status(404).send('File not found');
    }

    res.set('Content-Type', file[0].contentType);
    res.set('Content-Length', file[0].length)

    const downloadStream = bucket.openDownloadStream(new ObjectId(file[0]._id));
    downloadStream.pipe(res);
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }

})

export default router;