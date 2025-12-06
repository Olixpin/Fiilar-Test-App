import { Listing, SpaceType, BookingType, PricingModel, CancellationPolicy, ListingStatus } from '@fiilar/types';

// --- Mock Fallback Logic ---
// Note: Anthropic SDK is not compatible with browser environments, so we use mocks only

const getMockRecommendations = (userPreference: string, availableListings: Listing[]) => {
  const terms = userPreference.toLowerCase().split(' ');
  return availableListings
    .map(l => {
      let score = 0;
      const text = `${l.title} ${l.description} ${l.type} ${l.tags.join(' ')}`.toLowerCase();
      terms.forEach(term => {
        if (text.includes(term)) score++;
      });
      return { listing: l, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map(item => ({
      listingId: item.listing.id,
      reason: `Matches your search for "${userPreference}" (Mock Recommendation)`
    }));
};

const getMockListingDescription = (text: string): Partial<Listing> => {
  const prompt = text.toLowerCase();
  
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

  const getPriceUnit = () => {
      // Most spaces use hourly pricing, events use daily
      if (isEvent) return BookingType.DAILY;
      return BookingType.HOURLY;
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

  return {
      id: `mock-${Date.now()}`, // Generate a unique ID
      hostId: 'mock-host', // Mock host ID
      title: getTitle(),
      description: getDescription(),
      price: getPrice(),
      priceUnit: getPriceUnit(),
      images: [], // Empty array for images
      location: prompt.includes('lekki') ? 'Lekki Phase 1, Lagos' 
              : prompt.includes('ikoyi') ? 'Ikoyi, Lagos'
              : prompt.includes('vi') || prompt.includes('victoria') ? 'Victoria Island, Lagos'
              : 'Lagos, Nigeria',
      status: ListingStatus.PENDING, // Default status
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
      settings: {
          instantBook: !isLuxury && !isEvent,
          allowRecurring: true,
          minDuration: isEvent ? 1 : isStudio ? 2 : 1,
      },
      bookingWindow: isEvent ? 180 : 90,
      minNotice: isEvent ? 7 : isLuxury ? 2 : 1,
      prepTime: isEvent ? 1 : 0,
      approvalTime: isLuxury ? 'Within 2 hours' : 'Within 1 hour',
  };
};

// --- Main Exported Functions ---

// --- Main Exported Functions ---

export const getSpaceRecommendations = async (
  userPreference: string,
  availableListings: Listing[]
): Promise<{ listingId: string; reason: string }[]> => {
  // Simulate API delay for realistic UX
  await new Promise(resolve => setTimeout(resolve, 1000));
  console.log("Using mock AI recommendations (Anthropic SDK not compatible with browser)");
  return getMockRecommendations(userPreference, availableListings);
};

export const parseListingDescription = async (text: string): Promise<Partial<Listing>> => {
  // Simulate API delay for realistic UX
  await new Promise(resolve => setTimeout(resolve, 1500));
  console.log("Using mock AI parsing (Anthropic SDK not compatible with browser)");
  return getMockListingDescription(text);
};
