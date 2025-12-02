// Step Components - Airbnb-style bite-sized steps (18 steps across 5 phases)
export { default as StepWrapper } from './StepWrapper';
export { default as StepSpaceType } from './StepSpaceType';
export { default as StepLocation } from './StepLocation';
export { default as StepAddress } from './StepAddress';
export { default as StepCapacity } from './StepCapacity';
export { default as StepTitleDescription } from './StepTitleDescription';
export { default as StepPhotos } from './StepPhotos';
export { default as StepAmenities } from './StepAmenities';
export { default as StepHighlights } from './StepHighlights';
export { default as StepPricingModel } from './StepPricingModel';
export { default as StepSetPrice } from './StepSetPrice';
export { default as StepSchedule } from './StepSchedule';
export { default as StepBookingSettings } from './StepBookingSettings';
export { default as StepBookingRules } from './StepBookingRules';
export { default as StepAddOns } from './StepAddOns';
export { default as StepHouseRules } from './StepHouseRules';
export { default as StepSafety } from './StepSafety';
export { default as StepVerification } from './StepVerification';
export { default as StepReview } from './StepReview';

// Step Configuration
export interface WizardStep {
    id: string;
    phase: number;
    phaseName: string;
    title: string;
    subtitle: string;
    component: string;
    isOptional?: boolean;
    canSkip?: boolean;
}

export const WIZARD_STEPS: WizardStep[] = [
    // Phase 1: Property Basics
    { id: 'space-type', phase: 1, phaseName: 'Property Basics', title: 'What type of space?', subtitle: 'Choose the category that best describes your space', component: 'StepSpaceType' },
    { id: 'location', phase: 1, phaseName: 'Property Basics', title: 'Where is your space?', subtitle: 'Enter location and address details', component: 'StepLocation' },
    { id: 'capacity', phase: 1, phaseName: 'Property Basics', title: 'How many guests?', subtitle: 'Set the maximum number of guests', component: 'StepCapacity' },
    { id: 'title-description', phase: 1, phaseName: 'Property Basics', title: 'Describe your space', subtitle: 'Create a title and description', component: 'StepTitleDescription' },

    // Phase 2: Stand Out
    { id: 'photos', phase: 2, phaseName: 'Stand Out', title: 'Add photos', subtitle: 'Show off your space with great photos', component: 'StepPhotos' },
    { id: 'amenities', phase: 2, phaseName: 'Stand Out', title: 'What amenities do you offer?', subtitle: 'Select all that apply', component: 'StepAmenities' },
    { id: 'highlights', phase: 2, phaseName: 'Stand Out', title: 'Add highlights', subtitle: 'Tags help guests find your space', component: 'StepHighlights', isOptional: true, canSkip: true },

    // Phase 3: Pricing & Availability
    { id: 'pricing-model', phase: 3, phaseName: 'Pricing', title: 'How do you want to charge?', subtitle: 'Choose your pricing model', component: 'StepPricingModel' },
    { id: 'set-price', phase: 3, phaseName: 'Pricing', title: 'Set your price', subtitle: 'You can change this anytime', component: 'StepSetPrice' },
    { id: 'schedule', phase: 3, phaseName: 'Pricing', title: 'Set your availability', subtitle: 'When can guests book?', component: 'StepSchedule' },
    { id: 'booking-settings', phase: 3, phaseName: 'Pricing', title: 'Availability & timing', subtitle: 'How far ahead can guests book?', component: 'StepBookingSettings' },
    { id: 'booking-rules', phase: 3, phaseName: 'Pricing', title: 'Booking rules', subtitle: 'Control how guests can book', component: 'StepBookingRules' },
    { id: 'add-ons', phase: 3, phaseName: 'Pricing', title: 'Offer extras?', subtitle: 'Add optional services or items', component: 'StepAddOns', isOptional: true, canSkip: true },

    // Phase 4: Policies
    { id: 'house-rules', phase: 4, phaseName: 'Policies', title: 'Set house rules', subtitle: 'Let guests know what to expect', component: 'StepHouseRules' },
    { id: 'safety', phase: 4, phaseName: 'Policies', title: 'Safety & cancellation', subtitle: 'Safety features and policies', component: 'StepSafety' },

    // Phase 5: Publish
    { id: 'verification', phase: 5, phaseName: 'Publish', title: 'Verify your listing', subtitle: 'Upload proof of address', component: 'StepVerification' },
    { id: 'review', phase: 5, phaseName: 'Publish', title: 'Review and publish', subtitle: 'Check everything looks good', component: 'StepReview' },
];

export const PHASES = [
    { id: 1, name: 'Property Basics', icon: 'Home' },
    { id: 2, name: 'Stand Out', icon: 'Camera' },
    { id: 3, name: 'Pricing', icon: 'DollarSign' },
    { id: 4, name: 'Policies', icon: 'Shield' },
    { id: 5, name: 'Publish', icon: 'Rocket' },
];
