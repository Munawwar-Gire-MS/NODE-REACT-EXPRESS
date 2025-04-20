import { Router } from "express";
import { ObjectId } from "mongodb";
import { requireAuth, AuthRequest } from "../middleware/auth.js";
import { ClientService } from "../services/client.service.js";
import { RepresentationService } from "../services/representation.service.js";
import { WhitelistedEmailsService } from "../services/whitelisted-emails.service.js";
import { generateRegistrationCode } from "../utils/registration.js";

const router = Router();

/**
 * Send an invitation to a client
 */
router.post("/", requireAuth, async (req: AuthRequest, res) => {
  try {
    const { email, name } = req.body;
    const agentId = req.user?.userId;

    if (!agentId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Check if the client already exists
    const existingClient = await ClientService.getClientByUsername(email);
    
    let clientId;
    let registrationCode = null;
    
    if (existingClient) {
      // Client already exists, use their ID
      clientId = existingClient._id!;
    } else {
      // Generate a registration code for the client
      registrationCode = generateRegistrationCode();
      
      // Add the client's email to the whitelist
      await WhitelistedEmailsService.addEmail(email, 'client', registrationCode);

      // parse name into first and last
      const nameParts = name.split(' ');
      const firstName = nameParts[0];
      // If only one word provided, lastName will be empty string
      const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';
      
      // Create the client user without a password
      const newClient = await ClientService.createClient(
        email,
        firstName,
        lastName
      );
      
      clientId = newClient._id!;
    }

    // Create the representation
    const representation = await RepresentationService.createRepresentation(
      new ObjectId(agentId),
      clientId,
      {
        commission: 10, // Default commission
        exclusivity: false, // Default to non-exclusive
        territories: ['US'], // Default territory
        mediaTypes: ['Theatrical'] // Default media type
      },
      'Representation created via invitation'
    );

    // Generate the magic link for the client
    const magicLink = registrationCode 
      ? `${process.env.CLIENT_URL || 'http://localhost:8081'}/register?email=${encodeURIComponent(email)}&code=${registrationCode}`
      : null;

    res.status(201).json({ 
      message: "Invitation sent successfully",
      clientId: clientId,
      representationId: representation._id,
      isNewClient: !existingClient,
      magicLink: magicLink
    });
  } catch (error) {
    console.error("Error sending invitation:", error);
    res.status(500).json({ error: "Failed to send invitation" });
  }
});

/**
 * Get all invitations sent by an agent
 */
router.get("/", requireAuth, async (req: AuthRequest, res) => {
  try {
    const agentId = req.user?.userId;

    if (!agentId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Get all representations for the agent
    const representations = await RepresentationService.getRepresentationsByAgentId(new ObjectId(agentId));

    // Get client details for each representation
    const invitations = await Promise.all(
      representations.map(async (representation) => {
        const client = await ClientService.getClientById(representation.clientId);
        return {
          representationId: representation._id,
          clientId: client?._id,
          clientName: client ? `${client.name.first} ${client.name.last}` : 'Unknown',
          clientUsername: client?.username,
          status: representation.status,
          createdAt: representation.createdAt
        };
      })
    );

    res.status(200).json(invitations);
  } catch (error) {
    console.error("Error fetching invitations:", error);
    res.status(500).json({ error: "Failed to fetch invitations" });
  }
});

export default router; 