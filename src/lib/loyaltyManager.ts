// Minimal loyalty manager for admin functionality
export interface LoyaltyStats {
  totalMembers: number;
  totalJewels: number;
  activeRedemptions: number;
  totalSpent: number;
}

export class LoyaltyManager {
  private static instance: LoyaltyManager;
  private stats: LoyaltyStats = {
    totalMembers: 0,
    totalJewels: 0,
    activeRedemptions: 0,
    totalSpent: 0
  };
  private subscribers: (() => void)[] = [];

  static getInstance(): LoyaltyManager {
    if (!LoyaltyManager.instance) {
      LoyaltyManager.instance = new LoyaltyManager();
    }
    return LoyaltyManager.instance;
  }

  async initialize(): Promise<void> {
    // Mock initialization
    this.stats = {
      totalMembers: 150,
      totalJewels: 2500,
      activeRedemptions: 12,
      totalSpent: 250000
    };
    return Promise.resolve();
  }

  async getStats(): Promise<LoyaltyStats> {
    return this.stats;
  }

  subscribe(callback: () => void): () => void {
    this.subscribers.push(callback);
    return () => {
      const index = this.subscribers.indexOf(callback);
      if (index > -1) {
        this.subscribers.splice(index, 1);
      }
    };
  }

  private notifySubscribers(): void {
    this.subscribers.forEach(callback => callback());
  }

  async updateStats(newStats: Partial<LoyaltyStats>): Promise<void> {
    this.stats = { ...this.stats, ...newStats };
    this.notifySubscribers();
  }
}

export const loyaltyManager = LoyaltyManager.getInstance();
