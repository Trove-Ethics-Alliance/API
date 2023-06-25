const { Schema } = require('mongoose');
const { participantDB } = require('../../../Connections');

const codeSchema = new Schema({
    id: {
        type: String,
        required: true,
        match: /^\d{18}$/,
        index: {
            unique: true
        },
    },
    points: { type: Number, required: true, min: 0, max: 9999 },
    rank: { type: String, required: true, maxlength: 64, default: 'unranked' },
    codes: { type: [String], required: true, default: [] },
}, {
    versionKey: false,
    autoCreate: true, // auto create collection
    autoIndex: true, // auto create indexes
    collection: 'event.participants'
});

module.exports.eventParticipant = participantDB.model('participant', codeSchema); // Export Mongo model.