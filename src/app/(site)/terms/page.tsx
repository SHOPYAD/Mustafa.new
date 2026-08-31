// src/app/terms/page.tsx

export default function TermsPage() {
    return (
        <>
            {/* Hero Section */}
            <section className="relative pt-32 pb-16 bg-gradient-to-br from-slate-800 to-slate-900">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                        Terms of Service
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
                        <h2 className="text-2xl font-bold text-slate-900 mb-4">1. Acceptance of Terms</h2>
                        <p className="text-slate-600 mb-6">
                            By accessing and using Alrayyan Tourism services, you agree to be bound by these Terms of Service.
                            If you do not agree to these terms, please do not use our services.
                        </p>

                        <h2 className="text-2xl font-bold text-slate-900 mb-4">2. Booking and Reservations</h2>
                        <p className="text-slate-600 mb-4">When making a booking through Alrayyan Tourism:</p>
                        <ul className="list-disc pl-6 text-slate-600 mb-6 space-y-2">
                            <li>You must provide accurate and complete information</li>
                            <li>You must be at least 18 years old to make a booking</li>
                            <li>Bookings are subject to availability and confirmation</li>
                            <li>Prices are subject to change until booking is confirmed</li>
                            <li>You are responsible for ensuring all travelers have valid travel documents</li>
                        </ul>

                        <h2 className="text-2xl font-bold text-slate-900 mb-4">3. Payment Terms</h2>
                        <p className="text-slate-600 mb-6">
                            Full payment or deposit (as specified) is required at the time of booking.
                            We accept major credit cards and bank transfers. All prices are in AED unless
                            otherwise stated. Additional charges may apply for currency conversion.
                        </p>

                        <h2 className="text-2xl font-bold text-slate-900 mb-4">4. Cancellation Policy</h2>
                        <p className="text-slate-600 mb-4">Cancellation fees apply as follows:</p>
                        <ul className="list-disc pl-6 text-slate-600 mb-6 space-y-2">
                            <li>30+ days before departure: Full refund minus processing fee</li>
                            <li>15-29 days before departure: 50% refund</li>
                            <li>7-14 days before departure: 25% refund</li>
                            <li>Less than 7 days: No refund</li>
                        </ul>
                        <p className="text-slate-600 mb-6">
                            Special conditions may apply to certain packages. Please check your booking confirmation
                            for specific terms.
                        </p>

                        <h2 className="text-2xl font-bold text-slate-900 mb-4">5. Travel Insurance</h2>
                        <p className="text-slate-600 mb-6">
                            We strongly recommend purchasing comprehensive travel insurance. Alrayyan Tourism is not
                            responsible for any losses, damages, or expenses arising from unforeseen circumstances
                            including but not limited to illness, accidents, or travel disruptions.
                        </p>

                        <h2 className="text-2xl font-bold text-slate-900 mb-4">6. Liability Limitations</h2>
                        <p className="text-slate-600 mb-6">
                            Alrayyan Tourism acts as an intermediary between travelers and service providers. We are not
                            liable for the acts, errors, or omissions of airlines, hotels, tour operators, or
                            other third-party suppliers. Our liability is limited to the amount paid for our services.
                        </p>

                        <h2 className="text-2xl font-bold text-slate-900 mb-4">7. Changes to Itinerary</h2>
                        <p className="text-slate-600 mb-6">
                            We reserve the right to modify itineraries due to circumstances beyond our control,
                            including weather, political situations, or supplier changes. We will make reasonable
                            efforts to provide comparable alternatives.
                        </p>

                        <h2 className="text-2xl font-bold text-slate-900 mb-4">8. Governing Law</h2>
                        <p className="text-slate-600 mb-6">
                            These terms are governed by the laws of the Republic of Turkey. Any disputes shall
                            be resolved in the courts of Istanbul.
                        </p>

                        <h2 className="text-2xl font-bold text-slate-900 mb-4">9. Contact Information</h2>
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
