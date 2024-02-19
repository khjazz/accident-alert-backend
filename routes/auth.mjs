import express from 'express'
import UserService from '../services/userService.mjs'
import jwt from 'jsonwebtoken'
import db from '../db/conn.mjs'

const router = express.Router()
const EXPIRES_IN = 1800

function generateAccessToken(userID) {
  return jwt.sign({ userID }, process.env.TOKEN_SECRET, { expiresIn: EXPIRES_IN.toString() + 's' });
}

router.post('/register', async function (req, res) {
  let collection = db.collection("users");
  const { userID, name, password } = req.body
  const user = await collection.findOne({ userID })
  if (user) {
    return res.status(500).send({ error: 'User with this userID already exists' })
  }
  collection.insertOne({ userID, name, password })
  const jwtBearerToken = generateAccessToken(userID)
  res.status(200).json({
    idToken: jwtBearerToken,
    expiresIn: EXPIRES_IN
  });
})

router.post('/login', async (req, res) => {
  let collection = db.collection('users')
  const { userID, password } = req.body
  const user = await collection.findOne({ userID })
  if (!user || user.password !== password) {
    return res.status(401).send({ error: 'Invalid userID or password' });
  }
  const jwtBearerToken = generateAccessToken(userID)
  res.status(200).json({
    idToken: jwtBearerToken,
    expiresIn: EXPIRES_IN
  });
})

export default router