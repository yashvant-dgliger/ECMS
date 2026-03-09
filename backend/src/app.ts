import express from 'express';
import { CasesService } from './cases/cases.service';
import { ConsentService } from './consent/consent.service';
import { AuditService } from './audit/audit.service';
import { DashboardService } from './dashboard/dashboard.service';
import { CaseStatus } from '@ecms/shared';

const app = express();
app.use(express.json());

const auditService = new AuditService();
const consentService = new ConsentService(auditService);
const casesService = new CasesService(auditService, consentService);
const dashboardService = new DashboardService();


app.post('/v1/auth/firebase-login', async (req, res) => {
  try {
    const token = req.body.firebaseIdToken as string;
    if (!token) return res.status(400).json({ error: 'FIREBASE_TOKEN_REQUIRED' });
    return res.json({ accessToken: `ecms_access_${Date.now()}`, refreshToken: `ecms_refresh_${Date.now()}`, expiresIn: 900 });
  } catch (error) {
    return res.status(500).json({ error: (error as Error).message });
  }
});

app.post('/v1/devices/register', (req, res) => {
  return res.status(201).json({ status: 'REGISTERED', token: req.body.token, platform: req.body.platform });
});

app.post('/v1/consents', (req, res) => {
  try {
    const actorId = req.header('x-user-id') ?? 'system';
    const consent = consentService.create(req.body, actorId);
    res.status(201).json(consent);
  } catch (error) {
    res.status(422).json({ error: (error as Error).message });
  }
});

app.post('/v1/cases', (req, res) => {
  try {
    const actorId = req.header('x-user-id') ?? 'system';
    const created = casesService.create(req.body, actorId);
    res.status(201).json(created);
  } catch (error) {
    res.status(422).json({ error: (error as Error).message });
  }
});

app.get('/v1/cases', (_req, res) => res.json(casesService.list()));
app.get('/v1/cases/:id', (req, res) => {
  const entity = casesService.get(req.params.id);
  if (!entity) return res.status(404).json({ error: 'CASE_NOT_FOUND' });
  return res.json(entity);
});

app.post('/v1/cases/:id/status-transition', (req, res) => {
  try {
    const actorId = req.header('x-user-id') ?? 'system';
    const status = req.body.status as CaseStatus;
    const updated = casesService.transition(req.params.id, status, req.body.reason ?? 'N/A', actorId);
    res.json(updated);
  } catch (error) {
    res.status(422).json({ error: (error as Error).message });
  }
});

app.get('/v1/dashboard/kpis', (_req, res) => res.json(dashboardService.kpis()));
app.get('/v1/audit-logs', (_req, res) => res.json(auditService.list()));

export default app;
