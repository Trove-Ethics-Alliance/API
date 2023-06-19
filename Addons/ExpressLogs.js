const express = require('express');
const app = express();
const log = require('./Logger');


module.exports = async (err, req, res, next) => {
    try {
        // Disable the default 'X-Powered-By' header
        app.disable('x-powered-by');

        // Log usage of endpoints.
        log.log(`[ENDPOINT] '${req.method} ${req.originalUrl}' |  IP: '${req.rawHeaders[1]}' | User-Agent: '${req.get('User-Agent')}'`);

        // Set a custom header.
        res.set('X-Powered-By', 'Kalinowski.app');
        res.set('Content-Type', 'application/json');

        // Custom syntax error handling middleware
        if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
            // Handle JSON syntax error
            return res.status(400).json({ message: 'Invalid JSON payload' });
        }

        // Forward other errors to the default error handler
        next();
    } catch (err) {
        // Response to the server error.
        log.bug('Error processing express logs', err);
        return res.status(500).send({ message: 'Internal Server Error, try again later.' });
    }
};