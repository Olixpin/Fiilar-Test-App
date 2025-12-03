import React from 'react';
import { ArrowLeft, Mail, Phone, MapPin, Clock, MessageCircle, Twitter, Instagram, Facebook, Linkedin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button, Input, TextArea } from '@fiilar/ui';

const ContactUs: React.FC = () => {
    const navigate = useNavigate();

    const contacts = [
        {
            icon: Mail,
            label: 'Email',
            value: 'hello@fiilar.com',
            action: () => window.open('mailto:hello@fiilar.com', '_blank')
        },
        {
            icon: Phone,
            label: 'Phone',
            value: '+234 800 000 0000',
            action: () => window.open('tel:+2348000000000', '_self')
        },
        {
            icon: MapPin,
            label: 'HQ',
            value: '2B Admiralty Way, Lekki Phase 1, Lagos, Nigeria'
        },
        {
            icon: Clock,
            label: 'Support Hours',
            value: '24/7 for urgent issues, 08:00 - 20:00 WAT daily for general enquiries'
        }
    ];

    const socialLinks = [
        { icon: Twitter, label: 'Twitter/X', url: 'https://twitter.com/fiilar' },
        { icon: Instagram, label: 'Instagram', url: 'https://instagram.com/fiilar' },
        { icon: Facebook, label: 'Facebook', url: 'https://facebook.com/fiilar' },
        { icon: Linkedin, label: 'LinkedIn', url: 'https://linkedin.com/company/fiilar' }
    ];

    return (
        <div className="min-h-screen bg-gray-50 pb-24 lg:pb-0">
            <div className="bg-gradient-to-br from-brand-600 via-brand-700 to-brand-800 text-white">
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
                        <h1 className="text-4xl md:text-5xl font-bold mb-6">Contact Fiilar</h1>
                        <p className="text-lg md:text-xl text-white/80 leading-relaxed">
                            We\'re here to help. Reach out for support, partnerships, press enquiries, or general questions.
                        </p>
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
                <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-12">
                    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 md:p-12">
                        <h2 className="text-2xl font-semibold text-gray-900 mb-6">Send us a message</h2>
                        <p className="text-gray-600 mb-8">Complete the form and we\'ll respond within 12 hours. For urgent issues, use live chat or phone.</p>
                        <form className="space-y-6">
                            <Input placeholder="Full name" required />
                            <Input placeholder="Email address" type="email" required />
                            <Input placeholder="Phone number" />
                            <TextArea placeholder="How can we help?" rows={5} required />
                            <Button
                                variant="primary"
                                className="w-full bg-brand-600 hover:bg-brand-700"
                                onClick={(event) => {
                                    event.preventDefault();
                                    window.open('mailto:hello@fiilar.com', '_blank');
                                }}
                            >
                                Submit request
                            </Button>
                        </form>
                    </div>

                    <div className="space-y-8">
                        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
                            <h3 className="text-xl font-semibold text-gray-900 mb-4">Reach us directly</h3>
                            <div className="space-y-4">
                                {contacts.map((item) => (
                                    <button
                                        key={item.label}
                                        className="w-full text-left bg-gray-50 rounded-2xl p-4 hover:bg-gray-100 transition-colors"
                                        onClick={item.action}
                                        type="button"
                                    >
                                        <div className="flex items-start gap-4">
                                            <item.icon className="w-5 h-5 text-brand-600 mt-1" />
                                            <div>
                                                <p className="font-semibold text-gray-900">{item.label}</p>
                                                <p className="text-sm text-gray-600 leading-relaxed">{item.value}</p>
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
                            <h3 className="text-xl font-semibold text-gray-900 mb-4">Connect online</h3>
                            <div className="grid grid-cols-2 gap-4">
                                {socialLinks.map((link) => (
                                    <button
                                        key={link.label}
                                        onClick={() => window.open(link.url, '_blank')}
                                        className="flex items-center justify-center gap-2 bg-gray-50 hover:bg-gray-100 rounded-2xl py-3 text-sm font-medium text-gray-700 transition-colors"
                                        type="button"
                                    >
                                        <link.icon className="w-4 h-4" />
                                        {link.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
                            <h3 className="text-xl font-semibold text-gray-900 mb-3">Press & partnerships</h3>
                            <p className="text-sm text-gray-600 leading-relaxed mb-4">
                                For media requests, brand collaborations, or investor enquiries, email <strong>press@fiilar.com</strong> and our communications team will respond within one business day.
                            </p>
                            <Button
                                variant="outline"
                                className="border-brand-600 text-brand-600 hover:bg-brand-50"
                                onClick={() => window.open('mailto:press@fiilar.com', '_blank')}
                            >
                                Contact press team
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ContactUs;
