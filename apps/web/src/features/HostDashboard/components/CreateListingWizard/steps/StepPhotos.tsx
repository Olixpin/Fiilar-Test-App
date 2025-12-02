import React, { useState } from 'react';
import { Listing } from '@fiilar/types';
import StepWrapper from './StepWrapper';
import { Upload, Plus, Trash2, GripVertical, ZoomIn, X, CheckCircle, AlertTriangle, Camera, Sparkles } from 'lucide-react';

interface StepPhotosProps {
    newListing: Partial<Listing>;
    currentStep: number;
    totalSteps: number;
    onNext: () => void;
    onBack: () => void;
    handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleImageDragStart: (index: number) => void;
    handleImageDragOver: (e: React.DragEvent, index: number) => void;
    handleImageDragEnd: () => void;
    removeImage: (index: number) => void;
    draggedImageIndex: number | null;
}

const MIN_PHOTOS = 5;

const StepPhotos: React.FC<StepPhotosProps> = ({
    newListing,
    currentStep,
    totalSteps,
    onNext,
    onBack,
    handleImageUpload,
    handleImageDragStart,
    handleImageDragOver,
    handleImageDragEnd,
    removeImage,
    draggedImageIndex,
}) => {
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const images = newListing.images || [];
    const photoCount = images.length;
    const hasEnoughPhotos = photoCount >= MIN_PHOTOS;

    return (
        <StepWrapper
            title="Add photos of your space"
            subtitle="Great photos help your listing stand out"
            currentStep={currentStep}
            totalSteps={totalSteps}
            phaseName="Stand Out"
            onNext={onNext}
            onBack={onBack}
            canContinue={true} // Allow continuing even without photos (will be draft)
        >
            <div className="space-y-6">
                {/* Photo Count Badge */}
                <div className="flex items-center justify-between">
                    <div className={`px-3 py-1.5 rounded-full text-sm font-medium ${hasEnoughPhotos
                            ? 'bg-green-100 text-green-700'
                            : 'bg-amber-100 text-amber-700'
                        }`}>
                        {photoCount} / {MIN_PHOTOS} minimum photos {hasEnoughPhotos ? '✓' : 'required'}
                    </div>
                    {!hasEnoughPhotos && (
                        <p className="text-xs text-gray-500">
                            Add {MIN_PHOTOS - photoCount} more to publish
                        </p>
                    )}
                </div>

                {/* Free Photography Promo Banner */}
                <div className="relative overflow-hidden bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 rounded-2xl p-4 sm:p-5">
                    <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNnoiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjEpIiBzdHJva2Utd2lkdGg9IjIiLz48L2c+PC9zdmc+')] opacity-30" />
                    <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
                        <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                            <Camera className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                                <Sparkles className="w-4 h-4 text-yellow-300" />
                                <span className="text-xs sm:text-sm font-medium text-yellow-300">Limited Offer</span>
                            </div>
                            <h4 className="text-sm sm:text-base font-semibold text-white mb-0.5 sm:mb-1">
                                Your space is one of the lucky 100!
                            </h4>
                            <p className="text-xs sm:text-sm text-white/80">
                                We're offering free professional photography for select spaces.
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={() => {
                                // TODO: Implement photography request
                                console.log('Photography request clicked');
                            }}
                            className="flex-shrink-0 w-full sm:w-auto px-4 py-2.5 bg-white text-indigo-600 font-semibold text-sm rounded-xl hover:bg-white/90 transition-colors shadow-lg shadow-indigo-900/20"
                        >
                            Request Free Photos
                        </button>
                    </div>
                </div>

                {/* Upload Area */}
                {photoCount === 0 ? (
                    // Empty State
                    <label className="block w-full min-h-[200px] sm:min-h-[300px] border-2 border-dashed border-gray-300 rounded-2xl hover:border-gray-400 hover:bg-gray-50 transition-all cursor-pointer">
                        <input
                            type="file"
                            multiple
                            accept="image/*"
                            className="hidden"
                            onChange={handleImageUpload}
                        />
                        <div className="h-full flex flex-col items-center justify-center p-6 sm:p-8 text-center">
                            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-3 sm:mb-4">
                                <Upload size={24} className="text-gray-400 sm:hidden" />
                                <Upload size={28} className="text-gray-400 hidden sm:block" />
                            </div>
                            <h4 className="text-base sm:text-lg font-semibold text-gray-900 mb-1 sm:mb-2">
                                Drag photos here
                            </h4>
                            <p className="text-sm sm:text-base text-gray-500 mb-3 sm:mb-4">or click to browse</p>
                            <span className="text-xs sm:text-sm text-gray-400">
                                Minimum of {MIN_PHOTOS} photos required
                            </span>
                        </div>
                    </label>
                ) : (
                    // Photo Grid
                    <div className="space-y-4">
                        {/* Main Photo */}
                        <div
                            className="relative aspect-video rounded-2xl overflow-hidden bg-gray-100 group"
                            draggable
                            onDragStart={() => handleImageDragStart(0)}
                            onDragOver={(e) => handleImageDragOver(e, 0)}
                            onDragEnd={handleImageDragEnd}
                        >
                            <img
                                src={images[0]}
                                alt="Main photo"
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />

                            {/* Cover Badge */}
                            <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs font-semibold text-gray-900">
                                Cover photo
                            </div>

                            {/* Actions */}
                            <div className="absolute top-3 right-3 flex gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={() => setPreviewImage(images[0])}
                                    className="p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-colors"
                                    title="Preview image"
                                    aria-label="Preview image"
                                >
                                    <ZoomIn size={16} className="text-gray-700" />
                                </button>
                                <button
                                    onClick={() => removeImage(0)}
                                    className="p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-red-50 transition-colors"
                                    title="Remove image"
                                    aria-label="Remove image"
                                >
                                    <Trash2 size={16} className="text-red-600" />
                                </button>
                            </div>

                            {/* Drag Handle */}
                            <div className="absolute bottom-3 left-3 p-2 bg-white/80 backdrop-blur-sm rounded-lg opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity cursor-grab">
                                <GripVertical size={16} className="text-gray-500" />
                            </div>
                        </div>

                        {/* Other Photos Grid */}
                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                            {images.slice(1).map((image, idx) => {
                                const actualIndex = idx + 1;
                                return (
                                    <div
                                        key={actualIndex}
                                        className={`relative aspect-square rounded-xl overflow-hidden bg-gray-100 group cursor-grab ${draggedImageIndex === actualIndex ? 'opacity-50 scale-95' : ''
                                            }`}
                                        draggable
                                        onDragStart={() => handleImageDragStart(actualIndex)}
                                        onDragOver={(e) => handleImageDragOver(e, actualIndex)}
                                        onDragEnd={handleImageDragEnd}
                                    >
                                        <img
                                            src={image}
                                            alt={`Photo ${actualIndex + 1}`}
                                            className="w-full h-full object-cover"
                                        />
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />

                                        {/* Actions */}
                                        <div className="absolute top-1 right-1 sm:top-2 sm:right-2 flex gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => setPreviewImage(image)}
                                                className="p-1 sm:p-1.5 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white"
                                                title="Preview image"
                                                aria-label="Preview image"
                                            >
                                                <ZoomIn size={12} className="text-gray-700 sm:hidden" />
                                                <ZoomIn size={14} className="text-gray-700 hidden sm:block" />
                                            </button>
                                            <button
                                                onClick={() => removeImage(actualIndex)}
                                                className="p-1 sm:p-1.5 bg-white/90 backdrop-blur-sm rounded-full hover:bg-red-50"
                                                title="Remove image"
                                                aria-label="Remove image"
                                            >
                                                <Trash2 size={12} className="text-red-600 sm:hidden" />
                                                <Trash2 size={14} className="text-red-600 hidden sm:block" />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}

                            {/* Add More Button */}
                            <label className="aspect-square rounded-xl border-2 border-dashed border-gray-300 hover:border-gray-400 hover:bg-gray-50 transition-all cursor-pointer flex flex-col items-center justify-center">
                                <input
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleImageUpload}
                                />
                                <Plus size={20} className="text-gray-400 mb-1 sm:hidden" />
                                <Plus size={24} className="text-gray-400 mb-1 hidden sm:block" />
                                <span className="text-[10px] sm:text-xs text-gray-500">Add more</span>
                            </label>
                        </div>
                    </div>
                )}

                {/* Tips */}
                <div className="p-3 sm:p-4 bg-gray-50 rounded-xl">
                    <h4 className="text-xs sm:text-sm font-medium text-gray-900 mb-2">Photo tips</h4>
                    <ul className="text-xs sm:text-sm text-gray-600 space-y-1.5">
                        <li className="flex items-start gap-2">
                            <CheckCircle size={14} className="text-green-500 mt-0.5 shrink-0" />
                            <span>Use natural light for best results</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <CheckCircle size={14} className="text-green-500 mt-0.5 shrink-0" />
                            <span>Show all rooms and amenities</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <CheckCircle size={14} className="text-green-500 mt-0.5 shrink-0" />
                            <span>Drag photos to reorder them</span>
                        </li>
                    </ul>
                </div>

                {/* Warning if not enough photos */}
                {!hasEnoughPhotos && photoCount > 0 && (
                    <div className="flex items-start gap-3 p-4 bg-amber-50 rounded-xl border border-amber-100">
                        <AlertTriangle size={20} className="text-amber-600 shrink-0 mt-0.5" />
                        <div>
                            <p className="text-sm font-medium text-amber-900">
                                Your listing will be saved as a draft
                            </p>
                            <p className="text-xs text-amber-700 mt-1">
                                A minimum of {MIN_PHOTOS} photos is required to publish your listing.
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {/* Image Preview Modal */}
            {previewImage && (
                <div
                    className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
                    onClick={() => setPreviewImage(null)}
                >
                    <button
                        className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
                        onClick={() => setPreviewImage(null)}
                        title="Close preview"
                        aria-label="Close preview"
                    >
                        <X size={24} className="text-white" />
                    </button>
                    <img
                        src={previewImage}
                        alt="Preview"
                        className="max-w-full max-h-full object-contain rounded-lg"
                        onClick={(e) => e.stopPropagation()}
                    />
                </div>
            )}
        </StepWrapper>
    );
};

export default StepPhotos;
