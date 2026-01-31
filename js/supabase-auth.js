/**
 * Supabase Authentication Module
 * Handles user authentication with Supabase
 */

// Supabase Configuration
const SUPABASE_URL = 'https://decggnqfpczzxvtdwpyt.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRlY2dnbnFmcGN6enh2dGR3cHl0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk3ODA4NzYsImV4cCI6MjA4NTM1Njg3Nn0.S4QeUtQPksZ0oHJwvAGgfxmIoxiiwjfopjY_UVBU4fQ';

// Initialize Supabase Client
// Note: Include Supabase JS library in your HTML:
// <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>

let supabaseClient = null;

/**
 * Initialize Supabase client
 */
function initSupabase() {
    if (typeof supabase === 'undefined') {
        console.error('Supabase library not loaded. Include: <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>');
        return null;
    }
    
    if (!supabaseClient) {
        supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        console.log('✓ Supabase client initialized');
    }
    
    return supabaseClient;
}

/**
 * Sign up a new user (no email verification required)
 */
async function signUp(email, password, username) {
    const client = initSupabase();
    if (!client) return { error: 'Supabase not initialized' };
    
    try {
        const { data, error } = await client.auth.signUp({
            email: email,
            password: password,
            options: {
                emailRedirectTo: window.location.origin,
                data: {
                    username: username
                }
            }
        });
        
        if (error) {
            console.error('Sign up error:', error);
            return { error: error.message };
        }
        
        console.log('✓ User signed up successfully');
        
        // Auto sign in after signup (no email verification needed)
        if (data.session) {
            localStorage.setItem('supabase_session', JSON.stringify(data.session));
            localStorage.setItem('user_id', data.user.id);
        }
        
        return { data };
    } catch (err) {
        console.error('Sign up exception:', err);
        return { error: err.message };
    }
}

/**
 * Sign in an existing user
 */
async function signIn(email, password) {
    const client = initSupabase();
    if (!client) return { error: 'Supabase not initialized' };
    
    try {
        const { data, error } = await client.auth.signInWithPassword({
            email: email,
            password: password
        });
        
        if (error) {
            console.error('Sign in error:', error);
            return { error: error.message };
        }
        
        console.log('✓ User signed in successfully');
        
        // Store user session
        if (data.session) {
            localStorage.setItem('supabase_session', JSON.stringify(data.session));
            localStorage.setItem('user_id', data.user.id);
        }
        
        return { data };
    } catch (err) {
        console.error('Sign in exception:', err);
        return { error: err.message };
    }
}

/**
 * Sign out the current user
 */
async function signOut() {
    const client = initSupabase();
    if (!client) return { error: 'Supabase not initialized' };
    
    try {
        const { error } = await client.auth.signOut();
        
        if (error) {
            console.error('Sign out error:', error);
            return { error: error.message };
        }
        
        // Clear local storage
        localStorage.removeItem('supabase_session');
        localStorage.removeItem('user_id');
        
        console.log('✓ User signed out successfully');
        return { success: true };
    } catch (err) {
        console.error('Sign out exception:', err);
        return { error: err.message };
    }
}

/**
 * Get the current user
 */
async function getCurrentUser() {
    const client = initSupabase();
    if (!client) return { error: 'Supabase not initialized' };
    
    try {
        const { data: { user }, error } = await client.auth.getUser();
        
        if (error) {
            console.error('Get user error:', error);
            return { error: error.message };
        }
        
        if (user) {
            localStorage.setItem('user_id', user.id);
        }
        
        return { user };
    } catch (err) {
        console.error('Get user exception:', err);
        return { error: err.message };
    }
}

/**
 * Get user ID from session
 */
function getUserId() {
    return localStorage.getItem('user_id');
}

/**
 * Check if user is authenticated
 */
async function isAuthenticated() {
    const { user } = await getCurrentUser();
    return user !== null;
}

/**
 * Listen for auth state changes
 */
function onAuthStateChange(callback) {
    const client = initSupabase();
    if (!client) return null;
    
    return client.auth.onAuthStateChange((event, session) => {
        console.log('Auth state changed:', event);
        
        if (session) {
            localStorage.setItem('supabase_session', JSON.stringify(session));
            localStorage.setItem('user_id', session.user.id);
        } else {
            localStorage.removeItem('supabase_session');
            localStorage.removeItem('user_id');
        }
        
        callback(event, session);
    });
}

/**
 * Reset password
 */
async function resetPassword(email) {
    const client = initSupabase();
    if (!client) return { error: 'Supabase not initialized' };
    
    try {
        const { error } = await client.auth.resetPasswordForEmail(email);
        
        if (error) {
            console.error('Reset password error:', error);
            return { error: error.message };
        }
        
        console.log('✓ Password reset email sent');
        return { success: true };
    } catch (err) {
        console.error('Reset password exception:', err);
        return { error: err.message };
    }
}

/**
 * Update user password
 */
async function updatePassword(newPassword) {
    const client = initSupabase();
    if (!client) return { error: 'Supabase not initialized' };
    
    try {
        const { error } = await client.auth.updateUser({
            password: newPassword
        });
        
        if (error) {
            console.error('Update password error:', error);
            return { error: error.message };
        }
        
        console.log('✓ Password updated successfully');
        return { success: true };
    } catch (err) {
        console.error('Update password exception:', err);
        return { error: err.message };
    }
}

// Export functions
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        initSupabase,
        signUp,
        signIn,
        signOut,
        getCurrentUser,
        getUserId,
        isAuthenticated,
        onAuthStateChange,
        resetPassword,
        updatePassword
    };
}
