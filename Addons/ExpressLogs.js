const express = require('express');
const app = express();
const log = require('./Logger');

module.exports = async (req, res, next) => {
    try {
        // Log usage of endpoints.
        log.log(`[ENDPOINT] '${req.method} ${req.originalUrl}' |  IP: '${req.rawHeaders[1]}' | User-Agent: '${req.get('User-Agent')}'`);

        // Disable the default 'X-Powered-By' header
        app.disable('x-powered-by');

        // Set a custom header.
        res.set('X-Powered-By', 'Kalinowski.app');
        res.set('Content-Type', 'application/json');

        // Forward other errors to the default error handler
        next();
    } catch (err) {
        // Response to the server error.
        log.bug('Error processing express logs', err);
        return res.status(500).send({ message: 'Internal Server Error, try again later.' });
    }
};