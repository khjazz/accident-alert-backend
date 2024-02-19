import express from 'express'
import db from '../db/conn.mjs'
import authenticateToken from '../middlewares/authMiddleware.mjs';
import SubscriptionService from '../services/subscriptionService.mjs'

const router = express.Router()
const subscriptionService = new SubscriptionService(db)

router.post('/subscriptions', authenticateToken, async (req, res) => {
  try {
    const { userID } = req.user
    const subscription = req.body
    await subscriptionService.addSubscription(subscription, userID)
    res.send(subscription)
  } catch (err) {
    console.log(err)
  }
})

export default router