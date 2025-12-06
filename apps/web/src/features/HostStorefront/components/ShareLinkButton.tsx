/**
 * ShareLinkButton Component
 * 
 * Button for hosts to generate and copy their shareable profile link.
 * Shows loading state, copy confirmation, and handles errors gracefully.
 */

import React, { useState, useCallback } from 'react';
import { Share2, Copy, Check, ExternalLink, AlertCircle } from 'lucide-react';
import { isHostEligibleForShareLink, getOrCreateShareLink, getAllUsers, getListings } from '@fiilar/storage';

interface ShareLinkButtonProps {
  hostId: string;
  variant?: 'primary' | 'secondary' | 'icon';
  className?: string;
}

export const ShareLinkButton: React.FC<ShareLinkButtonProps> = ({
  hostId,
  variant = 'primary',
  className = '',
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shareUrl, setShareUrl] = useState<string | null>(null);

  const generateAndCopyLink = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Check eligibility first
      const eligibility = isHostEligibleForShareLink(hostId, getAllUsers, getListings);
      if (!eligibility.eligible) {
        setError(eligibility.reason || 'You need to be a verified host with live listings to share your profile.');
        setIsLoading(false);
        return;
      }

      // Get or create share link
      const shareLink = getOrCreateShareLink(hostId);
      if (!shareLink) {
        setError('Unable to generate share link. Please try again.');
        setIsLoading(false);
        return;
      }

      // Build the full URL
      const baseUrl = window.location.origin;
      const fullUrl = `${baseUrl}/s/${shareLink.shortCode}`;
      setShareUrl(fullUrl);

      // Copy to clipboard
      await navigator.clipboard.writeText(fullUrl);
      setCopied(true);

      // Reset copied state after 3 seconds
      setTimeout(() => setCopied(false), 3000);
    } catch (err) {
      console.error('Error generating share link:', err);
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [hostId]);

  const openPreview = useCallback(() => {
    if (shareUrl) {
      window.open(shareUrl, '_blank');
    }
  }, [shareUrl]);

  // Icon-only variant
  if (variant === 'icon') {
    return (
      <button
        onClick={generateAndCopyLink}
        disabled={isLoading}
        className={`p-2 rounded-full hover:bg-gray-100 transition-colors ${className}`}
        title="Share your profile"
      >
        {isLoading ? (
          <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
        ) : copied ? (
          <Check className="w-5 h-5 text-green-500" />
        ) : (
          <Share2 className="w-5 h-5 text-gray-600" />
        )}
      </button>
    );
  }

  // Secondary variant
  if (variant === 'secondary') {
    return (
      <div className={className}>
        <button
          onClick={generateAndCopyLink}
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
              <span>Generating...</span>
            </>
          ) : copied ? (
            <>
              <Check className="w-4 h-4 text-green-500" />
              <span className="text-green-600">Link Copied!</span>
            </>
          ) : (
            <>
              <Share2 className="w-4 h-4" />
              <span>Share Profile</span>
            </>
          )}
        </button>
        {error && (
          <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
            <AlertCircle className="w-4 h-4" />
            {error}
          </p>
        )}
      </div>
    );
  }

  // Primary variant (default) - Full card with preview
  return (
    <div className={`bg-white rounded-xl border border-gray-200 p-4 ${className}`}>
      <div className="flex items-center gap-3 mb-3">
        <div className="p-2 bg-blue-50 rounded-lg">
          <Share2 className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <h3 className="font-medium text-gray-900">Share Your Profile</h3>
          <p className="text-sm text-gray-500">Let clients discover your spaces</p>
        </div>
      </div>

      {shareUrl && !error && (
        <div className="mb-3 p-2 bg-gray-50 rounded-lg flex items-center gap-2">
          <input
            type="text"
            value={shareUrl}
            readOnly
            aria-label="Share link URL"
            className="flex-1 bg-transparent text-sm text-gray-600 outline-none truncate"
          />
          <button
            onClick={() => {
              navigator.clipboard.writeText(shareUrl);
              setCopied(true);
              setTimeout(() => setCopied(false), 3000);
            }}
            className="p-1.5 hover:bg-gray-200 rounded transition-colors"
            title="Copy link"
          >
            {copied ? (
              <Check className="w-4 h-4 text-green-500" />
            ) : (
              <Copy className="w-4 h-4 text-gray-500" />
            )}
          </button>
          <button
            onClick={openPreview}
            className="p-1.5 hover:bg-gray-200 rounded transition-colors"
            title="Open preview"
          >
            <ExternalLink className="w-4 h-4 text-gray-500" />
          </button>
        </div>
      )}

      {error && (
        <div className="mb-3 p-3 bg-red-50 border border-red-100 rounded-lg">
          <p className="text-sm text-red-600 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {error}
          </p>
        </div>
      )}

      <button
        onClick={generateAndCopyLink}
        disabled={isLoading}
        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <>
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            <span>Generating Link...</span>
          </>
        ) : copied ? (
          <>
            <Check className="w-4 h-4" />
            <span>Copied to Clipboard!</span>
          </>
        ) : shareUrl ? (
          <>
            <Copy className="w-4 h-4" />
            <span>Copy Link Again</span>
          </>
        ) : (
          <>
            <Share2 className="w-4 h-4" />
            <span>Generate Share Link</span>
          </>
        )}
      </button>
    </div>
  );
};

export default ShareLinkButton;
