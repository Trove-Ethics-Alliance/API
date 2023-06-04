const express = require('express');
const router = express.Router();
const authJWT = require('../../Auth/JWT');
const path = require('path');
const { mongoCertificate } = require('../../Mongo/Models/Certificates');
const APIError = require('../../Addons/Classes');

// Get file name.
const fileName = path.basename(__filename).slice(0, -3);

// Endpoint to create a new certificate document.
router.post('/certificate/guild', authJWT, async (req, res) => {
    try {
        // Destructuring assignment.
        const { name, discord, description, joinworld, requirements, representatives } = req.body;

        // Check if required name parameter is provided.
        if (!name) return res.status(400).json({ message: 'Required name parameter is missing' });

        // Find a document for this clubID int the certificate database using id field.
        const guildExist = await mongoCertificate.findOne({ name });

        // Response when the guild document is found.
        if (guildExist) return res.status(400).json({ message: `'${guildExist.name}' club is already certified.` });

        const newCertificate = mongoCertificate({
            name,
            discord,
            description,
            joinworld,
            requirements,
            representatives
        });

        // Save the new document and send API response.
        await newCertificate.save()
            .then(doc => {

                // Response when document is saved successfully.
                res.status(200).json({ message: `A new club '${doc.name}' successfully certified.`, doc });
            });
    } catch (error) {
        new APIError(fileName, error, res);
    }
});

// Endpoint to find certificate document.
router.get('/certificate/guild', authJWT, async (req, res) => {

    try {
        const documentID = req.query.id;
        const clubDiscordID = req.query.discord;
        const clubName = req.query.name;

        // This search with OR statement will try to find one document that matches the criteria.
        const mongoOptions = {
            $or: [
                { _id: documentID }, // MongoDB's Document _id field.
                { name: { $regex: clubName, $options: 'i' } }, // Club's Name field.
                { discord: clubDiscordID }, // Club's Discord Server ID field.
            ]
        };

        // Check if guild Exists from provided options.
        const guildExist = await mongoCertificate.findOne(mongoOptions).select('name discord description joinworld requirements representatives');

        // Send empty response if guild doesn't exist
        if (!guildExist) return res.status(200).json();

        // Return the results
        res.status(200).json(guildExist);

    } catch (error) {
        new APIError(fileName, error, res);
    }
});

// Endpoint to update certificate document..
router.patch('/certificate/guild', authJWT, async (req, res) => {

    try {
        // Find the guild in the certificate database by _id field.
        const guildExist = await mongoCertificate.findOne({ _id: req.body._id });

        // Response when 'guildExist' is not found.
        if (!guildExist) return res.status(200).json();

        // Apply the updates received from the req.body to the 'guildExist' object.
        Object.assign(guildExist, req.body);

        // Save the modified document back to the database.
        await guildExist.save()
            .then(doc => {

                // Response when document is saved successfully.
                res.status(200).json({ message: `Successfully modified ${doc.name}'s Club Certificate.`, doc });
            });

    } catch (error) {
        new APIError(fileName, error, res);
    }
});

// Endpoint to delete a certificate document.
router.delete('/certificate/guild', authJWT, async (req, res) => {

    try {
        const clubDiscordID = req.body.discord;
        const clubName = req.body.name;

        // This search with OR statement will try to find one document that matches the criteria.
        const mongoOptions = {
            $or: [
                { name: { $regex: clubName, $options: 'i' } }, // Club's Name field.
                { discord: clubDiscordID }, // Club's Discord Server ID field.
            ]
        };

        // Check if guild Exists from provided options.
        const deleteGuildCert = await mongoCertificate.findOneAndDelete(mongoOptions);

        // Response when 'deleteGuildCert' is not found.
        if (!deleteGuildCert) return res.status(200).json();

        // Response when guild certificate is removed.
        res.status(200).json({ message: `Guild Certificate for '${deleteGuildCert.name}' deleted successfully` });

    } catch (error) {
        new APIError(fileName, error, res);
    }
});

module.exports = {
    name: fileName,
    enabled: true,
    router
};