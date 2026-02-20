export default function PendingApprovals() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Pending Approvals</h1>
        <p className="text-sm text-muted-foreground mt-1">Review and action incoming requests.</p>
      </div>
      <div className="rounded-lg border border-border bg-card p-12 text-center text-muted-foreground">
        <p className="text-sm">Approval queue will be built in the next iteration.</p>
      </div>
    </div>
  );
}
