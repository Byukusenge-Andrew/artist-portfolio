"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface AuthLayoutProps {
    children: React.ReactNode;
    title: string;
    subtitle: string;
    showBackHome?: boolean;
}

export default function AuthLayout({
    children,
    title,
    subtitle,
    showBackHome = true,
}: AuthLayoutProps) {
    return (
        <div className="min-h-screen w-full flex bg-white">
            {/* Left Side - Art/Image */}
            <div className="hidden lg:flex w-1/2 relative bg-gray-900 overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <Image
                        src="/auth_background_art.png"
                        alt="Artistic background"
                        fill
                        className="object-cover opacity-90"
                        priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-br from-teal-900/40 to-gray-900/60 mix-blend-multiply" />
                </div>

                <div className="relative z-10 w-full flex flex-col justify-between p-12 text-white">
                    <div>
                        <Link href="/" className="text-2xl font-serif tracking-wider font-bold">
                            ARTELIER
                        </Link>
                    </div>

                    <div className="max-w-md">
                        <h2 className="text-4xl font-bold mb-6 leading-tight">
                            Discover unique art for your space.
                        </h2>
                        <p className="text-lg text-gray-200 leading-relaxed">
                            Connect with talented artists, explore curated collections, and bring creativity into your life.
                        </p>
                    </div>

                    <div className="text-sm text-gray-400">
                        © {new Date().getFullYear()} Artelier. All rights reserved.
                    </div>
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative">
                {showBackHome && (
                    <Link
                        href="/"
                        className="absolute top-6 left-6 lg:top-6 lg:left-12 flex items-center text-sm text-gray-500 hover:text-gray-900 transition-colors"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2 " />
                        Back to Home
                    </Link>
                )}

                <div className="w-full max-w-md space-y-8">
                    <div className="text-center lg:text-left">
                        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">{title}</h1>
                        <p className="mt-2 text-gray-600">{subtitle}</p>
                    </div>

                    {children}
                </div>
            </div>
        </div>
    );
}
