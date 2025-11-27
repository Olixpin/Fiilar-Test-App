import React from 'react';
import { MessageCircle, Phone, Mail, ChevronDown } from 'lucide-react';

export const SupportSection: React.FC = () => {
    return (
        <div className="space-y-8">
            <div className="border-b border-gray-100 pb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Get Help</h2>
                <p className="text-gray-500 mb-6">Choose your preferred way to reach us</p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* WhatsApp */}
                    <a
                        href="https://wa.me/1234567890?text=Hi, I need help with Fiilar"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex flex-col items-center p-6 border border-green-200 bg-green-50/50 rounded-2xl hover:border-green-300 hover:bg-green-50 hover:shadow-sm transition-all group"
                    >
                        <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                            <MessageCircle size={24} />
                        </div>
                        <h3 className="font-bold text-gray-900 mb-1">WhatsApp</h3>
                        <p className="text-xs text-gray-500 text-center">Chat with us instantly</p>
                    </a>

                    {/* Phone */}
                    <a
                        href="tel:+1234567890"
                        className="flex flex-col items-center p-6 border border-blue-200 bg-blue-50/50 rounded-2xl hover:border-blue-300 hover:bg-blue-50 hover:shadow-sm transition-all group"
                    >
                        <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                            <Phone size={24} />
                        </div>
                        <h3 className="font-bold text-gray-900 mb-1">Call Us</h3>
                        <p className="text-xs text-gray-500 text-center">Mon-Fri, 9AM-6PM</p>
                    </a>

                    {/* Email */}
                    <a
                        href="mailto:support@fiilar.com"
                        className="flex flex-col items-center p-6 border border-purple-200 bg-purple-50/50 rounded-2xl hover:border-purple-300 hover:bg-purple-50 hover:shadow-sm transition-all group"
                    >
                        <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                            <Mail size={24} />
                        </div>
                        <h3 className="font-bold text-gray-900 mb-1">Email</h3>
                        <p className="text-xs text-gray-500 text-center">support@fiilar.com</p>
                    </a>
                </div>
            </div>

            {/* FAQ */}
            <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4">Frequently Asked Questions</h3>
                <div className="space-y-4">
                    <details className="group border border-gray-200 rounded-xl overflow-hidden open:bg-gray-50 transition-colors">
                        <summary className="flex items-center justify-between cursor-pointer font-medium text-gray-900 p-4 hover:bg-gray-50 transition-colors list-none">
                            How do I book a space?
                            <ChevronDown size={16} className="text-gray-400 group-open:rotate-180 transition-transform" />
                        </summary>
                        <div className="px-4 pb-4 text-sm text-gray-600 leading-relaxed">
                            Browse listings, select your dates, and click "Reserve Now" to complete your booking. You'll receive a confirmation email once the host accepts.
                        </div>
                    </details>
                    <details className="group border border-gray-200 rounded-xl overflow-hidden open:bg-gray-50 transition-colors">
                        <summary className="flex items-center justify-between cursor-pointer font-medium text-gray-900 p-4 hover:bg-gray-50 transition-colors list-none">
                            What is the cancellation policy?
                            <ChevronDown size={16} className="text-gray-400 group-open:rotate-180 transition-transform" />
                        </summary>
                        <div className="px-4 pb-4 text-sm text-gray-600 leading-relaxed">
                            Cancellation policies vary by listing (Flexible, Moderate, or Strict). Check the listing details for specific terms before booking.
                        </div>
                    </details>
                    <details className="group border border-gray-200 rounded-xl overflow-hidden open:bg-gray-50 transition-colors">
                        <summary className="flex items-center justify-between cursor-pointer font-medium text-gray-900 p-4 hover:bg-gray-50 transition-colors list-none">
                            How do payments work?
                            <ChevronDown size={16} className="text-gray-400 group-open:rotate-180 transition-transform" />
                        </summary>
                        <div className="px-4 pb-4 text-sm text-gray-600 leading-relaxed">
                            Payments are securely held in escrow and released to hosts 24 hours after a successful check-in. This ensures safety for both parties.
                        </div>
                    </details>
                </div>
            </div>
        </div>
    );
};
