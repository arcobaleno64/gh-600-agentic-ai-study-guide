// Browser storage names, derived from the exam code. GH-600 users already hold
// data under these exact names, so they must never change for GH-600.
export const progressKeyFor = (code: string) =>
  `${code.toLowerCase()}-study-progress`;
export const sessionKeyFor = (code: string) =>
  `${code.toLowerCase().replace("-", "")}-quiz-session-v1`;
