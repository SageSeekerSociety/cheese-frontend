# Space Member Self Resources Design

## Goal

Replace the current query-based `我发布的赛题 / 我参与的赛题` modes in the space task list with two dedicated member-facing pages powered by the new self-resource APIs.

## Scope

- Keep the existing sidebar placement under the `赛题` section.
- Keep `全部赛题` as the existing public task feed.
- Add separate pages for:
  - `我发布的赛题`
  - `我参与的赛题`
- Use the new APIs:
  - `/spaces/{spaceId}/me/publishing`
  - `/spaces/{spaceId}/me/publishing/tasks`
  - `/spaces/{spaceId}/me/participating`
  - `/spaces/{spaceId}/me/participations`

## UX Direction

- Keep these pages product-like and member-facing, not admin-table-like.
- Use a lightweight page header, not a hero panel.
- Show four focused overview cards at the top.
- Use structured content cards for the list instead of data tables.
- Keep filters compact and enum-driven.

## Information Architecture

- `全部赛题`
  - Existing content feed page
- `我发布的赛题`
  - Overview cards
  - Filter row
  - Published task cards
- `我参与的赛题`
  - Overview cards
  - Filter row
  - Participation cards

## Routing

Keep all three views inside the existing `SpacesDetailTasks` section so they continue to share the current page header shell:

- `/spaces/:spaceId/tasks`
- `/spaces/:spaceId/tasks/my/publishing`
- `/spaces/:spaceId/tasks/my/participating`

## Data Model Notes

- Overview requests are independent from list filters and can load once on entry.
- List filters should sync to URL query using fixed enums only.
- When a UI filter means “all”, omit that backend parameter instead of sending an invalid enum.

## Interaction Notes

### My Publishing

- Task title links to task detail.
- Pending approval count links to task participant management.
- Pending review count links to task submission review.
- Keep metrics readable on the card without dense table columns.

### My Participating

- Task title links to task detail.
- Show identity type and team name when relevant.
- Primary action:
  - `重新提交` when `completionStatus=REJECTED_RESUBMITTABLE` and `canSubmit=true`
  - otherwise `去提交` when `canSubmit=true`
- Keep secondary state visible with chips and helper text.

## Empty States

- No publishing records: encourage creating a task.
- No participation records: guide the user back to `全部赛题`.

## Non-Goals

- No admin analytics layout reuse.
- No participation context injection into task detail in this pass.
- No redesign of the existing public `全部赛题` feed beyond removing the old `published/joined` mode switching.
