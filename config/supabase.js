/**
 * Supabase Configuration
 * Sign Language Learning App
 */

// Supabase Project Configuration
const SUPABASE_URL = 'https://decggnqfpczzxvtdwpyt.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRlY2dnbnFmcGN6enh2dGR3cHl0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk3ODA4NzYsImV4cCI6MjA4NTM1Njg3Nn0.S4QeUtQPksZ0oHJwvAGgfxmIoxiiwjfopjY_UVBU4fQ';

// Backend API Configuration
const API_BASE_URL = 'http://localhost:5000';

// Export configuration
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        SUPABASE_URL,
        SUPABASE_ANON_KEY,
        API_BASE_URL
    };
}
