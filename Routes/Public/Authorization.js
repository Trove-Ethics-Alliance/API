const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { isAlphanumericLowercase } = require('../../Addons/Functions');
const { mongoUser } = require('../../Mongo/Models/User');
const log = require('../../Addons/Logger');
const router = express.Router();


router.post('/login', async (req, res) => {
    try {
        // Destructuring assignment.
        const { username, password } = req.body;

        // Check if username and password are provided.
        if (!username || !password) return res.status(400).json({ message: 'You must provide username and password in body.' });

        // Check if username already exist in the database.
        const existingUser = await mongoUser.findOne({ username: req.body.username });
        if (!existingUser) return res.status(400).json({ message: 'This account is not registered' });

        // Check if account is activated.
        if (existingUser.activated === false) return res.status(400).json({ message: 'This account is not activated yet.' });

        // Validate the password.
        const validatePass = bcrypt.compareSync(req.body.password, existingUser.password);
        if (!validatePass) return res.status(401).send({ message: 'Provided password is incorrect' });

        // Define the payload containing the username.
        const payload = { username: existingUser.username };

        // Generate the access token.
        const token = jwt.sign(payload, process.env.JWT_SECRET);

        // Update user access token.
        existingUser.token = token;

        // Save the document to the database.
        await existingUser.save()
            .then(doc => {
                res.status(200).send({ message: `Account '${doc.username}' logged in successfully`, token: doc.token, note: 'DO NOT SHARE THIS TOKEN WITH ANYONE' });
            });

    } catch (error) {
        log.bug('Error to login:', error);
        res.status(500).send({ message: 'Internal Server Error, try again later.' });
    }
});

// Router to register a new API account.
router.post('/register', async (req, res) => {
    try {
        // Destructuring assignment.
        const { username, password } = req.body;

        // Check if username and password are provided.
        if (!username || !password) return res.status(400).json({ message: 'You must provide username and password in body.' });

        // Check if usernames is valid.
        if (!isAlphanumericLowercase(username)) return res.status(400).json({ message: 'Username must be alphanumeris lowercase between 3 and 20 characters long.' });

        // Check if username already exist in the database.
        const existingUser = await mongoUser.findOne({ username: req.body.username });
        if (existingUser) return res.status(400).json({ message: `Username '${username}' is already taken.` });

        // Validate the password.
        if (password.length < 5 || password.length > 50) return res.status(400).send({ message: 'Password must be between 5 and 50 characters long.' });


        // Hash the password.
        const salt = bcrypt.genSaltSync(10);
        const hash = bcrypt.hashSync(password, salt);

        // Create a new user document.
        const newUser = new mongoUser({
            username: req.body.username,
            password: hash,
        });

        // Save the new document
        await newUser.save()
            .then(doc => {
                res.status(200).json({ message: `Registered '${doc.username}' successfully. Your account needs to be activated by an administrator before you can access the resources.`, doc });
            });

    } catch (error) {
        log.bug('Error to register user:', error);
        res.status(500).send({ message: 'Internal Server Error, try again later.' });
    }
});

module.exports = router;