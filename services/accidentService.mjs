class AccidentService {
  constructor(connection) {
    this.dbConnection = connection
  }

  async reportAccident(ip, types, time, recordingId) {
    const devices = this.dbConnection.collection('devices')
    const filter = { ip: ip }
    const option = { upsert: true }
    const updateDoc = {
      $push: {
        accidents: {
          types: types.split(','),
          time,
          recordingId,
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
      const deviceAccidents = device.accidents || [];
      const deviceAccidentsWithIp = deviceAccidents.map(accident => {
        return { ...accident, ip: device.ip };
      });
      return [...acc, ...deviceAccidentsWithIp];
    }, [])

    return accidents
  }
}

export default AccidentService