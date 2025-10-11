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
                if (confirm('Are you sure you want to reset all your course progress? This cannot be undone.')) {
                    localStorage.removeItem(PROGRESS_KEY);
                    alert('Progress has been reset.');
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
                    if (percentage === 100) {
                        link.innerHTML = "Review <i class='bx bx-right-arrow-alt'></i>";
                    } else if (percentage > 0) {
                        link.innerHTML = "Continue <i class='bx bx-right-arrow-alt'></i>";
                    } else {
                        link.innerHTML = "Start Now <i class='bx bx-right-arrow-alt'></i>";
                    }
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
    }
});