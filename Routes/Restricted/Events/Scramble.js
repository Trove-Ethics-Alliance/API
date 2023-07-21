const express = require('express');
const router = express.Router();
const authJWT = require('../../../Auth/JWT');
const path = require('path');
const APIError = require('../../../Addons/Classes');
const { mongoScrambleCode } = require('../../../Mongo/Models/Event/Scramble/Code');
const { eventParticipant } = require('../../../Mongo/Models/Event/Scramble/Participants');

// Scramble event rank names.
const scrambleRanks = [
    'Unranked', 'Silver', 'Gold', 'Platinium', 'Diamond', 'Obsidian'
];

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

                // Send response to the requester.
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
        const codeDocument = await mongoScrambleCode.findOne({ id, enabled: true });

        // Empty reponse with status 200 when 'codeDocument' is not found.
        if (!codeDocument) return res.status(400).json({ message: 'There is no active code with that name.' });

        // Define conditions to find the participant document
        const conditions = { id: user, codes: { $ne: codeDocument.id } };

        // Define the update data for the participant document.
        const update = { $inc: { points: codeDocument.difficulty }, $addToSet: { codes: codeDocument.id } };

        // Define options for findOneAndUpdate
        const options = {
            upsert: true, // Create a new document if not found
            new: true, // Return the updated document
        };

        const newRecord = await eventParticipant.findOneAndUpdate(conditions, update, options).catch(err => {

            // Response when code is already claimed.
            if (err.code === 11000) {
                return res.status(400).json({ message: 'You already claimed this code!' });
            }

            // If something else happened just move error to the APIError class default responses.
            new APIError(fileName, err, res);
        });

        // Reponse with status 200 with the participant and code document object.
        if (!res.headersSent) {

            // Run a aggregate to conbine all points from codes in a specific range.
            const totalPoints = await mongoScrambleCode.aggregate([
                { $match: { enabled: true } }, // Combine points only from enabled codes.
                { $group: { _id: null, total: { $sum: '$difficulty' } } } // Sum points in that group.
            ]);

            // Check if points are received.
            if (!totalPoints[0]) return res.status(400).json({ message: 'There was an error processing the request.' });

            // Calculate the rank.
            const percentage = ((newRecord.points / totalPoints[0].total) * 100).toFixed(1); // Calculate the percentage

            // Assign the rank to the document.
            switch (true) {
                case (percentage == 100):
                    newRecord.rank = scrambleRanks[5]; // 'Obsidian'
                    break;
                case (percentage >= 80 && percentage < 100):
                    newRecord.rank = scrambleRanks[4]; // 'Diamond'
                    break;
                case (percentage >= 60 && percentage < 80):
                    newRecord.rank = scrambleRanks[3]; // 'Platinium'
                    break;
                case (percentage >= 40 && percentage < 60):
                    newRecord.rank = scrambleRanks[2]; // 'Gold'
                    break;
                case (percentage >= 20 && percentage < 40):
                    newRecord.rank = scrambleRanks[1]; // 'Silver'
                    break;
                default:
                    newRecord.rank = scrambleRanks[0]; // 'Unranked'
                    break;
            }

            // Save the document.
            newRecord.save();

            // Send response to the requester.
            res.status(200).json({ participant: newRecord, code: codeDocument });
        }

    } catch (error) {
        new APIError(fileName, error, res);
    }
});

router.get('/event/scramble/pick_winner', authJWT, async (req, res) => {
    try {
        // Destructuring assignment.
        const { rank } = req.query;
        let { amount } = req.query;

        // Check if rank variable is provided.
        if (!rank) return res.status(400).json({ message: 'You must provide rank name.' });

        // Split rank on comma to get an array or ranks.
        const rankArray = rank.split(',').map(item => item.trim());

        // Check if rankArray contains ranks that are valid according to the scrambleRanks array.
        const checkRankArray = rankArray.every(element => scrambleRanks.includes(element));

        // If rank names are not correct.
        if (!checkRankArray) return res.status(400).json({ message: 'The ranks given include ranks that are not correct according to the system.' });

        // // Check if rank is correct.
        // if (!rank && !scrambleRanks.includes(rank)) {
        //     return res.status(400).json({ message: 'This rank is not allowed to be selected.' });
        // }

        // Change amount variable to a number.
        if (!(typeof amount === 'number')) {
            amount = Number(amount);
        }

        // Check if amount variable is a number.
        if (isNaN(amount)) {
            return res.status(400).json({ message: 'Amount variable must be a number.' });
        }

        // amount variable must be above 0 and below 50.
        if (amount > 50 || amount < 1) {
            return res.status(400).json({ message: 'Amount variable must be at least 1 and not exceed 50.' });
        }

        // Get a number of all documents for provided rank.
        // const maxParticipants = await eventParticipant.countDocuments({ rank });
        const maxParticipants = await eventParticipant.aggregate([

            { // Match documents with the specified rank range.
                $match: { rank: { $in: rankArray } }
            },
            { // Match documents with the specified rank range and count documents.
                $group: { _id: null, count: { $sum: 1 } }
            },
            { // Reshape output to exclude _id field
                $project: { _id: 0, count: 1 }
            }
        ]);

        // In case if maxParticipants fails.
        if (!maxParticipants[0]) return res.status(400).json({ message: 'There was an error processing the request.' });

        // Run the aggregation pipeline.
        const winners = await eventParticipant.aggregate([

            { // Match documents with the specified rank range.
                $match: { rank: { $in: rankArray } }
            },
            { // Randomly select documents by the amount specified.
                $sample: { size: amount }
            },
            { // Reshape output to exclude _id field.
                $project: { _id: 0 }
            }
        ]);

        // Get a percentage of the total number of documents in the pipeline.
        const calculatePercentage = (winners.length / maxParticipants[0].count) * 100;
        const percentage = `${calculatePercentage.toFixed(2)}%`;

        // Send the response to the requester.
        res.status(200).json({ message: `Successfully aggregated ${winners.length} winner(s) (${percentage}) out of ${maxParticipants[0].count} participants from '${rank.toLowerCase()}' rank.`, winners, rank: rankArray, participants: maxParticipants[0].count, chances: `${percentage}` });

    } catch (error) {
        new APIError(fileName, error, res);
    }
});

module.exports = {
    name: fileName,
    enabled: true,
    router
};