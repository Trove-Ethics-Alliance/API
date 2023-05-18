const mongoose = require('mongoose');
const log = require('./Logger');

module.exports = () => {
	process.on('unhandledRejection', (error) => {
		log.trace('[Kalinowski] Unhandled promise rejection:', error);
	});

	process.on('SIGINT', () => { // CHANGEME
		log.log('[Kalinowski] Database disconnecting on app termination.');
		if (mongoose.connection.readyState === 1) {
			mongoose.connection.close(() => {
				process.exit(0);
			});
		}
	});

	process.on('exit', (code) => {
		log.log('[Kalinowski] About to exit with code', code);
	});
};