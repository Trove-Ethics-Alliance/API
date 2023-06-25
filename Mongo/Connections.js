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

// Creacte a new connection to the user database.
mongoose.userDB = mongoose.createConnection(process.env.userURI, options, err => {
    if (err) log.bug('Error to connect API User MongoDB Database.', err);
});

// Creacte a new connection to the user database.
mongoose.certDB = mongoose.createConnection(process.env.certURI, options, err => {
    if (err) log.bug('Error to connect Certificate MongoDB Database.', err);
});

// Create a new connection to the event database.
mongoose.eventDB = mongoose.createConnection(process.env.eventURI, options, err => {
    if (err) log.bug('Error to connect Event MongoDB Database.', err);
});

// Create a new connection to the event database.
mongoose.participantDB = mongoose.createConnection(process.env.participantURI, options, err => {
    if (err) log.bug('Error to connect Event Participant MongoDB Database.', err);
});

// API User database listener.
mongoose.userDB
    .on('error', err => log.info('Error occured with \'user\' database', err))
    .on('connected', () => log.info('[MongoDB] Connected to the \'user\' database.'))
    .on('open', () => log.info('[MongoDB] Connection open for \'user\' database.'))
    .on('timeout', () => log.info('[MongoDB] Connection timeout for \'user\' database.'))
    .on('reconnected', () => log.info('[MongoDB] Connection restored for \'user\' database.'))
    .on('disconnected', () => log.info('[MongoDB] Disconnected from \'user\' database.'))
    .on('close', () => log.info('C[MongoDB] onnection closed for \'user\' database.'))
    .on('index', err => log.info('[MongoDB] Index error for \'user\' database', err));

// Certificate database listener.
mongoose.certDB
    .on('error', err => log.info('Error occured with \'certificate\' database', err))
    .on('connected', () => log.info('[MongoDB] Connected to the \'certificate\' database.'))
    .on('open', () => log.info('[MongoDB] Connection open for \'certificate\' database.'))
    .on('timeout', () => log.info('[MongoDB] Connection timeout for \'certificate\' database.'))
    .on('reconnected', () => log.info('[MongoDB] Connection restored for \'certificate\' database.'))
    .on('disconnected', () => log.info('[MongoDB] Disconnected from \'certificate\' database.'))
    .on('close', () => log.info('C[MongoDB] onnection closed for \'certificate\' database.'))
    .on('index', err => log.info('[MongoDB] Index error for \'certificate\' database', err));

// Event database listener.
mongoose.eventDB
    .on('error', err => log.info('Error occured with \'event\' database', err))
    .on('connected', () => log.info('[MongoDB] Connected to the \'event\' database.'))
    .on('open', () => log.info('[MongoDB] Connection open for \'event\' database.'))
    .on('timeout', () => log.info('[MongoDB] Connection timeout for \'event\' database.'))
    .on('reconnected', () => log.info('[MongoDB] Connection restored for \'event\' database.'))
    .on('disconnected', () => log.info('[MongoDB] Disconnected from \'event\' database.'))
    .on('close', () => log.info('C[MongoDB] onnection closed for \'event\' database.'))
    .on('index', err => log.info('[MongoDB] Index error for \'event\' database', err));

// Participant database listener.
mongoose.participantDB
    .on('error', err => log.info('Error occured with \'participant\' database', err))
    .on('connected', () => log.info('[MongoDB] Connected to the \'participant\' database.'))
    .on('open', () => log.info('[MongoDB] Connection open for \'participant\' database.'))
    .on('timeout', () => log.info('[MongoDB] Connection timeout for \'participant\' database.'))
    .on('reconnected', () => log.info('[MongoDB] Connection restored for \'participant\' database.'))
    .on('disconnected', () => log.info('[MongoDB] Disconnected from \'participant\' database.'))
    .on('close', () => log.info('C[MongoDB] onnection closed for \'participant\' database.'))
    .on('index', err => log.info('[MongoDB] Index error for \'participant\' database', err));

module.exports = {
    userDB: mongoose.userDB,
    certDB: mongoose.certDB,
    eventDB: mongoose.eventDB,
    participantDB: mongoose.participantDB,
};