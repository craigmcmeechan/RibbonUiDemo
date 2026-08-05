# Local-model workflow for Codex work

## Purpose and boundary

This project may route selected work through models reached at the local Ollama endpoint to reduce hosted Codex usage. This is an operating policy, not repository-managed Codex configuration. Do not commit provider configuration, credentials, access tokens, or machine-specific paths.

The supported Codex provider contract is the Responses API. A provider is usable only if its endpoint implements the Responses protocol and the tool behavior required by the task. A successful text completion alone is not sufficient validation.

## Current tested services

The following non-sensitive smoke tests were run on 2026-08-05 against `http://localhost:11434`:

- `gemma3:4b` completed a request through `/v1/responses`. Ollama reports it as a local GGUF model, so it is the fully local helper.
- `kimi-k2.7-code:cloud` completed a Responses request, emitted a correctly shaped function call, and consumed a tool result in a narrow follow-up test.
- The exact Kimi identifier was callable but was not advertised by `/v1/models` or `/api/tags`. Do not assume model-list discovery proves availability.
- The Kimi identifier is routed through the local Ollama endpoint but identifies a cloud-hosted model. It can reduce Codex consumption, but it is not fully local or on-device inference; prompts and supplied context must be treated as externally processed.
- Earlier/broader testing found weaker follow-up-instruction fidelity than the narrow exact-output smoke test. These results establish reachability and basic protocol capability, not autonomous implementation reliability.

Re-run a harmless compatibility test after an Ollama, Codex, or model update. Validate Responses streaming if used, structured tool calls, tool-result continuation, cancellation/timeouts, malformed tool results, and instruction fidelity before relying on the model.

## Three-role operating model

### Gemma 3 local helper

Use `gemma3:4b` for simple, non-sensitive, isolated work: summaries and documentation first drafts; formatting or mechanical text transformations; basic lint/test-log triage; first-pass orientation from a bounded excerpt; and summarizing local tool output before a necessary hosted handoff.

Gemma does not approve design, code, tests, or commits. Redact secrets, personal data, customer data, and unnecessary repository content before any summary is forwarded to a hosted model. Gemma has its own pool of at most three concurrent tasks.

### Kimi coding worker

Use `kimi-k2.7-code:cloud` only for bounded, fully specified implementation sub-steps. Give it the minimum required context and no secrets. It may produce a candidate patch and test evidence, but it does not interpret ambiguous requirements, approve architecture, assess security/reliability, run final GitNexus review, or approve a commit.

Kimi has a separate pool of at most two concurrent coding-worker instances. Never exceed two Kimi workers even when Gemma capacity is unused.

### Hosted Codex lead

The hosted lead owns requirement interpretation, plan approval, decomposition, scheduling, architecture/API decisions, security/privacy/reliability/accessibility judgement, independent diff inspection, test assessment, GitNexus change/impact review, final integration, user-facing conclusions, and commit approval.

Any output that changes code, makes a project decision, or claims verification requires hosted review. A worker's self-reported test result is evidence to inspect, not proof.

## Scheduling limits

- Gemma: zero to three concurrent simple helper tasks.
- Kimi: zero to two concurrent bounded coding tasks.
- Qwen3-Coder (qwen34): zero to three concurrent instances. This is the orchestrator model; the orchestrator counts as one of the three.
- Agents: zero to three concurrent agents in total. This orchestration chat is one agent; the remaining two worker slots may be filled by either two Kimi workers or two additional qwen34 (same-model) instances. Mixing one Kimi and one qwen34 worker is also allowed, but each pool cap still applies (Kimi <= 2, qwen34 <= 3 including the orchestrator).
- Hosted lead: one integration/review authority for the active sub-step.

Use concurrency only for independent scopes. Do not assign overlapping files, the same TODO sub-step, or dependent outputs concurrently. A lower Codex/session cap still wins if the runtime imposes one. These pool limits are operating policy; the example Codex configuration does not enforce provider-specific pools automatically.

### Safe parallelization for shared-scaffold work

When the active sub-steps share integration files (for example Phase 3 atoms, which all register into the same component catalog and barrel), parallelize only the independent per-component folders. Each worker creates exactly its own component folder and returns the file set plus the catalog entry it needs (schema `$id` and import path); workers must not run `component:scaffold`, edit the shared catalog/barrel files, edit `TODO.md`, or commit. The orchestrator integrates each worker's output into the shared catalog, barrel, and `TODO.md` one at a time, runs the full gate, and creates one focused commit per sub-step. This keeps the independent work parallel while the shared-file merge, verification, GitNexus review, commit, and push stay serial and conflict-free.

## Worker handoff protocol

For each Kimi assignment, the hosted lead provides exactly one active `TODO.md` sub-step with its outcome and non-goals, acceptance criteria, targeted files/boundaries, minimum relevant source context, existing test commands, and required patch-and-evidence return format.

The worker returns a patch, changed-file list, assumptions, and raw check evidence; it does not commit or push. The hosted lead then:

1. inspects the complete diff and rejects out-of-scope work;
2. independently runs or assesses relevant checks;
3. performs GitNexus change/impact analysis and review;
4. checks security, reliability, accessibility, public APIs, schemas, Storybook, and migration effects as relevant;
5. requests corrections until the sub-step passes;
6. confirms staged scope matches the outcome-specific conventional message in `TODO.md`;
7. approves the one focused commit and push.

## Supported personal Codex configuration

Provider settings belong in user-level configuration, not this repository. Current Codex ignores `model_provider` and `model_providers` in project `.codex/config.toml`. See the official [advanced configuration](https://learn.chatgpt.com/docs/config-file/config-advanced#custom-model-providers), [configuration reference](https://learn.chatgpt.com/docs/config-file/config-reference), and [custom-agent guidance](https://learn.chatgpt.com/docs/agent-configuration/subagents).

### Primary no-auth provider example

The current local endpoint requires no API key. A user may define this in `~/.codex/config.toml`:

```toml
[model_providers.local_ollama_http]
name = "Local Ollama Responses endpoint"
base_url = "http://localhost:11434/v1"
wire_api = "responses"
```

Omitting `requires_openai_auth`, `env_key`, and command-backed `auth` tells Codex the provider requires no authentication.

### Optional authentication patterns

Only endpoints that actually require authentication should add one pattern. Never place a real credential in TOML, a prompt, a story, a fixture, or source control.

```toml
[model_providers.example_authenticated]
name = "Example authenticated Responses endpoint"
base_url = "https://provider.example/v1"
wire_api = "responses"
env_key = "EXAMPLE_PROVIDER_API_KEY"
```

Or use a local credential helper:

```toml
[model_providers.example_helper]
name = "Example helper-authenticated Responses endpoint"
base_url = "https://provider.example/v1"
wire_api = "responses"

[model_providers.example_helper.auth]
command = "/absolute/path/to/local-token-helper"
args = ["--audience", "codex"]
timeout_ms = 5000
refresh_interval_ms = 300000
```

Use one authentication mechanism, not several. If a credential is pasted into chat, logs, or source control, treat it as exposed and revoke/rotate it.

## Profiles and custom agents

Profiles are personal configuration layers. In current Codex, `--profile helper-name` loads `~/.codex/helper-name.config.toml`; legacy `[profiles.*]` tables are not the current profile format.

Start Gemma read-only:

```toml
# ~/.codex/gemma-helper.config.toml
model = "gemma3:4b"
model_provider = "local_ollama_http"
sandbox_mode = "read-only"
```

```shell
codex exec --profile gemma-helper "Summarize this non-sensitive test log; do not propose code changes."
```

A personal Kimi custom agent can live at `~/.codex/agents/kimi-worker.toml`:

```toml
name = "kimi_worker"
description = "Produces a candidate patch for one fully specified, bounded TODO sub-step."
developer_instructions = "Stay within supplied files and acceptance criteria. Return a patch, assumptions, and raw test evidence. Never commit, push, approve, or claim final verification."
model = "kimi-k2.7-code:cloud"
model_provider = "local_ollama_http"
sandbox_mode = "read-only"
```

Begin read-only on a disposable, non-sensitive task. Progress to workspace-write only after the hosted lead repeatedly verifies scope discipline, tool behavior, cleanup, and test fidelity. Keep commit/push authority with the hosted lead.

## Progressive enablement checklist

1. Confirm the endpoint is bound only as intended and no authentication is unexpectedly required.
2. Verify the requested model with a harmless Responses request; do not rely only on model listing.
3. Test required tool-call shape and tool-result continuation without repository or customer data.
4. Run a read-only, non-sensitive task and compare it with a hosted review.
5. Try a disposable bounded patch; independently inspect the diff and rerun tests.
6. Enable one real low-risk TODO sub-step; do not increase concurrency until several sub-steps pass review.
7. Revalidate after provider/model/Codex upgrades or unexpected behavior.

Do not route final design judgement, cross-cutting integration, migrations, security review, release decisions, or verification claims away from the hosted lead.
