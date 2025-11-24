import React from 'react';
import { Star, Check } from 'lucide-react';
import { Button } from '@fiilar/ui';

interface FeedbackSectionProps {
    feedbackRating: number;
    setFeedbackRating: (rating: number) => void;
    feedbackCategory: string;
    setFeedbackCategory: (category: string) => void;
    feedbackMessage: string;
    setFeedbackMessage: (message: string) => void;
    feedbackSubmitted: boolean;
    handleFeedbackSubmit: (e: React.FormEvent) => void;
}

export const FeedbackSection: React.FC<FeedbackSectionProps> = ({
    feedbackRating,
    setFeedbackRating,
    feedbackCategory,
    setFeedbackCategory,
    feedbackMessage,
    setFeedbackMessage,
    feedbackSubmitted,
    handleFeedbackSubmit
}) => {
    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Give Us Feedback</h2>
            <p className="text-gray-600 text-sm mb-6">Help us improve Fiilar with your suggestions</p>

            {feedbackSubmitted ? (
                <div className="text-center py-12">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Check size={32} className="text-green-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Thank you!</h3>
                    <p className="text-gray-600">Your feedback has been submitted successfully.</p>
                </div>
            ) : (
                <form onSubmit={handleFeedbackSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-3">How would you rate your experience?</label>
                        <div className="flex gap-2">
                            {[1, 2, 3, 4, 5].map((rating) => (
                                <button
                                    key={rating}
                                    type="button"
                                    onClick={() => setFeedbackRating(rating)}
                                    className="transition-transform hover:scale-110"
                                    title={`${rating} stars`}
                                >
                                    <Star
                                        size={36}
                                        className={rating <= feedbackRating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
                                    />
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label htmlFor="feedback-category" className="block text-sm font-semibold text-gray-900 mb-2">Category</label>
                        <select
                            id="feedback-category"
                            value={feedbackCategory}
                            onChange={(e) => setFeedbackCategory(e.target.value)}
                            className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-500"
                        >
                            <option value="general">General Feedback</option>
                            <option value="bug">Bug Report</option>
                            <option value="feature">Feature Request</option>
                            <option value="improvement">Improvement Suggestion</option>
                        </select>
                    </div>

                    <div>
                        <label htmlFor="feedback-message" className="block text-sm font-semibold text-gray-900 mb-2">Your Feedback</label>
                        <textarea
                            id="feedback-message"
                            value={feedbackMessage}
                            onChange={(e) => setFeedbackMessage(e.target.value)}
                            placeholder="Tell us what you think..."
                            rows={6}
                            className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
                            required
                        />
                    </div>

                    <Button
                        type="submit"
                        disabled={feedbackRating === 0 || !feedbackMessage.trim()}
                        variant="primary"
                        className="w-full"
                    >
                        Submit Feedback
                    </Button>
                </form>
            )}
        </div>
    );
};
