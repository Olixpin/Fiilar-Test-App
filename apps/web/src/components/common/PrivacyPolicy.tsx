import React, { useEffect, useState } from 'react';
import { ArrowLeft, Shield, Eye, FileText, Lock, Server, Globe, UserCheck, Users, RefreshCw, Mail } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@fiilar/ui';

const PrivacyPolicy: React.FC = () => {
    const navigate = useNavigate();
    const [activeSection, setActiveSection] = useState<string>('introduction');

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
            id: 'introduction',
            title: '1. Introduction',
            icon: Shield,
            content: (
                <p>
                    Fiilar ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform. We value your trust and are dedicated to protecting your personal data.
                </p>
            )
        },
        {
            id: 'collection',
            title: '2. Information We Collect',
            icon: Eye,
            content: (
                <>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Personal Information</h3>
                    <p className="mb-4">We collect information that you provide directly to us, including:</p>
                    <ul className="list-disc pl-6 space-y-2 text-gray-600 mb-6">
                        <li>Name, email address, and phone number</li>
                        <li>Payment information and billing address</li>
                        <li>Government-issued ID for identity verification (hosts only)</li>
                        <li>Profile photo and bio</li>
                        <li>Messages and communications with other users</li>
                    </ul>

                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Automatically Collected Information</h3>
                    <ul className="list-disc pl-6 space-y-2 text-gray-600">
                        <li>Device information (IP address, browser type, operating system)</li>
                        <li>Usage data (pages visited, time spent, features used)</li>
                        <li>Location data (with your permission)</li>
                        <li>Cookies and similar tracking technologies</li>
                    </ul>
                </>
            )
        },
        {
            id: 'usage',
            title: '3. How We Use Your Information',
            icon: FileText,
            content: (
                <>
                    <p className="mb-4">We use the information we collect to:</p>
                    <ul className="list-disc pl-6 space-y-2 text-gray-600">
                        <li>Provide, maintain, and improve our services</li>
                        <li>Process transactions and send related information</li>
                        <li>Verify identity and prevent fraud</li>
                        <li>Send administrative messages and updates</li>
                        <li>Respond to your comments and questions</li>
                        <li>Analyze usage patterns and optimize user experience</li>
                        <li>Comply with legal obligations</li>
                    </ul>
                </>
            )
        },
        {
            id: 'sharing',
            title: '4. Information Sharing',
            icon: Globe,
            content: (
                <>
                    <p className="mb-4">We may share your information with:</p>
                    <ul className="list-disc pl-6 space-y-2 text-gray-600 mb-4">
                        <li><strong>Other Users:</strong> Your profile information and messages are visible to users you interact with</li>
                        <li><strong>Service Providers:</strong> Third-party vendors who perform services on our behalf (payment processing, hosting, analytics)</li>
                        <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
                        <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets</li>
                    </ul>
                    <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 text-blue-800 text-sm">
                        <strong>Note:</strong> We do not sell your personal information to third parties.
                    </div>
                </>
            )
        },
        {
            id: 'security',
            title: '5. Data Security',
            icon: Lock,
            content: (
                <p>
                    We implement appropriate technical and organizational measures to protect your personal information, including encryption, secure servers, and regular security audits. However, no method of transmission over the Internet is 100% secure, and we cannot guarantee absolute security.
                </p>
            )
        },
        {
            id: 'retention',
            title: '6. Data Retention',
            icon: Server,
            content: (
                <p>
                    We retain your personal information for as long as necessary to fulfill the purposes outlined in this Privacy Policy, unless a longer retention period is required by law. When you delete your account, we will delete or anonymize your information within 30 days.
                </p>
            )
        },
        {
            id: 'rights',
            title: '7. Your Rights',
            icon: UserCheck,
            content: (
                <>
                    <p className="mb-4">You have the right to:</p>
                    <ul className="list-disc pl-6 space-y-2 text-gray-600">
                        <li>Access and update your personal information</li>
                        <li>Request deletion of your account and data</li>
                        <li>Opt out of marketing communications</li>
                        <li>Disable cookies through your browser settings</li>
                        <li>Request a copy of your data</li>
                        <li>Object to processing of your data</li>
                    </ul>
                </>
            )
        },
        {
            id: 'children',
            title: '8. Children\'s Privacy',
            icon: Users,
            content: (
                <p>
                    Fiilar is not intended for users under the age of 18. We do not knowingly collect personal information from children. If you believe we have collected information from a child, please contact us immediately.
                </p>
            )
        },
        {
            id: 'changes',
            title: '9. Changes to This Policy',
            icon: RefreshCw,
            content: (
                <p>
                    We may update this Privacy Policy from time to time. We will notify you of significant changes by posting the new policy on this page and updating the "Last updated" date.
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
                        <Lock className="text-brand-600 w-8 h-8" />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 tracking-tight">
                        Privacy Policy
                    </h1>
                    <p className="text-xl text-gray-500 max-w-2xl mx-auto">
                        We care about your data. Here's how we protect it.
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
                            <h3 className="text-xl font-bold mb-2">Questions about your data?</h3>
                            <p className="text-gray-400 mb-6">
                                Our privacy team is here to help you understand how your information is handled.
                            </p>
                            <Button
                                variant="secondary"
                                className="bg-white text-gray-900 hover:bg-gray-100 border-none shadow-sm"
                                onClick={() => window.location.href = 'mailto:privacy@fiilar.com'}
                                leftIcon={<Mail size={18} />}
                            >
                                Contact Privacy Team
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PrivacyPolicy;
