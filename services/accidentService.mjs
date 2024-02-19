class AccidentService {
  constructor(connection) {
    this.dbConnection = connection
  }

  async reportAccident(ip, types, time, filename) {
    const devices = this.dbConnection.collection('devices')
    const filter = { ip: ip }
    const option = { upsert: true }
    const updateDoc = {
      $push: {
        accidents: {
          types: types.split(','),
          time,
          filename,
        }
      }
    }
    await devices.updateOne(filter, updateDoc, option)
  }

  async notifyUser(type) {
    console.log(`Notifying user about ${type} accident`)
  }

  async getAccidentsByUser(userID) {
    const devices = this.dbConnection.collection('devices')
    const userDevices = await devices.find({ userID }).toArray()

    const accidents = userDevices.reduce((acc, device) => {
      return acc.concat(device.accidents || [])
    }, [])

    return accidents
  }
}

export default AccidentService