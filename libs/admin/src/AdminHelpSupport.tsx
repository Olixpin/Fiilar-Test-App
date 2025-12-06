import React, { useState } from 'react';
import { 
    HelpCircle, 
    Book, 
    Mail, 
    Phone, 
    ExternalLink, 
    ChevronRight,
    Search,
    FileText,
    Video,
    Shield,
    DollarSign,
    Home,
    AlertTriangle
} from 'lucide-react';
import { cn } from '@fiilar/utils';interface FAQItem {
    question: string;
    answer: string;
    category: string;
}

const faqs: FAQItem[] = [
    {
        category: 'KYC & Verification',
        question: 'How does the KYC verification process work?',
        answer: 'KYC verification is handled through Dojah, our identity verification partner. Users submit their identity documents and complete a liveness check. Once Dojah verifies their identity, the status is automatically updated in the system. Admins can then review and approve or reject users based on additional criteria.'
    },
    {
        category: 'KYC & Verification',
        question: 'What should I check before approving a user?',
        answer: 'Verify that Dojah has marked the user as verified, check their email and phone verification status, and review any notes or flags on their account. For hosts, ensure they have provided valid contact information.'
    },
    {
        category: 'Listings',
        question: 'What criteria should listings meet for approval?',
        answer: 'Listings should have clear, high-quality photos (minimum 5 recommended), accurate descriptions, appropriate pricing, and verified address documentation. Check that the host is KYC verified before approving their listings.'
    },
    {
        category: 'Listings',
        question: 'How do I handle a listing rejection?',
        answer: 'When rejecting a listing, always provide a clear reason. Common reasons include insufficient photos, misleading descriptions, or unverified host. The host will be notified and can resubmit after addressing the issues.'
    },
    {
        category: 'Escrow & Payments',
        question: 'How does the escrow system work?',
        answer: 'When a guest books, their payment is held in escrow. After the booking is completed (verified via handshake), funds are released to the host minus platform fees. If there\'s a dispute, funds remain in escrow until resolved.'
    },
    {
        category: 'Escrow & Payments',
        question: 'When should I manually intervene in a payment?',
        answer: 'Manual intervention is needed for disputed transactions, failed automatic payouts, or when resolving customer complaints. Always document any manual changes in the admin notes.'
    },
    {
        category: 'Disputes',
        question: 'How should I handle a booking dispute?',
        answer: 'Review the handshake verification status, check communication logs between host and guest, and examine any evidence provided. The handshake status is strong evidence - if verified, the guest was likely granted entry.'
    },
    {
        category: 'Disputes',
        question: 'What\'s the difference between "Refund Guest" and "Release to Host"?',
        answer: '"Refund Guest" returns the full payment to the guest and marks the booking as cancelled. "Release to Host" sends the payment to the host (minus fees) and marks the booking as completed. Choose based on the evidence.'
    },
];

const helpCategories = [
    { id: 'kyc', label: 'KYC & Verification', icon: Shield, color: 'text-blue-600 bg-blue-100' },
    { id: 'listings', label: 'Listings', icon: Home, color: 'text-green-600 bg-green-100' },
    { id: 'escrow', label: 'Escrow & Payments', icon: DollarSign, color: 'text-purple-600 bg-purple-100' },
    { id: 'disputes', label: 'Disputes', icon: AlertTriangle, color: 'text-orange-600 bg-orange-100' },
];

const quickLinks = [
    { label: 'Documentation', icon: Book, href: '#', description: 'Read the full admin guide' },
    { label: 'Video Tutorials', icon: Video, href: '#', description: 'Watch how-to videos' },
    { label: 'API Reference', icon: FileText, href: '#', description: 'Technical documentation' },
];

export const AdminHelpSupport: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

    const filteredFaqs = faqs.filter(faq => {
        const matchesSearch = searchTerm === '' || 
            faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
            faq.answer.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = !selectedCategory || faq.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    return (
        <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in">
            {/* Header */}
            <div className="bg-gradient-to-r from-brand-500 to-brand-600 rounded-2xl p-8 text-white">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                        <HelpCircle size={24} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold">Help & Support</h1>
                        <p className="text-white/80">Find answers and get help with the admin panel</p>
                    </div>
                </div>
                
                {/* Search */}
                <div className="relative mt-6">
                    <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/60" />
                    <input
                        type="text"
                        placeholder="Search for help..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/30"
                    />
                </div>
            </div>

            <div className="grid grid-cols-3 gap-6">
                {/* Left Column - Categories & Quick Links */}
                <div className="space-y-6">
                    {/* Categories */}
                    <div className="bg-white rounded-xl border border-gray-200 p-4">
                        <h3 className="text-sm font-semibold text-gray-900 mb-3">Categories</h3>
                        <div className="space-y-2">
                            <button
                                onClick={() => setSelectedCategory(null)}
                                className={cn(
                                    "w-full flex items-center gap-3 p-2 rounded-lg text-left transition-colors",
                                    !selectedCategory ? "bg-gray-100 text-gray-900" : "text-gray-600 hover:bg-gray-50"
                                )}
                            >
                                <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                                    <HelpCircle size={16} className="text-gray-600" />
                                </div>
                                <span className="text-sm font-medium">All Topics</span>
                            </button>
                            {helpCategories.map((cat) => (
                                <button
                                    key={cat.id}
                                    onClick={() => setSelectedCategory(cat.label)}
                                    className={cn(
                                        "w-full flex items-center gap-3 p-2 rounded-lg text-left transition-colors",
                                        selectedCategory === cat.label ? "bg-gray-100 text-gray-900" : "text-gray-600 hover:bg-gray-50"
                                    )}
                                >
                                    <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", cat.color)}>
                                        <cat.icon size={16} />
                                    </div>
                                    <span className="text-sm font-medium">{cat.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div className="bg-white rounded-xl border border-gray-200 p-4">
                        <h3 className="text-sm font-semibold text-gray-900 mb-3">Quick Links</h3>
                        <div className="space-y-2">
                            {quickLinks.map((link, idx) => (
                                <a
                                    key={idx}
                                    href={link.href}
                                    className="flex items-center gap-3 p-2 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
                                >
                                    <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                                        <link.icon size={16} />
                                    </div>
                                    <div className="flex-1">
                                        <span className="text-sm font-medium text-gray-900">{link.label}</span>
                                        <p className="text-xs text-gray-500">{link.description}</p>
                                    </div>
                                    <ExternalLink size={14} className="text-gray-400" />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Contact Support */}
                    <div className="bg-white rounded-xl border border-gray-200 p-4">
                        <h3 className="text-sm font-semibold text-gray-900 mb-3">Contact Support</h3>
                        <div className="space-y-3">
                            <a href="mailto:support@fiilar.com" className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                <Mail size={18} className="text-gray-500" />
                                <div>
                                    <p className="text-sm font-medium text-gray-900">Email Support</p>
                                    <p className="text-xs text-gray-500">support@fiilar.com</p>
                                </div>
                            </a>
                            <a href="tel:+2348000000000" className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                <Phone size={18} className="text-gray-500" />
                                <div>
                                    <p className="text-sm font-medium text-gray-900">Phone Support</p>
                                    <p className="text-xs text-gray-500">Mon-Fri, 9am-5pm WAT</p>
                                </div>
                            </a>
                        </div>
                    </div>
                </div>

                {/* Right Column - FAQs */}
                <div className="col-span-2">
                    <div className="bg-white rounded-xl border border-gray-200">
                        <div className="p-4 border-b border-gray-100">
                            <h3 className="text-sm font-semibold text-gray-900">
                                Frequently Asked Questions
                                {selectedCategory && <span className="text-gray-500 font-normal"> - {selectedCategory}</span>}
                            </h3>
                        </div>
                        <div className="divide-y divide-gray-100">
                            {filteredFaqs.length === 0 ? (
                                <div className="p-8 text-center">
                                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                        <Search size={20} className="text-gray-400" />
                                    </div>
                                    <p className="text-sm text-gray-500">No matching questions found</p>
                                    <p className="text-xs text-gray-400 mt-1">Try a different search term or category</p>
                                </div>
                            ) : (
                                filteredFaqs.map((faq, idx) => (
                                    <div key={idx} className="p-4">
                                        <button
                                            onClick={() => setExpandedFaq(expandedFaq === idx ? null : idx)}
                                            className="w-full flex items-start gap-3 text-left"
                                        >
                                            <ChevronRight 
                                                size={18} 
                                                className={cn(
                                                    "text-gray-400 mt-0.5 transition-transform",
                                                    expandedFaq === idx && "rotate-90"
                                                )} 
                                            />
                                            <div className="flex-1">
                                                <p className="text-sm font-medium text-gray-900">{faq.question}</p>
                                                <span className="text-xs text-gray-400">{faq.category}</span>
                                            </div>
                                        </button>
                                        {expandedFaq === idx && (
                                            <div className="mt-3 ml-7 p-3 bg-gray-50 rounded-lg">
                                                <p className="text-sm text-gray-600">{faq.answer}</p>
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminHelpSupport;
