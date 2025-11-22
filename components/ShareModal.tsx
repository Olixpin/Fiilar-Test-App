import React, { useState } from 'react';
import { X, Copy, Check, Mail, Twitter, Facebook, Linkedin, MessageCircle } from 'lucide-react';
import { Listing } from '../types';

interface ShareModalProps {
    isOpen: boolean;
    onClose: () => void;
    listing: Listing;
}

const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose, listing }) => {
    const [copied, setCopied] = useState(false);
    const url = window.location.href;

    if (!isOpen) return null;

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    const shareLinks = [
        {
            name: 'Email',
            icon: Mail,
            url: `mailto:?subject=Check out this space on Fiilar: ${listing.title}&body=I found this amazing space on Fiilar and thought you might like it: ${url}`,
            color: 'bg-gray-100 text-gray-600 hover:bg-gray-200',
        },
        {
            name: 'WhatsApp',
            icon: MessageCircle,
            url: `https://wa.me/?text=${encodeURIComponent(`Check out this space on Fiilar: ${listing.title} ${url}`)}`,
            color: 'bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366]/20',
        },
        {
            name: 'Twitter',
            icon: Twitter,
            url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(`Check out this space on Fiilar: ${listing.title}`)}&url=${encodeURIComponent(url)}`,
            color: 'bg-[#1DA1F2]/10 text-[#1DA1F2] hover:bg-[#1DA1F2]/20',
        },
        {
            name: 'Facebook',
            icon: Facebook,
            url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
            color: 'bg-[#4267B2]/10 text-[#4267B2] hover:bg-[#4267B2]/20',
        },
        {
            name: 'LinkedIn',
            icon: Linkedin,
            url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
            color: 'bg-[#0077b5]/10 text-[#0077b5] hover:bg-[#0077b5]/20',
        },
    ];

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-100">
                    <h3 className="text-lg font-bold text-gray-900">Share this space</h3>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-full transition-all duration-200 hover:scale-110 active:scale-95"
                    >
                        <X size={20} className="text-gray-500" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    {/* Listing Preview */}
                    <div className="flex gap-4 mb-6 p-3 bg-gray-50 rounded-xl border border-gray-100">
                        <img
                            src={listing.images[0]}
                            alt={listing.title}
                            className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0 flex flex-col justify-center">
                            <h4 className="font-bold text-gray-900 truncate">{listing.title}</h4>
                            <p className="text-sm text-gray-500 truncate">{listing.location}</p>
                        </div>
                    </div>

                    {/* Social Grid */}
                    <div className="grid grid-cols-5 gap-2 mb-6">
                        {shareLinks.map((link) => (
                            <a
                                key={link.name}
                                href={link.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`flex flex-col items-center gap-2 p-2 rounded-xl transition-all duration-200 group hover:scale-105 active:scale-95 ${link.color}`}
                                title={`Share on ${link.name}`}
                            >
                                <div className="w-10 h-10 flex items-center justify-center rounded-full bg-white shadow-sm group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                                    <link.icon size={20} />
                                </div>
                                <span className="text-[10px] font-medium opacity-75">{link.name}</span>
                            </a>
                        ))}
                    </div>

                    {/* Copy Link */}
                    <div className="relative">
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                            Page Link
                        </label>
                        <div className="flex items-center gap-2 p-1.5 bg-gray-50 border border-gray-200 rounded-xl focus-within:ring-2 focus-within:ring-brand-500 focus-within:border-brand-500 transition-all">
                            <input
                                type="text"
                                readOnly
                                value={url}
                                className="flex-1 bg-transparent border-none text-sm text-gray-600 px-3 focus:ring-0 outline-none w-full"
                            />
                            <button
                                onClick={handleCopy}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 hover:scale-105 active:scale-95 ${copied
                                    ? 'bg-green-500 text-white shadow-md'
                                    : 'bg-white text-gray-900 shadow-sm hover:bg-gray-50 border border-gray-200'
                                    }`}
                            >
                                {copied ? (
                                    <>
                                        <Check size={16} />
                                        <span>Copied</span>
                                    </>
                                ) : (
                                    <>
                                        <Copy size={16} />
                                        <span>Copy</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ShareModal;
