import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { User, UserRole, ResourceRequest, Status } from '@/types/models';
// We keep mockUsers to toggle between Alex and Jordan for testing,
// but we remove mockRequests since we will fetch them from the database!
import { mockUsers } from '@/data/mock-data';

const API_BASE_URL = 'http://localhost:8000/api';

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
  
  // Initialize with an empty array instead of mock data
  const [requests, setRequests] = useState<ResourceRequest[]>([]);

  const currentUser: User = role === 'Requester' ? mockUsers[0] : mockUsers[1];

  // 1. Fetch data from FastAPI on component mount
  const fetchRequests = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/requests`);
      if (response.ok) {
        const data = await response.json();
        // Sort by newest first
        const sortedData = data.sort((a: ResourceRequest, b: ResourceRequest) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        setRequests(sortedData);
      } else {
        console.error('Failed to fetch requests from backend');
      }
    } catch (error) {
      console.error('Error connecting to backend:', error);
    }
  }, []);

  // Trigger the fetch when the app loads
  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const toggleRole = useCallback(() => {
    setRole((prev) => (prev === 'Requester' ? 'Approver' : 'Requester'));
  }, []);

  // 2. Send POST request to FastAPI when creating a request
  const addRequest = useCallback(async (req: ResourceRequest) => {
    try {
      // Format payload to match our Pydantic RequestCreate schema
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
        // Add the database-generated request (with real ID and dates) to the UI
        setRequests((prev) => [newRequest, ...prev]);
      } else {
        console.error('Failed to create request');
      }
    } catch (error) {
      console.error('Error adding request:', error);
    }
  }, [currentUser.id]);

    // 3. Send PUT request to FastAPI when approving/rejecting
// 3. Send PUT request to FastAPI when approving/rejecting OR editing
  const updateRequest = useCallback(async (requestId: string, updates: Partial<ResourceRequest>) => {
    try {
      if (updates.status) {
        // --- SCENARIO A: It's a STATUS update (Approver action) ---
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
          // Update the UI with the backend response
          setRequests((prev) =>
            prev.map((r) => (r.requestId === requestId ? updatedRequest : r))
          );
        } else {
          console.error('Failed to update request status');
        }
      } else {
        // --- SCENARIO B: It's a DETAILS update (Requester editing their text) ---
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
          // Update the UI with the backend response
          setRequests((prev) =>
            prev.map((r) => (r.requestId === requestId ? updatedRequest : r))
          );
        } else {
          console.error('Failed to update request details');
        }
      }
    } catch (error) {
      console.error('Error updating request:', error);
    }
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