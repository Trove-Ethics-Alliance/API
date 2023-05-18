const express = require('express');
const router = express.Router();
const authJWT = require('../../Auth/JWT');

router.get('/data', authJWT, (req, res) => {
    res.json({ message: `Welcome ${req.user}! This is your private data endpoint.` });
});

module.exports = router;