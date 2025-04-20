import { AsyncLocalStorage } from 'async_hooks';
import { Request } from 'express';

interface RequestContext {
  url: string;
  method: string;
  path: string;
  query: Record<string, string>;
}

// Create an AsyncLocalStorage instance to store request context
const requestContextStorage = new AsyncLocalStorage<RequestContext>();

export function getRequestContext(): RequestContext | undefined {
  return requestContextStorage.getStore();
}

export function setRequestContext(req: Request): void {
  const context: RequestContext = {
    url: req.originalUrl,
    method: req.method,
    path: req.path,
    query: req.query as Record<string, string>
  };
  requestContextStorage.enterWith(context);
} 