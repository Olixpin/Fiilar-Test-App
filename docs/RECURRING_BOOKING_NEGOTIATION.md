# Recurring Booking Negotiation Scenarios

## The Problem
A guest requests a recurring booking (e.g., "Every Tuesday for 4 weeks"). The host wants to accept the booking, but **one** of those dates is unavailable or inconvenient.

Currently, the host has two bad options:
1.  **Reject the entire series**: The host loses the revenue, and the guest has to start over completely.
2.  **Accept the series, then cancel one**: This triggers cancellation penalties, refunds, and bad UX.

## Proposed Solution: Chat-First Negotiation
Since we currently treat recurring bookings as "All or Nothing" (to keep data simple), the best workflow is to facilitate communication so the *Guest* can modify their request.

### Scenario 1: The "One Date is Busy" Negotiation

**Actors:**
*   **Host**: Sarah (Studio Owner)
*   **Guest**: Mike (Podcaster)

**Flow:**
1.  **Request**: Mike requests the studio for **4 consecutive Tuesdays** (Nov 1, Nov 8, Nov 15, Nov 22).
2.  **Conflict**: Sarah checks her calendar and sees she has a dentist appointment on **Nov 8** during that time.
3.  **Action**: Instead of clicking "Decline Series", Sarah clicks a new **"Message Guest"** button on the booking card.
4.  **Communication**:
    *   *System*: Opens a chat thread linked to this booking request.
    *   *Sarah*: "Hi Mike! I'd love to host you, but I'm actually closed on Nov 8th. Would you be okay with skipping that week or moving it to Wednesday?"
    *   *Mike*: "Hey Sarah, skipping Nov 8th is fine. I'll just do the other three."
5.  **Resolution**:
    *   Mike goes to his dashboard, clicks **"Cancel Request"** (no penalty since it's pending).
    *   Mike creates a **new request** for Nov 1, Nov 15, and Nov 22.
    *   Sarah clicks **"Accept Series"**.

### Scenario 2: The "Time Shift" Negotiation

**Flow:**
1.  **Request**: Guest requests 9:00 AM - 5:00 PM for 3 days.
2.  **Conflict**: Host can only do 10:00 AM start on the first day.
3.  **Action**: Host clicks **"Message Guest"**.
4.  **Communication**:
    *   *Host*: "I can't open until 10 AM on Monday. Can we adjust the start time for that day?"
    *   *Guest*: "Sure, I'll adjust."
5.  **Resolution**:
    *   Guest cancels original request.
    *   Guest submits new request with updated hours.
    *   Host accepts.

## UI/UX Requirements

To support this, we need to add:

1.  **"Message Guest" Button**:
    *   **Location**: On the Host Dashboard, inside the Booking Card (next to Accept/Decline).
    *   **Behavior**: Navigates to the Messaging tab.
    *   **Context**: Ideally, pre-fills the message input or shows a system header: *"Regarding booking request for [Listing Name] on [Dates]"*.

2.  **Chat Context**:
    *   The chat window should show a small summary of the booking being discussed so both parties don't have to switch tabs to remember the dates.

3.  **User Dashboard "Modify" (Optional Future)**:
    * "Modify Request" button for the guest.

## Technical Implementation Steps

1.  **Frontend (HostBookings.tsx)**:
    *   Add a `MessageCircle` icon button to the `Pending` state actions.
    *   On click: `navigate('/messaging?userId=${booking.userId}&bookingId=${booking.id}')`.

2.  **Frontend (Messaging)**:
    *   Handle URL parameters to open the correct conversation.
    *   If no conversation exists, create a new one.

3.  **Backend/Service**:
    *   Ensure `createConversation` handles the initial handshake if they haven't spoken before.
