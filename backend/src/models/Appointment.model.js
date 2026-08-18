const mongoose = require('mongoose');
const { APPOINTMENT_STATUS, CONSULTATION_TYPES, TREATMENT_CATEGORIES } = require('../constants/appointmentStatus');

const appointmentSchema = new mongoose.Schema({
    patientName: {
        type: String,
        required: [true, 'Patient name is required'],
        trim: true
    },
    patientPhone: {
        type: String,
        required: [true, 'Phone number is required'],
        trim: true,
        match: [/^[6-9]\d{9}$/, 'Please provide a valid 10-digit Indian mobile number']
    },
    patientEmail: {
        type: String,
        trim: true,
        lowercase: true,
        default: ''
    },
    patientAge: {
        type: Number,
        min: 0,
        max: 120
    },
    patientGender: {
        type: String,
        enum: ['Male', 'Female', 'Other', 'Prefer not to say'],
        default: 'Prefer not to say'
    },
    doctorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Doctor'
    },
    treatment: {
        type: String,
        required: [true, 'Treatment is required'],
        trim: true
    },
    consultationType: {
        type: String,
        enum: Object.values(CONSULTATION_TYPES),
        default: CONSULTATION_TYPES.ONLINE_VIDEO
    },
    appointmentDate: {
        type: Date,
        default: () => new Date()
    },
    preferredTimeSlot: {
        type: String,
        default: 'Morning (9 AM - 1 PM)'
    },
    message: {
        type: String,
        trim: true,
        default: ''
    },
    status: {
        type: String,
        enum: Object.values(APPOINTMENT_STATUS),
        default: APPOINTMENT_STATUS.PENDING
    },
    doctorNotes: {
        type: String,
        default: ''
    },
    prescriptions: [{
        remedy: String,
        potency: String,
        dosage: String,
        notes: String
    }],
    isFollowUp: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// Compound index for querying by date & doctor
appointmentSchema.index({ appointmentDate: 1, doctorId: 1, status: 1 });
appointmentSchema.index({ patientPhone: 1 });

const Appointment = mongoose.model('Appointment', appointmentSchema);
module.exports = Appointment;
