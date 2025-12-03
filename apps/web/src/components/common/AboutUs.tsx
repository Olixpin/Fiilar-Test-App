import React from 'react';
import { ArrowLeft, Users, Target, Heart, Globe, Shield, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@fiilar/ui';

const AboutUs: React.FC = () => {
    const navigate = useNavigate();

    const values = [
        {
            icon: Heart,
            title: 'Trust & Transparency',
            description: 'We build relationships based on honesty, ensuring every interaction on our platform is secure and genuine.'
        },
        {
            icon: Users,
            title: 'Community First',
            description: 'Our hosts and guests are at the heart of everything we do. We empower people to share spaces and create memories.'
        },
        {
            icon: Globe,
            title: 'Global Access',
            description: 'We\'re breaking down barriers to make unique spaces accessible to everyone, everywhere in the world.'
        },
        {
            icon: Shield,
            title: 'Safety & Security',
            description: 'Your safety is our priority. We implement rigorous verification and protection measures for peace of mind.'
        },
        {
            icon: Zap,
            title: 'Innovation',
            description: 'We continuously improve our platform to deliver the best booking experience possible.'
        },
        {
            icon: Target,
            title: 'Excellence',
            description: 'We strive for excellence in every detail, from user experience to customer support.'
        }
    ];

    const stats = [
        { value: '10K+', label: 'Active Listings' },
        { value: '50K+', label: 'Happy Guests' },
        { value: '5K+', label: 'Trusted Hosts' },
        { value: '20+', label: 'Cities' }
    ];

    const team = [
        {
            name: 'Leadership Team',
            description: 'Our experienced leadership brings together expertise from technology, hospitality, and finance to drive Fiilar\'s vision forward.'
        }
    ];

    return (
        <div className="min-h-screen bg-gray-50 pb-24 lg:pb-0">
            {/* Hero Section */}
            <div className="bg-gradient-to-br from-brand-600 to-brand-800 text-white">
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
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 tracking-tight">
                            About Fiilar
                        </h1>
                        <p className="text-xl md:text-2xl text-white/90 leading-relaxed">
                            We're building the future of space sharing — connecting people with unique venues for work, events, and memorable experiences.
                        </p>
                    </div>
                </div>
            </div>

            {/* Mission Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
                <div className="grid md:grid-cols-2 gap-12 items-center">
                    <div>
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Our Mission</h2>
                        <p className="text-lg text-gray-600 leading-relaxed mb-6">
                            At Fiilar, we believe everyone deserves access to amazing spaces. Whether you're hosting a birthday party, planning a corporate retreat, or looking for a unique venue for your next creative project — we make it happen.
                        </p>
                        <p className="text-lg text-gray-600 leading-relaxed">
                            We empower property owners to monetize their spaces while giving guests access to venues they'd never find elsewhere. It's a win-win that's transforming how people think about space.
                        </p>
                    </div>
                    <div className="bg-gradient-to-br from-brand-50 to-brand-100 rounded-3xl p-8 md:p-12">
                        <div className="grid grid-cols-2 gap-6">
                            {stats.map((stat, index) => (
                                <div key={index} className="text-center">
                                    <div className="text-3xl md:text-4xl font-bold text-brand-600 mb-1">{stat.value}</div>
                                    <div className="text-sm text-gray-600">{stat.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Values Section */}
            <div className="bg-white py-16 md:py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Our Values</h2>
                        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                            These core principles guide everything we do at Fiilar.
                        </p>
                    </div>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
                        {values.map((value, index) => (
                            <div key={index} className="bg-gray-50 rounded-2xl p-6 hover:shadow-lg transition-shadow">
                                <div className="w-12 h-12 bg-brand-100 rounded-xl flex items-center justify-center mb-4">
                                    <value.icon className="w-6 h-6 text-brand-600" />
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">{value.title}</h3>
                                <p className="text-gray-600">{value.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Story Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
                <div className="max-w-3xl mx-auto text-center">
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Our Story</h2>
                    <p className="text-lg text-gray-600 leading-relaxed mb-6">
                        Fiilar was born from a simple observation: there are countless amazing spaces sitting empty, and countless people searching for the perfect venue. We saw an opportunity to bridge this gap.
                    </p>
                    <p className="text-lg text-gray-600 leading-relaxed mb-6">
                        Founded in 2024, we've grown from a small startup to a thriving marketplace connecting thousands of hosts and guests across multiple cities. But we're just getting started.
                    </p>
                    <p className="text-lg text-gray-600 leading-relaxed">
                        Our vision is to become the go-to platform for space sharing globally — making it easy for anyone to find, book, and enjoy unique spaces for any occasion.
                    </p>
                </div>
            </div>

            {/* Team Section */}
            <div className="bg-gray-900 text-white py-16 md:py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">Meet Our Team</h2>
                        <p className="text-lg text-gray-400 max-w-2xl mx-auto">
                            We're a passionate team of builders, dreamers, and problem-solvers dedicated to revolutionizing the space-sharing industry.
                        </p>
                    </div>
                    <div className="bg-gray-800 rounded-2xl p-8 md:p-12 text-center">
                        <Users className="w-16 h-16 text-brand-400 mx-auto mb-6" />
                        <h3 className="text-2xl font-semibold mb-4">We're Hiring!</h3>
                        <p className="text-gray-400 mb-6 max-w-xl mx-auto">
                            Join our growing team and help shape the future of space sharing. We're always looking for talented individuals who share our passion.
                        </p>
                        <Button
                            variant="primary"
                            onClick={() => navigate('/careers')}
                            className="bg-brand-600 hover:bg-brand-700"
                        >
                            View Open Positions
                        </Button>
                    </div>
                </div>
            </div>

            {/* CTA Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
                <div className="bg-gradient-to-r from-brand-600 to-brand-700 rounded-3xl p-8 md:p-12 text-center text-white">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Get Started?</h2>
                    <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
                        Join thousands of hosts and guests already using Fiilar to discover and share amazing spaces.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button
                            variant="secondary"
                            onClick={() => navigate('/')}
                            className="bg-white text-brand-600 hover:bg-gray-100"
                        >
                            Explore Spaces
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => navigate('/host-onboarding')}
                            className="border-white text-white hover:bg-white/10"
                        >
                            Host Your Space
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AboutUs;
