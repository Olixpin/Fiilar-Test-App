import React from 'react';
import { Listing } from '@fiilar/types';
import { Button } from '@fiilar/ui';
import {
    Sparkles, Upload, Plus, Trash2, CheckCircle, ArrowRight
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
    return (
        <div className="space-y-6 max-w-4xl mx-auto animate-in slide-in-from-right duration-300">
            {/* Empty State / Drop Zone */}
            {(!newListing.images || newListing.images.length === 0) ? (
                <div className="space-y-6">
                    <label className="block w-full min-h-[400px] border-3 border-dashed border-gray-300 rounded-2xl hover:border-brand-500 hover:bg-brand-50/30 transition-all duration-300 cursor-pointer group relative overflow-hidden bg-white">
                        <input type="file" multiple accept="image/*" className="hidden" onChange={handleImageUpload} />
                        <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center">
                            <div className="w-20 h-20 bg-brand-600 rounded-2xl shadow-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-all duration-300">
                                <Upload size={36} className="text-white" />
                            </div>
                            <h4 className="text-2xl font-bold text-gray-900 mb-2">Drag & drop photos here</h4>
                            <p className="text-sm text-gray-500 mb-8">or click to browse from your device</p>
                            <div className="flex flex-wrap gap-3 justify-center">
                                <span className="flex items-center gap-2 bg-green-50 text-green-700 text-xs px-4 py-2 rounded-full font-medium border border-green-200">
                                    <CheckCircle size={16} /> High Resolution
                                </span>
                                <span className="flex items-center gap-2 bg-blue-50 text-blue-700 text-xs px-4 py-2 rounded-full font-medium border border-blue-200">
                                    <CheckCircle size={16} /> Landscape Preferred
                                </span>
                                <span className="flex items-center gap-2 bg-purple-50 text-purple-700 text-xs px-4 py-2 rounded-full font-medium border border-purple-200">
                                    <CheckCircle size={16} /> Max 10MB each
                                </span>
                            </div>
                        </div>
                    </label>

                    <div className="bg-linear-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-5 flex gap-4">
                        <div className="p-3 bg-white rounded-xl text-blue-600 h-fit shadow-sm">
                            <Sparkles size={20} />
                        </div>
                        <div>
                            <h4 className="font-bold text-sm text-blue-900 mb-2">Photo Tips for Success</h4>
                            <ul className="text-xs text-blue-800 space-y-1.5">
                                <li className="flex items-start gap-2">
                                    <CheckCircle size={14} className="shrink-0 mt-0.5 text-blue-600" />
                                    <span>Upload at least 5 high-quality photos - listings with more photos get <strong>40% more bookings</strong></span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle size={14} className="shrink-0 mt-0.5 text-blue-600" />
                                    <span>Use natural light and avoid flash for best results</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle size={14} className="shrink-0 mt-0.5 text-blue-600" />
                                    <span>Show all amenities: kitchen, bathroom, workspace, etc.</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="space-y-6">
                    {/* Photo Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {newListing.images.map((img, index) => (
                            <div
                                key={index}
                                className={`
                                relative rounded-2xl overflow-hidden group cursor-move bg-gray-100 border-2 border-gray-200
                                ${draggedImageIndex === index ? 'opacity-50 ring-4 ring-brand-500 scale-95' : 'hover:shadow-xl hover:scale-[1.02] transition-all duration-200'}
                                ${index === 0 ? 'col-span-2 row-span-2 aspect-video' : 'aspect-square'}
                            `}
                                draggable
                                onDragStart={() => handleImageDragStart(index)}
                                onDragOver={(e) => handleImageDragOver(e, index)}
                                onDragEnd={handleImageDragEnd}
                            >
                                <img src={img} alt={`Listing photo ${index + 1}`} className="w-full h-full object-cover" />

                                {/* Overlay Actions */}
                                <div className="absolute inset-0 bg-linear-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                                <Button
                                    onClick={() => removeImage(index)}
                                    variant="ghost"
                                    size="sm"
                                    className="absolute top-3 right-3 p-2.5 bg-white/95 backdrop-blur-sm text-red-500 rounded-xl opacity-0 group-hover:opacity-100 transition-all hover:bg-red-50 hover:scale-110 shadow-lg z-10 h-auto min-w-0"
                                    title="Remove photo"
                                >
                                    <Trash2 size={18} />
                                </Button>

                                {index === 0 && (
                                    <div className="absolute top-3 left-3 bg-linear-to-r from-brand-600 to-purple-600 text-white text-xs px-3 py-2 rounded-xl font-bold shadow-lg flex items-center gap-1.5 z-10">
                                        <Sparkles size={14} /> Cover Photo
                                    </div>
                                )}

                                {index !== 0 && (
                                    <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                        <div className="bg-black/70 backdrop-blur-sm text-white text-xs px-3 py-2 rounded-lg text-center font-medium">
                                            Drag to reorder
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}

                        {/* Add More Button */}
                        <label className={`
                        aspect-square border-3 border-dashed border-gray-300 rounded-2xl flex flex-col items-center justify-center cursor-pointer 
                        hover:border-brand-500 hover:bg-linear-to-br hover:from-brand-50 hover:to-purple-50 transition-all duration-300 group bg-white
                        ${newListing.images.length === 0 ? 'hidden' : ''}
                    `}>
                            <input type="file" multiple accept="image/*" className="hidden" onChange={handleImageUpload} />
                            <div className="p-3 bg-gray-100 rounded-full group-hover:bg-brand-100 transition-colors mb-2">
                                <Plus size={28} className="text-gray-400 group-hover:text-brand-600 transition-colors" />
                            </div>
                            <span className="text-sm text-gray-600 font-semibold group-hover:text-brand-600 transition-colors">Add More</span>
                        </label>
                    </div>
                </div>
            )}

            {/* Navigation */}
            <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                <Button
                    onClick={() => setStep(1)}
                    variant="outline"
                    size="lg"
                >
                    Back
                </Button>
                <Button
                    onClick={() => setStep(3)}
                    disabled={false}
                    variant="primary"
                    size="lg"
                    rightIcon={<ArrowRight size={18} />}
                >
                    Continue to Availability
                </Button>
            </div>
        </div>
    );
};

export default ListingPhotos;
