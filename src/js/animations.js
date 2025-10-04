/**
 * Animations - Handles visual effects and animations for the game
 * Provides engaging visual feedback and cute effects for children
 */
class Animations {
    constructor() {
        this.isEnabled = true;
        this.activeAnimations = new Set();
        this.confettiColors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#feca57', '#ff9ff3', '#54a0ff'];
    }

    /**
     * Enable or disable animations (accessibility)
     * @param {boolean} enabled - Whether animations should be enabled
     */
    setEnabled(enabled) {
        this.isEnabled = enabled;
        if (!enabled) {
            this.clearAllAnimations();
        }
    }

    /**
     * Check if animations are enabled
     * @returns {boolean} True if animations are enabled
     */
    isAnimationEnabled() {
        return this.isEnabled && !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }

    /**
     * Add animation class to element with automatic cleanup
     * @param {HTMLElement} element - Target element
     * @param {string} animationClass - CSS animation class
     * @param {number} duration - Duration in milliseconds
     */
    addAnimation(element, animationClass, duration = 1000) {
        if (!this.isAnimationEnabled() || !element) return;

        element.classList.add(animationClass);
        this.activeAnimations.add({ element, animationClass });

        setTimeout(() => {
            element.classList.remove(animationClass);
            this.activeAnimations.delete({ element, animationClass });
        }, duration);
    }

    /**
     * Animate correct answer feedback
     * @param {HTMLElement} element - Target element (usually feedback div)
     */
    showCorrectAnswer(element) {
        if (!element) return;

        element.textContent = this.getRandomCorrectMessage();
        element.className = 'feedback correct';
        
        if (this.isAnimationEnabled()) {
            this.addAnimation(element, 'bounce', 800);
        }
    }

    /**
     * Animate incorrect answer feedback
     * @param {HTMLElement} element - Target element
     * @param {number} correctAnswer - The correct answer to show
     */
    showIncorrectAnswer(element, correctAnswer) {
        if (!element) return;

        element.textContent = `${this.getRandomEncouragingMessage()} The answer is ${correctAnswer}.`;
        element.className = 'feedback incorrect';
        
        if (this.isAnimationEnabled()) {
            this.addAnimation(element, 'shake', 600);
        }
    }

    /**
     * Create confetti explosion effect
     * @param {number} count - Number of confetti particles
     * @param {number} duration - Duration in milliseconds
     */
    createConfetti(count = 50, duration = 3000) {
        if (!this.isAnimationEnabled()) return;

        for (let i = 0; i < count; i++) {
            setTimeout(() => {
                this.createConfettiParticle();
            }, i * 50); // Stagger particle creation
        }
    }

    /**
     * Create a single confetti particle
     */
    createConfettiParticle() {
        const particle = document.createElement('div');
        const shapes = ['square', 'circle', 'triangle', 'star'];
        const shape = shapes[Math.floor(Math.random() * shapes.length)];
        
        particle.className = `confetti-particle ${shape}`;
        particle.style.left = Math.random() * window.innerWidth + 'px';
        particle.style.top = '-20px'; // Start above the screen
        particle.style.animationDelay = Math.random() * 2 + 's';
        particle.style.animationDuration = (Math.random() * 2 + 2) + 's';
        
        // Set random color for some shapes
        if (shape === 'square' || shape === 'circle') {
            const color = this.confettiColors[Math.floor(Math.random() * this.confettiColors.length)];
            particle.style.backgroundColor = color;
        }

        document.body.appendChild(particle);

        // Remove particle after animation
        setTimeout(() => {
            if (particle.parentNode) {
                particle.parentNode.removeChild(particle);
            }
        }, 4000);
    }

    /**
     * Create sparkle effect around an element
     * @param {HTMLElement} element - Target element
     * @param {number} count - Number of sparkles
     */
    createSparkles(element, count = 8) {
        if (!this.isAnimationEnabled() || !element) return;

        const rect = element.getBoundingClientRect();
        
        for (let i = 0; i < count; i++) {
            setTimeout(() => {
                this.createSparkleParticle(rect);
            }, i * 100);
        }
    }

    /**
     * Create a single sparkle particle
     * @param {DOMRect} rect - Bounding rectangle of target element
     */
    createSparkleParticle(rect) {
        const sparkle = document.createElement('div');
        sparkle.className = 'sparkle-particle';
        sparkle.textContent = '✨';
        
        // Position randomly around the target element
        const x = rect.left + Math.random() * rect.width;
        const y = rect.top + Math.random() * rect.height;
        
        sparkle.style.position = 'fixed';
        sparkle.style.left = x + 'px';
        sparkle.style.top = y + 'px';
        sparkle.style.pointerEvents = 'none';
        sparkle.style.zIndex = '1000';

        document.body.appendChild(sparkle);

        // Remove sparkle after animation
        setTimeout(() => {
            if (sparkle.parentNode) {
                sparkle.parentNode.removeChild(sparkle);
            }
        }, 1500);
    }

    /**
     * Animate score increase
     * @param {HTMLElement} scoreElement - Score display element
     * @param {number} newScore - New score value
     */
    animateScoreIncrease(scoreElement, newScore) {
        if (!scoreElement) return;

        scoreElement.textContent = newScore;
        
        if (this.isAnimationEnabled()) {
            this.addAnimation(scoreElement, 'score-pop', 600);
        }
    }

    /**
     * Create floating number effect
     * @param {HTMLElement} fromElement - Element to float number from
     * @param {number} points - Points to display
     */
    createFloatingPoints(fromElement, points) {
        if (!this.isAnimationEnabled() || !fromElement) return;

        const rect = fromElement.getBoundingClientRect();
        const floating = document.createElement('div');
        
        floating.className = 'floating-number';
        floating.textContent = `+${points}`;
        floating.style.left = (rect.left + rect.width / 2) + 'px';
        floating.style.top = rect.bottom + 'px';

        document.body.appendChild(floating);

        // Remove after animation
        setTimeout(() => {
            if (floating.parentNode) {
                floating.parentNode.removeChild(floating);
            }
        }, 2000);
    }

    /**
     * Animate streak counter
     * @param {HTMLElement} streakElement - Streak display element
     * @param {number} streak - Current streak value
     */
    animateStreak(streakElement, streak) {
        if (!streakElement) return;

        streakElement.textContent = streak;

        if (streak > 0 && this.isAnimationEnabled()) {
            // Add fire effect for streaks > 3
            if (streak >= 3) {
                streakElement.classList.add('streak-fire');
            }
            
            this.addAnimation(streakElement, 'pulse', 1000);
        } else {
            streakElement.classList.remove('streak-fire');
        }
    }

    /**
     * Show level up animation
     * @param {number} newLevel - New level number
     */
    showLevelUp(newLevel) {
        if (!this.isAnimationEnabled()) return;

        const levelUpDiv = document.createElement('div');
        levelUpDiv.className = 'level-up';
        levelUpDiv.textContent = `🎉 LEVEL ${newLevel}! 🎉`;

        document.body.appendChild(levelUpDiv);

        // Show confetti
        this.createConfetti(30);

        // Remove after animation
        setTimeout(() => {
            if (levelUpDiv.parentNode) {
                levelUpDiv.parentNode.removeChild(levelUpDiv);
            }
        }, 2000);
    }

    /**
     * Show achievement notification
     * @param {Object} achievement - Achievement object
     */
    showAchievement(achievement) {
        const badge = document.createElement('div');
        badge.className = 'achievement-badge';
        badge.textContent = `🏆 ${achievement.name}`;

        document.body.appendChild(badge);

        // Remove after delay
        setTimeout(() => {
            if (badge.parentNode) {
                badge.parentNode.removeChild(badge);
            }
        }, 4000);
    }

    /**
     * Animate problem transition
     * @param {HTMLElement} problemElement - Problem display element
     * @param {string} newProblem - New problem text
     */
    animateProblemTransition(problemElement, newProblem) {
        if (!problemElement) return;

        if (this.isAnimationEnabled()) {
            // Exit animation - fade out current problem
            this.addAnimation(problemElement, 'problem-exit', 300);
            
            // Change text content at the end of fade out, then fade in new problem
            setTimeout(() => {
                problemElement.textContent = newProblem;
                // Small delay to ensure text change is rendered before enter animation
                setTimeout(() => {
                    this.addAnimation(problemElement, 'problem-enter', 500);
                }, 10);
            }, 280); // Slightly before animation ends to avoid flash
        } else {
            problemElement.textContent = newProblem;
        }
    }

    /**
     * Animate progress bar update
     * @param {HTMLElement} progressBar - Progress bar element
     * @param {number} percentage - Progress percentage (0-100)
     */
    animateProgressBar(progressBar, percentage) {
        if (!progressBar) return;

        progressBar.style.width = percentage + '%';
        
        if (this.isAnimationEnabled()) {
            this.addAnimation(progressBar, 'fill', 500);
        }
    }

    /**
     * Animate mascot reaction
     * @param {HTMLElement} mascotElement - Mascot element
     * @param {string} emotion - Emotion to display (happy, excited, etc.)
     */
    animateMascot(mascotElement, emotion = 'happy') {
        if (!this.isAnimationEnabled() || !mascotElement) return;

        mascotElement.classList.remove('happy', 'excited');
        mascotElement.classList.add(emotion);
    }

    /**
     * Screen transition animation
     * @param {HTMLElement} fromScreen - Screen to hide
     * @param {HTMLElement} toScreen - Screen to show
     */
    transitionScreen(fromScreen, toScreen) {
        if (!fromScreen || !toScreen) return;

        if (this.isAnimationEnabled()) {
            fromScreen.classList.add('screen-transition-exit');
            
            setTimeout(() => {
                fromScreen.classList.remove('active', 'screen-transition-exit');
                toScreen.classList.add('active', 'screen-transition-enter');
                
                setTimeout(() => {
                    toScreen.classList.remove('screen-transition-enter');
                }, 500);
            }, 500);
        } else {
            fromScreen.classList.remove('active');
            toScreen.classList.add('active');
        }
    }

    /**
     * Get random correct answer message
     * @returns {string} Encouraging message
     */
    getRandomCorrectMessage() {
        const messages = [
            '🎉 Excellent!',
            '⭐ Great job!',
            '🌟 Perfect!',
            '✨ Amazing!',
            '🚀 Fantastic!',
            '🎯 Bull\'s eye!',
            '💎 Brilliant!',
            '🔥 On fire!',
            '🏆 Champion!',
            '🎊 Wonderful!'
        ];
        return messages[Math.floor(Math.random() * messages.length)];
    }

    /**
     * Get random encouraging message for incorrect answers
     * @returns {string} Encouraging message
     */
    getRandomEncouragingMessage() {
        const messages = [
            'Almost there! 💪',
            'Good try! 🌟',
            'Nice effort! ✨',
            'Keep going! 🚀',
            'You\'re learning! 📚',
            'Don\'t give up! 💯',
            'Try again! 🎯',
            'Getting closer! 🎈'
        ];
        return messages[Math.floor(Math.random() * messages.length)];
    }

    /**
     * Clear all active animations
     */
    clearAllAnimations() {
        this.activeAnimations.forEach(({ element, animationClass }) => {
            if (element) {
                element.classList.remove(animationClass);
            }
        });
        this.activeAnimations.clear();

        // Remove floating elements
        const floatingElements = document.querySelectorAll(
            '.confetti-particle, .sparkle-particle, .floating-number, .level-up, .achievement-badge'
        );
        floatingElements.forEach(el => {
            if (el.parentNode) {
                el.parentNode.removeChild(el);
            }
        });
    }

    /**
     * Pulse element briefly (for feedback)
     * @param {HTMLElement} element - Element to pulse
     */
    pulse(element) {
        if (this.isAnimationEnabled() && element) {
            this.addAnimation(element, 'pulse', 300);
        }
    }

    /**
     * Celebrate big achievements (high streaks, level ups)
     * @param {string} type - Type of celebration
     */
    celebrate(type = 'default') {
        if (!this.isAnimationEnabled()) return;

        switch (type) {
            case 'big_streak':
                this.createConfetti(75);
                break;
            case 'level_up':
                this.createConfetti(50);
                break;
            case 'high_score':
                this.createConfetti(100);
                break;
            case 'secret_battle':
                this.createConfetti(150, 4000); // Extra confetti for secret!
                break;
            case 'lesson_complete':
                this.createConfetti(60);
                break;
            case 'character_unlock':
                this.createConfetti(80, 3000); // Character unlock celebration
                break;
            case 'witch_unlock':
                this.createConfetti(120, 4000); // Special witch unlock celebration
                break;
            case 'minigame_victory':
                this.createConfetti(80);
                break;
            default:
                this.createConfetti(30);
        }
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Animations;
}
