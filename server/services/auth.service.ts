import bcrypt from 'bcryptjs';
import { getUsersCollection } from '../utils/db.js';
import { createSessionToken, verifySessionToken } from '../utils/session.js';
import { ObjectId } from 'mongodb';
import { User } from '../../shared/schema.js';
import { WhitelistedEmailsService } from './whitelisted-emails.service.js';
import { RepresentationService } from './representation.service.js';

// Add a simple in-memory cache
const userCache = new Map<string, { user: User, timestamp: number }>();
const CACHE_TTL = 30 * 1000; // 30 seconds; really only for dev where react doubles requests

export class AuthService {
  static async authenticateUser(username: string, password: string) {
    const collection = await getUsersCollection();
    
    const user = await collection.findOne({ username });
    if (!user) {
      throw new Error('User not found');
    }

    // Check if user has password fields
    if (!user.passwordHash || !user.passwordSalt) {
      throw new Error('User has not set a password yet. Please use the magic link to set your password.');
    }

    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
      throw new Error('Invalid password');
    }

    // Create session token
    const token = createSessionToken(user);
    
    return { user, token };
  }

  static async registerUser(email: string, password: string, registrationCode: string, name: string) {
    // Check if email is whitelisted and code matches
    const whitelistedEmail = await WhitelistedEmailsService.findByEmail(email);
    if (!whitelistedEmail) {
      throw new Error('Email is not whitelisted for registration');
    }

    // Verify registration code matches
    if (whitelistedEmail.registrationCode !== registrationCode) {
      throw new Error('Invalid registration code');
    }

    // Get user type from whitelist
    const userType = whitelistedEmail.userType;
    if (!userType) {
      throw new Error('User type not found for whitelisted email');
    }

    // Check if user already exists
    const collection = await getUsersCollection();
    const existingUser = await collection.findOne({ username: email });
    
    if (existingUser) {
      // User exists but doesn't have a password yet
      if (!existingUser.passwordHash || !existingUser.passwordSalt) {
        // Parse name into first and last
        const nameParts = name.split(' ');
        const firstName = nameParts[0];
        const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';

        // Generate salt and hash password
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);
        
        // Update the user with password and name
        const now = new Date();
        await collection.updateOne(
          { _id: existingUser._id },
          { 
            passwordHash, 
            passwordSalt: salt,
            name: {
              first: firstName,
              last: lastName
            },
            updatedAt: now
          }
        );

        // If this is a client user, update their representation status from pending to active
        if (userType === 'client' && existingUser._id) {
          try {
            // Find all pending representations for this client and update them to active
            const clientId = existingUser._id;
            const representations = await RepresentationService.getRepresentationsByClientId(clientId);
            
            for (const representation of representations) {
              await RepresentationService.updateRepresentation(
                representation._id,
                { status: 'active' },
                clientId
              );
            }
          } catch (error) {
            console.error('Error updating representation status:', error);
            // Don't throw - we still want the user to be able to register
          }
        }

        // Create session token
        const updatedUser = { 
          ...existingUser, 
          passwordHash, 
          passwordSalt: salt,
          name: {
            first: firstName,
            last: lastName
          },
          updatedAt: now 
        };
        const token = createSessionToken(updatedUser);

        return { user: updatedUser, token };
      } else {
        throw new Error('User already exists');
      }
    }

    // Parse name into first and last
    const nameParts = name.split(' ');
    const firstName = nameParts[0];
    const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';

    // Create the user
    const now = new Date();
    const user: Omit<User, '_id'> = {
      username: email,
      role: userType,
      name: {
        first: firstName,
        last: lastName
      },
      createdAt: now,
      updatedAt: now
    };

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    user.passwordHash = passwordHash;
    user.passwordSalt = salt;

    // Insert user into database
    const result = await collection.insertOne(user);
    const insertedUser = { ...user, _id: result.insertedId };

    // If this is a client user, update their representation status from pending to active
    if (userType === 'client' && insertedUser._id) {
      try {
        // Find all pending representations for this client and update them to active
        const clientId = insertedUser._id;
        const representations = await RepresentationService.getRepresentationsByClientId(clientId);
        
        for (const representation of representations) {
          await RepresentationService.updateRepresentation(
            representation._id,
            { status: 'active' },
            clientId
          );
        }
      } catch (error) {
        console.error('Error updating representation status on new user:', error);
        // Don't throw - we still want the user to be able to register
      }
    }

    // Create session token
    const token = createSessionToken(insertedUser);

    return { user: insertedUser, token };
  }

  static async getUserFromToken(token: string) {
    const payload = verifySessionToken(token);
    if (!payload) return null;

    // Check cache first
    const cached = userCache.get(payload.userId);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return cached.user;
    }

    // If not in cache, fetch from database
    const collection = await getUsersCollection();
    const user = await collection.findOne({ _id: new ObjectId(payload.userId) });
    
    // Store in cache
    if (user) {
      userCache.set(payload.userId, { user, timestamp: Date.now() });
    }
    
    return user;
  }

  /**
   * Hash a password using bcrypt
   */
  static async hashPassword(password: string): Promise<{ passwordHash: string; passwordSalt: string }> {
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    return { passwordHash, passwordSalt: salt };
  }
} 