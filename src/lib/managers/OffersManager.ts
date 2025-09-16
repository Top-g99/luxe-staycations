import { supabase, TABLES, Offer } from '../supabaseClient';

export class OffersManager {
  // Get all offers
  async getAllOffers(): Promise<Offer[]> {
    try {
      const { data, error } = await supabase
        .from(TABLES.OFFERS)
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching offers:', error);
      return [];
    }
  }

  // Get offer by ID
  async getOfferById(id: string): Promise<Offer | null> {
    try {
      const { data, error } = await supabase
        .from(TABLES.OFFERS)
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching offer:', error);
      return null;
    }
  }

  // Create new offer
  async createOffer(offer: Omit<Offer, 'id' | 'created_at' | 'updated_at'>): Promise<Offer | null> {
    try {
      const { data, error } = await supabase
        .from(TABLES.OFFERS)
        .insert([offer])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating offer:', error);
      return null;
    }
  }

  // Update offer
  async updateOffer(id: string, updates: Partial<Offer>): Promise<Offer | null> {
    try {
      const { data, error } = await supabase
        .from(TABLES.OFFERS)
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating offer:', error);
      return null;
    }
  }

  // Delete offer
  async deleteOffer(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from(TABLES.OFFERS)
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting offer:', error);
      return false;
    }
  }

  // Get active offers
  async getActiveOffers(): Promise<Offer[]> {
    try {
      const { data, error } = await supabase
        .from(TABLES.OFFERS)
        .select('*')
        .eq('is_active', true)
        .gte('valid_until', new Date().toISOString())
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching active offers:', error);
      return [];
    }
  }

  // Get expired offers
  async getExpiredOffers(): Promise<Offer[]> {
    try {
      const { data, error } = await supabase
        .from(TABLES.OFFERS)
        .select('*')
        .lt('valid_until', new Date().toISOString())
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching expired offers:', error);
      return [];
    }
  }

  // Toggle offer status
  async toggleOfferStatus(id: string): Promise<boolean> {
    try {
      const offer = await this.getOfferById(id);
      if (!offer) return false;
      
      return await this.updateOffer(id, { is_active: !offer.is_active }) !== null;
    } catch (error) {
      console.error('Error toggling offer status:', error);
      return false;
    }
  }

  // Get offer statistics
  async getOfferStats(): Promise<{
    total: number;
    active: number;
    expired: number;
    byDiscountRange: Record<string, number>;
    dailyStats: Record<string, number>;
  }> {
    try {
      const { data, error } = await supabase
        .from(TABLES.OFFERS)
        .select('*');
      
      if (error) throw error;
      
      const offers = data || [];
      const now = new Date();
      const stats = {
        total: offers.length,
        active: offers.filter(o => o.is_active && new Date(o.valid_until) > now).length,
        expired: offers.filter(o => new Date(o.valid_until) <= now).length,
        byDiscountRange: {} as Record<string, number>,
        dailyStats: {} as Record<string, number>
      };
      
      offers.forEach(offer => {
        // Categorize by discount range
        let range = '';
        if (offer.discount_percentage < 10) range = '0-9%';
        else if (offer.discount_percentage < 20) range = '10-19%';
        else if (offer.discount_percentage < 30) range = '20-29%';
        else if (offer.discount_percentage < 40) range = '30-39%';
        else range = '40%+';
        
        stats.byDiscountRange[range] = (stats.byDiscountRange[range] || 0) + 1;
        
        const date = new Date(offer.created_at).toISOString().substring(0, 10);
        stats.dailyStats[date] = (stats.dailyStats[date] || 0) + 1;
      });
      
      return stats;
    } catch (error) {
      console.error('Error fetching offer stats:', error);
      return {
        total: 0,
        active: 0,
        expired: 0,
        byDiscountRange: {},
        dailyStats: {}
      };
    }
  }

  // Get offers by discount range
  async getOffersByDiscountRange(minDiscount: number, maxDiscount: number): Promise<Offer[]> {
    try {
      const { data, error } = await supabase
        .from(TABLES.OFFERS)
        .select('*')
        .gte('discount_percentage', minDiscount)
        .lte('discount_percentage', maxDiscount)
        .order('discount_percentage', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching offers by discount range:', error);
      return [];
    }
  }

  // Get offers expiring soon
  async getOffersExpiringSoon(days: number = 7): Promise<Offer[]> {
    try {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + days);
      
      const { data, error } = await supabase
        .from(TABLES.OFFERS)
        .select('*')
        .eq('is_active', true)
        .lte('valid_until', futureDate.toISOString())
        .order('valid_until', { ascending: true });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching offers expiring soon:', error);
      return [];
    }
  }

  // Search offers
  async searchOffers(query: string): Promise<Offer[]> {
    try {
      const { data, error } = await supabase
        .from(TABLES.OFFERS)
        .select('*')
        .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error searching offers:', error);
      return [];
    }
  }

  // Validate offer dates
  validateOfferDates(validFrom: string, validUntil: string): { isValid: boolean; error?: string } {
    const fromDate = new Date(validFrom);
    const untilDate = new Date(validUntil);
    const now = new Date();
    
    if (fromDate >= untilDate) {
      return { isValid: false, error: 'Valid from date must be before valid until date' };
    }
    
    if (untilDate <= now) {
      return { isValid: false, error: 'Valid until date must be in the future' };
    }
    
    return { isValid: true };
  }

  // Auto-expire offers
  async autoExpireOffers(): Promise<number> {
    try {
      const { data, error } = await supabase
        .from(TABLES.OFFERS)
        .update({ is_active: false })
        .lt('valid_until', new Date().toISOString())
        .eq('is_active', true)
        .select();
      
      if (error) throw error;
      return data?.length || 0;
    } catch (error) {
      console.error('Error auto-expiring offers:', error);
      return 0;
    }
  }
}

export const offersManager = new OffersManager();
