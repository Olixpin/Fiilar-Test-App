import React from 'react';
import { AlertTriangle, Trash2 } from 'lucide-react';
import { Button } from '@fiilar/ui';

interface DeleteAccountModalProps {
    showDeleteModal: boolean;
    setShowDeleteModal: (show: boolean) => void;
    deleteConfirmText: string;
    setDeleteConfirmText: (text: string) => void;
    isDeleting: boolean;
    handleDeleteAccount: () => void;
}

export const DeleteAccountModal: React.FC<DeleteAccountModalProps> = ({
    showDeleteModal,
    setShowDeleteModal,
    deleteConfirmText,
    setDeleteConfirmText,
    isDeleting,
    handleDeleteAccount
}) => {
    if (!showDeleteModal) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                        <AlertTriangle size={24} className="text-red-600" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900">Delete Account?</h2>
                </div>

                <div className="space-y-4 mb-6">
                    <p className="text-gray-700 font-medium">This will permanently:</p>
                    <ul className="space-y-2 text-sm text-gray-600">
                        <li className="flex items-start gap-2">
                            <span className="block w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 shrink-0"></span>
                            Remove your profile and account information
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="block w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 shrink-0"></span>
                            Erase your booking history and favorites
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="block w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 shrink-0"></span>
                            Cancel any upcoming reservations (hosts/guests will be notified)
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="block w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 shrink-0"></span>
                            Delete all messages and conversations
                        </li>
                    </ul>

                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-4">
                        <p className="text-sm font-semibold text-yellow-900 mb-1">⚠️ This action cannot be undone</p>
                        <p className="text-xs text-yellow-700">All your data will be permanently deleted from our servers.</p>
                    </div>
                </div>

                <div className="mb-6">
                    <label htmlFor="delete-confirm-input" className="block text-sm font-semibold text-gray-900 mb-2">
                        Type <span className="text-red-600 font-mono">DELETE</span> to confirm
                    </label>
                    <input
                        id="delete-confirm-input"
                        type="text"
                        value={deleteConfirmText}
                        onChange={(e) => setDeleteConfirmText(e.target.value)}
                        placeholder="Type DELETE here"
                        className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    />
                </div>

                <div className="flex gap-3">
                    <Button
                        onClick={() => {
                            setShowDeleteModal(false);
                            setDeleteConfirmText('');
                        }}
                        variant="outline"
                        disabled={isDeleting}
                        className="flex-1"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleDeleteAccount}
                        disabled={deleteConfirmText !== 'DELETE' || isDeleting}
                        variant="danger"
                        className="flex-1"
                    >
                        {isDeleting ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                Deleting...
                            </>
                        ) : (
                            <>
                                <Trash2 size={16} />
                                Delete Forever
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
};
