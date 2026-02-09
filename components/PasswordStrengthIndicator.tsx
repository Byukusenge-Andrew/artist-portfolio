"use client";

import { checkPasswordStrength } from "@/lib/password-utils";
import { useEffect, useState } from "react";

type Props = {
    password: string;
};

export default function PasswordStrengthIndicator({ password }: Props) {
    const [strength, setStrength] = useState<"weak" | "medium" | "strong">("weak");

    useEffect(() => {
        if (password) {
            setStrength(checkPasswordStrength(password));
        }
    }, [password]);

    if (!password) return null;

    const getColor = () => {
        switch (strength) {
            case "weak":
                return "bg-red-500";
            case "medium":
                return "bg-yellow-500";
            case "strong":
                return "bg-green-500";
        }
    };

    const getWidth = () => {
        switch (strength) {
            case "weak":
                return "w-1/3";
            case "medium":
                return "w-2/3";
            case "strong":
                return "w-full";
        }
    };

    return (
        <div className="mt-2">
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                    className={`h-full transition-all duration-300 ${getColor()} ${getWidth()}`}
                />
            </div>
            <p className="text-xs mt-1 capitalize text-gray-600">
                Password strength: <span className={`font-medium ${strength === "weak" ? "text-red-600" :
                    strength === "medium" ? "text-yellow-600" :
                        "text-green-600"
                    }`}>{strength}</span>
            </p>
        </div>
    );
}
