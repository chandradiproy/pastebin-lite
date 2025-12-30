// api/_utils/time.js

/**
 * Gets the current time, respecting the x-test-now-ms header
 * if TEST_MODE is enabled.
 * * @param {Request} req - The incoming HTTP request
 * @returns {Date} The effective current date object
 */
export function getCurrentTime(req) {
  const testHeader = req.headers['x-test-now-ms'];
  
  // Only honor the header if TEST_MODE is explicitly set to '1'
  if (process.env.TEST_MODE === '1' && testHeader) {
    const forcedTime = parseInt(testHeader, 10);
    if (!isNaN(forcedTime)) {
      return new Date(forcedTime);
    }
  }
  
  return new Date();
}