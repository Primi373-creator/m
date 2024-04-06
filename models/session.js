const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const SessionSchema = new Schema({
    id: {
        type: String,
        required: true
    },
    sessionId: {
        type: String,
        required: true
    },
    creds: {
        type: String,
        required: true
    },
    dateCreated: {
        type: Date,
        default: Date.now
    },
    expiryDate: {
        type: Date,
        default: function() {
            return new Date(this.dateCreated.getTime() + (2 * 24 * 60 * 60 * 1000));
        }
    }
});

SessionSchema.index({ expiryDate: 1 }, { expireAfterSeconds: 0 });

const Session = mongoose.model('Session', SessionSchema);

module.exports = Session;
