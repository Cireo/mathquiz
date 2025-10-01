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
        this.isProcessingCollision = false; // Prevent multiple simultaneous collision processing
        
        // Multiple choice state
        this.currentSpellType = 'input'; // 'input' or 'choice'
        this.foxPosition = 'middle'; // 'high', 'middle', 'low'
        this.choiceOptions = [];
        this.correctChoicePosition = 'middle';
        this.hasSpedUp = false; // Track if flying answers have been sped up
        this.spellStartTime = 0; // Track when current spell animation started
        this.collisionTimeout = null; // Timeout for collision detection
        this.cleanupTimeout = null; // Timeout for cleanup
        
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
            
            // Input spell elements
            inputSpellMode: document.getElementById('input-spell-mode'),
            answerInput: document.getElementById('minigame-answer'),
            submitButton: document.getElementById('minigame-submit'),
            currentSpellDisplay: document.getElementById('current-spell'),
            
            // Choice spell elements  
            choiceSpellMode: document.getElementById('choice-spell-mode'),
            choiceEquation: document.getElementById('choice-equation'),
            
            feedback: document.getElementById('minigame-feedback')
        };
    }

    /**
     * Bind minigame event listeners
     */
    bindEvents() {
        // Handle minigame answer input (for input spells)
        this.elements.answerInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && this.currentSpellType === 'input') {
                this.handleSpellDefense();
            }
        });

        // Handle submit button click (for input spells)
        this.elements.submitButton.addEventListener('click', () => {
            if (this.currentSpellType === 'input') {
                this.handleSpellDefense();
            }
        });

        this.elements.answerInput.addEventListener('input', () => {
            // Visual feedback on input
            const hasValue = this.elements.answerInput.value.trim() !== '';
            this.elements.submitButton.disabled = !hasValue;
            
            if (hasValue) {
                this.elements.answerInput.style.borderColor = '#4ecdc4';
            } else {
                this.elements.answerInput.style.borderColor = '#ffd700';
            }
        });

        // Handle arrow keys for choice spells
        document.addEventListener('keydown', (e) => {
            // Only handle if minigame is active and it's a choice spell
            if (!this.isActive || this.currentSpellType !== 'choice') {
                return;
            }
            
            switch (e.key) {
                case 'ArrowUp':
                    e.preventDefault();
                    e.stopPropagation();
                    this.moveFox('up');
                    console.log('🦊 Fox moved up to:', this.foxPosition);
                    break;
                case 'ArrowDown':
                    e.preventDefault();
                    e.stopPropagation();
                    this.moveFox('down');
                    console.log('🦊 Fox moved down to:', this.foxPosition);
                    break;
                case 'Enter':
                case ' ':
                    e.preventDefault();
                    e.stopPropagation();
                    this.speedUpFlyingAnswers();
                    break;
            }
        });
    }

    /**
     * Speed up flying answers when Enter/Space is pressed
     */
    speedUpFlyingAnswers() {
        // Prevent multiple speed-ups
        if (this.hasSpedUp) {
            return;
        }
        
        // Only work if there are flying answers
        const flyingAnswers = document.querySelectorAll('.flying-answer');
        if (flyingAnswers.length === 0) {
            return;
        }
        
        console.log('⚡ Speeding up flying answers!');
        
        // Calculate how much time has elapsed since animation started
        const currentTime = Date.now();
        const elapsedTime = currentTime - this.spellStartTime;
        const progress = Math.min(elapsedTime / this.spellSpeed, 1);
        
        console.log(`Animation progress: ${(progress * 100).toFixed(1)}%`);
        
        // Calculate remaining time at normal speed
        const remainingTime = this.spellSpeed - elapsedTime;
        
        // Speed up the remaining time (reduce to 25% of remaining time)
        const speedUpFactor = 0.25;
        const newRemainingTime = Math.max(200, remainingTime * speedUpFactor);
        
        console.log(`Remaining time: ${remainingTime}ms → ${newRemainingTime}ms`);
        
        // For each flying answer, get current position and animate from there
        flyingAnswers.forEach(answer => {
            // Get current computed position
            const currentStyle = window.getComputedStyle(answer);
            const currentRight = parseFloat(currentStyle.right);
            
            console.log(`Current position: ${currentRight}px`);
            
            // Stop the CSS animation and set current position
            answer.style.animation = 'none';
            answer.style.right = `${currentRight}px`;
            
            // Force reflow
            answer.offsetHeight;
            
            // Calculate target position (same as CSS animation end)
            const targetRight = window.innerWidth - 140; // Same as calc(100% - 140px)
            
            // Use CSS transition for smooth movement from current position
            answer.style.transition = `right ${newRemainingTime}ms linear`;
            answer.style.right = `${targetRight}px`;
        });
        
        // Update collision timing to match new speed
        if (this.collisionTimeout) {
            clearTimeout(this.collisionTimeout);
        }
        
        this.collisionTimeout = setTimeout(() => {
            flyingAnswers.forEach(answer => {
                if (answer.parentNode) { // Still exists
                    this.checkAnswerCollision(answer);
                }
            });
        }, newRemainingTime - 100); // Check collision slightly before end
        
        // Update cleanup timing
        if (this.cleanupTimeout) {
            clearTimeout(this.cleanupTimeout);
        }
        
        this.cleanupTimeout = setTimeout(() => {
            this.handleMissedAnswers();
        }, newRemainingTime + 200);
        
        // Mark as sped up to prevent multiple calls
        this.hasSpedUp = true;
    }

    /**
     * Start the minigame with specified difficulty
     * @param {string} difficulty - Difficulty level from main game
     */
    startMinigame(difficulty = 'beginner') {
        // Prevent multiple simultaneous starts
        if (this.isActive) {
            console.log('🚫 Minigame already active, ignoring duplicate start');
            return;
        }
        
        console.log(`🎮 Starting minigame with difficulty: ${difficulty}`);
        
        this.difficulty = difficulty;
        this.isActive = true;
        this.foxHealth = 100;
        this.spellsRemaining = 5;
        this.spellProjectiles = [];
        this.isProcessingCollision = false; // Reset collision processing flag
        
        // Reset fox to center position for fresh battle
        this.foxPosition = 'middle';
        console.log('🦊 Reset fox to middle position for fresh battle');
        
        // Adjust difficulty settings
        this.adjustDifficulty();
        
        // Reset UI
        this.updateUI();
        this.clearFeedback();
        
        // Show minigame screen
        this.showMinigameScreen();
        
        // Update fox position visually after screen is shown
        this.updateFoxPosition();
        
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
                this.spellSpeed = 7000; // Much slower for beginners
                this.spellsRemaining = 3;
                break;
            case 'intermediate':
                this.spellSpeed = 6000; // Slower, more manageable
                this.spellsRemaining = 4;
                break;
            case 'advanced':
                this.spellSpeed = 5000; // Still challenging but fair
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

        // Clear any existing spells first
        this.clearAllSpells();

        // Randomly choose spell type (70% input, 30% choice)
        this.currentSpellType = Math.random() < 0.7 ? 'input' : 'choice';
        console.log(`🎯 Casting ${this.currentSpellType} spell`);

        // Generate new math problem
        this.mathEngine.setDifficulty(this.difficulty);
        this.currentSpell = this.mathEngine.generateProblem();
        
        if (this.currentSpellType === 'input') {
            this.setupInputSpell();
        } else {
            this.setupChoiceSpell();
        }
        
        // Create spell projectile ONLY for input spells
        if (this.currentSpellType === 'input') {
            this.createSpellProjectile();
        }
        
        // Animate witch casting
        this.animateWitchCast();
    }

    /**
     * Clear all existing spells and projectiles
     */
    clearAllSpells() {
        // Clear projectiles
        this.spellProjectiles.forEach(projectile => {
            this.removeSpellProjectile(projectile);
        });
        this.spellProjectiles = [];
        
        // Clear flying answers
        this.clearFlyingAnswers();
        
        // Reset current spell
        this.currentSpell = null;
        
        console.log('🧹 Cleared all existing spells');
    }

    /**
     * Set up input-based spell
     */
    setupInputSpell() {
        // Clear any flying answers from previous choice spells
        this.clearFlyingAnswers();
        
        // Show input mode, hide choice mode
        this.elements.inputSpellMode.classList.remove('hidden');
        this.elements.choiceSpellMode.classList.add('hidden');
        
        // Update display
        this.elements.currentSpellDisplay.textContent = `Incoming spell: ${this.currentSpell.question}`;
        this.elements.answerInput.value = '';
        this.elements.submitButton.disabled = true;
        this.elements.answerInput.focus();
    }

    /**
     * Set up choice-based spell with wrong answers
     */
    setupChoiceSpell() {
        // Clear any projectiles from previous input spells
        this.spellProjectiles.forEach(projectile => {
            this.removeSpellProjectile(projectile);
        });
        this.spellProjectiles = [];
        
        // Reset speed-up flag for new spell
        this.hasSpedUp = false;
        
        // Show choice mode, hide input mode
        this.elements.inputSpellMode.classList.add('hidden');
        this.elements.choiceSpellMode.classList.remove('hidden');
        
        // Update equation display
        this.elements.choiceEquation.textContent = this.currentSpell.question;
        
        // Generate wrong answers and positions
        this.choiceOptions = this.generateChoiceOptions(this.currentSpell);
        
        // Reset fox position to middle for each new choice spell
        this.foxPosition = 'middle';
        console.log('🦊 Resetting fox position to middle for new choice spell');
        this.updateFoxPosition();
        
        // Create flying answers that will move horizontally
        this.createFlyingAnswers();
    }

    /**
     * Create flying answer projectiles that move horizontally
     */
    createFlyingAnswers() {
        const positions = ['high', 'middle', 'low'];
        const spellSpeedMs = this.spellSpeed;
        
        // Record when this spell animation starts
        this.spellStartTime = Date.now();
        
        // Set CSS variable for animation duration
        document.documentElement.style.setProperty('--spell-speed', `${spellSpeedMs}ms`);
        
        positions.forEach(position => {
            const answer = this.choiceOptions[position];
            const flyingAnswer = document.createElement('div');
            
            flyingAnswer.className = `flying-answer ${position}`;
            flyingAnswer.textContent = answer.value;
            flyingAnswer.dataset.position = position;
            flyingAnswer.dataset.isCorrect = answer.isCorrect;
            
            this.elements.battleField.appendChild(flyingAnswer);
        });
        
        // Set up collision detection timing
        this.collisionTimeout = setTimeout(() => {
            const flyingAnswers = document.querySelectorAll('.flying-answer');
            flyingAnswers.forEach(answer => {
                if (answer.parentNode) { // Still exists
                    this.checkAnswerCollision(answer);
                }
            });
        }, spellSpeedMs - 500); // Check collision slightly before end
        
        // Auto-end spell if nothing is caught
        this.cleanupTimeout = setTimeout(() => {
            if (this.isActive && this.currentSpellType === 'choice') {
                this.handleMissedAnswers();
            }
        }, spellSpeedMs + 500);
    }

    /**
     * Check if fox catches a flying answer
     * @param {HTMLElement} flyingAnswer - The flying answer element
     */
    checkAnswerCollision(flyingAnswer) {
        if (!this.isActive || this.currentSpellType !== 'choice') return;
        
        const answerPosition = flyingAnswer.dataset.position;
        const isCorrect = flyingAnswer.dataset.isCorrect === 'true';
        
        console.log(`🎯 Collision check: Fox at ${this.foxPosition}, Answer at ${answerPosition}, Correct: ${isCorrect}`);
        
        // Check if fox is in the same position as the answer
        if (this.foxPosition === answerPosition) {
            console.log('✅ COLLISION! Fox caught the answer!');
            // Fox caught this answer!
            if (isCorrect) {
                this.handleCorrectCatch(flyingAnswer);
            } else {
                this.handleIncorrectCatch(flyingAnswer);
            }
        } else {
            console.log('❌ No collision - positions don\'t match');
        }
    }

    /**
     * Handle fox catching the correct answer
     * @param {HTMLElement} answerElement - The caught answer element
     */
    handleCorrectCatch(answerElement) {
        if (this.isProcessingCollision) {
            console.log('🚫 Already processing collision, ignoring duplicate correct catch');
            return;
        }
        this.isProcessingCollision = true;
        
        // Visual feedback
        answerElement.classList.add('correct-caught');
        
        // Same as successful spell deflection
        this.clearFlyingAnswers();
        this.showFeedback(true);
        this.animateFoxCelebrate();
        
        this.spellsRemaining--;
        this.updateUI();
        
        if (this.animations.isAnimationEnabled()) {
            this.animations.createSparkles(this.elements.foxCharacter, 12);
        }
        
        setTimeout(() => {
            this.isProcessingCollision = false;
            if (this.spellsRemaining > 0) {
                this.castFirstSpell();
            } else {
                this.victory();
            }
        }, 1500);
    }

    /**
     * Handle fox catching the wrong answer
     * @param {HTMLElement} answerElement - The caught wrong answer element
     */
    handleIncorrectCatch(answerElement) {
        if (this.isProcessingCollision) {
            console.log('🚫 Already processing collision, ignoring duplicate incorrect catch');
            return;
        }
        this.isProcessingCollision = true;
        
        // Visual feedback
        answerElement.classList.add('incorrect-caught');
        
        // Show feedback with correct answer
        const correctAnswer = Object.values(this.choiceOptions).find(opt => opt.isCorrect).value;
        this.showFeedback(false, correctAnswer);
        
        // Same as spell hit
        this.clearFlyingAnswers();
        this.foxHealth = Math.max(0, this.foxHealth - 25);
        this.updateUI();
        this.animateFoxHurt();
        
        setTimeout(() => {
            this.isProcessingCollision = false;
            if (this.foxHealth <= 0) {
                this.defeat();
            } else if (this.isActive && this.spellsRemaining > 0) {
                this.castFirstSpell();
            }
        }, 1500);
    }

    /**
     * Handle case where fox misses all answers
     */
    handleMissedAnswers() {
        if (this.isProcessingCollision) {
            console.log('🚫 Already processing collision, ignoring missed answers');
            return;
        }
        this.isProcessingCollision = true;
        
        // Find the correct answer for feedback
        const correctAnswer = Object.values(this.choiceOptions).find(opt => opt.isCorrect).value;
        this.showFeedback(false, correctAnswer);
        
        // Same as spell hit
        this.clearFlyingAnswers();
        this.foxHealth = Math.max(0, this.foxHealth - 25);
        this.updateUI();
        this.animateFoxHurt();
        
        setTimeout(() => {
            this.isProcessingCollision = false;
            if (this.foxHealth <= 0) {
                this.defeat();
            } else if (this.isActive && this.spellsRemaining > 0) {
                this.castFirstSpell();
            }
        }, 1500);
    }

    /**
     * Clear all flying answers from the screen
     */
    clearFlyingAnswers() {
        // Clear any pending timeouts
        if (this.collisionTimeout) {
            clearTimeout(this.collisionTimeout);
            this.collisionTimeout = null;
        }
        if (this.cleanupTimeout) {
            clearTimeout(this.cleanupTimeout);
            this.cleanupTimeout = null;
        }
        
        const flyingAnswers = this.elements.battleField.querySelectorAll('.flying-answer');
        flyingAnswers.forEach(answer => {
            if (answer.parentNode) {
                // Clean up any custom styles before removing
                answer.style.animation = '';
                answer.style.transition = '';
                answer.style.right = '';
                answer.parentNode.removeChild(answer);
            }
        });
    }

    /**
     * Generate choice options with wrong answers
     * @param {Object} spell - The current spell object
     * @returns {Object} Choice options with correct and wrong answers
     */
    generateChoiceOptions(spell) {
        const correct = spell.answer;
        const wrongAnswers = [];
        
        // Generate wrong answers based on different strategies
        const strategies = [
            () => correct + 2,  // Off by 2
            () => correct - 2,  // Off by 2 (other direction)
            () => correct + 1,  // Off by 1
            () => correct - 1,  // Off by 1 (other direction)
            () => this.generateWrongOperation(spell), // Wrong operation
            () => this.generateOperandError(spell),   // Wrong operand
        ];
        
        // Generate 2 wrong answers using different strategies
        const usedValues = new Set([correct]);
        while (wrongAnswers.length < 2 && strategies.length > 0) {
            const strategyIndex = Math.floor(Math.random() * strategies.length);
            const strategy = strategies[strategyIndex];
            const wrongAnswer = strategy();
            
            // Ensure positive and not already used
            if (wrongAnswer > 0 && !usedValues.has(wrongAnswer)) {
                wrongAnswers.push(wrongAnswer);
                usedValues.add(wrongAnswer);
            }
            
            // Remove used strategy to avoid duplicates
            strategies.splice(strategyIndex, 1);
        }
        
        // If we need more wrong answers, generate simple variations
        while (wrongAnswers.length < 2) {
            const variation = correct + Math.floor(Math.random() * 10) - 5;
            if (variation > 0 && !usedValues.has(variation)) {
                wrongAnswers.push(variation);
                usedValues.add(variation);
            }
        }
        
        // Randomly assign positions
        const positions = ['high', 'middle', 'low'];
        const correctPos = positions[Math.floor(Math.random() * positions.length)];
        
        const result = {
            correctPosition: correctPos
        };
        
        // Assign values to positions
        positions.forEach((pos, index) => {
            if (pos === correctPos) {
                result[pos] = { value: correct, isCorrect: true };
            } else {
                result[pos] = { value: wrongAnswers[index < wrongAnswers.length ? index : 0], isCorrect: false };
            }
        });
        
        return result;
    }

    /**
     * Generate wrong answer using wrong operation
     * @param {Object} spell - The current spell object
     * @returns {number} Wrong answer from different operation
     */
    generateWrongOperation(spell) {
        const [a, b] = spell.operands;
        
        switch (spell.operation) {
            case 'addition':
                return a - b > 0 ? a - b : a + b + 1;
            case 'subtraction':
                return a + b;
            case 'multiplication':
                return a + b;
            case 'division':
                return a * b;
            default:
                return spell.answer + 1;
        }
    }

    /**
     * Generate wrong answer with operand error
     * @param {Object} spell - The current spell object
     * @returns {number} Wrong answer from modified operand
     */
    generateOperandError(spell) {
        const [a, b] = spell.operands;
        
        // Randomly modify one operand by ±1
        const modifyFirst = Math.random() < 0.5;
        const modifier = Math.random() < 0.5 ? 1 : -1;
        
        let newA = modifyFirst ? Math.max(1, a + modifier) : a;
        let newB = modifyFirst ? b : Math.max(1, b + modifier);
        
        switch (spell.operation) {
            case 'addition':
                return newA + newB;
            case 'subtraction':
                return Math.max(0, newA - newB);
            case 'multiplication':
                return newA * newB;
            case 'division':
                return newA / newB;
            default:
                return spell.answer + modifier;
        }
    }

    /**
     * Move fox up or down in choice selection
     * @param {string} direction - 'up' or 'down'
     */
    moveFox(direction) {
        const positions = ['high', 'middle', 'low'];
        const currentIndex = positions.indexOf(this.foxPosition);
        
        if (direction === 'up' && currentIndex > 0) {
            this.foxPosition = positions[currentIndex - 1];
        } else if (direction === 'down' && currentIndex < positions.length - 1) {
            this.foxPosition = positions[currentIndex + 1];
        }
        
        this.updateFoxPosition();
    }

    /**
     * Update fox position visual indicator
     */
    updateFoxPosition() {
        // Remove all position classes
        this.elements.foxCharacter.classList.remove('position-high', 'position-middle', 'position-low');
        
        // Add current position class
        this.elements.foxCharacter.classList.add(`position-${this.foxPosition}`);
        
        // Debug logging
        console.log(`🦊 Fox position updated to: ${this.foxPosition}`);
        console.log('🎯 Fox element classes:', this.elements.foxCharacter.className);
        console.log('🎯 Fox element computed style:', window.getComputedStyle(this.elements.foxCharacter).transform);
    }

    /**
     * Select the current choice (where fox is positioned)
     * Note: This is now handled by collision detection in the new system
     */
    selectCurrentChoice() {
        // For choice spells, selection is handled by collision detection
        // This method is kept for compatibility but does nothing
        if (this.currentSpellType === 'choice') {
            console.log('Choice selection handled by collision detection');
            return;
        }
    }

    /**
     * Create a visual spell projectile (for input spells only)
     */
    createSpellProjectile() {
        // Only create traditional projectiles for input spells
        if (this.currentSpellType !== 'input') return;
        
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
            // Clear the input field for next attempt
            this.elements.answerInput.value = '';
            
            // Show wrong answer feedback
            this.showFeedback(false, this.currentSpell.answer);
            
            // Animate fox getting hurt from wrong answer
            this.animateFoxHurt();
            
            // Take some damage for wrong input spell answer
            this.foxHealth = Math.max(0, this.foxHealth - 10);
            this.updateUI();
            
            console.log(`❌ Wrong answer for input spell. Fox took 10 damage. Health: ${this.foxHealth}`);
            
            // Check if fox is defeated
            if (this.foxHealth <= 0) {
                setTimeout(() => {
                    this.defeat();
                }, 1000);
            }
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
            // Use position-specific celebration animation
            const celebrationAnimation = `characterCelebrate${this.foxPosition.charAt(0).toUpperCase() + this.foxPosition.slice(1)}`;
            this.elements.foxCharacter.style.animation = `${celebrationAnimation} 0.8s ease-out`;
            
            console.log(`🎉 Fox celebrating with ${celebrationAnimation} at position ${this.foxPosition}`);
            
            setTimeout(() => {
                // Reset to position-appropriate animation
                this.resetFoxAnimation();
            }, 800);
        }
    }

    /**
     * Animate fox hurt reaction
     */
    animateFoxHurt() {
        if (this.animations.isAnimationEnabled()) {
            // Use position-specific hurt animation
            const hurtAnimation = `characterHurt${this.foxPosition.charAt(0).toUpperCase() + this.foxPosition.slice(1)}`;
            this.elements.foxCharacter.style.animation = `${hurtAnimation} 0.6s ease-out`;
            
            console.log(`💥 Fox hurt with ${hurtAnimation} at position ${this.foxPosition}`);
            
            setTimeout(() => {
                // Reset to position-appropriate animation
                this.resetFoxAnimation();
            }, 600);
        }
    }

    /**
     * Reset fox animation to appropriate idle animation based on position
     */
    resetFoxAnimation() {
        // Remove any inline animation style to let CSS classes take over
        this.elements.foxCharacter.style.animation = '';
        
        // Force update of position classes to trigger correct animation
        // But don't change the fox position, just refresh the visual state
        this.updateFoxPosition();
        
        console.log(`🎭 Reset fox animation for position: ${this.foxPosition} (position unchanged)`);
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
        
        // Clear any remaining projectiles and flying answers
        this.spellProjectiles.forEach(projectile => {
            this.removeSpellProjectile(projectile);
        });
        this.clearFlyingAnswers();
        
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
        
        // Clear any remaining projectiles and flying answers
        this.spellProjectiles.forEach(projectile => {
            this.removeSpellProjectile(projectile);
        });
        this.clearFlyingAnswers();
        
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
        // Hide minigame screen first
        this.elements.screen.classList.remove('active');
        
        // Continue with next level or show appropriate screen
        if (this.game.gameState.currentLevelProgress >= this.game.gameState.problemsPerLevel) {
            // Start next level
            this.game.levelUp();
            
            // Generate new problem immediately before showing UI
            this.game.generateNewProblem();
            
            console.log(`🎮 Returned to main game - Level ${this.game.gameState.level}, Progress: ${this.game.gameState.currentLevelProgress}/${this.game.gameState.problemsPerLevel}`);
        }
        
        // Update main game UI (now with correct level progress and new problem if leveled up)
        this.game.updateUI();
        
        // Clear any previous answer from the main game input
        if (this.game.ui.elements.answerInput) {
            this.game.ui.elements.answerInput.value = '';
        }
        
        // Show game screen
        this.game.ui.showGameScreen();
        
        console.log('🎮 Returned to main game');
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
