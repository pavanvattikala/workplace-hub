import { ResourceRequest, RequestType, Priority, Status, User } from '@/types/models';


export const mockUsers: User[] = [
  { id: 'u-1', name: 'Alex (Requester)', email: 'alex@company.com', role: 'Requester' },
  { id: 'u-4', name: 'Sarah (Requester)', email: 'sarah@company.com', role: 'Requester' },
  { id: 'u-2', name: 'Jordan (IT Approver)', email: 'jordan@company.com', role: 'Approver' },
  { id: 'u-3', name: 'Taylor (Facility Approver)', email: 'taylor@company.com', role: 'Approver' },
];