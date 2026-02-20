import { useState, useMemo } from 'react';
import { format } from 'date-fns';
import { ResourceRequest, RequestType, Status, Priority } from '@/types/models';
import { StatusBadge, PriorityBadge } from '@/components/StatusBadge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, X, ChevronUp, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RequestTableProps {
  requests: ResourceRequest[];
  onRowClick: (req: ResourceRequest) => void;
}

type SortField = 'requestId' | 'createdAt' | 'priority' | 'status';
type SortDir = 'asc' | 'desc';

const priorityOrder: Record<Priority, number> = { [Priority.LOW]: 0, [Priority.MEDIUM]: 1, [Priority.HIGH]: 2 };
const statusOrder: Record<Status, number> = {
  [Status.SUBMITTED]: 0, [Status.UNDER_REVIEW]: 1, [Status.APPROVED]: 2,
  [Status.REJECTED]: 3, [Status.FULFILLED]: 4, [Status.CLOSED]: 5,
};

export function RequestTable({ requests, onRowClick }: RequestTableProps) {
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [dateFrom, setDateFrom] = useState<Date | undefined>();
  const [dateTo, setDateTo] = useState<Date | undefined>();
  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [page, setPage] = useState(0);
  const pageSize = 10;

  const filtered = useMemo(() => {
    let data = [...requests];
    if (typeFilter !== 'all') data = data.filter((r) => r.requestType === typeFilter);
    if (statusFilter !== 'all') data = data.filter((r) => r.status === statusFilter);
    if (priorityFilter !== 'all') data = data.filter((r) => r.priority === priorityFilter);
    if (dateFrom) data = data.filter((r) => new Date(r.createdAt) >= dateFrom);
    if (dateTo) data = data.filter((r) => new Date(r.createdAt) <= dateTo);

    data.sort((a, b) => {
      let cmp = 0;
      switch (sortField) {
        case 'requestId': cmp = a.requestId.localeCompare(b.requestId); break;
        case 'createdAt': cmp = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(); break;
        case 'priority': cmp = priorityOrder[a.priority] - priorityOrder[b.priority]; break;
        case 'status': cmp = statusOrder[a.status] - statusOrder[b.status]; break;
      }
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return data;
  }, [requests, typeFilter, statusFilter, priorityFilter, dateFrom, dateTo, sortField, sortDir]);

  const paged = filtered.slice(page * pageSize, (page + 1) * pageSize);
  const totalPages = Math.ceil(filtered.length / pageSize);

  const toggleSort = (field: SortField) => {
    if (sortField === field) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortField(field); setSortDir('asc'); }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null;
    return sortDir === 'asc' ? <ChevronUp className="h-3 w-3 inline ml-1" /> : <ChevronDown className="h-3 w-3 inline ml-1" />;
  };

  const clearFilters = () => {
    setTypeFilter('all'); setStatusFilter('all'); setPriorityFilter('all');
    setDateFrom(undefined); setDateTo(undefined); setPage(0);
  };

  const hasFilters = typeFilter !== 'all' || statusFilter !== 'all' || priorityFilter !== 'all' || dateFrom || dateTo;

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap items-end gap-3">
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">Type</label>
          <Select value={typeFilter} onValueChange={(v) => { setTypeFilter(v); setPage(0); }}>
            <SelectTrigger className="w-[160px] h-9 text-sm bg-card"><SelectValue /></SelectTrigger>
            <SelectContent className="bg-popover">
              <SelectItem value="all">All Types</SelectItem>
              {Object.values(RequestType).map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">Status</label>
          <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(0); }}>
            <SelectTrigger className="w-[160px] h-9 text-sm bg-card"><SelectValue /></SelectTrigger>
            <SelectContent className="bg-popover">
              <SelectItem value="all">All Statuses</SelectItem>
              {Object.values(Status).map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">Priority</label>
          <Select value={priorityFilter} onValueChange={(v) => { setPriorityFilter(v); setPage(0); }}>
            <SelectTrigger className="w-[130px] h-9 text-sm bg-card"><SelectValue /></SelectTrigger>
            <SelectContent className="bg-popover">
              <SelectItem value="all">All</SelectItem>
              {Object.values(Priority).map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">From</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className={cn("w-[140px] h-9 text-sm justify-start bg-card", !dateFrom && "text-muted-foreground")}>
                <CalendarIcon className="h-3.5 w-3.5 mr-1.5" />
                {dateFrom ? format(dateFrom, 'MMM d, yyyy') : 'Start'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 bg-popover" align="start">
              <Calendar mode="single" selected={dateFrom} onSelect={(d) => { setDateFrom(d); setPage(0); }} className="p-3 pointer-events-auto" />
            </PopoverContent>
          </Popover>
        </div>
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">To</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className={cn("w-[140px] h-9 text-sm justify-start bg-card", !dateTo && "text-muted-foreground")}>
                <CalendarIcon className="h-3.5 w-3.5 mr-1.5" />
                {dateTo ? format(dateTo, 'MMM d, yyyy') : 'End'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 bg-popover" align="start">
              <Calendar mode="single" selected={dateTo} onSelect={(d) => { setDateTo(d); setPage(0); }} className="p-3 pointer-events-auto" />
            </PopoverContent>
          </Popover>
        </div>
        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters} className="h-9 text-xs text-muted-foreground">
            <X className="h-3 w-3 mr-1" /> Clear
          </Button>
        )}
      </div>

      {/* Table */}
      <div className="rounded-lg border border-border bg-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="text-left px-4 py-3 font-medium text-muted-foreground cursor-pointer select-none" onClick={() => toggleSort('requestId')}>
                ID <SortIcon field="requestId" />
              </th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Type</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">Description</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground cursor-pointer select-none" onClick={() => toggleSort('priority')}>
                Priority <SortIcon field="priority" />
              </th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground cursor-pointer select-none" onClick={() => toggleSort('status')}>
                Status <SortIcon field="status" />
              </th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground cursor-pointer select-none hidden lg:table-cell" onClick={() => toggleSort('createdAt')}>
                Created <SortIcon field="createdAt" />
              </th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden lg:table-cell">Target Date</th>
            </tr>
          </thead>
          <tbody>
            {paged.length === 0 ? (
              <tr><td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">No requests found.</td></tr>
            ) : (
              paged.map((req) => (
                <tr
                  key={req.requestId}
                  className="border-b border-border last:border-0 hover:bg-muted/30 cursor-pointer transition-colors"
                  onClick={() => onRowClick(req)}
                >
                  <td className="px-4 py-3 font-mono text-xs font-medium">{req.requestId}</td>
                  <td className="px-4 py-3 text-xs">{req.requestType}</td>
                  <td className="px-4 py-3 hidden md:table-cell max-w-[240px] truncate">{req.shortDescription}</td>
                  <td className="px-4 py-3"><PriorityBadge priority={req.priority} /></td>
                  <td className="px-4 py-3"><StatusBadge status={req.status} /></td>
                  <td className="px-4 py-3 text-xs text-muted-foreground hidden lg:table-cell">{format(new Date(req.createdAt), 'MMM d, yyyy')}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground hidden lg:table-cell">{format(new Date(req.targetResolutionDate), 'MMM d, yyyy')}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground text-xs">{filtered.length} result{filtered.length !== 1 ? 's' : ''}</span>
          <div className="flex gap-1">
            <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage(page - 1)}>Prev</Button>
            <span className="px-3 py-1 text-xs text-muted-foreground flex items-center">{page + 1} / {totalPages}</span>
            <Button variant="outline" size="sm" disabled={page >= totalPages - 1} onClick={() => setPage(page + 1)}>Next</Button>
          </div>
        </div>
      )}
    </div>
  );
}
