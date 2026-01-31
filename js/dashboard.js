/**
 * Dashboard Page JavaScript
 * Handles loading and displaying user progress and statistics
 */

class DashboardManager {
    constructor() {
        this.init();
    }
    
    async init() {
        // Check authentication
        if (!Auth.isAuthenticated()) {
            window.location.href = '../index.html';
            return;
        }
        
        // Initialize logout
        document.getElementById('logout-link')?.addEventListener('click', (e) => {
            e.preventDefault();
            Auth.logout();
        });
        
        // Load all dashboard data
        await this.loadDashboardData();
    }
    
    async loadDashboardData() {
        UI.showLoading();
        
        try {
            // Load stats and progress in parallel
            await Promise.all([
                this.loadStats(),
                this.loadProgress(),
                this.loadRecentSessions()
            ]);
            
            UI.hideLoading();
        } catch (error) {
            UI.hideLoading();
            console.error('Failed to load dashboard:', error);
            UI.showToast('Failed to load dashboard data', 'error');
        }
    }
    
    async loadStats() {
        try {
            const response = await Auth.authenticatedRequest(API_ENDPOINTS.DASHBOARD.STATS);
            const data = await response.json();
            
            if (data.success && data.stats) {
                this.updateStats(data.stats);
            }
        } catch (error) {
            console.error('Failed to load stats:', error);
        }
    }
    
    updateStats(stats) {
        // Streak
        document.getElementById('streak-days').textContent = stats.streak || 0;
        
        // Mastered signs
        document.getElementById('mastered-signs').textContent = stats.mastered_signs || 0;
        
        // Practice time
        const practiceTime = Math.round(stats.weekly_practice_time || 0);
        document.getElementById('practice-time').textContent = practiceTime;
        
        // Overall accuracy
        const totalAttempts = stats.total_attempts || 0;
        const totalCorrect = stats.total_correct || 0;
        const accuracy = totalAttempts > 0 
            ? Math.round((totalCorrect / totalAttempts) * 100) 
            : 0;
        document.getElementById('overall-accuracy').textContent = accuracy + '%';
    }
    
    async loadProgress() {
        try {
            const response = await Auth.authenticatedRequest(API_ENDPOINTS.PROGRESS.ALL);
            const data = await response.json();
            
            if (data.success && data.overview) {
                this.updateProgress(data.overview);
                this.updateTopSigns(data.overview);
            }
        } catch (error) {
            console.error('Failed to load progress:', error);
        }
    }
    
    updateProgress(overview) {
        const categories = overview.categories;
        
        // Alphabets (26 total)
        const alphabets = categories.alphabets || {};
        const alphabetsProgress = (alphabets.signs_practiced / 26) * 100;
        document.getElementById('alphabets-practiced').textContent = alphabets.signs_practiced || 0;
        document.getElementById('alphabets-progress').style.width = alphabetsProgress + '%';
        document.getElementById('alphabets-percentage').textContent = Math.round(alphabetsProgress) + '%';
        
        // Numbers (10 total)
        const numbers = categories.numbers || {};
        const numbersProgress = (numbers.signs_practiced / 10) * 100;
        document.getElementById('numbers-practiced').textContent = numbers.signs_practiced || 0;
        document.getElementById('numbers-progress').style.width = numbersProgress + '%';
        document.getElementById('numbers-percentage').textContent = Math.round(numbersProgress) + '%';
        
        // Words (estimate 50 total)
        const words = categories.words || {};
        const wordsProgress = (words.signs_practiced / 50) * 100;
        document.getElementById('words-practiced').textContent = words.signs_practiced || 0;
        document.getElementById('words-progress').style.width = wordsProgress + '%';
        document.getElementById('words-percentage').textContent = Math.round(wordsProgress) + '%';
    }
    
    updateTopSigns(overview) {
        const allSigns = [];
        
        // Collect all signs from all categories
        Object.values(overview.categories).forEach(category => {
            if (category.signs) {
                allSigns.push(...category.signs);
            }
        });
        
        // Sort by mastery level
        allSigns.sort((a, b) => b.mastery_level - a.mastery_level);
        
        // Take top 6
        const topSigns = allSigns.slice(0, 6);
        
        if (topSigns.length === 0) {
            return; // Keep empty state
        }
        
        // Render top signs
        const container = document.getElementById('top-signs-grid');
        container.innerHTML = topSigns.map(sign => `
            <div class="sign-card">
                <div class="sign-card-letter">${sign.sign_name}</div>
                <div class="sign-card-name">${sign.category}</div>
                <div class="sign-card-accuracy">${Math.round(sign.accuracy)}%</div>
            </div>
        `).join('');
    }
    
    async loadRecentSessions() {
        try {
            const response = await Auth.authenticatedRequest(API_ENDPOINTS.PROGRESS.ALL);
            const data = await response.json();
            
            if (data.success && data.recent_sessions) {
                this.updateRecentSessions(data.recent_sessions);
            }
        } catch (error) {
            console.error('Failed to load sessions:', error);
        }
    }
    
    updateRecentSessions(sessions) {
        if (sessions.length === 0) {
            return; // Keep empty state
        }
        
        const container = document.getElementById('sessions-list');
        container.innerHTML = sessions.map(session => {
            const date = new Date(session.started_at);
            const formattedDate = date.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric'
            });
            const formattedTime = date.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit'
            });
            
            return `
                <div class="session-item">
                    <div class="session-info">
                        <div class="session-title">
                            ${this.getCategoryTitle(session.category)} Practice
                        </div>
                        <div class="session-meta">
                            <span><i class="fas fa-calendar"></i>${formattedDate}</span>
                            <span><i class="fas fa-clock"></i>${formattedTime}</span>
                            <span><i class="fas fa-stopwatch"></i>${Math.round(session.duration_minutes)} min</span>
                        </div>
                    </div>
                    <div class="session-stats">
                        <div class="session-stat">
                            <strong>${session.total_signs}</strong>
                            <span>Signs</span>
                        </div>
                        <div class="session-stat">
                            <strong>${session.correct_signs}</strong>
                            <span>Correct</span>
                        </div>
                        <div class="session-stat">
                            <strong>${session.accuracy}%</strong>
                            <span>Accuracy</span>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }
    
    getCategoryTitle(category) {
        const titles = {
            'alphabets': 'ASL Alphabet',
            'numbers': 'ASL Numbers',
            'words': 'Common Words'
        };
        return titles[category] || category;
    }
}

// Initialize dashboard when page loads
document.addEventListener('DOMContentLoaded', () => {
    new DashboardManager();
});
