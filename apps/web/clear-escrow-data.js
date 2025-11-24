// Clear Old Escrow Data Script
// Run this once to clear old transaction data with duplicate IDs

console.log('🧹 Clearing old escrow transaction data...');
localStorage.removeItem('fiilar_escrow_transactions');
console.log('✅ Old escrow data cleared! Refresh the page and create new bookings.');
