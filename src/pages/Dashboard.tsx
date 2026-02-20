import { useAppContext } from '@/hooks/useAppContext';
import { Status, Priority } from '@/types/models';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';

const statCounts = (requests: { status: Status }[]) => ({
  total: requests.length,
  submitted: requests.filter((r) => r.status === Status.SUBMITTED).length,
  inProgress: requests.filter((r) => [Status.UNDER_REVIEW, Status.APPROVED].includes(r.status)).length,
  fulfilled: requests.filter((r) => r.status === Status.FULFILLED).length,
  rejected: requests.filter((r) => r.status === Status.REJECTED).length,
});

// Helper to count priorities
const priorityCounts = (requests: { priority: Priority }[]) => ({
  low: requests.filter((r) => r.priority === Priority.LOW).length,
  medium: requests.filter((r) => r.priority === Priority.MEDIUM).length,
  high: requests.filter((r) => r.priority === Priority.HIGH).length,
});

export default function Dashboard() {
  const { requests, currentUser } = useAppContext();
  const stats = statCounts(requests);
  const pStats = priorityCounts(requests);

  const cards = [
    { label: 'Total Requests', value: stats.total, color: 'bg-primary/10 text-primary' },
    { label: 'Submitted', value: stats.submitted, color: 'bg-status-submitted/10 text-status-submitted' },
    { label: 'In Progress', value: stats.inProgress, color: 'bg-status-approved/10 text-status-approved' },
    { label: 'Fulfilled', value: stats.fulfilled, color: 'bg-status-fulfilled/10 text-status-fulfilled' },
    { label: 'Rejected', value: stats.rejected, color: 'bg-status-rejected/10 text-status-rejected' },
  ];

  // Data arrays for Recharts
  const statusData = [
    { name: 'Submitted', count: stats.submitted, fill: '#3b82f6' }, // blue
    { name: 'In Progress', count: stats.inProgress, fill: '#f59e0b' }, // amber
    { name: 'Fulfilled', count: stats.fulfilled, fill: '#10b981' }, // green
    { name: 'Rejected', count: stats.rejected, fill: '#ef4444' }, // red
  ];

  const priorityData = [
    { name: 'High', value: pStats.high, color: '#ef4444' },
    { name: 'Medium', value: pStats.medium, color: '#f59e0b' },
    { name: 'Low', value: pStats.low, color: '#3b82f6' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Welcome back, {currentUser.name}. You're viewing as <span className="font-medium text-foreground">{currentUser.role}</span>.
        </p>
      </div>

      {/* Top Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {cards.map((card) => (
          <div key={card.label} className="rounded-lg border border-border bg-card p-4 shadow-sm">
            <p className="text-xs text-muted-foreground">{card.label}</p>
            <p className={`text-2xl font-bold mt-1 ${card.color} inline-block px-0`}>{card.value}</p>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Chart 1: Requests by Status */}
        <div className="rounded-lg border border-border bg-card p-6 shadow-sm flex flex-col">
          <h3 className="text-sm font-semibold mb-4">Requests by Status</h3>
          <div className="flex-1 min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statusData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: '#6b7280' }} 
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: '#6b7280' }} 
                />
                <RechartsTooltip 
                  cursor={{ fill: '#f3f4f6' }}
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Requests by Priority */}
        <div className="rounded-lg border border-border bg-card p-6 shadow-sm flex flex-col">
          <h3 className="text-sm font-semibold mb-4">Priority Distribution</h3>
          <div className="flex-1 min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={priorityData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {priorityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip 
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
}