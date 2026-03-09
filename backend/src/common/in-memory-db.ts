import { CaseRecord, ConsentRecord } from '@ecms/shared';
import { AuditEvent } from './types';

export const db = {
  cases: new Map<string, CaseRecord>(),
  consents: new Map<string, ConsentRecord>(),
  audit: [] as AuditEvent[],
  notifications: [] as Array<{ id: string; userId: string; title: string; body: string; createdAt: string; readAt?: string }>
};
