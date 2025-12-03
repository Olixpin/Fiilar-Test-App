import React from 'react';
import { ArrowLeft, Rocket, Users, Briefcase, Laptop, PenTool, Shield, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@fiilar/ui';

const Careers: React.FC = () => {
    const navigate = useNavigate();

    const teams = [
        {
            name: 'Product & Engineering',
            description: 'Build resilient systems that power millions of bookings with delightful, accessible experiences.'
        },
        {
            name: 'Design & Research',
            description: 'Craft intuitive, beautiful interfaces grounded in real customer insights.'
        },
        {
            name: 'Trust & Operations',
            description: 'Champion safety, compliance, and community success across every market we serve.'
        }
    ];

    const benefits = [
        {
            icon: Shield,
            title: 'Comprehensive Coverage',
            description: 'Global health plans, wellness stipends, and mental health support for team members and families.'
        },
        {
            icon: Laptop,
            title: 'Flexible Work',
            description: 'Hybrid-first culture with co-working support so you can do your best work wherever you are.'
        },
        {
            icon: PenTool,
            title: 'Learning Budget',
            description: 'Annual allowance for courses, conferences, and certifications to keep your skills sharp.'
        }
    ];

    const openings = [
        {
            title: 'Senior Software Engineer',
            location: 'Remote / Lagos',
            type: 'Full-time'
        },
        {
            title: 'Product Designer',
            location: 'Remote / Nairobi',
            type: 'Full-time'
        },
        {
            title: 'Marketplace Operations Lead',
            location: 'Hybrid / London',
            type: 'Full-time'
        }
    ];

    return (
        <div className="min-h-screen bg-gray-50 pb-24 lg:pb-0">
            <div className="bg-gradient-to-br from-brand-600 via-brand-700 to-brand-900 text-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
                    <Button
                        variant="ghost"
                        onClick={() => navigate('/')}
                        className="mb-8 text-white/80 hover:text-white hover:bg-white/10 pl-0"
                        leftIcon={<ArrowLeft size={18} />}
                    >
                        Back to Home
                    </Button>
                    <div className="max-w-3xl">
                        <p className="uppercase tracking-[0.3em] text-sm text-white/60 mb-4">Join Our Team</p>
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                            Build the future of space sharing with Fiilar
                        </h1>
                        <p className="text-xl text-white/90 leading-relaxed">
                            We are assembling a world-class, mission-driven team that believes in unlocking human potential through access to incredible spaces.
                        </p>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
                <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-12 items-start">
                    <div>
                        <h2 className="text-3xl font-bold text-gray-900 mb-6">Why Fiilar</h2>
                        <p className="text-lg text-gray-600 leading-relaxed mb-6">
                            We are passionate about building technology that empowers communities. At Fiilar, you will collaborate with curious minds, move quickly, and make a measurable impact across the globe.
                        </p>
                        <div className="grid sm:grid-cols-3 gap-6">
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                                <Rocket className="w-8 h-8 text-brand-600 mb-4" />
                                <h3 className="font-semibold mb-2">Fast-growing marketplace</h3>
                                <p className="text-sm text-gray-500 leading-relaxed">Massive opportunity to define how people discover and use spaces.</p>
                            </div>
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                                <Users className="w-8 h-8 text-brand-600 mb-4" />
                                <h3 className="font-semibold mb-2">Inclusive culture</h3>
                                <p className="text-sm text-gray-500 leading-relaxed">We celebrate diverse experiences and create room for every voice.</p>
                            </div>
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                                <Briefcase className="w-8 h-8 text-brand-600 mb-4" />
                                <h3 className="font-semibold mb-2">Meaningful work</h3>
                                <p className="text-sm text-gray-500 leading-relaxed">Tackle complex problems with real-world impact on hosts and guests.</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
                        <h3 className="text-xl font-semibold text-gray-900 mb-4">Teams hiring now</h3>
                        <ul className="space-y-4">
                            {teams.map((team) => (
                                <li key={team.name} className="border border-gray-100 rounded-2xl p-4 hover:border-brand-200 transition-colors">
                                    <p className="font-semibold text-gray-900 mb-1">{team.name}</p>
                                    <p className="text-sm text-gray-500 leading-relaxed">{team.description}</p>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>

            <div className="bg-gray-900 py-16 md:py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-3xl font-bold text-white mb-10 text-center">Benefits & Perks</h2>
                    <div className="grid md:grid-cols-3 gap-8">
                        {benefits.map((benefit) => (
                            <div key={benefit.title} className="bg-gray-800 rounded-2xl p-6">
                                <benefit.icon className="w-8 h-8 text-brand-400 mb-4" />
                                <h3 className="text-xl font-semibold text-white mb-2">{benefit.title}</h3>
                                <p className="text-sm text-gray-400 leading-relaxed">{benefit.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 md:p-12">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                        <div>
                            <h2 className="text-3xl font-bold text-gray-900 mb-3">Open roles</h2>
                            <p className="text-gray-600">We recruit continuously. Don\'t see your role? Reach out anyway — we love meeting great talent.</p>
                        </div>
                        <Button
                            variant="primary"
                            className="bg-brand-600 hover:bg-brand-700"
                            onClick={() => window.open('mailto:careers@fiilar.com', '_blank')}
                        >
                            Send Us Your Resume
                        </Button>
                    </div>
                    <div className="mt-10 space-y-4">
                        {openings.map((role) => (
                            <div key={role.title} className="flex flex-col sm:flex-row sm:items-center justify-between border border-gray-100 rounded-2xl p-5 hover:border-brand-200 transition-colors">
                                <div>
                                    <p className="text-lg font-semibold text-gray-900">{role.title}</p>
                                    <p className="text-sm text-gray-500">{role.location} • {role.type}</p>
                                </div>
                                <Button
                                    variant="ghost"
                                    className="text-brand-600 hover:text-brand-700 hover:bg-brand-50"
                                    rightIcon={<ChevronRight size={16} />}
                                    onClick={() => window.open('mailto:careers@fiilar.com', '_blank')}
                                >
                                    Apply Now
                                </Button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Careers;
