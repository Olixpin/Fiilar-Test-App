import React, { useState } from 'react';
import { User } from '@fiilar/types';
import { Button, Form, FormField, FormItem, FormControl, FormMessage, useToast } from '@fiilar/ui';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Phone, ShieldAlert } from 'lucide-react';
import { saveUser } from '@fiilar/storage';
import { PhoneInput } from '../../../components/common/PhoneInput';

interface HostPhoneCollectionModalProps {
    user: User;
    isOpen: boolean;
    onClose: () => void;
    onUpdateUser: (user: User) => void;
}

const HostPhoneCollectionModal: React.FC<HostPhoneCollectionModalProps> = ({ user, isOpen, onClose, onUpdateUser }) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { showToast } = useToast();



    const countryCodes: Record<string, string> = {
        ng: '+234',
        us: '+1',
        uk: '+44',
    };

    const phoneSchema = z.object({
        phone: z.string().superRefine((val, ctx) => {
            // Remove spaces and non-digit chars (except +)
            const cleanVal = val.replace(/[^\d+]/g, '');

            // Detect country from prefix
            let detectedCountry = 'ng'; // Default
            let code = '+234';

            if (cleanVal.startsWith('+1')) {
                detectedCountry = 'us';
                code = '+1';
            } else if (cleanVal.startsWith('+44')) {
                detectedCountry = 'uk';
                code = '+44';
            } else if (cleanVal.startsWith('+234')) {
                detectedCountry = 'ng';
                code = '+234';
            }

            if (!cleanVal.startsWith(code)) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: `Phone number must start with ${code}`,
                });
                return;
            }

            const numberPart = cleanVal.substring(code.length);

            if (detectedCountry === 'ng') {
                if (numberPart.length !== 10) {
                    ctx.addIssue({
                        code: z.ZodIssueCode.custom,
                        message: "Phone number must be exactly 10 digits after country code",
                    });
                }
            } else {
                if (numberPart.length < 10) {
                    ctx.addIssue({
                        code: z.ZodIssueCode.custom,
                        message: "Phone number must be at least 10 digits after country code",
                    });
                }
            }
        }),
    });

    const form = useForm<z.infer<typeof phoneSchema>>({
        resolver: zodResolver(phoneSchema),
        defaultValues: {
            phone: countryCodes['ng'] + " ",
        },
    });


    const onSubmit = async (data: z.infer<typeof phoneSchema>) => {
        setIsSubmitting(true);
        try {
            // Remove spaces for storage
            const fullPhone = data.phone.replace(/\s/g, '');

            // Update user in storage
            const updatedUser = {
                ...user,
                phone: fullPhone,
                phoneVerified: true // Auto-verify for now since we're just collecting it
            };

            saveUser(updatedUser);
            onUpdateUser(updatedUser);

            showToast({
                message: "Phone number saved successfully!",
                type: "success"
            });
        } catch (error) {
            showToast({
                message: "Failed to save phone number. Please try again.",
                type: "error"
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-black/40 backdrop-blur-md animate-in fade-in duration-300">
            <div className="bg-white rounded-t-[32px] sm:rounded-[32px] shadow-2xl w-full sm:max-w-lg h-[100dvh] sm:h-auto sm:max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom sm:zoom-in-95 duration-300 relative border border-white/20">
                {/* Drag indicator for mobile */}
                <div className="sm:hidden flex justify-center pt-3 pb-1">
                    <div className="w-10 h-1 bg-gray-300 rounded-full" />
                </div>
                
                <button
                    onClick={onClose}
                    aria-label="Close modal"
                    className="absolute top-4 sm:top-6 right-4 sm:right-6 p-2 hover:bg-gray-50 rounded-full transition-colors text-gray-400 hover:text-gray-900 z-10"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                </button>

                <div className="p-6 sm:p-10 pt-6 sm:pt-12 pb-safe">
                    <div className="flex flex-col items-start text-left mb-6 sm:mb-10">
                        <div className="w-12 h-12 rounded-full bg-brand-50 flex items-center justify-center mb-4 sm:mb-6">
                            <Phone className="text-brand-600" size={24} />
                        </div>
                        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight mb-2 sm:mb-3">Add your phone number</h2>
                        <p className="text-base sm:text-lg text-gray-500 leading-relaxed">To ensure safety and trust, we need to verify your phone number before you can submit a listing for approval.</p>
                    </div>

                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 sm:space-y-8">
                            <FormField
                                control={form.control}
                                name="phone"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormControl>
                                            <PhoneInput
                                                id="phone"
                                                label="Phone number"
                                                value={field.value}
                                                onChange={field.onChange}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="bg-gray-50 p-4 rounded-xl flex gap-3 text-sm text-gray-600 border border-gray-100">
                                <ShieldAlert className="shrink-0 mt-0.5 text-gray-400" size={18} />
                                <p>This info is private and only shared with confirmed guests.</p>
                            </div>

                            <div className="pb-6 sm:pb-0">
                                <Button
                                    type="submit"
                                    variant="primary"
                                    size="lg"
                                    className="w-full h-12 text-base shadow-lg shadow-brand-600/20 hover:shadow-brand-600/30 transition-all"
                                    isLoading={isSubmitting}
                                >
                                    Save & Continue
                                </Button>
                            </div>
                        </form>
                    </Form>
                </div>
            </div>
        </div>
    );
};

export default HostPhoneCollectionModal;
