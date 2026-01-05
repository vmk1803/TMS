"use client";
import React from "react";

interface LoadingSpinnerProps {
    size?: "small" | "medium" | "large";
    overlay?: boolean;
    message?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
    size = "medium",
    overlay = false,
    message = "Loading...",
}) => {
    const sizeClasses = {
        small: "w-6 h-6 border-2",
        medium: "w-10 h-10 border-3",
        large: "w-16 h-16 border-4",
    };

    const spinner = (
        <div className="flex flex-col items-center justify-center gap-3">
            <div
                className={`${sizeClasses[size]} border-green-600 border-t-transparent rounded-full animate-spin`}
            ></div>
            {message && (
                <p className="text-sm text-gray-600 font-medium">{message}</p>
            )}
        </div>
    );

    if (overlay) {
        return (
            <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50">
                {spinner}
            </div>
        );
    }

    return spinner;
};

export default LoadingSpinner;
