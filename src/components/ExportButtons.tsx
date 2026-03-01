import { Download, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';

interface ExportButtonsProps {
  data: Record<string, unknown>[];
  filename?: string;
}

export function ExportButtons({ data, filename = 'export' }: ExportButtonsProps) {
  const exportCSV = () => {
    if (data.length === 0) return;
    const headers = Object.keys(data[0]);
    const csv = [
      headers.join(','),
      ...data.map(row => headers.map(h => `"${String(row[h] ?? '')}"`).join(','))
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: 'CSV exported', description: `${data.length} records exported.` });
  };

  const exportJSON = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: 'JSON exported', description: `${data.length} records exported.` });
  };

  return (
    <div className="flex gap-1.5">
      <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5" onClick={exportCSV}>
        <Download className="w-3.5 h-3.5" /> CSV
      </Button>
      <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5" onClick={exportJSON}>
        <FileText className="w-3.5 h-3.5" /> JSON
      </Button>
    </div>
  );
}
