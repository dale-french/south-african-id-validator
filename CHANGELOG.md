# south-african-id-validator

## 2.0.0

### Major Changes

- [#17](https://github.com/dale-french/south-african-id-validator/pull/17) [`26f98c2`](https://github.com/dale-french/south-african-id-validator/commit/26f98c257bc854baccb9a99f281f95ffcdd430fa) Thanks [@dale-french](https://github.com/dale-french)! - Full library rewrite in TypeScript.

  **Breaking changes**

  - The four v1 exports (`validateIdNumber`, `parseGender`, `parseCitizenship`, `parseDOB`) are replaced by a single `validate()` export.
  - `validate()` returns a discriminated union. Narrow with `result.valid`:
    - `{ valid: true, dateOfBirth, gender, citizenship }`
    - `{ valid: false, error }` where `error` is one of `'INVALID_LENGTH' | 'INVALID_FORMAT' | 'INVALID_CHECKSUM' | 'INVALID_DATE'`.
  - The result key `DOB` (screaming case) is now `dateOfBirth`. `isCitizen: boolean` is now `citizenship: 'citizen' | 'permanent_resident'`.

  **Correctness fixes**

  - Validates the Luhn checksum. v1 claimed to but didn't — IDs with a wrong final digit were accepted as valid.
  - Fixes the date-of-birth century-inference bug (v1 used day-of-week where day-of-month was intended).
  - Rejects impossible calendar dates such as Feb 30 or Feb 29 of a non-leap year.

  **Packaging**

  - Ships ESM + CJS + `.d.ts` declarations. Source is no longer published.
  - Zero runtime dependencies. Runs on Node 20+, Bun, Deno, and modern browsers.
  - `sideEffects: false` for tree-shaking.

  See the README for migration notes.
