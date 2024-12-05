const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next)
export default asyncHandler

/**
 * Purpose: Simplifies error handling in asynchronous route handlers by automatically catching and forwarding errors to Express.
 * How It Works:
 * Wraps the provided function (fn) in a promise using Promise.resolve.
 * If the function resolves successfully, the response is processed as usual.
 * If the function throws an error or a rejection occurs, .catch(next) ensures the error is passed to Express's error-handling middleware.
 */
