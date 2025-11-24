import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PrivacyPolicy: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <button
                    onClick={() => navigate('/')}
                    className="flex items-center gap-2 text-brand-600 hover:text-brand-700 mb-8 font-medium"
                >
                    <ArrowLeft size={20} />
                    Back to Home
                </button>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 md:p-12">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">Privacy Policy</h1>
                    <p className="text-gray-500 mb-8">Last updated: November 22, 2024</p>

                    <div className="prose prose-gray max-w-none space-y-8">
                        <section>
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Introduction</h2>
                            <p className="text-gray-600 leading-relaxed">
                                Fiilar ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Information We Collect</h2>
                            <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">Personal Information</h3>
                            <p className="text-gray-600 leading-relaxed mb-4">
                                We collect information that you provide directly to us, including:
                            </p>
                            <ul className="list-disc pl-6 text-gray-600 space-y-2">
                                <li>Name, email address, and phone number</li>
                                <li>Payment information and billing address</li>
                                <li>Government-issued ID for identity verification (hosts only)</li>
                                <li>Profile photo and bio</li>
                                <li>Messages and communications with other users</li>
                            </ul>

                            <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">Automatically Collected Information</h3>
                            <ul className="list-disc pl-6 text-gray-600 space-y-2">
                                <li>Device information (IP address, browser type, operating system)</li>
                                <li>Usage data (pages visited, time spent, features used)</li>
                                <li>Location data (with your permission)</li>
                                <li>Cookies and similar tracking technologies</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. How We Use Your Information</h2>
                            <p className="text-gray-600 leading-relaxed mb-4">
                                We use the information we collect to:
                            </p>
                            <ul className="list-disc pl-6 text-gray-600 space-y-2">
                                <li>Provide, maintain, and improve our services</li>
                                <li>Process transactions and send related information</li>
                                <li>Verify identity and prevent fraud</li>
                                <li>Send administrative messages and updates</li>
                                <li>Respond to your comments and questions</li>
                                <li>Analyze usage patterns and optimize user experience</li>
                                <li>Comply with legal obligations</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Information Sharing and Disclosure</h2>
                            <p className="text-gray-600 leading-relaxed mb-4">
                                We may share your information with:
                            </p>
                            <ul className="list-disc pl-6 text-gray-600 space-y-2">
                                <li><strong>Other Users:</strong> Your profile information and messages are visible to users you interact with</li>
                                <li><strong>Service Providers:</strong> Third-party vendors who perform services on our behalf (payment processing, hosting, analytics)</li>
                                <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
                                <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets</li>
                            </ul>
                            <p className="text-gray-600 leading-relaxed mt-4">
                                We do not sell your personal information to third parties.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Data Security</h2>
                            <p className="text-gray-600 leading-relaxed">
                                We implement appropriate technical and organizational measures to protect your personal information, including encryption, secure servers, and regular security audits. However, no method of transmission over the Internet is 100% secure, and we cannot guarantee absolute security.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Data Retention</h2>
                            <p className="text-gray-600 leading-relaxed">
                                We retain your personal information for as long as necessary to fulfill the purposes outlined in this Privacy Policy, unless a longer retention period is required by law. When you delete your account, we will delete or anonymize your information within 30 days.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Your Rights and Choices</h2>
                            <p className="text-gray-600 leading-relaxed mb-4">
                                You have the right to:
                            </p>
                            <ul className="list-disc pl-6 text-gray-600 space-y-2">
                                <li>Access and update your personal information</li>
                                <li>Request deletion of your account and data</li>
                                <li>Opt out of marketing communications</li>
                                <li>Disable cookies through your browser settings</li>
                                <li>Request a copy of your data</li>
                                <li>Object to processing of your data</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Cookies and Tracking Technologies</h2>
                            <p className="text-gray-600 leading-relaxed">
                                We use cookies and similar technologies to enhance your experience, analyze usage, and deliver personalized content. You can control cookies through your browser settings, but disabling them may affect functionality.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Third-Party Links</h2>
                            <p className="text-gray-600 leading-relaxed">
                                Our platform may contain links to third-party websites. We are not responsible for the privacy practices of these external sites and encourage you to review their privacy policies.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Children's Privacy</h2>
                            <p className="text-gray-600 leading-relaxed">
                                Fiilar is not intended for users under the age of 18. We do not knowingly collect personal information from children. If you believe we have collected information from a child, please contact us immediately.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">11. International Data Transfers</h2>
                            <p className="text-gray-600 leading-relaxed">
                                Your information may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place to protect your data in accordance with this Privacy Policy.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">12. Changes to This Policy</h2>
                            <p className="text-gray-600 leading-relaxed">
                                We may update this Privacy Policy from time to time. We will notify you of significant changes by posting the new policy on this page and updating the "Last updated" date.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">13. Contact Us</h2>
                            <p className="text-gray-600 leading-relaxed">
                                If you have questions about this Privacy Policy or our data practices, please contact us at:
                            </p>
                            <div className="mt-4 text-gray-600">
                                <p>Email: privacy@fiilar.com</p>
                                <p>Address: [Your Business Address]</p>
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PrivacyPolicy;
