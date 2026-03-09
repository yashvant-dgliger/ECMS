import { CaseStatus } from '@ecms/shared';

export const allowedTransitions: Record<CaseStatus, CaseStatus[]> = {
  [CaseStatus.TOTAL_TICKETS]: [CaseStatus.PENDING_TICKETS],
  [CaseStatus.ESCALATED_TICKETS]: [CaseStatus.PENDING_WITH_OTHERS, CaseStatus.RESOLVED],
  [CaseStatus.REOPEN_TICKETS]: [CaseStatus.PENDING_TICKETS],
  [CaseStatus.RESOLVED]: [CaseStatus.CLOSED, CaseStatus.REOPEN_TICKETS],
  [CaseStatus.CLOSED]: [],
  [CaseStatus.PENDING_TICKETS]: [CaseStatus.PENDING_WITH_CUSTOMER, CaseStatus.PENDING_WITH_OTHERS, CaseStatus.RESOLVED, CaseStatus.ESCALATED_TICKETS],
  [CaseStatus.PENDING_WITH_OTHERS]: [CaseStatus.PENDING_TICKETS, CaseStatus.ESCALATED_TICKETS],
  [CaseStatus.PENDING_WITH_CUSTOMER]: [CaseStatus.PENDING_TICKETS, CaseStatus.ESCALATED_TICKETS],
  [CaseStatus.PENDING_WITH_BILLDESK]: [CaseStatus.PENDING_TICKETS, CaseStatus.ESCALATED_TICKETS],
  [CaseStatus.PENDING_WITH_CAMS]: [CaseStatus.PENDING_TICKETS, CaseStatus.ESCALATED_TICKETS]
};
