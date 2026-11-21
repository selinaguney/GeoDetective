
/* =========================================================
   GEODETECTIVE — CASE 3: THE COORDINATE CIPHER
   Four missions / Shared 6-minute countdown

   Dependencies:
   Leaflet, Turf.js, Chart.js, D3.js

   Required file:
   data/turkey-boundary.geojson
========================================================= */

const cipherGame = {
    stage: 0,
    scenario: null,
    map: null,
    layer: null,
    distanceMission: null,
    overlayMission: null,
    finalMission: null,
    finished: true,
    timedOut: false
};

let cipherTimerInterval = null;
let cipherTimeLeft = 360;
let cipherSession = 0;
let cipherDeadline = 0;

window.turkeyBoundary = null;

/* =========================================================
   GENERAL HELPERS
========================================================= */

function cipherEl(id) {
    return document.getElementById(id);
}

function cipherSet(id, value) {
    const element = cipherEl(id);
    if (element) element.textContent = value;
}

function cipherHTML(id, html) {
    const element = cipherEl(id);
    if (element) element.innerHTML = html;
}

function cipherFeedback(message) {
    cipherSet("feedback", message);
}

function cipherActive(stage) {
    return (
        !cipherGame.timedOut &&
        !cipherGame.finished &&
        cipherGame.stage === stage
    );
}

function cipherRandom(min, max) {
    return min + Math.random() * (max - min);
}

function cipherRound(value, decimals = 1) {
    const factor = 10 ** decimals;
    return Math.round(value * factor) / factor;
}

function cipherKm(a, b) {
    const rad = Math.PI / 180;

    const dLat = (b[0] - a[0]) * rad;
    const dLon = (b[1] - a[1]) * rad;

    const h =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(a[0] * rad) *
        Math.cos(b[0] * rad) *
        Math.sin(dLon / 2) ** 2;

    return 6371 * 2 * Math.atan2(
        Math.sqrt(h),
        Math.sqrt(Math.max(0, 1 - h))
    );
}

function cipherDestination(point, distance, bearing) {
    const result = turf.destination(
        turf.point([point[1], point[0]]),
        distance,
        bearing,
        { units: "kilometers" }
    );

    return [
        result.geometry.coordinates[1],
        result.geometry.coordinates[0]
    ];
}

function cipherInsideTurkey(point) {
    if (!window.turkeyBoundary) return false;

    return turf.booleanPointInPolygon(
        turf.point([point[1], point[0]]),
        window.turkeyBoundary
    );
}

function cipherShuffle(array) {
    const result = [...array];

    for (let i = result.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));

        [result[i], result[j]] = [
            result[j],
            result[i]
        ];
    }

    return result;
}

function cipherIcon(label, color = "#e2e8f0") {
    return L.divIcon({
        className: "cipher-custom-marker",
        html: `
            <div style="
                width:34px;
                height:34px;
                border-radius:50%;
                background:${color};
                border:2px solid white;
                color:#132238;
                display:flex;
                justify-content:center;
                align-items:center;
                font-weight:800;
                font-size:14px;
                box-shadow:0 3px 10px #0008;
            ">${label}</div>
        `,
        iconSize: [38, 38],
        iconAnchor: [19, 19]
    });
}

function cipherMarker(point, label, color) {
    return L.marker(point, {
        icon: cipherIcon(label, color)
    }).addTo(cipherGame.layer);
}

function cipherProgress(completed) {
    cipherSet("progress-text", `${completed} / 4`);

    const fill = cipherEl("progress-fill");

    if (fill) {
        fill.style.width = `${completed * 25}%`;
    }

    const labels = [
        "Coordinates",
        "Distance",
        "Overlay",
        "Final Cipher"
    ];

    cipherHTML(
        "timeline",
        labels.map((label, index) => {
            let status = "";

            if (index < completed) {
                status = "completed";
            } else if (index === completed) {
                status = "active";
            }

            return `
                <div class="timeline-step ${status}">
                    ${String(index + 1).padStart(2, "0")}
                    — ${label}
                    ${index < completed ? "✓" : ""}
                </div>
            `;
        }).join("")
    );

    cipherHTML(
        "evidence-list",
        labels.map((label, index) => `
            <div class="evidence-item">
                ${index < completed ? "✅" : "🔒"}
                ${label}
            </div>
        `).join("")
    );
}

function cipherMissionInfo(stage, title, description, objective) {
    cipherSet(
        "stage-number",
        `MISSION ${String(stage).padStart(2, "0")} / 04`
    );

    cipherSet("mission-title", title);
    cipherSet("mission-description", description);
    cipherSet("mission-objective", objective);

    cipherFeedback("");
}

function cipherComplete(stage, message, nextFunction) {
    cipherGame.finished = true;

    cipherProgress(stage);
    cipherFeedback(message);

    if (stage === 4) {
        stopCipherTimer();
        return;
    }

    cipherHTML("mission-actions", `
        <div class="selection-info">
            ✓ MISSION ${stage} COMPLETED
        </div>

        <p>${message}</p>

        <button
            class="primary-btn"
            id="cipher-next-mission"
            type="button"
            style="width:100%"
        >
            CONTINUE TO MISSION ${stage + 1}
        </button>
    `);

    cipherEl("cipher-next-mission")
        .addEventListener("click", nextFunction);
}

/* =========================================================
   TIMER
========================================================= */

function updateCipherTimerDisplay() {
    const minutes = Math.floor(cipherTimeLeft / 60);
    const seconds = cipherTimeLeft % 60;

    cipherSet(
        "timer",
        `${String(minutes).padStart(2, "0")}:` +
        `${String(seconds).padStart(2, "0")}`
    );
}

function stopCipherTimer() {
    if (cipherTimerInterval !== null) {
        clearInterval(cipherTimerInterval);
        cipherTimerInterval = null;
    }
}

function cipherTimeExpired() {
    stopCipherTimer();

    cipherGame.timedOut = true;
    cipherGame.finished = true;

    cipherFeedback(
        "TIME'S UP! The investigation has failed."
    );

    cipherHTML("mission-actions", `
        <div class="selection-info">
            TIME'S UP — CASE FAILED
        </div>

        <p>
            You ran out of time before solving
            The Coordinate Cipher.
        </p>

        <button
            class="primary-btn"
            id="cipher-retry"
            type="button"
            style="width:100%"
        >
            RETRY INVESTIGATION
        </button>
    `);

    cipherEl("cipher-retry").addEventListener(
        "click",
        startCipherInvestigation
    );
}

function startCipherTimer() {
    stopCipherTimer();

    cipherTimeLeft = 360;
    cipherDeadline = Date.now() + 360000;
    cipherGame.timedOut = false;

    updateCipherTimerDisplay();

    const currentSession = cipherSession;

    cipherTimerInterval = setInterval(() => {
        if (currentSession !== cipherSession) {
            stopCipherTimer();
            return;
        }

        if (cipherGame.timedOut) {
            stopCipherTimer();
            return;
        }

        if (
            cipherGame.stage === 4 &&
            cipherGame.finished
        ) {
            stopCipherTimer();
            return;
        }

        cipherTimeLeft = Math.max(
            0,
            Math.ceil(
                (cipherDeadline - Date.now()) / 1000
            )
        );

        updateCipherTimerDisplay();

        if (cipherTimeLeft === 0) {
            cipherTimeExpired();
        }
    }, 250);
}

/* =========================================================
   TURKEY BOUNDARY
========================================================= */

async function loadTurkeyBoundary() {
    if (window.turkeyBoundary) return;

    const response = await fetch(
        "data/turkey-boundary.geojson"
    );

    if (!response.ok) {
        throw new Error(
            "Could not load data/turkey-boundary.geojson"
        );
    }

    const geojson = await response.json();

    if (geojson.type === "FeatureCollection") {
        if (!geojson.features.length) {
            throw new Error("Turkey boundary is empty.");
        }

        window.turkeyBoundary =
            turf.combine(geojson).features[0];

    } else if (geojson.type === "Feature") {
        window.turkeyBoundary = geojson;

    } else {
        window.turkeyBoundary = turf.feature(geojson);
    }
}

function cipherDMS(value, positive, negative) {
    const absolute = Math.abs(value);
    const degrees = Math.floor(absolute);
    const minutes = Math.floor(
        (absolute - degrees) * 60
    );

    const seconds =
        ((absolute - degrees) * 60 - minutes) * 60;

    const direction =
        value >= 0 ? positive : negative;

    return (
        `${degrees}° ${minutes}' ` +
        `${seconds.toFixed(1)}" ${direction}`
    );
}

function generateCipherCoordinates() {
    for (let attempt = 0; attempt < 10000; attempt++) {
        const lat = cipherRandom(35.8, 42.2);
        const lon = cipherRandom(25.6, 44.9);

        const point = [lat, lon];

        if (cipherInsideTurkey(point)) {
            const latitudeDMS = cipherDMS(
                lat, "N", "S"
            );

            const longitudeDMS = cipherDMS(
                lon, "E", "W"
            );

            return {
                correct: { point },
                latitudeDMS,
                longitudeDMS
            };
        }
    }

    throw new Error(
        "Could not generate a location inside Türkiye."
    );
}

const CipherCase = {
    generateScenario: generateCipherCoordinates,

    isInsideTurkey: (lat, lon) =>
        cipherInsideTurkey([lat, lon])
};

/* =========================================================
   MAP INITIALIZATION
========================================================= */

function initializeCipherMap() {
    if (cipherGame.map) {
        cipherGame.map.remove();
        cipherGame.map = null;
    }

    const mapContainer = cipherEl("map");

    if (!mapContainer) {
        throw new Error(
            "Map container was not found."
        );
    }

    if (mapContainer._leaflet_id) {
        const previousMap =
            window.map ||
            window.detectiveMap ||
            (
                typeof museumGame !== "undefined"
                    ? museumGame.map
                    : null
            );

        if (
            previousMap &&
            typeof previousMap.remove === "function"
        ) {
            previousMap.remove();
        }
    }

    if (mapContainer._leaflet_id) {
        delete mapContainer._leaflet_id;
    }

    cipherGame.map = L.map("map", {
        minZoom: 5,
        maxZoom: 19,
        maxBounds: [
            [35, 25],
            [43, 46]
        ],
        maxBoundsViscosity: 1
    }).setView([39, 35], 6);

    L.tileLayer(
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        {
            attribution:
                "&copy; OpenStreetMap contributors",
            maxZoom: 19
        }
    ).addTo(cipherGame.map);

    cipherGame.layer = L.layerGroup()
        .addTo(cipherGame.map);

    setTimeout(() => {
        if (cipherGame.map) {
            cipherGame.map.invalidateSize();
        }
    }, 200);
}

/* =========================================================
   START INVESTIGATION
========================================================= */

async function startCipherInvestigation() {
    const session = ++cipherSession;

    stopCipherTimer();

    cipherGame.finished = true;
    cipherGame.timedOut = false;

    try {
        await loadTurkeyBoundary();

        if (session !== cipherSession) return;

        if (cipherGame.distanceMission?.chart) {
            cipherGame.distanceMission.chart.destroy();
        }

        cipherGame.scenario =
            generateCipherCoordinates();

        cipherGame.distanceMission = null;
        cipherGame.overlayMission = null;
        cipherGame.finalMission = null;

        cipherGame.stage = 1;
        cipherGame.finished = false;

        cipherSet(
            "case-title",
            "The Coordinate Cipher"
        );

        cipherSet("case-district", "TÜRKIYE");

        cipherMissionInfo(
            1,
            "The Hidden Coordinates",
            "A missing researcher left secret coordinates somewhere in Türkiye.",
            "Convert the DMS coordinates into decimal degrees."
        );

        cipherProgress(0);

        const scenario = cipherGame.scenario;

        cipherHTML("evidence-documents", `
            <div class="document-card">
                <h4>RECOVERED NOTE</h4>

                <p>
                    Latitude:
                    <strong>
                        ${scenario.latitudeDMS}
                    </strong>
                </p>

                <p>
                    Longitude:
                    <strong>
                        ${scenario.longitudeDMS}
                    </strong>
                </p>
            </div>

            <div class="document-card">
                <h4>COORDINATE CONVERSION</h4>

                <p>
                    DD = Degrees + Minutes / 60
                    + Seconds / 3600
                </p>

                <p>
                    North and East are positive.
                </p>
            </div>
        `);

        cipherHTML("mission-actions", `
            <div class="cipher-coordinate-form">
                <div class="cipher-input-group">
                    <label for="cipher-lat">
                        LATITUDE
                    </label>

                    <input
                        id="cipher-lat"
                        type="text"
                        inputmode="decimal"
                        placeholder="e.g. 39.9208"
                    >
                </div>

                <div class="cipher-input-group">
                    <label for="cipher-lon">
                        LONGITUDE
                    </label>

                    <input
                        id="cipher-lon"
                        type="text"
                        inputmode="decimal"
                        placeholder="e.g. 32.8541"
                    >
                </div>

                <button
                    class="primary-btn"
                    id="cipher-verify"
                    type="button"
                    style="
                        grid-column:1 / -1;
                        width:100%;
                        min-height:40px;
                        box-sizing:border-box;
                    "
                >
                    VERIFY COORDINATES
                </button>
            </div>
        `);

        cipherEl("cipher-verify").addEventListener(
            "click",
            verifyCipherCoordinates
        );

        initializeCipherMap();
        startCipherTimer();

    } catch (error) {
        console.error(
            "Cipher initialization error:",
            error
        );

        cipherFeedback(
            "Could not start investigation: " +
            error.message
        );
    }
}

/* =========================================================
   MISSION 1 — HIDDEN COORDINATES
========================================================= */

function verifyCipherCoordinates() {
    if (!cipherActive(1)) return;

    const latitudeText = cipherEl("cipher-lat")
        .value.trim().replace(",", ".");

    const longitudeText = cipherEl("cipher-lon")
        .value.trim().replace(",", ".");

    const lat = Number(latitudeText);
    const lon = Number(longitudeText);

    if (
        !latitudeText ||
        !longitudeText ||
        !Number.isFinite(lat) ||
        !Number.isFinite(lon) ||
        Math.abs(lat) > 90 ||
        Math.abs(lon) > 180
    ) {
        cipherFeedback(
            "Enter valid decimal coordinates."
        );
        return;
    }

    const target =
        cipherGame.scenario.correct.point;

    const distance = cipherKm(
        [lat, lon],
        target
    );

    if (distance > 0.15) {
        cipherFeedback(
            "Incorrect coordinates. Check your DMS conversion."
        );
        return;
    }

    cipherGame.layer.clearLayers();

    cipherMarker(
        target,
        "✓",
        "#59c987"
    )
    .bindPopup("HIDDEN LOCATION DISCOVERED")
    .openPopup();

    cipherGame.map.flyTo(target, 12);

    cipherComplete(
        1,
        "Coordinates accepted! Secret location identified.",
        startCipherMission2
    );
}

/* =========================================================
   MISSION 2 — DISTANCE CIPHER
========================================================= */

function generateCipherDistanceScenario() {
    const start =
        cipherGame.scenario.correct.point;

    for (let attempt = 0; attempt < 500; attempt++) {
        const target = cipherDestination(
            start,
            cipherRandom(8, 20),
            cipherRandom(0, 360)
        );

        if (!cipherInsideTurkey(target)) {
            continue;
        }

        const colors = [
            "#f4c76a",
            "#5fc9d7",
            "#c79af7"
        ];

        const bearings = [20, 140, 260];

        const references = bearings.map(
            (bearing, index) => {
                const point = cipherDestination(
                    target,
                    cipherRandom(5, 11),
                    bearing + cipherRandom(-10, 10)
                );

                return {
                    name: `REFERENCE ${index + 1}`,
                    point,
                    color: colors[index],
                    distance: cipherKm(point, target)
                };
            }
        );

        const wrong1 = cipherDestination(
            target, 4, 70
        );

        const wrong2 = cipherDestination(
            target, 5, 210
        );

        const allPoints = [
            ...references.map(r => r.point),
            wrong1,
            wrong2
        ];

        if (!allPoints.every(cipherInsideTurkey)) {
            continue;
        }

        const candidates = cipherShuffle([
            {
                point: target,
                correct: true
            },
            {
                point: wrong1,
                correct: false
            },
            {
                point: wrong2,
                correct: false
            }
        ]);

        candidates.forEach((candidate, index) => {
            candidate.label = ["A", "B", "C"][index];
        });

        return {
            target,
            references,
            candidates,
            revealed: 0,
            selectedIndex: null,
            chart: null
        };
    }

    throw new Error(
        "Distance scenario generation failed."
    );
}

function startCipherMission2() {
    if (
        cipherGame.timedOut ||
        cipherGame.stage !== 1 ||
        !cipherGame.finished
    ) return;

    let mission;

    try {
        mission = generateCipherDistanceScenario();
    } catch (error) {
        cipherFeedback(error.message);
        return;
    }

    cipherGame.stage = 2;
    cipherGame.finished = false;
    cipherGame.distanceMission = mission;

    cipherMissionInfo(
        2,
        "The Distance Cipher",
        "Three distance clues reveal the next destination.",
        "Reveal the clues and find the candidate matching all distances."
    );

    cipherHTML("evidence-documents", `
        <div class="document-card">
            <h4>DISTANCE ANALYSIS</h4>

            <p>
                Each circle represents a distance
                from a reference point.
            </p>

            <p>
                The correct candidate matches
                all three measurements.
            </p>
        </div>
    `);

    cipherHTML("mission-actions", `
        <div class="selection-info">
            THREE DISTANCE CLUES
        </div>

        <div id="cipher-distance-clues">
            <button
                class="primary-btn"
                id="cipher-reveal-clue"
                type="button"
                style="width:100%"
            >
                REVEAL CLUE 1
            </button>
        </div>

        <div
            id="cipher-distance-chart"
            style="display:none;margin-top:20px"
        >
            <canvas id="cipher-chart-canvas"></canvas>
        </div>

        <div id="cipher-candidate-actions"></div>
    `);

    cipherEl("cipher-reveal-clue").addEventListener(
        "click",
        revealCipherDistanceClue
    );

    cipherGame.layer.clearLayers();

    cipherMarker(
        cipherGame.scenario.correct.point,
        "S",
        "#5fc9d7"
    ).bindPopup("PREVIOUS LOCATION");

    cipherGame.map.setView(
        cipherGame.scenario.correct.point,
        9
    );
}

function revealCipherDistanceClue() {
    if (!cipherActive(2)) return;

    const mission = cipherGame.distanceMission;

    if (mission.revealed >= 3) return;

    const index = mission.revealed;
    const reference = mission.references[index];

    cipherMarker(
        reference.point,
        index + 1,
        reference.color
    ).bindPopup(
        `${reference.name}: ` +
        `${reference.distance.toFixed(2)} km`
    );

    L.circle(reference.point, {
        radius: reference.distance * 1000,
        color: reference.color,
        weight: 3,
        fillOpacity: 0.02,
        dashArray: "8,6"
    }).addTo(cipherGame.layer);

    mission.revealed++;

    const clue = document.createElement("div");
    clue.className = "document-card";

    clue.innerHTML = `
        <h4>CLUE ${mission.revealed}</h4>

        <p>
            ${reference.name}:
            <strong>
                ${reference.distance.toFixed(2)} km
            </strong>
        </p>
    `;

    const button = cipherEl("cipher-reveal-clue");

    button.before(clue);

    if (mission.revealed < 3) {
        button.textContent =
            `REVEAL CLUE ${mission.revealed + 1}`;
    } else {
        button.remove();

        showCipherDistanceChart();
        showCipherCandidates();

        cipherFeedback(
            "All clues revealed. Compare the candidates."
        );
    }
}

function showCipherDistanceChart() {
    const mission = cipherGame.distanceMission;
    const container = cipherEl(
        "cipher-distance-chart"
    );

    container.style.display = "block";

    if (typeof Chart === "undefined") {
        container.innerHTML =
            "<p>Chart.js is unavailable. Use the map clues.</p>";
        return;
    }

    if (mission.chart) {
        mission.chart.destroy();
    }

    mission.chart = new Chart(
        cipherEl("cipher-chart-canvas"),
        {
            type: "bar",

            data: {
                labels: mission.references.map(
                    r => r.name
                ),

                datasets: [{
                    label: "Distance (km)",

                    data: mission.references.map(
                        r => Number(
                            r.distance.toFixed(2)
                        )
                    ),

                    backgroundColor:
                        mission.references.map(
                            r => r.color
                        )
                }]
            },

            options: {
                responsive: true,

                plugins: {
                    legend: {
                        labels: {
                            color: "#ffffff"
                        }
                    }
                },

                scales: {
                    x: {
                        ticks: {
                            color: "#ffffff"
                        }
                    },

                    y: {
                        beginAtZero: true,
                        ticks: {
                            color: "#ffffff"
                        }
                    }
                }
            }
        }
    );
}

function showCipherCandidates() {
    const mission = cipherGame.distanceMission;

    cipherHTML("cipher-candidate-actions", `
        <div class="selection-info">
            SELECT A CANDIDATE
        </div>

        <p>Click A, B or C on the map.</p>

        <div id="cipher-candidate-comparison"></div>
    `);

    mission.candidates.forEach(
        (candidate, index) => {
            cipherMarker(
                candidate.point,
                candidate.label,
                "#e2e8f0"
            )
            .bindPopup(
                `CANDIDATE ${candidate.label}`
            )
            .on("click", () => {
                selectCipherCandidate(index);
            });
        }
    );

    cipherGame.map.fitBounds(
        [
            ...mission.references.map(r => r.point),
            ...mission.candidates.map(c => c.point)
        ],
        {
            padding: [40, 40],
            maxZoom: 11
        }
    );
}

function selectCipherCandidate(index) {
    if (!cipherActive(2)) return;

    const mission = cipherGame.distanceMission;

    if (mission.revealed !== 3) return;

    mission.selectedIndex = index;

    const candidate = mission.candidates[index];

    const rows = mission.references.map(
        (reference, i) => {
            const actual = cipherKm(
                candidate.point,
                reference.point
            );

            const difference = Math.abs(
                actual - reference.distance
            );

            return `
                <tr>
                    <td>${i + 1}</td>
                    <td>
                        ${reference.distance.toFixed(2)}
                    </td>
                    <td>${actual.toFixed(2)}</td>
                    <td>${difference.toFixed(2)}</td>
                </tr>
            `;
        }
    ).join("");

    cipherHTML("cipher-candidate-comparison", `
        <div class="document-card">
            <h4>
                CANDIDATE ${candidate.label}
            </h4>

            <div style="overflow-x:auto">
                <table style="width:100%;color:white">
                    <thead>
                        <tr>
                            <th>REF</th>
                            <th>CLUE</th>
                            <th>ACTUAL</th>
                            <th>DIFFERENCE</th>
                        </tr>
                    </thead>

                    <tbody>${rows}</tbody>
                </table>
            </div>

            <button
                class="primary-btn"
                id="cipher-confirm-candidate"
                type="button"
                style="width:100%;margin-top:15px"
            >
                CONFIRM CANDIDATE ${candidate.label}
            </button>
        </div>
    `);

    cipherEl("cipher-confirm-candidate")
        .addEventListener(
            "click",
            verifyCipherDistanceCandidate
        );
}

function verifyCipherDistanceCandidate() {
    if (!cipherActive(2)) return;

    const mission = cipherGame.distanceMission;

    if (mission.selectedIndex === null) return;

    const candidate =
        mission.candidates[mission.selectedIndex];

    if (!candidate.correct) {
        cipherFeedback(
            "Incorrect candidate. Compare the distance differences."
        );
        return;
    }

    if (mission.chart) {
        mission.chart.destroy();
        mission.chart = null;
    }

    cipherComplete(
        2,
        "Correct! All three distances match.",
        startCipherMission3
    );
}

/* =========================================================
   MISSION 3 — SPATIAL OVERLAY
========================================================= */

function generateCipherOverlayScenario() {
    const center =
        cipherGame.distanceMission.target;

    const point = turf.point([
        center[1],
        center[0]
    ]);

    const searchArea = turf.buffer(
        point,
        5,
        { units: "kilometers" }
    );

    const forestArea = turf.buffer(
        turf.destination(
            point,
            2,
            70,
            { units: "kilometers" }
        ),
        3.5,
        { units: "kilometers" }
    );

    const restrictedArea = turf.buffer(
        turf.destination(
            point,
            2,
            250,
            { units: "kilometers" }
        ),
        2.5,
        { units: "kilometers" }
    );

    const inside = (candidate, polygon) =>
        turf.booleanPointInPolygon(
            turf.point([
                candidate[1],
                candidate[0]
            ]),
            polygon
        );

    const candidates = [];

    const categories = [
        "correct",
        "outsideForest",
        "restricted"
    ];

    for (const category of categories) {
        let found = false;

        for (
            let attempt = 0;
            attempt < 3000;
            attempt++
        ) {
            const candidate = cipherDestination(
                center,
                cipherRandom(0, 4.5),
                cipherRandom(0, 360)
            );

            if (!cipherInsideTurkey(candidate)) {
                continue;
            }

            const inSearch = inside(
                candidate,
                searchArea
            );

            const inForest = inside(
                candidate,
                forestArea
            );

            const inRestricted = inside(
                candidate,
                restrictedArea
            );

            let matches = false;

            if (category === "correct") {
                matches =
                    inSearch &&
                    inForest &&
                    !inRestricted;

            } else if (category === "outsideForest") {
                matches =
                    inSearch &&
                    !inForest &&
                    !inRestricted;

            } else {
                matches =
                    inSearch &&
                    inRestricted;
            }

            const separated = candidates.every(
                c => cipherKm(
                    c.point,
                    candidate
                ) > 0.7
            );

            if (matches && separated) {
                candidates.push({
                    point: candidate,
                    correct: category === "correct"
                });

                found = true;
                break;
            }
        }

        if (!found) {
            throw new Error(
                "Could not generate overlay candidates."
            );
        }
    }

    const shuffled = cipherShuffle(candidates);

    shuffled.forEach((candidate, index) => {
        candidate.label = ["A", "B", "C"][index];
    });

    return {
        center,
        searchArea,
        forestArea,
        restrictedArea,
        candidates: shuffled,
        revealed: 0,
        selectedIndex: null,
        layers: {}
    };
}

function startCipherMission3() {
    if (
        cipherGame.timedOut ||
        cipherGame.stage !== 2 ||
        !cipherGame.finished
    ) return;

    let mission;

    try {
        mission = generateCipherOverlayScenario();
    } catch (error) {
        cipherFeedback(error.message);
        return;
    }

    cipherGame.overlayMission = mission;
    cipherGame.stage = 3;
    cipherGame.finished = false;

    cipherMissionInfo(
        3,
        "The Overlay Puzzle",
        "Three spatial layers reveal the safe meeting location.",
        "Find a candidate inside Search and Forest, but outside Restricted."
    );

    cipherHTML("evidence-documents", `
        <div class="document-card">
            <h4>SPATIAL OVERLAY RULE</h4>

            <p>
                Search Area ∩ Forest Area
                − Restricted Zone
            </p>

            <p>
                The correct candidate must satisfy
                all three spatial conditions.
            </p>
        </div>
    `);

    cipherHTML("mission-actions", `
        <div class="selection-info">
            SPATIAL LAYERS AVAILABLE
        </div>

        <div id="cipher-overlay-controls">
            <button
                class="primary-btn"
                id="cipher-reveal-overlay"
                type="button"
                style="width:100%"
            >
                REVEAL SEARCH AREA
            </button>
        </div>

        <div id="cipher-overlay-selection"></div>
    `);

    cipherGame.layer.clearLayers();

    cipherGame.map.setView(
        mission.center,
        11
    );

    cipherEl("cipher-reveal-overlay")
        .addEventListener(
            "click",
            revealCipherOverlayLayer
        );
}

function revealCipherOverlayLayer() {
    if (!cipherActive(3)) return;

    const mission = cipherGame.overlayMission;

    if (mission.revealed >= 3) return;

    const definitions = [
        {
            key: "search",
            name: "SEARCH AREA",
            polygon: mission.searchArea,
            color: "#5fc9d7"
        },
        {
            key: "forest",
            name: "FOREST AREA",
            polygon: mission.forestArea,
            color: "#59c987"
        },
        {
            key: "restricted",
            name: "RESTRICTED ZONE",
            polygon: mission.restrictedArea,
            color: "#f07178"
        }
    ];

    const definition =
        definitions[mission.revealed];

    const layer = L.geoJSON(
        definition.polygon,
        {
            style: {
                color: definition.color,
                weight: 3,
                fillColor: definition.color,
                fillOpacity: 0.16
            }
        }
    ).addTo(cipherGame.layer);

    mission.layers[definition.key] = layer;
    mission.revealed++;

    const item = document.createElement("div");
    item.className = "document-card";

    item.innerHTML = `
        <label>
            <input
                type="checkbox"
                id="cipher-layer-${definition.key}"
                checked
            >

            <span style="color:${definition.color}">
                ●
            </span>

            ${definition.name}
        </label>
    `;

    const button = cipherEl(
        "cipher-reveal-overlay"
    );

    button.before(item);

    cipherEl(
        `cipher-layer-${definition.key}`
    ).addEventListener(
        "change",
        event => {
            if (event.target.checked) {
                cipherGame.layer.addLayer(layer);
            } else {
                cipherGame.layer.removeLayer(layer);
            }
        }
    );

    if (mission.revealed < 3) {
        button.textContent =
            mission.revealed === 1
                ? "REVEAL FOREST AREA"
                : "REVEAL RESTRICTED ZONE";

    } else {
        button.remove();

        showCipherOverlayCandidates();

        cipherFeedback(
            "All layers revealed. Find the safe location."
        );
    }
}

function showCipherOverlayCandidates() {
    const mission = cipherGame.overlayMission;

    cipherHTML("cipher-overlay-selection", `
        <div class="selection-info">
            SELECT THE SAFE LOCATION
        </div>

        <p>
            Click candidate A, B or C on the map.
        </p>

        <div id="cipher-overlay-comparison"></div>
    `);

    mission.candidates.forEach(
        (candidate, index) => {
            cipherMarker(
                candidate.point,
                candidate.label,
                "#e2e8f0"
            )
            .bindPopup(
                `CANDIDATE ${candidate.label}`
            )
            .on("click", () => {
                selectCipherOverlayCandidate(index);
            });
        }
    );
}

function selectCipherOverlayCandidate(index) {
    if (!cipherActive(3)) return;

    const mission = cipherGame.overlayMission;

    mission.selectedIndex = index;

    const candidate = mission.candidates[index];

    const point = turf.point([
        candidate.point[1],
        candidate.point[0]
    ]);

    const inSearch = turf.booleanPointInPolygon(
        point,
        mission.searchArea
    );

    const inForest = turf.booleanPointInPolygon(
        point,
        mission.forestArea
    );

    const inRestricted = turf.booleanPointInPolygon(
        point,
        mission.restrictedArea
    );

    cipherHTML("cipher-overlay-comparison", `
        <div class="document-card">
            <h4>
                CANDIDATE ${candidate.label}
            </h4>

            <p>
                Search Area:
                ${inSearch ? "YES" : "NO"}
            </p>

            <p>
                Forest Area:
                ${inForest ? "YES" : "NO"}
            </p>

            <p>
                Restricted Zone:
                ${inRestricted ? "YES" : "NO"}
            </p>

            <button
                class="primary-btn"
                id="cipher-confirm-overlay"
                type="button"
                style="width:100%"
            >
                CONFIRM CANDIDATE ${candidate.label}
            </button>
        </div>
    `);

    cipherEl("cipher-confirm-overlay")
        .addEventListener(
            "click",
            verifyCipherOverlayCandidate
        );
}

function verifyCipherOverlayCandidate() {
    if (!cipherActive(3)) return;

    const mission = cipherGame.overlayMission;

    if (mission.selectedIndex === null) return;

    const candidate =
        mission.candidates[mission.selectedIndex];

    if (!candidate.correct) {
        cipherFeedback(
            "Incorrect location. Check all three spatial conditions."
        );
        return;
    }

    cipherComplete(
        3,
        "Correct! The location satisfies all spatial conditions.",
        startCipherMission4
    );
}

/* =========================================================
   MISSION 4 — RANDOM SCENARIO GENERATION
========================================================= */

function generateCipherFinalScenario(origin) {
    for (let attempt = 0; attempt < 1000; attempt++) {
        const bearing = cipherRandom(0, 360);

        const signalLimit = cipherRound(
            cipherRandom(3.4, 5.8),
            1
        );

        const speed = cipherRound(
            cipherRandom(2.5, 5.5),
            1
        );

        const time = cipherRound(
            cipherRandom(0.8, 1.8),
            1
        );

        const travelLimit = cipherRound(
            speed * time,
            2
        );

        const elevationMin =
            Math.round(
                cipherRandom(450, 1250) / 50
            ) * 50;

        const elevationMax =
            elevationMin +
            Math.round(
                cipherRandom(200, 450) / 50
            ) * 50;

        const correctRadius = cipherRandom(
            0.8,
            Math.min(2.7, travelLimit - 0.3)
        );

        const correctPoint = cipherDestination(
            origin,
            correctRadius,
            bearing
        );

        const tower = cipherDestination(
            correctPoint,
            cipherRandom(
                0.7,
                Math.min(2.1, signalLimit - 0.3)
            ),
            bearing + cipherRandom(50, 130)
        );

        const farPoint = cipherDestination(
            origin,
            Math.max(
                travelLimit + 1.6,
                correctRadius + 4.5
            ),
            bearing + cipherRandom(-25, 25)
        );

        const terrainPoint = cipherDestination(
            origin,
            cipherRandom(
                0.7,
                Math.min(2.3, travelLimit - 0.3)
            ),
            bearing + 160 + cipherRandom(-20, 20)
        );

        const allPoints = [
            correctPoint,
            farPoint,
            terrainPoint,
            tower
        ];

        if (!allPoints.every(cipherInsideTurkey)) {
            continue;
        }

        if (
            cipherKm(farPoint, tower) <=
            signalLimit + 0.3
        ) {
            continue;
        }

        if (
            cipherKm(
                terrainPoint,
                correctPoint
            ) < 0.8
        ) {
            continue;
        }

        const correctElevation = Math.round(
            cipherRandom(
                elevationMin + 30,
                elevationMax - 30
            )
        );

        const farElevation =
            elevationMax +
            Math.round(cipherRandom(100, 350));

        const terrainElevation =
            elevationMin -
            Math.round(cipherRandom(100, 350));

        const candidates = cipherShuffle([
            {
                point: correctPoint,
                elevation: correctElevation,
                correct: true
            },
            {
                point: farPoint,
                elevation: farElevation,
                correct: false
            },
            {
                point: terrainPoint,
                elevation: terrainElevation,
                correct: false
            }
        ]);

        candidates.forEach(
            (candidate, index) => {
                candidate.label =
                    ["A", "B", "C"][index];

                candidate.signalDistance = cipherKm(
                    candidate.point,
                    tower
                );

                candidate.travelDistance = cipherKm(
                    candidate.point,
                    origin
                );
            }
        );

        const scenario = {
            origin,
            tower,
            candidates,
            signalLimit,
            elevationMin,
            elevationMax,
            speed,
            time,
            travelLimit
        };

        const valid = candidates.filter(
            candidate =>
                cipherFinalPasses(
                    candidate,
                    "signal",
                    scenario
                ) &&
                cipherFinalPasses(
                    candidate,
                    "terrain",
                    scenario
                ) &&
                cipherFinalPasses(
                    candidate,
                    "timeline",
                    scenario
                )
        );

        if (
            valid.length === 1 &&
            valid[0].correct
        ) {
            return scenario;
        }
    }

    throw new Error(
        "Could not generate a unique final solution."
    );
}

function cipherFinalPasses(
    candidate,
    evidence,
    scenario = cipherGame.finalMission
) {
    if (!scenario) return false;

    const tolerance = 1e-8;

    if (evidence === "signal") {
        return (
            candidate.signalDistance <=
            scenario.signalLimit + tolerance
        );
    }

    if (evidence === "terrain") {
        return (
            candidate.elevation >=
                scenario.elevationMin &&
            candidate.elevation <=
                scenario.elevationMax
        );
    }

    if (evidence === "timeline") {
        return (
            candidate.travelDistance <=
            scenario.travelLimit + tolerance
        );
    }

    return false;
}

/* =========================================================
   MISSION 4 — INITIALIZATION
========================================================= */

function startCipherMission4() {
    if (
        cipherGame.timedOut ||
        cipherGame.stage !== 3 ||
        !cipherGame.finished
    ) return;

    const previous = cipherGame.overlayMission;

    const correct = previous.candidates.find(
        candidate => candidate.correct
    );

    let scenario;

    try {
        scenario = generateCipherFinalScenario(
            correct.point
        );
    } catch (error) {
        cipherFeedback(error.message);
        return;
    }

    cipherGame.stage = 4;
    cipherGame.finished = false;

    cipherGame.finalMission = {
        ...scenario,
        selectedEvidence: null,
        connections: new Set(),
        graphReady: false,
        completed: false,
        finished: false
    };

    cipherMissionInfo(
        4,
        "The Final Cipher",
        "Three possible hideouts remain. Analyze signal, terrain and timeline evidence.",
        "Connect every evidence node to all matching candidates."
    );

    cipherHTML("evidence-documents", `
        <div class="document-card">
            <h4>📡 SIGNAL EVIDENCE</h4>

            <p>
                Maximum tower distance:
                <strong>
                    ${scenario.signalLimit.toFixed(1)} km
                </strong>
            </p>
        </div>

        <div class="document-card">
            <h4>⛰️ TERRAIN EVIDENCE</h4>

            <p>
                Required elevation:
                <strong>
                    ${scenario.elevationMin}–${scenario.elevationMax} m
                </strong>
            </p>

            <p>
                Elevations are simulated case data.
            </p>
        </div>

        <div class="document-card">
            <h4>⏱️ TIMELINE EVIDENCE</h4>

            <p>
                Maximum speed:
                <strong>
                    ${scenario.speed.toFixed(1)} km/h
                </strong>
            </p>

            <p>
                Available time:
                <strong>
                    ${scenario.time.toFixed(1)} hours
                </strong>
            </p>

            <p>
                Maximum distance:
                <strong>
                    ${scenario.travelLimit.toFixed(2)} km
                </strong>
            </p>
        </div>
    `);

    const candidateRows =
        scenario.candidates.map(candidate => `
            <tr style="
                border-bottom:1px solid #34445f
            ">
                <td style="padding:12px;font-weight:bold">
                    ${candidate.label}
                </td>

                <td style="padding:12px">
                    ${candidate.signalDistance.toFixed(2)} km
                </td>

                <td style="padding:12px">
                    ${candidate.elevation} m
                </td>

                <td style="padding:12px">
                    ${candidate.travelDistance.toFixed(2)} km
                </td>
            </tr>
        `).join("");

    cipherHTML("mission-actions", `
        <div class="selection-info">
            INTERACTIVE EVIDENCE NETWORK
        </div>

        <div class="document-card">
            <h4>EVIDENCE CONDITIONS</h4>

            <p>
                📡 SIGNAL:
                Tower distance ≤
                ${scenario.signalLimit.toFixed(1)} km
            </p>

            <p>
                ⛰️ TERRAIN:
                Elevation
                ${scenario.elevationMin}–${scenario.elevationMax} m
            </p>

            <p>
                ⏱️ TIMELINE:
                Travel distance ≤
                ${scenario.travelLimit.toFixed(2)} km
            </p>
        </div>

        <div class="document-card">
            <h4>CANDIDATE DATA</h4>

            <div style="overflow-x:auto">
                <table style="
                    width:100%;
                    color:white;
                    border-collapse:collapse;
                    text-align:left;
                ">
                    <thead>
                        <tr style="
                            border-bottom:1px solid #64748b
                        ">
                            <th style="padding:12px">
                                Candidate
                            </th>

                            <th style="padding:12px">
                                Signal
                            </th>

                            <th style="padding:12px">
                                Terrain
                            </th>

                            <th style="padding:12px">
                                Timeline
                            </th>
                        </tr>
                    </thead>

                    <tbody>
                        ${candidateRows}
                    </tbody>
                </table>
            </div>
        </div>

        <div class="document-card">
            <h4>HOW TO PLAY</h4>

            <p>
                1. Compare the candidate data
                with the evidence conditions.
            </p>

            <p>
                2. Click SIGNAL, TERRAIN or TIMELINE.
            </p>

            <p>
                3. Connect the evidence to every
                candidate satisfying its condition.
            </p>

            <p>
                4. Click a connected candidate again
                to remove the connection.
            </p>

            <p>
                5. Press ANALYZE CONNECTIONS.
            </p>
        </div>

        <div
            id="cipher-final-network"
            style="
                width:100%;
                height:350px;
                background:#101c30;
                border:1px solid #34445f;
                border-radius:12px;
                overflow:hidden;
                margin-top:16px;
            "
        ></div>

        <div
            id="cipher-final-network-info"
            class="document-card"
            style="margin-top:12px"
        >
            Select SIGNAL, TERRAIN or TIMELINE.
        </div>

        <div id="cipher-final-progress"></div>

        <div id="cipher-final-decision"></div>
    `);

    cipherGame.layer.clearLayers();

    cipherMarker(
        scenario.tower,
        "T",
        "#f4c76a"
    ).bindPopup("COMMUNICATION TOWER");

    cipherMarker(
        scenario.origin,
        "S",
        "#5fc9d7"
    ).bindPopup("PREVIOUS MEETING POINT");

    scenario.candidates.forEach(candidate => {
        cipherMarker(
            candidate.point,
            candidate.label,
            "#e2e8f0"
        ).bindPopup(`
            <strong>
                CANDIDATE ${candidate.label}
            </strong>

            <br>
            Signal:
            ${candidate.signalDistance.toFixed(2)} km

            <br>
            Terrain:
            ${candidate.elevation} m

            <br>
            Timeline:
            ${candidate.travelDistance.toFixed(2)} km
        `);
    });

    cipherGame.map.fitBounds(
        [
            scenario.tower,
            scenario.origin,
            ...scenario.candidates.map(
                c => c.point
            )
        ],
        {
            padding: [40, 40],
            maxZoom: 11
        }
    );

    createCipherFinalNetwork();
}

/* =========================================================
   MISSION 4 — D3 EVIDENCE NETWORK
========================================================= */

function createCipherFinalNetwork() {
    const container = cipherEl(
        "cipher-final-network"
    );

    if (!container) return;

    if (typeof d3 === "undefined") {
        container.textContent =
            "D3.js could not be loaded.";
        return;
    }

    const mission = cipherGame.finalMission;

    const width = Math.max(
        container.clientWidth,
        300
    );

    const height = 350;

    container.innerHTML = "";

    const svg = d3.select(container)
        .append("svg")
        .attr("width", "100%")
        .attr("height", "100%")
        .attr(
            "viewBox",
            `0 0 ${width} ${height}`
        );

    const evidenceNodes = [
        {
            id: "signal",
            label: "SIGNAL",
            x: width * 0.2,
            y: 75
        },
        {
            id: "terrain",
            label: "TERRAIN",
            x: width * 0.5,
            y: 75
        },
        {
            id: "timeline",
            label: "TIMELINE",
            x: width * 0.8,
            y: 75
        }
    ];

    const candidateNodes =
        mission.candidates.map(
            (candidate, index) => ({
                id: candidate.label,
                label: candidate.label,
                x: width * (0.2 + index * 0.3),
                y: 265
            })
        );

    const lines = svg.append("g")
        .attr("class", "cipher-network-lines")
        .style("pointer-events", "none");

    function drawConnections() {
        const data = [...mission.connections].map(
            key => {
                const [evidence, candidate] =
                    key.split(":");

                return {
                    key,

                    source: evidenceNodes.find(
                        node => node.id === evidence
                    ),

                    target: candidateNodes.find(
                        node => node.id === candidate
                    )
                };
            }
        );

        lines.selectAll("line")
            .data(data, d => d.key)
            .join("line")
            .attr("x1", d => d.source.x)
            .attr("y1", d => d.source.y)
            .attr("x2", d => d.target.x)
            .attr("y2", d => d.target.y)
            .attr("stroke", "#59c987")
            .attr("stroke-width", 3)
            .attr("stroke-opacity", 0.9);
    }

    const evidenceGroup = svg.append("g")
        .selectAll("g")
        .data(evidenceNodes)
        .enter()
        .append("g")
        .attr(
            "transform",
            d => `translate(${d.x},${d.y})`
        )
        .style("cursor", "pointer");

    evidenceGroup.append("circle")
        .attr("r", 34)
        .attr("fill", "#233b59")
        .attr("stroke", "#ffffff")
        .attr("stroke-width", 2);

    evidenceGroup.append("text")
        .text(d => d.label)
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "middle")
        .attr("fill", "#ffffff")
        .attr("font-size", 10)
        .attr("font-weight", "bold")
        .style("pointer-events", "none");

    const candidateGroup = svg.append("g")
        .selectAll("g")
        .data(candidateNodes)
        .enter()
        .append("g")
        .attr(
            "transform",
            d => `translate(${d.x},${d.y})`
        )
        .style("cursor", "pointer");

    candidateGroup.append("circle")
        .attr("r", 30)
        .attr("fill", "#34445f")
        .attr("stroke", "#ffffff")
        .attr("stroke-width", 2);

    candidateGroup.append("text")
        .text(d => d.label)
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "middle")
        .attr("fill", "#ffffff")
        .attr("font-size", 17)
        .attr("font-weight", "bold")
        .style("pointer-events", "none");

    evidenceGroup.on(
        "click",
        (event, node) => {
            if (
                !cipherActive(4) ||
                mission.graphReady
            ) return;

            mission.selectedEvidence = node.id;

            evidenceGroup.select("circle")
                .attr(
                    "stroke",
                    d =>
                        d.id === node.id
                            ? "#f4c76a"
                            : "#ffffff"
                )
                .attr(
                    "stroke-width",
                    d =>
                        d.id === node.id
                            ? 4
                            : 2
                );

            const messages = {
                signal:
                    `SIGNAL selected — Connect every candidate within ${mission.signalLimit.toFixed(1)} km of the tower.`,

                terrain:
                    `TERRAIN selected — Connect every candidate with elevation between ${mission.elevationMin} and ${mission.elevationMax} m.`,

                timeline:
                    `TIMELINE selected — Connect every candidate within ${mission.travelLimit.toFixed(2)} km of the previous location.`
            };

            cipherSet(
                "cipher-final-network-info",
                messages[node.id]
            );
        }
    );

    candidateGroup.on(
        "click",
        (event, node) => {
            if (
                !cipherActive(4) ||
                mission.graphReady
            ) return;

            if (!mission.selectedEvidence) {
                cipherSet(
                    "cipher-final-network-info",
                    "Select an evidence node first."
                );
                return;
            }

            const key =
                `${mission.selectedEvidence}:${node.id}`;

            if (mission.connections.has(key)) {
                mission.connections.delete(key);
            } else {
                mission.connections.add(key);
            }

            drawConnections();
            updateCipherFinalProgress();

            cipherSet(
                "cipher-final-network-info",
                `${mission.selectedEvidence.toUpperCase()} → ` +
                `Candidate ${node.id}. ` +
                `${mission.connections.size} connection(s) created.`
            );
        }
    );

    updateCipherFinalProgress();
}

/* =========================================================
   MISSION 4 — CONNECTION PROGRESS
========================================================= */

function updateCipherFinalProgress() {
    const mission = cipherGame.finalMission;

    if (!mission || mission.graphReady) return;

    cipherHTML("cipher-final-progress", `
        <div class="document-card">
            <p>
                CONNECTIONS CREATED:
                <strong>
                    ${mission.connections.size}
                </strong>
            </p>

            <button
                class="primary-btn"
                id="cipher-analyze-connections"
                type="button"
                style="width:100%"
            >
                ANALYZE CONNECTIONS
            </button>
        </div>
    `);

    cipherEl("cipher-analyze-connections")
        .addEventListener(
            "click",
            analyzeCipherFinalConnections
        );
}

/* =========================================================
   MISSION 4 — ANALYZE CONNECTIONS
========================================================= */

function analyzeCipherFinalConnections() {
    if (!cipherActive(4)) return;

    const mission = cipherGame.finalMission;

    const evidenceTypes = [
        "signal",
        "terrain",
        "timeline"
    ];

    const expected = new Set();

    evidenceTypes.forEach(type => {
        mission.candidates.forEach(candidate => {
            if (
                cipherFinalPasses(
                    candidate,
                    type,
                    mission
                )
            ) {
                expected.add(
                    `${type}:${candidate.label}`
                );
            }
        });
    });

    const correct =
        mission.connections.size === expected.size &&
        [...expected].every(
            key => mission.connections.has(key)
        );

    if (!correct) {
        cipherFeedback(
            "Some connections are missing or incorrect. Review the candidate data."
        );

        cipherSet(
            "cipher-final-network-info",
            "Check every evidence condition and correct the connections."
        );

        return;
    }

    mission.graphReady = true;

    cipherFeedback(
        "Evidence network verified! Identify the final hideout."
    );

    cipherHTML("cipher-final-progress", `
        <div class="selection-info">
            ✓ EVIDENCE NETWORK VERIFIED
        </div>
    `);

    cipherHTML("cipher-final-decision", `
        <div class="document-card">
            <h4>FINAL DECISION</h4>

            <p>
                Which candidate satisfies
                all three evidence conditions?
            </p>

            <div id="cipher-final-options"></div>
        </div>
    `);

    const options = cipherEl(
        "cipher-final-options"
    );

    mission.candidates.forEach(candidate => {
        const button = document.createElement(
            "button"
        );

        button.className = "primary-btn";
        button.type = "button";

        button.textContent =
            `CANDIDATE ${candidate.label}`;

        button.style.margin = "5px";

        button.addEventListener(
            "click",
            () => {
                verifyCipherFinalLocation(
                    candidate.label
                );
            }
        );

        options.appendChild(button);
    });
}

/* =========================================================
   MISSION 4 — FINAL DECISION
========================================================= */

function verifyCipherFinalLocation(label) {
    if (!cipherActive(4)) return;

    const mission = cipherGame.finalMission;

    if (!mission.graphReady) return;

    const candidate = mission.candidates.find(
        item => item.label === label
    );

    if (!candidate) return;

    if (!candidate.correct) {
        cipherFeedback(
            "Incorrect final location. Review all three clues."
        );
        return;
    }

    mission.finished = true;
    mission.completed = true;

    cipherComplete(
        4,
        "Excellent detective work! The final cipher has been solved.",
        null
    );

    cipherSet(
        "stage-number",
        "CASE COMPLETED"
    );

    cipherSet(
        "mission-title",
        "CASE SOLVED"
    );

    cipherSet(
        "mission-description",
        "You identified the researcher's final location."
    );

    cipherSet(
        "mission-objective",
        "All four missions completed."
    );

    cipherHTML("mission-actions", `
        <div class="selection-info">
            🏆 THE COORDINATE CIPHER — SOLVED
        </div>

        <p>✓ Coordinate Conversion</p>
        <p>✓ Distance Analysis</p>
        <p>✓ Spatial Overlay</p>
        <p>✓ Evidence Network Analysis</p>

        <p>
            Final location:
            <strong>
                Candidate ${candidate.label}
            </strong>
        </p>

        <p>
            Remaining time:
            <strong>
                ${String(
                    Math.floor(cipherTimeLeft / 60)
                ).padStart(2, "0")}:
                ${String(
                    cipherTimeLeft % 60
                ).padStart(2, "0")}
            </strong>
        </p>
    `);

    cipherGame.layer.clearLayers();

    cipherMarker(
        candidate.point,
        "✓",
        "#59c987"
    )
    .bindPopup("FINAL LOCATION DISCOVERED")
    .openPopup();

    cipherGame.map.flyTo(
        candidate.point,
        12
    );
}

/* =========================================================
   STOP INVESTIGATION
========================================================= */

function stopCipherInvestigation() {
    cipherSession++;

    stopCipherTimer();

    cipherGame.finished = true;
    cipherGame.timedOut = true;
    cipherGame.stage = 0;

    if (cipherGame.distanceMission?.chart) {
        cipherGame.distanceMission.chart.destroy();
        cipherGame.distanceMission.chart = null;
    }

    if (cipherGame.map) {
        cipherGame.map.remove();
        cipherGame.map = null;
    }

    cipherGame.layer = null;
    cipherGame.distanceMission = null;
    cipherGame.overlayMission = null;
    cipherGame.finalMission = null;
}

/* =========================================================
   END OF THE COORDINATE CIPHER
========================================================= */
