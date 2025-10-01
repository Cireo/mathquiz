/**
 * Tests for MathEngine class
 * Basic test suite to verify math problem generation and validation
 */

// Simple test framework for browser environment
class TestRunner {
    constructor() {
        this.tests = [];
        this.passed = 0;
        this.failed = 0;
    }

    test(description, testFunction) {
        this.tests.push({ description, testFunction });
    }

    run() {
        console.log('🧪 Running MathEngine Tests...\n');
        
        this.tests.forEach(({ description, testFunction }) => {
            try {
                testFunction();
                this.passed++;
                console.log(`✅ ${description}`);
            } catch (error) {
                this.failed++;
                console.error(`❌ ${description}`);
                console.error(`   Error: ${error.message}`);
            }
        });

        console.log(`\n📊 Test Results: ${this.passed} passed, ${this.failed} failed`);
        return this.failed === 0;
    }

    assert(condition, message) {
        if (!condition) {
            throw new Error(message || 'Assertion failed');
        }
    }

    assertEqual(actual, expected, message) {
        if (actual !== expected) {
            throw new Error(message || `Expected ${expected}, got ${actual}`);
        }
    }

    assertType(value, type, message) {
        if (typeof value !== type) {
            throw new Error(message || `Expected ${type}, got ${typeof value}`);
        }
    }
}

// Test MathEngine functionality
function runMathEngineTests() {
    const runner = new TestRunner();
    
    runner.test('MathEngine constructor initializes correctly', () => {
        const engine = new MathEngine();
        runner.assert(engine instanceof MathEngine, 'Should create MathEngine instance');
        runner.assertEqual(engine.currentDifficulty, 'beginner', 'Should default to beginner difficulty');
        runner.assert(engine.difficulties, 'Should have difficulties object');
        runner.assert(engine.operations.length > 0, 'Should have operations array');
    });

    runner.test('setDifficulty works correctly', () => {
        const engine = new MathEngine();
        
        engine.setDifficulty('intermediate');
        runner.assertEqual(engine.currentDifficulty, 'intermediate', 'Should set intermediate difficulty');
        
        engine.setDifficulty('advanced');
        runner.assertEqual(engine.currentDifficulty, 'advanced', 'Should set advanced difficulty');
        
        try {
            engine.setDifficulty('invalid');
            runner.assert(false, 'Should throw error for invalid difficulty');
        } catch (error) {
            runner.assert(true, 'Should throw error for invalid difficulty');
        }
    });

    runner.test('getRandomNumber generates numbers in range', () => {
        const engine = new MathEngine();
        
        for (let i = 0; i < 50; i++) {
            const num = engine.getRandomNumber(1, 10);
            runner.assert(num >= 1 && num <= 10, `Random number ${num} should be between 1-10`);
            runner.assertType(num, 'number', 'Should return a number');
        }
    });

    runner.test('generateAddition creates valid problems', () => {
        const engine = new MathEngine();
        const config = { min: 1, max: 10 };
        const problem = engine.generateAddition(config);
        
        runner.assertEqual(problem.operation, 'addition', 'Should have correct operation');
        runner.assertType(problem.question, 'string', 'Should have string question');
        runner.assertType(problem.answer, 'number', 'Should have numeric answer');
        runner.assert(problem.operands.length === 2, 'Should have two operands');
        runner.assert(problem.question.includes('+'), 'Question should contain plus sign');
        
        // Verify answer is correct
        const [a, b] = problem.operands;
        runner.assertEqual(problem.answer, a + b, 'Answer should be sum of operands');
    });

    runner.test('generateSubtraction creates valid problems', () => {
        const engine = new MathEngine();
        const config = { min: 1, max: 20 };
        const problem = engine.generateSubtraction(config);
        
        runner.assertEqual(problem.operation, 'subtraction', 'Should have correct operation');
        runner.assert(problem.question.includes('-'), 'Question should contain minus sign');
        runner.assert(problem.answer >= 0, 'Answer should be non-negative');
        
        // Verify answer is correct
        const [a, b] = problem.operands;
        runner.assertEqual(problem.answer, a - b, 'Answer should be difference of operands');
        runner.assert(a >= b, 'First operand should be >= second operand');
    });

    runner.test('generateMultiplication creates valid problems', () => {
        const engine = new MathEngine();
        const config = { min: 0, max: 12 };
        const problem = engine.generateMultiplication(config);
        
        runner.assertEqual(problem.operation, 'multiplication', 'Should have correct operation');
        runner.assert(problem.question.includes('×'), 'Question should contain multiplication sign');
        
        // Verify answer is correct
        const [a, b] = problem.operands;
        runner.assertEqual(problem.answer, a * b, 'Answer should be product of operands');
    });

    runner.test('generateDivision creates valid problems', () => {
        const engine = new MathEngine();
        const config = { divisors: [2, 3, 4, 5] };
        const problem = engine.generateDivision(config);
        
        runner.assertEqual(problem.operation, 'division', 'Should have correct operation');
        runner.assert(problem.question.includes('÷'), 'Question should contain division sign');
        
        // Verify answer is correct and whole number
        const [dividend, divisor] = problem.operands;
        runner.assertEqual(problem.answer, dividend / divisor, 'Answer should be quotient');
        runner.assertEqual(dividend % divisor, 0, 'Division should result in whole number');
        runner.assert(config.divisors.includes(divisor), 'Divisor should be from allowed list');
    });

    runner.test('generateProblem returns valid problem structure', () => {
        const engine = new MathEngine();
        const problem = engine.generateProblem();
        
        // Check required properties
        runner.assert(problem.operation, 'Should have operation property');
        runner.assert(problem.question, 'Should have question property');
        runner.assertType(problem.answer, 'number', 'Should have numeric answer');
        runner.assert(Array.isArray(problem.operands), 'Should have operands array');
        runner.assertEqual(problem.difficulty, 'beginner', 'Should have difficulty property');
    });

    runner.test('validateAnswer works correctly', () => {
        const engine = new MathEngine();
        
        runner.assert(engine.validateAnswer(5, 5), 'Should validate correct answer');
        runner.assert(!engine.validateAnswer(5, 6), 'Should reject incorrect answer');
        runner.assert(!engine.validateAnswer('5', 5), 'Should reject string answers');
        runner.assert(!engine.validateAnswer(NaN, 5), 'Should reject NaN');
        runner.assert(!engine.validateAnswer(null, 5), 'Should reject null');
        
        // Test with tolerance
        runner.assert(engine.validateAnswer(5, 6, 1), 'Should accept answer within tolerance');
        runner.assert(!engine.validateAnswer(5, 8, 1), 'Should reject answer outside tolerance');
    });

    runner.test('generateProblemSet creates multiple problems', () => {
        const engine = new MathEngine();
        const problems = engine.generateProblemSet(5);
        
        runner.assertEqual(problems.length, 5, 'Should generate requested number of problems');
        
        problems.forEach((problem, index) => {
            runner.assert(problem.question, `Problem ${index + 1} should have question`);
            runner.assertType(problem.answer, 'number', `Problem ${index + 1} should have numeric answer`);
        });
    });

    runner.test('difficulty levels have different ranges', () => {
        const engine = new MathEngine();
        
        // Test beginner problems
        engine.setDifficulty('beginner');
        const beginnerProblems = engine.generateProblemSet(10, 'addition');
        
        // Test advanced problems  
        engine.setDifficulty('advanced');
        const advancedProblems = engine.generateProblemSet(10, 'addition');
        
        // Advanced should potentially have larger numbers
        const beginnerMax = Math.max(...beginnerProblems.flatMap(p => p.operands));
        const advancedMax = Math.max(...advancedProblems.flatMap(p => p.operands));
        
        runner.assert(beginnerMax <= 10, 'Beginner problems should use smaller numbers');
        // Note: Advanced could have same small numbers by chance, so we don't assert it's larger
    });

    runner.test('getCurrentDifficultyConfig returns config', () => {
        const engine = new MathEngine();
        const config = engine.getCurrentDifficultyConfig();
        
        runner.assert(config, 'Should return configuration');
        runner.assert(config.addition, 'Should have addition config');
        runner.assert(config.subtraction, 'Should have subtraction config');
        runner.assert(config.multiplication, 'Should have multiplication config');
        runner.assert(config.division, 'Should have division config');
    });

    runner.test('getAvailableDifficulties returns array', () => {
        const engine = new MathEngine();
        const difficulties = engine.getAvailableDifficulties();
        
        runner.assert(Array.isArray(difficulties), 'Should return array');
        runner.assert(difficulties.includes('beginner'), 'Should include beginner');
        runner.assert(difficulties.includes('intermediate'), 'Should include intermediate');
        runner.assert(difficulties.includes('advanced'), 'Should include advanced');
    });

    runner.test('generateThemedProblem adds theme', () => {
        const engine = new MathEngine();
        const problem = engine.generateThemedProblem('test-theme');
        
        runner.assertEqual(problem.theme, 'test-theme', 'Should add theme property');
        runner.assert(problem.question, 'Should still generate valid problem');
    });

    return runner.run();
}

// Auto-run tests if in browser environment
if (typeof window !== 'undefined' && window.MathEngine) {
    runMathEngineTests();
}

// Export for Node.js environment
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { runMathEngineTests, TestRunner };
}
