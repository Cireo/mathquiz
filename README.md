# 🌟 Math Quiz Adventure! 🌟

An engaging, interactive math quiz game designed for elementary school children. Practice basic arithmetic with cute visual effects, streak counters, and achievements that make learning math fun!

![Math Quiz Adventure](https://img.shields.io/badge/Grade-Elementary-brightgreen) ![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-yellow) ![No Dependencies](https://img.shields.io/badge/Dependencies-None-blue) ![Local Storage](https://img.shields.io/badge/Storage-Local-purple)

## ✨ Features

### 🎯 Core Math Practice
- **Addition**: 1-2 digit numbers
- **Subtraction**: 1-digit and low 2-digit numbers  
- **Multiplication**: Times tables 0-12
- **Division**: Simple division and inverse operations

### 🎮 Engaging Elements
- **Three Difficulty Levels**: Beginner, Intermediate, Advanced
- **Visual Effects**: Confetti, sparkles, and cute animations
- **Streak Counter**: Track consecutive correct answers with fire effects
- **Achievement System**: Unlock badges for milestones
- **Progress Tracking**: Local storage saves high scores and statistics
- **Colorful UI**: Child-friendly design with encouraging feedback

### 🚀 Technical Features
- **No Dependencies**: Pure vanilla JavaScript
- **Responsive Design**: Works on desktop and tablets
- **Accessibility**: Reduced motion support
- **Local Storage**: Progress persists between sessions
- **Clean Architecture**: Well-separated concerns for easy extension

## 🎲 How to Play

1. **Choose Your Level**
   - 🌱 **Beginner**: Single digits & easy times tables
   - 🌿 **Intermediate**: Two digits & more times tables  
   - 🌳 **Advanced**: Mixed operations & division

2. **Solve Problems**
   - Math problems appear on screen
   - Type your answer and click "Check Answer!"
   - Get immediate feedback with fun animations

3. **Build Streaks**
   - Answer correctly to build your streak
   - Streak bonuses give extra points
   - 🔥 Fire effects appear at streak 3+

4. **Level Up**
   - Complete 10 problems to advance levels
   - Unlock achievements and celebrate success!

## 🛠 Setup & Installation

### Quick Start (Recommended)

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/mathquiz.git
   cd mathquiz
   ```

2. **Open in browser**
   ```bash
   # Simply open index.html in your web browser
   open index.html  # macOS
   # or double-click index.html file
   ```

3. **Start playing!**
   - No installation required
   - No server setup needed
   - Works offline

### Alternative: Web Server (Optional)

If you prefer running with a web server:

```bash
# Python 3
python -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000

# Node.js (if you have http-server installed)
npx http-server

# Then visit http://localhost:8000
```

## 🧪 Testing

Run the test suite to verify everything works correctly:

1. **Open test runner**
   ```bash
   open tests/test-runner.html
   ```

2. **Run tests in browser**
   - Click "Run All Tests" for complete test suite
   - Or run individual component tests
   - View detailed results in the console

3. **Test coverage**
   - ✅ Math engine problem generation
   - ✅ Answer validation
   - ✅ Game state management
   - ✅ Scoring and achievements
   - ✅ UI interactions

## 📁 Project Structure

```
mathquiz/
├── index.html              # Main game interface
├── PLAN.md                 # Detailed project plan
├── README.md               # This file
├── src/
│   ├── js/
│   │   ├── game.js         # Main game controller
│   │   ├── math-engine.js  # Math problem generation
│   │   ├── ui.js           # User interface handling
│   │   ├── storage.js      # Local storage management
│   │   └── animations.js   # Visual effects & animations
│   ├── css/
│   │   ├── main.css        # Main styles
│   │   └── animations.css  # Animation styles
│   ├── images/             # Game images (future)
│   └── sounds/             # Sound effects (future)
└── tests/
    ├── test-runner.html    # Browser test runner
    ├── math-engine.test.js # Math engine tests
    └── game.test.js        # Game logic tests
```

## 🎨 Customization

### Adding New Difficulty Levels

Edit `src/js/math-engine.js` to add custom difficulty configurations:

```javascript
// Add to difficulties object
custom: {
    addition: { min: 1, max: 999, digits: 3 },
    subtraction: { min: 1, max: 500, digits: 3 },
    multiplication: { min: 0, max: 20 },
    division: { divisors: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] }
}
```

### Customizing Visual Effects

Modify `src/css/animations.css` to adjust animations:

```css
/* Change confetti colors */
.confetti-particle.square {
    background: #your-color;
}

/* Adjust animation speed */
.bounce {
    animation-duration: 0.5s; /* Faster bounce */
}
```

### Adding New Achievements

Extend the achievements array in `src/js/game.js`:

```javascript
{ 
    id: 'speed_demon', 
    name: 'Speed Demon!', 
    description: 'Answer 5 problems in 60 seconds',
    icon: '⚡' 
}
```

## 🔧 Browser Compatibility

- ✅ **Chrome** 60+
- ✅ **Firefox** 55+  
- ✅ **Safari** 11+
- ✅ **Edge** 79+

**Features used:**
- ES6+ JavaScript (classes, arrow functions, destructuring)
- CSS Grid & Flexbox
- Local Storage API
- CSS Animations & Transitions

## 🎯 Educational Value

### Math Skills Developed
- **Number Recognition**: Visual number patterns
- **Basic Operations**: Addition, subtraction, multiplication, division
- **Mental Math**: Quick calculation skills
- **Problem Solving**: Strategic thinking about numbers

### Cognitive Benefits  
- **Pattern Recognition**: Number relationships
- **Memory**: Remembering math facts
- **Attention**: Focused problem solving
- **Persistence**: Building through levels

## 🚀 Future Enhancements

See [PLAN.md](PLAN.md) for detailed future features:

- **More Operations**: Fractions, decimals, word problems
- **Adaptive Difficulty**: AI-powered difficulty adjustment
- **Multiplayer Mode**: Local multiplayer competitions  
- **Educational Content**: Mini-lessons and explanations
- **Sound Effects**: Audio feedback and background music
- **Themes**: Different visual themes and characters
- **Mobile App**: Native mobile versions

## 🤝 Contributing

We welcome contributions! Here's how you can help:

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Run tests**: Open `tests/test-runner.html` and verify all pass
4. **Commit changes**: `git commit -m 'Add amazing feature'`
5. **Push to branch**: `git push origin feature/amazing-feature`
6. **Open Pull Request**

### Development Guidelines
- Maintain clean, commented code
- Follow existing code style
- Add tests for new features
- Ensure accessibility compliance
- Test across different browsers

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- **Comic Sans MS** font for that authentic elementary school feel
- **CSS Animations** for engaging visual feedback
- **Local Storage API** for persistence without servers
- **Elementary educators** for inspiration on what makes math fun

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/mathquiz/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/mathquiz/discussions)
- **Email**: your.email@example.com

---

**Made with ❤️ for young mathematicians everywhere!** 

*Let's make math fun, one problem at a time!* 🔢✨
