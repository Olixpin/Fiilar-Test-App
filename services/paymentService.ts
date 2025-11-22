import { Transaction, PaymentMethod, TransactionType, PaymentMethodType } from '../types';

const STORAGE_KEYS = {
    WALLET_BALANCE: 'fiilar_wallet_balance',
    TRANSACTIONS: 'fiilar_transactions',
    PAYMENT_METHODS: 'fiilar_payment_methods'
};

// Helper to simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const paymentService = {
    // Wallet Balance
    getWalletBalance: async (): Promise<number> => {
        await delay(500);
        const balance = localStorage.getItem(STORAGE_KEYS.WALLET_BALANCE);
        return balance ? parseFloat(balance) : 0;
    },

    // Transactions
    getTransactions: async (): Promise<Transaction[]> => {
        await delay(500);
        const transactions = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
        if (transactions) {
            return JSON.parse(transactions);
        }
        // Return mock data if no transactions exist
        const mockTransactions: Transaction[] = [
            { id: 'tx_1', userId: 'user_1', amount: 2150, type: 'PAYMENT', date: new Date('2024-11-21T23:35:00').toISOString(), description: 'Payment for booking via Card', status: 'COMPLETED' },
            { id: 'tx_2', userId: 'user_1', amount: 2150, type: 'PAYMENT', date: new Date('2024-11-22T01:27:00').toISOString(), description: 'Payment for booking via Card', status: 'COMPLETED' },
            { id: 'tx_3', userId: 'user_1', amount: 72.4, type: 'PAYMENT', date: new Date('2024-11-22T05:32:00').toISOString(), description: 'Payment for booking via Card', status: 'COMPLETED' },
            { id: 'tx_4', userId: 'user_1', amount: 5000, type: 'DEPOSIT', date: new Date('2024-11-20T10:15:00').toISOString(), description: 'Added funds to wallet', status: 'COMPLETED' },
            { id: 'tx_5', userId: 'user_1', amount: 1500, type: 'PAYMENT', date: new Date('2024-11-19T14:20:00').toISOString(), description: 'Payment for booking via Wallet', status: 'COMPLETED' },
            { id: 'tx_6', userId: 'user_1', amount: 800, type: 'REFUND', date: new Date('2024-11-18T09:45:00').toISOString(), description: 'Refund for cancelled booking', status: 'COMPLETED' },
            { id: 'tx_7', userId: 'user_1', amount: 3200, type: 'PAYMENT', date: new Date('2024-11-17T16:30:00').toISOString(), description: 'Payment for booking via Card', status: 'COMPLETED' },
        ];
        localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(mockTransactions));
        return mockTransactions;
    },

    // Payment Methods
    getPaymentMethods: async (): Promise<PaymentMethod[]> => {
        await delay(500);
        const methods = localStorage.getItem(STORAGE_KEYS.PAYMENT_METHODS);
        return methods ? JSON.parse(methods) : [];
    },

    addPaymentMethod: async (details: { last4: string; brand: string; expiryMonth: number; expiryYear: number }): Promise<PaymentMethod> => {
        await delay(1000);
        const methods = await paymentService.getPaymentMethods();

        const newMethod: PaymentMethod = {
            id: `pm_${Date.now()}`,
            userId: 'user_1', // Mock user ID
            type: 'CARD',
            ...details,
            isDefault: methods.length === 0 // First card is default
        };

        methods.push(newMethod);
        localStorage.setItem(STORAGE_KEYS.PAYMENT_METHODS, JSON.stringify(methods));
        return newMethod;
    },

    deletePaymentMethod: async (id: string): Promise<void> => {
        await delay(500);
        const methods = await paymentService.getPaymentMethods();
        const filtered = methods.filter(m => m.id !== id);
        localStorage.setItem(STORAGE_KEYS.PAYMENT_METHODS, JSON.stringify(filtered));
    },

    // Actions
    addFunds: async (amount: number, paymentMethodId: string): Promise<Transaction> => {
        await delay(1500);

        // 1. Update Balance
        const currentBalance = await paymentService.getWalletBalance();
        const newBalance = currentBalance + amount;
        localStorage.setItem(STORAGE_KEYS.WALLET_BALANCE, newBalance.toString());

        // 2. Create Transaction Record
        const transaction: Transaction = {
            id: `tx_${Date.now()}`,
            userId: 'user_1',
            amount: amount,
            type: 'DEPOSIT',
            date: new Date().toISOString(),
            description: 'Added funds to wallet',
            status: 'COMPLETED'
        };

        const transactions = await paymentService.getTransactions();
        transactions.unshift(transaction); // Add to top
        localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));

        return transaction;
    },

    processPayment: async (amount: number, method: 'WALLET' | 'CARD', paymentMethodId?: string): Promise<Transaction> => {
        await delay(2000);

        if (method === 'WALLET') {
            const balance = await paymentService.getWalletBalance();
            if (balance < amount) {
                throw new Error('Insufficient wallet funds');
            }

            // Deduct from wallet
            localStorage.setItem(STORAGE_KEYS.WALLET_BALANCE, (balance - amount).toString());
        }

        // Create Transaction Record
        const transaction: Transaction = {
            id: `tx_${Date.now()}`,
            userId: 'user_1',
            amount: amount,
            type: 'PAYMENT',
            date: new Date().toISOString(),
            description: `Payment for booking via ${method === 'WALLET' ? 'Wallet' : 'Card'}`,
            status: 'COMPLETED'
        };

        const transactions = await paymentService.getTransactions();
        transactions.unshift(transaction);
        localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));

        return transaction;
    },

    withdrawFunds: async (amount: number): Promise<Transaction> => {
        await delay(1500);

        const currentBalance = await paymentService.getWalletBalance();
        if (currentBalance < amount) {
            throw new Error('Insufficient balance');
        }

        const newBalance = currentBalance - amount;
        localStorage.setItem(STORAGE_KEYS.WALLET_BALANCE, newBalance.toString());

        const transaction: Transaction = {
            id: `tx_${Date.now()}`,
            userId: 'user_1',
            amount: amount,
            type: 'PAYMENT',
            date: new Date().toISOString(),
            description: 'Withdrawal to bank account',
            status: 'COMPLETED'
        };

        const transactions = await paymentService.getTransactions();
        transactions.unshift(transaction);
        localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));

        return transaction;
    }
};
