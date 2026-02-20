import { ItemStatus } from '@/types/onboarding';

const statusConfig: Record<ItemStatus, { label: string; className: string }> = {
  not_started: { label: 'Not Started', className: 'bg-muted text-muted-foreground' },
  in_progress: { label: 'In Progress', className: 'bg-info text-info-foreground' },
  pending: { label: 'Pending', className: 'bg-warning text-warning-foreground' },
  complete: { label: 'Complete', className: 'bg-success text-success-foreground' },
  rejected: { label: 'Rejected', className: 'bg-destructive text-destructive-foreground' },
};

export function StatusBadge({ status }: { status: ItemStatus }) {
  const config = statusConfig[status];
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${config.className}`}>
      {config.label}
    </span>
  );
}
