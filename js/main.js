
/* =========================================
   GEODETECTIVE — MAIN MENU
========================================= */

const cases = [
    {
        id: 1,
        title: "The Missing Professor",
        description:
            "Investigate a disappearance in Ankara. Examine records, analyze phone signals, follow CCTV footage, and locate the professor.",
        difficulty: "Medium",
        duration: 3,
        icon: "🔎",
        image: "img/detective_desk.jpg"
    },
    {
        id: 2,
        title: "Midnight at the Museum",
        description:
            "A valuable artifact has disappeared. Investigate surveillance footage and escape routes.",
        difficulty: "Medium",
        duration: 3,
        icon: "🏛️",
        image: "img/museum.jpg"
    },
    {
        id: 3,
        title: "The Last Trail",
        description:
            "A hiker has vanished. Use terrain information to reconstruct the last known route.",
        difficulty: "Hard",
        duration: 8,
        icon: "🌲",
        image: "img/forest.jpg"
    },
    {
        id: 4,
        title: "City in Darkness",
        description:
            "Investigate a citywide power failure using spatial infrastructure data.",
        difficulty: "Hard",
        duration: 8,
        icon: "⚡",
        image: "img/city.jpg"
    },
    {
        id: 5,
        title: "The Coordinate Cipher",
        description:
            "Decode geographic patterns to uncover a hidden meeting place.",
        difficulty: "Hard",
        duration: 10,
        icon: "🧭",
        image: "img/map.jpg"
    }
];

const mainMenu = document.getElementById("main-menu");
const gameScreen = document.getElementById("game-screen");
const caseList = document.getElementById("case-list");

/* =========================================
   RENDER CASE CARDS
========================================= */

function renderCases() {

    caseList.innerHTML = "";

    const firstCaseSolved =
        localStorage.getItem("geodetective-case-1") === "solved";

    cases.forEach(gameCase => {

        const unlocked =
            gameCase.id === 1 ||
            (gameCase.id === 2 && firstCaseSolved);

        const wrapper = document.createElement("div");
        wrapper.className = "case-wrapper";

        const card = document.createElement("div");
        card.className = "flip-card";

        card.tabIndex = 0;
        card.setAttribute("role", "button");

        const number =
            String(gameCase.id).padStart(3, "0");

        let buttonLabel = "🔒 LOCKED";

        if (gameCase.id === 1) {
            buttonLabel = "▶ START INVESTIGATION";
        } else if (gameCase.id === 2 && unlocked) {
            buttonLabel = "▶ START INVESTIGATION";
        }

        const canStart =
            unlocked && (gameCase.id === 1 || gameCase.id === 2);

        card.innerHTML = `
            <div class="flip-card-inner">

                <div class="flip-card-front">

                    <div class="card-image">

                        <img
                            src="${gameCase.image}"
                            alt="${gameCase.title}"
                        >

                        <span class="case-number">
                            CASE ${number}
                        </span>

                    </div>

                    <div class="card-front-info">
                        <h3>${gameCase.title}</h3>
                        <span>↻ CLICK TO FLIP</span>
                    </div>

                </div>

                <div class="flip-card-back">

                    <div class="back-icon">
                        ${gameCase.icon}
                    </div>

                    <h3>${gameCase.title}</h3>

                    <p class="case-description">
                        ${gameCase.description}
                    </p>

                    <div class="case-details">
                        Difficulty: ${gameCase.difficulty}<br>
                        Time Limit: ${gameCase.duration} min
                    </div>

                    <button
                        class="start-btn"
                        ${canStart ? "" : "disabled"}
                    >
                        ${buttonLabel}
                    </button>

                </div>
            </div>
        `;

        /* FLIP CARD */

        card.addEventListener("click", event => {

            if (event.target.closest("button")) return;

            card.classList.toggle("flipped");
        });

        card.addEventListener("keydown", event => {

            if (
                event.target === card &&
                (event.key === "Enter" || event.key === " ")
            ) {
                event.preventDefault();
                card.classList.toggle("flipped");
            }
        });

        /* START INVESTIGATION */

        if (canStart) {

            card.querySelector(".start-btn")
                .addEventListener("click", event => {

                    event.stopPropagation();

                    mainMenu.classList.add("hidden");
                    gameScreen.classList.remove("hidden");

                    document.getElementById("case-title")
                        .textContent = gameCase.title;

                    if (gameCase.id === 1) {

                        // Stop Case 2 if previously active
                        if (typeof stopMuseumInvestigation === "function") {
                            stopMuseumInvestigation();
                        }

                        // Release Case 2 map before opening Case 1
                        if (
                            typeof museumGame !== "undefined" &&
                            museumGame.map
                        ) {
                            museumGame.map.remove();
                            museumGame.map = null;
                        }

                        initializeInvestigation();

                    } else if (gameCase.id === 2) {

                        stopInvestigation();
                        startMuseumInvestigation();
                    }
                });
        }

        wrapper.appendChild(card);
        caseList.appendChild(wrapper);
    });
}

/* =========================================
   UNLOCK NEXT CASE
========================================= */

function unlockNextCase() {
    renderCases();
}

/* =========================================
   BACK TO MAIN MENU
========================================= */

document.getElementById("back-btn")
    .addEventListener("click", () => {

        // Stop Case 1
        stopInvestigation();

        // Stop Case 2
        if (typeof stopMuseumInvestigation === "function") {
            stopMuseumInvestigation();
        }

        gameScreen.classList.add("hidden");
        mainMenu.classList.remove("hidden");

        renderCases();
    });

/* =========================================
   INITIALIZE MAIN MENU
========================================= */

renderCases();
