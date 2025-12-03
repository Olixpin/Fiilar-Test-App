import React from 'react';
import { ArrowLeft, Shield, FileText, Users, Lock, AlarmClock, LifeBuoy } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@fiilar/ui';

const TrustAndSafety: React.FC = () => {
    const navigate = useNavigate();

    const principles = [
        {
            title: 'Proactive Verification',
            description: 'Multi-layer verification for hosts and guests, including identity documents, facial recognition, and address validation.'
        },
        {
            title: 'Secure Payments & Escrow',
            description: 'All payments are processed through Fiilar and held until bookings are successfully completed.'
        },
        {
            title: 'Transparent Reviews',
            description: 'Every stay is reviewed by both parties with moderation tools to protect against bias or misinformation.'
        }
    ];

    const commitments = [
        {
            icon: Shield,
            label: 'Insurance & Guarantees',
            detail: 'Up to $1M USD in property protection for qualifying hosts. Guest liability coverage applies to all bookings.'
        },
        {
            icon: Users,
            label: 'Dedicated Trust Team',
            detail: 'Specialists monitor activity 24/7 and intervene when unusual behavior is detected.'
        },
        {
            icon: Lock,
            label: 'Privacy & Data Protection',
            detail: 'GDPR-compliant data handling with regular audits to safeguard sensitive information.'
        },
        {
            icon: AlarmClock,
            label: 'Rapid Response',
            detail: 'Average response time of 4 minutes for urgent trust & safety tickets worldwide.'
        }
    ];

    const resources = [
        {
            label: 'Community Guidelines',
            description: 'Our policies outlining respectful conduct, anti-discrimination rules, and penalties.',
            action: () => window.open('/docs/QA_TESTING_GUIDE.pdf', '_blank')
        },
        {
            label: 'Host Safety Standards',
            description: 'Checklist for safety equipment, emergency plans, and guest communications.',
            action: () => window.open('mailto:safety@fiilar.com', '_blank')
        },
        {
            label: 'Incident Reporting',
            description: 'Submit a report directly to our Trust & Safety team for immediate attention.',
            action: () => window.open('mailto:trust@fiilar.com', '_blank')
        }
    ];

    return (
        <div className="min-h-screen bg-gray-50 pb-24 lg:pb-0">
            <div className="bg-gradient-to-br from-brand-700 via-brand-800 to-gray-900 text-white">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
                    <Button
                        variant="ghost"
                        onClick={() => navigate('/')}
                        className="mb-8 text-white/80 hover:text-white hover:bg-white/10"
                        leftIcon={<ArrowLeft size={18} />}
                    >
                        Back to Home
                    </Button>
                    <div className="max-w-3xl">
                        <h1 className="text-4xl md:text-5xl font-bold mb-6">Trust & Safety</h1>
                        <p className="text-xl text-white/85 leading-relaxed">
                            Trust is earned — we work relentlessly to protect every booking, host, and guest on Fiilar.
                        </p>
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
                <div className="grid md:grid-cols-3 gap-8 mb-16">
                    {principles.map((item) => (
                        <div key={item.title} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <h3 className="text-xl font-semibold text-gray-900 mb-3">{item.title}</h3>
                            <p className="text-sm text-gray-600 leading-relaxed">{item.description}</p>
                        </div>
                    ))}
                </div>

                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 md:p-12">
                    <h2 className="text-3xl font-bold text-gray-900 mb-8">Our commitments</h2>
                    <div className="grid sm:grid-cols-2 gap-6">
                        {commitments.map((item) => (
                            <div key={item.label} className="bg-gray-50 rounded-2xl p-6">
                                <div className="flex items-start gap-4">
                                    <item.icon className="w-6 h-6 text-brand-600" />
                                    <div>
                                        <p className="font-semibold text-gray-900 mb-1">{item.label}</p>
                                        <p className="text-sm text-gray-600 leading-relaxed">{item.detail}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="mt-16 bg-gradient-to-r from-brand-600 to-brand-700 rounded-3xl p-8 md:p-12 text-white">
                    <div className="max-w-3xl">
                        <h2 className="text-3xl font-bold mb-4">Zero-tolerance policies</h2>
                        <p className="text-white/85 leading-relaxed">
                            We have strict policies against discrimination, harassment, misuse of personal data, and unsafe behavior. Violations result in immediate removal and may be escalated to authorities.
                        </p>
                    </div>
                </div>

                <div className="mt-16 bg-white rounded-3xl shadow-sm border border-gray-100 p-8 md:p-12">
                    <h2 className="text-2xl font-semibold text-gray-900 mb-6">Resources & Support</h2>
                    <div className="grid sm:grid-cols-3 gap-6">
                        {resources.map((resource) => (
                            <button
                                key={resource.label}
                                onClick={resource.action}
                                className="bg-gray-50 hover:bg-gray-100 rounded-2xl p-6 text-left transition-colors"
                                type="button"
                            >
                                <FileText className="w-6 h-6 text-brand-600 mb-3" />
                                <p className="font-semibold text-gray-900">{resource.label}</p>
                                <p className="text-sm text-gray-600 leading-relaxed">{resource.description}</p>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="mt-16 bg-gray-900 text-white rounded-3xl p-8 md:p-12 text-center">
                    <LifeBuoy className="w-12 h-12 text-brand-400 mx-auto mb-4" />
                    <h2 className="text-3xl font-bold mb-3">We\'re here for you</h2>
                    <p className="text-white/80 mb-6 max-w-2xl mx-auto">
                        For urgent matters, call +234 800 000 0000. For non-urgent reports, email trust@fiilar.com. We are committed to resolving every concern quickly.
                    </p>
                    <Button
                        variant="secondary"
                        className="bg-white text-brand-600 hover:bg-gray-100"
                        onClick={() => window.open('mailto:trust@fiilar.com', '_blank')}
                    >
                        Contact Trust & Safety
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default TrustAndSafety;
