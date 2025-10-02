/**
 * Storage - Handles local storage operations for game data persistence
 * Provides clean interface for saving/loading game progress and settings
 */
class Storage {
    constructor() {
        this.storageKey = 'mathQuizGame';
        this.defaultData = {
            playerName: '',
            highScores: {
                beginner: 0,
                intermediate: 0,
                advanced: 0
            },
            achievements: [],
            settings: {
                soundEnabled: true,
                animationsEnabled: true,
                lastDifficulty: 'beginner'
            },
            statistics: {
                totalProblems: 0,
                correctAnswers: 0,
                streakRecord: 0,
                timeSpent: 0,
                operationStats: {
                    addition: { correct: 0, total: 0 },
                    subtraction: { correct: 0, total: 0 },
                    multiplication: { correct: 0, total: 0 },
                    division: { correct: 0, total: 0 }
                }
            },
            lastPlayed: null
        };
    }

    /**
     * Check if localStorage is available
     * @returns {boolean} True if localStorage is available
     */
    isStorageAvailable() {
        try {
            const testKey = 'localStorage_test';
            localStorage.setItem(testKey, 'test');
            localStorage.removeItem(testKey);
            return true;
        } catch (error) {
            console.warn('localStorage not available:', error);
            return false;
        }
    }

    /**
     * Load all game data from storage
     * @returns {Object} Game data object
     */
    loadGameData() {
        if (!this.isStorageAvailable()) {
            return this.defaultData;
        }

        try {
            const stored = localStorage.getItem(this.storageKey);
            if (!stored) {
                return this.defaultData;
            }

            const data = JSON.parse(stored);
            // Merge with default data to handle missing properties
            return this.mergeWithDefaults(data);
        } catch (error) {
            console.error('Error loading game data:', error);
            return this.defaultData;
        }
    }

    /**
     * Save game data to storage
     * @param {Object} data - Game data to save
     * @returns {boolean} True if save was successful
     */
    saveGameData(data) {
        if (!this.isStorageAvailable()) {
            console.warn('Cannot save: localStorage not available');
            return false;
        }

        try {
            data.lastPlayed = new Date().toISOString();
            localStorage.setItem(this.storageKey, JSON.stringify(data));
            return true;
        } catch (error) {
            console.error('Error saving game data:', error);
            return false;
        }
    }

    /**
     * Merge stored data with default data structure
     * @param {Object} stored - Data from storage
     * @returns {Object} Merged data object
     */
    mergeWithDefaults(stored) {
        const merged = JSON.parse(JSON.stringify(this.defaultData));
        
        // Merge high scores
        if (stored.highScores) {
            Object.assign(merged.highScores, stored.highScores);
        }

        // Merge achievements
        if (Array.isArray(stored.achievements)) {
            merged.achievements = stored.achievements;
        }

        // Merge settings
        if (stored.settings) {
            Object.assign(merged.settings, stored.settings);
        }

        // Merge statistics
        if (stored.statistics) {
            Object.assign(merged.statistics, stored.statistics);
            
            // Merge operation stats
            if (stored.statistics.operationStats) {
                Object.assign(merged.statistics.operationStats, stored.statistics.operationStats);
            }
        }

        // Preserve last played date
        if (stored.lastPlayed) {
            merged.lastPlayed = stored.lastPlayed;
        }

        return merged;
    }

    /**
     * Update high score for a difficulty level
     * @param {string} difficulty - Difficulty level
     * @param {number} score - New score
     * @returns {boolean} True if it's a new high score
     */
    updateHighScore(difficulty, score) {
        const data = this.loadGameData();
        const currentHigh = data.highScores[difficulty] || 0;
        
        if (score > currentHigh) {
            data.highScores[difficulty] = score;
            this.saveGameData(data);
            return true; // New high score!
        }
        
        return false;
    }

    /**
     * Add an achievement
     * @param {Object} achievement - Achievement object
     */
    addAchievement(achievement) {
        const data = this.loadGameData();
        
        // Check if achievement already exists
        const exists = data.achievements.some(a => 
            a.id === achievement.id || a.name === achievement.name
        );
        
        if (!exists) {
            achievement.dateEarned = new Date().toISOString();
            data.achievements.push(achievement);
            this.saveGameData(data);
        }
    }

    /**
     * Update game statistics
     * @param {Object} stats - Statistics to update
     */
    updateStatistics(stats) {
        const data = this.loadGameData();
        
        // Update general stats
        if (stats.totalProblems) {
            data.statistics.totalProblems += stats.totalProblems;
        }
        
        if (stats.correctAnswers) {
            data.statistics.correctAnswers += stats.correctAnswers;
        }
        
        if (stats.streakRecord && stats.streakRecord > data.statistics.streakRecord) {
            data.statistics.streakRecord = stats.streakRecord;
        }
        
        if (stats.timeSpent) {
            data.statistics.timeSpent += stats.timeSpent;
        }

        // Update operation-specific stats
        if (stats.operation) {
            const opStats = data.statistics.operationStats[stats.operation];
            if (opStats) {
                opStats.total += 1;
                if (stats.correct) {
                    opStats.correct += 1;
                }
            }
        }

        this.saveGameData(data);
    }

    /**
     * Update user settings
     * @param {Object} settings - Settings to update
     */
    updateSettings(settings) {
        const data = this.loadGameData();
        Object.assign(data.settings, settings);
        this.saveGameData(data);
    }

    /**
     * Set player name
     * @param {string} name - Player's name
     */
    setPlayerName(name) {
        const data = this.loadGameData();
        data.playerName = name;
        this.saveGameData(data);
    }
    
    /**
     * Get player name
     * @returns {string} Player's name or empty string
     */
    getPlayerName() {
        const data = this.loadGameData();
        return data.playerName || '';
    }
    
    /**
     * Get display name with easter egg for special names
     * @returns {string} Player's name with potential accent modification
     */
    getDisplayName() {
        const name = this.getPlayerName();
        if (!name) return '';
        
        // Easter egg: if name hashes to a special value, add accent to first 'e'
        if (this.hashName(name.toLowerCase()) === 93492646) {
            return name.replace(/e/, 'é');
        }
        
        return name;
    }
    
    /**
     * Create a simple hash of a name for easter egg detection
     * @param {string} name - Name to hash
     * @returns {number} Simple hash value
     */
    hashName(name) {
        let hash = 0;
        for (let i = 0; i < name.length; i++) {
            const char = name.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return hash;
    }

    /**
     * Get high scores for all difficulties
     * @returns {Object} High scores object
     */
    getHighScores() {
        const data = this.loadGameData();
        return data.highScores;
    }

    /**
     * Get all achievements
     * @returns {Array} Array of achievement objects
     */
    getAchievements() {
        const data = this.loadGameData();
        return data.achievements;
    }

    /**
     * Check if a specific achievement has been earned
     * @param {string} achievementId - The ID of the achievement to check
     * @returns {boolean} True if achievement has been earned
     */
    hasAchievement(achievementId) {
        const data = this.loadGameData();
        return data.achievements.some(achievement => achievement.id === achievementId);
    }

    /**
     * Get user settings
     * @returns {Object} Settings object
     */
    getSettings() {
        const data = this.loadGameData();
        return data.settings;
    }

    /**
     * Get game statistics
     * @returns {Object} Statistics object
     */
    getStatistics() {
        const data = this.loadGameData();
        return data.statistics;
    }

    /**
     * Calculate accuracy percentage
     * @returns {number} Accuracy as percentage
     */
    getAccuracy() {
        const stats = this.getStatistics();
        if (stats.totalProblems === 0) return 0;
        return Math.round((stats.correctAnswers / stats.totalProblems) * 100);
    }

    /**
     * Get operation-specific accuracy
     * @param {string} operation - Operation name
     * @returns {number} Accuracy as percentage
     */
    getOperationAccuracy(operation) {
        const stats = this.getStatistics();
        const opStats = stats.operationStats[operation];
        
        if (!opStats || opStats.total === 0) return 0;
        return Math.round((opStats.correct / opStats.total) * 100);
    }

    /**
     * Clear all stored data (reset game)
     * @returns {boolean} True if successful
     */
    clearAllData() {
        if (!this.isStorageAvailable()) {
            return false;
        }

        try {
            localStorage.removeItem(this.storageKey);
            return true;
        } catch (error) {
            console.error('Error clearing data:', error);
            return false;
        }
    }

    /**
     * Export game data as JSON string
     * @returns {string} JSON representation of game data
     */
    exportData() {
        const data = this.loadGameData();
        return JSON.stringify(data, null, 2);
    }

    /**
     * Import game data from JSON string
     * @param {string} jsonData - JSON string of game data
     * @returns {boolean} True if import was successful
     */
    importData(jsonData) {
        try {
            const data = JSON.parse(jsonData);
            const merged = this.mergeWithDefaults(data);
            return this.saveGameData(merged);
        } catch (error) {
            console.error('Error importing data:', error);
            return false;
        }
    }

    /**
     * Check if this is the player's first time
     * @returns {boolean} True if first time player
     */
    isFirstTime() {
        const data = this.loadGameData();
        return !data.lastPlayed;
    }

    /**
     * Get days since last played
     * @returns {number} Number of days since last played
     */
    getDaysSinceLastPlayed() {
        const data = this.loadGameData();
        if (!data.lastPlayed) return 0;
        
        const lastPlayed = new Date(data.lastPlayed);
        const now = new Date();
        const diffTime = Math.abs(now - lastPlayed);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        return diffDays;
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Storage;
}
