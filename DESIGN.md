# OrtaInbox design contract

A calm dispatch desk for manual requests and exact reply review. The desktop shell uses a narrow violet charcoal navigation column, a compact request queue and a wide reading/review pane. The queue and selected detail are real DOM, built from saved records. This direction replaces the previous shared blue cabinet under the owner’s 26 October request for a distinct product composition.

## Screen contract

The default collection is requests. Selecting a queue item on desktop keeps focus on its native button and updates the adjacent detail: source question, branch, assigned account, latest active reply, exact version, current approval and immutable review history. Reply status is always written in words. A separate reply collection uses the same review composition. Branches remain a secondary native table.

The assigned author can open a prefilled first-reply form for an open request in an active branch. Once a reply’s manual dispatch is recorded, the same conditions allow opening a prefilled new-reply form. Other users read the dossier and use the existing editor subject to the server’s author/admin rules. The UI never sends messages. A recorded dispatch is labelled as a manual mark and does not establish delivery.

All requests, replies, branch management, full-text search, archive visibility, existing account administration, backup/restore and audit remain available. Filtering has a no-result state and explicit reset. Missing reference data links to its real collection through the collapsed workflow guide. Pending initiating buttons expose aria-busy and a visible ellipsis; refusals retain the existing focused live notice.

## Tokens and typography

System sans with optical sizing, tight heading tracking and relaxed message leading. Primary `#5045a5`, hover `#3c3283`, sidebar `#27243e`, ink `#222238`, muted `#626276`, page `#f6f6fa`, white surface, line `#dedeea`. Reply reading is a deliberate open measure; metadata uses compact mono labels. Controls are 8px radius; the queue/detail enclosure is 14px. No external font, image or icon requests.

## Responsive and access rules

At 1100px the navigation becomes a left column; at 650px the queue stacks before the review pane. Every grid uses minmax(0,…), long questions/reply text wrap, and only secondary tables own horizontal scrolling. Native buttons are at least 44px, inputs 48px, labels remain connected, focus is explicit and the archive checkbox has a 44px containing label. Reduced motion removes transitions. Light surfaces are intentional; no unverified dark scheme is advertised.

## Evidence and limits

This frontend increment passed all 13 existing Node tests and app/product-view syntax checks on bundled Node 24.19.0. Those tests validate domain/server guarantees, not visual acceptance. Current 390/768/1440 browser screenshots, role-switch flow, keyboard traversal and console checks are pending parent QA. Earlier docs screenshots describe the earlier UI. No release acceptance, external integration or delivery is established by this change.

On narrow screens, choosing an item moves focus to the selected workspace; a return button restores focus to the chosen queue item. The mobile queue has its own bounded scrolling area so long collections do not bury the primary task.

## Final collection chrome refinement · 26 October 2026

The current collection header places create/refresh beside the title and a short task-specific description. A connected search label, archive toggle and live record count share one filter rail; the workflow guide follows the primary records. This removes the repeated heading/intro/help/actions/search/count stack while preserving the task-specific workspaces and mobile selection/focus behavior. The source/refusal/role controls remain unchanged. Counts use tabular numerals and the root uses antialiased system text. No motion or asset dependency was added.

The supplied desktop scaffold screenshots were visually inspected before this pass. Fresh rendered positions, keyboard/mobile behavior and console checks still require the parent browser pass; no pixel-position acceptance is inferred from CSS alone.
