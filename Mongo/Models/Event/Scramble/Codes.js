const { Schema } = require('mongoose');
const { eventDB } = require('../../../Connections');

const codeSchema = new Schema({
    code: {
        type: String, required: true, index: { // Lowercase + 1-30 length + unique.
            maxlength: 30,
            minlength: 1,
            unique: true
        },
    },
    enabled: { type: Boolean, default: true },
    added: { type: Date, default: Date.now, immutable: true },
}, {
    versionKey: false,
    autoCreate: true, // auto create collection
    autoIndex: true, // auto create indexes
    collection: 'scramble.codes'
});

module.exports.mongoScrambleCode = eventDB.model('scramble', codeSchema); // Export Mongo model.