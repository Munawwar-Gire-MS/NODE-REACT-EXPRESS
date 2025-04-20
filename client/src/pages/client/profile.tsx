import { useState, useEffect } from "react";
import ClientLayout from "./layout";
import { useAuth } from "@/contexts/auth";
import { useToast } from "@/hooks/use-toast";
import { Toast } from "@/components/toast";

interface ProfileData {
  chestSize?: string;
  waistSize?: string;
  shoeSize?: string;
  unionAffiliation?: string;
  talentDivision?: string;
  vaccinationStatus?: string;
  ageRange?: string;
  ethnicAppearance?: string;
  gender?: string;
  hairColor?: string;
  height?: string;
  weight?: string;
  eyeColor?: string;
  dateOfBirth?: string;
  phone?: string;
  email?: string;
  representation?: string;
  location?: string;
  handedness?: string;
  allergies?: string;
  additionalNeeds?: string;
}

export default function ClientProfile() {
  const { user } = useAuth();
  const { showToast, toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [profileData, setProfileData] = useState<ProfileData>({});
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  // Fetch profile data
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch('/api/client/profile');
        
        if (!response.ok) {
          throw new Error('Failed to fetch profile data');
        }

        const data = await response.json();
        setProfileData(data.data.profile || {});
        setFirstName(data.data.name?.first || "");
        setLastName(data.data.name?.last || "");
      } catch (error) {
        console.error('Error fetching profile:', error);
        showToast({
          title: "Error",
          description: "Failed to load profile data",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [showToast]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/client/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          profile: profileData,
          name: {
            first: firstName,
            last: lastName
          }
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      showToast({
        title: "Success",
        description: "Profile updated successfully"
      });
      
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      showToast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive"
      });
    }
  };

  if (isLoading) {
    return (
      <ClientLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </ClientLayout>
    );
  }

  return (
    <ClientLayout>
      <div className="space-y-4">
        <div className="flex justify-between items-center bg-[#F9F5FF] p-4 rounded-lg">
          <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="bg-[#6941C6] text-white px-4 py-2 rounded-md hover:bg-[#8B5CF6] transition-colors"
            >
              Edit Profile
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              className="bg-[#6941C6] text-white px-4 py-2 rounded-md hover:bg-[#8B5CF6] transition-colors"
            >
              Save Profile
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Profile Photo Section */}
          <div className="md:col-span-1">
            <div className="mb-4">
              <img 
                src="/images/tf-logo.png" 
                alt="Profile" 
                className="w-full aspect-square object-contain rounded-md border border-gray-300 bg-gray-50 p-2"
              />
            </div>
            
            <div className={isEditing ? "" : "opacity-50"}>
              <input
                type="text"
                name="firstName"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                disabled={!isEditing}
                className="w-full p-2 border border-gray-300 rounded-md mb-2"
                placeholder="First Name"
              />
              
              <input
                type="text"
                name="lastName"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                disabled={!isEditing}
                className="w-full p-2 border border-gray-300 rounded-md mb-2"
                placeholder="Last Name"
              />
              
              <input
                type="text"
                name="dateOfBirth"
                value={profileData.dateOfBirth || ""}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="w-full p-2 border border-gray-300 rounded-md mb-2"
                placeholder="Date of Birth (MM/DD/YYYY)"
              />
              
              <input
                type="text"
                name="phone"
                value={profileData.phone || ""}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="w-full p-2 border border-gray-300 rounded-md mb-2"
                placeholder="Phone"
              />
              
              <input
                type="text"
                name="email"
                value={profileData.email || user?.username || ""}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="w-full p-2 border border-gray-300 rounded-md mb-2"
                placeholder="Email"
              />
              
              <input
                type="text"
                name="representation"
                value={profileData.representation || ""}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="w-full p-2 border border-gray-300 rounded-md mb-2"
                placeholder="Representation"
              />
              
              <input
                type="text"
                name="location"
                value={profileData.location || ""}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="w-full p-2 border border-gray-300 rounded-md mb-2"
                placeholder="Location"
              />
            </div>
          </div>

          {/* Main Profile Content */}
          <div className="md:col-span-3">
            <div className="space-y-6">
              {/* Body Measurements */}
              <div className="bg-white p-4 rounded-md shadow-sm border border-gray-200">
                <h2 className="text-lg font-semibold mb-4">Body Measurements</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Chest Size</label>
                    <input
                      type="text"
                      name="chestSize"
                      value={profileData.chestSize || ""}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Waist Size</label>
                    <input
                      type="text"
                      name="waistSize"
                      value={profileData.waistSize || ""}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Shoe Size</label>
                    <input
                      type="text"
                      name="shoeSize"
                      value={profileData.shoeSize || ""}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    />
                  </div>
                </div>
              </div>

              {/* Professional Information */}
              <div className="bg-white p-4 rounded-md shadow-sm border border-gray-200">
                <h2 className="text-lg font-semibold mb-4">Professional Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Union Affiliation</label>
                    <select
                      name="unionAffiliation"
                      value={profileData.unionAffiliation || ""}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    >
                      <option value="">Select Union</option>
                      <option value="SAG-AFTRA">SAG-AFTRA</option>
                      <option value="AEA">AEA</option>
                      <option value="Non-Union">Non-Union</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Talent Division</label>
                    <input
                      type="text"
                      name="talentDivision"
                      value={profileData.talentDivision || ""}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    />
                  </div>
                </div>
              </div>

              {/* Physical Attributes */}
              <div className="bg-white p-4 rounded-md shadow-sm border border-gray-200">
                <h2 className="text-lg font-semibold mb-4">Physical Attributes</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Vaccination Status</label>
                    <select
                      name="vaccinationStatus"
                      value={profileData.vaccinationStatus || ""}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    >
                      <option value="">Select Status</option>
                      <option value="Fully Vaccinated">Fully Vaccinated</option>
                      <option value="Partially Vaccinated">Partially Vaccinated</option>
                      <option value="Not Vaccinated">Not Vaccinated</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Age Range</label>
                    <input
                      type="text"
                      name="ageRange"
                      value={profileData.ageRange || ""}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Ethnic Appearance</label>
                    <input
                      type="text"
                      name="ethnicAppearance"
                      value={profileData.ethnicAppearance || ""}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                    <input
                      type="text"
                      name="gender"
                      value={profileData.gender || ""}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Hair Color</label>
                    <input
                      type="text"
                      name="hairColor"
                      value={profileData.hairColor || ""}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Height</label>
                    <input
                      type="text"
                      name="height"
                      value={profileData.height || ""}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Weight</label>
                    <input
                      type="text"
                      name="weight"
                      value={profileData.weight || ""}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Eye Color</label>
                    <input
                      type="text"
                      name="eyeColor"
                      value={profileData.eyeColor || ""}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    />
                  </div>
                </div>
              </div>

              {/* Additional Information */}
              <div className="bg-white p-4 rounded-md shadow-sm border border-gray-200">
                <h2 className="text-lg font-semibold mb-4">Additional Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Handedness</label>
                    <select
                      name="handedness"
                      value={profileData.handedness || ""}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    >
                      <option value="">Select Handedness</option>
                      <option value="Right-handed">Right-handed</option>
                      <option value="Left-handed">Left-handed</option>
                      <option value="Ambidextrous">Ambidextrous</option>
                    </select>
                  </div>
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Allergies</label>
                  <textarea
                    name="allergies"
                    value={profileData.allergies || ""}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    rows={3}
                    className="w-full p-2 border border-gray-300 rounded-md resize-none"
                    placeholder="List any allergies or write 'None'"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Additional On-Set Needs</label>
                  <textarea
                    name="additionalNeeds"
                    value={profileData.additionalNeeds || ""}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    rows={3}
                    className="w-full p-2 border border-gray-300 rounded-md resize-none"
                    placeholder="List any special requirements or write 'No specific requirements'"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Toast toast={toast} />
    </ClientLayout>
  );
} 