import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { User, Listing, ListingStatus, SpaceType, BookingType, Booking, ListingAddOn, CancellationPolicy } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Plus, DollarSign, Briefcase, CheckCircle, AlertCircle, Loader2, Upload, X, Image as ImageIcon, Calendar as CalendarIcon, Clock, ChevronLeft, ChevronRight, Trash2, Shield, UserCheck, Users, FileText, AlertTriangle, Edit3, Copy, Settings, Repeat, Save, Ban, RefreshCw, MapPin, Home, Star, UserPlus, PackagePlus, Info, PenLine, ShieldCheck, Lock, Sparkles, Wand2, MessageSquare, TrendingUp } from 'lucide-react';
import { saveListing, getBookings, deleteListing, updateBooking, getCurrentUser, getConversations, addNotification } from '../services/storage';
import { parseListingDescription } from '../services/geminiService';
import { escrowService } from '../services/escrowService';
import HostEarnings from './HostEarnings';
import { ChatList } from './ChatList';
import { ChatWindow } from './ChatWindow';
import SettingsPage from './Settings';
import NotificationsPage from './NotificationsPage';
import DamageReportModal from './DamageReportModal';

interface HostDashboardProps {
    user: User;
    listings: Listing[];
    refreshData: () => void;
    onCreateListing?: (l: Listing) => void;
    onUpdateListing?: (l: Listing) => void;
}


type View = 'overview' | 'create' | 'edit' | 'calendar' | 'settings' | 'bookings' | 'earnings' | 'messages' | 'notifications';

const HostDashboard: React.FC<HostDashboardProps> = ({ user, listings, refreshData, onCreateListing, onUpdateListing }) => {
    // ALL HOOKS MUST BE DECLARED BEFORE ANY EARLY RETURNS
    // This ensures hooks are called in the same order on every render
    const [view, setView] = useState<View>('overview');
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();

    // Initialize view from URL parameter
    useEffect(() => {
        const viewParam = searchParams.get('view');
        if (viewParam && ['overview', 'listings', 'bookings', 'earnings', 'payouts', 'messages', 'settings', 'notifications'].includes(viewParam)) {
            setView(viewParam as View);
        }
    }, [searchParams]);
    const [selectedConversationId, setSelectedConversationId] = useState<string | undefined>(undefined);

    // Listings Form State
    const [newListing, setNewListing] = useState<Partial<Listing>>({
        type: SpaceType.APARTMENT,
        priceUnit: BookingType.DAILY,
        tags: [],
        images: [],
        availability: {},
        requiresIdentityVerification: false,
        proofOfAddress: '',
        settings: {
            allowRecurring: true,
            minDuration: 1,
            instantBook: false
        },
        capacity: 1,
        includedGuests: 1,
        pricePerExtraGuest: 0,
        cautionFee: 0,
        addOns: [],
        cancellationPolicy: CancellationPolicy.MODERATE,
        houseRules: [],
        safetyItems: []
    });

    // AI Auto-Fill State
    const [aiPrompt, setAiPrompt] = useState('');
    const [isAiGenerating, setIsAiGenerating] = useState(false);
    const [showAiInput, setShowAiInput] = useState(true);

    // Add-On Input State
    const [tempAddOn, setTempAddOn] = useState({ name: '', price: '', description: '' });
    const [tempRule, setTempRule] = useState('');
    const [customSafety, setCustomSafety] = useState('');

    // Availability Management State
    const [availTab, setAvailTab] = useState<'schedule' | 'calendar' | 'rules'>('schedule');
    const [weeklySchedule, setWeeklySchedule] = useState<Record<number, { enabled: boolean, start: number, end: number }>>({
        0: { enabled: false, start: 9, end: 17 }, // Sun
        1: { enabled: true, start: 9, end: 17 },  // Mon
        2: { enabled: true, start: 9, end: 17 },  // Tue
        3: { enabled: true, start: 9, end: 17 },  // Wed
        4: { enabled: true, start: 9, end: 17 },  // Thu
        5: { enabled: true, start: 9, end: 17 },  // Fri
        6: { enabled: false, start: 9, end: 17 }, // Sat
    });

    // Calendar State
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedCalendarDate, setSelectedCalendarDate] = useState<string | null>(null);
    const [activeBookings, setActiveBookings] = useState<Booking[]>([]);
    const [hostBookings, setHostBookings] = useState<Booking[]>([]);
    const [hostTransactions, setHostTransactions] = useState<any[]>([]);
    const [isEditingUpload, setIsEditingUpload] = useState(false);

    const [step, setStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [lastSaved, setLastSaved] = useState<Date | null>(null);
    const [draggedImageIndex, setDraggedImageIndex] = useState<number | null>(null);
    const [showSaveToast, setShowSaveToast] = useState(false);
    const [bookingFilter, setBookingFilter] = useState<'all' | 'pending' | 'confirmed' | 'completed'>('all');
    const [bookingView, setBookingView] = useState<'table' | 'cards'>('cards');

    // Payout State
    const [bankDetails, setBankDetails] = useState({
        bankName: user?.bankDetails?.bankName || '',
        accountNumber: user?.bankDetails?.accountNumber || '',
        accountName: user?.bankDetails?.accountName || '',
        isVerified: user?.bankDetails?.isVerified || false
    });
    const [isVerifyingBank, setIsVerifyingBank] = useState(false);

    // Redirect to login if no user/session. Do not redirect if localStorage already has a session (avoid race on reload).
    useEffect(() => {
        if (!user) {
            const stored = getCurrentUser();
            if (!stored) {
                navigate('/login');
            }
        }
    }, [user, navigate]);

    // Auto-save draft every 30 seconds
    useEffect(() => {
        if (view !== 'create' || !user) return;

        // Skip if listing is completely empty
        if (!newListing.title && !newListing.description && !newListing.location) return;

        const interval = setInterval(() => {
            const draftKey = `listing_draft_${user.id}_temp`;
            localStorage.setItem(draftKey, JSON.stringify({ ...newListing, step }));
            setLastSaved(new Date());
            setShowSaveToast(true);

            // Hide toast after 3 seconds
            setTimeout(() => setShowSaveToast(false), 3000);
        }, 30000);

        return () => clearInterval(interval);
    }, [newListing, view, step, user]);

    // Keyboard navigation
    useEffect(() => {
        if (view !== 'create') return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                setView('listings');
                setStep(1);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [view]);

    // Fetch bookings effect - MUST be before early return to maintain hook order
    useEffect(() => {
        const fetchBookings = () => {
            const all = getBookings();

            // For Calendar/Edit View
            const currentId = (newListing as any).id;
            if (currentId) {
                setActiveBookings(all.filter(b => b.listingId === currentId && b.status !== 'Cancelled'));
            } else {
                setActiveBookings([]);
            }

            // Guard against null user — some reload/hydration paths may briefly pass a null user
            const uid = user?.id;

            // For Bookings View
            if (view === 'bookings') {
                if (!uid) {
                    setHostBookings([]);
                } else {
                    const myListingIds = listings.filter(l => l.hostId === uid).map(l => l.id);
                    setHostBookings(all.filter(b => myListingIds.includes(b.listingId)).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
                }
            }

            // For Earnings/Payouts View
            if (view === 'earnings' || view === 'payouts') {
                if (!uid) {
                    setHostBookings([]);
                    setHostTransactions([]);
                } else {
                    const myListingIds = listings.filter(l => l.hostId === uid).map(l => l.id);
                    setHostBookings(all.filter(b => myListingIds.includes(b.listingId)));
                    escrowService.getEscrowTransactions().then(txs => setHostTransactions(txs));
                }
            }
        };
        fetchBookings();
    }, [(newListing as any).id, view, listings, user?.id]);

    // Early return if no user to prevent null reference errors
    if (!user) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <p className="text-gray-600">Loading dashboard...</p>
            </div>
        );
    }

    // Derived values and constants (after early return, so user is guaranteed to exist)
    const myListings = listings.filter(l => l.hostId === user.id);

    const SAFETY_OPTIONS = ['Smoke alarm', 'Carbon monoxide alarm', 'First aid kit', 'Fire extinguisher', 'Security cameras'];

    // Mock Data for Charts
    const bookingData = [
        { name: 'Mon', bookings: 4, revenue: 200 },
        { name: 'Tue', bookings: 3, revenue: 150 },
        { name: 'Wed', bookings: 7, revenue: 550 },
        { name: 'Thu', bookings: 5, revenue: 300 },
        { name: 'Fri', bookings: 9, revenue: 800 },
        { name: 'Sat', bookings: 12, revenue: 1200 },
        { name: 'Sun', bookings: 8, revenue: 700 },
    ];

    // --- Helpers ---

    const handleAcceptBooking = (booking: Booking) => {
        const updatedBooking = { ...booking, status: 'Confirmed' as const };
        updateBooking(updatedBooking);
        refreshData();
        alert(`Booking ${booking.id} confirmed!`);

        // Get listing title
        const listing = myListings.find(l => l.id === booking.listingId);

        // Notify guest about booking confirmation
        addNotification({
            userId: booking.userId,
            type: 'booking',
            title: 'Booking Confirmed!',
            message: `Your booking for "${listing?.title || 'the property'}" on ${booking.date} has been confirmed.`,
            severity: 'info',
            read: false,
            actionRequired: false,
            metadata: {
                bookingId: booking.id,
                link: '/dashboard?tab=bookings'
            }
        });
    };

    const handleRejectBooking = (booking: Booking) => {
        const updatedBooking = { ...booking, status: 'Cancelled' as const };
        updateBooking(updatedBooking);
        refreshData();
        alert(`Booking ${booking.id} rejected.`);

        // Get listing title
        const listing = myListings.find(l => l.id === booking.listingId);

        // Notify guest about booking rejection
        addNotification({
            userId: booking.userId,
            type: 'booking',
            title: 'Booking Not Accepted',
            message: `Unfortunately, your booking request for "${listing?.title || 'the property'}" on ${booking.date} was not accepted.`,
            severity: 'warning',
            read: false,
            actionRequired: false,
            metadata: {
                bookingId: booking.id,
                link: '/dashboard?tab=bookings'
            }
        });
    };

    const formatDate = (date: Date) => {
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const d = String(date.getDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
    };

    const getDaysInMonth = (date: Date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const days = [];
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);

        // Add empty placeholders for days before start of month
        for (let i = 0; i < firstDay.getDay(); i++) {
            days.push(null);
        }

        // Add days
        for (let i = 1; i <= lastDay.getDate(); i++) {
            days.push(new Date(year, month, i));
        }
        return days;
    };

    // --- Handlers ---

    const handleStartNewListing = () => {
        if (!user.emailVerified && !user.phoneVerified) {
            alert("Please verify your email address or phone number before creating a listing.");
            return;
        }

        // Check for saved draft
        const draftKey = `listing_draft_${user.id}_temp`;
        const savedDraft = localStorage.getItem(draftKey);

        if (savedDraft) {
            const shouldRestore = window.confirm("You have an unsaved draft. Would you like to continue where you left off?");
            if (shouldRestore) {
                const draft = JSON.parse(savedDraft);
                setNewListing(draft);
                setStep(draft.step || 1);
                setShowAiInput(false);
                setView('create');
                return;
            } else {
                localStorage.removeItem(draftKey);
            }
        }

        setNewListing({
            type: SpaceType.APARTMENT,
            priceUnit: BookingType.DAILY,
            tags: [],
            images: [],
            availability: {},
            requiresIdentityVerification: false,
            proofOfAddress: '',
            settings: { allowRecurring: true, minDuration: 1, instantBook: false },
            capacity: 1,
            includedGuests: 1,
            pricePerExtraGuest: 0,
            cautionFee: 0,
            addOns: [],
            cancellationPolicy: CancellationPolicy.MODERATE,
            houseRules: [],
            safetyItems: []
        });
        setAiPrompt('');
        setShowAiInput(true);
        setStep(1);
        setIsEditingUpload(false);
        setLastSaved(null);
        setShowSaveToast(false);
        setView('create');
    };

    const handleEditListing = (listing: Listing) => {
        if (!user.emailVerified && !user.phoneVerified) {
            alert("Please verify your email address or phone number to edit listings.");
            return;
        }
        setNewListing({
            ...listing,
            settings: listing.settings || { allowRecurring: true, minDuration: 1, instantBook: false },
            capacity: listing.capacity || 1,
            includedGuests: listing.includedGuests || 1,
            pricePerExtraGuest: listing.pricePerExtraGuest || 0,
            cautionFee: listing.cautionFee || 0,
            addOns: listing.addOns || [],
            cancellationPolicy: listing.cancellationPolicy || CancellationPolicy.MODERATE,
            houseRules: listing.houseRules || [],
            safetyItems: listing.safetyItems || []
        });

        setShowAiInput(false); // Hide AI input for editing existing
        setIsEditingUpload(false);
        setStep(1);
        setView('create');
    };

    const handleAiAutoFill = async () => {
        if (!aiPrompt.trim()) return;
        setIsAiGenerating(true);
        try {
            const extracted = await parseListingDescription(aiPrompt);

            setNewListing(prev => ({
                ...prev,
                title: extracted.title || prev.title,
                description: extracted.description || prev.description,
                type: (extracted.type as SpaceType) || prev.type,
                price: extracted.price || prev.price,
                priceUnit: (extracted.priceUnit as BookingType) || prev.priceUnit,
                location: extracted.location || prev.location,
                capacity: extracted.capacity || prev.capacity,
                tags: extracted.tags || prev.tags,
                houseRules: extracted.houseRules || prev.houseRules,
                safetyItems: extracted.safetyItems || prev.safetyItems
            }));
            setShowAiInput(false); // Collapse after success
        } catch (e) {
            console.error(e);
            alert("Could not auto-fill listing. Please fill manually.");
        } finally {
            setIsAiGenerating(false);
        }
    };

    const handleDeleteListing = (id: string, status: ListingStatus) => {
        // 1. Check for active bookings
        const allBookings = getBookings();
        const hasActiveBookings = allBookings.some(b =>
            b.listingId === id &&
            (b.status === 'Confirmed' || b.status === 'Pending') &&
            new Date(b.date) >= new Date(new Date().setHours(0, 0, 0, 0)) // Future or today
        );

        if (hasActiveBookings) {
            alert("Unable to delete: This listing has active upcoming bookings. Please cancel all bookings associated with this listing first.");
            return;
        }

        // 2. Context-aware confirmation message
        let confirmMsg = "Are you sure you want to permanently delete this listing?";

        if (status === ListingStatus.LIVE) {
            confirmMsg = "Warning: This listing is LIVE. Deleting it will immediately remove it from the marketplace. This action cannot be undone. Are you sure?";
        } else if (status === ListingStatus.PENDING_APPROVAL) {
            confirmMsg = "This listing is pending approval. Deleting it will cancel the review process. Continue?";
        } else if (status === ListingStatus.DRAFT) {
            confirmMsg = "Discard this draft listing?";
        }

        if (window.confirm(confirmMsg)) {
            deleteListing(id);
            refreshData();
        }
    };

    const handleAddAddOn = () => {
        if (!tempAddOn.name || !tempAddOn.price) return;
        const newAddOn: ListingAddOn = {
            id: Math.random().toString(36).substr(2, 9),
            name: tempAddOn.name,
            price: parseFloat(tempAddOn.price),
            description: tempAddOn.description
        };
        setNewListing(prev => ({
            ...prev,
            addOns: [...(prev.addOns || []), newAddOn]
        }));
        setTempAddOn({ name: '', price: '', description: '' });
    };

    const handleRemoveAddOn = (id: string) => {
        setNewListing(prev => ({
            ...prev,
            addOns: (prev.addOns || []).filter(a => a.id !== id)
        }));
    };

    const handleAddRule = () => {
        if (!tempRule.trim()) return;
        setNewListing(prev => ({
            ...prev,
            houseRules: [...(prev.houseRules || []), tempRule]
        }));
        setTempRule('');
    };

    const handleRemoveRule = (index: number) => {
        setNewListing(prev => ({
            ...prev,
            houseRules: (prev.houseRules || []).filter((_, i) => i !== index)
        }));
    };

    const toggleSafetyItem = (item: string) => {
        const current = newListing.safetyItems || [];
        if (current.includes(item)) {
            setNewListing(prev => ({ ...prev, safetyItems: current.filter(i => i !== item) }));
        } else {
            setNewListing(prev => ({ ...prev, safetyItems: [...current, item] }));
        }
    };

    const handleAddCustomSafety = () => {
        if (!customSafety.trim()) return;
        toggleSafetyItem(customSafety);
        setCustomSafety('');
    };

    // Logic to generate availability map
    const generateAvailabilityMap = (schedule: typeof weeklySchedule, months = 3) => {
        const map: Record<string, number[]> = {};
        const today = new Date();

        for (let i = 0; i < months * 30; i++) {
            const d = new Date(today);
            d.setDate(today.getDate() + i);
            const dayOfWeek = d.getDay();
            const dateStr = formatDate(d);

            const rule = schedule[dayOfWeek];

            if (rule.enabled) {
                const hours = [];
                for (let h = rule.start; h < rule.end; h++) {
                    hours.push(h);
                }
                map[dateStr] = hours;
            }
        }
        return map;
    };

    const handleCreateListing = () => {
        if (!newListing.title) {
            alert("Please enter a title for your listing before saving.");
            return;
        }

        setIsSubmitting(true);

        // Clear draft after successful save
        const draftKey = `listing_draft_${user.id}_temp`;
        localStorage.removeItem(draftKey);

        // Simulate network delay then save
        setTimeout(() => {
            try {
                const existingId = (newListing as any).id;
                // Use listings passed in props to ensure we check current truth
                const originalListing = listings.find(l => l.id === existingId);

                const isReadyForApproval = user.kycVerified && newListing.proofOfAddress && newListing.price;
                const listingId = existingId || Math.random().toString(36).substr(2, 9);

                // Determine status: If already LIVE, keep LIVE. Otherwise check requirements.
                let finalStatus = ListingStatus.DRAFT;
                let finalRejectionReason = newListing.rejectionReason;

                if (originalListing && originalListing.status === ListingStatus.LIVE) {
                    finalStatus = ListingStatus.LIVE; // Changes to live listings don't require re-approval
                    finalRejectionReason = undefined; // Clear any rejection reasons if it was live
                } else if (originalListing && originalListing.status === ListingStatus.REJECTED) {
                    // If previously rejected, send back to pending if resubmitting, or stay rejected/draft
                    finalStatus = isReadyForApproval ? ListingStatus.PENDING_APPROVAL : ListingStatus.DRAFT;
                } else if (isReadyForApproval) {
                    finalStatus = ListingStatus.PENDING_APPROVAL;
                }

                // Ensure availability is populated if empty (Auto-fill default schedule)
                let finalAvailability = newListing.availability;
                if (!finalAvailability || Object.keys(finalAvailability).length === 0) {
                    finalAvailability = generateAvailabilityMap(weeklySchedule);
                }

                // Robustly construct the listing object
                const listing: Listing = {
                    id: listingId,
                    hostId: user.id,
                    title: newListing.title || 'Untitled Draft',
                    description: newListing.description || '',
                    type: newListing.type || SpaceType.APARTMENT,
                    price: newListing.price || 0,
                    priceUnit: newListing.priceUnit || BookingType.DAILY,
                    location: newListing.location || 'No Location',
                    status: finalStatus,
                    images: newListing.images?.length ? newListing.images : [`https://picsum.photos/800/600?random=${Math.random()}`],
                    tags: newListing.tags || ['modern', 'spacious'],
                    availability: finalAvailability,
                    requiresIdentityVerification: !!newListing.requiresIdentityVerification,
                    proofOfAddress: newListing.proofOfAddress,
                    rejectionReason: finalRejectionReason,
                    settings: newListing.settings || {
                        allowRecurring: true,
                        minDuration: 1,
                        instantBook: false
                    },
                    capacity: newListing.capacity || 1,
                    includedGuests: newListing.includedGuests || 1,
                    pricePerExtraGuest: newListing.pricePerExtraGuest || 0,
                    cautionFee: newListing.cautionFee || 0,
                    addOns: newListing.addOns || [],
                    cancellationPolicy: newListing.cancellationPolicy || CancellationPolicy.MODERATE,
                    houseRules: newListing.houseRules || [],
                    safetyItems: newListing.safetyItems || []
                };

                saveListing(listing);
                const isNew = !existingId || !listings.find(l => l.id === existingId);
                if (isNew) {
                    if (typeof onCreateListing === 'function') onCreateListing(listing);
                } else {
                    if (typeof onUpdateListing === 'function') onUpdateListing(listing);
                }

                // Call optional refresh to ensure parent reloads in-memory data
                if (typeof refreshData === 'function') {
                    refreshData();
                }

                // Dispatch a global event so any listeners (e.g., other components) can refresh
                try {
                    window.dispatchEvent(new CustomEvent('fiilar:listings-updated', { detail: { listing } }));
                } catch (e) {
                    // Ignore if window not available (server-side)
                }

                setView('listings');
                setStep(1);
                setLastSaved(null);
            } catch (error) {
                console.error("Failed to save listing:", error);
                alert("Failed to save listing. Please try again.");
            } finally {
                setIsSubmitting(false);
            }
        }, 1500);
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            Array.from(files).forEach((file: File) => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    setNewListing(prev => ({
                        ...prev,
                        images: [...(prev.images || []), reader.result as string]
                    }));
                };
                reader.readAsDataURL(file);
            });
        }
    };

    const handleImageDragStart = (index: number) => {
        setDraggedImageIndex(index);
    };

    const handleImageDragOver = (e: React.DragEvent, index: number) => {
        e.preventDefault();
        if (draggedImageIndex === null || draggedImageIndex === index) return;

        const images = [...(newListing.images || [])];
        const draggedImage = images[draggedImageIndex];
        images.splice(draggedImageIndex, 1);
        images.splice(index, 0, draggedImage);

        setNewListing(prev => ({ ...prev, images }));
        setDraggedImageIndex(index);
    };

    const handleImageDragEnd = () => {
        setDraggedImageIndex(null);
    };

    const handleProofUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setNewListing(prev => ({ ...prev, proofOfAddress: 'https://example.com/doc_simulated.pdf' }));
            setIsEditingUpload(false); // Hide upload box after successful upload
        }
    };

    const removeImage = (index: number) => {
        setNewListing(prev => ({
            ...prev,
            images: (prev.images || []).filter((_, i) => i !== index)
        }));
    };

    // --- Weekly Schedule Generator ---

    const applyWeeklySchedule = () => {
        const generated = generateAvailabilityMap(weeklySchedule);
        setNewListing({ ...newListing, availability: generated });
        alert("Schedule applied to the next 3 months!");
    };

    const toggleDaySchedule = (dayIndex: number) => {
        setWeeklySchedule(prev => ({
            ...prev,
            [dayIndex]: { ...prev[dayIndex], enabled: !prev[dayIndex].enabled }
        }));
    };

    const updateDayTime = (dayIndex: number, field: 'start' | 'end', value: number) => {
        setWeeklySchedule(prev => ({
            ...prev,
            [dayIndex]: { ...prev[dayIndex], [field]: value }
        }));
    };

    // --- Calendar Overrides ---

    const toggleHourOverride = (dateStr: string, hour: number) => {
        const currentHours = newListing.availability?.[dateStr] || [];
        let newHours;

        if (currentHours.includes(hour)) {
            newHours = currentHours.filter(h => h !== hour);
        } else {
            newHours = [...currentHours, hour].sort((a, b) => a - b);
        }

        const newAvailability = { ...newListing.availability };
        if (newHours.length > 0) {
            newAvailability[dateStr] = newHours;
        } else {
            delete newAvailability[dateStr];
        }

        setNewListing({ ...newListing, availability: newAvailability });
    };

    const handleDateClick = (dateStr: string) => {
        // If Daily, toggle entire day availability immediately
        if (newListing.priceUnit === BookingType.DAILY) {
            const isOpen = !!newListing.availability?.[dateStr];
            if (isOpen) {
                // Currently Open -> Block it
                blockEntireDay(dateStr);
            } else {
                // Currently Closed -> Open it
                fillStandardHours(dateStr);
            }
        } else {
            // If Hourly, select it to show sidebar
            setSelectedCalendarDate(dateStr);
        }
    };

    // NEW: Clear all hours for a specific date (BLOCK)
    const blockEntireDay = (dateStr: string) => {
        const hasBooking = activeBookings.some(b => b.date === dateStr);
        if (hasBooking) {
            const confirmBlock = window.confirm("Warning: You have active bookings on this date. Blocking it will require cancelling them manually. Continue?");
            if (!confirmBlock) return;
        }

        const newAvailability = { ...newListing.availability };
        delete newAvailability[dateStr]; // Removing from map = BLOCKED
        setNewListing({ ...newListing, availability: newAvailability });
    };

    // NEW: Fill standard hours (9-5) for a date (OPEN)
    const fillStandardHours = (dateStr: string) => {
        const newAvailability = { ...newListing.availability };
        // For Daily, the specific hours don't matter as much, but we fill them for consistency
        newAvailability[dateStr] = [9, 10, 11, 12, 13, 14, 15, 16, 17];
        setNewListing({ ...newListing, availability: newAvailability });
    };

    // Helper to find previous unique proof documents
    const getPreviousProofs = () => {
        return myListings.reduce((acc, curr) => {
            if (curr.proofOfAddress && !acc.find(p => p.url === curr.proofOfAddress)) {
                acc.push({ url: curr.proofOfAddress, location: curr.location, title: curr.title });
            }
            return acc;
        }, [] as { url: string, location: string, title: string }[]);
    };

    const handleVerifyBank = () => {
        if (!bankDetails.accountNumber || !bankDetails.bankName) {
            alert("Please enter bank name and account number");
            return;
        }
        setIsVerifyingBank(true);
        // Mock Paystack Resolve Account API
        setTimeout(() => {
            setBankDetails(prev => ({
                ...prev,
                accountName: "MOCK USER NAME",
                isVerified: true
            }));
            setIsVerifyingBank(false);
            alert("Account Verified Successfully!");
        }, 1500);
    };

    const handleSaveBankDetails = () => {
        // Mock Save to Backend
        alert("Bank details saved successfully! You can now receive payouts.");
        // In real app: update user profile via API
    };

    const handleReleaseFunds = async (bookingId: string) => {
        const booking = hostBookings.find(b => b.id === bookingId);
        if (!booking) return;

        try {
            // Find the listing to get host ID
            const listing = myListings.find(l => l.id === booking.listingId);
            if (!listing) return;

            // Release funds through escrow service
            const result = await escrowService.releaseFundsToHost(booking, listing.hostId);

            if (result.success) {
                // Update booking status to Confirmed
                const updatedBooking = {
                    ...booking,
                    status: 'Confirmed' as const,
                    paymentStatus: 'Released' as const,
                    transactionIds: [...(booking.transactionIds || []), result.transactionId]
                };
                updateBooking(updatedBooking);

                // Notify guest about fund release
                addNotification({
                    userId: booking.userId,
                    type: 'booking',
                    title: 'Payment Released',
                    message: `Payment for your stay at "${listing?.title}" has been released to the host`,
                    severity: 'info',
                    read: false,
                    actionRequired: false,
                    metadata: {
                        bookingId: booking.id,
                        link: '/dashboard?tab=bookings'
                    }
                });

                // Refresh bookings
                const all = getBookings();
                const myListingIds = listings.filter(l => l.hostId === user.id).map(l => l.id);
                setHostBookings(all.filter(b => myListingIds.includes(b.listingId)).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));

                alert(`✅ Funds released successfully! Transaction ID: ${result.transactionId}`);
            }
        } catch (error) {
            alert('Failed to release funds. Please try again.');
            console.error(error);
        }
    };

    const renderCreateWizard = () => {
        const originalListing = listings.find(l => l.id === (newListing as any).id);
        const isLive = originalListing?.status === ListingStatus.LIVE;

        // Helper for today's date comparison (stripped time)
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        return (
            <div className="flex flex-col lg:flex-row gap-6 max-w-7xl mx-auto">
                {/* Left: Form */}
                <div className="flex-1 bg-white p-4 sm:p-8 rounded-2xl shadow-sm border border-gray-100 relative">

                    <div className="mb-8">
                        <div className="flex items-start justify-between mb-4">
                            <div>
                                <h2 className="text-2xl font-bold">{(newListing as any).id ? 'Edit Listing' : 'List your space'}</h2>
                                {(newListing as any).id && (
                                    <span className="text-xs font-mono text-gray-400">ID: {(newListing as any).id}</span>
                                )}
                            </div>

                            {/* Close Button Repositioned */}
                            <button
                                onClick={() => { setView('listings'); setStep(1); }}
                                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                                title="Close without saving"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        {/* Clickable Tabs */}
                        <div className="flex items-center space-x-2 text-sm text-gray-500 overflow-x-auto pb-2">
                            {['Details', 'Media', 'Availability & Rules', 'Verification', 'Review'].map((label, idx) => (
                                <React.Fragment key={idx}>
                                    <button
                                        onClick={() => setStep(idx + 1)}
                                        className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors flex items-center gap-2 ${step === idx + 1 ? 'bg-brand-100 text-brand-600 font-bold' : 'hover:bg-gray-50 text-gray-600'}`}
                                    >
                                        <span className={`flex items-center justify-center w-5 h-5 rounded-full text-[10px] ${step === idx + 1 ? 'bg-brand-600 text-white' : 'bg-gray-200 text-gray-600'}`}>{idx + 1}</span>
                                        {label}
                                    </button>
                                    {idx < 4 && <span className="text-gray-300">&rarr;</span>}
                                </React.Fragment>
                            ))}
                        </div>
                    </div>

                    {step === 1 && (
                        <div className="space-y-4 max-w-2xl mx-auto animate-in fade-in duration-300">

                            {/* AI Magic Auto-Fill Card */}
                            {showAiInput && !(newListing as any).id && (
                                <div className="bg-gradient-to-r from-purple-50 to-brand-50 border border-brand-100 p-5 rounded-xl mb-6 relative overflow-hidden group">
                                    <div className="flex items-center gap-2 mb-2 text-brand-700 font-bold">
                                        <Sparkles size={18} className="animate-pulse" />
                                        <span>Magic Auto-Fill</span>
                                    </div>
                                    <p className="text-xs text-gray-600 mb-3">Paste a description (or notes) about your space, and we'll fill out the details for you.</p>

                                    <div className="relative">
                                        <textarea
                                            className="w-full p-3 border border-brand-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 outline-none bg-white/80 min-h-[80px]"
                                            placeholder="e.g. Cozy 2-bedroom apartment in downtown LA with a pool. $150 per night. Max 4 guests. No smoking."
                                            value={aiPrompt}
                                            onChange={(e) => setAiPrompt(e.target.value)}
                                            disabled={isAiGenerating}
                                        />
                                        <button
                                            onClick={handleAiAutoFill}
                                            disabled={!aiPrompt.trim() || isAiGenerating}
                                            className="absolute bottom-2 right-2 bg-brand-600 text-white px-3 py-1.5 rounded-md text-xs font-bold hover:bg-brand-700 disabled:bg-gray-300 flex items-center gap-1 transition-all"
                                        >
                                            {isAiGenerating ? <Loader2 size={12} className="animate-spin" /> : <Wand2 size={12} />}
                                            {isAiGenerating ? 'Analyzing...' : 'Auto-fill'}
                                        </button>
                                    </div>
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium mb-1">Title</label>
                                <input
                                    type="text"
                                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-brand-500 outline-none bg-white"
                                    placeholder="e.g. Sunny Downtown Loft"
                                    value={newListing.title || ''}
                                    onChange={e => setNewListing({ ...newListing, title: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Description</label>
                                <textarea
                                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-brand-500 outline-none h-32 bg-white"
                                    placeholder="Describe your space..."
                                    value={newListing.description || ''}
                                    onChange={e => setNewListing({ ...newListing, description: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1 flex items-center gap-2">
                                        Location {isLive && <Lock size={12} className="text-gray-400" />}
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            disabled={isLive}
                                            className={`w-full p-3 border rounded-lg outline-none ${isLive ? 'bg-gray-100 text-gray-500 cursor-not-allowed border-gray-200' : 'bg-white focus:ring-2 focus:ring-brand-500'}`}
                                            placeholder="e.g. 123 Market St, SF"
                                            value={newListing.location || ''}
                                            onChange={e => setNewListing({ ...newListing, location: e.target.value })}
                                        />
                                        {isLive && <Lock className="absolute right-3 top-3.5 text-gray-400" size={16} />}
                                    </div>
                                    {isLive && <p className="text-[10px] text-gray-500 mt-1 flex items-center gap-1"><AlertCircle size={10} /> Location cannot be changed on a live listing.</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Max Capacity (People)</label>
                                    <div className="relative">
                                        <Users className="absolute left-3 top-3 text-gray-400" size={18} />
                                        <input
                                            type="number"
                                            min="1"
                                            className="w-full p-3 pl-10 border rounded-lg focus:ring-2 focus:ring-brand-500 outline-none bg-white"
                                            placeholder="e.g. 10"
                                            value={newListing.capacity || ''}
                                            onChange={e => setNewListing({ ...newListing, capacity: parseInt(e.target.value) || 1 })}
                                        />
                                    </div>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1 flex items-center gap-2">
                                    Space Type {isLive && <Lock size={12} className="text-gray-400" />}
                                </label>
                                <div className="relative">
                                    <select
                                        disabled={isLive}
                                        className={`w-full p-3 border rounded-lg ${isLive ? 'bg-gray-100 text-gray-500 cursor-not-allowed border-gray-200 appearance-none' : 'bg-white'}`}
                                        value={newListing.type}
                                        onChange={e => setNewListing({ ...newListing, type: e.target.value as SpaceType })}
                                    >
                                        {Object.values(SpaceType).map(t => <option key={t} value={t}>{t}</option>)}
                                    </select>
                                    {isLive && <Lock className="absolute right-8 top-3.5 text-gray-400" size={16} />}
                                </div>
                            </div>

                            {/* Price and Unit Moved to Step 1 */}
                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mt-2">
                                <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                                    <DollarSign size={16} /> Pricing Strategy
                                </h4>
                                <div className="grid grid-cols-2 gap-4 mb-4">
                                    <div>
                                        <label className="block text-xs font-medium mb-1 text-gray-600">Base Price</label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-3 text-gray-500">$</span>
                                            <input
                                                type="number"
                                                min="0"
                                                className="w-full p-3 pl-7 border rounded-lg focus:ring-2 focus:ring-brand-500 outline-none bg-white"
                                                placeholder="0.00"
                                                value={newListing.price || ''}
                                                onChange={e => setNewListing({ ...newListing, price: parseFloat(e.target.value) })}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium mb-1 text-gray-600">Unit</label>
                                        <select
                                            className="w-full p-3 border rounded-lg bg-white focus:ring-2 focus:ring-brand-500 outline-none"
                                            value={newListing.priceUnit}
                                            onChange={e => setNewListing({ ...newListing, priceUnit: e.target.value as BookingType })}
                                        >
                                            {Object.values(BookingType).map(t => <option key={t} value={t}>{t}</option>)}
                                        </select>
                                    </div>
                                </div>

                                {/* Caution Fee Input */}
                                <div className="mb-4">
                                    <label className="block text-xs font-medium mb-1 text-gray-600 flex items-center gap-1">
                                        Caution Fee / Security Deposit
                                        <span title="Refundable amount held during booking">
                                            <Info size={12} className="text-gray-400" />
                                        </span>
                                    </label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-3 text-gray-500">$</span>
                                        <input
                                            type="number"
                                            min="0"
                                            className="w-full p-3 pl-7 border rounded-lg focus:ring-2 focus:ring-brand-500 outline-none bg-white"
                                            placeholder="0.00"
                                            value={newListing.cautionFee || ''}
                                            onChange={e => setNewListing({ ...newListing, cautionFee: parseFloat(e.target.value) || 0 })}
                                        />
                                    </div>
                                    <p className="text-[10px] text-gray-400 mt-1">
                                        This amount will be added to the total but is refundable if no damages occur.
                                    </p>
                                </div>

                                <div className="mt-4 pt-4 border-t border-gray-200">
                                    <div className="flex items-center gap-2 mb-2">
                                        <UserPlus size={16} className="text-gray-500" />
                                        <span className="text-sm font-medium">Dynamic Guest Pricing</span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-medium mb-1 text-gray-500">Base Price Covers</label>
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="number"
                                                    min="1"
                                                    max={newListing.capacity || 100}
                                                    className="w-full p-2 border rounded-lg text-sm bg-white"
                                                    value={newListing.includedGuests || 1}
                                                    onChange={e => setNewListing({ ...newListing, includedGuests: parseInt(e.target.value) || 1 })}
                                                />
                                                <span className="text-xs text-gray-400">Guests</span>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium mb-1 text-gray-500">Extra Cost Per Guest</label>
                                            <div className="relative">
                                                <span className="absolute left-2 top-2 text-gray-400 text-xs">$</span>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    className="w-full p-2 pl-5 border rounded-lg text-sm bg-white"
                                                    value={newListing.pricePerExtraGuest || ''}
                                                    placeholder="0"
                                                    onChange={e => setNewListing({ ...newListing, pricePerExtraGuest: parseFloat(e.target.value) || 0 })}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Optional Extras Section */}
                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mt-4">
                                <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                                    <PackagePlus size={16} /> Optional Extras
                                </h4>
                                <p className="text-xs text-gray-500 mb-3">Add items or services guests can rent (e.g. Cameras, Lighting, Cleaning).</p>

                                <div className="space-y-2 mb-3">
                                    {newListing.addOns?.map(addon => (
                                        <div key={addon.id} className="flex items-center justify-between bg-white p-2 rounded border border-gray-200">
                                            <div>
                                                <div className="text-sm font-medium">{addon.name}</div>
                                                <div className="text-xs text-gray-500">{addon.description}</div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className="text-sm font-bold">${addon.price}</span>
                                                <button onClick={() => handleRemoveAddOn(addon.id)} className="text-red-500 hover:bg-red-50 p-1 rounded">
                                                    <X size={14} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="grid grid-cols-12 gap-2">
                                    <div className="col-span-4">
                                        <input
                                            type="text"
                                            className="w-full p-2 text-sm border rounded bg-white"
                                            placeholder="Item Name"
                                            value={tempAddOn.name}
                                            onChange={e => setTempAddOn({ ...tempAddOn, name: e.target.value })}
                                        />
                                    </div>
                                    <div className="col-span-3">
                                        <div className="relative">
                                            <span className="absolute left-2 top-2 text-gray-400 text-xs">$</span>
                                            <input
                                                type="number"
                                                className="w-full p-2 pl-5 text-sm border rounded bg-white"
                                                placeholder="Price"
                                                value={tempAddOn.price}
                                                onChange={e => setTempAddOn({ ...tempAddOn, price: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <div className="col-span-4">
                                        <input
                                            type="text"
                                            className="w-full p-2 text-sm border rounded bg-white"
                                            placeholder="Description (Optional)"
                                            value={tempAddOn.description}
                                            onChange={e => setTempAddOn({ ...tempAddOn, description: e.target.value })}
                                        />
                                    </div>
                                    <div className="col-span-1">
                                        <button
                                            onClick={handleAddAddOn}
                                            disabled={!tempAddOn.name || !tempAddOn.price}
                                            className="w-full h-full bg-gray-900 text-white rounded flex items-center justify-center disabled:bg-gray-300"
                                        >
                                            <Plus size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={() => {
                                    setStep(2);
                                    setTimeout(() => document.querySelector<HTMLInputElement>('input[type="file"]')?.focus(), 100);
                                }}
                                className="w-full bg-brand-600 text-white py-3 rounded-lg font-semibold mt-4"
                            >
                                Next
                            </button>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-6 max-w-2xl mx-auto animate-in fade-in duration-300">
                            <div>
                                <h3 className="font-semibold mb-2">Upload Photos</h3>
                                <p className="text-sm text-gray-500 mb-4">Showcase your space with high-quality images.</p>

                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-4">
                                    {newListing.images?.map((img, idx) => (
                                        <div
                                            key={idx}
                                            draggable
                                            onDragStart={() => handleImageDragStart(idx)}
                                            onDragOver={(e) => handleImageDragOver(e, idx)}
                                            onDragEnd={handleImageDragEnd}
                                            className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 group cursor-move hover:border-brand-500 transition-all">
                                            <img src={img} alt={`Upload ${idx}`} className="w-full h-full object-cover" />

                                            {/* Cover Photo Badge */}
                                            {idx === 0 && (
                                                <div className="absolute top-2 left-2 bg-brand-600 text-white px-2 py-1 rounded-md text-xs font-semibold flex items-center gap-1 shadow-lg">
                                                    <Star size={12} className="fill-white" />
                                                    Cover
                                                </div>
                                            )}

                                            {/* Set as Cover Button */}
                                            {idx !== 0 && (
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        // Move selected image to first position
                                                        const newImages = [...(newListing.images || [])];
                                                        const [selectedImage] = newImages.splice(idx, 1);
                                                        newImages.unshift(selectedImage);
                                                        setNewListing(prev => ({ ...prev, images: newImages }));
                                                    }}
                                                    className="absolute top-2 left-2 p-1.5 bg-white/90 backdrop-blur-sm rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-white"
                                                    title="Set as cover photo"
                                                >
                                                    <Star size={16} className="text-gray-600 hover:text-yellow-500 transition" />
                                                </button>
                                            )}

                                            {/* Remove Button */}
                                            <button
                                                type="button"
                                                onClick={() => removeImage(idx)}
                                                className="absolute top-1 right-1 bg-black/50 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition"
                                            >
                                                <X size={14} />
                                            </button>
                                        </div>
                                    ))}
                                    <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg aspect-square cursor-pointer hover:bg-gray-50 hover:border-brand-500 transition">
                                        <input type="file" multiple accept="image/*" className="hidden" onChange={handleImageUpload} />
                                        <Upload className="text-gray-400 mb-2" />
                                        <span className="text-xs text-gray-500 font-medium">Add Photos</span>
                                    </label>
                                </div>
                            </div>
                            <div className="flex gap-2 mt-6">
                                <button onClick={() => setStep(1)} className="w-1/3 text-gray-600 font-medium">Back</button>
                                <button
                                    onClick={() => {
                                        setStep(3);
                                        setTimeout(() => setAvailTab('schedule'), 100);
                                    }}
                                    className="w-2/3 bg-brand-600 text-white py-3 rounded-lg font-semibold"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="space-y-6 animate-in fade-in duration-300">
                            {/* Unified Availability Manager */}
                            <div className="border border-gray-200 rounded-xl overflow-hidden bg-white mt-0">
                                {/* Sub-Tabs */}
                                <div className="flex bg-gray-50 border-b border-gray-200">
                                    <button
                                        onClick={() => setAvailTab('schedule')}
                                        className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 ${availTab === 'schedule' ? 'bg-white text-brand-600 border-b-2 border-brand-600' : 'text-gray-500 hover:bg-gray-100'}`}
                                    >
                                        <Clock size={16} /> Weekly Schedule
                                    </button>
                                    <button
                                        onClick={() => setAvailTab('calendar')}
                                        className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 ${availTab === 'calendar' ? 'bg-white text-brand-600 border-b-2 border-brand-600' : 'text-gray-500 hover:bg-gray-100'}`}
                                    >
                                        <CalendarIcon size={16} /> Specific Dates
                                    </button>
                                    <button
                                        onClick={() => setAvailTab('rules')}
                                        className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 ${availTab === 'rules' ? 'bg-white text-brand-600 border-b-2 border-brand-600' : 'text-gray-500 hover:bg-gray-100'}`}
                                    >
                                        <Settings size={16} /> Rules
                                    </button>
                                </div>

                                <div className="p-6">
                                    {availTab === 'schedule' && (
                                        <div className="space-y-4">
                                            <p className="text-sm text-gray-500 mb-4">Set your standard availability. {newListing.priceUnit === BookingType.DAILY ? 'For Daily rentals, select the days you are typically open.' : 'For Hourly rentals, set your operating hours.'}</p>
                                            {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((day, idx) => (
                                                <div key={idx} className="flex items-center gap-4 py-2 border-b border-gray-100 last:border-0">
                                                    <div className="w-32 flex items-center gap-2">
                                                        <input
                                                            type="checkbox"
                                                            checked={weeklySchedule[idx].enabled}
                                                            onChange={() => toggleDaySchedule(idx)}
                                                            className="rounded text-brand-600 focus:ring-brand-500"
                                                        />
                                                        <span className={`text-sm font-medium ${weeklySchedule[idx].enabled ? 'text-gray-900' : 'text-gray-400'}`}>{day}</span>
                                                    </div>

                                                    {weeklySchedule[idx].enabled ? (
                                                        newListing.priceUnit === BookingType.HOURLY ? (
                                                            <div className="flex items-center gap-2 text-sm">
                                                                <select
                                                                    value={weeklySchedule[idx].start}
                                                                    onChange={(e) => updateDayTime(idx, 'start', parseInt(e.target.value))}
                                                                    className="border rounded p-1 bg-white"
                                                                >
                                                                    {Array.from({ length: 24 }).map((_, h) => <option key={h} value={h}>{h}:00</option>)}
                                                                </select>
                                                                <span>to</span>
                                                                <select
                                                                    value={weeklySchedule[idx].end}
                                                                    onChange={(e) => updateDayTime(idx, 'end', parseInt(e.target.value))}
                                                                    className="border rounded p-1 bg-white"
                                                                >
                                                                    {Array.from({ length: 24 }).map((_, h) => <option key={h} value={h}>{h}:00</option>)}
                                                                </select>
                                                            </div>
                                                        ) : (
                                                            <span className="text-sm text-green-600 font-medium flex items-center gap-1"><CheckCircle size={12} /> Open</span>
                                                        )
                                                    ) : (
                                                        <span className="text-sm text-gray-400 italic">Closed</span>
                                                    )}
                                                </div>
                                            ))}
                                            <div className="pt-4">
                                                <button
                                                    onClick={applyWeeklySchedule}
                                                    className="flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-lg font-medium hover:bg-brand-700"
                                                >
                                                    <Save size={16} /> Apply Schedule to Calendar
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {availTab === 'calendar' && (
                                        <div className="flex flex-col md:flex-row gap-6">
                                            <div className="flex-1">
                                                <div className="flex items-center justify-between mb-4">
                                                    <h4 className="font-bold text-gray-900">Date Overrides</h4>
                                                    <div className="flex items-center gap-2">
                                                        <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))} className="p-1 hover:bg-gray-100 rounded"><ChevronLeft size={16} /></button>
                                                        <span className="text-sm font-semibold min-w-[100px] text-center">
                                                            {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
                                                        </span>
                                                        <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))} className="p-1 hover:bg-gray-100 rounded"><ChevronRight size={16} /></button>
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-7 gap-1 text-center mb-2">
                                                    {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
                                                        <div key={d} className="text-xs font-medium text-gray-400">{d}</div>
                                                    ))}
                                                </div>
                                                <div className="grid grid-cols-7 gap-1">
                                                    {getDaysInMonth(currentMonth).map((date, i) => {
                                                        if (!date) return <div key={`empty-${i}`} />;

                                                        // Check if past date
                                                        const isPast = date < today;

                                                        const dateStr = formatDate(date);
                                                        const hasAvail = !!newListing.availability?.[dateStr];
                                                        const isSelected = dateStr === selectedCalendarDate;

                                                        const bookingsOnDate = activeBookings.filter(b => b.date === dateStr);
                                                        const hasBookings = bookingsOnDate.length > 0;

                                                        return (
                                                            <button
                                                                key={dateStr}
                                                                disabled={isPast}
                                                                onClick={() => handleDateClick(dateStr)}
                                                                className={`
                                            relative aspect-square rounded-md flex flex-col items-center justify-center text-sm transition-colors
                                            ${isPast ? 'bg-gray-50 text-gray-300 cursor-not-allowed opacity-50' :
                                                                        (isSelected && newListing.priceUnit === BookingType.HOURLY ? 'bg-brand-600 text-white shadow-md' : 'hover:bg-gray-100 bg-white border border-gray-100')
                                                                    }
                                            ${!hasAvail && !isSelected && !isPast ? 'bg-gray-50 text-gray-400' : ''}
                                            ${newListing.priceUnit === BookingType.DAILY && hasAvail && !isPast ? 'bg-green-50 border-green-200 text-green-800' : ''}
                                            ${newListing.priceUnit === BookingType.DAILY && !hasAvail && !isPast ? 'bg-gray-100 text-gray-400' : ''}
                                        `}
                                                            >
                                                                {date.getDate()}

                                                                {/* Booking Indicator */}
                                                                {hasBookings && !isPast && (
                                                                    <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-purple-500 rounded-full ring-1 ring-white" title={`${bookingsOnDate.length} bookings`}></div>
                                                                )}

                                                                {/* Hourly Indicator */}
                                                                {newListing.priceUnit === BookingType.HOURLY && hasAvail && !isSelected && !isPast && (
                                                                    <div className="absolute bottom-1 w-1 h-1 rounded-full bg-green-500"></div>
                                                                )}

                                                                {/* Daily Status Text (Small) */}
                                                                {newListing.priceUnit === BookingType.DAILY && !isPast && (
                                                                    <span className="text-[8px] font-bold mt-0.5">
                                                                        {hasAvail ? 'OPEN' : 'OFF'}
                                                                    </span>
                                                                )}
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            </div>

                                            {newListing.priceUnit === BookingType.HOURLY && (
                                                <div className="w-full md:w-48 border-l border-gray-200 pl-0 md:pl-6 flex flex-col">
                                                    {selectedCalendarDate ? (
                                                        <>
                                                            <div className="mb-3">
                                                                <h4 className="font-bold text-gray-900 text-sm">{selectedCalendarDate}</h4>
                                                                <p className="text-xs text-gray-500">Toggle hours to set availability.</p>
                                                            </div>

                                                            <div className="grid grid-cols-2 gap-2 h-56 overflow-y-auto pr-2 mb-3 custom-scrollbar">
                                                                {Array.from({ length: 24 }).map((_, h) => {
                                                                    const isActive = newListing.availability?.[selectedCalendarDate]?.includes(h);
                                                                    return (
                                                                        <button
                                                                            key={h}
                                                                            onClick={() => toggleHourOverride(selectedCalendarDate!, h)}
                                                                            className={`text-xs py-1.5 rounded border transition-all ${isActive ? 'bg-green-50 border-green-500 text-green-700 font-bold' : 'bg-white border-gray-200 text-gray-400 hover:border-gray-300'}`}
                                                                        >
                                                                            {h}:00
                                                                        </button>
                                                                    )
                                                                })}
                                                            </div>

                                                            <div className="mt-auto space-y-2">
                                                                <button
                                                                    onClick={() => blockEntireDay(selectedCalendarDate!)}
                                                                    className="w-full flex items-center justify-center gap-2 px-3 py-2 border border-red-200 text-red-600 rounded-lg text-xs font-medium hover:bg-red-50 transition"
                                                                >
                                                                    <Ban size={12} /> Block Day
                                                                </button>
                                                                <button
                                                                    onClick={() => fillStandardHours(selectedCalendarDate!)}
                                                                    className="w-full flex items-center justify-center gap-2 px-3 py-2 border border-gray-200 text-gray-600 rounded-lg text-xs font-medium hover:bg-gray-50 transition"
                                                                >
                                                                    <RefreshCw size={12} /> 9 AM - 5 PM
                                                                </button>
                                                            </div>
                                                        </>
                                                    ) : (
                                                        <div className="h-full flex flex-col items-center justify-center text-center text-gray-400 text-sm">
                                                            <CalendarIcon size={24} className="mb-2 opacity-20" />
                                                            <span>Select a date to edit specific hours.</span>
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            {newListing.priceUnit === BookingType.DAILY && (
                                                <div className="w-full md:w-48 border-l border-gray-200 pl-0 md:pl-6 flex flex-col items-center justify-center text-center text-gray-500 text-sm">
                                                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                                                        <div className="flex gap-2 justify-center mb-2">
                                                            <div className="w-4 h-4 bg-green-100 border border-green-300 rounded"></div>
                                                            <div className="w-4 h-4 bg-gray-100 border border-gray-200 rounded"></div>
                                                        </div>
                                                        <p className="mb-2">Click any date to toggle availability.</p>
                                                        <p className="text-xs text-gray-400">Green = Bookable</p>
                                                        <p className="text-xs text-gray-400">Gray = Blocked</p>
                                                        <p className="text-xs text-purple-500 mt-2 font-bold">• Purple Dot = Booked</p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {availTab === 'rules' && (
                                        <div className="space-y-6">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                <div className="space-y-6">
                                                    {/* Recurring & Instant Book */}
                                                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 space-y-4">
                                                        <div className="flex items-center justify-between">
                                                            <div>
                                                                <h4 className="font-bold text-gray-900 text-sm">Allow Recurring Bookings</h4>
                                                                <p className="text-xs text-gray-500">Guests can book multiple days in a sequence.</p>
                                                            </div>
                                                            <button
                                                                onClick={() => setNewListing(prev => ({
                                                                    ...prev,
                                                                    settings: { ...(prev.settings || { minDuration: 1, instantBook: false, allowRecurring: true }), allowRecurring: !(prev.settings?.allowRecurring) }
                                                                }))}
                                                                className={`w-10 h-5 rounded-full transition-colors relative ${newListing.settings?.allowRecurring ? 'bg-brand-600' : 'bg-gray-300'}`}
                                                            >
                                                                <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${newListing.settings?.allowRecurring ? 'left-5.5' : 'left-0.5'}`} />
                                                            </button>
                                                        </div>

                                                        <div className="h-px bg-gray-200 w-full"></div>

                                                        <div className="flex items-center justify-between">
                                                            <div>
                                                                <h4 className="font-bold text-gray-900 text-sm">Instant Book</h4>
                                                                <p className="text-xs text-gray-500">Allow guests to book without manual approval.</p>
                                                            </div>
                                                            <button
                                                                onClick={() => setNewListing(prev => ({
                                                                    ...prev,
                                                                    settings: { ...(prev.settings || { minDuration: 1, instantBook: false, allowRecurring: true }), instantBook: !(prev.settings?.instantBook) }
                                                                }))}
                                                                className={`w-10 h-5 rounded-full transition-colors relative ${newListing.settings?.instantBook ? 'bg-brand-600' : 'bg-gray-300'}`}
                                                            >
                                                                <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${newListing.settings?.instantBook ? 'left-5.5' : 'left-0.5'}`} />
                                                            </button>
                                                        </div>
                                                    </div>

                                                    {/* Cancellation Policy */}
                                                    <div>
                                                        <label className="block text-sm font-bold text-gray-900 mb-2">Cancellation Policy</label>
                                                        <select
                                                            className="w-full p-3 border border-gray-300 rounded-lg bg-white text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                                                            value={newListing.cancellationPolicy || CancellationPolicy.MODERATE}
                                                            onChange={(e) => setNewListing({ ...newListing, cancellationPolicy: e.target.value as CancellationPolicy })}
                                                        >
                                                            <option value={CancellationPolicy.FLEXIBLE}>Flexible (Full refund 24h prior)</option>
                                                            <option value={CancellationPolicy.MODERATE}>Moderate (Full refund 5 days prior)</option>
                                                            <option value={CancellationPolicy.STRICT}>Strict (No refund)</option>
                                                        </select>
                                                    </div>
                                                </div>

                                                {/* Rules & Safety */}
                                                <div className="space-y-6">
                                                    {/* House Rules */}
                                                    <div>
                                                        <label className="block text-sm font-bold text-gray-900 mb-2">House Rules</label>
                                                        <div className="flex gap-2 mb-2">
                                                            <input
                                                                type="text"
                                                                className="flex-1 p-2 text-sm border border-gray-300 rounded-lg outline-none"
                                                                placeholder="e.g. No smoking, Quiet hours after 10pm"
                                                                value={tempRule}
                                                                onChange={(e) => setTempRule(e.target.value)}
                                                                onKeyDown={(e) => e.key === 'Enter' && handleAddRule()}
                                                            />
                                                            <button onClick={handleAddRule} className="p-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"><Plus size={18} /></button>
                                                        </div>
                                                        <div className="space-y-2 max-h-32 overflow-y-auto">
                                                            {newListing.houseRules?.map((rule, i) => (
                                                                <div key={i} className="flex items-center justify-between bg-gray-50 p-2 rounded text-sm text-gray-700 border border-gray-100">
                                                                    <span>{rule}</span>
                                                                    <button onClick={() => handleRemoveRule(i)} className="text-red-400 hover:text-red-600"><X size={14} /></button>
                                                                </div>
                                                            ))}
                                                            {(!newListing.houseRules || newListing.houseRules.length === 0) && (
                                                                <p className="text-xs text-gray-400 italic">No rules added yet.</p>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Safety Items */}
                                                    <div>
                                                        <label className="block text-sm font-bold text-gray-900 mb-2">Safety Items</label>
                                                        <div className="flex flex-wrap gap-2 mb-3">
                                                            {SAFETY_OPTIONS.map(item => (
                                                                <button
                                                                    key={item}
                                                                    onClick={() => toggleSafetyItem(item)}
                                                                    className={`px-3 py-1 text-xs rounded-full border transition-colors ${newListing.safetyItems?.includes(item) ? 'bg-brand-600 text-white border-brand-600' : 'bg-white text-gray-600 border-gray-300 hover:border-gray-400'}`}
                                                                >
                                                                    {item}
                                                                </button>
                                                            ))}
                                                        </div>
                                                        <div className="flex gap-2">
                                                            <input
                                                                type="text"
                                                                className="flex-1 p-2 text-sm border border-gray-300 rounded-lg outline-none"
                                                                placeholder="Add custom safety item..."
                                                                value={customSafety}
                                                                onChange={(e) => setCustomSafety(e.target.value)}
                                                                onKeyDown={(e) => e.key === 'Enter' && handleAddCustomSafety()}
                                                            />
                                                            <button onClick={handleAddCustomSafety} className="p-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"><Plus size={18} /></button>
                                                        </div>

                                                        {/* Display Custom Items */}
                                                        <div className="flex flex-wrap gap-2 mt-2">
                                                            {newListing.safetyItems?.filter(i => !SAFETY_OPTIONS.includes(i)).map((item, i) => (
                                                                <div key={i} className="flex items-center gap-1 px-2 py-1 bg-brand-50 text-brand-800 rounded-full text-xs border border-brand-100">
                                                                    <span>{item}</span>
                                                                    <button onClick={() => toggleSafetyItem(item)} className="hover:text-red-600"><X size={10} /></button>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex gap-2 mt-6 max-w-2xl mx-auto">
                                <button onClick={() => setStep(2)} className="w-1/3 text-gray-600 font-medium">Back</button>
                                <button
                                    onClick={() => {
                                        setStep(4);
                                        setTimeout(() => document.querySelector<HTMLInputElement>('input[type="file"][accept*="pdf"]')?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 100);
                                    }}
                                    className="w-2/3 bg-brand-600 text-white py-3 rounded-lg font-semibold"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}

                    {step === 4 && (
                        <div className="space-y-6 max-w-2xl mx-auto animate-in slide-in-from-right duration-300">
                            <div className="text-center mb-6">
                                <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Shield size={32} />
                                </div>
                                <h3 className="font-bold text-xl text-gray-900">Property Verification</h3>
                                <p className="text-gray-500 text-sm mt-2 max-w-md mx-auto">To maintain a safe community, we need proof that you own or manage this specific property (e.g. Utility Bill, Lease Agreement).</p>
                            </div>

                            {/* Simplified UI for Verified Documents */}
                            {newListing.proofOfAddress && !isEditingUpload ? (
                                <div className="text-center py-12 bg-green-50 rounded-2xl border border-green-100">
                                    <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <ShieldCheck size={32} />
                                    </div>
                                    <h3 className="text-xl font-bold text-green-900 mb-2">Verification Complete</h3>
                                    <p className="text-green-700 mb-6 max-w-sm mx-auto">You have already submitted proof of address for this listing. No further action is needed.</p>

                                    <div className="flex justify-center gap-4">
                                        <button
                                            onClick={() => setIsEditingUpload(true)}
                                            className="text-sm font-semibold text-green-800 underline decoration-green-400 hover:text-green-900"
                                        >
                                            Update Document
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    {/* Document Reuse Section */}
                                    {getPreviousProofs().length > 0 && (
                                        <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 mb-4">
                                            <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                                                <Copy size={16} /> Reuse Verified Document
                                            </h4>
                                            <div className="space-y-2">
                                                {getPreviousProofs().map((proof, idx) => (
                                                    <button
                                                        key={idx}
                                                        onClick={() => {
                                                            const isSelected = newListing.proofOfAddress === proof.url;
                                                            setNewListing({ ...newListing, proofOfAddress: isSelected ? '' : proof.url });
                                                            setIsEditingUpload(false);
                                                        }}
                                                        className={`w-full flex items-center p-3 border rounded-lg text-left transition-all ${newListing.proofOfAddress === proof.url ? 'border-brand-600 bg-brand-50 ring-1 ring-brand-600' : 'bg-white border-gray-200 hover:border-gray-300'}`}
                                                    >
                                                        <div className={`w-4 h-4 rounded-full border mr-3 flex items-center justify-center flex-shrink-0 ${newListing.proofOfAddress === proof.url ? 'border-brand-600' : 'border-gray-300'}`}>
                                                            {newListing.proofOfAddress === proof.url && <div className="w-2 h-2 rounded-full bg-brand-600" />}
                                                        </div>
                                                        <div className="overflow-hidden">
                                                            <div className="text-sm font-medium text-gray-900 truncate">{proof.location}</div>
                                                            <div className="text-xs text-gray-500 truncate">Used in: {proof.title}</div>
                                                        </div>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {newListing.proofOfAddress && isEditingUpload && (
                                        <div className="text-right mb-2">
                                            <button onClick={() => setIsEditingUpload(false)} className="text-xs text-gray-500 hover:text-gray-900">Cancel Change</button>
                                        </div>
                                    )}

                                    <label className={`
                        block border-2 border-dashed rounded-xl p-10 flex flex-col items-center justify-center cursor-pointer transition-all
                        ${newListing.proofOfAddress
                                            ? 'border-green-500 bg-green-50'
                                            : 'border-gray-300 hover:border-brand-500 hover:bg-gray-50'}
                    `}>
                                        <input type="file" accept=".pdf,.jpg,.png" className="hidden" onChange={handleProofUpload} />
                                        {newListing.proofOfAddress ? (
                                            <div className="text-center">
                                                <CheckCircle size={48} className="text-green-600 mx-auto mb-3" />
                                                <div className="font-bold text-green-800">Document Uploaded</div>
                                                <div className="text-xs text-green-600 mt-1">
                                                    {newListing.proofOfAddress.includes('doc_simulated') ? 'Using Simulated Upload' : 'Document Attached'}
                                                </div>
                                                <div className="text-xs text-green-600 mt-1 underline cursor-pointer">Click to replace</div>
                                            </div>
                                        ) : (
                                            <div className="text-center">
                                                <FileText size={48} className="text-gray-400 mx-auto mb-3" />
                                                <div className="font-medium text-gray-900">Click to upload Proof of Address</div>
                                                <div className="text-xs text-gray-500 mt-1">PDF, JPG or PNG (Max 5MB)</div>
                                            </div>
                                        )}
                                    </label>
                                </>
                            )}

                            <div className="flex gap-2 mt-6">
                                <button onClick={() => setStep(3)} className="w-1/3 text-gray-600 font-medium">Back</button>
                                <button
                                    onClick={() => setStep(5)}
                                    className="w-2/3 bg-brand-600 text-white py-3 rounded-lg font-semibold"
                                >
                                    {newListing.proofOfAddress ? 'Next' : 'Skip for now'}
                                </button>
                            </div>
                        </div>
                    )}

                    {step === 5 && (
                        <div className="space-y-4 max-w-2xl mx-auto animate-in fade-in duration-300">

                            {/* Settings Card */}
                            <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                                <div className="bg-gray-50 px-6 py-3 border-b border-gray-100">
                                    <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                                        <Settings size={16} className="text-brand-600" /> Configuration
                                    </h3>
                                </div>
                                <div className="p-5 space-y-5">
                                    {/* Guest Requirements Toggle */}
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <div className="font-medium text-gray-900 text-sm flex items-center gap-2">
                                                <Shield size={16} className="text-gray-400" /> Require ID Verification
                                            </div>
                                            <p className="text-xs text-gray-500 mt-0.5 max-w-xs">
                                                {newListing.requiresIdentityVerification
                                                    ? "Only guests with verified Government ID can book."
                                                    : "Any guest can book immediately."}
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => setNewListing({ ...newListing, requiresIdentityVerification: !newListing.requiresIdentityVerification })}
                                            className={`
                           relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none
                           ${newListing.requiresIdentityVerification ? 'bg-brand-600' : 'bg-gray-200'}
                        `}
                                        >
                                            <span
                                                className={`
                            inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm
                            ${newListing.requiresIdentityVerification ? 'translate-x-6' : 'translate-x-1'}
                          `}
                                            />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Preview Card */}
                            <div className="bg-gray-50 p-4 rounded-xl mb-4 text-left relative border border-gray-100">
                                <div className="absolute top-3 right-3 z-10">
                                    <span className="bg-white/90 backdrop-blur px-2 py-0.5 rounded text-[10px] font-bold border border-gray-200 text-gray-500 shadow-sm uppercase tracking-wider">Preview</span>
                                </div>

                                <div className="flex gap-4">
                                    <div className="w-24 h-24 rounded-lg overflow-hidden bg-gray-200 shrink-0">
                                        {newListing.images && newListing.images[0] ? (
                                            <img src={newListing.images[0]} className="w-full h-full object-cover" alt="Preview" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-400"><ImageIcon size={24} /></div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0 py-1">
                                        <h3 className="font-bold text-base text-gray-900 truncate">{newListing.title || 'Untitled Listing'}</h3>
                                        <p className="text-xs text-gray-600 flex items-center gap-1"><MapPin size={10} /> {newListing.location || 'No location'}</p>
                                        <p className="text-xs text-gray-500 mt-0.5">{newListing.type}</p>

                                        <div className="flex flex-wrap items-center gap-2 mt-3">
                                            <p className="text-brand-600 font-bold text-sm">${newListing.price || 0} <span className="text-gray-400 font-normal">/ {newListing.priceUnit === BookingType.HOURLY ? 'hr' : 'day'}</span></p>

                                            {newListing.settings?.allowRecurring && (
                                                <span className="text-[10px] bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded font-semibold flex items-center gap-1">
                                                    <Repeat size={8} /> Recurring
                                                </span>
                                            )}
                                            {newListing.requiresIdentityVerification && (
                                                <span className="text-[10px] bg-purple-100 text-purple-800 px-1.5 py-0.5 rounded font-semibold flex items-center gap-1">
                                                    <Shield size={8} /> ID Req.
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-3 pt-3 border-t border-gray-200 flex items-center justify-between text-xs">
                                    <div className={`flex items-center gap-1 font-medium ${newListing.proofOfAddress ? 'text-green-700' : 'text-orange-600'}`}>
                                        {newListing.proofOfAddress ? <><CheckCircle size={12} /> Proof of Address Verified</> : <><AlertCircle size={12} /> Missing Documentation</>}
                                    </div>
                                    <div className="flex flex-col items-end text-gray-500">
                                        <span className="flex items-center gap-0.5"><Users size={12} /> Max {newListing.capacity || 1}</span>
                                        {(newListing.addOns?.length || 0) > 0 && (
                                            <span className="text-blue-600 flex items-center gap-0.5"><PackagePlus size={8} /> {newListing.addOns?.length} Extras</span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {!newListing.proofOfAddress && (
                                <div className="flex items-start gap-3 bg-orange-50 p-4 rounded-lg text-left text-sm text-orange-800 mb-4 border border-orange-100">
                                    <AlertTriangle className="shrink-0 mt-0.5" size={18} />
                                    <p>
                                        <strong>Missing Document:</strong> You haven't uploaded proof of address yet. You can save this listing as a
                                        <span className="font-bold"> Draft</span> and upload it later.
                                    </p>
                                </div>
                            )}

                            {!user.kycVerified && (
                                <div className="flex items-start gap-3 bg-yellow-50 p-4 rounded-lg text-left text-sm text-yellow-800 mb-4 border border-yellow-100">
                                    <AlertCircle className="shrink-0 mt-0.5" size={18} />
                                    <p>
                                        <strong>Note:</strong> Your account is not KYC verified yet. This listing will be saved as a
                                        <span className="font-bold"> Draft</span> until you verify your Government ID.
                                    </p>
                                </div>
                            )}

                            {user.kycVerified && newListing.proofOfAddress && (
                                <div className="flex items-start gap-3 bg-blue-50 p-4 rounded-lg text-left text-sm text-blue-800 mb-4 border border-blue-100">
                                    <CheckCircle className="shrink-0 mt-0.5" size={18} />
                                    <p>
                                        <strong>Ready to submit:</strong> {(newListing as any).id && listings.find(l => l.id === (newListing as any).id)?.status === ListingStatus.LIVE ?
                                            'Updates will be published immediately since this listing is already live.' :
                                            'Your listing will be sent for approval by our team before going live.'}
                                    </p>
                                </div>
                            )}

                            <div className="flex gap-3 mt-6 pt-4 border-t border-gray-100">
                                <button onClick={() => setStep(4)} className="w-1/3 bg-white border border-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-50 transition">Back</button>
                                <button
                                    onClick={handleCreateListing}
                                    disabled={isSubmitting}
                                    className="w-2/3 bg-gray-900 text-white py-3 rounded-lg font-semibold flex justify-center items-center hover:bg-black transition shadow-lg"
                                >
                                    {isSubmitting ? <Loader2 className="animate-spin" /> : (
                                        user.kycVerified && newListing.proofOfAddress && newListing.price ?
                                            ((newListing as any).id && listings.find(l => l.id === (newListing as any).id)?.status === ListingStatus.LIVE ? 'Save Changes' : 'Submit for Approval')
                                            : 'Save Draft'
                                    )}
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Right: Live Preview - Sticky */}
                <div className="hidden lg:block w-96 flex-shrink-0">
                    <div className="sticky top-24 space-y-4">
                        {/* Auto-save indicator */}
                        {view === 'create' && (newListing.title || newListing.description) && (
                            <div className={`rounded-lg px-3 py-2 text-xs flex items-center gap-2 transition-all ${lastSaved && new Date().getTime() - lastSaved.getTime() < 5000
                                    ? 'bg-green-50 border border-green-200 text-green-700'
                                    : 'bg-gray-50 border border-gray-200 text-gray-600'
                                }`}>
                                {lastSaved && new Date().getTime() - lastSaved.getTime() < 5000 ? (
                                    <>
                                        <CheckCircle size={12} className="animate-in fade-in" />
                                        <span>Draft saved</span>
                                    </>
                                ) : (
                                    <>
                                        <Clock size={12} />
                                        <span>Auto-saving...</span>
                                    </>
                                )}
                            </div>
                        )}
                        {/* Preview Card */}
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                            <div className="bg-gradient-to-r from-brand-50 to-purple-50 px-4 py-3 border-b border-gray-100">
                                <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                                    <Sparkles size={14} className="text-brand-600" /> Live Preview
                                </h3>
                            </div>
                            <div className="p-4">
                                {/* Image Preview */}
                                <div className="w-full h-48 rounded-lg overflow-hidden bg-gray-100 mb-4">
                                    {newListing.images && newListing.images[0] ? (
                                        <img src={newListing.images[0]} className="w-full h-full object-cover" alt="Preview" />
                                    ) : (
                                        <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                                            <ImageIcon size={32} className="mb-2" />
                                            <span className="text-xs">No image yet</span>
                                        </div>
                                    )}
                                </div>

                                {/* Title & Location */}
                                <h3 className="font-bold text-lg text-gray-900 mb-1 truncate">
                                    {newListing.title || 'Untitled Listing'}
                                </h3>
                                <p className="text-xs text-gray-600 flex items-center gap-1 mb-3">
                                    <MapPin size={10} /> {newListing.location || 'No location set'}
                                </p>

                                {/* Description */}
                                {newListing.description && (
                                    <p className="text-xs text-gray-600 mb-3 line-clamp-3">{newListing.description}</p>
                                )}

                                {/* Price */}
                                <div className="flex items-baseline gap-2 mb-3">
                                    <span className="text-2xl font-bold text-brand-600">${newListing.price || 0}</span>
                                    <span className="text-sm text-gray-500">/ {newListing.priceUnit === BookingType.HOURLY ? 'hour' : 'day'}</span>
                                </div>

                                {/* Tags */}
                                <div className="flex flex-wrap gap-2 mb-3">
                                    <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">{newListing.type}</span>
                                    <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full flex items-center gap-1">
                                        <Users size={10} /> Max {newListing.capacity || 1}
                                    </span>
                                    {newListing.settings?.allowRecurring && (
                                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full flex items-center gap-1">
                                            <Repeat size={10} /> Recurring
                                        </span>
                                    )}
                                    {newListing.requiresIdentityVerification && (
                                        <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full flex items-center gap-1">
                                            <Shield size={10} /> ID Required
                                        </span>
                                    )}
                                </div>

                                {/* Extras */}
                                {(newListing.addOns?.length || 0) > 0 && (
                                    <div className="border-t border-gray-100 pt-3 mb-3">
                                        <p className="text-xs font-semibold text-gray-700 mb-2 flex items-center gap-1">
                                            <PackagePlus size={12} /> Optional Extras ({newListing.addOns?.length})
                                        </p>
                                        <div className="space-y-1">
                                            {newListing.addOns?.slice(0, 3).map(addon => (
                                                <div key={addon.id} className="flex justify-between text-xs">
                                                    <span className="text-gray-600">{addon.name}</span>
                                                    <span className="font-semibold text-gray-900">${addon.price}</span>
                                                </div>
                                            ))}
                                            {(newListing.addOns?.length || 0) > 3 && (
                                                <p className="text-xs text-gray-400 italic">+{newListing.addOns!.length - 3} more</p>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Status Indicators */}
                                <div className="border-t border-gray-100 pt-3 space-y-2">
                                    <div className={`flex items-center gap-2 text-xs ${newListing.proofOfAddress ? 'text-green-700' : 'text-orange-600'
                                        }`}>
                                        {newListing.proofOfAddress ? (
                                            <><CheckCircle size={12} /> Proof verified</>
                                        ) : (
                                            <><AlertCircle size={12} /> Missing proof</>
                                        )}
                                    </div>
                                    {newListing.images && newListing.images.length > 0 && (
                                        <div className="flex items-center gap-2 text-xs text-green-700">
                                            <CheckCircle size={12} /> {newListing.images.length} photo{newListing.images.length !== 1 ? 's' : ''}
                                        </div>
                                    )}
                                    {(newListing.houseRules?.length || 0) > 0 && (
                                        <div className="flex items-center gap-2 text-xs text-green-700">
                                            <CheckCircle size={12} /> {newListing.houseRules?.length} house rule{newListing.houseRules?.length !== 1 ? 's' : ''}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Completion Progress */}
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
                            <h4 className="text-sm font-bold text-gray-900 mb-3">Completion</h4>
                            <div className="space-y-2">
                                {[
                                    { label: 'Basic Info', done: !!(newListing.title && newListing.location && newListing.price) },
                                    { label: 'Photos', done: (newListing.images?.length || 0) > 0 },
                                    { label: 'Availability', done: Object.keys(newListing.availability || {}).length > 0 },
                                    { label: 'Verification', done: !!newListing.proofOfAddress }
                                ].map((item, idx) => (
                                    <div key={idx} className="flex items-center justify-between text-xs">
                                        <span className={item.done ? 'text-gray-900' : 'text-gray-400'}>{item.label}</span>
                                        {item.done ? (
                                            <CheckCircle size={14} className="text-green-600" />
                                        ) : (
                                            <div className="w-3.5 h-3.5 rounded-full border-2 border-gray-300" />
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Estimated Earnings */}
                        {newListing.price && Object.keys(newListing.availability || {}).length > 0 && (
                            <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4">
                                <h4 className="text-sm font-bold text-gray-900 mb-2 flex items-center gap-2">
                                    <TrendingUp size={14} className="text-green-600" /> Potential Earnings
                                </h4>
                                <div className="space-y-1 text-xs text-gray-700">
                                    <div className="flex justify-between">
                                        <span>Per booking:</span>
                                        <span className="font-bold">${newListing.price}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Available days:</span>
                                        <span className="font-bold">{Object.keys(newListing.availability || {}).length}</span>
                                    </div>
                                    <div className="border-t border-green-200 pt-2 mt-2 flex justify-between">
                                        <span>Est. monthly:</span>
                                        <span className="font-bold text-green-700">${Math.round((newListing.price || 0) * Math.min(Object.keys(newListing.availability || {}).length, 30) * 0.3)}</span>
                                    </div>
                                    <p className="text-[10px] text-gray-500 mt-1">*Based on 30% booking rate</p>
                                </div>
                            </div>
                        )}

                        {/* Quick Jump Links */}
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
                            <h4 className="text-sm font-bold text-gray-900 mb-3">Quick Jump</h4>
                            <div className="space-y-1">
                                {[
                                    { step: 1, label: 'Details', icon: FileText },
                                    { step: 2, label: 'Photos', icon: ImageIcon },
                                    { step: 3, label: 'Availability', icon: CalendarIcon },
                                    { step: 4, label: 'Verification', icon: Shield },
                                    { step: 5, label: 'Review', icon: CheckCircle }
                                ].map((item) => (
                                    <button
                                        key={item.step}
                                        onClick={() => setStep(item.step)}
                                        className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${step === item.step ? 'bg-brand-50 text-brand-700' : 'text-gray-600 hover:bg-gray-50'
                                            }`}
                                    >
                                        <item.icon size={14} />
                                        {item.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="bg-gray-50">
            {/* Sidebar */}
            <aside className="hidden lg:flex lg:flex-col w-64 bg-white border-r border-gray-200 fixed top-16 left-0 bottom-0 z-40">
                <div className="p-6 border-b border-gray-200 flex-shrink-0">
                    <h2 className="text-lg font-bold text-gray-900">Host Dashboard</h2>
                    <p className="text-xs text-gray-500 mt-1">Manage your spaces</p>
                </div>
                <nav className="flex-1 p-4 space-y-1 overflow-y-auto min-h-0">
                    <button onClick={() => setView('overview')} className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${view === 'overview' ? 'bg-brand-50 text-brand-700' : 'text-gray-700 hover:bg-gray-50'}`}>
                        <Home size={18} />
                        Overview
                    </button>
                    <button onClick={() => setView('listings')} className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${view === 'listings' ? 'bg-brand-50 text-brand-700' : 'text-gray-700 hover:bg-gray-50'}`}>
                        <Briefcase size={18} />
                        Listings
                        {myListings.filter(l => l.status === ListingStatus.PENDING_APPROVAL).length > 0 && (
                            <span className="ml-auto bg-orange-100 text-orange-700 text-xs font-bold px-2 py-0.5 rounded-full">
                                {myListings.filter(l => l.status === ListingStatus.PENDING_APPROVAL).length}
                            </span>
                        )}
                    </button>
                    <button onClick={() => setView('bookings')} className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${view === 'bookings' ? 'bg-brand-50 text-brand-700' : 'text-gray-700 hover:bg-gray-50'}`}>
                        <FileText size={18} />
                        Bookings
                        {hostBookings.filter(b => b.status === 'Pending').length > 0 && (
                            <span className="ml-auto bg-orange-100 text-orange-700 text-xs font-bold px-2 py-0.5 rounded-full">
                                {hostBookings.filter(b => b.status === 'Pending').length}
                            </span>
                        )}
                    </button>
                    <button onClick={() => setView('earnings')} className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${view === 'earnings' ? 'bg-brand-50 text-brand-700' : 'text-gray-700 hover:bg-gray-50'}`}>
                        <TrendingUp size={18} />
                        Earnings
                    </button>
                    <button onClick={() => setView('payouts')} className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${view === 'payouts' ? 'bg-brand-50 text-brand-700' : 'text-gray-700 hover:bg-gray-50'}`}>
                        <DollarSign size={18} />
                        Payouts
                    </button>
                    <button onClick={() => setView('messages')} className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${view === 'messages' ? 'bg-brand-50 text-brand-700' : 'text-gray-700 hover:bg-gray-50'}`}>
                        <MessageSquare size={18} />
                        Messages
                    </button>
                </nav>
                <div className="p-4 space-y-1 border-t border-gray-100 flex-shrink-0">
                    <button onClick={handleStartNewListing} className="w-full bg-brand-600 text-white px-4 py-2.5 rounded-lg font-semibold flex items-center justify-center gap-2 hover:bg-brand-700 transition shadow-sm mb-2">
                        <Plus size={18} /> New Listing
                    </button>
                    <button onClick={() => setView('settings')} className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${view === 'settings' ? 'bg-brand-50 text-brand-700' : 'text-gray-700 hover:bg-gray-50'}`}>
                        <Settings size={18} />
                        Settings
                    </button>
                    <button onClick={() => setView('notifications')} className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${view === 'notifications' ? 'bg-brand-50 text-brand-700' : 'text-gray-700 hover:bg-gray-50'}`}>
                        <AlertCircle size={18} />
                        Notifications
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <div className="min-h-screen lg:ml-64">
                {/* Mobile Header */}
                <div className="lg:hidden bg-white border-b border-gray-200 p-4">
                    <h1 className="text-xl font-bold text-gray-900">Host Dashboard</h1>
                    <div className="flex gap-2 mt-3 overflow-x-auto no-scrollbar">
                        <button onClick={() => setView('overview')} className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all duration-200 hover:scale-105 active:scale-95 ${view === 'overview' ? 'bg-brand-600 text-white' : 'bg-gray-100 text-gray-700'}`}>Overview</button>
                        <button onClick={() => setView('listings')} className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all duration-200 hover:scale-105 active:scale-95 ${view === 'listings' ? 'bg-brand-600 text-white' : 'bg-gray-100 text-gray-700'}`}>Listings</button>
                        <button onClick={() => setView('bookings')} className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all duration-200 hover:scale-105 active:scale-95 ${view === 'bookings' ? 'bg-brand-600 text-white' : 'bg-gray-100 text-gray-700'}`}>Bookings</button>
                        <button onClick={() => setView('earnings')} className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all duration-200 hover:scale-105 active:scale-95 ${view === 'earnings' ? 'bg-brand-600 text-white' : 'bg-gray-100 text-gray-700'}`}>Earnings</button>
                        <button onClick={() => setView('messages')} className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all duration-200 hover:scale-105 active:scale-95 ${view === 'messages' ? 'bg-brand-600 text-white' : 'bg-gray-100 text-gray-700'}`}>Messages</button>
                    </div>
                </div>

                {/* Floating Create Button (Mobile Only) */}
                {view !== 'create' && (
                    <button
                        onClick={handleStartNewListing}
                        className="lg:hidden fixed bottom-6 right-6 z-50 w-14 h-14 bg-brand-600 text-white rounded-full shadow-2xl flex items-center justify-center hover:bg-brand-700 transition-all active:scale-95"
                        aria-label="Create new listing"
                    >
                        <Plus size={24} />
                    </button>
                )}

                {/* Content Area */}
                <main className="flex-1 overflow-y-auto">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">

                        {view === 'messages' && (
                            <div className="space-y-4 animate-in fade-in">
                                {/* Messages Header */}
                                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
                                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                        <div>
                                            <h2 className="text-xl font-bold text-gray-900">Messages</h2>
                                            <p className="text-sm text-gray-500 mt-1">Chat with your guests</p>
                                        </div>
                                        <div className="flex items-center gap-2 w-full sm:w-auto">
                                            <div className="relative flex-1 sm:flex-none sm:w-64">
                                                <input
                                                    type="text"
                                                    placeholder="Search conversations..."
                                                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                                                />
                                                <MessageSquare size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Messages Container */}
                                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                                    <div className="flex h-[600px]">
                                        {/* Conversation List */}
                                        <div className="w-full md:w-2/5 lg:w-1/3 border-r border-gray-200 flex flex-col">
                                            <div className="p-4 border-b border-gray-200 bg-gray-50">
                                                <h3 className="font-bold text-gray-900 text-sm">Conversations</h3>
                                                <p className="text-xs text-gray-500 mt-1">{getConversations(user.id).filter(c => c.participants.includes(user.id)).length} active</p>
                                            </div>
                                            <div className="flex-1 overflow-y-auto">
                                                <ChatList
                                                    currentUserId={user.id}
                                                    selectedId={selectedConversationId}
                                                    onSelect={setSelectedConversationId}
                                                />
                                            </div>
                                        </div>

                                        {/* Chat Window */}
                                        <div className="hidden md:flex md:w-3/5 lg:w-2/3 flex-col">
                                            {selectedConversationId ? (
                                                <ChatWindow
                                                    conversationId={selectedConversationId}
                                                    currentUserId={user.id}
                                                />
                                            ) : (
                                                <div className="flex flex-col items-center justify-center h-full bg-gray-50">
                                                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                                        <MessageSquare size={32} className="text-gray-400" />
                                                    </div>
                                                    <h3 className="font-bold text-gray-900 mb-2">No conversation selected</h3>
                                                    <p className="text-sm text-gray-500 max-w-xs text-center">Choose a conversation from the list to start chatting with your guests</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Quick Stats */}
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                                <MessageSquare size={20} className="text-blue-700" />
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500 font-medium">Total Conversations</p>
                                                <p className="text-lg font-bold text-gray-900">{getConversations(user.id).filter(c => c.participants.includes(user.id)).length}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                                <CheckCircle size={20} className="text-green-700" />
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500 font-medium">Unread Messages</p>
                                                <p className="text-lg font-bold text-gray-900">{getConversations(user.id).filter(c => c.participants.includes(user.id) && c.unreadCount && c.unreadCount > 0).length}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                                                <Clock size={20} className="text-purple-700" />
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500 font-medium">Avg Response Time</p>
                                                <p className="text-lg font-bold text-gray-900">&lt; 1h</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Settings View */}
                        {view === 'settings' && (
                            <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
                                <SettingsPage user={user} />
                            </div>
                        )}

                        {/* Notifications View */}
                        {view === 'notifications' && (
                            <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
                                <NotificationsPage userId={user.id} />
                            </div>
                        )}

                        <div>
                            {view === 'overview' && (
                                <div className="space-y-6 animate-in fade-in">
                                    {/* Stats Grid */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                                            <div className="flex items-center justify-between mb-3">
                                                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Earnings</h3>
                                                <div className="bg-green-100 p-2 rounded-lg text-green-700">
                                                    <DollarSign size={18} />
                                                </div>
                                            </div>
                                            <p className="text-2xl font-bold text-gray-900">${user.walletBalance.toLocaleString()}</p>
                                            <p className="text-xs text-green-600 font-medium mt-1 flex items-center gap-1">
                                                <TrendingUp size={12} /> +12% from last month
                                            </p>
                                        </div>
                                        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                                            <div className="flex items-center justify-between mb-3">
                                                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Active Listings</h3>
                                                <div className="bg-blue-100 p-2 rounded-lg text-blue-700">
                                                    <Home size={18} />
                                                </div>
                                            </div>
                                            <p className="text-2xl font-bold text-gray-900">{myListings.filter(l => l.status === ListingStatus.LIVE).length}</p>
                                            <p className="text-xs text-gray-500 mt-1">{myListings.length} total listings</p>
                                        </div>
                                        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                                            <div className="flex items-center justify-between mb-3">
                                                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">This Month</h3>
                                                <div className="bg-purple-100 p-2 rounded-lg text-purple-700">
                                                    <CalendarIcon size={18} />
                                                </div>
                                            </div>
                                            <p className="text-2xl font-bold text-gray-900">{hostBookings.filter(b => b.status === 'Confirmed' || b.status === 'Completed').length}</p>
                                            <p className="text-xs text-gray-500 mt-1">Bookings completed</p>
                                        </div>
                                        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                                            <div className="flex items-center justify-between mb-3">
                                                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Pending</h3>
                                                <div className="bg-orange-100 p-2 rounded-lg text-orange-700">
                                                    <Clock size={18} />
                                                </div>
                                            </div>
                                            <p className="text-2xl font-bold text-gray-900">{hostBookings.filter(b => b.status === 'Pending').length}</p>
                                            <p className="text-xs text-orange-600 font-medium mt-1">Requires action</p>
                                        </div>
                                    </div>

                                    {/* Quick Actions */}
                                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                                        <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                                            <Sparkles size={18} className="text-brand-600" /> Quick Actions
                                        </h3>
                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                            <button onClick={handleStartNewListing} className="flex flex-col items-center gap-2 p-4 rounded-lg border border-gray-200 hover:border-brand-500 hover:bg-brand-50 transition-all group">
                                                <div className="w-10 h-10 rounded-full bg-gray-100 group-hover:bg-brand-100 flex items-center justify-center transition-colors">
                                                    <Plus size={20} className="text-gray-600 group-hover:text-brand-600" />
                                                </div>
                                                <span className="text-xs font-medium text-gray-700 group-hover:text-brand-700">New Listing</span>
                                            </button>
                                            <button onClick={() => setView('bookings')} className="flex flex-col items-center gap-2 p-4 rounded-lg border border-gray-200 hover:border-brand-500 hover:bg-brand-50 transition-all group">
                                                <div className="w-10 h-10 rounded-full bg-gray-100 group-hover:bg-brand-100 flex items-center justify-center transition-colors">
                                                    <FileText size={20} className="text-gray-600 group-hover:text-brand-600" />
                                                </div>
                                                <span className="text-xs font-medium text-gray-700 group-hover:text-brand-700">View Bookings</span>
                                            </button>
                                            <button onClick={() => setView('earnings')} className="flex flex-col items-center gap-2 p-4 rounded-lg border border-gray-200 hover:border-brand-500 hover:bg-brand-50 transition-all group">
                                                <div className="w-10 h-10 rounded-full bg-gray-100 group-hover:bg-brand-100 flex items-center justify-center transition-colors">
                                                    <TrendingUp size={20} className="text-gray-600 group-hover:text-brand-600" />
                                                </div>
                                                <span className="text-xs font-medium text-gray-700 group-hover:text-brand-700">Earnings</span>
                                            </button>
                                            <button onClick={() => setView('messages')} className="flex flex-col items-center gap-2 p-4 rounded-lg border border-gray-200 hover:border-brand-500 hover:bg-brand-50 transition-all group">
                                                <div className="w-10 h-10 rounded-full bg-gray-100 group-hover:bg-brand-100 flex items-center justify-center transition-colors">
                                                    <MessageSquare size={20} className="text-gray-600 group-hover:text-brand-600" />
                                                </div>
                                                <span className="text-xs font-medium text-gray-700 group-hover:text-brand-700">Messages</span>
                                            </button>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                        {/* Revenue Chart */}
                                        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                                            <div className="flex items-center justify-between mb-6">
                                                <h3 className="font-bold text-gray-900">Revenue Overview</h3>
                                                <select className="text-xs border border-gray-200 rounded-lg px-3 py-1.5 bg-white text-gray-600 font-medium">
                                                    <option>Last 7 days</option>
                                                    <option>Last 30 days</option>
                                                    <option>Last 3 months</option>
                                                </select>
                                            </div>
                                            <div className="h-64 w-full">
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <BarChart data={bookingData}>
                                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} dy={10} />
                                                        <YAxis axisLine={false} tickLine={false} tickFormatter={(val) => `$${val}`} tick={{ fontSize: 12, fill: '#9ca3af' }} />
                                                        <Tooltip
                                                            cursor={{ fill: '#f9fafb' }}
                                                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                                            formatter={(val: number) => [`$${val}`, 'Revenue']}
                                                        />
                                                        <Bar dataKey="revenue" fill="#111827" radius={[4, 4, 0, 0]} barSize={40} />
                                                    </BarChart>
                                                </ResponsiveContainer>
                                            </div>
                                        </div>

                                        {/* Recent Activity */}
                                        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                                            <h3 className="font-bold text-gray-900 mb-4">Recent Activity</h3>
                                            <div className="space-y-4">
                                                {hostBookings.slice(0, 5).length > 0 ? (
                                                    hostBookings.slice(0, 5).map((booking, idx) => {
                                                        const listing = myListings.find(l => l.id === booking.listingId);
                                                        return (
                                                            <div key={booking.id} className="flex items-start gap-3 pb-4 border-b border-gray-100 last:border-0 last:pb-0">
                                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${booking.status === 'Confirmed' ? 'bg-green-100 text-green-600' :
                                                                        booking.status === 'Pending' ? 'bg-orange-100 text-orange-600' :
                                                                            'bg-blue-100 text-blue-600'
                                                                    }`}>
                                                                    {booking.status === 'Confirmed' ? <CheckCircle size={16} /> :
                                                                        booking.status === 'Pending' ? <Clock size={16} /> :
                                                                            <FileText size={16} />}
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    <p className="text-sm font-medium text-gray-900 truncate">{listing?.title || 'Unknown'}</p>
                                                                    <p className="text-xs text-gray-500">{new Date(booking.date).toLocaleDateString()}</p>
                                                                    <p className="text-xs font-semibold text-gray-700 mt-0.5">${booking.totalPrice}</p>
                                                                </div>
                                                            </div>
                                                        );
                                                    })
                                                ) : (
                                                    <div className="text-center py-8">
                                                        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2">
                                                            <FileText size={20} className="text-gray-400" />
                                                        </div>
                                                        <p className="text-xs text-gray-500">No recent activity</p>
                                                    </div>
                                                )}
                                            </div>
                                            {hostBookings.length > 5 && (
                                                <button onClick={() => setView('bookings')} className="w-full mt-4 text-xs font-medium text-brand-600 hover:text-brand-700 py-2 border-t border-gray-100">
                                                    View all bookings →
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    {/* Listings Performance */}
                                    {myListings.filter(l => l.status === ListingStatus.LIVE).length > 0 && (
                                        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                                            <h3 className="font-bold text-gray-900 mb-4">Top Performing Listings</h3>
                                            <div className="space-y-3">
                                                {myListings.filter(l => l.status === ListingStatus.LIVE).slice(0, 3).map((listing) => {
                                                    const bookingCount = hostBookings.filter(b => b.listingId === listing.id).length;
                                                    const revenue = hostBookings.filter(b => b.listingId === listing.id).reduce((sum, b) => sum + b.totalPrice, 0);
                                                    return (
                                                        <div key={listing.id} className="flex items-center gap-4 p-3 rounded-lg border border-gray-100 hover:border-gray-200 transition-colors">
                                                            <img src={listing.images[0]} alt="" className="w-16 h-16 rounded-lg object-cover" />
                                                            <div className="flex-1 min-w-0">
                                                                <h4 className="font-medium text-sm text-gray-900 truncate">{listing.title}</h4>
                                                                <p className="text-xs text-gray-500">{listing.location}</p>
                                                            </div>
                                                            <div className="text-right">
                                                                <p className="text-sm font-bold text-gray-900">${revenue}</p>
                                                                <p className="text-xs text-gray-500">{bookingCount} bookings</p>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {view === 'listings' && (
                                <div className="space-y-4 animate-in fade-in">
                                    {myListings.length === 0 ? (
                                        <div className="text-center py-20 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                                <Home size={32} className="text-gray-400" />
                                            </div>
                                            <h3 className="font-bold text-gray-900 text-lg">No listings yet</h3>
                                            <p className="text-gray-500 mb-6 max-w-sm mx-auto">Start earning by listing your apartment, studio, or event space on Fiilar.</p>
                                            <button onClick={handleStartNewListing} className="bg-black text-white px-6 py-2 rounded-lg font-semibold hover:bg-gray-800 transition">Create listing</button>
                                        </div>
                                    ) : (
                                        myListings.map(listing => (
                                            <div key={listing.id} className="bg-white p-4 rounded-xl border border-gray-200 flex flex-col md:flex-row gap-4 items-start md:items-center group hover:border-gray-300 hover:shadow-sm transition-all">
                                                <div className="w-full md:w-32 h-32 md:h-24 rounded-lg bg-gray-100 overflow-hidden shrink-0 relative">
                                                    <img src={listing.images[0]} alt="" className="w-full h-full object-cover" />
                                                    {listing.requiresIdentityVerification && (
                                                        <div className="absolute top-1 left-1 bg-white/90 p-1 rounded-md shadow-sm" title="ID Required">
                                                            <UserCheck size={12} className="text-blue-700" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0 w-full">
                                                    <div className="flex items-center justify-between md:justify-start gap-2 mb-1">
                                                        <h3 className="font-bold text-gray-900 truncate text-lg md:text-base">{listing.title}</h3>
                                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border whitespace-nowrap ${listing.status === ListingStatus.LIVE ? 'bg-green-50 text-green-700 border-green-200' :
                                                            listing.status === ListingStatus.PENDING_APPROVAL ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                                                                listing.status === ListingStatus.REJECTED ? 'bg-red-50 text-red-700 border-red-200' :
                                                                    'bg-gray-100 text-gray-500 border-gray-200'
                                                            }`}>
                                                            {listing.status}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm text-gray-500 truncate mb-2 flex items-center gap-1"><MapPin size={12} /> {listing.location}</p>
                                                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-medium text-gray-600">
                                                        <span className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded"><DollarSign size={12} /> ${listing.price}/{listing.priceUnit === BookingType.HOURLY ? 'hr' : 'day'}</span>
                                                        <span className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded"><Users size={12} /> Max {listing.capacity || 1}</span>
                                                        <span className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded"><Briefcase size={12} /> {listing.type}</span>
                                                    </div>
                                                    {listing.rejectionReason && (
                                                        <div className="mt-3 text-xs bg-red-50 text-red-800 p-2 rounded border border-red-100 flex items-start gap-2">
                                                            <AlertTriangle size={14} className="shrink-0 mt-0.5" />
                                                            <span><strong>Action Required:</strong> {listing.rejectionReason}</span>
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex md:flex-col items-center gap-2 self-end md:self-center w-full md:w-auto mt-2 md:mt-0">
                                                    <button
                                                        onClick={() => handleEditListing(listing)}
                                                        className="flex-1 md:flex-none px-3 py-2 text-gray-600 border border-gray-200 hover:text-black hover:border-black rounded-lg transition-colors flex items-center justify-center gap-2"
                                                    >
                                                        <Edit3 size={16} /> <span className="md:hidden">Edit</span>
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleDeleteListing(listing.id, listing.status);
                                                        }}
                                                        className="flex-1 md:flex-none px-3 py-2 text-red-500 border border-gray-200 hover:text-white hover:bg-red-600 hover:border-red-600 rounded-lg transition-colors flex items-center justify-center gap-2"
                                                    >
                                                        <Trash2 size={16} /> <span className="md:hidden">Delete</span>
                                                    </button>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            )}

                            {view === 'bookings' && (
                                <div className="space-y-4 animate-in fade-in">
                                    {/* Header with Filters */}
                                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
                                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                            <div>
                                                <h2 className="text-xl font-bold text-gray-900">Bookings</h2>
                                                <p className="text-sm text-gray-500 mt-1">Manage your space bookings and payouts</p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => setBookingView('cards')}
                                                    className={`p-2 rounded-lg transition-colors ${bookingView === 'cards' ? 'bg-brand-100 text-brand-700' : 'text-gray-400 hover:bg-gray-100'}`}
                                                    title="Card view"
                                                >
                                                    <Briefcase size={18} />
                                                </button>
                                                <button
                                                    onClick={() => setBookingView('table')}
                                                    className={`p-2 rounded-lg transition-colors ${bookingView === 'table' ? 'bg-brand-100 text-brand-700' : 'text-gray-400 hover:bg-gray-100'}`}
                                                    title="Table view"
                                                >
                                                    <FileText size={18} />
                                                </button>
                                            </div>
                                        </div>

                                        {/* Filter Tabs */}
                                        <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
                                            {[
                                                { key: 'all', label: 'All', count: hostBookings.length },
                                                { key: 'pending', label: 'Pending', count: hostBookings.filter(b => b.status === 'Pending').length },
                                                { key: 'confirmed', label: 'Confirmed', count: hostBookings.filter(b => b.status === 'Confirmed').length },
                                                { key: 'completed', label: 'Completed', count: hostBookings.filter(b => b.status === 'Completed').length }
                                            ].map(filter => (
                                                <button
                                                    key={filter.key}
                                                    onClick={() => setBookingFilter(filter.key as any)}
                                                    className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${bookingFilter === filter.key
                                                            ? 'bg-brand-600 text-white'
                                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                        }`}
                                                >
                                                    {filter.label} {filter.count > 0 && `(${filter.count})`}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {hostBookings.length === 0 ? (
                                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-12 text-center">
                                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                                <FileText size={32} className="text-gray-400" />
                                            </div>
                                            <h3 className="font-bold text-gray-900 text-lg mb-2">No bookings yet</h3>
                                            <p className="text-gray-500 max-w-sm mx-auto">Your bookings will appear here once guests start booking your spaces.</p>
                                        </div>
                                    ) : (
                                        <>
                                            {bookingView === 'cards' ? (
                                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                                    {hostBookings
                                                        .filter(b => bookingFilter === 'all' || b.status.toLowerCase() === bookingFilter)
                                                        .map(booking => {
                                                            const listing = myListings.find(l => l.id === booking.listingId);
                                                            return (
                                                                <div key={booking.id} className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all overflow-hidden">
                                                                    <div className="flex gap-4 p-4">
                                                                        <img src={listing?.images[0]} alt="" className="w-24 h-24 rounded-lg object-cover shrink-0" />
                                                                        <div className="flex-1 min-w-0">
                                                                            <div className="flex items-start justify-between gap-2 mb-2">
                                                                                <h3 className="font-bold text-gray-900 truncate">{listing?.title || 'Unknown'}</h3>
                                                                                <span className={`px-2 py-1 text-xs font-bold rounded-full whitespace-nowrap ${booking.status === 'Confirmed' ? 'bg-green-100 text-green-800' :
                                                                                        booking.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                                                                                            booking.status === 'Completed' ? 'bg-blue-100 text-blue-800' :
                                                                                                'bg-gray-100 text-gray-800'
                                                                                    }`}>
                                                                                    {booking.status}
                                                                                </span>
                                                                            </div>
                                                                            <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                                                                                <MapPin size={10} /> {listing?.location}
                                                                            </p>
                                                                            <p className="text-xs text-gray-600 mb-2 flex items-center gap-1">
                                                                                <CalendarIcon size={10} /> {new Date(booking.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                                                                            </p>
                                                                            <div className="flex items-center gap-3 text-xs">
                                                                                <span className="font-bold text-gray-900">${booking.totalPrice.toFixed(2)}</span>
                                                                                <span className={`px-2 py-0.5 rounded-full font-semibold ${booking.paymentStatus === 'Released' ? 'bg-green-100 text-green-700' :
                                                                                        booking.paymentStatus === 'Refunded' ? 'bg-red-100 text-red-700' :
                                                                                            'bg-blue-100 text-blue-700'
                                                                                    }`}>
                                                                                    {booking.paymentStatus || 'Escrow'}
                                                                                </span>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                    {booking.status === 'Pending' && (
                                                                        <div className="border-t border-gray-100 p-3 bg-gray-50 flex gap-2">
                                                                            <button
                                                                                onClick={() => handleAcceptBooking(booking)}
                                                                                className="flex-1 bg-green-600 text-white px-3 py-2 rounded-lg text-xs font-semibold hover:bg-green-700 transition flex items-center justify-center gap-1"
                                                                            >
                                                                                <CheckCircle size={14} /> Accept
                                                                            </button>
                                                                            <button
                                                                                onClick={() => handleRejectBooking(booking)}
                                                                                className="flex-1 bg-white border border-gray-300 text-gray-700 px-3 py-2 rounded-lg text-xs font-semibold hover:bg-gray-50 transition flex items-center justify-center gap-1"
                                                                            >
                                                                                <X size={14} /> Decline
                                                                            </button>
                                                                        </div>
                                                                    )}
                                                                    {booking.paymentStatus === 'Paid - Escrow' && booking.status === 'Confirmed' && (
                                                                        <div className="border-t border-gray-100 p-3 bg-blue-50">
                                                                            <button
                                                                                onClick={() => handleReleaseFunds(booking.id)}
                                                                                className="w-full bg-brand-600 text-white px-3 py-2 rounded-lg text-xs font-semibold hover:bg-brand-700 transition flex items-center justify-center gap-1"
                                                                            >
                                                                                <DollarSign size={14} /> Release Funds
                                                                            </button>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            );
                                                        })}
                                                </div>
                                            ) : (
                                                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                                                    <div className="overflow-x-auto">
                                                        <table className="w-full">
                                                            <thead className="bg-gray-50 border-b border-gray-200">
                                                                <tr>
                                                                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Guest</th>
                                                                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Property</th>
                                                                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
                                                                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Amount</th>
                                                                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                                                                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Payment</th>
                                                                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Action</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody className="bg-white divide-y divide-gray-200">
                                                                {hostBookings
                                                                    .filter(b => bookingFilter === 'all' || b.status.toLowerCase() === bookingFilter)
                                                                    .map(booking => {
                                                                        const listing = myListings.find(l => l.id === booking.listingId);
                                                                        return (
                                                                            <tr key={booking.id} className="hover:bg-gray-50 transition-colors">
                                                                                <td className="px-6 py-4 whitespace-nowrap">
                                                                                    <div className="text-sm font-medium text-gray-900">{booking.userId}</div>
                                                                                </td>
                                                                                <td className="px-6 py-4">
                                                                                    <div className="text-sm font-medium text-gray-900">{listing?.title || 'Unknown'}</div>
                                                                                    <div className="text-xs text-gray-500">{listing?.location}</div>
                                                                                </td>
                                                                                <td className="px-6 py-4 whitespace-nowrap">
                                                                                    <div className="text-sm text-gray-900">{new Date(booking.date).toLocaleDateString()}</div>
                                                                                    {booking.hours && <div className="text-xs text-gray-500">{booking.hours.length} hours</div>}
                                                                                </td>
                                                                                <td className="px-6 py-4 whitespace-nowrap">
                                                                                    <div className="text-sm font-bold text-gray-900">${booking.totalPrice.toFixed(2)}</div>
                                                                                </td>
                                                                                <td className="px-6 py-4 whitespace-nowrap">
                                                                                    <span className={`px-2 py-1 text-xs font-bold rounded-full ${booking.status === 'Confirmed' ? 'bg-green-100 text-green-800' :
                                                                                        booking.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                                                                                            booking.status === 'Completed' ? 'bg-blue-100 text-blue-800' :
                                                                                                'bg-gray-100 text-gray-800'
                                                                                        }`}>
                                                                                        {booking.status}
                                                                                    </span>
                                                                                </td>
                                                                                <td className="px-6 py-4 whitespace-nowrap">
                                                                                    <span className={`px-2 py-1 text-xs font-bold rounded-full ${booking.paymentStatus === 'Released' ? 'bg-green-100 text-green-800' :
                                                                                        booking.paymentStatus === 'Refunded' ? 'bg-red-100 text-red-800' :
                                                                                            'bg-blue-100 text-blue-800'
                                                                                        }`}>
                                                                                        {booking.paymentStatus || 'Paid - Escrow'}
                                                                                    </span>
                                                                                </td>
                                                                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                                                    {booking.status === 'Pending' && (
                                                                                        <div className="flex gap-2">
                                                                                            <button
                                                                                                onClick={() => handleAcceptBooking(booking)}
                                                                                                className="text-green-600 hover:text-green-700 font-medium flex items-center gap-1"
                                                                                            >
                                                                                                <CheckCircle size={14} /> Accept
                                                                                            </button>
                                                                                            <button
                                                                                                onClick={() => handleRejectBooking(booking)}
                                                                                                className="text-red-600 hover:text-red-700 font-medium flex items-center gap-1"
                                                                                            >
                                                                                                <X size={14} /> Decline
                                                                                            </button>
                                                                                        </div>
                                                                                    )}
                                                                                    {booking.paymentStatus === 'Paid - Escrow' && booking.status === 'Confirmed' && (
                                                                                        <button
                                                                                            onClick={() => handleReleaseFunds(booking.id)}
                                                                                            className="text-brand-600 hover:text-brand-700 font-medium flex items-center gap-1"
                                                                                        >
                                                                                            <DollarSign size={14} /> Release
                                                                                        </button>
                                                                                    )}
                                                                                    {booking.paymentStatus === 'Released' && (
                                                                                        <span className="text-green-600 font-medium">✓ Released</span>
                                                                                    )}
                                                                                </td>
                                                                            </tr>
                                                                        );
                                                                    })}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>
                            )}

                            {view === 'create' && (
                                <>
                                    {renderCreateWizard()}

                                    {/* Floating Auto-save Toast */}
                                    {showSaveToast && (
                                        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-4 fade-in duration-300">
                                            <div className="bg-gray-900 text-white px-4 py-3 rounded-lg shadow-2xl flex items-center gap-3">
                                                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                                                <div className="flex items-center gap-2">
                                                    <CheckCircle size={16} className="text-green-400" />
                                                    <span className="text-sm font-medium">Draft saved automatically</span>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}

                            {view === 'payouts' && (
                                <div className="space-y-6 animate-in fade-in">
                                    {/* Stats Overview */}
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                                            <div className="flex items-center justify-between mb-3">
                                                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Available Balance</h3>
                                                <div className="bg-green-100 p-2 rounded-lg text-green-700">
                                                    <DollarSign size={18} />
                                                </div>
                                            </div>
                                            <p className="text-2xl font-bold text-gray-900">${user.walletBalance.toLocaleString()}</p>
                                            <p className="text-xs text-gray-500 mt-1">Ready to withdraw</p>
                                        </div>
                                        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                                            <div className="flex items-center justify-between mb-3">
                                                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">In Escrow</h3>
                                                <div className="bg-orange-100 p-2 rounded-lg text-orange-700">
                                                    <Clock size={18} />
                                                </div>
                                            </div>
                                            <p className="text-2xl font-bold text-gray-900">${hostBookings.filter(b => b.paymentStatus === 'Paid - Escrow').reduce((sum, b) => sum + (b.totalPrice - b.serviceFee - b.cautionFee), 0).toLocaleString()}</p>
                                            <p className="text-xs text-gray-500 mt-1">Pending release</p>
                                        </div>
                                        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                                            <div className="flex items-center justify-between mb-3">
                                                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Payout Method</h3>
                                                <div className="bg-blue-100 p-2 rounded-lg text-blue-700">
                                                    <ShieldCheck size={18} />
                                                </div>
                                            </div>
                                            <p className="text-lg font-bold text-gray-900">{bankDetails.isVerified ? bankDetails.bankName : 'Not Set'}</p>
                                            <p className="text-xs text-gray-500 mt-1">{bankDetails.isVerified ? `••••${bankDetails.accountNumber.slice(-4)}` : 'Add bank account'}</p>
                                        </div>
                                    </div>

                                    {/* Bank Account Setup */}
                                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                                        <div className="p-6 border-b border-gray-100">
                                            <h2 className="text-xl font-bold text-gray-900">Payout Method</h2>
                                            <p className="text-sm text-gray-500 mt-1">Manage how you receive payments</p>
                                        </div>

                                        <div className="p-6 space-y-6">
                                            <div className="bg-blue-50 p-4 rounded-xl flex items-start gap-3">
                                                <Info className="text-blue-600 shrink-0 mt-0.5" size={20} />
                                                <div>
                                                    <h4 className="text-sm font-bold text-blue-900">How payouts work</h4>
                                                    <p className="text-xs text-blue-700 mt-1">
                                                        Payments are processed securely via Paystack. Funds are released to your bank account 24 hours after the guest checks in.
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Bank Name</label>
                                                    <select
                                                        className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none bg-white"
                                                        value={bankDetails.bankName}
                                                        onChange={(e) => setBankDetails({ ...bankDetails, bankName: e.target.value, isVerified: false })}
                                                        disabled={bankDetails.isVerified}
                                                    >
                                                        <option value="">Select Bank</option>
                                                        <option value="GTBank">Guaranty Trust Bank</option>
                                                        <option value="Zenith">Zenith Bank</option>
                                                        <option value="FirstBank">First Bank of Nigeria</option>
                                                        <option value="UBA">United Bank for Africa</option>
                                                        <option value="Access">Access Bank</option>
                                                        <option value="Kuda">Kuda Microfinance Bank</option>
                                                        <option value="OPay">OPay Digital Services</option>
                                                    </select>
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Account Number</label>
                                                    <input
                                                        type="text"
                                                        maxLength={10}
                                                        className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none"
                                                        placeholder="0123456789"
                                                        value={bankDetails.accountNumber}
                                                        onChange={(e) => setBankDetails({ ...bankDetails, accountNumber: e.target.value.replace(/\D/g, ''), isVerified: false })}
                                                        disabled={bankDetails.isVerified}
                                                    />
                                                </div>
                                            </div>

                                            {bankDetails.isVerified && (
                                                <div className="bg-green-50 border border-green-100 p-4 rounded-xl flex items-center justify-between animate-in fade-in">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                                                            <CheckCircle size={20} />
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-bold text-green-900">{bankDetails.accountName}</p>
                                                            <p className="text-xs text-green-700">Verified Account</p>
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={() => setBankDetails({ ...bankDetails, isVerified: false, accountName: '' })}
                                                        className="text-xs text-gray-500 hover:text-red-600 underline"
                                                    >
                                                        Change
                                                    </button>
                                                </div>
                                            )}

                                            <div className="flex gap-3">
                                                {!bankDetails.isVerified ? (
                                                    <button
                                                        onClick={handleVerifyBank}
                                                        disabled={isVerifyingBank || !bankDetails.accountNumber || !bankDetails.bankName}
                                                        className="flex-1 py-3 bg-brand-600 text-white rounded-xl font-bold hover:bg-brand-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                                    >
                                                        {isVerifyingBank ? <Loader2 size={18} className="animate-spin" /> : <ShieldCheck size={18} />}
                                                        Verify Account
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={handleSaveBankDetails}
                                                        className="flex-1 py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
                                                    >
                                                        <Save size={18} />
                                                        Save Payout Method
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Payout Schedule */}
                                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                                        <div className="p-6 border-b border-gray-100">
                                            <h3 className="font-bold text-gray-900">Upcoming Payouts</h3>
                                            <p className="text-sm text-gray-500 mt-1">Funds releasing in the next 7 days</p>
                                        </div>
                                        <div className="divide-y divide-gray-200">
                                            {hostBookings.filter(b => {
                                                if (!b.escrowReleaseDate || b.paymentStatus !== 'Paid - Escrow') return false;
                                                const releaseDate = new Date(b.escrowReleaseDate);
                                                const sevenDays = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
                                                return releaseDate <= sevenDays;
                                            }).length === 0 ? (
                                                <div className="p-8 text-center text-gray-500">
                                                    <Clock size={32} className="mx-auto mb-2 opacity-20" />
                                                    <p className="text-sm">No upcoming payouts</p>
                                                </div>
                                            ) : (
                                                hostBookings.filter(b => {
                                                    if (!b.escrowReleaseDate || b.paymentStatus !== 'Paid - Escrow') return false;
                                                    const releaseDate = new Date(b.escrowReleaseDate);
                                                    const sevenDays = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
                                                    return releaseDate <= sevenDays;
                                                }).map(booking => {
                                                    const listing = myListings.find(l => l.id === booking.listingId);
                                                    const releaseDate = new Date(booking.escrowReleaseDate!);
                                                    const daysUntil = Math.floor((releaseDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                                                    const payout = booking.totalPrice - booking.serviceFee - booking.cautionFee;
                                                    return (
                                                        <div key={booking.id} className="p-4 hover:bg-gray-50 transition flex items-center gap-4">
                                                            <img src={listing?.images[0]} alt="" className="w-16 h-16 rounded-lg object-cover" />
                                                            <div className="flex-1 min-w-0">
                                                                <p className="font-medium text-gray-900 truncate">{listing?.title}</p>
                                                                <p className="text-sm text-gray-500">{new Date(booking.date).toLocaleDateString()}</p>
                                                            </div>
                                                            <div className="text-right">
                                                                <p className="text-lg font-bold text-gray-900">${payout.toFixed(2)}</p>
                                                                <p className="text-xs font-medium text-brand-600">
                                                                    {daysUntil === 0 ? 'Today' : daysUntil === 1 ? 'Tomorrow' : `In ${daysUntil} days`}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    );
                                                })
                                            )}
                                        </div>
                                    </div>

                                    {/* Payout History */}
                                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                                        <div className="p-6 border-b border-gray-100">
                                            <h3 className="font-bold text-gray-900">Payout History</h3>
                                            <p className="text-sm text-gray-500 mt-1">All completed payouts</p>
                                        </div>
                                        <div className="overflow-x-auto">
                                            <table className="w-full">
                                                <thead className="bg-gray-50 border-b border-gray-200">
                                                    <tr>
                                                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Date</th>
                                                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Amount</th>
                                                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Status</th>
                                                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Reference</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-200">
                                                    {hostTransactions.filter(tx => tx.type === 'HOST_PAYOUT' && tx.toUserId === user.id).length === 0 ? (
                                                        <tr>
                                                            <td colSpan={4} className="px-6 py-8 text-center text-gray-500">No payouts yet</td>
                                                        </tr>
                                                    ) : (
                                                        hostTransactions
                                                            .filter(tx => tx.type === 'HOST_PAYOUT' && tx.toUserId === user.id)
                                                            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                                                            .map(tx => (
                                                                <tr key={tx.id} className="hover:bg-gray-50">
                                                                    <td className="px-6 py-4 text-sm text-gray-600">{new Date(tx.timestamp).toLocaleDateString()}</td>
                                                                    <td className="px-6 py-4 text-sm font-bold text-gray-900">${tx.amount.toFixed(2)}</td>
                                                                    <td className="px-6 py-4">
                                                                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-bold rounded-full">
                                                                            {tx.status}
                                                                        </span>
                                                                    </td>
                                                                    <td className="px-6 py-4 text-xs font-mono text-gray-500">{tx.paystackReference?.slice(0, 20)}...</td>
                                                                </tr>
                                                            ))
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {view === 'earnings' && (
                                <div className="animate-in fade-in">
                                    <HostEarnings
                                        hostBookings={hostBookings}
                                        transactions={hostTransactions}
                                        hostId={user.id}
                                        listings={myListings}
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );

};

export default HostDashboard;
