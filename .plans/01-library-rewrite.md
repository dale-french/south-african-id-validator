# PRD: `south-african-id-validator` library rewrite

## Problem

The library works, but as an open-source package it shows its age and has correctness gaps that bite real users:

- **No checksum validation.** The current code claims to use the Luhn algorithm in a comment, but the regex it actually runs never verifies the check digit. IDs with a wrong last digit are accepted as valid. This is the single biggest correctness issue.
- **A date-of-birth bug.** `parseDOB` uses `getDay()` (day of week, 0–6) where it should use `getDate()` (day of month, 1–31), so the eligibility comparison against "today" is wrong on most days of the year.
- **Inconsistent return shape.** The validator returns `{ valid, DOB, gender, isCitizen }` — `DOB` is screaming case while everything else is camelCase. The shape of the object also changes depending on validity, but there is no type discrimination, so consumers reach into `.DOB` on invalid results and get `undefined`.
- **No types.** Consumers get no autocomplete, no narrowing, no compile-time guarantees about which fields exist when.
- **Silent failure modes.** Callers can't tell whether an ID was rejected because it was the wrong length, the wrong format, failed the checksum, or contained an impossible date — they only get `valid: false`.
- **Easy to misuse the helpers.** `parseGender` / `parseCitizenship` / `parseDOB` all happily run on garbage input and return garbage results, because they assume the caller already validated.
- **Stale tooling.** Babel + Jest + a `yarn.lock`, with a build step that emits a minified single file as the package entrypoint. There is no ESM/CJS dual export, no TypeScript declarations, no linting, no CI, and no release automation. Contributors are unlikely to engage.

The library is small and the surface area is tight, which makes this a good moment to fix the correctness issues, redesign the API around modern TypeScript ergonomics, and put the project on tooling that a new contributor would recognise in 2026.

## Solution

Rewrite the library in TypeScript with a single primary export — `validate()` — that returns a discriminated union. Successful validation narrows to a result with `dateOfBirth`, `gender`, and `citizenship`; failed validation narrows to a result carrying a typed error code that names the specific failure (length, format, checksum, or date).

Ship as a universal package (Node, browser, Bun, Deno) with both ESM and CJS entry points and bundled type declarations. Implement the Luhn checksum that the current library claims to but doesn't. Replace the legacy build pipeline with a modern toolchain (pnpm, tsdown, Vitest, Biome, Changesets) and publish a Typedoc-generated documentation site alongside the README.

## Requirements

1. The library exports a single primary function `validate(idNumber: string)` returning a discriminated union: either `{ valid: true, dateOfBirth: Date, gender: 'male' | 'female', citizenship: 'citizen' | 'permanent_resident' }` or `{ valid: false, error: ValidationErrorCode }`.
2. `ValidationErrorCode` is a union of string literals covering at minimum: `'INVALID_LENGTH'`, `'INVALID_FORMAT'`, `'INVALID_CHECKSUM'`, `'INVALID_DATE'`.
3. Validation rejects any input that is not a 13-character string of ASCII digits with the error code `INVALID_LENGTH` (for wrong length) or `INVALID_FORMAT` (for non-digit characters or structurally impossible digit layouts).
4. Validation runs the Luhn algorithm over all 13 digits and returns `INVALID_CHECKSUM` if the check digit does not match. The current library does not do this; the rewrite must.
5. Validation rejects impossible calendar dates encoded in `YYMMDD` (e.g. `230230`, `970231`, non-leap-year `990229`) with `INVALID_DATE`.
6. The century for the year portion is inferred using the existing 16-year eligibility rule: a year that would make the holder younger than 16 today is treated as belonging to the previous century. This preserves the v1 behaviour for the case where it was correct.
7. On a valid ID, `gender` is `'female'` when the four-digit `SSSS` sequence is `< 5000` and `'male'` otherwise.
8. On a valid ID, `citizenship` is `'citizen'` when the C digit is `0` and `'permanent_resident'` when it is `1`. A C digit that is anything else causes the ID to be treated as `INVALID_FORMAT`.
9. The Luhn check, date-of-birth parser, gender parser, and citizenship parser are each implemented as independent internal modules with a small, pure-function interface, so each can be tested in isolation.
10. The package is written in TypeScript with `strict` mode and ships compiled JavaScript plus `.d.ts` declarations. Source `.ts` files are not shipped to consumers.
11. The package ships both ESM and CJS entry points via the `exports` field in `package.json`, runs on Node 20+, modern browsers, Bun, and Deno, has no platform-specific dependencies, and is marked `sideEffects: false` so bundlers can tree-shake it.
12. The published tarball contains only the compiled output, type declarations, `README.md`, and `LICENSE` — no source, no tests, no config.
13. The package has at most one runtime dependency and prefers zero.
14. The unit-test suite covers every internal module — Luhn, date-of-birth parsing, gender parsing, citizenship parsing — as well as the public `validate()` entrypoint, with explicit cases for each error code.
15. Continuous integration runs typecheck, lint, tests, and a production build on every pull request, on at least the active LTS versions of Node and on Bun.
16. Releases are produced via Changesets, which gates publishes on a changelog entry and pushes to npm and GitHub Releases automatically from the main branch.
17. The README contains a runnable usage example for the v2 API and documents every error code with the conditions that produce it. A Typedoc-generated documentation site is published to GitHub Pages on every release.
18. Every exported function and type carries JSDoc that surfaces in editor hovers.
19. Files whose name and path are unchanged across the rewrite (`package.json`, `README.md`, `.gitignore`, `LICENSE`) are edited in place rather than deleted and recreated, so their git history stays continuous.

## Technical Design

### Tooling stack

- **Language**: TypeScript with `strict: true`. Target ES2022.
- **Package manager**: pnpm, pinned via the `packageManager` field in `package.json`.
- **Builder**: tsdown (Rolldown + Oxc) — produces ESM + CJS + `.d.ts` from a single config, fast, library-first.
- **Test runner**: Vitest, with v8 coverage. Runs the same suite in Node and Bun in CI.
- **Linter**: oxlint — Rust-based, shares the Oxc toolchain with tsdown, very fast.
- **Formatter**: oxfmt — same Oxc ecosystem as oxlint and tsdown. Keeps the project on a single toolchain.
- **Docs**: Typedoc, output deployed to GitHub Pages.
- **Releases**: Changesets, with the GitHub Action that opens a release PR and publishes on merge.
- **CI**: GitHub Actions matrix across active LTS Node versions plus Bun.
- **Git hooks**: simple-git-hooks running `oxlint`, `oxfmt --check`, and typecheck on every commit. The source tree is small enough that scoping to staged files would add a dependency (`lint-staged` or similar) without saving meaningful time — all three checks run in under a second over the whole repo. Kept minimal so contributors don't need extra binaries.

### Public API

A single primary export, plus the types that describe its result.

```
validate(idNumber: string): ValidationResult

type ValidationResult =
  | { valid: true;  dateOfBirth: Date; gender: Gender; citizenship: Citizenship }
  | { valid: false; error: ValidationErrorCode }

type Gender             = 'male' | 'female'
type Citizenship        = 'citizen' | 'permanent_resident'
type ValidationErrorCode =
  | 'INVALID_LENGTH'
  | 'INVALID_FORMAT'
  | 'INVALID_CHECKSUM'
  | 'INVALID_DATE'
```

The discriminated union means `if (result.valid)` narrows away the error branch, and `if (!result.valid)` narrows away the data branch. Consumers cannot read `dateOfBirth` on a failed result without a type error.

The individual `parseGender` / `parseCitizenship` / `parseDOB` exports from v1 are removed. They are easy to misuse on un-validated input, and the new `validate()` returns everything they returned, with narrower types. This is a deliberate breaking change.

### Internal modules

Each internal module is a pure function with a small interface:

- **`luhn`** — given a string of digits, returns whether the last digit is the correct Luhn check digit over the rest. No knowledge of SA IDs; it is just the algorithm.
- **`parse-date-of-birth`** — given the 13-digit string, returns either a `Date` or `null`. Owns the century-inference rule and the "impossible calendar date" detection (by constructing the `Date` and confirming the constructor didn't auto-correct it). Optional `referenceDate` parameter for deterministic testing — defaults to `new Date()`.
- **`parse-gender`** — given the 13-digit string, returns `'male' | 'female'`.
- **`parse-citizenship`** — given the 13-digit string, returns `'citizen' | 'permanent_resident' | null` (the `null` lets `validate()` map it to `INVALID_FORMAT`).

### Validation pipeline

`validate()` composes the modules in fixed order, short-circuiting on the first failure:

1. Length / character class check → `INVALID_LENGTH` or `INVALID_FORMAT`.
2. Luhn checksum → `INVALID_CHECKSUM`.
3. Date-of-birth parse → `INVALID_DATE` if `null`.
4. Citizenship parse → `INVALID_FORMAT` if `null`.
5. Gender parse — total over valid inputs, cannot fail.
6. Return the success branch.

Ordering matters for the diagnostic value of the error code: callers should be told the most fundamental thing wrong with the input, not whatever the last check happened to be.

### Package shape

- `exports` field with separate `import` (ESM) and `require` (CJS) entries, plus a `types` condition for declarations.
- Built output uses dual-format suffixes per tsdown's default: `index.mjs` + `index.d.mts` for ESM, `index.cjs` + `index.d.cts` for CJS. The `exports`, `main`, `module`, and `types` fields all point at these filenames so consumers don't see the convention.
- `"sideEffects": false`.
- `files` whitelist: only `dist/` and the metadata files.
- `engines.node` set to `>=20` — covers Node 20 (maintenance), 22 (active LTS), and 24+.

## Testing

A good test in this library asserts an observable behaviour for a specific input class, not an implementation detail. Test names should describe what the input represents (e.g. "rejects an ID whose date is Feb 30") rather than the function being called.

Modules requiring direct unit coverage (per the user's selection): `luhn`, `parse-date-of-birth`, `parse-gender`, `parse-citizenship`, and the public `validate()` entrypoint. Coverage notes per module:

- **`luhn`** — known-valid IDs, off-by-one digit at each position, sequences that sum to multiples of 10 by coincidence, sequences of the wrong length (the function should treat these as invalid).
- **`parse-date-of-birth`** — boundary cases around the 16-year eligibility cutoff (one day before, one day after); leap-year handling (`000229`, `990229`, `040229`); impossible dates (`230230`, `970231`); century inference for years that span the cutoff. Tests inject a fixed `referenceDate` rather than depending on the system clock.
- **`parse-gender`** — `4999`, `5000`, all-zero and all-nine boundaries.
- **`parse-citizenship`** — `0`, `1`, and one unexpected value to assert the `null` path that maps to `INVALID_FORMAT`.
- **`validate()`** — at least one positive case per gender/citizenship combination, plus one negative case per `ValidationErrorCode` that confirms the pipeline reports the right error first.

There are no existing test patterns worth preserving — the v1 suite is three `test()` blocks. The new suite should adopt Vitest's `describe` blocks per module and use `it` with behaviour-style names.

## Out of Scope

- Generating valid SA ID numbers. The library validates; it does not synthesize.
- Validating other South African identifiers (passport numbers, asylum-seeker permits, tax reference numbers).
- Localised error messages. The error code is the contract; message strings are the consumer's responsibility.
- An async API. Validation is pure and synchronous.
- Backwards compatibility shims for the v1 function exports. They are removed; the major-version bump is the migration signal.
- React / Vue / Svelte bindings. The library is framework-agnostic by design.
- A CLI. The package ships as a library only.
