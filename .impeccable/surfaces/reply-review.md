# Reply review — implemented surface record

## Authority and purpose

This is an ordinary Operate extension of the owner-selected QorStock / Startup Lab shell. PRODUCT.md owns product behavior; DESIGN.md records the inherited visual system. No replacement world, approved comparison comp, comp-led build, or high-ceiling design claim is established by this record.

The coordinator registers an inquiry and assigns an existing employee account. The assigned author prepares a reply, a different administrator reviews the exact current version, and the author can record manual dispatch with supporting evidence. The surface must keep the source context, version, approval, and retained prior checks readable together.

## Current implementation

`public/index.html` supplies the Russian document language, skip link, brand/identity header, native navigation, live status notice, main region, and footer. `public/app.js` renders collection lists, search/archive filters, forms, and reply evidence with DOM text nodes. `public/styles.css` owns the inherited system.

Reply detail flows vertically: title and instruction, evidence section, previous-check disclosure, white form panel, then workflow help. The evidence section shows the version and stage, author, source snapshot, current approval, and any recorded dispatch basis. The form contains source reference, body, stage, and dispatch evidence with Save / Return / Archive actions as available.

The primary heading remains fixed at `2rem`. Body and controls use the system font stack. Native `details` / `summary` presents retained prior checks. Summary is `display: list-item`, `min-height: 44px`, and `padding: 0.7rem 0`, retaining native collapsed and expanded markers. Long identities, headings, evidence paragraphs, and history containers use `min-width: 0` and `overflow-wrap: anywhere`; body snapshots use `white-space: pre-wrap`.

## Workflow vocabulary and boundaries

| State | Meaning on this surface |
| --- | --- |
| Черновик | Assigned author prepares the current body. |
| На проверке | A separate saved stage submits the current version for independent review. |
| Одобрен | A different administrator approved this exact version and body. |
| Body edited | Current approval clears; prior check snapshots remain readable. Save the change as a draft. |
| Отправка отмечена | Author recorded a manual dispatch basis. This is not verified delivery or verified external message content. |
| Archived or sent | The implemented form is locked; retained evidence remains readable. |

This is one shared workspace for one organization. All employees see the shared records; branch names are labels, not access isolation. There is no messaging integration, external sending, mail import, chat, AI integration, WhatsApp, SLA, or CRM. The interface must keep the manual-dispatch caveat explicit.

## Evidence inspected

The documenter read PRODUCT.md and the current public HTML, CSS, and JavaScript. It opened these supplied current captures; it performed no browser actions:

- `../../../../../outputs/products/orta-inbox-desktop-full.png`: current reply detail at desktop width, expanded previous checks, locked manual-dispatch form, and footer.
- `../../../../../outputs/products/orta-inbox-mobile-current.png`: the same current detail on a narrow screen with expanded history and wrapping actions.
- `../../../../../outputs/products/orta-inbox-mobile-long.png`: synthetic long identity and unbroken source/question text wrapping inside the narrow page; collapsed history retains its native marker.

`../../../../program/orta-inbox-wrap-proof.json` records viewport width `390`, document scroll width `390`, identity width `140`, summary display `list-item`, evidence wrapping `anywhere`, a synthetic username length of `80`, and an unbroken source token length of `190` for the supplied long-text check. These are recorded observations for that check, not an assertion covering every possible string or state.

## Review history and scope

The initial reviewer requested recapture. After valid captures were supplied, a full review requested two fixes: F1, the missing native disclosure marker; and F2, long dynamic identity/evidence overflow. The build applied those fixes and supplied current captures.

`../../../../program/orta-inbox-finish-review.json` records final disposition **ship** at the scored-fix scope only: F1 resolved and F2 resolved. The final verdict has no listed regressions within that pass. It is not a new whole-surface review, a security audit, or evidence that uncaptured states passed.

The regex detector reached only two UI files. Its attempted `--format json` mode was unsupported, and no parsed-page checks were completed. No detector clean bill is claimed; an empty detector artifact is not a successful parsed result.

## Documentation boundary

This pass created DESIGN.md, .impeccable/design.json, and this surface record only. It did not change application code, tests, screenshots, product behavior, or unrelated design drift. The sidecar's tonal ramps are documentation preview extensions derived from current colors; they are not added runtime palette tokens. Component snippets reproduce current controls for a documentation panel and do not create new product flows.
