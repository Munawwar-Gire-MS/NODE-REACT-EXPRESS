import { ObjectId } from 'mongodb';
import { getTodosCollection } from '../utils/db.js';
export async function getTodosByUserId(userId) {
    const todosCollection = await getTodosCollection();
    const userObjectId = typeof userId === 'string' ? new ObjectId(userId) : userId;
    // Use the find method from MonitoredCollection which already returns an array
    return todosCollection.find({ userId: userObjectId });
}
export async function createTodo(todo) {
    const todosCollection = await getTodosCollection();
    const newTodo = {
        ...todo,
        userId: typeof todo.userId === 'string' ? new ObjectId(todo.userId) : todo.userId,
        createdAt: new Date(),
        updatedAt: new Date()
    };
    const result = await todosCollection.insertOne(newTodo);
    return { ...newTodo, _id: result.insertedId };
}
export async function updateTodo(todoId, updates) {
    const todosCollection = await getTodosCollection();
    const todoObjectId = typeof todoId === 'string' ? new ObjectId(todoId) : todoId;
    // Use the MonitoredCollection updateOne method with just the updates
    // The $set is handled inside the MonitoredCollection wrapper
    const result = await todosCollection.updateOne({ _id: todoObjectId }, 
    // Include the updatedAt field in our updates
    { ...updates, updatedAt: new Date() });
    return result.modifiedCount > 0;
}
export async function deleteTodo(todoId) {
    const todosCollection = await getTodosCollection();
    const todoObjectId = typeof todoId === 'string' ? new ObjectId(todoId) : todoId;
    const result = await todosCollection.deleteOne({ _id: todoObjectId });
    return result.deletedCount > 0;
}
