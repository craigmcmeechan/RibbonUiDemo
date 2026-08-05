# Project Agent Instructions

## Plan execution workflow

When a plan exists:

1. Break it into ordered steps, then split each step into bounded sub-steps with a defined outcome and verification scope.
2. Maintain the repository-root `TODO.md`. Record every step and sub-step, its completion status, and exactly one active sub-step.
3. Complete only one bounded sub-step at a time.
4. After each sub-step is implemented:
   - Run thorough relevant tests, including targeted tests and appropriate broader regression checks.
   - Run GitNexus analysis. Include change detection and impact analysis when they apply.
   - Review all test and GitNexus results and resolve relevant findings.
   - Update `TODO.md` to mark the sub-step complete and identify the next active sub-step, if any.
5. Only after verification and review succeed, commit that sub-step by itself and push it to GitHub.

Do not combine unverified sub-steps in one commit. If required tests, GitNexus analysis, commit, or push cannot be completed, stop and report the exact limitation rather than treating the sub-step as complete.
