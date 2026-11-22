
/* =========================================
   D-GROWTH 2.0 - 30 DAY HABIT TRACKER
========================================= */

(function () {

    const STORAGE_KEY = "dgrowth_habits";
    const DAY_MS = 24 * 60 * 60 * 1000;

    let data = DGrowth.getData(STORAGE_KEY, null);

    function dateKey(date) {
        return DGrowth.getDateKey(date);
    }

    function parseDate(value) {
        const parts = value.split("-").map(Number);
        return new Date(parts[0], parts[1] - 1, parts[2]);
    }

    function addDays(date, days) {
        const result = new Date(date);
        result.setDate(result.getDate() + days);
        return result;
    }

    function daysBetween(start, end) {
        return Math.floor(
            (parseDate(end) - parseDate(start)) / DAY_MS
        );
    }

    function createCycle(number, startDate) {
        return {
            number: number,
            startDate: startDate,
            endDate: dateKey(addDays(parseDate(startDate), 29)),
            habits: [],
            dailyHistory: {},
            archived: false
        };
    }

    function createInitialData() {
        return {
            cycleNumber: 1,
            currentCycle: createCycle(1, dateKey(new Date())),
            history: []
        };
    }

    if (
        !data ||
        !data.currentCycle ||
        !Array.isArray(data.currentCycle.habits) ||
        !Array.isArray(data.history)
    ) {
        data = createInitialData();
    }

    function saveData() {
        DGrowth.setData(STORAGE_KEY, data);
    }

    // CALCULATE CYCLE STATISTICS
    function getCycleStats(cycle) {

        const today = dateKey(new Date());

        const totalDays = 30;
        let expectedChecks = 0;
        let completedChecks = 0;
        let daysCompleted = 0;

        cycle.habits.forEach(function (habit) {

            const firstDate = habit.createdDate > cycle.startDate
                ? habit.createdDate
                : cycle.startDate;

            const lastDate = today < cycle.endDate
                ? today
                : cycle.endDate;

            if (firstDate > lastDate) return;

            const expectedDays =
                daysBetween(firstDate, lastDate) + 1;

            expectedChecks += expectedDays;

            for (
                let date = firstDate;
                date <= lastDate;
                date = dateKey(addDays(parseDate(date), 1))
            ) {

                const completed =
                    cycle.dailyHistory[date] || [];

                if (completed.includes(habit.id)) {
                    completedChecks++;
                }
            }

        });

        Object.keys(cycle.dailyHistory).forEach(function (date) {

            const completed = cycle.dailyHistory[date] || [];

            if (completed.length > 0) {
                daysCompleted++;
            }

        });

        const percentage = expectedChecks > 0
            ? Math.round((completedChecks / expectedChecks) * 100)
            : 0;

        return {
            percentage: percentage,
            completedChecks: completedChecks,
            expectedChecks: expectedChecks,
            daysCompleted: daysCompleted,
            totalDays: totalDays
        };
    }

    // ARCHIVE COMPLETED CYCLES
    function updateCycle() {

        let today = dateKey(new Date());
        let cycle = data.currentCycle;

        while (today > cycle.endDate) {

            cycle.archived = true;

            cycle.summary = getCycleStats(cycle);

            data.history.unshift(
                JSON.parse(JSON.stringify(cycle))
            );

            const nextStart = dateKey(
                addDays(parseDate(cycle.endDate), 1)
            );

            data.cycleNumber++;

            cycle = createCycle(
                data.cycleNumber,
                nextStart
            );

            data.currentCycle = cycle;
        }

        saveData();
    }

    updateCycle();

    // ADD NEW HABIT
    function addHabit() {

        const input = document.getElementById("newHabitInput");

        if (!input) return;

        const name = input.value.trim();

        if (!name) {
            input.focus();
            return;
        }

        const cycle = data.currentCycle;

        const duplicate = cycle.habits.some(function (habit) {
            return habit.name.toLowerCase() === name.toLowerCase()
                && !habit.deleted;
        });

        if (duplicate) {
            alert("This habit already exists.");
            return;
        }

        cycle.habits.push({
            id: Date.now().toString() +
                Math.random().toString(36).substring(2, 7),
            name: name,
            createdDate: dateKey(new Date()),
            deleted: false
        });

        input.value = "";

        saveData();
        renderHabits();
    }

    // DELETE HABIT WITHOUT REMOVING HISTORY
    function deleteHabit(habitId) {

        const habit = data.currentCycle.habits.find(function (item) {
            return item.id === habitId;
        });

        if (!habit) return;

        habit.deleted = true;
        habit.deletedDate = dateKey(new Date());

        saveData();
        renderHabits();
    }

    // TOGGLE DAILY HABIT
    function toggleHabit(habitId, checked) {

        const today = dateKey(new Date());
        const cycle = data.currentCycle;

        if (!cycle.dailyHistory[today]) {
            cycle.dailyHistory[today] = [];
        }

        let completed = cycle.dailyHistory[today];

        if (checked && !completed.includes(habitId)) {
            completed.push(habitId);
        }

        if (!checked) {
            completed = completed.filter(function (id) {
                return id !== habitId;
            });

            cycle.dailyHistory[today] = completed;
        }

        saveData();
        renderHabits();
    }

    // UPDATE HABIT OVERVIEW
    function updateOverview() {

        const cycle = data.currentCycle;
        const stats = getCycleStats(cycle);

        const today = dateKey(new Date());

        const currentDay = Math.min(
            30,
            Math.max(1, daysBetween(cycle.startDate, today) + 1)
        );

        const title = document.getElementById("habitCycleTitle");
        const dates = document.getElementById("habitCycleDates");
        const dayElement = document.getElementById("habitCurrentDay");
        const bar = document.getElementById("habitCycleBar");
        const percentage = document.getElementById("habitCyclePercentage");
        const daysElement = document.getElementById("habitDaysCompleted");
        const checksElement = document.getElementById("habitTotalChecks");

        if (title) {
            title.textContent = "Cycle " + cycle.number;
        }

        if (dates) {
            dates.textContent =
                cycle.startDate + " to " + cycle.endDate;
        }

        if (dayElement) {
            dayElement.textContent =
                "Day " + currentDay + " of 30";
        }

        if (bar) {
            bar.style.width = currentDay / 30 * 100 + "%";
        }

        if (percentage) {
            percentage.textContent = stats.percentage + "%";
        }

        if (daysElement) {
            daysElement.textContent = stats.daysCompleted;
        }

        if (checksElement) {
            checksElement.textContent =
                stats.completedChecks + "/" + stats.expectedChecks;
        }

        // DASHBOARD HABIT PROGRESS
        const dashboardProgress =
            document.getElementById("dashboardHabitProgress");

        const dashboardSummary =
            document.getElementById("dashboardHabitSummary");

        if (dashboardProgress) {
            dashboardProgress.textContent =
                stats.percentage + "%";
        }

        if (dashboardSummary) {
            dashboardSummary.textContent =
                stats.completedChecks + " habit check-ins completed.";
        }
    }

    // RENDER HABITS
    function renderHabits() {

        const list = document.getElementById("habitList");
        const emptyMessage =
            document.getElementById("habitEmptyMessage");

        if (!list) return;

        list.innerHTML = "";

        const cycle = data.currentCycle;
        const today = dateKey(new Date());

        const activeHabits = cycle.habits.filter(function (habit) {
            return !habit.deleted;
        });

        if (emptyMessage) {
            emptyMessage.style.display =
                activeHabits.length === 0 ? "block" : "none";
        }

        activeHabits.forEach(function (habit) {

            const item = document.createElement("div");
            item.className = "habit-item";

            const label = document.createElement("label");
            label.className = "habit-label";

            const checkbox = document.createElement("input");
            checkbox.type = "checkbox";

            const completedToday =
                (cycle.dailyHistory[today] || [])
                    .includes(habit.id);

            checkbox.checked = completedToday;

            checkbox.addEventListener("change", function () {
                toggleHabit(habit.id, checkbox.checked);
            });

            const name = document.createElement("span");
            name.textContent = habit.name;

            const deleteButton = document.createElement("button");
            deleteButton.type = "button";
            deleteButton.className = "delete-habit";
            deleteButton.textContent = "×";
            deleteButton.setAttribute("aria-label", "Delete habit");

            deleteButton.addEventListener("click", function () {
                deleteHabit(habit.id);
            });

            label.appendChild(checkbox);
            label.appendChild(name);

            item.appendChild(label);
            item.appendChild(deleteButton);

            list.appendChild(item);

        });

        updateOverview();
        renderHistory();

        if (typeof window.refreshAnalytics === "function") {
            window.refreshAnalytics();
        }
    }

    // RENDER PREVIOUS CYCLE HISTORY
    function renderHistory() {

        const historyContainer =
            document.getElementById("habitHistory");

        if (!historyContainer) return;

        historyContainer.innerHTML = "";

        if (data.history.length === 0) {

            const message = document.createElement("p");
            message.textContent = "Your previous cycle reports will appear here.";

            historyContainer.appendChild(message);
            return;
        }

        data.history.forEach(function (cycle) {

            const card = document.createElement("div");
            card.className = "habit-history-item";

            const heading = document.createElement("h4");
            heading.textContent = "Cycle " + cycle.number;

            const dates = document.createElement("p");
            dates.textContent =
                cycle.startDate + " to " + cycle.endDate;

            const stats = cycle.summary || getCycleStats(cycle);

            const result = document.createElement("p");
            result.textContent =
                "Success: " + stats.percentage +
                "% | Completed: " +
                stats.completedChecks + "/" +
                stats.expectedChecks;

            card.appendChild(heading);
            card.appendChild(dates);
            card.appendChild(result);

            historyContainer.appendChild(card);

        });
    }

    // ADD BUTTON
    const addButton = document.getElementById("addHabitBtn");

    if (addButton) {
        addButton.addEventListener("click", addHabit);
    }

    // ENTER KEY
    const habitInput = document.getElementById("newHabitInput");

    if (habitInput) {
        habitInput.addEventListener("keydown", function (event) {

            if (event.key === "Enter") {
                addHabit();
            }

        });
    }

    // CHECK FOR DATE CHANGE
    window.addEventListener("focus", function () {
        updateCycle();
        renderHabits();
    });

    document.addEventListener("visibilitychange", function () {

        if (!document.hidden) {
            updateCycle();
            renderHabits();
        }

    });

    // INITIALIZE
    document.addEventListener("DOMContentLoaded", function () {
        renderHabits();
    });

    // PUBLIC DATA FOR OTHER MODULES
    window.DGrowthHabits = {

        getCurrentCycle: function () {
            return data.currentCycle;
        },

        getHistory: function () {
            return data.history;
        },

        getStats: function () {
            return getCycleStats(data.currentCycle);
        },

        refresh: renderHabits

    };

})();
