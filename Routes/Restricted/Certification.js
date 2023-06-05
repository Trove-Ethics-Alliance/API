const express = require('express');
const router = express.Router();
const authJWT = require('../../Auth/JWT');
const path = require('path');
const { mongoCertificate } = require('../../Mongo/Models/Certificates');
const APIError = require('../../Addons/Classes');
const mongoose = require('mongoose');

// Get file name.
const fileName = path.basename(__filename).slice(0, -3);

// Create a new certificate document.
router.post('/certificate/guild', authJWT, async (req, res) => {
    try {
        // Destructuring assignment.
        const { name, discord, description, joinworld, requirements, representatives } = req.body;

        // Check if required name parameter is provided.
        if (!name) return res.status(400).json({ message: 'Required name parameter is missing' });

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
                res.status(200).json({ message: `Certificate for '${doc.name}' created successfully.`, doc });
            });
    } catch (error) {
        new APIError(fileName, error, res);
    }
});

// Find certificate document.
router.get('/certificate/guild', authJWT, async (req, res) => {

    try {
        const documentID = req.query.id;
        const clubName = req.query.name;
        const clubDiscordID = req.query.discord;

        // Check if at least query parameter is present.
        if (!documentID && !clubDiscordID && !clubName) return res.status(400).json({ message: 'Missing query parameters' });

        // Check if the ID query parameter is a valid MongoDB _ID object.
        if (documentID && !mongoose.Types.ObjectId.isValid(documentID)) return res.status(400).json({ message: 'Document ID is not valid.' });

        // This search with OR statement will try to find one document that matches the criteria.
        const mongoOptions = {
            $or: [
            ]
        };

        // Fill mongoOptions OR array with available options.
        if (documentID) mongoOptions.$or.push({ _id: documentID });
        if (clubName) mongoOptions.$or.push({ name: { $regex: clubName, $options: 'i' } });
        if (clubDiscordID) mongoOptions.$or.push({ discord: clubDiscordID });

        // Check if guild Exists from provided options.
        const guildExist = await mongoCertificate.findOne(mongoOptions);

        // Empty reponse with status 200 when 'guildExist' is not found.
        if (!guildExist) return res.status(200).json();

        // Reponse with status 200 with the document object for the guild.
        res.status(200).json(guildExist);

    } catch (error) {
        new APIError(fileName, error, res);
    }
});

// Update certificate document.
router.patch('/certificate/guild', authJWT, async (req, res) => {

    try {
        // Find the guild in the certificate database by _id field.
        const guildExist = await mongoCertificate.findOne({ _id: req.body.id });

        // Empty reponse with status 200 when 'guildExist' is not found.
        if (!guildExist) return res.status(200).json();

        // Apply the updates received from the req.body to the 'guildExist' object.
        Object.assign(guildExist, req.body);

        // Save the modified document back to the database.
        await guildExist.save()
            .then(doc => {

                // Reponse with status 200 with the document object for the guild that has been updated.
                res.status(200).json({ message: `Certificate for '${doc.name}' updated successfully.`, doc });
            });

    } catch (error) {
        new APIError(fileName, error, res);
    }
});

// Delete a certificate document.
router.delete('/certificate/guild', authJWT, async (req, res) => {

    try {
        const documentID = req.body.id;

        // Check if at least query parameter is present.
        if (!documentID) return res.status(400).json({ message: 'Missing query parameters' });

        // Check if the ID query parameter is a valid MongoDB _ID object.
        if (documentID && !mongoose.Types.ObjectId.isValid(documentID)) return res.status(400).json({ message: 'Document ID is not valid.' });

        // Check if guild exists from provided options.
        const deleteGuildCert = await mongoCertificate.findOneAndDelete({ _id: documentID });

        // Empty reponse with status 200 when 'deleteGuildCert' is not found.
        if (!deleteGuildCert) return res.status(200).json();

        // Response when guild certificate is removed.
        res.status(200).json({ message: `Certificate for '${deleteGuildCert.name}' deleted successfully.`, doc: deleteGuildCert });

    } catch (error) {
        new APIError(fileName, error, res);
    }
});

module.exports = {
    name: fileName,
    enabled: true,
    router
};