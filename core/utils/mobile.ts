export function digitsOnly(value: string) {
  return value.replace(/\D/g, '');
}

export function normalizeMobileNumber(value: string) {
  return digitsOnly(value).slice(-10);
}

export function mobileMatches(value: string, mobileNumber: string) {
  const expected = normalizeMobileNumber(mobileNumber);
  const actual = normalizeMobileNumber(value);
  return Boolean(actual) && actual.endsWith(expected);
}
