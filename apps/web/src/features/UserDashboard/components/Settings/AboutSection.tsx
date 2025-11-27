import React from 'react';
import { FileText, Shield, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { APP_INFO } from '@fiilar/storage';

export const AboutSection: React.FC = () => {
    return (
        <div className="space-y-8">
            <div className="border-b border-gray-100 pb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">About Fiilar</h2>
                <p className="text-gray-500 leading-relaxed max-w-2xl">
                    Fiilar is your trusted marketplace for booking unique spaces and experiences. We connect hosts with guests, making it easy to find and book the perfect space for any occasion.
                </p>
            </div>

            <div className="grid grid-cols-3 gap-8 py-2">
                <div>
                    <p className="text-3xl font-bold text-brand-600">10K+</p>
                    <p className="text-sm font-medium text-gray-500 mt-1">Active Users</p>
                </div>
                <div>
                    <p className="text-3xl font-bold text-brand-600">5K+</p>
                    <p className="text-sm font-medium text-gray-500 mt-1">Listings</p>
                </div>
                <div>
                    <p className="text-3xl font-bold text-brand-600">50K+</p>
                    <p className="text-sm font-medium text-gray-500 mt-1">Bookings</p>
                </div>
            </div>

            <div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">Our Mission</h3>
                <p className="text-gray-600 leading-relaxed max-w-2xl">
                    To make space booking simple, secure, and accessible for everyone. We believe in creating connections through shared spaces, fostering a community where creativity and collaboration can thrive.
                </p>
            </div>

            <div className="pt-6 border-t border-gray-100">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Legal & Privacy</h3>
                <div className="flex flex-col sm:flex-row gap-4">
                    <Link to="/terms" className="flex items-center gap-3 p-4 rounded-xl border border-gray-200 hover:border-brand-300 hover:bg-brand-50 transition-all group bg-white">
                        <div className="p-2 bg-gray-100 rounded-lg text-gray-500 group-hover:bg-white group-hover:text-brand-600 transition-colors">
                            <FileText size={20} />
                        </div>
                        <div>
                            <p className="font-semibold text-gray-900 group-hover:text-brand-700">Terms of Service</p>
                            <p className="text-xs text-gray-500">Read our terms and conditions</p>
                        </div>
                        <ExternalLink size={16} className="ml-auto text-gray-400 group-hover:text-brand-400" />
                    </Link>

                    <Link to="/privacy" className="flex items-center gap-3 p-4 rounded-xl border border-gray-200 hover:border-brand-300 hover:bg-brand-50 transition-all group bg-white">
                        <div className="p-2 bg-gray-100 rounded-lg text-gray-500 group-hover:bg-white group-hover:text-brand-600 transition-colors">
                            <Shield size={20} />
                        </div>
                        <div>
                            <p className="font-semibold text-gray-900 group-hover:text-brand-700">Privacy Policy</p>
                            <p className="text-xs text-gray-500">How we handle your data</p>
                        </div>
                        <ExternalLink size={16} className="ml-auto text-gray-400 group-hover:text-brand-400" />
                    </Link>
                </div>
            </div>

            <div className="pt-6 border-t border-gray-100">
                <p className="text-xs text-gray-400">{APP_INFO.VERSION_WITH_COPYRIGHT}</p>
            </div>
        </div>
    );
};
