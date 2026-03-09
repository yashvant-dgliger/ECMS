# Enterprise Case Management System (ECMS) — Implementation-Ready Blueprint

## SECTION 1: SOLUTION UNDERSTANDING

### 1.1 ECMS business objective
Build an enterprise-grade mobile-first case lifecycle platform that centralizes case intake, assignment, SLA tracking, escalation, collaboration, document evidence, proxy case creation with consent proof, compliance-grade audit trails, and operational reporting.

### 1.2 BRD-to-mobile app scope conversion
**In scope for mobile app (React Native):**
- Case creation (self + proxy with consent)
- Case list/search/filter + detail
- Assignment/reassignment actions (role-bound)
- SLA visibility + escalation indicators
- Document capture/upload/view/download
- Notes/comments/timeline
- Notification center + push deep links
- Profile/settings
- Limited supervisor/admin-lite actions

**In scope for backend/admin services (Node.js + APIs):**
- Full workflow orchestration and transition validation
- SLA and escalation engine
- RBAC + ABAC policy enforcement
- Consent proof lifecycle and audit controls
- Immutable audit event store
- Reporting aggregates and dashboard APIs
- Master configuration (categories/statuses/rules/departments)
- Integrations (email/SMS/WhatsApp/Billdesk/CAMS)

### 1.3 Users/personas
- **Super Admin:** platform governance, global config, security/compliance controls.
- **Admin:** org-level operational setup and user/team management.
- **Case Creator:** creates and tracks tickets.
- **Case Assignee:** works and updates assigned cases.
- **Supervisor:** load balancing, reassignment, escalation oversight.
- **Manager:** KPI review, SLA governance, trend monitoring.
- **Compliance Officer:** audit reviews, consent compliance, exceptions.
- **Auditor:** read-only access to immutable logs and reports.
- **Customer Support Agent:** intake and status communications.
- **Proxy User / Relationship Manager:** creates cases for beneficiaries after consent.
- **End Customer:** (optional app-facing) can track own case and provide docs.

### 1.4 Mobile vs admin/backend responsibility split
- Mobile is **task execution + data capture + human workflow UI**.
- Backend/admin is **policy enforcement + orchestration + compliance + analytics**.
- Principle: mobile should never decide permissions, SLA clocks, escalation, or final status validity.

---

## SECTION 2: RECOMMENDED ARCHITECTURE

### 2.1 High-level architecture
1. **React Native app (TypeScript)** → REST APIs.
2. **API Gateway / BFF layer (NestJS)** for auth context, throttling, routing.
3. **Core domain services (modular monolith initially):** case, workflow, SLA, consent, documents, notifications, audit, reporting.
4. **PostgreSQL** as source of truth.
5. **Redis + BullMQ** for delayed jobs, reminders, escalations.
6. **Object storage (S3-compatible/Azure Blob/GCS)** for document binaries.
7. **Firebase Auth + FCM** for identity bootstrap and push delivery.
8. **Observability stack:** OpenTelemetry + centralized logs + metrics + traces.

### 2.2 Why React Native + Firebase + Node.js
- **React Native TS:** faster enterprise delivery across iOS/Android with maintainable typed code.
- **Firebase Auth:** robust identity primitives + social/enterprise compatibility + token workflows.
- **FCM:** reliable push infra and device token management.
- **Node.js/NestJS:** modular architecture, DI, validation, guards, and easy queue/job integration.

### 2.3 Database decision (recommended)
**Primary DB: PostgreSQL 16+**
- Strong ACID guarantees (critical for case lifecycle/audit consistency).
- Rich relational modeling for workflow + permissions + status history.
- JSONB for extensible metadata and integration payloads.
- Partitioning and indexing support for high-volume audit and events.
- Mature ecosystem for enterprise backup/replication.

### 2.4 File/document storage approach
- Store files in **object storage** (not DB blobs).
- Store metadata in PostgreSQL (`documents`, `document_versions`).
- Use pre-signed upload URLs with server-side MIME/AV validation.
- Enable retention and legal hold policies.
- Firebase Storage can be optional for simple deployments, but enterprise recommendation is cloud object storage with lifecycle/retention controls.

### 2.5 Queue/background job approach
- **Redis + BullMQ** queues:
  - `sla-warning-queue`
  - `sla-breach-queue`
  - `escalation-queue`
  - `notification-queue`
  - `reporting-refresh-queue`
- Jobs idempotent using unique keys (`caseId + ruleId + thresholdTime`).

### 2.6 Authentication and role strategy
- Firebase Auth performs user identity verification.
- Backend verifies Firebase JWT and issues short-lived **ECMS access token** + refresh token pair.
- Authorization: RBAC + scoped ABAC (team/department/case ownership).
- Fine-grained permission codes (e.g., `case.assign`, `case.escalate`, `audit.read`).

### 2.7 Notification architecture
- Event-driven dispatch from backend domain events.
- In-app notifications persisted in DB.
- Push via FCM.
- Email/SMS/WhatsApp via provider adapters.
- Notification templates versioned and localized.

### 2.8 Audit logging architecture
- Append-only `audit_logs` table + chained hash (`prev_hash`, `curr_hash`).
- Critical events additionally streamed to immutable store (WORM bucket/object lock).
- All high-risk operations (status transitions, reassignment, consent, doc changes) produce audit events.

### 2.9 Offline/sync mobile considerations
- Local cache (SQLite/WatermelonDB/Realm) for recent cases and drafts.
- Offline queue for create-note/upload-intent actions.
- Conflict policy: server authoritative; client replays with idempotency key.
- Visual sync states: `pending_sync`, `synced`, `conflict`.

---

## SECTION 3: USER ROLES (RBAC)

### 3.1 Permission highlights by role
- **Super Admin:** full platform + policy + retention + key management scopes.
- **Admin:** user/team/master data/configuration, no immutable log deletion.
- **Case Creator:** create/view owned/permitted cases, add notes/docs.
- **Case Assignee:** update status within allowed workflow, resolve cases.
- **Supervisor:** assign/reassign, force-escalate with reason.
- **Manager:** dashboards, SLA exceptions, approval gates.
- **Compliance Officer:** consent, PII access controls, audit exports.
- **Auditor:** read-only across cases/audit/reports.
- **Customer Support Agent:** intake, customer communication, limited workflow edits.
- **Proxy User / RM:** create on behalf with mandatory consent record.
- **End Customer:** restricted self-case access and document submission.

### 3.2 RBAC matrix (Y=yes, C=conditional, N=no)
| Permission | SA | Admin | Creator | Assignee | Supervisor | Manager | Compliance | Auditor | Agent | Proxy | Customer |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Create case | Y | Y | Y | C | C | C | N | N | Y | Y | Y |
| Create proxy case | Y | Y | C | N | C | C | C | N | C | Y | N |
| Capture consent | Y | Y | C | N | C | C | Y | R | C | Y | N |
| Assign/reassign | Y | Y | N | C | Y | Y | N | N | C | N | N |
| Escalate | Y | Y | N | C | Y | Y | C | N | C | N | N |
| Resolve/close | Y | Y | N | Y | Y | C | N | N | C | N | N |
| Reopen | Y | Y | C | C | Y | Y | C | N | C | C | C |
| View all cases | Y | C | N | C | Y | Y | C | Y | C | N | N |
| View audit logs | Y | C | N | N | C | C | Y | Y | N | N | N |
| Export compliance report | Y | C | N | N | N | C | Y | Y | N | N | N |

---

## SECTION 4: CORE MODULES

1. **Authentication & User Management**
   - Firebase sign-in, backend session issue, device bind, role/permission fetch.
2. **Case Management**
   - Create/update/detail/list/search/filter/comments/timeline.
3. **Workflow Engine**
   - Transition rules, guard conditions, mandatory fields by state.
4. **SLA Engine**
   - SLA policy resolution, timers, warnings, breach calculations.
5. **Escalation Engine**
   - Rule triggers by time/status/priority/team.
6. **Consent & Proxy Creation**
   - Consent capture, proof upload, validity checks, revocation history.
7. **Document Management**
   - Upload, versioning, tagging, preview, classification, secure download.
8. **Notifications**
   - In-app + push + email/SMS/WhatsApp adapters.
9. **Audit Logs**
   - Immutable append-only event records with actor/context payload.
10. **Search & Filters**
    - Full-text + faceted filters + saved queries.
11. **Dashboard & Analytics**
    - KPI APIs by role/team/date/category/status/SLA.
12. **Master Configuration**
    - Category/status/workflow/SLA/escalation templates.
13. **Integration Module**
    - Billdesk/CAMS/email/SMS/webhook connectors.
14. **Settings/Profile**
    - Device prefs, language, notification channels.

---

## SECTION 5: REACT NATIVE APP SCREENS

### 5.1 Screen catalog
- **Splash:** boot checks, token refresh, feature flags.
- **Login:** email/phone + password/OTP (org policy).
- **Forgot Password/OTP:** reset flow.
- **Dashboard:** KPI cards + quick actions.
- **Create Case:** category, priority, subject, description, attachments.
- **Create Proxy Case (Consent):** beneficiary lookup, consent type, consent file upload, validity and declaration.
- **Case List:** tabs for mandatory statuses + filters.
- **Case Detail:** complete case profile, workflow actions.
- **Timeline/Activity:** ordered events, actor, timestamps.
- **Reassign/Escalate:** target user/team/level + reason.
- **SLA View:** target times, consumed time, thresholds.
- **Upload Documents:** document type, tag, version note.
- **Notifications Center:** all channels unified.
- **Search/Filter:** advanced criteria and saved filters.
- **Profile/Settings:** channels, device sessions, language.
- **Supervisor Lite:** queue balancing, pending approvals.

### 5.2 Mandatory case status support in app filters/dashboard
- Total Tickets
- Escalated Tickets
- Reopen Tickets
- Resolved
- Closed
- Pending Tickets
- Pending With Others
- Pending With Customer
- Pending With Billdesk
- Pending With CAMS

### 5.3 Navigation
- **Root:** Auth Stack / App Stack.
- **App Stack:** Bottom Tabs (Dashboard, Cases, Create, Notifications, Profile).
- **Nested Stack:** case detail subflows (timeline, SLA, docs, reassign).
- **Drawer (optional enterprise mode):** admin-lite and reports shortcuts.

---

## SECTION 6: DATA MODEL / DATABASE DESIGN (PostgreSQL)

### 6.1 Core entities (table → key fields)
1. `users` (id UUID PK, firebase_uid unique, name, email, phone, status, dept_id FK, created_at, updated_at).
2. `roles` (id, code unique, name, is_system).
3. `permissions` (id, code unique, description).
4. `role_permissions` (role_id FK, permission_id FK, composite PK).
5. `user_roles` (user_id FK, role_id FK, scope JSONB).
6. `teams` (id, name, manager_id FK).
7. `departments` (id, name, parent_id).
8. `customers` (id, external_ref, name, dob, pii_hash, contact JSONB).
9. `cases` (id, case_number unique, creator_id, customer_id, category_id, priority, current_status, assignee_id, team_id, source_channel, is_proxy, consent_id nullable, created_at).
10. `case_categories` (id, code, name, parent_id, active).
11. `case_status_history` (id, case_id, from_status, to_status, changed_by, reason, changed_at).
12. `assignments` (id, case_id, assigned_to, assigned_by, assignment_type, start_at, end_at).
13. `sla_policies` (id, category_id, priority, response_mins, resolution_mins, warning_thresholds JSONB, business_calendar_id).
14. `case_sla_instances` (id, case_id, policy_id, response_due_at, resolution_due_at, breached_at, status).
15. `escalation_rules` (id, policy_scope JSONB, level, trigger_type, trigger_offset_mins, target_role_id/team_id, active).
16. `escalation_events` (id, case_id, rule_id, level, triggered_at, action_taken).
17. `consent_records` (id, case_id, proxy_creator_id, beneficiary_id, consent_type, consent_channel, captured_at, valid_until, revocation_at, consent_text_version, hash_signature).
18. `documents` (id, case_id, document_type, tags TEXT[], current_version_id, storage_provider, classification).
19. `document_versions` (id, document_id, version_no, object_key, mime_type, size_bytes, checksum_sha256, uploaded_by, uploaded_at).
20. `comments` (id, case_id, author_id, body, visibility_scope, created_at).
21. `notifications` (id, user_id, type, channel, title, body, data JSONB, sent_at, read_at, status).
22. `device_registrations` (id, user_id, platform, fcm_token, app_version, last_seen_at).
23. `audit_logs` (id bigserial, event_id UUID, entity_type, entity_id, action, actor_id, actor_role, ip, user_agent, before JSONB, after JSONB, meta JSONB, prev_hash, curr_hash, created_at).
24. `integrations` (id, code, config_encrypted, status, last_health_at).

### 6.2 Important indexes
- `cases(current_status, priority, team_id, assignee_id, created_at DESC)`
- `cases(case_number)` unique BTree.
- `case_status_history(case_id, changed_at DESC)`
- `case_sla_instances(resolution_due_at, status)`
- `escalation_events(case_id, triggered_at)`
- `audit_logs(entity_type, entity_id, created_at DESC)`
- `audit_logs(created_at)` partitioned monthly.
- GIN indexes for JSONB filter fields and full-text search vectors.

### 6.3 ERD-style explanation
- `users` ↔ many-to-many `roles` through `user_roles`.
- `roles` ↔ many-to-many `permissions` through `role_permissions`.
- `cases` belongs to `customers`, `case_categories`, `users(creator/assignee)`, `teams`.
- `cases` has-many `case_status_history`, `assignments`, `comments`, `documents`, `notifications`, `audit_logs`, `escalation_events`.
- `consent_records` one-to-one or one-to-many with `cases` (based on policy), mandatory when `cases.is_proxy = true`.
- `documents` has-many `document_versions` with `current_version_id` pointer.

---

## SECTION 7: API DESIGN (REST, sample spec)

### 7.1 Auth APIs
- `POST /v1/auth/firebase-login` → verify Firebase token, issue ECMS tokens.
- `POST /v1/auth/refresh` → rotate access token.
- `POST /v1/auth/logout` → revoke refresh token + device token unlink.

### 7.2 User/Role APIs
- `GET /v1/users/me`
- `GET /v1/users?teamId=&role=&status=`
- `POST /v1/users`
- `PATCH /v1/users/:id`
- `POST /v1/roles`
- `PUT /v1/roles/:id/permissions`

### 7.3 Case APIs
- `POST /v1/cases`
- `GET /v1/cases`
- `GET /v1/cases/:id`
- `PATCH /v1/cases/:id`
- `POST /v1/cases/:id/status-transition`
- `POST /v1/cases/:id/reopen`

### 7.4 Assignment/SLA/Escalation APIs
- `POST /v1/cases/:id/assign`
- `POST /v1/cases/:id/reassign`
- `GET /v1/cases/:id/sla`
- `GET /v1/sla/policies`
- `POST /v1/escalations/:caseId/manual`
- `GET /v1/cases/:id/escalations`

### 7.5 Consent APIs
- `POST /v1/consents` (create consent with proof refs)
- `GET /v1/consents/:id`
- `POST /v1/cases/proxy` (requires valid consent)
- `POST /v1/consents/:id/revoke`

### 7.6 Document APIs
- `POST /v1/documents/presign-upload`
- `POST /v1/documents`
- `POST /v1/documents/:id/versions`
- `GET /v1/cases/:id/documents`
- `GET /v1/documents/:id/download-url`

### 7.7 Notification/Dashboard/Audit/Master APIs
- `GET /v1/notifications`
- `POST /v1/devices/register`
- `GET /v1/dashboard/kpis`
- `GET /v1/reports/cases`
- `GET /v1/audit-logs?entityType=&entityId=&from=&to=`
- `GET /v1/masters/statuses|categories|priorities|departments`

### 7.8 Validation and errors (standard)
- Validation: class-validator/Zod schemas.
- Errors:
  - `400 VALIDATION_ERROR`
  - `401 UNAUTHORIZED`
  - `403 FORBIDDEN`
  - `404 NOT_FOUND`
  - `409 CONFLICT`
  - `422 BUSINESS_RULE_VIOLATION`
  - `429 RATE_LIMITED`
  - `500 INTERNAL_ERROR`

---

## SECTION 8: FIREBASE USAGE PLAN

### Use Firebase for
- **Firebase Auth:** sign-in, MFA where required.
- **FCM:** push message transport.
- **Crashlytics (optional):** mobile crash observability.
- **Analytics (optional):** usage telemetry (non-PII).

### Token/device handling
- App gets Firebase ID token.
- Backend verifies token and creates ECMS session.
- FCM token registered via `/devices/register`; rotated on refresh/signout.

### Security rules
- Keep Firebase data surface minimal (avoid business data in Firestore for this architecture).
- Lock down Firebase Storage if used; prefer backend-issued signed URLs.

### What should NOT be in Firebase
- Case state machine, assignments, SLA timers, escalation logic.
- Source-of-truth case data and audits.
- Compliance and consent master records.

---

## SECTION 9: NODE.JS BACKEND STRUCTURE (NestJS, TypeScript)

### 9.1 Framework recommendation
**NestJS** preferred over Express for enterprise scale due to built-in modularity, DI, guards, interceptors, pipes, and testability.

### 9.2 Proposed backend structure
```txt
backend/
  src/
    main.ts
    app.module.ts
    config/
    common/
      decorators/
      guards/
      interceptors/
      filters/
      pipes/
      utils/
    auth/
    users/
    roles/
    cases/
      controllers/
      services/
      repositories/
      dto/
      entities/
      workflows/
    consent/
    sla/
    escalation/
    documents/
    notifications/
    audit/
    dashboard/
    integrations/
    jobs/
    queues/
    health/
  test/
  Dockerfile
  docker-compose.yml
```

### 9.3 Standards
- Hexagonal-ish layering: controller → service → repository.
- DTO validation and transformation at edge.
- No business logic in controllers.
- Idempotency keys for mutating endpoints.
- Structured logs with correlation IDs.

---

## SECTION 10: WORKFLOWS

1. **Standard case creation**
   - User submits form → backend validates → case created → initial status history + SLA instance + audit + notifications.
2. **Proxy case with consent**
   - Capture beneficiary + consent proof → store consent record → verify validity → create case with `is_proxy=true` and `consent_id`.
3. **Assignment**
   - Supervisor assigns → assignment row inserted → case assignee updated → audit + notification.
4. **Reassignment**
   - Must include reason code; prior assignment closed.
5. **SLA calculation**
   - On case create/status change, policy resolver computes deadlines considering business calendar.
6. **Escalation**
   - Queue checks threshold events; if breach/near-breach and unresolved, escalate to configured level.
7. **Resolution/closure**
   - Resolution summary mandatory; closure allowed only after validations/checklist.
8. **Reopen**
   - Allowed within policy window and reason mandatory; new SLA cycle rules configurable.
9. **Document upload/approval**
   - Presigned upload → metadata persist → optional reviewer approval state.
10. **Audit trail generation**
    - Middleware + domain events produce append-only immutable records.
11. **Notification dispatch**
    - Event bus → notification service channel fanout.
12. **Compliance reporting**
    - Periodic aggregate jobs + signed report exports.

---

## SECTION 11: SECURITY & COMPLIANCE

- JWT access (15 min) + rotating refresh (7–30 days).
- MFA for privileged roles.
- RBAC + ABAC and field-level masking (PII).
- TLS everywhere; AES-256 encryption at rest.
- File AV scanning + MIME/extension validation + DLP tags.
- Immutable audit hash chaining + WORM replication.
- Consent evidence with checksum/signature and retention policy.
- OWASP Mobile/API controls: rate limiting, input validation, secure storage, certificate pinning (optional policy).
- GDPR/DPDP readiness: purpose limitation, DSAR support, retention schedules.
- Device posture: jailbreak/root detection signals, token revocation, remote logout.

---

## SECTION 12: NON-FUNCTIONAL REQUIREMENTS

- **Performance:** P95 list API < 400ms at baseline load.
- **Scalability:** horizontal API scale, read replicas for reporting.
- **Reliability:** at-least-once job execution with idempotent handlers.
- **Availability:** target 99.9% (MVP) → 99.95% (enterprise).
- **Security:** quarterly pentest + dependency scanning + SAST/DAST.
- **Logging/Monitoring:** centralized logs, metrics, traces, alerting SLOs.
- **Maintainability:** modular codebase, contract-first APIs, CI quality gates.
- **Backup/DR:** PITR backups, cross-region replication for critical data.
- **Release management:** blue/green or canary deploy with rollback.

---

## SECTION 13: DASHBOARDS & REPORTS

### KPI coverage
- Total/Open/Escalated/Reopened/Resolved/Closed.
- Pending with Customer/Others/Billdesk/CAMS.
- SLA nearing breach / breached.
- Team productivity and assignment workload.
- Consent-based case volume and exceptions.
- Compliance/audit event trends.

### Chart suggestions
- Stacked status bar by team.
- SLA heatmap by category/priority.
- Trend line (daily/weekly/monthly).
- Funnel: created → assigned → resolved → closed.
- Aging buckets (0-1d, 2-3d, 4-7d, >7d).

### Filters
Date range, department, team, assignee, category, priority, region, source channel, proxy yes/no, consent type, escalation level.

---

## SECTION 14: FOLDER STRUCTURE

### A) React Native (TypeScript)
```txt
mobile/
  src/
    app/
    navigation/
    screens/
    components/
    features/
      auth/
      cases/
      consent/
      notifications/
      profile/
    services/
      api/
      firebase/
      storage/
    store/
    hooks/
    utils/
    types/
    theme/
```

### B) Node.js backend
(See Section 9 structure)

### C) Shared contracts
```txt
shared/
  contracts/
    case.ts
    consent.ts
    sla.ts
    notification.ts
  enums/
  validators/
```

---

## SECTION 15: DEVELOPMENT ROADMAP

### Phase 1 (MVP, priority high)
- Auth, core case lifecycle, mandatory statuses, assignment, comments, basic docs, in-app/push notifications, audit baseline, dashboard essentials.

### Phase 2 (Enterprise features)
- Advanced SLA/escalation engine, proxy consent workflows, external integrations, supervisor/admin-lite, rich analytics, offline sync hardening.

### Phase 3 (Optimization + compliance hardening)
- Immutable audit/WORM reinforcement, advanced DLP, DR drills, performance tuning, multi-tenant controls, compliance certification prep.

Dependencies: RBAC and master-data model before workflow/SLA; audit foundation before go-live.

---

## SECTION 16: SAMPLE CODE BLUEPRINTS (TypeScript)

### 16.1 React Native app entry
```ts
// mobile/src/app/App.tsx
export const App = () => <RootNavigator />;
```

### 16.2 Auth flow blueprint
```ts
// mobile/src/features/auth/useAuth.ts
export async function loginWithFirebase(idToken: string) {
  return api.post('/v1/auth/firebase-login', { idToken });
}
```

### 16.3 Dashboard screen blueprint
```ts
// mobile/src/screens/DashboardScreen.tsx
const { data } = useQuery(['kpis'], () => api.get('/v1/dashboard/kpis'));
```

### 16.4 Create case with validation
```ts
// mobile/src/features/cases/schema.ts
export const createCaseSchema = z.object({
  categoryId: z.string().uuid(),
  priority: z.enum(['LOW','MEDIUM','HIGH','CRITICAL']),
  subject: z.string().min(5),
  description: z.string().min(10)
});
```

### 16.5 API client layer
```ts
export const api = axios.create({ baseURL: ENV.API_URL, timeout: 15000 });
```

### 16.6 Notification handling
```ts
messaging().onMessage(async msg => notificationStore.add(msg));
```

### 16.7 NestJS auth module snippet
```ts
@Module({ providers: [AuthService, FirebaseVerifier], controllers: [AuthController] })
export class AuthModule {}
```

### 16.8 Case module service snippet
```ts
async createCase(dto: CreateCaseDto, actor: AuthUser) {
  // validate workflow + persist + init SLA + audit emit
}
```

### 16.9 Consent module snippet
```ts
if (!dto.consentProofDocumentId) throw new UnprocessableEntityException('CONSENT_PROOF_REQUIRED');
```

### 16.10 SLA job snippet
```ts
@Processor('sla-warning-queue')
export class SlaWarningProcessor { /* ... */ }
```

### 16.11 Audit middleware snippet
```ts
@Injectable()
export class AuditInterceptor implements NestInterceptor { /* append audit event */ }
```

### 16.12 File upload service snippet
```ts
async generateUploadUrl(input: PresignDto) { return this.objectStore.presignPut(input); }
```

---

## SECTION 17: RISKS & RECOMMENDATIONS

### Technical risks
- Queue backlog during peak loads → autoscaling workers + queue depth alerts.
- Poor query performance on case list → composite indexes + query plans.
- Mobile offline conflicts → idempotency + conflict resolution UX.

### Functional risks
- Workflow complexity creep → versioned workflow configs and change governance.
- Misuse of proxy creation → strict consent policy checks and periodic audits.

### Compliance risks
- Incomplete audit trail → mandatory middleware + event contracts.
- Improper PII exposure → field masking, access logging, least privilege.

---

## SECTION 18: FINAL RECOMMENDATION

**Recommended target architecture decisions:**
1. **Frontend:** React Native + TypeScript with offline-capable local cache.
2. **Identity/Push:** Firebase Auth + FCM only for identity and push transport.
3. **Backend:** **NestJS modular monolith** (initial), API-first with strict domain modules.
4. **Database:** **PostgreSQL** as system-of-record + partitioned immutable audit logs.
5. **Background processing:** Redis + BullMQ for SLA/escalation/notification jobs.
6. **Documents:** cloud object storage + signed URLs + metadata/versioning in PostgreSQL.
7. **Security/compliance:** hash-chained audit events, consent proof retention, RBAC+ABAC, encryption, and compliance reporting.
8. **Future expansion:** contract-first APIs and shared types enabling web admin portal with minimal backend change.

This provides a production-ready, secure, scalable ECMS foundation aligned to enterprise internal operations and compliance-heavy ticket/case management.
