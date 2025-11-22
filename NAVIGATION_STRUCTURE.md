# Navigation Structure - User vs Host

## User Dashboard Navigation
**Route:** `/dashboard`
**Query Parameter:** `?tab=<tab_name>`

### Profile Dropdown Menu Items (Regular Users):
1. **Change photo** - Opens file picker
2. **Dashboard** → `/dashboard` (default: Explore tab)
3. **Bookings** → `/dashboard?tab=bookings`
4. **Wallet** → `/dashboard?tab=wallet`
5. **Settings** → `/dashboard?tab=settings`
6. **Log out** - Logs out user

### Available Tabs:
- `explore` - Browse and search listings
- `favorites` - Saved/favorited listings
- `bookings` - User's bookings
- `wallet` - Wallet balance, transactions, payment methods
- `reserve-list` - Saved draft bookings (not held)
- `messages` - Chat with hosts
- `settings` - Account settings, notifications
- `notifications` - Notification center

---

## Host Dashboard Navigation
**Route:** `/host/dashboard`
**Query Parameter:** `?view=<view_name>`

### Profile Dropdown Menu Items (Hosts):
1. **Change photo** - Opens file picker
2. **Dashboard** → `/host/dashboard` (default: Overview)
3. **Listings** → `/host/dashboard?view=listings`
4. **Earnings** → `/host/dashboard?view=earnings`
5. **Settings** → `/host/dashboard?view=settings`
6. **Log out** - Logs out user

### Available Views:
- `overview` - Dashboard overview with stats
- `listings` - Manage listings (create, edit, delete)
- `bookings` - Manage booking requests
- `earnings` - View earnings and analytics
- `payouts` - Manage payouts and bank details
- `messages` - Chat with guests
- `settings` - Account settings, notifications
- `notifications` - Notification center

---

## Key Differences

### User Dashboard
- Uses `tab` query parameter
- Focuses on booking and payment features
- Has Wallet and Reserve List features
- Bookings are from guest perspective

### Host Dashboard
- Uses `view` query parameter
- Focuses on listing management and earnings
- Has Listings and Earnings features
- Bookings are from host perspective (accept/reject)
- Has Payouts for bank account management

---

## Implementation Details

### Navbar.tsx
- Checks `user.role === Role.HOST` to determine which menu items to show
- Links use conditional routing based on role
- Host links use `/host/dashboard?view=<view>`
- User links use `/dashboard?tab=<tab>`

### UserDashboard.tsx
- Uses `useSearchParams()` to read `tab` parameter
- Updates URL when tab changes via `setSearchParams()`
- Tabs have scroll-into-view on mobile for better UX

### HostDashboard.tsx
- Uses `useSearchParams()` to read `view` parameter
- Updates view state when URL parameter changes
- Views are managed through internal state

### Settings.tsx (Shared Component)
**Used by both User and Host dashboards**

The Settings component is intentionally generic and works for both user types. It includes:
- **Account Tab**: Name, email, notification preferences, delete account
- **Support Tab**: WhatsApp, phone, email contact options + FAQ
- **About Tab**: Company info, mission, legal links, version
- **Feedback Tab**: Rating system, feedback categories, message submission

**Notification Preferences** (applies to both):
- Bookings notifications
- Messages notifications  
- Damage reports notifications
- Reviews notifications
- Platform updates
- Marketing emails

All preferences are stored in localStorage and persist across sessions.

**Note**: Settings are role-agnostic by design. Both users and hosts need the same core account management features.

---

## Mobile Considerations
- Both dashboards have horizontal scrolling tab navigation
- Active tab scrolls into center view on mobile
- Tab navigation is sticky on scroll
- Profile dropdown adapts to show role-specific items
