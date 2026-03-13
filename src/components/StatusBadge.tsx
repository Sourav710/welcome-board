import { ItemStatus } from '@/types/onboarding';

const statusConfig: Record<ItemStatus, { label: string; className: string; dot: string }> = {
  not_started: { label: 'Not Started', className: 'bg-muted text-muted-foreground', dot: 'bg-muted-foreground' },
  in_progress: { label: 'In Progress', className: 'bg-info/15 text-info', dot: 'bg-info' },
  pending: { label: 'Pending', className: 'bg-warning/15 text-warning', dot: 'bg-warning' },
  complete: { label: 'Complete', className: 'bg-success/15 text-success', dot: 'bg-success' },
  rejected: { label: 'Rejected', className: 'bg-destructive/15 text-destructive', dot: 'bg-destructive' },
};

export function StatusBadge({ status }: { status: ItemStatus }) {
  const config = statusConfig[status] ?? statusConfig.not_started;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${config.className}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  );
}
