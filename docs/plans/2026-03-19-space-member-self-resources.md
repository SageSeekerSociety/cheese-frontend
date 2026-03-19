# Space Member Self Resources Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace the space member `我发布的赛题 / 我参与的赛题` views with dedicated pages backed by the new self-resource APIs.

**Architecture:** Keep the existing tasks shell and sidebar placement, add two dedicated child routes under the tasks section, and implement small shared utilities plus lightweight member-facing overview/list card components. The public `全部赛题` page remains separate and no longer multiplexes `published/joined` behavior through query state.

**Tech Stack:** Vue 3, Vue Router, Pinia, Vuetify, Vitest, TypeScript

---

### Task 1: Add query utils and tests

**Files:**
- Create: `src/views/spaces/detail/member-tasks/utils.ts`
- Create: `src/views/spaces/detail/member-tasks/__tests__/utils.test.ts`

**Step 1:** Write failing tests for default query normalization and backend param omission for `ALL` filters.

**Step 2:** Run the focused test file and verify the new cases fail.

**Step 3:** Implement the minimal query-state helpers for:
- publishing filters
- participating filters
- serialization
- API param builders

**Step 4:** Re-run the focused test file and verify it passes.

### Task 2: Extend spaces API typings

**Files:**
- Modify: `src/network/api/spaces/types.ts`
- Modify: `src/network/api/spaces/index.ts`

**Step 1:** Add types for:
- `SpaceMyPublishingOverview`
- `SpaceMyPublishedTasks`
- `SpaceMyPublishedTask`
- `SpaceMyParticipatingOverview`
- `SpaceMyParticipations`
- `SpaceMyParticipation`

**Step 2:** Add request wrappers for the four self-resource endpoints.

**Step 3:** Run TypeScript-aware lint/build checks for the touched files.

### Task 3: Split routing and sidebar entries

**Files:**
- Modify: `src/router/spaces.ts`
- Modify: `src/components/spaces/SpaceSidebar.vue`
- Modify: `src/views/spaces/detail/Tasks.vue`
- Modify: `src/views/spaces/detail/PublishTask.vue`

**Step 1:** Add dedicated tasks child routes for:
- `SpacesDetailMyPublishing`
- `SpacesDetailMyParticipating`

**Step 2:** Update sidebar links and active logic to stop using `query.type`.

**Step 3:** Simplify `Tasks.vue` so it only represents the public all-tasks feed.

**Step 4:** Redirect publish success to the new publishing page.

### Task 4: Build member-facing publishing page

**Files:**
- Create: `src/views/spaces/detail/member-tasks/MyPublishing.vue`
- Create as needed under: `src/views/spaces/detail/member-tasks/components/`

**Step 1:** Load publishing overview and list data from the new endpoints.

**Step 2:** Render four focused overview cards.

**Step 3:** Add compact enum-based filters and sorting controls.

**Step 4:** Render member-facing task cards with:
- status chips
- key metrics
- links to task detail / participants / submissions

### Task 5: Build member-facing participating page

**Files:**
- Create: `src/views/spaces/detail/member-tasks/MyParticipating.vue`
- Create as needed under: `src/views/spaces/detail/member-tasks/components/`

**Step 1:** Load participating overview and participation list data from the new endpoints.

**Step 2:** Render four focused overview cards.

**Step 3:** Add compact enum-based filters and sorting controls.

**Step 4:** Render participation cards with:
- identity and team context
- approval/completion status
- latest submission/review summary
- primary submit/resubmit action

### Task 6: Verify and finish

**Files:**
- Verify touched files from Tasks 1-5

**Step 1:** Run focused tests:
`pnpm test -- run src/views/spaces/detail/member-tasks/__tests__/utils.test.ts`

**Step 2:** Run lint on touched files.

**Step 3:** Run full build:
`pnpm build`

**Step 4:** Review the final diff for route consistency, empty states, and action links.
