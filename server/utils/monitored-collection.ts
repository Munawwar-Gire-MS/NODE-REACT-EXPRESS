import { Document, Collection, Filter, OptionalUnlessRequiredId, Db } from 'mongodb';
import { TelemetryManager, DbOperationType } from './telemetry.js';
import { SpanStatusCode } from '@opentelemetry/api';
import { getRequestContext } from './request-context.js';

export class MonitoredCollection<T extends Document> {
  private telemetry: TelemetryManager;

  constructor(
    private collection: Collection<T>,
    private db: Db
  ) {
    this.telemetry = TelemetryManager.getInstance();
  }

  private async executeOperation<R>(
    operationName: string,
    type: DbOperationType,
    action: () => Promise<R>
  ): Promise<R> {
    const span = this.telemetry.createSpan(
      operationName,
      type,
      this.collection.collectionName
    );

    try {
      // console.log('appinsights key from monitored collection', process.env.APPLICATIONINSIGHTS_CONNECTION_STRING);
      const result = await action();
      
      // Get request charge using the db instance passed to the constructor
      const stats = await this.db.command({ getLastRequestStatistics: 1 });
      const requestCharge = stats.RequestCharge || 0;

      // Add operation details to span
      span.setAttribute('cosmos.request.charge', requestCharge);
      console.log('requestCharge', requestCharge);
      
      // Add HTTP request context if available
      const requestContext = getRequestContext();
      if (requestContext) {
        // console.log('requestContext', requestContext);
        span.setAttribute('custom.http.method', requestContext.method);
        span.setAttribute('custom.http.path', requestContext.path);
        span.setAttribute('custom.http.query', JSON.stringify(requestContext.query));
      }
      
      span.setStatus({ code: SpanStatusCode.OK });

      return result;
    } catch (error) {
      span.setStatus({
        code: SpanStatusCode.ERROR,
        message: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    } finally {
      // console.log('span.end()');
      span.end();
    }
  }

  // Read operations
  async findOne(filter: Filter<T>) {
    return this.executeOperation(
      'findOne',
      DbOperationType.READ,
      () => this.collection.findOne(filter)
    );
  }

  async find(filter: Filter<T>) {
    return this.executeOperation(
      'find',
      DbOperationType.READ,
      () => this.collection.find(filter).toArray()
    );
  }

  // Write operations
  async insertOne(doc: OptionalUnlessRequiredId<T>) {
    return this.executeOperation(
      'insertOne',
      DbOperationType.WRITE,
      () => this.collection.insertOne(doc)
    );
  }

  async insertMany(docs: OptionalUnlessRequiredId<T>[]) {
    return this.executeOperation(
      'insertMany',
      DbOperationType.WRITE,
      () => this.collection.insertMany(docs)
    );
  }

  // Update operations
  async updateOne(filter: Filter<T>, update: Partial<T>) {
    return this.executeOperation(
      'updateOne',
      DbOperationType.UPDATE,
      () => this.collection.updateOne(filter, { $set: update })
    );
  }

  async updateMany(filter: Filter<T>, update: Partial<T>) {
    return this.executeOperation(
      'updateMany',
      DbOperationType.UPDATE,
      () => this.collection.updateMany(filter, { $set: update })
    );
  }

  // Delete operations
  async deleteOne(filter: Filter<T>) {
    return this.executeOperation(
      'deleteOne',
      DbOperationType.DELETE,
      () => this.collection.deleteOne(filter)
    );
  }

  async deleteMany(filter: Filter<T>) {
    return this.executeOperation(
      'deleteMany',
      DbOperationType.DELETE,
      () => this.collection.deleteMany(filter)
    );
  }

  // Query operations with proper typing
  async aggregate(pipeline: Document[]) {
    return this.executeOperation(
      'aggregate',
      DbOperationType.QUERY,
      () => this.collection.aggregate<T>(pipeline).toArray()
    );
  }
} 