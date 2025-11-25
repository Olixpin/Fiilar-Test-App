import { DamageReport } from '@fiilar/types';
import { STORAGE_KEYS } from '../constants';

/**
 * Get all damage reports, optionally filtered by booking ID
 */
export const getDamageReports = (bookingId?: string): DamageReport[] => {
    const r = localStorage.getItem(STORAGE_KEYS.DAMAGE_REPORTS);
    const reports: DamageReport[] = r ? JSON.parse(r) : [];

    if (bookingId) {
        return reports.filter(report => report.bookingId === bookingId);
    }

    return reports;
};

/**
 * Create a new damage report
 */
export const createDamageReport = (report: DamageReport): void => {
    const r = localStorage.getItem(STORAGE_KEYS.DAMAGE_REPORTS);
    const reports: DamageReport[] = r ? JSON.parse(r) : [];

    reports.push(report);
    localStorage.setItem(STORAGE_KEYS.DAMAGE_REPORTS, JSON.stringify(reports));
};

/**
 * Update an existing damage report
 */
export const updateDamageReport = (reportId: string, updates: Partial<DamageReport>): void => {
    const r = localStorage.getItem(STORAGE_KEYS.DAMAGE_REPORTS);
    const reports: DamageReport[] = r ? JSON.parse(r) : [];

    const idx = reports.findIndex(rep => rep.id === reportId);
    if (idx >= 0) {
        reports[idx] = { ...reports[idx], ...updates };
        localStorage.setItem(STORAGE_KEYS.DAMAGE_REPORTS, JSON.stringify(reports));
    }
};
