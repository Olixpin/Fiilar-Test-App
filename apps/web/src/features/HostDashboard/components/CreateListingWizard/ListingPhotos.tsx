import React, { useState } from 'react';
import { Listing } from '@fiilar/types';
import { Button } from '@fiilar/ui';
import {
    Sparkles, Upload, Plus, Trash2, CheckCircle, ArrowRight, AlertTriangle, ZoomIn, X
} from 'lucide-react';

interface ListingPhotosProps {
    newListing: Partial<Listing>;
    setStep: (step: number) => void;
    handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleImageDragStart: (index: number) => void;
    handleImageDragOver: (e: React.DragEvent, index: number) => void;
    handleImageDragEnd: () => void;
    removeImage: (index: number) => void;
    draggedImageIndex: number | null;
}

const ListingPhotos: React.FC<ListingPhotosProps> = ({
    newListing, setStep,
    handleImageUpload, handleImageDragStart, handleImageDragOver, handleImageDragEnd, removeImage,
    draggedImageIndex
}) => {
    const [previewImage, setPreviewImage] = useState<string | null>(null);

    return (
        <div className="space-y-8 animate-in slide-in-from-right duration-500">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-xl font-bold text-gray-900">Property Photos</h3>
                    <p className="text-gray-500 text-sm mt-1">Showcase your property with high-quality images.</p>
                </div>
                <div className="bg-brand-50 text-brand-700 px-3 py-1 rounded-full text-xs font-bold border border-brand-100">
                    {newListing.images?.length || 0} Photos
                </div>
            </div>

            {/* Empty State / Drop Zone */}
            {(!newListing.images || newListing.images.length === 0) ? (
                <div className="space-y-6">
                    <label className="block w-full min-h-[400px] border-3 border-dashed border-gray-300 rounded-3xl hover:border-brand-500 hover:bg-brand-50/30 transition-all duration-300 cursor-pointer group relative overflow-hidden bg-white/50 backdrop-blur-sm">
                        <input type="file" multiple accept="image/*" className="hidden" onChange={handleImageUpload} />
                        <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center z-10">
                            <div className="w-24 h-24 bg-gradient-to-br from-brand-500 to-purple-600 rounded-3xl shadow-xl shadow-brand-500/20 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                                <Upload size={40} className="text-white" />
                            </div>
                            <h4 className="text-3xl font-bold text-gray-900 mb-2 tracking-tight">Drag & drop photos here</h4>
                            <p className="text-gray-500 mb-8 text-lg">or click to browse from your device</p>

                            <div className="flex flex-wrap gap-3 justify-center max-w-lg">
                                <span className="flex items-center gap-2 bg-white/80 backdrop-blur text-gray-700 text-sm px-4 py-2 rounded-full font-medium border border-gray-200 shadow-sm">
                                    <CheckCircle size={16} className="text-green-500" /> High Resolution
                                </span>
                                <span className="flex items-center gap-2 bg-white/80 backdrop-blur text-gray-700 text-sm px-4 py-2 rounded-full font-medium border border-gray-200 shadow-sm">
                                    <CheckCircle size={16} className="text-green-500" /> Landscape Preferred
                                </span>
                                <span className="flex items-center gap-2 bg-white/80 backdrop-blur text-gray-700 text-sm px-4 py-2 rounded-full font-medium border border-gray-200 shadow-sm">
                                    <CheckCircle size={16} className="text-green-500" /> Max 10MB each
                                </span>
                            </div>
                        </div>

                        {/* Decorative background pattern */}
                        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
                    </label>

                    <div className="glass-card p-5 rounded-2xl border border-blue-100 bg-blue-50/30 flex gap-4 items-start">
                        <div className="p-3 bg-white rounded-xl text-blue-600 h-fit shadow-sm shrink-0">
                            <Sparkles size={20} />
                        </div>
                        <div>
                            <h4 className="font-bold text-sm text-blue-900 mb-2">Photo Tips for Success</h4>
                            <ul className="text-sm text-blue-800 space-y-2">
                                <li className="flex items-start gap-2">
                                    <CheckCircle size={16} className="shrink-0 mt-0.5 text-blue-600" />
                                    <span>Upload at least 5 high-quality photos - listings with fewer will be saved as <strong>Drafts</strong></span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle size={16} className="shrink-0 mt-0.5 text-blue-600" />
                                    <span>Use natural light and avoid flash for best results</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle size={16} className="shrink-0 mt-0.5 text-blue-600" />
                                    <span>Show all amenities: kitchen, bathroom, workspace, etc.</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="space-y-6">
                    {/* Bento-style Photo Grid */}
                    <div className="grid grid-cols-6 auto-rows-[120px] gap-2">
                        {newListing.images.map((img, index) => {
                            // Bento layout: first image is large, rest fill remaining space
                            let gridClass = '';
                            if (index === 0) {
                                // Cover photo - large left side
                                gridClass = 'col-span-4 row-span-3';
                            } else if (index === 1 || index === 2) {
                                // Two stacked on right of cover
                                gridClass = 'col-span-2 row-span-1';
                            } else if (index === 3) {
                                // Third image - spans 2 rows on right
                                gridClass = 'col-span-2 row-span-1';
                            } else {
                                // Remaining images - standard squares
                                gridClass = 'col-span-2 row-span-1';
                            }

                            return (
                                <div
                                    key={index}
                                    className={`
                                        relative rounded-xl overflow-hidden group cursor-move bg-gray-100 
                                        ${draggedImageIndex === index ? 'opacity-50 ring-4 ring-brand-500 scale-95' : 'hover:shadow-xl hover:scale-[1.01] transition-all duration-300'}
                                        ${gridClass}
                                    `}
                                    draggable
                                    onDragStart={() => handleImageDragStart(index)}
                                    onDragOver={(e) => handleImageDragOver(e, index)}
                                    onDragEnd={handleImageDragEnd}
                                >
                                    <img 
                                        src={img} 
                                        alt={`Listing photo ${index + 1}`} 
                                        className="w-full h-full object-cover"
                                    />

                                {/* Overlay Actions */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                                <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0 z-10">
                                    <button
                                        onClick={(e) => { e.stopPropagation(); setPreviewImage(img); }}
                                        className="p-2 bg-white/90 backdrop-blur-sm text-gray-700 rounded-xl hover:bg-white hover:text-brand-600 shadow-lg transition-colors"
                                        title="View full size"
                                    >
                                        <ZoomIn size={18} />
                                    </button>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); removeImage(index); }}
                                        className="p-2 bg-white/90 backdrop-blur-sm text-red-500 rounded-xl hover:bg-red-50 hover:text-red-600 shadow-lg transition-colors"
                                        title="Remove photo"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>

                                {index === 0 && (
                                    <div className="absolute top-3 left-3 bg-gradient-to-r from-brand-600 to-purple-600 text-white text-xs px-3 py-1.5 rounded-lg font-bold shadow-lg flex items-center gap-1.5 z-10">
                                        <Sparkles size={14} /> Cover Photo
                                    </div>
                                )}

                                {index !== 0 && (
                                    <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                        <div className="bg-black/40 backdrop-blur-md text-white text-xs px-3 py-2 rounded-lg text-center font-medium border border-white/20">
                                            Drag to reorder
                                        </div>
                                    </div>
                                )}
                            </div>
                            );
                        })}

                        {/* Add More Button - Matches grid cell */}
                        <label 
                            className={`
                                relative rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer 
                                hover:border-brand-500 hover:bg-brand-50/30 transition-all duration-300 group bg-white/50 backdrop-blur-sm
                                col-span-2 row-span-1
                                ${newListing.images.length === 0 ? 'hidden' : ''}
                            `}
                        >
                            <input type="file" multiple accept="image/*" className="hidden" onChange={handleImageUpload} />
                            <div className="p-3 bg-white rounded-full shadow-md group-hover:scale-110 transition-transform mb-1">
                                <Plus size={20} className="text-brand-600" />
                            </div>
                            <span className="text-xs text-gray-600 font-bold group-hover:text-brand-600 transition-colors">Add More</span>
                        </label>
                    </div>
                </div>
            )}

            {/* Warning for low image count */}
            {newListing.images && newListing.images.length > 0 && newListing.images.length < 5 && (
                <div className="flex items-start gap-3 bg-orange-50 p-4 rounded-xl border border-orange-100 animate-in fade-in slide-in-from-bottom-2">
                    <AlertTriangle className="shrink-0 mt-0.5 text-orange-600" size={20} />
                    <div>
                        <h4 className="font-bold text-sm text-orange-900">Minimum 5 photos recommended</h4>
                        <p className="text-sm text-orange-800 mt-0.5">
                            You can continue, but your listing will be saved as a <strong>Draft</strong> until you upload at least 5 photos.
                        </p>
                    </div>
                </div>
            )}

            {/* Navigation */}
            <div className="flex justify-between items-center pt-6 border-t border-white/20">
                <Button
                    onClick={() => setStep(1)}
                    variant="ghost"
                    size="lg"
                    className="text-gray-500 hover:text-gray-900"
                >
                    Back
                </Button>
                <Button
                    onClick={() => setStep(3)}
                    disabled={false}
                    variant="primary"
                    size="lg"
                    className="shadow-xl shadow-brand-500/20 hover:shadow-brand-500/40 transition-all hover:scale-[1.02] relative overflow-hidden group"
                    rightIcon={<ArrowRight size={18} />}
                >
                    <span className="relative z-10">Continue to Availability</span>
                    {/* Shine effect */}
                    <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent z-0"></div>
                </Button>
            </div>

            {/* Image Preview Modal */}
            {previewImage && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-xl animate-in fade-in duration-200" onClick={() => setPreviewImage(null)}>
                    <button
                        className="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
                        onClick={() => setPreviewImage(null)}
                    >
                        <X size={24} />
                    </button>
                    <img
                        src={previewImage}
                        alt="Preview"
                        className="max-w-[90vw] max-h-[90vh] object-contain rounded-lg shadow-2xl animate-in zoom-in-95 duration-300"
                        onClick={(e) => e.stopPropagation()}
                    />
                </div>
            )}
        </div>
    );
};

export default ListingPhotos;
