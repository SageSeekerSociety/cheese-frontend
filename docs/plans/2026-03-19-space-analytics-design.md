# Space Analytics Workspace Design

## Context

The existing Space analytics page is a single legacy view that still relies on deprecated or changed backend contracts:

- `GET /spaces/{spaceId}/analytics/tasks` still assumes the old aggregate report shape
- `GET /spaces/{spaceId}/publishers/participation` is deprecated
- `GET /spaces/{spaceId}/participants/export` is deprecated

The backend has now split analytics into explicit resources:

- `overview`
- `alerts`
- `publishers`
- `tasks`
- `participants`
- dedicated export endpoints for `publishers`, `tasks`, and `participants`

The frontend needs a full migration to the new contract while improving the visual quality and information architecture for both leadership presentation and operational use.

## Goals

- Replace legacy analytics data usage with the new analytics endpoints and schemas
- Build a cohesive analytics workspace under a single sidebar entry
- Preserve one shared filtering model across all analytics sections
- Make the default landing experience leadership-friendly and presentation-ready
- Keep deeper analysis and exports practical for day-to-day operators

## Information Architecture

Use one sidebar entry, `数据分析`, and split analytics inside the page using a shell layout plus sub-routes.

### Routes

- `/spaces/:spaceId/analytics` -> `Overview`
- `/spaces/:spaceId/analytics/alerts` -> `Alerts`
- `/spaces/:spaceId/analytics/publishers` -> `Publishers`
- `/spaces/:spaceId/analytics/tasks` -> `Tasks`
- `/spaces/:spaceId/analytics/participants` -> `Participants`

This mirrors the mental model used in Task Detail: one feature area, one internal navigation system, separate subviews, shared header, shared state.

## Shared Filtering Model

Maintain one URL-synced filter state for the analytics workspace.

### Defaults

- date range: last `180` days
- `taskApproved=APPROVED`
- `groupBy` auto-derived from range

### Global filters

- `from`
- `to`
- `categoryId`
- `taskApproved`

### Shared by some resources

- `publisherId` for `overview`, `tasks`, `participants`
- `groupBy` for `overview`, `participants`
- `sortBy` and `sortOrder` for `publishers`, `tasks`

### Resource-only filters

- `hasPendingReview` for `tasks`
- `hasPendingApproval` for `tasks`
- `participationApproved` for `participants`
- `completionStatus` for `participants`
- `realName` for `participants`

### Query behavior

- filters sync to URL query parameters
- changing section preserves compatible query state
- each API only receives supported params
- export actions reuse the current effective query state

## Visual Direction

The page should feel like an institutional analytics brief rather than a generic admin dashboard.

### Tone

- refined
- credible
- presentation-ready
- restrained, not flashy

### Style principles

- keep alignment with existing Vuetify-based product styling
- elevate visual hierarchy with layered surfaces, subtle gradients, fine borders, and disciplined spacing
- use a composed hero section and polished statistic cards
- make dense operational pages still feel intentional and readable

## Page Designs

### Overview

The default landing page is leadership-first.

- hero with workspace title, current scope summary, and analytics context
- KPI cards for task, publisher, participant, submission, success, and real-student scale
- trends block emphasizing participation, submissions, and success over time
- governance summary cards from `alerts`
- distributions for category, approval status, and completion status

### Alerts

Focused governance page.

- six alert cards
- threshold explanations as supporting text
- direct jump actions into filtered task views
- no heavy tables

### Publishers

Teacher comparison page.

- table-first layout with compact summary highlight strip
- default sort by `taskCount desc`
- export button on the section header

### Tasks

Operational governance page.

- dense task table with quick filters
- highlights pending approvals, pending reviews, and conversion metrics
- export button on the section header

### Participants

Population and completion analysis page.

- summary metrics for participant and student counts
- distributions for approval, completion, grade, major, class, and real-name status
- trends for joins, submissions, and successes
- export button on the section header with current-scope wording

## Data Loading

- `Overview` loads `overview` first and `alerts` alongside it
- `Alerts`, `Publishers`, `Tasks`, `Participants` load lazily on first entry
- route transitions should not force unrelated resources to reload
- explicit refresh remains available in the workspace header

## Migration Notes

- stop using deprecated `publishers/participation`
- stop using deprecated `participants/export`
- stop assuming the old `analytics/tasks` report shape
- render all percentage fields from backend `0-1` values as formatted percentages in UI
- clearly distinguish `报名主体数` and `真实学生人数`

## Testing Strategy

- add test coverage for shared analytics filter/query mapping utilities
- add test coverage for API param shaping where practical
- run targeted lint/build verification for the changed analytics workspace
