const APPOINTMENT_STATUS = Object.freeze({
    PENDING: 'PENDING',
    CONFIRMED: 'CONFIRMED',
    COMPLETED: 'COMPLETED',
    CANCELLED: 'CANCELLED',
    NO_SHOW: 'NO_SHOW',
    RESCHEDULED: 'RESCHEDULED'
});

const CONSULTATION_TYPES = Object.freeze({
    ONLINE_VIDEO: 'ONLINE_VIDEO',
    PHONE_CALL: 'PHONE_CALL',
    ONLINE: 'ONLINE'
});

const TREATMENT_CATEGORIES = Object.freeze([
    'Skin Diseases',
    'Hair Fall',
    'Psoriasis',
    'Eczema',
    'Allergies',
    'Migraine',
    'Arthritis',
    'Thyroid Disorders',
    'PMOS / PCOS',
    'PCOD / PCOS',
    'Diabetes',
    'General Consultation',
    'Other complaint',
    'Other / General Consultation'
]);

module.exports = {
    APPOINTMENT_STATUS,
    CONSULTATION_TYPES,
    TREATMENT_CATEGORIES
};
