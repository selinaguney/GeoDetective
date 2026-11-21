
/* =========================================
   GEODETECTIVE — THE COORDINATE CIPHER
   CHAPTER 3
========================================= */

window.turkeyBoundary = null;

async function loadTurkeyBoundary() {
    if (window.turkeyBoundary) return;

    const response = await fetch("data/turkey-boundary.geojson");

    if (!response.ok) {
        throw new Error("Turkey GeoJSON could not be loaded.");
    }

    const geojson = await response.json();

    if (geojson.type === "FeatureCollection") {
        window.turkeyBoundary = turf.combine(geojson).features[0];
    } else if (geojson.type === "Feature") {
        window.turkeyBoundary = geojson;
    } else {
        window.turkeyBoundary = turf.feature(geojson);
    }
}


/* =========================================
   GAME STATE
========================================= */

const cipherGame = {
    stage: 0,
    scenario: null,
    map: null,
    layer: null,
    selectedLocation: null,
    distanceMission: null,
    finished: true
};


/* =========================================
   RANDOM LOCATION GENERATION
========================================= */

const CipherCase = (() => {

    function toDMS(decimal, positive, negative) {
        const direction = decimal >= 0 ? positive : negative;
        const value = Math.abs(decimal);

        const degrees = Math.floor(value);
        const minutes = Math.floor((value - degrees) * 60);
        const seconds = ((value - degrees) * 60 - minutes) * 60;

        return `${degrees}° ${minutes}' ${seconds.toFixed(1)}" ${direction}`;
    }

    function isInsideTurkey(lat, lon) {
        return turf.booleanPointInPolygon(
            turf.point([lon, lat]),
            window.turkeyBoundary
        );
    }

    function generateScenario() {
        if (!window.turkeyBoundary) {
            throw new Error("Turkey boundary data is not loaded.");
        }

        const bounds = {
            minLat: 35.8,
            maxLat: 42.2,
            minLon: 25.6,
            maxLon: 44.9
        };

        for (let attempt = 0; attempt < 10000; attempt++) {
            const lat = bounds.minLat +
                Math.random() * (bounds.maxLat - bounds.minLat);

            const lon = bounds.minLon +
                Math.random() * (bounds.maxLon - bounds.minLon);

            if (isInsideTurkey(lat, lon)) {
                return {
                    correct: {
                        name: "Hidden Location",
                        point: [lat, lon]
                    },
                    latitudeDMS: toDMS(lat, "N", "S"),
                    longitudeDMS: toDMS(lon, "E", "W")
                };
            }
        }

        throw new Error("Could not generate a location in Türkiye.");
    }

    return { generateScenario, isInsideTurkey };

})();


/* =========================================
   COMMON UI HELPERS
========================================= */

function updateCipherTimeline(activeStage) {
    const labels = [
        "Coordinates",
        "Distance",
        "Overlay",
        "Final Cipher"
    ];

    document.getElementById("timeline").innerHTML =
        labels.map((label, index) => {
            const number = String(index + 1).padStart(2, "0");
            const stage = index + 1;

            let className = "timeline-step";
            let symbol = "";

            if (stage < activeStage) {
                className += " completed";
                symbol = " ✓";
            } else if (stage === activeStage) {
                className += " active";
            }

            return `
                <div class="${className}">
                    ${number} — ${label}${symbol}
                </div>
            `;
        }).join("");
}

function updateCipherEvidence(completed) {
    const labels = [
        "Coordinate clue",
        "Distance analysis",
        "Spatial overlay",
        "Final location"
    ];

    document.getElementById("evidence-list").innerHTML =
        labels.map((label, index) => `
            <div class="evidence-item">
                ${index < completed ? "✅" : "🔒"} ${label}
            </div>
        `).join("");
}

function makeCipherNumberIcon(number, color) {
    return L.divIcon({
        className: "",
        html: `
            <div style="
                width:30px;
                height:30px;
                border-radius:50%;
                background:${color};
                border:2px solid #ffffff;
                color:#142338;
                font-size:15px;
                font-weight:800;
                display:flex;
                align-items:center;
                justify-content:center;
                box-shadow:0 3px 10px rgba(0,0,0,.4);
            ">${number}</div>
        `,
        iconSize: [34, 34],
        iconAnchor: [17, 17]
    });
}


/* =========================================
   START CHAPTER 3
========================================= */

async function startCipherInvestigation() {
    await loadTurkeyBoundary();

    cipherGame.scenario = CipherCase.generateScenario();
    cipherGame.stage = 1;
    cipherGame.selectedLocation = null;
    cipherGame.distanceMission = null;
    cipherGame.finished = false;

    document.getElementById("case-title").textContent =
        "The Coordinate Cipher";

    document.getElementById("case-district").textContent =
        "TÜRKIYE";

    document.getElementById("stage-number").textContent =
        "MISSION 01 / 04";

    document.getElementById("mission-title").textContent =
        "The Hidden Coordinates";

    document.getElementById("mission-description").textContent =
        "A missing researcher left a secret location somewhere in Türkiye. Decode the coordinates to discover the first clue.";

    document.getElementById("mission-objective").textContent =
        "Convert the coordinates from DMS to decimal degrees. Enter both latitude and longitude to reveal the hidden location.";

    document.getElementById("timer").textContent = "10:00";
    document.getElementById("progress-text").textContent = "0 / 4";
    document.getElementById("progress-fill").style.width = "0%";
    document.getElementById("feedback").textContent = "";

    updateCipherTimeline(1);
    updateCipherEvidence(0);

    const s = cipherGame.scenario;

    document.getElementById("evidence-documents").innerHTML = `
        <div class="document-card">
            <h4>RECOVERED NOTE</h4>
            <p>The researcher left these coordinates:</p>
            <p><strong>Latitude:</strong> ${s.latitudeDMS}</p>
            <p><strong>Longitude:</strong> ${s.longitudeDMS}</p>
        </div>

        <div class="document-card">
            <h4>COORDINATE CONVERSION</h4>
            <p>
                Decimal Degrees =
                Degrees + Minutes / 60 + Seconds / 3600
            </p>
            <p>North and East are positive.</p>
            <p>Small rounding errors are accepted.</p>
        </div>
    `;

    document.getElementById("mission-actions").innerHTML = `
        <div class="cipher-coordinate-form">

            <div class="cipher-input-group">
                <label for="cipher-lat">LATITUDE</label>
                <input
                    id="cipher-lat"
                    type="text"
                    inputmode="decimal"
                    placeholder="e.g. 39.9208"
                    autocomplete="off"
                >
            </div>

            <div class="cipher-input-group">
                <label for="cipher-lon">LONGITUDE</label>
                <input
                    id="cipher-lon"
                    type="text"
                    inputmode="decimal"
                    placeholder="e.g. 32.8541"
                    autocomplete="off"
                >
            </div>

            <button
                class="primary-btn cipher-verify-btn"
                id="cipher-verify"
                type="button"
            >
                VERIFY COORDINATES
            </button>

        </div>
    `;

    document.getElementById("cipher-verify")
        .addEventListener("click", verifyCipherCoordinates);

    initializeCipherMap();
}


/* =========================================
   MAP
========================================= */

function initializeCipherMap() {
    if (cipherGame.map) {
        cipherGame.map.remove();
        cipherGame.map = null;
    }

    if (
        typeof detectiveMap !== "undefined" &&
        detectiveMap
    ) {
        detectiveMap.remove();
        detectiveMap = null;
    }

    if (
        typeof museumGame !== "undefined" &&
        museumGame.map
    ) {
        museumGame.map.remove();
        museumGame.map = null;
    }

    cipherGame.map = L.map("map", {
        maxBounds: [
            [35.0, 25.0],
            [43.0, 46.0]
        ],
        maxBoundsViscosity: 1.0,
        minZoom: 5,
        maxZoom: 19
    }).setView([39.0, 35.0], 6);

    L.tileLayer(
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        {
            attribution: "&copy; OpenStreetMap contributors",
            maxZoom: 19,
            noWrap: true
        }
    ).addTo(cipherGame.map);

    cipherGame.layer = L.layerGroup().addTo(cipherGame.map);

    setTimeout(() => {
        if (cipherGame.map) {
            cipherGame.map.invalidateSize();
        }
    }, 150);
}


/* =========================================
   DISTANCE CALCULATION
========================================= */

function cipherDistance(lat1, lon1, lat2, lon2) {
    const R = 6371000;
    const rad = Math.PI / 180;

    const dLat = (lat2 - lat1) * rad;
    const dLon = (lon2 - lon1) * rad;

    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(lat1 * rad) *
        Math.cos(lat2 * rad) *
        Math.sin(dLon / 2) ** 2;

    return 2 * R * Math.atan2(
        Math.sqrt(a),
        Math.sqrt(Math.max(0, 1 - a))
    );
}


/* =========================================
   MISSION 1 — VERIFY COORDINATES
========================================= */

function verifyCipherCoordinates() {
    if (cipherGame.finished || cipherGame.stage !== 1) return;

    const latText = document.getElementById("cipher-lat")
        .value.trim().replace(",", ".");

    const lonText = document.getElementById("cipher-lon")
        .value.trim().replace(",", ".");

    const lat = Number(latText);
    const lon = Number(lonText);

    const feedback = document.getElementById("feedback");

    if (
        latText === "" ||
        lonText === "" ||
        !Number.isFinite(lat) ||
        !Number.isFinite(lon) ||
        lat < -90 || lat > 90 ||
        lon < -180 || lon > 180
    ) {
        feedback.textContent =
            "Please enter valid latitude and longitude values.";
        return;
    }

    const target = cipherGame.scenario.correct.point;

    const distance = cipherDistance(
        lat, lon,
        target[0], target[1]
    );

    if (distance > 150) {
        feedback.textContent =
            "Coordinates do not match. Check your conversion and try again.";
        return;
    }

    cipherGame.finished = true;

    feedback.textContent =
        "Coordinates accepted! Secret location identified.";

    cipherGame.layer.clearLayers();

    L.marker(target)
        .addTo(cipherGame.layer)
        .bindPopup("<strong>HIDDEN LOCATION DISCOVERED</strong>")
        .openPopup();

    cipherGame.map.flyTo(target, 12, {
        duration: 2
    });

    document.getElementById("progress-text").textContent = "1 / 4";
    document.getElementById("progress-fill").style.width = "25%";

    updateCipherTimeline(2);
    updateCipherEvidence(1);

    document.getElementById("mission-actions").innerHTML = `
        <div class="selection-info">
            ✓ MISSION 1 COMPLETED
        </div>

        <p>
            The hidden coordinates have been decoded.
            New distance evidence is now available.
        </p>

        <button
            class="primary-btn"
            id="cipher-next-mission"
            type="button"
        >
            CONTINUE TO MISSION 2
        </button>
    `;

    document.getElementById("cipher-next-mission")
        .addEventListener("click", startCipherMission2);
}


/* =========================================
   MISSION 2 — SCENARIO GENERATION
========================================= */

function generateCipherDistanceScenario() {
    const start = cipherGame.scenario.correct.point;

    // Keep all generated locations inside Türkiye.
    for (let attempt = 0; attempt < 100; attempt++) {
        const targetFeature = turf.destination(
            turf.point([start[1], start[0]]),
            8 + Math.random() * 12,
            Math.random() * 360,
            { units: "kilometers" }
        );

        const target = [
            targetFeature.geometry.coordinates[1],
            targetFeature.geometry.coordinates[0]
        ];

        if (!CipherCase.isInsideTurkey(...target)) continue;

        const bearings = [20, 140, 260];
        const colors = ["#f4c76a", "#5fc9d7", "#c79af7"];
        const references = [];

        let valid = true;

        for (let i = 0; i < 3; i++) {
            const radius = 5 + Math.random() * 6;

            const feature = turf.destination(
                turf.point([target[1], target[0]]),
                radius,
                bearings[i] + Math.random() * 20 - 10,
                { units: "kilometers" }
            );

            const point = [
                feature.geometry.coordinates[1],
                feature.geometry.coordinates[0]
            ];

            if (!CipherCase.isInsideTurkey(...point)) {
                valid = false;
                break;
            }

            references.push({
                name: `REFERENCE ${i + 1}`,
                point,
                color: colors[i],
                distance: cipherDistance(
                    point[0], point[1],
                    target[0], target[1]
                ) / 1000
            });
        }

        if (!valid) continue;

        const candidates = [{
            point: target,
            correct: true
        }];

        for (const bearing of [70, 210]) {
            const feature = turf.destination(
                turf.point([target[1], target[0]]),
                3 + Math.random() * 3,
                bearing,
                { units: "kilometers" }
            );

            const point = [
                feature.geometry.coordinates[1],
                feature.geometry.coordinates[0]
            ];

            if (!CipherCase.isInsideTurkey(...point)) {
                valid = false;
                break;
            }

            candidates.push({
                point,
                correct: false
            });
        }

        if (!valid) continue;

        // Shuffle the three candidates.
        for (let i = candidates.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [candidates[i], candidates[j]] =
                [candidates[j], candidates[i]];
        }

        candidates.forEach((candidate, index) => {
            candidate.label = ["A", "B", "C"][index];
        });

        return {
            target,
            references,
            candidates,
            revealed: 0,
            selectedIndex: null,
            chart: null,
            candidateMarkers: []
        };
    }

    throw new Error(
        "Could not generate a valid distance scenario in Türkiye."
    );
}


/* =========================================
   MISSION 2 — START
========================================= */

function startCipherMission2() {
    cipherGame.stage = 2;
    cipherGame.finished = false;

    cipherGame.distanceMission =
        generateCipherDistanceScenario();

    document.getElementById("stage-number").textContent =
        "MISSION 02 / 04";

    document.getElementById("mission-title").textContent =
        "The Distance Cipher";

    document.getElementById("mission-description").textContent =
        "Three distance clues reveal the researcher's next destination. Analyze their intersection to find it.";

    document.getElementById("mission-objective").textContent =
        "Reveal the three clues one by one. Compare the distance circles and select the candidate that matches all three measurements.";

    document.getElementById("feedback").textContent = "";

    updateCipherTimeline(2);
    updateCipherEvidence(1);

    document.getElementById("evidence-documents").innerHTML = `
        <div class="document-card">
            <h4>THE DISTANCE CIPHER</h4>
            <p>
                Three reference points surround a hidden destination.
                Reveal each clue to investigate the possible location.
            </p>
        </div>

        <div class="document-card">
            <h4>SPATIAL ANALYSIS</h4>
            <p>
                Each dashed circle shows locations at a fixed
                distance from its reference point.
            </p>
            <p>
                The correct candidate should match all
                three distance measurements.
            </p>
        </div>
    `;

    document.getElementById("mission-actions").innerHTML = `
        <div class="selection-info">
            THREE DISTANCE CLUES RECOVERED
        </div>

        <div id="cipher-distance-clues">
            <button
                class="primary-btn"
                id="cipher-reveal-clue"
                type="button"
            >
                REVEAL CLUE 1
            </button>
        </div>

        <div
            id="cipher-distance-chart"
            style="margin-top:20px;display:none;"
        >
            <canvas id="cipher-chart-canvas"></canvas>
        </div>

        <div
            id="cipher-candidate-actions"
            style="margin-top:16px;"
        ></div>
    `;

    document.getElementById("cipher-reveal-clue")
        .addEventListener("click", revealCipherDistanceClue);

    cipherGame.layer.clearLayers();

    const start = cipherGame.scenario.correct.point;

    L.marker(start)
        .addTo(cipherGame.layer)
        .bindPopup("MISSION 1 — DISCOVERED LOCATION");

    // Show the search area without centering on the secret target.
    cipherGame.map.setView(start, 9);
}


/* =========================================
   MISSION 2 — REVEAL CLUES
========================================= */

function revealCipherDistanceClue() {
    const mission = cipherGame.distanceMission;

    if (
        !mission ||
        cipherGame.stage !== 2 ||
        mission.revealed >= 3
    ) return;

    const index = mission.revealed;
    const reference = mission.references[index];

    L.marker(reference.point, {
        icon: makeCipherNumberIcon(index + 1, reference.color)
    })
        .addTo(cipherGame.layer)
        .bindPopup(
            `${reference.name}<br>Distance: ${reference.distance.toFixed(2)} km`
        );

    L.circle(reference.point, {
        radius: reference.distance * 1000,
        color: reference.color,
        weight: 3,
        fillOpacity: 0.02,
        dashArray: "8,6"
    }).addTo(cipherGame.layer);

    mission.revealed++;

    const container =
        document.getElementById("cipher-distance-clues");

    const clue = document.createElement("div");
    clue.className = "document-card";

    clue.innerHTML = `
        <h4>CLUE ${mission.revealed} DISCOVERED</h4>
        <p>
            ${reference.name} —
            ${reference.distance.toFixed(2)} km
        </p>
    `;

    container.insertBefore(
        clue,
        document.getElementById("cipher-reveal-clue")
    );

    const button = document.getElementById("cipher-reveal-clue");

    if (mission.revealed < 3) {
        button.textContent =
            `REVEAL CLUE ${mission.revealed + 1}`;
    } else {
        button.remove();

        showCipherDistanceChart();
        showCipherCandidates();

        document.getElementById("feedback").textContent =
            "All clues revealed. Select a candidate to compare its distances.";
    }
}


/* =========================================
   MISSION 2 — CHART.JS
========================================= */

function showCipherDistanceChart() {
    const mission = cipherGame.distanceMission;

    const container =
        document.getElementById("cipher-distance-chart");

    container.style.display = "block";

    if (typeof Chart === "undefined") {
        container.innerHTML =
            "<p>Distance chart could not be loaded.</p>";
        return;
    }

    const canvas =
        document.getElementById("cipher-chart-canvas");

    if (mission.chart) {
        mission.chart.destroy();
    }

    mission.chart = new Chart(canvas, {
        type: "bar",

        data: {
            labels: mission.references.map(ref => ref.name),

            datasets: [{
                label: "Clue distance (km)",

                data: mission.references.map(ref =>
                    Number(ref.distance.toFixed(2))
                ),

                backgroundColor: mission.references.map(
                    ref => ref.color
                ),

                borderRadius: 6
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
                    },

                    title: {
                        display: true,
                        text: "Distance (km)",
                        color: "#ffffff"
                    }
                }
            }
        }
    });
}


/* =========================================
   MISSION 2 — CANDIDATES
========================================= */

function showCipherCandidates() {
    const mission = cipherGame.distanceMission;

    const container =
        document.getElementById("cipher-candidate-actions");

    container.innerHTML = `
        <div class="selection-info">
            SELECT A CANDIDATE
        </div>

        <p>
            Choose A, B or C on the map to inspect
            its distances from the three reference points.
        </p>

        <div id="cipher-candidate-comparison"></div>
    `;

    mission.candidateMarkers = [];

    mission.candidates.forEach((candidate, index) => {
        const marker = L.marker(candidate.point, {
            icon: makeCipherNumberIcon(
                candidate.label,
                "#ffffff"
            )
        }).addTo(cipherGame.layer);

        marker.bindPopup(`CANDIDATE ${candidate.label}`);

        marker.on("click", () => {
            selectCipherCandidate(index);
        });

        mission.candidateMarkers.push(marker);
    });

    // Fit all visible evidence, not the hidden target alone.
    const points = [
        cipherGame.scenario.correct.point,
        ...mission.references.map(ref => ref.point),
        ...mission.candidates.map(candidate => candidate.point)
    ];

    cipherGame.map.fitBounds(points, {
        padding: [45, 45],
        maxZoom: 11
    });
}


/* =========================================
   MISSION 2 — COMPARE DISTANCES
========================================= */

function selectCipherCandidate(index) {
    const mission = cipherGame.distanceMission;

    if (
        !mission ||
        cipherGame.finished ||
        mission.revealed !== 3
    ) return;

    mission.selectedIndex = index;

    const candidate = mission.candidates[index];

    const rows = mission.references.map((ref, i) => {
        const actualDistance = cipherDistance(
            candidate.point[0],
            candidate.point[1],
            ref.point[0],
            ref.point[1]
        ) / 1000;

        const difference = Math.abs(
            actualDistance - ref.distance
        );

        return `
            <tr>
                <td>${i + 1}</td>
                <td>${ref.distance.toFixed(2)} km</td>
                <td>${actualDistance.toFixed(2)} km</td>
                <td>${difference.toFixed(2)} km</td>
            </tr>
        `;
    }).join("");

    document.getElementById(
        "cipher-candidate-comparison"
    ).innerHTML = `
        <div class="document-card">
            <h4>CANDIDATE ${candidate.label} — DISTANCE ANALYSIS</h4>

            <div style="overflow-x:auto;">
                <table style="
                    width:100%;
                    border-collapse:collapse;
                    color:#ffffff;
                    font-size:12px;
                    text-align:left;
                ">
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

            <p>
                Does this candidate match all three clues?
            </p>

            <button
                class="primary-btn"
                id="cipher-confirm-candidate"
                type="button"
            >
                CONFIRM CANDIDATE ${candidate.label}
            </button>
        </div>
    `;

    document.getElementById("cipher-confirm-candidate")
        .addEventListener(
            "click",
            verifyCipherDistanceCandidate
        );

    document.getElementById("feedback").textContent =
        `Candidate ${candidate.label} selected. Compare the distance differences before confirming.`;
}


/* =========================================
   MISSION 2 — VERIFY ANSWER
========================================= */

function verifyCipherDistanceCandidate() {
    const mission = cipherGame.distanceMission;

    if (
        !mission ||
        cipherGame.finished ||
        mission.selectedIndex === null
    ) return;

    const candidate =
        mission.candidates[mission.selectedIndex];

    if (!candidate.correct) {
        document.getElementById("feedback").textContent =
            "Incorrect destination. This candidate does not match all three distance clues.";
        return;
    }

    cipherGame.finished = true;

    document.getElementById("feedback").textContent =
        "Correct! All three distance measurements match.";

    document.getElementById("progress-text").textContent =
        "2 / 4";

    document.getElementById("progress-fill").style.width =
        "50%";

    updateCipherTimeline(3);
    updateCipherEvidence(2);

    if (mission.chart) {
        mission.chart.destroy();
        mission.chart = null;
    }

    document.getElementById("mission-actions").innerHTML = `    
    <div class="selection-info">
        ✓ MISSION 2 COMPLETED
    </div>
    
    <p>
        You identified the hidden destination
        using spatial distance analysis.
    </p>

    <button
        class="primary-btn"
        id="cipher-next-mission"
        type="button"
    >
        CONTINUE TO MISSION 3
    </button>
`;

document.getElementById("cipher-next-mission")
    .addEventListener("click", startCipherMission3);


document.getElementById("cipher-next-mission")
    .addEventListener("click", startCipherMission3);

}

/* =========================================
   MISSION 3 — THE OVERLAY PUZZLE
========================================= */

function startCipherMission3() {

    cipherGame.stage = 3;
    cipherGame.finished = false;

    const previous = cipherGame.distanceMission;

    if (!previous) return;

    if (previous.chart) {
        previous.chart.destroy();
        previous.chart = null;
    }

    const center = previous.target;

    const centerPoint = turf.point([
        center[1],
        center[0]
    ]);

    // Fictional GIS layers generated around
    // the destination discovered in Mission 2.

    const searchArea = turf.buffer(
        centerPoint,
        5,
        { units: "kilometers" }
    );

    const forestCenter = turf.destination(
        centerPoint,
        2,
        70,
        { units: "kilometers" }
    );

    const forestArea = turf.buffer(
        forestCenter,
        3.5,
        { units: "kilometers" }
    );

    const restrictedCenter = turf.destination(
        centerPoint,
        2,
        250,
        { units: "kilometers" }
    );

    const restrictedArea = turf.buffer(
        restrictedCenter,
        2.5,
        { units: "kilometers" }
    );

    const inside = (point, polygon) =>
        turf.booleanPointInPolygon(
            turf.point([point[1], point[0]]),
            polygon
        );

    // Generate one correct and two incorrect
    // candidates based on actual spatial tests.

    const candidates = [];

    const categories = [
        "correct",
        "outsideForest",
        "restricted"
    ];

    for (const category of categories) {

        let found = false;

        for (let attempt = 0; attempt < 1000; attempt++) {

            const distance = Math.random() * 4.5;
            const bearing = Math.random() * 360;

            const feature = turf.destination(
                centerPoint,
                distance,
                bearing,
                { units: "kilometers" }
            );

            const point = [
                feature.geometry.coordinates[1],
                feature.geometry.coordinates[0]
            ];

            if (!CipherCase.isInsideTurkey(...point)) {
                continue;
            }

            const inSearch = inside(point, searchArea);
            const inForest = inside(point, forestArea);
            const inRestricted = inside(point, restrictedArea);

            let matches = false;

            if (category === "correct") {
                matches =
                    inSearch &&
                    inForest &&
                    !inRestricted;
            }

            if (category === "outsideForest") {
                matches =
                    inSearch &&
                    !inForest &&
                    !inRestricted;
            }

            if (category === "restricted") {
                matches =
                    inSearch &&
                    inRestricted;
            }

            const farEnough = candidates.every(existing =>
                cipherDistance(
                    point[0],
                    point[1],
                    existing.point[0],
                    existing.point[1]
                ) > 700
            );

            if (matches && farEnough) {

                candidates.push({
                    point,
                    correct: category === "correct"
                });

                found = true;
                break;
            }
        }

        if (!found) {
            document.getElementById("feedback").textContent =
                "Could not generate the overlay puzzle. Please restart the chapter.";
            return;
        }
    }

    // Randomize candidate order.
    for (let i = candidates.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));

        [candidates[i], candidates[j]] =
            [candidates[j], candidates[i]];
    }

    candidates.forEach((candidate, index) => {
        candidate.label = ["A", "B", "C"][index];
    });

    cipherGame.overlayMission = {
        searchArea,
        forestArea,
        restrictedArea,
        candidates,
        revealed: 0,
        selectedIndex: null,
        layers: {},
        markers: []
    };

    document.getElementById("stage-number").textContent =
        "MISSION 03 / 04";

    document.getElementById("mission-title").textContent =
        "The Overlay Puzzle";

    document.getElementById("mission-description").textContent =
        "The researcher left a spatial clue. Three map layers must be analyzed to identify the safe meeting location.";

    document.getElementById("mission-objective").textContent =
        "Find the candidate inside the Search Area and Forest Area, but outside the Restricted Zone.";

    document.getElementById("feedback").textContent = "";

    updateCipherTimeline(3);
    updateCipherEvidence(2);

    document.getElementById("evidence-documents").innerHTML = `
        <div class="document-card">
            <h4>SPATIAL EVIDENCE</h4>
            <p>
                The meeting location must satisfy
                three spatial conditions.
            </p>
            <p>
                It must be inside the search area,
                inside the forest and outside
                the restricted zone.
            </p>
        </div>

        <div class="document-card">
            <h4>OVERLAY RULE</h4>
            <p>
                Search Area ∩ Forest Area
                − Restricted Zone
            </p>
            <p>
                Reveal the layers and compare
                the candidate locations.
            </p>
        </div>
    `;

    document.getElementById("mission-actions").innerHTML = `
        <div class="selection-info">
            SPATIAL LAYERS AVAILABLE
        </div>

        <p>
            Reveal each layer to investigate
            the possible meeting locations.
        </p>

        <div id="cipher-overlay-controls">
            <button
                class="primary-btn"
                id="cipher-reveal-overlay"
                type="button"
            >
                REVEAL SEARCH AREA
            </button>
        </div>

        <div
            id="cipher-overlay-selection"
            style="margin-top:16px;"
        ></div>
    `;

    cipherGame.layer.clearLayers();

    cipherGame.map.setView(center, 11);

    document.getElementById("cipher-reveal-overlay")
        .addEventListener(
            "click",
            revealCipherOverlayLayer
        );
}


/* =========================================
   MISSION 3 — REVEAL LAYERS
========================================= */

function revealCipherOverlayLayer() {

    const mission = cipherGame.overlayMission;

    if (!mission || mission.revealed >= 3) return;

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

    const definition = definitions[mission.revealed];

    const layer = L.geoJSON(definition.polygon, {
        style: {
            color: definition.color,
            weight: 3,
            fillColor: definition.color,
            fillOpacity: 0.16
        }
    }).addTo(cipherGame.layer);

    mission.layers[definition.key] = layer;
    mission.revealed++;

    const controls =
        document.getElementById("cipher-overlay-controls");

    const item = document.createElement("div");

    item.className = "document-card";

    item.innerHTML = `
        <label style="
            display:flex;
            align-items:center;
            gap:10px;
            cursor:pointer;
        ">
            <input
                type="checkbox"
                id="cipher-layer-${definition.key}"
                checked
            >
            <span style="color:${definition.color};">
                ●
            </span>
            ${definition.name}
        </label>
    `;

    controls.insertBefore(
        item,
        document.getElementById("cipher-reveal-overlay")
    );

    document.getElementById(
        `cipher-layer-${definition.key}`
    ).addEventListener("change", event => {

        if (event.target.checked) {
            cipherGame.layer.addLayer(layer);
        } else {
            cipherGame.layer.removeLayer(layer);
        }
    });

    const button =
        document.getElementById("cipher-reveal-overlay");

    const nextLabels = [
        "REVEAL FOREST AREA",
        "REVEAL RESTRICTED ZONE"
    ];

    if (mission.revealed < 3) {

        button.textContent =
            nextLabels[mission.revealed - 1];

    } else {

        button.remove();
        showCipherOverlayCandidates();

        document.getElementById("feedback").textContent =
            "All layers revealed. Select the candidate that satisfies the overlay rule.";
    }
}


/* =========================================
   MISSION 3 — CANDIDATE SELECTION
========================================= */

function showCipherOverlayCandidates() {

    const mission = cipherGame.overlayMission;

    const container =
        document.getElementById("cipher-overlay-selection");

    container.innerHTML = `
        <div class="selection-info">
            SELECT THE SAFE LOCATION
        </div>

        <p>
            Select A, B or C on the map.
            Check all three spatial conditions.
        </p>

        <div id="cipher-overlay-comparison"></div>
    `;

    mission.candidates.forEach((candidate, index) => {

        const marker = L.marker(candidate.point, {
            icon: makeCipherNumberIcon(
                candidate.label,
                "#ffffff"
            )
        }).addTo(cipherGame.layer);

        marker.bindPopup(
            `CANDIDATE ${candidate.label}`
        );

        marker.on("click", () => {
            selectCipherOverlayCandidate(index);
        });

        mission.markers.push(marker);
    });
}


/* =========================================
   MISSION 3 — VERIFY SPATIAL CONDITIONS
========================================= */

function selectCipherOverlayCandidate(index) {

    const mission = cipherGame.overlayMission;

    if (!mission || cipherGame.finished) return;

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

    const container =
        document.getElementById("cipher-overlay-comparison");

    container.innerHTML = `
        <div class="document-card">

            <h4>CANDIDATE ${candidate.label}</h4>

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
            >
                CONFIRM CANDIDATE ${candidate.label}
            </button>

        </div>
    `;

    document.getElementById("cipher-confirm-overlay")
        .addEventListener(
            "click",
            verifyCipherOverlayCandidate
        );
}


/* =========================================
   MISSION 3 — COMPLETE
========================================= */

function verifyCipherOverlayCandidate() {

    const mission = cipherGame.overlayMission;

    if (
        !mission ||
        cipherGame.finished ||
        mission.selectedIndex === null
    ) return;

    const candidate =
        mission.candidates[mission.selectedIndex];

    if (!candidate.correct) {

        document.getElementById("feedback").textContent =
            "Incorrect location. Check the three spatial conditions and try again.";

        return;
    }

    cipherGame.finished = true;

    document.getElementById("feedback").textContent =
        "Correct! The location satisfies all spatial conditions.";

    document.getElementById("progress-text").textContent =
        "3 / 4";

    document.getElementById("progress-fill").style.width =
        "75%";

    updateCipherTimeline(4);
    updateCipherEvidence(3);

    document.getElementById("mission-actions").innerHTML = `
    <div class="selection-info">
        ✓ MISSION 3 COMPLETED
    </div>

    <p>
        The overlay analysis is complete.
        The safe meeting location has been identified.
    </p>

    <button
        class="primary-btn"
        id="cipher-next-mission"
        type="button"
    >
        CONTINUE TO MISSION 4
    </button>
`;

document.getElementById("cipher-next-mission")
    .addEventListener("click", startCipherMission4);

}


/* =========================================
   STOP CHAPTER 3
========================================= */



/* =========================================
   MISSION 4 — THE FINAL CIPHER
   ADVANCED EVIDENCE INVESTIGATION
========================================= */

function startCipherMission4() {
    cipherGame.stage = 4;
    cipherGame.finished = false;

    const previous = cipherGame.overlayMission;

    if (!previous) {
        console.error("Mission 3 data is missing.");
        return;
    }

    const previousCorrect = previous.candidates.find(
        candidate => candidate.correct
    );

    if (!previousCorrect) return;

    const origin = previousCorrect.point;

    // Build a new mystery near the location
    // discovered in Mission 3.
    const scenario = generateCipherFinalScenario(origin);

    if (!scenario) {
        document.getElementById("feedback").textContent =
            "Could not generate the final investigation. Please restart the chapter.";
        return;
    }

    cipherGame.finalMission = {
        ...scenario,
        selectedEvidence: null,
        connections: new Set(),
        selectedCandidate: null,
        graphReady: false,
        completed: false
    };

    document.getElementById("stage-number").textContent =
        "MISSION 04 / 04";

    document.getElementById("mission-title").textContent =
        "The Final Cipher";

    document.getElementById("mission-description").textContent =
        "Three possible hideouts remain. Analyze signal strength, terrain elevation and travel time to identify the researcher's final location.";

    document.getElementById("mission-objective").textContent =
        "Connect each evidence node to every candidate that satisfies its condition. Then identify the only candidate supported by all three clues.";

    document.getElementById("feedback").textContent = "";

    updateCipherTimeline(4);
    updateCipherEvidence(3);

    document.getElementById("evidence-documents").innerHTML = `
        <div class="document-card">
            <h4>FINAL CASE FILE</h4>
            <p>
                The researcher may be hiding at one
                of three locations: A, B or C.
            </p>
            <p>
                Each location has a different
                combination of spatial properties.
            </p>
        </div>

        <div class="document-card">
            <h4>SIGNAL EVIDENCE</h4>
            <p>
                The final location is no more than
                <strong>4.5 km</strong> from the
                communication tower.
            </p>
        </div>

        <div class="document-card">
            <h4>TERRAIN EVIDENCE</h4>
            <p>
                The final location has an elevation
                between <strong>700 m and 900 m</strong>.
            </p>
            <p>
                Elevations are simulated case data.
            </p>
        </div>

        <div class="document-card">
            <h4>TIMELINE EVIDENCE</h4>
            <p>
                The researcher traveled from the
                previous meeting point.
            </p>
            <p>
                Maximum speed: <strong>3 km/h</strong>
            </p>
            <p>
                Available time: <strong>1.5 hours</strong>
            </p>
            <p>
                Maximum straight-line distance:
                <strong>4.5 km</strong>
            </p>
        </div>
    `;

    document.getElementById("mission-actions").innerHTML = `
        <div class="selection-info">
            INTERACTIVE EVIDENCE NETWORK
        </div>

        <p>
            Click an evidence node, then click
            every candidate that matches it.
            Click a connection again to remove it.
        </p>

        <div
            id="cipher-final-network"
            style="
                width:100%;
                height:350px;
                background:#101c30;
                border:1px solid #34445f;
                border-radius:12px;
                overflow:hidden;
            "
        ></div>

        <div
            id="cipher-final-network-info"
            class="document-card"
            style="margin-top:12px;"
        >
            Select SIGNAL, TERRAIN or TIMELINE.
        </div>

        <div
            id="cipher-final-progress"
            style="margin-top:12px;"
        ></div>

        <div
            id="cipher-final-decision"
            style="margin-top:16px;"
        ></div>
    `;

    cipherGame.layer.clearLayers();

    const tower = scenario.tower;
    const start = scenario.origin;

    L.marker(tower, {
        icon: makeCipherNumberIcon("T", "#f4c76a")
    })
        .addTo(cipherGame.layer)
        .bindPopup("COMMUNICATION TOWER");

    L.marker(start, {
        icon: makeCipherNumberIcon("S", "#5fc9d7")
    })
        .addTo(cipherGame.layer)
        .bindPopup("PREVIOUS MEETING POINT");

    scenario.candidates.forEach(candidate => {
        L.marker(candidate.point, {
            icon: makeCipherNumberIcon(
                candidate.label,
                "#ffffff"
            )
        })
            .addTo(cipherGame.layer)
            .bindPopup(
                `CANDIDATE ${candidate.label}<br>
                 Elevation: ${candidate.elevation} m`
            );
    });

    cipherGame.map.fitBounds(
        [
            tower,
            start,
            ...scenario.candidates.map(c => c.point)
        ],
        {
            padding: [45, 45],
            maxZoom: 11
        }
    );

    createCipherFinalNetwork();
}


/* =========================================
   GENERATE FINAL SCENARIO
========================================= */

function generateCipherFinalScenario(origin) {

    const originFeature = turf.point([
        origin[1],
        origin[0]
    ]);

    function destination(distance, bearing) {
        const result = turf.destination(
            originFeature,
            distance,
            bearing,
            { units: "kilometers" }
        );

        return [
            result.geometry.coordinates[1],
            result.geometry.coordinates[0]
        ];
    }

    // Rotate the scenario randomly so that
    // the same compass directions do not
    // always reveal the answer.

    for (let attempt = 0; attempt < 360; attempt++) {

        const angle = Math.random() * 360;

        const correctPoint = destination(
            2,
            angle
        );

        const signalOnlyPoint = destination(
            7,
            angle
        );

        const terrainTimelinePoint = destination(
            3,
            (angle + 180) % 360
        );

        const tower = destination(
            4,
            angle
        );

        const points = [
            correctPoint,
            signalOnlyPoint,
            terrainTimelinePoint,
            tower
        ];

        if (!points.every(point =>
            CipherCase.isInsideTurkey(...point)
        )) {
            continue;
        }

        const candidates = [
            {
                point: correctPoint,
                elevation: 780,
                correct: true
            },
            {
                point: signalOnlyPoint,
                elevation: 1150,
                correct: false
            },
            {
                point: terrainTimelinePoint,
                elevation: 820,
                correct: false
            }
        ];

        // Randomize labels.
        for (let i = candidates.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));

            [candidates[i], candidates[j]] =
                [candidates[j], candidates[i]];
        }

        candidates.forEach((candidate, index) => {
            candidate.label = ["A", "B", "C"][index];

            candidate.signalDistance =
                cipherDistance(
                    candidate.point[0],
                    candidate.point[1],
                    tower[0],
                    tower[1]
                ) / 1000;

            candidate.travelDistance =
                cipherDistance(
                    candidate.point[0],
                    candidate.point[1],
                    origin[0],
                    origin[1]
                ) / 1000;
        });

        return {
            origin,
            tower,
            candidates
        };
    }

    return null;
}


/* =========================================
   EVIDENCE RULES
========================================= */

function cipherFinalPasses(candidate, evidence) {

    if (evidence === "signal") {
        return candidate.signalDistance <= 4.5;
    }

    if (evidence === "terrain") {
        return (
            candidate.elevation >= 700 &&
            candidate.elevation <= 900
        );
    }

    if (evidence === "timeline") {
        return candidate.travelDistance <= 4.5;
    }

    return false;
}


/* =========================================
   D3.JS EVIDENCE NETWORK
========================================= */

function createCipherFinalNetwork() {

    if (typeof d3 === "undefined") {
        document.getElementById(
            "cipher-final-network"
        ).textContent = "D3.js could not be loaded.";
        return;
    }

    const mission = cipherGame.finalMission;

    const container = document.getElementById(
        "cipher-final-network"
    );

    const width = Math.max(
        container.clientWidth,
        300
    );

    const height = 350;

    const svg = d3.select(container)
        .append("svg")
        .attr("width", "100%")
        .attr("height", "100%")
        .attr("viewBox", `0 0 ${width} ${height}`);

    const evidenceNodes = [
        {
            id: "signal",
            label: "SIGNAL",
            x: width * 0.20,
            y: 75
        },
        {
            id: "terrain",
            label: "TERRAIN",
            x: width * 0.50,
            y: 75
        },
        {
            id: "timeline",
            label: "TIMELINE",
            x: width * 0.80,
            y: 75
        }
    ];

    const candidateNodes =
        mission.candidates.map((candidate, index) => ({
            id: candidate.label,
            label: candidate.label,
            x: width * (0.20 + index * 0.30),
            y: 265
        }));

    const connectionLayer = svg.append("g")
        .attr("class", "cipher-connections");

    function drawConnections() {

        const data = Array.from(
            mission.connections
        ).map(key => {

            const [evidence, candidate] =
                key.split(":");

            const source = evidenceNodes.find(
                node => node.id === evidence
            );

            const target = candidateNodes.find(
                node => node.id === candidate
            );

            return {
                key,
                source,
                target
            };
        });

        connectionLayer
            .selectAll("line")
            .data(data, d => d.key)
            .join("line")
            .attr("x1", d => d.source.x)
            .attr("y1", d => d.source.y)
            .attr("x2", d => d.target.x)
            .attr("y2", d => d.target.y)
            .attr("stroke", "#59c987")
            .attr("stroke-width", 3)
            .attr("stroke-opacity", 0.85);
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
        .attr("r", 31)
        .attr("fill", "#f4c76a")
        .attr("stroke", "#ffffff")
        .attr("stroke-width", 2);

    candidateGroup.append("text")
        .text(d => d.label)
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "middle")
        .attr("fill", "#142338")
        .attr("font-size", 17)
        .attr("font-weight", "bold")
        .style("pointer-events", "none");

    evidenceGroup.on("click", function(event, d) {

        mission.selectedEvidence = d.id;

        evidenceGroup.selectAll("circle")
            .attr("fill", node =>
                node.id === d.id
                    ? "#5fc9d7"
                    : "#233b59"
            );

        showCipherFinalEvidenceInfo(d.id);
    });

    candidateGroup.on("click", function(event, d) {

        if (!mission.selectedEvidence) {
            document.getElementById(
                "cipher-final-network-info"
            ).textContent =
                "Select an evidence node first.";
            return;
        }

        const key =
            `${mission.selectedEvidence}:${d.id}`;

        if (mission.connections.has(key)) {
            mission.connections.delete(key);
        } else {
            mission.connections.add(key);
        }

        drawConnections();
        updateCipherFinalProgress();
    });

    svg.append("text")
        .attr("x", width / 2)
        .attr("y", 155)
        .attr("text-anchor", "middle")
        .attr("fill", "#9fb3ce")
        .attr("font-size", 11)
        .text("CONNECT EVIDENCE TO CANDIDATES");

    mission.graphReady = true;
    updateCipherFinalProgress();
}


/* =========================================
   EVIDENCE INFORMATION
========================================= */

function showCipherFinalEvidenceInfo(evidence) {

    const mission = cipherGame.finalMission;

    const rows = mission.candidates.map(candidate => {

        let value = "";

        if (evidence === "signal") {
            value =
                `${candidate.signalDistance.toFixed(2)} km`;
        }

        if (evidence === "terrain") {
            value = `${candidate.elevation} m`;
        }

        if (evidence === "timeline") {
            value =
                `${candidate.travelDistance.toFixed(2)} km`;
        }

        return `
            <tr>
                <td>${candidate.label}</td>
                <td>${value}</td>
            </tr>
        `;
    }).join("");

    const descriptions = {
        signal:
            "Which candidates are within 4.5 km of the communication tower?",

        terrain:
            "Which candidates have an elevation between 700 m and 900 m?",

        timeline:
            "Which candidates are within 4.5 km of the previous meeting point?"
    };

    document.getElementById(
        "cipher-final-network-info"
    ).innerHTML = `
        <h4>${evidence.toUpperCase()} ANALYSIS</h4>

        <p>${descriptions[evidence]}</p>

        <table style="
            width:100%;
            color:#ffffff;
            text-align:left;
        ">
            <thead>
                <tr>
                    <th>LOCATION</th>
                    <th>VALUE</th>
                </tr>
            </thead>

            <tbody>${rows}</tbody>
        </table>

        <p>
            Connect this evidence to every
            candidate that satisfies the condition.
        </p>
    `;
}


/* =========================================
   CHECK NETWORK CONNECTIONS
========================================= */

function updateCipherFinalProgress() {

    const mission = cipherGame.finalMission;

    const evidenceTypes = [
        "signal",
        "terrain",
        "timeline"
    ];

    const required = new Set();

    evidenceTypes.forEach(evidence => {

        mission.candidates.forEach(candidate => {

            if (cipherFinalPasses(candidate, evidence)) {
                required.add(
                    `${evidence}:${candidate.label}`
                );
            }
        });
    });

    const correctConnections =
        [...mission.connections].filter(
            key => required.has(key)
        ).length;

    const wrongConnections =
        [...mission.connections].filter(
            key => !required.has(key)
        ).length;

    const completed =
        correctConnections === required.size &&
        wrongConnections === 0;

    const progress = document.getElementById(
        "cipher-final-progress"
    );

    progress.innerHTML = `
        <div class="selection-info">
            CONNECTIONS:
            ${mission.connections.size}
            / ${required.size}
        </div>

        <button
            class="primary-btn"
            id="cipher-check-network"
            type="button"
        >
            ANALYZE CONNECTIONS
        </button>
    `;

    document.getElementById("cipher-check-network")
        .addEventListener("click", () => {

            if (!completed) {

                document.getElementById(
                    "feedback"
                ).textContent =
                    "Some evidence connections are missing or incorrect. Review the spatial measurements.";

                return;
            }

            document.getElementById(
                "feedback"
            ).textContent =
                "Evidence network solved! One candidate satisfies all three conditions.";

            unlockCipherFinalDecision();
        });
}


/* =========================================
   UNLOCK FINAL DECISION
========================================= */

function unlockCipherFinalDecision() {

    const mission = cipherGame.finalMission;

    const container = document.getElementById(
        "cipher-final-decision"
    );

    container.innerHTML = `
        <div class="selection-info">
            ✓ EVIDENCE NETWORK COMPLETED
        </div>

        <p>
            Which location satisfies
            all three conditions?
        </p>

        <div style="
            display:flex;
            gap:10px;
            flex-wrap:wrap;
        ">
            ${mission.candidates.map(candidate => `
                <button
                    class="primary-btn"
                    type="button"
                    data-final-candidate="${candidate.label}"
                >
                    LOCATION ${candidate.label}
                </button>
            `).join("")}
        </div>

        <div
            id="cipher-final-result"
            style="margin-top:12px;"
        ></div>
    `;

    container.querySelectorAll(
        "[data-final-candidate]"
    ).forEach(button => {

        button.addEventListener("click", () => {

            const label =
                button.dataset.finalCandidate;

            verifyCipherFinalLocation(label);
        });
    });
}


/* =========================================
   VERIFY FINAL ANSWER
========================================= */

function verifyCipherFinalLocation(label) {

    const mission = cipherGame.finalMission;

    if (!mission || mission.finished) return;

    const candidate = mission.candidates.find(
        candidate => candidate.label === label
    );

    if (!candidate) return;

    const valid = [
        "signal",
        "terrain",
        "timeline"
    ].every(evidence =>
        cipherFinalPasses(candidate, evidence)
    );

    if (!valid) {

        document.getElementById(
            "cipher-final-result"
        ).textContent =
            "Incorrect location. Review the evidence connections.";

        return;
    }

    mission.finished = true;
    cipherGame.finished = true;

    document.getElementById(
        "progress-text"
    ).textContent = "4 / 4";

    document.getElementById(
        "progress-fill"
    ).style.width = "100%";

    updateCipherEvidence(4);

    document.getElementById(
        "stage-number"
    ).textContent = "CASE COMPLETED";

    document.getElementById(
        "mission-title"
    ).textContent = "CASE SOLVED";

    document.getElementById(
        "mission-description"
    ).textContent =
        "You successfully connected the evidence and identified the researcher's final location.";

    document.getElementById(
        "mission-objective"
    ).textContent =
        "All four missions completed.";

    document.getElementById(
        "feedback"
    ).textContent =
        "Excellent detective work! The final cipher has been solved.";

    document.getElementById(
        "mission-actions"
    ).innerHTML = `
        <div class="selection-info">
            🏆 THE COORDINATE CIPHER — SOLVED
        </div>

        <p>✓ Coordinate Conversion</p>
        <p>✓ Distance Analysis</p>
        <p>✓ Spatial Overlay</p>
        <p>✓ Evidence Network Analysis</p>

        <p>
            Final location:
            <strong>${candidate.label}</strong>
        </p>

        <p>
            You solved the investigation by combining
            spatial measurements and evidence relationships.
        </p>
    `;

    cipherGame.layer.clearLayers();

    L.marker(candidate.point)
        .addTo(cipherGame.layer)
        .bindPopup(
            "<strong>FINAL LOCATION DISCOVERED</strong>"
        )
        .openPopup();

    cipherGame.map.flyTo(
        candidate.point,
        12,
        { duration: 1.5 }
    );
}


function stopCipherInvestigation() {
    cipherGame.finished = true;

    if (
        cipherGame.distanceMission &&
        cipherGame.distanceMission.chart
    ) {
        cipherGame.distanceMission.chart.destroy();
        cipherGame.distanceMission.chart = null;
    }

    if (cipherGame.map) {
        cipherGame.map.remove();
        cipherGame.map = null;
    }
}
