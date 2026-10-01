# Frontend Engineering Guidelines

## Scope & References

- These guidelines apply to `web/` and supplement [root guidelines](../AGENTS.md).
- Read [PRODUCT.md](PRODUCT.md) for product, content, and UI decisions. Distinguish confirmed requirements, placeholders, and open questions; do not invent business requirements or factual content.
- Resolve product requirements in this order: explicit task requirements, approved specifications, supplied Figma designs, existing behavior, then implementation patterns. Clarify unresolved conflicts that materially affect the outcome.

## Changes & Decisions

- Make the smallest complete change; preserve unrelated code, behavior, and local changes.
- Proceed within the authorized scope when requirements are clear. Follow existing patterns for routine implementation decisions.
- Ask only when critical information is missing, interpretations materially differ, or work must exceed the authorized scope. Do not reconfirm already authorized changes, including security-sensitive work.
- Reuse existing components, composables, and utilities when appropriate; avoid duplication and unnecessary coupling or abstraction.
- Prefer existing dependencies and platform APIs. Add a dependency only when necessary for the task and explain why.

## Code & Styles

- Use Vue 3 Composition API with `<script setup lang="ts">` for new components. Preserve compatible typing conventions; do not use `any` to bypass type errors.
- Prefer Tailwind utilities; use scoped CSS when needed. Follow existing design tokens and responsive conventions, and supplied Figma specifications where applicable.
- Keep page-specific styling local. When extending shared components, preserve default behavior for existing consumers.

## Security

- Keep secrets in server-only `runtimeConfig`; expose only browser-safe values through `runtimeConfig.public`. Use server routes for privileged operations.
- Enforce authorization and input validation on the server; UI visibility and route guards are not security boundaries.
- Treat external input as untrusted. Use `v-html` only when required and the content is trusted or sanitized; never execute user-provided code.
- Keep secrets and sensitive data out of logs, URLs, and browser storage. Use placeholders in documentation.
- Preserve authentication, session, CORS, and other security protections unless changes are explicitly authorized. Apply the decision rules above to sensitive data exposure and third-party data sharing.
- For security-sensitive changes, verify affected trust boundaries and data handling; report unverified assumptions or risks without claiming unverified security guarantees.

## Validation

Choose checks relevant to the change and run them from the repository root:

```sh
npm run test -w web
npm run typecheck -w web
npm run build -w web
```

- Follow the root testing guidelines for behavior changes and bug fixes. Run relevant tests and typecheck for code changes; build when the change may affect production output.
- For UI changes, verify responsive behavior and applicable loading, empty, error, and disabled states.
- No lint script is currently configured. Do not claim lint passed or add tooling solely to satisfy this checklist.
- Documentation-only changes need content, link, and diff checks rather than application tests or builds.
- Fix errors introduced by the task; report unrelated existing failures. Do not disable checks or remove tests to hide failures.
- Review the final diff for accidental changes and temporary debugging code.

## Completion Report

Briefly report what changed, the main files, and commands actually run with their results. Include assumptions, limitations, and unverified items when relevant. Scale detail to the task; never claim a check passed unless it ran.
