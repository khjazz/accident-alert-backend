import express from 'express';
import multer from 'multer';
import { GridFSBucket, ObjectId } from 'mongodb'
import db from '../db/conn.mjs'
import { parseIPAddress } from '../utils/parse_ip.mjs';

const router = express.Router();

const upload = multer()

router.post('/streaming/upload', upload.single('file'), async (req, res) => {
  const file = req.file
  if (!file) {
    res.status(400).send({ 'error': 'No file' })
    return
  }

  const ip = parseIPAddress(req.ip);
  try {
    const bucket = new GridFSBucket(db, { bucketName: 'streaming' });
    const files = await bucket.find({ 'metadata.ip': ip }).toArray();
    if (files.length > 0) {
      files.forEach(async file => {
        const fileId = file._id;
        try {
          await bucket.delete(fileId);
        } catch (error) {
        }
      });
    }
    // Upload the new file
    const uploadStream = bucket.openUploadStream(file.originalname, {
      contentType: file.mimetype,
      metadata: { ip: ip }
    });
    uploadStream.end(file.buffer);

    uploadStream.on('error', (error) => {
      console.error(error);
      res.status(500).send({ 'error': 'Internal server error' });
    });

    uploadStream.on('finish', () => {
      res.status(200).send({ 'message': 'File uploaded successfully' });
    });
  } catch (err) {
    res.status(500).send({ 'error': 'Internal server error' });
  }
});

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