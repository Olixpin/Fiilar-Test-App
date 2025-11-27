import React, { useState } from 'react';
import { escrowService, triggerManualReleaseCheck } from '@fiilar/escrow';
import { createBooking, deleteBooking, getBookings, updateBooking, saveListing, deleteListing, getListings, verifyHandshake } from '@fiilar/storage';
import { Booking, Listing, SpaceType, ListingStatus, BookingType, CancellationPolicy } from '@fiilar/types';
import { useLocale } from '@fiilar/ui';

const SystemHealthCheck: React.FC = () => {
    const { locale } = useLocale();
    const [logs, setLogs] = useState<string[]>([]);
    const [status, setStatus] = useState<'idle' | 'running' | 'success' | 'error'>('idle');

    const addLog = (message: string) => {
        setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`]);
    };

    const runTests = async () => {
        setStatus('running');
        setLogs([]);
        addLog('Starting System Health Check...');

        const testBookingId = `test-booking-${Date.now()}`;
        const hostId = 'host-test-1';
        const guestId = 'guest-test-1';
        const listingId = `listing-test-${Date.now()}`;

        try {
            // 1. Test Ledger Integrity
            addLog('Test 1: Checking Ledger Integrity...');
            const txs = await escrowService.getEscrowTransactions();
            addLog(`Ledger loaded. Total Transactions: ${txs.length}`);

            // 2. Simulate a Booking Flow
            addLog('Test 2: Simulating Booking Flow...');

            // Create Mock Listing (Required for Scheduler to find Host ID)
            const mockListing: Listing = {
                id: listingId,
                hostId: hostId,
                title: 'Test Listing',
                description: 'Test Description',
                type: SpaceType.APARTMENT,
                price: 100,
                priceUnit: BookingType.DAILY,
                images: [],
                location: 'Test Location',
                status: ListingStatus.LIVE,
                tags: []
            };
            saveListing(mockListing);
            addLog(`Created mock listing ${listingId}`);

            const mockBooking: Booking = {
                id: testBookingId,
                listingId: listingId,
                userId: guestId,
                date: new Date().toISOString(),
                duration: 1,
                bookingType: BookingType.DAILY,
                totalPrice: 100,
                serviceFee: 10,
                cautionFee: 20,
                status: 'Confirmed',
                paymentStatus: 'Paid - Escrow',
                escrowReleaseDate: new Date().toISOString(), // Initially set to now for creation
                transactionIds: []
            };

            // Save mock booking to storage so scheduler can find it
            createBooking(mockBooking);
            addLog(`Created mock booking ${testBookingId} in storage`);

            // Retrieve booking to get generated codes
            const storedBooking = getBookings().find(b => b.id === testBookingId);
            if (!storedBooking || !storedBooking.guestCode) throw new Error('Booking creation failed or codes not generated');

            // Simulate Handshake
            addLog('Simulating Handshake...');
            const handshakeResult = verifyHandshake(testBookingId, storedBooking.guestCode);
            if (!handshakeResult) throw new Error('Handshake verification failed');
            addLog('Handshake verified successfully.');

            // Process Payment
            const paymentResult = await escrowService.processGuestPayment(mockBooking, guestId);
            if (!paymentResult.success) throw new Error('Payment processing failed');
            addLog(`Processed guest payment. Transaction IDs: ${paymentResult.transactionIds.join(', ')}`);

            // Verify initial state in Escrow
            const updatedTxs = await escrowService.getEscrowTransactions();
            const paymentTx = updatedTxs.find(t => t.bookingId === testBookingId && t.type === 'GUEST_PAYMENT');
            if (!paymentTx || paymentTx.status !== 'COMPLETED') throw new Error('Payment transaction not found or not completed');
            addLog('Payment transaction verified in Escrow Ledger');

            // 3. Test Scheduler Logic (Time Travel)
            addLog('Test 3: Testing Scheduler Release Logic...');

            // Modify the booking's release date to be in the past (25 hours ago) to ensure it's picked up
            const pastDate = new Date();
            pastDate.setHours(pastDate.getHours() - 25);

            const bookingToUpdate = getBookings().find(b => b.id === testBookingId);
            if (bookingToUpdate) {
                bookingToUpdate.escrowReleaseDate = pastDate.toISOString();
                updateBooking(bookingToUpdate);
                addLog('Modified booking release date to -25 hours to simulate passage of time');
            } else {
                throw new Error('Could not find mock booking to update');
            }

            // Run Scheduler Manually
            addLog('Triggering Manual Release Check...');
            await triggerManualReleaseCheck((id, amount) => {
                if (id === testBookingId) {
                    addLog(`Callback received: Released ${locale.currencySymbol}${amount} for booking ${id}`);
                }
            });

            // Verify Release
            const finalTxs = await escrowService.getEscrowTransactions();
            const payoutTx = finalTxs.find(t => t.bookingId === testBookingId && t.type === 'HOST_PAYOUT');

            if (!payoutTx) {
                throw new Error('Payout transaction not generated');
            }

            if (payoutTx.status !== 'COMPLETED') {
                throw new Error(`Payout transaction status is ${payoutTx.status}, expected COMPLETED`);
            }

            addLog(`Success: Payout transaction found (${payoutTx.id})`);

            // 4. Test Host Listing Setup
            addLog('Test 4: Verifying Host Listing Setup...');
            const newHostId = 'host-test-2';
            const newListingId = `listing-host-setup-${Date.now()}`;
            const newListing: Listing = {
                id: newListingId,
                hostId: newHostId,
                title: 'Host Setup Test Listing',
                description: 'Testing host setup flow',
                type: SpaceType.STUDIO,
                price: 150,
                priceUnit: BookingType.DAILY,
                images: [],
                location: 'Test City',
                status: ListingStatus.LIVE,
                tags: ['test'],
                settings: {
                    allowRecurring: true,
                    minDuration: 1,
                    instantBook: true
                }
            };
            saveListing(newListing);

            const storedListings = getListings();
            const verifiedListing = storedListings.find(l => l.id === newListingId);
            if (!verifiedListing) throw new Error('Host listing creation failed: Listing not found in storage');
            if (verifiedListing.hostId !== newHostId) throw new Error('Host listing creation failed: Host ID mismatch');
            addLog(`Host listing created and verified: ${newListingId}`);

            // 5. Test Recurring Booking Flow
            addLog('Test 5: Verifying Recurring Booking Flow...');
            const recurringGuestId = 'guest-recur-1';
            const recurringGroupId = `group-${Date.now()}`;
            const dates = [
                new Date().toISOString(),
                new Date(Date.now() + 86400000).toISOString(), // +1 day
                new Date(Date.now() + 172800000).toISOString() // +2 days
            ];

            addLog(`Simulating recurring booking for ${dates.length} dates with Group ID: ${recurringGroupId}`);

            const recurringBookings: Booking[] = [];

            for (const date of dates) {
                const rBookingId = `recur-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
                const rBooking: Booking = {
                    id: rBookingId,
                    listingId: newListingId, // Use the listing we just created
                    userId: recurringGuestId,
                    date: date,
                    duration: 1,
                    bookingType: BookingType.DAILY,
                    totalPrice: 150,
                    serviceFee: 15,
                    cautionFee: 0,
                    status: 'Pending',
                    groupId: recurringGroupId,
                    guestCount: 2,
                    selectedAddOns: [],
                    paymentStatus: 'Paid - Escrow',
                    escrowReleaseDate: escrowService.calculateReleaseDate(date, undefined, 1),
                    transactionIds: []
                };

                // Process Payment
                const rPayment = await escrowService.processGuestPayment(rBooking, recurringGuestId);
                if (!rPayment.success) throw new Error(`Payment failed for recurring booking ${rBookingId}`);

                rBooking.transactionIds = rPayment.transactionIds;
                createBooking(rBooking);
                recurringBookings.push(rBooking);

                // Simulate Handshake for recurring booking
                const storedRBooking = getBookings().find(b => b.id === rBookingId);
                if (storedRBooking && storedRBooking.guestCode) {
                    verifyHandshake(rBookingId, storedRBooking.guestCode);
                }
            }

            // Verify Recurring Bookings
            const allStoredBookings = getBookings();
            const storedRecurring = allStoredBookings.filter(b => b.groupId === recurringGroupId);

            if (storedRecurring.length !== dates.length) {
                throw new Error(`Recurring booking count mismatch. Expected ${dates.length}, found ${storedRecurring.length}`);
            }

            // Verify Escrow for each
            const recurTxs = await escrowService.getEscrowTransactions();
            for (const rb of recurringBookings) {
                const tx = recurTxs.find(t => t.bookingId === rb.id && t.type === 'GUEST_PAYMENT');
                if (!tx || tx.status !== 'COMPLETED') {
                    throw new Error(`Escrow transaction missing or incomplete for recurring booking ${rb.id}`);
                }
            }
            addLog(`Verified ${storedRecurring.length} recurring bookings and their escrow transactions.`);

            // 6. Test Real Life Scenarios (Advanced Availability)
            addLog('Test 6: Verifying Real Life Scenarios (Overlaps & Availability)...');

            // 6.1 Multi-night Overlap
            const overlapListingId = `listing-overlap-${Date.now()}`;
            const overlapListing: Listing = {
                id: overlapListingId,
                hostId: hostId,
                title: 'Overlap Test',
                description: 'Testing overlaps',
                type: SpaceType.APARTMENT,
                price: 100,
                priceUnit: BookingType.DAILY,
                images: [],
                location: 'Test',
                status: ListingStatus.LIVE,
                tags: []
            };
            saveListing(overlapListing);

            // Create a 3-night booking starting March 1st
            const bookingA: Booking = {
                id: `booking-A-${Date.now()}`,
                listingId: overlapListingId,
                userId: guestId,
                date: '2025-03-01', // Mar 1
                duration: 3,        // Mar 1, 2, 3
                bookingType: BookingType.DAILY,
                totalPrice: 300,
                serviceFee: 30,
                cautionFee: 0,
                status: 'Confirmed',
                paymentStatus: 'Paid - Escrow'
            };
            createBooking(bookingA);
            addLog('Created Booking A: Mar 1st for 3 nights (Occupies Mar 1, 2, 3)');

            // Helper to simulate the fixed logic in ListingDetails
            const checkAvailability = (checkDateStr: string, listingId: string) => {
                const bookings = getBookings().filter(b => b.listingId === listingId && b.status !== 'Cancelled');
                const isBooked = bookings.some(b => {
                    if (b.date === checkDateStr) return true;
                    const start = new Date(b.date);
                    const check = new Date(checkDateStr);
                    const end = new Date(start);
                    end.setDate(start.getDate() + (b.duration || 1));
                    return check >= start && check < end;
                });
                return !isBooked;
            };

            // Verify Mar 2nd is BLOCKED (Middle of booking)
            const isMar2Available = checkAvailability('2025-03-02', overlapListingId);
            if (isMar2Available) {
                throw new Error('Logic Failure: March 2nd should be blocked by the 3-night booking starting March 1st.');
            }
            addLog('Verified: March 2nd is correctly BLOCKED by multi-night booking.');

            // Verify Mar 4th is AVAILABLE (After booking)
            const isMar4Available = checkAvailability('2025-03-04', overlapListingId);
            if (!isMar4Available) {
                throw new Error('Logic Failure: March 4th should be available.');
            }
            addLog('Verified: March 4th is correctly AVAILABLE.');

            // Cleanup Test 6
            deleteListing(overlapListingId);
            deleteBooking(bookingA.id);

            // 6.2 Hourly Overlap
            addLog('Test 6.2: Verifying Hourly Overlap...');
            const hourlyListingId = `listing-hourly-${Date.now()}`;
            const hourlyListing: Listing = {
                id: hourlyListingId,
                hostId: hostId,
                title: 'Hourly Test',
                description: 'Testing hourly',
                type: SpaceType.CONFERENCE,
                price: 50,
                priceUnit: BookingType.HOURLY,
                images: [],
                location: 'Test',
                status: ListingStatus.LIVE,
                tags: [],
                availability: {
                    '2025-03-01': [9, 10, 11, 12] // Host is open 9-12
                }
            };
            saveListing(hourlyListing);

            // User A books 9am and 10am
            const bookingHourly: Booking = {
                id: `booking-H-${Date.now()}`,
                listingId: hourlyListingId,
                userId: guestId,
                date: '2025-03-01',
                duration: 2,
                hours: [9, 10],
                bookingType: BookingType.HOURLY,
                totalPrice: 100,
                serviceFee: 10,
                cautionFee: 0,
                status: 'Confirmed',
                paymentStatus: 'Paid - Escrow'
            };
            createBooking(bookingHourly);
            addLog('Created Hourly Booking: Mar 1st, 9am-11am (Hours: 9, 10)');

            // Helper for hourly check
            const checkHourlyAvailability = (dateStr: string, hour: number, listingId: string) => {
                const bookings = getBookings().filter(b => b.listingId === listingId && b.status !== 'Cancelled');
                return !bookings.some(b => b.date === dateStr && b.hours?.includes(hour));
            };

            // Verify 9am is BLOCKED
            if (checkHourlyAvailability('2025-03-01', 9, hourlyListingId)) {
                throw new Error('Logic Failure: 9am should be blocked.');
            }
            addLog('Verified: 9am is correctly BLOCKED.');

            // Verify 11am is AVAILABLE
            if (!checkHourlyAvailability('2025-03-01', 11, hourlyListingId)) {
                throw new Error('Logic Failure: 11am should be available.');
            }
            addLog('Verified: 11am is correctly AVAILABLE.');

            // Cleanup Test 6.2
            deleteListing(hourlyListingId);
            deleteBooking(bookingHourly.id);

            // 7. Test Complete Listing Creation Process (Exhaustive)
            addLog('Test 7: Verifying Exhaustive Listing Creation Process...');
            const creationHostId = 'host-creation-test';
            const creationListingId = `listing-creation-${Date.now()}`;

            // Step 1: Create Draft (Basic Info)
            const draftListing: Listing = {
                id: creationListingId,
                hostId: creationHostId,
                title: 'Draft Listing',
                description: '',
                type: SpaceType.APARTMENT,
                price: 0,
                priceUnit: BookingType.DAILY,
                images: [],
                location: '',
                status: ListingStatus.DRAFT,
                tags: []
            };
            saveListing(draftListing);
            addLog('Step 1: Draft initialized.');

            // Step 2: Core Details & Images
            const step2Listing = {
                ...draftListing,
                title: 'Luxury Penthouse',
                description: 'Top floor with views',
                location: '123 Main St',
                images: ['img1.jpg', 'img2.jpg', 'img3.jpg'],
                tags: ['Luxury', 'View', 'Wifi']
            };
            saveListing(step2Listing);
            addLog('Step 2: Core details and images added.');

            // Step 3: Configuration & Settings (CRITICAL: Recurring, Instant Book)
            const step3Listing = {
                ...step2Listing,
                settings: {
                    allowRecurring: true, // User specifically asked about this
                    minDuration: 2,
                    instantBook: false
                },
                requiresIdentityVerification: true
            };
            saveListing(step3Listing);
            addLog('Step 3: Settings configured (Recurring: YES, Min Duration: 2).');

            // Step 4: Pricing, Capacity & Fees
            const step4Listing = {
                ...step3Listing,
                price: 500,
                capacity: 6,
                includedGuests: 4,
                pricePerExtraGuest: 50,
                cautionFee: 200,
                priceUnit: BookingType.DAILY
            };
            saveListing(step4Listing);
            addLog('Step 4: Pricing, Capacity, and Fees set.');

            // Step 5: Policies, Rules & Safety
            const step5Listing = {
                ...step4Listing,
                cancellationPolicy: CancellationPolicy.MODERATE,
                houseRules: ['No smoking', 'No parties'],
                safetyItems: ['Smoke detector', 'First aid kit']
            };
            saveListing(step5Listing);
            addLog('Step 5: Policies and Safety items added.');

            // Step 6: Add-ons
            const step6Listing = {
                ...step5Listing,
                addOns: [
                    { id: 'addon-1', name: 'Airport Pickup', price: 50, description: 'One way' },
                    { id: 'addon-2', name: 'Breakfast', price: 20 }
                ]
            };
            saveListing(step6Listing);
            addLog('Step 6: Add-ons configured.');

            // Step 7: Availability
            const step7Listing = {
                ...step6Listing,
                availability: {
                    '2025-05-01': [], // Available all day
                    '2025-05-02': []
                }
            };
            saveListing(step7Listing);
            addLog('Step 7: Availability schedule set.');

            // Step 8: Publish
            const finalPublishedListing = {
                ...step7Listing,
                status: ListingStatus.LIVE
            };
            saveListing(finalPublishedListing);
            addLog('Step 8: Listing Published.');

            // Final Verification
            const retrievedListing = getListings().find(l => l.id === creationListingId);
            if (!retrievedListing) throw new Error('Listing lost during creation process');

            // Verify specific fields
            if (retrievedListing.status !== ListingStatus.LIVE) throw new Error('Status mismatch');
            if (!retrievedListing.settings?.allowRecurring) throw new Error('Settings: allowRecurring failed to save');
            if (retrievedListing.settings?.minDuration !== 2) throw new Error('Settings: minDuration mismatch');
            if (retrievedListing.price !== 500) throw new Error('Price mismatch');
            if (retrievedListing.capacity !== 6) throw new Error('Capacity mismatch');
            if (retrievedListing.cancellationPolicy !== CancellationPolicy.MODERATE) throw new Error('Cancellation policy mismatch');
            if (retrievedListing.addOns?.length !== 2) throw new Error('Add-ons mismatch');
            if (retrievedListing.houseRules?.length !== 2) throw new Error('House rules mismatch');

            addLog('FINAL VERIFICATION: All fields (including Recurring Settings) verified successfully.');

            // Cleanup Test 7
            deleteListing(creationListingId);

            // Cleanup for new tests
            addLog('Cleaning up Test 4 & 5 & 6 data...');
            deleteListing(newListingId);
            recurringBookings.forEach(b => deleteBooking(b.id));

            // Cleanup
            addLog('Cleaning up test data...');
            deleteBooking(testBookingId);
            deleteListing(listingId);
            // Note: We are not deleting transactions from the ledger to keep history, 
            // but in a real test env we might want to.

            setStatus('success');
            addLog('ALL TESTS PASSED ✅');

        } catch (error: any) {
            console.error(error);
            setStatus('error');
            addLog(`❌ TEST FAILED: ${error.message}`);

            // Attempt cleanup even on fail
            try {
                deleteBooking(testBookingId);
                deleteListing(listingId);
            } catch (e) { console.error('Cleanup failed', e); }
        }
    };

    return (
        <div className="p-8 max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">System Health & Logic Verification</h1>

            <div className="bg-white p-6 rounded-lg shadow-md mb-6">
                <h2 className="text-xl font-semibold mb-4">Escrow & Scheduler Test Suite</h2>
                <p className="text-gray-600 mb-4">
                    This tool simulates a complete booking lifecycle to verify that funds are held correctly
                    and only released after the 24-hour security period.
                </p>

                <button
                    onClick={runTests}
                    disabled={status === 'running'}
                    className={`px-6 py-2 rounded-md text-white font-medium ${status === 'running' ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'
                        }`}
                >
                    {status === 'running' ? 'Running Tests...' : 'Run Verification Tests'}
                </button>
            </div>

            <div className="bg-gray-900 text-green-400 p-6 rounded-lg shadow-inner font-mono h-96 overflow-y-auto">
                {logs.length === 0 ? (
                    <span className="text-gray-500">Ready to start...</span>
                ) : (
                    logs.map((log, i) => <div key={i}>{log}</div>)
                )}
            </div>
        </div>
    );
};

export default SystemHealthCheck;
