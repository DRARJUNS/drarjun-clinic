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

console.log("🌿 Dr Arjun's Homoeo Care - Frontend loaded successfully");