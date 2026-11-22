
/* =========================================
   D-GROWTH 2.0 - MAIN APPLICATION
========================================= */

// SHARED APPLICATION UTILITIES
window.DGrowth = {

    categories: ["money", "fitness", "discipline", "career"],

    // Get browser's local date in YYYY-MM-DD format
    getDateKey: function(date = new Date()) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");

        return `${year}-${month}-${day}`;
    },

    // Read JSON data from LocalStorage
    getData: function(key, fallback = null) {
        try {
            const saved = localStorage.getItem(key);

            return saved === null ? fallback : JSON.parse(saved);
        } catch (error) {
            console.error("Could not read saved data:", key, error);
            return fallback;
        }
    },

    // Save JSON data to LocalStorage
    setData: function(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            console.error("Could not save data:", key, error);
            alert("Unable to save data. Please check your browser storage.");
            return false;
        }
    }
};


// NAVIGATION
function initializeNavigation() {

    const navLinks = document.querySelectorAll(".nav-link[data-view]");
    const views = document.querySelectorAll(".view-section");
    const pageTitle = document.getElementById("pageTitle");

    function openView(viewName) {

        const selectedView = document.getElementById("view-" + viewName);

        if (!selectedView) {
            return;
        }

        views.forEach(function(view) {
            view.classList.remove("active");
        });

        selectedView.classList.add("active");

        navLinks.forEach(function(link) {
            link.classList.toggle(
                "active",
                link.dataset.view === viewName
            );
        });

        if (pageTitle) {
            const activeLink = document.querySelector(
                '.nav-link[data-view="' + viewName + '"]'
            );

            pageTitle.textContent = activeLink
                ? activeLink.textContent.trim()
                : "Dashboard";
        }

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });

        // Refresh analytics whenever opened
        if (
            viewName === "analytics" &&
            typeof window.refreshAnalytics === "function"
        ) {
            window.refreshAnalytics();
        }
    }

    navLinks.forEach(function(link) {

        link.addEventListener("click", function() {
            openView(link.dataset.view);
        });

    });

    // Buttons that open another section
    document.querySelectorAll("[data-open-view]").forEach(function(button) {

        button.addEventListener("click", function() {
            openView(button.dataset.openView);
        });

    });
}


// CURRENT DATE DISPLAY
function updateCurrentDate() {

    const dateElement = document.getElementById("currentDate");

    if (!dateElement) {
        return;
    }

    const today = new Date();

    dateElement.textContent = today.toLocaleDateString("en-IN", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric"
    });
}


// PROFILE MANAGEMENT
function initializeProfile() {

    const profileInput = document.getElementById("profileName");
    const saveButton = document.getElementById("saveProfileBtn");
    const profileIcon = document.querySelector(".profile");
    const profileMessage = document.getElementById("profileMessage");

    const savedProfile = DGrowth.getData("dgrowth_profile", {
        name: ""
    });

    if (profileInput) {
        profileInput.value = savedProfile.name || "";
    }

    function updateProfileDisplay() {

        const name = profileInput.value.trim();

        if (profileIcon) {
            profileIcon.textContent = name
                ? name.charAt(0).toUpperCase()
                : "D";
        }
    }

    if (profileInput) {
        updateProfileDisplay();

        profileInput.addEventListener("input", updateProfileDisplay);
    }

    if (saveButton) {

        saveButton.addEventListener("click", function() {

            const name = profileInput.value.trim();

            const saved = DGrowth.setData("dgrowth_profile", {
                name: name
            });

            if (saved) {
                updateProfileDisplay();

                if (profileMessage) {
                    profileMessage.textContent = "Profile saved successfully!";
                }
            }

        });

    }
}


// EXPORT USER DATA
function initializeDataExport() {

    const exportButton = document.getElementById("exportDataBtn");

    if (!exportButton) {
        return;
    }

    exportButton.addEventListener("click", function() {

        const backup = {};

        for (let i = 0; i < localStorage.length; i++) {

            const key = localStorage.key(i);

            if (key && key.startsWith("dgrowth_")) {
                backup[key] = DGrowth.getData(key);
            }

        }

        const fileContent = JSON.stringify(backup, null, 4);

        const file = new Blob(
            [fileContent],
            { type: "application/json" }
        );

        const downloadURL = URL.createObjectURL(file);

        const link = document.createElement("a");

        link.href = downloadURL;
        link.download = "D-Growth-Backup.json";

        document.body.appendChild(link);
        link.click();
        link.remove();

        URL.revokeObjectURL(downloadURL);

    });

}


// START APPLICATION
document.addEventListener("DOMContentLoaded", function() {

    initializeNavigation();

    updateCurrentDate();

    initializeProfile();

    initializeDataExport();

    console.log("D-Growth main application initialized.");

});
