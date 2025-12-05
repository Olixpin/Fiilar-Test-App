# Fiilar Payment & Fee Structure

> **Version:** 1.0  
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
- ✅ **No fees on Extras** - Add-ons are charged at listing price only
- ✅ **Transparent pricing** - All fees shown before booking confirmation
- ✅ **Secure escrow** - Funds held until successful handshake verification
- ✅ **Caution is fully refundable** - Returned after 48-hour damage claim window

---

## Fee Structure

### User Service Fee (Guest Pays)

| Fee Type | Rate | Calculated On |
|----------|------|---------------|
| **User Service Fee** | **10%** | Base Listing Price (excludes extras & caution) |

**Example:**  
Base Price = ₦150,000 → User Service Fee = ₦15,000

### Host Service Fee (Deducted from Host Payout)

The host service fee varies based on the listing's **cancellation policy**:

| Cancellation Policy | Host Fee | Rationale |
|---------------------|----------|-----------|
| **Non-refundable** | **5%** | Host takes most risk, higher platform fee |
| **Strict** | **4%** | Limited refund window |
| **Moderate** | **3%** | Balanced policy |
| **Flexible** | **3%** | Most guest-friendly |

**Example:**  
Base Price = ₦150,000, Policy = Flexible (3%) → Host Service Fee = ₦4,500

### Extras/Add-ons

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
Total Amount = Base Price + User Service Fee (10%) + Caution + Extras
```

| Component | Calculation |
|-----------|-------------|
| Base Price | Listing price × duration |
| User Service Fee | 10% of Base Price |
| Caution | Fixed amount set by host |
| Extras | Sum of selected add-ons (no markup) |

### What Host Receives (Payout)

```
Host Payout = Base Price - Host Service Fee (3-5%) + Extras
```

| Component | Calculation |
|-----------|-------------|
| Base Price | Full listing price × duration |
| Host Service Fee | 3-5% of Base Price (deducted) |
| Extras | Full extras amount (100%) |

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
| **User Service Fee** | **NOT refunded** - Platform keeps |
| **Caution** | **Always 100% refunded** |

### Refund Calculation Formula

```
Total Refund = (Base Price + Extras) × Policy% + Caution (100%)
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
| Caution (100%) | ₦50,000 |
| User Service Fee | ₦0 (kept by platform) |
| **Total Refund** | **₦220,000** |

**Platform keeps:** ₦15,000 (User Service Fee)

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

### Example 1: Standard Booking (Flexible Policy)

**Host Lists:**
- Base Price: ₦150,000 (for 2 nights)
- Caution: ₦50,000
- Cancellation Policy: Flexible (3% host fee)

**Guest Selects:**
- Extras: ₦20,000 (cleaning, late checkout)

**Calculation:**

| Component | Calculation | Amount |
|-----------|-------------|--------|
| Base Price | ₦150,000 | ₦150,000 |
| User Service Fee | 10% × ₦150,000 | ₦15,000 |
| Caution | Fixed | ₦50,000 |
| Extras | No fee | ₦20,000 |
| **Guest Pays** | | **₦235,000** |

| Component | Calculation | Amount |
|-----------|-------------|--------|
| Base Price | ₦150,000 | ₦150,000 |
| Host Service Fee | 3% × ₦150,000 | -₦4,500 |
| Extras | 100% | ₦20,000 |
| **Host Receives** | | **₦165,500** |

| Component | Amount |
|-----------|--------|
| User Service Fee | ₦15,000 |
| Host Service Fee | ₦4,500 |
| **Platform Revenue** | **₦19,500** |

**After 48 Hours (no damages):**
- Caution ₦50,000 → returned to guest wallet

---

### Example 2: Strict Policy with Cancellation

**Original Booking:**
- Base Price: ₦100,000
- User Service Fee: ₦10,000
- Caution: ₦30,000
- Extras: ₦10,000
- **Total Paid: ₦150,000**

**Guest Cancels 10 Days Before (Strict Policy = 50% refund):**

| Component | Refund | Amount |
|-----------|--------|--------|
| Base Price | 50% | ₦50,000 |
| Extras | 50% | ₦5,000 |
| Caution | 100% | ₦30,000 |
| User Service Fee | 0% | ₦0 |
| **Total Refund** | | **₦85,000** |

**Platform keeps:** ₦10,000 (User Service Fee) + ₦55,000 non-refunded = ₦65,000 retained

---

### Example 3: Non-Refundable with Damage Claim

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
  basePrice: number;           // Listing price × duration
  extrasTotal: number;         // Sum of add-ons
  
  // Fees
  userServiceFee: number;      // 10% of basePrice (charged to guest)
  hostServiceFee: number;      // 3-5% of basePrice (deducted from host)
  
  // Deposits
  cautionFee: number;          // Security deposit (refundable)
  
  // Totals
  totalPrice: number;          // Guest pays: basePrice + userServiceFee + cautionFee + extrasTotal
  
  // Caution tracking
  cautionStatus?: 'HELD' | 'RELEASED' | 'CLAIMED' | 'PARTIAL_CLAIM';
  cautionReleasedAt?: string;  // ISO timestamp
  cautionClaimAmount?: number; // If partial claim
}
```

### Fee Calculation Functions

```typescript
// User service fee (always 10%)
const calculateUserServiceFee = (basePrice: number): number => {
  return basePrice * 0.10;
};

// Host service fee (based on cancellation policy)
const calculateHostServiceFee = (
  basePrice: number, 
  cancellationPolicy: CancellationPolicy
): number => {
  const rates = {
    'Non-refundable': 0.05,
    'Strict': 0.04,
    'Moderate': 0.03,
    'Flexible': 0.03,
  };
  return basePrice * (rates[cancellationPolicy] || 0.03);
};

// Total guest payment
const calculateGuestTotal = (
  basePrice: number,
  userServiceFee: number,
  cautionFee: number,
  extrasTotal: number
): number => {
  return basePrice + userServiceFee + cautionFee + extrasTotal;
};

// Host payout
const calculateHostPayout = (
  basePrice: number,
  hostServiceFee: number,
  extrasTotal: number
): number => {
  return basePrice - hostServiceFee + extrasTotal;
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
| **Guest** | Base Price + Extras | 100% |
| **Guest** | User Service Fee | +10% of base |
| **Guest** | Caution | +Fixed (refundable) |
| **Host** | Base Price | 100% |
| **Host** | Host Service Fee | -3% to -5% of base |
| **Host** | Extras | +100% |
| **Platform** | User Service Fee | 10% of base |
| **Platform** | Host Service Fee | 3-5% of base |

---

*For version history, see [CHANGELOG.md](/CHANGELOG.md)*
