import React, { useState, useRef } from 'react';
import { Shield, Camera, Check } from 'lucide-react';
import { Button } from '@fiilar/ui';

interface KYCUploadProps {
    onUpload: () => void;
    onSkip: () => void;
}

const KYCUpload: React.FC<KYCUploadProps> = ({ onUpload, onSkip }) => {
    const [step, setStep] = useState<'ID' | 'SELFIE'>('ID');
    const [idImage, setIdImage] = useState<string | null>(null);
    const [selfieImage, setSelfieImage] = useState<string | null>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isCameraOpen, setIsCameraOpen] = useState(false);

    const handleIdUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const reader = new FileReader();
            reader.onload = (ev) => {
                setIdImage(ev.target?.result as string);
                setStep('SELFIE');
            };
            reader.readAsDataURL(e.target.files[0]);
        }
    };

    const startCamera = async () => {
        setIsCameraOpen(true);
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
        } catch (err) {
            console.error("Error accessing camera", err);
            alert("Could not access camera. Please allow camera permissions.");
        }
    };

    const captureSelfie = () => {
        if (videoRef.current) {
            const canvas = document.createElement('canvas');
            canvas.width = videoRef.current.videoWidth;
            canvas.height = videoRef.current.videoHeight;
            canvas.getContext('2d')?.drawImage(videoRef.current, 0, 0);
            const dataUrl = canvas.toDataURL('image/jpeg');
            setSelfieImage(dataUrl);

            // Stop stream
            const stream = videoRef.current.srcObject as MediaStream;
            stream?.getTracks().forEach(track => track.stop());
            setIsCameraOpen(false);
        }
    };

    const handleComplete = () => {
        // In a real app, we would upload both images here
        // For now, we just trigger the completion callback
        onUpload();
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
            <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-lg text-center">
                <div className="w-16 h-16 bg-brand-100 text-brand-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Shield size={32} />
                </div>

                {step === 'ID' ? (
                    <>
                        <h2 className="text-2xl font-bold mb-2">Verify Identity</h2>
                        <p className="text-gray-500 mb-6 text-sm">
                            Step 1/2: Please upload a valid Government ID.
                        </p>

                        <label className="block w-full border-2 border-dashed border-gray-300 rounded-xl p-8 mb-6 cursor-pointer hover:border-brand-500 hover:bg-brand-50 transition">
                            <input type="file" className="hidden" onChange={handleIdUpload} accept="image/*" />
                            <div className="text-gray-500 font-medium">Upload Government ID</div>
                            <div className="text-xs text-gray-400 mt-1">(Passport, Driver's License, ID Card)</div>
                        </label>
                    </>
                ) : (
                    <>
                        <h2 className="text-2xl font-bold mb-2">Liveness Check</h2>
                        <p className="text-gray-500 mb-6 text-sm">
                            Step 2/2: Take a quick selfie to prove you're real.
                        </p>

                        {!selfieImage ? (
                            <div className="mb-6">
                                {isCameraOpen ? (
                                    <div className="relative rounded-xl overflow-hidden bg-black aspect-video mb-4">
                                        <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                                    </div>
                                ) : (
                                    <div className="bg-gray-100 rounded-xl aspect-video flex items-center justify-center mb-4">
                                        <Camera size={48} className="text-gray-300" />
                                    </div>
                                )}

                                {isCameraOpen ? (
                                    <Button onClick={captureSelfie} variant="primary">
                                        Capture Photo
                                    </Button>
                                ) : (
                                    <Button onClick={startCamera} variant="primary">
                                        Open Camera
                                    </Button>
                                )}
                            </div>
                        ) : (
                            <div className="mb-6">
                                <img src={selfieImage} alt="Selfie" className="w-full rounded-xl mb-4" />
                                <Button onClick={handleComplete} variant="primary" size="lg" className="w-full bg-green-600 hover:bg-green-700" leftIcon={<Check size={20} />}>
                                    Complete Verification
                                </Button>
                                <Button onClick={() => setSelfieImage(null)} variant="ghost" size="sm" className="mt-2">
                                    Retake
                                </Button>
                            </div>
                        )}
                    </>
                )}

                <Button onClick={onSkip} variant="ghost" size="sm" className="mt-4">
                    I'll do this later
                </Button>
            </div>
        </div>
    );
};

export default KYCUpload;
