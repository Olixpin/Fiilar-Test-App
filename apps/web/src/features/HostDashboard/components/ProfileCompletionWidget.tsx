import React, { useMemo } from 'react';
import { User } from '@fiilar/types';
import { ArrowRight, User as UserIcon, FileText, Mail, Phone, ShieldCheck } from 'lucide-react';
import { Button } from '@fiilar/ui';

interface ProfileCompletionWidgetProps {
    user: User;
    onCompleteProfile: () => void;
}

const ProfileCompletionWidget: React.FC<ProfileCompletionWidgetProps> = ({ user, onCompleteProfile }) => {
    const completion = useMemo(() => {
        const steps = [
            {
                id: 'avatar',
                label: 'Profile Picture',
                isCompleted: !!user.avatar,
                icon: UserIcon,
                weight: 20
            },
            {
                id: 'bio',
                label: 'Bio',
                isCompleted: !!user.bio && user.bio.length > 10,
                icon: FileText,
                weight: 20
            },
            {
                id: 'email',
                label: 'Email Verified',
                isCompleted: user.emailVerified,
                icon: Mail,
                weight: 20
            },
            {
                id: 'phone',
                label: 'Phone Verified',
                isCompleted: !!user.phoneVerified,
                icon: Phone,
                weight: 20
            },
            {
                id: 'kyc',
                label: 'Identity Verified',
                isCompleted: !!user.kycVerified,
                icon: ShieldCheck,
                weight: 20
            }
        ];

        const completedSteps = steps.filter(s => s.isCompleted);
        const totalWeight = steps.reduce((sum, s) => sum + s.weight, 0);
        const completedWeight = completedSteps.reduce((sum, s) => sum + s.weight, 0);
        const percentage = Math.round((completedWeight / totalWeight) * 100);

        const nextStep = steps.find(s => !s.isCompleted);

        return {
            percentage,
            steps,
            nextStep,
            isComplete: percentage === 100
        };
    }, [user]);

    if (completion.isComplete) return null;

    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 mb-6 animate-in fade-in slide-in-from-top-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                <div>
                    <h3 className="font-bold text-gray-900 text-lg">Complete your profile</h3>
                    <p className="text-gray-500 text-sm mt-1">
                        Complete your profile to build trust with guests and increase your booking rate.
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="text-right hidden sm:block">
                        <span className="block text-3xl font-bold text-gray-900 leading-none">{completion.percentage}%</span>
                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Completed</span>
                    </div>
                    <div className="w-14 h-14 relative flex items-center justify-center">
                        <svg className="w-full h-full transform -rotate-90">
                            <circle
                                cx="28"
                                cy="28"
                                r="24"
                                stroke="currentColor"
                                strokeWidth="3"
                                fill="transparent"
                                className="text-gray-100"
                            />
                            <circle
                                cx="28"
                                cy="28"
                                r="24"
                                stroke="currentColor"
                                strokeWidth="3"
                                fill="transparent"
                                strokeDasharray={150.8}
                                strokeDashoffset={150.8 - (150.8 * completion.percentage) / 100}
                                className="text-brand-600 transition-all duration-1000 ease-out"
                                strokeLinecap="round"
                            />
                        </svg>
                    </div>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden mb-6">
                <div
                    className="h-full bg-brand-600 transition-all duration-1000 ease-out rounded-full"
                    style={{ width: `${completion.percentage}%` }}
                />
            </div>

            {/* Next Step Action */}
            {completion.nextStep && (
                <div className="bg-brand-50 border border-brand-100 rounded-xl p-4 flex items-center justify-between group cursor-pointer hover:bg-brand-100 transition-colors" onClick={onCompleteProfile}>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-brand-600 shadow-sm">
                            <completion.nextStep.icon size={20} />
                        </div>
                        <div>
                            <p className="text-xs font-semibold text-brand-800 uppercase tracking-wider mb-0.5">Next Step</p>
                            <p className="font-bold text-gray-900">{completion.nextStep.label}</p>
                        </div>
                    </div>
                    <Button variant="ghost" size="sm" className="text-brand-700 hover:bg-white/50">
                        Complete Now <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                </div>
            )}
        </div>
    );
};

export default ProfileCompletionWidget;
