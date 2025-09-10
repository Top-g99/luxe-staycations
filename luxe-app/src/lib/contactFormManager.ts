export interface ContactFormSubmission {
  id: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  status: 'new' | 'in_progress' | 'completed' | 'closed';
  priority: 'low' | 'medium' | 'high';
  assignedTo?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

class ContactFormManager {
  private submissions: ContactFormSubmission[] = [];
  private subscribers: (() => void)[] = [];

  initialize() {
    if (typeof window !== 'undefined') {
      const savedSubmissions = localStorage.getItem('luxeContactFormSubmissions');
      if (savedSubmissions) {
        try {
          this.submissions = JSON.parse(savedSubmissions);
        } catch (error) {
          console.error('Error loading contact form submissions:', error);
          this.submissions = [];
        }
      }
    }
  }

  getAllSubmissions(): ContactFormSubmission[] {
    return [...this.submissions];
  }

  getSubmissionById(id: string): ContactFormSubmission | undefined {
    return this.submissions.find(submission => submission.id === id);
  }

  addSubmission(submissionData: Omit<ContactFormSubmission, 'id' | 'createdAt' | 'updatedAt'>): ContactFormSubmission {
    const newSubmission: ContactFormSubmission = {
      ...submissionData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.submissions.unshift(newSubmission);
    this.saveSubmissions();
    this.notifySubscribers();
    
    return newSubmission;
  }

  updateSubmission(id: string, updates: Partial<ContactFormSubmission>): ContactFormSubmission | null {
    const index = this.submissions.findIndex(submission => submission.id === id);
    if (index === -1) return null;

    this.submissions[index] = {
      ...this.submissions[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    this.saveSubmissions();
    this.notifySubscribers();
    
    return this.submissions[index];
  }

  deleteSubmission(id: string): boolean {
    const index = this.submissions.findIndex(submission => submission.id === id);
    if (index === -1) return false;

    this.submissions.splice(index, 1);
    this.saveSubmissions();
    this.notifySubscribers();
    
    return true;
  }

  getSubmissionsByStatus(status: ContactFormSubmission['status']): ContactFormSubmission[] {
    return this.submissions.filter(submission => submission.status === status);
  }

  getSubmissionsByPriority(priority: ContactFormSubmission['priority']): ContactFormSubmission[] {
    return this.submissions.filter(submission => submission.priority === priority);
  }

  getStats() {
    const total = this.submissions.length;
    const newCount = this.submissions.filter(s => s.status === 'new').length;
    const inProgressCount = this.submissions.filter(s => s.status === 'in_progress').length;
    const completedCount = this.submissions.filter(s => s.status === 'completed').length;
    const closedCount = this.submissions.filter(s => s.status === 'closed').length;
    const highPriorityCount = this.submissions.filter(s => s.priority === 'high').length;

    return {
      total,
      new: newCount,
      inProgress: inProgressCount,
      completed: completedCount,
      closed: closedCount,
      highPriority: highPriorityCount
    };
  }

  private saveSubmissions() {
    if (typeof window !== 'undefined') {
      localStorage.setItem('luxeContactFormSubmissions', JSON.stringify(this.submissions));
    }
  }

  private notifySubscribers() {
    this.subscribers.forEach(callback => callback());
  }

  subscribe(callback: () => void) {
    this.subscribers.push(callback);
    return () => {
      this.subscribers = this.subscribers.filter(cb => cb !== callback);
    };
  }
}

export const contactFormManager = new ContactFormManager();
