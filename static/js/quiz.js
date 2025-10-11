document.addEventListener('DOMContentLoaded', () => {
    let questionBank = {};

    const startBox = document.getElementById('start-box');
    const quizBox = document.getElementById('quiz-box');
    const resultBox = document.getElementById('result-box');
    const topicSelect = document.getElementById('topic');
    const difficultySelect = document.getElementById('difficulty');
    const startBtn = document.getElementById('start-btn');
    const nextBtn = document.getElementById('next-btn');
    const restartBtn = document.getElementById('restart-btn');
    const quizTitle = document.getElementById('quiz-title');
    const questionEl = document.getElementById('question');
    const optionsEl = document.getElementById('options');
    const feedbackEl = document.getElementById('feedback');
    const resultTextEl = document.getElementById('result-text');
    const timeEl = document.getElementById('time');
    const yearEl = document.getElementById('year');

    let quizQuestions = [];
    let currentIndex = 0;
    let score = 0;
    let timer;
    let timeLeft = 60;

    async function loadQuestions() {
        try {
            const response = await fetch('../data/questions.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            questionBank = await response.json();
            startBtn.disabled = false;
            startBtn.textContent = 'Start Quiz';
        } catch (error) {
            console.error("Could not load the questions:", error);
            startBox.innerHTML = '<h2>Error</h2><p>Could not load quiz questions. Please check the file path or network connection and try again.</p>';
        }
    }

    function startQuiz() {
        const topic = topicSelect.value;
        const difficulty = difficultySelect.value;

        if (!questionBank[topic] || !questionBank[topic][difficulty]) {
            alert('No questions available for this selection. Please try another.');
            return;
        }

        const allQuestions = questionBank[topic][difficulty];
        quizQuestions = [...allQuestions].sort(() => 0.5 - Math.random()).slice(0, 10);
        
        score = 0;
        currentIndex = 0;
        timeLeft = 60;

        startBox.style.display = 'none';
        resultBox.style.display = 'none';
        quizBox.style.display = 'block';
        quizBox.classList.add('fadeIn');
        
        let topicName = topic.charAt(0).toUpperCase() + topic.slice(1).replace('fire', ' Fire').replace('cyclones', 'Cyclone');
        quizTitle.textContent = `${topicName} — ${difficulty.toUpperCase()} Quiz`;

        showQuestion();
        startTimer();
    }

    function startTimer() {
        clearInterval(timer);
        timeEl.textContent = timeLeft;
        timer = setInterval(() => {
            timeLeft--;
            timeEl.textContent = timeLeft;
            if (timeLeft < 0) {
                clearInterval(timer);
                showResult(true);
            }
        }, 1000);
    }

    function showQuestion() {
        const q = quizQuestions[currentIndex];
        questionEl.textContent = `${currentIndex + 1}. ${q.q}`;
        optionsEl.innerHTML = '';
        
        q.options.forEach(opt => {
            const btn = document.createElement('button');
            btn.textContent = opt;
            btn.onclick = () => checkAnswer(opt, btn);
            optionsEl.appendChild(btn);
        });

        feedbackEl.textContent = '';
        nextBtn.style.display = 'none';
    }

    function checkAnswer(selected, btnEl) {
        const q = quizQuestions[currentIndex];
        
        document.querySelectorAll('.options button').forEach(b => {
            b.disabled = true;
            if (b.textContent === q.answer) {
                b.classList.add('correct');
            }
        });
        
        if (selected === q.answer) {
            score++;
            feedbackEl.textContent = "✅ Correct!";
            feedbackEl.style.color = "var(--success)";
        } else {
            btnEl.classList.add('incorrect');
            feedbackEl.textContent = `❌ Incorrect!`;
            feedbackEl.style.color = "var(--danger)";
        }
        
        nextBtn.style.display = 'inline-block';
    }

    function nextQuestion() {
        currentIndex++;
        if (currentIndex < quizQuestions.length) {
            showQuestion();
        } else {
            showResult(false);
        }
    }

    function showResult(timeOver = false) {
        clearInterval(timer);
        quizBox.style.display = 'none';
        resultBox.style.display = 'block';
        resultBox.classList.add('fadeIn');
        
        const percentage = quizQuestions.length > 0 ? (score / quizQuestions.length) * 100 : 0;
        let message = timeOver ? `⏰ Time's up! ` : '';
        message += `You scored ${score} out of ${quizQuestions.length} (${percentage.toFixed(0)}%).`;
        
        if (percentage >= 80) {
            message += " Excellent work!";
        } else if (percentage >= 50) {
            message += " Good job!";
        } else {
            message += " Keep practicing!";
        }

        resultTextEl.textContent = message;

        saveQuizHistory();
        awardQuizBadges(); // NEW FUNCTION CALL
    }

    function saveQuizHistory() {
        const topic = topicSelect.value;
        const difficulty = difficultySelect.value;
        const topicName = topic.charAt(0).toUpperCase() + topic.slice(1).replace('fire', ' Fire').replace('cyclones', 'Cyclone');

        const resultData = {
            name: `${topicName} (${difficulty})`,
            date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
            score: `${score} / ${quizQuestions.length}`
        };

        const history = JSON.parse(localStorage.getItem('ResQEdQuizHistory')) || [];
        history.unshift(resultData);
        localStorage.setItem('ResQEdQuizHistory', JSON.stringify(history));
    }

    function awardQuizBadges() {
        const topic = topicSelect.value;
        const difficulty = difficultySelect.value;
        const topicName = topic.charAt(0).toUpperCase() + topic.slice(1).replace('fire', ' Fire').replace('cyclones', 'Cyclone');
        
        let earnedBadges = JSON.parse(localStorage.getItem('ResQEdQuizBadges')) || {};

        const badgeDetails = {
            quizName: topicName,
            difficulty: difficulty.charAt(0).toUpperCase() + difficulty.slice(1)
        };

        if (score >= 9) {
            earnedBadges.gold = badgeDetails;
        } else if (score >= 7) {
            earnedBadges.silver = badgeDetails;
        } else if (score >= 5) {
            earnedBadges.bronze = badgeDetails;
        }

        localStorage.setItem('ResQEdQuizBadges', JSON.stringify(earnedBadges));
    }

    function restartQuiz() {
        resultBox.style.display = 'none';
        startBox.style.display = 'block';
        startBox.classList.add('fadeIn');
    }

    startBtn.disabled = true;
    startBtn.textContent = 'Loading Questions...';
    loadQuestions();

    startBtn.addEventListener('click', startQuiz);
    nextBtn.addEventListener('click', nextQuestion);
    restartBtn.addEventListener('click', restartQuiz);
    
    if (yearEl) {
        yearEl.textContent = new Date().getFullYear();
    }
});
