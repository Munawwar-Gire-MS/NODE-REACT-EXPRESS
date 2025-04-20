import { ObjectId } from "mongodb";
/**
 * Generate a random registration code
 * @returns A new mongo object id
 */
export function generateRegistrationCode() {
    // Generate a new mongo object id
    return new ObjectId().toString();
}
