document.addEventListener('DOMContentLoaded', () => {
    
    // --- KEY DEFINITIONS ---
    const PROGRESS_KEY = 'ResQEdProgressData';
    const QUIZ_BADGES_KEY = 'ResQEdQuizBadges';
    const QUIZ_HISTORY_KEY = 'ResQEdQuizHistory';

    const COURSE_TOTALS = {
        floods: 7, earthquakes: 7, landslides: 6, forestFires: 7,
        tsunami: 7, cyclone: 8, chemical: 10, biological: 11, nuclear: 11
    };
    
    const BADGE_DATA = {
        floods: { icon: 'bxs-droplet', title: 'Flood Expert' },
        earthquakes: { icon: 'bxs-buildings', title: 'Earthquake Expert' },
        landslides: { icon: 'bxs-landscape', title: 'Landslide Expert' },
        forestFires: { icon: 'bxs-hot', title: 'Forest Fire Expert' },
        tsunami: { icon: 'bxs-water', title: 'Tsunami Expert' },
        cyclones: { icon: 'bxs-tornado', title: 'Cyclone Expert' },
        chemical: { icon: 'bxs-flask', title: 'Chemical Expert' },
        biological: { icon: 'bxs-virus', title: 'Biological Expert' },
        nuclear: { icon: 'bxs-radiation', title: 'Nuclear Expert' }
    };

    // --- HELPER FUNCTIONS ---

    function getProgress() {
        const data = localStorage.getItem(PROGRESS_KEY);
        if (data) {
            const progress = JSON.parse(data);
            progress.courseTotals = COURSE_TOTALS; // Always use the latest totals
            return progress;
        }
        return { moduleStatus: {}, courseTotals: COURSE_TOTALS };
    }

    function saveProgress(progressData) {
        localStorage.setItem(PROGRESS_KEY, JSON.stringify(progressData));
    }

    function getCourseKeyFromTitle(title) {
        const lowerCaseTitle = title.toLowerCase();
        if (lowerCaseTitle.includes('forest fire')) return 'forestFires';

        for (const key in BADGE_DATA) {
            let singularKey = key.endsWith('s') ? key.slice(0, -1) : key;
            if (lowerCaseTitle.includes(singularKey)) {
                return key;
            }
        }
        return null;
    }

    // --- LOGIC FOR COURSE PAGES (CORRECTED) ---

    const courseAccordion = document.querySelector('.course-accordion');
    if (courseAccordion) {
        const progress = getProgress();
        // Determine the course for the entire page from the H1 tag
        const pageH1 = document.querySelector('h1');
        const pageCourseKey = pageH1 ? getCourseKeyFromTitle(pageH1.textContent) : null;

        // If we are on a valid course page (e.g., flood.html, earthquake.html)
        if (pageCourseKey) {
            // Find ALL "Mark as Complete" buttons on the page
            const allCompleteButtons = courseAccordion.querySelectorAll('.module-complete button');

            allCompleteButtons.forEach((button, index) => {
                const subHeader = button.closest('.accordion-sub-item')?.querySelector('.accordion-sub-header');
                let subItemIdentifier = `module-${index}`; // Fallback ID
                if (subHeader && subHeader.textContent) {
                     subItemIdentifier = subHeader.textContent.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
                }
                
                // Use the page-level course key for every button
                const moduleId = `${pageCourseKey}_${subItemIdentifier}`;

                // Check saved progress and attach the click event
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

    // --- LOGIC FOR DASHBOARD PAGE ---

    const dashboardContainer = document.querySelector('.dashboard-container');
    if (dashboardContainer) {
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

        const resetButton = document.getElementById('resetProgressBtn');
        if (resetButton) {
            resetButton.addEventListener('click', () => {
                if (confirm('Are you sure you want to reset all course and quiz progress? This cannot be undone.')) {
                    localStorage.removeItem(PROGRESS_KEY);
                    localStorage.removeItem(QUIZ_HISTORY_KEY);
                    localStorage.removeItem(QUIZ_BADGES_KEY);
                    alert('All progress has been reset.');
                    location.reload();
                }
            });
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
        
        function displayEarnedBadges() {
            const badgeGrid = document.querySelector('.badge-grid');
            if (!badgeGrid) return;

            let earnedBadgesHTML = '';

            for (const courseKey in completedCounts) {
                const total = COURSE_TOTALS[courseKey];
                const completed = completedCounts[courseKey];
                if (total > 0 && completed >= total) {
                    const badgeInfo = BADGE_DATA[courseKey];
                    if (badgeInfo) {
                        earnedBadgesHTML += `
                            <div class="animated-badge">
                                <div class="badge-icon"><i class='bx ${badgeInfo.icon}'></i></div>
                                <h4 class="badge-title">${badgeInfo.title}</h4>
                            </div>
                        `;
                    }
                }
            }

            const earnedQuizBadges = JSON.parse(localStorage.getItem(QUIZ_BADGES_KEY)) || {};
            
            if (earnedQuizBadges.gold) {
                earnedBadgesHTML += `
                    <div class="animated-badge quiz-gold-badge">
                        <div class="badge-icon"><i class='bx bxs-medal'></i></div>
                        <h4 class="badge-title">Quiz Gold</h4>
                        <p class="badge-description">${earnedQuizBadges.gold.quizName} (${earnedQuizBadges.gold.difficulty})</p>
                    </div>`;
            }
            if (earnedQuizBadges.silver) {
                 earnedBadgesHTML += `
                    <div class="animated-badge quiz-silver-badge">
                        <div class="badge-icon"><i class='bx bxs-medal'></i></div>
                        <h4 class="badge-title">Quiz Silver</h4>
                        <p class="badge-description">${earnedQuizBadges.silver.quizName} (${earnedQuizBadges.silver.difficulty})</p>
                    </div>`;
            }
            if (earnedQuizBadges.bronze) {
                 earnedBadgesHTML += `
                    <div class="animated-badge quiz-bronze-badge">
                        <div class="badge-icon"><i class='bx bxs-medal'></i></div>
                        <h4 class="badge-title">Quiz Bronze</h4>
                        <p class="badge-description">${earnedQuizBadges.bronze.quizName} (${earnedQuizBadges.bronze.difficulty})</p>
                    </div>`;
            }

            if (earnedBadgesHTML) {
                badgeGrid.innerHTML = earnedBadgesHTML;
            } else {
                badgeGrid.innerHTML = '<p class="no-badges-message">Complete courses and quizzes to earn badges!</p>';
            }
        }

        function displayQuizHistory() {
            const historyTable = document.querySelector('.quiz-history-table');
            if (!historyTable) return;
            const history = JSON.parse(localStorage.getItem(QUIZ_HISTORY_KEY)) || [];
            let historyTableBody = historyTable.querySelector('tbody');
            if (history.length === 0) {
                historyTableBody.innerHTML = '<tr><td colspan="3" style="text-align:center;">No quizzes taken yet.</td></tr>';
            } else {
                historyTable.innerHTML = `<thead><tr><th>Quiz Name</th><th>Date</th><th>Score</th></tr></thead><tbody></tbody>`;
                historyTableBody = historyTable.querySelector('tbody');
                history.forEach(result => {
                    const row = document.createElement('tr');
                    row.innerHTML = `<td>${result.name}</td><td>${result.date}</td><td>${result.score}</td>`;
                    historyTableBody.appendChild(row);
                });
            }
        }

        function displayLeaderboard() {
            const leaderboardList = document.querySelector('.leaderboard-list');
            if (!leaderboardList) return;
            const mockUsers = [
                { name: "Ravi Kumar", score: 95 }, { name: "Anjali Mehta", score: 82 },
                { name: "Suresh Gupta", score: 68 }, { name: "Priya Singh", score: 55 }
            ];
            const quizHistory = JSON.parse(localStorage.getItem(QUIZ_HISTORY_KEY)) || [];
            let currentUserScore = 0;
            if (quizHistory.length > 0) {
                const totalPercentage = quizHistory.reduce((sum, result) => {
                    const parts = result.score.split(' / ');
                    return sum + (parseInt(parts[0]) / parseInt(parts[1]) * 100);
                }, 0);
                currentUserScore = Math.round(totalPercentage / quizHistory.length);
            }
            const currentUser = { name: "Tester (You)", score: currentUserScore };
            const allScores = [...mockUsers, currentUser].sort((a, b) => b.score - a.score);
            leaderboardList.innerHTML = '';
            allScores.forEach((user, index) => {
                const rank = index + 1;
                const li = document.createElement('li');
                if (user.name === "Tester (You)") li.classList.add('current-user');
                li.innerHTML = `<span class="rank">${rank}.</span><span class="name">${user.name}</span><span class="score">${user.score} pts</span>`;
                leaderboardList.appendChild(li);
            });
        }

        displayQuizHistory();
        displayLeaderboard();
        displayEarnedBadges();
    }
    
    const yearEl = document.getElementById('year');
    if (yearEl) {
        yearEl.textContent = new Date().getFullYear();
    }
});