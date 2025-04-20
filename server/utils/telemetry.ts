import { trace, Tracer } from '@opentelemetry/api';

// Enum for operation types
export enum DbOperationType {
  READ = 'read',
  WRITE = 'write',
  UPDATE = 'update',
  DELETE = 'delete',
  QUERY = 'query'
}

// Singleton for tracer access
export class TelemetryManager {
  private static instance: TelemetryManager;
  private tracer: Tracer;

  private constructor() {
    this.tracer = trace.getTracer('cosmos.operations');
  }

  static getInstance(): TelemetryManager {
    if (!this.instance) {
      this.instance = new TelemetryManager();
    }
    return this.instance;
  }

  createSpan(
    operationName: string,
    type: DbOperationType,
    collection: string
  ) {
    return this.tracer.startSpan(operationName, {
      attributes: {
        'db.operation.type': type,
        'db.collection': collection,
        'db.system': 'cosmosdb'
      }
    });
  }
} 