require('dotenv').config();
const express = require('express');
const favicon = require('serve-favicon');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const path = require('path');
const log = require('./Addons/Logger');
const loadAPIRoutes = require('./Handler/Routes');

const app = express();
const port = process.env.PORT;

async function start() {
    try {
        // Middlewares
        app.use(bodyParser.urlencoded({ extended: true }));
        app.use(bodyParser.json());

        // Load favicon
        app.use(favicon(path.join(__dirname, 'HTML', 'images', 'favicon.ico')));

        // Load application process configuration
        require('./Addons/Process')(app);

        // Load middlewares
        app.use(require('./Addons/ExpressLogs'));

        const [APIRouteTable] = await Promise.all([
            loadAPIRoutes(app),
        ]);

        // Ascii table with all routes loaded.
        // eslint-disable-next-line no-console
        console.log(APIRouteTable);

        // Front-end
        app.use('/', require('./HTML/Welcome')); // Main / GET Home route.

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
    } catch (err) {
        log.bug('[STARTUP] Error to start up API Server.', err);
        process.exit(1);
    }
}

// Run the application.
start();