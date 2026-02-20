import { useState } from 'react';
import { useAppContext } from '@/hooks/useAppContext';
import { RequestType, Priority, Status, ResourceRequest } from '@/types/models';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

interface CreateRequestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateRequestDialog({ open, onOpenChange }: CreateRequestDialogProps) {
  const { addRequest, requests, currentUser } = useAppContext();
  const [type, setType] = useState<RequestType>(RequestType.SYSTEM_ACCESS);
  const [description, setDescription] = useState('');
  const [justification, setJustification] = useState('');
  const [priority, setPriority] = useState<Priority>(Priority.MEDIUM);

  const resetForm = () => {
    setType(RequestType.SYSTEM_ACCESS);
    setDescription('');
    setJustification('');
    setPriority(Priority.MEDIUM);
  };

  const handleSubmit = () => {
    if (!description.trim() || !justification.trim()) {
      toast.error('Please fill all required fields.');
      return;
    }

    // Automatically use the exact current date/time
    const today = new Date();
    const now = today.toISOString();
    
    // Calculate target date locally to satisfy frontend types 
    // (FastAPI backend will overwrite this with its own calculation)
    const target = new Date(today);
    let noOfDatesToMove = 7;
    if (priority === Priority.HIGH) noOfDatesToMove = 3;
    else if (priority === Priority.LOW) noOfDatesToMove = 14;
    target.setDate(target.getDate() + noOfDatesToMove);

    // Temp ID to satisfy TypeScript (FastAPI backend will generate the real DB ID)
    const tempId = `REQ-${1001 + requests.length}`;

    // Pass the request to context
    addRequest({
      requestId: tempId,
      requesterId: currentUser?.id || 'u-1',
      requestType: type,
      shortDescription: description,
      justification,
      priority,
      requestedDate: now,
      targetResolutionDate: target.toISOString(),
      status: Status.SUBMITTED,
      createdAt: now,
      updatedAt: now,
    } as ResourceRequest);

    toast.success('Request created successfully!');
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

          <div className="space-y-1.5">
            <Label>Priority</Label>
            <Select value={priority} onValueChange={(v) => setPriority(v as Priority)}>
              <SelectTrigger className="bg-card"><SelectValue /></SelectTrigger>
              <SelectContent className="bg-popover">
                {Object.values(Priority).map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
              </SelectContent>
            </Select>
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