import mongoose from 'mongoose'

const deviceSchema = new mongoose.Schema({
  ip: { type: String },
  userID: { type: String },
  accidents: { type: [] },
})

export default mongoose.model("users", deviceSchema);