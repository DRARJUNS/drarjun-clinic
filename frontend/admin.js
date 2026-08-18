/**
 * Dr Arjun's Homoeo Care - Doctor & Admin Portal Client Script
 */

const API_BASE = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.protocol === 'file:')
    ? 'http://localhost:5000/api/v1'
    : '/api/v1';

let authToken = localStorage.getItem('drarjun_admin_token') || null;
let currentUser = JSON.parse(localStorage.getItem('drarjun_user_profile') || 'null');
let currentAppointments = [];
let activeAppointmentId = null;

// ==========================================
// TOAST NOTIFICATION UTILITY
// ==========================================
function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    if (message === 'Failed to fetch' || message === 'NetworkError when attempting to fetch resource.') {
        message = 'Unable to connect to backend server on port 5000. Please ensure "node server.js" is running in the backend directory.';
        type = 'error';
    }

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    let icon = 'fa-info-circle';
    if (type === 'success') icon = 'fa-check-circle';
    if (type === 'error') icon = 'fa-exclamation-circle';
    if (type === 'warning') icon = 'fa-exclamation-triangle';

    toast.innerHTML = `
        <i class="fas ${icon}"></i>
        <span>${message}</span>
    `;

    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}


// ==========================================
// AUTHENTICATION & LOGIN FLOW
// ==========================================
function checkAuth() {
    const loginScreen = document.getElementById('login-screen');
    const dashboardScreen = document.getElementById('dashboard-screen');

    if (authToken) {
        loginScreen.style.display = 'none';
        dashboardScreen.style.display = 'flex';
        updateUserUI();
        initDashboard();
    } else {
        loginScreen.style.display = 'flex';
        dashboardScreen.style.display = 'none';
    }
}

function updateUserUI() {
    if (!currentUser) return;

    const userNameEl = document.getElementById('admin-user-name');
    const userRoleEl = document.getElementById('admin-user-role');
    const bannerGreeting = document.getElementById('banner-greeting');
    const avatarEl = document.getElementById('header-avatar');

    if (userNameEl) userNameEl.innerText = currentUser.name || 'Doctor';
    if (userRoleEl) userRoleEl.innerText = currentUser.role || 'DOCTOR';
    if (bannerGreeting) {
        bannerGreeting.innerText = `Welcome back, ${currentUser.name || 'Doctor'}! 🌿`;
    }

    if (avatarEl) {
        if (currentUser.email === 'drnagarjuna@drarjun.com') {
            avatarEl.innerHTML = '<img src="images/dr-nagarjuna.jpeg" alt="Dr. P. Nagarjuna">';
        } else if (currentUser.email === 'drharshitha@drarjun.com') {
            avatarEl.innerHTML = '<img src="images/dr-harshitha.jpeg" alt="Dr. D. Harshitha">';
        } else {
            avatarEl.innerHTML = '<i class="fas fa-user-shield"></i>';
        }
    }
}

// Password toggle
const togglePasswordBtn = document.getElementById('toggle-password');
if (togglePasswordBtn) {
    togglePasswordBtn.addEventListener('click', () => {
        const input = document.getElementById('login-password');
        const icon = togglePasswordBtn.querySelector('i');
        if (input.type === 'password') {
            input.type = 'text';
            icon.className = 'fas fa-eye-slash';
        } else {
            input.type = 'password';
            icon.className = 'fas fa-eye';
        }
    });
}

// Login form submit
const loginForm = document.getElementById('login-form');
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value.trim();
        const password = document.getElementById('login-password').value;
        const loginBtn = document.getElementById('login-btn');

        if (loginBtn) {
            loginBtn.disabled = true;
            loginBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Authenticating...';
        }

        try {
            const response = await fetch(`${API_BASE}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'Invalid credentials. Please verify your email and password.');
            }

            authToken = result.data.token;
            currentUser = result.data.user;
            localStorage.setItem('drarjun_admin_token', authToken);
            localStorage.setItem('drarjun_user_profile', JSON.stringify(currentUser));

            showToast(`Welcome back, ${currentUser.name}!`, 'success');
            checkAuth();

        } catch (err) {
            showToast(err.message, 'error');
        } finally {
            if (loginBtn) {
                loginBtn.disabled = false;
                loginBtn.innerHTML = '<span>Sign In to Portal</span><i class="fas fa-arrow-right"></i>';
            }
        }
    });
}

// Logout handler
const logoutBtn = document.getElementById('logout-btn');
if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
        authToken = null;
        currentUser = null;
        localStorage.removeItem('drarjun_admin_token');
        localStorage.removeItem('drarjun_user_profile');
        showToast('Signed out successfully.', 'info');
        checkAuth();
    });
}

// ==========================================
// TAB NAVIGATION
// ==========================================
function switchTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active'));

    const targetTab = document.getElementById(`tab-${tabId}`);
    const targetNav = document.querySelector(`[data-tab="${tabId}"]`);
    const pageTitle = document.getElementById('current-page-title');

    if (targetTab) targetTab.classList.add('active');
    if (targetNav) targetNav.classList.add('active');

    const titles = {
        overview: 'Dashboard Overview',
        appointments: 'Appointments & Consultations',
        doctors: 'Doctor Profiles & OPD Schedule',
        notifications: 'Email & Notification Settings'
    };
    if (pageTitle && titles[tabId]) {
        pageTitle.innerText = titles[tabId];
    }

    if (tabId === 'appointments') loadAppointments();
    if (tabId === 'doctors') loadDoctors();

    // Auto-close sidebar on mobile after choosing a tab
    closeSidebar();
}

document.querySelectorAll('.nav-item').forEach(btn => {
    btn.addEventListener('click', () => {
        const tab = btn.getAttribute('data-tab');
        switchTab(tab);
    });
});

// Mobile menu toggle & sidebar controls
const menuToggle = document.getElementById('menu-toggle');
const sidebar = document.querySelector('.sidebar');
const sidebarBackdrop = document.getElementById('sidebar-backdrop');
const sidebarCloseBtn = document.getElementById('sidebar-close-btn');

function openSidebar() {
    if (sidebar) sidebar.classList.add('open');
    if (sidebarBackdrop) sidebarBackdrop.classList.add('active');
}

function closeSidebar() {
    if (sidebar) sidebar.classList.remove('open');
    if (sidebarBackdrop) sidebarBackdrop.classList.remove('active');
}

function toggleSidebar() {
    if (sidebar && sidebar.classList.contains('open')) {
        closeSidebar();
    } else {
        openSidebar();
    }
}

if (menuToggle) {
    menuToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleSidebar();
    });
}

if (sidebarCloseBtn) {
    sidebarCloseBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        closeSidebar();
    });
}

if (sidebarBackdrop) {
    sidebarBackdrop.addEventListener('click', closeSidebar);
}

// Close sidebar on Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeSidebar();
        if (typeof closeModal === 'function') closeModal();
    }
});

// ==========================================
// DASHBOARD INITIALIZATION & DATA FETCHING
// ==========================================
async function initDashboard() {
    await Promise.all([
        loadStats(),
        loadAppointments(),
        loadDoctors()
    ]);
}

// Fetch Overview Metrics
async function loadStats() {
    try {
        const response = await fetch(`${API_BASE}/stats/overview`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });

        if (response.status === 401) {
            logoutBtn.click();
            return;
        }

        const result = await response.json();
        if (result.success && result.data) {
            document.getElementById('stat-total').innerText = result.data.totalAppointments || 0;
            document.getElementById('stat-pending').innerText = result.data.pendingAppointments || 0;
            document.getElementById('stat-confirmed').innerText = result.data.confirmedAppointments || 0;
            document.getElementById('stat-doctors').innerText = result.data.totalDoctors || 2;
            
            const pendingBadge = document.getElementById('pending-badge');
            if (pendingBadge) {
                pendingBadge.innerText = result.data.pendingAppointments || 0;
            }
        }
    } catch (err) {
        console.error('Failed to load stats:', err);
    }
}

// Fetch All Appointments
async function loadAppointments() {
    const tableBody = document.getElementById('appointments-table-body');
    const recentTableBody = document.getElementById('recent-table-body');

    try {
        const response = await fetch(`${API_BASE}/appointments?limit=100`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });

        const result = await response.json();
        if (result.success && result.data && result.data.appointments) {
            currentAppointments = result.data.appointments;
            renderAppointmentsTable(currentAppointments);
            renderRecentAppointments(currentAppointments.slice(0, 5));
        } else {
            tableBody.innerHTML = '<tr><td colspan="6" class="text-center">No appointments found.</td></tr>';
        }
    } catch (err) {
        console.error('Failed to load appointments:', err);
        tableBody.innerHTML = '<tr><td colspan="6" class="text-center" style="color: red;">Error loading appointments.</td></tr>';
    }
}

// Render Main Appointments Table
function renderAppointmentsTable(appointments) {
    const tableBody = document.getElementById('appointments-table-body');
    if (!tableBody) return;

    if (appointments.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="6" class="text-center">No matching appointments found.</td></tr>';
        return;
    }

    tableBody.innerHTML = appointments.map(appt => {
        const dateStr = new Date(appt.createdAt || appt.appointmentDate).toLocaleDateString('en-IN', {
            day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
        });

        const statusClass = (appt.status || 'PENDING').toLowerCase();

        return `
            <tr>
                <td>
                    <div class="patient-info-cell">
                        <span class="patient-name">${appt.patientName || 'Guest Patient'}</span>
                        <span class="patient-id">ID: #${(appt._id || '').slice(-6).toUpperCase()}</span>
                    </div>
                </td>
                <td class="contact-cell">
                    <div><a href="tel:${appt.patientPhone}"><i class="fas fa-phone"></i> ${appt.patientPhone}</a></div>
                    ${appt.patientEmail ? `<div style="font-size: 11px; color: #64748b;"><i class="fas fa-envelope"></i> ${appt.patientEmail}</div>` : ''}
                </td>
                <td>
                    <strong>${appt.treatment || 'General Consultation'}</strong>
                    <div style="font-size: 11px; color: #0b6b3a;"><i class="fas fa-video"></i> ${appt.consultationType === 'PHONE_CALL' ? 'Online Phone / WhatsApp' : 'Online Video Consultation'}</div>
                </td>
                <td>
                    <div style="font-size: 12px; font-weight: 500;">${dateStr}</div>
                    <div style="font-size: 11px; color: #64748b;">${appt.preferredTimeSlot || 'Morning (9 AM - 1 PM)'}</div>
                </td>
                <td>
                    <span class="status-badge ${statusClass}">
                        <i class="fas ${statusClass === 'confirmed' ? 'fa-check' : statusClass === 'pending' ? 'fa-clock' : 'fa-circle'}"></i>
                        ${appt.status || 'PENDING'}
                    </span>
                </td>
                <td>
                    <div class="action-btns">
                        ${appt.status !== 'CONFIRMED' ? `<button class="btn-icon confirm" title="Confirm Consultation" onclick="updateStatus('${appt._id}', 'CONFIRMED')"><i class="fas fa-check"></i></button>` : ''}
                        ${appt.status !== 'COMPLETED' ? `<button class="btn-icon complete" title="Mark Completed" onclick="updateStatus('${appt._id}', 'COMPLETED')"><i class="fas fa-user-check"></i></button>` : ''}
                        ${appt.status !== 'CANCELLED' ? `<button class="btn-icon cancel" title="Cancel Appointment" onclick="updateStatus('${appt._id}', 'CANCELLED')"><i class="fas fa-times"></i></button>` : ''}
                        <button class="btn-icon" title="View Patient Details & Remedy Notes" onclick="openDetailsModal('${appt._id}')"><i class="fas fa-notes-medical"></i></button>
                        <button class="btn-icon delete" title="Permanently Delete Record" onclick="deleteAppointmentRecord('${appt._id}')"><i class="fas fa-trash-alt"></i></button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

// Render Recent Table on Overview Tab
function renderRecentAppointments(appointments) {
    const recentBody = document.getElementById('recent-table-body');
    if (!recentBody) return;

    if (appointments.length === 0) {
        recentBody.innerHTML = '<tr><td colspan="6" class="text-center">No recent appointments.</td></tr>';
        return;
    }

    recentBody.innerHTML = appointments.map(appt => {
        const dateStr = new Date(appt.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
        const statusClass = (appt.status || 'PENDING').toLowerCase();

        return `
            <tr>
                <td><strong>${appt.patientName}</strong></td>
                <td><a href="tel:${appt.patientPhone}" style="color: #0b6b3a;">${appt.patientPhone}</a></td>
                <td>${appt.treatment}</td>
                <td>${dateStr}</td>
                <td><span class="status-badge ${statusClass}">${appt.status}</span></td>
                <td>
                    <div style="display: flex; gap: 4px;">
                        <button class="btn-secondary" style="padding: 4px 8px; font-size: 11px;" onclick="openDetailsModal('${appt._id}')">
                            <i class="fas fa-file-medical"></i> Case
                        </button>
                        <button class="btn-icon delete" style="width: 26px; height: 26px; font-size: 10px;" title="Delete Record" onclick="deleteAppointmentRecord('${appt._id}')">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

// ==========================================
// APPOINTMENT STATUS & NOTES UPDATES
// ==========================================
async function updateStatus(id, newStatus) {
    if (!confirm(`Are you sure you want to change this appointment status to ${newStatus}?`)) return;

    try {
        const response = await fetch(`${API_BASE}/appointments/${id}/status`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({ status: newStatus })
        });

        const result = await response.json();
        if (!response.ok) throw new Error(result.message || 'Failed to update status.');

        showToast(`Appointment marked as ${newStatus}!`, 'success');
        await Promise.all([loadStats(), loadAppointments()]);

    } catch (err) {
        showToast(err.message, 'error');
    }
}

// Delete Appointment Record
async function deleteAppointmentRecord(id) {
    if (!confirm('Are you sure you want to permanently delete this appointment record? This action cannot be undone.')) return;

    try {
        const response = await fetch(`${API_BASE}/appointments/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });

        const result = await response.json();
        if (!response.ok) throw new Error(result.message || 'Failed to delete appointment record.');

        showToast('🗑️ Appointment permanently deleted.', 'info');
        if (activeAppointmentId === id) closeModal();
        await Promise.all([loadStats(), loadAppointments()]);

    } catch (err) {
        showToast(err.message, 'error');
    }
}

function deleteActiveAppointment() {
    if (activeAppointmentId) {
        deleteAppointmentRecord(activeAppointmentId);
    }
}

// Helper to insert quick remedies
function insertRemedy(remedyText) {
    const notesInput = document.getElementById('doctor-notes-input');
    if (notesInput) {
        notesInput.value = (notesInput.value ? notesInput.value + '\n• ' : '• ') + remedyText;
        notesInput.focus();
    }
}

// Open Details & Doctor Notes Modal
function openDetailsModal(id) {
    activeAppointmentId = id;
    const appt = currentAppointments.find(a => a._id === id);
    if (!appt) return;

    const modalBody = document.getElementById('modal-body-content');
    modalBody.innerHTML = `
        <div style="background: #f8fafc; padding: 16px; border-radius: 8px; border: 1px solid #e2e8f0;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                <strong style="font-size: 17px; color: #1e293b;"><i class="fas fa-user-injured"></i> ${appt.patientName}</strong>
                <span class="status-badge ${(appt.status || 'PENDING').toLowerCase()}">${appt.status}</span>
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 13px; margin-top: 10px;">
                <p><strong>Mobile:</strong> <a href="tel:${appt.patientPhone}" style="color: #0b6b3a;">${appt.patientPhone}</a></p>
                <p><strong>Email:</strong> ${appt.patientEmail || 'Not provided'}</p>
                <p><strong>Treatment:</strong> ${appt.treatment}</p>
                <p><strong>Consultation Mode:</strong> <span style="color: #0b6b3a; font-weight: 600;"><i class="fas fa-video"></i> ${appt.consultationType === 'PHONE_CALL' ? 'Online Phone / WhatsApp Call' : 'Online Video Consultation'}</span></p>
                <p><strong>Preferred Slot:</strong> ${appt.preferredTimeSlot || 'Morning'}</p>
                <p><strong>Booked On:</strong> ${new Date(appt.createdAt).toLocaleString('en-IN')}</p>
            </div>
        </div>

        <div class="form-group">
            <label><strong>Patient Problem & Description:</strong></label>
            <p style="background: #ffffff; border: 1px solid #e2e8f0; padding: 12px; border-radius: 6px; font-size: 13px; color: #334155; line-height: 1.6;">
                ${appt.message ? appt.message : '<em>No additional description entered by patient.</em>'}
            </p>
        </div>

        <div class="form-group">
            <label for="doctor-notes-input"><strong>Doctor Prescription & Clinical Notes:</strong></label>
            
            <!-- Quick Homeopathic Remedies Shortcuts -->
            <div style="display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 8px;">
                <span style="font-size: 11px; font-weight: 600; color: #64748b; width: 100%;">Click to add common remedy:</span>
                <button type="button" class="btn-secondary" style="padding: 3px 8px; font-size: 11px;" onclick="insertRemedy('Thuja Occidentalis 200CH - 2 pills twice daily before food')">+ Thuja 200</button>
                <button type="button" class="btn-secondary" style="padding: 3px 8px; font-size: 11px;" onclick="insertRemedy('Arnica Montana 30CH - 4 pills 3 times daily')">+ Arnica 30</button>
                <button type="button" class="btn-secondary" style="padding: 3px 8px; font-size: 11px;" onclick="insertRemedy('Rhus Toxicodendron 200CH - 2 pills at night')">+ Rhus Tox 200</button>
                <button type="button" class="btn-secondary" style="padding: 3px 8px; font-size: 11px;" onclick="insertRemedy('Nux Vomica 30CH - 4 pills bedtime')">+ Nux Vom 30</button>
                <button type="button" class="btn-secondary" style="padding: 3px 8px; font-size: 11px;" onclick="insertRemedy('Silicea 200CH - Weekly single dose')">+ Silicea 200</button>
            </div>

            <textarea id="doctor-notes-input" rows="5" placeholder="Enter constitutional remedy, dosage, potencies, diet restrictions, or follow-up date..." style="width: 100%; padding: 12px; border: 1px solid #cbd5e1; border-radius: 8px; font-family: inherit; font-size: 13px; line-height: 1.6;">${appt.doctorNotes || ''}</textarea>
        </div>
    `;

    document.getElementById('details-modal').style.display = 'flex';
}

function closeModal() {
    document.getElementById('details-modal').style.display = 'none';
    activeAppointmentId = null;
}

// Save Doctor Notes
const saveNotesBtn = document.getElementById('modal-save-notes-btn');
if (saveNotesBtn) {
    saveNotesBtn.addEventListener('click', async () => {
        if (!activeAppointmentId) return;
        const notes = document.getElementById('doctor-notes-input').value.trim();
        const appt = currentAppointments.find(a => a._id === activeAppointmentId);

        try {
            const response = await fetch(`${API_BASE}/appointments/${activeAppointmentId}/status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                },
                body: JSON.stringify({
                    status: appt ? appt.status : 'PENDING',
                    doctorNotes: notes
                })
            });

            const result = await response.json();
            if (!response.ok) throw new Error(result.message || 'Failed to save notes.');

            showToast('Clinical notes & prescription saved successfully!', 'success');
            closeModal();
            loadAppointments();

        } catch (err) {
            showToast(err.message, 'error');
        }
    });
}

// ==========================================
// SEARCH & FILTER FUNCTIONALITY
// ==========================================
function filterAppointments() {
    const searchTerm = (document.getElementById('search-input')?.value || '').toLowerCase();
    const statusFilter = document.getElementById('filter-status')?.value || '';
    const treatmentFilter = document.getElementById('filter-treatment')?.value || '';

    const filtered = currentAppointments.filter(appt => {
        const matchesSearch = !searchTerm || 
            (appt.patientName && appt.patientName.toLowerCase().includes(searchTerm)) ||
            (appt.patientPhone && appt.patientPhone.includes(searchTerm)) ||
            (appt.patientEmail && appt.patientEmail.toLowerCase().includes(searchTerm));

        const matchesStatus = !statusFilter || appt.status === statusFilter;
        const matchesTreatment = !treatmentFilter || appt.treatment === treatmentFilter;

        return matchesSearch && matchesStatus && matchesTreatment;
    });

    renderAppointmentsTable(filtered);
}

document.getElementById('search-input')?.addEventListener('input', filterAppointments);
document.getElementById('filter-status')?.addEventListener('change', filterAppointments);
document.getElementById('filter-treatment')?.addEventListener('change', filterAppointments);
document.getElementById('refresh-appointments-btn')?.addEventListener('click', async () => {
    showToast('Refreshing appointments...', 'info');
    await loadAppointments();
    showToast('Appointments list refreshed!', 'success');
});

// ==========================================
// DOCTORS LIST & PROFILE DETAILS
// ==========================================
async function loadDoctors() {
    const container = document.getElementById('doctors-list-container');
    if (!container) return;

    try {
        const response = await fetch(`${API_BASE}/doctors`);
        const result = await response.json();

        if (result.success && result.data && result.data.doctors) {
            container.innerHTML = result.data.doctors.map(doc => `
                <div class="doctor-profile-card">
                    <div class="doc-header">
                        <img src="${doc.avatar || 'images/logo.jpeg'}" alt="${doc.name}" class="doc-avatar">
                        <div class="doc-info">
                            <h4>${doc.name}</h4>
                            <span>${doc.qualification} • ${doc.experienceYears} Years Experience</span>
                        </div>
                    </div>
                    <p style="font-size: 13px; color: #475569; line-height: 1.6;">${doc.bio || 'Dedicated classical homeopathy consultant with a focus on individualized holistic healing.'}</p>
                    <div>
                        <strong style="font-size: 12px; color: #1e293b;">Specializations & Key Areas:</strong>
                        <div class="doc-specializations" style="margin-top: 8px;">
                            ${(doc.specialization || []).map(spec => `<span class="specialization-tag"><i class="fas fa-check-circle" style="color: #0b6b3a;"></i> ${spec}</span>`).join('')}
                        </div>
                    </div>
                    <div class="doc-schedule-summary">
                        <div><i class="fas fa-clock" style="color: #0b6b3a;"></i> <strong>OPD Timings:</strong> Mon - Sat (9:00 AM - 8:00 PM)</div>
                        <div style="margin-top: 4px;"><i class="fas fa-video" style="color: #2563eb;"></i> <strong>Mode:</strong> 100% Online Video & Phone Consultation (Doorstep Medicine Delivery)</div>
                    </div>
                </div>
            `).join('');
        }
    } catch (err) {
        console.error('Failed to load doctors:', err);
    }
}

// ==========================================
// TEST EMAIL TRIGGER
// ==========================================
const testEmailForm = document.getElementById('test-email-form');
if (testEmailForm) {
    testEmailForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('test-email-input').value.trim();
        const btn = document.getElementById('test-email-btn');

        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending Test Email...';

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 20000);

        try {
            const response = await fetch(`${API_BASE}/stats/test-email`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                },
                body: JSON.stringify({ email }),
                signal: controller.signal
            });

            clearTimeout(timeoutId);
            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'Failed to dispatch test email.');
            }

            showToast(`✅ ${result.message || 'Test email dispatched successfully!'}`, 'success');

        } catch (err) {
            clearTimeout(timeoutId);
            if (err.name === 'AbortError') {
                showToast('⚠️ Request timed out. Please check your SMTP settings and network.', 'error');
            } else {
                showToast(`⚠️ ${err.message}`, 'error');
            }
        } finally {
            btn.disabled = false;
            btn.innerHTML = '<i class="fas fa-paper-plane"></i> Send Test Notification';
        }
    });
}

// Start application
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
});
