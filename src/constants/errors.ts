export const ERROR_MESSAGES = {
  VALIDATION_ERROR: 'Validation error',
  SUBSCRIPTION_NOT_FOUND: 'Subscription not found',
  SUBSCRIPTION_ALREADY_EXISTS: 'Subscription already exists for this donor',
  SUBSCRIPTION_ALREADY_CANCELLED: 'Subscription is already cancelled',
  DATABASE_ERROR: 'Database operation failed',
  INTERNAL_SERVER_ERROR: 'Internal server error',
  LLM_SERVICE_ERROR: 'LLM service temporarily unavailable',
  INVALID_CURRENCY: 'Invalid currency code',
  INVALID_INTERVAL: 'Invalid subscription interval',
  INVALID_AMOUNT: 'Invalid amount value'
} as const;

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503
} as const;