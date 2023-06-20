const log = require('./Logger');

module.exports = async (err, req, res, next) => {
    try {

        // Custom syntax error handling middleware
        if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
            // Handle JSON syntax error
            return res.status(400).json({ message: 'Validation error, invalid JSON payload.' });
        }

        // Forward other errors to the default error handler
        next();
    } catch (err) {
        // Response to the server error.
        log.bug('Error processing express errors', err);
        return res.status(500).send({ message: 'Internal Server Error, try again later.' });
    }
};