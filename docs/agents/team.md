# Team

Who plays each role on this project. Skills read this file to know **who to assign
a handoff PR to** — when discovery finishes, `/to-business-rules` hands off to the
`design` and `dev` handles below. One indirection file, same posture as the issue
tracker (ADR 0001): the skills see the team only through here, so growing the team
or moving to another tracker never touches a skill.

## Roles

| Role | GitHub handle | Who / notes |
|---|---|---|
| `discovery` | @daniel-bernardino747 | Runs `/to-business-rules`, owns `docs/discovery/`. |
| `design` | @daniel-bernardino747 | Runs the Product design branch — `/establish-design-system`, `/prototype`. |
| `dev` | @daniel-bernardino747 | Runs the technical branch and build — `/assess-capabilities`, `/implement`. |

Add rows for any other role a handoff targets (QA, a second designer). A role with
no handle yet: leave `@{handle}` and the skill will ask before assigning, rather
than guess.

## How skills use this

- **Handoff PR** (see `docs/agents/issue-tracker.md` › *Deliverable spine and
  handoff PRs*): the producing skill assigns the *next* role's handle here and
  @mentions them.
- **One person, many hats?** Point several roles at the same handle. The handoff
  still opens a PR and ticks the spine — the record survives even when the bell
  rings for you.
