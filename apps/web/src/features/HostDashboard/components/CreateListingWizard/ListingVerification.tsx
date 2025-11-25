import React from 'react';
import { Listing } from '@fiilar/types';
import { Button } from '@fiilar/ui';
import {
    Shield, ShieldCheck, Copy, CheckCircle, FileText, ArrowRight
} from 'lucide-react';

interface ListingVerificationProps {
    newListing: Partial<Listing>;
    setNewListing: React.Dispatch<React.SetStateAction<Partial<Listing>>>;
    setStep: (step: number) => void;
    isEditingUpload: boolean;
    setIsEditingUpload: (isEditing: boolean) => void;
    getPreviousProofs: () => { url: string; location: string; title: string }[];
    handleProofUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const ListingVerification: React.FC<ListingVerificationProps> = ({
    newListing, setNewListing, setStep,
    isEditingUpload, setIsEditingUpload, getPreviousProofs, handleProofUpload
}) => {
    return (
        <div className="space-y-8 max-w-3xl mx-auto animate-in slide-in-from-right duration-300">
            <div className="text-center mb-8">
                <div className="w-20 h-20 bg-linear-to-br from-blue-50 to-indigo-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-md">
                    <Shield size={36} />
                </div>
                <h3 className="font-bold text-3xl text-gray-900">Property Verification</h3>
                <p className="text-gray-600 text-sm mt-3 max-w-lg mx-auto">
                    To maintain a safe community, we need proof that you own or manage this property.
                    <br />
                    <span className="text-xs text-gray-500 mt-1 inline-block">Accepted: Utility Bill, Lease Agreement, Title Deed</span>
                </p>
            </div>

            {/* Simplified UI for Verified Documents */}
            {newListing.proofOfAddress && !isEditingUpload ? (
                <div className="text-center py-12 bg-green-50 rounded-2xl border border-green-100">
                    <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <ShieldCheck size={32} />
                    </div>
                    <h3 className="text-xl font-bold text-green-900 mb-2">Verification Complete</h3>
                    <p className="text-green-700 mb-6 max-w-sm mx-auto">You have already submitted proof of address for this listing. No further action is needed.</p>

                    <div className="flex justify-center gap-4">
                        <button
                            onClick={() => setIsEditingUpload(true)}
                            className="text-sm font-semibold text-green-800 underline decoration-green-400 hover:text-green-900"
                        >
                            Update Document
                        </button>
                    </div>
                </div>
            ) : (
                <>
                    {/* Document Reuse Section */}
                    {getPreviousProofs().length > 0 && (
                        <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 mb-4">
                            <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                                <Copy size={16} /> Reuse Verified Document
                            </h4>
                            <div className="space-y-2">
                                {getPreviousProofs().map((proof, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => {
                                            const isSelected = newListing.proofOfAddress === proof.url;
                                            setNewListing({ ...newListing, proofOfAddress: isSelected ? '' : proof.url });
                                        }}
                                        className={`w-full flex items-center p-3 border rounded-lg text-left transition-all ${newListing.proofOfAddress === proof.url ? 'border-brand-600 bg-brand-50 ring-1 ring-brand-600' : 'bg-white border-gray-200 hover:border-gray-300'}`}
                                        title="Reuse verified document"
                                    >
                                        <div className={`w-4 h-4 rounded-full border mr-3 flex items-center justify-center shrink-0 ${newListing.proofOfAddress === proof.url ? 'border-brand-600' : 'border-gray-300'}`}>
                                            {newListing.proofOfAddress === proof.url && <div className="w-2 h-2 rounded-full bg-brand-600" />}
                                        </div>
                                        <div className="overflow-hidden">
                                            <div className="text-sm font-medium text-gray-900 truncate">{proof.location}</div>
                                            <div className="text-xs text-gray-500 truncate">Used in: {proof.title}</div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {newListing.proofOfAddress && isEditingUpload && (
                        <div className="text-right mb-2">
                            <button onClick={() => setIsEditingUpload(false)} className="text-xs text-gray-500 hover:text-gray-900" title="Cancel change">Cancel Change</button>
                        </div>
                    )}

                    <label className={`
                        border-2 border-dashed rounded-xl p-10 flex flex-col items-center justify-center cursor-pointer transition-all
                        ${newListing.proofOfAddress
                            ? 'border-green-500 bg-green-50'
                            : 'border-gray-300 hover:border-brand-500 hover:bg-gray-50'
                        }
`}>
                        <input type="file" accept=".pdf,.jpg,.png" className="hidden" onChange={handleProofUpload} />
                        {newListing.proofOfAddress ? (
                            <div className="text-center">
                                <CheckCircle size={48} className="text-green-600 mx-auto mb-3" />
                                <div className="font-bold text-green-800">Document Uploaded</div>
                                <div className="text-xs text-green-600 mt-1">
                                    {newListing.proofOfAddress.includes('doc_simulated') ? 'Using Simulated Upload' : 'Document Attached'}
                                </div>
                                <div className="text-xs text-green-600 mt-1 underline cursor-pointer">Click to replace</div>
                            </div>
                        ) : (
                            <div className="text-center">
                                <FileText size={48} className="text-gray-400 mx-auto mb-3" />
                                <div className="font-medium text-gray-900">Click to upload Proof of Address</div>
                                <div className="text-xs text-gray-500 mt-1">PDF, JPG or PNG (Max 5MB)</div>
                            </div>
                        )}
                    </label>
                </>
            )}

            <div className="flex gap-4 mt-8 pt-6 border-t-2 border-gray-100">
                <button
                    onClick={() => setStep(3)}
                    className="px-8 py-3.5 text-gray-700 font-semibold hover:bg-gray-100 rounded-xl transition-all border-2 border-gray-200 hover:border-gray-300"
                >
                    Back
                </button>
                <Button
                    onClick={() => setStep(5)}
                    className="flex-1 bg-brand-600 text-white py-3.5 rounded-xl font-semibold hover:bg-brand-700 transition-all shadow-lg shadow-brand-200 hover:shadow-xl hover:shadow-brand-300 flex items-center justify-center gap-2"
                >
                    {newListing.proofOfAddress ? 'Continue to Review' : 'Skip for now'}
                    <ArrowRight size={18} className="translate-x-0.5" />
                </Button>
            </div>
        </div>
    );
};

export default ListingVerification;
