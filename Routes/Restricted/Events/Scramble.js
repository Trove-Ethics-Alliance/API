const express = require('express');
const router = express.Router();
const authJWT = require('../../../Auth/JWT');
const path = require('path');
const APIError = require('../../../Addons/Classes');
const { mongoScrambleCode } = require('../../../Mongo/Models/Event/Scramble/Code');
const { eventParticipant } = require('../../../Mongo/Models/Event/Scramble/Participants');

// Get file name.
const fileName = path.basename(__filename).slice(0, -3);

// Create a new code document.
router.post('/event/scramble/code', authJWT, async (req, res) => {
    try {
        // Destructuring assignment.
        const codeID = req.query.id;
        const { difficulty, tip, enabled } = req.body;

        // Check if at least query parameter is present.
        if (!codeID) return res.status(400).json({ message: 'Missing query parameter' });

        // Check if string is provided in lowercase format.
        if (codeID !== codeID.toLowerCase()) return res.status(400).json({ message: 'You must provide code in lowercase format.' });

        // Make a new document for the scramble event code.
        const newCode = mongoScrambleCode({
            id: codeID,
            difficulty: difficulty,
            tip: tip ? tip : null,
            enabled: enabled !== undefined ? enabled : true
        });

        // Save the new document.
        await newCode.save()
            .then(doc => {

                // Response when document is saved successfully.
                res.status(200).json({ message: `Scramble event code '${doc.id}' created successfully.`, doc });
            });

    } catch (error) {
        new APIError(fileName, error, res);
    }
});

// Read a code document.
router.get('/event/scramble/code', authJWT, async (req, res) => {
    try {

        // Run a query to get the document. If query ID is provided it will return one speficied document otherwise all of them.
        let codeDocument;
        if (req.query.id) { codeDocument = await mongoScrambleCode.findOne({ id: req.query.id }); }
        else { codeDocument = await mongoScrambleCode.find({}).select('id'); }

        // Empty reponse with status 200 when 'codeDocument' is not found.
        if (!codeDocument) return res.status(200).json();

        // Reponse with status 200 with the document object for the code.
        res.status(200).json(codeDocument);

    } catch (error) {
        new APIError(fileName, error, res);
    }
});

// Update a code document.
router.patch('/event/scramble/code', authJWT, async (req, res) => {
    try {
        // Check if at least query parameter is present.
        if (!req.query.id) return res.status(400).json({ message: 'Missing query parameter' });

        // Find the document in the database by 'code' field.
        const codeDocument = await mongoScrambleCode.findOne({ id: req.query.id });

        // Empty reponse with status 200 when 'codeDocument' is not found.
        if (!codeDocument) return res.status(200).json();

        // Apply the updates received from the req.body to the 'codeDocument' object.
        Object.assign(codeDocument, req.body);

        // // Save the modified document back to the database.
        await codeDocument.save()
            .then(doc => {

                // Reponse with status 200 with the document object for the code that has been updated.
                res.status(200).json({ message: `Scramble event code '${doc.id}' updated successfully.`, doc });
            });

    } catch (error) {
        new APIError(fileName, error, res);
    }
});

// Delete a sign document.
router.delete('/event/scramble/code', authJWT, async (req, res) => {
    try {
        // Check if at least query parameter is present.
        if (!req.query.id) return res.status(400).json({ message: 'Missing query parameter' });

        // Find the document in the database by 'code' field.
        const codeDocument = await mongoScrambleCode.findOneAndDelete({ id: req.query.id });

        // Empty reponse with status 200 when 'codeDocument' is not found.
        if (!codeDocument) return res.status(200).json();

        // Reponse with status 200 with the document object for the code.
        res.status(200).json({ message: `Scramble event code '${codeDocument.id}' deleted successfully.`, doc: codeDocument });

    } catch (error) {
        new APIError(fileName, error, res);
    }
});

// Read total points.
router.get('/event/scramble/total', authJWT, async (req, res) => {
    try {

        // Run a aggregate to conbine all points from the codes in a specific range.
        const codeDocument = await mongoScrambleCode.aggregate([
            { $match: { enabled: true } }, // Combine points only from enabled codes.
            { $group: { _id: null, total: { $sum: '$difficulty' } } } // Sum points in that group.
        ]);

        // Reponse with status 200 with the a number of total points available during this event.
        res.status(200).json(codeDocument[0].total);

    } catch (error) {
        new APIError(fileName, error, res);
    }
});

// Claim the code
router.get('/event/scramble/code/claim', authJWT, async (req, res) => {
    try {
        // Destructuring assignment.
        const { id, user } = req.query;

        // Run a query to get the document.
        const codeDocument = await mongoScrambleCode.findOne({ id });

        // Empty reponse with status 200 when 'codeDocument' is not found.
        if (!codeDocument) return res.status(400).json({ message: 'There is no code with that name.' });


        // Define the conditions to find the participant document
        const conditions = { id: user, codes: { $ne: codeDocument.id } };

        // Define the update or new document to be created
        const update = { $inc: { points: codeDocument.difficulty }, $addToSet: { codes: codeDocument.id } };

        // Set the options for findOneAndUpdate
        const options = {
            upsert: true, // Create a new document if not found
            new: true, // Return the updated document
        };

        const newRecord = await eventParticipant.findOneAndUpdate(conditions, update, options);

        // Reponse with status 200 with the document object for the code.
        res.status(200).json({ participant: newRecord, code: codeDocument });

    } catch (error) {
        new APIError(fileName, error, res);
    }
});

module.exports = {
    name: fileName,
    enabled: true,
    router
};