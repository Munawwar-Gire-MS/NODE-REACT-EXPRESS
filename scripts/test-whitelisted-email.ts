import { config } from 'dotenv';
import { connectToDatabase } from '../server/utils/db';
import { WhitelistedEmailsService } from '../server/services/whitelisted-emails.service';

// Load environment variables
config();

async function testWhitelistedEmailOperations() {
  try {
    // Connect to database
    await connectToDatabase();

    // Create a test whitelisted email
    const testEmail = await WhitelistedEmailsService.createWhitelistedEmail(
      "david@talentflowhq.com",
      "agent"
    );

    console.log("Created whitelisted email:", testEmail);

    // Find the whitelisted email
    const foundEmail = await WhitelistedEmailsService.findByEmail("test@example.com");
    console.log("\nFound whitelisted email:", foundEmail);

    // Check if email is whitelisted
    const isWhitelisted = await WhitelistedEmailsService.isEmailWhitelisted("test@example.com");
    console.log("\nIs email whitelisted:", isWhitelisted);

    // Get user type for email
    const userType = await WhitelistedEmailsService.getUserTypeForEmail("test@example.com");
    console.log("\nUser type for email:", userType);

  } catch (error) {
    console.error("Error during test:", error);
  } finally {
    // Exit the process
    process.exit(0);
  }
}

testWhitelistedEmailOperations(); 