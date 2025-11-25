import { User, Listing, Booking, Review, Message, Notification } from '@fiilar/types';

/**
 * Generic Mock Collection wrapper around localStorage
 */
class MockCollection<T extends { id: string }> {
    private key: string;

    constructor(key: string) {
        this.key = key;
    }

    private getAll(): T[] {
        try {
            return JSON.parse(localStorage.getItem(this.key) || '[]');
        } catch {
            return [];
        }
    }

    private saveAll(items: T[]): void {
        localStorage.setItem(this.key, JSON.stringify(items));
    }

    find(predicate: (item: T) => boolean): T | undefined {
        return this.getAll().find(predicate);
    }

    findAll(predicate?: (item: T) => boolean): T[] {
        const all = this.getAll();
        if (!predicate) return all;
        return all.filter(predicate);
    }

    findById(id: string): T | undefined {
        return this.getAll().find(item => item.id === id);
    }

    create(item: T): T {
        const all = this.getAll();
        all.push(item);
        this.saveAll(all);
        return item;
    }

    update(id: string, updates: Partial<T>): T | null {
        const all = this.getAll();
        const index = all.findIndex(item => item.id === id);
        if (index === -1) return null;

        all[index] = { ...all[index], ...updates };
        this.saveAll(all);
        return all[index];
    }

    delete(id: string): boolean {
        const all = this.getAll();
        const filtered = all.filter(item => item.id !== id);
        if (filtered.length === all.length) return false;
        
        this.saveAll(filtered);
        return true;
    }
}

/**
 * Centralized Mock Database
 */
export class MockDatabase {
    users = new MockCollection<User>('fiilar_users');
    listings = new MockCollection<Listing>('fiilar_listings');
    bookings = new MockCollection<Booking>('fiilar_bookings');
    reviews = new MockCollection<Review>('fiilar_reviews');
    messages = new MockCollection<Message>('fiilar_messages');
    notifications = new MockCollection<Notification>('fiilar_notifications');

    // Singleton instance
    private static instance: MockDatabase;

    private constructor() {}

    public static getInstance(): MockDatabase {
        if (!MockDatabase.instance) {
            MockDatabase.instance = new MockDatabase();
        }
        return MockDatabase.instance;
    }
}

export const db = MockDatabase.getInstance();
