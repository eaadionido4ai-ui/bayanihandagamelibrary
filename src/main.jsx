import { createRoot } from 'react-dom/client';
// Fonts are bundled so the app works offline. Latin only: the app is in English.
import '@fontsource/baloo-2/latin-600.css';
import '@fontsource/baloo-2/latin-700.css';
import '@fontsource/baloo-2/latin-800.css';
import '@fontsource/nunito/latin-600.css';
import '@fontsource/nunito/latin-700.css';
import '@fontsource/nunito/latin-800.css';
import '@fontsource/nunito/latin-900.css';
import '@fontsource/nunito/latin-800-italic.css';
import './styles.css';
import './engine/game-hud.css';
import { engine } from './engine/bridge.js';
import Shell from './Shell.jsx';

// Module scripts run before DOMContentLoaded, which is when the game engine boots
// and wires its buttons, so the in-game screens and App patches are in place first.
engine.install();

createRoot(document.getElementById('root')).render(<Shell />);
