let questions = [];
let currentQuestion = 0;
let score = 0;
let startTime;
let timerInterval;
let chartInstance;

function generateQuestions() {
    console.log('Generating questions...'); // Debugging line
    for (let i = 0; i < 10; i++) {
        let num1, num2, answer;
        do {
            num1 = Math.floor(Math.random() * 11) + 2;
            num2 = Math.floor(Math.random() * 11) + 2;
            answer = num1 * num2;
        } while (i > 0 && questions[i - 1].num1 === num1 && questions[i - 1].num2 === num2);
        questions.push({ num1, num2, answer });
    }
    console.log('Questions generated:', questions); // Debugging line
}

function displayQuestion() {
    console.log('Displaying question...'); // Debugging line
    const question = questions[currentQuestion];
    document.getElementById('question').innerText = `What is ${question.num1} x ${question.num2}?`;
    console.log('Displayed question:', question); // Debugging line
}

function updateTimer() {
    const currentTime = new Date();
    const timeTaken = Math.floor((currentTime - startTime) / 1000);
    document.getElementById('timer').innerText = `Time: ${timeTaken} seconds`;
}

function updateScore() {
    const totalQuestions = currentQuestion;
    const percentage = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;
    document.getElementById('currentScore').innerText = `${score} out of ${totalQuestions} (${percentage}%)`;
}

function checkAnswer() {
    const userAnswer = parseInt(document.getElementById('answer').value);
    const correctAnswer = questions[currentQuestion].answer;
    if (userAnswer === correctAnswer) {
        score++;
    } else {
        alert(`Incorrect! The correct answer is ${correctAnswer}.`);
    }
    currentQuestion++;
    document.getElementById('answer').value = '';
    updateScore();
    if (currentQuestion < 10) {
        displayQuestion();
    } else {
        endGame();
    }
}

function endGame() {
    clearInterval(timerInterval);
    const endTime = new Date();
    const timeTaken = (endTime - startTime) / 1000;
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
}

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
    const longestTime = Math.max(...times);
    const shortestTime = Math.min(...times);

    document.getElementById('highestScore').innerText = highestScore;
    document.getElementById('lowestScore').innerText = lowestScore;
    document.getElementById('longestTime').innerText = longestTime;
    document.getElementById('shortestTime').innerText = shortestTime;

    document.getElementById('chartStatsTable').style.display = 'table';
}

function clearHistory() {
    localStorage.removeItem('history');
    document.getElementById('chartContainer').style.display = 'none';
}

document.getElementById('submit').addEventListener('click', checkAnswer);
document.getElementById('restart').addEventListener('click', startGame);
document.getElementById('clearHistory').addEventListener('click', clearHistory);

document.getElementById('answer').addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        checkAnswer();
    }
});

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

startGame();