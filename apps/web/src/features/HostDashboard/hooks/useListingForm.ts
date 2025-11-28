import React, { useState, useEffect } from 'react';
import { useToast } from '@fiilar/ui';
import { Listing, ListingStatus, SpaceType, BookingType, ListingAddOn, CancellationPolicy, User, Booking, PricingModel } from '@fiilar/types';
import { saveListing } from '@fiilar/storage';

/**
 * Safely saves data to localStorage with error handling for quota exceeded
 * Excludes large data like images to prevent quota issues
 */
const safeLocalStorageSave = (key: string, data: Partial<Listing> & { step?: number; savedAt?: string }): boolean => {
    try {
        // First, try to save the FULL data including images
        localStorage.setItem(key, JSON.stringify(data));
        return true;
    } catch (error) {
        // If quota exceeded, try to save without images
        if (error instanceof DOMException && error.name === 'QuotaExceededError') {
            console.warn('localStorage quota exceeded, attempting to save without images...');

            try {
                // Create a lightweight version without images
                const lightData = {
                    ...data,
                    // Store image count instead of actual images to indicate they exist
                    images: undefined,
                    imageCount: data.images?.length || 0,
                    // Also exclude proof of address document (can be large base64)
                    proofOfAddress: data.proofOfAddress ? '[document_uploaded]' : undefined,
                };

                // Try to clean up old drafts first
                cleanupOldDrafts();

                localStorage.setItem(key, JSON.stringify(lightData));
                return true;
            } catch (retryError) {
                console.error('Failed to save lightweight draft:', retryError);

                // Last resort: minimal data
                try {
                    const minimalData = {
                        title: data.title,
                        description: data.description,
                        type: data.type,
                        price: data.price,
                        location: data.location,
                        step: data.step,
                        savedAt: data.savedAt,
                    };
                    localStorage.setItem(key, JSON.stringify(minimalData));
                    return true;
                } catch {
                    return false;
                }
            }
        }
        console.error('Failed to save to localStorage:', error);
        return false;
    }
};

/**
 * Cleans up old listing drafts from localStorage
 */
const cleanupOldDrafts = () => {
    const keysToRemove: string[] = [];
    const now = Date.now();
    const ONE_WEEK = 7 * 24 * 60 * 60 * 1000;

    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('listing_draft_')) {
            try {
                const data = JSON.parse(localStorage.getItem(key) || '{}');
                const savedAt = data.savedAt ? new Date(data.savedAt).getTime() : 0;
                // Remove drafts older than a week
                if (now - savedAt > ONE_WEEK) {
                    keysToRemove.push(key);
                }
            } catch {
                // Invalid JSON, remove it
                keysToRemove.push(key);
            }
        }
    }

    keysToRemove.forEach(key => {
        localStorage.removeItem(key);
        console.log(`Cleaned up old draft: ${key}`);
    });

    // If still need more space, remove the oldest drafts
    if (keysToRemove.length === 0) {
        const drafts: { key: string; savedAt: number }[] = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith('listing_draft_')) {
                try {
                    const data = JSON.parse(localStorage.getItem(key) || '{}');
                    drafts.push({ key, savedAt: data.savedAt ? new Date(data.savedAt).getTime() : 0 });
                } catch {
                    localStorage.removeItem(key!);
                }
            }
        }
        // Sort by date and remove oldest half
        drafts.sort((a, b) => a.savedAt - b.savedAt);
        const toRemove = drafts.slice(0, Math.ceil(drafts.length / 2));
        toRemove.forEach(d => localStorage.removeItem(d.key));
    }
};

export const useListingForm = (user: User | null, listings: Listing[], activeBookings: Booking[], editingListing: Listing | null, refreshData: () => void, setView: (view: any) => void, onCreateListing?: (l: Listing) => void, onUpdateListing?: (l: Listing) => void) => {
    const toast = useToast();
    // Listings Form State
    const [newListing, setNewListing] = useState<Partial<Listing>>({
        type: SpaceType.APARTMENT,
        priceUnit: BookingType.DAILY,
        pricingModel: PricingModel.DAILY, // Default pricing model
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
    const [tempAddOn, setTempAddOn] = useState<{ id?: string; name: string; price: string; description: string; image?: string }>({ name: '', price: '', description: '', image: '' });
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


    const [isEditingUpload, setIsEditingUpload] = useState(false);
    const [step, setStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [lastSaved, setLastSaved] = useState<Date | null>(null);
    const [draggedImageIndex, setDraggedImageIndex] = useState<number | null>(null);

    // Confirmation Dialog States
    const [draftRestoreDialog, setDraftRestoreDialog] = useState<{
        isOpen: boolean;
        draftData: any | null;
    }>({ isOpen: false, draftData: null });

    const [blockDateDialog, setBlockDateDialog] = useState<{
        isOpen: boolean;
        dateStr: string | null;
    }>({ isOpen: false, dateStr: null });

    // Initialize form (Edit Mode or Draft)
    useEffect(() => {
        if (!user) return;

        if (editingListing) {
            // Edit Mode - check for local draft for non-live listings
            if (editingListing.status !== ListingStatus.LIVE) {
                // For non-live listings, check if there's a local draft saved
                const draftKey = `listing_draft_${user.id}_${editingListing.id}`;
                const savedDraft = localStorage.getItem(draftKey);

                if (savedDraft) {
                    try {
                        const draft = JSON.parse(savedDraft);
                        // If we have unsaved local changes, ask user which version to use
                        if (draft.savedAt) {
                            setDraftRestoreDialog({ isOpen: true, draftData: { ...draft, isEditDraft: true, listingId: editingListing.id } });
                            return;
                        }
                    } catch (e) {
                        // Invalid draft data, ignore
                    }
                }
                // Set lastSaved to indicate form is loaded (not "saving..." on load)
                setLastSaved(new Date());
            }
            handleEditListing(editingListing);
        } else {
            // Create Mode - Check for draft
            const draftKey = `listing_draft_${user.id}_temp`;
            const savedDraft = localStorage.getItem(draftKey);

            if (savedDraft) {
                try {
                    const draft = JSON.parse(savedDraft);
                    setDraftRestoreDialog({ isOpen: true, draftData: draft });
                } catch (e) {
                    // Invalid draft data, ignore
                    localStorage.removeItem(draftKey);
                }
            }
        }
    }, [editingListing, user]);

    // Auto-save draft with debounce (saves 2 seconds after last change)
    // Allow auto-save for: new listings OR editing draft/rejected listings (any non-live listing can be edited)
    const shouldAutoSave = !editingListing ||
        editingListing.status === ListingStatus.DRAFT ||
        editingListing.status === ListingStatus.REJECTED ||
        editingListing.status === ListingStatus.PENDING_APPROVAL ||
        editingListing.status === ListingStatus.PENDING_KYC;

    useEffect(() => {
        if (!user) return;
        if (!shouldAutoSave) return; // Don't auto-save if editing live listing
        // Skip if listing is completely empty
        if (!newListing.title && !newListing.description && !newListing.location && (!newListing.images || newListing.images.length === 0)) return;

        const timeoutId = setTimeout(() => {
            const draftKey = editingListing
                ? `listing_draft_${user.id}_${editingListing.id}` // Use listing ID for existing drafts
                : `listing_draft_${user.id}_temp`; // Use temp key for new listings
            const draftData = {
                ...newListing,
                step,
                savedAt: new Date().toISOString()
            };
            try {
                localStorage.setItem(draftKey, JSON.stringify(draftData));
                setLastSaved(new Date());
            } catch (e) {
                console.error('Auto-save failed:', e);
            }
        }, 2000);

        return () => clearTimeout(timeoutId);
    }, [newListing, step, user, shouldAutoSave, editingListing]);

    // Track unsaved changes for non-auto-saved listings (e.g. LIVE)
    const isFirstRender = React.useRef(true);
    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }
        // If not auto-saving, mark as unsaved (null) whenever form changes
        if (!shouldAutoSave) {
            setLastSaved(null);
        }
    }, [newListing, shouldAutoSave]);

    // Periodic backup save every 10 seconds (in case debounce missed something)
    useEffect(() => {
        if (!user || !shouldAutoSave) return;
        if (!newListing.title && !newListing.description && !newListing.location && (!newListing.images || newListing.images.length === 0)) return;

        const interval = setInterval(() => {
            const draftKey = editingListing
                ? `listing_draft_${user.id}_${editingListing.id}`
                : `listing_draft_${user.id}_temp`;
            const saved = safeLocalStorageSave(draftKey, { ...newListing, step, savedAt: new Date().toISOString() });
            if (saved) {
                setLastSaved(new Date());
            }
        }, 10000);

        return () => clearInterval(interval);
    }, [newListing, step, user, shouldAutoSave, editingListing]);



    const handleEditListing = (listing: Listing) => {
        setNewListing(listing);
        // Initialize schedule from listing availability if possible, or keep default
        // This is complex because availability is date-based, not weekly-based in the final object
        // So we might just keep the default weekly schedule or try to infer it.
        // For now, we keep the default weekly schedule state but the listing has its availability.
    };

    const handleAiAutoFill = async () => {
        if (!aiPrompt.trim()) return;

        setIsAiGenerating(true);
        try {
            // Simulate AI generation with a timeout
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Mock AI response based on prompt
            const mockResponse = {
                title: `Charming Space near ${aiPrompt.includes('beach') ? 'the Beach' : 'City Center'}`,
                description: `Experience the best of local living in this ${aiPrompt}. Perfectly located for exploring the area.`,
                price: 15000,
                location: 'Lagos, Nigeria',
                capacity: 2,
                tags: ['Cozy', 'Modern', 'Central'],
                houseRules: ['No smoking', 'No parties'],
                safetyItems: ['Smoke Alarm', 'Fire Extinguisher']
            };

            // Merge with existing state
            setNewListing(prev => ({
                ...prev,
                ...mockResponse,
                // Only override if empty
                title: prev.title || mockResponse.title,
                description: prev.description || mockResponse.description,
                price: prev.price || mockResponse.price,
                location: prev.location || mockResponse.location,
                capacity: prev.capacity || mockResponse.capacity,
                tags: prev.tags || mockResponse.tags,
                houseRules: prev.houseRules || mockResponse.houseRules,
                safetyItems: prev.safetyItems || mockResponse.safetyItems
            }));
            setShowAiInput(false);
        } catch (e) {
            console.error(e);
            toast.showToast({ message: "Could not auto-fill listing. Please fill manually.", type: "info" });
        } finally {
            setIsAiGenerating(false);
        }
    };

    const handleAddAddOn = () => {
        if (!tempAddOn.name || !tempAddOn.price) return;

        if (tempAddOn.id) {
            // Edit existing
            setNewListing(prev => ({
                ...prev,
                addOns: (prev.addOns || []).map(a => a.id === tempAddOn.id ? {
                    ...a,
                    name: tempAddOn.name,
                    price: parseFloat(tempAddOn.price),
                    description: tempAddOn.description,
                    image: tempAddOn.image
                } : a)
            }));
        } else {
            // Add new
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
        }

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

    // Validation rules - based on industry standards (Airbnb, Peerspace)
    const VALIDATION_RULES = {
        CAUTION_FEE_MAX_RATIO: 2, // Security deposit up to 2x base price
        EXTRA_GUEST_MAX_RATIO: 1, // Extra guest cost should not exceed base price
        MIN_PRICE: 1,
        MIN_CAPACITY: 1,
        MAX_TITLE_LENGTH: 100,
    };

    const handleCreateListing = () => {
        if (!user) return;
        if (!newListing.title) {
            toast.showToast({ message: "Please enter a title for your listing before saving.", type: "info" });
            return;
        }

        // Validate title length
        if (newListing.title.length > VALIDATION_RULES.MAX_TITLE_LENGTH) {
            toast.showToast({ message: `Title cannot exceed ${VALIDATION_RULES.MAX_TITLE_LENGTH} characters.`, type: "error" });
            return;
        }

        // Validate pricing model is selected
        if (!newListing.pricingModel) {
            toast.showToast({ message: "Please select a pricing model (Overnight, Full Day, or Hourly).", type: "info" });
            return;
        }

        // Validate minimum price (must be greater than 0 for non-drafts)
        if (newListing.price !== undefined && newListing.price < VALIDATION_RULES.MIN_PRICE) {
            toast.showToast({ message: `Price must be at least ${VALIDATION_RULES.MIN_PRICE}.`, type: "error" });
            return;
        }

        // Validate caution fee - max 2x base price (industry standard for high-value properties)
        if (newListing.cautionFee && newListing.price && newListing.cautionFee > newListing.price * VALIDATION_RULES.CAUTION_FEE_MAX_RATIO) {
            toast.showToast({ message: `Caution fee cannot exceed 2x the base price.`, type: "error" });
            return;
        }

        // Validate extra guest cost - cannot exceed base price
        if (newListing.pricePerExtraGuest && newListing.price && newListing.pricePerExtraGuest > newListing.price * VALIDATION_RULES.EXTRA_GUEST_MAX_RATIO) {
            toast.showToast({ message: "Extra guest fee cannot exceed the base price.", type: "error" });
            return;
        }

        // Validate capacity
        if (newListing.capacity !== undefined && newListing.capacity < VALIDATION_RULES.MIN_CAPACITY) {
            toast.showToast({ message: "Capacity must be at least 1 guest.", type: "error" });
            return;
        }

        // Validate included guests doesn't exceed capacity
        if (newListing.includedGuests && newListing.capacity && newListing.includedGuests > newListing.capacity) {
            toast.showToast({ message: "Included guests cannot exceed maximum capacity.", type: "error" });
            return;
        }

        setIsSubmitting(true);
        const draftKey = `listing_draft_${user.id}_temp`;
        localStorage.removeItem(draftKey);

        setTimeout(() => {
            try {
                const existingId = (newListing as any).id;
                const originalListing = listings.find(l => l.id === existingId);
                const hasMinimumImages = (newListing.images?.length || 0) >= 5;
                const hasRequiredFields = newListing.proofOfAddress && newListing.price && newListing.title;
                const isHostVerified = user.kycVerified && user.kycStatus === 'verified';
                const listingId = existingId || Math.random().toString(36).substr(2, 9);

                let finalStatus = ListingStatus.DRAFT;
                let finalRejectionReason = newListing.rejectionReason;

                // Determine listing status based on completion and verification
                if (!hasMinimumImages || !hasRequiredFields) {
                    // Incomplete listing - stays as draft
                    finalStatus = ListingStatus.DRAFT;
                } else if (originalListing && originalListing.status === ListingStatus.LIVE) {
                    // Already approved listing being edited - stays live
                    finalStatus = ListingStatus.LIVE;
                    finalRejectionReason = undefined;
                } else if (!isHostVerified) {
                    // Host not verified yet - pending KYC
                    finalStatus = ListingStatus.PENDING_KYC;
                } else if (originalListing && originalListing.status === ListingStatus.REJECTED) {
                    // Previously rejected listing being resubmitted - needs re-approval
                    finalStatus = ListingStatus.PENDING_APPROVAL;
                    finalRejectionReason = undefined; // Clear old rejection reason
                } else {
                    // Complete listing from verified host - pending admin approval
                    finalStatus = ListingStatus.PENDING_APPROVAL;
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
                    pricingModel: newListing.pricingModel || PricingModel.DAILY,
                    bookingConfig: newListing.bookingConfig,
                    location: newListing.location || 'No Location',
                    address: newListing.address,
                    status: finalStatus,
                    images: newListing.images || [],
                    tags: newListing.tags || [],
                    availability: finalAvailability,
                    requiresIdentityVerification: !!newListing.requiresIdentityVerification,
                    proofOfAddress: newListing.proofOfAddress,
                    rejectionReason: finalRejectionReason,
                    approvalTime: newListing.approvalTime,
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

                    safetyItems: newListing.safetyItems || [],
                    createdAt: newListing.createdAt || new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                };

                const saveResult = saveListing(listing);
                if (!saveResult.success) {
                    console.error('Failed to save listing:', saveResult.error);
                    toast.showToast({ message: saveResult.error || 'Failed to save listing', type: 'error' });
                    setIsSubmitting(false);
                    return;
                }

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

                // Show success message based on status
                let statusMessage = 'Listing saved!';
                if (finalStatus === ListingStatus.DRAFT) {
                    statusMessage = 'Draft saved successfully!';
                } else if (finalStatus === ListingStatus.PENDING_KYC) {
                    statusMessage = 'Listing saved! Complete identity verification to submit for approval.';
                } else if (finalStatus === ListingStatus.PENDING_APPROVAL) {
                    statusMessage = 'Listing submitted for admin approval! You\'ll be notified once reviewed.';
                } else if (finalStatus === ListingStatus.LIVE) {
                    statusMessage = isNew ? 'Listing published successfully!' : 'Listing updated successfully!';
                }
                toast.showToast({ message: statusMessage, type: "info" });

                // Reset form and return to listings view
                setNewListing({
                    type: SpaceType.APARTMENT,
                    priceUnit: BookingType.DAILY,
                    pricingModel: PricingModel.DAILY,
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

                // Clear local draft after successful save
                if (user) {
                    const tempDraftKey = `listing_draft_${user.id}_temp`;
                    localStorage.removeItem(tempDraftKey);
                    // Also clear listing-specific draft if editing
                    if (existingId) {
                        const listingDraftKey = `listing_draft_${user.id}_${existingId}`;
                        localStorage.removeItem(listingDraftKey);
                    }
                }

                setView('listings'); // Return to listings view instead of staying in wizard
                return true; // Signal success
            } catch (error) {
                console.error("Failed to save listing:", error);
                toast.showToast({ message: "Failed to save listing. Please try again.", type: "info" });
            } finally {
                setIsSubmitting(false);
            }
        }, 1500);
    };

    const handleSaveAndExit = async () => {
        if (!user) return;

        // Don't save if completely empty
        if (!newListing.title && !newListing.description && !newListing.location && (!newListing.images || newListing.images.length === 0)) {
            setView('listings');
            return;
        }

        setIsSubmitting(true);

        try {
            const existingId = (newListing as any).id;
            const listingId = existingId || Math.random().toString(36).substr(2, 9);

            // Determine status - if it's already live/pending, keep it, otherwise DRAFT
            let status = ListingStatus.DRAFT;
            if (existingId) {
                const original = listings.find(l => l.id === existingId);
                if (original) {
                    status = original.status;
                }
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
                pricingModel: newListing.pricingModel || PricingModel.DAILY,
                bookingConfig: newListing.bookingConfig,
                location: newListing.location || 'No Location',
                address: newListing.address,
                status: status,
                images: newListing.images || [],
                tags: newListing.tags || [],
                amenities: newListing.amenities || [],
                houseRules: newListing.houseRules || [],
                safetyItems: newListing.safetyItems || [],
                capacity: newListing.capacity || 1,
                includedGuests: newListing.includedGuests || 1,
                pricePerExtraGuest: newListing.pricePerExtraGuest || 0,
                cautionFee: newListing.cautionFee || 0,
                bedrooms: newListing.bedrooms || 1,
                bathrooms: newListing.bathrooms || 1,
                size: newListing.size || 0,
                availability: finalAvailability,
                rating: (newListing as any).rating || 0,
                reviewCount: (newListing as any).reviewCount || 0,
                createdAt: (newListing as any).createdAt || new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                addOns: newListing.addOns || [],
                proofOfAddress: newListing.proofOfAddress,
                rejectionReason: newListing.rejectionReason,
                accessInfo: newListing.accessInfo,
            };

            // Save to backend
            const result = saveListing(listing);

            if (result.success) {
                // Update parent state only if save succeeded
                if (existingId && onUpdateListing) {
                    onUpdateListing(listing);
                } else if (!existingId && onCreateListing) {
                    onCreateListing(listing);
                }

                // Clear local storage draft
                try {
                    const draftKey = `listing_draft_${user.id}_${existingId || 'temp'}`;
                    localStorage.removeItem(draftKey);
                    // Also clear the step
                    localStorage.removeItem(`${draftKey}_step`);
                } catch (e) {
                    console.error('Failed to clear local draft', e);
                }

                toast.showToast({
                    message: editingListing?.status === ListingStatus.LIVE ? "Changes saved successfully" : "Draft saved successfully",
                    type: "success"
                });
                setView('listings');
            } else {
                console.error('Failed to save listing:', result.error);
                toast.showToast({
                    message: `Failed to save ${editingListing?.status === ListingStatus.LIVE ? 'changes' : 'draft'}: ${result.error}`,
                    type: "error"
                });
            }
        } catch (error) {
            console.error('Failed to save draft:', error);
            toast.showToast({ message: "Failed to save draft", type: "error" });
        } finally {
            setIsSubmitting(false);
        }
    };

    const MAX_IMAGE_SIZE_MB = 10;
    const MAX_IMAGE_SIZE_BYTES = MAX_IMAGE_SIZE_MB * 1024 * 1024;

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            Array.from(files).forEach((file: File) => {
                // Validate image size
                if (file.size > MAX_IMAGE_SIZE_BYTES) {
                    toast.showToast({
                        message: `Image "${file.name}" exceeds ${MAX_IMAGE_SIZE_MB}MB limit. Please use a smaller image.`,
                        type: "info"
                    });
                    return;
                }

                // Validate image type
                if (!file.type.startsWith('image/')) {
                    toast.showToast({
                        message: `File "${file.name}" is not a valid image.`,
                        type: "info"
                    });
                    return;
                }

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
        toast.showToast({ message: "Schedule applied to the next 3 months!", type: "info" });
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
            setBlockDateDialog({ isOpen: true, dateStr });
            return;
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

    const handleRestoreDraft = () => {
        if (draftRestoreDialog.draftData && user) {
            // Ensure all required fields have defaults when restoring draft
            const restoredData = {
                ...draftRestoreDialog.draftData,
                // Ensure pricingModel is set (for drafts saved before this field was added)
                pricingModel: draftRestoreDialog.draftData.pricingModel || PricingModel.DAILY,
                priceUnit: draftRestoreDialog.draftData.priceUnit || BookingType.DAILY,
                images: draftRestoreDialog.draftData.images || [],
                settings: draftRestoreDialog.draftData.settings || { allowRecurring: true, minDuration: 1, instantBook: false },
            };
            // Remove internal flags before setting
            delete restoredData.isEditDraft;
            delete restoredData.listingId;
            delete restoredData.savedAt;
            delete restoredData.step;
            setNewListing(restoredData);
            setStep(draftRestoreDialog.draftData.step || 1);
            setShowAiInput(false);
        }
        setDraftRestoreDialog({ isOpen: false, draftData: null });
    };

    const handleDiscardDraft = () => {
        if (user && draftRestoreDialog.draftData) {
            // Clear the correct draft key based on whether we're editing or creating
            const draftKey = draftRestoreDialog.draftData.isEditDraft && draftRestoreDialog.draftData.listingId
                ? `listing_draft_${user.id}_${draftRestoreDialog.draftData.listingId}`
                : `listing_draft_${user.id}_temp`;
            localStorage.removeItem(draftKey);

            // If discarding while editing a draft, load from the server data
            if (draftRestoreDialog.draftData.isEditDraft && editingListing) {
                handleEditListing(editingListing);
            }
        }
        setDraftRestoreDialog({ isOpen: false, draftData: null });
    };

    const handleConfirmBlockDate = () => {
        if (blockDateDialog.dateStr) {
            const newAvailability = { ...newListing.availability };
            delete newAvailability[blockDateDialog.dateStr];
            setNewListing({ ...newListing, availability: newAvailability });
        }
        setBlockDateDialog({ isOpen: false, dateStr: null });
    };

    const handleCancelBlockDate = () => {
        setBlockDateDialog({ isOpen: false, dateStr: null });
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
        isEditingUpload, setIsEditingUpload,
        step, setStep,
        isSubmitting,
        lastSaved,
        draggedImageIndex,

        handleEditListing,
        handleAiAutoFill,
        handleAddAddOn,
        handleRemoveAddOn,
        handleAddRule,
        handleRemoveRule,
        toggleSafetyItem,
        handleAddCustomSafety,
        handleCreateListing,
        handleSaveAndExit,
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
        },

        // Dialog states and handlers
        draftRestoreDialog,
        handleRestoreDraft,
        handleDiscardDraft,
        blockDateDialog,
        handleConfirmBlockDate,
        handleCancelBlockDate,
    };
};
