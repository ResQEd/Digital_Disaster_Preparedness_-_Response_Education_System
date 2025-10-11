document.addEventListener('DOMContentLoaded', () => {
    
    const PROGRESS_KEY = 'ResQEdProgressData';

    const COURSE_TOTALS = {
        floods: 7,
        earthquakes: 7,
        landslides: 6,
        forestFires: 7,
        tsunami: 7,
        cyclones: 8,
        chemical: 10,
        biological: 11,
        nuclear: 11
    };

    function getProgress() {
        const data = localStorage.getItem(PROGRESS_KEY);
        if (data) {
            const progress = JSON.parse(data);
            progress.courseTotals = COURSE_TOTALS;
            return progress;
        }
        return {
            moduleStatus: {},
            courseTotals: COURSE_TOTALS
        };
    }

    function saveProgress(progressData) {
        localStorage.setItem(PROGRESS_KEY, JSON.stringify(progressData));
    }

    function getCourseKeyFromTitle(title) {
        const lowerCaseTitle = title.toLowerCase();
        if (lowerCaseTitle.includes('flood')) return 'floods';
        if (lowerCaseTitle.includes('earthquake')) return 'earthquakes';
        if (lowerCaseTitle.includes('landslide')) return 'landslides';
        if (lowerCaseTitle.includes('forest fire')) return 'forestFires';
        if (lowerCaseTitle.includes('tsunami')) return 'tsunami';
        if (lowerCaseTitle.includes('cyclone')) return 'cyclones';
        if (lowerCaseTitle.includes('chemical')) return 'chemical';
        if (lowerCaseTitle.includes('biological')) return 'biological';
        if (lowerCaseTitle.includes('nuclear')) return 'nuclear';
        return null;
    }

    function getPageCourseKey() {
        const pageTitleEl = document.querySelector('h1');
        if (!pageTitleEl) return null;
        return getCourseKeyFromTitle(pageTitleEl.textContent);
    }

    const courseAccordion = document.querySelector('.course-accordion');
    if (courseAccordion) {
        const progress = getProgress();
        const pageCourseKey = getPageCourseKey();

        if (pageCourseKey) {
            const completeButtons = courseAccordion.querySelectorAll('.module-complete button');
            completeButtons.forEach((button, index) => {
                const moduleId = `${pageCourseKey}_module_${index}`;
                
                if (progress.moduleStatus[moduleId]) {
                    button.textContent = '✅ Completed';
                    button.disabled = true;
                }

                button.addEventListener('click', () => {
                    button.textContent = '✅ Completed';
                    button.disabled = true;
                    progress.moduleStatus[moduleId] = true;
                    saveProgress(progress);
                    alert('Progress saved!');
                });
            });
        }
    }

    const dashboardContainer = document.querySelector('.dashboard-container');
    if (dashboardContainer) {
        const resetButton = document.getElementById('resetProgressBtn');
        if (resetButton) {
            resetButton.addEventListener('click', () => {
                if (confirm('Are you sure you want to reset all course and quiz progress? This cannot be undone.')) {
                    localStorage.removeItem(PROGRESS_KEY);
                    localStorage.removeItem('ResQEdQuizHistory');
                    alert('All progress has been reset.');
                    location.reload();
                }
            });
        }

        const progress = getProgress();
        const completedCounts = {};
        Object.keys(COURSE_TOTALS).forEach(key => { completedCounts[key] = 0; });

        for (const moduleId in progress.moduleStatus) {
            if (progress.moduleStatus[moduleId]) {
                const courseKey = moduleId.split('_')[0];
                if (completedCounts.hasOwnProperty(courseKey)) {
                    completedCounts[courseKey]++;
                }
            }
        }

        for (const courseKey in completedCounts) {
            const completed = completedCounts[courseKey];
            const total = progress.courseTotals[courseKey];
            const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
            const courseItem = Array.from(document.querySelectorAll('.course-item h4'))
                                    .find(h4 => getCourseKeyFromTitle(h4.textContent) === courseKey);
            
            if (courseItem) {
                const parent = courseItem.parentElement;
                const progressBar = parent.querySelector('.progress-bar');
                const link = parent.querySelector('a');
                if (progressBar) progressBar.style.width = `${percentage}%`;
                if(link) {
                    if (percentage === 100) link.innerHTML = "Review <i class='bx bx-right-arrow-alt'></i>";
                    else if (percentage > 0) link.innerHTML = "Continue <i class='bx bx-right-arrow-alt'></i>";
                    else link.innerHTML = "Start Now <i class='bx bx-right-arrow-alt'></i>";
                }
            }
        }

        let totalCompleted = Object.values(completedCounts).reduce((a, b) => a + b, 0);
        let totalModules = Object.values(progress.courseTotals).reduce((a, b) => a + b, 0);
        const overallPercentage = totalModules > 0 ? Math.round((totalCompleted / totalModules) * 100) : 0;
        const overallProgressBar = document.querySelector('.progress-overview-card .progress-bar');
        if (overallProgressBar) {
            overallProgressBar.style.width = `${overallPercentage}%`;
            overallProgressBar.textContent = `${overallPercentage}%`;
        }

        function displayQuizHistory() {
            const historyTable = document.querySelector('.quiz-history-table');
            if (!historyTable) return;

            const history = JSON.parse(localStorage.getItem('ResQEdQuizHistory')) || [];
            let historyTableBody = historyTable.querySelector('tbody');

            if (history.length === 0) {
                historyTableBody.innerHTML = '<tr><td colspan="3" style="text-align:center;">No quizzes taken yet.</td></tr>';
            } else {
                if (!historyTable.querySelector('thead')) {
                     historyTable.innerHTML = `<thead><tr><th>Quiz Name</th><th>Date</th><th>Score</th></tr></thead><tbody></tbody>`;
                     historyTableBody = historyTable.querySelector('tbody');
                }
                historyTableBody.innerHTML = '';
                
                history.forEach(result => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${result.name}</td>
                        <td>${result.date}</td>
                        <td>${result.score}</td>
                    `;
                    historyTableBody.appendChild(row);
                });
            }
        }

        function displayLeaderboard() {
            const leaderboardList = document.querySelector('.leaderboard-list');
            if (!leaderboardList) return;

            const mockUsers = [
                { name: "Ravi Kumar", score: 95 },
                { name: "Anjali Mehta", score: 82 },
                { name: "Suresh Gupta", score: 68 },
                { name: "Priya Singh", score: 55 }
            ];

            const quizHistory = JSON.parse(localStorage.getItem('ResQEdQuizHistory')) || [];
            let currentUserScore = 0;
            if (quizHistory.length > 0) {
                const totalPercentage = quizHistory.reduce((sum, result) => {
                    const parts = result.score.split(' / ');
                    const score = parseInt(parts[0]);
                    const total = parseInt(parts[1]);
                    return sum + (score / total * 100);
                }, 0);
                currentUserScore = Math.round(totalPercentage / quizHistory.length);
            }
            
            const currentUser = { name: "Tester (You)", score: currentUserScore };

            const allScores = [...mockUsers, currentUser].sort((a, b) => b.score - a.score);
            
            leaderboardList.innerHTML = '';

            allScores.forEach((user, index) => {
                const rank = index + 1;
                const li = document.createElement('li');
                
                if (user.name === "Tester (You)") {
                    li.classList.add('current-user');
                }
                
                li.innerHTML = `
                    <span class="rank">${rank}.</span>
                    <span class="name">${user.name}</span>
                    <span class="score">${user.score} pts</span>
                `;
                leaderboardList.appendChild(li);
            });
        }

        displayQuizHistory();
        displayLeaderboard();
    }
    
    const yearEl = document.getElementById('year');
    if (yearEl) {
        yearEl.textContent = new Date().getFullYear();
    }
});