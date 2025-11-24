import React, { useState, useEffect } from 'react';
import { Listing, ListingStatus, SpaceType, BookingType, ListingAddOn, CancellationPolicy, User, Booking } from '@fiilar/types';
import { saveListing, deleteListing, getBookings } from '../../../services/storage';
import { parseListingDescription } from '../../../services/geminiService';

export const useHostListings = (user: User | null, listings: Listing[], refreshData: () => void, setView: (view: any) => void, onCreateListing?: (l: Listing) => void, onUpdateListing?: (l: Listing) => void) => {
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
        amenities: [],
        cancellationPolicy: CancellationPolicy.MODERATE,
        houseRules: [],
        safetyItems: []
    });

    // AI Auto-Fill State
    const [aiPrompt, setAiPrompt] = useState('');
    const [isAiGenerating, setIsAiGenerating] = useState(false);
    const [showAiInput, setShowAiInput] = useState(true);

    // Add-On Input State
    const [tempAddOn, setTempAddOn] = useState<{ name: string; price: string; description: string; image?: string }>({ name: '', price: '', description: '', image: '' });
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

    const [isEditingUpload, setIsEditingUpload] = useState(false);
    const [step, setStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [lastSaved, setLastSaved] = useState<Date | null>(null);
    const [draggedImageIndex, setDraggedImageIndex] = useState<number | null>(null);
    const [showSaveToast, setShowSaveToast] = useState(false);

    // Auto-save draft
    useEffect(() => {
        if (!user) return;
        // Skip if listing is completely empty
        if (!newListing.title && !newListing.description && !newListing.location) return;

        const interval = setInterval(() => {
            const draftKey = `listing_draft_${user.id}_temp`;
            localStorage.setItem(draftKey, JSON.stringify({ ...newListing, step }));
            setLastSaved(new Date());
            setShowSaveToast(true);
            setTimeout(() => setShowSaveToast(false), 3000);
        }, 30000);

        return () => clearInterval(interval);
    }, [newListing, step, user]);

    const handleStartNewListing = () => {
        if (!user) return;
        if (!user.emailVerified && !user.phoneVerified) {
            alert("Please verify your email address or phone number before creating a listing.");
            return;
        }

        const draftKey = `listing_draft_${user.id}_temp`;
        const savedDraft = localStorage.getItem(draftKey);

        if (savedDraft) {
            const shouldRestore = window.confirm("You have an unsaved draft. Would you like to continue where you left off?");
            if (shouldRestore) {
                const draft = JSON.parse(savedDraft);
                setNewListing(draft);
                setStep(draft.step || 1);
                setShowAiInput(false);
                setShowAiInput(false);
                setView('create');
                return true; // Signal to switch view
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
            amenities: [],
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
        setShowSaveToast(false);
        setView('create');
        return true;
    };

    const handleEditListing = (listing: Listing) => {
        if (!user) return;
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
            amenities: listing.amenities || [],
            cancellationPolicy: listing.cancellationPolicy || CancellationPolicy.MODERATE,
            houseRules: listing.houseRules || [],
            safetyItems: listing.safetyItems || []
        });

        setShowAiInput(false);
        setIsEditingUpload(false);
        setStep(1);
        setStep(1);
        setView('create');
        return true;
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
            setShowAiInput(false);
        } catch (e) {
            console.error(e);
            alert("Could not auto-fill listing. Please fill manually.");
        } finally {
            setIsAiGenerating(false);
        }
    };

    const handleDeleteListing = (id: string, status: ListingStatus) => {
        const allBookings = getBookings();
        const hasActiveBookings = allBookings.some(b =>
            b.listingId === id &&
            (b.status === 'Confirmed' || b.status === 'Pending') &&
            new Date(b.date) >= new Date(new Date().setHours(0, 0, 0, 0))
        );

        if (hasActiveBookings) {
            alert("Unable to delete: This listing has active upcoming bookings. Please cancel all bookings associated with this listing first.");
            return;
        }

        let confirmMsg = "Are you sure you want to permanently delete this listing?";
        if (status === ListingStatus.LIVE) {
            confirmMsg = "Warning: This listing is LIVE. Deleting it will immediately remove it from the marketplace. This action cannot be undone. Are you sure?";
        } else if ((status as unknown as string) === ListingStatus.PENDING_APPROVAL) {
            confirmMsg = "This listing is pending approval. Deleting it will cancel the review process. Continue?";
        } else if (status === ListingStatus.DRAFT) {
            confirmMsg = "Discard this draft listing?";
        }

        if (window.confirm(confirmMsg)) {
            deleteListing(id);
            refreshData();
            alert("Listing deleted successfully.");
        }
    };

    const handleAddAddOn = () => {
        if (!tempAddOn.name || !tempAddOn.price) return;
        const newAddOn: ListingAddOn = {
            id: Math.random().toString(36).substr(2, 9),
            name: tempAddOn.name,
            price: parseFloat(tempAddOn.price),
            description: tempAddOn.description,
            image: tempAddOn.image
        };
        setNewListing(prev => ({
            ...prev,
            addOns: [...(prev.addOns || []), newAddOn]
        }));
        setTempAddOn({ name: '', price: '', description: '', image: '' });
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

    const formatDate = (date: Date) => {
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const d = String(date.getDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
    };

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
        if (!user) return;
        if (!newListing.title) {
            alert("Please enter a title for your listing before saving.");
            return;
        }

        setIsSubmitting(true);
        const draftKey = `listing_draft_${user.id}_temp`;
        localStorage.removeItem(draftKey);

        setTimeout(() => {
            try {
                const existingId = (newListing as any).id;
                const originalListing = listings.find(l => l.id === existingId);
                const isReadyForApproval = user.kycVerified && newListing.proofOfAddress && newListing.price;
                const listingId = existingId || Math.random().toString(36).substr(2, 9);

                let finalStatus = ListingStatus.DRAFT;
                let finalRejectionReason = newListing.rejectionReason;

                if (originalListing && originalListing.status === ListingStatus.LIVE) {
                    finalStatus = ListingStatus.LIVE;
                    finalRejectionReason = undefined;
                } else if (originalListing && originalListing.status === ListingStatus.REJECTED) {
                    finalStatus = isReadyForApproval ? ListingStatus.LIVE : ListingStatus.DRAFT;
                } else if (isReadyForApproval) {
                    finalStatus = ListingStatus.LIVE;
                }

                let finalAvailability = newListing.availability;
                if (!finalAvailability || Object.keys(finalAvailability).length === 0) {
                    finalAvailability = generateAvailabilityMap(weeklySchedule);
                }

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
                    amenities: newListing.amenities || [],
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

                if (typeof refreshData === 'function') {
                    refreshData();
                }

                try {
                    window.dispatchEvent(new CustomEvent('fiilar:listings-updated', { detail: { listing } }));
                } catch (e) {
                    // Ignore
                }

                // Show success message
                const statusMessage = finalStatus === ListingStatus.DRAFT
                    ? 'Draft saved successfully!'
                    : (finalStatus as unknown as string) === ListingStatus.PENDING_APPROVAL
                        ? 'Listing submitted for approval!'
                        : isNew ? 'Listing published successfully!' : 'Listing updated successfully!';
                alert(statusMessage);

                // Reset form and return to listings view
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
                    amenities: [],
                    cancellationPolicy: CancellationPolicy.MODERATE,
                    houseRules: [],
                    safetyItems: []
                });
                setStep(1);
                setLastSaved(null);
                setView('listings'); // Return to listings view instead of staying in wizard
                return true; // Signal success
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
            setIsEditingUpload(false);
        }
    };

    const removeImage = (index: number) => {
        setNewListing(prev => ({
            ...prev,
            images: (prev.images || []).filter((_, i) => i !== index)
        }));
    };

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

    const blockEntireDay = (dateStr: string) => {
        const hasBooking = activeBookings.some(b => b.date === dateStr);
        if (hasBooking) {
            const confirmBlock = window.confirm("Warning: You have active bookings on this date. Blocking it will require cancelling them manually. Continue?");
            if (!confirmBlock) return;
        }

        const newAvailability = { ...newListing.availability };
        delete newAvailability[dateStr];
        setNewListing({ ...newListing, availability: newAvailability });
    };

    const fillStandardHours = (dateStr: string) => {
        const newAvailability = { ...newListing.availability };
        newAvailability[dateStr] = [9, 10, 11, 12, 13, 14, 15, 16, 17];
        setNewListing({ ...newListing, availability: newAvailability });
    };

    const handleDateClick = (dateStr: string) => {
        if (newListing.priceUnit === BookingType.DAILY) {
            const isOpen = !!newListing.availability?.[dateStr];
            if (isOpen) {
                blockEntireDay(dateStr);
            } else {
                fillStandardHours(dateStr);
            }
        } else {
            setSelectedCalendarDate(dateStr);
        }
    };

    const getPreviousProofs = () => {
        return listings.filter(l => l.hostId === user?.id).reduce((acc, curr) => {
            if (curr.proofOfAddress && !acc.find(p => p.url === curr.proofOfAddress)) {
                acc.push({ url: curr.proofOfAddress, location: curr.location, title: curr.title });
            }
            return acc;
        }, [] as { url: string, location: string, title: string }[]);
    };

    return {
        newListing, setNewListing,
        aiPrompt, setAiPrompt,
        isAiGenerating,
        showAiInput, setShowAiInput,
        tempAddOn, setTempAddOn,
        tempRule, setTempRule,
        customSafety, setCustomSafety,
        availTab, setAvailTab,
        weeklySchedule, setWeeklySchedule,
        currentMonth, setCurrentMonth,
        selectedCalendarDate, setSelectedCalendarDate,
        activeBookings, setActiveBookings,
        isEditingUpload, setIsEditingUpload,
        step, setStep,
        isSubmitting,
        lastSaved,
        draggedImageIndex,
        showSaveToast,
        handleStartNewListing,
        handleEditListing,
        handleAiAutoFill,
        handleDeleteListing,
        handleAddAddOn,
        handleRemoveAddOn,
        handleAddRule,
        handleRemoveRule,
        toggleSafetyItem,
        handleAddCustomSafety,
        handleCreateListing,
        handleImageUpload,
        handleImageDragStart,
        handleImageDragOver,
        handleImageDragEnd,
        handleProofUpload,
        removeImage,
        applyWeeklySchedule,
        toggleDaySchedule,
        updateDayTime,
        toggleHourOverride,
        handleDateClick,
        getPreviousProofs,
        formatDate,
        getDaysInMonth: (date: Date) => {
            const year = date.getFullYear();
            const month = date.getMonth();
            const days = [];
            const firstDay = new Date(year, month, 1);
            const lastDay = new Date(year, month + 1, 0);
            for (let i = 0; i < firstDay.getDay(); i++) days.push(null);
            for (let i = 1; i <= lastDay.getDate(); i++) days.push(new Date(year, month, i));
            return days;
        }
    };
};
