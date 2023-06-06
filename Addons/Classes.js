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

        // Handle duplicate key error.
        if (this.error.code === 11000) {

            // Get name of the field that is duplicated.
            const fieldErr = Object.keys(this.error.keyValue)[0];

            // Reponse with status 400 with the message object with the field name that causes the error.
            return res.status(400).json({ message: `Duplicate value for '${fieldErr}' field. There is already a document with that field value.` });
        }

        log.bug(`API Class Error executed in ${this.fileName}`, error);
        res.status(500).json({ message: 'Internal Server Error, try again later.' });
    }
}

module.exports = APIError;