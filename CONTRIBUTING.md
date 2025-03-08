# Contributing to Quick Math Game

Thank you for considering contributing to Quick Math Game! Here are some guidelines to help you get started.

## Prerequisites

- Python 3.x
- pip (Python package installer)
- Google Chrome
- ChromeDriver (Ensure it's in your system's PATH)

## Setting Up the Project

1. Clone the repository:

   ```sh
   git clone <repository-url>
   cd Multiplier-game
   ```

2. Create a virtual environment:

   ```sh
   python -m venv venv
   source venv/bin/activate  # On Windows use `venv\Scripts\activate`
   ```

3. Install the required Python packages:

   ```sh
   pip install -r requirements.txt
   ```

## Running Tests

We use Selenium for testing the HTML files. Follow these steps to run the tests:

1. Ensure you have Google Chrome and ChromeDriver installed.

2. Run the test script:

   ```sh
   python test_game.py
   ```

This will execute the Selenium tests and provide you with the results.

## Writing Tests

When writing tests, please follow these guidelines:

- Place your test scripts in the root directory.
- Use Selenium to interact with the HTML elements and verify their functionality.
- Ensure your tests are idempotent and can run independently of each other.

## Submitting Changes

1. Fork the repository.
2. Create a new branch for your feature or bugfix:

   ```sh
   git checkout -b my-feature-branch
   ```

3. Make your changes and commit them with a clear message:

   ```sh
   git commit -m "Description of my changes"
   ```

4. Push your changes to your fork:

   ```sh
   git push origin my-feature-branch
   ```

5. Open a pull request on the main repository.

## Code of Conduct

Please adhere to the [Code of Conduct](CODE_OF_CONDUCT.md) in all your interactions with the project.

Thank you for contributing!
