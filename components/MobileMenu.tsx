"use client";

import { Menu, X } from "lucide-react";
import { useState } from "react";

interface MobileMenuProps {
    children: React.ReactNode;
}

export default function MobileMenu({ children }: MobileMenuProps) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            {/* Hamburger Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Toggle menu"
                aria-expanded={isOpen}
            >
                {isOpen ? (
                    <X className="size-6 text-gray-700" />
                ) : (
                    <Menu className="size-6 text-gray-700" />
                )}
            </button>

            {/* Mobile Menu Overlay */}
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
                        onClick={() => setIsOpen(false)}
                    />

                    {/* Menu Panel */}
                    <div className="fixed top-16 left-0 right-0 bg-white border-b border-gray-200 shadow-lg z-50 lg:hidden animate-slide-down">
                        <nav className="max-w-7xl mx-auto px-4 py-4 space-y-2">
                            {children}
                        </nav>
                    </div>
                </>
            )}
        </>
    );
}
