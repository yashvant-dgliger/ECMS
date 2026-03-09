import { CreateConsentRequest, ConsentRecord } from '@ecms/shared';
import { db } from '../common/in-memory-db';
import { AuditService } from '../audit/audit.service';

export class ConsentService {
  constructor(private readonly auditService: AuditService) {}

  create(input: CreateConsentRequest, actorId: string): ConsentRecord {
    if (!input.proofDocumentId) {
      throw new Error('CONSENT_PROOF_REQUIRED');
    }
    const id = `consent_${Date.now()}`;
    const consent: ConsentRecord = {
      ...input,
      id,
      capturedAt: new Date().toISOString()
    };
    db.consents.set(id, consent);
    this.auditService.log({
      action: 'CONSENT_CREATED',
      entityType: 'CONSENT',
      entityId: id,
      actorId,
      after: consent
    });
    return consent;
  }

  get(id: string) {
    return db.consents.get(id);
  }

  validate(id: string): boolean {
    const consent = db.consents.get(id);
    if (!consent || consent.revokedAt) return false;
    return new Date(consent.validUntil).getTime() >= Date.now();
  }
}
