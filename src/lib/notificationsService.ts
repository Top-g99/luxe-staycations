// Minimal notifications service for admin functionality
export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
  created_at: string;
  updated_at: string;
}

export class NotificationsService {
  private static instance: NotificationsService;
  private notifications: Notification[] = [];

  static getInstance(): NotificationsService {
    if (!NotificationsService.instance) {
      NotificationsService.instance = new NotificationsService();
    }
    return NotificationsService.instance;
  }

  async initialize() {
    // Mock initialization
    return Promise.resolve();
  }

  async getAll(): Promise<Notification[]> {
    return this.notifications;
  }

  async getById(id: string): Promise<Notification | null> {
    return this.notifications.find(n => n.id === id) || null;
  }

  async create(notification: Omit<Notification, 'id' | 'created_at' | 'updated_at'>): Promise<Notification> {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      timestamp: notification.timestamp || new Date(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    this.notifications.push(newNotification);
    return newNotification;
  }

  async update(id: string, updates: Partial<Notification>): Promise<Notification | null> {
    const index = this.notifications.findIndex(n => n.id === id);
    if (index !== -1) {
      this.notifications[index] = { ...this.notifications[index], ...updates, updated_at: new Date().toISOString() };
      return this.notifications[index];
    }
    return null;
  }

  async delete(id: string): Promise<boolean> {
    const index = this.notifications.findIndex(n => n.id === id);
    if (index !== -1) {
      this.notifications.splice(index, 1);
      return true;
    }
    return false;
  }

  async markAsRead(id: string): Promise<boolean> {
    const notification = await this.getById(id);
    if (notification) {
      await this.update(id, { read: true });
      return true;
    }
    return false;
  }

  async markAllAsRead(): Promise<boolean> {
    try {
      for (const notification of this.notifications) {
        if (!notification.read) {
          await this.update(notification.id, { read: true });
        }
      }
      return true;
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
      return false;
    }
  }

  async getUnreadCount(): Promise<number> {
    return this.notifications.filter(n => !n.read).length;
  }

  startMonitoring(): void {
    // Mock monitoring - in real app, this would start listening for real-time notifications
    console.log('Notification monitoring started');
  }

  subscribe(callback: (notifications: Notification[]) => void): () => void {
    // Mock subscription - in real app, this would subscribe to real-time updates
    return () => {};
  }

  stopMonitoring(): void {
    // Mock stop monitoring
    console.log('Notification monitoring stopped');
  }

  async triggerCheck(): Promise<void> {
    // Mock trigger check
    console.log('Notification check triggered');
  }

  async getStatistics(): Promise<any> {
    return {
      total: this.notifications.length,
      unread: this.notifications.filter(n => !n.read).length,
      byType: {
        info: this.notifications.filter(n => n.type === 'info').length,
        success: this.notifications.filter(n => n.type === 'success').length,
        warning: this.notifications.filter(n => n.type === 'warning').length,
        error: this.notifications.filter(n => n.type === 'error').length
      }
    };
  }
}

export const notificationsService = NotificationsService.getInstance();
