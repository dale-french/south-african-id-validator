import { validateIdNumber, parseGender, parseCitizenship, parseDOB } from '.';

test('ID number is validated correctly', () => {
  expect(validateIdNumber('7311190013080').valid).toBe(true);
  expect(validateIdNumber('7311190013080').gender).toBe('female');
  expect(validateIdNumber('7311190013080').isCitizen).toBe(true);
  expect(validateIdNumber('23123123123').valid).toBe(false);
});

test('parseGender returns the correct gender', () => {
  expect(parseGender('9202295029188')).toBe('male');
  expect(parseGender('7311190013080')).toBe('female');
});

test('parseCitizenship returns the correct citizenship', () => {
  expect(parseCitizenship('9202295029188')).toBe(false);
  expect(parseCitizenship('7311190013080')).toBe(true);
});

test('parseDOB returns the correct date of birth', () => {
  expect(parseDOB('9202295029188')).toStrictEqual(new Date("92", "01", "29"));
});