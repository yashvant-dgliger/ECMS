import { CaseStatus } from '@ecms/shared';
import { db } from '../common/in-memory-db';

export class DashboardService {
  kpis() {
    const cases = Array.from(db.cases.values());
    const count = (status: CaseStatus) => cases.filter(c => c.status === status).length;

    return {
      totalTickets: cases.length,
      escalatedTickets: count(CaseStatus.ESCALATED_TICKETS),
      reopenTickets: count(CaseStatus.REOPEN_TICKETS),
      resolved: count(CaseStatus.RESOLVED),
      closed: count(CaseStatus.CLOSED),
      pendingTickets: count(CaseStatus.PENDING_TICKETS),
      pendingWithOthers: count(CaseStatus.PENDING_WITH_OTHERS),
      pendingWithCustomer: count(CaseStatus.PENDING_WITH_CUSTOMER),
      pendingWithBilldesk: count(CaseStatus.PENDING_WITH_BILLDESK),
      pendingWithCams: count(CaseStatus.PENDING_WITH_CAMS)
    };
  }
}
