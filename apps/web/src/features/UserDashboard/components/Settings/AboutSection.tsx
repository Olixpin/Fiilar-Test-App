import React from 'react';
import { FileText, Shield } from 'lucide-react';

export const AboutSection: React.FC = () => {
    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 space-y-6">
            <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">About Fiilar</h2>
                <p className="text-gray-700 leading-relaxed">
                    Fiilar is your trusted marketplace for booking unique spaces and experiences. We connect hosts with guests, making it easy to find and book the perfect space for any occasion.
                </p>
            </div>

            <div className="grid grid-cols-3 gap-4 py-6 border-y border-gray-200">
                <div className="text-center">
                    <p className="text-3xl font-bold text-brand-600">10K+</p>
                    <p className="text-sm text-gray-600 mt-1">Active Users</p>
                </div>
                <div className="text-center">
                    <p className="text-3xl font-bold text-brand-600">5K+</p>
                    <p className="text-sm text-gray-600 mt-1">Listings</p>
                </div>
                <div className="text-center">
                    <p className="text-3xl font-bold text-brand-600">50K+</p>
                    <p className="text-sm text-gray-600 mt-1">Bookings</p>
                </div>
            </div>

            <div>
                <h3 className="font-semibold text-gray-900 mb-3">Our Mission</h3>
                <p className="text-gray-700 leading-relaxed">
                    To make space booking simple, secure, and accessible for everyone. We believe in creating connections through shared spaces.
                </p>
            </div>

            <div className="pt-6 border-t border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-4">Legal & Privacy</h3>
                <div className="flex flex-wrap gap-4">
                    <a href="#" className="flex items-center gap-2 text-brand-600 hover:text-brand-700 text-sm font-medium">
                        <FileText size={16} />
                        Terms of Service
                    </a>
                    <a href="#" className="flex items-center gap-2 text-brand-600 hover:text-brand-700 text-sm font-medium">
                        <Shield size={16} />
                        Privacy Policy
                    </a>
                </div>
            </div>

            <div className="pt-6 border-t border-gray-200">
                <p className="text-xs text-gray-500">Version 1.0.0 • © 2024 Fiilar. All rights reserved.</p>
            </div>
        </div>
    );
};
