const express = require('express');
const log = require('../../Addons/Logger');
const router = express.Router();

router.get('/', async (req, res) => {
    try {
        res.status(200).send('Welcome to TEA API.');

    } catch (error) {
        log.bug('Error to home route:', error);
        res.status(500).send({ message: 'Internal Server Error, try again later.' });
    }
});

module.exports = router;