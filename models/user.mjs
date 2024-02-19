import mongoose from 'mongoose'

const userSchema = new mongoose.Schema({
  userID: { type: String, unique: true },
  name: { type: String },
  password: { type: String },
  devices: { type: [String] },
})

export default mongoose.model("users", userSchema);