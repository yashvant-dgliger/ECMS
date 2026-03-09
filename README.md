# ECMS Application Monorepo

This repository now includes a full implementation scaffold based on the ECMS blueprint:

- `backend/` Node.js TypeScript backend (NestJS-style modular domain layout) with working REST endpoints scaffolded through Express runtime style.
- `mobile/` React Native TypeScript app structure with auth, dashboard, case list/create, and proxy-consent case flow screens.
- `shared/` Shared contracts/enums for statuses, roles, auth, case, and consent models.
- `docs/` Architecture and implementation blueprint.

## Mandatory case statuses included
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

## Implemented key flows
- Standard case creation
- Proxy case creation with consent capture and proof reference
- Status transition with audit logging
- Dashboard KPIs
- Immutable-style chained audit hash
