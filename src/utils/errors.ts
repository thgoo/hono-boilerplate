// src/utils/errors.ts

/**
 * Custom error class for HTTP errors that includes a status code.
 */
export class HttpError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
  ) {
    super(message);
    this.name = 'HttpError';
  }
}
