import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@fiilar/ui';
import { ArrowLeft, Compass, Map } from 'lucide-react';

interface SitemapLink {
    label: string;
    description?: string;
    path: string;
}

interface SitemapSection {
    title: string;
    description: string;
    links: SitemapLink[];
}

const Sitemap: React.FC = () => {
    const navigate = useNavigate();

    const sections = useMemo<SitemapSection[]>(() => ([
        {
            title: 'Essentials',
            description: 'Core pages to help you explore Fiilar and manage your stay.',
            links: [
                { label: 'Home', path: '/' },
                { label: 'About Us', path: '/about' },
                { label: 'Help Center', path: '/help-center' },
                { label: 'Contact Us', path: '/contact' }
            ]
        },
        {
            title: 'For Guests',
            description: 'Everything you need to book memorable experiences with confidence.',
            links: [
                { label: 'Browse Listings', path: '/' },
                { label: 'Safety', path: '/safety' },
                { label: 'Trust & Safety', path: '/trust-and-safety' },
                { label: 'Privacy Policy', path: '/privacy' }
            ]
        },
        {
            title: 'For Hosts',
            description: 'Resources to help hosts manage bookings and grow on Fiilar.',
            links: [
                { label: 'Host Dashboard', path: '/host/dashboard' },
                { label: 'KYC Verification', path: '/kyc' },
                { label: 'Terms & Conditions', path: '/terms' },
                { label: 'Help Center', path: '/help-center' }
            ]
        },
        {
            title: 'Company',
            description: 'Learn more about Fiilar and the teams behind the marketplace.',
            links: [
                { label: 'Careers', path: '/careers' },
                { label: 'About Us', path: '/about' },
                { label: 'Contact Us', path: '/contact' },
                { label: 'Cookie Policy', path: '/cookies' }
            ]
        },
        {
            title: 'Legal',
            description: 'Policies that explain how Fiilar protects our community.',
            links: [
                { label: 'Terms & Conditions', path: '/terms' },
                { label: 'Privacy Policy', path: '/privacy' },
                { label: 'Cookie Policy', path: '/cookies' },
                { label: 'Trust & Safety', path: '/trust-and-safety' }
            ]
        }
    ]), []);

    return (
        <div className="min-h-screen bg-gray-50 pb-24 lg:pb-0">
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
                    <Button
                        variant="ghost"
                        onClick={() => navigate('/')}
                        className="mb-8 text-gray-500 hover:text-brand-600 hover:bg-brand-50"
                        leftIcon={<ArrowLeft size={18} />}
                    >
                        Back to Home
                    </Button>
                    <div className="inline-flex items-center gap-3 px-4 py-2 bg-brand-50 text-brand-700 rounded-full mb-6">
                        <Map className="w-4 h-4" />
                        Last updated: November 22, 2024
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Sitemap</h1>
                    <p className="text-lg text-gray-500 max-w-2xl">
                        Navigate Fiilar with ease. Explore quick links to important pages for guests, hosts, and partners.
                    </p>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 space-y-8">
                {sections.map(section => (
                    <div key={section.title} className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 md:p-10">
                        <div className="flex items-start justify-between flex-wrap gap-6 mb-6">
                            <div>
                                <h2 className="text-2xl font-semibold text-gray-900 mb-2">{section.title}</h2>
                                <p className="text-gray-500 max-w-2xl">{section.description}</p>
                            </div>
                            <Compass className="w-10 h-10 text-brand-500" />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {section.links.map(link => (
                                <button
                                    key={link.label}
                                    type="button"
                                    onClick={() => navigate(link.path)}
                                    className="group flex flex-col items-start text-left rounded-2xl border border-gray-100 hover:border-brand-200 hover:bg-brand-50/60 transition-colors p-4"
                                >
                                    <span className="text-base font-medium text-gray-900 group-hover:text-brand-700">{link.label}</span>
                                    {link.description && (
                                        <span className="text-sm text-gray-500 mt-1">{link.description}</span>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                ))}

                <div className="bg-gray-900 text-white rounded-3xl p-8 md:p-12 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                    <div>
                        <h2 className="text-2xl font-semibold mb-2">Need something else?</h2>
                        <p className="text-white/80 max-w-xl">
                            Our support team is on standby to help you find the right information or troubleshoot any issues.
                        </p>
                    </div>
                    <Button
                        variant="secondary"
                        className="bg-white text-brand-600 hover:bg-gray-100"
                        onClick={() => navigate('/help-center')}
                    >
                        Visit Help Center
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default Sitemap;
