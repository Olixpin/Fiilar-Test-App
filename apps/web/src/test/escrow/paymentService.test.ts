import { describe, it, expect, beforeEach } from 'vitest';
import { paymentService } from '@fiilar/escrow';

describe('paymentService wallet flows', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('returns sensible defaults for balance and transactions', async () => {
    const balance = await paymentService.getWalletBalance();
    expect(balance).toBe(0);

    const transactions = await paymentService.getTransactions();
    expect(Array.isArray(transactions)).toBe(true);
    expect(transactions.length).toBe(0);
  });

  it('adds funds and records DEPOSIT transactions', async () => {
    // Initial balance should be 0
    expect(await paymentService.getWalletBalance()).toBe(0);

    const tx1 = await paymentService.addFunds(10000, 'pm_1');

    expect(tx1.type).toBe('DEPOSIT');
    expect(tx1.amount).toBe(10000);

    const balanceAfterFirst = await paymentService.getWalletBalance();
    expect(balanceAfterFirst).toBe(10000);

    const tx2 = await paymentService.addFunds(5000, 'pm_1');

    expect(tx2.type).toBe('DEPOSIT');
    expect(tx2.amount).toBe(5000);

    const finalBalance = await paymentService.getWalletBalance();
    expect(finalBalance).toBe(15000);

    const transactions = await paymentService.getTransactions();
    expect(transactions[0].id).toBe(tx2.id);
    expect(transactions[1].id).toBe(tx1.id);
  });

  it('processes wallet payments and prevents overdraft', async () => {
    // Seed balance
    await paymentService.addFunds(20000, 'pm_1');

    // Successful wallet payment
    const paymentTx = await paymentService.processPayment(8000, 'WALLET');

    expect(paymentTx.type).toBe('PAYMENT');
    expect(paymentTx.amount).toBe(8000);
    expect(paymentTx.description).toContain('Wallet');

    const balanceAfterPayment = await paymentService.getWalletBalance();
    expect(balanceAfterPayment).toBe(12000);

    // Overdraft attempt
    const overdraft = paymentService.processPayment(20000, 'WALLET');
    await expect(overdraft).rejects.toThrow('Insufficient wallet funds');
  });

  it('processes card payments without touching wallet balance', async () => {
    await paymentService.addFunds(15000, 'pm_1');

    const beforeBalance = await paymentService.getWalletBalance();
    expect(beforeBalance).toBe(15000);

    const cardTx = await paymentService.processPayment(5000, 'CARD');

    expect(cardTx.type).toBe('PAYMENT');
    expect(cardTx.amount).toBe(5000);
    expect(cardTx.description).toContain('Card');

    const afterBalance = await paymentService.getWalletBalance();
    expect(afterBalance).toBe(15000);
  });

  it('refunds to wallet and logs REFUND transaction', async () => {
    // Seed balance and simulate a payment
    await paymentService.addFunds(30000, 'pm_1');

    await paymentService.processPayment(12000, 'WALLET');

    const balanceAfterPayment = await paymentService.getWalletBalance();
    expect(balanceAfterPayment).toBe(18000);

    // Refund
    const refundTx = await paymentService.refundToWallet(12000, 'Refund for guest cancellation');

    expect(refundTx.type).toBe('REFUND');
    expect(refundTx.amount).toBe(12000);
    expect(refundTx.description).toBe('Refund for guest cancellation');

    const finalBalance = await paymentService.getWalletBalance();
    expect(finalBalance).toBe(30000);
  });

  it('withdraws funds and prevents over-withdrawal', async () => {
    // Seed balance
    await paymentService.addFunds(40000, 'pm_1');

    const withdrawTx = await paymentService.withdrawFunds(10000);

    expect(withdrawTx.type).toBe('PAYMENT');
    expect(withdrawTx.amount).toBe(10000);
    expect(withdrawTx.description).toBe('Withdrawal to bank account');

    const balanceAfterWithdraw = await paymentService.getWalletBalance();
    expect(balanceAfterWithdraw).toBe(30000);

    const overdraft = paymentService.withdrawFunds(50000);
    await expect(overdraft).rejects.toThrow('Insufficient balance');
  });

  it('keeps balance arithmetic consistent through a complex flow', async () => {
    // +40,000 (DEPOSIT)
    await paymentService.addFunds(40000, 'pm_1');

    // -34,000 (PAYMENT)
    await paymentService.processPayment(34000, 'WALLET');

    // +34,000 (REFUND)
    await paymentService.refundToWallet(34000, 'Refund for series cancellation');

    // -10,000 (WITHDRAW)
    await paymentService.withdrawFunds(10000);

    const finalBalance = await paymentService.getWalletBalance();
    // 0 + 40,000 - 34,000 + 34,000 - 10,000 = 30,000
    expect(finalBalance).toBe(30000);

    const transactions = await paymentService.getTransactions();
    expect(transactions.length).toBe(4);
    expect(transactions[0].description).toBe('Withdrawal to bank account');
  });
});
