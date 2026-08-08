export const IDENTIFIER_TYPE = {
  IP: "IP",
  EMAIL: "EMAIL",
  USER_ID: "USER_ID",
  API_KEY: "API_KEY",
} as const;

export type IDENTIFIER_TYPE = (typeof IDENTIFIER_TYPE)[keyof typeof IDENTIFIER_TYPE];

export const RATE_LIMIT = {
  WINDOW_SIZE_IN_SECONDS: 60,
  MAX_REQUEST_LIMIT: 100,
} as const;
