import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Upload, Download, RotateCcw, Save } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import {
  useOrgChart,
  saveOrgChartOverride,
  clearOrgChartOverride,
  validateOrgChart,
} from '@/hooks/useOrgChart';

export function OrgChartAdminPanel() {
  const { data, loading, error } = useOrgChart();
  const [text, setText] = useState('');
  const [parseError, setParseError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (data) setText(JSON.stringify(data, null, 2));
  }, [data]);

  const handleSave = () => {
    try {
      const parsed = JSON.parse(text);
      if (!validateOrgChart(parsed)) {
        setParseError('Invalid shape: each node needs id, name, title, department, email, initials.');
        return;
      }
      saveOrgChartOverride(parsed);
      setParseError(null);
      toast({ title: 'Org chart updated', description: 'Changes are live on the homepage.' });
    } catch (e: any) {
      setParseError(e?.message ?? 'Invalid JSON');
    }
  };

  const handleFile = async (file: File) => {
    try {
      const txt = await file.text();
      const parsed = JSON.parse(txt);
      if (!validateOrgChart(parsed)) {
        toast({ title: 'Invalid file', description: 'JSON shape is not a valid org chart.', variant: 'destructive' });
        return;
      }
      saveOrgChartOverride(parsed);
      setText(JSON.stringify(parsed, null, 2));
      setParseError(null);
      toast({ title: 'Uploaded', description: `Loaded ${file.name}` });
    } catch (e: any) {
      toast({ title: 'Upload failed', description: e?.message ?? 'Invalid JSON', variant: 'destructive' });
    }
  };

  const handleDownload = () => {
    const blob = new Blob([text], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'orgChart.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleReset = () => {
    clearOrgChartOverride();
    toast({ title: 'Reset to default', description: 'Override cleared. Reloaded from /orgChart.json.' });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Org Chart</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Edit JSON or upload a new <code>orgChart.json</code>. Changes apply instantly to the homepage.
          </p>
        </div>
        <div className="flex gap-2">
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleFile(f);
              e.target.value = '';
            }}
          />
          <Button variant="outline" className="gap-2" onClick={() => fileRef.current?.click()}>
            <Upload className="w-4 h-4" /> Upload JSON
          </Button>
          <Button variant="outline" className="gap-2" onClick={handleDownload}>
            <Download className="w-4 h-4" /> Download
          </Button>
          <Button variant="outline" className="gap-2" onClick={handleReset}>
            <RotateCcw className="w-4 h-4" /> Reset
          </Button>
          <Button className="gap-2" onClick={handleSave}>
            <Save className="w-4 h-4" /> Save
          </Button>
        </div>
      </div>

      {loading && <p className="text-sm text-muted-foreground mb-3">Loading…</p>}
      {error && <p className="text-sm text-destructive mb-3">{error}</p>}
      {parseError && (
        <div className="mb-3 px-3 py-2 rounded-lg bg-destructive/10 text-destructive text-sm">{parseError}</div>
      )}

      <Textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        spellCheck={false}
        className="font-mono text-xs min-h-[500px]"
        placeholder='{ "id": "ceo", "name": "...", ... }'
      />

      <p className="text-xs text-muted-foreground mt-3">
        Schema: each node requires <code>id, name, title, department, email, initials</code>; optional <code>reports[]</code> for children.
        Overrides are stored in this browser's localStorage. To make a permanent default, replace <code>public/orgChart.json</code>.
      </p>
    </div>
  );
}
