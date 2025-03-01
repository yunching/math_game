// Array to store the questions
let questions = [];
// Index of the current question
let currentQuestion = 0;
// Player's score
let score = 0;
// Start time of the game
let startTime;
// Interval for the timer
let timerInterval;
// Chart instance for displaying the score history
let chartInstance;

// Function to generate questions based on settings
function generateQuestions() {
    console.log('Generating questions...'); // Debugging line
    const additionEnabled = document.getElementById('addition').checked;
    const subtractionEnabled = document.getElementById('subtraction').checked;
    const multiplicationEnabled = document.getElementById('multiplication').checked;
    const divisionEnabled = document.getElementById('division').checked;

    const additionMin = parseInt(document.getElementById('additionMin').value);
    const additionMax = parseInt(document.getElementById('additionMax').value);
    const subtractionMin = parseInt(document.getElementById('subtractionMin').value);
    const subtractionMax = parseInt(document.getElementById('subtractionMax').value);
    const multiplicationMin = parseInt(document.getElementById('multiplicationMin').value);
    const multiplicationMax = parseInt(document.getElementById('multiplicationMax').value);
    const divisionMin = parseInt(document.getElementById('divisionMin').value);
    const divisionMax = parseInt(document.getElementById('divisionMax').value);
    const divisionDecimalPlace = parseInt(document.getElementById('divisionDecimalPlace').value);

    const additionLargerFirst = document.getElementById('additionLargerFirst').checked;
    const subtractionLargerFirst = document.getElementById('subtractionLargerFirst').checked;
    const multiplicationLargerFirst = document.getElementById('multiplicationLargerFirst').checked;
    const divisionLargerFirst = document.getElementById('divisionLargerFirst').checked;

    const operations = [];
    if (additionEnabled) operations.push('addition');
    if (subtractionEnabled) operations.push('subtraction');
    if (multiplicationEnabled) operations.push('multiplication');
    if (divisionEnabled) operations.push('division');

    let previousQuestion = null;

    for (let i = 0; i < 10; i++) {
        let question;
        do {
            const operation = operations[Math.floor(Math.random() * operations.length)];
            let num1, num2, answer;
            switch (operation) {
                case 'addition':
                    num1 = Math.floor(Math.random() * (additionMax - additionMin + 1)) + additionMin;
                    num2 = Math.floor(Math.random() * (additionMax - additionMin + 1)) + additionMin;
                    if (additionLargerFirst && num1 < num2) [num1, num2] = [num2, num1];
                    answer = num1 + num2;
                    break;
                case 'subtraction':
                    num1 = Math.floor(Math.random() * (subtractionMax - subtractionMin + 1)) + subtractionMin;
                    num2 = Math.floor(Math.random() * (subtractionMax - subtractionMin + 1)) + subtractionMin;
                    if (subtractionLargerFirst && num1 < num2) [num1, num2] = [num2, num1];
                    answer = num1 - num2;
                    break;
                case 'multiplication':
                    num1 = Math.floor(Math.random() * (multiplicationMax - multiplicationMin + 1)) + multiplicationMin;
                    num2 = Math.floor(Math.random() * (multiplicationMax - multiplicationMin + 1)) + multiplicationMin;
                    if (multiplicationLargerFirst && num1 < num2) [num1, num2] = [num2, num1];
                    answer = num1 * num2;
                    break;
                case 'division':
                    num1 = Math.floor(Math.random() * (divisionMax - divisionMin + 1)) + divisionMin;
                    num2 = Math.floor(Math.random() * (divisionMax - divisionMin + 1)) + divisionMin;
                    if (divisionLargerFirst && num1 < num2) [num1, num2] = [num2, num1];
                    answer = (num1 / num2).toFixed(divisionDecimalPlace);
                    break;
            }
            question = { num1, num2, answer, operation };
        } while (previousQuestion && JSON.stringify(question) === JSON.stringify(previousQuestion));

        questions.push(question);
        previousQuestion = question;
    }
    console.log('Questions generated:', questions); // Debugging line
}

// Function to display the current question
function displayQuestion() {
    console.log('Displaying question...'); // Debugging line
    const question = questions[currentQuestion];
    let questionText;
    switch (question.operation) {
        case 'addition':
            questionText = `What is ${question.num1} + ${question.num2}?`;
            break;
        case 'subtraction':
            questionText = `What is ${question.num1} - ${question.num2}?`;
            break;
        case 'multiplication':
            questionText = `What is ${question.num1} x ${question.num2}?`;
            break;
        case 'division':
            const decimalPlace = parseInt(document.getElementById('divisionDecimalPlace').value);
            questionText = `What is ${question.num1} / ${question.num2}? (Answer to ${decimalPlace} decimal places)`;
            break;
    }
    document.getElementById('question').innerText = questionText;
    console.log('Displayed question:', question); // Debugging line
}

// Function to update the timer display
function updateTimer() {
    const currentTime = new Date();
    const timeTaken = Math.floor((currentTime - startTime) / 1000);
    document.getElementById('timer').innerText = `Time: ${timeTaken} seconds`;
}

// Function to update the score display
function updateScore() {
    const totalQuestions = currentQuestion;
    const percentage = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;
    document.getElementById('currentScore').innerText = `${score} out of ${totalQuestions} (${percentage}%)`;
}

// Function to check the user's answer
function checkAnswer() {
    const userAnswer = parseFloat(document.getElementById('answer').value).toFixed(2);
    const correctAnswer = parseFloat(questions[currentQuestion].answer).toFixed(2);
    if (userAnswer === correctAnswer) {
        score++;
    } else {
        const decimalPlace = questions[currentQuestion].operation === 'division' ? parseInt(document.getElementById('divisionDecimalPlace').value) : 0;
        alert(`Incorrect! The correct answer is ${parseFloat(correctAnswer).toFixed(decimalPlace)}.`);
    }
    currentQuestion++;
    document.getElementById('answer').value = '';
    updateScore();
    if (currentQuestion < 10) {
        displayQuestion();
    } else {
        endGame();
    }
    // Automatically select the input box after submitting an answer
    document.getElementById('answer').focus();
}

// Function to skip the current question
function skipQuestion() {
    currentQuestion++;
    if (currentQuestion < 10) {
        displayQuestion();
    } else {
        endGame();
    }
    // Automatically select the input box after skipping a question
    document.getElementById('answer').focus();
}

// Function to end the game
function endGame() {
    clearInterval(timerInterval);
    const endTime = new Date();
    const timeTaken = roundTimeToNearestSecond((endTime - startTime) / 1000);
    document.getElementById('score').innerText = `You scored ${score} out of 10.`;
    document.getElementById('time').innerText = `Time taken: ${timeTaken} seconds.`;
    document.getElementById('game').style.display = 'none';
    document.getElementById('result').style.display = 'block';

    // Store score and time in local storage
    let history = JSON.parse(localStorage.getItem('history')) || [];
    history.push({ score, timeTaken });
    localStorage.setItem('history', JSON.stringify(history));

    // Update chart
    updateChart();

    // Stop the timer
    clearInterval(timerInterval);
}

// Function to start the game
function startGame() {
    console.log('Starting game...'); // Debugging line
    questions = [];
    currentQuestion = 0;
    score = 0;
    startTime = new Date();
    generateQuestions();
    displayQuestion();
    document.getElementById('game').style.display = 'block';
    document.getElementById('result').style.display = 'none';
    document.getElementById('chartContainer').style.display = 'none'; // Hide chart container
    updateScore();
    timerInterval = setInterval(updateTimer, 1000);
    document.getElementById('answer').focus(); // Automatically select the input box
    console.log('Game started'); // Debugging line
}

// Function to update the score chart
function updateChart() {
    const ctx = document.getElementById('scoreChart').getContext('2d');
    const history = JSON.parse(localStorage.getItem('history')) || [];
    const labels = history.map((_, index) => `Game ${index + 1}`);
    const scores = history.map(item => item.score);
    const times = history.map(item => item.timeTaken);

    if (chartInstance) {
        chartInstance.data.labels = labels;
        chartInstance.data.datasets[0].data = scores;
        chartInstance.data.datasets[1].data = times;
        chartInstance.update();
    } else {
        chartInstance = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Score (RHS)',
                        data: scores,
                        borderColor: 'rgba(75, 192, 192, 1)',
                        borderWidth: 1,
                        fill: false,
                        yAxisID: 'y1'
                    },
                    {
                        label: 'Time Taken (seconds, LHS)',
                        data: times,
                        borderColor: 'rgba(153, 102, 255, 1)',
                        borderWidth: 1,
                        fill: false,
                        yAxisID: 'y'
                    }
                ]
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true,
                        type: 'linear',
                        position: 'left',
                        id: 'y'
                    },
                    y1: {
                        beginAtZero: true,
                        type: 'linear',
                        position: 'right',
                        id: 'y1',
                        grid: {
                            drawOnChartArea: false
                        }
                    }
                }
            }
        });
    }

    document.getElementById('chartContainer').style.display = 'block';

    // Display statistics
    const highestScore = Math.max(...scores);
    const lowestScore = Math.min(...scores);
    const longestTime = Math.max(...times.map(roundTimeToNearestSecond));
    const shortestTime = Math.min(...times.map(roundTimeToNearestSecond));

    document.getElementById('highestScore').innerText = highestScore;
    document.getElementById('lowestScore').innerText = lowestScore;
    document.getElementById('longestTime').innerText = longestTime;
    document.getElementById('shortestTime').innerText = shortestTime;

    document.getElementById('chartStatsTable').style.display = 'table';
}

// Function to clear the score history
function clearHistory() {
    localStorage.removeItem('history');
    document.getElementById('chartContainer').style.display = 'none';
}

// Function to toggle settings visibility
function toggleSettings() {
    const settings = document.getElementById('settings');
    settings.style.display = settings.style.display === 'none' ? 'block' : 'none';
}

// Function to save settings
function saveSettings() {
    toggleSettings();
    startGame(); // Restart the game with new settings
}

// Function to round time values to the nearest second
function roundTimeToNearestSecond(time) {
    return Math.round(time);
}

// Use the roundTimeToNearestSecond function to round the time values
const timeElements = document.querySelectorAll('#time, #longestTime, #shortestTime');
timeElements.forEach(element => {
    const timeValue = parseFloat(element.textContent);
    if (!isNaN(timeValue)) {
        element.textContent = roundTimeToNearestSecond(timeValue) + ' seconds';
    }
});

// Event listener for the submit button
document.getElementById('submit').addEventListener('click', checkAnswer);
// Event listener for the restart button
document.getElementById('restart').addEventListener('click', startGame);
// Event listener for the clear history button
document.getElementById('clearHistory').addEventListener('click', clearHistory);

// Event listener for the skip button
document.getElementById('skip').addEventListener('click', skipQuestion);

// Event listener for the answer input field to check answer on Enter key press
document.getElementById('answer').addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        checkAnswer();
    }
});

// Event listener for keyboard navigation between result buttons
document.addEventListener('keydown', function(event) {
    const resultButtons = ['restart', 'clearHistory'];
    const currentIndex = resultButtons.findIndex(id => document.activeElement.id === id);

    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
        const nextIndex = (currentIndex + 1) % resultButtons.length;
        document.getElementById(resultButtons[nextIndex]).focus();
    } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
        const prevIndex = (currentIndex - 1 + resultButtons.length) % resultButtons.length;
        document.getElementById(resultButtons[prevIndex]).focus();
    }
});

document.addEventListener('keydown', function(event) {
    const mainScreenElements = ['answer', 'skip', 'submit'];
    const currentIndex = mainScreenElements.findIndex(id => document.activeElement.id === id);

    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
        const nextIndex = (currentIndex + 1) % mainScreenElements.length;
        document.getElementById(mainScreenElements[nextIndex]).focus();
    } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
        const prevIndex = (currentIndex - 1 + mainScreenElements.length) % mainScreenElements.length;
        document.getElementById(mainScreenElements[prevIndex]).focus();
    }
});

// Start the game when the script is loaded
startGame();