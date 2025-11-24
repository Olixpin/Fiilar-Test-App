import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';

const NotFound: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-linear-to-br from-gray-50 to-white flex items-center justify-center px-6 sm:px-12">
            <div className="max-w-2xl w-full text-left">
                {/* Logo and 404 stacked */}
                <div className="mb-10">
                    <button onClick={() => navigate('/')} className="focus:outline-none mb-8 inline-block hover:opacity-80 transition-opacity">
                        <img
                            src="https://drive.google.com/thumbnail?id=11AM3I7DLtyDpwgduNdtbUaZXJUYpvruC&sz=w400"
                            alt="Fiilar"
                            className="h-8 object-contain"
                            referrerPolicy="no-referrer"
                        />
                    </button>
                    <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3 tracking-tight">
                        404
                    </h2>

                    <h3 className="text-3xl sm:text-4xl font-medium text-gray-800 mb-4 tracking-tight">
                        Page not found
                    </h3>

                    <p className="text-base text-gray-600 max-w-md leading-relaxed">
                        The page you're looking for doesn't exist or has been moved.
                    </p>
                </div>

                {/* Action buttons */}
                <div className="flex flex-wrap gap-3 mb-16">
                    <button
                        onClick={() => navigate(-1)}
                        className="inline-flex items-center gap-2 px-6 py-3 text-gray-700 font-medium rounded-lg border border-gray-300 hover:bg-gray-50 hover:border-gray-400 transition-all"
                    >
                        <ArrowLeft size={18} />
                        Go back
                    </button>

                    <button
                        onClick={() => navigate('/')}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-brand-600 text-white font-medium rounded-lg hover:bg-brand-700 transition-all shadow-sm hover:shadow"
                    >
                        <Home size={18} />
                        Homepage
                    </button>
                </div>

                {/* Quick links */}
                <div className="border-t border-gray-200 pt-8">
                    <p className="text-sm font-medium text-gray-500 mb-4">Quick links</p>
                    <div className="flex flex-wrap gap-4">
                        <button
                            onClick={() => navigate('/')}
                            className="text-sm text-brand-600 hover:text-brand-700 font-medium"
                        >
                            Browse Spaces
                        </button>
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="text-sm text-brand-600 hover:text-brand-700 font-medium"
                        >
                            Dashboard
                        </button>
                        <button
                            onClick={() => navigate('/login')}
                            className="text-sm text-brand-600 hover:text-brand-700 font-medium"
                        >
                            Sign In
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NotFound;
