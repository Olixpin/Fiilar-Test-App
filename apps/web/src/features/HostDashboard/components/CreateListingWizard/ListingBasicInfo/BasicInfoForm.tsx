import React from 'react';
import { Listing, SpaceType, BookingType } from '@fiilar/types';
import { Input, Select, TextArea } from '@fiilar/ui';
import { Home, MapPin, DollarSign, Users } from 'lucide-react';

interface BasicInfoFormProps {
    newListing: Partial<Listing>;
    setNewListing: React.Dispatch<React.SetStateAction<Partial<Listing>>>;
}

const BasicInfoForm: React.FC<BasicInfoFormProps> = ({ newListing, setNewListing }) => {
    return (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="bg-linear-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                    <Home size={18} className="text-brand-600" />
                    Basic Information
                </h3>
                <p className="text-xs text-gray-600 mt-1">Tell us about your space</p>
            </div>

            <div className="p-6 space-y-6">
                {/* Listing Title */}
                <div className="group">
                    <Input
                        label="Listing Title"
                        placeholder="e.g. Modern Studio in Lekki Phase 1"
                        value={newListing.title || ''}
                        onChange={(e) => setNewListing({ ...newListing, title: e.target.value })}
                        helperText="Make it catchy and descriptive"
                        variant="glass"
                        inputSize="md"
                        fullWidth
                    />
                    {newListing.title && (
                        <p className="text-xs text-gray-400 text-right mt-1">{newListing.title.length}/100</p>
                    )}
                </div>

                {/* Space Type & Location */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Select
                        label="Space Type"
                        value={newListing.type}
                        onChange={(e) => setNewListing({ ...newListing, type: e.target.value as SpaceType })}
                        icon={Home}
                        iconPosition="left"
                        variant="glass"
                        helperText="What type of space are you listing?"
                    >
                        {Object.values(SpaceType).map(t => <option key={t} value={t}>{t}</option>)}
                    </Select>

                    <Input
                        label="Public Location (Area)"
                        placeholder="e.g. Lekki Phase 1, Lagos"
                        value={newListing.location || ''}
                        onChange={(e) => setNewListing({ ...newListing, location: e.target.value })}
                        icon={MapPin}
                        iconPosition="left"
                        variant="glass"
                        helperText="Publicly visible. General area only."
                        fullWidth
                    />
                </div>

                {/* Private Address */}
                <Input
                    label="Exact Address (Private)"
                    placeholder="e.g. 123 Admiralty Way, Lekki Phase 1"
                    value={newListing.address || ''}
                    onChange={(e) => setNewListing({ ...newListing, address: e.target.value })}
                    icon={Home}
                    iconPosition="left"
                    variant="glass"
                    helperText="Only shared with guests after booking is confirmed."
                    fullWidth
                />

                {/* Price & Unit */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input
                        label="Price"
                        type="number"
                        placeholder="0.00"
                        value={newListing.price ?? ''}
                        onChange={(e) => {
                            const val = parseFloat(e.target.value);
                            setNewListing({ ...newListing, price: isNaN(val) ? undefined : val });
                        }}
                        icon={DollarSign}
                        iconPosition="left"
                        variant="glass"
                        helperText="Set your base rate"
                        fullWidth
                    />

                    <Select
                        label="Pricing Unit"
                        value={newListing.priceUnit}
                        onChange={(e) => setNewListing({ ...newListing, priceUnit: e.target.value as BookingType })}
                        variant="glass"
                        helperText="How do you charge guests?"
                    >
                        <option value={BookingType.DAILY}>Per Night</option>
                        <option value={BookingType.HOURLY}>Per Hour</option>
                    </Select>
                </div>

                {/* Capacity & Included Guests */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input
                        label="Maximum Capacity"
                        type="number"
                        min="1"
                        value={newListing.capacity ?? ''}
                        onChange={(e) => {
                            const val = parseInt(e.target.value);
                            setNewListing({ ...newListing, capacity: isNaN(val) ? undefined : val });
                        }}
                        icon={Users}
                        iconPosition="left"
                        variant="glass"
                        helperText="Maximum number of guests"
                        fullWidth
                    />

                    <Input
                        label="Base Price Covers"
                        type="number"
                        min="1"
                        value={newListing.includedGuests ?? ''}
                        onChange={(e) => {
                            const val = parseInt(e.target.value);
                            setNewListing({ ...newListing, includedGuests: isNaN(val) ? undefined : val });
                        }}
                        variant="glass"
                        helperText="Number of guests included in base price"
                        fullWidth
                    />
                </div>

                {/* Extra Cost Per Guest */}
                <Input
                    label="Extra Cost Per Guest"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0"
                    value={newListing.pricePerExtraGuest ?? ''}
                    onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        setNewListing({ ...newListing, pricePerExtraGuest: isNaN(val) ? undefined : val });
                    }}
                    variant="glass"
                    helperText="Charge per additional guest beyond base price coverage"
                    fullWidth
                />

                {/* Caution Fee / Security Deposit */}
                <Input
                    label="Caution Fee / Security Deposit"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    value={newListing.cautionFee ?? ''}
                    onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        setNewListing({ ...newListing, cautionFee: isNaN(val) ? undefined : val });
                    }}
                    variant="glass"
                    helperText="This amount will be added to the total but is refundable if no damages occur."
                    fullWidth
                />

                {/* Description */}
                <div>
                    <TextArea
                        label="Description"
                        placeholder="Describe your space in detail... What makes it special? What amenities do you offer? What's the neighborhood like?"
                        value={newListing.description || ''}
                        onChange={(e) => setNewListing({ ...newListing, description: e.target.value })}
                        variant="glass"
                        resize="none"
                        helperText="Help guests imagine staying at your place"
                        rows={5}
                    />
                    {newListing.description && (
                        <p className="text-xs text-gray-400 text-right mt-1">{newListing.description.length} characters</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BasicInfoForm;
