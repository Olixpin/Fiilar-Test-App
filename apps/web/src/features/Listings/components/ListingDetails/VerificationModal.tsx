import React from 'react';
import { X, ShieldCheck, Loader2, UploadCloud } from 'lucide-react';
import { useScrollLock } from '../../../../hooks/useScrollLock';

interface VerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  isVerifying: boolean;
  handleVerificationComplete: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const VerificationModal: React.FC<VerificationModalProps> = ({ isOpen, onClose, isVerifying, handleVerificationComplete }) => {
  useScrollLock(isOpen);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden relative animate-in zoom-in-95 duration-200">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close verification dialog"
          title="Close verification dialog"
          className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition"
        >
          <X size={20} className="text-gray-500" />
        </button>

        <div className="p-8 text-center">
          <div className="w-16 h-16 bg-brand-100 text-brand-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShieldCheck size={36} strokeWidth={1.5} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Verify Your Identity</h2>
          <p className="text-gray-500 mb-8 leading-relaxed">
            The host of this space requires verified ID. Please verify your identity to continue. This is a one-time process.
          </p>

          <div className="space-y-4">
            <label className={`
                  block w-full border-2 border-dashed rounded-xl p-6 cursor-pointer transition-all group
                  ${isVerifying ? 'border-brand-300 bg-brand-50' : 'border-gray-300 hover:border-brand-500 hover:bg-gray-50'}
               `}>
              {isVerifying ? (
                <div className="flex flex-col items-center justify-center py-4">
                  <Loader2 className="animate-spin text-brand-600 mb-3" size={32} />
                  <span className="text-brand-700 font-medium">Verifying your document...</span>
                </div>
              ) : (
                <>
                  <input id="id-upload" type="file" className="hidden" onChange={handleVerificationComplete} aria-label="Upload ID document" aria-describedby="id-upload-desc" />
                  <UploadCloud className="mx-auto text-gray-400 group-hover:text-brand-500 mb-3 transition-colors" size={32} />
                  <div className="text-gray-900 font-medium">Click to upload ID</div>
                  <div id="id-upload-desc" className="text-xs text-gray-400 mt-1">Passport, Driver's License, or National ID</div>
                </>
              )}
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};
