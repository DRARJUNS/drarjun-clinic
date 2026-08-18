const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    name: {
        type: String,
        required: [true, 'Doctor name is required'],
        trim: true
    },
    qualification: {
        type: String,
        default: 'BHMS',
        trim: true
    },
    specialization: [{
        type: String,
        trim: true
    }],
    experienceYears: {
        type: Number,
        default: 5
    },
    bio: {
        type: String,
        default: ''
    },
    avatar: {
        type: String,
        default: ''
    },
    isAvailableForOnline: {
        type: Boolean,
        default: true
    },
    isAvailableForInClinic: {
        type: Boolean,
        default: true
    },
    weeklySchedule: [{
        dayOfWeek: {
            type: Number, // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
            required: true,
            min: 0,
            max: 6
        },
        startTime: {
            type: String, // "09:00"
            default: "09:00"
        },
        endTime: {
            type: String, // "20:00"
            default: "20:00"
        },
        slotDurationMinutes: {
            type: Number,
            default: 20
        },
        isOff: {
            type: Boolean,
            default: false
        }
    }],
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

const Doctor = mongoose.model('Doctor', doctorSchema);
module.exports = Doctor;
