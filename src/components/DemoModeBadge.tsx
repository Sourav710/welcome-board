import { useEffect, useState } from 'react';
import { FlaskConical } from 'lucide-react';
import { getDemoModeStatus, type DemoModeStatus } from '@/services/demoMode';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

/**
 * Compact "Demo Mode" chip that lights up when any backend (Graph, Secure
 * Request, Email) is running on its mock fallback. Designed for stakeholder
 * demos so nobody is surprised that data is simulated.
 */
export function DemoModeBadge() {
  const [status, setStatus] = useState<DemoModeStatus | null>(null);

  useEffect(() => {
    setStatus(getDemoModeStatus());
  }, []);

  if (!status?.any) return null;

  const mockedServices = [
    status.graph && 'Microsoft Graph',
    status.secure && 'Secure Request',
    status.email && 'SLA Email',
  ].filter(Boolean) as string[];

  return (
    <TooltipProvider delayDuration={150}>
      <Tooltip>
        <TooltipTrigger asChild>
          <span
            className="inline-flex items-center gap-1 rounded-full border border-amber-400/40 bg-amber-400/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-300"
            role="status"
            aria-label="Demo mode active"
          >
            <FlaskConical className="h-3 w-3" aria-hidden="true" />
            Demo Mode
          </span>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="max-w-xs text-xs">
          <p className="font-semibold mb-1">Running on simulated data:</p>
          <ul className="list-disc pl-4 space-y-0.5">
            {mockedServices.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
          <p className="mt-2 text-muted-foreground">
            Real integrations activate when their env vars are configured.
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
