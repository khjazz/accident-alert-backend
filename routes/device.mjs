import express from 'express'
import db from '../db/conn.mjs'
import authenticateToken from '../middlewares/authMiddleware.mjs';
import DeviceService from '../services/deviceService.mjs';

const router = express.Router();
const deviceService = new DeviceService(db);

router.get('/devices', authenticateToken, async (req, res) => {
  try {
    const { userID } = req.user;
    const devices = await deviceService.getDevices(userID);
    res.json({ message: 'Devices retrieved successfully', devices });
  } catch (error) {
    res.status(500).json({ message: 'Error', error: error.message });
  }
})

router.post('/devices', authenticateToken, async (req, res) => {
  try {
    const { ip } = req.body;
    const { userID } = req.user;
    await deviceService.addDevice(ip, userID);
    res.json({ message: 'Device added successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error adding device', error: error.message });
  }
})

router.delete('/devices', authenticateToken, async (req, res) => {
  try {
    const { ip } = req.body;
    const { userID } = req.user;
    await deviceService.deleteDevice(ip, userID);
    res.json({ message: 'Device deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting device', error: error.message });
  }
})

export default router;