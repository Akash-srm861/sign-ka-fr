/**
 * UI Module
 * Handles all UI interactions, modals, toasts, and visual feedback
 */

class UIManager {
    constructor() {
        this.initModals();
        this.initNavigation();
        this.initScrollEffects();
    }
    
    /**
     * Initialize modal functionality
     */
    initModals() {
        // Get modal elements
        this.loginModal = document.getElementById('login-modal');
        this.signupModal = document.getElementById('signup-modal');
        
        // Get button elements
        const loginBtn = document.getElementById('login-btn');
        const signupBtn = document.getElementById('signup-btn');
        const showSignup = document.getElementById('show-signup');
        const showLogin = document.getElementById('show-login');
        
        // Open modals
        if (loginBtn) loginBtn.addEventListener('click', () => this.openModal('login'));
        if (signupBtn) signupBtn.addEventListener('click', () => this.openModal('signup'));
        if (showSignup) showSignup.addEventListener('click', (e) => {
            e.preventDefault();
            this.closeModal('login');
            this.openModal('signup');
        });
        if (showLogin) showLogin.addEventListener('click', (e) => {
            e.preventDefault();
            this.closeModal('signup');
            this.openModal('login');
        });
        
        // Close modals
        const closeButtons = document.querySelectorAll('.modal-close');
        closeButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                this.closeModal('login');
                this.closeModal('signup');
            });
        });
        
        // Close on outside click
        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.closeModal('login');
                this.closeModal('signup');
            }
        });
    }
    
    /**
     * Initialize navigation functionality
     */
    initNavigation() {
        // Mobile menu toggle
        const navToggle = document.getElementById('nav-toggle');
        const navMenu = document.getElementById('nav-menu');
        
        if (navToggle && navMenu) {
            navToggle.addEventListener('click', () => {
                navMenu.classList.toggle('active');
            });
            
            // Close menu on link click
            const navLinks = document.querySelectorAll('.nav-link');
            navLinks.forEach(link => {
                link.addEventListener('click', () => {
                    navMenu.classList.remove('active');
                });
            });
        }
        
        // User dropdown menu
        const userAvatar = document.getElementById('user-avatar');
        const dropdownMenu = document.getElementById('dropdown-menu');
        
        if (userAvatar && dropdownMenu) {
            userAvatar.addEventListener('click', () => {
                dropdownMenu.classList.toggle('active');
            });
            
            // Close dropdown on outside click
            document.addEventListener('click', (e) => {
                if (!userAvatar.contains(e.target) && !dropdownMenu.contains(e.target)) {
                    dropdownMenu.classList.remove('active');
                }
            });
        }
        
        // Active nav link on scroll
        const sections = document.querySelectorAll('section[id]');
        const navLinks = document.querySelectorAll('.nav-link');
        
        window.addEventListener('scroll', () => {
            let current = '';
            sections.forEach(section => {
                const sectionTop = section.offsetTop;
                const sectionHeight = section.clientHeight;
                if (scrollY >= (sectionTop - 200)) {
                    current = section.getAttribute('id');
                }
            });
            
            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${current}`) {
                    link.classList.add('active');
                }
            });
        });
    }
    
    /**
     * Initialize scroll effects
     */
    initScrollEffects() {
        // Navbar shadow on scroll
        const navbar = document.getElementById('navbar');
        
        if (navbar) {
            window.addEventListener('scroll', () => {
                if (window.scrollY > 50) {
                    navbar.style.boxShadow = 'var(--shadow-lg)';
                } else {
                    navbar.style.boxShadow = 'var(--shadow-md)';
                }
            });
        }
    }
    
    /**
     * Open a modal
     * @param {string} modalType - 'login' or 'signup'
     */
    openModal(modalType) {
        const modal = modalType === 'login' ? this.loginModal : this.signupModal;
        if (modal) {
            modal.classList.add('active');
            
            // Clear previous errors
            const errorEl = modal.querySelector('.form-error');
            if (errorEl) {
                errorEl.textContent = '';
                errorEl.classList.remove('active');
            }
            
            // Clear form
            const form = modal.querySelector('form');
            if (form) form.reset();
        }
    }
    
    /**
     * Close a modal
     * @param {string} modalType - 'login' or 'signup'
     */
    closeModal(modalType) {
        const modal = modalType === 'login' ? this.loginModal : this.signupModal;
        if (modal) {
            modal.classList.remove('active');
        }
    }
    
    /**
     * Show toast notification
     * @param {string} message - Message to display
     * @param {string} type - 'success', 'error', or 'warning'
     * @param {number} duration - Duration in ms
     */
    showToast(message, type = 'success', duration = APP_CONFIG.UI.TOAST_DURATION) {
        const toast = document.getElementById('toast');
        if (!toast) return;
        
        toast.textContent = message;
        toast.className = `toast ${type} active`;
        
        setTimeout(() => {
            toast.classList.remove('active');
        }, duration);
    }
    
    /**
     * Show loading overlay
     */
    showLoading() {
        const loading = document.getElementById('loading-overlay');
        if (loading) {
            loading.classList.add('active');
        }
    }
    
    /**
     * Hide loading overlay
     */
    hideLoading() {
        const loading = document.getElementById('loading-overlay');
        if (loading) {
            // Minimum display time for smooth UX
            setTimeout(() => {
                loading.classList.remove('active');
            }, APP_CONFIG.UI.LOADING_MIN_DURATION);
        }
    }
    
    /**
     * Show form error
     * @param {HTMLElement} form - Form element
     * @param {string} message - Error message
     */
    showFormError(form, message) {
        const errorEl = form.querySelector('.form-error');
        if (errorEl) {
            errorEl.textContent = message;
            errorEl.classList.add('active');
        }
    }
    
    /**
     * Clear form error
     * @param {HTMLElement} form - Form element
     */
    clearFormError(form) {
        const errorEl = form.querySelector('.form-error');
        if (errorEl) {
            errorEl.textContent = '';
            errorEl.classList.remove('active');
        }
    }
    
    /**
     * Update module progress
     * @param {string} module - Module name
     * @param {number} progress - Progress percentage (0-100)
     */
    updateModuleProgress(module, progress) {
        const moduleCard = document.querySelector(`[data-module="${module}"]`);
        if (moduleCard) {
            const progressFill = moduleCard.querySelector('.progress-fill');
            const progressText = moduleCard.querySelector('.progress-text');
            
            if (progressFill) {
                progressFill.style.width = `${progress}%`;
            }
            if (progressText) {
                progressText.textContent = `${Math.round(progress)}% Complete`;
            }
        }
    }
    
    /**
     * Create a custom alert dialog
     * @param {string} title - Dialog title
     * @param {string} message - Dialog message
     * @param {string} type - 'info', 'success', 'error'
     */
    showAlert(title, message, type = 'info') {
        // For now, use browser alert (can be enhanced later)
        alert(`${title}\n\n${message}`);
    }
    
    /**
     * Smooth scroll to element
     * @param {string} selector - CSS selector
     */
    scrollToElement(selector) {
        const element = document.querySelector(selector);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }
}

// Create global UI manager instance
const UI = new UIManager();
