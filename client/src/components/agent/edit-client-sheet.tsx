import React, { useState, useEffect } from 'react';
import { Representation } from '../../../../shared/schema.js'; // Removed User import
import { RosterEntry } from '@/pages/agent/roster'; // Import the type
import { useToast } from "@/hooks/use-toast";
import { X } from 'lucide-react';
import { format, parseISO } from 'date-fns'; // For date handling

interface EditClientSheetProps {
  isOpen: boolean;
  onClose: (updated?: boolean) => void;
  clientData: RosterEntry | null;
}

// List of possible values for representation type (as per requirements)
const representationTypeOptions = [
    "Theatrical", 
    "Commercial", 
    "VO", 
    "Theatrical, Commercial", 
    "Theatrical, VO"
];

// List of possible values for status (active ones, excluding inactive/pending)
const statusOptions: Representation['status'][] = [
    'active', 
    'on_set', 
    'away', 
    'on_hold'
];

export function EditClientSheet({ isOpen, onClose, clientData }: EditClientSheetProps) {
  const [formData, setFormData] = useState<Partial<Omit<Representation, '_id' | 'agentId' | 'clientId' | 'createdAt'>>>({});
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    if (clientData) {
      // Initialize form data from the selected client
      const initialData: Partial<Omit<Representation, '_id' | 'agentId' | 'clientId' | 'createdAt'>> = {
        status: clientData.status,
        nextKeyDate: clientData.nextKeyDate ? new Date(clientData.nextKeyDate) : undefined,
        notes: clientData.notes,
        terms: clientData.terms ? { ...clientData.terms } : {
          commission: 10, // Default values if terms don't exist
          exclusivity: false,
          territories: ['US'],
          mediaTypes: ['Theatrical']
        },
      };
      setFormData(initialData);
      setClientName(clientData.client ? `${clientData.client.name.first} ${clientData.client.name.last}` : 'N/A');
      setClientEmail(clientData.client?.username ?? 'N/A');
    } else {
      // Reset form when no client is selected or sheet is closed
      setFormData({});
      setClientName("");
      setClientEmail("");
    }
  }, [clientData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      // Parse the date string from input type=date
      setFormData(prev => ({ ...prev, [name]: value ? parseISO(value) : undefined }));
  };

  const handleMediaTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const selectedType = e.target.value;
      // Split the combined string back into an array
      const mediaTypes = selectedType ? selectedType.split(', ').map(s => s.trim()) : [];
      setFormData(prev => ({ 
          ...prev, 
          terms: { 
              ...(prev.terms || { commission: 0, exclusivity: false, territories: [] }), // Ensure terms exists
              mediaTypes 
          } 
      }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientData?._id) return;
    setIsSubmitting(true);

    // Filter out any fields that haven't actually changed?
    // For simplicity now, we send the current state of the form
    
    // Prepare only the changed fields (optional, but good practice)
    const payload: Partial<Omit<Representation, '_id' | 'agentId' | 'clientId' | 'createdAt'>> = {};
    if (formData.status !== clientData.status) payload.status = formData.status;
    if (formData.nextKeyDate?.toISOString() !== clientData.nextKeyDate?.toString()) payload.nextKeyDate = formData.nextKeyDate;
    if (formData.notes !== clientData.notes) payload.notes = formData.notes;
    // Basic check for terms changes - could be more granular
    if (JSON.stringify(formData.terms) !== JSON.stringify(clientData.terms)) payload.terms = formData.terms;

    if (Object.keys(payload).length === 0) {
        showToast({ title: "Info", description: "No changes detected." });
        setIsSubmitting(false);
        return;
    }

    try {
      const response = await fetch(`/api/roster/${clientData._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload), // Send only changed data
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to update client');
      }

      showToast({ title: "Success", description: "Client details updated" });
      onClose(true); // Indicate that an update happened
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An unknown error occurred';
      showToast({ title: "Error", description: message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Format date for input type="date"
  const formatDateForInput = (date: Date | undefined): string => {
    return date ? format(date, 'yyyy-MM-dd') : '';
  };
  
  // Format representation type for select value
  const formatMediaTypeForSelect = (mediaTypes: string[] | undefined): string => {
      return mediaTypes ? mediaTypes.join(', ') : '';
  };

  return (
    <div 
      className={`fixed inset-y-0 right-0 z-50 w-full max-w-lg bg-white shadow-xl transform transition-transform ease-in-out duration-300 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-client-title"
    >
      <div className="flex flex-col h-full">
        {/* Header */} 
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 id="edit-client-title" className="text-lg font-medium text-gray-900">
            Edit Client: {clientName}
          </h2>
          <button
            onClick={() => onClose()} 
            className="p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            <span className="sr-only">Close panel</span>
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Form Body */} 
        <div className="flex-1 overflow-y-auto p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Read-only fields */} 
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input 
                type="text" 
                value={clientEmail} 
                readOnly 
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100 text-gray-500 cursor-not-allowed"
              />
            </div>

            {/* Editable fields */} 
            <div>
              <label htmlFor="nextKeyDate" className="block text-sm font-medium text-gray-700">Next Key Date</label>
              <input 
                type="date" 
                id="nextKeyDate"
                name="nextKeyDate"
                value={formatDateForInput(formData.nextKeyDate)}
                onChange={handleDateChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
              />
            </div>

            <div>
              <label htmlFor="representationType" className="block text-sm font-medium text-gray-700">Representation Type</label>
              <select
                id="representationType"
                name="representationType" // This name isn't directly used in formData state structure, but good for semantics
                value={formatMediaTypeForSelect(formData.terms?.mediaTypes)}
                onChange={handleMediaTypeChange}
                className="mt-1 block w-full pl-3 px-3 pr-10 py-2 border border-gray-300 shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md"
              >
                <option value="">Select Type</option>
                {representationTypeOptions.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            
             <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700">Status</label>
              <select
                id="status"
                name="status"
                value={formData.status ?? ''}
                onChange={handleInputChange}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md"
              >
                {statusOptions.map(status => (
                  <option key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700">Additional Comments / Notes</label>
              <textarea
                id="notes"
                name="notes"
                rows={4}
                value={formData.notes ?? ''}
                onChange={handleInputChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
              />
            </div>
            
            {/* Action Buttons */} 
            <div className="pt-4 border-t border-gray-200 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => onClose()}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary/50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 