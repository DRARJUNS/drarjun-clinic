/*=====================================
  MOBILE NAVIGATION MENU
=====================================*/
const menuBtn = document.querySelector(".menu-btn");
const nav = document.querySelector("nav");

if (menuBtn && nav) {
    menuBtn.addEventListener("click", () => {
        nav.classList.toggle("active");
    });
}

document.querySelectorAll("nav a").forEach(link => {
    link.addEventListener("click", () => {
        if (nav) {
            nav.classList.remove("active");
        }
    });
});

/*=====================================
  STICKY HEADER
=====================================*/
const header = document.querySelector("header");

window.addEventListener("scroll", () => {
    if (!header) return;
    if (window.scrollY > 50) {
        header.classList.add("scrolled");
    } else {
        header.classList.remove("scrolled");
    }
});

/*=====================================
  SMOOTH SCROLLING
=====================================*/
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener("click", function (e) {
        const href = this.getAttribute("href");
        if (href === "#") return;
        
        const target = document.querySelector(href);
        if (target) {
            e.preventDefault();
            target.scrollIntoView({ behavior: "smooth" });
        }
    });
});

/*=====================================
  SCROLL REVEAL / FADE ANIMATIONS
=====================================*/
const animatedItems = document.querySelectorAll(".doctor-card, .treatment-card, .why-box, .testimonial-card, .about-content");

if (animatedItems.length > 0) {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("show");
            }
        });
    }, { threshold: 0.1 });

    animatedItems.forEach(item => {
        observer.observe(item);
    });
}

/*=====================================
  BACK TO TOP BUTTON
=====================================*/
const topBtn = document.getElementById("topBtn");

window.addEventListener("scroll", () => {
    if (!topBtn) return;
    if (window.scrollY > 350) {
        topBtn.style.display = "flex";
    } else {
        topBtn.style.display = "none";
    }
});

if (topBtn) {
    topBtn.addEventListener("click", () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    });
}

/*=====================================
  PAGE PRELOADER
=====================================*/
window.addEventListener("load", () => {
    const loader = document.getElementById("loader");
    if (loader) {
        loader.classList.add("hidden");
        setTimeout(() => {
            loader.style.display = "none";
        }, 450);
    }
});

// Fallback in case load event was already fired
if (document.readyState === "complete") {
    const loader = document.getElementById("loader");
    if (loader) {
        loader.classList.add("hidden");
        loader.style.display = "none";
    }
}

/*=====================================
  DYNAMIC COPYRIGHT YEAR
=====================================*/
const copyright = document.querySelector(".copyright");
if (copyright) {
    copyright.innerHTML = `© ${new Date().getFullYear()} Dr Arjun's Homoeo Care. All Rights Reserved.`;
}

/*=====================================
  APPOINTMENT BOOKING FORM SUBMISSION
=====================================*/
const appointmentForm = document.getElementById("appointment-form") || document.querySelector(".appointment-form");

if (appointmentForm) {
    appointmentForm.addEventListener("submit", async function (e) {
        e.preventDefault();
        
        const submitBtn = document.getElementById("submit-btn") || this.querySelector("button[type='submit']");
        const originalBtnText = submitBtn ? submitBtn.innerHTML : "Book Appointment";
        
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';
        }

        const nameInput = document.getElementById("appt-name");
        const phoneInput = document.getElementById("appt-phone");
        const emailInput = document.getElementById("appt-email");
        const treatmentInput = document.getElementById("appt-treatment");
        const modeInput = document.getElementById("appt-mode");
        const messageInput = document.getElementById("appt-message");

        const data = {
            patientName: nameInput ? nameInput.value.trim() : "",
            patientPhone: phoneInput ? phoneInput.value.trim() : "",
            patientEmail: emailInput ? emailInput.value.trim() : "",
            treatment: treatmentInput ? treatmentInput.value : "",
            consultationType: modeInput ? modeInput.value : "ONLINE_VIDEO",
            message: messageInput ? messageInput.value.trim() : ""
        };

        // Determine API base URL
        const isLocal = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1" || window.location.protocol === "file:";
        const API_URL = isLocal
            ? "http://localhost:5000/api/v1/appointments"
            : "/api/v1/appointments";

        try {
            const response = await fetch(API_URL, {
                method: "POST",
                headers: { 
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                },
                body: JSON.stringify(data)
            });

            const result = await response.json();

            if (!response.ok) {
                const errorMessage = result.error || result.message || (result.errors && result.errors[0]?.message) || "Unable to submit appointment. Please verify details.";
                throw new Error(errorMessage);
            }

            alert("✅ " + (result.message || "Thank you! Your appointment request has been submitted successfully. Our clinic team will contact you shortly."));
            this.reset();

        } catch (err) {
            console.error("Booking Error:", err);
            let displayMsg = err.message || "Something went wrong while submitting.";
            if (!err.message || err.message === "Failed to fetch" || err.name === "TypeError") {
                displayMsg = "Unable to connect to the clinic server. Please ensure the backend server is running (port 5000), or contact us directly on WhatsApp / Phone (+91 78429 11774).";
            }
            alert("⚠️ " + displayMsg);
        } finally {
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalBtnText;
            }
        }
    });
}

/*=====================================
  HOMEOPATHIC SPECIALTY KITS & CART SYSTEM
=====================================*/
const KITS_DATA = [
    {
        id: "kit-1",
        title: "First Aid & Emergency Trauma Kit",
        category: "emergency",
        icon: "fa-kit-medical",
        price: 899,
        mrp: 1299,
        badge: "Essential Care",
        tagline: "Essential emergency care for cuts, bruises, burns, sprains, fractures & trauma.",
        remedies: [
            { name: "Calendula Q", indication: "Natural antiseptic; cleans cuts, lacerations & prevents wound infection." },
            { name: "Echinacea Q", indication: "Prevents blood-poisoning, sepsis & cleans dirty wounds." },
            { name: "Plantago Q", indication: "Topical pain relief for toothache, gum injury & earache." },
            { name: "Arnica Montana 30C", indication: "Blunt trauma, internal contusions, muscle soreness & shock." },
            { name: "Hypericum 30C", indication: "Crushed fingers/toes, tailbone injury & sharp nerve pain." },
            { name: "Ledum Palustre 30C", indication: "Puncture wounds (nails, bites) with cold skin around wound." },
            { name: "Cantharis 30C", indication: "Severe burns, scalds & blistering with burning pain." },
            { name: "Ruta Graveolens 30C", indication: "Sprains of tendons, ligaments, wrists & ankle trauma." }
        ]
    },
    {
        id: "kit-2",
        title: "Pregnancy, Labor & Postpartum Kit",
        category: "women",
        icon: "fa-baby-carriage",
        price: 999,
        mrp: 1499,
        badge: "Mother & Baby",
        tagline: "Holistic care for morning sickness, labor preparation & postpartum healing.",
        remedies: [
            { name: "Alfalfa Q", indication: "Combats pregnancy exhaustion, anemia & loss of appetite." },
            { name: "Avena Sativa Q", indication: "Nourishing nerve tonic for postnatal sleep & exhaustion." },
            { name: "Agnus Castus Q", indication: "Promotes healthy breast milk flow in nursing mothers." },
            { name: "Ipecacuanha 30C", indication: "Constant morning sickness with clean tongue." },
            { name: "Sepia 30C", indication: "Nausea triggered by food smell; pelvic bearing-down feel." },
            { name: "Caulophyllum 30C", indication: "Prepares cervix for labor; corrects weak labor pains." },
            { name: "Arnica Montana 200C", indication: "Speeds recovery of bruised perineal tissues after delivery." },
            { name: "Phytolacca 30C", indication: "Relieves breast engorgement, mastitis & cracked nipples." }
        ]
    },
    {
        id: "kit-3",
        title: "Headache, Migraine & Vertigo Kit",
        category: "pain",
        icon: "fa-head-side-virus",
        price: 799,
        mrp: 1199,
        badge: "Fast Relief",
        tagline: "Relief from throbbing migraines, tension headaches, sunstroke & cervical vertigo.",
        remedies: [
            { name: "Passiflora Q", indication: "Calms stress-induced occipital & tension headaches." },
            { name: "Usnea Barbata Q", indication: "Sunstroke congestive headaches & hot head flushes." },
            { name: "Ginkgo Biloba Q", indication: "Improves cerebral blood flow, dizziness & tinnitus." },
            { name: "Belladonna 30C", indication: "Sudden throbbing headache with red flushed face." },
            { name: "Glonoine 30C", indication: "Bursting sun headache; feels like head will explode." },
            { name: "Bryonia Alba 30C", indication: "Splitting frontal headache worse from slightest motion." },
            { name: "Sanguinaria 30C", indication: "Right-sided migraine settling over right eye." },
            { name: "Spigelia 30C", indication: "Left-sided sharp needle-like migraine above left eye." }
        ]
    },
    {
        id: "kit-4",
        title: "Nausea, Vomiting & Travel Sickness Kit",
        category: "digestive",
        icon: "fa-car-side",
        price: 699,
        mrp: 999,
        badge: "Travel Ready",
        tagline: "Instant relief from motion sickness, car/seasickness & gastroenteritis.",
        remedies: [
            { name: "Zingiber Q", indication: "Settles gas-induced nausea & travel stomach queue." },
            { name: "Mentha Pip Q", indication: "Antispasmodic for stomach gas & colicky nausea." },
            { name: "Arsenicum Alb 30C", indication: "Food poisoning, burning vomiting & stomach bug." },
            { name: "Ipecacuanha 30C", indication: "Persistent nausea with saliva not relieved by vomiting." },
            { name: "Nux Vomica 30C", indication: "Nausea after overeating, spicy food or hangover." },
            { name: "Cocculus Indicus 30C", indication: "Motion sickness in cars/boats with dizziness." },
            { name: "Tabacum 30C", indication: "Deathly seasickness with icy cold sweat & nausea." }
        ]
    },
    {
        id: "kit-5",
        title: "Acidity, GERD & Digestive Kit",
        category: "digestive",
        icon: "fa-utensils",
        price: 749,
        mrp: 1099,
        badge: "Best Seller",
        tagline: "Relief from acid reflux, heartburn, upper bloating & sluggish digestion.",
        remedies: [
            { name: "Carica Papaya Q", indication: "Natural digestive enzyme; digests heavy meals." },
            { name: "Hydrastis Q", indication: "Tones stomach mucosa; treats gastritis & sour burps." },
            { name: "Robinia Q", indication: "Rapid relief from intense acidic reflux & heartburn." },
            { name: "Gentiana Lutea Q", indication: "Stimulates gastric juices; relieves food weight." },
            { name: "Carbo Veg 30C", indication: "Upper bloating & gas; constant upward belching." },
            { name: "Lycopodium 30C", indication: "Lower gas bloating after a few bites; 4-8 PM worse." },
            { name: "Natrum Phos 6X", indication: "Neutralizes excess stomach acid & sour taste." }
        ]
    },
    {
        id: "kit-6",
        title: "Cold, Cough, Flu & Sinus Kit",
        category: "respiratory",
        icon: "fa-head-side-cough",
        price: 799,
        mrp: 1199,
        badge: "Immunity Boost",
        tagline: "Herbal & homeopathic relief for viral flu, chest cough & sinus block.",
        remedies: [
            { name: "Justicia Adhatoda Q", indication: "Bronchodilator; loosens tight suffocative coughs." },
            { name: "Ocimum Sanctum Q", indication: "Antiviral; clears running nose & flu fevers." },
            { name: "Grindelia Q", indication: "Wheezing cough where breathing stops on sleeping." },
            { name: "Aconite 30C", indication: "Immediate cold onset after dry cold wind exposure." },
            { name: "Allium Cepa 30C", indication: "Profuse burning nasal discharge & watery eyes." },
            { name: "Drosera 30C", indication: "Dry barking spasmodic cough worse lying down." },
            { name: "Hepar Sulph 30C", indication: "Splinter-like sore throat; sensitive to cold drafts." }
        ]
    },
    {
        id: "kit-7",
        title: "Kidney Stone & Urinary Tract (UTI) Kit",
        category: "organ",
        icon: "fa-shield-virus",
        price: 899,
        mrp: 1299,
        badge: "Renal Care",
        tagline: "Natural support for flushing kidney stones & soothing UTI burning.",
        remedies: [
            { name: "Berberis Vulgaris Q", indication: "Flushes kidney stones; relieves radiating kidney pain." },
            { name: "Hydrangea Q", indication: "Stone breaker for urinary gravel & urethral burning." },
            { name: "Sarsaparilla Q", indication: "Excruciating pain at end of urination with sediment." },
            { name: "Uva Ursi Q", indication: "Urinary antiseptic for cystitis & blood/pus in urine." },
            { name: "Ocimum Can Q", indication: "Severe right kidney stone pain with red urine." },
            { name: "Cantharis 30C", indication: "Scalding burning pain before & after urination." },
            { name: "Pareira Brava 30C", indication: "Kidney pain requiring kneeling to urinate." }
        ]
    },
    {
        id: "kit-8",
        title: "Liver, Gallbladder & Detox Kit",
        category: "organ",
        icon: "fa-weight-scale",
        price: 849,
        mrp: 1249,
        badge: "Liver Detox",
        tagline: "Detoxification for fatty liver, sluggish digestion & bilious health.",
        remedies: [
            { name: "Carduus Marianus Q", indication: "Rejuvenates liver cells & treats fatty liver." },
            { name: "Chelidonium Q", indication: "Relieves right shoulder-blade pain & jaundice." },
            { name: "Andrographis Q", indication: "Promotes bile flow & appetite after illness." },
            { name: "Taraxacum Q", indication: "Detoxifies liver; cures mapped tongue & bitter mouth." },
            { name: "Chionanthus Q", indication: "Gallbladder congestion & clay-colored stools." },
            { name: "Phosphorus 30C", indication: "Fatty liver degeneration; craves cold water." },
            { name: "Natrum Sulph 6X", indication: "Biochemic liver detox for morning bitter taste." }
        ]
    },
    {
        id: "kit-9",
        title: "Cardiovascular & Hypertension Kit",
        category: "organ",
        icon: "fa-heart-pulse",
        price: 949,
        mrp: 1399,
        badge: "Heart Care",
        tagline: "Natural cardioprotective herbs & heart muscle tonics for healthy BP.",
        remedies: [
            { name: "Crataegus Q", indication: "Strengthens heart muscle & lowers plaque buildup." },
            { name: "Rauwolfia Serp Q", indication: "Safely lowers high systolic & diastolic blood pressure." },
            { name: "Terminalia Arjuna Q", indication: "Regulates heart rhythm & cardiac stamina." },
            { name: "Convallaria Q", indication: "Controls rapid palpitations & exertional breathlessness." },
            { name: "Glonoinum 30C", indication: "Sudden BP spikes with throbbing head arteries." },
            { name: "Cactus Grand 30C", indication: "Sensation of iron band constricting the heart." },
            { name: "Baryta Mur 30C", indication: "High blood pressure with hardened arteries." }
        ]
    },
    {
        id: "kit-10",
        title: "Joint Pain, Arthritis, Gout & Sciatica Kit",
        category: "pain",
        icon: "fa-bone",
        price: 899,
        mrp: 1299,
        badge: "Mobility Support",
        tagline: "Targeted relief for joint stiffness, uric acid gout & nerve sciatica.",
        remedies: [
            { name: "Guaiacum Q", indication: "Relieves stiff swollen arthritic joint deformities." },
            { name: "Urtica Urens Q", indication: "Flushes uric acid crystals in acute gout flares." },
            { name: "Rhus Tox 30C", indication: "Stiffness relieved by continuous motion & heat." },
            { name: "Bryonia Alba 30C", indication: "Hot swollen joints worse from ANY movement." },
            { name: "Colocynthis 30C", indication: "Shooting sciatica pain down leg relieved by pressure." },
            { name: "Ledum Palustre 30C", indication: "Gout of toes/ankles better by ice cold packs." },
            { name: "Magnesia Phos 6X", indication: "Rapid relief for muscle cramps & nerve shooting pain." }
        ]
    },
    {
        id: "kit-11",
        title: "Skin, Acne, Eczema & Allergy Kit",
        category: "skin",
        icon: "fa-allergies",
        price: 849,
        mrp: 1199,
        badge: "Clear Skin",
        tagline: "Clear acne blemishes, soothe eczema itching, hives & allergies.",
        remedies: [
            { name: "Berberis Aquifolium Q", indication: "Clears acne marks, spots & brightens skin tone." },
            { name: "Azadirachta Indica Q", indication: "Neem blood purifier for boils & pustular acne." },
            { name: "Chrysarobinum Q", indication: "Topical action for ringworm & stubborn eczema." },
            { name: "Apis Mellifica 30C", indication: "Acute hives & allergic stinging skin swells." },
            { name: "Sulphur 30C", indication: "Chronic skin itching worse from bed heat/water." },
            { name: "Graphites 30C", indication: "Eczema with sticky honey-like discharge & cracks." },
            { name: "Hepar Sulph 30C", indication: "Painful pus boils sensitive to touch." }
        ]
    },
    {
        id: "kit-12",
        title: "Hair Fall, Dandruff & Scalp Care Kit",
        category: "skin",
        icon: "fa-spa",
        price: 899,
        mrp: 1299,
        badge: "Hair Growth",
        tagline: "Nourish roots, control hair loss, eliminate scalp dandruff & boost density.",
        remedies: [
            { name: "Jaborandi Q", indication: "Stimulates dormant roots & halts rapid hair loss." },
            { name: "Arnica Montana Q", indication: "Increases scalp circulation & nourishes roots." },
            { name: "Cochlearia Q", indication: "Clears stubborn scalp dandruff flakes." },
            { name: "Wiesbaden Q", indication: "Promotes fast, thick & naturally darker hair." },
            { name: "Phosphoric Acid 30C", indication: "Hair loss following grief, shock or illness." },
            { name: "Fluoric Acid 30C", indication: "Patchy alopecia areata & brittle hair breakage." },
            { name: "Silicea 6X", indication: "Strengthens root structure & prevents split ends." }
        ]
    },
    {
        id: "kit-13",
        title: "Stress, Anxiety & Insomnia Kit",
        category: "chronic",
        icon: "fa-brain",
        price: 799,
        mrp: 1149,
        badge: "Calm & Sleep",
        tagline: "Non-habit-forming nerve calmers for sound sleep, stress & anxiety.",
        remedies: [
            { name: "Passiflora Q", indication: "Natural relaxant for deep restorative sleep." },
            { name: "Avena Sativa Q", indication: "Nerve nutrient for burnout & stress recovery." },
            { name: "Withania Somnifera Q", indication: "Ashwagandha adaptogen for anxiety & memory." },
            { name: "Gelsemium 30C", indication: "Exam stage fright & panic trembling." },
            { name: "Argentum Nit 30C", indication: "Hurried claustrophobic anxiety; craves sweets." },
            { name: "Coffea Cruda 30C", indication: "Insomnia from racing thoughts & excited mind." },
            { name: "Kali Phos 6X", indication: "Master nerve mineral for brain fog & mental fatigue." }
        ]
    },
    {
        id: "kit-14",
        title: "Women's Health (PCOS, Cramps & Menopause) Kit",
        category: "women",
        icon: "fa-person-dress",
        price: 899,
        mrp: 1299,
        badge: "Hormonal Balance",
        tagline: "Natural hormonal balance for irregular cycles, PCOS & cramps.",
        remedies: [
            { name: "Janosia Ashoka Q", indication: "Premier uterine tonic; regulates irregular cycles." },
            { name: "Aletris Farinosa Q", indication: "Relieves female fatigue, anemia & pelvic heaviness." },
            { name: "Abroma Aug Q", indication: "Corrects scanty flow & period pain in PCOS." },
            { name: "Pulsatilla 30C", indication: "Delayed scanty menses with moody tearful nature." },
            { name: "Magnesia Phos 6X", indication: "Fast cramp relief, better by heat & double bend." },
            { name: "Lachesis 30C", indication: "Menopausal hot flashes & collar tightness." },
            { name: "Sepia 200C", indication: "Hormonal mood swings & pelvic dragging-down feel." }
        ]
    },
    {
        id: "kit-15",
        title: "Men's Health & Prostate Support Kit",
        category: "organ",
        icon: "fa-user-shield",
        price: 949,
        mrp: 1399,
        badge: "Men's Health",
        tagline: "Prostate support for night urination, bladder health & male vitality.",
        remedies: [
            { name: "Sabal Serrulata Q", indication: "Saw Palmetto for enlarged prostate (BPH) & weak stream." },
            { name: "Damiana Q", indication: "Restores vitality, stamina & combats exhaustion." },
            { name: "Tribulus Terr Q", indication: "Enhances male vigor & tones urinary tract." },
            { name: "Nuphar Luteum Q", indication: "Relieves fatigue & involuntary vitality loss." },
            { name: "Conium 30C", indication: "Hardened prostate with interrupted urine stream." },
            { name: "Chimaphila 30C", indication: "Prostate swelling with sensation of sitting on a ball." },
            { name: "Staphysagria 30C", indication: "Urethral burning & bladder irritability." }
        ]
    },
    {
        id: "kit-16",
        title: "Pediatric, Teething & Colic Kit",
        category: "women",
        icon: "fa-child",
        price: 699,
        mrp: 999,
        badge: "Pediatric Care",
        tagline: "Gentle care for teething infants, gas colic, milk curds & pinworms.",
        remedies: [
            { name: "Chamomilla Q", indication: "Dilute drops to soothe swollen infant gums & colic." },
            { name: "Cina Q", indication: "Eliminates pinworms; cures teeth grinding & nose picking." },
            { name: "Chamomilla 30C", indication: "Irritable teething baby; one cheek red & hot." },
            { name: "Colocynthis 30C", indication: "Infant colic where baby pulls legs up tight." },
            { name: "Calcarea Phos 6X", indication: "Supports fast teething & bone mineralization." },
            { name: "Aethusa 30C", indication: "Vomiting curdled milk followed by sleepiness." },
            { name: "Pulsatilla 30C", indication: "Clingy tearful baby needing constant cuddles." }
        ]
    },
    {
        id: "kit-17",
        title: "Diabetes & Metabolic Support Kit",
        category: "chronic",
        icon: "fa-chart-line",
        price: 899,
        mrp: 1299,
        badge: "Metabolic Care",
        tagline: "Supportive metabolic care for blood sugar balance & diabetic fatigue.",
        remedies: [
            { name: "Syzygium Jamb Q", indication: "Lowers blood glucose & reduces frequent urination." },
            { name: "Gymnema Sylv Q", indication: "Gurmar sugar destroyer; suppresses sweet cravings." },
            { name: "Cephalandra Q", indication: "Relieves dry mouth & unquenchable diabetic thirst." },
            { name: "Abroma Aug Q", indication: "Treats weight loss & debility from diabetes." },
            { name: "Uranium Nit 30C", indication: "Emaciation & excessive urine output." },
            { name: "Phosphoric Acid 30C", indication: "Tackles diabetic exhaustion & tingling numbness." },
            { name: "Natrum Sulph 6X", indication: "Supports liver & pancreatic metabolic balance." }
        ]
    },
    {
        id: "kit-18",
        title: "Fever, Dengue & Viral Immunity Kit",
        category: "emergency",
        icon: "fa-shield-halved",
        price: 849,
        mrp: 1249,
        badge: "Viral Immunity",
        tagline: "Platelet support, viral immunity booster & bone-break fever relief.",
        remedies: [
            { name: "Carica Papaya Q", indication: "Supports blood platelet counts during viral/dengue fevers." },
            { name: "Tinospora Cord Q", indication: "Giloy immunomodulator; clears chronic fevers." },
            { name: "Cinchona Off Q", indication: "Treats periodic fevers & weakness from fluid loss." },
            { name: "Eupatorium Perf 30C", indication: "Bone-break fever; intense bone & muscle aching." },
            { name: "Gelsemium 30C", indication: "Dull dizzy viral fever with heavy limbs & no thirst." },
            { name: "Pyrogenium 200C", indication: "Septic fevers with rapid pulse rate." },
            { name: "Rhus Tox 30C", indication: "Fever with intense restlessness & dry red tongue." }
        ]
    }
];

// CART STATE
let cart = [];

try {
    const savedCart = localStorage.getItem("drArjunCart");
    if (savedCart) {
        cart = JSON.parse(savedCart);
    }
} catch (e) {
    console.error("Could not load cart from localStorage", e);
}

function saveCart() {
    try {
        localStorage.setItem("drArjunCart", JSON.stringify(cart));
    } catch (e) {
        console.error("Could not save cart", e);
    }
}

// TOAST HELPER
function showToast(msg) {
    const toast = document.getElementById("toast");
    const toastMsg = document.getElementById("toast-msg");
    if (toast && toastMsg) {
        toastMsg.textContent = msg;
        toast.classList.add("show");
        setTimeout(() => {
            toast.classList.remove("show");
        }, 3000);
    }
}

// RENDER KITS CATALOGUE
function renderKits(activeCategory = "all", searchQuery = "") {
    const grid = document.getElementById("kits-grid");
    if (!grid) return;

    let filtered = KITS_DATA.filter(kit => {
        const matchesCategory = activeCategory === "all" || kit.category === activeCategory;
        const query = searchQuery.toLowerCase().trim();
        const matchesSearch = !query || 
            kit.title.toLowerCase().includes(query) || 
            kit.tagline.toLowerCase().includes(query) ||
            kit.remedies.some(r => r.name.toLowerCase().includes(query) || r.indication.toLowerCase().includes(query));
        return matchesCategory && matchesSearch;
    });

    if (filtered.length === 0) {
        grid.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 50px 20px; background: #fff; border-radius: 16px; border: 1px dashed #a5d6a7;">
                <i class="fas fa-search" style="font-size: 45px; color: #a5d6a7; margin-bottom: 15px;"></i>
                <h3 style="color: #0b6b3a; font-size: 20px; margin-bottom: 8px;">No Homeopathy Kits Found</h3>
                <p style="color: #666; font-size: 15px;">Try searching for another condition (e.g. "Arnica", "Acidity", "Hair") or clear your filters.</p>
            </div>
        `;
        return;
    }

    grid.innerHTML = filtered.map(kit => {
        const discount = Math.round(((kit.mrp - kit.price) / kit.mrp) * 100);
        return `
            <div class="kit-card" data-id="${kit.id}">
                <div class="kit-card-header">
                    <div class="kit-icon-badge">
                        <i class="fas ${kit.icon}"></i>
                    </div>
                    <div class="kit-card-title-group">
                        <span class="kit-badge-tag">${kit.badge}</span>
                        <h3>${kit.title}</h3>
                    </div>
                </div>
                <div class="kit-card-body">
                    <p class="kit-tagline">${kit.tagline}</p>
                    <div class="kit-price-row">
                        <span class="kit-price">₹${kit.price}</span>
                        <span class="kit-mrp">₹${kit.mrp}</span>
                        <span class="kit-discount-tag">${discount}% OFF</span>
                    </div>
                    <div class="kit-card-actions">
                        <button class="btn-view-remedies" onclick="openKitModal('${kit.id}')">
                            <i class="fas fa-eye"></i> Remedies
                        </button>
                        <button class="btn-add-cart" onclick="addToCart('${kit.id}')">
                            <i class="fas fa-cart-plus"></i> Add to Cart
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join("");
}

// CART MANAGEMENT
function addToCart(kitId) {
    const kit = KITS_DATA.find(k => k.id === kitId);
    if (!kit) return;

    const existingIndex = cart.findIndex(item => item.id === kitId);
    if (existingIndex > -1) {
        cart[existingIndex].qty += 1;
    } else {
        cart.push({
            id: kit.id,
            title: kit.title,
            price: kit.price,
            qty: 1
        });
    }

    saveCart();
    updateCartUI();
    showToast(`Added "${kit.title}" to cart!`);
}

function removeFromCart(kitId) {
    cart = cart.filter(item => item.id !== kitId);
    saveCart();
    updateCartUI();
}

function updateQty(kitId, delta) {
    const item = cart.find(i => i.id === kitId);
    if (!item) return;

    item.qty += delta;
    if (item.qty <= 0) {
        removeFromCart(kitId);
    } else {
        saveCart();
        updateCartUI();
    }
}

function clearCart() {
    cart = [];
    saveCart();
    updateCartUI();
    showToast("Cart cleared");
}

function updateCartUI() {
    const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);
    const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);

    // Badges
    const headerCount = document.getElementById("cart-count");
    const floatCount = document.getElementById("cart-float-count");
    const drawerCount = document.getElementById("drawer-cart-count");

    if (headerCount) headerCount.textContent = totalItems;
    if (floatCount) floatCount.textContent = totalItems;
    if (drawerCount) drawerCount.textContent = totalItems;

    // Cart Items Container
    const itemsContainer = document.getElementById("cart-items-container");
    const cartSubtotal = document.getElementById("cart-subtotal");
    const cartTotal = document.getElementById("cart-total");

    if (cartSubtotal) cartSubtotal.textContent = `₹${totalPrice}`;
    if (cartTotal) cartTotal.textContent = `₹${totalPrice}`;

    if (itemsContainer) {
        if (cart.length === 0) {
            itemsContainer.innerHTML = `
                <div class="empty-cart-view">
                    <i class="fas fa-shopping-bag"></i>
                    <h4>Your Cart is Empty</h4>
                    <p>Explore our Homeopathy Specialty Kits and add remedies to your cart.</p>
                </div>
            `;
        } else {
            itemsContainer.innerHTML = cart.map(item => `
                <div class="cart-item">
                    <div class="cart-item-info">
                        <h4>${item.title}</h4>
                        <span class="cart-item-price">₹${item.price} × ${item.qty} = ₹${item.price * item.qty}</span>
                    </div>
                    <div class="cart-item-qty">
                        <button class="cart-qty-btn" onclick="updateQty('${item.id}', -1)">-</button>
                        <span>${item.qty}</span>
                        <button class="cart-qty-btn" onclick="updateQty('${item.id}', 1)">+</button>
                        <button class="cart-item-remove" onclick="removeFromCart('${item.id}')" title="Remove">
                            <i class="fas fa-trash-can"></i>
                        </button>
                    </div>
                </div>
            `).join("");
        }
    }
}

// KIT REMEDIES MODAL
window.openKitModal = function(kitId) {
    const kit = KITS_DATA.find(k => k.id === kitId);
    if (!kit) return;

    const modal = document.getElementById("kit-modal");
    const header = document.getElementById("kit-modal-header");
    const body = document.getElementById("kit-modal-body");
    const footer = document.getElementById("kit-modal-footer");

    if (header) {
        header.innerHTML = `
            <h3><i class="fas ${kit.icon}"></i> ${kit.title}</h3>
            <p>${kit.tagline}</p>
        `;
    }

    if (body) {
        body.innerHTML = `
            <div style="margin-bottom: 20px; background: #e8f5e9; padding: 12px 16px; border-radius: 8px; border-left: 4px solid #0b6b3a;">
                <h4 style="color: #0b6b3a; font-size: 15px; margin-bottom: 4px;"><i class="fas fa-pills"></i> Doctor-Formulated Remedy Composition (${kit.remedies.length} Remedies):</h4>
                <p style="font-size: 13px; color: #333;">Standard dosage: 10-15 drops in water for Mother Tinctures, or 4 pills dissolved under tongue for dilutions/biochemics.</p>
            </div>
            ${kit.remedies.map(r => `
                <div class="remedy-item">
                    <div class="remedy-item-name">
                        <span><i class="fas fa-check-circle"></i> ${r.name}</span>
                    </div>
                </div>
            `).join("")}
        `;
    }

    if (footer) {
        footer.innerHTML = `
            <div style="display: flex; gap: 12px; width: 100%;">
                <span style="font-size: 20px; font-weight: 700; color: #0b6b3a; align-self: center;">₹${kit.price}</span>
                <button class="btn btn-add-cart" style="flex: 1;" onclick="addToCart('${kit.id}'); closeKitModal();">
                    <i class="fas fa-cart-plus"></i> Add Kit to Cart
                </button>
            </div>
        `;
    }

    if (modal) modal.classList.add("active");
};

function closeKitModal() {
    const modal = document.getElementById("kit-modal");
    if (modal) modal.classList.remove("active");
}

// CHECKOUT MODAL
function openCheckoutModal() {
    if (cart.length === 0) {
        alert("Your cart is empty. Please add at least one Homeopathy Kit before checkout.");
        return;
    }

    const modal = document.getElementById("checkout-modal");
    const countSpan = document.getElementById("checkout-items-count");
    const previewContainer = document.getElementById("checkout-items-preview");
    const totalPriceSpan = document.getElementById("checkout-total-price");

    const totalItems = cart.reduce((sum, i) => sum + i.qty, 0);
    const totalPrice = cart.reduce((sum, i) => sum + (i.price * i.qty), 0);

    const upiQrAmount = document.getElementById("upi-qr-amount");

    if (countSpan) countSpan.textContent = totalItems;
    if (totalPriceSpan) totalPriceSpan.textContent = `₹${totalPrice}`;
    if (upiQrAmount) upiQrAmount.textContent = `Payable: ₹${totalPrice}`;

    if (previewContainer) {
        previewContainer.innerHTML = cart.map(item => `
            <div style="display: flex; justify-content: space-between; font-size: 14px; margin-bottom: 6px;">
                <span>• ${item.title} (x${item.qty})</span>
                <strong>₹${item.price * item.qty}</strong>
            </div>
        `).join("");
    }

    // Close drawer if open
    closeCartDrawer();

    if (modal) modal.classList.add("active");
}

function closeCheckoutModal() {
    const modal = document.getElementById("checkout-modal");
    if (modal) modal.classList.remove("active");
}

function openCartDrawer() {
    const drawer = document.getElementById("cart-drawer");
    const overlay = document.getElementById("cart-overlay");
    if (drawer) drawer.classList.add("active");
    if (overlay) overlay.classList.add("active");
}

function closeCartDrawer() {
    const drawer = document.getElementById("cart-drawer");
    const overlay = document.getElementById("cart-overlay");
    if (drawer) drawer.classList.remove("active");
    if (overlay) overlay.classList.remove("active");
}

// INITIALIZE EVENT LISTENERS FOR KITS & CART
document.addEventListener("DOMContentLoaded", () => {
    // Initial Render
    renderKits("all");
    updateCartUI();

    // Category Tabs
    document.querySelectorAll(".filter-tab").forEach(tab => {
        tab.addEventListener("click", function() {
            document.querySelectorAll(".filter-tab").forEach(t => t.classList.remove("active"));
            this.classList.add("active");
            const category = this.getAttribute("data-category");
            const searchQuery = document.getElementById("kit-search")?.value || "";
            renderKits(category, searchQuery);
        });
    });

    // Search Input
    const searchInput = document.getElementById("kit-search");
    const clearSearchBtn = document.getElementById("clear-search-btn");

    if (searchInput) {
        searchInput.addEventListener("input", function() {
            const query = this.value;
            if (clearSearchBtn) {
                clearSearchBtn.style.display = query.length > 0 ? "block" : "none";
            }
            const activeTab = document.querySelector(".filter-tab.active");
            const category = activeTab ? activeTab.getAttribute("data-category") : "all";
            renderKits(category, query);
        });
    }

    if (clearSearchBtn && searchInput) {
        clearSearchBtn.addEventListener("click", () => {
            searchInput.value = "";
            clearSearchBtn.style.display = "none";
            const activeTab = document.querySelector(".filter-tab.active");
            const category = activeTab ? activeTab.getAttribute("data-category") : "all";
            renderKits(category, "");
        });
    }

    // Header & Floating Cart Triggers
    const headerCartBtn = document.getElementById("header-cart-btn");
    const floatCartBtn = document.getElementById("cart-float-btn");
    const closeCartBtn = document.getElementById("close-cart-btn");
    const cartOverlay = document.getElementById("cart-overlay");

    if (headerCartBtn) headerCartBtn.addEventListener("click", openCartDrawer);
    if (floatCartBtn) floatCartBtn.addEventListener("click", openCartDrawer);
    if (closeCartBtn) closeCartBtn.addEventListener("click", closeCartDrawer);
    if (cartOverlay) cartOverlay.addEventListener("click", closeCartDrawer);

    // Modal Close Buttons
    const closeKitBtn = document.getElementById("close-kit-modal");
    const closeCheckoutBtn = document.getElementById("close-checkout-modal");
    const proceedCheckoutBtn = document.getElementById("proceed-checkout-btn");
    const clearCartBtn = document.getElementById("clear-cart-btn");

    if (closeKitBtn) closeKitBtn.addEventListener("click", closeKitModal);
    if (closeCheckoutBtn) closeCheckoutBtn.addEventListener("click", closeCheckoutModal);
    if (proceedCheckoutBtn) proceedCheckoutBtn.addEventListener("click", openCheckoutModal);
    if (clearCartBtn) clearCartBtn.addEventListener("click", clearCart);

    // PAYMENT METHOD SELECTOR SWITCHING
    const paymentCards = document.querySelectorAll(".payment-option-card");
    paymentCards.forEach(card => {
        card.addEventListener("click", function() {
            paymentCards.forEach(c => c.classList.remove("active"));
            this.classList.add("active");

            const radioInput = this.querySelector('input[type="radio"]');
            if (radioInput) radioInput.checked = true;

            const method = this.getAttribute("data-method");
            const upiPanel = document.getElementById("upi-payment-panel");
            const codPanel = document.getElementById("cod-payment-panel");
            const waPanel = document.getElementById("whatsapp-payment-panel");
            const submitBtn = document.getElementById("checkout-submit-btn");
            const waBtn = document.getElementById("checkout-whatsapp-btn");

            if (upiPanel) upiPanel.classList.toggle("active", method === "upi");
            if (codPanel) codPanel.classList.toggle("active", method === "cod");
            if (waPanel) waPanel.classList.toggle("active", method === "whatsapp");

            if (submitBtn) {
                submitBtn.style.display = method === "whatsapp" ? "none" : "block";
                if (method === "upi") {
                    submitBtn.innerHTML = '<i class="fas fa-check-circle"></i> Confirm UPI Payment & Order';
                } else if (method === "cod") {
                    submitBtn.innerHTML = '<i class="fas fa-truck"></i> Confirm Cash on Delivery Order';
                }
            }
            if (waBtn) {
                waBtn.style.display = method === "whatsapp" ? "block" : "none";
            }
        });
    });

    // COPY UPI ID BUTTON
    const copyUpiBtn = document.getElementById("copy-upi-btn");
    if (copyUpiBtn) {
        copyUpiBtn.addEventListener("click", function() {
            const upiId = document.getElementById("clinic-upi-id")?.innerText || "7842911774@ybl";
            navigator.clipboard.writeText(upiId).then(() => {
                const origText = copyUpiBtn.innerHTML;
                copyUpiBtn.innerHTML = '<i class="fas fa-check"></i> Copied!';
                copyUpiBtn.style.background = "#2e7d32";
                setTimeout(() => {
                    copyUpiBtn.innerHTML = origText;
                    copyUpiBtn.style.background = "#0b6b3a";
                }, 2000);
            }).catch(err => {
                console.error("Clipboard copy error:", err);
            });
        });
    }

    // WHATSAPP CHECKOUT ORDER
    const whatsappCheckoutBtn = document.getElementById("checkout-whatsapp-btn");
    if (whatsappCheckoutBtn) {
        whatsappCheckoutBtn.addEventListener("click", function() {
            const name = document.getElementById("co-name")?.value.trim() || "";
            const phone = document.getElementById("co-phone")?.value.trim() || "";
            const email = document.getElementById("co-email")?.value.trim() || "";
            const pincode = document.getElementById("co-pincode")?.value.trim() || "";
            const address = document.getElementById("co-address")?.value.trim() || "";
            const notes = document.getElementById("co-notes")?.value.trim() || "";

            if (!name || !phone || !address || !pincode) {
                alert("Please fill in your Full Name, Mobile Number, Pincode and Delivery Address before checking out via WhatsApp.");
                return;
            }

            const totalPrice = cart.reduce((sum, i) => sum + (i.price * i.qty), 0);
            const itemsListStr = cart.map(i => `• ${i.title} (Qty: ${i.qty}) - ₹${i.price * i.qty}`).join("\n");

            const textMessage = `🌿 *NEW HOMEOPATHY KIT ORDER - DR ARJUN'S HOMOEO CARE*\n\n` +
                `*Customer Details:*\n` +
                `👤 Name: ${name}\n` +
                `📞 Phone: ${phone}\n` +
                `📧 Email: ${email || 'N/A'}\n` +
                `📍 Delivery Address: ${address}, Pincode: ${pincode}\n` +
                (notes ? `📝 Note/Symptoms: ${notes}\n` : '') +
                `\n*Ordered Kits:*\n${itemsListStr}\n\n` +
                `💰 *Total Payable:* ₹${totalPrice} (Free Delivery)\n\n` +
                `Please confirm my order and share payment/delivery details. Thank you!`;

            const whatsappUrl = `https://wa.me/917842911774?text=${encodeURIComponent(textMessage)}`;
            window.open(whatsappUrl, "_blank");

            clearCart();
            closeCheckoutModal();
        });
    }

    // ONLINE CHECKOUT FORM SUBMISSION (UPI / COD / ONLINE)
    const checkoutForm = document.getElementById("checkout-form");
    if (checkoutForm) {
        checkoutForm.addEventListener("submit", async function(e) {
            e.preventDefault();

            const selectedMethodRadio = document.querySelector('input[name="paymentMethod"]:checked');
            const paymentMethod = selectedMethodRadio ? selectedMethodRadio.value : "upi";
            const utr = document.getElementById("co-utr")?.value.trim() || "";

            if (paymentMethod === "upi" && utr.length !== 12) {
                alert("⚠️ Please enter your valid 12-digit UPI UTR / Transaction Reference Number after completing payment in GPay/PhonePe.");
                document.getElementById("co-utr")?.focus();
                return;
            }

            const submitBtn = document.getElementById("checkout-submit-btn");
            const originalBtnText = submitBtn ? submitBtn.innerHTML : "Submit Order Online";

            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing Order...';
            }

            const name = document.getElementById("co-name")?.value.trim() || "";
            const phone = document.getElementById("co-phone")?.value.trim() || "";
            const email = document.getElementById("co-email")?.value.trim() || "";
            const pincode = document.getElementById("co-pincode")?.value.trim() || "";
            const address = document.getElementById("co-address")?.value.trim() || "";
            const notes = document.getElementById("co-notes")?.value.trim() || "";

            const totalPrice = cart.reduce((sum, i) => sum + (i.price * i.qty), 0);
            const itemsListStr = cart.map(i => `${i.title} (x${i.qty})`).join(", ");

            const orderPayload = {
                patientName: name,
                patientPhone: phone,
                patientEmail: email,
                treatment: "Homeopathy Specialty Kit Order",
                consultationType: "ONLINE",
                message: `ORDER DETAILS:\nPayment Method: ${paymentMethod.toUpperCase()}\n${paymentMethod === 'upi' ? `UPI UTR Ref: ${utr}\n` : ''}Kits: ${itemsListStr}\nTotal Amount: ₹${totalPrice}\nDelivery Address: ${address}, Pincode: ${pincode}\nMedical Notes: ${notes}`
            };

            const isLocal = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1" || window.location.protocol === "file:";
            const API_URL = isLocal
                ? "http://localhost:5000/api/v1/appointments"
                : "/api/v1/appointments";

            try {
                const response = await fetch(API_URL, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Accept": "application/json"
                    },
                    body: JSON.stringify(orderPayload)
                });

                const result = await response.json();

                if (!response.ok) {
                    throw new Error(result.error || result.message || "Failed to place order.");
                }

                if (paymentMethod === "upi") {
                    alert(`🎉 Thank you ${name}!\n\nYour UPI Payment (Ref: ${utr}) and Homeopathy Kit order have been received successfully.\n\nOur clinic team will dispatch your kits to ${address} shortly.`);
                } else {
                    alert(`🎉 Thank you ${name}!\n\nYour Cash on Delivery Homeopathy Kit order has been placed successfully.\n\nPlease pay ₹${totalPrice} in cash upon delivery at ${address}.`);
                }

                clearCart();
                closeCheckoutModal();
                checkoutForm.reset();
            } catch (err) {
                console.error("Order submission error:", err);
                alert("⚠️ Order Note: We saved your details. If server connection failed, please click 'WhatsApp Order' to complete your order directly with Dr. Arjun.");
            } finally {
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = originalBtnText;
                }
            }
        });
    }
});