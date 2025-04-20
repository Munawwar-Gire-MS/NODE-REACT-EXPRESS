import { ObjectId } from 'mongodb';
import { getRepresentationsCollection, getRepresentationEventsCollection } from '../server/utils/db.js';
import { Representation, RepresentationEvent } from '../shared/schema.js';

async function updateAllRepresentations() {
  try {
    const representationsCollection = await getRepresentationsCollection();
    const eventsCollection = await getRepresentationEventsCollection();

    // Get all representations
    const representations = await representationsCollection.find({});
    console.log(`Found ${representations.length} representations to update`);

    const now = new Date();
    let updatedCount = 0;

    for (const representation of representations) {
      const updates: Partial<Representation> = {
        status: 'active',
        terms: {
          commission: representation.terms?.commission ?? 10,
          exclusivity: representation.terms?.exclusivity ?? false,
          territories: representation.terms?.territories ?? ['US'],
          mediaTypes: ['Theatrical']
        },
        updatedAt: now
      };

      // Update the representation
      const result = await representationsCollection.updateOne(
        { _id: representation._id },
        updates
      );

      if (result.modifiedCount > 0) {
        updatedCount++;

        // Create an event to log the changes
        const event: Omit<RepresentationEvent, '_id'> = {
          representationId: representation._id,
          type: 'updated',
          title: 'Representation Updated',
          description: 'Representation status and media type updated via script',
          date: now,
          changes: [
            {
              field: 'status',
              oldValue: representation.status,
              newValue: 'active'
            },
            {
              field: 'terms',
              oldValue: representation.terms,
              newValue: {
                commission: representation.terms?.commission ?? 10,
                exclusivity: representation.terms?.exclusivity ?? false,
                territories: representation.terms?.territories ?? ['US'],
                mediaTypes: ['Theatrical']
              }
            }
          ],
          createdBy: new ObjectId('000000000000000000000000'), // System user
          createdAt: now,
          updatedAt: now
        };

        await eventsCollection.insertOne(event);
      }
    }

    console.log(`Successfully updated ${updatedCount} representations`);
  } catch (error) {
    console.error('Error updating representations:', error);
    throw error;
  }
}

// Run the script
updateAllRepresentations()
  .then(() => {
    console.log('Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Script failed:', error);
    process.exit(1);
  }); 