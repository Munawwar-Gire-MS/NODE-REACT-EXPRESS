import { metrics, trace, SpanStatusCode } from '@opentelemetry/api';
import { useAzureMonitor } from '@azure/monitor-opentelemetry';
import { MongoClient } from 'mongodb';
import { config } from 'dotenv';

// Load environment variables
config();

async function testMetrics() {
  if (!process.env.APPLICATIONINSIGHTS_CONNECTION_STRING) {
    throw new Error('APPLICATIONINSIGHTS_CONNECTION_STRING is required');
  }
  console.log('APPLICATIONINSIGHTS_CONNECTION_STRING:', process.env.APPLICATIONINSIGHTS_CONNECTION_STRING);

  // Configure Azure Monitor with explicit options
  // eslint-disable-next-line react-hooks/rules-of-hooks
  useAzureMonitor({
    azureMonitorExporterOptions: {
      connectionString: process.env.APPLICATIONINSIGHTS_CONNECTION_STRING,
    }
  });

  // Get both meter and tracer
  const meter = metrics.getMeter('test.cosmos.metrics');
  const tracer = trace.getTracer('test.cosmos.tracer');
  
  // Create counter
  const requestChargeCounter = meter.createCounter('test.cosmos.request.charge', {
    description: 'Cosmos DB request charge in RUs',
    unit: 'ru'
  });

  const client = new MongoClient(process.env.MONGODB_URI!);
  
  try {
    // Create a span with attributes directly
    const span = tracer.startSpan('test-operation', {
      attributes: {
        'test.type': 'database-operation',
        'test.component': 'cosmos-db'
      }
    });

    await client.connect();
    console.log('Connected to database');

    const db = client.db(process.env.MONGODB_DB_NAME);
    const collection = db.collection('users');

    // Set span attributes instead of event attributes
    span.setAttribute('event.type', 'test');
    span.setAttribute('event.message', 'This is a test event');

    // Perform query
    console.log('Executing test query...');
    await collection.findOne({ username: 'testuser@example.com' });
    
    const stats = await db.command({ getLastRequestStatistics: 1 });
    console.log('Request statistics:', stats);
    
    const requestCharge = stats.RequestCharge || 0;
    console.log('Request charge:', requestCharge);

    // Add metric
    /* requestChargeCounter.add(requestCharge, {
      'metric.type': 'request-charge',
      'operation.name': 'findOne',
      'collection.name': 'users'
    }); */
    requestChargeCounter.add(requestCharge, {
      'operation.name': 'db-ru-charge',
    });

    // Set more span attributes for the request charge
    span.setAttribute('cosmos.request.charge', requestCharge);
    span.setAttribute('cosmos.operation', 'findOne');
    span.setAttribute('cosmos.collection', 'users');

    console.log('Telemetry logged successfully');

    // Set status and end the span
    span.setStatus({ code: SpanStatusCode.OK });
    span.end();

    // Wait for telemetry to flush
    console.log('Waiting for telemetry to flush...');
    //await new Promise(resolve => setTimeout(resolve, 30000));

    metrics.disable();

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.close();
  }
}

// Add more error handling
process.on('unhandledRejection', (error) => {
  console.error('Unhandled rejection:', error);
});

testMetrics().catch((error) => {
  console.error('Test failed:', error);
  process.exit(1);
}); 