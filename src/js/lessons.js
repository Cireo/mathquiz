/**
 * Interactive Lessons System
 * Provides step-by-step tutorials for math concepts
 */
class LessonsManager {
    constructor(gameInstance) {
        this.game = gameInstance;
        this.currentLesson = null;
        this.currentStep = 0;
        this.lessons = this.initializeLessons();
        
        this.initializeElements();
        this.bindEvents();
    }

    /**
     * Initialize DOM elements
     */
    initializeElements() {
        this.elements = {
            // Screens
            lessonsScreen: document.getElementById('lessons-screen'),
            lessonContentScreen: document.getElementById('lesson-content-screen'),
            
            // Navigation buttons
            lessonsBtn: document.getElementById('lessons-btn'),
            backToMenuBtn: document.getElementById('back-to-menu-btn'),
            backToLessonsBtn: document.getElementById('back-to-lessons-btn'),
            
            // Lesson cards
            lessonCards: document.querySelectorAll('.lesson-card'),
            
            // Lesson content elements
            lessonTitle: document.getElementById('lesson-title'),
            lessonStepIndicator: document.getElementById('lesson-step-indicator'),
            lessonStepContent: document.getElementById('lesson-step-content'),
            
            // Navigation
            prevStepBtn: document.getElementById('prev-step-btn'),
            nextStepBtn: document.getElementById('next-step-btn'),
            completeLessonBtn: document.getElementById('complete-lesson-btn')
        };
    }

    /**
     * Bind event listeners
     */
    bindEvents() {
        // Main navigation
        this.elements.lessonsBtn.addEventListener('click', () => this.showLessonsScreen());
        this.elements.backToMenuBtn.addEventListener('click', () => this.backToMenu());
        this.elements.backToLessonsBtn.addEventListener('click', () => this.backToLessons());
        
        // Lesson selection
        this.elements.lessonCards.forEach(card => {
            card.addEventListener('click', (e) => {
                const lessonId = e.currentTarget.dataset.lesson;
                this.startLesson(lessonId);
            });
        });
        
        // Lesson navigation
        this.elements.prevStepBtn.addEventListener('click', () => this.previousStep());
        this.elements.nextStepBtn.addEventListener('click', () => this.nextStep());
        this.elements.completeLessonBtn.addEventListener('click', () => this.completeLesson());
    }

    /**
     * Initialize lesson content
     */
    initializeLessons() {
        return {
            multiplication: {
                title: "Multiplication Tricks",
                description: "Learn patterns and shortcuts for times tables",
                steps: [
                    {
                        title: "Understanding Multiplication",
                        content: `
                            <div class="step-visual">
                                <h3>What is Multiplication?</h3>
                                <div class="explanation">
                                    Multiplication is <span class="highlight">repeated addition</span>! 
                                    When we multiply, we're adding the same number multiple times.
                                </div>
                                <div class="math-example">3 × 4 = 3 + 3 + 3 + 3 = 12</div>
                                <div class="explanation">
                                    This means "3 groups of 4" or "4 groups of 3" - both give us 12!
                                </div>
                            </div>
                        `
                    },
                    {
                        title: "The Magic of 9s",
                        content: `
                            <div class="step-visual">
                                <h3>9 Times Table Trick</h3>
                                <div class="explanation">
                                    The 9 times table has a <span class="highlight">magical pattern</span>!
                                </div>
                                <div class="math-example">
                                    9 × 1 = 09<br>
                                    9 × 2 = 18<br>
                                    9 × 3 = 27<br>
                                    9 × 4 = 36
                                </div>
                                <div class="explanation">
                                    Notice: The digits always add up to 9! (1+8=9, 2+7=9, 3+6=9)
                                </div>
                                <div class="try-it-box">
                                    <h4>Try it yourself!</h4>
                                    What's 9 × 7? The digits should add up to 9!
                                </div>
                            </div>
                        `
                    },
                    {
                        title: "Doubling Strategy",
                        content: `
                            <div class="step-visual">
                                <h3>Double and Double Again</h3>
                                <div class="explanation">
                                    For 4 times table, just <span class="highlight">double twice</span>!
                                </div>
                                <div class="math-example">
                                    7 × 4 = ?<br>
                                    7 × 2 = 14<br>
                                    14 × 2 = 28
                                </div>
                                <div class="explanation">
                                    First double 7 to get 14, then double 14 to get 28!
                                </div>
                                <div class="interactive-example">
                                    <strong>Practice:</strong> Try 6 × 4 using this method!
                                </div>
                            </div>
                        `
                    },
                    {
                        title: "Skip Counting",
                        content: `
                            <div class="step-visual">
                                <h3>Count by Steps</h3>
                                <div class="explanation">
                                    <span class="highlight">Skip counting</span> helps with any times table!
                                </div>
                                <div class="math-example">
                                    5 times table: 5, 10, 15, 20, 25, 30...<br>
                                    3 times table: 3, 6, 9, 12, 15, 18...
                                </div>
                                <div class="explanation">
                                    Count the steps to find your answer. For 5 × 6, count 6 steps: 5, 10, 15, 20, 25, 30!
                                </div>
                            </div>
                        `
                    },
                    {
                        title: "Practice Time!",
                        content: `
                            <div class="step-visual">
                                <h3>You're Ready!</h3>
                                <div class="explanation">
                                    Now you know several <span class="highlight">multiplication strategies</span>:
                                </div>
                                <div class="try-it-box">
                                    <h4>Your Toolkit:</h4>
                                    ✓ 9s trick (digits add to 9)<br>
                                    ✓ Doubling for 4s<br>
                                    ✓ Skip counting<br>
                                    ✓ Thinking of repeated addition
                                </div>
                                <div class="explanation">
                                    Practice these strategies in the game to become a multiplication master!
                                </div>
                            </div>
                        `
                    }
                ]
            },
            
            division: {
                title: "Division Strategies",
                description: "Master division with visual methods",
                steps: [
                    {
                        title: "What is Division?",
                        content: `
                            <div class="step-visual">
                                <h3>Division is Sharing</h3>
                                <div class="explanation">
                                    Division means <span class="highlight">sharing equally</span> or finding how many groups we can make.
                                </div>
                                <div class="math-example">12 ÷ 3 = 4</div>
                                <div class="explanation">
                                    This means "Share 12 things into 3 equal groups" - each group gets 4!
                                </div>
                            </div>
                        `
                    },
                    {
                        title: "Division and Multiplication",
                        content: `
                            <div class="step-visual">
                                <h3>They're Best Friends!</h3>
                                <div class="explanation">
                                    Division and multiplication are <span class="highlight">opposite operations</span>.
                                </div>
                                <div class="math-example">
                                    If 6 × 4 = 24<br>
                                    Then 24 ÷ 6 = 4<br>
                                    And 24 ÷ 4 = 6
                                </div>
                                <div class="explanation">
                                    Use your times tables to help with division!
                                </div>
                            </div>
                        `
                    },
                    {
                        title: "Think Groups",
                        content: `
                            <div class="step-visual">
                                <h3>Grouping Strategy</h3>
                                <div class="explanation">
                                    For 15 ÷ 3, think: <span class="highlight">"How many 3s make 15?"</span>
                                </div>
                                <div class="math-example">
                                    3 + 3 + 3 + 3 + 3 = 15<br>
                                    That's 5 groups of 3!
                                </div>
                                <div class="explanation">
                                    So 15 ÷ 3 = 5
                                </div>
                            </div>
                        `
                    },
                    {
                        title: "Division Practice",
                        content: `
                            <div class="step-visual">
                                <h3>Ready to Divide!</h3>
                                <div class="explanation">
                                    Remember your <span class="highlight">division strategies</span>:
                                </div>
                                <div class="try-it-box">
                                    <h4>Your Division Toolkit:</h4>
                                    ✓ Think of sharing equally<br>
                                    ✓ Use multiplication facts backwards<br>
                                    ✓ Count how many groups<br>
                                    ✓ Practice with small numbers first
                                </div>
                            </div>
                        `
                    }
                ]
            },
            
            "two-digit": {
                title: "Two-Digit Operations",
                description: "Addition and subtraction with carrying",
                steps: [
                    {
                        title: "Place Value Matters",
                        content: `
                            <div class="step-visual">
                                <h3>Tens and Ones</h3>
                                <div class="explanation">
                                    Every number has <span class="highlight">place values</span>: tens and ones.
                                </div>
                                <div class="math-example">
                                    25 = 2 tens + 5 ones<br>
                                    47 = 4 tens + 7 ones
                                </div>
                                <div class="explanation">
                                    Always line up the place values when adding or subtracting!
                                </div>
                            </div>
                        `
                    },
                    {
                        title: "Adding with Carrying",
                        content: `
                            <div class="step-visual">
                                <h3>When Ones Add Up to More Than 9</h3>
                                <div class="explanation">
                                    Sometimes ones add up to 10 or more. We need to <span class="highlight">"carry"</span>!
                                </div>
                                <div class="vertical-math">  27
+ 15
----
  42</div>
                                <div class="explanation">
                                    7 + 5 = 12. Write down 2, carry the 1 to tens place: 1 + 2 + 1 = 4
                                </div>
                            </div>
                        `
                    },
                    {
                        title: "Subtracting with Borrowing",
                        content: `
                            <div class="step-visual">
                                <h3>When We Need More Ones</h3>
                                <div class="explanation">
                                    Sometimes we need to <span class="highlight">"borrow"</span> from the tens place.
                                </div>
                                <div class="math-example">
                                      52<br>
                                    - 27<br>
                                    ----<br>
                                      25
                                </div>
                                <div class="explanation">
                                    Can't do 2 - 7, so borrow: 12 - 7 = 5, and 4 - 2 = 2
                                </div>
                            </div>
                        `
                    },
                    {
                        title: "Practice Makes Perfect",
                        content: `
                            <div class="step-visual">
                                <h3>You've Got This!</h3>
                                <div class="explanation">
                                    Now you understand <span class="highlight">two-digit operations</span>!
                                </div>
                                <div class="try-it-box">
                                    <h4>Your Strategy:</h4>
                                    ✓ Line up place values<br>
                                    ✓ Start with ones column<br>
                                    ✓ Carry when ones > 9<br>
                                    ✓ Borrow when needed for subtraction
                                </div>
                            </div>
                        `
                    }
                ]
            }
        };
    }

    /**
     * Show lessons screen
     */
    showLessonsScreen() {
        this.game.ui.hideAllScreens();
        this.elements.lessonsScreen.classList.add('active');
    }

    /**
     * Start a specific lesson
     */
    startLesson(lessonId) {
        this.currentLesson = this.lessons[lessonId];
        this.currentStep = 0;
        
        if (!this.currentLesson) {
            console.error('Lesson not found:', lessonId);
            return;
        }
        
        this.elements.lessonTitle.textContent = this.currentLesson.title;
        this.showLessonContent();
        
        this.game.ui.hideAllScreens();
        this.elements.lessonContentScreen.classList.add('active');
    }

    /**
     * Show current lesson step content
     */
    showLessonContent() {
        if (!this.currentLesson) return;
        
        const step = this.currentLesson.steps[this.currentStep];
        const totalSteps = this.currentLesson.steps.length;
        
        // Update step indicator
        this.elements.lessonStepIndicator.textContent = `Step ${this.currentStep + 1} of ${totalSteps}`;
        
        // Update content
        this.elements.lessonStepContent.innerHTML = step.content;
        
        // Update navigation buttons
        this.elements.prevStepBtn.disabled = this.currentStep === 0;
        
        if (this.currentStep === totalSteps - 1) {
            // Last step
            this.elements.nextStepBtn.style.display = 'none';
            this.elements.completeLessonBtn.style.display = 'block';
        } else {
            this.elements.nextStepBtn.style.display = 'block';
            this.elements.completeLessonBtn.style.display = 'none';
        }
    }

    /**
     * Go to previous step
     */
    previousStep() {
        if (this.currentStep > 0) {
            this.currentStep--;
            this.showLessonContent();
        }
    }

    /**
     * Go to next step
     */
    nextStep() {
        if (this.currentStep < this.currentLesson.steps.length - 1) {
            this.currentStep++;
            this.showLessonContent();
        }
    }

    /**
     * Complete the lesson
     */
    completeLesson() {
        // Show completion message
        if (this.game.animations) {
            this.game.animations.celebrate('lesson_complete');
        }
        
        // Return to lessons screen
        setTimeout(() => {
            this.backToLessons();
        }, 2000);
    }

    /**
     * Go back to lessons screen
     */
    backToLessons() {
        this.game.ui.hideAllScreens();
        this.elements.lessonsScreen.classList.add('active');
    }

    /**
     * Go back to main menu
     */
    backToMenu() {
        this.game.ui.showWelcomeScreen();
    }
}
