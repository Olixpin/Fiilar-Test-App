import React, { useState } from 'react';
import { useToast } from '@fiilar/ui';
import { X, AlertTriangle, DollarSign, Check } from 'lucide-react';
import { DamageReport } from '@fiilar/types';
import { updateDamageReport } from '@fiilar/storage';
import { addNotification } from '@fiilar/notifications';
import { useLocale } from '@fiilar/ui';
import { Button } from '@fiilar/ui';

interface DamageReportViewProps {
    report: DamageReport;
    onClose: () => void;
    onUpdate: () => void;
}

const DamageReportView: React.FC<DamageReportViewProps> = ({ report, onClose, onUpdate }) => {
    const { locale } = useLocale();
    const toast = useToast();
    const [response, setResponse] = useState(report.userResponse || '');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleAccept = () => {
        setIsSubmitting(true);

        updateDamageReport(report.id, {
            status: 'resolved',
            resolvedAt: new Date().toISOString()
        });

        // Notify host
        addNotification({
            userId: report.reportedBy,
            type: 'damage_report',
            title: 'Damage Claim Accepted',
            message: `Guest accepted the damage claim of ${locale.currencySymbol}${report.estimatedCost}`,
            severity: 'info',
            read: false,
            actionRequired: false,
            metadata: {
                reportId: report.id,
                amount: report.estimatedCost
            }
        });

        onUpdate();
        onClose();
    };

    const handleDispute = () => {
        if (!response.trim()) {
            toast.showToast({ message: 'Please provide a reason for disputing', type: 'info' });
            return;
        }

        setIsSubmitting(true);

        updateDamageReport(report.id, {
            status: 'disputed',
            userResponse: response.trim()
        });

        // Notify host
        addNotification({
            userId: report.reportedBy,
            type: 'damage_report',
            title: 'Damage Claim Disputed',
            message: `Guest disputed the damage claim. Review their response.`,
            severity: 'warning',
            read: false,
            actionRequired: true,
            metadata: {
                reportId: report.id
            }
        });

        onUpdate();
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                            <AlertTriangle size={20} className="text-red-600" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">Damage Report</h2>
                            <p className="text-sm text-gray-500">Review and respond to this claim</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-full transition"
                        title="Close"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Status Badge */}
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-gray-700">Status:</span>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${report.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                            report.status === 'resolved' ? 'bg-green-100 text-green-700' :
                                report.status === 'disputed' ? 'bg-red-100 text-red-700' :
                                    'bg-gray-100 text-gray-700'
                            }`}>
                            {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                        </span>
                    </div>

                    {/* Cost */}
                    <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-1">
                            <DollarSign size={18} className="text-red-600" />
                            <span className="text-sm font-semibold text-red-900">Estimated Repair Cost</span>
                        </div>
                        <p className="text-2xl font-bold text-red-600">{locale.currencySymbol}{report.estimatedCost.toFixed(2)}</p>
                        <p className="text-xs text-red-700 mt-1">
                            This amount will be deducted from your caution deposit if you accept
                        </p>
                    </div>

                    {/* Description */}
                    <div>
                        <h3 className="text-sm font-semibold text-gray-900 mb-2">Damage Description</h3>
                        <p className="text-gray-700 leading-relaxed bg-gray-50 rounded-lg p-4">
                            {report.description}
                        </p>
                    </div>

                    {/* Photos */}
                    {report.images.length > 0 && (
                        <div>
                            <h3 className="text-sm font-semibold text-gray-900 mb-3">Photos</h3>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                {report.images.map((img, index) => (
                                    <button
                                        key={index}
                                        onClick={() => window.open(img, '_blank')}
                                        className="w-full h-32 rounded-lg overflow-hidden hover:opacity-90 transition focus:outline-none focus:ring-2 focus:ring-brand-500"
                                        title="View full image"
                                    >
                                        <img
                                            src={img}
                                            alt={`Damage ${index + 1}`}
                                            className="w-full h-full object-cover"
                                        />
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Response Section (if pending) */}
                    {report.status === 'pending' && (
                        <div>
                            <h3 className="text-sm font-semibold text-gray-900 mb-2">Your Response (Optional)</h3>
                            <textarea
                                value={response}
                                onChange={(e) => setResponse(e.target.value)}
                                placeholder="Add any comments or explanation..."
                                rows={4}
                                className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
                                aria-label="Your Response"
                            />
                        </div>
                    )}

                    {/* User Response (if disputed) */}
                    {report.status === 'disputed' && report.userResponse && (
                        <div>
                            <h3 className="text-sm font-semibold text-gray-900 mb-2">Your Response</h3>
                            <p className="text-gray-700 bg-gray-50 rounded-lg p-4">{report.userResponse}</p>
                        </div>
                    )}

                    {/* Info Box */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <p className="text-sm text-blue-900">
                            <strong>What happens next?</strong><br />
                            • If you <strong>accept</strong>, the amount will be deducted from your deposit<br />
                            • If you <strong>dispute</strong>, the case will be reviewed by our support team<br />
                            • You can contact support anytime for assistance
                        </p>
                    </div>

                    {/* Actions */}
                    {report.status === 'pending' && (
                        <div className="flex gap-3">
                            <Button
                                onClick={handleDispute}
                                disabled={isSubmitting}
                                variant="outline"
                                className="flex-1 border-2 border-red-600 text-red-600 hover:bg-red-50"
                            >
                                Dispute Claim
                            </Button>
                            <Button
                                onClick={handleAccept}
                                disabled={isSubmitting}
                                variant="primary"
                                className="flex-1 bg-green-600 hover:bg-green-700"
                                leftIcon={<Check size={18} />}
                            >
                                Accept & Pay {locale.currencySymbol}{report.estimatedCost}
                            </Button>
                        </div>
                    )}

                    {report.status !== 'pending' && (
                        <Button
                            onClick={onClose}
                            variant="secondary"
                            className="w-full"
                        >
                            Close
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DamageReportView;
