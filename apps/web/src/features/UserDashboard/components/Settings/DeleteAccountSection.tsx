import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@fiilar/ui';

interface DeleteAccountSectionProps {
    setShowDeleteModal: (show: boolean) => void;
}

export const DeleteAccountSection: React.FC<DeleteAccountSectionProps> = ({ setShowDeleteModal }) => {
    return (
        <div className="pt-6 border-t border-gray-200">
            <div className="bg-red-50 border border-red-200 rounded-xl p-6">
                <div className="flex items-start gap-3 mb-4">
                    <AlertTriangle size={24} className="text-red-600 shrink-0 mt-0.5" />
                    <div>
                        <h3 className="text-sm font-semibold text-red-900 mb-2">Delete Account</h3>
                        <p className="text-sm text-red-700 leading-relaxed">
                            Permanently delete your account and all associated data. This action cannot be undone.
                        </p>
                    </div>
                </div>
                <Button
                    onClick={() => setShowDeleteModal(true)}
                    variant="danger"
                >
                    Delete My Account
                </Button>
            </div>
        </div>
    );
};
