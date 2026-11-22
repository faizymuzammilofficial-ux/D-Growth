
/* =========================================
   D-GROWTH 2.0 - GOALS MANAGEMENT
========================================= */

(function () {

    const STORAGE_KEY = "dgrowth_goals";

    const categories = ["money", "fitness", "discipline", "career"];

    let goals = DGrowth.getData(STORAGE_KEY, {});

    // GET NUMBER FROM INPUT
    function getNumber(value) {
        const number = parseFloat(value);
        return Number.isFinite(number) ? number : 0;
    }

    // CALCULATE PROGRESS
    function calculateProgress(current, target) {

        if (target <= 0) return 0;

        return Math.min(
            100,
            Math.max(0, Math.round((current / target) * 100))
        );
    }

    // SAVE GOALS
    function saveGoals() {
        DGrowth.setData(STORAGE_KEY, goals);
    }

    // LOAD SAVED GOALS INTO INPUTS
    function loadGoals() {

        categories.forEach(function (category) {

            const targetInput = document.getElementById(
                category + "GoalTarget"
            );

            const currentInput = document.getElementById(
                category + "GoalCurrent"
            );

            const saved = goals[category] || {
                target: "",
                current: ""
            };

            if (targetInput) {
                targetInput.value = saved.target ?? "";
            }

            if (currentInput) {
                currentInput.value = saved.current ?? "";
            }

            updateProgress(category);

        });
    }

    // UPDATE ONE CATEGORY
    function updateProgress(category) {

        const targetInput = document.getElementById(
            category + "GoalTarget"
        );

        const currentInput = document.getElementById(
            category + "GoalCurrent"
        );

        const percentageElement = document.getElementById(
            category + "GoalPercentage"
        );

        const barElement = document.getElementById(
            category + "GoalBar"
        );

        if (!targetInput || !currentInput) return;

        const target = getNumber(targetInput.value);
        const current = getNumber(currentInput.value);

        const percentage = calculateProgress(current, target);

        if (percentageElement) {
            percentageElement.textContent = percentage + "%";
        }

        if (barElement) {
            barElement.style.width = percentage + "%";
        }
    }

    // SAVE ONE CATEGORY
    function saveGoal(category) {

        const targetInput = document.getElementById(
            category + "GoalTarget"
        );

        const currentInput = document.getElementById(
            category + "GoalCurrent"
        );

        if (!targetInput || !currentInput) return;

        goals[category] = {
            target: targetInput.value.trim(),
            current: currentInput.value.trim(),
            updatedAt: DGrowth.getDateKey()
        };

        saveGoals();
        updateProgress(category);

        const saveButton = document.querySelector(
            '[data-save-goal="' + category + '"]'
        );

        if (saveButton) {

            const originalText = saveButton.textContent;

            saveButton.textContent = "Saved!";

            setTimeout(function () {
                saveButton.textContent = originalText;
            }, 1500);

        }
    }

    // CONNECT SAVE BUTTONS
    categories.forEach(function (category) {

        const saveButton = document.querySelector(
            '[data-save-goal="' + category + '"]'
        );

        if (saveButton) {

            saveButton.addEventListener("click", function () {
                saveGoal(category);
            });

        }

        const targetInput = document.getElementById(
            category + "GoalTarget"
        );

        const currentInput = document.getElementById(
            category + "GoalCurrent"
        );

        [targetInput, currentInput].forEach(function (input) {

            if (input) {
                input.addEventListener("input", function () {
                    updateProgress(category);
                });
            }

        });

    });

    // INITIALIZE
    document.addEventListener("DOMContentLoaded", function () {
        loadGoals();
    });

    // PUBLIC DATA
    window.DGrowthGoals = {

        getGoals: function () {
            return goals;
        },

        refresh: loadGoals

    };

})();
