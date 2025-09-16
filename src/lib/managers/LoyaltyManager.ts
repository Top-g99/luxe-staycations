import { supabase, TABLES, LoyaltyMember } from '../supabaseClient';

export class LoyaltyManager {
  // Get all loyalty members
  async getAllLoyaltyMembers(): Promise<LoyaltyMember[]> {
    try {
      const { data, error } = await supabase
        .from(TABLES.LOYALTY_MEMBERS)
        .select('*')
        .order('points', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching loyalty members:', error);
      return [];
    }
  }

  // Get loyalty member by ID
  async getLoyaltyMemberById(id: string): Promise<LoyaltyMember | null> {
    try {
      const { data, error } = await supabase
        .from(TABLES.LOYALTY_MEMBERS)
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching loyalty member:', error);
      return null;
    }
  }

  // Get loyalty member by email
  async getLoyaltyMemberByEmail(email: string): Promise<LoyaltyMember | null> {
    try {
      const { data, error } = await supabase
        .from(TABLES.LOYALTY_MEMBERS)
        .select('*')
        .eq('email', email)
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching loyalty member by email:', error);
      return null;
    }
  }

  // Create new loyalty member
  async createLoyaltyMember(member: Omit<LoyaltyMember, 'id' | 'created_at' | 'updated_at'>): Promise<LoyaltyMember | null> {
    try {
      const { data, error } = await supabase
        .from(TABLES.LOYALTY_MEMBERS)
        .insert([member])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating loyalty member:', error);
      return null;
    }
  }

  // Update loyalty member
  async updateLoyaltyMember(id: string, updates: Partial<LoyaltyMember>): Promise<LoyaltyMember | null> {
    try {
      const { data, error } = await supabase
        .from(TABLES.LOYALTY_MEMBERS)
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating loyalty member:', error);
      return null;
    }
  }

  // Delete loyalty member
  async deleteLoyaltyMember(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from(TABLES.LOYALTY_MEMBERS)
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting loyalty member:', error);
      return false;
    }
  }

  // Add points to member
  async addPoints(memberId: string, points: number): Promise<boolean> {
    try {
      const member = await this.getLoyaltyMemberById(memberId);
      if (!member) return false;
      
      const newPoints = member.points + points;
      const newTier = this.calculateTier(newPoints);
      
      return await this.updateLoyaltyMember(memberId, { 
        points: newPoints, 
        tier: newTier 
      }) !== null;
    } catch (error) {
      console.error('Error adding points:', error);
      return false;
    }
  }

  // Redeem points
  async redeemPoints(memberId: string, points: number): Promise<{ success: boolean; remainingPoints: number }> {
    try {
      const member = await this.getLoyaltyMemberById(memberId);
      if (!member) return { success: false, remainingPoints: 0 };
      
      if (member.points < points) {
        return { success: false, remainingPoints: member.points };
      }
      
      const newPoints = member.points - points;
      const newTier = this.calculateTier(newPoints);
      
      const success = await this.updateLoyaltyMember(memberId, { 
        points: newPoints, 
        tier: newTier 
      }) !== null;
      
      return { success, remainingPoints: newPoints };
    } catch (error) {
      console.error('Error redeeming points:', error);
      return { success: false, remainingPoints: 0 };
    }
  }

  // Calculate tier based on points
  calculateTier(points: number): LoyaltyMember['tier'] {
    if (points >= 10000) return 'platinum';
    if (points >= 5000) return 'gold';
    if (points >= 2000) return 'silver';
    return 'bronze';
  }

  // Get members by tier
  async getMembersByTier(tier: LoyaltyMember['tier']): Promise<LoyaltyMember[]> {
    try {
      const { data, error } = await supabase
        .from(TABLES.LOYALTY_MEMBERS)
        .select('*')
        .eq('tier', tier)
        .order('points', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching members by tier:', error);
      return [];
    }
  }

  // Get top members
  async getTopMembers(limit: number = 10): Promise<LoyaltyMember[]> {
    try {
      const { data, error } = await supabase
        .from(TABLES.LOYALTY_MEMBERS)
        .select('*')
        .order('points', { ascending: false })
        .limit(limit);
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching top members:', error);
      return [];
    }
  }

  // Get loyalty statistics
  async getLoyaltyStats(): Promise<{
    totalMembers: number;
    byTier: Record<string, number>;
    totalPoints: number;
    averagePoints: number;
    topEarner: LoyaltyMember | null;
    monthlySignups: Record<string, number>;
  }> {
    try {
      const { data, error } = await supabase
        .from(TABLES.LOYALTY_MEMBERS)
        .select('*');
      
      if (error) throw error;
      
      const members = data || [];
      const stats = {
        totalMembers: members.length,
        byTier: {} as Record<string, number>,
        totalPoints: members.reduce((sum, m) => sum + m.points, 0),
        averagePoints: 0,
        topEarner: null as LoyaltyMember | null,
        monthlySignups: {} as Record<string, number>
      };
      
      if (members.length > 0) {
        stats.averagePoints = stats.totalPoints / members.length;
        stats.topEarner = members.reduce((top, member) => 
          member.points > top.points ? member : top
        );
        
        members.forEach(member => {
          stats.byTier[member.tier] = (stats.byTier[member.tier] || 0) + 1;
          
          const date = new Date(member.created_at).toISOString().substring(0, 7);
          stats.monthlySignups[date] = (stats.monthlySignups[date] || 0) + 1;
        });
      }
      
      return stats;
    } catch (error) {
      console.error('Error fetching loyalty stats:', error);
      return {
        totalMembers: 0,
        byTier: {},
        totalPoints: 0,
        averagePoints: 0,
        topEarner: null,
        monthlySignups: {}
      };
    }
  }

  // Process booking for loyalty points
  async processBookingForLoyalty(bookingData: {
    guestEmail: string;
    totalAmount: number;
    bookingId: string;
  }): Promise<boolean> {
    try {
      // Calculate points (1 point per 100 rupees spent)
      const points = Math.floor(bookingData.totalAmount / 100);
      
      // Find or create loyalty member
      let member = await this.getLoyaltyMemberByEmail(bookingData.guestEmail);
      
      if (!member) {
        // Create new member
        member = await this.createLoyaltyMember({
          email: bookingData.guestEmail,
          name: '', // Will be updated when user provides name
          phone: '',
          points: points,
          tier: this.calculateTier(points),
          total_bookings: 1
        });
      } else {
        // Update existing member
        const newPoints = member.points + points;
        const newTier = this.calculateTier(newPoints);
        
        member = await this.updateLoyaltyMember(member.id, {
          points: newPoints,
          tier: newTier,
          total_bookings: member.total_bookings + 1
        });
      }
      
      return member !== null;
    } catch (error) {
      console.error('Error processing booking for loyalty:', error);
      return false;
    }
  }

  // Get member benefits
  getMemberBenefits(tier: LoyaltyMember['tier']): {
    discountPercentage: number;
    prioritySupport: boolean;
    earlyAccess: boolean;
    freeUpgrades: boolean;
  } {
    const benefits = {
      bronze: { discountPercentage: 5, prioritySupport: false, earlyAccess: false, freeUpgrades: false },
      silver: { discountPercentage: 10, prioritySupport: true, earlyAccess: false, freeUpgrades: false },
      gold: { discountPercentage: 15, prioritySupport: true, earlyAccess: true, freeUpgrades: false },
      platinum: { discountPercentage: 20, prioritySupport: true, earlyAccess: true, freeUpgrades: true }
    };
    
    return benefits[tier];
  }
}

export const loyaltyManager = new LoyaltyManager();
