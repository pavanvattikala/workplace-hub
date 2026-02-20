import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { User, ResourceRequest } from '@/types/models';

const API_BASE_URL = 'http://localhost:8000/api';

export const ALL_USERS: User[] = [
  { id: 'u-1', name: 'Alex (Requester)', email: 'alex@company.com', role: 'Requester' },
  { id: 'u-4', name: 'Sarah (Requester)', email: 'sarah@company.com', role: 'Requester' },
  { id: 'u-2', name: 'Jordan (IT Approver)', email: 'jordan@company.com', role: 'Approver' },
  { id: 'u-3', name: 'Taylor (Facility Approver)', email: 'taylor@company.com', role: 'Approver' },
];

interface AppContextType {
  currentUser: User;
  setCurrentUser: (user: User) => void; 
  requests: ResourceRequest[];
  addRequest: (req: ResourceRequest) => void;
  updateRequest: (requestId: string, updates: Partial<ResourceRequest>) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 1. Initialize with Alex as the default user
  const [currentUser, setCurrentUser] = useState<User>(ALL_USERS[0]);
  
  // 2. Track ALL requests in the system
  const [allRequests, setAllRequests] = useState<ResourceRequest[]>([]);

  // Fetch data from FastAPI on component mount
  const fetchRequests = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/requests`);
      if (response.ok) {
        const data = await response.json();
        const sortedData = data.sort((a: ResourceRequest, b: ResourceRequest) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        setAllRequests(sortedData);
      } else {
        console.error('Failed to fetch requests from backend');
      }
    } catch (error) {
      console.error('Error connecting to backend:', error);
    }
  }, []);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  // Send POST request to FastAPI when creating a request
  const addRequest = useCallback(async (req: ResourceRequest) => {
    try {
      const payload = {
        requesterId: currentUser.id,
        requestType: req.requestType,
        shortDescription: req.shortDescription,
        justification: req.justification,
        priority: req.priority,
        requestedDate: req.requestedDate,
      };

      const response = await fetch(`${API_BASE_URL}/requests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const newRequest = await response.json();
        setAllRequests((prev) => [newRequest, ...prev]);
      } else {
        console.error('Failed to create request');
      }
    } catch (error) {
      console.error('Error adding request:', error);
    }
  }, [currentUser.id]);

  // Send PUT request to FastAPI when approving/rejecting OR editing
  const updateRequest = useCallback(async (requestId: string, updates: Partial<ResourceRequest>) => {
    try {
      if (updates.status) {
        // SCENARIO A: STATUS update (Approver action)
        const payload = {
          status: updates.status,
          handlerComments: updates.handlerComments || null,
        };

        const response = await fetch(`${API_BASE_URL}/requests/${requestId}/status`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (response.ok) {
          const updatedRequest = await response.json();
          setAllRequests((prev) =>
            prev.map((r) => (r.requestId === requestId ? updatedRequest : r))
          );
        }
      } else {
        // SCENARIO B: DETAILS update (Requester editing their text)
        const payload = {
          shortDescription: updates.shortDescription,
          justification: updates.justification,
          priority: updates.priority,
        };

        const response = await fetch(`${API_BASE_URL}/requests/${requestId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (response.ok) {
          const updatedRequest = await response.json();
          setAllRequests((prev) =>
            prev.map((r) => (r.requestId === requestId ? updatedRequest : r))
          );
        }
      }
    } catch (error) {
      console.error('Error updating request:', error);
    }
  }, []);

  // --- NEW FEATURE: Filter requests based on who is logged in ---
  const visibleRequests = currentUser.role === 'Approver'
    // Approvers only see what is assigned to them
    ? allRequests.filter((req) => req.assignedApproverId === currentUser.id)
    // Requesters only see what they created
    : allRequests.filter((req) => req.requesterId === currentUser.id);

  return (
    <AppContext.Provider value={{ currentUser, setCurrentUser, requests: visibleRequests, addRequest, updateRequest }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppContext must be used within AppProvider');
  return ctx;
};