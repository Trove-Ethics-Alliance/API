const express = require('express');
const log = require('../Addons/Logger');
const router = express.Router();
const path = require('path');

const indexFilePath = path.join(__dirname, 'index.html');

router.get('/', async (req, res) => {
    try {
        res.status(200).type('html').sendFile(indexFilePath);

    } catch (error) {
        log.bug('Error to home route:', error);
        res.status(500).send({ message: 'Internal Server Error, try again later.' });
    }
});

module.exports = router;