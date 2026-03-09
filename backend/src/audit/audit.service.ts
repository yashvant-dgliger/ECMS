import { db } from '../common/in-memory-db';
import { AuditEvent } from '../common/types';
import crypto from 'node:crypto';

export class AuditService {
  private previousHash = 'GENESIS';

  log(event: Omit<AuditEvent, 'createdAt'>) {
    const createdAt = new Date().toISOString();
    const payload = `${this.previousHash}:${JSON.stringify(event)}:${createdAt}`;
    const currentHash = crypto.createHash('sha256').update(payload).digest('hex');
    db.audit.push({ ...event, createdAt, metadata: { ...event.metadata, prevHash: this.previousHash, currentHash } });
    this.previousHash = currentHash;
  }

  list() {
    return db.audit;
  }
}
