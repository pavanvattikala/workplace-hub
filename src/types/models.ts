export enum RequestType {
  SYSTEM_ACCESS = 'System Access',
  EQUIPMENT = 'Equipment',
  FACILITY = 'Facility',
  GENERAL_SERVICE = 'General Service',
}

export enum Priority {
  LOW = 'Low',
  MEDIUM = 'Medium',
  HIGH = 'High',
}

export enum Status {
  SUBMITTED = 'Submitted',
  UNDER_REVIEW = 'Under Review',
  APPROVED = 'Approved',
  REJECTED = 'Rejected',
  FULFILLED = 'Fulfilled',
  CLOSED = 'Closed',
}

export type UserRole = 'Requester' | 'Approver';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface ResourceRequest {
  requestId: string;
  requesterId: string;
  requestType: RequestType;
  assignedApproverId?: string;
  shortDescription: string;
  justification: string;
  priority: Priority;
  requestedDate: string;
  targetResolutionDate: string;
  status: Status;
  createdAt: string;
  updatedAt: string;
  handlerComments?: string;
}
