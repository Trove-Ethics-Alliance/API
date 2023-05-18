require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const log = require('./Addons/Logger');

const app = express();
const port = process.env.PORT;

// Middlewares
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Load application process configuration
require('./Addons/Process')(app);

// Load middlewares
app.use(require('./Addons/ExpressLogs'));

// Restricted API endpoints.
app.use('/api/v1', require('./Routes/Restricted/Data')); // /data endpoint.

// Public API endpoints.
app.use('/api/v1', require('./Routes/Public/Authorization')); // /login, /register endpoints.
app.use('/api/v1', require('./Routes/Public/Welcome')); // Main GET Home route.

// Invalid endpoint handler.
app.all('*', (req, res) => {
    res.status(404).send({ message: `Can't find ${req.originalUrl} on this server!` });
});

log.info('Initializing project...');
setTimeout(() => {
    try {
        if (!(mongoose.connections.slice(1).every(conn => conn.readyState === 1))) {
            process.exit(`[MongoDB] Connections are not established! ${mongoose.connections.slice(1).map(c => `${c.name ? c.name : 'Unknown'} (${c.readyState})`).join(' :: ')}`);
        }
        log.info('[MongoDB] Connection list:', mongoose.connections.slice(1).map(c => `${c.name ? c.name : 'Unknown'} (${c.readyState})`).join(' :: '));

        // Start the server.
        app.listen(port, () => {
            log.info('⭐ Application Programming Interface is now listening for incoming requests.');
        });

    } catch (error) {
        log.bug('Error to start the application', error);
    }
}, 5000);