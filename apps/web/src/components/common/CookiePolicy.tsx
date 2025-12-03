import React, { useMemo } from 'react';
import { ArrowLeft, Cookie } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@fiilar/ui';

const CookiePolicy: React.FC = () => {
    const navigate = useNavigate();

    const policySections = useMemo(() => (
        [
            {
                id: 'overview',
                title: '1. Overview',
                content: (
                    <p>
                        This Cookie Policy explains how Fiilar and our partners use cookies, pixels, and similar technologies across our website, app, and communications to deliver, personalize, and improve services.
                    </p>
                )
            },
            {
                id: 'types',
                title: '2. Types of cookies we use',
                content: (
                    <ul className="list-disc pl-6 space-y-2 text-gray-600">
                        <li><strong>Essential cookies:</strong> Required for secure login, booking workflows, and payment processing.</li>
                        <li><strong>Performance cookies:</strong> Help us understand how guests discover and interact with listings.</li>
                        <li><strong>Functional cookies:</strong> Remember preferences such as language, currency, and saved searches.</li>
                        <li><strong>Advertising cookies:</strong> Deliver relevant offers on and off Fiilar with partner networks.</li>
                    </ul>
                )
            },
            {
                id: 'control',
                title: '3. Managing your preferences',
                content: (
                    <>
                        <p className="mb-4">You can control cookies through your browser settings or our cookie consent manager. Essential cookies cannot be disabled because they enable core functionality.</p>
                        <p>For personalised advertising settings, use the opt-out links provided in our emails or visit the network advertising initiative for more options.</p>
                    </>
                )
            },
            {
                id: 'partners',
                title: '4. Third-party partners',
                content: (
                    <p>
                        We partner with analytics and marketing providers who may set cookies when you interact with Fiilar. We require all partners to comply with data protection laws and process personal data only on our instructions.
                    </p>
                )
            },
            {
                id: 'updates',
                title: '5. Updates to this policy',
                content: (
                    <p>
                        We update this policy periodically to reflect new regulations or product changes. We will notify you of any material updates via email or in-app notification.
                    </p>
                )
            },
            {
                id: 'contact',
                title: '6. Contact',
                content: (
                    <p>
                        Questions about this Cookie Policy? Email privacy@fiilar.com or write to Fiilar, 2B Admiralty Way, Lekki Phase 1, Lagos, Nigeria.
                    </p>
                )
            }
        ]
    ), []);

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
                        <Cookie className="w-4 h-4" />
                        Last updated: November 22, 2024
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Cookie Policy</h1>
                    <p className="text-lg text-gray-500 max-w-2xl">
                        We use cookies to create secure, personalised booking experiences. This policy outlines what data we collect and how you can manage preferences.
                    </p>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                    {policySections.map((item, index) => (
                        <section
                            key={item.id}
                            id={item.id}
                            className={`p-6 md:p-10 ${index !== policySections.length - 1 ? 'border-b border-gray-100' : ''}`}
                        >
                            <h2 className="text-xl md:text-2xl font-semibold text-gray-900 mb-4">{item.title}</h2>
                            <div className="text-gray-600 leading-relaxed space-y-4">
                                {item.content}
                            </div>
                        </section>
                    ))}
                </div>

                <div className="mt-12 bg-gray-900 text-white rounded-3xl p-8 md:p-12">
                    <h2 className="text-2xl font-semibold mb-3">Need more information?</h2>
                    <p className="text-white/80 mb-6 max-w-2xl">
                        You can manage cookie preferences in "Settings &gt; Privacy" at any time. For detailed data requests, contact privacy@fiilar.com and we&apos;ll respond within 72 hours.
                    </p>
                    <Button
                        variant="secondary"
                        className="bg-white text-brand-600 hover:bg-gray-100"
                        onClick={() => window.open('mailto:privacy@fiilar.com', '_blank')}
                    >
                        Email our privacy team
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default CookiePolicy;

