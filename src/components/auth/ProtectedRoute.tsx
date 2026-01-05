"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { startInactivityTimer } from "@/utils/authTimer";

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

    useEffect(() => {
        console.log("ProtectedRoute checking authentication for path:", pathname);
        if (typeof window === "undefined") return;

        const token = localStorage.getItem("authToken");
        const user = localStorage.getItem("user");

        // If no token or user → redirect to login
        if (!token || !user) {
            setIsAuthenticated(false);
            router.push("/");
            return;
        }

        setIsAuthenticated(true);

        // Start auto logout timer (30 min inactivity)
        startInactivityTimer(() => {
            localStorage.removeItem("authToken");
            localStorage.removeItem("user");
            router.push("/");
        });

    }, [pathname, router]);

    if (isAuthenticated === null) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
            </div>
        );
    }

    if (!isAuthenticated) return null;

    return <>{children}</>;
}
