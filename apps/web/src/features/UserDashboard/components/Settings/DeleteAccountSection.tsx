import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@fiilar/ui';

interface DeleteAccountSectionProps {
    setShowDeleteModal: (show: boolean) => void;
}

export const DeleteAccountSection: React.FC<DeleteAccountSectionProps> = ({ setShowDeleteModal }) => {
    return (
        <div className="pt-8 border-t border-gray-100">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 p-6 rounded-2xl border border-red-100 bg-white hover:border-red-200 transition-colors group">
                <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center shrink-0">
                        <AlertTriangle size={20} className="text-red-600" />
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900 mb-1">Delete Account</h3>
                        <p className="text-sm text-gray-500 leading-relaxed max-w-md">
                            Permanently delete your account and all associated data. This action cannot be undone.
                        </p>
                    </div>
                </div>
                <Button
                    onClick={() => setShowDeleteModal(true)}
                    variant="outline"
                    className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 shrink-0"
                >
                    Delete Account
                </Button>
            </div>
        </div>
    );
};
