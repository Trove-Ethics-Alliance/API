const { Schema } = require('mongoose');
const { eventDB } = require('../../../Connections');

const codeSchema = new Schema({
    id: {
        type: String, required: true, index: { // Lowercase + 1-30 length + unique.
            maxlength: 30,
            minlength: 1,
            unique: true
        },
    },
    difficulty: { type: Number, required: true, min: 1, max: 3 },
    tip: { type: String, maxlength: 125, default: null },
    enabled: { type: Boolean, default: true },
    created: { type: Date, default: Date.now, immutable: true },
}, {
    versionKey: false,
    autoCreate: true, // auto create collection
    autoIndex: true, // auto create indexes
    collection: 'scramble.codes'
});

module.exports.mongoScrambleCode = eventDB.model('scramble', codeSchema); // Export Mongo model.