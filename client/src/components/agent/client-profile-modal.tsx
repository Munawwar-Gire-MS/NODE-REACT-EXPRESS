import { X } from 'lucide-react';
import { User } from '../../../../shared/schema.js';

interface ClientProfileModalProps {
  client: User | null;
  onClose: () => void;
}

export function ClientProfileModal({ client, onClose }: ClientProfileModalProps) {
  if (!client) return null;

  const fullName = `${client.name.first} ${client.name.last}`;
  const profileData = client.profile || {};

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-bold">{fullName}</h2>
          <button 
            onClick={onClose} 
            className="text-gray-500 hover:text-gray-700 focus:outline-none"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6">
          <div className="flex flex-col md:flex-row gap-8">
            <div className="md:w-1/3">
              <h3 className="text-lg font-semibold mb-2">Actor Profile</h3>
              
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-1">Contact Information</h4>
                  <p className="text-sm mb-1">
                    <span className="font-medium">Email:</span> {client.username}
                  </p>
                  <p className="text-sm mb-1">
                    <span className="font-medium">Phone:</span> {profileData.phone || 'Not specified'}
                  </p>
                  <p className="text-sm mb-1">
                    <span className="font-medium">Location:</span> {profileData.location || 'Not specified'}
                  </p>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-1">Physical Characteristics</h4>
                  <p className="text-sm mb-1">
                    <span className="font-medium">Age Range:</span> {profileData.ageRange || 'Not specified'}
                  </p>
                  <p className="text-sm mb-1">
                    <span className="font-medium">Height:</span> {profileData.height || 'Not specified'}
                  </p>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-1">Professional</h4>
                  <p className="text-sm mb-1">
                    <span className="font-medium">Union Status:</span> {profileData.unionAffiliation || 'Not specified'}
                  </p>
                  <p className="text-sm mb-1">
                    <span className="font-medium">Skills:</span> Acting{profileData.talentDivision ? `, ${profileData.talentDivision}` : ''}
                  </p>
                  <p className="text-sm mb-1">
                    <span className="font-medium">Languages:</span> English
                  </p>
                </div>
              </div>
            </div>
            
            <div className="md:w-2/3">
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">Recent Credits</h3>
                <p className="text-sm text-gray-500 italic">To be implemented</p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-2">Send Message</h3>
                <textarea 
                  placeholder="Type your message..." 
                  className="w-full p-3 border border-gray-300 rounded-md resize-none h-32 mb-3"
                  disabled
                />
                <button 
                  className="w-full bg-[#6941C6] text-white py-2 rounded-md hover:bg-[#8B5CF6] transition-colors opacity-60 cursor-not-allowed"
                  disabled
                >
                  Send Message
                </button>
                <p className="text-xs text-gray-500 mt-1 text-center">Messaging functionality coming soon</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 