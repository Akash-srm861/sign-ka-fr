/**
 * Simple Authentication with Backend
 * Users stored in Supabase PostgreSQL database
 */

class AuthManager {
    constructor() {
        this.user = null;
        this.init();
    }
    
    init() {
        // Load user from localStorage
        const userData = localStorage.getItem('user_data');
        if (userData) {
            try {
                this.user = JSON.parse(userData);
                console.log('✓ User session restored:', this.user.email);
            } catch (e) {
                console.error('Failed to parse user data');
            }
        }
        this.updateUI();
    }
    
    async signup(username, email, password) {
        try {
            const response = await fetch('http://localhost:5000/api/auth/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, email, password })
            });
            
            const data = await response.json();
            
            if (!response.ok || !data.success) {
                throw new Error(data.error || 'Signup failed');
            }
            
            // Save user to localStorage
            this.user = data.user;
            localStorage.setItem('user_data', JSON.stringify(this.user));
            localStorage.setItem('user_id', this.user.id);
            
            console.log('✓ Signup successful:', email);
            this.updateUI();
            
            return data;
        } catch (error) {
            console.error('Signup error:', error);
            throw error;
        }
    }
    
    async login(email, password) {
        try {
            const response = await fetch('http://localhost:5000/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });
            
            const data = await response.json();
            
            if (!response.ok || !data.success) {
                throw new Error(data.error || 'Login failed');
            }
            
            // Save user to localStorage
            this.user = data.user;
            localStorage.setItem('user_data', JSON.stringify(this.user));
            localStorage.setItem('user_id', this.user.id);
            
            console.log('✓ Login successful:', email);
            this.updateUI();
            
            return data;
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    }
    
    async logout() {
        this.user = null;
        localStorage.removeItem('user_data');
        localStorage.removeItem('user_id');
        this.updateUI();
        console.log('✓ Logged out');
        window.location.href = '/';
    }
    
    getAllUsers() {
        const usersData = localStorage.getItem('all_users');
        return usersData ? JSON.parse(usersData) : [];
    }
    
    updateUI() {
        const loginBtn = document.getElementById('login-btn');
        const signupBtn = document.getElementById('signup-btn');
        const userMenu = document.getElementById('user-menu');
        const usernameSpan = document.getElementById('username');
        
        if (this.isAuthenticated()) {
            if (loginBtn) loginBtn.style.display = 'none';
            if (signupBtn) signupBtn.style.display = 'none';
            if (userMenu) userMenu.style.display = 'block';
            if (usernameSpan && this.user) {
                usernameSpan.textContent = this.user.username || this.user.email;
            }
        } else {
            if (loginBtn) loginBtn.style.display = 'inline-block';
            if (signupBtn) signupBtn.style.display = 'inline-block';
            if (userMenu) userMenu.style.display = 'none';
        }
    }
    
    isAuthenticated() {
        return !!this.user;
    }
    
    getUserId() {
        return this.user?.id || localStorage.getItem('user_id');
    }
    
    async authenticatedRequest(url, options = {}) {
        if (!this.isAuthenticated()) {
            throw new Error('Not authenticated');
        }
        
        const userId = this.getUserId();
        
        // Add user_id to request body if POST
        if (options.method === 'POST' && options.body) {
            try {
                const body = JSON.parse(options.body);
                body.user_id = userId;
                options.body = JSON.stringify(body);
            } catch (e) {
                // Body might not be JSON, skip
            }
        }
        
        // Set headers
        if (!options.headers) {
            options.headers = {};
        }
        options.headers['Content-Type'] = 'application/json';
        
        try {
            const response = await fetch(url, options);
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || 'Request failed');
            }
            
            return data;
        } catch (error) {
            console.error('API request error:', error);
            throw error;
        }
    }
}

// Create global instance
const Auth = new AuthManager();
