import { getCollection } from '../utils/db.js';
export class ClientService {
    static async getClientsCollection() {
        return getCollection('users');
    }
    /**
     * Create a new client user
     */
    static async createClient(username, firstName, lastName) {
        const clientsCollection = await this.getClientsCollection();
        // Check if username already exists
        const existingUser = await clientsCollection.findOne({ username });
        if (existingUser) {
            throw new Error('Username already exists');
        }
        // Create the client
        const now = new Date();
        const client = {
            username,
            role: 'client',
            name: {
                first: firstName,
                last: lastName
            },
            createdAt: now,
            updatedAt: now
        };
        const result = await clientsCollection.insertOne(client);
        return { ...client, _id: result.insertedId };
    }
    /**
     * Get a client by ID
     */
    static async getClientById(clientId) {
        const clientsCollection = await this.getClientsCollection();
        return clientsCollection.findOne({ _id: clientId, role: 'client' });
    }
    /**
     * Get a client by username
     */
    static async getClientByUsername(username) {
        const clientsCollection = await this.getClientsCollection();
        return clientsCollection.findOne({ username, role: 'client' });
    }
    /**
     * Update a client's profile
     */
    static async updateClient(clientId, updates) {
        const clientsCollection = await this.getClientsCollection();
        // Get the current client
        const currentClient = await clientsCollection.findOne({ _id: clientId, role: 'client' });
        if (!currentClient) {
            throw new Error('Client not found');
        }
        // Prepare the update
        const now = new Date();
        const updatedClient = {
            ...currentClient,
            ...updates,
            updatedAt: now
        };
        // Update the client - the $set is handled inside the MonitoredCollection wrapper
        await clientsCollection.updateOne({ _id: clientId }, { ...updates, updatedAt: now });
        return updatedClient;
    }
    /**
     * Get all clients
     */
    static async getAllClients() {
        const clientsCollection = await this.getClientsCollection();
        const cursor = clientsCollection.find({ role: 'client' });
        return cursor;
    }
}
