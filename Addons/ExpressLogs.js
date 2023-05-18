const express = require('express');
const app = express();
const log = require('./Logger');

module.exports = async (req, res, next) => {
    try {
        // Disable the default 'X-Powered-By' header
        app.disable('x-powered-by');

        // Log usage of endpoints.
        log.log(`[ENDPOINT] '${req.method} ${req.originalUrl}' |  IP: '${req.ip}' | Protocol: '${req.protocol}' | User-Agent: '${req.get('User-Agent')}'`);

        // Set a custom header.
        res.set('X-Powered-By', 'Kalinowski.app');
        res.set('Content-Type', 'application/json');
        next();
    } catch (err) {
        // Response to the server error.
        log.bug('Error processing express logs', err);
        return res.status(500).send({ message: 'Internal Server Error, try again later.' });
    }
};