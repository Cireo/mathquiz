/**
 * MathEngine - Handles math problem generation and validation
 * Provides clean separation of math logic from game mechanics
 */
class MathEngine {
    constructor() {
        this.difficulties = {
            beginner: {
                addition: { min: 1, max: 10, digits: 1 },
                subtraction: { min: 1, max: 10, digits: 1 },
                multiplication: { min: 0, max: 5 },
                division: { divisors: [2, 5, 10] }
            },
            intermediate: {
                addition: { min: 1, max: 99, digits: 2 },
                subtraction: { min: 1, max: 50, digits: 2 },
                multiplication: { min: 0, max: 10 },
                division: { divisors: [2, 3, 4, 5, 10] }
            },
            advanced: {
                addition: { min: 1, max: 99, digits: 2 },
                subtraction: { min: 1, max: 99, digits: 2 },
                multiplication: { min: 0, max: 12 },
                division: { divisors: [1, 2, 3, 4, 5] }
            }
        };

        this.operations = {
            beginner: ['addition', 'subtraction', 'multiplication', 'addition', 'subtraction'], // Less division for beginners
            intermediate: ['addition', 'subtraction', 'multiplication', 'division'],
            advanced: ['addition', 'subtraction', 'multiplication', 'division', 'division'] // More division for advanced
        };
        this.currentDifficulty = 'beginner';
    }

    /**
     * Set the current difficulty level
     * @param {string} difficulty - beginner, intermediate, or advanced
     */
    setDifficulty(difficulty) {
        if (this.difficulties[difficulty]) {
            this.currentDifficulty = difficulty;
        } else {
            throw new Error(`Invalid difficulty: ${difficulty}`);
        }
    }

    /**
     * Generate a random number within the specified range
     * @param {number} min - Minimum value
     * @param {number} max - Maximum value
     * @returns {number} Random number
     */
    getRandomNumber(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    /**
     * Generate a random problem based on current difficulty
     * @param {string} operation - Optional: force specific operation
     * @returns {Object} Problem object with question, answer, and metadata
     */
    generateProblem(operation = null) {
        const config = this.difficulties[this.currentDifficulty];
        const availableOperations = this.operations[this.currentDifficulty];
        const selectedOperation = operation || availableOperations[this.getRandomNumber(0, availableOperations.length - 1)];

        switch (selectedOperation) {
            case 'addition':
                return this.generateAddition(config.addition);
            case 'subtraction':
                return this.generateSubtraction(config.subtraction);
            case 'multiplication':
                return this.generateMultiplication(config.multiplication);
            case 'division':
                return this.generateDivision(config.division);
            default:
                throw new Error(`Unknown operation: ${selectedOperation}`);
        }
    }

    /**
     * Generate an addition problem
     * @param {Object} config - Addition configuration
     * @returns {Object} Addition problem
     */
    generateAddition(config) {
        const a = this.getRandomNumber(config.min, config.max);
        const b = this.getRandomNumber(config.min, config.max);
        
        return {
            operation: 'addition',
            question: `${a} + ${b}`,
            answer: a + b,
            operands: [a, b],
            difficulty: this.currentDifficulty
        };
    }

    /**
     * Generate a subtraction problem (ensures positive result)
     * @param {Object} config - Subtraction configuration
     * @returns {Object} Subtraction problem
     */
    generateSubtraction(config) {
        let a = this.getRandomNumber(config.min, config.max);
        let b = this.getRandomNumber(config.min, Math.min(a, config.max));
        
        // Ensure a >= b for positive results
        if (a < b) {
            [a, b] = [b, a];
        }

        return {
            operation: 'subtraction',
            question: `${a} - ${b}`,
            answer: a - b,
            operands: [a, b],
            difficulty: this.currentDifficulty
        };
    }

    /**
     * Generate a multiplication problem
     * @param {Object} config - Multiplication configuration
     * @returns {Object} Multiplication problem
     */
    generateMultiplication(config) {
        const a = this.getRandomNumber(config.min, config.max);
        const b = this.getRandomNumber(config.min, config.max);

        return {
            operation: 'multiplication',
            question: `${a} × ${b}`,
            answer: a * b,
            operands: [a, b],
            difficulty: this.currentDifficulty
        };
    }

    /**
     * Generate a division problem (ensures whole number results)
     * @param {Object} config - Division configuration
     * @returns {Object} Division problem
     */
    generateDivision(config) {
        const divisor = config.divisors[this.getRandomNumber(0, config.divisors.length - 1)];
        const quotient = this.getRandomNumber(1, 12); // Result between 1-12
        const dividend = divisor * quotient;

        return {
            operation: 'division',
            question: `${dividend} ÷ ${divisor}`,
            answer: quotient,
            operands: [dividend, divisor],
            difficulty: this.currentDifficulty
        };
    }

    /**
     * Validate if the provided answer is correct
     * @param {number} userAnswer - User's answer
     * @param {number} correctAnswer - Correct answer
     * @param {number} tolerance - Acceptable tolerance (default 0)
     * @returns {boolean} True if answer is correct
     */
    validateAnswer(userAnswer, correctAnswer, tolerance = 0) {
        if (typeof userAnswer !== 'number' || isNaN(userAnswer)) {
            return false;
        }

        return Math.abs(userAnswer - correctAnswer) <= tolerance;
    }

    /**
     * Generate a batch of problems for practice
     * @param {number} count - Number of problems to generate
     * @param {string} operation - Optional: force specific operation
     * @returns {Array} Array of problem objects
     */
    generateProblemSet(count = 10, operation = null) {
        const problems = [];
        for (let i = 0; i < count; i++) {
            problems.push(this.generateProblem(operation));
        }
        return problems;
    }

    /**
     * Get difficulty configuration for current level
     * @returns {Object} Current difficulty configuration
     */
    getCurrentDifficultyConfig() {
        return this.difficulties[this.currentDifficulty];
    }

    /**
     * Get available difficulty levels
     * @returns {Array} Array of difficulty level names
     */
    getAvailableDifficulties() {
        return Object.keys(this.difficulties);
    }

    /**
     * Get available operations for current difficulty
     * @returns {Array} Array of operation names for current difficulty
     */
    getAvailableOperations() {
        return this.operations[this.currentDifficulty] || this.operations.beginner;
    }

    /**
     * Get problem statistics for the current difficulty
     * @returns {Object} Statistics about problem ranges and types
     */
    getProblemStats() {
        const config = this.difficulties[this.currentDifficulty];
        return {
            difficulty: this.currentDifficulty,
            operations: this.operations,
            ranges: {
                addition: `${config.addition.min}-${config.addition.max}`,
                subtraction: `${config.subtraction.min}-${config.subtraction.max}`,
                multiplication: `${config.multiplication.min}-${config.multiplication.max}`,
                division: `divisors: ${config.division.divisors.join(', ')}`
            }
        };
    }

    /**
     * Generate a themed problem (for special occasions)
     * @param {string} theme - Theme name (future extension)
     * @returns {Object} Themed problem object
     */
    generateThemedProblem(theme = 'default') {
        // Future extension point for themed problems
        // For now, just generate a regular problem
        const problem = this.generateProblem();
        problem.theme = theme;
        return problem;
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MathEngine;
}
