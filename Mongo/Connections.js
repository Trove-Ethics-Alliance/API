const mongoose = require('mongoose');
const log = require('../Addons/Logger');

// Set the mongoose debug while on debug mode.
if (process.env.API_DEBUG === 'true') mongoose.set('debug', true);

const options = {
    heartbeatFrequencyMS: 10000, // Check the connection status every 10 seconds.
    maxPoolSize: 10, // Maintain up to 10 socket connections
    serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds.
    socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity.
    family: 4 // Use IPv4, skip trying IPv6.
};

// Creacte a new connection to user database.
mongoose.userDB = mongoose.createConnection(process.env.userURI, options, err => {
    if (err) log.bug('Error to connect to the User MongoDB Server.', err);
});

// Creacte a new connection to user database.
mongoose.certDB = mongoose.createConnection(process.env.certURI, options, err => {
    if (err) log.bug('Error to connect to the Certificate MongoDB Server.', err);
});

// User database connection listener.
mongoose.userDB
    .on('error', err => log.info('Error occured with \'user\' database', err))
    .on('connected', () => log.info('[MongoDB] Connected to the \'user\' database.'))
    .on('open', () => log.info('[MongoDB] Connection open for \'user\' database.'))
    .on('timeout', () => log.info('[MongoDB] Connection timeout for \'user\' database.'))
    .on('reconnected', () => log.info('[MongoDB] Connection restored for \'user\' database.'))
    .on('disconnected', () => log.info('[MongoDB] Disconnected from \'user\' database.'))
    .on('close', () => log.info('C[MongoDB] onnection closed for \'user\' database.'))
    .on('index', err => log.info('[MongoDB] Index error for \'user\' database', err));

// User database connection listener.
mongoose.certDB
    .on('error', err => log.info('Error occured with \'certificate\' database', err))
    .on('connected', () => log.info('[MongoDB] Connected to the \'certificate\' database.'))
    .on('open', () => log.info('[MongoDB] Connection open for \'certificate\' database.'))
    .on('timeout', () => log.info('[MongoDB] Connection timeout for \'certificate\' database.'))
    .on('reconnected', () => log.info('[MongoDB] Connection restored for \'certificate\' database.'))
    .on('disconnected', () => log.info('[MongoDB] Disconnected from \'certificate\' database.'))
    .on('close', () => log.info('C[MongoDB] onnection closed for \'certificate\' database.'))
    .on('index', err => log.info('[MongoDB] Index error for \'certificate\' database', err));

module.exports = {
    userDB: mongoose.userDB,
    certDB: mongoose.certDB,
};