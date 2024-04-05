import express from 'express'
import db from '../db/conn.mjs'
import { GridFSBucket, ObjectId } from 'mongodb';


const router = express.Router();

router.get('/recordings/:recordingId', async (req, res) => {
  try {
    const { recordingId } = req.params;
    const bucket = new GridFSBucket(db, { bucketName: 'recordings' });
    const downloadStream = bucket.openDownloadStream(new ObjectId(recordingId));

    downloadStream.on('error', (error) => {
      console.error(error);
      res.status(500).send('Internal Server Error');
    });

    downloadStream.pipe(res);
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

export default router;