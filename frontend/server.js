require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// Security Check
if (!process.env.MONGO_URI) {
    console.error("❌ ERROR: MONGO_URI is missing in .env file.");
    process.exit(1);
}

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname)));

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("✅ MongoDB Connected Successfully"))
    .catch((err) => {
        console.error("❌ MongoDB Connection Failed:", err.message);
        process.exit(1);
    });

// Appointment Schema
const appointmentSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true },
    treatment: { type: String, required: true },
    message: { type: String, default: "" },
    createdAt: { type: Date, default: Date.now }
});

const Appointment = mongoose.model("Appointment", appointmentSchema);

// Routes

// Serve Homepage
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

// Book Appointment
app.post("/appointment", async (req, res) => {
    try {
        const { name, phone, email, treatment, message } = req.body;

        if (!name || !phone || !email || !treatment) {
            return res.status(400).json({ success: false, message: "Please fill all required fields." });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ success: false, message: "Invalid email format." });
        }

        // Indian Phone Validation (starts with 6-9, 10 digits)
        const phoneRegex = /^[6-9]\d{9}$/;
        if (!phoneRegex.test(phone)) {
            return res.status(400).json({ success: false, message: "Invalid mobile number (must start with 6-9)." });
        }

        const newAppointment = new Appointment({ name, phone, email, treatment, message });
        await newAppointment.save();

        console.log("✅ New Appointment:", name);
        res.status(201).json({ success: true, message: "Appointment booked successfully!" });

    } catch (err) {
        console.error("Server Error:", err);
        res.status(500).json({ success: false, message: "Internal server error. Please try again later." });
    }
});

// Get All Appointments (Admin only in production)
app.get("/appointments", async (req, res) => {
    try {
        const appointments = await Appointment.find().sort({ createdAt: -1 });
        res.json(appointments);
    } catch (err) {
        res.status(500).json({ success: false, message: "Unable to fetch appointments." });
    }
});

// 404 Handler
app.use((req, res) => {
    res.status(404).json({ success: false, message: "Page Not Found" });
});

// Start Server
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});