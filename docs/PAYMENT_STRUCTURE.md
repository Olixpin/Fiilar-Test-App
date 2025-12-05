# Fiilar Payment & Fee Structure

> **Version:** 1.1  
> **Last Updated:** December 5, 2025  
> **Status:** Approved

---

## Table of Contents

1. [Overview](#overview)
2. [Fee Structure](#fee-structure)
3. [Payment Flow](#payment-flow)
4. [Cancellation & Refunds](#cancellation--refunds)
5. [Caution/Security Deposit](#cautionsecurity-deposit)
6. [Disputes](#disputes)
7. [Examples](#examples)
8. [Technical Implementation](#technical-implementation)

---

## Overview

Fiilar operates a **dual-fee model** where both guests (users) and hosts pay service fees. This structure ensures platform sustainability while keeping fees transparent and competitive globally.

### Key Principles

- ✅ **No VAT** - Nigeria does not require VAT on these services
- ✅ **No fees on Optional Extras** - Add-ons are charged at listing price only
- ✅ **Service fees on Extra Guests** - Fees apply to base price + extra guest fees
- ✅ **Transparent pricing** - All fees shown before booking confirmation
- ✅ **Secure escrow** - Funds held until successful handshake verification
- ✅ **Caution is fully refundable** - Returned after 48-hour damage claim window
- ✅ **Service fee refunded on cancellation** - Platform only keeps fees on successful bookings

---

## Fee Structure

### User Service Fee (Guest Pays)

| Fee Type | Rate | Calculated On |
|----------|------|---------------|
| **User Service Fee** | **10%** | Base Price + Extra Guest Fees (excludes optional extras & caution) |

**Example:**  
Base Price = ₦150,000, Extra Guest Fees = ₦10,000 → User Service Fee = ₦16,000 (10% of ₦160,000)

### Host Service Fee (Deducted from Host Payout)

The host service fee varies based on the listing's **cancellation policy**:

| Cancellation Policy | Host Fee | Rationale |
|---------------------|----------|-----------|
| **Non-refundable** | **5%** | Host takes most risk, higher platform fee |
| **Strict** | **4%** | Limited refund window |
| **Moderate** | **3%** | Balanced policy |
| **Flexible** | **3%** | Most guest-friendly |

**Example:**  
Base Price = ₦150,000, Extra Guest Fees = ₦10,000, Policy = Flexible (3%)  
→ Host Service Fee = ₦4,800 (3% of ₦160,000)

---

## Guest Capacity Model

### How It Works

Fiilar uses a **"Max + Optional Extras"** model for guest capacity:

| Field | Description |
|-------|-------------|
| **maxGuests** | Base maximum guests (all included in base price) |
| **allowExtraGuests** | Toggle: Can users request MORE than max? |
| **extraGuestLimit** | How many extra guests beyond max are allowed (capped at 50% of maxGuests) |
| **extraGuestFee** | Price charged per extra guest |

### Example

**Host Sets:**
- Max Guests: **10** (included in base price)
- Allow Extras: **Yes**
- Extra Guest Limit: **3** (max 50% of 10 = 5, host chose 3)
- Extra Guest Fee: **₦2,000/person**

**This Means:**
- Base capacity: 10 people (included in ₦150,000 base price)
- Can go up to: 10 + 3 = **13 people** (if user pays extra)
- Extra cost for 13 guests: ₦2,000 × 3 = ₦6,000

### Validation Rules

| Rule | Value | Rationale |
|------|-------|----------|
| Max Extra Percentage | **50%** of maxGuests | Prevents abuse (e.g., "max 2, but 10 extras!") |
| Min Extra Fee | **₦500** | Ensures meaningful charge |
| Max Extra Fee | **50%** of base price | Keeps extras reasonable |

### User Experience

**For Hosts (Create Listing):**
1. Set "Maximum guests" (included in base price)
2. Toggle "Allow extra guests?"
3. If yes: Set limit (up to 50% of max) and fee per extra

**For Users (Booking):**
1. Select guests up to max (no extra charge)
2. See option: "Need extra guests?" with fee displayed
3. If selected, choose how many extras (up to limit)
4. Price summary shows extra guest fees clearly

### Extras/Add-ons (Unchanged)

| Component | Fee | Notes |
|-----------|-----|-------|
| **Extras** | **0%** | No fees charged on extras |

Extras are passed through at the exact listing price. Host receives 100% of extras.

### Platform Revenue

```
Platform Revenue = User Service Fee + Host Service Fee
```

---

## Payment Flow

### What Guest Pays (Total Amount)

```
Subtotal = Base Price + Extra Guest Fees
Total Amount = Subtotal + User Service Fee (10% of Subtotal) + Caution + Optional Extras
```

| Component | Calculation |
|-----------|-------------|
| Base Price | Listing price × duration (includes maxGuests) |
| Extra Guest Fees | extraGuestFee × number of extra guests |
| User Service Fee | 10% of (Base Price + Extra Guest Fees) |
| Caution | Fixed amount set by host |
| Optional Extras | Sum of selected add-ons (no markup) |

### What Host Receives (Payout)

```
Subtotal = Base Price + Extra Guest Fees
Host Payout = Subtotal - Host Service Fee (3-5% of Subtotal) + Optional Extras
```

| Component | Calculation |
|-----------|-------------|
| Base Price | Full listing price × duration |
| Extra Guest Fees | extraGuestFee × number of extra guests (100%) |
| Host Service Fee | 3-5% of (Base Price + Extra Guest Fees) - deducted |
| Optional Extras | Full add-ons amount (100%) |

### What Platform Keeps

```
Platform Fee = User Service Fee + Host Service Fee
```

---

## Payment Timeline

| Event | Timing | Action |
|-------|--------|--------|
| **Booking Created** | Immediate | Guest pays Total Amount → held in escrow |
| **Host Accepts** | Within 24h | Booking confirmed, funds secured |
| **Check-in** | Booking date | Guest arrives, handshake initiated |
| **Handshake Verified** | At check-in | Host verifies guest code |
| **Checkout** | End of booking | Booking marked "Completed" |
| **Damage Claim Window** | 0-48h after checkout | Host can file damage claim |
| **Host Payout** | 24-48h after checkout | Funds released to host |
| **Caution Released** | 48h after checkout | Auto-released to guest (if no claim) |

### Escrow Release Timing by Pricing Model

| Pricing Model | Release After Checkout |
|---------------|------------------------|
| Hourly | 24 hours |
| Daily | 24 hours |
| Nightly | 48 hours |

---

## Cancellation & Refunds

### Cancellation Policies

| Policy | Full Refund | 50% Refund | No Refund |
|--------|-------------|------------|-----------|
| **Flexible** | ≥24 hours before | 12-24 hours | <12 hours |
| **Moderate** | ≥7 days before | 2-7 days | <48 hours |
| **Strict** | Never | ≥14 days before | <14 days |
| **Non-refundable** | Never | Never | Always |

### What Gets Refunded on Cancellation

| Component | Refund Policy |
|-----------|---------------|
| **Base Price** | Based on cancellation policy (0%, 50%, 100%) |
| **Extras** | Same as base price |
| **User Service Fee** | **100% refunded** - Platform only keeps fee on successful bookings |
| **Caution** | **Always 100% refunded** |

### Refund Calculation Formula

```
Total Refund = (Base Price + Extras) × Policy% + User Service Fee (100%) + Caution (100%)
```

### Example: Guest Cancels a Flexible Booking 48 Hours Before

| Original Payment | Amount |
|------------------|--------|
| Base Price | ₦150,000 |
| User Service Fee | ₦15,000 |
| Caution | ₦50,000 |
| Extras | ₦20,000 |
| **Total Paid** | **₦235,000** |

| Refund Breakdown | Amount |
|------------------|--------|
| Base Price (100%) | ₦150,000 |
| Extras (100%) | ₦20,000 |
| User Service Fee (100%) | ₦15,000 |
| Caution (100%) | ₦50,000 |
| **Total Refund** | **₦235,000** |

**Platform keeps:** ₦0 (service fee only charged on successful bookings)

---

## Caution/Security Deposit

### Purpose
Security deposit to cover potential damages to the property.

### Key Rules

| Rule | Details |
|------|---------|
| **Set by** | Host (per listing) |
| **Charged to** | Guest (included in total) |
| **Held by** | Platform (escrow) |
| **NOT part of host payout** | Caution is held separately |

### Release Process

```
Checkout
    ↓
48-Hour Damage Claim Window
    ↓
┌─────────────────────────────────────┐
│  No Claim Filed?                    │
│  → Auto-release to guest wallet     │
├─────────────────────────────────────┤
│  Claim Filed?                       │
│  → Hold until dispute resolved      │
└─────────────────────────────────────┘
```

### Caution Timeline

| Time | Action |
|------|--------|
| Booking created | Caution collected from guest |
| During stay | Held in platform escrow |
| Checkout | 48-hour window begins |
| Checkout + 48h | Auto-released if no damage claim |
| If damage claim | Held until admin resolves dispute |

---

## Disputes

### When Disputes Occur

- Guest reports issues with property
- Host reports damages
- Handshake verification fails
- Service not as described

### Fund Handling During Disputes

| Status | Funds Location |
|--------|----------------|
| Dispute opened | Platform escrow (frozen) |
| Under review | Platform escrow (frozen) |
| Resolved | Released per admin decision |

### Resolution Options

| Decision | Action |
|----------|--------|
| **Rule for Guest** | Full refund to guest (base + extras + caution) |
| **Rule for Host** | Release payout to host, caution may go to host for damages |
| **Split Decision** | Partial refund/payout based on admin judgment |

---

## Examples

### Example 1: Standard Booking (Flexible Policy, No Extra Guests)

**Host Lists:**
- Base Price: ₦150,000 (for 2 nights)
- Max Guests: 10 (included in base price)
- Caution: ₦50,000
- Cancellation Policy: Flexible (3% host fee)

**Guest Selects:**
- Guests: 8 (within max, no extra charge)
- Optional Extras: ₦20,000 (cleaning, late checkout)

**Calculation:**

| Component | Calculation | Amount |
|-----------|-------------|--------|
| Base Price | ₦150,000 | ₦150,000 |
| Extra Guest Fees | 0 (within max) | ₦0 |
| Subtotal | | ₦150,000 |
| User Service Fee | 10% × ₦150,000 | ₦15,000 |
| Caution | Fixed | ₦50,000 |
| Optional Extras | No fee | ₦20,000 |
| **Guest Pays** | | **₦235,000** |

| Component | Calculation | Amount |
|-----------|-------------|--------|
| Subtotal | ₦150,000 | ₦150,000 |
| Host Service Fee | 3% × ₦150,000 | -₦4,500 |
| Optional Extras | 100% | ₦20,000 |
| **Host Receives** | | **₦165,500** |

| Component | Amount |
|-----------|--------|
| User Service Fee | ₦15,000 |
| Host Service Fee | ₦4,500 |
| **Platform Revenue** | **₦19,500** |

**After 48 Hours (no damages):**
- Caution ₦50,000 → returned to guest wallet

---

### Example 2: Booking WITH Extra Guests (Flexible Policy)

**Host Lists:**
- Base Price: ₦150,000 (for 2 nights)
- Max Guests: 10 (included in base price)
- Allow Extra Guests: Yes
- Extra Guest Limit: 3
- Extra Guest Fee: ₦5,000/person
- Caution: ₦50,000
- Cancellation Policy: Flexible (3% host fee)

**Guest Selects:**
- Guests: 12 (10 base + 2 extra)
- Optional Extras: ₦20,000 (cleaning, late checkout)

**Calculation:**

| Component | Calculation | Amount |
|-----------|-------------|--------|
| Base Price | ₦150,000 | ₦150,000 |
| Extra Guest Fees | 2 × ₦5,000 | ₦10,000 |
| **Subtotal** | | **₦160,000** |
| User Service Fee | 10% × ₦160,000 | ₦16,000 |
| Caution | Fixed | ₦50,000 |
| Optional Extras | No fee | ₦20,000 |
| **Guest Pays** | | **₦246,000** |

| Component | Calculation | Amount |
|-----------|-------------|--------|
| Subtotal | ₦160,000 | ₦160,000 |
| Host Service Fee | 3% × ₦160,000 | -₦4,800 |
| Optional Extras | 100% | ₦20,000 |
| **Host Receives** | | **₦175,200** |

| Component | Amount |
|-----------|--------|
| User Service Fee | ₦16,000 |
| Host Service Fee | ₦4,800 |
| **Platform Revenue** | **₦20,800** |

**After 48 Hours (no damages):**
- Caution ₦50,000 → returned to guest wallet

---

### Example 3: Strict Policy with Cancellation

**Original Booking:**
- Base Price: ₦100,000
- Extra Guest Fees: ₦10,000 (2 extra guests)
- Subtotal: ₦110,000
- User Service Fee: ₦11,000 (10% of subtotal)
- Caution: ₦30,000
- Optional Extras: ₦10,000
- **Total Paid: ₦161,000**

**Guest Cancels 10 Days Before (Strict Policy = 50% refund):**

| Component | Refund | Amount |
|-----------|--------|--------|
| Base Price | 50% | ₦50,000 |
| Extra Guest Fees | 50% | ₦5,000 |
| Optional Extras | 50% | ₦5,000 |
| User Service Fee | 100% | ₦11,000 |
| Caution | 100% | ₦30,000 |
| **Total Refund** | | **₦101,000** |

**Platform keeps:** ₦0 (service fee only charged on successful bookings)
**Host receives:** 50% of (Base + Extra Guests + Extras) = ₦60,000 (no host service fee deducted on cancelled bookings)

---

### Example 4: Non-Refundable with Damage Claim

**Booking:**
- Base Price: ₦200,000
- Host Fee: 5% (Non-refundable policy)
- Caution: ₦60,000

**After Checkout - Host Files Damage Claim:**

| Outcome | Caution Goes To |
|---------|-----------------|
| Claim approved (full) | Host receives ₦60,000 |
| Claim approved (partial) | Host receives partial, guest gets rest |
| Claim denied | Guest receives ₦60,000 |

---

## Technical Implementation

### Booking Data Structure

```typescript
interface Booking {
  // ... existing fields
  
  // Pricing (stored separately for transparency)
  basePrice: number;           // Listing price × duration (includes maxGuests)
  extraGuestFees: number;      // extraGuestFee × number of extra guests
  extrasTotal: number;         // Sum of optional add-ons
  
  // Fees (calculated on basePrice + extraGuestFees)
  userServiceFee: number;      // 10% of (basePrice + extraGuestFees)
  hostServiceFee: number;      // 3-5% of (basePrice + extraGuestFees)
  
  // Deposits
  cautionFee: number;          // Security deposit (refundable)
  
  // Totals
  totalPrice: number;          // Guest pays: basePrice + extraGuestFees + userServiceFee + cautionFee + extrasTotal
  
  // Guest info
  guestCount: number;          // Total guests (base + extra)
  extraGuestCount?: number;    // Number of guests beyond maxGuests
  
  // Caution tracking
  cautionStatus?: 'HELD' | 'RELEASED' | 'CLAIMED' | 'PARTIAL_CLAIM';
  cautionReleasedAt?: string;  // ISO timestamp
  cautionClaimAmount?: number; // If partial claim
}

interface Listing {
  // Guest Capacity (NEW MODEL)
  maxGuests: number;            // Base max guests (included in base price)
  allowExtraGuests?: boolean;   // Toggle: allow overflow?
  extraGuestLimit?: number;     // How many extra beyond max (capped at 50% of maxGuests)
  extraGuestFee?: number;       // Price per extra guest
  
  // DEPRECATED (migrated to new model)
  // capacity?: number;         // Use maxGuests instead
  // includedGuests?: number;   // No longer needed - maxGuests = included
  // pricePerExtraGuest?: number; // Use extraGuestFee instead
}
```

### Fee Calculation Functions

```typescript
// Constants
const EXTRA_GUEST_RULES = {
  MAX_EXTRA_PERCENTAGE: 0.5,  // 50% of maxGuests
  MIN_EXTRA_FEE: 500,         // ₦500 minimum
  MAX_EXTRA_FEE_RATIO: 0.5,   // Can't exceed 50% of base price
};

// Calculate extra guest fees
const calculateExtraGuestFees = (
  extraGuestCount: number,
  extraGuestFee: number
): number => {
  return extraGuestCount * extraGuestFee;
};

// User service fee (10% of base + extra guest fees)
const calculateUserServiceFee = (basePrice: number, extraGuestFees: number): number => {
  return (basePrice + extraGuestFees) * 0.10;
};

// Host service fee (3-5% of base + extra guest fees)
const calculateHostServiceFee = (
  basePrice: number,
  extraGuestFees: number,
  cancellationPolicy: CancellationPolicy
): number => {
  const rates = {
    'Non-refundable': 0.05,
    'Strict': 0.04,
    'Moderate': 0.03,
    'Flexible': 0.03,
  };
  const subtotal = basePrice + extraGuestFees;
  return subtotal * (rates[cancellationPolicy] || 0.03);
};

// Total guest payment
const calculateGuestTotal = (
  basePrice: number,
  extraGuestFees: number,
  userServiceFee: number,
  cautionFee: number,
  extrasTotal: number
): number => {
  return basePrice + extraGuestFees + userServiceFee + cautionFee + extrasTotal;
};

// Host payout
const calculateHostPayout = (
  basePrice: number,
  extraGuestFees: number,
  hostServiceFee: number,
  extrasTotal: number
): number => {
  return basePrice + extraGuestFees - hostServiceFee + extrasTotal;
};

// Validate extra guest limit
const validateExtraGuestLimit = (maxGuests: number, extraGuestLimit: number): boolean => {
  const maxAllowed = Math.ceil(maxGuests * EXTRA_GUEST_RULES.MAX_EXTRA_PERCENTAGE);
  return extraGuestLimit <= maxAllowed;
};
```

### Transaction Types

| Type | Description | Direction |
|------|-------------|-----------|
| `GUEST_PAYMENT` | Initial payment from guest | Guest → Escrow |
| `USER_SERVICE_FEE` | Platform fee from guest | Escrow → Platform |
| `HOST_SERVICE_FEE` | Platform fee from host payout | Escrow → Platform |
| `HOST_PAYOUT` | Release to host | Escrow → Host |
| `CAUTION_RELEASE` | Return deposit to guest | Escrow → Guest |
| `CAUTION_CLAIM` | Deposit to host (damages) | Escrow → Host |
| `REFUND` | Cancellation refund | Escrow → Guest |

---

## Summary Table

| Who | Pays/Receives | Rate/Amount |
|-----|---------------|-------------|
| **Guest** | Base Price | 100% |
| **Guest** | Extra Guest Fees | 100% (extraGuestFee × count) |
| **Guest** | Optional Extras | 100% (add-ons) |
| **Guest** | User Service Fee | +10% of (base + extra guests) |
| **Guest** | Caution | +Fixed (refundable) |
| **Host** | Base Price | 100% |
| **Host** | Extra Guest Fees | 100% |
| **Host** | Host Service Fee | -3% to -5% of (base + extra guests) |
| **Host** | Optional Extras | +100% |
| **Platform** | User Service Fee | 10% of (base + extra guests) |
| **Platform** | Host Service Fee | 3-5% of (base + extra guests) |

---

## Changelog

| Version | Date | Changes |
|---------|------|---------|
| 1.1 | Dec 5, 2025 | New guest capacity model (maxGuests + optional extras), service fees now include extra guest fees |
| 1.0 | Dec 5, 2025 | Initial payment structure documentation |

---

*For version history, see [CHANGELOG.md](/CHANGELOG.md)*
