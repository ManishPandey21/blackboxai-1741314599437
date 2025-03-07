const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
    fileName: {
        type: String,
        required: true
    },
    originalFormat: String,
    convertedPath: {
        type: String,
        required: true
    },
    metadata: {
        incomingOutgoing: {
            type: String,
            enum: ['Incoming', 'Outgoing'],
            required: true
        },
        letterDate: {
            type: Date,
            required: true
        },
        letterNumber: {
            type: String,
            required: true
        },
        from: {
            type: String,
            required: true
        },
        to: {
            type: String,
            required: true
        },
        subject: {
            type: String,
            required: true
        },
        reference: String,
        summary: {
            type: String,
            required: true
        }
    },
    uploadedAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Document', documentSchema);
