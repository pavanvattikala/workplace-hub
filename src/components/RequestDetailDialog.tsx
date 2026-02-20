import { useState } from 'react';
import { format } from 'date-fns';
import { ResourceRequest, Status } from '@/types/models';
import { useAppContext } from '@/hooks/useAppContext';
import { StatusBadge, PriorityBadge } from '@/components/StatusBadge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { Download, Pencil, Check, X } from 'lucide-react';

interface RequestDetailDialogProps {
  request: ResourceRequest | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RequestDetailDialog({ request, open, onOpenChange }: RequestDetailDialogProps) {
  const { currentUser, updateRequest } = useAppContext();
  const isApprover = currentUser.role === 'Approver';

  const [editing, setEditing] = useState(false);
  const [editDesc, setEditDesc] = useState('');
  const [editJust, setEditJust] = useState('');
  const [handlerComment, setHandlerComment] = useState('');

  if (!request) return null;

  const canEdit = !isApprover && request.status === Status.SUBMITTED;
  const canClose = request.status === Status.FULFILLED;

  const startEdit = () => {
    setEditDesc(request.shortDescription);
    setEditJust(request.justification);
    setEditing(true);
  };

  const saveEdit = () => {
    updateRequest(request.requestId, { shortDescription: editDesc, justification: editJust });
    setEditing(false);
    toast.success('Request updated.');
  };

  const handleAction = (newStatus: Status) => {
    updateRequest(request.requestId, {
      status: newStatus,
      handlerComments: handlerComment || request.handlerComments,
    });
    setHandlerComment('');
    toast.success(`Request ${request.requestId} marked as ${newStatus}.`);
    onOpenChange(false);
  };

  const handleExport = () => {
    toast.info('Exporting to PDF/CSV... (stub — ready for backend integration)');
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { onOpenChange(v); setEditing(false); }}>
      <DialogContent className="sm:max-w-xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <span className="font-mono text-sm">{request.requestId}</span>
            <StatusBadge status={request.status} />
            <PriorityBadge priority={request.priority} />
          </DialogTitle>
          <DialogDescription>{request.requestType}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2 text-sm">
          {/* Description */}
          <div className="space-y-1">
            <Label className="text-muted-foreground text-xs">Description</Label>
            {editing ? (
              <Input value={editDesc} onChange={(e) => setEditDesc(e.target.value)} />
            ) : (
              <p className="font-medium">{request.shortDescription}</p>
            )}
          </div>

          {/* Justification */}
          <div className="space-y-1">
            <Label className="text-muted-foreground text-xs">Justification</Label>
            {editing ? (
              <Textarea value={editJust} onChange={(e) => setEditJust(e.target.value)} rows={3} />
            ) : (
              <p>{request.justification}</p>
            )}
          </div>

          {editing && (
            <div className="flex gap-2">
              <Button size="sm" onClick={saveEdit}><Check className="h-3.5 w-3.5 mr-1" /> Save</Button>
              <Button size="sm" variant="ghost" onClick={() => setEditing(false)}><X className="h-3.5 w-3.5 mr-1" /> Cancel</Button>
            </div>
          )}

          <Separator />

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-muted-foreground">Requested Date</span>
              <p className="font-medium mt-0.5">{format(new Date(request.requestedDate), 'PPP')}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Target Resolution</span>
              <p className="font-medium mt-0.5">{format(new Date(request.targetResolutionDate), 'PPP')}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Created</span>
              <p className="font-medium mt-0.5">{format(new Date(request.createdAt), 'PPP p')}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Last Updated</span>
              <p className="font-medium mt-0.5">{format(new Date(request.updatedAt), 'PPP p')}</p>
            </div>
          </div>

          {/* Handler comments */}
          {request.handlerComments && (
            <>
              <Separator />
              <div className="space-y-1">
                <Label className="text-muted-foreground text-xs">Handler Comments</Label>
                <p className="text-sm bg-muted/50 rounded-md p-3">{request.handlerComments}</p>
              </div>
            </>
          )}

          {/* Approver Actions */}
          {isApprover && ![Status.CLOSED, Status.REJECTED].includes(request.status) && (
            <>
              <Separator />
              <div className="space-y-3">
                <Label className="text-xs font-semibold">Handler Actions</Label>
                <Textarea
                  placeholder="Add a comment..."
                  value={handlerComment}
                  onChange={(e) => setHandlerComment(e.target.value)}
                  rows={2}
                />
                <div className="flex flex-wrap gap-2">
                  {request.status === Status.SUBMITTED && (
                    <Button size="sm" variant="outline" onClick={() => handleAction(Status.UNDER_REVIEW)}>Take for Review</Button>
                  )}
                  {[Status.SUBMITTED, Status.UNDER_REVIEW].includes(request.status) && (
                    <>
                      <Button size="sm" className="bg-status-approved/90 hover:bg-status-approved text-primary-foreground" onClick={() => handleAction(Status.APPROVED)}>Approve</Button>
                      <Button size="sm" variant="destructive" onClick={() => handleAction(Status.REJECTED)}>Reject</Button>
                    </>
                  )}
                  {request.status === Status.APPROVED && (
                    <Button size="sm" className="bg-status-fulfilled/90 hover:bg-status-fulfilled text-primary-foreground" onClick={() => handleAction(Status.FULFILLED)}>Mark Fulfilled</Button>
                  )}
                  {canClose && (
                    <Button size="sm" variant="outline" onClick={() => handleAction(Status.CLOSED)}>Close Request</Button>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Requester: close if fulfilled */}
          {!isApprover && canClose && (
            <>
              <Separator />
              <Button size="sm" variant="outline" onClick={() => handleAction(Status.CLOSED)}>Close Request</Button>
            </>
          )}
        </div>

        <DialogFooter className="flex-row justify-between sm:justify-between">
          <div className="flex gap-2">
            {canEdit && !editing && (
              <Button variant="outline" size="sm" onClick={startEdit}>
                <Pencil className="h-3.5 w-3.5 mr-1" /> Edit
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="h-3.5 w-3.5 mr-1" /> Export Summary
            </Button>
          </div>
          <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
