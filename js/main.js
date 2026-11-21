
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
            "A valuable artifact has disappeared. Investigate surveillance footage, track suspects, analyze escape routes, and locate the thief's hideout.",
        difficulty: "Medium",
        duration: 4,
        icon: "🏛️",
        image: "img/museum.jpg"
    },
    {
        id: 3,
        title: "The Coordinate Cipher",
        description:
            "Decode geographic patterns and coordinates to uncover a hidden meeting place.",
        difficulty: "Hard",
        duration: 10,
        icon: "🧭",
        image: "img/map.jpg"
    }
];


/* =========================================
   HTML ELEMENTS
========================================= */

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

        // Chapter 1 is always available.
        // Chapter 2 unlocks after Chapter 1.
        // Chapter 3 stays locked until implemented.

        const unlocked =
            gameCase.id === 1 ||
            (gameCase.id === 2 && firstCaseSolved);

        const canStart =
            gameCase.id === 3 ||
            (unlocked && (gameCase.id === 1 || gameCase.id === 2));

        const wrapper = document.createElement("div");
        wrapper.className = "case-wrapper";

        const card = document.createElement("div");
        card.className = "flip-card";

        card.tabIndex = 0;
        card.setAttribute("role", "button");

        const number =
            String(gameCase.id).padStart(3, "0");

        const buttonLabel = canStart
            ? "▶ START INVESTIGATION"
            : "🔒 LOCKED";

        card.innerHTML = `
            <div class="flip-card-inner">

                <!-- FRONT SIDE -->
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

                <!-- BACK SIDE -->
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
                        type="button"
                        ${canStart ? "" : "disabled"}
                    >
                        ${buttonLabel}
                    </button>

                </div>

            </div>
        `;


        /* =========================================
           FLIP CARD
        ========================================= */

        card.addEventListener("click", event => {

            if (event.target.closest("button")) {
                return;
            }

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


        /* =========================================
           START INVESTIGATION
        ========================================= */

        if (canStart) {

            const startButton =
                card.querySelector(".start-btn");

            startButton.addEventListener("click", event => {

                event.stopPropagation();

                mainMenu.classList.add("hidden");
                gameScreen.classList.remove("hidden");

                document.getElementById("case-title")
                    .textContent = gameCase.title;


                /* CHAPTER 1 — THE MISSING PROFESSOR */

                if (gameCase.id === 1) {

                    // Stop Chapter 2 if previously active.
                    if (
                        typeof stopMuseumInvestigation === "function"
                    ) {
                        stopMuseumInvestigation();
                    }

                    // Remove the Chapter 2 map.
                    if (
                        typeof museumGame !== "undefined" &&
                        museumGame.map
                    ) {

                        museumGame.map.remove();
                        museumGame.map = null;
                    }

                    initializeInvestigation();
                }


                /* CHAPTER 2 — MIDNIGHT AT THE MUSEUM */

                else if (gameCase.id === 2) {

                    stopInvestigation();
                    startMuseumInvestigation();
                }

                else if (gameCase.id === 3) {
    
                    stopInvestigation();
                    stopMuseumInvestigation();
   
                if (museumGame.map) {
        
                    museumGame.map.remove();
                    museumGame.map = null;
    }

    startCipherInvestigation();
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

        // Stop Chapter 1.
        stopInvestigation();

        // Stop Chapter 2.
        if (
            typeof stopMuseumInvestigation === "function"
        ) {
            stopMuseumInvestigation();
        }

        gameScreen.classList.add("hidden");

        mainMenu.classList.remove("hidden");

        if (typeof stopCipherInvestigation === "function") {
    
            stopCipherInvestigation();
}

        renderCases();
    });


/* =========================================
   INITIALIZE MAIN MENU
========================================= */

renderCases();
