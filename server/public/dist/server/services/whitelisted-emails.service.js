import { getWhitelistedEmailsCollection } from '../utils/db.js';
import { generateRegistrationCode } from '../utils/registration.js';
export class WhitelistedEmailsService {
    static async findByEmail(email) {
        const collection = await getWhitelistedEmailsCollection();
        return collection.findOne({ email });
    }
    static async createWhitelistedEmail(email, userType) {
        const collection = await getWhitelistedEmailsCollection();
        // Check if email already exists
        const existing = await this.findByEmail(email);
        if (existing) {
            return existing;
        }
        const now = new Date();
        // Generate a registration code using ObjectId
        const registrationCode = generateRegistrationCode();
        const whitelistedEmail = {
            email,
            userType,
            registrationCode,
            createdAt: now,
            updatedAt: now
        };
        const result = await collection.insertOne(whitelistedEmail);
        return { ...whitelistedEmail, _id: result.insertedId };
    }
    /**
     * Add an email to the whitelist with a specific registration code
     * @param email The email to whitelist
     * @param userType The type of user (agent or client)
     * @param registrationCode The registration code to use
     * @returns The created whitelisted email
     */
    static async addEmail(email, userType, registrationCode) {
        const collection = await getWhitelistedEmailsCollection();
        // Check if email already exists
        const existing = await this.findByEmail(email);
        if (existing) {
            // Update the existing entry with the new registration code
            const now = new Date();
            await collection.updateOne({ _id: existing._id }, {
                registrationCode,
                updatedAt: now
            });
            return { ...existing, registrationCode, updatedAt: now };
        }
        const now = new Date();
        const whitelistedEmail = {
            email,
            userType,
            registrationCode,
            createdAt: now,
            updatedAt: now
        };
        const result = await collection.insertOne(whitelistedEmail);
        return { ...whitelistedEmail, _id: result.insertedId };
    }
    static async isEmailWhitelisted(email) {
        const whitelistedEmail = await this.findByEmail(email);
        return !!whitelistedEmail;
    }
    static async getUserTypeForEmail(email) {
        const whitelistedEmail = await this.findByEmail(email);
        return whitelistedEmail?.userType || null;
    }
    static async getRegistrationCode(email) {
        const whitelistedEmail = await this.findByEmail(email);
        return whitelistedEmail?.registrationCode || null;
    }
}
