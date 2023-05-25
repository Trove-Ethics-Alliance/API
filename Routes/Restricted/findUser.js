const express = require('express');
const router = express.Router();
const authJWT = require('../../Auth/JWT');
const log = require('../../Addons/Logger');
const { mongoUser } = require('../../Mongo/Models/User');
const path = require('path');

// Get file name
const fileName = path.basename(__filename).slice(0, -3);

router.get('/findUser', authJWT, async (req, res) => {
    try {
        // Destructuring the assignment
        const { username } = req.body;

        // Check if username are provided.
        if (!username) return res.status(400).json({ message: 'You must provide a username to find '});

        // Check if username is in the database
        const user = await mongoUser.findOne({ username: req.body.username });
        if (!user) return res.status(400).json({ message: 'This user does not exist' });

        res.json({ user });
    } catch (error) {
        log.bug('Error to Find User:', error);
        res.status(500).send({ message: 'Internal Server Error, try again later'});
    }   
});

router.post('/editUser', authJWT, async (req, res) => {
    try {
        // Destructuring the assignment
        console.log(req.body);

        // store user into a variable.
        const editUser = await mongoUser.findById(req.body._id);

        // Make the changes
        editUser._id = req.body._id;
        editUser.username = req.body.username;
        editUser.password = req.body.password;
        editUser.token = req.body.token;
        editUser.activated = req.body.activated;

        // Save changes
        await editUser.save();

        res.json({ message: `Editted User Data: ${editUser}` });
        
    } catch (error) {
        log.bug('Error to Edit User Data:', error);
        res.status(500).send({ message: 'Internal Server Error, try again later'});
    }
})

module.exports = {
    name: fileName,
    enabled: true,
    router
}