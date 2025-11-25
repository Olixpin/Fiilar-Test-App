import React, { useState } from 'react';
import { X, Upload, AlertTriangle, DollarSign } from 'lucide-react';
import { createDamageReport } from '@fiilar/storage';
import { DamageReport } from '@fiilar/types';

interface DamageReportModalProps {
    bookingId: string;
    guestId: string;
    onClose: () => void;
    onSuccess: () => void;
}

const DamageReportModal: React.FC<DamageReportModalProps> = ({
    bookingId,
    guestId,
    onClose,
    onSuccess
}) => {
    const [description, setDescription] = useState('');
    const [estimatedCost, setEstimatedCost] = useState('');
    const [images, setImages] = useState<string[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files) return;

        // In production, upload to cloud storage
        // For now, create data URLs
        Array.from(files).forEach(file => {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImages(prev => [...prev, reader.result as string]);
            };
            reader.readAsDataURL(file);
        });
    };

    const handleRemoveImage = (index: number) => {
        setImages(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!description.trim()) {
            setError('Please provide a description of the damage');
            return;
        }

        if (!estimatedCost || parseFloat(estimatedCost) <= 0) {
            setError('Please provide a valid estimated cost');
            return;
        }

        if (images.length === 0) {
            setError('Please upload at least one photo of the damage');
            return;
        }

        setIsSubmitting(true);
        setError('');

        try {
            const currentUser = JSON.parse(localStorage.getItem('fiilar_user') || '{}');

            const report: DamageReport = {
                id: `dmg_${Date.now()}`,
                bookingId,
                reportedBy: currentUser.id,
                reportedTo: guestId, // In a real app, this would be the host ID
                description: description.trim(),
                images,
                estimatedCost: Number(estimatedCost),
                status: 'pending',
                createdAt: new Date().toISOString()
            };
            createDamageReport(report);

            onSuccess();
            onClose();
        } catch (err: any) {
            setError(err.message || 'Failed to submit damage report');
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                            <AlertTriangle size={20} className="text-red-600" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">Report Damage</h2>
                            <p className="text-sm text-gray-500">Document damage to your property</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-full transition"
                        title="Close"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Description */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-2">
                            Damage Description *
                        </label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Describe the damage in detail..."
                            rows={5}
                            className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
                            required
                        />
                    </div>

                    {/* Estimated Cost */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-2">
                            Estimated Repair Cost *
                        </label>
                        <div className="relative">
                            <DollarSign size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="number"
                                value={estimatedCost}
                                onChange={(e) => setEstimatedCost(e.target.value)}
                                placeholder="0.00"
                                step="0.01"
                                min="0"
                                className="w-full border border-gray-300 rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-500"
                                required
                            />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                            This amount will be requested from the guest's caution deposit
                        </p>
                    </div>

                    {/* Photo Upload */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-2">
                            Photos of Damage *
                        </label>
                        <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-brand-500 transition">
                            <input
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={handleImageUpload}
                                className="hidden"
                                id="damage-photos"
                            />
                            <label htmlFor="damage-photos" className="cursor-pointer">
                                <Upload size={32} className="mx-auto text-gray-400 mb-2" />
                                <p className="text-sm font-medium text-gray-700">Click to upload photos</p>
                                <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 10MB each</p>
                            </label>
                        </div>

                        {/* Image Preview */}
                        {images.length > 0 && (
                            <div className="grid grid-cols-3 gap-3 mt-4">
                                {images.map((img, index) => (
                                    <div key={index} className="relative group">
                                        <img
                                            src={img}
                                            alt={`Damage ${index + 1}`}
                                            className="w-full h-24 object-cover rounded-lg"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveImage(index)}
                                            className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition"
                                            title="Remove image"
                                        >
                                            <X size={14} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                            <p className="text-sm text-red-600">{error}</p>
                        </div>
                    )}

                    {/* Warning */}
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <p className="text-sm font-semibold text-yellow-900 mb-1">⚠️ Important</p>
                        <p className="text-xs text-yellow-700">
                            The guest will be notified and can accept or dispute this claim. False claims may result in account suspension.
                        </p>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-6 py-3 border border-gray-300 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 transition"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex-1 px-6 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? 'Submitting...' : 'Submit Report'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default DamageReportModal;
