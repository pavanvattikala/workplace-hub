import { useState } from 'react';
import { useAppContext } from '@/hooks/useAppContext';
import { ResourceRequest, Status } from '@/types/models';
import { RequestTable } from '@/components/RequestTable';
import { RequestDetailDialog } from '@/components/RequestDetailDialog';

export default function PendingApprovals() {
  const { requests } = useAppContext();
  const [selected, setSelected] = useState<ResourceRequest | null>(null);

  // Approvers see all non-closed requests
  const pending = requests.filter((r) => r.status !== Status.CLOSED);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Pending Approvals</h1>
        <p className="text-sm text-muted-foreground mt-1">Review and action incoming resource requests.</p>
      </div>

      <RequestTable requests={pending} onRowClick={setSelected} />
      <RequestDetailDialog request={selected} open={!!selected} onOpenChange={(v) => !v && setSelected(null)} />
    </div>
  );
}