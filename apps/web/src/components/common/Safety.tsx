import React from 'react';
import { ArrowLeft, ShieldCheck, AlertTriangle, UserCheck, FileCheck, Headset, Building } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@fiilar/ui';

const Safety: React.FC = () => {
    const navigate = useNavigate();

    const pillars = [
        {
            icon: ShieldCheck,
            title: 'Verified Community',
            description: 'All hosts and guests complete identity verification, liveness checks, and background screening in select markets.'
        },
        {
            icon: FileCheck,
            title: 'Secure Transactions',
            description: 'Funds sit in escrow until the booking is completed. We monitor transactions in real time for unusual activity.'
        },
        {
            icon: Headset,
            title: '24/7 Incident Response',
            description: 'Dedicated Trust team on standby with less than 5 minute response times for urgent cases.'
        }
    ];

    const guidelines = [
        {
            title: 'Before your booking',
            points: [
                'Review listing details, house rules, and safety equipment descriptions carefully.',
                'Use our messaging system to confirm logistics and share arrival details.',
                'Report suspicious listings or users directly from the app — we investigate every report within 2 hours.'
            ]
        },
        {
            title: 'During your booking',
            points: [
                'Follow local regulations and capacity limits at all times.',
                'Keep emergency contact information easily accessible in the Fiilar app.',
                'Immediately flag safety issues using the Support tab so our team can intervene.'
            ]
        },
        {
            title: 'After your booking',
            points: [
                'Leave a review to help fellow guests understand what to expect.',
                'Submit any incident report within 24 hours so insurance coverage applies.',
                'Hosts should document property condition with photos and update maintenance logs.'
            ]
        }
    ];

    const assurance = [
        {
            label: 'Fiilar Host Guarantee',
            description: 'Coverage up to $1M USD for eligible damages with dedicated claims specialists.'
        },
        {
            label: 'Emergency Coverage',
            description: 'We partner with local authorities and security agencies in every city we operate.'
        },
        {
            label: 'On-site Support',
            description: 'Trained response partners can be dispatched within 30 minutes in major metros.'
        }
    ];

    return (
        <div className="min-h-screen bg-gray-50 pb-24 lg:pb-0">
            <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-brand-900 text-white">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
                    <Button
                        variant="ghost"
                        onClick={() => navigate('/')}
                        className="mb-8 text-white/80 hover:text-white hover:bg-white/10 pl-0"
                        leftIcon={<ArrowLeft size={18} />}
                    >
                        Back to Home
                    </Button>
                    <div className="max-w-3xl">
                        <h1 className="text-4xl md:text-5xl font-bold mb-6">Safety at Fiilar</h1>
                        <p className="text-xl text-white/80 leading-relaxed">
                            We design every feature, policy, and workflow to protect hosts, guests, and communities. Your safety is non-negotiable.
                        </p>
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
                <div className="grid md:grid-cols-3 gap-8 mb-16">
                    {pillars.map((pillar) => (
                        <div key={pillar.title} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <pillar.icon className="w-8 h-8 text-brand-600 mb-4" />
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">{pillar.title}</h3>
                            <p className="text-sm text-gray-500 leading-relaxed">{pillar.description}</p>
                        </div>
                    ))}
                </div>

                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 md:p-12">
                    <h2 className="text-3xl font-bold text-gray-900 mb-8">Safety guidelines</h2>
                    <div className="grid md:grid-cols-3 gap-8">
                        {guidelines.map((section) => (
                            <div key={section.title} className="bg-gray-50 rounded-2xl p-6">
                                <h3 className="font-semibold text-gray-900 mb-4">{section.title}</h3>
                                <ul className="list-disc pl-5 space-y-3 text-sm text-gray-600">
                                    {section.points.map((point) => (
                                        <li key={point}>{point}</li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="mt-16 bg-gradient-to-r from-brand-600 to-brand-700 rounded-3xl p-8 md:p-12 text-white">
                    <div className="grid md:grid-cols-[1.2fr_0.8fr] gap-10 items-center">
                        <div>
                            <h2 className="text-3xl font-bold mb-4">Safety commitments</h2>
                            <p className="text-white/90 leading-relaxed">
                                We work closely with regulators, insurers, and local communities to exceed global standards. Hosts receive training, and guests have round-the-clock access to emergency resources.
                            </p>
                        </div>
                        <div className="grid gap-4">
                            {assurance.map((item) => (
                                <div key={item.label} className="bg-white/10 rounded-2xl p-5">
                                    <div className="flex items-start gap-3">
                                        <Building className="w-5 h-5 text-white mt-1" />
                                        <div>
                                            <p className="font-semibold text-white">{item.label}</p>
                                            <p className="text-sm text-white/80">{item.description}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="mt-16 bg-white rounded-3xl shadow-sm border border-gray-100 p-8 md:p-12">
                    <h2 className="text-2xl font-semibold text-gray-900 mb-6">Report an incident</h2>
                    <p className="text-gray-600 mb-8">
                        If you feel unsafe or experience an incident, contact our Trust & Safety team immediately. We will respond within minutes.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4">
                        <Button
                            variant="primary"
                            className="bg-brand-600 hover:bg-brand-700"
                            onClick={() => window.open('tel:+2348000000000', '_self')}
                        >
                            Call Emergency Line
                        </Button>
                        <Button
                            variant="outline"
                            className="border-brand-600 text-brand-600 hover:bg-brand-50"
                            onClick={() => window.open('mailto:safety@fiilar.com', '_blank')}
                        >
                            Email Trust & Safety
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Safety;
