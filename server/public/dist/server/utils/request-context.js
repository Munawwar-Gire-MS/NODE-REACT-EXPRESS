import { AsyncLocalStorage } from 'async_hooks';
// Create an AsyncLocalStorage instance to store request context
const requestContextStorage = new AsyncLocalStorage();
export function getRequestContext() {
    return requestContextStorage.getStore();
}
export function setRequestContext(req) {
    const context = {
        url: req.originalUrl,
        method: req.method,
        path: req.path,
        query: req.query
    };
    requestContextStorage.enterWith(context);
}
