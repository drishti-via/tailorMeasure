// e2e/fixtures/test-data.js
export const TEST_PHONE = '9999999999'
export const TEST_OTP = '123456'

export function uniqueName(prefix) {
  return `${prefix} ${Date.now()}`
}
