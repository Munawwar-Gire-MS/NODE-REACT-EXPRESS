import { getUsersCollection } from '../utils/db.js';
import { User } from '../../shared/schema.js';
import bcrypt from 'bcryptjs';

export class UsersService {
  static async createUser(userData: Omit<User, 'id' | 'passwordHash' | 'passwordSalt' | 'createdAt' | 'updatedAt'> & { password?: string }) {
    const collection = await getUsersCollection();
    
    const now = new Date();
    
    // Initialize user object
    const user: Omit<User, '_id'> = {
      username: userData.username,
      role: userData.role,
      name: userData.name,
      avatarUrl: userData.avatarUrl,
      createdAt: now,
      updatedAt: now
    };
    
    // If password is provided, hash it
    if (userData.password) {
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(userData.password, salt);
      user.passwordHash = passwordHash;
      user.passwordSalt = salt;
    }

    const result = await collection.insertOne(user);
    return { ...user, id: result.insertedId.toString() };
  }

  static async findByUsername(username: string) {
    const collection = await getUsersCollection();
    return collection.findOne({ username });
  }

  static async validatePassword(user: User, password: string) {
    // Check if user has password fields
    if (!user.passwordHash || !user.passwordSalt) {
      return false;
    }
    
    return bcrypt.compare(password, user.passwordHash);
  }
} 