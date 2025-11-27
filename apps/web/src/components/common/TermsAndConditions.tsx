import React, { useEffect, useState } from 'react';
import { ArrowLeft, Shield, FileText, Scale, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@fiilar/ui';

const TermsAndConditions: React.FC = () => {
    const navigate = useNavigate();
    const [activeSection, setActiveSection] = useState<string>('acceptance');

    // Handle scroll spy
    useEffect(() => {
        const handleScroll = () => {
            const sections = document.querySelectorAll('section[id]');
            const scrollPosition = window.scrollY + 100; // Offset

            sections.forEach((section) => {
                const top = (section as HTMLElement).offsetTop;
                const height = (section as HTMLElement).offsetHeight;
                const id = section.getAttribute('id') || '';

                if (scrollPosition >= top && scrollPosition < top + height) {
                    setActiveSection(id);
                }
            });
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToSection = (id: string) => {
        const element = document.getElementById(id);
        if (element) {
            const offset = 80; // Navbar height + padding
            const bodyRect = document.body.getBoundingClientRect().top;
            const elementRect = element.getBoundingClientRect().top;
            const elementPosition = elementRect - bodyRect;
            const offsetPosition = elementPosition - offset;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
            setActiveSection(id);
        }
    };

    const sections = [
        {
            id: 'acceptance',
            title: '1. Acceptance of Terms',
            icon: CheckCircle2,
            content: (
                <p>
                    By accessing and using Fiilar ("the Platform"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service. These terms constitute a legally binding agreement between you and Fiilar regarding your use of the Platform.
                </p>
            )
        },
        {
            id: 'accounts',
            title: '2. User Accounts',
            icon: FileText,
            content: (
                <>
                    <p className="mb-4">To access certain features of the Platform, you must register for an account. You agree to:</p>
                    <ul className="list-disc pl-6 space-y-2 text-gray-600">
                        <li>Provide accurate, current, and complete information during registration</li>
                        <li>Maintain the security of your password and account</li>
                        <li>Notify us immediately of any unauthorized use of your account</li>
                        <li>Be responsible for all activities that occur under your account</li>
                    </ul>
                </>
            )
        },
        {
            id: 'booking',
            title: '3. Booking and Payment',
            icon: Scale,
            content: (
                <>
                    <p className="mb-4">When you make a booking through Fiilar:</p>
                    <ul className="list-disc pl-6 space-y-2 text-gray-600">
                        <li>All payments must be processed through the Platform</li>
                        <li>Service fees apply to all bookings as displayed at checkout</li>
                        <li>Caution deposits may be held in escrow and released according to our escrow policy</li>
                        <li>You agree to pay all charges incurred under your account</li>
                        <li>Off-platform payments are strictly prohibited and may result in account suspension</li>
                    </ul>
                </>
            )
        },
        {
            id: 'cancellation',
            title: '4. Cancellation Policy',
            icon: AlertCircle,
            content: (
                <>
                    <p className="mb-4">Cancellation terms vary by listing and are set by the host. Common policies include:</p>
                    <div className="grid gap-4 md:grid-cols-3 mt-6">
                        <div className="bg-green-50 p-4 rounded-xl border border-green-100">
                            <h4 className="font-semibold text-green-900 mb-1">Flexible</h4>
                            <p className="text-sm text-green-700">Full refund if cancelled 24 hours before booking</p>
                        </div>
                        <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-100">
                            <h4 className="font-semibold text-yellow-900 mb-1">Moderate</h4>
                            <p className="text-sm text-yellow-700">Full refund if cancelled 5 days before booking</p>
                        </div>
                        <div className="bg-red-50 p-4 rounded-xl border border-red-100">
                            <h4 className="font-semibold text-red-900 mb-1">Strict</h4>
                            <p className="text-sm text-red-700">No refund after booking confirmation</p>
                        </div>
                    </div>
                </>
            )
        },
        {
            id: 'host-responsibilities',
            title: '5. Host Responsibilities',
            icon: Shield,
            content: (
                <>
                    <p className="mb-4">As a host on Fiilar, you agree to:</p>
                    <ul className="list-disc pl-6 space-y-2 text-gray-600">
                        <li>Provide accurate descriptions and photos of your space</li>
                        <li>Verify ownership or authorization to list the property</li>
                        <li>Maintain your space in the condition advertised</li>
                        <li>Comply with all local laws and regulations</li>
                        <li>Respond to booking requests and messages in a timely manner</li>
                    </ul>
                </>
            )
        },
        {
            id: 'guest-responsibilities',
            title: '6. Guest Responsibilities',
            icon: FileText,
            content: (
                <>
                    <p className="mb-4">As a guest on Fiilar, you agree to:</p>
                    <ul className="list-disc pl-6 space-y-2 text-gray-600">
                        <li>Treat the space with respect and care</li>
                        <li>Follow all house rules set by the host</li>
                        <li>Report any damages or issues immediately</li>
                        <li>Leave the space in the condition you found it</li>
                        <li>Not exceed the maximum guest capacity</li>
                    </ul>
                </>
            )
        },
        {
            id: 'prohibited',
            title: '7. Prohibited Activities',
            icon: AlertCircle,
            content: (
                <>
                    <p className="mb-4">You may not use Fiilar to:</p>
                    <ul className="list-disc pl-6 space-y-2 text-gray-600">
                        <li>Violate any laws or regulations</li>
                        <li>Infringe on intellectual property rights</li>
                        <li>Transmit harmful or malicious code</li>
                        <li>Harass, abuse, or harm other users</li>
                        <li>Attempt to circumvent platform fees or payments</li>
                        <li>Share contact information to arrange off-platform transactions</li>
                    </ul>
                </>
            )
        },
        {
            id: 'liability',
            title: '8. Limitation of Liability',
            icon: Scale,
            content: (
                <p>
                    Fiilar acts as a marketplace connecting hosts and guests. We are not responsible for the conduct of users or the condition of listed spaces. To the maximum extent permitted by law, Fiilar shall not be liable for any indirect, incidental, special, or consequential damages.
                </p>
            )
        }
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero Section */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 text-center">
                    <div className="inline-flex items-center justify-center p-3 bg-brand-50 rounded-2xl mb-6">
                        <Scale className="text-brand-600 w-8 h-8" />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 tracking-tight">
                        Terms and Conditions
                    </h1>
                    <p className="text-xl text-gray-500 max-w-2xl mx-auto">
                        Please read these terms carefully before using our platform.
                    </p>
                    <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full text-sm font-medium text-gray-600">
                        <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                        Last updated: November 22, 2024
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="flex flex-col lg:flex-row gap-12">
                    {/* Sidebar Navigation - Sticky */}
                    <div className="lg:w-80 shrink-0">
                        <div className="sticky top-24 space-y-1">
                            <Button
                                variant="ghost"
                                onClick={() => navigate('/')}
                                className="mb-6 pl-0 hover:bg-transparent hover:text-brand-700 text-gray-500"
                                leftIcon={<ArrowLeft size={18} />}
                            >
                                Back to Home
                            </Button>

                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-2 overflow-hidden">
                                <h3 className="px-4 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">
                                    Table of Contents
                                </h3>
                                <nav className="space-y-0.5">
                                    {sections.map((section) => (
                                        <button
                                            key={section.id}
                                            onClick={() => scrollToSection(section.id)}
                                            className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 text-left ${activeSection === section.id
                                                ? 'bg-brand-50 text-brand-700 shadow-sm'
                                                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                                }`}
                                        >
                                            <section.icon size={16} className={activeSection === section.id ? 'text-brand-600' : 'text-gray-400'} />
                                            {section.title.replace(/^\d+\.\s/, '')} {/* Strip number for cleaner sidebar */}
                                        </button>
                                    ))}
                                </nav>
                            </div>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="flex-1 min-w-0">
                        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="divide-y divide-gray-100">
                                {sections.map((section) => (
                                    <section
                                        key={section.id}
                                        id={section.id}
                                        className="p-8 md:p-12 scroll-mt-24 transition-colors hover:bg-gray-50/30"
                                    >
                                        <div className="flex items-start gap-4 mb-6">
                                            <div className="p-2 bg-brand-50 rounded-lg shrink-0 mt-1">
                                                <section.icon className="text-brand-600 w-5 h-5" />
                                            </div>
                                            <h2 className="text-2xl font-bold text-gray-900">
                                                {section.title}
                                            </h2>
                                        </div>
                                        <div className="prose prose-gray max-w-none text-gray-600 leading-relaxed pl-0 md:pl-14">
                                            {section.content}
                                        </div>
                                    </section>
                                ))}
                            </div>
                        </div>

                        {/* Footer Note */}
                        <div className="mt-12 p-8 bg-gray-900 rounded-3xl text-center text-white">
                            <h3 className="text-xl font-bold mb-2">Still have questions?</h3>
                            <p className="text-gray-400 mb-6">
                                Our support team is available 24/7 to assist you with any legal or platform-related queries.
                            </p>
                            <Button
                                variant="secondary"
                                className="bg-white text-gray-900 hover:bg-gray-100 border-none shadow-sm"
                                onClick={() => window.location.href = 'mailto:legal@fiilar.com'}
                            >
                                Contact Legal Team
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TermsAndConditions;
