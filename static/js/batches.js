document.addEventListener('DOMContentLoaded', () => {
    
    const PROGRESS_KEY = 'ResQEdProgressData';
    const QUIZ_BADGES_KEY = 'ResQEdQuizBadges';

    const COURSE_TOTALS = {
        floods: 7, earthquakes: 7, landslides: 6, forestFires: 7,
        tsunami: 7, cyclones: 8, chemical: 10, biological: 11, nuclear: 11
    };

    function getCourseProgress() {
        const data = localStorage.getItem(PROGRESS_KEY);
        return data ? JSON.parse(data) : { moduleStatus: {} };
    }

    function getQuizBadges() {
        const data = localStorage.getItem(QUIZ_BADGES_KEY);
        return data ? JSON.parse(data) : {};
    }

    function unlockCourseBadges() {
        const progress = getCourseProgress();
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
            const total = COURSE_TOTALS[courseKey];
            const completed = completedCounts[courseKey];

            if (total > 0 && completed >= total) {
                const badgeEl = document.getElementById(`badge-${courseKey}`);
                if (badgeEl) {
                    badgeEl.classList.remove('locked');
                    badgeEl.classList.add('unlocked');
                }
            }
        }
    }

    function unlockQuizBadges() {
        const earnedBadges = getQuizBadges();

        if (earnedBadges.gold) {
            const badgeEl = document.getElementById('badge-quiz-gold');
            badgeEl.classList.remove('locked');
            badgeEl.classList.add('unlocked');
            badgeEl.querySelector('.badge-description').textContent = 
                `${earnedBadges.gold.quizName} (${earnedBadges.gold.difficulty})`;
        }
        
        if (earnedBadges.silver) {
            const badgeEl = document.getElementById('badge-quiz-silver');
            badgeEl.classList.remove('locked');
            badgeEl.classList.add('unlocked');
            badgeEl.querySelector('.badge-description').textContent = 
                `${earnedBadges.silver.quizName} (${earnedBadges.silver.difficulty})`;
        }

        if (earnedBadges.bronze) {
            const badgeEl = document.getElementById('badge-quiz-bronze');
            badgeEl.classList.remove('locked');
            badgeEl.classList.add('unlocked');
            badgeEl.querySelector('.badge-description').textContent = 
                `${earnedBadges.bronze.quizName} (${earnedBadges.bronze.difficulty})`;
        }
    }

    unlockCourseBadges();
    unlockQuizBadges();
});