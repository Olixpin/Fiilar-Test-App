import React, { useState } from 'react';
import { X, ChevronDown, ChevronUp, Send, Mail, MessageCircle, HelpCircle, CheckCircle, Loader2 } from 'lucide-react';
import { useToast } from '@fiilar/ui';

interface SupportModalProps {
    isOpen: boolean;
    onClose: () => void;
}

interface FAQ {
    question: string;
    answer: string;
}

const FAQS: FAQ[] = [
    {
        question: "How do I book a space?",
        answer: "Browse listings, select your dates and times, then click 'Book Now'. You'll be guided through the payment process. Once confirmed, you'll receive a booking confirmation with all the details."
    },
    {
        question: "What is the cancellation policy?",
        answer: "Cancellation policies vary by listing. You can find the specific policy on each listing page. Generally, cancellations made 48+ hours before check-in receive a full refund."
    },
    {
        question: "How do I contact my host?",
        answer: "After booking, you can message your host directly through the Messages tab in your dashboard. You can also find the 'Message Host' button on any listing page."
    },
    {
        question: "How do refunds work?",
        answer: "Refunds are processed to your original payment method within 5-10 business days. For wallet refunds, the amount is credited instantly to your Fiilar wallet."
    },
    {
        question: "How do I become a host?",
        answer: "Click on 'Become a Host' in the menu, complete your profile, verify your identity through KYC, and create your first listing. Our team will review and approve it within 24-48 hours."
    }
];

const CATEGORIES = [
    { value: 'booking', label: 'Booking Issues' },
    { value: 'payment', label: 'Payment & Refunds' },
    { value: 'account', label: 'Account & Profile' },
    { value: 'hosting', label: 'Hosting Questions' },
    { value: 'technical', label: 'Technical Problems' },
    { value: 'other', label: 'Other' }
];

export const SupportModal: React.FC<SupportModalProps> = ({ isOpen, onClose }) => {
    const { showToast } = useToast();
    const [activeTab, setActiveTab] = useState<'faq' | 'contact'>('faq');
    const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
    const [formData, setFormData] = useState({
        email: '',
        category: '',
        subject: '',
        message: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!formData.email || !formData.category || !formData.message) {
            showToast({ message: 'Please fill in all required fields', type: 'error' });
            return;
        }

        setIsSubmitting(true);
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        setIsSubmitting(false);
        setIsSubmitted(true);
        
        // Reset after showing success
        setTimeout(() => {
            setIsSubmitted(false);
            setFormData({ email: '', category: '', subject: '', message: '' });
            onClose();
        }, 2000);
    };

    const handleClose = () => {
        setActiveTab('faq');
        setExpandedFaq(null);
        setIsSubmitted(false);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
                onClick={handleClose}
            />

            {/* Modal */}
            <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl animate-in zoom-in-95 fade-in duration-300 max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-brand-100 rounded-xl">
                            <HelpCircle size={20} className="text-brand-600" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-gray-900">Help & Support</h2>
                            <p className="text-xs text-gray-500">We're here to help</p>
                        </div>
                    </div>
                    <button
                        onClick={handleClose}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-gray-100">
                    <button
                        onClick={() => setActiveTab('faq')}
                        className={`flex-1 px-4 py-3 text-sm font-medium transition-colors relative ${
                            activeTab === 'faq' 
                                ? 'text-brand-600' 
                                : 'text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        <span className="flex items-center justify-center gap-2">
                            <MessageCircle size={16} />
                            FAQs
                        </span>
                        {activeTab === 'faq' && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-600" />
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab('contact')}
                        className={`flex-1 px-4 py-3 text-sm font-medium transition-colors relative ${
                            activeTab === 'contact' 
                                ? 'text-brand-600' 
                                : 'text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        <span className="flex items-center justify-center gap-2">
                            <Mail size={16} />
                            Contact Us
                        </span>
                        {activeTab === 'contact' && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-600" />
                        )}
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {activeTab === 'faq' ? (
                        <div className="space-y-3">
                            {FAQS.map((faq, index) => (
                                <div 
                                    key={index}
                                    className="border border-gray-200 rounded-xl overflow-hidden"
                                >
                                    <button
                                        onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                                        className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-50 transition-colors"
                                    >
                                        <span className="font-medium text-gray-900 text-sm pr-4">
                                            {faq.question}
                                        </span>
                                        {expandedFaq === index ? (
                                            <ChevronUp size={18} className="text-gray-400 shrink-0" />
                                        ) : (
                                            <ChevronDown size={18} className="text-gray-400 shrink-0" />
                                        )}
                                    </button>
                                    {expandedFaq === index && (
                                        <div className="px-4 pb-4 pt-1 text-sm text-gray-600 leading-relaxed animate-in slide-in-from-top-2 duration-200">
                                            {faq.answer}
                                        </div>
                                    )}
                                </div>
                            ))}

                            <div className="pt-4 text-center">
                                <p className="text-sm text-gray-500 mb-3">
                                    Can't find what you're looking for?
                                </p>
                                <button
                                    onClick={() => setActiveTab('contact')}
                                    className="text-brand-600 font-medium text-sm hover:underline"
                                >
                                    Contact our support team →
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div>
                            {isSubmitted ? (
                                <div className="text-center py-8 animate-in zoom-in-95 fade-in duration-300">
                                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <CheckCircle size={32} className="text-green-600" />
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900 mb-2">Message Sent!</h3>
                                    <p className="text-sm text-gray-500">
                                        We'll get back to you within 24 hours.
                                    </p>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                            Email Address <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            placeholder="your@email.com"
                                            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                            Category <span className="text-red-500">*</span>
                                        </label>
                                        <select
                                            value={formData.category}
                                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all appearance-none bg-white"
                                            required
                                        >
                                            <option value="">Select a category</option>
                                            {CATEGORIES.map(cat => (
                                                <option key={cat.value} value={cat.value}>{cat.label}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                            Subject
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.subject}
                                            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                            placeholder="Brief description of your issue"
                                            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                            Message <span className="text-red-500">*</span>
                                        </label>
                                        <textarea
                                            value={formData.message}
                                            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                            placeholder="Describe your issue in detail..."
                                            rows={4}
                                            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all resize-none"
                                            required
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="w-full py-3 bg-brand-600 text-white font-semibold rounded-xl hover:bg-brand-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <Loader2 size={18} className="animate-spin" />
                                                Sending...
                                            </>
                                        ) : (
                                            <>
                                                <Send size={18} />
                                                Send Message
                                            </>
                                        )}
                                    </button>

                                    <p className="text-center text-xs text-gray-400 pt-2">
                                        Or email us directly at{' '}
                                        <a 
                                            href="mailto:support@fiilar.com" 
                                            className="text-brand-600 hover:underline"
                                        >
                                            support@fiilar.com
                                        </a>
                                    </p>
                                </form>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SupportModal;
