# Fiilar Booking Platform - QA Testing Guide

**Version:** 1.0  
**Last Updated:** November 2025  
**Target Audience:** QA Engineers  

---

## Table of Contents

1. [Overview](#1-overview)
2. [Test Environment Setup](#2-test-environment-setup)
3. [Test Users & Credentials](#3-test-users--credentials)
4. [Core User Flows](#4-core-user-flows)
5. [Booking Lifecycle Tests](#5-booking-lifecycle-tests)
6. [Payment & Escrow Tests](#6-payment--escrow-tests)
7. [Handshake Verification Tests](#7-handshake-verification-tests)
8. [Cancellation & Refund Tests](#8-cancellation--refund-tests)
9. [Dispute Resolution Tests](#9-dispute-resolution-tests)
10. [Host Dashboard Tests](#10-host-dashboard-tests)
11. [Guest Dashboard Tests](#11-guest-dashboard-tests)
12. [Admin Panel Tests](#12-admin-panel-tests)
13. [Edge Cases & Error Scenarios](#13-edge-cases--error-scenarios)
14. [Data Validation Rules](#14-data-validation-rules)
15. [Console Logging Reference](#15-console-logging-reference)
16. [Clearing Test Data](#16-clearing-test-data)

---

## 1. Overview

### System Architecture

Fiilar is a booking platform connecting **Hosts** (who list spaces) with **Guests** (who book them). The platform handles:

- **Listings**: Spaces available for hourly or daily booking
- **Bookings**: Reservations with escrow-based payment protection
- **Handshake Verification**: Proof of guest entry for dispute resolution
- **Escrow System**: 48-hour fund hold after booking completion

### Current State

The platform uses **localStorage** as a mock backend. All API calls are logged to the browser console with prefixes like:
- `📤 API CALL:` - Outgoing request
- `✅ API RESPONSE:` - Successful response
- `❌ API RESPONSE:` - Failed response

---

## 2. Test Environment Setup

### Prerequisites

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev
```

The app runs on `http://localhost:5173` by default.

### Browser DevTools

Keep the browser console open during testing to see API call logs. Filter by:
- `API CALL` - See all simulated API requests
- `ESCROW` - Payment-related operations
- `HANDSHAKE` - Verification operations

### localStorage Keys

| Key | Description |
|-----|-------------|
| `fiilar_user` | Current logged-in user |
| `fiilar_users_db` | All registered users |
| `fiilar_listings` | All listings |
| `fiilar_bookings` | All bookings |
| `fiilar_escrow_transactions` | Payment records |
| `fiilar_notifications` | User notifications |
| `fiilar_messages` | Chat messages |
| `fiilar_reviews` | Reviews |

---

## 3. Test Users & Credentials

### Available Demo Users

When clicking "Continue with Google", a mock account picker shows these users:

| User | Email | Default Role | Best For Testing |
|------|-------|--------------|------------------|
| Jessica Chen | jessica.chen@demo.com | HOST | Host dashboard, listing management |
| Alex Rivera | alex.rivera@demo.com | USER | Guest booking flow |
| Marcus Johnson | marcus.johnson@demo.com | USER | Guest experience |
| Sarah Williams | sarah.williams@demo.com | USER | Guest-to-Host conversion |
| Admin User | admin@fiilar.com | ADMIN | Admin panel, dispute resolution |

### Switching Users

1. Click avatar/profile icon → Logout
2. Click "Login" or "Sign Up"
3. Choose "Continue with Google"
4. Select desired demo account

### Creating a Host Account

1. Go to `/become-a-host`
2. Click "Continue with Google"
3. Any selected user will become a HOST

---

## 4. Core User Flows

### 4.1 Guest Booking Flow

```
┌─────────────────────────────────────────────────────────────┐
│                     GUEST BOOKING FLOW                       │
├─────────────────────────────────────────────────────────────┤
│  1. Browse Listings → /listings                              │
│  2. Select Listing → /listings/:id                           │
│  3. Pick Date/Hours                                          │
│  4. Set Guest Count                                          │
│  5. Select Add-ons (if any)                                  │
│  6. Click "Book Now"                                         │
│  7. Review Booking Summary                                   │
│  8. Choose Payment Method (Wallet/Card)                      │
│  9. Confirm Booking                                          │
│  10. Wait for Host Approval                                  │
└─────────────────────────────────────────────────────────────┘
```

**Test Cases:**

| TC ID | Test Case | Expected Result |
|-------|-----------|-----------------|
| G-001 | Book hourly listing with single hour | Booking created, status: Pending |
| G-002 | Book hourly listing with multiple hours | All hours consolidated into one booking |
| G-003 | Book daily listing for 3 nights | Duration set to 3, correct total |
| G-004 | Add extra guests beyond included | Extra guest fee applied |
| G-005 | Book listing requiring verification | Verification modal appears |
| G-006 | Book already-booked time slot | Error: "These hours are already booked" |
| G-007 | Save for Later (Reserve) | Booking status: Reserved |

### 4.2 Host Listing Flow

```
┌─────────────────────────────────────────────────────────────┐
│                     HOST LISTING FLOW                        │
├─────────────────────────────────────────────────────────────┤
│  1. Become a Host → /become-a-host                           │
│  2. Complete KYC (if required)                               │
│  3. Create Listing → Multi-step wizard                       │
│     a. Space Type                                            │
│     b. Location                                              │
│     c. Capacity                                              │
│     d. Pricing                                               │
│     e. Availability                                          │
│     f. Photos                                                │
│     g. Amenities                                             │
│     h. Rules                                                 │
│     i. Review & Submit                                       │
│  4. Listing → "Pending Approval"                             │
│  5. Admin Approves → "Live"                                  │
└─────────────────────────────────────────────────────────────┘
```

**Test Cases:**

| TC ID | Test Case | Expected Result |
|-------|-----------|-----------------|
| H-001 | Complete all wizard steps | Listing saved as Draft |
| H-002 | Submit listing without KYC | Status: Pending KYC |
| H-003 | Submit listing with KYC verified | Status: Pending Approval |
| H-004 | Set hourly pricing | Price unit set correctly |
| H-005 | Set daily/nightly pricing | Price unit set correctly |
| H-006 | Add all amenities | Amenities saved |
| H-007 | Set cancellation policy | Policy saved to listing |

---

## 5. Booking Lifecycle Tests

### Status State Machine

```
                            CREATED
                               │
                               ▼
                           PENDING
                               │
              ┌────────────────┼────────────────┐
              ▼                ▼                ▼
         CONFIRMED        CANCELLED         RESERVED
              │               (✓)               │
              ▼                                 │
          STARTED ◄─────────────────────────────┘
              │
       ┌──────┴──────┐
       ▼             ▼
  COMPLETED     CANCELLED
     (✓)           (✓)
```

### Valid Transitions

| From | To | Trigger |
|------|-----|---------|
| Pending | Confirmed | Host accepts |
| Pending | Cancelled | Host rejects, Guest cancels, System expires |
| Confirmed | Started | Handshake verified |
| Confirmed | Cancelled | Guest cancels (with policy) |
| Started | Completed | Booking end time + 48h escrow release |
| Started | Cancelled | Dispute resolution |
| Reserved | Pending | Guest completes booking |
| Reserved | Cancelled | Guest removes from Reserve List |

### Test Cases

| TC ID | Test Case | Steps | Expected Result |
|-------|-----------|-------|-----------------|
| BL-001 | Host Accepts Pending | 1. Create booking 2. Login as host 3. Accept | Status → Confirmed |
| BL-002 | Host Rejects Pending | 1. Create booking 2. Login as host 3. Reject | Status → Cancelled, Full refund |
| BL-003 | Verify Handshake | 1. Confirmed booking 2. Enter guest code | Status → Started |
| BL-004 | Complete Booking | 1. Started booking 2. Wait/trigger completion | Status → Completed |
| BL-005 | Booking Expiry | 1. Pending booking 2. Wait 1 hour | Status → Cancelled, Full refund |
| BL-006 | Invalid Status Transition | Attempt: Completed → Pending | Error message |

### Recurring Bookings

| TC ID | Test Case | Expected Result |
|-------|-----------|-----------------|
| RB-001 | Create weekly recurring (4 weeks) | 4 bookings with same groupId |
| RB-002 | Accept recurring series | All 4 bookings → Confirmed |
| RB-003 | Reject recurring series | All 4 bookings → Cancelled, Total refund |
| RB-004 | Cancel single from series | Only that booking cancelled |

---

## 6. Payment & Escrow Tests

### Payment Flow

```
Guest Pays → Escrow Holds → Host Confirmed → Started → 48h Wait → Host Paid
                              │
                              └→ Cancelled → Guest Refunded
```

### Fee Structure

| Component | Calculation |
|-----------|-------------|
| Base Price | Listing price × duration |
| Extra Guests | (guestCount - includedGuests) × extraGuestPrice |
| Add-ons | Sum of selected add-on prices |
| Caution Fee | Listing cautionFee (refundable) |
| Service Fee | 10% of subtotal |
| **Total** | Subtotal + Service Fee + Caution Fee |

### Test Cases

| TC ID | Test Case | Expected Result |
|-------|-----------|-----------------|
| PAY-001 | Pay with Wallet (sufficient) | Payment processed, wallet debited |
| PAY-002 | Pay with Wallet (insufficient) | Error: Insufficient balance |
| PAY-003 | Pay with Card | Simulated Paystack payment |
| PAY-004 | Verify service fee calculation | 10% of booking amount |
| PAY-005 | Check escrow hold | Transaction type: GUEST_PAYMENT |
| PAY-006 | Release after 48h | Transaction type: HOST_PAYOUT |

### Escrow Release Timing

| Booking Type | End Time Calculation | Release Time |
|--------------|---------------------|--------------|
| Hourly (14:00-17:00) | 17:00 (last hour + 1) | 17:00 + 48 hours |
| Daily (3 nights) | Check-in + 3 days + 11:00 | 11:00 AM + 48 hours |

### Transaction Types

| Type | Description |
|------|-------------|
| GUEST_PAYMENT | Initial payment to escrow |
| SERVICE_FEE | Platform's 10% cut |
| HOST_PAYOUT | Funds released to host |
| REFUND | Money returned to guest |

---

## 7. Handshake Verification Tests

### Flow

```
1. Booking Confirmed → Codes Generated
   └── guestCode: "A3X7K9" (shown to guest)
   └── hostCode: "B2Y8M1" (stored for audit)

2. Guest Arrives → Shows Code to Host

3. Host Enters Code in App
   └── Match: handshakeStatus = VERIFIED, status = Started
   └── No Match: handshakeStatus = FAILED
```

### Test Cases

| TC ID | Test Case | Steps | Expected Result |
|-------|-----------|-------|-----------------|
| HS-001 | View Guest Code | 1. Create confirmed booking 2. Go to /dashboard?tab=bookings | Guest code visible |
| HS-002 | Verify Correct Code | 1. Login as host 2. Go to Verify tab 3. Enter guest code | Success, Status → Started |
| HS-003 | Verify Incorrect Code | Enter wrong code | Error: Invalid code |
| HS-004 | Find Booking by Code | Host enters code, booking auto-found | Booking details displayed |
| HS-005 | Case Insensitivity | Enter code in lowercase | Should work (codes uppercase) |

### Code Generation

- Format: 6 alphanumeric characters (A-Z, 0-9)
- Generated using `crypto.getRandomValues()` for security
- Unique per booking

---

## 8. Cancellation & Refund Tests

### Cancellation Policies

| Policy | Full Refund If | Partial Refund | No Refund |
|--------|---------------|----------------|-----------|
| Flexible | >24h before | 12-24h: 50% | <12h |
| Moderate | >7 days before | 2-7 days: 50% | <48h |
| Strict | Never | >14 days: 50% | <14 days |
| Non-refundable | Never | Never | Always |

### Test Cases

| TC ID | Test Case | Policy | Time Before | Expected Refund |
|-------|-----------|--------|-------------|-----------------|
| CXL-001 | Cancel Flexible 48h early | Flexible | 48h | 100% |
| CXL-002 | Cancel Flexible 18h early | Flexible | 18h | 50% |
| CXL-003 | Cancel Flexible 6h early | Flexible | 6h | 0% |
| CXL-004 | Cancel Moderate 10 days early | Moderate | 10d | 100% |
| CXL-005 | Cancel Moderate 3 days early | Moderate | 3d | 50% |
| CXL-006 | Cancel Moderate 24h early | Moderate | 24h | 0% |
| CXL-007 | Cancel Strict 20 days early | Strict | 20d | 50% |
| CXL-008 | Cancel Strict 7 days early | Strict | 7d | 0% |
| CXL-009 | Cancel Non-refundable | Non-ref | Any | 0% |
| CXL-010 | Cancel past booking | Any | -1h | Error: Cannot cancel |
| CXL-011 | Cancel already cancelled | Any | N/A | Error: Already cancelled |

### Cancellation by Role

| Cancelled By | Status From | Result |
|-------------|-------------|--------|
| Guest | Pending | Full refund, notifications sent |
| Guest | Confirmed | Policy-based refund |
| Host | Pending | Full refund (Host rejection) |
| System | Pending (expired) | Full refund |
| Admin | Any | Dispute resolution refund |

---

## 9. Dispute Resolution Tests

### Dispute Triggers

- Guest claims no property access
- Host claims guest damage
- Listing misrepresentation
- Payment disagreements

### Evidence for Admin

1. **Handshake Status**: VERIFIED = proof of entry
2. **Transaction History**: All payments/refunds
3. **Message Thread**: Communication log
4. **Audit Log**: Security events
5. **Booking Timeline**: createdAt, confirmedAt, verifiedAt

### Resolution Options

| Decision | Effect |
|----------|--------|
| REFUND_GUEST | Full refund, Booking → Cancelled |
| RELEASE_TO_HOST | Funds to host, Booking → Completed |

### Test Cases

| TC ID | Test Case | Steps | Expected Result |
|-------|-----------|-------|-----------------|
| DSP-001 | Open Dispute | Admin → Dispute Center → Open | disputeStatus = OPEN |
| DSP-002 | Resolve: Refund Guest | Select REFUND_GUEST | Guest refunded, host not paid |
| DSP-003 | Resolve: Release to Host | Select RELEASE_TO_HOST | Host paid, no guest refund |
| DSP-004 | View Dispute Evidence | Open dispute details | Handshake, transactions visible |

---

## 10. Host Dashboard Tests

### Tabs to Test

| Tab | Location | Key Features |
|-----|----------|--------------|
| Bookings | /dashboard?view=bookings | Accept/Reject/Verify |
| Listings | /dashboard?view=listings | Edit/Delete/View |
| Verify | /dashboard?view=verify | Enter guest codes |
| Messages | /dashboard?view=messages | Chat with guests |
| Earnings | /dashboard?view=earnings | Revenue tracking |

### Test Cases

| TC ID | Test Case | Expected Result |
|-------|-----------|-----------------|
| HD-001 | View pending bookings | List of pending requests |
| HD-002 | Filter by status | Correct filtering |
| HD-003 | Accept booking | Confirmation, notification sent |
| HD-004 | Reject booking | Cancellation, refund processed |
| HD-005 | Allow modification | Guest notified, can modify |
| HD-006 | View listing calendar | Booked slots highlighted |
| HD-007 | Edit listing details | Changes saved |
| HD-008 | Toggle instant book | Setting updated |

---

## 11. Guest Dashboard Tests

### Tabs to Test

| Tab | Location | Key Features |
|-----|----------|--------------|
| My Bookings | /dashboard?tab=bookings | View/Cancel/Modify |
| Reserve List | /dashboard?tab=reserve | Saved bookings |
| Messages | /dashboard?tab=messages | Chat with hosts |
| Notifications | /dashboard?tab=notifications | All alerts |

### Test Cases

| TC ID | Test Case | Expected Result |
|-------|-----------|-----------------|
| GD-001 | View booking details | All info displayed |
| GD-002 | View guest code | Code visible for confirmed bookings |
| GD-003 | Cancel booking | Policy-based refund |
| GD-004 | Modify booking (if allowed) | Modify modal opens |
| GD-005 | Contact host | Chat opens |
| GD-006 | Leave review | Review submitted |
| GD-007 | Convert Reserve to Booking | Reserve → Pending booking |

---

## 12. Admin Panel Tests

### Access

Login as `admin@fiilar.com` → Access via `/admin`

### Sections

| Section | Features |
|---------|----------|
| Overview | Stats, recent activity |
| Listings | Approve/Reject listings |
| KYC | Verify/Reject host identity |
| Hosts | Manage host accounts |
| Escrow | View/Release transactions |
| Disputes | Resolve conflicts |
| Financials | Platform revenue |
| System Health | Run diagnostics |

### Test Cases

| TC ID | Test Case | Expected Result |
|-------|-----------|-----------------|
| AD-001 | Approve listing | Status → Live |
| AD-002 | Reject listing | Status → Rejected, host notified |
| AD-003 | Approve KYC | kycStatus → verified |
| AD-004 | Reject KYC | kycStatus → rejected |
| AD-005 | View all escrow transactions | Transaction list |
| AD-006 | Manual fund release | HOST_PAYOUT transaction created |
| AD-007 | Resolve dispute (guest favor) | Refund processed |
| AD-008 | Resolve dispute (host favor) | Payout processed |
| AD-009 | Send broadcast notification | All users notified |
| AD-010 | Run system health check | Diagnostics results |

---

## 13. Edge Cases & Error Scenarios

### Double Booking Prevention

| TC ID | Scenario | Expected Result |
|-------|----------|-----------------|
| ERR-001 | Same user books same slot twice | Error: "Already have a booking" |
| ERR-002 | Two users book same hour | Second user gets error |
| ERR-003 | Book while host cancels | Appropriate error handling |

### Security Validation

| TC ID | Scenario | Expected Result |
|-------|----------|-----------------|
| SEC-001 | Guest tries to accept own booking | Not allowed |
| SEC-002 | Guest impersonates host | Security error logged |
| SEC-003 | Price tampering attempt | Error: "Price validation failed" |
| SEC-004 | Invalid status transition | Error logged |
| SEC-005 | Rate limit OTP requests | Lockout after 5 attempts |

### Session & Auth

| TC ID | Scenario | Expected Result |
|-------|----------|-----------------|
| AUTH-001 | Session expires | Redirect to login |
| AUTH-002 | Multiple browser tabs | Session maintained |
| AUTH-003 | Login lockout (5 failed) | 15-minute lockout |

---

## 14. Data Validation Rules

### Booking Validation

| Field | Rule | Error Message |
|-------|------|---------------|
| Date | Not in past | "Cannot book past dates" |
| Hours | Not already booked | "These hours are already booked: X, Y" |
| Guest Count | ≤ Capacity | "Exceeds maximum capacity" |
| Total Price | Match calculation | "Price validation failed: Total mismatch" |

### Listing Validation

| Field | Rule |
|-------|------|
| Title | Required, max 100 chars |
| Description | Required, max 2000 chars |
| Price | ≥ 1 |
| Capacity | ≥ 1 |
| Location | Required |

### User Validation

| Field | Rule |
|-------|------|
| Email | Valid format, unique |
| Phone | Valid format (for OTP) |
| Name | Required |

---

## 15. Console Logging Reference

### API Call Patterns

Watch for these in browser console:

```javascript
// Booking Operations
📤 API CALL: POST /api/bookings
✅ API RESPONSE: Booking created { id: 'bk_xxx' }

// Escrow Operations
📤 API CALL: POST /api/escrow/payment
✅ API RESPONSE: Payment processed { transactionIds: [...] }

// Handshake Operations
📤 API CALL: POST /api/bookings/:id/handshake
✅ API RESPONSE: Handshake verified { verifiedAt: '...' }

// Notification Operations
📤 API CALL: POST /api/notifications
```

### Error Patterns

```javascript
// Validation Error
{ success: false, error: "Price validation failed" }

// Security Error
{ success: false, error: "Unauthorized", securityError: true }

// State Error
{ success: false, error: "Invalid status transition" }
```

---

## 16. Clearing Test Data

### Clear All Data

```javascript
// In browser console
localStorage.clear();
location.reload();
```

### Clear Specific Data

```javascript
// Clear bookings only
localStorage.removeItem('fiilar_bookings');
localStorage.removeItem('fiilar_escrow_transactions');

// Clear users
localStorage.removeItem('fiilar_users_db');

// Clear current session
localStorage.removeItem('fiilar_user');
```

### Reset to Demo State

The app auto-seeds demo data on first load. To reset:
1. Clear all localStorage
2. Refresh page
3. Demo listings and users will be recreated

---

## Appendix A: Quick Reference Cards

### Booking Status Quick Check

| Status | Guest Can | Host Can | Admin Can |
|--------|-----------|----------|-----------|
| Pending | Cancel, Modify | Accept, Reject, Allow Modify | Cancel, View |
| Confirmed | Cancel (policy), View Code | Verify Code | Dispute, Cancel |
| Started | - | Complete | Dispute, Force Complete |
| Completed | Review | View | View |
| Cancelled | - | - | View |
| Reserved | Convert, Remove | - | View |

### Notification Types

| Event | Guest Notified | Host Notified |
|-------|----------------|---------------|
| Booking Created | ✅ Request sent | ✅ New request |
| Booking Accepted | ✅ Confirmed | - |
| Booking Rejected | ✅ Refunded | - |
| Booking Expired | ✅ Refunded | - |
| Handshake Verified | ✅ Check-in confirmed | ✅ Check-in confirmed |
| Funds Released | - | ✅ Payment received |
| Dispute Opened | ✅ | ✅ |
| Dispute Resolved | ✅ | ✅ |

---

## Appendix B: Test Data Setup Examples

### Create Booking in Specific State

```javascript
// In browser console - create a confirmed booking
const booking = {
    id: 'test_bk_' + Date.now(),
    listingId: 'EXISTING_LISTING_ID',
    userId: 'GUEST_USER_ID',
    date: new Date().toISOString().split('T')[0],
    hours: [14, 15, 16],
    duration: 3,
    totalPrice: 150,
    serviceFee: 15,
    cautionFee: 0,
    status: 'Confirmed', // or 'Pending', 'Started', etc.
    guestCount: 2,
    guestCode: 'TEST01',
    hostCode: 'HOST01',
    handshakeStatus: 'PENDING',
    createdAt: new Date().toISOString()
};

const existing = JSON.parse(localStorage.getItem('fiilar_bookings') || '[]');
existing.push(booking);
localStorage.setItem('fiilar_bookings', JSON.stringify(existing));
location.reload();
```

### Trigger 48-Hour Escrow Release

```javascript
// Set escrowReleaseDate to past
const bookings = JSON.parse(localStorage.getItem('fiilar_bookings') || '[]');
const idx = bookings.findIndex(b => b.id === 'TARGET_BOOKING_ID');
bookings[idx].escrowReleaseDate = new Date(Date.now() - 1000).toISOString();
localStorage.setItem('fiilar_bookings', JSON.stringify(bookings));
```

---

## Contact

For questions about this testing guide, contact the development team.

---

*Document generated from BOOKING_ARCHITECTURE.txt and codebase analysis*
