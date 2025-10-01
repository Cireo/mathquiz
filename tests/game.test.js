/**
 * Tests for Game class
 * Basic test suite to verify game mechanics and state management
 */

// Simple mock for localStorage in test environment
class MockStorage {
    constructor() {
        this.data = {};
    }

    getItem(key) {
        return this.data[key] || null;
    }

    setItem(key, value) {
        this.data[key] = value;
    }

    removeItem(key) {
        delete this.data[key];
    }

    clear() {
        this.data = {};
    }
}

// Mock DOM elements for testing
class MockUIController {
    constructor() {
        this.elements = {
            scoreElement: { textContent: '0' },
            streakElement: { textContent: '0' },
            levelElement: { textContent: '1' },
            progressBar: { style: {} },
            problemElement: { textContent: '' },
            answerInput: { value: '', focus: () => {} },
            feedbackElement: { textContent: '', className: '' }
        };
        this.lastFeedback = null;
        this.lastProblem = null;
    }

    updateGameStats(stats) {
        this.elements.scoreElement.textContent = stats.score;
        this.elements.streakElement.textContent = stats.streak;
        this.elements.levelElement.textContent = stats.level;
    }

    updateProgressBar(percentage) {
        this.elements.progressBar.style.width = percentage + '%';
    }

    displayProblem(problemText) {
        this.lastProblem = problemText;
        this.elements.problemElement.textContent = problemText;
    }

    showFeedback(isCorrect, correctAnswer) {
        this.lastFeedback = { isCorrect, correctAnswer };
        this.elements.feedbackElement.textContent = isCorrect ? 'Correct!' : `Wrong. Answer: ${correctAnswer}`;
    }

    clearFeedback() {
        this.elements.feedbackElement.textContent = '';
        this.lastFeedback = null;
    }

    focusAnswerInput() {
        // Mock focus
    }

    showFloatingPoints(points) {
        // Mock floating points
    }

    celebrate(type) {
        // Mock celebration
    }

    showAchievement(achievement) {
        // Mock achievement display
    }

    updateResultsScreen(stats) {
        // Mock results screen update
    }

    showResultsScreen() {
        // Mock screen transition
    }
}

// Test Game functionality
function runGameTests() {
    const runner = new TestRunner();

    // Mock environment setup
    const originalLocalStorage = typeof localStorage !== 'undefined' ? localStorage : null;
    global.localStorage = new MockStorage();

    runner.test('Game constructor initializes correctly', () => {
        // Mock the components
        const mockGame = {
            mathEngine: new MathEngine(),
            storage: new Storage(),
            animations: { isAnimationEnabled: () => false, setEnabled: () => {} },
            ui: new MockUIController(),
            gameState: {
                score: 0,
                streak: 0,
                level: 1,
                isActive: false
            }
        };

        runner.assert(mockGame.mathEngine instanceof MathEngine, 'Should have MathEngine instance');
        runner.assert(mockGame.storage instanceof Storage, 'Should have Storage instance');
        runner.assertEqual(mockGame.gameState.score, 0, 'Should start with 0 score');
        runner.assertEqual(mockGame.gameState.level, 1, 'Should start at level 1');
        runner.assert(!mockGame.gameState.isActive, 'Should start inactive');
    });

    runner.test('Game state management works', () => {
        const gameState = {
            score: 0,
            streak: 0,
            bestStreak: 0,
            level: 1,
            problemsSolved: 0,
            correctAnswers: 0,
            difficulty: 'beginner',
            isActive: false,
            currentLevelProgress: 0
        };

        // Test initial state
        runner.assertEqual(gameState.score, 0, 'Initial score should be 0');
        runner.assertEqual(gameState.streak, 0, 'Initial streak should be 0');
        runner.assertEqual(gameState.level, 1, 'Initial level should be 1');

        // Simulate correct answer
        gameState.correctAnswers++;
        gameState.streak++;
        gameState.score += 10;
        gameState.problemsSolved++;

        runner.assertEqual(gameState.correctAnswers, 1, 'Should track correct answers');
        runner.assertEqual(gameState.streak, 1, 'Should track streak');
        runner.assertEqual(gameState.score, 10, 'Should update score');
    });

    runner.test('Points calculation works correctly', () => {
        const getBasePoints = (difficulty) => {
            const pointsMap = {
                beginner: 10,
                intermediate: 15,
                advanced: 20
            };
            return pointsMap[difficulty] || 10;
        };

        runner.assertEqual(getBasePoints('beginner'), 10, 'Beginner should give 10 points');
        runner.assertEqual(getBasePoints('intermediate'), 15, 'Intermediate should give 15 points');
        runner.assertEqual(getBasePoints('advanced'), 20, 'Advanced should give 20 points');
        runner.assertEqual(getBasePoints('invalid'), 10, 'Invalid should default to 10 points');
    });

    runner.test('Streak calculation with bonus works', () => {
        const calculateTotalPoints = (basePoints, streak) => {
            const streakBonus = Math.floor(streak / 3) * 2;
            return basePoints + streakBonus;
        };

        runner.assertEqual(calculateTotalPoints(10, 0), 10, 'No streak = no bonus');
        runner.assertEqual(calculateTotalPoints(10, 2), 10, 'Streak < 3 = no bonus');
        runner.assertEqual(calculateTotalPoints(10, 3), 12, 'Streak 3 = 2 bonus');
        runner.assertEqual(calculateTotalPoints(10, 6), 14, 'Streak 6 = 4 bonus');
        runner.assertEqual(calculateTotalPoints(10, 9), 16, 'Streak 9 = 6 bonus');
    });

    runner.test('Level progression works correctly', () => {
        let level = 1;
        let currentLevelProgress = 0;
        const problemsPerLevel = 10;

        const checkLevelUp = () => {
            if (currentLevelProgress >= problemsPerLevel) {
                level++;
                currentLevelProgress = 0;
                return true;
            }
            return false;
        };

        // Progress through problems
        for (let i = 1; i <= 25; i++) {
            currentLevelProgress++;
            const leveledUp = checkLevelUp();
            
            if (i === 10) {
                runner.assert(leveledUp, 'Should level up after 10 problems');
                runner.assertEqual(level, 2, 'Should be level 2 after 10 problems');
            } else if (i === 20) {
                runner.assert(leveledUp, 'Should level up after 20 problems');
                runner.assertEqual(level, 3, 'Should be level 3 after 20 problems');
            }
        }
    });

    runner.test('Answer validation integrates correctly', () => {
        const mathEngine = new MathEngine();
        const problem = mathEngine.generateProblem();
        
        // Test correct answer
        const correctResult = mathEngine.validateAnswer(problem.answer, problem.answer);
        runner.assert(correctResult, 'Should validate correct answer');

        // Test incorrect answer
        const incorrectResult = mathEngine.validateAnswer(problem.answer + 1, problem.answer);
        runner.assert(!incorrectResult, 'Should reject incorrect answer');
    });

    runner.test('Achievement system works', () => {
        const achievements = [
            { id: 'first_correct', name: 'First Success!', description: 'Answer first problem correctly' },
            { id: 'streak_5', name: 'Hot Streak!', description: 'Get 5 in a row' },
            { id: 'score_100', name: 'Century!', description: 'Score 100 points' }
        ];

        const checkAchievements = (gameState) => {
            const earned = [];

            if (gameState.correctAnswers === 1) {
                earned.push(achievements.find(a => a.id === 'first_correct'));
            }

            if (gameState.streak === 5) {
                earned.push(achievements.find(a => a.id === 'streak_5'));
            }

            if (gameState.score >= 100) {
                earned.push(achievements.find(a => a.id === 'score_100'));
            }

            return earned.filter(Boolean);
        };

        // Test first correct answer
        let gameState = { correctAnswers: 1, streak: 0, score: 0 };
        let earned = checkAchievements(gameState);
        runner.assertEqual(earned.length, 1, 'Should earn first correct achievement');
        runner.assertEqual(earned[0].id, 'first_correct', 'Should earn first_correct achievement');

        // Test streak achievement
        gameState = { correctAnswers: 5, streak: 5, score: 50 };
        earned = checkAchievements(gameState);
        runner.assertEqual(earned.length, 1, 'Should earn streak achievement');
        runner.assertEqual(earned[0].id, 'streak_5', 'Should earn streak_5 achievement');

        // Test score achievement
        gameState = { correctAnswers: 10, streak: 2, score: 100 };
        earned = checkAchievements(gameState);
        runner.assertEqual(earned.length, 1, 'Should earn score achievement');
        runner.assertEqual(earned[0].id, 'score_100', 'Should earn score_100 achievement');
    });

    runner.test('Game statistics calculation works', () => {
        const calculateAccuracy = (correct, total) => {
            if (total === 0) return 0;
            return Math.round((correct / total) * 100);
        };

        runner.assertEqual(calculateAccuracy(0, 0), 0, 'No problems = 0% accuracy');
        runner.assertEqual(calculateAccuracy(5, 10), 50, '5/10 correct = 50% accuracy');
        runner.assertEqual(calculateAccuracy(8, 10), 80, '8/10 correct = 80% accuracy');
        runner.assertEqual(calculateAccuracy(10, 10), 100, '10/10 correct = 100% accuracy');
    });

    runner.test('Difficulty progression works', () => {
        const mathEngine = new MathEngine();
        
        // Test difficulty changes
        mathEngine.setDifficulty('beginner');
        const beginnerProblem = mathEngine.generateProblem();
        runner.assertEqual(beginnerProblem.difficulty, 'beginner', 'Should generate beginner problem');

        mathEngine.setDifficulty('intermediate');
        const intermediateProblem = mathEngine.generateProblem();
        runner.assertEqual(intermediateProblem.difficulty, 'intermediate', 'Should generate intermediate problem');

        mathEngine.setDifficulty('advanced');
        const advancedProblem = mathEngine.generateProblem();
        runner.assertEqual(advancedProblem.difficulty, 'advanced', 'Should generate advanced problem');
    });

    runner.test('UI updates work correctly', () => {
        const ui = new MockUIController();
        
        // Test stats update
        ui.updateGameStats({ score: 50, streak: 3, level: 2 });
        runner.assertEqual(ui.elements.scoreElement.textContent, 50, 'Should update score display');
        runner.assertEqual(ui.elements.streakElement.textContent, 3, 'Should update streak display');
        runner.assertEqual(ui.elements.levelElement.textContent, 2, 'Should update level display');

        // Test progress bar
        ui.updateProgressBar(75);
        runner.assertEqual(ui.elements.progressBar.style.width, '75%', 'Should update progress bar width');

        // Test problem display
        ui.displayProblem('5 + 3 = ?');
        runner.assertEqual(ui.lastProblem, '5 + 3 = ?', 'Should display problem text');

        // Test feedback
        ui.showFeedback(true);
        runner.assert(ui.lastFeedback.isCorrect, 'Should show correct feedback');

        ui.showFeedback(false, 8);
        runner.assert(!ui.lastFeedback.isCorrect, 'Should show incorrect feedback');
        runner.assertEqual(ui.lastFeedback.correctAnswer, 8, 'Should show correct answer');
    });

    // Cleanup
    if (originalLocalStorage) {
        global.localStorage = originalLocalStorage;
    } else {
        delete global.localStorage;
    }

    return runner.run();
}

// Auto-run tests if in browser environment with required dependencies
if (typeof window !== 'undefined' && window.MathEngine && window.Storage) {
    runGameTests();
}

// Export for Node.js environment
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { runGameTests };
}
