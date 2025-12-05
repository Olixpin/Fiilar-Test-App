# Changelog

All notable changes to the Fiilar platform will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### Planned

- Separate `userServiceFee` and `hostServiceFee` fields in booking data
- Automated caution release with 48-hour damage claim window
- SMS fallback for offline handshake verification
- Late checkout penalty engine

---

## [1.0.0] - 2025-12-05

### Added

#### Core Platform

- Monorepo architecture with pnpm workspaces
- React 18 + TypeScript + Vite frontend
- Tailwind CSS styling system
- localStorage mock backend (ready for real API integration)

#### Shared Libraries

- `@fiilar/types` - Shared TypeScript interfaces
- `@fiilar/storage` - Data persistence layer with security validation
- `@fiilar/escrow` - Payment & escrow management
- `@fiilar/notifications` - In-app notification system
- `@fiilar/booking` - Booking logic & availability checking
- `@fiilar/messaging` - Real-time chat between users
- `@fiilar/reviews` - Rating & review system
- `@fiilar/kyc` - Identity verification service
- `@fiilar/admin` - Admin panel components
- `@fiilar/calendar` - Listing calendar management
- `@fiilar/search` - Search and filtering
- `@fiilar/ui` - Shared UI components
- `@fiilar/utils` - Common utilities

#### User Roles & Authentication

- Guest (browse only, not logged in)
- User (book listings, manage bookings, wallet, messaging, reviews)
- Host (create listings, accept/reject bookings, verify guests, view earnings)
- Admin (approve listings, verify KYC, resolve disputes, manage escrow)
- Google OAuth mock authentication with demo users

#### Listings

- Create listing wizard with multi-step form
- Three pricing models: Hourly, Daily, Nightly
- Add-ons/extras support (no platform fees on extras)
- Caution/security deposit (host-defined, refundable)
- Four cancellation policies: Flexible, Moderate, Strict, Non-refundable
- Listing status workflow: Draft → Pending Review → Live/Rejected
- Photo upload and gallery
- Amenities and features selection
- House rules configuration
- Availability calendar management
- Search with filters (location, price, amenities, dates)

#### Booking System

- Complete booking flow: Discovery → Selection → Payment → Confirmation
- Hourly bookings with specific hour selection
- Daily/Nightly bookings with duration
- Guest count with extra guest pricing
- Add-on selection at booking
- Booking status lifecycle: Pending → Confirmed → Started → Completed/Cancelled
- Recurring/series bookings with group management
- Booking modification (when host allows)
- Slot availability checking with collision detection
- Duplicate booking prevention (idempotency)
- Price validation and integrity checks

#### Payment & Fee Structure

- Wallet system with balance management
- Card payment simulation (Paystack mock)
- Escrow fund holding until handshake verification
- **User Service Fee:** 10% of base listing price (charged to guest)
- **Host Service Fee:** 3-5% based on cancellation policy (deducted from host):
  - Non-refundable: 5%
  - Strict: 4%
  - Moderate: 3%
  - Flexible: 3%
- No fees on extras/add-ons (host receives 100%)
- No VAT (Nigeria market)
- Escrow release timing by pricing model:
  - Hourly: 24 hours after session ends
  - Daily: 24 hours after access ends
  - Nightly: 48 hours after checkout
- Transaction history tracking
- Platform financials dashboard

#### Caution/Security Deposit

- Host-defined security deposit per listing
- Caution held in escrow (not part of host payout)
- 48-hour damage claim window after checkout
- Auto-release to guest if no claim filed
- Hold until resolution if damage claim filed

#### Handshake Verification Protocol

- Unique 6-digit alphanumeric codes (Guest Code + Host Code)
- Host verifies guest code at check-in
- Booking status updates to "Started" on successful verification
- Digital audit trail for dispute resolution
- QR code support for verification


- Policy-based refund calculation:
  - Flexible: Full refund ≥24h, 50% 12-24h, 0% <12h
  - Moderate: Full refund ≥7 days, 50% 2-7 days, 0% <48h
  - Strict: 50% refund ≥14 days, 0% <14 days
  - Non-refundable: No refund
- Base price + extras refundable based on policy percentage
- **User service fee non-refundable** (platform keeps)
- **Caution always 100% refundable**
- Group/series cancellation support

#### Dispute Resolution

- Guest/Host can open disputes
- Dispute status tracking: None → Open → Resolved
- Admin dispute center with evidence review
- Resolution options: Refund Guest or Release to Host
- Funds held in escrow during dispute

#### Messaging

- Real-time chat between users
- Conversation management
- Booking context in messages
- "Message Guest" from booking card for negotiation
- Unread message indicators
- Safety content filtering

#### Notifications

- In-app notification system
- Multiple notification types: booking, payment, system
- Severity levels: info, warning, error
- Read/unread tracking
- Action required flags
- Deep linking to relevant pages

#### Host Dashboard

- Listings management (create, edit, delete)
- Bookings overview with accept/reject actions
- Guest verification (handshake)
- Earnings and payout tracking
- Upcoming payouts forecast
- Transaction history
- Calendar view of bookings
- Analytics and revenue charts

#### User/Guest Dashboard

- My bookings list with status
- Upcoming bookings with guest codes
- Booking history
- Wallet management (add funds, view balance)
- Transaction history
- Favorites/saved listings
- Profile settings
- Support section with FAQs

#### Admin Panel

- Listings approval workflow
- KYC verification management
- Dispute center with resolution tools
- Escrow management and manual release trigger
- Platform financials overview
- Transaction history (all users)
- System health checks
- User management
- Broadcast notifications to all users

#### Security Features

- Booking price validation (client vs server)
- Slot availability verification
- Duplicate booking prevention
- Integrity checks on booking data
- Secure code generation for handshake
- KYC/Identity verification for hosts
- Liveness check specification (for future)

#### Documentation

- Complete booking architecture (`docs/BOOKING_ARCHITECTURE.txt`)
- QA testing guide (`docs/QA_TESTING_GUIDE.md`)
- Security and protocol specification (`docs/SECURITY_AND_PROTOCOL_SPEC.md`)
- Recurring booking negotiation guide (`docs/RECURRING_BOOKING_NEGOTIATION.md`)
- Payment structure documentation (`docs/PAYMENT_STRUCTURE.md`)
- Daily booking test cases (`docs/DAILY_BOOKING_TEST_CASES.txt`)
- E2E booking test plan (`docs/E2E_BOOKING_TEST_PLAN.txt`)

---

## Version History

| Version | Date | Summary |
|---------|------|---------|
| 1.0.0 | 2025-12-05 | Initial release - Full booking platform with escrow, handshake verification, payment structure, and multi-role support |
