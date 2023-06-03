const { Schema } = require('mongoose');
const { certDB } = require('../Connections');

const certificateSchema = new Schema({
    name: { type: String, required: true, index: true, unique: true },
    discord: {
        type: String, default: null, index: {
            unique: true,
            partialFilterExpression: { 'discord': { $type: 'string' } } // Make unique discord id if that field is provided.
        }
    },
    description: { type: String, default: null },
    joinworld: { type: String, default: null },
    requirements: { type: String, default: null },
    representatives: { type: String },
    joined: { type: Date, default: Date.now, immutable: true },
}, {
    versionKey: false,
    autoCreate: true, // auto create collection
    autoIndex: true, // auto create indexes
    collection: 'data'
});

// define indexes to create
// certificateSchema.index({ club: 1 }, { unique: true, name: 'club_unique' });

module.exports.mongoCertificate = certDB.model('certificate', certificateSchema); // Export Mongo model.