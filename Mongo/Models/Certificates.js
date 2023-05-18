const { Schema } = require('mongoose');
const { certDB } = require('../Mongo/Connections');

const certificateSchema = new Schema({
    club: { type: String, required: true, index: true, unique: true, dropDups: true, },
    description: { type: String, default: null },
    world: { type: String, default: null },
    requirements: { type: String, default: null },
    representative: { type: String, default: null },
    discord: {
        invite: { type: String, default: null },
        id: { type: String, default: null },
    }
}, {
    versionKey: false,
    autoCreate: true, // auto create collection
    autoIndex: true, // auto create indexes
    collection: 'data'
});

// define indexes to create
// certificateSchema.index({ club: 1 }, { unique: true, name: 'club_unique' });

module.exports.mongoCertificate = certDB.model('certificate', certificateSchema); // Export Mongo model.