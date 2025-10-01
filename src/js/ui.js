/**
 * UIController - Handles all user interface interactions and updates
 * Manages screen transitions, user input, and display updates
 */
class UIController {
    constructor(gameInstance) {
        this.game = gameInstance;
        this.elements = this.initializeElements();
        
        // Secret easter egg tracking
        this.secretFireClicks = 0;
        this.secretClickTimer = null;
        
        this.bindEvents();
    }

    /**
     * Initialize all DOM elements and cache references
     * @returns {Object} Object containing element references
     */
    initializeElements() {
        return {
            // Screens
            welcomeScreen: document.getElementById('welcome-screen'),
            gameScreen: document.getElementById('game-screen'),
            resultsScreen: document.getElementById('results-screen'),

            // Welcome screen elements
            difficultyButtons: document.querySelectorAll('.difficulty-btn'),

            // Game screen elements
            scoreElement: document.getElementById('score'),
            streakElement: document.getElementById('streak'),
            levelElement: document.getElementById('level'),
            progressBar: document.getElementById('progress-bar'),
            problemElement: document.getElementById('problem'),
            answerInput: document.getElementById('answer-input'),
            submitButton: document.getElementById('submit-btn'),
            feedbackElement: document.getElementById('feedback'),
            achievementElement: document.getElementById('achievement'),
            streakFireElement: document.getElementById('streak-fire'),

            // Results screen elements
            finalScoreElement: document.getElementById('final-score'),
            bestStreakElement: document.getElementById('best-streak'),
            problemsSolvedElement: document.getElementById('problems-solved'),
            playAgainButton: document.getElementById('play-again-btn'),
            changeLevelButton: document.getElementById('change-level-btn'),
            continueQuestButton: document.getElementById('continue-quest-btn')
        };
    }

    /**
     * Bind all event listeners
     */
    bindEvents() {
        // Difficulty selection
        this.elements.difficultyButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const difficulty = e.target.dataset.level;
                this.handleDifficultySelection(difficulty);
            });
        });

        // Answer input handling
        this.elements.answerInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.handleSubmit();
            }
        });

        this.elements.answerInput.addEventListener('input', (e) => {
            this.handleAnswerInput(e);
        });

        // Submit button
        this.elements.submitButton.addEventListener('click', () => {
            this.handleSubmit();
        });

        // Results screen buttons
        this.elements.playAgainButton.addEventListener('click', () => {
            this.handlePlayAgain();
        });

        this.elements.changeLevelButton.addEventListener('click', () => {
            this.handleChangeLevel();
        });

        this.elements.continueQuestButton.addEventListener('click', () => {
            this.handleContinueQuest();
        });

        // Secret easter egg: Fire click counter
        if (this.elements.streakFireElement) {
            this.elements.streakFireElement.addEventListener('click', (e) => {
                this.handleSecretFireClick(e);
            });
        }

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            this.handleKeyboardShortcuts(e);
        });

        // Prevent form submission on enter (except for answer inputs and buttons)
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && 
                e.target.tagName !== 'BUTTON' && 
                e.target.id !== 'answer-input' && 
                e.target.id !== 'minigame-answer') {
                e.preventDefault();
            }
        });
    }

    /**
     * Handle difficulty selection
     * @param {string} difficulty - Selected difficulty level
     */
    handleDifficultySelection(difficulty) {
        if (this.game && typeof this.game.startGame === 'function') {
            this.game.startGame(difficulty);
        }
        this.showGameScreen();
    }

    /**
     * Handle answer input changes
     * @param {Event} e - Input event
     */
    handleAnswerInput(e) {
        const value = e.target.value;
        const isValid = value !== '' && !isNaN(Number(value));
        
        // Enable/disable submit button based on input
        this.elements.submitButton.disabled = !isValid;
        
        // Add visual feedback
        if (isValid) {
            this.elements.answerInput.style.borderColor = '#4299e1';
        } else {
            this.elements.answerInput.style.borderColor = '#e2e8f0';
        }
    }

    /**
     * Handle answer submission
     */
    handleSubmit() {
        const answer = this.elements.answerInput.value.trim();
        
        if (answer === '' || isNaN(Number(answer))) {
            this.showInputError();
            return;
        }

        const numericAnswer = Number(answer);
        
        if (this.game && typeof this.game.submitAnswer === 'function') {
            this.game.submitAnswer(numericAnswer);
        }
        
        // Clear input for next problem
        this.elements.answerInput.value = '';
        this.elements.submitButton.disabled = true;
        this.elements.answerInput.style.borderColor = '#e2e8f0';
    }

    /**
     * Handle play again button
     */
    handlePlayAgain() {
        if (this.game && typeof this.game.restartGame === 'function') {
            this.game.restartGame();
        }
        this.showGameScreen();
    }

    /**
     * Handle change level button
     */
    handleChangeLevel() {
        this.showWelcomeScreen();
        if (this.game && typeof this.game.resetGame === 'function') {
            this.game.resetGame();
        }
    }

    /**
     * Handle continue quest button (after minigame or level completion)
     */
    handleContinueQuest() {
        if (this.game && typeof this.game.restartGame === 'function') {
            // Continue with current difficulty level
            this.game.restartGame();
        }
        this.showGameScreen();
    }

    /**
     * Handle secret fire click easter egg
     * @param {Event} e - Click event
     */
    handleSecretFireClick(e) {
        e.preventDefault();
        e.stopPropagation();

        // Increment click counter
        this.secretFireClicks++;
        
        // Visual feedback for each click
        this.elements.streakFireElement.classList.add('secret-active');
        setTimeout(() => {
            this.elements.streakFireElement.classList.remove('secret-active');
        }, 300);

        // Reset timer - user has 3 seconds between clicks
        if (this.secretClickTimer) {
            clearTimeout(this.secretClickTimer);
        }
        
        this.secretClickTimer = setTimeout(() => {
            this.secretFireClicks = 0;
        }, 3000);

        // Check if secret activated
        if (this.secretFireClicks >= 5) {
            this.activateSecretBattle();
        }

        console.log(`🔥 Secret fire clicks: ${this.secretFireClicks}/5`);
    }

    /**
     * Activate secret battle minigame
     */
    activateSecretBattle() {
        // Reset click counter
        this.secretFireClicks = 0;
        if (this.secretClickTimer) {
            clearTimeout(this.secretClickTimer);
        }

        // Show special activation message
        this.showSecretActivationFeedback();
        
        // Trigger minigame after short delay
        setTimeout(() => {
            if (this.game && this.game.minigame) {
                // Use current difficulty or default to intermediate for secret battles
                const difficulty = this.game.gameState.difficulty || 'intermediate';
                this.game.minigame.startMinigame(difficulty);
                
                console.log('🎉 Secret battle activated! 🦊⚔️🧙‍♀️');
            }
        }, 1500);
    }

    /**
     * Show special feedback for secret activation
     */
    showSecretActivationFeedback() {
        // Create special secret activation message
        const secretMessage = document.createElement('div');
        secretMessage.className = 'secret-activation-message';
        secretMessage.innerHTML = '🔥✨ SECRET BATTLE UNLOCKED! ✨🔥<br/>🦊 Player vs Math Witch! 🧙‍♀️';
        
        // Style it
        secretMessage.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: linear-gradient(135deg, #ff6b6b 0%, #feca57 50%, #48dbfb 100%);
            color: white;
            padding: 30px;
            border-radius: 20px;
            font-size: 1.5rem;
            font-weight: bold;
            text-align: center;
            z-index: 10000;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
            animation: zoomIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
        `;
        
        document.body.appendChild(secretMessage);
        
        // Create fire particles around the message
        if (this.game && this.game.animations) {
            this.game.animations.celebrate('secret_battle');
        }

        // Remove message after delay
        setTimeout(() => {
            if (secretMessage.parentNode) {
                secretMessage.parentNode.removeChild(secretMessage);
            }
        }, 2000);
    }

    /**
     * Handle keyboard shortcuts
     * @param {KeyboardEvent} e - Keyboard event
     */
    handleKeyboardShortcuts(e) {
        // Space to submit (if input has value)
        if (e.code === 'Space' && this.elements.answerInput.value && 
            document.activeElement !== this.elements.answerInput) {
            e.preventDefault();
            this.handleSubmit();
        }

        // Escape to go back to welcome screen
        if (e.key === 'Escape') {
            this.handleChangeLevel();
        }
    }

    /**
     * Show input error animation
     */
    showInputError() {
        this.elements.answerInput.style.borderColor = '#f56565';
        this.elements.answerInput.focus();
        
        if (this.game && this.game.animations) {
            this.game.animations.addAnimation(this.elements.answerInput, 'shake', 600);
        }
        
        // Reset border color after animation
        setTimeout(() => {
            this.elements.answerInput.style.borderColor = '#e2e8f0';
        }, 600);
    }

    /**
     * Show welcome screen
     */
    showWelcomeScreen() {
        this.hideAllScreens();
        this.elements.welcomeScreen.classList.add('active');
        
        if (this.game && this.game.animations) {
            this.game.animations.transitionScreen(null, this.elements.welcomeScreen);
        }
    }

    /**
     * Show game screen
     */
    showGameScreen() {
        this.hideAllScreens();
        this.elements.gameScreen.classList.add('active');
        this.elements.answerInput.focus();
        
        if (this.game && this.game.animations) {
            this.game.animations.transitionScreen(null, this.elements.gameScreen);
        }
    }

    /**
     * Show results screen
     */
    showResultsScreen() {
        this.hideAllScreens();
        this.elements.resultsScreen.classList.add('active');
        
        if (this.game && this.game.animations) {
            this.game.animations.transitionScreen(null, this.elements.resultsScreen);
        }
    }

    /**
     * Hide all screens
     */
    hideAllScreens() {
        this.elements.welcomeScreen.classList.remove('active');
        this.elements.gameScreen.classList.remove('active');
        this.elements.resultsScreen.classList.remove('active');
    }

    /**
     * Update game statistics display
     * @param {Object} stats - Game statistics
     */
    updateGameStats(stats) {
        if (this.elements.scoreElement) {
            this.elements.scoreElement.textContent = stats.score || 0;
        }

        if (this.elements.streakElement) {
            this.elements.streakElement.textContent = stats.streak || 0;
        }

        if (this.elements.levelElement) {
            this.elements.levelElement.textContent = stats.level || 1;
        }
    }

    /**
     * Update progress bar
     * @param {number} percentage - Progress percentage (0-100)
     */
    updateProgressBar(percentage) {
        if (this.elements.progressBar) {
            this.elements.progressBar.style.width = Math.min(100, Math.max(0, percentage)) + '%';
        }
    }

    /**
     * Display new problem
     * @param {string} problemText - Problem to display
     */
    displayProblem(problemText) {
        if (this.elements.problemElement) {
            if (this.game && this.game.animations) {
                this.game.animations.animateProblemTransition(this.elements.problemElement, problemText);
            } else {
                this.elements.problemElement.textContent = problemText;
            }
        }
    }

    /**
     * Show feedback for answer
     * @param {boolean} isCorrect - Whether answer was correct
     * @param {number} correctAnswer - The correct answer (for incorrect responses)
     */
    showFeedback(isCorrect, correctAnswer = null) {
        if (!this.elements.feedbackElement) return;

        if (this.game && this.game.animations) {
            if (isCorrect) {
                this.game.animations.showCorrectAnswer(this.elements.feedbackElement);
            } else {
                this.game.animations.showIncorrectAnswer(this.elements.feedbackElement, correctAnswer);
            }
        } else {
            // Fallback without animations
            if (isCorrect) {
                this.elements.feedbackElement.textContent = 'Correct! 🎉';
                this.elements.feedbackElement.className = 'feedback correct';
            } else {
                this.elements.feedbackElement.textContent = `Not quite. The answer is ${correctAnswer}.`;
                this.elements.feedbackElement.className = 'feedback incorrect';
            }
        }
    }

    /**
     * Clear feedback display
     */
    clearFeedback() {
        if (this.elements.feedbackElement) {
            this.elements.feedbackElement.textContent = '';
            this.elements.feedbackElement.className = 'feedback';
        }
    }

    /**
     * Update results screen with final statistics
     * @param {Object} finalStats - Final game statistics
     */
    updateResultsScreen(finalStats) {
        if (this.elements.finalScoreElement) {
            this.elements.finalScoreElement.textContent = finalStats.score || 0;
        }

        if (this.elements.bestStreakElement) {
            this.elements.bestStreakElement.textContent = finalStats.bestStreak || 0;
        }

        if (this.elements.problemsSolvedElement) {
            this.elements.problemsSolvedElement.textContent = finalStats.problemsSolved || 0;
        }
    }

    /**
     * Show achievement notification
     * @param {Object} achievement - Achievement object
     */
    showAchievement(achievement) {
        if (this.game && this.game.animations) {
            this.game.animations.showAchievement(achievement);
        }
    }

    /**
     * Focus on answer input
     */
    focusAnswerInput() {
        if (this.elements.answerInput) {
            this.elements.answerInput.focus();
        }
    }

    /**
     * Enable or disable submit button
     * @param {boolean} enabled - Whether button should be enabled
     */
    setSubmitButtonEnabled(enabled) {
        if (this.elements.submitButton) {
            this.elements.submitButton.disabled = !enabled;
        }
    }

    /**
     * Get current answer input value
     * @returns {string} Current input value
     */
    getAnswerInputValue() {
        return this.elements.answerInput ? this.elements.answerInput.value.trim() : '';
    }

    /**
     * Clear answer input
     */
    clearAnswerInput() {
        if (this.elements.answerInput) {
            this.elements.answerInput.value = '';
            this.setSubmitButtonEnabled(false);
        }
    }

    /**
     * Add visual emphasis to streak counter
     * @param {number} streak - Current streak value
     */
    emphasizeStreak(streak) {
        if (this.game && this.game.animations) {
            this.game.animations.animateStreak(this.elements.streakElement, streak);
        }
    }

    /**
     * Create floating points effect
     * @param {number} points - Points to display
     */
    showFloatingPoints(points) {
        if (this.game && this.game.animations && this.elements.scoreElement) {
            this.game.animations.createFloatingPoints(this.elements.scoreElement, points);
        }
    }

    /**
     * Show confetti celebration
     * @param {string} type - Type of celebration
     */
    celebrate(type = 'default') {
        if (this.game && this.game.animations) {
            this.game.animations.celebrate(type);
        }
    }

    /**
     * Update difficulty button highlighting
     * @param {string} selectedDifficulty - Currently selected difficulty
     */
    updateDifficultySelection(selectedDifficulty) {
        this.elements.difficultyButtons.forEach(button => {
            if (button.dataset.level === selectedDifficulty) {
                button.classList.add('selected');
            } else {
                button.classList.remove('selected');
            }
        });
    }

    /**
     * Get the currently visible screen
     * @returns {string} Name of currently visible screen
     */
    getCurrentScreen() {
        if (this.elements.welcomeScreen.classList.contains('active')) return 'welcome';
        if (this.elements.gameScreen.classList.contains('active')) return 'game';
        if (this.elements.resultsScreen.classList.contains('active')) return 'results';
        return 'none';
    }

    /**
     * Handle window resize for responsive design
     */
    handleResize() {
        // Update any responsive elements if needed
        // This is a placeholder for future responsive adjustments
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UIController;
}
