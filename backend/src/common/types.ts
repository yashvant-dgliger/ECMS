import { RoleCode } from '@ecms/shared';

export interface AuthContext {
  userId: string;
  roles: RoleCode[];
  email: string;
}

export interface AuditEvent {
  action: string;
  entityType: string;
  entityId: string;
  actorId: string;
  before?: unknown;
  after?: unknown;
  metadata?: Record<string, unknown>;
  createdAt: string;
}
