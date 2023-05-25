const express = require('express');
const router = express.Router();
const authJWT = require('../../Auth/JWT');
const path = require('path');

// Get file name.
const fileName = path.basename(__filename).slice(0, -3);

router.get('/data', authJWT, (req, res) => {
    res.json({ message: `Welcome ${req.user}! This is your private data endpoint.` });
});

module.exports = {
    name: fileName,
    enabled: true,
    router
};