export default class SubscriptionService {
  constructor(connection) {
    this.dbConnection = connection
  }

  async addSubscription(subscription, userID) {
    const users = this.dbConnection.collection('users')
    await users.updateOne(
      { userID },
      { $addToSet: { subscriptions: subscription } }
    )
  }

  async getSubscriptions(userID) {
    const users = this.dbConnection.collection('users')
    const user = await users.findOne({ userID })
    const userSubscriptions = user.subscriptions || []
    return userSubscriptions
  }

  async deleteSubscription(subscription) {
    const users = this.dbConnection.collection('users')
    await users.updateOne(
      { subscriptions: { $elemMatch: subscription } },
      { $pull: { subscriptions: subscription } }
    )
  }

  async getSubscriptionsByIp(ip) {
    const pipeline = [
      { $match: { ip: ip } },
      {
        $lookup: {
          from: 'users',
          localField: 'userID',
          foreignField: 'userID',
          as: 'user'
        },
      },
      { $unwind: '$user' },
      { $replaceRoot: { newRoot: '$user' } }
    ]

    const user = await this.dbConnection.collection('devices').aggregate(pipeline).next()
    const userSubscriptions = user.subscriptions ?? [];
    return userSubscriptions;
  }
}