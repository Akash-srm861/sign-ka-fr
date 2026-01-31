/**
 * Main Application Script
 * Initializes the app and handles primary functionality
 */

// Wait for DOM to load
document.addEventListener('DOMContentLoaded', () => {
    console.log('Sign Language Learning App Initialized');
    
    // Initialize authentication forms
    initAuthForms();
    
    // Initialize module cards
    initModuleCards();
    
    // Initialize hero actions
    initHeroActions();
    
    // Initialize logout
    initLogout();
    
    // Load user progress if authenticated
    if (Auth.isAuthenticated()) {
        loadUserProgress();
    }
});

/**
 * Initialize authentication forms
 */
function initAuthForms() {
    // Login form
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;
            
            UI.clearFormError(loginForm);
            UI.showLoading();
            
            try {
                await Auth.login(email, password);
                UI.hideLoading();
                UI.closeModal('login');
                UI.showToast('Login successful!', 'success');
                
                // Reload progress
                loadUserProgress();
            } catch (error) {
                UI.hideLoading();
                UI.showFormError(loginForm, error.message);
            }
        });
    }
    
    // Signup form
    const signupForm = document.getElementById('signup-form');
    if (signupForm) {
        signupForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const username = document.getElementById('signup-username').value;
            const email = document.getElementById('signup-email').value;
            const password = document.getElementById('signup-password').value;
            
            UI.clearFormError(signupForm);
            UI.showLoading();
            
            try {
                await Auth.signup(username, email, password);
                UI.hideLoading();
                UI.closeModal('signup');
                UI.showToast('Account created successfully!', 'success');
                
                // Reload progress
                loadUserProgress();
            } catch (error) {
                UI.hideLoading();
                UI.showFormError(signupForm, error.message);
            }
        });
    }
}

/**
 * Initialize module cards
 */
function initModuleCards() {
    const moduleCards = document.querySelectorAll('.module-card');
    
    moduleCards.forEach(card => {
        const btn = card.querySelector('.module-btn');
        const module = card.getAttribute('data-module');
        
        if (btn) {
            btn.addEventListener('click', () => {
                if (!Auth.isAuthenticated()) {
                    UI.showToast('Please login to start learning', 'warning');
                    UI.openModal('login');
                    return;
                }
                
                // Navigate to practice page
                window.location.href = `pages/practice.html?module=${module}`;
            });
        }
    });
}

/**
 * Initialize hero action buttons
 */
function initHeroActions() {
    const getStartedBtn = document.getElementById('get-started-btn');
    const learnMoreBtn = document.getElementById('learn-more-btn');
    
    if (getStartedBtn) {
        getStartedBtn.addEventListener('click', () => {
            if (!Auth.isAuthenticated()) {
                UI.openModal('signup');
            } else {
                UI.scrollToElement('#practice');
            }
        });
    }
    
    if (learnMoreBtn) {
        learnMoreBtn.addEventListener('click', () => {
            UI.scrollToElement('#features');
        });
    }
}

/**
 * Initialize logout functionality
 */
function initLogout() {
    const logoutLink = document.getElementById('logout-link');
    const dashboardLink = document.getElementById('dashboard-link');
    
    if (logoutLink) {
        logoutLink.addEventListener('click', (e) => {
            e.preventDefault();
            Auth.logout();
        });
    }
    
    if (dashboardLink) {
        dashboardLink.addEventListener('click', (e) => {
            e.preventDefault();
            if (Auth.isAuthenticated()) {
                window.location.href = 'pages/dashboard.html';
            }
        });
    }
}

/**
 * Load user progress for modules
 */
async function loadUserProgress() {
    if (!Auth.isAuthenticated()) return;
    
    try {
        const response = await Auth.authenticatedRequest(API_ENDPOINTS.PROGRESS.ALL);
        const data = await response.json();
        
        if (data.success && data.overview) {
            const categories = data.overview.categories;
            
            // Update each module's progress
            Object.keys(categories).forEach(category => {
                const categoryData = categories[category];
                const totalSigns = APP_CONFIG.SIGN_CATEGORIES?.[category]?.length || 
                                  (category === 'alphabets' ? 26 : 
                                   category === 'numbers' ? 10 : 10);
                const progress = (categoryData.signs_practiced / totalSigns) * 100;
                
                UI.updateModuleProgress(category, progress);
            });
        }
    } catch (error) {
        console.error('Failed to load progress:', error);
    }
}

/**
 * Helper: Format date
 * @param {string} dateString - ISO date string
 * @returns {string} Formatted date
 */
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

/**
 * Helper: Format duration
 * @param {number} minutes - Duration in minutes
 * @returns {string} Formatted duration
 */
function formatDuration(minutes) {
    if (minutes < 60) {
        return `${Math.round(minutes)} min`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    return `${hours}h ${mins}m`;
}

/**
 * Helper: Debounce function
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in ms
 * @returns {Function} Debounced function
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Helper: Throttle function
 * @param {Function} func - Function to throttle
 * @param {number} limit - Time limit in ms
 * @returns {Function} Throttled function
 */
function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Export helpers for use in other scripts
window.AppHelpers = {
    formatDate,
    formatDuration,
    debounce,
    throttle
};
