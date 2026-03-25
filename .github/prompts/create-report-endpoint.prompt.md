---
agent: ask
description: Backend-only prompt to scaffold a new report endpoint in NestJS.
---

You are working ONLY inside `generador-reportes-backend`.

Task:
Implement a new report endpoint using the established backend structure.

Before coding, ask for:
- report type name
- endpoint route
- FileMaker layout/source
- output fields

Implementation checklist:
1) Create/update interface in `src/interfaces/reports/`
2) Create mapper at `src/reports/<report-type>/<report-type>.mapper.ts`
3) Create service at `src/reports/<report-type>/<report-type>.service.ts`
4) Create controller at `src/reports/<report-type>/<report-type>.controller.ts`
5) Wire module imports/providers/exports in `src/reports/reports.module.ts`
6) Ensure JWT guard usage matches existing protected endpoints

Quality gates:
- Must compile with `npm run build`
- Must pass lint with `npm run lint`
- Keep edits scoped to backend only

Output format:
- List changed files
- Show new route
- Mention any TODOs/assumptions
