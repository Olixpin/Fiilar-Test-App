import React, { useState } from 'react';
import { X, Star } from 'lucide-react';
import { addReview } from '../../../services/storage';

interface ReviewModalProps {
    bookingId: string;
    listingId: string;
    userId: string;
    listingTitle: string;
    onClose: () => void;
    onSuccess: () => void;
}

const ReviewModal: React.FC<ReviewModalProps> = ({
    bookingId,
    listingId,
    userId,
    listingTitle,
    onClose,
    onSuccess
}) => {
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [comment, setComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (rating === 0) {
            setError('Please select a rating');
            return;
        }

        if (comment.trim().length < 10) {
            setError('Please write at least 10 characters');
            return;
        }

        setIsSubmitting(true);
        setError('');

        try {
            addReview({
                listingId,
                userId,
                bookingId,
                rating,
                comment: comment.trim()
            });

            onSuccess();
            onClose();
        } catch (err: any) {
            setError(err.message || 'Failed to submit review');
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Leave a Review</h2>
                        <p className="text-sm text-gray-500 mt-1">{listingTitle}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-full transition"
                        title="Close"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Star Rating */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-3">
                            How was your experience?
                        </label>
                        <div className="flex gap-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    onClick={() => setRating(star)}
                                    onMouseEnter={() => setHoverRating(star)}
                                    onMouseLeave={() => setHoverRating(0)}
                                    className="transition-transform hover:scale-110"
                                    title={`${star} stars`}
                                >
                                    <Star
                                        size={40}
                                        className={`${star <= (hoverRating || rating)
                                                ? 'fill-yellow-400 text-yellow-400'
                                                : 'text-gray-300'
                                            } transition-colors`}
                                    />
                                </button>
                            ))}
                        </div>
                        {rating > 0 && (
                            <p className="text-sm text-gray-600 mt-2">
                                {rating === 1 && 'Poor'}
                                {rating === 2 && 'Fair'}
                                {rating === 3 && 'Good'}
                                {rating === 4 && 'Very Good'}
                                {rating === 5 && 'Excellent'}
                            </p>
                        )}
                    </div>

                    {/* Comment */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-2">
                            Share your experience
                        </label>
                        <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="Tell us about your experience with this space..."
                            rows={5}
                            className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent resize-none"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            {comment.length} characters (minimum 10)
                        </p>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                            <p className="text-sm text-red-600">{error}</p>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-6 py-3 border border-gray-300 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 transition"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting || rating === 0}
                            className="flex-1 px-6 py-3 bg-brand-600 text-white rounded-xl font-semibold hover:bg-brand-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? 'Submitting...' : 'Submit Review'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ReviewModal;
