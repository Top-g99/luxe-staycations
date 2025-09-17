// Minimal user manager for admin functionality
export interface User {
  id: string;
  email: string;
  name: string;
  phone: string;
  status: 'active' | 'inactive' | 'suspended';
  role: 'user' | 'admin' | 'partner';
  created_at: string;
  updated_at: string;
}

export class UserManager {
  private static instance: UserManager;
  private users: User[] = [];

  static getInstance(): UserManager {
    if (!UserManager.instance) {
      UserManager.instance = new UserManager();
    }
    return UserManager.instance;
  }

  async initialize() {
    // Mock initialization
    return Promise.resolve();
  }

  async getAll(): Promise<User[]> {
    return this.users;
  }

  async getById(id: string): Promise<User | null> {
    return this.users.find(u => u.id === id) || null;
  }

  async create(user: Omit<User, 'id' | 'created_at' | 'updated_at'>): Promise<User> {
    const newUser: User = {
      ...user,
      id: Date.now().toString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    this.users.push(newUser);
    return newUser;
  }

  async update(id: string, updates: Partial<User>): Promise<User | null> {
    const index = this.users.findIndex(u => u.id === id);
    if (index !== -1) {
      this.users[index] = { ...this.users[index], ...updates, updated_at: new Date().toISOString() };
      return this.users[index];
    }
    return null;
  }

  async delete(id: string): Promise<boolean> {
    const index = this.users.findIndex(u => u.id === id);
    if (index !== -1) {
      this.users.splice(index, 1);
      return true;
    }
    return false;
  }

  async getUserById(id: string): Promise<User | null> {
    return this.users.find(u => u.id === id) || null;
  }

  async updateUser(id: string, data: Partial<User>): Promise<User | null> {
    const index = this.users.findIndex(u => u.id === id);
    if (index !== -1) {
      this.users[index] = { ...this.users[index], ...data, updated_at: new Date().toISOString() };
      return this.users[index];
    }
    return null;
  }

  async deleteUser(id: string): Promise<boolean> {
    return this.delete(id);
  }

  async reactivateUser(id: string): Promise<boolean> {
    const user = this.users.find(u => u.id === id);
    if (user) {
      user.updated_at = new Date().toISOString();
      return true;
    }
    return false;
  }

  async deactivateUser(id: string): Promise<boolean> {
    const user = this.users.find(u => u.id === id);
    if (user) {
      user.updated_at = new Date().toISOString();
      return true;
    }
    return false;
  }

  async getAllUsers(): Promise<User[]> {
    return this.users;
  }

  async registerUser(data: any): Promise<User | null> {
    // Check if user already exists
    const existingUser = this.users.find(u => u.email === data.email);
    if (existingUser) {
      return null;
    }

    const newUser: User = {
      id: Date.now().toString(),
      email: data.email,
      name: `${data.firstName} ${data.lastName}`,
      phone: data.phone || '',
      status: 'active',
      role: 'user',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    this.users.push(newUser);
    return newUser;
  }
}

export const userManager = UserManager.getInstance();
