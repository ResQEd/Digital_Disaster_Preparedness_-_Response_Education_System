document.addEventListener('DOMContentLoaded', () => {
    const PROGRESS_KEY = 'ResQEdProgressData';

    // Defines the total number of modules for each course
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

    // Retrieves progress from browser's local storage
    function getProgress() {
        const data = localStorage.getItem(PROGRESS_KEY);
        if (data) {
            const progress = JSON.parse(data);
            progress.courseTotals = COURSE_TOTALS; // Ensures totals are always up-to-date
            return progress;
        }
        // Creates a new progress object if one doesn't exist
        return {
            moduleStatus: {},
            courseTotals: COURSE_TOTALS
        };
    }

    // Saves the current progress to local storage
    function saveProgress(progressData) {
        localStorage.setItem(PROGRESS_KEY, JSON.stringify(progressData));
    }

    // Identifies the course key (e.g., 'floods') from a given title
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

    // Gets the course key for the current page by reading the H1 tag
    function getPageCourseKey() {
        const pageTitleEl = document.querySelector('h1');
        if (!pageTitleEl) return null;
        return getCourseKeyFromTitle(pageTitleEl.textContent);
    }

    // --- LOGIC FOR COURSE PAGES ---
    // This block runs only on pages with a course accordion
    const courseAccordion = document.querySelector('.course-accordion');
    if (courseAccordion) {
        const progress = getProgress();
        const pageCourseKey = getPageCourseKey(); // Gets the course for the current page, e.g., 'floods'

        if (pageCourseKey) {
            const completeButtons = courseAccordion.querySelectorAll('.module-complete button');

            completeButtons.forEach((button, index) => {
                // Creates a unique ID for each button, e.g., 'floods_module_0'
                const moduleId = `${pageCourseKey}_module_${index}`;
                
                // If the module is already marked complete, disable the button
                if (progress.moduleStatus[moduleId]) {
                    button.textContent = '✅ Completed';
                    button.disabled = true;
                }

                // Adds the click event listener to the button
                button.addEventListener('click', () => {
                    button.textContent = '✅ Completed';
                    button.disabled = true;
                    progress.moduleStatus[moduleId] = true; // Updates the status
                    saveProgress(progress); // Saves the change
                    alert('Progress saved!');
                });
            });
        }
    }

    // --- LOGIC FOR DASHBOARD PAGE ---
    // This block runs only on the dashboard page
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

        // Count completed modules for each course
        for (const moduleId in progress.moduleStatus) {
            if (progress.moduleStatus[moduleId]) {
                const courseKey = moduleId.split('_')[0];
                if (completedCounts.hasOwnProperty(courseKey)) {
                    completedCounts[courseKey]++;
                }
            }
        }

        // Update individual course progress bars on the dashboard
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

        // Calculate and update the overall progress bar
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