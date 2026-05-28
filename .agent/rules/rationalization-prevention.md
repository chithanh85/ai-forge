# Rationalization Prevention

Agents must read this rule before writing code, changing workflow gates, or
claiming a task is complete. If any excuse below appears in your reasoning,
stop, write the rebuttal into the active adversarial validation artifact, and
perform the required discipline anyway.

| Excuse                                                     | Rebuttal                                                                                         |
| ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| "This is too simple to test."                              | Simple code still breaks. Write the smallest meaningful test first.                              |
| "I will add tests after implementation."                   | Tests-after only describe what was built. TDD must prove the desired behavior first.             |
| "Manual testing is faster."                                | Manual checks are not repeatable guardrails. Add automated coverage for the gate or behavior.    |
| "The checklist is overkill for this change."               | The checklist catches integration drift. Run it unless the user explicitly narrows verification. |
| "This is just documentation."                              | Workflow documentation controls agent behavior. Review it like executable policy.                |
| "The current plan is enough."                              | Hydrate only the active phase and verify it contains the acceptance criteria needed now.         |
| "One reviewer score is probably fine."                     | Review decisions must record explicit scores from required reviewers. Any score below 3 blocks.  |
| "Broken wiki links are only warnings."                     | Strict wiki lint treats broken links as build failures. Fix or remove the link.                  |
| "GitNexus cannot see this file, so impact is unnecessary." | Record the UNKNOWN blast radius and reason about direct workflow, CI, and hook consumers.        |
| "I can skip adversarial validation this time."             | Rationalization checks are part of adversarial validation and must be recorded.                  |

## Required Check

Before writing implementation code, answer in the active artifact or working
notes:

1. Which excuse is most tempting for this task?
2. What is the rebuttal from the table?
3. What concrete action proves the rebuttal was followed?

Record the answer under `rationalization_checks` in
`.agent/artifacts/<run-id>/adversarial-validation.json`.
