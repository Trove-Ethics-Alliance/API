const jwt = require('jsonwebtoken');
const { mongoUser } = require('../Mongo/Models/User');
const log = require('../Addons/Logger');

const authJWT = async (req, res, next) => {
    try {
        // Check if authorization token is provided.
        const token = req.headers.authorization;
        if (!token) {
            log.warn(`[Auth] Missing authorization token at '[${req.method}] ${req.originalUrl}'`);
            return res.status(401).json({ message: 'Authentication failed - No token provided.' });
        }

        // Verify authorization token.
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded.username; // Asign verified username to the request.

        // Find the user in the database.
        const existingUser = await mongoUser.findOne({ username: decoded.username });
        if (!existingUser) {
            log.warn(`[Auth] Valid token but missing '${decoded.username}' account at '[${req.method}] ${req.originalUrl}'`);
            return res.status(400).json({ message: 'This account is not registered.' });
        }

        // Check token against the existing user's token.
        if (existingUser.token != token) {
            log.warn(`[Auth] Revoked token used by '${decoded.username}' account at '[${req.method}] ${req.originalUrl}'`);
            return res.status(401).json({ message: 'Authentication failed - This access token is revoked.' });
        }

        // Call next() to pass control to the next middleware.
        log.info(`[Auth] Verified '${req.user}' at '[${req.method}] ${req.originalUrl}'.`);
        next();
    } catch (err) {

        // Response to the invalid token.
        if (err.message === 'jwt malformed') {
            log.warn(`[Auth] Invalid token is received at at '[${req.method}] ${req.originalUrl}'`);
            return res.status(401).json({ message: 'Authentication failed - invalid token' });
        }

        // Response to the server error.
        log.bug('Error processing JWT verification', err);
        return res.status(500).send({ message: 'Internal Server Error, try again later.' });
    }
};

module.exports = authJWT;