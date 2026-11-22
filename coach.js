
/* =========================================
   D-GROWTH 2.0 - PERSONAL COACH
========================================= */

(function () {

    const STORAGE_KEY = "dgrowth_reflections";

    let reflections = DGrowth.getData(STORAGE_KEY, {});

    const today = DGrowth.getDateKey();

    function saveReflections() {
        DGrowth.setData(STORAGE_KEY, reflections);
    }

    // SAVE TODAY'S REFLECTION
    function saveReflection() {

        const input = document.getElementById("coachReflection");
        const message = document.getElementById("reflectionMessage");

        if (!input) return;

        const reflection = input.value.trim();

        if (!reflection) {
            if (message) {
                message.textContent = "Please write your reflection first.";
            }
            return;
        }

        reflections[today] = {
            text: reflection,
            updatedAt: new Date().toISOString()
        };

        saveReflections();

        if (message) {
            message.textContent = "Today's reflection saved successfully!";
        }

        renderReflectionHistory();
    }

    // LOAD TODAY'S REFLECTION
    function loadTodayReflection() {

        const input = document.getElementById("coachReflection");

        if (!input) return;

        const saved = reflections[today];

        input.value = saved ? saved.text : "";
    }

    // DISPLAY PREVIOUS REFLECTIONS
    function renderReflectionHistory() {

        const existing = document.getElementById("reflectionHistory");

        if (!existing) return;

        existing.innerHTML = "";

        const dates = Object.keys(reflections)
            .filter(function (date) {
                return date !== today;
            })
            .sort()
            .reverse();

        if (dates.length === 0) {

            const message = document.createElement("p");
            message.textContent = "Your previous reflections will appear here.";

            existing.appendChild(message);
            return;
        }

        dates.forEach(function (date) {

            const card = document.createElement("div");
            card.className = "reflection-history-item";

            const heading = document.createElement("h4");
            heading.textContent = date;

            const content = document.createElement("p");
            content.textContent = reflections[date].text;

            card.appendChild(heading);
            card.appendChild(content);

            existing.appendChild(card);

        });
    }

    // CONNECT SAVE BUTTON
    const saveButton = document.getElementById("saveReflectionBtn");

    if (saveButton) {
        saveButton.addEventListener("click", saveReflection);
    }

    // INITIALIZE
    document.addEventListener("DOMContentLoaded", function () {

        loadTodayReflection();
        renderReflectionHistory();

    });

    // PUBLIC DATA
    window.DGrowthCoach = {

        getReflections: function () {
            return reflections;
        },

        save: saveReflection

    };

})();
