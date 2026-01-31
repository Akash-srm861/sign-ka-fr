/**
 * Configuration file for the Sign Language Learning App
 * Contains API endpoints and app settings
 */

// API Base URL - Change this to your backend URL
const API_BASE_URL = 'https://sign-34wi.onrender.com';

// API Endpoints
const API_ENDPOINTS = {
    // Authentication
    AUTH: {
        SIGNUP: `${API_BASE_URL}/api/auth/signup`,
        LOGIN: `${API_BASE_URL}/api/auth/login`,
        REFRESH: `${API_BASE_URL}/api/auth/refresh`,
        ME: `${API_BASE_URL}/api/auth/me`,
        UPDATE: `${API_BASE_URL}/api/auth/update`,
        CHANGE_PASSWORD: `${API_BASE_URL}/api/auth/change-password`
    },
    
    // Sign Detection
    DETECT: {
        SIGN: `${API_BASE_URL}/api/detect`,
        LANDMARKS: `${API_BASE_URL}/api/detect/landmarks`
    },
    
    // Progress Tracking
    PROGRESS: {
        ALL: `${API_BASE_URL}/api/progress`,
        CATEGORY: (category) => `${API_BASE_URL}/api/progress/${category}`,
        RECORD: `${API_BASE_URL}/api/progress/record`
    },
    
    // Learning Sessions
    SESSION: {
        START: `${API_BASE_URL}/api/session/start`,
        END: (sessionId) => `${API_BASE_URL}/api/session/${sessionId}/end`
    },
    
    // Learning Modules
    SIGNS: {
        BY_CATEGORY: (category) => `${API_BASE_URL}/api/signs/${category}`
    },
    
    // Dashboard
    DASHBOARD: {
        STATS: `${API_BASE_URL}/api/dashboard/stats`
    },
    
    // Chatbot
    CHATBOT: {
        MESSAGE: `${API_BASE_URL}/api/chatbot/message`,        HISTORY: `${API_BASE_URL}/api/chatbot/history`,        SUGGESTIONS: `${API_BASE_URL}/api/chatbot/suggestions`,
        HINT: (sign) => `${API_BASE_URL}/api/chatbot/hint/${sign}`
    }
};

// App Configuration
const APP_CONFIG = {
    // Local Storage Keys
    STORAGE_KEYS: {
        ACCESS_TOKEN: 'sl_access_token',
        REFRESH_TOKEN: 'sl_refresh_token',
        USER_DATA: 'sl_user_data',
        THEME: 'sl_theme'
    },
    
    // Camera Settings
    CAMERA: {
        WIDTH: 640,
        HEIGHT: 480,
        FRAME_RATE: 30
    },
    
    // Detection Settings
    DETECTION: {
        CONFIDENCE_THRESHOLD: 0.7,
        FEEDBACK_DELAY: 1000, // ms
        MAX_ATTEMPTS: 10
    },
    
    // UI Settings
    UI: {
        TOAST_DURATION: 3000, // ms
        LOADING_MIN_DURATION: 500 // ms
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { API_ENDPOINTS, APP_CONFIG };
}
