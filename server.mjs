import express from "express";
import cors from "cors";
import "./loadEnvironment.mjs";
import auth from './routes/auth.mjs'
import accident from './routes/accident.mjs'
import device from './routes/device.mjs'
import subscribe from './routes/subscription.mjs'

const PORT = process.env.PORT || 5050;
const app = express();

app.set('trust proxy', 1)

app.use((req, res, next) => {
  console.log('Client IP:', req.ip)
  next()
})

app.use(cors())
app.use(express.json())

app.use('/', auth)
app.use('/', accident)
app.use('/', device)
app.use('/', subscribe)
app.use('/videos', express.static('videos'))

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`)
})