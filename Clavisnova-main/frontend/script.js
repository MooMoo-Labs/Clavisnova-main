// Page switching functionality for single-page app
function showSection(id) {
    console.log('showSection called with id:', id);
    const views = document.querySelectorAll('.section-view');
    views.forEach(v => v.classList.remove('active'));

    const target = document.getElementById(id + '-view');
    console.log('Target element found:', !!target);
    if (target) {
        target.classList.add('active');
        window.scrollTo({ top: 0, behavior: 'smooth' });

        // Re-bind form events after section change
        console.log('Scheduling form initialization...');
        setTimeout(() => {
            console.log('Initializing forms after section change...');
            initForms();
        }, 100);
    } else {
        console.log('Target element not found for id:', id + '-view');
    }
}

// Form handling with validation and API integration
function initForms() {
    console.log('Initializing forms...');

    // Check if donor-form-view is visible
    const donorFormView = document.getElementById('donor-form-view');
    console.log('donor-form-view element found:', !!donorFormView);
    console.log('donor-form-view is active:', donorFormView ? donorFormView.classList.contains('active') : 'N/A');

    // Remove existing event listeners to prevent duplicates
    const existingDonorForm = document.querySelector('#donor-form-view form');
    console.log('Existing donor form found:', !!existingDonorForm);
    if (existingDonorForm) {
        console.log('Removing existing donor form event listeners...');
        const newDonorForm = existingDonorForm.cloneNode(true);
        existingDonorForm.parentNode.replaceChild(newDonorForm, existingDonorForm);
    }

    // Also remove existing event listeners for school form to avoid duplicate submits
    const existingSchoolForm = document.querySelector('#school-form-view form');
    console.log('Existing school form found:', !!existingSchoolForm);
    if (existingSchoolForm) {
        console.log('Removing existing school form event listeners...');
        const newSchoolForm = existingSchoolForm.cloneNode(true);
        existingSchoolForm.parentNode.replaceChild(newSchoolForm, existingSchoolForm);
    }

    // Donor form (Piano Registration) - calls /api/registration
    const donorForm = document.querySelector('#donor-form-view form');
    console.log('Donor form found after cleanup:', !!donorForm);

    if (donorForm) {
        if (!donorForm.dataset.listenerAttached) {
            console.log('Binding submit event to donor form (robust)');

            // Helper to find the submit button: prefer explicit .js-submit, fall back to type selectors
            const findSubmitButton = (formEl) => {
                return formEl.querySelector('.js-submit') ||
                    formEl.querySelector('button[type="submit"]') ||
                    formEl.querySelector('button[type="button"], button:not([type])');
            };

            // Shared submit handler function
            const donorSubmitHandler = async function(e) {
                if (e && e.preventDefault) e.preventDefault();
                const form = donorForm; // reference the current donor form
                console.log('Submit event triggered (shared handler)');

                console.log('Form submitted, validating...');
                if (!validateDonorForm(form)) {
                    console.log('Form validation failed');
                    return;
                }
                console.log('Form validation passed');

                // Disable submit button to prevent double submission
                const submitBtn = findSubmitButton(form);
                if (submitBtn) {
                    submitBtn.disabled = true;
                    submitBtn.innerHTML = '<span class="spinner"></span> Submitting...';

                    // Add spinner styles if not already present
                    if (!document.querySelector('#spinner-styles')) {
                        const style = document.createElement('style');
                        style.id = 'spinner-styles';
                        style.textContent = `
                            .spinner {
                                display: inline-block;
                                width: 16px;
                                height: 16px;
                                border: 2px solid #ffffff;
                                border-radius: 50%;
                                border-top-color: transparent;
                                animation: spin 1s ease-in-out infinite;
                                margin-right: 8px;
                            }
                            @keyframes spin {
                                to { transform: rotate(360deg); }
                            }
                        `;
                        document.head.appendChild(style);
                    }
                }

                // Map form data to backend expected fields
                const formDataObj = new FormData(form);
                const data = {
                    manufacturer: formDataObj.get('brand') || '', // Manufacturer
                    model: formDataObj.get('model') || '', // Model
                    serial: formDataObj.get('serial') || '', // Serial Number
                    year: parseInt(formDataObj.get('year')) || 2020, // Year
                    height: formDataObj.get('type') || '', // Piano Type (Upright/Grand/Digital)
                    finish: formDataObj.get('condition') || '', // Condition
                    color_wood: formDataObj.get('color_wood') || '', // Color/Wood details
                    city_state: formDataObj.get('city') || '', // City & State
                    access: formDataObj.get('access') || '' // Access Details
                };

                // Submit to backend
                console.log('Submitting data:', data);
                try {
                    const response = await submitFormData('/api/registration', data);
                    console.log('🎉 Response received:', response);
                    if (response.id && response.message) {
                        showSuccessModal('Thank you for registering your piano! A specialist will contact you within 48 hours for assessment.');
                        form.reset();
                        setTimeout(() => {
                            const modal = document.querySelector('.success-modal-overlay');
                            if (modal) modal.remove();
                            showSection('home');
                        }, 5000);
                    } else {
                        console.log('❌ Error response:', response);
                        showFormMessage(form, response.message || 'Submission failed. Please try again.', 'error');
                    }
                } catch (error) {
                    console.error('Error submitting donor form:', error);

                    let errorMessage = 'An unexpected error occurred. Please try again.';

                    if (error.message.includes('timed out')) {
                        errorMessage = 'Request timed out. The server may be busy. Please try again in a moment.';
                    } else if (error.message.includes('Network connection failed')) {
                        errorMessage = 'Network connection failed. Please check your internet connection and try again.';
                    } else if (error.message.includes('Request failed')) {
                        errorMessage = 'Server error. Please try again later.';
                    }

                    showFormMessage(form, errorMessage, 'error');
                } finally {
                    if (submitBtn) {
                        submitBtn.disabled = false;
                        submitBtn.innerHTML = 'Submit Registry';
                    }
                }
            };

            // Bind submit event
            donorForm.addEventListener('submit', donorSubmitHandler);

            // Also bind click on submit-like button to ensure JS path is used even if browser triggers default submit
            const submitBtnEl = findSubmitButton(donorForm);
            if (submitBtnEl) {
                submitBtnEl.addEventListener('click', function(ev) {
                    ev.preventDefault();
                    donorSubmitHandler();
                });
            }

            donorForm.dataset.listenerAttached = 'true';
        }
    }

    // School form (Requirements) - calls /api/requirements
    const schoolForm = document.querySelector('#school-form-view form');
    if (schoolForm) {
        if (!schoolForm.dataset.listenerAttached) {
            schoolForm.addEventListener('submit', function(e) {
            e.preventDefault();

            if (!validateSchoolForm(this)) return;

            // Disable submit button to prevent double submission
            const submitBtn = (function(formEl){
                return formEl.querySelector('button[type="submit"], button[type="button"], button:not([type])');
            })(this);
            submitBtn.disabled = true;
            submitBtn.textContent = 'Submitting...';

            // Map form data to backend expected fields (info1-info6)
            const formData = new FormData(this);
            const data = {
                info1: formData.get('school-name') || '', // School Full Name
                info2: formData.get('current-pianos') || '', // Current Number of Pianos
                info3: formData.get('preferred-type') || '', // Preferred Piano Type
                info4: formData.get('teacher-name') || '', // Contact Teacher Name
                info5: formData.get('background') || '', // Background & Impact Statement
                info6: 'Maintenance commitment accepted' // Checkbox commitment
            };

            // Submit to backend
            submitFormData('/api/requirements', data)
                .then(response => {
                    if (response.success !== false) { // Backend returns success in response
                        // Show modal and wait for 5s countdown before redirecting (keeps in sync with modal)
                        showSuccessModal('Submission successful');
                        this.reset();
                        setTimeout(() => {
                            const modal = document.querySelector('.success-modal-overlay');
                            if (modal) modal.remove();
                            showSection('home');
                        }, 5000);
                    } else {
                        showFormMessage(this, response.message || 'Submission failed. Please try again.', 'error');
                    }
                })
                .catch(error => {
                    console.error('Error submitting school form:', error);
                    showFormMessage(this, 'Network error. Please check your connection and try again.', 'error');
                })
                .finally(() => {
                    submitBtn.disabled = false;
                    submitBtn.textContent = 'Submit Application';
                });
            });
            schoolForm.dataset.listenerAttached = 'true';
        }
    }

    // Contact form (simple client-side handling)
    const contactForm = document.querySelector('#contact-view form');
    if (contactForm) {
        if (!contactForm.dataset.listenerAttached) {
            contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const form = this;
            if (!validateContactForm(form)) return;

            const submitBtn = (function(formEl){
                return formEl.querySelector('button[type="submit"], button[type="button"], button:not([type])');
            })(form);
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.textContent = 'Submitting...';
            }

            const fd = new FormData(form);
            const payload = {
                name: fd.get('name') || '',
                email: fd.get('email') || '',
                message: fd.get('message') || ''
            };

            submitFormData('/api/contact', payload)
                .then(res => {
                    if (res && (res.id || res.message)) {
                        // show modal and redirect after 5s
                        showSuccessModal('Submission successful');
                        form.reset();
                        setTimeout(() => {
                            const modal = document.querySelector('.success-modal-overlay');
                            if (modal) modal.remove();
                            showSection('home');
                        }, 5000);
                    } else {
                        showFormMessage(form, res.message || 'Submission failed. Please try again.', 'error');
                    }
                })
                .catch(err => {
                    console.error('Error submitting contact form:', err);
                    showFormMessage(form, 'Network error. Please try again.', 'error');
                })
                .finally(() => {
                    if (submitBtn) {
                        submitBtn.disabled = false;
                        submitBtn.textContent = 'Send Message';
                    }
                });
            });
            contactForm.dataset.listenerAttached = 'true';
        }
    }
}

// Test if JavaScript is working
console.log('🎹 Script loaded successfully!');

// API base for backend requests - change to your API domain (Render)
const API_BASE = 'https://clavisnova.onrender.com';

// Test function calls
function testJavaScript() {
    console.log('✅ testJavaScript function called');
    return true;
}

// Call test immediately
testJavaScript();

document.addEventListener('DOMContentLoaded', function() {
    console.log('🏠 DOM loaded, initializing forms...');

    try {
        initForms();
        console.log('✅ Forms initialized successfully');
    } catch (error) {
        console.error('💥 Error initializing forms:', error);
    }
});

// Form validation functions
function validateDonorForm(form) {
    console.log('Validating donor form...');
    let isValid = true;
    // Ensure frontend required fields match backend expectations (include 'model')
    const requiredFields = ['brand', 'model', 'type', 'condition', 'city'];

    // Check required fields
    requiredFields.forEach(fieldName => {
        const field = form.querySelector(`[name="${fieldName}"]`);
        console.log(`Checking field ${fieldName}:`, field ? field.value : 'field not found');
        if (field && !field.value.trim()) {
            console.log(`Field ${fieldName} is required but empty`);
            showFieldError(field, 'This field is required');
            isValid = false;
        } else if (field) {
            clearFieldError(field);
        }
    });

    // Validate year if provided
    const yearField = form.querySelector('[name="year"]');
    if (yearField && yearField.value.trim()) {
        const year = parseInt(yearField.value);
        if (isNaN(year) || year < 1800 || year > new Date().getFullYear()) {
            showFieldError(yearField, 'Please enter a valid year');
            isValid = false;
        } else {
            clearFieldError(yearField);
        }
    }

    console.log('Validation result:', isValid);
    return isValid;
}

function validateSchoolForm(form) {
    let isValid = true;
    const requiredFields = ['school-name', 'current-pianos', 'preferred-type', 'teacher-name', 'background'];

    // Check required fields
    requiredFields.forEach(fieldName => {
        const field = form.querySelector(`[name="${fieldName}"]`);
        if (field && !field.value.trim()) {
            showFieldError(field, 'This field is required');
            isValid = false;
        } else if (field) {
            clearFieldError(field);
        }
    });

    // Check maintenance commitment checkbox
    const commitmentCheckbox = form.querySelector('input[type="checkbox"]');
    if (commitmentCheckbox && !commitmentCheckbox.checked) {
        showFieldError(commitmentCheckbox, 'You must agree to maintain the instrument');
        isValid = false;
    } else if (commitmentCheckbox) {
        clearFieldError(commitmentCheckbox);
    }

    return isValid;
}

function validateContactForm(form) {
    let isValid = true;
    const requiredFields = ['name', 'email', 'message'];

    requiredFields.forEach(fieldName => {
        const field = form.querySelector(`input[name="${fieldName}"], textarea[name="${fieldName}"]`);
        if (field && !field.value.trim()) {
            showFieldError(field, 'This field is required');
            isValid = false;
        } else if (field) {
            clearFieldError(field);
        }
    });

    // Email validation
    const emailField = form.querySelector('input[type="email"]');
    if (emailField && emailField.value.trim()) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(emailField.value.trim())) {
            showFieldError(emailField, 'Please enter a valid email address');
            isValid = false;
        } else {
            clearFieldError(emailField);
        }
    }

    return isValid;
}

function showFieldError(field, message) {
    // Remove existing error
    clearFieldError(field);

    field.classList.add('border-red-500');

    // Create error message element
    const errorDiv = document.createElement('div');
    errorDiv.className = 'text-red-500 text-sm mt-1 field-error';
    errorDiv.textContent = message;

    // Insert after the field
    field.parentNode.insertBefore(errorDiv, field.nextSibling);
}

function clearFieldError(field) {
    field.classList.remove('border-red-500');
    const errorDiv = field.parentNode.querySelector('.field-error');
    if (errorDiv) {
        errorDiv.remove();
    }
}

function showFormMessage(form, message, type) {
    // Remove existing message
    const existingMessage = form.querySelector('.form-message');
    if (existingMessage) {
        existingMessage.remove();
    }

    // Create message element
    const messageDiv = document.createElement('div');
    messageDiv.className = `form-message ${type === 'success' ? 'bg-green-100 text-green-800 border-green-200' : 'bg-red-100 text-red-800 border-red-200'} border px-4 py-3 rounded-xl mb-6 font-medium`;
    messageDiv.textContent = message;

    // Insert at the top of the form
    form.insertBefore(messageDiv, form.firstChild);

    // Auto-hide after 5 seconds for success messages
    if (type === 'success') {
        setTimeout(() => {
            messageDiv.remove();
        }, 5000);
    }
}

// Success modal for forms
function showSuccessModal(message) {
    console.log('Creating success modal with message:', message);

    // Remove existing modal
    const existingModal = document.querySelector('.success-modal-overlay');
    if (existingModal) {
        console.log('Removing existing modal');
        existingModal.remove();
    }

    // Create modal overlay
    const modalOverlay = document.createElement('div');
    modalOverlay.className = 'success-modal-overlay';
    modalOverlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 999999;
        opacity: 1;
    `;

    // Create modal content
    const modalContent = document.createElement('div');
    modalContent.className = 'success-modal';
    modalContent.style.cssText = `
        background: white;
        border-radius: 1.5rem;
        padding: 2.5rem;
        max-width: 36rem;
        margin: 1rem;
        text-align: center;
        box-shadow: 0 20px 40px rgba(0,0,0,0.3);
        position: relative;
        z-index: 1000000;
    `;

    modalContent.innerHTML = `
        <div style="
            width: 4rem;
            height: 4rem;
            background: #10b981;
            color: white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.5rem;
            font-weight: bold;
            margin: 0 auto 1rem;
        ">
            ✓
        </div>
        <h3 style="
            color: #1f2937;
            font-size: 1.25rem;
            font-weight: bold;
            margin-bottom: 1rem;
        ">Submission Successful!</h3>
        <p style="
            color: #6b7280;
            margin-bottom: 0.75rem;
            line-height: 1.5;
            font-size: 1.05rem;
        ">Submission successful</p>
        <p style="color:#374151; margin-bottom:1rem; font-weight:600;">Closing in <span id="modal-countdown">5</span>s</p>
    `;

    modalOverlay.appendChild(modalContent);
    document.body.appendChild(modalOverlay);

    console.log('Modal created and displayed');

    // Immediate check
    setTimeout(() => {
        const modalCheck = document.querySelector('.success-modal-overlay');
        console.log('Modal visibility check:', !!modalCheck);
        if (modalCheck) {
            console.log('Modal is in DOM, computed style:', window.getComputedStyle(modalCheck).display);
        }
    }, 100);

    // Countdown and auto-close
    let countdown = 5;
    const countdownEl = modalContent.querySelector('#modal-countdown');
    const interval = setInterval(() => {
        countdown -= 1;
        if (countdownEl) countdownEl.textContent = String(countdown);
        if (countdown <= 0) {
            clearInterval(interval);
            if (modalOverlay.parentNode) {
                modalOverlay.remove();
                console.log('Modal auto-closed after 5 seconds');
            }
        }
    }, 1000);
    // Ensure modal remains until redirect; if navigation occurs earlier, remove modal in navigation handler
}

function closeSuccessModal() {
    const modal = document.querySelector('.success-modal-overlay');
    if (modal) {
        modal.remove();
    }
}

// Submit form data to backend API with timeout and retry
async function submitFormData(endpoint, data, maxRetries = 2) {
    const url = endpoint.startsWith('http') ? endpoint : `${API_BASE}${endpoint}`;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            console.log(`Submitting to ${url} (attempt ${attempt + 1}/${maxRetries + 1})`);

            // Create AbortController for timeout
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout (increased for slow networks)

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            const result = await response.json();
            console.log('Raw API response:', result);

            // Add success flag based on HTTP status
            result.success = response.ok;
            console.log('Processed response:', result);

            return result;

        } catch (error) {
            console.error(`Network error (attempt ${attempt + 1}):`, error);

            // If this is the last attempt, throw the error
            if (attempt === maxRetries) {
                if (error.name === 'AbortError') {
                    throw new Error('Request timed out after 30 seconds. The server might be slow or your network connection is poor. Please try again.');
                } else if (error.message.includes('fetch')) {
                    throw new Error('Network connection failed. Please check your internet connection.');
                } else {
                    throw new Error(`Request failed: ${error.message}`);
                }
            }

            // Wait before retrying (exponential backoff)
            const delay = Math.min(1000 * Math.pow(2, attempt), 5000);
            console.log(`Retrying in ${delay}ms...`);
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
}

// Header background on scroll (for sticky nav)
window.addEventListener('scroll', function() {
    const nav = document.querySelector('nav');
    if (window.scrollY > 50) {
        nav.classList.add('shadow-lg');
    } else {
        nav.classList.remove('shadow-lg');
    }
});

// Page loading animation
document.addEventListener('DOMContentLoaded', function() {
    // Simple page load effect
    document.body.style.opacity = '0';
    setTimeout(() => {
        document.body.style.transition = 'opacity 0.5s ease';
        document.body.style.opacity = '1';
    }, 100);
});

// Smooth scrolling for anchor links (if any)
document.addEventListener('click', function(e) {
    if (e.target.matches('a[href^="#"]')) {
        e.preventDefault();
        const target = document.querySelector(e.target.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth' });
        }
    }
});

// Add some visual enhancements for form interactions
document.addEventListener('DOMContentLoaded', function() {
    // Add focus effects for form inputs
    const inputs = document.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
        input.addEventListener('focus', function() {
            this.parentElement.classList.add('focused');
        });
        input.addEventListener('blur', function() {
            this.parentElement.classList.remove('focused');
        });
    });

    // Add loading states for buttons (include buttons without explicit type)
    const buttons = document.querySelectorAll('button[type="submit"], button:not([type])');
    buttons.forEach(button => {
        button.addEventListener('click', function() {
            if (this.form && this.form.checkValidity()) {
                this.classList.add('loading');
            }
        });
    });
});

// Global delegated click handler: ensure any button click inside a form triggers the JS submit flow.
document.addEventListener('click', function(e) {
    try {
        const btn = e.target.closest('button');
        if (!btn) return;

        // If button is inside a form and is not a native submit (type="button" or no type),
        // dispatch a synthetic 'submit' event on the form so attached submit handlers run.
    const form = btn.form || btn.closest('form');
    // If this button is handled by the dedicated .js-submit handler, skip this generic dispatcher
    if (btn.matches && btn.matches('.js-submit')) return;
    if (form && (btn.type === 'button' || !btn.hasAttribute('type'))) {
            e.preventDefault();
            // dispatch submit event that bubbles and is cancelable
            form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
        }
    } catch (err) {
        console.error('Delegated click handler error:', err);
    }
}, true);

// Robust click-to-submit handler for elements with `.js-submit`.
// This directly handles clicks on submit-like buttons and performs validation+submission,
// avoiding reliance on per-form listeners which may be lost if forms are cloned.
if (!window.__jsSubmitHandlerInstalled) {
    window.__jsSubmitHandlerInstalled = true;
    document.addEventListener('click', async function(e) {
        const btn = e.target.closest('.js-submit');
        if (!btn) return;
        try {
            e.preventDefault();
            const form = btn.form || btn.closest('form');
            if (!form) return;

            // Avoid duplicate processing
            if (btn.dataset.processing === 'true') return;
            btn.dataset.processing = 'true';

            // Determine which form type and validate
            if (form.closest('#donor-form-view')) {
                if (!validateDonorForm(form)) {
                    btn.dataset.processing = 'false';
                    return;
                }
                // Build data and submit (same mapping as donorSubmitHandler)
                const fd = new FormData(form);
                const data = {
                    manufacturer: fd.get('brand') || '',
                    model: fd.get('model') || '',
                    serial: fd.get('serial') || '',
                    year: parseInt(fd.get('year')) || 2020,
                    height: fd.get('type') || '',
                    finish: fd.get('condition') || '',
                    color_wood: fd.get('color_wood') || '',
                    city_state: fd.get('city') || '',
                    access: fd.get('access') || ''
                };

                btn.disabled = true;
                btn.textContent = 'Submitting...';
                try {
                    const res = await submitFormData('/api/registration', data);
                    if (res && res.id) {
                        showSuccessModal('Thank you for registering your piano! A specialist will contact you within 48 hours for assessment.');
                        form.reset();
                        setTimeout(() => {
                            const modal = document.querySelector('.success-modal-overlay');
                            if (modal) modal.remove();
                            showSection('home');
                        }, 5000);
                    } else {
                        showFormMessage(form, res.message || 'Submission failed. Please try again.', 'error');
                    }
                } catch (err) {
                    console.error('Error submitting via delegated handler:', err);
                    showFormMessage(form, 'Network error. Please check your connection and try again.', 'error');
                } finally {
                    btn.disabled = false;
                    btn.textContent = 'Submit Registry';
                    btn.dataset.processing = 'false';
                }
            } else if (form.closest('#school-form-view')) {
                if (!validateSchoolForm(form)) {
                    btn.dataset.processing = 'false';
                    return;
                }
                const fd = new FormData(form);
                const data = {
                    info1: fd.get('school-name') || '',
                    info2: fd.get('current-pianos') || '',
                    info3: fd.get('preferred-type') || '',
                    info4: fd.get('teacher-name') || '',
                    info5: fd.get('background') || '',
                    info6: 'Maintenance commitment accepted'
                };
                btn.disabled = true;
                btn.textContent = 'Submitting...';
                try {
                    const res = await submitFormData('/api/requirements', data);
                    if (res && res.success !== false) {
                        showSuccessModal('Submission successful');
                        form.reset();
                        setTimeout(() => {
                            const modal = document.querySelector('.success-modal-overlay');
                            if (modal) modal.remove();
                            showSection('home');
                        }, 5000);
                    } else {
                        showFormMessage(form, res.message || 'Submission failed. Please try again.', 'error');
                    }
                } catch (err) {
                    console.error('Error submitting requirements via delegated handler:', err);
                    showFormMessage(form, 'Network error. Please check your connection and try again.', 'error');
                } finally {
                    btn.disabled = false;
                    btn.textContent = 'Submit Application';
                    btn.dataset.processing = 'false';
                }
            } else {
                // Fallback: dispatch submit event on form
                form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
                btn.dataset.processing = 'false';
            }
        } catch (err) {
            console.error('js-submit handler error:', err);
            try { btn.dataset.processing = 'false'; } catch (_) {}
        }
    }, false);
}
