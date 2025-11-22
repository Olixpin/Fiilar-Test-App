import React from 'react';
import { Shield } from 'lucide-react';

interface KYCUploadProps {
    onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onSkip: () => void;
}

const KYCUpload: React.FC<KYCUploadProps> = ({ onUpload, onSkip }) => {
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
            <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-lg text-center">
                <div className="w-16 h-16 bg-brand-100 text-brand-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Shield size={32} />
                </div>
                <h2 className="text-2xl font-bold mb-2">Verify Identity</h2>
                <p className="text-gray-500 mb-6 text-sm">
                    To ensure safety, we need to verify who you are. Please upload a valid Government ID.
                </p>

                <label className="block w-full border-2 border-dashed border-gray-300 rounded-xl p-8 mb-6 cursor-pointer hover:border-brand-500 hover:bg-brand-50 transition">
                    <input type="file" className="hidden" onChange={onUpload} />
                    <div className="text-gray-500 font-medium">Upload Government ID</div>
                    <div className="text-xs text-gray-400 mt-1">(Passport, Driver's License, ID Card)</div>
                </label>

                <button onClick={onSkip} className="text-gray-400 hover:text-gray-600 text-sm">
                    I'll do this later
                </button>
            </div>
        </div>
    );
};

export default KYCUpload;
