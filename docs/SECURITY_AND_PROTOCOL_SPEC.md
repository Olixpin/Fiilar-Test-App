# Fiilar Security & Operational Protocol (Nigerian Market Specifics)

This document outlines the rigid technical guardrails and protocols designed for the Fiilar platform, specifically tailored to address trust, infrastructure, and security challenges in the Nigerian market.

## 1. Core Identity & Payment Security

### Liveness Check
*   **Requirement**: Users must perform a live selfie scan during verification.
*   **Purpose**: To prove the user is the physical person matching the provided ID photo.
*   **Goal**: Prevent usage of stolen IDs.

### Payment into Escrow
*   **Flow**: Guest pays -> Funds held in Fiilar's Secure Escrow Account -> Host sees funds are secured but cannot access them.
*   **Trigger**: Payment is collected upon booking confirmation.

## 2. The Secure "Handshake" Protocol (Check-in)

Upon confirmed booking, the system generates two unique, 6-digit alphanumeric codes.

*   **Guest Code**: Sent only to the guest's app.
*   **Host Code**: Sent only to the host's app.
*   **Backend**: Codes are paired in the database for the specific booking.

### The Protocol Steps
1.  **Arrival**: Guest arrives at the location.
2.  **Code Exchange**: Guest shows Guest Code to the Host.
3.  **Verification**: Host enters Guest Code into the "Verify Guest" screen in the Host App.
4.  **System Match**: Backend validates the code against the booking.

### Outcomes
*   **Success**:
    *   Host App: Shows large green checkmark + Guest's verified photo/name.
    *   System: Booking status updates to `STARTED`.
    *   Action: Host grants access.
*   **Failure**:
    *   Host App: Shows red "Invalid Code".
    *   Action: Host denies access.

### Benefits
*   **Simplicity**: Host only needs to enter a code.
*   **Audit Trail**: Creates undeniable digital proof of presence at the correct time.
*   **Self-Check-in**: Guest Code can double as a smart lock code for the booking slot.

## 3. Phase 4: The "Anti-Scam" Payout

### Completion Flow
1.  **Booking Ends**: Status changes to `ENDED`.
2.  **Cooling-Off Period**: Funds remain in escrow for a mandatory period (e.g., 48 hours).

### Dispute Resolution
If a guest claims "Was not allowed entry":
*   **Check Logs**: Did the host successfully verify the Guest Code?
    *   **Yes**: Host has proof of entry. Dispute favors Host.
    *   **No**: No proof of entry. Dispute favors Guest.

### Secure Release
*   **Condition**: Cooling-off period passes AND no active disputes.
*   **Action**: Payout Service moves funds from Escrow to Host's bank account.

---

## 4. Edge Case Handling (The "Rigid" Guardrails)

### A. The "No Network / No Power" Scenario
*   **Risk**: Host/Guest cannot connect to server to verify code due to network failure or power outage.
*   **Solution 1: SMS Fallback Protocol**:
    *   At `Booking Time - 2 Hours`, system sends encrypted SMS to Host's verified number containing the Guest's expected code and name.
    *   Allows visual verification without internet.
*   **Solution 2: Offline-First App Architecture**:
    *   Host app caches daily bookings locally.
    *   App accepts code input offline, validates against cached hash.
    *   Stores timestamped "verified pending sync" status.
    *   Syncs with server when connectivity returns.

### B. The "Overstay" Domino Effect
*   **Risk**: Hourly guest overstays, blocking the next guest.
*   **Solution 1: Mandatory Buffer Periods**:
    *   Availability Engine enforces a hard buffer (e.g., 1 hour) between hourly and nightly bookings.
*   **Solution 2: Late Checkout Penalty Engine**:
    *   **Warning**: 15 mins before end, Guest gets notification of penalty charges.
    *   **Execution**: If Host does not input "Check-out Code" by `End Time + 15 mins`, system charges Guest's card (e.g., 2x hourly rate).

### C. The "Capacity Violator" (Anyhowness Party)
*   **Risk**: Guest brings unauthorized extra people.
*   **Solution 1: Gate Security Integration**:
    *   Booking confirmation generates access code valid ONLY for the specific number of guests booked.
*   **Solution 2: IoT Noise Monitors**:
    *   Integrate with devices (Minut/NoiseAware).
    *   **Trigger**: Decibels > Threshold for 10 mins -> Warning Text.
    *   **Escalation**: Continued noise -> Booking Terminated -> Security Alerted -> Deposit Seized.

### D. The "Payment Chargeback" Fraud
*   **Risk**: Guest claims unauthorized transaction after using the space.
*   **Solution 1: Mandatory 3D Secure**:
    *   Force 3D Secure (OTP) for all payments via Paystack/Flutterwave.
*   **Solution 2: Handshake Evidence**:
    *   Use "Handshake" logs (Verified ID + Physical Code Entry) as evidence to win chargeback disputes.

### E. The "Squatter" Risk
*   **Risk**: Guest refuses to leave after booking ends.
*   **Solution 1: Legal Framework**:
    *   Terms of Service must define booking as "Temporary License to Occupy", NOT a tenancy.
*   **Solution 2: Police Partnership**:
    *   Pre-arranged rapid response protocols with local security/police for trespassing.

### F. The "Host Bypass" (Revenue Leakage)
*   **Risk**: Users arrange offline payment to avoid platform fees.
*   **Solution**: Chat Monitoring AI.
    *   Scan in-app chats for keywords ("cash", "transfer", phone patterns).
    *   Flag for review and warn users.
