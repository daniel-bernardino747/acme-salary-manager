# Issue tracker: GitHub

Issues and PRDs for this repo live as GitHub issues. Use the `gh` CLI for all operations.

## Conventions

- **Create an issue**: `gh issue create --title "..." --body "..."`. Use a heredoc for multi-line bodies.
- **Read an issue**: `gh issue view <number> --comments`, filtering comments by `jq` and also fetching labels.
- **List issues**: `gh issue list --state open --json number,title,body,labels,comments --jq '[.[] | {number, title, body, labels: [.labels[].name], comments: [.comments[].body]}]'` with appropriate `--label` and `--state` filters.
- **Comment on an issue**: `gh issue comment <number> --body "..."`
- **Apply / remove labels**: `gh issue edit <number> --add-label "..."` / `--remove-label "..."`
- **Close**: `gh issue close <number> --comment "..."`

Infer the repo from `git remote -v` — `gh` does this automatically when run inside a clone.

## Pull requests as a triage surface

**PRs as a request surface: no.** _(Set to `yes` if this repo treats external PRs as feature requests; `/triage` reads this flag.)_

When set to `yes`, PRs run through the same labels and states as issues, using the `gh pr` equivalents:

- **Read a PR**: `gh pr view <number> --comments` and `gh pr diff <number>` for the diff.
- **List external PRs for triage**: `gh pr list --state open --json number,title,body,labels,author,authorAssociation,comments` then keep only `authorAssociation` of `CONTRIBUTOR`, `FIRST_TIME_CONTRIBUTOR`, or `NONE` (drop `OWNER`/`MEMBER`/`COLLABORATOR`).
- **Comment / label / close**: `gh pr comment`, `gh pr edit --add-label`/`--remove-label`, `gh pr close`.

GitHub shares one number space across issues and PRs, so a bare `#42` may be either — resolve with `gh pr view 42` and fall back to `gh issue view 42`.

## When a skill says "publish to the issue tracker"

Create a GitHub issue, then link it to the deliverable **spine** — the issue that
carries this deliverable through the whole arc (see *Deliverable spine and handoff
PRs* below). Published tickets become **sub-issues** of the spine; a published
spec references it with `Part of #<spine>` in its body.

## When a skill says "fetch the relevant ticket"

Run `gh issue view <number> --comments`.

## Wayfinding operations

Used by `/wayfinder`. The **map** is a single issue with **child** issues as tickets.

- **Map**: a single issue labelled `wayfinder:map`, holding the Notes / Decisions-so-far / Fog body. `gh issue create --label wayfinder:map`.
- **Child ticket**: an issue linked to the map as a GitHub sub-issue (`gh api` on the sub-issues endpoint). Where sub-issues aren't enabled, add the child to a task list in the map body and put `Part of #<map>` at the top of the child body. Labels: `wayfinder:<type>` (`research`/`prototype`/`grilling`/`task`). Once claimed, the ticket is assigned to the driving dev.
- **Blocking**: GitHub's **native issue dependencies** — the canonical, UI-visible representation. Add an edge with `gh api --method POST repos/<owner>/<repo>/issues/<child>/dependencies/blocked_by -F issue_id=<blocker-db-id>`, where `<blocker-db-id>` is the blocker's numeric **database id** (`gh api repos/<owner>/<repo>/issues/<n> --jq .id`, _not_ the `#number` or `node_id`). GitHub reports `issue_dependencies_summary.blocked_by` (open blockers only — the live gate). Where dependencies aren't available, fall back to a `Blocked by: #<n>, #<n>` line at the top of the child body. A ticket is unblocked when every blocker is closed.
- **Frontier query**: list the map's open children (`gh issue list --state open`, scoped to the map's sub-issues / task list), drop any with an open blocker (`issue_dependencies_summary.blocked_by > 0`, or an open issue in the `Blocked by` line) or an assignee; first in map order wins.
- **Claim**: `gh issue edit <n> --add-assignee @me` — the session's first write.
- **Resolve**: `gh issue comment <n> --body "<answer>"`, then `gh issue close <n>`, then append a context pointer (gist + link) to the map's Decisions-so-far.

## Deliverable spine and handoff PRs

The **spine** is the one issue per deliverable that the whole arc hangs off —
discovery, design, prototype, validation, tickets, code. Anyone downstream (the
dev at the far end most of all) opens the spine and walks back through the linked
PRs to reconstruct why the work is what it is. This is the index; the PRs are the
narrative. Skills that produce an arc artifact use the operations here.

### The spine issue

- **Open** (once per deliverable, by `/to-business-rules` when discovery starts —
  or by `/propagate-feedback` when a change with no prior discovery arrives):
  `gh issue create --label spine --title "<deliverable>" --body "<checklist>"`.
  The deliverable is an *area*, not a meeting (`agendamento`, not
  `reunião-2026-07-22`) — same boundary as `docs/discovery/<area>.md`. If a
  project groups deliverables, add them to a GitHub **milestone** named for the
  project; the milestone is the project layer, never the spine.
- **Body** — a phase checklist the producing skill ticks as each phase lands, so
  the spine shows status without anyone moving a label:

  ```md
  Espinha do entregável. Cada fase fecha com um PR linkado abaixo.

  - [ ] Discovery — `docs/discovery/`
  - [ ] Design system — `docs/design-system.md`
  - [ ] Capabilities — relatório de capabilities
  - [ ] Protótipo — `docs/prototypes/`
  - [ ] Validação com o cliente
  - [ ] Spec & tickets
  - [ ] Build
  ```

- **Find the open spine** for a deliverable before opening a second one:
  `gh issue list --label spine --state open --json number,title`. One spine per
  deliverable — reuse it, don't fork it.
- **Tick a phase**: when a phase's PR merges, check its box in the spine body
  (`gh issue edit <spine> --body "<updated>"` or edit via the API).

### Handoff PRs

Every arc artifact that lands as a file (`docs/discovery/`, `docs/design-system.md`,
the capability report, `docs/prototypes/`, the reconciliation note) closes with a
**PR**, not a bare commit. The PR carries two things a commit can't: a **narrative
body** (the *why* — what this phase decided and what it left open) and a
**notification** to whoever comes next.

1. **Branch** off the default branch: `<phase>/<area>` (e.g. `discovery/agendamento`).
2. **Commit** the artifact.
3. **Open the PR**, body linked to the spine and written as narrative:

   ```md
   Part of #<spine>

   ## O que esta fase decidiu
   {the substance — not "adiciona arquivo"}

   ## Em aberto
   {what the next branch inherits unresolved}
   ```

   `gh pr create --base <default> --head <phase>/<area> --title "<phase>: <area>" --body "..."`.
4. **Assign only on a handoff** — a transition that changes *who* works next.
   Assign the next role's handle from `docs/agents/team.md` and @mention them in
   the PR body: `gh pr edit <n> --add-assignee <handle>`. Within-branch artifacts
   (a design-system PR that the same designer will prototype from) link the spine
   and open the PR for the record, but assign no one — they ring no bell.
5. **Review is available, not required.** A handoff PR does not block the next
   branch on approval — merging it is the "pode começar" signal, and the two design
   branches both start from that merge. Reviewers *may* comment; a `CODEOWNERS`
   entry per path (e.g. `docs/design-system.md`) auto-requests the owning role as
   reviewer, but their approval is never a gate. (No `docs/discovery/` gate: the
   client already validated discovery; the designer consumes it, they don't veto it.)
6. **Confirm before firing.** Opening a PR and assigning a person notifies real
   people — always confirm with the user before `gh pr create` / `--add-assignee`.

Which transitions are handoffs (assign the next role) vs within-branch (link only):

| PR from | Assigns | Because |
|---|---|---|
| discovery (`/to-business-rules`) | design **and** dev | discovery feeds both branches |
| design system, capabilities | — | same role continues into prototype / build |
| prototype (`/prototype`) | whoever runs client validation | it goes to the client |
| reconciliation (`/propagate-feedback`) | every branch a change touched | the fan-out |

### The build phase

`/to-spec`, `/to-tickets` and `/implement` already speak to this tracker: the spec
and tickets publish as issues linked to the spine (above), and the code PR from
`/implement` gets `Part of #<spine>` in its body like any handoff PR. Nothing new
to learn — the spine is just the parent they reference.
