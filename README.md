# 🇿🇦 south-african-id-validator 🇿🇦

Dead simple validator for South African ID numbers

This validator returns the following if the ID Number is valid

- Gender
- Date of birth
- Citizenship

## Usage

Install using NPM / Yarn

```bash
npm i south-african-id-validator
```

```bash
yarn add south-african-id-validator
```

```js
import { validateIdNumber } from "south-african-id-validator";

validateIdNumber(
  ID_NUMBER_TO_VALIDATE // string
);

// example
validateIdNumber("7311190013080");
```

### Demo

[https://codesandbox.io/s/compassionate-northcutt-ft0o8](https://codesandbox.io/s/compassionate-northcutt-ft0o8)
