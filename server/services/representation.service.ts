import { ObjectId, Filter, WithId } from 'mongodb';
import { getRepresentationEventsCollection, getRepresentationsCollection, getUsersCollection } from '../utils/db.js';
import { Representation, RepresentationEvent, RepresentationFieldValue, User } from '../../shared/schema.js';

// Helper function to compare values, handling undefined and null
function isEqual(a: unknown, b: unknown): boolean {
  console.log(`[DEBUG] isEqual comparing type a=${typeof a}, type b=${typeof b}`);
  
  // Same value or both null/undefined
  if (a === b) return true;
  if (a == null && b == null) return true;
  
  // Handle string comparison by ensuring case sensitivity
  if (typeof a === 'string' && typeof b === 'string') {
    return a === b; // ensure exact string comparison
  }
  
  // Handle object comparison
  if (typeof a === 'object' && typeof b === 'object' && a !== null && b !== null) {
    const aKeys = Object.keys(a);
    const bKeys = Object.keys(b);
    if (aKeys.length !== bKeys.length) return false;
    // Use Object.prototype.hasOwnProperty.call for safety
    // Cast to any for key access, assuming keys match if length is same
    return aKeys.every(key => Object.prototype.hasOwnProperty.call(b, key) && 
      isEqual((a as Record<string, unknown>)[key], (b as Record<string, unknown>)[key])
    );
  }
  
  // Values are different
  return false;
}

// Helper function to deep copy an object
function deepCopy<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  if (obj instanceof Date) {
    return new Date(obj.getTime()) as T;
  }
  if (Array.isArray(obj)) {
    return obj.map(item => deepCopy(item)) as T;
  }
  const copy = {} as T;
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      copy[key] = deepCopy(obj[key]);
    }
  }
  return copy;
}

export class RepresentationService {
  /**
   * Create a new representation between an agent and a client
   */
  static async createRepresentation(
    agentId: ObjectId,
    clientId: ObjectId,
    terms: {
      commission: number;
      exclusivity: boolean;
      territories: string[];
      mediaTypes: string[];
    },
    notes?: string,
    createdBy: ObjectId = agentId
  ): Promise<Representation> {
    const representationsCollection = await getRepresentationsCollection();
    const eventsCollection = await getRepresentationEventsCollection();

    const now = new Date();
    
    const representation: Omit<Representation, '_id'> = {
      agentId,
      clientId,
      status: 'pending', 
      startDate: now,
      terms,
      notes,
      createdAt: now,
      updatedAt: now
    };

    const result = await representationsCollection.insertOne(representation);
    const createdRepresentation = { ...representation, _id: result.insertedId };

    const event: Omit<RepresentationEvent, '_id'> = {
      representationId: result.insertedId,
      type: 'created',
      title: 'Representation Created',
      description: `Representation established for client.`,
      date: now,
      createdBy,
      createdAt: now,
      updatedAt: now
    };

    await eventsCollection.insertOne(event);

    return createdRepresentation;
  }

  /**
   * Update an existing representation and log changes
   */
  static async updateRepresentation(
    representationId: ObjectId,
    updates: Partial<Omit<Representation, '_id' | 'agentId' | 'clientId' | 'createdAt'>>,
    updatedBy: ObjectId
  ): Promise<Representation> {
    const representationsCollection = await getRepresentationsCollection();
    const eventsCollection = await getRepresentationEventsCollection();

    console.log(`[DEBUG] Updating representation: ${representationId.toString()}`);
    console.log(`[DEBUG] Updates:`, JSON.stringify(updates));
    console.log(`[DEBUG] Updated by: ${updatedBy.toString()}`);

    const currentRepresentation = await representationsCollection.findOne({ _id: representationId });
    if (!currentRepresentation) {
      throw new Error('Representation not found');
    }

    console.log(`[DEBUG] Current representation status: ${currentRepresentation.status}`);
    
    const now = new Date();
    const changes: RepresentationEvent['changes'] = [];
    const updatePayload: Partial<Representation> = {};

    for (const key in updates) {
      const field = key as keyof typeof updates;
      const newValue = updates[field]; 
      const oldValue = currentRepresentation[field as keyof Representation];

      console.log(`[DEBUG] Comparing field ${field}: old value = ${JSON.stringify(oldValue)}, new value = ${JSON.stringify(newValue)}`);
      
      if (!isEqual(oldValue, newValue)) {
        console.log(`[DEBUG] Values are different, adding to changes`);
        changes.push({
          field: field as keyof Representation, 
          oldValue: deepCopy(oldValue) as RepresentationFieldValue, 
          newValue: deepCopy(newValue) as RepresentationFieldValue,
        });
        // Add to the actual update payload only if changed
        // Use Record<string, unknown> for type compatibility with Partial<Representation>
        (updatePayload as Record<string, unknown>)[field] = newValue; 
      }
    }

    if (changes.length === 0) {
      console.log(`[DEBUG] No changes detected, returning current representation`);
      return currentRepresentation; 
    }

    updatePayload.updatedAt = now;

    console.log(`[DEBUG] Applying updates with payload:`, JSON.stringify(updatePayload));
    
    const result = await representationsCollection.updateOne(
      { _id: representationId },
      updatePayload 
    );

    console.log(`[DEBUG] Update result: modifiedCount=${result.modifiedCount}, matchedCount=${result.matchedCount}`);

    if (result.modifiedCount === 0) {
      console.warn("Representation update reported no modification, but changes were detected.");
    }

    // Log the event
    const eventType = changes.some(c => c.field === 'status') ? 'status_changed' : 'updated';
    const event: Omit<RepresentationEvent, '_id'> = {
      representationId,
      type: eventType,
      title: `Representation ${eventType === 'status_changed' ? 'Status Changed' : 'Updated'}`,
      description: `Representation details updated.`,
      date: now,
      changes,
      createdBy: updatedBy,
      createdAt: now,
      updatedAt: now
    };
    await eventsCollection.insertOne(event);

    const updatedDoc = await representationsCollection.findOne({ _id: representationId });
    if (!updatedDoc) { 
      throw new Error('Failed to retrieve updated representation');
    }
    return updatedDoc;
  }

  /**
   * Archive a representation (soft delete)
   */
  static async archiveRepresentation(
    representationId: ObjectId,
    archivedBy: ObjectId
  ): Promise<Representation> {
    const representationsCollection = await getRepresentationsCollection();
    const eventsCollection = await getRepresentationEventsCollection();

    const currentRepresentation = await representationsCollection.findOne({ _id: representationId });
    if (!currentRepresentation) {
      throw new Error('Representation not found');
    }

    if (currentRepresentation.status === 'inactive') {
      console.warn('Representation already inactive/archived.');
      return currentRepresentation; 
    }

    const now = new Date();
    const updates: Partial<Representation> = {
      status: 'inactive', 
      endDate: now, 
      updatedAt: now
    };

    const result = await representationsCollection.updateOne(
      { _id: representationId },
      updates
    );

    if (result.modifiedCount === 0) {
      console.warn("Archive operation reported no modification.");
    }

    // Create an archive event
    const event: Omit<RepresentationEvent, '_id'> = {
      representationId,
      type: 'archived', 
      title: 'Representation Archived',
      description: 'Representation marked as inactive.',
      date: now,
      changes: [
        {
          field: 'status',
          oldValue: currentRepresentation.status,
          newValue: 'inactive'
        },
        {
          field: 'endDate',
          oldValue: deepCopy(currentRepresentation.endDate ?? undefined) as RepresentationFieldValue,
          newValue: deepCopy(now) as RepresentationFieldValue
        }
      ],
      createdBy: archivedBy,
      createdAt: now,
      updatedAt: now
    };
    await eventsCollection.insertOne(event);

    const updatedDoc = await representationsCollection.findOne({ _id: representationId });
     if (!updatedDoc) { 
      throw new Error('Failed to retrieve archived representation');
    }
    return updatedDoc;
  }

  // --- Existing methods using the updated updateRepresentation --- 

  static async changeStatus(
    representationId: ObjectId,
    newStatus: Representation['status'],
    updatedBy: ObjectId
  ): Promise<Representation> {
     return this.updateRepresentation(representationId, { status: newStatus }, updatedBy);
  }

  static async updateTerms(
    representationId: ObjectId,
    newTerms: Representation['terms'],
    updatedBy: ObjectId
  ): Promise<Representation> {
    if (!newTerms) {
      throw new Error("Terms cannot be null or undefined.");
    }
    return this.updateRepresentation(representationId, { terms: newTerms }, updatedBy);
  }

  static async endRepresentation(
    representationId: ObjectId,
    updatedBy: ObjectId
  ): Promise<Representation> {
    return this.archiveRepresentation(representationId, updatedBy);
  }

  // --- Fetching methods --- 

  static async getRepresentationById(representationId: ObjectId): Promise<WithId<Representation> | null> {
    const representationsCollection = await getRepresentationsCollection();
    return representationsCollection.findOne({ _id: representationId });
  }

  /**
   * Get all representations for a specific agent, including client details.
   * Excludes inactive and pending representations by default.
   */
  static async getAgentRoster(agentId: ObjectId, includeInactive: boolean = false): Promise<(WithId<Representation> & { client: WithId<User> | null })[]> {
    const representationsCollection = await getRepresentationsCollection();
    const usersCollection = await getUsersCollection(); 
    
    const query: Filter<Representation> = { agentId };
    if (!includeInactive) {
      query.status = { $nin: ['inactive', 'pending'] }; 
    }

    // Call find() then await toArray()
    const representations = await representationsCollection.find(query); 

    const roster = await Promise.all(
      representations.map(async (rep: WithId<Representation>) => {
        const client = await usersCollection.findOne({ _id: rep.clientId, role: 'client' });
        return { ...rep, client: client || null }; 
      })
    );

    return roster as (WithId<Representation> & { client: WithId<User> | null })[];
  }
  
  static async getRepresentationsByAgentId(agentId: ObjectId): Promise<WithId<Representation>[]> {
    const representationsCollection = await getRepresentationsCollection();
    // Call find() then await toArray()
    return representationsCollection.find({ agentId });
  }

  static async getRepresentationsByClientId(clientId: ObjectId): Promise<WithId<Representation>[]> {
    const representationsCollection = await getRepresentationsCollection();
    console.log(`[DEBUG] Looking for representations with clientId: ${clientId.toString()}`);
    // Call find() then await toArray()
    const representations = await representationsCollection.find({ clientId });
    console.log(`[DEBUG] Found ${representations.length} representations, here are the IDs:`);
    representations.forEach(rep => {
      console.log(`[DEBUG] - Representation ID: ${rep._id.toString()}, Status: ${rep.status}`);
    });
    return representations;
  }

  static async getEventsByRepresentationId(representationId: ObjectId): Promise<WithId<RepresentationEvent>[]> {
    const eventsCollection = await getRepresentationEventsCollection();
    const events = await eventsCollection.find({ representationId });
    return events.sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return dateB - dateA;
    });
  }

  /**
   * Get all active agents connected to a client through representations
   */
  static async getConnectedAgents(clientId: ObjectId): Promise<Array<{ id: ObjectId; name: string }>> {
    const representationsCollection = await getRepresentationsCollection();
    const usersCollection = await getUsersCollection();

    // Get all active representations for the client
    const representations = await representationsCollection.find({
      clientId,
      status: 'active'
    });

    console.log(`[DEBUG] Found ${representations.length} representations for client ${clientId.toString()}`);

    // Get agent details for each representation
    const agents = await Promise.all(
      representations.map(async (rep) => {
        console.log(`[DEBUG] Looking up agent with ID: ${rep.agentId.toString()}`);
        const agentArr = await usersCollection.aggregate([
          { $match: { _id: rep.agentId, role: 'agent' } },
          { $project: { _id: 1, name: 1 } }
        ]);
        const agent = agentArr[0];
        if (agent && agent._id) {
          console.log(`[DEBUG] Agent lookup result: Found agent ${agent._id.toString()}`);
        } else {
          console.log(`[DEBUG] Agent lookup result: No agent found`);
        }
        return agent && agent._id && agent.name ? {
          id: agent._id,
          name: `${agent.name.first} ${agent.name.last}`
        } : null;
      })
    );

    console.log(`[DEBUG] Found ${agents.length} agents for client ${clientId.toString()}`);

    // Log each agent's details
    agents.forEach(agent => {
      if (agent) {
        console.log(`[DEBUG] Agent: ID=${agent.id.toString()}, Name=${agent.name}`);
      }
    });

    // Filter out null values and return unique agents
    const filteredAgents = agents.filter((agent): agent is { id: ObjectId; name: string } => agent !== null);
    
    console.log(`[DEBUG] Found ${filteredAgents.length} agents for client ${clientId.toString()}`);
    console.log(`[DEBUG] Agents: ${JSON.stringify(filteredAgents)}`);
    
    return filteredAgents;
  }

  /**
   * Get all active clients connected to an agent through representations
   */
  static async getConnectedClients(agentId: ObjectId): Promise<Array<{ id: ObjectId; name: string }>> {
    const representationsCollection = await getRepresentationsCollection();
    const usersCollection = await getUsersCollection();

    // Get all active representations for the agent
    const representations = await representationsCollection.find({
      agentId,
      status: 'active'
    });

    console.log(`[DEBUG] Found ${representations.length} representations for agent ${agentId.toString()}`);

    // Get client details for each representation
    const clients = await Promise.all(
      representations.map(async (rep) => {
        console.log(`[DEBUG] Looking up client with ID: ${rep.clientId.toString()}`);
        const clientArr = await usersCollection.aggregate([
          { $match: { _id: rep.clientId, role: 'client' } },
          { $project: { _id: 1, name: 1 } }
        ]);
        const client = clientArr[0];
        if (client && client._id) {
          console.log(`[DEBUG] Client lookup result: Found client ${client._id.toString()}`);
        } else {
          console.log(`[DEBUG] Client lookup result: No client found`);
        }
        return client && client._id && client.name ? {
          id: client._id,
          name: `${client.name.first} ${client.name.last}`
        } : null;
      })
    );

    console.log(`[DEBUG] Found ${clients.length} clients for agent ${agentId.toString()}`);

    // Log each client's details
    clients.forEach(client => {
      if (client) {
        console.log(`[DEBUG] Client: ID=${client.id.toString()}, Name=${client.name}`);
      }
    });

    // Filter out null values and return unique clients
    const filteredClients = clients.filter((client): client is { id: ObjectId; name: string } => client !== null);
    
    console.log(`[DEBUG] Found ${filteredClients.length} clients for agent ${agentId.toString()}`);
    console.log(`[DEBUG] Clients: ${JSON.stringify(filteredClients)}`);
    
    return filteredClients;
  }
} 