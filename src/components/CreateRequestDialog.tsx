import { useState } from 'react';
import { format } from 'date-fns';
import { useAppContext } from '@/hooks/useAppContext';
import { RequestType, Priority, Status } from '@/types/models';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface CreateRequestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateRequestDialog({ open, onOpenChange }: CreateRequestDialogProps) {
  const { addRequest, requests } = useAppContext();
  const [type, setType] = useState<RequestType>(RequestType.SYSTEM_ACCESS);
  const [description, setDescription] = useState('');
  const [justification, setJustification] = useState('');
  const [priority, setPriority] = useState<Priority>(Priority.MEDIUM);
  const [requestedDate, setRequestedDate] = useState<Date | undefined>();

  const resetForm = () => {
    setType(RequestType.SYSTEM_ACCESS);
    setDescription('');
    setJustification('');
    setPriority(Priority.MEDIUM);
    setRequestedDate(undefined);
  };

  const handleSubmit = () => {
    if (!description.trim() || !justification.trim() || !requestedDate) {
      toast.error('Please fill all required fields.');
      return;
    }

    const nextId = `REQ-${1001 + requests.length}`;
    const now = new Date().toISOString();
    const target = new Date(requestedDate);
    target.setDate(target.getDate() + 7);

    addRequest({
      requestId: nextId,
      requesterId: 'u-1',
      requestType: type,
      shortDescription: description,
      justification,
      priority,
      requestedDate: requestedDate.toISOString(),
      targetResolutionDate: target.toISOString(),
      status: Status.SUBMITTED,
      createdAt: now,
      updatedAt: now,
    });

    toast.success(`Request ${nextId} created successfully!`);
    resetForm();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>New Resource Request</DialogTitle>
          <DialogDescription>Submit a new workplace resource request.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label>Request Type</Label>
            <Select value={type} onValueChange={(v) => setType(v as RequestType)}>
              <SelectTrigger className="bg-card"><SelectValue /></SelectTrigger>
              <SelectContent className="bg-popover">
                {Object.values(RequestType).map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>Short Description *</Label>
            <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Brief summary of what you need" />
          </div>

          <div className="space-y-1.5">
            <Label>Detailed Justification *</Label>
            <Textarea value={justification} onChange={(e) => setJustification(e.target.value)} placeholder="Why do you need this resource?" rows={3} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Priority</Label>
              <Select value={priority} onValueChange={(v) => setPriority(v as Priority)}>
                <SelectTrigger className="bg-card"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-popover">
                  {Object.values(Priority).map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>Requested Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !requestedDate && "text-muted-foreground")}>
                    <CalendarIcon className="h-4 w-4 mr-2" />
                    {requestedDate ? format(requestedDate, 'PPP') : 'Pick a date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-popover" align="start">
                  <Calendar mode="single" selected={requestedDate} onSelect={setRequestedDate} className="p-3 pointer-events-auto" />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSubmit}>Submit Request</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
