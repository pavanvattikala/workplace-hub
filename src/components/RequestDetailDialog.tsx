import { useState } from 'react';
import { format } from 'date-fns';
import { ResourceRequest, Status } from '@/types/models';
import { useAppContext, ALL_USERS } from '@/hooks/useAppContext';
import { StatusBadge, PriorityBadge } from '@/components/StatusBadge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
// --- ADDED TABS & ICONS ---
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from 'sonner';
import { Download, Pencil, Check, X, Sparkles, Loader2 } from 'lucide-react';

interface RequestDetailDialogProps {
  request: ResourceRequest | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RequestDetailDialog({ request, open, onOpenChange }: RequestDetailDialogProps) {
  const { currentUser, updateRequest, requests } = useAppContext();
  const isApprover = currentUser.role === 'Approver';

  const [editing, setEditing] = useState(false);
  const [editDesc, setEditDesc] = useState('');
  const [editJust, setEditJust] = useState('');
  const [handlerComment, setHandlerComment] = useState('');
  
  // --- NEW: AI Summary State ---
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [isSummarizing, setIsSummarizing] = useState(false);

  const liveRequest = request 
    ? requests.find(r => r.requestId === request.requestId) || request 
    : null;

  if (!liveRequest) return null;

  const assignedApprover = ALL_USERS.find(u => u.id === liveRequest.assignedApproverId);
  const requester = ALL_USERS.find(u => u.id === liveRequest.requesterId);

  const canEdit = !isApprover && liveRequest.status === Status.SUBMITTED;
  const canClose = liveRequest.status === Status.FULFILLED;

  const startEdit = () => {
    setEditDesc(liveRequest.shortDescription);
    setEditJust(liveRequest.justification);
    setEditing(true);
  };

  const saveEdit = () => {
    updateRequest(liveRequest.requestId, { shortDescription: editDesc, justification: editJust });
    setEditing(false);
    toast.success('Request updated.');
  };

  const handleAction = (newStatus: Status) => {
    updateRequest(liveRequest.requestId, {
      status: newStatus,
      handlerComments: handlerComment || liveRequest.handlerComments,
    });
    setHandlerComment('');
    toast.success(`Request ${liveRequest.requestId} marked as ${newStatus}.`);
    onOpenChange(false);
  };

  // --- NEW: Fetch AI Summary ---
  const handleGenerateSummary = async () => {
    setIsSummarizing(true);
    try {
      const response = await fetch(`http://localhost:8000/api/requests/${liveRequest.requestId}/ai-summary`);
      if (!response.ok) throw new Error('Failed to fetch summary');
      
      const data = await response.json();
      setAiSummary(data.summary);
    } catch (error) {
      toast.error('Failed to generate AI summary.');
      console.error(error);
    } finally {
      setIsSummarizing(false);
    }
  };

  // Reset AI summary when dialog closes so it's fresh for the next request
  const handleOpenChange = (v: boolean) => {
    onOpenChange(v);
    if (!v) {
      setEditing(false);
      setAiSummary(null); 
    }
  };

   const handleExport = async (format: 'pdf' | 'csv') => {
    if (format === 'pdf') {
      window.print();
      return;
    }

    try {
      const toastId = toast.loading('Generating CSV...');
      const response = await fetch(`http://localhost:8000/api/requests/${liveRequest.requestId}/export/csv`);
      
      if (!response.ok) throw new Error('Export failed on backend');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `${liveRequest.requestId}_summary.csv`;
      document.body.appendChild(a);
      a.click();
      
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.dismiss(toastId);
      toast.success('CSV exported successfully!');
    } catch (error) {
      toast.dismiss();
      toast.error('Failed to export CSV');
      console.error(error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <span className="font-mono text-sm">{liveRequest.requestId}</span>
            <StatusBadge status={liveRequest.status} />
            <PriorityBadge priority={liveRequest.priority} />
          </DialogTitle>
          <DialogDescription>{liveRequest.requestType}</DialogDescription>
        </DialogHeader>

        {/* --- ADDED TABS WRAPPER --- */}
        <Tabs defaultValue="details" className="w-full mt-2">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="summary" className="flex gap-1.5 items-center">
              <Sparkles className="h-3.5 w-3.5" /> AI Summary
            </TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-4 py-2 text-sm mt-0 outline-none">
            {/* Description */}
            <div className="space-y-1">
              <Label className="text-muted-foreground text-xs">Description</Label>
              {editing ? (
                <Input value={editDesc} onChange={(e) => setEditDesc(e.target.value)} />
              ) : (
                <p className="font-medium">{liveRequest.shortDescription}</p>
              )}
            </div>

            {/* Justification */}
            <div className="space-y-1">
              <Label className="text-muted-foreground text-xs">Justification</Label>
              {editing ? (
                <Textarea value={editJust} onChange={(e) => setEditJust(e.target.value)} rows={3} />
              ) : (
                <p>{liveRequest.justification}</p>
              )}
            </div>

            {editing && (
              <div className="flex gap-2">
                <Button size="sm" onClick={saveEdit}><Check className="h-3.5 w-3.5 mr-1" /> Save</Button>
                <Button size="sm" variant="ghost" onClick={() => setEditing(false)}><X className="h-3.5 w-3.5 mr-1" /> Cancel</Button>
              </div>
            )}

            <Separator />

            {/* Users & Dates */}
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-muted-foreground">Requested By</span>
                <p className="font-medium mt-0.5">{requester?.name || liveRequest.requesterId}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Assigned Approver</span>
                <p className="font-medium mt-0.5">{assignedApprover?.name || 'Unassigned'}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Requested Date</span>
                <p className="font-medium mt-0.5">{format(new Date(liveRequest.requestedDate), 'PPP')}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Target Resolution</span>
                <p className="font-medium mt-0.5">{format(new Date(liveRequest.targetResolutionDate), 'PPP')}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Created</span>
                <p className="font-medium mt-0.5">{format(new Date(liveRequest.createdAt), 'PPP p')}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Last Updated</span>
                <p className="font-medium mt-0.5">{format(new Date(liveRequest.updatedAt), 'PPP p')}</p>
              </div>
            </div>

            {/* Handler comments */}
            {liveRequest.handlerComments && (
              <>
                <Separator />
                <div className="space-y-1">
                  <Label className="text-muted-foreground text-xs">Handler Comments</Label>
                  <p className="text-sm bg-muted/50 rounded-md p-3">{liveRequest.handlerComments}</p>
                </div>
              </>
            )}

            {/* Approver Actions */}
            {isApprover && ![Status.CLOSED, Status.REJECTED].includes(liveRequest.status) && (
              <>
                <Separator />
                <div className="space-y-3 print:hidden">
                  <Label className="text-xs font-semibold">Handler Actions</Label>
                  <Textarea
                    placeholder="Add a comment..."
                    value={handlerComment}
                    onChange={(e) => setHandlerComment(e.target.value)}
                    rows={2}
                  />
                  <div className="flex flex-wrap gap-2">
                    {liveRequest.status === Status.SUBMITTED && (
                      <Button size="sm" variant="outline" onClick={() => handleAction(Status.UNDER_REVIEW)}>Take for Review</Button>
                    )}
                    {[Status.SUBMITTED, Status.UNDER_REVIEW].includes(liveRequest.status) && (
                      <>
                        <Button size="sm" className="bg-status-approved/90 hover:bg-status-approved text-primary-foreground" onClick={() => handleAction(Status.APPROVED)}>Approve</Button>
                        <Button size="sm" variant="destructive" onClick={() => handleAction(Status.REJECTED)}>Reject</Button>
                      </>
                    )}
                    {liveRequest.status === Status.APPROVED && (
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
                <Button size="sm" variant="outline" className="print:hidden" onClick={() => handleAction(Status.CLOSED)}>Close Request</Button>
              </>
            )}
          </TabsContent>

          {/* --- NEW: AI SUMMARY TAB CONTENT --- */}
          <TabsContent value="summary" className="mt-0 outline-none">
            <div className="rounded-lg border bg-muted/30 p-6 min-h-[200px] flex flex-col items-center justify-center text-center">
              {!aiSummary && !isSummarizing ? (
                <>
                  <Sparkles className="h-10 w-10 text-muted-foreground mb-4 opacity-50" />
                  <p className="text-muted-foreground mb-6 text-sm">Generate an intelligent executive summary of this request's details and justification.</p>
                  <Button onClick={handleGenerateSummary} size="sm">
                    Generate Analysis
                  </Button>
                </>
              ) : isSummarizing ? (
                <div className="flex flex-col items-center text-muted-foreground">
                  <Loader2 className="h-8 w-8 animate-spin mb-4 text-primary" />
                  <p className="text-sm">Agent is analyzing request parameters...</p>
                </div>
              ) : (
                <div className="text-left w-full h-full flex flex-col">
                  <h4 className="font-semibold mb-3 flex items-center gap-2 text-primary">
                    <Sparkles className="h-4 w-4" /> AI Analysis
                  </h4>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{aiSummary}</p>
                  <Button variant="outline" size="sm" onClick={handleGenerateSummary} className="mt-6 self-start bg-background">
                    Regenerate
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* Note the print:hidden class to hide buttons when creating the PDF */}
        <DialogFooter className="flex-row justify-between sm:justify-between mt-4 print:hidden">
          <div className="flex gap-2">
            {canEdit && !editing && (
              <Button variant="outline" size="sm" onClick={startEdit}>
                <Pencil className="h-3.5 w-3.5 mr-1" /> Edit
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={() => handleExport('pdf')}>
              <Download className="h-3.5 w-3.5 mr-1" /> PDF
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleExport('csv')}>
              <Download className="h-3.5 w-3.5 mr-1" /> CSV
            </Button>
          </div>
          <Button variant="ghost" size="sm" onClick={() => handleOpenChange(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}