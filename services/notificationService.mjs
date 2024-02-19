import webpush from 'web-push'

class NotificationService {
  async sendNotification(subscription, payload, options) {
    console.log('Notifying:', subscription)
    await webpush.sendNotification(subscription, JSON.stringify(payload), options)
  }
}

export default NotificationService
