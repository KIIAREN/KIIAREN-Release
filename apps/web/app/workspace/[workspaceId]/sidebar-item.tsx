import { type VariantProps, cva } from 'class-variance-authority';
import type { LucideIcon } from 'lucide-react';
import Link from 'next/link';
import type { IconType } from 'react-icons/lib';

import type { Id } from '@/../convex/_generated/dataModel';
import { Button } from '@/components/ui/button';
import { useWorkspaceId } from '@/hooks/use-workspace-id';
import { cn } from '@/lib/utils';

const sidebarItemVariants = cva('flex items-center gap-1.5 justify-start font-normal h-7 px-[18px] text-sm overflow-hidden', {
  variants: {
    variant: {
      default: 'text-muted-foreground',
      active: 'text-foreground bg-white/90 hover:bg-white/90',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

interface SidebarItemProps {
  id: string;
  icon: LucideIcon | IconType;
  label: Id<'channels'> | string;
  variant?: VariantProps<typeof sidebarItemVariants>['variant'];
  href?: string;
}

export const SidebarItem = ({ id, icon: Icon, label, variant, href }: SidebarItemProps) => {
  const workspaceId = useWorkspaceId();
  const link = href || `/workspace/${workspaceId}/channel/${id}`;

  return (
    <Button variant="transparent" size="sm" className={cn(sidebarItemVariants({ variant }))} asChild>
      <Link href={link}>
        <Icon className="mr-1 size-3.5 shrink-0" />
        <span className="truncate text-sm">{label}</span>
      </Link>
    </Button>
  );
};
