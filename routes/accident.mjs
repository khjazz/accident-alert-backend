import multer from 'multer';
import express from 'express';
import path from 'path'
import db from '../db/conn.mjs';
import AccidentService from '../services/accidentService.mjs';
import authenticateToken from '../middlewares/authMiddleware.mjs';
import SubscriptionService from '../services/subscriptionService.mjs';
import NotificationService from '../services/notificationService.mjs';
import DeviceService from '../services/deviceService.mjs';

const router = express.Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'videos/')
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname))
  }
})

const upload = multer({ storage: storage })

function parseIPAddress(ipWithPort) {
  const ipRegex = /(\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b)|(\[[0-9a-f:]+\])/i;
  const ip = ipWithPort.match(ipRegex)[0]
  return ip
}

router.post('/report', upload.single('file'), async (req, res) => {
  const file = req.file
  if (!file) {
    res.status(400).send({ 'error': 'No file' })
    return
  }
  try {
    const { accidents, time } = req.body
    const { filename } = req.file
    const ip = parseIPAddress(req.ip)

    const report = new ReportHandler(new AccidentService(db))
    await report.reportAccident(ip, accidents, time, filename)
    const notification = new NotificationHandler(new SubscriptionService(db), new NotificationService())
    await notification.notify(ip, accidents, time, filename)
    res.send({ 'message': 'Report successful' });
  } catch (error) {
    console.log(error);
    res.status(400).send({ error: error });
    return;
  }
});

class ReportHandler {
  constructor(accidentService) {
    this.accidentService = accidentService
  }

  async reportAccident(ip, accidents, time, filename) {
    await this.accidentService.reportAccident(ip, accidents, time, filename)
  }
}

class NotificationHandler {
  constructor(subscriptionService, notificationService) {
    this.subscriptionService = subscriptionService
    this.notificationService = notificationService
  }

  async notify(ip, accidents, time, filename) {
    const subscriptions = await this.subscriptionService.getSubscriptionsByIp(ip);

    const payload = {
      "notification": {
        title: 'Accident Alert',
        body: 'An accident has been reported',
        data: {
          accidents,
          time,
          filename
        }
      }
    };
    const options = {
      vapidDetails: {
        subject: 'https://example.com',
        publicKey: process.env.VAPID_PUBLIC_KEY,
        privateKey: process.env.VAPID_PRIVATE_KEY
      },
    }
    subscriptions.map(async (subscription) => {
      try {
        await this.notificationService.sendNotification(subscription, payload, options);
      } catch (error) {
        console.log('Error sending notification:', error.message);
        if (error.statusCode === 410) {
          await this.subscriptionService.deleteSubscription(subscription);
        }
      }
    });
  }
}

router.get('/accidents', authenticateToken, async (req, res) => {
  try {
    const { userID } = req.user;
    const accidentService = new AccidentService(db);
    const accidents = await accidentService.getAccidentsByUser(userID);
    res.json({ accidents });
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving accidents', error: error.message });
  }
});

export default router;