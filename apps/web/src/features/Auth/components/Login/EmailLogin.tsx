import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Input, Button, FormField, FormItem, FormControl, FormMessage } from '@fiilar/ui';
import { UseFormReturn } from 'react-hook-form';

interface EmailLoginProps {
    form: UseFormReturn<{ email: string }>;
    onBack: () => void;
    onContinue: () => void;
    variant?: 'default' | 'glass' | 'glass-dark';
}

const EmailLogin: React.FC<EmailLoginProps> = ({
    form,
    onBack,
    onContinue,
    variant = 'default'
}) => {
    const isGlass = variant === 'glass' || variant === 'glass-dark';

    return (
        <div className="animate-in fade-in slide-in-from-right-8 duration-500">
            <button
                onClick={onBack}
                className={`mb-8 flex items-center text-sm font-medium transition-colors group ${isGlass ? 'text-white/60 hover:text-white' : 'text-gray-500 hover:text-gray-900'}`}
            >
                <ArrowLeft size={16} className="mr-2 group-hover:-translate-x-1 transition-transform" />
                Back to options
            </button>

            <div className="mb-8">
                <h2 className={`text-3xl font-bold mb-3 ${isGlass ? 'text-white' : 'text-gray-900'}`}>Sign in with email</h2>
                <p className={`${isGlass ? 'text-white/80' : 'text-gray-500'}`}>Enter your email address to receive a verification code.</p>
            </div>

            <div className="mb-8">
                <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                        <FormItem>
                            <FormControl>
                                <Input
                                    id="email"
                                    autoComplete="email"
                                    type="email"
                                    label="Email address"
                                    variant={variant === 'default' ? undefined : variant}
                                    autoFocus
                                    className={variant === 'default' ? "bg-gray-50/50 border-gray-200 focus:bg-white focus:border-brand-500" : ""}
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>

            <Button
                onClick={onContinue}
                variant={isGlass ? 'glass-dark' : 'primary'}
                size="lg"
                className={`w-full h-12 ${isGlass ? '' : 'shadow-lg shadow-brand-600/20'}`}
            >
                Continue
            </Button>
        </div>
    );
};

export default EmailLogin;
