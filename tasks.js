
/* =========================================
   D-GROWTH 2.0 - DAILY TASK MANAGEMENT
========================================= */

(function () {

    const categories = DGrowth.categories;

    const categoryNames = {
        money: "Money",
        fitness: "Fitness",
        discipline: "Discipline",
        career: "Career"
    };

    let currentDate = DGrowth.getDateKey();

    let tasks = DGrowth.getData("dgrowth_tasks", null);

    let history = DGrowth.getData("dgrowth_task_history", {});

    // CREATE EMPTY TASK STRUCTURE
    function createEmptyTasks(date) {
        return {
            date: date,
            categories: {
                money: [],
                fitness: [],
                discipline: [],
                career: []
            }
        };
    }

    // SAVE TASKS AND HISTORY
    function saveTasks() {
        DGrowth.setData("dgrowth_tasks", tasks);
        DGrowth.setData("dgrowth_task_history", history);
    }

    // CHECK DATE AND RESET FOR NEW DAY
    function checkNewDay() {

        const today = DGrowth.getDateKey();

        if (today === currentDate) {
            return;
        }

        if (tasks && tasks.date) {
            history[tasks.date] = tasks;
        }

        currentDate = today;
        tasks = createEmptyTasks(today);

        saveTasks();
        renderTasks();
    }

    // INITIALIZE TASK DATA
    if (!tasks || !tasks.date || !tasks.categories) {
        tasks = createEmptyTasks(currentDate);
    }

    if (!tasks.categories) {
        tasks.categories = createEmptyTasks(currentDate).categories;
    }

    categories.forEach(function (category) {
        if (!Array.isArray(tasks.categories[category])) {
            tasks.categories[category] = [];
        }
    });

    if (tasks.date !== currentDate) {
        history[tasks.date] = tasks;
        tasks = createEmptyTasks(currentDate);
    }

    saveTasks();

    // GENERATE UNIQUE TASK ID
    function generateTaskId() {
        return Date.now().toString() +
            Math.random().toString(36).substring(2, 8);
    }

    // ADD NEW TASK
    function addTask(category) {

        const input = document.getElementById(
            "newTask" +
            category.charAt(0).toUpperCase() +
            category.slice(1)
        );

        if (!input) return;

        const taskText = input.value.trim();

        if (!taskText) {
            input.focus();
            return;
        }

        tasks.categories[category].push({
            id: generateTaskId(),
            text: taskText,
            completed: false
        });

        input.value = "";

        saveTasks();
        renderTasks();
    }

    // DELETE TASK
    function deleteTask(category, taskId) {

        tasks.categories[category] =
            tasks.categories[category].filter(function (task) {
                return task.id !== taskId;
            });

        saveTasks();
        renderTasks();
    }

    // TOGGLE TASK COMPLETION
    function toggleTask(category, taskId) {

        const task = tasks.categories[category].find(function (item) {
            return item.id === taskId;
        });

        if (!task) return;

        task.completed = !task.completed;

        saveTasks();
        renderTasks();
    }

    // CALCULATE PERCENTAGE
    function calculatePercentage(completed, total) {

        if (total === 0) return 0;

        return Math.round((completed / total) * 100);
    }

    // UPDATE CATEGORY PROGRESS
    function updateCategoryProgress(category) {

        const categoryTasks = tasks.categories[category];

        const completed = categoryTasks.filter(function (task) {
            return task.completed;
        }).length;

        const total = categoryTasks.length;

        const percentage = calculatePercentage(completed, total);

        const capitalized =
            category.charAt(0).toUpperCase() + category.slice(1);

        const percentageElement = document.getElementById(
            category + "TaskPercentage"
        );

        const barElement = document.getElementById(
            category + "TaskBar"
        );

        const countElement = document.getElementById(
            category + "TaskCount"
        );

        if (percentageElement) {
            percentageElement.textContent = percentage + "%";
        }

        if (barElement) {
            barElement.style.width = percentage + "%";
        }

        if (countElement) {
            countElement.textContent = completed + "/" + total;
        }

        // UPDATE DASHBOARD PILLAR PROGRESS
        const pillarPercentage = document.getElementById(
            category + "Progress"
        );

        const pillarBar = document.getElementById(
            category + "ProgressBar"
        );

        if (pillarPercentage) {
            pillarPercentage.textContent = percentage + "%";
        }

        if (pillarBar) {
            pillarBar.style.width = percentage + "%";
        }
    }

    // UPDATE OVERALL PROGRESS
    function updateOverallProgress() {

        let total = 0;
        let completed = 0;

        categories.forEach(function (category) {

            const categoryTasks = tasks.categories[category];

            total += categoryTasks.length;

            completed += categoryTasks.filter(function (task) {
                return task.completed;
            }).length;

        });

        const percentage = calculatePercentage(completed, total);

        const countElement =
            document.getElementById("overallTaskCount");

        const percentageElement =
            document.getElementById("overallTaskPercentage");

        const barElement =
            document.getElementById("overallTaskBar");

        if (countElement) {
            countElement.textContent = completed + "/" + total;
        }

        if (percentageElement) {
            percentageElement.textContent = percentage + "%";
        }

        if (barElement) {
            barElement.style.width = percentage + "%";
        }

        // DASHBOARD STATS
        const dashboardProgress =
            document.getElementById("dashboardTaskProgress");

        const dashboardCompleted =
            document.getElementById("dashboardCompletedTasks");

        if (dashboardProgress) {
            dashboardProgress.textContent = percentage + "%";
        }

        if (dashboardCompleted) {
            dashboardCompleted.textContent = completed;
        }

        // DASHBOARD SUMMARY
        const summary = document.getElementById("dashboardSummary");

        if (summary) {
            summary.textContent = completed + " of " + total +
                " daily tasks completed.";
        }
    }

    // RENDER ALL TASKS
    function renderTasks() {

        categories.forEach(function (category) {

            const list = document.getElementById(
                "taskList" +
                category.charAt(0).toUpperCase() +
                category.slice(1)
            );

            if (!list) return;

            list.innerHTML = "";

            const categoryTasks = tasks.categories[category];

            categoryTasks.forEach(function (task) {

                const item = document.createElement("div");
                item.className = "task-item";

                if (task.completed) {
                    item.classList.add("completed");
                }

                const checkbox = document.createElement("input");
                checkbox.type = "checkbox";
                checkbox.checked = task.completed;

                checkbox.addEventListener("change", function () {
                    toggleTask(category, task.id);
                });

                const taskText = document.createElement("span");
                taskText.className = "task-text";
                taskText.textContent = task.text;

                const deleteButton = document.createElement("button");
                deleteButton.className = "delete-task";
                deleteButton.type = "button";
                deleteButton.textContent = "×";
                deleteButton.setAttribute("aria-label", "Delete task");

                deleteButton.addEventListener("click", function () {
                    deleteTask(category, task.id);
                });

                item.appendChild(checkbox);
                item.appendChild(taskText);
                item.appendChild(deleteButton);

                list.appendChild(item);

            });

            updateCategoryProgress(category);

        });

        updateOverallProgress();

        if (typeof window.refreshAnalytics === "function") {
            window.refreshAnalytics();
        }
    }

    // CONNECT ADD TASK BUTTONS
    document.querySelectorAll("[data-add-task]").forEach(function (button) {

        button.addEventListener("click", function () {
            addTask(button.dataset.addTask);
        });

    });

    // ENTER KEY TO ADD TASK
    categories.forEach(function (category) {

        const input = document.getElementById(
            "newTask" +
            category.charAt(0).toUpperCase() +
            category.slice(1)
        );

        if (input) {
            input.addEventListener("keydown", function (event) {

                if (event.key === "Enter") {
                    addTask(category);
                }

            });
        }

    });

    // CHECK FOR NEW DAY WHEN USER RETURNS
    window.addEventListener("focus", checkNewDay);

    document.addEventListener("visibilitychange", function () {
        if (!document.hidden) {
            checkNewDay();
        }
    });

    // INITIAL RENDER
    document.addEventListener("DOMContentLoaded", function () {
        renderTasks();
    });

    // PUBLIC DATA FOR OTHER MODULES
    window.DGrowthTasks = {
        getCurrentTasks: function () {
            return tasks;
        },

        getHistory: function () {
            return history;
        },

        refresh: renderTasks
    };

})();
