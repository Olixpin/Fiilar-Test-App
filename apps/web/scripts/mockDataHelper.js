/**
 * Mock Data Management Script
 *
 * Run in browser console to manage mock listings
 *
 * Usage:
 * 1. Open browser dev tools (F12)
 * 2. Go to Console tab
 * 3. Copy/paste commands below
 */

// ============================================
// COMMANDS TO RUN IN BROWSER CONSOLE
// ============================================

// Generate 200 more listings (adds to existing)
// FiilarMockGenerator.seedListingsInStorage(200)

// Generate specific count
// FiilarMockGenerator.seedListingsInStorage(50)

// Clear all generated listings (keeps original 13)
// FiilarMockGenerator.clearGeneratedListings()

// Check current listing count
// JSON.parse(localStorage.getItem('fiilar_listings')).length

// Full reset - clear everything
// localStorage.removeItem('fiilar_listings')

// ============================================
// AUTO-SEED ON PAGE LOAD
// ============================================
// The app automatically generates 200 listings on first load
// if ENABLE_BULK_LISTINGS is true in libs/storage/src/init.ts

console.log(`
╔═══════════════════════════════════════════════════════════════╗
║         FIILAR MOCK DATA GENERATOR                            ║
╠═══════════════════════════════════════════════════════════════╣
║                                                               ║
║  Available commands (run in browser console):                 ║
║                                                               ║
║  1. Add 200 more listings:                                    ║
║     FiilarMockGenerator.seedListingsInStorage(200)            ║
║                                                               ║
║  2. Clear generated listings (keep original 13):              ║
║     FiilarMockGenerator.clearGeneratedListings()              ║
║                                                               ║
║  3. Check total listings:                                     ║
║     JSON.parse(localStorage.getItem('fiilar_listings')).length║
║                                                               ║
║  4. Full reset (clear all storage):                           ║
║     localStorage.clear()                                      ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
`);
