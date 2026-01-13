'use client';

import { useConvexAuth } from 'convex/react';
import { Loader } from 'lucide-react';
import { useEffect } from 'react';

const OAuthSuccessPage = () => {
    const { isAuthenticated, isLoading } = useConvexAuth();

    useEffect(() => {
        // Wait for auth to settle
        if (!isLoading) {
            if (isAuthenticated) {
                // Redirect to workspace (not dashboard root to avoid middleware redirect loop)
                window.location.href = '/workspace';
            } else {
                // Failed or cancelled? Back to landing
                window.location.href = '/';
            }
        }
    }, [isAuthenticated, isLoading]);

    return (
        <div className="flex h-screen flex-col items-center justify-center bg-background gap-4">
            <Loader className="size-8 animate-spin text-muted-foreground" />
            <p className="text-muted-foreground">Redirecting to dashboard...</p>
        </div>
    );
};

export default OAuthSuccessPage;
