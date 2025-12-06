import React from 'react';
import { CancellationPolicy } from '@fiilar/types';
import { AlertTriangle, X, Shield } from 'lucide-react';
import { useScrollLock } from '../../../../hooks/useScrollLock';
import { Button } from '@fiilar/ui';

interface PolicyWarningModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAcknowledge: () => void;
  policy: CancellationPolicy | undefined;
  listingTitle: string;
}

export const PolicyWarningModal: React.FC<PolicyWarningModalProps> = ({
  isOpen,
  onClose,
  onAcknowledge,
  policy,
  listingTitle
}) => {
  useScrollLock(isOpen);

  if (!isOpen) return null;

  const isNonRefundable = policy === CancellationPolicy.NON_REFUNDABLE;
  const policyName = isNonRefundable ? 'Non-Refundable' : 'Strict';

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      {/* Backdrop */}
      <div className="absolute inset-0" onClick={onClose}></div>

      {/* Modal */}
      <div className="relative bg-white rounded-2xl max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden">
        {/* Warning Header */}
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-5">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center shrink-0">
              <AlertTriangle size={24} className="text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-white">Important Notice</h2>
              <p className="text-white/90 text-sm mt-1">{policyName} Cancellation Policy</p>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-white/20 rounded-full transition-colors"
              title="Close"
            >
              <X size={20} className="text-white" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
            <Shield size={20} className="text-amber-600 shrink-0 mt-0.5" />
            <div className="text-sm text-amber-800">
              <p className="font-semibold mb-1">This listing has a {policyName.toLowerCase()} cancellation policy</p>
              {isNonRefundable ? (
                <p>Once you book <span className="font-medium">"{listingTitle}"</span>, <strong>no refunds will be issued</strong> regardless of when you cancel.</p>
              ) : (
                <p>If you cancel your booking at <span className="font-medium">"{listingTitle}"</span>, you will only receive a <strong>50% refund</strong> if cancelled more than 7 days before check-in. <strong>No refund</strong> for cancellations within 7 days.</p>
              )}
            </div>
          </div>

          <div className="text-sm text-gray-600 space-y-2">
            <p className="font-medium text-gray-900">Before proceeding, please ensure:</p>
            <ul className="list-disc list-inside space-y-1 text-gray-600">
              <li>You are certain about your booking dates</li>
              <li>You understand the cancellation terms</li>
              <li>You accept that refunds may not be available</li>
            </ul>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-xs text-gray-500">
            <strong>Tip:</strong> Consider travel insurance if you're unsure about your plans.
          </div>
        </div>

        {/* Actions */}
        <div className="px-6 pb-6 flex flex-col sm:flex-row gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1 py-3"
          >
            Go Back
          </Button>
          <Button
            variant="primary"
            onClick={onAcknowledge}
            className="flex-1 py-3 bg-amber-600 hover:bg-amber-700 border-amber-600"
          >
            I Understand, Continue
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PolicyWarningModal;
