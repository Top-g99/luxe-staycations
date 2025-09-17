# Loyalty Rules Setup Guide

## 🎯 **What You Can Configure**

### **1. Earning Rules**
- **Spend to Jewel Rate**: How much money spent = 1 jewel (default: ₹100 = 1 jewel)
- **Minimum Spend**: Minimum amount required to earn jewels (default: ₹1000)
- **Jewel Earning Cap**: Maximum jewels per booking (default: 1000 jewels)

### **2. Redemption Rules**
- **Jewel to Rupee Rate**: 1 jewel = how many rupees (default: 1 jewel = ₹1)
- **Minimum Redemption**: Minimum jewels needed for redemption (default: 100 jewels)
- **Maximum Redemption**: Maximum jewels per redemption (default: 5000 jewels)
- **Processing Fee**: Any fees for redemption (default: 0%)

### **3. Tier Rules**
- **Bronze Threshold**: Jewels needed for Bronze tier (default: 0 jewels)
- **Silver Threshold**: Jewels needed for Silver tier (default: 1000 jewels)
- **Gold Threshold**: Jewels needed for Gold tier (default: 5000 jewels)
- **Platinum Threshold**: Jewels needed for Platinum tier (default: 15000 jewels)
- **Diamond Threshold**: Jewels needed for Diamond tier (default: 50000 jewels)

### **4. Bonus Rules**
- **First Booking Bonus**: Extra jewels for first booking (default: 50 jewels)
- **Referral Bonus**: Jewels for referring friends (default: 25 jewels)
- **Review Bonus**: Jewels for leaving reviews (default: 10 jewels)
- **Weekend Stay Bonus**: Multiplier for weekend stays (default: 1.5x)

### **5. Expiry Rules**
- **Jewel Expiry**: Days before jewels expire (default: 365 days)
- **Tier Downgrade**: Days of inactivity before tier downgrade (default: 730 days)

## 🚀 **Quick Setup Steps**

### **Step 1: Run the Database Schema**
```bash
cd /Users/ishaankhan/Desktop/Luxe/luxe
psql -d your_database_name -f loyalty-rules-schema.sql
```

### **Step 2: Access Admin Panel**
1. Go to `/admin/loyalty-rules`
2. You'll see all the default rules already configured
3. Click "Edit" on any rule to modify it

### **Step 3: Customize Key Rules**

#### **Example: Change Earning Rate**
1. Find "spend_to_jewel_rate" rule
2. Click "Edit"
3. Change value from 100 to 50 (if you want ₹50 = 1 jewel)
4. Add change reason: "Reduced earning rate to increase guest engagement"
5. Click "Save Changes"

#### **Example: Change Redemption Rate**
1. Find "jewel_to_rupee_rate" rule
2. Click "Edit"
3. Change value from 1.00 to 1.25 (if you want 1 jewel = ₹1.25)
4. Add change reason: "Increased redemption value to improve guest satisfaction"
5. Click "Save Changes"

## 📊 **How Rules Work Together**

### **Earning Calculation**
```
Jewels Earned = (Spend Amount / Spend Rate) × Bonus Multipliers
Example: ₹2000 spent = (2000 / 100) × 1.5 = 30 jewels
```

### **Redemption Calculation**
```
Redemption Value = Jewels × Jewel Rate × (1 - Processing Fee)
Example: 100 jewels = 100 × 1.00 × (1 - 0) = ₹100
```

### **Tier Progression**
```
Guest starts at Bronze (0 jewels)
→ Silver at 1000 jewels
→ Gold at 5000 jewels
→ Platinum at 15000 jewels
→ Diamond at 50000 jewels
```

## 🔧 **Advanced Configuration**

### **Adding Custom Rules**
1. Click "Add New Rule"
2. Choose rule type (earning, redemption, tier, bonus, expiry)
3. Set rule name, description, value, and unit
4. Configure who it applies to
5. Set priority (lower numbers = higher priority)

### **Rule Priority System**
- **Priority 1-10**: Core earning and redemption rules
- **Priority 11-20**: Tier thresholds
- **Priority 21-30**: Bonus rules
- **Priority 31-40**: Expiry rules

### **Rule Activation/Deactivation**
- Use the switch to activate/deactivate rules
- Inactive rules don't affect calculations
- Perfect for seasonal promotions or temporary changes

## 📱 **Real-World Examples**

### **Scenario 1: Increase Guest Engagement**
```
Change "spend_to_jewel_rate" from 100 to 75
→ ₹75 spent = 1 jewel (instead of ₹100)
→ Guests earn jewels faster
→ More incentive to book
```

### **Scenario 2: Premium Tier Benefits**
```
Change "gold_threshold" from 5000 to 3000
→ More guests reach Gold tier
→ Better customer retention
→ Higher perceived value
```

### **Scenario 3: Seasonal Promotion**
```
Add new rule: "summer_bonus"
Type: bonus, Value: 2.0, Unit: multiplier
Applies to: summer_bookings
→ Double jewels during summer months
```

## 🎨 **Best Practices**

### **1. Test Changes First**
- Make small adjustments
- Monitor guest behavior
- Use change reasons for tracking

### **2. Balance Earning vs Redemption**
- Don't make earning too easy
- Ensure redemption provides real value
- Consider your profit margins

### **3. Seasonal Adjustments**
- Increase earning rates during low season
- Add bonus rules for special events
- Adjust tier thresholds based on market

### **4. Monitor Performance**
- Track jewel earning rates
- Monitor redemption patterns
- Adjust rules based on data

## 🚨 **Important Notes**

### **Rule Changes Are Immediate**
- Changes take effect immediately
- No need to restart the system
- All new transactions use new rules

### **Audit Trail**
- All rule changes are logged
- Includes who made the change and why
- Full history maintained for compliance

### **Backup Before Major Changes**
- Export current rules
- Test changes in development
- Have rollback plan ready

## 🔍 **Troubleshooting**

### **Rule Not Working?**
1. Check if rule is active
2. Verify rule applies to the right audience
3. Check rule priority
4. Ensure rule value is within min/max constraints

### **Calculation Issues?**
1. Verify rule units match
2. Check for conflicting rules
3. Review rule priority order
4. Test with simple examples

### **Performance Issues?**
1. Check database indexes
2. Monitor rule complexity
3. Consider rule caching
4. Optimize rule queries

---

## 🎉 **You're Ready!**

Your loyalty rules system is now fully configurable. You can:
- ✅ Set earning rates (₹100 = 1 jewel)
- ✅ Set redemption rates (1 jewel = ₹1)
- ✅ Configure tier thresholds
- ✅ Add bonus rules
- ✅ Set expiry policies
- ✅ Edit rules anytime
- ✅ Track all changes

**Start with small changes and monitor the impact on your guest engagement!**


