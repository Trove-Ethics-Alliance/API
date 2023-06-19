const express = require('express');
const router = express.Router();
const authJWT = require('../../Auth/JWT');
const path = require('path');
const APIError = require('../../Addons/Classes');
const { mongoScrambleCode } = require('../../Mongo/Models/Event/Scramble/Codes');

// Get file name.
const fileName = path.basename(__filename).slice(0, -3);

// Create a new code document.
router.post('/event/scramble/code', authJWT, async (req, res) => {
    try {
        // Destructuring assignment.
        const codeID = req.query.id;

        // Check if at least query parameter is present.
        if (!codeID) return res.status(400).json({ message: 'Missing query parameter' });

        // Check if string is provided in lowercase format.
        if (codeID !== codeID.toLowerCase()) return res.status(400).json({ message: 'You must provide code in lowercase format.' });

        // Make a new document for the scramble event code.
        const newCode = mongoScrambleCode({
            code: codeID
        });

        // Save the new document.
        await newCode.save()
            .then(doc => {

                // Response when document is saved successfully.
                res.status(200).json({ message: `Scramble event code '${doc.code}' created successfully.`, doc });
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
        if (req.query.id) { codeDocument = await mongoScrambleCode.findOne({ code: req.query.id }); }
        else { codeDocument = await mongoScrambleCode.find({}).select('code enabled'); }

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
        const codeID = req.query.id;

        // Check if at least query parameter is present.
        if (!codeID) return res.status(400).json({ message: 'Missing query parameter' });

        // Find the document in the database by 'code' field.
        const codeDocument = await mongoScrambleCode.findOne({ code: codeID });

        // Empty reponse with status 200 when 'codeDocument' is not found.
        if (!codeDocument) return res.status(200).json();

        // Apply the updates received from the req.body to the 'codeDocument' object.
        Object.assign(codeDocument, req.body);

        // // Save the modified document back to the database.
        await codeDocument.save()
            .then(doc => {

                // Reponse with status 200 with the document object for the code that has been updated.
                res.status(200).json({ message: `Scramble event code '${doc.code}' updated successfully.`, doc });
            });

    } catch (error) {
        new APIError(fileName, error, res);
    }
});

// Delete a sign document.
router.delete('/event/scramble/code', authJWT, async (req, res) => {
    try {
        const codeID = req.query.id;

        // Check if at least query parameter is present.
        if (!codeID) return res.status(400).json({ message: 'Missing query parameter' });

        // Find the document in the database by 'code' field.
        const codeDocument = await mongoScrambleCode.findOneAndDelete({ code: codeID });

        // Empty reponse with status 200 when 'codeDocument' is not found.
        if (!codeDocument) return res.status(200).json();

        // Reponse with status 200 with the document object for the code.
        res.status(200).json({ message: `Scramble event code '${codeDocument.code}' deleted successfully.`, doc: codeDocument });

    } catch (error) {
        new APIError(fileName, error, res);
    }
});

module.exports = {
    name: fileName,
    enabled: true,
    router
};