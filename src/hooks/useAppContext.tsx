import React, { createContext, useContext, useState, useCallback } from 'react';
import { User, UserRole, ResourceRequest, Status } from '@/types/models';
import { mockUsers, mockRequests } from '@/data/mock-data';

interface AppContextType {
  currentUser: User;
  toggleRole: () => void;
  requests: ResourceRequest[];
  addRequest: (req: ResourceRequest) => void;
  updateRequest: (requestId: string, updates: Partial<ResourceRequest>) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [role, setRole] = useState<UserRole>('Requester');
  const [requests, setRequests] = useState<ResourceRequest[]>(mockRequests);

  const currentUser: User = role === 'Requester' ? mockUsers[0] : mockUsers[1];

  const toggleRole = useCallback(() => {
    setRole((prev) => (prev === 'Requester' ? 'Approver' : 'Requester'));
  }, []);

  const addRequest = useCallback((req: ResourceRequest) => {
    setRequests((prev) => [req, ...prev]);
  }, []);

  const updateRequest = useCallback((requestId: string, updates: Partial<ResourceRequest>) => {
    setRequests((prev) =>
      prev.map((r) =>
        r.requestId === requestId ? { ...r, ...updates, updatedAt: new Date().toISOString() } : r
      )
    );
  }, []);

  return (
    <AppContext.Provider value={{ currentUser, toggleRole, requests, addRequest, updateRequest }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppContext must be used within AppProvider');
  return ctx;
};
