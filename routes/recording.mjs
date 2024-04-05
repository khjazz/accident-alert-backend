import express from 'express'
import db from '../db/conn.mjs'
import { GridFSBucket, ObjectId } from 'mongodb';


const router = express.Router();

router.get('/recordings/:recordingId', async (req, res) => {
  try {
    const { recordingId } = req.params;
    const bucket = new GridFSBucket(db, { bucketName: 'recordings' });

    const file = await bucket.find({ _id: new ObjectId(recordingId) }).next();
    if (!file) {
      return res.status(404).send('File not found');
    }

    res.set('Content-Type', file.contentType);
    res.set('Content-Length', file.length)

    const downloadStream = bucket.openDownloadStream(new ObjectId(recordingId));
    downloadStream.pipe(res);
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

export default router;