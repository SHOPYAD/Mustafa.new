// src/app/visa/page.tsx
import { Suspense } from "react";
import VisaPageContent from "./VisaPageContent";

export default function VisaPage() {
    return (
        <Suspense fallback={<VisaPageLoading />}>
            <VisaPageContent />
        </Suspense>
    );
}

function VisaPageLoading() {
    return (
        <>
            {/* Hero Section Skeleton */}
            <section className="relative pt-32 pb-20 bg-gradient-to-br from-blue-600 via-blue-700 to-cyan-600">
                <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <div className="h-8 w-32 bg-white/20 rounded-full mx-auto mb-6 animate-pulse" />
                    <div className="h-16 w-64 bg-white/20 rounded-xl mx-auto mb-6 animate-pulse" />
                    <div className="h-12 w-full max-w-2xl bg-white/20 rounded-2xl mx-auto animate-pulse" />
                </div>
            </section>
            <section className="py-16 bg-slate-50">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="h-24 bg-white rounded-2xl animate-pulse" />
                        ))}
                    </div>
                </div>
            </section>
        </>
    );
}
