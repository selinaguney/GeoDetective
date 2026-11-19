
/* =========================================
   GEODETECTIVE — RANDOM GAME ENGINE
   CASE 1: THE MISSING PROFESSOR
========================================= */

const gameState = {
    stage: 0,
    seconds: 180,
    interval: null,
    scenario: null,
    selectedPoint: null,
    completed: [],
    mistakes: 0,
    finished: true
};

const MISSION_TIMES = [
    "18:30",
    "19:15",
    "19:40",
    "20:10"
];

/* =========================================
   START INVESTIGATION
========================================= */

function initializeInvestigation() {

    stopInvestigation();

    gameState.stage = 0;
    gameState.seconds = 180;
    gameState.scenario = generateScenario();
    gameState.selectedPoint = null;
    gameState.completed = [];
    gameState.mistakes = 0;
    gameState.finished = false;

    updateTimer();
    renderMission();
    initializeMap();

    gameState.interval = setInterval(() => {

        if (gameState.finished) return;

        gameState.seconds = Math.max(
            0,
            gameState.seconds - 1
        );

        updateTimer();

        if (gameState.seconds === 0) {
            finishCase(false);
        }

    }, 1000);
}

function stopInvestigation() {

    if (gameState.interval !== null) {
        clearInterval(gameState.interval);
        gameState.interval = null;
    }

    gameState.finished = true;
}

function updateTimer() {

    const minutes = Math.floor(gameState.seconds / 60);
    const seconds = gameState.seconds % 60;

    document.getElementById("timer").textContent =
        `${String(minutes).padStart(2, "0")}:` +
        `${String(seconds).padStart(2, "0")}`;
}

/* =========================================
   MISSION CONTENT
========================================= */

function renderMission() {

    const s = gameState.scenario;
    const stage = gameState.stage;

    const titles = [
        "The Last Sighting",
        "The Phone Signal",
        "The CCTV Trail",
        "The Final Discovery"
    ];

    const descriptions = [
        "Professor Reed disappeared after visiting a research facility. Investigators recovered a description of the building.",

        "A phone transmission was detected by three nearby cell towers. Analyze their coverage areas to narrow the search.",

        "Several cameras recorded suspicious movements. Only one recording matches the recovered witness statement.",

        "The last CCTV record has narrowed the search to a group of buildings. Identify the final destination."
    ];

    const objectives = [
        `Find the location associated with "${s.correctBuilding.clue}". Select the corresponding building on the map.`,

        "Select a point inside the common coverage area of all three cell towers.",

        `Find the camera recording from ${s.correctTime} showing movement toward the ${s.targetDirection.name.toLowerCase()}.`,

        "Select the building located within 1.5 km of the confirmed CCTV position."
    ];

    document.getElementById("stage-number").textContent =
        `MISSION ${String(stage + 1).padStart(2, "0")} / 04`;

    document.getElementById("case-district").textContent =
        s.district.toUpperCase();

    document.getElementById("mission-title").textContent =
        titles[stage];

    document.getElementById("mission-description").textContent =
        descriptions[stage];

    document.getElementById("mission-objective").textContent =
        objectives[stage];

    document.getElementById("timeline").innerHTML =
        MISSION_TIMES.map((time, index) => {

            let status = "";
            let icon = "🔒 ";

            if (index < stage) {
                status = "done";
                icon = "✓ ";
            } else if (index === stage) {
                status = "active";
                icon = "";
            }

            return `
                <div class="timeline-step ${status}">
                    ${icon}${time}
                </div>
            `;

        }).join("");

    renderDocuments();
    renderActions();
    updateEvidenceBoard();
    showFeedback("");
}

/* =========================================
   EVIDENCE DOCUMENTS
========================================= */

function renderDocuments() {

    const s = gameState.scenario;
    const stage = gameState.stage;
    const container =
        document.getElementById("evidence-documents");

    container.innerHTML = "";

    /* STAGE 3 — ANIMATED CCTV */

    if (stage === 2) {

        const grid = document.createElement("div");
        grid.className = "cctv-grid";

        s.cameraRecords.forEach(camera => {

            const card = document.createElement("div");
            card.className = "cctv-card";

            const screen = document.createElement("div");
            screen.className = "cctv-screen";

            const top = document.createElement("div");
            top.className = "cctv-top";

            const rec = document.createElement("span");
            rec.className = "cctv-rec";
            rec.textContent = "● REC";

            const name = document.createElement("span");
            name.textContent = camera.label;

            top.append(rec, name);

            const scene = document.createElement("div");
            scene.className = "cctv-scene";

            const building = document.createElement("div");
            building.className = "cctv-building";

            const person = document.createElement("div");
            person.className = "cctv-person";

            const head = document.createElement("div");
            head.className = "person-head";

            const body = document.createElement("div");
            body.className = "person-body";

            const legs = document.createElement("div");
            legs.className = "person-legs";

            person.append(head, body, legs);

            person.classList.add(
                "move-" + camera.direction.toLowerCase()
            );

            scene.append(building, person);

            const bottom = document.createElement("div");
            bottom.className = "cctv-bottom";

            const time = document.createElement("span");
            time.textContent = camera.time;

            const status = document.createElement("span");
            status.textContent = "MOTION DETECTED";

            bottom.append(time, status);

            screen.append(top, scene, bottom);

            const footer = document.createElement("div");
            footer.className = "cctv-footer";
            footer.textContent =
                "SECURITY CAMERA — ARCHIVED RECORDING";

            card.append(screen, footer);
            grid.appendChild(card);
        });

        container.appendChild(grid);
        return;
    }

    /* OTHER EVIDENCE */

    let documents = [];

    if (stage === 0) {

        documents = [
            {
                title: "RECOVERED NOTEBOOK",
                text:
                    `The professor's last appointment concerned ${s.correctBuilding.clue}.`
            },
            {
                title: "BUILDING DATABASE",
                text:
                    "Three possible buildings have been identified. Examine their names and functions on the map."
            }
        ];

    } else if (stage === 1) {

        documents = [
            {
                title: "PHONE NETWORK LOG",
                text:
                    "19:15 — The same signal was detected by three cell towers."
            },
            {
                title: "SIGNAL ANALYSIS",
                text:
                    `Each tower covers a radius of ${s.towerRadius} meters. The phone must be within range of all three.`
            }
        ];

    } else if (stage === 3) {

        documents = [
            {
                title: "SEARCH REPORT",
                text:
                    "The professor traveled no more than 1.5 km from the last confirmed camera position."
            },
            {
                title: "GEOGRAPHIC EVIDENCE",
                text:
                    "The blue circle represents the maximum straight-line distance. Only one candidate building falls within the search radius."
            }
        ];
    }

    documents.forEach(doc => {

        const card = document.createElement("div");
        card.className = "document-card";

        const heading = document.createElement("h4");
        heading.textContent = doc.title;

        const paragraph = document.createElement("p");
        paragraph.textContent = doc.text;

        card.append(heading, paragraph);
        container.appendChild(card);
    });
}

/* =========================================
   SELECTION CONTROLS
========================================= */

function renderActions() {

    const container =
        document.getElementById("mission-actions");

    container.innerHTML = "";

    const selection = document.createElement("div");
    selection.className = "selection-info";
    selection.id = "selection-info";
    selection.textContent =
        "No location selected. Click on the map.";

    const button = document.createElement("button");
    button.className = "primary-btn";
    button.id = "verify-location";
    button.textContent = "VERIFY LOCATION";
    button.disabled = true;

    button.addEventListener("click", verifySelection);

    container.append(selection, button);
}

function updateSelectionDisplay() {

    const info =
        document.getElementById("selection-info");

    const button =
        document.getElementById("verify-location");

    if (!info || !button) return;

    const point = gameState.selectedPoint;

    if (!point) {
        info.textContent = "No location selected.";
        button.disabled = true;
        return;
    }

    info.textContent =
        `Selected: ${point[0].toFixed(5)}, ` +
        `${point[1].toFixed(5)}`;

    button.disabled = false;

    showFeedback(
        "Location selected. Verify your decision."
    );
}

/* =========================================
   ANSWER VALIDATION
========================================= */

function verifySelection() {

    if (
        gameState.finished ||
        !gameState.selectedPoint
    ) return;

    const point = gameState.selectedPoint;
    const s = gameState.scenario;

    let correct = false;
    let evidence = "";

    /* STAGE 1 */

    if (gameState.stage === 0) {

        correct =
            distanceMeters(
                point,
                s.correctBuilding.point
            ) <= 110;

        evidence =
            `18:30 — ${s.correctBuilding.name} confirmed.`;
    }

    /* STAGE 2 */

    else if (gameState.stage === 1) {

        correct = s.towers.every(tower =>
            distanceMeters(point, tower) <= s.towerRadius
        );

        evidence =
            "19:15 — Shared phone signal area identified.";
    }

    /* STAGE 3 */

    else if (gameState.stage === 2) {

        correct =
            distanceMeters(
                point,
                s.correctCamera.point
            ) <= 110;

        evidence =
            `${s.correctTime} — ${s.targetDirection.name}bound movement confirmed.`;
    }

    /* STAGE 4 */

    else if (gameState.stage === 3) {

        const correctSite = s.finalSites.find(
            site => site.id === "correct"
        );

        correct =
            distanceMeters(
                point,
                correctSite.point
            ) <= 110;

        evidence =
            `20:10 — Professor Reed located at ${correctSite.name}.`;
    }

    if (!correct) {
        applyPenalty();
        return;
    }

    gameState.completed.push(evidence);

    if (gameState.stage === 3) {
        finishCase(true);
        return;
    }

    gameState.stage++;
    gameState.selectedPoint = null;

    renderMission();
    renderStageMap();

    showFeedback(
        "Evidence confirmed. The next event is now available."
    );
}

/* =========================================
   WRONG ANSWER PENALTY
========================================= */

function applyPenalty() {

    gameState.mistakes++;

    gameState.seconds = Math.max(
        0,
        gameState.seconds - 30
    );

    updateTimer();

    if (gameState.seconds === 0) {
        finishCase(false);
        return;
    }

    showFeedback(
        "Incorrect location. Review the evidence. −30 seconds.",
        true
    );
}

/* =========================================
   EVIDENCE BOARD
========================================= */

function updateEvidenceBoard() {

    const collected = gameState.completed.length;

    document.getElementById("progress-text").textContent =
        `${collected} / 4`;

    document.getElementById("progress-fill").style.width =
        `${collected * 25}%`;

    const list =
        document.getElementById("evidence-list");

    list.innerHTML = "";

    MISSION_TIMES.forEach((time, index) => {

        const item = document.createElement("div");

        if (index < collected) {

            item.className = "evidence-item done";

            if (
                index === collected - 1 &&
                !gameState.finished
            ) {
                item.classList.add("new-evidence");
            }

            const heading = document.createElement("strong");
            heading.textContent =
                `📁 ${time} — EVIDENCE`;

            const description = document.createElement("p");
            description.textContent =
                gameState.completed[index];

            description.style.marginBottom = "0";
            description.style.lineHeight = "1.5";

            item.append(heading, description);

        } else {

            item.className = "evidence-item";
            item.textContent =
                `🔒 ${time} — EVIDENCE LOCKED`;
        }

        list.appendChild(item);
    });
}

/* =========================================
   FEEDBACK
========================================= */

function showFeedback(message, error = false) {

    const element =
        document.getElementById("feedback");

    element.textContent = message;

    element.className =
        error ? "feedback error" : "feedback";
}

/* =========================================
   GAME RESULT
========================================= */

function finishCase(success) {

    if (gameState.finished) return;

    stopInvestigation();

    const score = Math.max(
        0,
        gameState.completed.length * 250 +
        gameState.seconds * 2 -
        gameState.mistakes * 100
    );

    let rank = "Rookie";

    if (success) {

        if (score >= 1100) {
            rank = "Master Detective";
        } else if (score >= 900) {
            rank = "Expert Detective";
        } else if (score >= 700) {
            rank = "Investigator";
        }
    }

    const minutes =
        Math.floor(gameState.seconds / 60);

    const seconds =
        gameState.seconds % 60;

    const remainingTime =
        `${String(minutes).padStart(2, "0")}:` +
        `${String(seconds).padStart(2, "0")}`;

    if (success) {

        localStorage.setItem(
            "geodetective-case-1",
            "solved"
        );

        unlockNextCase();
    }

    updateEvidenceBoard();

    document.getElementById("mission-title").textContent =
        success ? "CASE SOLVED" : "CASE FAILED";

    document.getElementById("mission-description").textContent =
        success
            ? "You successfully reconstructed the professor's movements."
            : "The investigation ended before the case was solved.";

    document.getElementById("mission-objective").textContent =
        success
            ? "Investigation completed."
            : "Try again with a new investigation.";

    document.getElementById("evidence-documents").innerHTML = "";

    const actions =
        document.getElementById("mission-actions");

    actions.innerHTML = "";

    const result = document.createElement("div");
    result.className = "case-result";

    const heading = document.createElement("div");
    heading.className = "result-heading";

    heading.textContent = success
        ? "🏆 INVESTIGATION COMPLETED"
        : "⌛ INVESTIGATION FAILED";

    const stats = document.createElement("div");
    stats.className = "result-stats";

    const values = [
        ["TIME REMAINING", remainingTime],
        ["WRONG ANSWERS", String(gameState.mistakes)],
        ["TOTAL SCORE", String(score)],
        ["DETECTIVE RANK", rank]
    ];

    values.forEach(([label, value]) => {

        const item = document.createElement("div");
        item.className = "result-stat";

        const caption = document.createElement("span");
        caption.textContent = label;

        const number = document.createElement("strong");
        number.textContent = value;

        item.append(caption, number);
        stats.appendChild(item);
    });

    const playAgain = document.createElement("button");
    playAgain.className = "primary-btn";
    playAgain.textContent = "↻ PLAY AGAIN";

    playAgain.addEventListener("click", () => {
        initializeInvestigation();
    });

    result.append(heading, stats, playAgain);
    actions.appendChild(result);

    showFeedback(
        success
            ? "All evidence verified. Case closed."
            : "The case remains unsolved.",
        !success
    );
}
