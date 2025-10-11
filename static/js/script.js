document.addEventListener('DOMContentLoaded', () => {
    const PROGRESS_KEY = 'ResQEdProgressData';

    const COURSE_TOTALS = {
        floods: 8,
        earthquakes: 8,
        forestFires: 8,
        landslides: 7
    };

    function getProgress() {
        const data = localStorage.getItem(PROGRESS_KEY);
        if (data) {
            return JSON.parse(data);
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
        return null;
    }

    function getPageTheme() {
        const pageTitleEl = document.querySelector('h1');
        if (!pageTitleEl) return 'general';
        const pageTitle = pageTitleEl.textContent.toLowerCase();
        if (pageTitle.includes('types of disasters') || pageTitle === 'disaster') return 'types';
        if (pageTitle.includes('govt') || pageTitle.includes('government')) return 'govt';
        if (pageTitle.includes('response')) return 'response';
        if (pageTitle.includes('prevention')) return 'prevention';
        return 'general';
    }

    const courseAccordion = document.querySelector('.course-accordion');
    if (courseAccordion) {
        const progress = getProgress();
        const pageTheme = getPageTheme();
        const courses = courseAccordion.querySelectorAll('.accordion-item');

        courses.forEach(course => {
            const courseHeader = course.querySelector('h3');
            if (!courseHeader) return;
            const courseKey = getCourseKeyFromTitle(courseHeader.textContent);
            if (!courseKey) return;

            const completeButtons = course.querySelectorAll('.module-complete button');

            completeButtons.forEach((button, index) => {
                const moduleId = `${courseKey}_${pageTheme}_${index}`;
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
        });
    }

    const dashboardContainer = document.querySelector('.dashboard-container');
    if (dashboardContainer) {
        const resetButton = document.getElementById('resetProgressBtn');
        if (resetButton) {
            resetButton.addEventListener('click', () => {
                if (confirm('Are you sure you want to reset all your course progress? This cannot be undone.')) {
                    localStorage.removeItem(PROGRESS_KEY);
                    alert('Progress has been reset.');
                    location.reload();
                }
            });
        }

        const progress = getProgress();
        const completedCounts = { floods: 0, earthquakes: 0, landslides: 0, forestFires: 0 };

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
            const percentage = total > 0 ? (completed / total) * 100 : 0;
            const courseItem = Array.from(document.querySelectorAll('.course-item h4'))
                                    .find(h4 => h4.textContent.toLowerCase().includes(courseKey.replace('forestFires', 'forest fire')));
            if (courseItem) {
                const progressBar = courseItem.parentElement.querySelector('.progress-bar');
                if (progressBar) progressBar.style.width = `${percentage}%`;
            }
        }

        let totalCompleted = 0;
        let totalModules = 0;
        for (const key in completedCounts) totalCompleted += completedCounts[key];
        for (const key in progress.courseTotals) totalModules += progress.courseTotals[key];

        const overallPercentage = totalModules > 0 ? Math.round((totalCompleted / totalModules) * 100) : 0;
        const overallProgressBar = document.querySelector('.progress-overview-card .progress-bar');
        if (overallProgressBar) {
            overallProgressBar.style.width = `${overallPercentage}%`;
            overallProgressBar.textContent = `${overallPercentage}%`;
        }
    }
});