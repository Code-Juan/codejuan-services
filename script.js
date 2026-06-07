//theme system
let currentTheme = 'light';

function initTheme() {
    const savedTheme = localStorage.getItem('services-theme') || 'light';
    setTheme(savedTheme);
}

function setTheme(theme) {
    currentTheme = theme;
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('services-theme', theme);
    updateThemeToggleIcon();
}

function toggleTheme() {
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
}

function updateThemeToggleIcon() {
    const toggle = document.getElementById('theme-toggle');
    if (!toggle) return;
    const sunIcon = toggle.querySelector('.fa-sun');
    const moonIcon = toggle.querySelector('.fa-moon');
    if (sunIcon && moonIcon) {
        sunIcon.style.opacity = currentTheme === 'light' ? '1' : '0';
        moonIcon.style.opacity = currentTheme === 'dark' ? '1' : '0';
    }
}

//mobile navigation
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');

if (hamburger && navMenu) {
    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
    });

    //close mobile menu when clicking a link
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
        });
    });
}

//navbar scroll effect
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (!navbar) return;
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

//active nav link highlighting
function setActiveNavLink() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-link').forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentPage || (currentPage === '' && href === 'index.html')) {
            link.classList.add('active');
        }
    });
}

//contact form handling
function initContactForm() {
    const form = document.getElementById('contact-form');
    if (!form) return;

    form.addEventListener('submit', function(e) {
        e.preventDefault();

        const formData = new FormData(this);
        const name = (formData.get('name') || '').trim();
        const email = (formData.get('email') || '').trim();
        const phone = (formData.get('phone') || '').trim();
        const service = (formData.get('service') || '').trim();
        const message = (formData.get('message') || '').trim();
        const company_website = formData.get('company_website') || '';

        if (!name || !email || !message) {
            showNotification('Please fill in all required fields.', 'error');
            return;
        }

        if (!isValidEmail(email)) {
            showNotification('Please enter a valid email address.', 'error');
            return;
        }

        //show loading state
        const submitBtn = this.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Sending...';
        submitBtn.disabled = true;

        //submit to API backend
        fetch(this.action, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, phone, service, message, company_website })
        })
        .then(response => {
            if (response.ok) {
                showNotification('Thank you! I\'ll get back to you within 24 hours.', 'success');
                this.reset();
                return;
            }

            return response.json().catch(() => ({})).then(data => {
                if (response.status === 503) {
                    showNotification(data.error || 'Contact form is temporarily unavailable. Please email contact@codejuan.com directly.', 'error');
                } else if (response.status === 400) {
                    showNotification(data.error || 'Please check your details and try again.', 'error');
                } else if (response.status === 429) {
                    showNotification('Too many requests. Please wait a moment and try again.', 'error');
                } else {
                    showNotification('There was an error. Please try again or email contact@codejuan.com', 'error');
                }
            });
        })
        .catch(error => {
            console.error('Error:', error);
            showNotification('There was an error. Please try again or email contact@codejuan.com', 'error');
        })
        .finally(() => {
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        });
    });
}

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

//notification system
function showNotification(message, type = 'info') {
    const existing = document.querySelector('.notification');
    if (existing) existing.remove();

    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.setAttribute('aria-live', 'polite');
    notification.style.background = type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6';

    const content = document.createElement('div');
    content.className = 'notification-content';

    const messageSpan = document.createElement('span');
    messageSpan.textContent = message;

    const closeButton = document.createElement('button');
    closeButton.className = 'notification-close';
    closeButton.innerHTML = '&times;';

    content.appendChild(messageSpan);
    content.appendChild(closeButton);
    notification.appendChild(content);

    document.body.appendChild(notification);

    //animate in
    setTimeout(() => notification.classList.add('show'), 100);

    //close button
    notification.querySelector('.notification-close').addEventListener('click', () => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    });

    //auto remove
    setTimeout(() => {
        if (notification.parentNode) {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }
    }, 5000);
}

//intersection observer for animations
function initAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

    document.querySelectorAll('.animate-in').forEach(el => observer.observe(el));
}

//sticky CTA
function initStickyCTA() {
    const stickyCTA = document.querySelector('.sticky-cta');
    if (!stickyCTA) return;

    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
            stickyCTA.classList.add('show');
        } else {
            stickyCTA.classList.remove('show');
        }
    });
}

//initialize everything on DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    setActiveNavLink();
    initContactForm();
    initAnimations();
    initStickyCTA();
});
