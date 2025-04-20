import { trace } from '@opentelemetry/api';
// Enum for operation types
export var DbOperationType;
(function (DbOperationType) {
    DbOperationType["READ"] = "read";
    DbOperationType["WRITE"] = "write";
    DbOperationType["UPDATE"] = "update";
    DbOperationType["DELETE"] = "delete";
    DbOperationType["QUERY"] = "query";
})(DbOperationType || (DbOperationType = {}));
// Singleton for tracer access
export class TelemetryManager {
    constructor() {
        this.tracer = trace.getTracer('cosmos.operations');
    }
    static getInstance() {
        if (!this.instance) {
            this.instance = new TelemetryManager();
        }
        return this.instance;
    }
    createSpan(operationName, type, collection) {
        return this.tracer.startSpan(operationName, {
            attributes: {
                'db.operation.type': type,
                'db.collection': collection,
                'db.system': 'cosmosdb'
            }
        });
    }
}
