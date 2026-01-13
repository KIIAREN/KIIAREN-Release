'use client';

import { useConvexAuth } from 'convex/react';
import { Loader } from 'lucide-react';
import { useEffect } from 'react';
import { AuthScreen } from '@/features/auth/components/auth-screen';

const AccountPage = () => {
    const { isAuthenticated, isLoading } = useConvexAuth();

    useEffect(() => {
        if (isAuthenticated) {
            // Use relative path for all environments to work with middleware routing
            window.location.href = '/workspace';
        }
    }, [isAuthenticated]);

    if (isLoading || isAuthenticated) {
        return (
            <div className="flex h-full items-center justify-center bg-background">
                <Loader className="size-5 animate-spin" />
            </div>
        );
    }

    return <AuthScreen />;
};

export default AccountPage;
