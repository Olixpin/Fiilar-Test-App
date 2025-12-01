import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

interface LoginOptionsProps {
    onEmailLogin: (email?: string) => void;
    onGoogleLogin: () => void;
    title?: string;
    subtitle?: string;
    variant?: 'default' | 'glass' | 'glass-dark';
}

const LoginOptions: React.FC<LoginOptionsProps> = ({
    onEmailLogin,
    onGoogleLogin,
    title = "Get Started",
    subtitle = "Enter your email to create an account or sign in.",
    variant = 'default'
}) => {
    const isGlass = variant === 'glass' || variant === 'glass-dark';
    const [email, setEmail] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (email.trim()) {
            onEmailLogin(email.trim());
        }
    };

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="mb-5 sm:mb-8">
                <h2 className={`text-2xl sm:text-3xl font-bold mb-2 sm:mb-3 tracking-tight ${isGlass ? 'text-white' : 'text-gray-900'}`}>{title}</h2>
                <p className={`text-sm sm:text-base ${isGlass ? 'text-white/80' : 'text-gray-500'}`}>{subtitle}</p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:gap-4">
                {/* Email Input with Submit Button */}
                <div className="relative">
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email"
                        className={`w-full h-12 sm:h-14 pl-4 pr-14 rounded-xl text-sm sm:text-base transition-all outline-none ${
                            isGlass 
                                ? 'bg-white/10 border border-white/20 text-white placeholder-white/50 focus:border-white/40 focus:bg-white/15' 
                                : 'bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 focus:bg-white'
                        }`}
                        autoComplete="email"
                        autoFocus
                    />
                    <button
                        type="submit"
                        disabled={!email.trim()}
                        title="Continue"
                        aria-label="Continue with email"
                        className={`absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center transition-all ${
                            email.trim()
                                ? 'bg-brand-600 text-white hover:bg-brand-700 shadow-lg shadow-brand-600/30'
                                : isGlass
                                    ? 'bg-white/10 text-white/30 cursor-not-allowed'
                                    : 'bg-gray-100 text-gray-300 cursor-not-allowed'
                        }`}
                    >
                        <ArrowRight size={18} className="sm:w-5 sm:h-5" />
                    </button>
                </div>

                {/* Secondary Option - Google */}
                <div className="mt-3 sm:mt-4">
                    <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
                        <div className={`h-px flex-1 ${isGlass ? 'bg-white/20' : 'bg-gray-200'}`}></div>
                        <span className={`text-[10px] sm:text-[11px] uppercase tracking-wider font-medium ${isGlass ? 'text-white/50' : 'text-gray-400'}`}>or</span>
                        <div className={`h-px flex-1 ${isGlass ? 'bg-white/20' : 'bg-gray-200'}`}></div>
                    </div>

                    <button
                        type="button"
                        onClick={onGoogleLogin}
                        className={`w-full h-10 sm:h-12 flex items-center justify-center gap-2 sm:gap-2.5 rounded-xl border text-xs sm:text-sm font-medium transition-all ${
                            isGlass 
                                ? 'border-white/20 text-white/80 hover:bg-white/10 hover:border-white/30 hover:text-white' 
                                : 'border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50 hover:text-gray-800'
                        }`}
                    >
                        <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-4 h-4 sm:w-5 sm:h-5" alt="Google" />
                        <span>Continue with Google</span>
                    </button>
                </div>
            </form>

            <p className={`mt-5 sm:mt-8 text-[10px] sm:text-xs text-center leading-relaxed ${isGlass ? 'text-white/40' : 'text-gray-400'}`}>
                By continuing, you agree to our <Link to="/terms" className={`underline ${isGlass ? 'hover:text-white' : 'hover:text-gray-600'}`}>Terms of Service</Link> and <Link to="/privacy" className={`underline ${isGlass ? 'hover:text-white' : 'hover:text-gray-600'}`}>Privacy Policy</Link>.
            </p>
        </div>
    );
};

export default LoginOptions;
