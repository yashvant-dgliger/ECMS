import { CaseRecord, CaseStatus, CreateCaseRequest } from '@ecms/shared';
import { db } from '../common/in-memory-db';
import { AuditService } from '../audit/audit.service';
import { ConsentService } from '../consent/consent.service';

export class CasesService {
  constructor(
    private readonly auditService: AuditService,
    private readonly consentService: ConsentService
  ) {}

  create(input: CreateCaseRequest, actorId: string): CaseRecord {
    if (input.isProxy && !input.consentId) {
      throw new Error('CONSENT_REQUIRED_FOR_PROXY_CASE');
    }
    if (input.isProxy && input.consentId && !this.consentService.validate(input.consentId)) {
      throw new Error('INVALID_OR_EXPIRED_CONSENT');
    }

    const id = `case_${Date.now()}`;
    const now = new Date().toISOString();
    const entity: CaseRecord = {
      ...input,
      id,
      caseNumber: `ECMS-${Date.now()}`,
      status: CaseStatus.PENDING_TICKETS,
      createdBy: actorId,
      createdAt: now,
      updatedAt: now
    };

    db.cases.set(id, entity);
    this.auditService.log({
      action: 'CASE_CREATED',
      entityType: 'CASE',
      entityId: id,
      actorId,
      after: entity
    });
    return entity;
  }

  list() {
    return Array.from(db.cases.values());
  }

  get(id: string) {
    return db.cases.get(id);
  }

  transition(id: string, status: CaseStatus, reason: string, actorId: string) {
    const existing = db.cases.get(id);
    if (!existing) throw new Error('CASE_NOT_FOUND');
    const before = { ...existing };
    existing.status = status;
    existing.updatedAt = new Date().toISOString();
    db.cases.set(id, existing);
    this.auditService.log({
      action: 'CASE_STATUS_CHANGED',
      entityType: 'CASE',
      entityId: id,
      actorId,
      before,
      after: existing,
      metadata: { reason }
    });
    return existing;
  }
}
