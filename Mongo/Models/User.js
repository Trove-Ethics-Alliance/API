const { Schema } = require('mongoose');
const { userDB } = require('../Connections');

const userSchema = new Schema({
    username: { type: String, required: true, index: true, unique: true, min: 3, max: 20 },
    password: { type: String, required: true, max: 1024 },
    token: { type: String, required: true, default: '0' },
    activated: { type: Boolean, required: true, default: false },
}, {
    versionKey: false,
    autoCreate: true, // auto create collection
    autoIndex: true, // auto create indexes
    collection: 'data'
});

// define indexes to create
// userSchema.index({ username: 1 }, { unique: true, name: 'username_unique' });

module.exports.mongoUser = userDB.model('user', userSchema); // Export Mongo model.