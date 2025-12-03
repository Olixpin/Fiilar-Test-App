import React, { useMemo } from 'react';
import { ArrowLeft, Search, MessageSquare, Phone, Mail, BookOpen, LifeBuoy, ShieldAlert, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button, Input } from '@fiilar/ui';

const HelpCenter: React.FC = () => {
    const navigate = useNavigate();

    const faqs = useMemo(() => (
        [
            {
                question: 'How do I book a space on Fiilar?',
                answer: 'Search for a space, choose your preferred time and date, then confirm your booking. You\'ll receive instant confirmation and host details.'
            },
            {
                question: 'What happens if a host cancels?',
                answer: 'Our support team will immediately connect you with similar listings and ensure you receive a full refund.'
            },
            {
                question: 'How do I become a host?',
                answer: 'Navigate to Host Your Space, complete a short onboarding flow, and publish your listing once it passes our quality review.'
            },
            {
                question: 'Is payment secure?',
                answer: 'Yes. We use PCI-compliant processors, hold funds in escrow until events are completed, and monitor activity for fraud.'
            }
        ]
    ), []);

    const helpTopics = [
        {
            title: 'Booking & Payments',
            description: 'Learn how to book spaces, manage payments, and understand our cancellation policies.',
            icon: BookOpen
        },
        {
            title: 'Host Resources',
            description: 'Step-by-step guides for listing a space, managing availability, and growing your business.',
            icon: LifeBuoy
        },
        {
            title: 'Safety & Trust',
            description: 'Understand verification, insurance, and safety requirements for hosts and guests.',
            icon: ShieldAlert
        }
    ];

    const supportChannels = [
        {
            label: 'Live Chat',
            detail: 'Available 24/7 inside the Fiilar app',
            icon: MessageSquare
        },
        {
            label: 'Call Support',
            detail: '+234 800 000 0000',
            icon: Phone
        },
        {
            label: 'Email Us',
            detail: 'support@fiilar.com',
            icon: Mail
        },
        {
            label: 'Visit us',
            detail: '2B Admiralty Way, Lekki Phase 1, Lagos',
            icon: MapPin
        }
    ];

    return (
        <div className="min-h-screen bg-gray-50 pb-24 lg:pb-0">
            <div className="bg-gradient-to-br from-brand-600 via-brand-700 to-brand-800 text-white">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20 text-center">
                    <Button
                        variant="ghost"
                        onClick={() => navigate('/')}
                        className="mb-8 text-white/80 hover:text-white hover:bg-white/10"
                        leftIcon={<ArrowLeft size={18} />}
                    >
                        Back to Home
                    </Button>
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">Welcome to the Fiilar Help Center</h1>
                    <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto">
                        Find answers fast, explore resources, or connect with a Fiilar specialist.
                    </p>
                    <div className="mt-10 max-w-2xl mx-auto">
                        <div className="bg-white/10 backdrop-blur rounded-3xl p-1.5 flex items-center gap-2">
                            <Input
                                placeholder="Search articles, topics or questions"
                                startIcon={<Search size={18} className="text-white/60" />}
                                className="bg-transparent border-0 text-white placeholder:text-white/60"
                            />
                            <Button variant="secondary" className="bg-white text-brand-600 hover:bg-gray-100">
                                Search
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
                <div className="grid md:grid-cols-3 gap-8 mb-16">
                    {helpTopics.map((topic) => (
                        <div key={topic.title} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <topic.icon className="w-8 h-8 text-brand-600 mb-4" />
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">{topic.title}</h3>
                            <p className="text-sm text-gray-500 leading-relaxed">{topic.description}</p>
                        </div>
                    ))}
                </div>

                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 md:p-12">
                    <h2 className="text-3xl font-bold text-gray-900 mb-8">Frequently Asked Questions</h2>
                    <div className="space-y-6">
                        {faqs.map((faq) => (
                            <div key={faq.question} className="border border-gray-100 rounded-2xl p-6 hover:border-brand-200 transition-colors">
                                <h3 className="text-lg font-semibold text-gray-900 mb-3">{faq.question}</h3>
                                <p className="text-sm text-gray-600 leading-relaxed">{faq.answer}</p>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="mt-16">
                    <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">Need more help?</h2>
                    <p className="text-gray-600 text-center max-w-2xl mx-auto mb-10">
                        Our global support team responds within minutes. Choose the channel that works best for you.
                    </p>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {supportChannels.map((channel) => (
                            <div key={channel.label} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 text-center">
                                <channel.icon className="w-6 h-6 text-brand-600 mb-3 mx-auto" />
                                <p className="font-semibold text-gray-900">{channel.label}</p>
                                <p className="text-sm text-gray-500">{channel.detail}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HelpCenter;
