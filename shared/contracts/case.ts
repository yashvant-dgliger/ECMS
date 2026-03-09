import { CaseStatus } from '../enums/case-status';

export interface CreateCaseRequest {
  customerId: string;
  category: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  subject: string;
  description: string;
  isProxy?: boolean;
  consentId?: string;
}

export interface CaseRecord extends CreateCaseRequest {
  id: string;
  caseNumber: string;
  status: CaseStatus;
  assigneeId?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}
