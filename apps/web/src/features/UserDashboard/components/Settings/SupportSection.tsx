import React from 'react';
import { MessageCircle, Phone, Mail } from 'lucide-react';

export const SupportSection: React.FC = () => {
    return (
        <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                <h2 className="text-xl font-bold text-gray-900 mb-2">Get Help</h2>
                <p className="text-gray-600 text-sm mb-6">Choose your preferred way to reach us</p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* WhatsApp */}
                    <a
                        href="https://wa.me/1234567890?text=Hi, I need help with Fiilar"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex flex-col items-center p-6 border-2 border-green-200 bg-green-50 rounded-xl hover:border-green-300 hover:bg-green-100 transition group"
                    >
                        <MessageCircle size={32} className="text-green-600 mb-3" />
                        <h3 className="font-semibold text-gray-900 mb-1">WhatsApp</h3>
                        <p className="text-xs text-gray-600 text-center">Chat with us instantly</p>
                    </a>

                    {/* Phone */}
                    <a
                        href="tel:+1234567890"
                        className="flex flex-col items-center p-6 border-2 border-blue-200 bg-blue-50 rounded-xl hover:border-blue-300 hover:bg-blue-100 transition group"
                    >
                        <Phone size={32} className="text-blue-600 mb-3" />
                        <h3 className="font-semibold text-gray-900 mb-1">Call Us</h3>
                        <p className="text-xs text-gray-600 text-center">Mon-Fri, 9AM-6PM</p>
                    </a>

                    {/* Email */}
                    <a
                        href="mailto:support@fiilar.com"
                        className="flex flex-col items-center p-6 border-2 border-purple-200 bg-purple-50 rounded-xl hover:border-purple-300 hover:bg-purple-100 transition group"
                    >
                        <Mail size={32} className="text-purple-600 mb-3" />
                        <h3 className="font-semibold text-gray-900 mb-1">Email</h3>
                        <p className="text-xs text-gray-600 text-center">support@fiilar.com</p>
                    </a>
                </div>
            </div>

            {/* FAQ */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Frequently Asked Questions</h3>
                <div className="space-y-3">
                    <details className="group">
                        <summary className="cursor-pointer font-medium text-gray-900 hover:text-brand-600 transition">
                            How do I book a space?
                        </summary>
                        <p className="text-sm text-gray-600 mt-2 pl-4">Browse listings, select your dates, and click "Reserve Now" to complete your booking.</p>
                    </details>
                    <details className="group">
                        <summary className="cursor-pointer font-medium text-gray-900 hover:text-brand-600 transition">
                            What is the cancellation policy?
                        </summary>
                        <p className="text-sm text-gray-600 mt-2 pl-4">Cancellation policies vary by listing. Check the listing details for specific terms.</p>
                    </details>
                    <details className="group">
                        <summary className="cursor-pointer font-medium text-gray-900 hover:text-brand-600 transition">
                            How do payments work?
                        </summary>
                        <p className="text-sm text-gray-600 mt-2 pl-4">Payments are held in escrow and released to hosts after booking completion.</p>
                    </details>
                </div>
            </div>
        </div>
    );
};
