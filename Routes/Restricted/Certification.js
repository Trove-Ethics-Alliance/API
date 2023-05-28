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

// Endpoint to get certificate data from a guild
router.get('/certificate/guild', authJWT, async (req, res) => {

    try {
        let mongoDocID = req.query.id;
        const clubDiscordID = req.query.discord;
        const clubName = req.query.name;
        console.log(req.query);

        // If mongoDocID is provided then format it correctly for mongoose.
        if (mongoDocID) {
            mongoDocID = convertStringToMongoID(mongoDocID); // It converts a string with following format: string lowercase with space replaces with dash
        }

        // This search with OR statement will try to find one document that matches the criteria.
        const mongoOptions = {
            $or: [
                { '_id': mongoDocID }, // MongoDB's Document _ID field.
                { 'name': clubName }, // Club's Discord Server ID field.
                { 'discord.id': clubDiscordID }, // Club name field.
            ]
        };

        // Check if guild Exists from provided options.
        const guildExist = await mongoCertificate.findOne(mongoOptions);
        if (!guildExist) return res.status(404).json({ message: 'Guild not found in database' });

        // Return the results
        res.json({ certificate: guildExist });

    } catch (error) {
        new APIError(fileName, error, res);
    }
});

router.patch('/certificate/guild', authJWT, async (req, res) => {

    try {
        // Find the guild
        const guildExist = await mongoCertificate.findOne({ 'discord.id': req.body.discord.id });
        if (!guildExist) return res.status(404).json({ message: 'Guild not found in database' });

        // Apply the updates from the JSON to the object to the found document
        Object.assign(guildExist, req.body);

        // Save the modified document back to the database
        await guildExist.save();

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