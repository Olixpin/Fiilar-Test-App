import React, { useState, useRef } from 'react';
import { Listing, ListingAddOn } from '@fiilar/types';
import StepWrapper from './StepWrapper';
import { Plus, Trash2, X, Camera, Car, UtensilsCrossed, Clock, Sparkles, Package, Image as ImageIcon, Pencil } from 'lucide-react';

interface StepAddOnsProps {
    newListing: Partial<Listing>;
    setNewListing: React.Dispatch<React.SetStateAction<Partial<Listing>>>;
    currentStep: number;
    totalSteps: number;
    onNext: () => void;
    onBack: () => void;
    onSkip?: () => void;
    tempAddOn: { name: string; price: string; description: string; image?: string };
    setTempAddOn: React.Dispatch<React.SetStateAction<{ name: string; price: string; description: string; image?: string }>>;
    handleRemoveAddOn: (id: string) => void;
}

const SUGGESTED_ADDONS = [
    { name: 'Professional Cleaning', price: 15000, description: 'Deep cleaning after your stay', icon: Sparkles, color: 'bg-purple-100 text-purple-600' },
    { name: 'Airport Pickup', price: 20000, description: 'Comfortable ride from the airport', icon: Car, color: 'bg-blue-100 text-blue-600' },
    { name: 'Breakfast Service', price: 5000, description: 'Daily continental breakfast', icon: UtensilsCrossed, color: 'bg-orange-100 text-orange-600' },
    { name: 'Equipment Rental', price: 10000, description: 'Cameras, lighting, or audio gear', icon: Camera, color: 'bg-green-100 text-green-600' },
    { name: 'Catering Service', price: 50000, description: 'Food and drinks for your event', icon: UtensilsCrossed, color: 'bg-red-100 text-red-600' },
    { name: 'Late Checkout', price: 10000, description: 'Extend your checkout time', icon: Clock, color: 'bg-amber-100 text-amber-600' },
];

const StepAddOns: React.FC<StepAddOnsProps> = ({
    newListing,
    setNewListing,
    currentStep,
    totalSteps,
    onNext,
    onBack,
    onSkip,
    tempAddOn,
    setTempAddOn,
    handleRemoveAddOn,
}) => {
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null); // Track which add-on is being edited
    const fileInputRef = useRef<HTMLInputElement>(null);
    const addOns = newListing.addOns || [];

    const addSuggestedAddOn = (suggestion: typeof SUGGESTED_ADDONS[0]) => {
        const newAddOn: ListingAddOn = {
            id: `addon_${Date.now()}`,
            name: suggestion.name,
            price: suggestion.price,
            description: suggestion.description,
        };
        setNewListing(prev => ({
            ...prev,
            addOns: [...(prev.addOns || []), newAddOn]
        }));
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setTempAddOn(prev => ({ ...prev, image: reader.result as string }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleCustomAddOn = () => {
        if (!tempAddOn.name || !tempAddOn.price) return;
        
        if (editingId) {
            // Update existing add-on
            setNewListing(prev => ({
                ...prev,
                addOns: (prev.addOns || []).map(addon => 
                    addon.id === editingId 
                        ? {
                            ...addon,
                            name: tempAddOn.name,
                            price: parseInt(tempAddOn.price) || 0,
                            description: tempAddOn.description,
                            image: tempAddOn.image,
                        }
                        : addon
                )
            }));
            setEditingId(null);
        } else {
            // Create new add-on
            const newAddOn: ListingAddOn = {
                id: `addon_${Date.now()}`,
                name: tempAddOn.name,
                price: parseInt(tempAddOn.price) || 0,
                description: tempAddOn.description,
                image: tempAddOn.image,
            };
            setNewListing(prev => ({
                ...prev,
                addOns: [...(prev.addOns || []), newAddOn]
            }));
        }
        setTempAddOn({ name: '', price: '', description: '', image: '' });
        setShowForm(false);
    };

    // Start editing an existing add-on
    const handleEditAddOn = (addOn: ListingAddOn) => {
        setTempAddOn({
            name: addOn.name,
            price: addOn.price.toString(),
            description: addOn.description || '',
            image: addOn.image || '',
        });
        setEditingId(addOn.id);
        setShowForm(true);
    };

    // Cancel editing
    const handleCancelEdit = () => {
        setTempAddOn({ name: '', price: '', description: '', image: '' });
        setEditingId(null);
        setShowForm(false);
    };

    // Find matching icon for existing add-ons
    const getAddOnIcon = (name: string) => {
        const match = SUGGESTED_ADDONS.find(s => s.name === name);
        return match ? { Icon: match.icon, color: match.color } : { Icon: Package, color: 'bg-gray-100 text-gray-600' };
    };

    return (
        <StepWrapper
            title="Offer extras to your guests?"
            subtitle="Add optional services or items guests can purchase"
            currentStep={currentStep}
            totalSteps={totalSteps}
            phaseName="Pricing"
            onNext={onNext}
            onBack={onBack}
            onSkip={onSkip}
            canSkip={true}
            canContinue={true}
        >
            <div className="space-y-8">
                {/* Your Add-ons Section */}
                {addOns.length > 0 && (
                    <section>
                        <h3 className="text-sm font-semibold text-gray-900 mb-4">Your add-ons</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {addOns.map((addOn) => {
                                const { Icon, color } = getAddOnIcon(addOn.name);
                                return (
                                    <div
                                        key={addOn.id}
                                        className="group relative bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-md transition-shadow"
                                    >
                                        {/* Image or Icon Header */}
                                        <div className="h-28 bg-gray-50 flex items-center justify-center relative">
                                            {addOn.image ? (
                                                <img 
                                                    src={addOn.image} 
                                                    alt={addOn.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${color}`}>
                                                    <Icon size={28} />
                                                </div>
                                            )}
                                            {/* Action Buttons */}
                                            <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                                                <button
                                                    onClick={() => handleEditAddOn(addOn)}
                                                    className="p-1.5 bg-white/90 hover:bg-blue-50 text-gray-400 hover:text-blue-500 rounded-lg shadow-sm"
                                                    title="Edit add-on"
                                                    aria-label={`Edit ${addOn.name}`}
                                                >
                                                    <Pencil size={14} />
                                                </button>
                                                <button
                                                    onClick={() => handleRemoveAddOn(addOn.id)}
                                                    className="p-1.5 bg-white/90 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-lg shadow-sm"
                                                    title="Remove add-on"
                                                    aria-label={`Remove ${addOn.name}`}
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                            {/* No image indicator */}
                                            {!addOn.image && (
                                                <button
                                                    onClick={() => handleEditAddOn(addOn)}
                                                    className="absolute bottom-2 left-2 text-[10px] text-gray-400 hover:text-gray-600 bg-white/80 px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-all"
                                                >
                                                    + Add photo
                                                </button>
                                            )}
                                        </div>
                                        {/* Content */}
                                        <div className="p-4">
                                            <div className="flex items-start justify-between gap-2">
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="font-semibold text-gray-900 truncate">{addOn.name}</h4>
                                                    {addOn.description && (
                                                        <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{addOn.description}</p>
                                                    )}
                                                </div>
                                                <span className="font-bold text-brand-600 whitespace-nowrap">₦{addOn.price.toLocaleString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </section>
                )}

                {/* Add Custom Extra Section */}
                <section>
                    <h3 className="text-sm font-semibold text-gray-900 mb-4">
                        {editingId 
                            ? 'Edit add-on' 
                            : addOns.length > 0 
                                ? 'Add another extra' 
                                : 'Create a custom extra'
                        }
                    </h3>
                    
                    {showForm ? (
                        <div className={`bg-white border-2 rounded-2xl overflow-hidden animate-in slide-in-from-top-2 ${
                            editingId ? 'border-blue-500' : 'border-gray-900'
                        }`}>
                            {/* Image Upload Area */}
                            <div 
                                onClick={() => fileInputRef.current?.click()}
                                className="h-32 bg-gray-50 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-100 transition-colors relative"
                            >
                                {tempAddOn.image ? (
                                    <>
                                        <img 
                                            src={tempAddOn.image} 
                                            alt="Add-on preview"
                                            className="w-full h-full object-cover"
                                        />
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setTempAddOn(prev => ({ ...prev, image: '' }));
                                            }}
                                            className="absolute top-2 right-2 p-1.5 bg-white/90 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-lg shadow-sm"
                                            aria-label="Remove image"
                                        >
                                            <X size={14} />
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <ImageIcon size={24} className="text-gray-400 mb-1" />
                                        <span className="text-xs text-gray-500">Add photo (optional)</span>
                                    </>
                                )}
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                    className="hidden"
                                    aria-label="Upload add-on image"
                                    title="Upload add-on image"
                                />
                            </div>

                            {/* Form Fields */}
                            <div className="p-4 space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-gray-700">
                                        {editingId ? 'Edit extra' : 'New extra'}
                                    </span>
                                    <button
                                        onClick={handleCancelEdit}
                                        className="p-1 text-gray-400 hover:text-gray-600 rounded"
                                        title="Close form"
                                        aria-label="Close add-on form"
                                    >
                                        <X size={18} />
                                    </button>
                                </div>
                                
                                <input
                                    type="text"
                                    value={tempAddOn.name}
                                    onChange={(e) => setTempAddOn(prev => ({ ...prev, name: e.target.value }))}
                                    placeholder="Name (e.g. Projector Rental)"
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-gray-900 focus:ring-0 outline-none text-sm"
                                />
                                
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none">₦</span>
                                    <input
                                        type="number"
                                        value={tempAddOn.price}
                                        onChange={(e) => setTempAddOn(prev => ({ ...prev, price: e.target.value }))}
                                        placeholder="Price"
                                        className="w-full pl-8 pr-4 py-3 border border-gray-200 rounded-xl focus:border-gray-900 focus:ring-0 outline-none text-sm"
                                    />
                                </div>
                                
                                <input
                                    type="text"
                                    value={tempAddOn.description}
                                    onChange={(e) => setTempAddOn(prev => ({ ...prev, description: e.target.value }))}
                                    placeholder="Short description (optional)"
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-gray-900 focus:ring-0 outline-none text-sm"
                                />
                                
                                <div className="flex gap-2">
                                    {editingId && (
                                        <button
                                            onClick={handleCancelEdit}
                                            className="flex-1 py-3 rounded-xl font-medium transition-all text-sm border border-gray-300 text-gray-700 hover:bg-gray-50"
                                        >
                                            Cancel
                                        </button>
                                    )}
                                    <button
                                        onClick={handleCustomAddOn}
                                        disabled={!tempAddOn.name || !tempAddOn.price}
                                        className={`flex-1 py-3 rounded-xl font-medium transition-all text-sm ${
                                            tempAddOn.name && tempAddOn.price
                                                ? editingId 
                                                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                                                    : 'bg-gray-900 text-white hover:bg-gray-800'
                                                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                        }`}
                                    >
                                        {editingId ? 'Save Changes' : 'Add Extra'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <button
                            onClick={() => setShowForm(true)}
                            className="w-full p-6 border-2 border-dashed border-gray-300 rounded-2xl hover:border-brand-400 hover:bg-brand-50/30 transition-colors flex flex-col items-center justify-center gap-2 text-gray-500 hover:text-brand-600"
                        >
                            <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center">
                                <Plus size={24} />
                            </div>
                            <span className="font-medium">Add custom extra</span>
                            <span className="text-xs text-gray-400">With optional photo</span>
                        </button>
                    )}
                </section>

                {/* Popular Add-ons Section */}
                {SUGGESTED_ADDONS.filter(s => !addOns.some(a => a.name === s.name)).length > 0 && (
                    <section>
                        <h3 className="text-sm font-semibold text-gray-900 mb-4">Popular extras</h3>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {SUGGESTED_ADDONS.filter(s => !addOns.some(a => a.name === s.name)).map((suggestion) => {
                                const Icon = suggestion.icon;
                                return (
                                    <button
                                        key={suggestion.name}
                                        onClick={() => addSuggestedAddOn(suggestion)}
                                        className="group p-4 text-left bg-white border border-gray-200 rounded-xl hover:border-brand-300 hover:shadow-sm transition-all"
                                    >
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${suggestion.color}`}>
                                            <Icon size={20} />
                                        </div>
                                        <p className="font-medium text-gray-900 text-sm leading-tight">{suggestion.name}</p>
                                        <p className="text-xs text-gray-500 mt-1 line-clamp-1">{suggestion.description}</p>
                                        <p className="text-sm font-semibold text-brand-600 mt-2">₦{suggestion.price.toLocaleString()}</p>
                                    </button>
                                );
                            })}
                        </div>
                    </section>
                )}
            </div>
        </StepWrapper>
    );
};

export default StepAddOns;
