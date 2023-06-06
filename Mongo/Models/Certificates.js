const { Schema } = require('mongoose');
const { certDB } = require('../Connections');

const certificateSchema = new Schema({
    name: {
        type: String, required: true, index: {
            collation: { locale: 'en', strength: 2 }, // Make this case insensitive.
            unique: true // Make this unique
        },
    },
    discord: {
        type: String, default: null, index: {
            partialFilterExpression: { 'discord': { $type: 'string' } }, // Make unique only if that field is provided.
            unique: true // Make this unique
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


module.exports.mongoCertificate = certDB.model('certificates', certificateSchema); // Export Mongo model.