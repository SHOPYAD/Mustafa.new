// src/app/about/page.tsx
import Image from "next/image";
import Link from "next/link";
import { Globe, Users, Award, Heart, MapPin, Phone, Mail } from "lucide-react";

const stats = [
    { label: "Happy Travelers", value: "50,000+", icon: Users },
    { label: "Destinations", value: "100+", icon: MapPin },
    { label: "Years Experience", value: "15+", icon: Award },
    { label: "5-Star Reviews", value: "10,000+", icon: Heart },
];

const team = [
    {
        name: "Ahmed Al Maktoum",
        role: "Founder & CEO",
        image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400",
    },
    {
        name: "Sarah Johnson",
        role: "Head of Operations",
        image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400",
    },
    {
        name: "Raj Patel",
        role: "Travel Expert",
        image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400",
    },
    {
        name: "Fatima Al-Rashid",
        role: "Customer Success",
        image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400",
    },
];

export default function AboutPage() {
    return (
        <>
            {/* Hero Section */}
            <section className="relative pt-32 pb-20 bg-gradient-to-br from-blue-600 via-blue-700 to-cyan-600 overflow-hidden">
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
                    <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-500/20 rounded-full blur-3xl" />
                </div>

                <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <span className="inline-block px-4 py-1.5 bg-white/20 text-white text-sm font-semibold rounded-full mb-6">
                        About Alrayyan Tourism
                    </span>
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
                        Your Trusted Travel Partner
                    </h1>
                    <p className="text-xl text-white/80 max-w-2xl mx-auto">
                        Since 2009, we&apos;ve been crafting unforgettable journeys for travelers worldwide.
                        Our passion is turning your travel dreams into reality.
                    </p>
                </div>
            </section>

            {/* Stats Section */}
            <section className="py-16 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        {stats.map((stat) => (
                            <div key={stat.label} className="text-center">
                                <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                    <stat.icon className="text-blue-600" size={28} />
                                </div>
                                <div className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">
                                    {stat.value}
                                </div>
                                <div className="text-slate-600">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Story Section */}
            <section className="py-20 bg-slate-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        <div>
                            <span className="inline-block px-4 py-1.5 bg-blue-100 text-blue-600 text-sm font-semibold rounded-full mb-4">
                                Our Story
                            </span>
                            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">
                                Passion for Travel, Commitment to Excellence
                            </h2>
                            <div className="space-y-4 text-slate-600 leading-relaxed">
                                <p>
                                    Alrayyan Tourism was founded with a simple mission: to make travel accessible,
                                    enjoyable, and memorable for everyone. What started as a small agency
                                    in Dubai has grown into a trusted name in the travel industry.
                                </p>
                                <p>
                                    We believe that travel is more than just visiting new places—it&apos;s about
                                    creating lasting memories, experiencing new cultures, and broadening horizons.
                                    That&apos;s why we go above and beyond to curate the perfect journey for each traveler.
                                </p>
                                <p>
                                    Our team of experienced travel experts works tirelessly to ensure every
                                    aspect of your trip is seamless, from the moment you book until you return home.
                                </p>
                            </div>
                        </div>
                        <div className="relative h-96 rounded-2xl overflow-hidden shadow-2xl">
                            <Image
                                src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800"
                                alt="Travel adventure"
                                fill
                                className="object-cover"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Team Section */}
            <section className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <span className="inline-block px-4 py-1.5 bg-green-100 text-green-600 text-sm font-semibold rounded-full mb-4">
                            Our Team
                        </span>
                        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                            Meet the Experts
                        </h2>
                        <p className="text-slate-600 max-w-2xl mx-auto">
                            Our dedicated team brings years of experience and a genuine passion for travel.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {team.map((member) => (
                            <div
                                key={member.name}
                                className="group bg-slate-50 rounded-2xl p-6 text-center hover:bg-white hover:shadow-xl transition-all duration-300"
                            >
                                <div className="relative w-32 h-32 mx-auto mb-4 rounded-full overflow-hidden">
                                    <Image
                                        src={member.image}
                                        alt={member.name}
                                        fill
                                        className="object-cover group-hover:scale-110 transition-transform duration-300"
                                    />
                                </div>
                                <h3 className="text-lg font-bold text-slate-900 mb-1">{member.name}</h3>
                                <p className="text-blue-600 text-sm">{member.role}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 bg-gradient-to-r from-blue-600 to-cyan-600">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                        Ready to Start Your Journey?
                    </h2>
                    <p className="text-xl text-white/80 mb-10">
                        Let us help you plan your perfect getaway.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link
                            href="/contact"
                            className="px-8 py-4 bg-white text-blue-600 font-bold rounded-xl shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-1"
                        >
                            Contact Us
                        </Link>
                        <Link
                            href="/holidays"
                            className="px-8 py-4 bg-transparent border-2 border-white text-white font-bold rounded-xl hover:bg-white hover:text-blue-600 transition-all"
                        >
                            Browse Packages
                        </Link>
                    </div>
                </div>
            </section>
        </>
    );
}
