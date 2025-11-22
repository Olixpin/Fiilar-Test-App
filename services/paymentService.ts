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
        return transactions ? JSON.parse(transactions) : [];
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
    }
};
