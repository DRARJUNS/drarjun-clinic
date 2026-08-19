/**
 * Dr Arjun's Homoeo Care - AI Assistant Service
 * Provides clinical homeopathic knowledge triage, clinic consultation info, and Gemini AI integration
 */

const config = require('../config/env');
const logger = require('../utils/logger');

// Homeopathic Knowledge Base & Clinic FAQs
const CLINIC_KNOWLEDGE = {
    clinicName: "Dr Arjun's Homoeo Care",
    phone: "+91 78429 11774",
    email: "drarjunshomoeocare@gmail.com",
    timings: "Monday - Saturday: 9:00 AM - 8:00 PM (Online Consultation Available)",
    consultationMode: "100% Online (Video Call / WhatsApp / Phone) with Doorstep Medicine Delivery Across India",
    doctors: [
        { name: "Dr. P. Nagarjuna", qualification: "BHMS", specialization: "Skin Diseases, Psoriasis, Eczema, Allergies, Migraine", exp: "8+ Years" },
        { name: "Dr. D. Harshitha", qualification: "BHMS", specialization: "Hair Fall, PMOS / PCOS, Thyroid Disorders, Diabetes, Arthritis", exp: "6+ Years" }
    ]
};

/**
 * Intelligent Homeopathic Triage & Response Generator
 * @param {string} userMessage 
 * @param {Array} history 
 */
const generateBotResponse = async (userMessage, history = []) => {
    const text = (userMessage || "").toLowerCase().trim();

    // 1. Check if Gemini API key is configured
    if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'placeholder') {
        try {
            const { GoogleGenAI } = require('@google/genai');
            const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
            
            const systemPrompt = `You are "Arjun AI", the official friendly & expert AI Health Assistant for Dr Arjun's Homoeo Care (a premier 100% Online Homeopathic Clinic).
Clinic Details:
- Doctors: Dr. P. Nagarjuna (BHMS, Senior Consultant) and Dr. D. Harshitha (BHMS, Consultant).
- Contact: +91 78429 11774 | Email: drarjunshomoeocare@gmail.com
- Timings: Mon-Sat 9 AM - 8 PM.
- Mode: 100% Online Consultation (Video/Phone) + Doorstep Medicine Courier delivery across India.
- Services: Skin Diseases (Psoriasis, Eczema, Acne), Hair Fall & Scalp Care, PMOS / PCOS, Thyroid, Migraine, Arthritis, Allergies, Diabetes.
Your Role:
- Answer health and homeopathic treatment questions politely, empathetically, and informatively.
- Highlight that homeopathic remedies are 100% natural, safe, and aim to treat root causes without side effects.
- Encourage patients to book an online consultation with the clinic's BHMS doctors for customized constitutional remedies.
- Keep answers concise, clear, and structured with bullet points.`;

            const response = await ai.models.generateContent({
                model: 'gemini-1.5-flash',
                contents: [
                    { role: 'user', parts: [{ text: `${systemPrompt}\n\nPatient Query: ${userMessage}` }] }
                ]
            });

            if (response && response.text) {
                return {
                    reply: response.text,
                    source: "gemini_ai",
                    quickActions: [
                        { label: "📅 Book Consultation", action: "book_appointment" },
                        { label: "💬 Chat on WhatsApp", action: "open_whatsapp" }
                    ]
                };
            }
        } catch (err) {
            logger.warn(`Gemini API call failed, falling back to expert triage engine: ${err.message}`);
        }
    }

    // 2. Expert Homeopathic Clinical Triage Engine (Offline / Standalone)
    let reply = "";
    let quickActions = [
        { label: "📅 Book Consultation", action: "book_appointment" },
        { label: "💬 Chat on WhatsApp", action: "open_whatsapp" }
    ];

    if (/hello|hi|hey|greetings|namaste|morning|evening/i.test(text)) {
        reply = `Hello! 🌿 Welcome to **Dr Arjun's Homoeo Care**.\n\nI am **Arjun AI**, your online homeopathic health assistant. I can help you with:\n\n• **Treatment Info** (Skin, Hair Fall, PMOS / PCOS, Migraine, Thyroid, Allergies, etc.)\n• **Online Consultation Process** & Medicine Delivery\n• **Booking an Appointment** with our BHMS Doctors\n\nHow may I assist your health journey today?`;
    }
    else if (/book|appointment|consult|schedule|slot|timing|fee|cost|price/i.test(text)) {
        reply = `📅 **Online Consultation Booking**\n\nBooking a consultation with our experienced BHMS doctors is simple:\n\n1. **Fill the Quick Form**: Enter your name, phone, and symptoms.\n2. **Doctor Consultation**: Detailed video or phone case study at your preferred time slot.\n3. **Doorstep Delivery**: Tailored homeopathic medicines securely couriered to your address.\n\nWould you like to book an appointment right now?`;
        quickActions = [
            { label: "📅 Open Booking Form", action: "book_appointment" },
            { label: "📞 Call +91 78429 11774", action: "call_clinic" }
        ];
    }
    else if (/online|how (it|consultation) work|courier|delivery|home delivery|process|step/i.test(text)) {
        reply = `🌿 **100% Online Consultation & Doorstep Delivery Process**:\n\n1. **Step 1 - Online Booking**: Select your treatment and convenient slot (Morning or Evening).\n2. **Step 2 - Detailed Case History**: Our BHMS doctors conduct a deep constitutional analysis over Video Call or Phone.\n3. **Step 3 - Doorstep Medicine Courier**: High-quality natural homeopathic remedies are prepared and couriered to your home anywhere in India.\n\nNo waiting in queues, complete privacy, and natural healing from home!`;
    }
    else if (/skin|psoriasis|eczema|acne|fungal|pigmentation|rash|itch/i.test(text)) {
        reply = `✨ **Homeopathic Treatment for Skin Diseases**:\n\nIn classical homeopathy, skin issues (Acne, Psoriasis, Eczema, Fungal infections) are viewed as internal constitutional imbalances rather than mere surface problems.\n\n• **Why Homeopathy?**: It treats the root immune response, avoids steroid dependence, and prevents recurring flare-ups.\n• **Common Remedies**: Constitutional remedies like *Thuja*, *Sulphur*, *Graphites*, and *Arsenicum Album* (prescribed after personal case study).\n\nOur Senior Consultant **Dr. P. Nagarjuna** specializes in chronic skin disorders. Would you like to schedule an online consultation?`;
    }
    else if (/hair|fall|alopecia|dandruff|bald|scalp/i.test(text)) {
        reply = `💇‍♀️ **Homeopathic Care for Hair Fall & Scalp Health**:\n\nHomeopathy addresses hormonal changes, nutritional assimilation, stress, and scalp conditions that cause hair thinning and alopecia.\n\n• **Key Benefits**: Strengthens hair roots from within, eliminates recurring dandruff, and stimulates natural follicle regrowth.\n• **Holistic Approach**: Remedies are customized based on individual root causes.\n\n**Dr. D. Harshitha** provides personalized treatment plans for hair restoration.`;
    }
    else if (/pmos|pcod|pcos|period|menstrual|irregular|hormon/i.test(text)) {
        reply = `🌸 **PMOS / PCOS & Hormonal Balance Treatment**:\n\nHomeopathy offers natural, non-hormonal solutions for PMOS / PCOS without synthetic pills or side effects.\n\n• **How It Helps**: Restores regular ovulation, balances LH/FSH ratios, and controls unwanted weight gain and cystic developments.\n• **Long-Term Wellness**: Focuses on gentle constitutional rebalancing.\n\nConsult **Dr. D. Harshitha** online for an individualized PMOS / PCOS treatment plan.`;
    }
    else if (/migraine|headache|head ache/i.test(text)) {
        reply = `🧠 **Homeopathic Treatment for Migraine**:\n\nUnlike temporary painkillers, homeopathy works to permanently reduce the frequency, intensity, and duration of migraine attacks by addressing vascular and neurological triggers.\n\n• Safe, non-addictive remedies tailored to your triggers (light sensitivity, stress, weather changes).`;
    }
    else if (/thyroid|hypothyroid|hyperthyroid/i.test(text)) {
        reply = `🦋 **Holistic Thyroid Management**:\n\nHomeopathy provides supportive constitutional care for both Hypothyroidism and Hyperthyroidism by harmonizing the endocrine feedback loop and relieving associated fatigue, metabolism issues, and mood fluctuations.`;
    }
    else if (/arthritis|joint|knee|pain|back pain|stiff|rheumat/i.test(text)) {
        reply = `🦴 **Arthritis & Joint Pain Relief**:\n\nHomeopathic treatment reduces joint inflammation, stiffness, and uric acid deposition while improving natural cartilage mobility without stomach irritation.`;
    }
    else if (/allergy|rhinitis|asthma|sneezing|dust|cough|cold/i.test(text)) {
        reply = `🍃 **Allergies & Respiratory Care**:\n\nHomeopathy naturally modulates hyperactive immune reactions against dust, pollen, cold air, and food allergens without causing drowsiness or dependence.`;
    }
    else if (/doctor|who|dr arjun|dr nagarjuna|dr harshitha|qualification|experience/i.test(text)) {
        reply = `👨‍⚕️ **Meet Our Qualified Homeopaths**:\n\n• **Dr. P. Nagarjuna (BHMS)**: 8+ years experience in chronic skin diseases, psoriasis, allergies, and migraine.\n• **Dr. D. Harshitha (BHMS)**: 6+ years experience in hair fall, PMOS / PCOS, thyroid, and lifestyle metabolic health.\n\nBoth doctors offer 1-on-1 personalized online video consultations.`;
    }
    else if (/side effect|safe|baby|child|children|pregnant|natural/i.test(text)) {
        reply = `🌿 **Is Homeopathy Safe?**\n\nYes, 100%! Homeopathic medicines are:\n\n• Completely natural, gentle, and non-toxic.\n• Safe for infants, children, pregnant women, and elderly individuals.\n• Zero chemical side effects and non-addictive.\n• Compatible with healthy lifestyle practices.`;
    }
    else if (/contact|phone|number|whatsapp|call|reach|location/i.test(text)) {
        reply = `📞 **Contact Dr Arjun's Homoeo Care**:\n\n• **Phone / WhatsApp**: [+91 78429 11774](tel:7842911774)\n• **Email**: drarjunshomoeocare@gmail.com\n• **Consultation Hours**: Mon - Sat: 9:00 AM - 8:00 PM\n• **Consultation Mode**: 100% Online with Doorstep Medicine Delivery Across India.`;
        quickActions = [
            { label: "💬 Chat on WhatsApp", action: "open_whatsapp" },
            { label: "📞 Call Now", action: "call_clinic" }
        ];
    }
    else {
        reply = `Thank you for your question! 🌿\n\nAt **Dr Arjun's Homoeo Care**, we specialize in natural homeopathic treatments for chronic skin conditions, hair fall, PMOS / PCOS, migraines, thyroid, allergies, and joint pains through **100% Online Consultations** with doorstep medicine delivery.\n\nWould you like to book an online appointment or speak directly with our doctors on WhatsApp?`;
    }

    return {
        reply,
        source: "triage_engine",
        quickActions
    };
};

module.exports = {
    generateBotResponse,
    CLINIC_KNOWLEDGE
};
