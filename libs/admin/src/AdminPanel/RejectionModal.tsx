import React from 'react';
import { AlertTriangle, X, Camera } from 'lucide-react';
import { Button } from '@fiilar/ui';

interface RejectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
  reason: string;
  setReason: (reason: string) => void;
  presetPhotographyOffer: () => void;
}

export const RejectionModal: React.FC<RejectionModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  reason,
  setReason,
  presetPhotographyOffer
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <h3 className="font-bold text-red-600 flex items-center gap-2">
            <AlertTriangle size={20} /> Decline Listing
          </h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-200 rounded-full" title="Close"><X size={18} /></button>
        </div>
        <div className="p-6">
          <p className="text-sm text-gray-600 mb-4">Please provide a reason for declining this listing. This will be sent to the host.</p>

          <textarea
            className="w-full border border-gray-300 rounded-lg p-3 text-sm h-32 mb-3 focus:ring-2 focus:ring-red-500 outline-none"
            placeholder="Reason for rejection..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            aria-label="Reason for rejection"
          />

          <Button
            variant="ghost"
            onClick={presetPhotographyOffer}
            className="w-full mb-4 flex items-center justify-center gap-2 text-xs font-bold text-brand-700 bg-brand-50 border border-brand-100 py-2.5 rounded-lg hover:bg-brand-100 transition"
            leftIcon={<Camera size={14} />}
          >
            Bad Photos? Offer Free Photography
          </Button>

          <div className="flex gap-3 mt-2">
            <Button
              variant="ghost"
              onClick={onClose}
              className="flex-1 text-gray-500 hover:bg-gray-100"
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={onSubmit}
              disabled={!reason}
              className="flex-1"
            >
              Confirm Decline
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
