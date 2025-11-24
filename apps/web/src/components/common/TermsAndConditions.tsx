import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button, Card, CardContent } from '@fiilar/ui';

const TermsAndConditions: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <Button
                    variant="ghost"
                    onClick={() => navigate('/')}
                    className="mb-8 pl-0 hover:bg-transparent hover:text-brand-700 text-brand-600"
                    leftIcon={<ArrowLeft size={20} />}
                >
                    Back to Home
                </Button>

                <Card className="p-8 md:p-12">
                    <CardContent className="p-0">
                        <h1 className="text-4xl font-bold text-gray-900 mb-4">Terms and Conditions</h1>
                        <p className="text-gray-500 mb-8">Last updated: November 22, 2024</p>

                        <div className="prose prose-gray max-w-none space-y-8">
                            <section>
                                <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Acceptance of Terms</h2>
                                <p className="text-gray-600 leading-relaxed">
                                    By accessing and using Fiilar ("the Platform"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
                                </p>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold text-gray-900 mb-4">2. User Accounts</h2>
                                <p className="text-gray-600 leading-relaxed mb-4">
                                    To access certain features of the Platform, you must register for an account. You agree to:
                                </p>
                                <ul className="list-disc pl-6 text-gray-600 space-y-2">
                                    <li>Provide accurate, current, and complete information during registration</li>
                                    <li>Maintain the security of your password and account</li>
                                    <li>Notify us immediately of any unauthorized use of your account</li>
                                    <li>Be responsible for all activities that occur under your account</li>
                                </ul>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Booking and Payment Terms</h2>
                                <p className="text-gray-600 leading-relaxed mb-4">
                                    When you make a booking through Fiilar:
                                </p>
                                <ul className="list-disc pl-6 text-gray-600 space-y-2">
                                    <li>All payments must be processed through the Platform</li>
                                    <li>Service fees apply to all bookings as displayed at checkout</li>
                                    <li>Caution deposits may be held in escrow and released according to our escrow policy</li>
                                    <li>You agree to pay all charges incurred under your account</li>
                                    <li>Off-platform payments are strictly prohibited and may result in account suspension</li>
                                </ul>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Cancellation Policy</h2>
                                <p className="text-gray-600 leading-relaxed mb-4">
                                    Cancellation terms vary by listing and are set by the host. Common policies include:
                                </p>
                                <ul className="list-disc pl-6 text-gray-600 space-y-2">
                                    <li><strong>Flexible:</strong> Full refund if cancelled 24 hours before booking</li>
                                    <li><strong>Moderate:</strong> Full refund if cancelled 5 days before booking</li>
                                    <li><strong>Strict:</strong> No refund after booking confirmation</li>
                                </ul>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Host Responsibilities</h2>
                                <p className="text-gray-600 leading-relaxed mb-4">
                                    As a host on Fiilar, you agree to:
                                </p>
                                <ul className="list-disc pl-6 text-gray-600 space-y-2">
                                    <li>Provide accurate descriptions and photos of your space</li>
                                    <li>Verify ownership or authorization to list the property</li>
                                    <li>Maintain your space in the condition advertised</li>
                                    <li>Comply with all local laws and regulations</li>
                                    <li>Respond to booking requests and messages in a timely manner</li>
                                </ul>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Guest Responsibilities</h2>
                                <p className="text-gray-600 leading-relaxed mb-4">
                                    As a guest on Fiilar, you agree to:
                                </p>
                                <ul className="list-disc pl-6 text-gray-600 space-y-2">
                                    <li>Treat the space with respect and care</li>
                                    <li>Follow all house rules set by the host</li>
                                    <li>Report any damages or issues immediately</li>
                                    <li>Leave the space in the condition you found it</li>
                                    <li>Not exceed the maximum guest capacity</li>
                                </ul>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Prohibited Activities</h2>
                                <p className="text-gray-600 leading-relaxed mb-4">
                                    You may not use Fiilar to:
                                </p>
                                <ul className="list-disc pl-6 text-gray-600 space-y-2">
                                    <li>Violate any laws or regulations</li>
                                    <li>Infringe on intellectual property rights</li>
                                    <li>Transmit harmful or malicious code</li>
                                    <li>Harass, abuse, or harm other users</li>
                                    <li>Attempt to circumvent platform fees or payments</li>
                                    <li>Share contact information to arrange off-platform transactions</li>
                                </ul>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Intellectual Property</h2>
                                <p className="text-gray-600 leading-relaxed">
                                    All content on Fiilar, including text, graphics, logos, and software, is the property of Fiilar or its licensors and is protected by copyright and other intellectual property laws.
                                </p>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Limitation of Liability</h2>
                                <p className="text-gray-600 leading-relaxed">
                                    Fiilar acts as a marketplace connecting hosts and guests. We are not responsible for the conduct of users or the condition of listed spaces. To the maximum extent permitted by law, Fiilar shall not be liable for any indirect, incidental, special, or consequential damages.
                                </p>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Dispute Resolution</h2>
                                <p className="text-gray-600 leading-relaxed">
                                    Any disputes arising from use of the Platform shall be resolved through binding arbitration in accordance with the rules of the American Arbitration Association.
                                </p>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Changes to Terms</h2>
                                <p className="text-gray-600 leading-relaxed">
                                    We reserve the right to modify these terms at any time. Continued use of the Platform after changes constitutes acceptance of the modified terms.
                                </p>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold text-gray-900 mb-4">12. Contact Information</h2>
                                <p className="text-gray-600 leading-relaxed">
                                    For questions about these Terms and Conditions, please contact us at legal@fiilar.com
                                </p>
                            </section>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default TermsAndConditions;
