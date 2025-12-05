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
        // NEW guest capacity model (v1.1)
        maxGuests: 1,
        allowExtraGuests: false,
        extraGuestLimit: 0,
        extraGuestFee: 0,
        // Legacy fields kept for compatibility
        capacity: 1,
        includedGuests: 1,
        pricePerExtraGuest: 0,
        cautionFee: 0,
        addOns: [],
        amenities: [],
        cancellationPolicy: CancellationPolicy.MODERATE,
        houseRules: [],
        safetyItems: [],
        // Booking Settings (Availability & Timing)
        bookingWindow: 90,  // 3 months ahead
        minNotice: 1,       // 1 day notice
        prepTime: 0,        // No prep time between bookings
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
            // Use safeLocalStorageSave to handle quota errors gracefully
            const saved = safeLocalStorageSave(draftKey, draftData);
            if (saved) {
                setLastSaved(new Date());
            } else {
                console.error('Auto-save failed: could not save draft');
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

        const currentPrompt = aiPrompt; // Store the prompt before clearing
        setAiPrompt(''); // Clear the input immediately when Generate is clicked
        setIsAiGenerating(true);
        try {
            // Simulate AI generation with a timeout
            await new Promise(resolve => setTimeout(resolve, 2000));

            const prompt = currentPrompt.toLowerCase();
            
            // Detect space type from prompt
            const isStudio = prompt.includes('studio') || prompt.includes('photo') || prompt.includes('podcast');
            const isConference = prompt.includes('meeting') || prompt.includes('conference') || prompt.includes('office');
            const isEvent = prompt.includes('event') || prompt.includes('party') || prompt.includes('wedding') || prompt.includes('birthday');
            const isCoWorking = prompt.includes('coworking') || prompt.includes('co-working') || prompt.includes('workspace');
            const isBeach = prompt.includes('beach') || prompt.includes('ocean') || prompt.includes('waterfront');
            const isLuxury = prompt.includes('luxury') || prompt.includes('premium') || prompt.includes('executive');
            
            // Generate contextual content based on prompt
            const getTitle = () => {
                if (isStudio) return `Modern Creative Studio ${isLuxury ? '• Premium' : ''} in ${prompt.includes('lekki') ? 'Lekki' : 'Victoria Island'}`;
                if (isConference) return `Professional ${isLuxury ? 'Executive ' : ''}Meeting Room with City Views`;
                if (isEvent) return `Elegant ${prompt.includes('wedding') ? 'Wedding Venue' : 'Event Space'} with Modern Amenities`;
                if (isCoWorking) return `Inspiring Co-working Space in Lagos Business District`;
                if (isBeach) return `Stunning Beachfront Space with Ocean Views`;
                return `Charming ${isLuxury ? 'Luxury ' : ''}Space in Prime Lagos Location`;
            };

            const getDescription = () => {
                const intro = isLuxury 
                    ? `Welcome to this premium, meticulously designed space that offers an unparalleled experience.`
                    : `Discover the perfect space for your needs in the heart of Lagos.`;
                
                const features = isStudio
                    ? `Equipped with professional lighting, soundproofing, and a versatile backdrop system. Perfect for photoshoots, podcasts, video production, and creative sessions.`
                    : isConference
                    ? `Features state-of-the-art AV equipment, high-speed WiFi, comfortable seating, and a professional atmosphere ideal for meetings, presentations, and workshops.`
                    : isEvent
                    ? `This versatile venue can accommodate intimate gatherings to grand celebrations. Includes customizable lighting, ample parking, and a dedicated event coordinator.`
                    : isCoWorking
                    ? `Enjoy a productive environment with ergonomic furniture, unlimited coffee, high-speed internet, and networking opportunities with like-minded professionals.`
                    : `A thoughtfully curated space with modern amenities, natural lighting, and a welcoming atmosphere that makes every visit memorable.`;

                const closing = `Located in a prime area with easy access to major roads and amenities. Book now and experience the difference!`;

                return `${intro}\n\n${features}\n\n${closing}`;
            };

            const getAmenities = () => {
                const base = [
                    { name: 'High-Speed WiFi', icon: 'wifi' },
                    { name: 'Air Conditioning', icon: 'wind' },
                    { name: 'Parking', icon: 'car' },
                ];
                if (isStudio) return [...base, 
                    { name: 'Professional Lighting', icon: 'lightbulb' },
                    { name: 'Backdrop System', icon: 'image' },
                    { name: 'Changing Room', icon: 'door-open' },
                    { name: 'Props Available', icon: 'box' },
                ];
                if (isConference) return [...base,
                    { name: 'Projector & Screen', icon: 'presentation' },
                    { name: 'Whiteboard', icon: 'clipboard' },
                    { name: 'Video Conferencing', icon: 'video' },
                    { name: 'Coffee/Tea', icon: 'coffee' },
                ];
                if (isEvent) return [...base,
                    { name: 'Sound System', icon: 'speaker' },
                    { name: 'Decorative Lighting', icon: 'sparkles' },
                    { name: 'Catering Kitchen', icon: 'utensils' },
                    { name: 'Stage Area', icon: 'mic' },
                ];
                return [...base,
                    { name: 'Kitchen Access', icon: 'utensils' },
                    { name: 'Workspace', icon: 'laptop' },
                ];
            };

            const getPrice = () => {
                if (isLuxury) return isEvent ? 500000 : isConference ? 75000 : 50000;
                if (isEvent) return 250000;
                if (isConference) return 35000;
                if (isStudio) return 25000;
                if (isCoWorking) return 5000;
                return 15000;
            };

            const getCapacity = () => {
                if (isEvent) return prompt.includes('wedding') ? 200 : 100;
                if (isConference) return 20;
                if (isStudio) return 10;
                if (isCoWorking) return 30;
                return 8;
            };

            const getPricingModel = () => {
                if (isEvent) return PricingModel.DAILY;
                if (isStudio || isConference || isCoWorking) return PricingModel.HOURLY;
                return PricingModel.DAILY;
            };

            const getSpaceType = () => {
                // Creative & Production
                if (isStudio) {
                    if (prompt.includes('photo') || prompt.includes('photograp')) return SpaceType.PHOTO_STUDIO;
                    if (prompt.includes('record') || prompt.includes('podcast') || prompt.includes('audio')) return SpaceType.RECORDING_STUDIO;
                    if (prompt.includes('film') || prompt.includes('video')) return SpaceType.FILM_STUDIO;
                    return SpaceType.PHOTO_STUDIO;
                }
                // Work & Productivity
                if (isConference) {
                    if (prompt.includes('training') || prompt.includes('seminar') || prompt.includes('workshop')) return SpaceType.TRAINING_ROOM;
                    return SpaceType.MEETING_ROOM;
                }
                if (isCoWorking) {
                    if (prompt.includes('private') || prompt.includes('office')) return SpaceType.PRIVATE_OFFICE;
                    return SpaceType.CO_WORKING;
                }
                // Event & Social
                if (isEvent) {
                    if (prompt.includes('wedding') || prompt.includes('banquet')) return SpaceType.BANQUET_HALL;
                    if (prompt.includes('outdoor') || prompt.includes('garden') || prompt.includes('lawn')) return SpaceType.OUTDOOR_VENUE;
                    if (prompt.includes('rooftop') || prompt.includes('lounge')) return SpaceType.LOUNGE_ROOFTOP;
                    return SpaceType.EVENT_HALL;
                }
                // Stay & Accommodation
                if (prompt.includes('hotel') || prompt.includes('boutique')) return SpaceType.BOUTIQUE_HOTEL;
                if (prompt.includes('apartment') || prompt.includes('flat') || prompt.includes('serviced')) return SpaceType.SERVICED_APARTMENT;
                if (prompt.includes('rental') || prompt.includes('airbnb') || prompt.includes('vacation')) return SpaceType.SHORT_TERM_RENTAL;
                // Specialty
                if (prompt.includes('pop-up') || prompt.includes('popup') || prompt.includes('retail')) return SpaceType.POP_UP_RETAIL;
                if (prompt.includes('showroom')) return SpaceType.SHOWROOM;
                if (prompt.includes('kitchen') || prompt.includes('culinary') || prompt.includes('cloud')) return SpaceType.KITCHEN_CULINARY;
                if (prompt.includes('warehouse') || prompt.includes('storage')) return SpaceType.WAREHOUSE;
                if (prompt.includes('gallery') || prompt.includes('art')) return SpaceType.ART_GALLERY;
                if (prompt.includes('dance')) return SpaceType.DANCE_STUDIO;
                if (prompt.includes('gym') || prompt.includes('fitness')) return SpaceType.GYM_FITNESS;
                if (prompt.includes('prayer') || prompt.includes('meditation') || prompt.includes('spiritual')) return SpaceType.PRAYER_MEDITATION;
                if (prompt.includes('tech') || prompt.includes('innovation') || prompt.includes('maker')) return SpaceType.TECH_HUB;
                if (prompt.includes('gaming') || prompt.includes('esport')) return SpaceType.GAMING_LOUNGE;
                
                return SpaceType.SERVICED_APARTMENT;
            };

            // Mock AI response based on prompt analysis
            const mockResponse = {
                title: getTitle(),
                description: getDescription(),
                price: getPrice(),
                location: prompt.includes('lekki') ? 'Lekki Phase 1, Lagos' 
                        : prompt.includes('ikoyi') ? 'Ikoyi, Lagos'
                        : prompt.includes('vi') || prompt.includes('victoria') ? 'Victoria Island, Lagos'
                        : 'Lagos, Nigeria',
                capacity: getCapacity(),
                includedGuests: Math.min(getCapacity(), 5),
                type: getSpaceType(),
                pricingModel: getPricingModel(),
                tags: [
                    isLuxury ? 'Premium' : 'Popular',
                    isStudio ? 'Creative' : isConference ? 'Professional' : isEvent ? 'Celebrations' : 'Versatile',
                    'Clean',
                    'Well-Located',
                    isBeach ? 'Ocean View' : 'City Access',
                ],
                amenities: getAmenities(),
                houseRules: [
                    'No smoking indoors',
                    'Respect quiet hours after 10 PM',
                    'Clean up after use',
                    'No pets allowed',
                    isEvent ? 'External catering must be approved' : 'Food and drinks allowed',
                ],
                safetyItems: [
                    'Smoke Alarm',
                    'Fire Extinguisher',
                    'First Aid Kit',
                    'Emergency Exit',
                    'Security Camera (common areas)',
                ],
                cancellationPolicy: isLuxury ? CancellationPolicy.STRICT : CancellationPolicy.MODERATE,
                // Booking settings
                settings: {
                    instantBook: !isLuxury && !isEvent, // Luxury & events need approval
                    allowRecurring: true,
                    minDuration: isEvent ? 1 : isStudio ? 2 : 1,
                },
                bookingWindow: isEvent ? 180 : 90, // Events book further ahead
                minNotice: isEvent ? 7 : isLuxury ? 2 : 1,
                prepTime: isEvent ? 1 : 0,
                approvalTime: isLuxury ? 'Within 2 hours' : 'Within 1 hour',
            };

            // Merge with existing state (only fill empty fields)
            setNewListing(prev => ({
                ...prev,
                title: prev.title || mockResponse.title,
                description: prev.description || mockResponse.description,
                price: prev.price || mockResponse.price,
                location: prev.location || mockResponse.location,
                capacity: prev.capacity === 1 ? mockResponse.capacity : prev.capacity,
                includedGuests: prev.includedGuests === 1 ? mockResponse.includedGuests : prev.includedGuests,
                type: mockResponse.type,
                pricingModel: mockResponse.pricingModel,
                tags: (prev.tags?.length || 0) === 0 ? mockResponse.tags : prev.tags,
                amenities: (prev.amenities?.length || 0) === 0 ? mockResponse.amenities : prev.amenities,
                houseRules: (prev.houseRules?.length || 0) === 0 ? mockResponse.houseRules : prev.houseRules,
                safetyItems: (prev.safetyItems?.length || 0) === 0 ? mockResponse.safetyItems : prev.safetyItems,
                cancellationPolicy: mockResponse.cancellationPolicy,
                settings: mockResponse.settings,
                bookingWindow: mockResponse.bookingWindow,
                minNotice: mockResponse.minNotice,
                prepTime: mockResponse.prepTime,
                approvalTime: mockResponse.approvalTime,
            }));
            setShowAiInput(false);
            toast.showToast({ message: "✨ AI has filled in your listing details!", type: "success" });
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
    // These protect guests from unreasonable pricing
    const VALIDATION_RULES = {
        // Pricing limits
        MIN_PRICE: 1000,                    // Minimum ₦1,000 to prevent spam listings
        MAX_PRICE: 50000000,                // Maximum ₦50M (reasonable for luxury venues)
        CAUTION_FEE_MAX_RATIO: 1.5,         // Security deposit up to 1.5x base price (was 2x)
        CAUTION_FEE_MAX_ABSOLUTE: 5000000,  // Maximum ₦5M caution fee regardless of price
        
        // NEW: Extra Guest Rules (v1.1)
        EXTRA_GUEST_MAX_PERCENTAGE: 0.5,    // Extra guest limit max 50% of maxGuests
        EXTRA_GUEST_MIN_FEE: 500,           // Minimum ₦500 per extra guest
        EXTRA_GUEST_MAX_FEE_RATIO: 0.5,     // Extra guest fee max 50% of base price
        EXTRA_GUEST_MAX_FEE_ABSOLUTE: 100000, // Maximum ₦100k per extra guest
        
        // DEPRECATED: Old extra guest validation (kept for reference)
        EXTRA_GUEST_MAX_RATIO: 0.5,         // Extra guest cost max 50% of base price (was 100%)
        EXTRA_GUEST_MAX_ABSOLUTE: 50000,    // Maximum ₦50k per extra guest
        
        // Capacity limits
        MIN_CAPACITY: 1,
        MAX_CAPACITY: 1000,                 // Maximum 1000 guests (large events)
        
        // Content limits  
        MAX_TITLE_LENGTH: 100,
        MIN_TITLE_LENGTH: 10,
        MIN_DESCRIPTION_LENGTH: 50,
        MAX_DESCRIPTION_LENGTH: 5000,
        MIN_PHOTOS: 5,
        
        // Add-on limits
        MAX_ADDON_PRICE_RATIO: 2,           // Add-on can't exceed 2x base price
        MAX_ADDONS: 20,                     // Maximum 20 add-ons per listing
        
        // Host limits
        MAX_ACTIVE_LISTINGS: 50,            // Maximum 50 active listings per host
        
        // Price sanity limits per space type (reasonable maximums)
        PRICE_SANITY: {
            // Work & Productivity
            [SpaceType.CO_WORKING]: { hourlyMax: 50000, dailyMax: 200000 },
            [SpaceType.PRIVATE_OFFICE]: { hourlyMax: 100000, dailyMax: 500000 },
            [SpaceType.MEETING_ROOM]: { hourlyMax: 200000, dailyMax: 1000000 },
            [SpaceType.TRAINING_ROOM]: { hourlyMax: 300000, dailyMax: 1500000 },
            [SpaceType.CONFERENCE]: { hourlyMax: 300000, dailyMax: 1500000 },
            
            // Event & Social
            [SpaceType.EVENT_HALL]: { hourlyMax: 500000, dailyMax: 5000000 },
            [SpaceType.BANQUET_HALL]: { hourlyMax: 1000000, dailyMax: 10000000 },
            [SpaceType.OUTDOOR_VENUE]: { hourlyMax: 300000, dailyMax: 3000000 },
            [SpaceType.LOUNGE_ROOFTOP]: { hourlyMax: 200000, dailyMax: 1000000 },
            [SpaceType.EVENT_CENTER]: { hourlyMax: 1000000, dailyMax: 10000000 },
            [SpaceType.OPEN_SPACE]: { hourlyMax: 200000, dailyMax: 1000000 },
            
            // Creative & Production
            [SpaceType.PHOTO_STUDIO]: { hourlyMax: 300000, dailyMax: 1500000 },
            [SpaceType.RECORDING_STUDIO]: { hourlyMax: 500000, dailyMax: 2000000 },
            [SpaceType.FILM_STUDIO]: { hourlyMax: 1000000, dailyMax: 5000000 },
            [SpaceType.STUDIO]: { hourlyMax: 500000, dailyMax: 2000000 },
            
            // Stay & Accommodation
            [SpaceType.BOUTIQUE_HOTEL]: { hourlyMax: 200000, nightlyMax: 10000000 },
            [SpaceType.SERVICED_APARTMENT]: { hourlyMax: 100000, nightlyMax: 5000000 },
            [SpaceType.SHORT_TERM_RENTAL]: { hourlyMax: 100000, nightlyMax: 3000000 },
            [SpaceType.APARTMENT]: { hourlyMax: 100000, nightlyMax: 5000000 },
            
            // Specialty
            [SpaceType.POP_UP_RETAIL]: { hourlyMax: 200000, dailyMax: 2000000 },
            [SpaceType.SHOWROOM]: { hourlyMax: 300000, dailyMax: 3000000 },
            [SpaceType.KITCHEN_CULINARY]: { hourlyMax: 200000, dailyMax: 1000000 },
            [SpaceType.WAREHOUSE]: { hourlyMax: 100000, dailyMax: 2000000 },
            [SpaceType.ART_GALLERY]: { hourlyMax: 200000, dailyMax: 2000000 },
            [SpaceType.DANCE_STUDIO]: { hourlyMax: 100000, dailyMax: 500000 },
            [SpaceType.GYM_FITNESS]: { hourlyMax: 150000, dailyMax: 800000 },
            [SpaceType.PRAYER_MEDITATION]: { hourlyMax: 50000, dailyMax: 200000 },
            [SpaceType.TECH_HUB]: { hourlyMax: 100000, dailyMax: 500000 },
            [SpaceType.GAMING_LOUNGE]: { hourlyMax: 100000, dailyMax: 500000 },
            [SpaceType.CONFERENCE_CENTER]: { hourlyMax: 2000000, dailyMax: 20000000 },
        } as Record<string, { hourlyMax?: number; dailyMax?: number; nightlyMax?: number }>,
    };

    // Profanity word list (basic - expand as needed)
    const PROFANITY_LIST = [
        'fuck', 'shit', 'bitch', 'ass', 'damn', 'bastard', 'dick', 'pussy', 'cock',
        'nigga', 'nigger', 'fag', 'faggot', 'whore', 'slut', 'cunt'
    ];

    // Check for profanity in text
    const containsProfanity = (text: string): string | null => {
        const lowerText = text.toLowerCase();
        for (const word of PROFANITY_LIST) {
            // Match whole words only
            const regex = new RegExp(`\\b${word}\\b`, 'i');
            if (regex.test(lowerText)) {
                return word;
            }
        }
        return null;
    };

    // Check for contact info (phone numbers, emails) in text
    const containsContactInfo = (text: string): { type: string; match: string } | null => {
        // Phone number patterns (Nigerian and international)
        const phonePatterns = [
            /\b0[7-9][0-1]\d{8}\b/,           // Nigerian: 07x, 08x, 09x
            /\b\+234[7-9][0-1]\d{8}\b/,       // Nigerian with +234
            /\b234[7-9][0-1]\d{8}\b/,         // Nigerian with 234
            /\b\d{3}[-.\s]?\d{3}[-.\s]?\d{4}\b/, // General: xxx-xxx-xxxx
            /\b\d{4}[-.\s]?\d{3}[-.\s]?\d{4}\b/, // General: xxxx-xxx-xxxx
        ];
        
        for (const pattern of phonePatterns) {
            const match = text.match(pattern);
            if (match) {
                return { type: 'phone number', match: match[0] };
            }
        }

        // Email pattern
        const emailPattern = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/;
        const emailMatch = text.match(emailPattern);
        if (emailMatch) {
            return { type: 'email address', match: emailMatch[0] };
        }

        // WhatsApp mentions
        if (/whatsapp|whats\s*app|wa\.me/i.test(text)) {
            return { type: 'WhatsApp reference', match: 'WhatsApp' };
        }

        return null;
    };

    const handleCreateListing = () => {
        if (!user) return;
        if (!newListing.title) {
            toast.showToast({ message: "Please enter a title for your listing before saving.", type: "info" });
            return;
        }

        // Check for duplicate title (same host) - exclude deleted listings
        const existingListingId = (newListing as any).id;
        const duplicateTitle = listings.find(l => 
            l.hostId === user.id && 
            l.title.toLowerCase().trim() === newListing.title!.toLowerCase().trim() &&
            l.id !== existingListingId && // Exclude current listing when editing
            l.status !== ListingStatus.DELETED // Exclude deleted listings
        );
        if (duplicateTitle) {
            toast.showToast({ 
                message: `You already have a listing called "${duplicateTitle.title}". Please use a different name.`, 
                type: "error" 
            });
            return;
        }

        // Check maximum active listings per host (exclude drafts and deleted)
        const activeListingsCount = listings.filter(l => 
            l.hostId === user.id && 
            l.status !== ListingStatus.DRAFT &&
            l.status !== ListingStatus.DELETED &&
            l.id !== existingListingId
        ).length;
        if (activeListingsCount >= VALIDATION_RULES.MAX_ACTIVE_LISTINGS && !existingListingId) {
            toast.showToast({ 
                message: `You've reached the maximum of ${VALIDATION_RULES.MAX_ACTIVE_LISTINGS} active listings. Please archive some listings first.`, 
                type: "error" 
            });
            return;
        }

        // Check for profanity in title
        const titleProfanity = containsProfanity(newListing.title);
        if (titleProfanity) {
            toast.showToast({ 
                message: "Your title contains inappropriate language. Please revise it.", 
                type: "error" 
            });
            return;
        }

        // Check for profanity in description
        if (newListing.description) {
            const descProfanity = containsProfanity(newListing.description);
            if (descProfanity) {
                toast.showToast({ 
                    message: "Your description contains inappropriate language. Please revise it.", 
                    type: "error" 
                });
                return;
            }

            // Check for contact info in description
            const contactInfo = containsContactInfo(newListing.description);
            if (contactInfo) {
                toast.showToast({ 
                    message: `Please remove the ${contactInfo.type} from your description. All communication should happen through Fiilar for your safety.`, 
                    type: "error" 
                });
                return;
            }
        }

        // Validate title length
        if (newListing.title.length < VALIDATION_RULES.MIN_TITLE_LENGTH) {
            toast.showToast({ message: `Title must be at least ${VALIDATION_RULES.MIN_TITLE_LENGTH} characters.`, type: "error" });
            return;
        }
        if (newListing.title.length > VALIDATION_RULES.MAX_TITLE_LENGTH) {
            toast.showToast({ message: `Title cannot exceed ${VALIDATION_RULES.MAX_TITLE_LENGTH} characters.`, type: "error" });
            return;
        }

        // Validate pricing model is selected
        if (!newListing.pricingModel) {
            toast.showToast({ message: "Please select a pricing model (Overnight, Full Day, or Hourly).", type: "info" });
            return;
        }

        // Validate price range
        if (newListing.price !== undefined && newListing.price > 0) {
            if (newListing.price < VALIDATION_RULES.MIN_PRICE) {
                toast.showToast({ message: `Minimum price is ₦${VALIDATION_RULES.MIN_PRICE.toLocaleString()}.`, type: "error" });
                return;
            }
            if (newListing.price > VALIDATION_RULES.MAX_PRICE) {
                toast.showToast({ message: `Maximum price is ₦${VALIDATION_RULES.MAX_PRICE.toLocaleString()}.`, type: "error" });
                return;
            }
        }

        // Validate caution fee - protect guests from excessive deposits
        if (newListing.cautionFee && newListing.cautionFee > 0) {
            const maxCautionByRatio = (newListing.price || 0) * VALIDATION_RULES.CAUTION_FEE_MAX_RATIO;
            const maxCaution = Math.min(maxCautionByRatio, VALIDATION_RULES.CAUTION_FEE_MAX_ABSOLUTE);
            
            if (newListing.cautionFee > maxCaution) {
                if (newListing.cautionFee > VALIDATION_RULES.CAUTION_FEE_MAX_ABSOLUTE) {
                    toast.showToast({ message: `Caution fee cannot exceed ₦${VALIDATION_RULES.CAUTION_FEE_MAX_ABSOLUTE.toLocaleString()}.`, type: "error" });
                } else {
                    toast.showToast({ message: `Caution fee cannot exceed 1.5x the base price (₦${maxCautionByRatio.toLocaleString()}).`, type: "error" });
                }
                return;
            }
        }

        // NEW: Validate extra guest settings (v1.1 model)
        const maxGuests = newListing.maxGuests ?? newListing.capacity ?? 1;
        
        if (newListing.allowExtraGuests) {
            // Validate extra guest limit (max 50% of maxGuests)
            const maxAllowedExtras = Math.ceil(maxGuests * VALIDATION_RULES.EXTRA_GUEST_MAX_PERCENTAGE);
            if (newListing.extraGuestLimit && newListing.extraGuestLimit > maxAllowedExtras) {
                toast.showToast({ 
                    message: `Extra guest limit cannot exceed ${maxAllowedExtras} (50% of ${maxGuests} max guests).`, 
                    type: "error" 
                });
                return;
            }
            
            // Validate extra guest fee minimum
            if (newListing.extraGuestFee !== undefined && newListing.extraGuestFee < VALIDATION_RULES.EXTRA_GUEST_MIN_FEE && newListing.extraGuestFee > 0) {
                toast.showToast({ 
                    message: `Extra guest fee must be at least ₦${VALIDATION_RULES.EXTRA_GUEST_MIN_FEE.toLocaleString()}.`, 
                    type: "error" 
                });
                return;
            }
            
            // Validate extra guest fee maximum
            if (newListing.extraGuestFee && newListing.extraGuestFee > 0 && newListing.price) {
                const maxExtraFeeByRatio = newListing.price * VALIDATION_RULES.EXTRA_GUEST_MAX_FEE_RATIO;
                const maxExtraFee = Math.min(maxExtraFeeByRatio, VALIDATION_RULES.EXTRA_GUEST_MAX_FEE_ABSOLUTE);
                
                if (newListing.extraGuestFee > maxExtraFee) {
                    if (newListing.extraGuestFee > VALIDATION_RULES.EXTRA_GUEST_MAX_FEE_ABSOLUTE) {
                        toast.showToast({ 
                            message: `Extra guest fee cannot exceed ₦${VALIDATION_RULES.EXTRA_GUEST_MAX_FEE_ABSOLUTE.toLocaleString()}.`, 
                            type: "error" 
                        });
                    } else {
                        toast.showToast({ 
                            message: `Extra guest fee cannot exceed 50% of the base price (₦${maxExtraFeeByRatio.toLocaleString()}).`, 
                            type: "error" 
                        });
                    }
                    return;
                }
            }
        }

        // LEGACY: Validate extra guest cost (for backward compatibility)
        if (newListing.pricePerExtraGuest && newListing.pricePerExtraGuest > 0 && !newListing.allowExtraGuests) {
            const maxExtraByRatio = (newListing.price || 0) * VALIDATION_RULES.EXTRA_GUEST_MAX_RATIO;
            const maxExtra = Math.min(maxExtraByRatio, VALIDATION_RULES.EXTRA_GUEST_MAX_ABSOLUTE);
            
            if (newListing.pricePerExtraGuest > maxExtra) {
                if (newListing.pricePerExtraGuest > VALIDATION_RULES.EXTRA_GUEST_MAX_ABSOLUTE) {
                    toast.showToast({ message: `Extra guest fee cannot exceed ₦${VALIDATION_RULES.EXTRA_GUEST_MAX_ABSOLUTE.toLocaleString()}.`, type: "error" });
                } else {
                    toast.showToast({ message: `Extra guest fee cannot exceed 50% of the base price.`, type: "error" });
                }
                return;
            }
        }

        // Validate maxGuests / capacity
        if (maxGuests < VALIDATION_RULES.MIN_CAPACITY) {
            toast.showToast({ message: "Maximum guests must be at least 1.", type: "error" });
            return;
        }
        if (maxGuests > VALIDATION_RULES.MAX_CAPACITY) {
            toast.showToast({ message: `Maximum guests cannot exceed ${VALIDATION_RULES.MAX_CAPACITY}.`, type: "error" });
            return;
        }

        // Validate add-ons pricing
        if (newListing.addOns && newListing.addOns.length > 0) {
            const maxAddonPrice = (newListing.price || 0) * VALIDATION_RULES.MAX_ADDON_PRICE_RATIO;
            const expensiveAddon = newListing.addOns.find(a => a.price > maxAddonPrice);
            if (expensiveAddon && newListing.price) {
                toast.showToast({ message: `Add-on "${expensiveAddon.name}" price (₦${expensiveAddon.price.toLocaleString()}) cannot exceed 2x the base price.`, type: "error" });
                return;
            }
        }

        // Price sanity check per pricing model and space type
        if (newListing.price && newListing.pricingModel && newListing.type) {
            const spaceLimits = VALIDATION_RULES.PRICE_SANITY[newListing.type];
            if (spaceLimits) {
                let maxPrice: number | undefined;
                let priceType: string = '';
                
                if (newListing.pricingModel === PricingModel.HOURLY && spaceLimits.hourlyMax) {
                    maxPrice = spaceLimits.hourlyMax;
                    priceType = 'hourly';
                } else if (newListing.pricingModel === PricingModel.DAILY && spaceLimits.dailyMax) {
                    maxPrice = spaceLimits.dailyMax;
                    priceType = 'daily';
                } else if (newListing.pricingModel === PricingModel.NIGHTLY && spaceLimits.nightlyMax) {
                    maxPrice = spaceLimits.nightlyMax;
                    priceType = 'nightly';
                }
                
                if (maxPrice && newListing.price > maxPrice) {
                    toast.showToast({ 
                        message: `Maximum ${priceType} price for ${newListing.type.toLowerCase().replace('_', ' ')} is ₦${maxPrice.toLocaleString()}. Please contact support for premium pricing.`, 
                        type: "error" 
                    });
                    return;
                }
            }
        }

        // Availability must be set to publish
        const hasAvailability = newListing.availability && Object.keys(newListing.availability).length > 0;
        const hasWeeklySchedule = weeklySchedule && Object.values(weeklySchedule).some(day => day.enabled);
        if (!hasAvailability && !hasWeeklySchedule) {
            toast.showToast({ 
                message: "Please set your availability before publishing. Guests need to know when your space is available.", 
                type: "info" 
            });
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

                    // Booking Settings (Availability & Timing + Booking Rules)
                    bookingWindow: newListing.bookingWindow ?? 90,   // Default: 3 months
                    minNotice: newListing.minNotice ?? 1,            // Default: 1 day
                    prepTime: newListing.prepTime ?? 0,              // Default: no prep time

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
                    safetyItems: [],
                    bookingWindow: 90,
                    minNotice: 1,
                    prepTime: 0,
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
                // Booking Settings
                settings: newListing.settings || { allowRecurring: true, minDuration: 1, instantBook: false },
                approvalTime: newListing.approvalTime,
                cancellationPolicy: newListing.cancellationPolicy || CancellationPolicy.MODERATE,
                bookingWindow: newListing.bookingWindow ?? 90,
                minNotice: newListing.minNotice ?? 1,
                prepTime: newListing.prepTime ?? 0,
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
            const draftData = draftRestoreDialog.draftData;
            
            // Check if images were stripped due to storage quota
            const hadImagesStripped = !draftData.images && draftData.imageCount && draftData.imageCount > 0;
            
            // Ensure all required fields have defaults when restoring draft
            const restoredData = {
                ...draftData,
                // Ensure pricingModel is set (for drafts saved before this field was added)
                pricingModel: draftData.pricingModel || PricingModel.DAILY,
                priceUnit: draftData.priceUnit || BookingType.DAILY,
                images: draftData.images || [],
                settings: draftData.settings || { allowRecurring: true, minDuration: 1, instantBook: false },
            };
            // Remove internal flags before setting
            delete restoredData.isEditDraft;
            delete restoredData.listingId;
            delete restoredData.savedAt;
            delete restoredData.step;
            delete restoredData.imageCount; // Clean up the imageCount marker
            setNewListing(restoredData);
            setStep(draftData.step || 1);
            setShowAiInput(false);
            
            // Notify user if images were lost due to storage limits
            if (hadImagesStripped) {
                setTimeout(() => {
                    toast.showToast({
                        message: `Draft restored, but ${draftData.imageCount} image(s) couldn't be saved due to storage limits. Please re-upload them.`,
                        type: 'info'
                    });
                }, 500);
            }
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
