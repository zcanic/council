
/**
 * A base class for custom application exceptions.
 * Allows for better error handling and categorization.
 */
export class AppError extends Error {
  public readonly statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    // Ensures the correct prototype chain for instanceof checks
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

/**
 * Represents an error for resources that are not found (HTTP 404).
 */
export class NotFoundError extends AppError {
  constructor(resource: string = 'Resource') {
    super(`${resource} not found.`, 404);
  }
}

/**
 * Represents an error for invalid input data (HTTP 400).
 * Can optionally include an array of detailed validation errors.
 */
export class BadRequestError extends AppError {
  public readonly errors?: any[];

  constructor(message: string, errors?: any[]) {
    super(message, 400);
    this.errors = errors;
  }
}

/**
 * Represents an error for unauthorized actions (HTTP 403).
 * Used when a user is authenticated but lacks permission to perform an action.
 */
export class ForbiddenError extends AppError {
  constructor(message: string = 'You do not have permission to perform this action.') {
    super(message, 403);
  }
}

/**
 * Represents an error when an external service (like the AI API) fails.
 */
export class ServiceUnavailableError extends AppError {
  constructor(serviceName: string = 'External service') {
    super(`${serviceName} is currently unavailable.`, 503);
  }
}
