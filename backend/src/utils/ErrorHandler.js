/**
 * @description Custom Error Handler Class
 * Provides a standardized way to create error objects with status codes.
 */
class ErrorHandler extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;

        // Create a stack trace for better debugging
        Error.captureStackTrace(this, this.constructor);
    }
}

export default ErrorHandler;
