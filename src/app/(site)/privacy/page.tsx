// src/app/privacy/page.tsx

export default function PrivacyPage() {
    return (
        <>
            {/* Hero Section */}
            <section className="relative pt-32 pb-16 bg-gradient-to-br from-slate-800 to-slate-900">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                        Privacy Policy
                    </h1>
                    <p className="text-slate-400">
                        Last updated: January 2024
                    </p>
                </div>
            </section>

            {/* Content */}
            <section className="py-16 bg-white">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="prose prose-slate max-w-none">
                        <h2 className="text-2xl font-bold text-slate-900 mb-4">1. Information We Collect</h2>
                        <p className="text-slate-600 mb-6">
                            We collect information you provide directly to us, such as when you create an account,
                            make a booking, subscribe to our newsletter, or contact us for support. This may include
                            your name, email address, phone number, payment information, and travel preferences.
                        </p>

                        <h2 className="text-2xl font-bold text-slate-900 mb-4">2. How We Use Your Information</h2>
                        <p className="text-slate-600 mb-4">We use the information we collect to:</p>
                        <ul className="list-disc pl-6 text-slate-600 mb-6 space-y-2">
                            <li>Process and fulfill your travel bookings</li>
                            <li>Send you booking confirmations and travel updates</li>
                            <li>Respond to your inquiries and provide customer support</li>
                            <li>Send promotional offers (with your consent)</li>
                            <li>Improve our services and user experience</li>
                        </ul>

                        <h2 className="text-2xl font-bold text-slate-900 mb-4">3. Information Sharing</h2>
                        <p className="text-slate-600 mb-6">
                            We may share your information with third-party service providers who assist us in
                            operating our business, such as airlines, hotels, payment processors, and visa
                            processing agencies. We ensure all partners maintain appropriate security measures.
                        </p>

                        <h2 className="text-2xl font-bold text-slate-900 mb-4">4. Data Security</h2>
                        <p className="text-slate-600 mb-6">
                            We implement industry-standard security measures to protect your personal information.
                            All payment transactions are encrypted using SSL technology. However, no method of
                            transmission over the Internet is 100% secure.
                        </p>

                        <h2 className="text-2xl font-bold text-slate-900 mb-4">5. Your Rights</h2>
                        <p className="text-slate-600 mb-4">You have the right to:</p>
                        <ul className="list-disc pl-6 text-slate-600 mb-6 space-y-2">
                            <li>Access your personal data</li>
                            <li>Correct inaccurate information</li>
                            <li>Request deletion of your data</li>
                            <li>Opt-out of marketing communications</li>
                            <li>Object to certain data processing</li>
                        </ul>

                        <h2 className="text-2xl font-bold text-slate-900 mb-4">6. Cookies</h2>
                        <p className="text-slate-600 mb-6">
                            We use cookies and similar technologies to enhance your browsing experience,
                            analyze site traffic, and personalize content. You can control cookie preferences
                            through your browser settings.
                        </p>

                        <h2 className="text-2xl font-bold text-slate-900 mb-4">7. Contact Us</h2>
                        <p className="text-slate-600 mb-6">
                            If you have any questions about this Privacy Policy, please contact us at:
                        </p>
                        <div className="bg-slate-50 rounded-xl p-6">
                            <p className="text-slate-700 font-semibold">Alrayyan Tourism — الريان للسياحة</p>
                            <p className="text-slate-600">Email: info@lonaliza.com</p>
                            <p className="text-slate-600">Phone: +90 532 179 67 63</p>
                            <p className="text-slate-600">Address: Istanbul, Turkey</p>
                            <p className="text-slate-600">Website: https://lonaliza.com</p>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}
