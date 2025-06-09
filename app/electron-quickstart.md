# Magic Lantern Desktop App - Quick Reference
## 🚀 Launch the App

```bash
# Start the Electron app:
electron .

# Or use npm scripts:
npm start

# For development mode with extra logging:
NODE_ENV=development electron .
# or
npm run dev
```

## 📦 First Time Setup

```bash
# Clone the repo if needed
git clone https://github.com/nonmodernist/magic-lantern.git
cd magic-lantern

# No npm install needed! Magic Lantern uses only built-in modules
# But Electron needs to be installed for the desktop app:
npm install --save-dev electron
```