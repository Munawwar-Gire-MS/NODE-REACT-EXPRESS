import { MongoClient, Db, Document } from 'mongodb';
import { User, Todo, WhitelistedEmail, Representation, RepresentationEvent, CalendarEvent } from '../../shared/schema.js';
import { config } from 'dotenv';
import { MonitoredCollection } from './monitored-collection.js';

let client: MongoClient;
let db: Db;

// Will only affect environment if .env file exists
config();

export async function connectToDatabase() {
  if (db) return db;

  if (!process.env.MONGODB_URI || !process.env.MONGODB_DB_NAME) {
    throw new Error('Please define the MONGODB_URI and MONGODB_DB_NAME environment variables');
  }

  try {
    if (!client) {
      client = new MongoClient(process.env.MONGODB_URI);
      await client.connect();
    }
    
    db = client.db(process.env.MONGODB_DB_NAME);

    // Create indexes for the users collection
    await db.collection('users').createIndex({ username: 1 }, { unique: true });
    
    // Create indexes for the whitelisted emails collection
    await db.collection('whitelistedEmails').createIndex({ email: 1 }, { unique: true });
    
    // Create indexes for the representations collection
    await db.collection('representations').createIndex({ agentId: 1 });
    await db.collection('representations').createIndex({ clientId: 1 });
    
    // Create indexes for the representation events collection
    await db.collection('representationEvents').createIndex({ representationId: 1 });
    await db.collection('representationEvents').createIndex({ createdAt: -1 });
    
    console.log('Connected to database');
    return db;
  } catch (error) {
    console.error('Error connecting to database:', error);
    throw error;
  }
}

// Type-safe collection accessor
export async function getCollection<T extends Document>(collectionName: string) {
  if (!db) {
    await connectToDatabase();
  }
  const collection = db.collection<T>(collectionName);
  return new MonitoredCollection<T>(collection, db);
}

// Helper function to get users collection with proper typing
export function getUsersCollection() {
  return getCollection<User>('users');
}

// Helper function to get whitelisted emails collection with proper typing
export function getWhitelistedEmailsCollection() {
  return getCollection<WhitelistedEmail>('whitelistedEmails');
}

// Helper function to get todos collection with proper typing
export function getTodosCollection() {
  return getCollection<Todo>('todos');
}

// Helper function to get representations collection with proper typing
export function getRepresentationsCollection() {
  return getCollection<Representation>('representations');
}

// Helper function to get representation events collection with proper typing
export function getRepresentationEventsCollection() {
  return getCollection<RepresentationEvent>('representationEvents');
} 

export function getCalendarCollection() {
  return getCollection<CalendarEvent>('calendarEvents');
}
