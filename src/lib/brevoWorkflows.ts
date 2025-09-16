// Minimal Brevo workflows service for admin functionality
export interface BrevoWorkflow {
  id: string;
  name: string;
  trigger: string;
  template_id: string;
  enabled: boolean;
  created_at: string;
  updated_at: string;
}

export class BrevoWorkflows {
  private static instance: BrevoWorkflows;
  private workflows: BrevoWorkflow[] = [];

  static getInstance(): BrevoWorkflows {
    if (!BrevoWorkflows.instance) {
      BrevoWorkflows.instance = new BrevoWorkflows();
    }
    return BrevoWorkflows.instance;
  }

  async initialize() {
    // Mock initialization
    return Promise.resolve();
  }

  async getAll(): Promise<BrevoWorkflow[]> {
    return this.workflows;
  }

  async getById(id: string): Promise<BrevoWorkflow | null> {
    return this.workflows.find(w => w.id === id) || null;
  }

  async create(workflow: Omit<BrevoWorkflow, 'id' | 'created_at' | 'updated_at'>): Promise<BrevoWorkflow> {
    const newWorkflow: BrevoWorkflow = {
      ...workflow,
      id: Date.now().toString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    this.workflows.push(newWorkflow);
    return newWorkflow;
  }

  async update(id: string, updates: Partial<BrevoWorkflow>): Promise<BrevoWorkflow | null> {
    const index = this.workflows.findIndex(w => w.id === id);
    if (index !== -1) {
      this.workflows[index] = { ...this.workflows[index], ...updates, updated_at: new Date().toISOString() };
      return this.workflows[index];
    }
    return null;
  }

  async delete(id: string): Promise<boolean> {
    const index = this.workflows.findIndex(w => w.id === id);
    if (index !== -1) {
      this.workflows.splice(index, 1);
      return true;
    }
    return false;
  }

  async triggerWorkflow(type: string, data: any): Promise<boolean> {
    console.log(`Mock Brevo workflow triggered: ${type}`, data);
    // In a real implementation, this would trigger the actual Brevo workflow
    return true;
  }
}

export const brevoWorkflows = BrevoWorkflows.getInstance();
