/**
 * Minigame - Fox vs Math Witch battle minigame
 * Triggered at the end of each level for bonus engagement
 */
class Minigame {
    constructor(gameInstance) {
        this.game = gameInstance;
        this.mathEngine = gameInstance.mathEngine;
        this.animations = gameInstance.animations;
        
        // Minigame state
        this.isActive = false;
        this.foxHealth = 100;
        this.spellsRemaining = 5;
        this.currentSpell = null;
        this.spellProjectiles = [];
        this.difficulty = 'beginner';
        this.spellSpeed = 4000; // milliseconds for spell to cross screen
        
        // DOM elements
        this.initializeElements();
        this.bindEvents();
    }

    /**
     * Initialize DOM elements for minigame
     */
    initializeElements() {
        this.elements = {
            screen: document.getElementById('minigame-screen'),
            foxHealthFill: document.getElementById('fox-health-fill'),
            spellsCount: document.getElementById('spells-count'),
            foxCharacter: document.getElementById('fox-character'),
            witchCharacter: document.getElementById('witch-character'),
            battleField: document.getElementById('battle-field'),
            answerInput: document.getElementById('minigame-answer'),
            currentSpellDisplay: document.getElementById('current-spell'),
            feedback: document.getElementById('minigame-feedback')
        };
    }

    /**
     * Bind minigame event listeners
     */
    bindEvents() {
        // Handle minigame answer input
        this.elements.answerInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.handleSpellDefense();
            }
        });

        this.elements.answerInput.addEventListener('input', () => {
            // Visual feedback on input
            if (this.elements.answerInput.value) {
                this.elements.answerInput.style.borderColor = '#4ecdc4';
            } else {
                this.elements.answerInput.style.borderColor = '#ffd700';
            }
        });
    }

    /**
     * Start the minigame with specified difficulty
     * @param {string} difficulty - Difficulty level from main game
     */
    startMinigame(difficulty = 'beginner') {
        this.difficulty = difficulty;
        this.isActive = true;
        this.foxHealth = 100;
        this.spellsRemaining = 5;
        this.spellProjectiles = [];
        
        // Adjust difficulty settings
        this.adjustDifficulty();
        
        // Reset UI
        this.updateUI();
        this.clearFeedback();
        
        // Show minigame screen
        this.showMinigameScreen();
        
        // Start the battle!
        this.castFirstSpell();
        
        console.log(`🦊⚔️🧙‍♀️ Minigame started on ${difficulty} difficulty!`);
    }

    /**
     * Adjust minigame settings based on difficulty
     */
    adjustDifficulty() {
        switch (this.difficulty) {
            case 'beginner':
                this.spellSpeed = 5000; // Slower spells
                this.spellsRemaining = 3;
                break;
            case 'intermediate':
                this.spellSpeed = 4000; // Normal speed
                this.spellsRemaining = 4;
                break;
            case 'advanced':
                this.spellSpeed = 3000; // Faster spells
                this.spellsRemaining = 5;
                break;
        }
    }

    /**
     * Show minigame screen with transition
     */
    showMinigameScreen() {
        // Hide other screens
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        
        // Show minigame screen
        this.elements.screen.classList.add('active');
        
        // Focus input
        setTimeout(() => {
            this.elements.answerInput.focus();
        }, 100);
    }

    /**
     * Cast the first spell to start battle
     */
    castFirstSpell() {
        if (this.spellsRemaining <= 0) {
            this.victory();
            return;
        }

        // Generate new math problem
        this.mathEngine.setDifficulty(this.difficulty);
        this.currentSpell = this.mathEngine.generateProblem();
        
        // Update display
        this.elements.currentSpellDisplay.textContent = `Incoming spell: ${this.currentSpell.question}`;
        this.elements.answerInput.value = '';
        this.elements.answerInput.focus();
        
        // Create spell projectile
        this.createSpellProjectile();
        
        // Animate witch casting
        this.animateWitchCast();
    }

    /**
     * Create a visual spell projectile
     */
    createSpellProjectile() {
        const projectile = document.createElement('div');
        projectile.className = 'spell-projectile';
        projectile.textContent = this.currentSpell.question;
        
        // Set animation duration based on difficulty
        projectile.style.animationDuration = `${this.spellSpeed}ms`;
        
        // Add to battle field
        this.elements.battleField.appendChild(projectile);
        this.spellProjectiles.push(projectile);
        
        // Auto-damage fox if spell isn't blocked in time
        setTimeout(() => {
            if (this.isActive && this.spellProjectiles.includes(projectile)) {
                this.spellHitsFox(projectile);
            }
        }, this.spellSpeed);
    }

    /**
     * Handle player's attempt to defend against spell
     */
    handleSpellDefense() {
        if (!this.isActive || !this.currentSpell) return;

        const playerAnswer = parseFloat(this.elements.answerInput.value);
        const isCorrect = this.mathEngine.validateAnswer(playerAnswer, this.currentSpell.answer);

        if (isCorrect) {
            this.spellDeflected();
        } else {
            this.showFeedback(false, this.currentSpell.answer);
            // Don't immediately cast next spell on wrong answer, give them time to try again
        }
    }

    /**
     * Handle successful spell deflection
     */
    spellDeflected() {
        // Remove current spell projectile
        this.removeCurrentSpellProjectile();
        
        // Show success feedback
        this.showFeedback(true);
        
        // Animate fox celebration
        this.animateFoxCelebrate();
        
        // Reduce remaining spells
        this.spellsRemaining--;
        this.updateUI();
        
        // Create magical deflection effect
        if (this.animations.isAnimationEnabled()) {
            this.animations.createSparkles(this.elements.foxCharacter, 12);
        }
        
        // Cast next spell or end game
        setTimeout(() => {
            if (this.spellsRemaining > 0) {
                this.castFirstSpell();
            } else {
                this.victory();
            }
        }, 1500);
    }

    /**
     * Handle spell hitting fox (wrong answer or timeout)
     */
    spellHitsFox(projectile = null) {
        if (projectile) {
            this.removeSpellProjectile(projectile);
        }
        
        // Reduce fox health
        this.foxHealth = Math.max(0, this.foxHealth - 25);
        this.updateUI();
        
        // Animate fox getting hurt
        this.animateFoxHurt();
        
        // Check if fox is defeated
        if (this.foxHealth <= 0) {
            this.defeat();
            return;
        }
        
        // Cast next spell
        setTimeout(() => {
            if (this.isActive && this.spellsRemaining > 0) {
                this.castFirstSpell();
            }
        }, 1000);
    }

    /**
     * Remove current spell projectile from screen
     */
    removeCurrentSpellProjectile() {
        const projectile = this.spellProjectiles.pop();
        if (projectile && projectile.parentNode) {
            projectile.style.animation = 'none';
            projectile.style.opacity = '0';
            setTimeout(() => {
                if (projectile.parentNode) {
                    projectile.parentNode.removeChild(projectile);
                }
            }, 300);
        }
    }

    /**
     * Remove specific spell projectile
     */
    removeSpellProjectile(projectile) {
        const index = this.spellProjectiles.indexOf(projectile);
        if (index > -1) {
            this.spellProjectiles.splice(index, 1);
        }
        
        if (projectile && projectile.parentNode) {
            projectile.parentNode.removeChild(projectile);
        }
    }

    /**
     * Show feedback for player's answer
     */
    showFeedback(isCorrect, correctAnswer = null) {
        if (isCorrect) {
            this.elements.feedback.textContent = '✨ Spell Deflected! ✨';
            this.elements.feedback.className = 'minigame-feedback correct';
        } else {
            this.elements.feedback.textContent = `💥 Spell Hit! Answer was ${correctAnswer}`;
            this.elements.feedback.className = 'minigame-feedback incorrect';
        }
        
        // Clear feedback after delay
        setTimeout(() => {
            this.clearFeedback();
        }, 1500);
    }

    /**
     * Clear feedback display
     */
    clearFeedback() {
        this.elements.feedback.textContent = '';
        this.elements.feedback.className = 'minigame-feedback';
    }

    /**
     * Update minigame UI elements
     */
    updateUI() {
        // Update health bar
        this.elements.foxHealthFill.style.width = this.foxHealth + '%';
        
        // Update spells remaining
        this.elements.spellsCount.textContent = this.spellsRemaining;
        
        // Change health bar color based on health level
        if (this.foxHealth > 50) {
            this.elements.foxHealthFill.style.background = 'linear-gradient(90deg, #4ecdc4 0%, #45b7d1 100%)';
        } else if (this.foxHealth > 25) {
            this.elements.foxHealthFill.style.background = 'linear-gradient(90deg, #feca57 0%, #ff9ff3 100%)';
        } else {
            this.elements.foxHealthFill.style.background = 'linear-gradient(90deg, #ff6b6b 0%, #ee5a52 100%)';
        }
    }

    /**
     * Animate fox celebration
     */
    animateFoxCelebrate() {
        if (this.animations.isAnimationEnabled()) {
            this.elements.foxCharacter.style.animation = 'characterCelebrate 0.8s ease-out';
            setTimeout(() => {
                this.elements.foxCharacter.style.animation = 'characterIdle 2s ease-in-out infinite';
            }, 800);
        }
    }

    /**
     * Animate fox hurt reaction
     */
    animateFoxHurt() {
        if (this.animations.isAnimationEnabled()) {
            this.elements.foxCharacter.style.animation = 'characterHurt 0.6s ease-out';
            setTimeout(() => {
                this.elements.foxCharacter.style.animation = 'characterIdle 2s ease-in-out infinite';
            }, 600);
        }
    }

    /**
     * Animate witch casting spell
     */
    animateWitchCast() {
        if (this.animations.isAnimationEnabled()) {
            this.elements.witchCharacter.style.animation = 'witchCast 0.5s ease-out';
            setTimeout(() => {
                this.elements.witchCharacter.style.animation = 'characterIdle 2s ease-in-out infinite';
            }, 500);
        }
    }

    /**
     * Handle minigame victory
     */
    victory() {
        this.isActive = false;
        
        // Clear any remaining projectiles
        this.spellProjectiles.forEach(projectile => {
            this.removeSpellProjectile(projectile);
        });
        
        // Show victory feedback
        this.elements.feedback.textContent = '🎉 Victory! The Math Witch is defeated! 🎉';
        this.elements.feedback.className = 'minigame-feedback correct';
        
        // Celebrate!
        this.animateFoxCelebrate();
        if (this.animations.isAnimationEnabled()) {
            this.animations.celebrate('minigame_victory');
        }
        
        // Award bonus points to main game
        const bonusPoints = 50 + (this.difficulty === 'advanced' ? 30 : this.difficulty === 'intermediate' ? 15 : 0);
        this.game.gameState.score += bonusPoints;
        
        // Return to main game after celebration
        setTimeout(() => {
            this.returnToMainGame();
        }, 3000);
        
        console.log(`🎊 Minigame victory! Bonus points: ${bonusPoints}`);
    }

    /**
     * Handle minigame defeat
     */
    defeat() {
        this.isActive = false;
        
        // Clear any remaining projectiles
        this.spellProjectiles.forEach(projectile => {
            this.removeSpellProjectile(projectile);
        });
        
        // Show defeat feedback
        this.elements.feedback.textContent = '💔 The Math Witch won this time... Try again! 💔';
        this.elements.feedback.className = 'minigame-feedback incorrect';
        
        // Animate defeat
        this.animateFoxHurt();
        
        // Return to main game (no bonus points)
        setTimeout(() => {
            this.returnToMainGame();
        }, 3000);
        
        console.log('😢 Minigame defeat - better luck next time!');
    }

    /**
     * Return to main game after minigame ends
     */
    returnToMainGame() {
        // Update main game UI
        this.game.updateUI();
        
        // Show game screen or level up message
        this.game.ui.showGameScreen();
        
        // Continue with next level or show appropriate screen
        if (this.game.gameState.currentLevelProgress >= this.game.gameState.problemsPerLevel) {
            // Start next level
            this.game.levelUp();
        }
        
        // Generate new problem for main game
        setTimeout(() => {
            this.game.generateNewProblem();
        }, 500);
    }

    /**
     * End minigame early (if needed)
     */
    endMinigame() {
        this.isActive = false;
        
        // Clear all projectiles
        this.spellProjectiles.forEach(projectile => {
            this.removeSpellProjectile(projectile);
        });
        
        this.returnToMainGame();
    }

    /**
     * Check if minigame is currently active
     * @returns {boolean} True if minigame is active
     */
    isMinigameActive() {
        return this.isActive;
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Minigame;
}
