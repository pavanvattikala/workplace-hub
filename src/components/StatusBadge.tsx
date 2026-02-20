import { Status, Priority } from '@/types/models';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const statusStyles: Record<Status, string> = {
  [Status.SUBMITTED]: 'bg-status-submitted/15 text-status-submitted border-status-submitted/30',
  [Status.UNDER_REVIEW]: 'bg-status-under-review/15 text-status-under-review border-status-under-review/30',
  [Status.APPROVED]: 'bg-status-approved/15 text-status-approved border-status-approved/30',
  [Status.REJECTED]: 'bg-status-rejected/15 text-status-rejected border-status-rejected/30',
  [Status.FULFILLED]: 'bg-status-fulfilled/15 text-status-fulfilled border-status-fulfilled/30',
  [Status.CLOSED]: 'bg-status-closed/15 text-status-closed border-status-closed/30',
};

const priorityStyles: Record<Priority, string> = {
  [Priority.LOW]: 'bg-priority-low/15 text-priority-low border-priority-low/30',
  [Priority.MEDIUM]: 'bg-priority-medium/15 text-priority-medium border-priority-medium/30',
  [Priority.HIGH]: 'bg-priority-high/15 text-priority-high border-priority-high/30',
};

export function StatusBadge({ status }: { status: Status }) {
  return (
    <Badge className={cn('text-[11px] font-medium', statusStyles[status])}>
      {status}
    </Badge>
  );
}

export function PriorityBadge({ priority }: { priority: Priority }) {
  return (
    <Badge className={cn('text-[11px] font-medium', priorityStyles[priority])}>
      {priority}
    </Badge>
  );
}
