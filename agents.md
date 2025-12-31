# Agent Guide

## Project overview
This repository hosts a simple browser-based quick math game. The UI is defined in `index.html` with styling in `styles.css`, and gameplay logic in `script.js`. A tiny Node HTTP server (`server.js`) serves the static files for local development.

## Common commands
- Start the local server:
  - `node server.js` (serves on http://localhost:8080)
- Windows helper script:
  - `start-server.bat`

## Tests
- UI smoke tests (Selenium):
  - `python test_game.py`
  - Requires Chrome and compatible chromedriver (managed via `webdriver_manager`).

## Project layout
- `index.html`: main page markup.
- `styles.css`: game styling.
- `script.js`: question generation, scoring, timer, and settings logic.
- `server.js`: static file server for local development.
- `test_game.py`: Selenium-based UI tests.

## Notes
- The game uses settings inputs in the DOM to configure question generation; keep IDs stable (`addition`, `subtraction`, `multiplication`, `division`, etc.).
- If you update the UI, ensure the Selenium tests still locate the expected elements.
