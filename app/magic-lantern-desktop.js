// magic-lantern-desktop.js
// Wrapper to safely load Magic Lantern for desktop use

// Temporarily override process.argv to prevent CLI auto-execution
const originalArgv = process.argv
process.argv = ['node', 'app/magic-lantern-desktop.js'] // Fake non-CLI args

// Now safely require the main module
const MagicLantern = require('../core/magic-lantern-v5')

// Restore original argv
process.argv = originalArgv

// Export just what we need for desktop use
module.exports = {
  UnifiedMagicLantern: MagicLantern,
  // Add other exports if needed
}