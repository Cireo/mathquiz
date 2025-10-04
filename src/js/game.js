/**
 * Game - Main game controller that coordinates all game components
 * Manages game state, progression, scoring, and component interactions
 */
class Game {
    constructor() {
        this.mathEngine = new MathEngine();
        this.storage = new Storage();
        this.animations = new Animations();
        
        // Initialize minigame
        this.minigame = new Minigame(this);
        
        // Initialize lessons system
        this.lessons = new LessonsManager(this);
        
        // Initialize UI after other components
        this.ui = new UIController(this);
        
        // Game state
        this.currentProblem = null;
        this.gameState = {
            score: 0,
            streak: 0,
            bestStreak: 0,
            level: 1,
            problemsSolved: 0,
            correctAnswers: 0,
            difficulty: 'beginner',
            isActive: false,
            startTime: null,
            problemsPerLevel: 10,
            currentLevelProgress: 0
        };

        // Load saved settings
        this.loadSettings();
        
        // Initialize achievements system
        this.achievements = this.initializeAchievements();
        
        // Check if player name exists and show appropriate screen
        this.initializePlayerName();
        
        console.log('🎮 Math Quiz Game initialized!');
    }

    /**
     * Initialize player name and show appropriate screen
     */
    initializePlayerName() {
        const playerName = this.storage.getPlayerName();
        
        if (playerName && playerName.trim() !== '') {
            // Player name exists, update displays and show welcome screen
            this.ui.updatePlayerNameDisplays(playerName);
            this.ui.updateAllCharacterDisplays(); // Update character displays
            this.ui.showWelcomeScreen();
        } else {
            // No player name, show name input screen
            this.ui.showNameInputScreen();
        }
    }

    /**
     * Load user settings from storage
     */
    loadSettings() {
        const settings = this.storage.getSettings();
        this.animations.setEnabled(settings.animationsEnabled);
        
        // Set last used difficulty as default
        this.gameState.difficulty = settings.lastDifficulty || 'beginner';
    }

    /**
     * Initialize achievements system
     * @returns {Array} Available achievements
     */
    initializeAchievements() {
        return [
            { id: 'first_correct', name: 'First Success!', description: 'Answer your first problem correctly', icon: '⭐' },
            { id: 'streak_5', name: 'Hot Streak!', description: 'Get 5 answers in a row', icon: '🔥' },
            { id: 'streak_10', name: 'On Fire!', description: 'Get 10 answers in a row', icon: '🚀' },
            { id: 'level_5', name: 'Rising Star!', description: 'Reach level 5', icon: '🌟' },
            { id: 'score_100', name: 'Century!', description: 'Score 100 points', icon: '💯' },
            { id: 'fast_learner', name: 'Quick Thinker!', description: 'Answer 3 problems in under 30 seconds', icon: '⚡' },
            { id: 'math_master', name: 'Math Master!', description: 'Complete all difficulty levels', icon: '👑' }
        ];
    }

    /**
     * Start a new game with specified difficulty
     * @param {string} difficulty - Difficulty level (beginner, intermediate, advanced)
     */
    startGame(difficulty = 'beginner') {
        try {
            // Set difficulty and update math engine
            this.gameState.difficulty = difficulty;
            this.mathEngine.setDifficulty(difficulty);
            
            // Reset game state
            this.resetGameState();
            this.gameState.isActive = true;
            this.gameState.startTime = Date.now();
            
            // Generate first problem
            this.generateNewProblem();
            
            // Update UI
            this.updateUI();
            
            // Save difficulty preference
            this.storage.updateSettings({ lastDifficulty: difficulty });
            
            console.log(`🎯 Game started on ${difficulty} difficulty!`);
            
        } catch (error) {
            console.error('Error starting game:', error);
            this.handleGameError(error);
        }
    }

    /**
     * End the current game and clean up state
     */
    endGame() {
        if (this.gameState.isActive) {
            // Update final statistics
            this.updateStatistics();
            
            // Mark game as inactive
            this.gameState.isActive = false;
            
            // Clear any active timers or intervals
            this.clearGameTimers();
            
            // Save game data with final state
            const gameData = this.storage.loadGameData();
            gameData.lastPlayed = Date.now();
            this.storage.saveGameData(gameData);
            
            console.log('🎮 Game ended and state cleaned up');
        }
    }

    /**
     * Clear any active game timers
     */
    clearGameTimers() {
        // Clear any setTimeout/setInterval if they exist
        // This is a placeholder for any future timer cleanup
        // Currently no persistent timers to clear
    }

    /**
     * Reset game state to initial values
     */
    resetGameState() {
        this.gameState = {
            ...this.gameState,
            score: 0,
            streak: 0,
            level: 1,
            problemsSolved: 0,
            correctAnswers: 0,
            isActive: false,
            startTime: null,
            currentLevelProgress: 0
        };
    }

    /**
     * Generate a new math problem
     */
    generateNewProblem() {
        try {
            this.currentProblem = this.mathEngine.generateProblem();
            this.ui.displayProblem(this.currentProblem.question);
            this.ui.clearFeedback();
            this.ui.focusAnswerInput();
            
        } catch (error) {
            console.error('Error generating problem:', error);
            this.handleGameError(error);
        }
    }

    /**
     * Submit an answer for the current problem
     * @param {number} userAnswer - User's answer
     */
    submitAnswer(userAnswer) {
        if (!this.gameState.isActive || !this.currentProblem) {
            return;
        }

        const isCorrect = this.mathEngine.validateAnswer(
            userAnswer, 
            this.currentProblem.answer
        );

        // Update statistics
        this.gameState.problemsSolved++;
        
        if (isCorrect) {
            this.handleCorrectAnswer(userAnswer);
        } else {
            this.handleIncorrectAnswer(userAnswer);
        }

        // Update storage statistics
        this.updateStorageStats(isCorrect);
        
        // Check for achievements
        this.checkAchievements();
        
        // Update UI
        this.updateUI();
        
        // Generate next problem after delay
        setTimeout(() => {
            if (this.gameState.isActive) {
                this.generateNewProblem();
                // Ensure input is focused after problem generation and any animations
                setTimeout(() => {
                    this.ui.focusAnswerInput();
                }, 100);
            }
        }, 2000);
    }

    /**
     * Handle correct answer
     * @param {number} userAnswer - User's correct answer
     */
    handleCorrectAnswer(userAnswer) {
        this.gameState.correctAnswers++;
        this.gameState.streak++;
        
        // Update best streak
        if (this.gameState.streak > this.gameState.bestStreak) {
            this.gameState.bestStreak = this.gameState.streak;
        }

        // Calculate points based on difficulty and streak
        const basePoints = this.getBasePoints();
        const streakBonus = Math.floor(this.gameState.streak / 3) * 2;
        const points = basePoints + streakBonus;
        
        this.gameState.score += points;
        this.gameState.currentLevelProgress++;

        // Show feedback and effects
        this.ui.showCorrectAnswer(userAnswer); // Replace ? with actual answer
        this.ui.showFeedback(true);
        this.ui.showFloatingPoints(points);
        
        // Animate score and streak
        if (this.animations.isAnimationEnabled()) {
            this.animations.animateScoreIncrease(this.ui.elements.scoreElement, this.gameState.score);
            this.animations.animateStreak(this.ui.elements.streakElement, this.gameState.streak);
            
            // Special effects for big streaks
            if (this.gameState.streak >= 5 && this.gameState.streak % 5 === 0) {
                this.ui.celebrate('big_streak');
            }
        }

        // Check for level up
        this.checkLevelUp();

        console.log(`✅ Correct! Score: ${this.gameState.score}, Streak: ${this.gameState.streak}`);
    }

    /**
     * Handle incorrect answer
     * @param {number} userAnswer - User's incorrect answer
     */
    handleIncorrectAnswer(userAnswer) {
        this.gameState.streak = 0; // Reset streak
        
        // Show feedback
        this.ui.showFeedback(false, this.currentProblem.answer);
        
        // Shake animation for incorrect answer
        if (this.animations.isAnimationEnabled()) {
            this.animations.addAnimation(this.ui.elements.answerInput, 'shake', 600);
        }

        console.log(`❌ Incorrect. Answer was: ${this.currentProblem.answer}`);
    }

    /**
     * Get base points for current difficulty
     * @returns {number} Base points value
     */
    getBasePoints() {
        const pointsMap = {
            beginner: 10,
            intermediate: 15,
            advanced: 20
        };
        return pointsMap[this.gameState.difficulty] || 10;
    }

    /**
     * Check if player should level up
     */
    checkLevelUp() {
        if (this.gameState.currentLevelProgress >= this.gameState.problemsPerLevel) {
            this.triggerMinigame();
        }
    }

    /**
     * Trigger minigame at end of level
     */
    triggerMinigame() {
        // Pause main game temporarily
        this.gameState.isActive = false;
        
        // Show level completion message briefly
        if (this.animations.isAnimationEnabled()) {
            this.animations.showLevelUp(this.gameState.level + 1);
        }
        
        // Start minigame after short delay
        setTimeout(() => {
            this.minigame.startMinigame(this.gameState.difficulty);
        }, 2000);
        
        console.log(`🎯 Level ${this.gameState.level} completed! Starting minigame...`);
    }

    /**
     * Handle level up (called after minigame completion)
     */
    levelUp() {
        this.gameState.level++;
        this.gameState.currentLevelProgress = 0;
        this.gameState.isActive = true; // Resume main game
        
        console.log(`🎉 Advanced to level ${this.gameState.level}!`);
    }

    /**
     * Update storage statistics
     * @param {boolean} isCorrect - Whether answer was correct
     */
    updateStorageStats(isCorrect) {
        this.storage.updateStatistics({
            totalProblems: 1,
            correctAnswers: isCorrect ? 1 : 0,
            streakRecord: this.gameState.bestStreak,
            operation: this.currentProblem.operation,
            correct: isCorrect
        });
    }

    /**
     * Check and award achievements
     */
    checkAchievements() {
        const earned = [];

        // First correct answer
        if (this.gameState.correctAnswers === 1) {
            earned.push(this.achievements.find(a => a.id === 'first_correct'));
        }

        // Streak achievements
        if (this.gameState.streak === 5) {
            earned.push(this.achievements.find(a => a.id === 'streak_5'));
        } else if (this.gameState.streak === 10) {
            earned.push(this.achievements.find(a => a.id === 'streak_10'));
        }

        // Level achievements
        if (this.gameState.level === 5) {
            earned.push(this.achievements.find(a => a.id === 'level_5'));
        }

        // Score achievements
        if (this.gameState.score >= 100 && !this.storage.hasAchievement('score_100')) {
            earned.push(this.achievements.find(a => a.id === 'score_100'));
        }

        // Award new achievements
        earned.filter(Boolean).forEach(achievement => {
            this.awardAchievement(achievement);
        });
    }

    /**
     * Award an achievement
     * @param {Object} achievement - Achievement object
     */
    awardAchievement(achievement) {
        this.storage.addAchievement(achievement);
        this.ui.showAchievement(achievement);
        console.log(`🏆 Achievement earned: ${achievement.name}`);
    }

    /**
     * Update all UI elements
     */
    updateUI() {
        this.ui.updateGameStats({
            score: this.gameState.score,
            streak: this.gameState.streak,
            level: this.gameState.level
        });

        // Update progress bar
        const progress = (this.gameState.currentLevelProgress / this.gameState.problemsPerLevel) * 100;
        console.log(`Progress: ${this.gameState.currentLevelProgress}/${this.gameState.problemsPerLevel} = ${progress}%`);
        this.ui.updateProgressBar(progress);
    }

    /**
     * End the current game
     */
    endGame() {
        if (!this.gameState.isActive) return;

        this.gameState.isActive = false;
        
        // Calculate final statistics
        const finalStats = {
            score: this.gameState.score,
            bestStreak: this.gameState.bestStreak,
            problemsSolved: this.gameState.problemsSolved,
            accuracy: this.gameState.problemsSolved > 0 ? 
                Math.round((this.gameState.correctAnswers / this.gameState.problemsSolved) * 100) : 0,
            timeSpent: Date.now() - this.gameState.startTime
        };

        // Update high score
        const isNewHighScore = this.storage.updateHighScore(
            this.gameState.difficulty, 
            this.gameState.score
        );

        if (isNewHighScore) {
            this.ui.celebrate('high_score');
            console.log('🎊 New high score!');
        }

        // Update results screen and show it
        this.ui.updateResultsScreen(finalStats);
        this.ui.showResultsScreen();

        console.log('🏁 Game ended!', finalStats);
    }

    /**
     * Restart the current game
     */
    restartGame() {
        this.startGame(this.gameState.difficulty);
    }

    /**
     * Reset game completely
     */
    resetGame() {
        this.gameState.isActive = false;
        this.currentProblem = null;
        this.ui.clearFeedback();
        this.ui.clearAnswerInput();
    }

    /**
     * Handle game errors gracefully
     * @param {Error} error - Error object
     */
    handleGameError(error) {
        console.error('Game error:', error);
        this.ui.showFeedback(false, 'Something went wrong. Please try again.');
        
        // Reset to safe state
        this.gameState.isActive = false;
    }

    /**
     * Get current game statistics
     * @returns {Object} Current game statistics
     */
    getGameStats() {
        return {
            ...this.gameState,
            accuracy: this.gameState.problemsSolved > 0 ? 
                Math.round((this.gameState.correctAnswers / this.gameState.problemsSolved) * 100) : 0
        };
    }

    /**
     * Get all-time statistics from storage
     * @returns {Object} All-time statistics
     */
    getAllTimeStats() {
        return this.storage.getStatistics();
    }

    /**
     * Get high scores
     * @returns {Object} High scores for all difficulties
     */
    getHighScores() {
        return this.storage.getHighScores();
    }

    /**
     * Toggle animations on/off
     * @param {boolean} enabled - Whether animations should be enabled
     */
    toggleAnimations(enabled) {
        this.animations.setEnabled(enabled);
        this.storage.updateSettings({ animationsEnabled: enabled });
    }
}

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.mathQuizGame = new Game();
    console.log('🎮 Math Quiz Game ready to play!');
});

// Export for use in other modules or testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Game;
}
