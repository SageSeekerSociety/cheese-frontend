# Space Analytics Workspace Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace the legacy Space analytics page with a routed analytics workspace that uses the new backend contracts, shared URL-synced filters, and refined presentation-ready UI.

**Architecture:** Add a routed analytics shell under `/spaces/:spaceId/analytics`, centralize query/filter mapping in a shared composable or utility, update the Spaces API layer to the new resources, and implement five focused subviews that consume the shared state and lazy-load their own data. Reuse one sidebar entry and internal tabs, similar to Task Detail.

**Tech Stack:** Vue 3, Vue Router, Pinia-friendly composables, TypeScript, Vuetify 3, Vitest, vue-tsc, Vite

---

### Task 1: Define new analytics API contracts

**Files:**
- Modify: `src/network/api/spaces/types.ts`
- Modify: `src/network/api/spaces/index.ts`
- Test: `src/network/api/spaces/__tests__/analytics-utils.test.ts`

**Step 1: Write the failing test**

Add tests for analytics filter-to-query mapping helpers, including:

- default `180` day range output
- selective inclusion of resource-supported params
- export endpoint query reuse

**Step 2: Run test to verify it fails**

Run: `pnpm test src/network/api/spaces/__tests__/analytics-utils.test.ts`

Expected: FAIL because helper types and functions do not exist yet.

**Step 3: Write minimal implementation**

- replace legacy analytics types with new schema-backed types
- add endpoint wrappers for:
  - `getAnalyticsOverview`
  - `getAnalyticsAlerts`
  - `getAnalyticsPublishers`
  - `getAnalyticsTasks`
  - `getAnalyticsParticipants`
- add export URL/query helper support

**Step 4: Run test to verify it passes**

Run: `pnpm test src/network/api/spaces/__tests__/analytics-utils.test.ts`

Expected: PASS

**Step 5: Commit**

```bash
git add src/network/api/spaces/types.ts src/network/api/spaces/index.ts src/network/api/spaces/__tests__/analytics-utils.test.ts
git commit -m "feat(spaces): add analytics api contracts"
```

### Task 2: Build shared analytics shell and query state

**Files:**
- Modify: `src/router/spaces.ts`
- Modify: `src/components/spaces/SpaceSidebar.vue`
- Create: `src/views/spaces/detail/analytics/AnalyticsLayout.vue`
- Create: `src/views/spaces/detail/analytics/composables/useSpaceAnalyticsFilters.ts`
- Create: `src/views/spaces/detail/analytics/components/AnalyticsNavigationTabs.vue`
- Create: `src/views/spaces/detail/analytics/components/AnalyticsHero.vue`
- Create: `src/views/spaces/detail/analytics/components/AnalyticsFilterBar.vue`
- Test: `src/views/spaces/detail/analytics/__tests__/useSpaceAnalyticsFilters.test.ts`

**Step 1: Write the failing test**

Add tests for:

- route query parsing into filter state
- query serialization when filters change
- auto `groupBy` selection based on date window

**Step 2: Run test to verify it fails**

Run: `pnpm test src/views/spaces/detail/analytics/__tests__/useSpaceAnalyticsFilters.test.ts`

Expected: FAIL because the composable does not exist.

**Step 3: Write minimal implementation**

- create the routed analytics shell
- move sidebar route target from legacy analytics page to the new analytics root
- implement shared filter state and URL sync
- add hero and top-level tabs

**Step 4: Run test to verify it passes**

Run: `pnpm test src/views/spaces/detail/analytics/__tests__/useSpaceAnalyticsFilters.test.ts`

Expected: PASS

**Step 5: Commit**

```bash
git add src/router/spaces.ts src/components/spaces/SpaceSidebar.vue src/views/spaces/detail/analytics
git commit -m "feat(spaces): add analytics workspace shell"
```

### Task 3: Implement overview and alerts experience

**Files:**
- Create: `src/views/spaces/detail/analytics/Overview.vue`
- Create: `src/views/spaces/detail/analytics/Alerts.vue`
- Create: `src/views/spaces/detail/analytics/components/MetricCard.vue`
- Create: `src/views/spaces/detail/analytics/components/DistributionCard.vue`
- Create: `src/views/spaces/detail/analytics/components/TrendPanel.vue`
- Create: `src/views/spaces/detail/analytics/components/AlertCard.vue`

**Step 1: Write the failing test**

Add component tests for rendering overview metrics and alert cards from API responses.

**Step 2: Run test to verify it fails**

Run: `pnpm test src/views/spaces/detail/analytics/__tests__/overview-alerts.test.ts`

Expected: FAIL because the views do not exist.

**Step 3: Write minimal implementation**

- load overview and alerts with current shared filters
- render leadership-focused hero, KPI cards, trends, and alert summaries
- add jump actions from alerts into filtered tasks views

**Step 4: Run test to verify it passes**

Run: `pnpm test src/views/spaces/detail/analytics/__tests__/overview-alerts.test.ts`

Expected: PASS

**Step 5: Commit**

```bash
git add src/views/spaces/detail/analytics
git commit -m "feat(spaces): add overview analytics views"
```

### Task 4: Implement publishers, tasks, and participants views

**Files:**
- Create: `src/views/spaces/detail/analytics/Publishers.vue`
- Create: `src/views/spaces/detail/analytics/Tasks.vue`
- Create: `src/views/spaces/detail/analytics/Participants.vue`
- Create: `src/views/spaces/detail/analytics/components/ExportButton.vue`
- Create: `src/views/spaces/detail/analytics/components/SectionTableCard.vue`

**Step 1: Write the failing test**

Add tests for:

- correct route-scoped filter usage
- export URL generation
- percentage rendering from `0-1` values

**Step 2: Run test to verify it fails**

Run: `pnpm test src/views/spaces/detail/analytics/__tests__/section-views.test.ts`

Expected: FAIL because the section views do not exist.

**Step 3: Write minimal implementation**

- publishers table with supported sorting
- tasks governance table with quick filters
- participants metrics, distributions, and trends
- section-scoped export actions using backend CSV endpoints

**Step 4: Run test to verify it passes**

Run: `pnpm test src/views/spaces/detail/analytics/__tests__/section-views.test.ts`

Expected: PASS

**Step 5: Commit**

```bash
git add src/views/spaces/detail/analytics
git commit -m "feat(spaces): add analytics section views"
```

### Task 5: Remove legacy page and verify end to end

**Files:**
- Modify: `src/i18n/messages/zh-CN/spaces.json`
- Delete or replace: `src/views/spaces/detail/AnalyticsTasks.vue`

**Step 1: Write the failing test**

Add a lightweight route integration test that asserts the analytics root renders the new shell instead of the legacy report page.

**Step 2: Run test to verify it fails**

Run: `pnpm test src/views/spaces/detail/analytics/__tests__/routing.test.ts`

Expected: FAIL against the old route target.

**Step 3: Write minimal implementation**

- route analytics entry to the new workspace
- remove obsolete legacy logic
- update i18n strings used by the new UI

**Step 4: Run test to verify it passes**

Run: `pnpm test src/views/spaces/detail/analytics/__tests__/routing.test.ts`

Expected: PASS

**Step 5: Commit**

```bash
git add src/router/spaces.ts src/i18n/messages/zh-CN/spaces.json src/views/spaces/detail/AnalyticsTasks.vue src/views/spaces/detail/analytics
git commit -m "feat(spaces): migrate analytics workspace"
```
