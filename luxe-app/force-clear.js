// Force clear all Luxe data
console.log('Force clearing all Luxe data...');
localStorage.removeItem('luxeProperties');
localStorage.removeItem('luxePaymentTransactions');
localStorage.removeItem('luxeBookings');
localStorage.removeItem('luxeGuestInfo');
localStorage.removeItem('luxePropertyInfo');
localStorage.removeItem('luxeBookingId');
localStorage.removeItem('luxeBookingDetails');
localStorage.removeItem('luxeSettings');
localStorage.removeItem('luxeBusinessProfile');
localStorage.removeItem('luxePaymentSettings');
localStorage.removeItem('luxeNotificationSettings');
localStorage.removeItem('luxeSecuritySettings');
console.log('All Luxe data force cleared!');
window.location.reload();
