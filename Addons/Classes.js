const log = require('./Logger');

/**
 * Class representing an error handler for API responses.
 */
class APIError {
    /**
     * Create an error handler instance.
     * @param {string} fileName - The name of the file where the error occurred.
     * @param {Error} error - Error object.
     * @param {response} res - Express response object.
     */
    constructor(fileName, error, res) {
        this.fileName = fileName;
        this.error = error;
        this.res = res;

        log.bug(`API Error in ${this.fileName}`, error);
        res.status(500).json({ message: 'Internal Server Error, try again later.' });
    }
}

module.exports = APIError;