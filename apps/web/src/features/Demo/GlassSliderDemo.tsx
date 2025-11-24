import React, { useState } from 'react';
import GlassSlider from '../../components/GlassSlider';

const GlassSliderDemo: React.FC = () => {
    const [priceValue, setPriceValue] = useState(40);
    const [guestValue, setGuestValue] = useState(2);
    const [durationValue, setDurationValue] = useState(7);

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-6">
            <div className="w-full max-w-2xl space-y-12">
                {/* Header */}
                <div className="text-center space-y-2">
                    <h1 className="text-4xl font-bold text-gray-900 font-display">
                        Glass Slider Demo
                    </h1>
                    <p className="text-gray-600">
                        iPhone-style glassmorphism slider with backdrop blur effects
                    </p>
                </div>

                {/* Demo Card */}
                <div className="bg-white rounded-3xl shadow-xl p-8 space-y-8">
                    {/* Price Range Slider */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <label className="text-sm font-bold text-gray-600 uppercase tracking-widest">
                                Price Range
                            </label>
                            <span className="text-2xl font-bold text-brand-600">
                                ${Math.round(priceValue)}
                            </span>
                        </div>
                        <GlassSlider
                            value={priceValue}
                            min={0}
                            max={1000}
                            onChange={setPriceValue}
                            className="w-full"
                        />
                        <div className="flex justify-between text-xs text-gray-400">
                            <span>$0</span>
                            <span>$1000</span>
                        </div>
                    </div>

                    {/* Guest Count Slider */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <label className="text-sm font-bold text-gray-600 uppercase tracking-widest">
                                Number of Guests
                            </label>
                            <span className="text-2xl font-bold text-brand-600">
                                {Math.round(guestValue)}
                            </span>
                        </div>
                        <GlassSlider
                            value={guestValue}
                            min={1}
                            max={20}
                            onChange={setGuestValue}
                            className="w-full"
                        />
                        <div className="flex justify-between text-xs text-gray-400">
                            <span>1 guest</span>
                            <span>20 guests</span>
                        </div>
                    </div>

                    {/* Duration Slider */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <label className="text-sm font-bold text-gray-600 uppercase tracking-widest">
                                Duration (Days)
                            </label>
                            <span className="text-2xl font-bold text-brand-600">
                                {Math.round(durationValue)} days
                            </span>
                        </div>
                        <GlassSlider
                            value={durationValue}
                            min={1}
                            max={30}
                            onChange={setDurationValue}
                            className="w-full"
                        />
                        <div className="flex justify-between text-xs text-gray-400">
                            <span>1 day</span>
                            <span>30 days</span>
                        </div>
                    </div>
                </div>

                {/* Instructions */}
                <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 space-y-3">
                    <h3 className="font-bold text-blue-900 flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        How it works
                    </h3>
                    <ul className="text-sm text-blue-800 space-y-2 ml-7">
                        <li>• Drag the slider thumb to see the glassmorphism effect activate</li>
                        <li>• The glass effect uses backdrop blur and layered shadows</li>
                        <li>• Notice the subtle scale animation when dragging</li>
                        <li>• Works on both desktop (mouse) and mobile (touch)</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default GlassSliderDemo;
