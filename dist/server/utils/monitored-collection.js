import { TelemetryManager, DbOperationType } from './telemetry.js';
import { SpanStatusCode } from '@opentelemetry/api';
import { getRequestContext } from './request-context.js';
export class MonitoredCollection {
    constructor(collection, db) {
        this.collection = collection;
        this.db = db;
        this.telemetry = TelemetryManager.getInstance();
    }
    async executeOperation(operationName, type, action) {
        const span = this.telemetry.createSpan(operationName, type, this.collection.collectionName);
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
        }
        catch (error) {
            span.setStatus({
                code: SpanStatusCode.ERROR,
                message: error instanceof Error ? error.message : 'Unknown error'
            });
            throw error;
        }
        finally {
            // console.log('span.end()');
            span.end();
        }
    }
    // Read operations
    async findOne(filter) {
        return this.executeOperation('findOne', DbOperationType.READ, () => this.collection.findOne(filter));
    }
    async find(filter) {
        return this.executeOperation('find', DbOperationType.READ, () => this.collection.find(filter).toArray());
    }
    // Write operations
    async insertOne(doc) {
        return this.executeOperation('insertOne', DbOperationType.WRITE, () => this.collection.insertOne(doc));
    }
    async insertMany(docs) {
        return this.executeOperation('insertMany', DbOperationType.WRITE, () => this.collection.insertMany(docs));
    }
    // Update operations
    async updateOne(filter, update) {
        return this.executeOperation('updateOne', DbOperationType.UPDATE, () => this.collection.updateOne(filter, { $set: update }));
    }
    async updateMany(filter, update) {
        return this.executeOperation('updateMany', DbOperationType.UPDATE, () => this.collection.updateMany(filter, { $set: update }));
    }
    // Delete operations
    async deleteOne(filter) {
        return this.executeOperation('deleteOne', DbOperationType.DELETE, () => this.collection.deleteOne(filter));
    }
    async deleteMany(filter) {
        return this.executeOperation('deleteMany', DbOperationType.DELETE, () => this.collection.deleteMany(filter));
    }
    // Query operations with proper typing
    async aggregate(pipeline) {
        return this.executeOperation('aggregate', DbOperationType.QUERY, () => this.collection.aggregate(pipeline).toArray());
    }
}
