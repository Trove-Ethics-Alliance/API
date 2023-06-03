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
        const { name, discord, description, joinworld, requirements, representatives } = req.body;

        // Check if required name parameter is provided.
        if (!name) return res.status(400).json({ response: 'Required name parameter is missing' });

        // Create a id field for this certificate.
        const clubID = convertStringToMongoID(name);

        // Find a document for this clubID int the certificate database using id field.
        const guildExist = await mongoCertificate.findOne({ id: clubID });

        // Response when the guild document is found.
        if (guildExist) return res.status(400).json({ response: 'This club is already certified.' });

        const newCertificate = mongoCertificate({
            id: clubID,
            name,
            discord: {
                invite: discord?.invite,
                id: discord?.id
            },
            description,
            joinworld,
            requirements,
            representatives // TODO must be an array.
        });

        // Save the new document and send API response.
        await newCertificate.save()
            .then(doc => {

                // Response when document is saved successfully.
                res.status(200).json({ response: `A new club '${doc.name}' successfully certified.`, doc });
            });
    } catch (error) {
        new APIError(fileName, error, res);
    }
});

// Endpoint to get certificate data from a guild
router.get('/certificate/guild', authJWT, async (req, res) => {

    try {
        const mongoDocID = req.query.mid;
        let clubID = req.query.id;
        const clubDiscordID = req.query.discord;
        const clubName = req.query.name;

        // If mongoDocID is provided then format it correctly for mongoose.
        if (clubID) {
            clubID = convertStringToMongoID(clubID); // It converts a string with following format: string lowercase with space replaces with dash
        }

        // This search with OR statement will try to find one document that matches the criteria.
        const mongoOptions = {
            $or: [
                { '_id': mongoDocID }, // MongoDB's Document _id field.
                { 'id': clubID }, // Club's ID field.
                { 'name': { $regex: new RegExp('^' + clubName + '$', 'i') } }, // Club's Name field.
                { 'discord.id': clubDiscordID }, // Club's Discord Server ID field.
            ]
        };

        // Check if guild Exists from provided options.
        const guildExist = await mongoCertificate.findOne(mongoOptions).select('name discord description joinworld requirements representatives');

        // Send empty response if guild doesn't exist
        if (!guildExist) return res.status(200).json();

        // Return the results
        res.json(guildExist);

    } catch (error) {
        new APIError(fileName, error, res);
    }
});

router.patch('/certificate/guild', authJWT, async (req, res) => {

    try {
        // Find the guild in the certificate database by _id field.
        const guildExist = await mongoCertificate.findOne({ _id: req.body._id });

        // Response when 'guildExist' is not found.
        if (!guildExist) return res.status(200).json();

        // Apply the updates received from the req.body to the 'guildExist' object.
        Object.assign(guildExist, req.body);

        // Save the modified document back to the database.
        await guildExist.save();

        // Response back with updated document.
        res.json(guildExist);

    } catch (error) {
        new APIError(fileName, error, res);
    }
});

router.delete('/certificate/guild', authJWT, async (req, res) => {

    try {
        let clubID = req.body.id;
        const clubDiscordID = req.body.discordID;
        const clubName = req.body.name;

        // If mongoDocID is provided then format it correctly for mongoose.
        if (clubID) {
            clubID = convertStringToMongoID(clubID); // It converts a string with following format: string lowercase with space replaces with dash
        }

        // This search with OR statement will try to find one document that matches the criteria.
        const mongoOptions = {
            $or: [
                { 'id': clubID }, // MongoDB's Document ID field.
                { 'name': { $regex: new RegExp('^' + clubName + '$', 'i') } }, // Club's Name field.
                { 'discord.id': clubDiscordID }, // Club's Discord Server ID field.
            ]
        };

        // Check if guild Exists from provided options.
        const deleteGuildCert = await mongoCertificate.findOneAndDelete(mongoOptions);

        // Response when 'deleteGuildCert' is not found.
        if (!deleteGuildCert) return res.status(200).json();

        // Response when guild certificate is removed.
        res.json({ response: 'Guild Certificate deleted successfully' });

    } catch (error) {
        new APIError(fileName, error, res);
    }
});

module.exports = {
    name: fileName,
    enabled: true,
    router
};