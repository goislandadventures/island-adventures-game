# Temporary splash theme

For local development only, export the temporary test song as MP3 and place it here as:

`public/audio/splash-theme.mp3`

The current development reference is Online Sequencer sequence #434508.

Do not commit that copyrighted audio file to this public repository.

The splash player is deliberately isolated behind `src/ui/Splash.tsx`. Replacing the final theme later requires only replacing the asset file while keeping the same filename.

The theme:
- plays only on the opening splash screen
- attempts autoplay when browser policy permits
- offers a tap-to-enable-sound fallback
- loops only while the splash screen is open
- fades and stops when entering the game
- never plays during gameplay
