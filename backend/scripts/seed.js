const mongoose = require('mongoose');
const config = require('../src/config/env');
const User = require('../src/models/User.model');
const Doctor = require('../src/models/Doctor.model');
const ROLES = require('../src/constants/roles');
const logger = require('../src/utils/logger');

const seedData = async () => {
    try {
        await mongoose.connect(config.MONGO_URI);
        logger.info('Connected to MongoDB for seeding...');

        // 1. Seed Super Admin
        const adminEmail = 'admin@drarjun.com';
        let adminUser = await User.findOne({ email: adminEmail });

        if (!adminUser) {
            adminUser = await User.create({
                name: 'Clinic Administrator',
                email: adminEmail,
                phone: '7842911774',
                password: 'AdminPassword@2026',
                role: ROLES.SUPER_ADMIN
            });
            logger.info(`✅ Super Admin created: ${adminEmail} (Password: AdminPassword@2026)`);
        } else {
            logger.info(`ℹ️ Super Admin already exists: ${adminEmail}`);
        }

        // 2. Seed Doctor: Dr. P. Nagarjuna
        const doc1Email = 'drnagarjuna@drarjun.com';
        let doc1User = await User.findOne({ email: doc1Email });
        if (!doc1User) {
            doc1User = await User.create({
                name: 'Dr. P. Nagarjuna',
                email: doc1Email,
                phone: '7842911774',
                password: 'DoctorPassword@2026',
                role: ROLES.DOCTOR
            });
            logger.info(`✅ Doctor User created: ${doc1Email}`);
        }

        let doc1Profile = await Doctor.findOne({ name: 'Dr. P. Nagarjuna' });
        if (!doc1Profile) {
            doc1Profile = await Doctor.create({
                userId: doc1User._id,
                name: 'Dr. P. Nagarjuna',
                qualification: 'BHMS',
                specialization: ['Skin Diseases', 'Psoriasis', 'Eczema', 'Allergies', 'Migraine'],
                experienceYears: 8,
                bio: 'Dedicated to providing individualized classical homeopathic treatment with a focus on chronic conditions.',
                avatar: 'images/dr-nagarjuna.jpeg',
                weeklySchedule: [1, 2, 3, 4, 5, 6].map(day => ({
                    dayOfWeek: day,
                    startTime: "09:00",
                    endTime: "20:00",
                    slotDurationMinutes: 20,
                    isOff: false
                }))
            });
            logger.info(`✅ Doctor Profile created for Dr. P. Nagarjuna`);
        }

        // 3. Seed Doctor: Dr. D. Harshitha
        const doc2Email = 'drharshitha@drarjun.com';
        let doc2User = await User.findOne({ email: doc2Email });
        if (!doc2User) {
            doc2User = await User.create({
                name: 'Dr. D. Harshitha',
                email: doc2Email,
                phone: '7842911774',
                password: 'DoctorPassword@2026',
                role: ROLES.DOCTOR
            });
            logger.info(`✅ Doctor User created: ${doc2Email}`);
        }

        let doc2Profile = await Doctor.findOne({ name: 'Dr. D. Harshitha' });
        if (!doc2Profile) {
            doc2Profile = await Doctor.create({
                userId: doc2User._id,
                name: 'Dr. D. Harshitha',
                qualification: 'BHMS',
                specialization: ['Hair Fall', 'PCOD / PCOS', 'Thyroid Disorders', 'Diabetes', 'Arthritis'],
                experienceYears: 6,
                bio: 'Passionate about holistic healing, lifestyle integration, and natural constitutional care.',
                avatar: 'images/dr-harshitha.jpeg',
                weeklySchedule: [1, 2, 3, 4, 5, 6].map(day => ({
                    dayOfWeek: day,
                    startTime: "09:00",
                    endTime: "20:00",
                    slotDurationMinutes: 20,
                    isOff: false
                }))
            });
            logger.info(`✅ Doctor Profile created for Dr. D. Harshitha`);
        }

        logger.info('🎉 Database seeding completed successfully!');
        process.exit(0);
    } catch (error) {
        logger.error(`Seeding failed: ${error.message}`);
        process.exit(1);
    }
};

seedData();
