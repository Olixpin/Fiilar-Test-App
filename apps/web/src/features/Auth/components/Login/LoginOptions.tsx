import React from 'react';
import { Link } from 'react-router-dom';
import { Mail } from 'lucide-react';
import { Button, Input, Select, FormField, FormItem, FormControl, FormMessage } from '@fiilar/ui';
import { UseFormReturn } from 'react-hook-form';

interface LoginOptionsProps {
    country: string;
    setCountry: (value: string) => void;
    phoneForm: UseFormReturn<{ phone: string }>;
    onContinue: () => void;
    onEmailLogin: () => void;
    onGoogleLogin: () => void;
    onAdminLogin?: () => void;
    title?: string;
    subtitle?: string;
    showAdminLink?: boolean;
    variant?: 'default' | 'glass' | 'glass-dark';
}

const LoginOptions: React.FC<LoginOptionsProps> = ({
    country,
    setCountry,
    phoneForm,
    onContinue,
    onEmailLogin,
    onGoogleLogin,
    onAdminLogin,
    title = "Get Started",
    subtitle = "Enter your details to create an account or sign in.",
    showAdminLink = true,
    variant = 'default'
}) => {
    const isGlass = variant === 'glass' || variant === 'glass-dark';

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="mb-10">
                <h2 className={`text-3xl font-bold mb-3 tracking-tight ${isGlass ? 'text-white' : 'text-gray-900'}`}>{title}</h2>
                <p className={`text-base ${isGlass ? 'text-white/80' : 'text-gray-500'}`}>{subtitle}</p>
            </div>

            <div className="mb-8">
                <FormField
                    control={phoneForm.control}
                    name="phone"
                    render={({ field }) => (
                        <FormItem>
                            <div className="flex flex-col sm:flex-row gap-3">
                                <div className="w-full sm:w-[140px] shrink-0">
                                    <Select
                                        id="country"
                                        label="Country"
                                        variant={variant === 'default' ? undefined : variant}
                                        value={country}
                                        onChange={(e) => setCountry(e.target.value)}
                                        options={[
                                            { value: 'ng', label: 'NG (+234)' },
                                            { value: 'us', label: 'US (+1)' },
                                            { value: 'uk', label: 'UK (+44)' },
                                        ]}
                                        className={variant === 'default' ? "bg-gray-50/50 border-gray-200 focus:bg-white focus:border-brand-500 transition-all" : ""}
                                    />
                                </div>
                                <div className="grow">
                                    <FormControl>
                                        <Input
                                            id="phone"
                                            autoComplete="tel"
                                            label="Phone number"
                                            type="tel"
                                            variant={variant === 'default' ? undefined : variant}
                                            placeholder="(555) 000-0000"
                                            className={variant === 'default' ? "bg-gray-50/50 border-gray-200 focus:bg-white focus:border-brand-500 transition-all" : ""}
                                            {...field}
                                            onChange={(e) => {
                                                let value = e.target.value.replace(/\D/g, '');
                                                if (country === 'ng') {
                                                    if (value.startsWith('0')) {
                                                        value = value.substring(1);
                                                    }
                                                    if (value.length > 10) {
                                                        value = value.substring(0, 10);
                                                    }
                                                }
                                                field.onChange(value);
                                            }}
                                        />
                                    </FormControl>
                                </div>
                            </div>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>

            <Button
                onClick={onContinue}
                variant={isGlass ? 'glass-dark' : 'primary'}
                size="lg"
                className={`w-full h-12 text-base ${isGlass ? '' : 'shadow-lg shadow-brand-600/20'}`}
            >
                Continue
            </Button>

            <div className="flex items-center gap-4 my-8">
                <div className={`h-px flex-1 ${isGlass ? 'bg-white/20' : 'bg-gray-100'}`}></div>
                <span className={`text-xs uppercase tracking-wider font-medium ${isGlass ? 'text-white/60' : 'text-gray-400'}`}>Or continue with</span>
                <div className={`h-px flex-1 ${isGlass ? 'bg-white/20' : 'bg-gray-100'}`}></div>
            </div>

            <div className="flex flex-col gap-3">
                <Button
                    onClick={onGoogleLogin}
                    variant="outline"
                    size="lg"
                    iconSpacing="gap-3"
                    className={`w-full h-12 font-medium ${isGlass ? 'border-white/20 text-white hover:bg-white/10 hover:border-white/40' : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700'}`}
                    leftIcon={<img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5" alt="Google" />}
                >
                    Continue with Google
                </Button>

                <Button
                    onClick={onEmailLogin}
                    variant="outline"
                    size="lg"
                    iconSpacing="gap-3"
                    className={`w-full h-12 font-medium ${isGlass ? 'border-white/20 text-white hover:bg-white/10 hover:border-white/40' : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700'}`}
                    leftIcon={<Mail size={18} />}
                >
                    Continue with Email
                </Button>
            </div>

            <p className={`mt-8 text-xs text-center leading-relaxed ${isGlass ? 'text-white/40' : 'text-gray-400'}`}>
                By continuing, you agree to our <Link to="/terms" className={`underline ${isGlass ? 'hover:text-white' : 'hover:text-gray-600'}`}>Terms of Service</Link> and <Link to="/privacy" className={`underline ${isGlass ? 'hover:text-white' : 'hover:text-gray-600'}`}>Privacy Policy</Link>.
            </p>

            {showAdminLink && onAdminLogin && (
                <div className="mt-6 text-center">
                    <button onClick={onAdminLogin} className={`text-xs transition-colors font-medium ${isGlass ? 'text-white/40 hover:text-white' : 'text-gray-300 hover:text-brand-600'}`}>Admin Access</button>
                </div>
            )}
        </div>
    );
};

export default LoginOptions;
