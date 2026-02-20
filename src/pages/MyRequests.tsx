import { useState } from 'react';
import { useAppContext } from '@/hooks/useAppContext';
import { ResourceRequest } from '@/types/models';
import { RequestTable } from '@/components/RequestTable';
import { CreateRequestDialog } from '@/components/CreateRequestDialog';
import { RequestDetailDialog } from '@/components/RequestDetailDialog';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export default function MyRequests() {
  const { requests } = useAppContext();
  const [createOpen, setCreateOpen] = useState(false);
  const [selected, setSelected] = useState<ResourceRequest | null>(null);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">My Requests</h1>
          <p className="text-sm text-muted-foreground mt-1">View and manage your resource requests.</p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4 mr-1.5" /> New Request
        </Button>
      </div>

      <RequestTable requests={requests} onRowClick={setSelected} />
      <CreateRequestDialog open={createOpen} onOpenChange={setCreateOpen} />
      <RequestDetailDialog request={selected} open={!!selected} onOpenChange={(v) => !v && setSelected(null)} />
    </div>
  );
}
