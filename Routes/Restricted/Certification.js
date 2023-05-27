const express = require('express');
const router = express.Router();
const authJWT = require('../../Auth/JWT');
const path = require('path');
const { mongoCertificate } = require('../../Mongo/Models/Certificates');
const APIError = require('../../Addons/Classes');
const { convertStringToMongoID } = require('../../Addons/Functions');

// Get file name.
const fileName = path.basename(__filename).slice(0, -3);

// Endpoint to create a new club certificate.
router.post('/certificate', authJWT, async (req, res) => {
    try {
        // Destructuring assignment.
        const { name, discord, description, joinworld, requirements, representative } = req.body;

        // Check if required name parameter is provided.
        if (!name) return res.status(400).json({ message: 'Required name parameter is missing' });

        // Create a _id field for this certificate.
        const guildMongoID = convertStringToMongoID(name);

        const guildExist = await mongoCertificate.findOne({ _id: guildMongoID });
        if (guildExist) return res.status(400).json({ message: 'This club is already certified.' });

        // CHANGEME. I NEED TO FIGURE OUT A WAY TO HANDLE DUPLICATE ERROR MESSAGES AND HANDLE SYNTAXERRORS FROM API.

        const newCertificate = mongoCertificate({
            _id: guildMongoID,
            name,
            discord: {
                invite: discord?.invite,
                id: discord?.id
            },
            description,
            joinworld,
            requirements,
            representative: {
                user: representative?.user,
                id: representative?.id
            }
        });

        // Save the new document and send API response.
        await newCertificate.save()
            .then(doc => {
                res.status(200).json({ message: `A new club '${doc.name}' successfully certified.`, doc });
            });
    } catch (error) {
        new APIError(fileName, error, res);
    }
});

// Endpoint to find a certificate for a specific guild.
router.get('/certificate/guild', authJWT, (req, res) => {

    // URL:localhost/v1/certificate/guild?id=1234&name=myTestGuildName
    const club_id = req.query.id; // 1234
    const club_name = req.query.name; // myTestGuildName

    res.status(200).json({ message: `Welcome ${req.user}! This is your certificate GET ${club_id} | ${club_name} data endpoint.` });
});

// Endpoint to get certificate data from a guild
router.get('/certificate/data', authJWT, async (req, res) => {
    
    try {
        const club_id = req.query.id;
    
        // Check if guild Exists
        const guildExist = await mongoCertificate.findOne({ 'discord.id': req.query.id });
        if (!guildExist) return res.status(404).json({ message: 'Guild not found in database' });
    
        // Return the results
        res.json({ certificate: guildExist });

    } catch (error) {
        new APIError(fileName, error, res);
    }
});

router.post('/certificate/data', authJWT, async (req, res) => {

    try {
        
        // Find the guild
        const guildExist = await mongoCertificate.findOne({ 'discord.id': req.body.discord.id });
        if (!guildExist) return res.status(404).json({ message: 'Guild not found in database'});

        // Apply the updates from the JSON to the object to the found document
        Object.assign(guildExist, req.body);

        // Save the modified document back to the database
        await guildExist.save()

        // Return back updated document.
        res.json(guildExist);
        
        
    } catch (error) {
        new APIError(fileName, error, res);
    }
});


module.exports = {
    name: fileName,
    enabled: true,
    router
};