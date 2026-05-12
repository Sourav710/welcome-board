import { useEffect, useState } from 'react';
import {
  getUserBillingDetails,
  getManager,
  type BillingDetails as BillingType,
  type GraphContext,
} from '@/services/graphService';
import { Skeleton } from '@/components/ui/skeleton';

interface Props {
  /** SPFx WebPartContext when running inside SharePoint; optional in the prototype. */
  context?: GraphContext;
  /** Optional overrides used by the prototype to seed values (e.g. employeeId). */
  overrides?: Partial<BillingType>;
}

type BillingWithManager = BillingType & { manager: string };

export const BillingDetails: React.FC<Props> = ({ context, overrides }) => {
  const [data, setData] = useState<BillingWithManager | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const [billing, managerName] = await Promise.all([
          getUserBillingDetails(context, overrides),
          getManager(context),
        ]);
        if (!cancelled) setData({ ...billing, manager: managerName });
      } catch (err) {
        console.error('Error loading billing details:', err);
        if (!cancelled) setError('Unable to load billing details.');
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [context, overrides]);

  if (error) {
    return <p className="text-xs text-destructive">{error}</p>;
  }

  if (!data) {
    return (
      <div className="grid grid-cols-2 gap-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-12 rounded-lg" />
        ))}
      </div>
    );
  }

  const fields: { label: string; value?: string }[] = [
    { label: 'Business Segment', value: data.businessSegment },
    { label: 'GL Code', value: data.glCode },
    { label: 'Cost Center', value: data.costCenter },
    { label: 'Location', value: data.location },
    { label: 'Department', value: data.department },
    { label: 'Division', value: data.division },
    { label: 'Employee ID', value: data.employeeId },
    { label: 'Manager', value: data.manager },
  ];

  return (
    <div className="grid grid-cols-2 gap-2 text-xs">
      {fields.map((f) => (
        <div key={f.label} className="p-2 rounded-lg bg-muted/40 border">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
            {f.label}
          </p>
          <p className="text-xs font-semibold text-foreground mt-0.5 leading-tight">
            {f.value || 'N/A'}
          </p>
        </div>
      ))}
    </div>
  );
};

export default BillingDetails;
