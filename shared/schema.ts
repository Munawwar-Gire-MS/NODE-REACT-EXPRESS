import { ObjectId } from 'mongodb';

export interface User {
  _id?: ObjectId;        // Changed from id: string
  username: string;      // Unique username for login
  passwordHash?: string;   // Hashed password (we'll use bcrypt)
  passwordSalt?: string;   // Salt used for hashing
  role: 'agent' | 'client';
  name: {
    first: string;
    last: string;
  };
  avatarUrl?: string;     // Optional avatar image URL
  createdAt: Date;
  updatedAt: Date;
  
  // Client Profile Fields
  profile?: {
    // Body Measurements
    chestSize?: string;
    waistSize?: string;
    shoeSize?: string;
    
    // Professional Information
    unionAffiliation?: string; // e.g., "SAG-AFTRA"
    talentDivision?: string; // e.g., "Actor"
    
    // Physical Attributes
    vaccinationStatus?: string; // e.g., "Fully Vaccinated"
    ageRange?: string; // e.g., "25-35"
    ethnicAppearance?: string; // e.g., "Caucasian"
    gender?: string; // e.g., "Female"
    hairColor?: string; // e.g., "Blonde"
    height?: string; // e.g., "5'7"
    weight?: string; // e.g., "130"
    eyeColor?: string; // e.g., "Blue"
    
    // Contact & Personal Info
    dateOfBirth?: string; // e.g., "05/15/1990"
    phone?: string; // e.g., "(555) 123-4567"
    email?: string; // e.g., "jane.smith@example.com"
    representation?: string; // e.g., "Creative Artists Agency"
    location?: string; // e.g., "Los Angeles, CA"
    
    // Additional Information
    handedness?: string; // e.g., "Right-handed"
    allergies?: string; // e.g., "None"
    additionalNeeds?: string; // e.g., "No specific requirements"
  };
}

export interface WhitelistedEmail {
  _id?: ObjectId;
  email: string;         // Email address that is allowed to register
  userType: 'agent' | 'client'; // Type of user this email is allowed to register as
  registrationCode: string; // Unique registration code for this email
  createdAt: Date;
  updatedAt: Date;
}

export interface Todo {
  _id?: ObjectId;
  userId: ObjectId;
  text: string;
  dueDate: Date;
  status: 'todo' | 'doing' | 'done';
  createdAt: Date;
  updatedAt: Date;
}

export interface Representation {
  _id?: ObjectId;
  agentId: ObjectId;
  clientId: ObjectId;
  status: 'active' | 'on_set' | 'away' | 'on_hold' | 'inactive' | 'pending';
  startDate: Date;
  endDate?: Date;
  nextKeyDate?: Date;
  notes?: string;
  terms?: {
    commission: number;
    exclusivity: boolean;
    territories: string[];
    mediaTypes: string[];
  };
  createdAt: Date;
  updatedAt: Date;
}

export type RepresentationFieldValue = 
  | string 
  | number 
  | boolean 
  | string[] 
  | Date 
  | { commission: number; exclusivity: boolean; territories: string[]; mediaTypes: string[] };

export interface RepresentationEvent {
  _id?: ObjectId;
  representationId: ObjectId;
  type: 'meeting' | 'call' | 'email' | 'submission' | 'audition' | 'other' | 'created' | 'updated' | 'status_changed' | 'terms_updated' | 'ended' | 'archived';
  title: string;
  description: string;
  date: Date;
  location?: string;
  attendees?: string[];
  notes?: string;
  changes?: {
    field: keyof Representation | keyof Representation['terms'];
    oldValue: RepresentationFieldValue | Representation['terms'];
    newValue: RepresentationFieldValue | Representation['terms'];
  }[];
  metadata?: Record<string, string | number | boolean | Date>;
  createdBy: ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface CalendarEvent {
  _id?: ObjectId;
  title: string;
  description: string;
  startDateTime: Date;
  endDateTime: Date;
  isMultiDay: boolean;
  location?: string;
  type: 'booked_out' | 'on_set' | 'episode_airing' | 'premiere' | 'callback' | 'audition' | 'class_workshop' | 'agency_meeting' | 'availability_hold' | 'pinned' | 'deadline' | 'other';
  createdBy: ObjectId; // User who created the event
  ownerId: ObjectId;   // User who owns the calendar (client)
  visibility: {
    type: 'private' | 'selected_agents';
    agentIds?: ObjectId[]; // Only used when type is 'selected_agents'
  };
  status: 'active' | 'deleted';
  createdAt: Date;
  updatedAt: Date;
} 