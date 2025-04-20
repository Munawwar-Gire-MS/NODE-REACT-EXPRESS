import { config } from 'dotenv';
import { connectToDatabase, getUsersCollection } from '../server/utils/db';
import { UsersService } from '../server/services/users.service';

// Load environment variables
config();

async function testUserOperations() {
  try {
    // Connect to database
    await connectToDatabase();
    const collection = await getUsersCollection();

    // First, clean up any existing test user
    await collection.deleteOne({ username: "testagent@example.com" });
    await collection.deleteOne({ username: "testclient@example.com" });

    // Now create the test user
    const testUser = await UsersService.createUser({
      username: "testagent@example.com",
      password: "test123", // This will be hashed automatically
      role: "agent",
      name: {
        first: "Test",
        last: "User"
      },
      avatarUrl: "https://example.com/avatar.jpg"
    });

    console.log("Created user:", testUser);

    const testUser2 = await UsersService.createUser({
      username: "testclient@example.com",
      password: "test123", // This will be hashed automatically
      role: "client",
      name: {
        first: "Test",
        last: "Client"
      },
      avatarUrl: "https://example.com/avatar.jpg"
    });

    console.log("Created user:", testUser2);
    // 2. Find user by username
    const foundUser = await UsersService.findByUsername("testagent@example.com");
    console.log("\nFound user by username:", foundUser);

    // 3. Test password validation (should be true)
    if (foundUser) {
      const isValidPassword = await UsersService.validatePassword(foundUser, "test123");
      console.log("\nPassword validation (correct password):", isValidPassword);

      // 4. Test incorrect password (should be false)
      const isInvalidPassword = await UsersService.validatePassword(foundUser, "wrongpassword");
      console.log("Password validation (wrong password):", isInvalidPassword);
    }

  } catch (error) {
    console.error("Error during test:", error);
  } finally {
    // Exit the process
    process.exit(0);
  }
}

testUserOperations(); 