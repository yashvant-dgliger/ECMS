import { db } from '../common/in-memory-db';

export class NotificationsService {
  pushInApp(userId: string, title: string, body: string) {
    db.notifications.push({ id: `notif_${Date.now()}`, userId, title, body, createdAt: new Date().toISOString() });
  }

  list(userId: string) {
    return db.notifications.filter(n => n.userId === userId);
  }
}
