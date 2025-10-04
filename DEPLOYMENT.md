# GitHub Pages Deployment Guide

This Math Quiz game is ready to be deployed to GitHub Pages as a single-page web application.

## Quick Setup

1. **Push to GitHub**: Make sure your repository is on GitHub
2. **Enable GitHub Pages**: 
   - Go to your repository settings
   - Navigate to "Pages" in the left sidebar
   - Under "Source", select "GitHub Actions"
3. **Deploy**: Push to the `main` branch and the deployment will happen automatically

## What's Included

- **GitHub Actions Workflow** (`.github/workflows/deploy.yml`): Automatically deploys on push to main branch
- **Static Files**: All HTML, CSS, and JavaScript files are served directly
- **Client-Side Storage**: Uses localStorage for game progress (no server required)

## File Structure

```
/
├── index.html              # Main entry point
├── src/
│   ├── css/
│   │   ├── main.css       # Main styles
│   │   └── animations.css  # Animation styles
│   └── js/
│       ├── game.js        # Main game controller
│       ├── ui.js          # UI management
│       ├── storage.js     # Local storage handling
│       ├── math-engine.js # Problem generation
│       ├── minigame.js    # Battle system
│       ├── lessons.js     # Interactive lessons
│       └── animations.js  # Visual effects
└── .github/workflows/
    └── deploy.yml         # GitHub Pages deployment
```

## Features That Work on GitHub Pages

✅ **Client-side only** - No server required  
✅ **Local storage** - Game progress persists  
✅ **Static assets** - All CSS, JS, and HTML served directly  
✅ **Responsive design** - Works on mobile and desktop  
✅ **Interactive lessons** - All functionality preserved  
✅ **Character unlocks** - Progress saved locally  

## Access Your Deployed App

After deployment, your app will be available at:
`https://[username].github.io/[repository-name]/`

For example: `https://rprice.github.io/mathquiz/`

## Development vs Production

No changes needed between development and production - the app works identically in both environments since it's entirely client-side.

## Troubleshooting

- **404 errors**: Make sure `index.html` is in the root directory
- **Deployment fails**: Check that GitHub Actions are enabled in your repository settings
- **Assets not loading**: Verify all file paths are relative (they already are in this project)
