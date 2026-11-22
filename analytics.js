
/* =========================================
   D-GROWTH 2.0 - ANALYTICS SYSTEM
========================================= */

(function () {

    const categories = ["money", "fitness", "discipline", "career"];

    const categoryNames = {
        money: "Money",
        fitness: "Fitness",
        discipline: "Discipline",
        career: "Career"
    };

    function getTaskData() {
        return window.DGrowthTasks
            ? window.DGrowthTasks.getCurrentTasks()
            : null;
    }

    function getTaskHistory() {
        return window.DGrowthTasks
            ? window.DGrowthTasks.getHistory()
            : {};
    }

    function getHabitStats() {
        return window.DGrowthHabits
            ? window.DGrowthHabits.getStats()
            : {
                percentage: 0,
                completedChecks: 0,
                expectedChecks: 0,
                daysCompleted: 0
            };
    }

    // GET ALL TASKS FOR A DAY
    function getDayStats(dayData) {

        let total = 0;
        let completed = 0;

        if (!dayData || !dayData.categories) {
            return { total: 0, completed: 0 };
        }

        categories.forEach(function (category) {

            const tasks = dayData.categories[category] || [];

            total += tasks.length;

            completed += tasks.filter(function (task) {
                return task.completed;
            }).length;

        });

        return {
            total: total,
            completed: completed
        };
    }

    // COMBINE CURRENT DAY AND HISTORY
    function getAllTaskDays() {

        const history = getTaskHistory();
        const current = getTaskData();

        const days = Object.assign({}, history);

        if (current && current.date) {
            days[current.date] = current;
        }

        return days;
    }

    // CALCULATE BEST STREAK
    function calculateBestStreak(days) {

        const dates = Object.keys(days).sort();

        let best = 0;
        let currentStreak = 0;
        let previousDate = null;

        dates.forEach(function (date) {

            const stats = getDayStats(days[date]);

            if (stats.completed > 0) {

                if (
                    previousDate &&
                    Math.floor(
                        (new Date(date + "T00:00:00") -
                        new Date(previousDate + "T00:00:00")) /
                        86400000
                    ) === 1
                ) {
                    currentStreak++;
                } else {
                    currentStreak = 1;
                }

                best = Math.max(best, currentStreak);

                previousDate = date;

            } else {
                currentStreak = 0;
                previousDate = null;
            }

        });

        return best;
    }

    // WEEKLY REPORT
    function renderWeeklyAnalytics(days) {

        const container = document.getElementById("weeklyAnalytics");

        if (!container) return;

        container.innerHTML = "";

        const today = new Date();

        const weeklyData = [];

        for (let i = 6; i >= 0; i--) {

            const date = new Date(today);

            date.setDate(today.getDate() - i);

            const dateKey = DGrowth.getDateKey(date);

            const stats = getDayStats(days[dateKey]);

            weeklyData.push({
                date: dateKey,
                label: date.toLocaleDateString("en-IN", {
                    weekday: "short",
                    day: "numeric"
                }),
                completed: stats.completed,
                total: stats.total
            });

        }

        const heading = document.createElement("h3");
        heading.textContent = "Last 7 Days";
        container.appendChild(heading);

        weeklyData.forEach(function (day) {

            const item = document.createElement("div");
            item.className = "weekly-day";

            const label = document.createElement("span");
            label.textContent = day.label;

            const result = document.createElement("span");
            result.textContent =
                day.completed + "/" + day.total + " tasks";

            const barContainer = document.createElement("div");
            barContainer.className = "weekly-bar";

            const bar = document.createElement("div");
            bar.className = "weekly-bar-fill";

            const percentage = day.total > 0
                ? day.completed / day.total * 100
                : 0;

            bar.style.width = percentage + "%";

            barContainer.appendChild(bar);

            item.appendChild(label);
            item.appendChild(result);
            item.appendChild(barContainer);

            container.appendChild(item);

        });
    }

    // UPDATE CATEGORY ANALYTICS
    function renderCategoryAnalytics(days) {

        const container = document.getElementById("weeklyAnalytics");

        if (!container) return;

        const heading = document.createElement("h3");
        heading.textContent = "Category Performance";

        container.appendChild(heading);

        categories.forEach(function (category) {

            let total = 0;
            let completed = 0;

            Object.values(days).forEach(function (day) {

                const tasks =
                    day.categories?.[category] || [];

                total += tasks.length;

                completed += tasks.filter(function (task) {
                    return task.completed;
                }).length;

            });

            const percentage = total > 0
                ? Math.round(completed / total * 100)
                : 0;

            const item = document.createElement("div");
            item.className = "category-analytics";

            const label = document.createElement("span");
            label.textContent = categoryNames[category];

            const result = document.createElement("span");
            result.textContent = percentage + "%";

            item.appendChild(label);
            item.appendChild(result);

            container.appendChild(item);

        });
    }

    // REFRESH ANALYTICS
    function refreshAnalytics() {

        const days = getAllTaskDays();

        let totalCompleted = 0;

        Object.values(days).forEach(function (day) {
            totalCompleted += getDayStats(day).completed;
        });

        const habitStats = getHabitStats();

        const completedElement =
            document.getElementById("analyticsTasksCompleted");

        const habitElement =
            document.getElementById("analyticsHabitSuccess");

        const streakElement =
            document.getElementById("analyticsBestStreak");

        const cyclesElement =
            document.getElementById("analyticsCycles");

        if (completedElement) {
            completedElement.textContent = totalCompleted;
        }

        if (habitElement) {
            habitElement.textContent =
                habitStats.percentage + "%";
        }

        if (streakElement) {
            streakElement.textContent =
                calculateBestStreak(days);
        }

        if (cyclesElement) {

            const history = window.DGrowthHabits
                ? window.DGrowthHabits.getHistory()
                : [];

            cyclesElement.textContent = history.length;
        }

        renderWeeklyAnalytics(days);
        renderCategoryAnalytics(days);
    }

    // MAKE AVAILABLE TO OTHER MODULES
    window.refreshAnalytics = refreshAnalytics;

    // INITIALIZE
    document.addEventListener("DOMContentLoaded", function () {
        refreshAnalytics();
    });

})();
