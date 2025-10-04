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
        
        // Answer processing state
        this.isProcessingAnswer = false;
        
        this.bindEvents();
    }

    /**
     * Initialize all DOM elements and cache references
     * @returns {Object} Object containing element references
     */
    initializeElements() {
        return {
            // Screens
            nameInputScreen: document.getElementById('name-input-screen'),
            welcomeScreen: document.getElementById('welcome-screen'),
            gameScreen: document.getElementById('game-screen'),
            resultsScreen: document.getElementById('results-screen'),

            // Name input elements
            playerNameInput: document.getElementById('player-name-input'),
            startAdventureBtn: document.getElementById('start-adventure-btn'),
            playerNameTitle: document.getElementById('player-name-title'),
            playerNameBattle: document.getElementById('player-name-battle'),
            playerNameCharacter: document.getElementById('player-name-character'),

            // Welcome screen elements
            difficultyButtons: document.querySelectorAll('.difficulty-btn'),
            charactersBtn: document.getElementById('characters-btn'),

            // Character selection elements
            characterSelectionScreen: document.getElementById('character-selection-screen'),
            backToWelcomeBtn: document.getElementById('back-to-welcome-btn'),
            characterGrid: document.getElementById('character-grid'),
            beginnerProgress: document.getElementById('beginner-progress'),
            intermediateProgress: document.getElementById('intermediate-progress'),
            advancedProgress: document.getElementById('advanced-progress'),
            witchProgress: document.getElementById('witch-progress'),
            
            // Character unlock modal elements
            characterUnlockModal: document.getElementById('character-unlock-modal'),
            unlockTierName: document.getElementById('unlock-tier-name'),
            characterChoices: document.getElementById('character-choices'),
            confirmCharacterChoice: document.getElementById('confirm-character-choice'),

            // Exit confirmation modal elements
            exitGameBtn: document.getElementById('exit-game-btn'),
            exitConfirmationModal: document.getElementById('exit-confirmation-modal'),
            cancelExitBtn: document.getElementById('cancel-exit-btn'),
            confirmExitBtn: document.getElementById('confirm-exit-btn'),

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
        // Name input events
        this.elements.startAdventureBtn.addEventListener('click', () => this.handleNameSubmit());
        this.elements.playerNameInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.handleNameSubmit();
            }
        });
        
        // Difficulty selection
        this.elements.difficultyButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const difficulty = e.target.dataset.level;
                this.handleDifficultySelection(difficulty);
            });
        });

        // Character selection events
        this.elements.charactersBtn.addEventListener('click', () => this.showCharacterSelection());
        this.elements.backToWelcomeBtn.addEventListener('click', () => this.showWelcomeScreen());
        this.elements.confirmCharacterChoice.addEventListener('click', () => this.confirmCharacterChoice());

        // Exit game events
        this.elements.exitGameBtn.addEventListener('click', () => this.showExitConfirmation());
        this.elements.cancelExitBtn.addEventListener('click', () => this.hideExitConfirmation());
        this.elements.confirmExitBtn.addEventListener('click', () => this.confirmExit());

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
                e.target.id !== 'minigame-answer' &&
                e.target.id !== 'player-name-input') {
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
        
        // Don't show error if there's no current problem (e.g., during transitions)
        if (!this.game || !this.game.currentProblem) {
            return;
        }
        
        // Prevent multiple submissions while processing
        if (this.isProcessingAnswer) {
            return;
        }
        
        if (answer === '' || isNaN(Number(answer))) {
            this.showInputError();
            return;
        }

        const numericAnswer = Number(answer);
        
        // Set processing flag to prevent multiple submissions
        this.isProcessingAnswer = true;
        
        // Disable input and button immediately
        this.elements.answerInput.disabled = true;
        this.elements.submitButton.disabled = true;
        
        if (this.game && typeof this.game.submitAnswer === 'function') {
            this.game.submitAnswer(numericAnswer);
        }
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

        // Show special activation message (which will start the battle after the message)
        this.showSecretActivationFeedback();
    }

    /**
     * Show special feedback for secret activation
     */
    showSecretActivationFeedback() {
        // Create special secret activation message
        const secretMessage = document.createElement('div');
        secretMessage.className = 'secret-activation-message';
        const playerName = this.game.storage.getPlayerName();
        console.log('Secret battle - playerName:', playerName);
        secretMessage.innerHTML = `🔥✨ SECRET BATTLE UNLOCKED! ✨🔥<br/>🦊 ${playerName} vs Math Witch! 🧙‍♀️`;
        
        // Style it with initial opacity 0 to prevent flash
        secretMessage.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) scale(0);
            background: linear-gradient(135deg, #ff6b6b 0%, #feca57 50%, #48dbfb 100%);
            color: white;
            padding: 30px;
            border-radius: 20px;
            font-size: 1.5rem;
            font-weight: bold;
            text-align: center;
            z-index: 10001;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
            text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
            pointer-events: none;
            opacity: 0;
        `;
        
        // Append to body to ensure it's always visible and centered
        document.body.appendChild(secretMessage);
        
        // Force reflow and then animate in
        secretMessage.offsetHeight; // Force reflow
        
        // Animate in smoothly
        secretMessage.style.transition = 'all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
        secretMessage.style.transform = 'translate(-50%, -50%) scale(1)';
        secretMessage.style.opacity = '1';
        
        // Create fire particles around the message
        if (this.game && this.game.animations) {
            this.game.animations.celebrate('secret_battle');
        }

        // Remove message after delay and then start battle
        setTimeout(() => {
            if (secretMessage.parentNode) {
                secretMessage.parentNode.removeChild(secretMessage);
            }
            // Start the battle after message disappears
            if (this.game && this.game.minigame) {
                // Use current difficulty or default to intermediate for secret battles
                const difficulty = this.game.gameState.difficulty || 'intermediate';
                this.game.minigame.startMinigame(difficulty);
                console.log('🎉 Secret battle activated! 🦊⚔️🧙‍♀️');
            }
        }, 2000);
    }

    /**
     * Handle keyboard shortcuts
     * @param {KeyboardEvent} e - Keyboard event
     */
    handleKeyboardShortcuts(e) {
        // Don't handle shortcuts if minigame is active
        if (this.game && this.game.minigame && this.game.minigame.isMinigameActive()) {
            return;
        }
        
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
     * Handle name submission from input screen
     */
    handleNameSubmit() {
        const name = this.elements.playerNameInput.value.trim();
        
        if (name.length === 0) {
            this.showInputError('Please enter your name');
            return;
        }
        
        if (name.length > 20) {
            this.showInputError('Name is too long (max 20 characters)');
            return;
        }
        
        // Store the player name (with easter egg processing)
        this.game.storage.setPlayerName(name);
        
        // Get the processed name back from storage and update displays
        const storedName = this.game.storage.getPlayerName();
        this.updatePlayerNameDisplays(storedName);
        
        // Show welcome screen
        this.showWelcomeScreen();
    }
    
    /**
     * Update all player name displays throughout the game
     */
    updatePlayerNameDisplays(name) {
        // Name already has easter egg applied at storage time
        this.elements.playerNameTitle.textContent = `${name}'s Math Quest`;
        this.elements.playerNameBattle.textContent = `${name}'s Math Battle`;
        this.elements.playerNameCharacter.textContent = name;
    }
    
    /**
     * Show name input screen
     */
    showNameInputScreen() {
        this.hideAllScreens();
        this.elements.nameInputScreen.classList.add('active');
        this.elements.playerNameInput.focus();
    }

    /**
     * Show character selection screen
     */
    showCharacterSelection() {
        this.hideAllScreens();
        this.elements.characterSelectionScreen.classList.add('active');
        this.populateCharacterGrid();
        this.updateCharacterProgress();
    }

    /**
     * Populate the character grid with available characters
     */
    populateCharacterGrid() {
        const grid = this.elements.characterGrid;
        grid.innerHTML = '';
        
        const selectedCharacter = this.game.storage.getSelectedCharacter();
        const unlockedCharacters = this.game.storage.getUnlockedCharacters();
        
        // Get all characters organized by tier
        const tiers = [
            {
                id: 'starter',
                name: '🦊 Starter',
                characters: ['fox']
            },
            {
                id: 'beginner',
                name: '🌱 Beginner Tier',
                characters: this.game.storage.getAvailableCharactersForTier('beginner')
            },
            {
                id: 'intermediate',
                name: '🌿 Intermediate Tier',
                characters: this.game.storage.getAvailableCharactersForTier('intermediate')
            },
            {
                id: 'advanced',
                name: '🌳 Advanced Tier',
                characters: this.game.storage.getAvailableCharactersForTier('advanced')
            },
            {
                id: 'special',
                name: '✨ Special',
                characters: ['witch']
            }
        ];

        tiers.forEach(tier => {
            // Create tier section
            const tierSection = document.createElement('div');
            tierSection.className = 'character-tier-section';
            
            // Create characters container for this tier
            const tierCharacters = document.createElement('div');
            tierCharacters.className = 'tier-characters';
            
            tier.characters.forEach(characterId => {
                const isUnlocked = unlockedCharacters.includes(characterId);
                const isSelected = characterId === selectedCharacter;
                const emoji = this.game.storage.getCharacterEmoji(characterId);
                
                const card = document.createElement('div');
                card.className = `character-card ${isSelected ? 'selected' : ''} ${!isUnlocked ? 'locked' : ''}`;
                card.dataset.characterId = characterId;
                
                card.innerHTML = `
                    <div class="character-emoji">${emoji}</div>
                    <div class="character-name">${characterId}</div>
                `;
                
                if (isUnlocked) {
                    card.addEventListener('click', () => this.selectCharacter(characterId));
                }
                
                tierCharacters.appendChild(card);
            });
            
            tierSection.appendChild(tierCharacters);
            grid.appendChild(tierSection);
        });
    }

    /**
     * Select a character
     */
    selectCharacter(characterId) {
        // Update storage
        this.game.storage.setSelectedCharacter(characterId);
        
        // Update UI
        this.populateCharacterGrid();
        this.updateAllCharacterDisplays();
        
        // Show feedback
        const emoji = this.game.storage.getCharacterEmoji(characterId);
        this.showFeedback(`${emoji} ${characterId} selected!`, 'success');
    }

    /**
     * Update character progress indicators
     */
    updateCharacterProgress() {
        const unlocked = this.game.storage.getUnlockedCharacters();
        const tiers = ['beginner', 'intermediate', 'advanced'];
        
        tiers.forEach(tier => {
            const tierCharacters = this.game.storage.getAvailableCharactersForTier(tier);
            const hasUnlocked = tierCharacters.some(char => unlocked.includes(char));
            const progressElement = this.elements[`${tier}Progress`];
            
            if (hasUnlocked) {
                const unlockedChar = tierCharacters.find(char => unlocked.includes(char));
                const emoji = this.game.storage.getCharacterEmoji(unlockedChar);
                progressElement.textContent = `${emoji} ${unlockedChar} unlocked!`;
                progressElement.style.color = '#48bb78';
            } else {
                progressElement.textContent = 'Beat Level 3 to unlock';
                progressElement.style.color = '#718096';
            }
        });
        
        // Update witch progress
        if (this.game.storage.isWitchUnlocked()) {
            this.elements.witchProgress.textContent = '🧙‍♀️ Witch unlocked!';
            this.elements.witchProgress.style.color = '#8b5cf6';
        } else if (this.game.storage.hasAllTierCharacters()) {
            this.elements.witchProgress.textContent = 'Ready to unlock! Beat any level 3.';
            this.elements.witchProgress.style.color = '#f59e0b';
        } else {
            this.elements.witchProgress.textContent = 'Collect all 3 tiers to unlock the Witch!';
            this.elements.witchProgress.style.color = '#718096';
        }
    }

    /**
     * Update all character displays throughout the game
     */
    updateAllCharacterDisplays() {
        const selectedCharacter = this.game.storage.getSelectedCharacter();
        const emoji = this.game.storage.getCharacterEmoji(selectedCharacter);
        
        // Update mascot on welcome screen
        const mascot = document.querySelector('.mascot');
        if (mascot) {
            mascot.textContent = emoji;
        }
        
        // Update player character in minigame (fox character, not witch)
        const foxCharacterSprite = document.querySelector('#fox-character .character-sprite');
        if (foxCharacterSprite) {
            foxCharacterSprite.textContent = emoji;
        }
        
        // Update character button text
        if (this.elements.charactersBtn) {
            this.elements.charactersBtn.innerHTML = `
                ${emoji} Choose Character
                <small>Unlock new companions</small>
            `;
        }
    }

    /**
     * Show character unlock modal for tier selection
     */
    showCharacterUnlockModal(difficulty) {
        const tierNames = {
            beginner: '🌱 Beginner',
            intermediate: '🌿 Intermediate',
            advanced: '🌳 Advanced'
        };
        
        this.elements.unlockTierName.textContent = tierNames[difficulty];
        this.elements.characterChoices.innerHTML = '';
        
        const availableCharacters = this.game.storage.getAvailableCharactersForTier(difficulty);
        
        availableCharacters.forEach(characterId => {
            const emoji = this.game.storage.getCharacterEmoji(characterId);
            
            const choice = document.createElement('div');
            choice.className = 'character-choice';
            choice.dataset.characterId = characterId;
            choice.innerHTML = `
                <div class="character-emoji">${emoji}</div>
                <div class="character-name">${characterId}</div>
            `;
            
            choice.addEventListener('click', () => {
                // Remove previous selection
                this.elements.characterChoices.querySelectorAll('.character-choice').forEach(c => {
                    c.classList.remove('selected');
                });
                
                // Select this choice
                choice.classList.add('selected');
                this.elements.confirmCharacterChoice.disabled = false;
                this.selectedUnlockCharacter = characterId;
            });
            
            this.elements.characterChoices.appendChild(choice);
        });
        
        this.elements.characterUnlockModal.classList.add('active');
    }

    /**
     * Confirm character choice from unlock modal
     */
    confirmCharacterChoice() {
        if (this.selectedUnlockCharacter) {
            // Unlock the character
            this.game.storage.unlockCharacter(this.selectedUnlockCharacter);
            
            // Check if witch should be unlocked
            if (this.game.storage.hasAllTierCharacters() && !this.game.storage.isWitchUnlocked()) {
                this.game.storage.unlockCharacter('witch');
                
                // Show special witch unlock celebration
                setTimeout(() => {
                    this.showFeedback('🎉 SPECIAL UNLOCK: The Witch joins your team! 🧙‍♀️', 'achievement');
                    this.game.animations.celebrate('witch_unlock');
                }, 1000);
            }
            
            // Close modal
            this.elements.characterUnlockModal.classList.remove('active');
            
            // Show celebration
            const emoji = this.game.storage.getCharacterEmoji(this.selectedUnlockCharacter);
            this.showFeedback(`🎉 ${emoji} ${this.selectedUnlockCharacter} unlocked!`, 'achievement');
            this.game.animations.celebrate('character_unlock');
            
            // Reset selection
            this.selectedUnlockCharacter = null;
            this.elements.confirmCharacterChoice.disabled = true;
        }
    }

    /**
     * Show exit confirmation modal
     */
    showExitConfirmation() {
        this.elements.exitConfirmationModal.classList.add('active');
    }

    /**
     * Hide exit confirmation modal
     */
    hideExitConfirmation() {
        this.elements.exitConfirmationModal.classList.remove('active');
    }

    /**
     * Confirm exit and return to welcome screen
     */
    confirmExit() {
        // Hide the confirmation modal
        this.hideExitConfirmation();
        
        // Clean up game state
        if (this.game) {
            this.game.endGame();
        }
        
        // Show welcome screen
        this.showWelcomeScreen();
        
        // Show feedback
        this.showFeedback('Game exited. Your progress has been saved!', 'info');
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
        this.elements.nameInputScreen.classList.remove('active');
        this.elements.welcomeScreen.classList.remove('active');
        this.elements.characterSelectionScreen.classList.remove('active');
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
     * Show the correct answer by replacing ? with the actual answer
     * @param {number} answer - The correct answer
     */
    showCorrectAnswer(answer) {
        if (this.elements.problemElement && this.game.currentProblem) {
            const questionWithAnswer = this.game.currentProblem.question.replace('?', answer);
            this.elements.problemElement.textContent = questionWithAnswer;
        }
    }

    /**
     * Display new problem
     * @param {string} problemText - Problem to display
     */
    displayProblem(problemText) {
        // Reset for new question
        this.prepareForNewQuestion();
        
        if (this.elements.problemElement) {
            // Clear previous operation classes
            this.elements.problemElement.classList.remove('addition', 'subtraction', 'multiplication', 'division');
            
            // Add operation-specific class for color coding
            if (this.game && this.game.currentProblem && this.game.currentProblem.operation) {
                this.elements.problemElement.classList.add(this.game.currentProblem.operation);
            }
            
            if (this.game && this.game.animations) {
                this.game.animations.animateProblemTransition(this.elements.problemElement, problemText);
            } else {
                this.elements.problemElement.textContent = problemText;
            }
        }
    }

    /**
     * Prepare UI for new question
     */
    prepareForNewQuestion() {
        // Reset processing state
        this.isProcessingAnswer = false;
        
        // Clear and re-enable input
        if (this.elements.answerInput) {
            this.elements.answerInput.value = '';
            this.elements.answerInput.disabled = false;
            this.elements.answerInput.style.borderColor = '#e2e8f0';
        }
        
        // Re-enable submit button
        if (this.elements.submitButton) {
            this.elements.submitButton.disabled = false;
        }
        
        // Focus input for immediate typing
        setTimeout(() => {
            if (this.elements.answerInput && !this.elements.answerInput.disabled) {
                this.elements.answerInput.focus();
            }
        }, 100);
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
