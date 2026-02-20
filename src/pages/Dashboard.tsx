import { useAppContext } from '@/hooks/useAppContext';
import { Status } from '@/types/models';

const statCounts = (requests: { status: Status }[]) => ({
  total: requests.length,
  submitted: requests.filter((r) => r.status === Status.SUBMITTED).length,
  inProgress: requests.filter((r) => [Status.UNDER_REVIEW, Status.APPROVED].includes(r.status)).length,
  fulfilled: requests.filter((r) => r.status === Status.FULFILLED).length,
  rejected: requests.filter((r) => r.status === Status.REJECTED).length,
});

export default function Dashboard() {
  const { requests, currentUser } = useAppContext();
  const stats = statCounts(requests);

  const cards = [
    { label: 'Total Requests', value: stats.total, color: 'bg-primary/10 text-primary' },
    { label: 'Submitted', value: stats.submitted, color: 'bg-status-submitted/10 text-status-submitted' },
    { label: 'In Progress', value: stats.inProgress, color: 'bg-status-approved/10 text-status-approved' },
    { label: 'Fulfilled', value: stats.fulfilled, color: 'bg-status-fulfilled/10 text-status-fulfilled' },
    { label: 'Rejected', value: stats.rejected, color: 'bg-status-rejected/10 text-status-rejected' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Welcome back, {currentUser.name}. You're viewing as <span className="font-medium text-foreground">{currentUser.role}</span>.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {cards.map((card) => (
          <div key={card.label} className="rounded-lg border border-border bg-card p-4">
            <p className="text-xs text-muted-foreground">{card.label}</p>
            <p className={`text-2xl font-bold mt-1 ${card.color} inline-block px-0`}>{card.value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-lg border border-border bg-card p-6 text-center text-muted-foreground">
        <p className="text-sm">Select <span className="font-medium">My Requests</span> or <span className="font-medium">Pending Approvals</span> from the sidebar to get started.</p>
      </div>
    </div>
  );
}
