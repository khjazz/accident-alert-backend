class DeviceService {
  constructor(connection) {
    this.dbConnection = connection
  }

  async getDevices(userID) {
    const devices = this.dbConnection.collection('devices')
    const userDevices = await devices.find({ userID }).toArray()
    return userDevices
  }

  async addDevice(ip, userID) {
    const devices = this.dbConnection.collection('devices')
    const device = await devices.findOne({ ip })

    if (device && device.userID) {
      throw new Error('Device is already registered')
    }
    await devices.updateOne(
      { ip },
      { $set: { ip, userID } },
      { upsert: true })
  }

  async deleteDevice(ip, userID) {
    const devices = this.dbConnection.collection('devices')
    const device = await devices.findOne({ ip })

    if (!device) {
      throw new Error('Device not found')
    } else if (device.userID !== userID) {
      throw new Error('Only the owner can delete the device')
    }

    await devices.deleteOne({ ip })
  }
}

export default DeviceService