'use client';

import { Loader } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo } from 'react';

import { useGetWorkspaces } from '@/lib/backend';
import { useCreateWorkspaceModal } from '@/features/workspaces/store/use-create-workspace-modal';

const WorkspacePage = () => {
    const router = useRouter();
    const [open, setOpen] = useCreateWorkspaceModal();
    const { data, isLoading } = useGetWorkspaces();

    const workspaceId = useMemo(() => data?.[0]?.id, [data]);

    useEffect(() => {
        if (isLoading) return;

        if (workspaceId) {
            router.replace(`/workspace/${workspaceId}`);
        } else if (!open) {
            setOpen(true);
        }
    }, [workspaceId, isLoading, open, setOpen, router]);

    return (
        <div className="flex h-full flex-1 flex-col items-center justify-center gap-2 bg-muted text-foreground">
            <Loader className="size-5 animate-spin" />
        </div>
    );
};

export default WorkspacePage;
