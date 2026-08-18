const mongoose = require('mongoose');

const contactMessageSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true
    },
    phone: {
        type: String,
        required: [true, 'Phone number is required'],
        trim: true
    },
    email: {
        type: String,
        trim: true,
        lowercase: true,
        default: ''
    },
    subject: {
        type: String,
        default: 'General Inquiry',
        trim: true
    },
    message: {
        type: String,
        required: [true, 'Message content is required'],
        trim: true
    },
    isRead: {
        type: Boolean,
        default: false
    },
    repliedAt: {
        type: Date
    }
}, {
    timestamps: true
});

const ContactMessage = mongoose.model('ContactMessage', contactMessageSchema);
module.exports = ContactMessage;
