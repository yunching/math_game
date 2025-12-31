# Quick Math Game

Quick Math Game is a lightweight, browser-based arithmetic practice game. It generates random math questions based on the operations you enable, tracks your score, and runs against a countdown timer.

## Features
- Choose which operations to practice: addition, subtraction, multiplication, and division.
- Adjustable difficulty options for question ranges.
- Countdown timer with score tracking.
- Works as a simple static site served by the included Node server.

## Getting Started

### Run locally
1. Install Node.js.
2. Start the local server:

```bash
node server.js
```

3. Open http://localhost:8080 in your browser.

### Static hosting
You can also serve the files (`index.html`, `styles.css`, `script.js`, and assets) from any static host. The included `server.js` is only for local development.

## How to Play
1. Open the game in your browser.
2. Select the operations you want to practice.
3. Adjust any available settings (like difficulty or timer).
4. Click the start button to begin.
5. Answer as many questions as possible before the timer ends.

## Project Structure
- `index.html`: Page structure and controls.
- `styles.css`: Visual styling for the game.
- `script.js`: Game logic for question generation, scoring, and timing.
- `server.js`: Local static file server.
- `manifest.json`, `sw.js`: Progressive web app support.
- `test_game.py`: Selenium UI smoke tests.

## Tests
Run the Selenium smoke test (requires Chrome and compatible chromedriver):

```bash
pip install -r requirements.txt
python test_game.py
```

## License
See the repository license file if provided.
