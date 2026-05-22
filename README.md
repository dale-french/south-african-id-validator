# 🇿🇦 south-african-id-validator

Validate South African ID numbers and extract date of birth, gender, and citizenship.

- ✅ Verifies the Luhn checksum (the digit at the end of every SA ID)
- ✅ Rejects impossible calendar dates (Feb 30, Feb 29 of a non-leap year)
- ✅ TypeScript-native — strict types, discriminated-union result
- ✅ Zero runtime dependencies
- ✅ Runs on Node, Bun, Deno, and modern browsers
- ✅ Ships ESM + CJS + `.d.ts`

## Install

```bash
pnpm add south-african-id-validator
# or
npm i south-african-id-validator
# or
yarn add south-african-id-validator
# or
bun add south-african-id-validator
```

## Usage

```ts
import { validate } from "south-african-id-validator";

const result = validate("7311190013080");

if (result.valid) {
  // TypeScript narrows away the error branch — these are guaranteed to exist.
  console.log(result.dateOfBirth); // Date — Mon Nov 19 1973 …
  console.log(result.gender); // 'female'
  console.log(result.citizenship); // 'citizen'
} else {
  // And here the data branch is gone — only `error` is accessible.
  console.error(result.error); // e.g. 'INVALID_CHECKSUM'
}
```

## API

### `validate(idNumber: string, options?: ValidateOptions): ValidationResult`

The single primary export. Returns a discriminated union:

```ts
type ValidationResult =
  | { valid: true; dateOfBirth: Date; gender: Gender; citizenship: Citizenship }
  | { valid: false; error: ValidationErrorCode };

type Gender = "male" | "female";
type Citizenship = "citizen" | "permanent_resident";
type ValidationErrorCode =
  | "INVALID_LENGTH"
  | "INVALID_FORMAT"
  | "INVALID_CHECKSUM"
  | "INVALID_DATE";

type ValidateOptions = {
  /** "Today" for the 16-year century-inference rule. Defaults to `new Date()`. */
  referenceDate?: Date;
};
```

### Error codes

The pipeline short-circuits on the first failure and reports the most fundamental problem first:

| Code               | Meaning                                                                                           |
| ------------------ | ------------------------------------------------------------------------------------------------- |
| `INVALID_LENGTH`   | The input is not exactly 13 characters (or is not a string).                                      |
| `INVALID_FORMAT`   | The input contains non-digit characters, or the citizenship digit is neither `0` nor `1`.         |
| `INVALID_CHECKSUM` | The 13 digits don't satisfy the Luhn algorithm.                                                   |
| `INVALID_DATE`     | The first six digits don't form a real calendar date — e.g. Feb 30, or Feb 29 of a non-leap year. |

## How South African ID numbers work

An SA ID is 13 digits encoded as `YYMMDDSSSSCAZ`:

- **`YYMMDD`** — date of birth. The century is inferred from a 16-year-old eligibility rule: a year that would make the holder younger than 16 today is treated as belonging to the previous century.
- **`SSSS`** — gender sequence. `0000–4999` is female, `5000–9999` is male.
- **`C`** — citizenship. `0` for citizen, `1` for permanent resident.
- **`A`** — historically a race indicator, now unused.
- **`Z`** — Luhn check digit over the preceding 12.

## Migrating from v1

v1 exported four functions (`validateIdNumber`, `parseGender`, `parseCitizenship`, `parseDOB`) and had a couple of correctness bugs — most importantly, no checksum validation. v2 collapses everything into a single `validate()` with a typed result. The standalone parse functions are gone; v2's `validate()` returns everything they returned, with narrower types.

| v1                      | v2                                                         |
| ----------------------- | ---------------------------------------------------------- |
| `validateIdNumber(id)`  | `validate(id)`                                             |
| `.DOB`                  | `.dateOfBirth` (only on `result.valid === true`)           |
| `.gender`               | `.gender` (only on `result.valid === true`)                |
| `.isCitizen` (boolean)  | `.citizenship` (`'citizen'` &#124; `'permanent_resident'`) |
| `valid: false` (silent) | `valid: false, error: <code>`                              |
| `parseDOB(id)`          | not exported — use `validate(id).dateOfBirth`              |
| `parseGender(id)`       | not exported — use `validate(id).gender`                   |
| `parseCitizenship(id)`  | not exported — use `validate(id).citizenship`              |

## License

ISC
