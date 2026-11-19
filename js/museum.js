
/* =========================================================
   GEODETECTIVE — MIDNIGHT AT THE MUSEUM
   COMPLETE CHAPTER 2

   MISSION 1 — Security Camera Investigation
   MISSION 2 — Suspect Tracking
   MISSION 3 — Escape Route Analysis
   MISSION 4 — Find the Hideout
========================================================= */


/* =========================================================
   SCENARIO GENERATOR
========================================================= */

const MuseumCase = (() => {

    const DISTRICTS = [
        { name: "Ulus", center: [39.9435, 32.8560] },
        { name: "Hamamönü", center: [39.9320, 32.8680] },
        { name: "Kızılay", center: [39.9208, 32.8541] },
        { name: "Çankaya", center: [39.8915, 32.8580] },
        { name: "Bahçelievler", center: [39.9250, 32.8265] },
        { name: "Cebeci", center: [39.9250, 32.8750] }
    ];

    const MUSEUM_NAMES = [
        "Museum of Ancient Civilizations",
        "National Heritage Gallery",
        "Anatolian History Museum",
        "Museum of Lost Empires",
        "Historical Art Collection",
        "Archaeological Research Museum"
    ];

    const ARTIFACTS = [
        "Golden Astrolabe",
        "Ancient Bronze Compass",
        "Royal Seal",
        "Ceremonial Dagger",
        "Ottoman Star Chart",
        "Silver Manuscript Case"
    ];

    const HIDEOUT_NAMES = [
        "Old Warehouse",
        "Abandoned Workshop",
        "Historic Storage House",
        "Disused Railway Office",
        "Underground Archive",
        "Former Customs Building"
    ];

    const DIRECTIONS = [
        { name: "North", angle: 0 },
        { name: "East", angle: 90 },
        { name: "South", angle: 180 },
        { name: "West", angle: 270 }
    ];

    function random(min, max) {
        return min + Math.random() * (max - min);
    }

    function randomInt(min, max) {
        return Math.floor(random(min, max + 1));
    }

    function pick(array) {
        return array[randomInt(0, array.length - 1)];
    }

    function shuffle(array) {
        const result = [...array];

        for (let i = result.length - 1; i > 0; i--) {
            const j = randomInt(0, i);
            [result[i], result[j]] = [result[j], result[i]];
        }

        return result;
    }

    function offset(point, east, north) {
        return [
            point[0] + north / 111320,
            point[1] + east /
                (111320 * Math.cos(point[0] * Math.PI / 180))
        ];
    }

    function pointAt(start, angle, meters) {
        const rad = angle * Math.PI / 180;

        return offset(
            start,
            Math.sin(rad) * meters,
            Math.cos(rad) * meters
        );
    }

    function distance(a, b) {
        const R = 6371000;
        const rad = Math.PI / 180;

        const dLat = (b[0] - a[0]) * rad;
        const dLon = (b[1] - a[1]) * rad;

        const h =
            Math.sin(dLat / 2) ** 2 +
            Math.cos(a[0] * rad) *
            Math.cos(b[0] * rad) *
            Math.sin(dLon / 2) ** 2;

        return 2 * R * Math.asin(
            Math.min(1, Math.sqrt(h))
        );
    }

    function bearing(from, to) {
        const rad = Math.PI / 180;

        const lat1 = from[0] * rad;
        const lat2 = to[0] * rad;
        const dLon = (to[1] - from[1]) * rad;

        const y = Math.sin(dLon) * Math.cos(lat2);

        const x =
            Math.cos(lat1) * Math.sin(lat2) -
            Math.sin(lat1) * Math.cos(lat2) *
            Math.cos(dLon);

        return (Math.atan2(y, x) * 180 / Math.PI + 360) % 360;
    }

    function angleDifference(a, b) {
        return Math.abs(((a - b + 540) % 360) - 180);
    }

    function isPointVisible(camera, point) {
        return (
            distance(camera.point, point) <= camera.range &&
            angleDifference(
                bearing(camera.point, point),
                camera.bearing
            ) <= camera.fov / 2
        );
    }

    function formatTime(minutes) {
        const n = ((minutes % 1440) + 1440) % 1440;

        return (
            String(Math.floor(n / 60)).padStart(2, "0") +
            ":" +
            String(n % 60).padStart(2, "0")
        );
    }

    function buildScenario() {

        const district = pick(DISTRICTS);

        const museumPoint = offset(
            district.center,
            random(-350, 350),
            random(-350, 350)
        );

        const museum = {
            name: pick(MUSEUM_NAMES),
            artifact: pick(ARTIFACTS),
            point: museumPoint
        };

        const entranceDistance = randomInt(95, 125);
        const rotation = random(0, 360);

        const entranceDirections = [
            { id: "north", name: "North Service Entrance", angle: 0 },
            { id: "east", name: "East Staff Entrance", angle: 90 },
            { id: "south", name: "South Loading Entrance", angle: 180 },
            { id: "west", name: "West Maintenance Entrance", angle: 270 }
        ];

        const entrances = entranceDirections.map(item => ({
            id: item.id,
            name: item.name,
            point: pointAt(
                museumPoint,
                item.angle + rotation,
                entranceDistance
            )
        }));

        const breachedEntrance = pick(entrances);

        const monitoredEntrances = entrances.filter(
            entrance => entrance.id !== breachedEntrance.id
        );

        const cameras = monitoredEntrances.map((entrance, index) => {

            const outwardBearing = bearing(
                museumPoint,
                entrance.point
            );

            const cameraDistance = randomInt(70, 95);

            const cameraPoint = pointAt(
                entrance.point,
                outwardBearing + random(-8, 8),
                cameraDistance
            );

            return {
                id: `camera-${index + 1}`,
                label: `CAM ${index + 1}`,
                point: cameraPoint,
                bearing: bearing(cameraPoint, entrance.point),
                range: cameraDistance + randomInt(20, 35),
                fov: randomInt(45, 60),
                monitorsEntrance: entrance.id
            };
        });

        const outwardBearing = bearing(
            museumPoint,
            breachedEntrance.point
        );

        const fourthDistance = randomInt(65, 90);

        const fourthPoint = pointAt(
            breachedEntrance.point,
            outwardBearing + random(-10, 10),
            fourthDistance
        );

        cameras.push({
            id: "camera-4",
            label: "CAM 4",
            point: fourthPoint,
            bearing:
                (outwardBearing + random(-12, 12) + 360) % 360,
            range: fourthDistance + randomInt(20, 35),
            fov: randomInt(45, 60),
            monitorsEntrance: null
        });

        const shuffledCameras = shuffle(cameras).map(
            (camera, index) => ({
                ...camera,
                id: `camera-${index + 1}`,
                label: `CAM ${index + 1}`
            })
        );

        /* MISSION 2 — SUSPECTS */

        const escapeDirection = pick(DIRECTIONS);

        const theftMinute = randomInt(
            23 * 60 + 35,
            23 * 60 + 40
        );

        const correctAngle =
            escapeDirection.angle + random(-20, 20);

        const decoyOneAngle =
            escapeDirection.angle + random(65, 105);

        const decoyTwoAngle =
            escapeDirection.angle - random(65, 105);

        const correctPoint = pointAt(
            breachedEntrance.point,
            correctAngle,
            randomInt(350, 520)
        );

        const decoyOnePoint = pointAt(
            breachedEntrance.point,
            decoyOneAngle,
            randomInt(320, 510)
        );

        const decoyTwoPoint = pointAt(
            breachedEntrance.point,
            decoyTwoAngle,
            randomInt(350, 530)
        );

        const correctMinute =
            theftMinute + randomInt(5, 9);

        const decoyOneMinute =
            theftMinute - randomInt(2, 5);

        const decoyTwoMinute =
            theftMinute + randomInt(5, 9);

        const suspectRecords = shuffle([
            {
                id: "correct",
                point: correctPoint,
                minute: correctMinute,
                time: formatTime(correctMinute),
                direction: escapeDirection.name,
                angle: correctAngle,
                carriesPackage: true
            },
            {
                id: "decoy-1",
                point: decoyOnePoint,
                minute: decoyOneMinute,
                time: formatTime(decoyOneMinute),
                direction: pick(
                    DIRECTIONS.filter(d =>
                        d.name !== escapeDirection.name
                    )
                ).name,
                angle: decoyOneAngle,
                carriesPackage: true
            },
            {
                id: "decoy-2",
                point: decoyTwoPoint,
                minute: decoyTwoMinute,
                time: formatTime(decoyTwoMinute),
                direction: pick(
                    DIRECTIONS.filter(d =>
                        d.name !== escapeDirection.name
                    )
                ).name,
                angle: decoyTwoAngle,
                carriesPackage: true
            }
        ]).map((record, index) => ({
            ...record,
            label: `Suspect ${index + 1}`
        }));

        const correctSuspect = suspectRecords.find(
            record => record.id === "correct"
        );

        /* MISSION 3 — ROUTES */

        const routes = shuffle(
            [0, 1, 2].map(index => {

                const turn = pick(DIRECTIONS);

                const waypoint = pointAt(
                    correctPoint,
                    turn.angle + random(-25, 25),
                    randomInt(350, 550)
                );

                const destination = pointAt(
                    waypoint,
                    escapeDirection.angle,
                    randomInt(350, 600)
                );

                return {
                    id: `route-${index}`,
                    waypoint,
                    destination,
                    blocked: false
                };
            })
        );

        const correctRoute = pick(routes);

        routes.forEach(route => {
            route.blocked = route.id !== correctRoute.id;
        });

        /* MISSION 4 — HIDEOUTS */

        const hideoutNames = shuffle(HIDEOUT_NAMES);

        const hideouts = shuffle([
            {
                id: "correct",
                name: hideoutNames[0],
                point: offset(
                    correctRoute.destination,
                    random(-80, 80),
                    random(-80, 80)
                )
            },
            {
                id: "decoy-1",
                name: hideoutNames[1],
                point: offset(
                    correctRoute.destination,
                    850,
                    500
                )
            },
            {
                id: "decoy-2",
                name: hideoutNames[2],
                point: offset(
                    correctRoute.destination,
                    -900,
                    -450
                )
            }
        ]);

        return {
            district: district.name,
            museum,
            entrances,
            breachedEntrance,
            cameras: shuffledCameras,
            suspectRecords,
            correctSuspect,
            escapeDirection,
            routes,
            correctRoute,
            hideouts,
            correctHideout: hideouts.find(
                hideout => hideout.id === "correct"
            ),
            theftMinute,
            theftTime: formatTime(theftMinute)
        };
    }

    function generateScenario() {

        for (let attempt = 0; attempt < 150; attempt++) {

            const scenario = buildScenario();

            const blindEntrances = scenario.entrances.filter(
                entrance =>
                    !scenario.cameras.some(camera =>
                        isPointVisible(camera, entrance.point)
                    )
            );

            const outwardCamera = scenario.cameras.find(
                camera => camera.monitorsEntrance === null
            );

            if (
                scenario.cameras.length === 4 &&
                blindEntrances.length === 1 &&
                blindEntrances[0].id === scenario.breachedEntrance.id &&
                outwardCamera &&
                scenario.entrances.every(entrance =>
                    !isPointVisible(outwardCamera, entrance.point)
                )
            ) {
                return scenario;
            }
        }

        throw new Error(
            "Unable to generate a valid museum scenario."
        );
    }

    return {
        generateScenario,
        distance,
        bearing,
        isPointVisible,
        offset,
        pointAt,
        formatTime
    };

})();


/* =========================================================
   GAME STATE
========================================================= */

const museumGame = {
    stage: 0,
    seconds: 420,
    interval: null,
    scenario: null,
    selectedCamera: null,
    selectedSuspect: null,
    selectedRoute: null,
    selectedHideout: null,
    mistakes: 0,
    finished: true,
    map: null,
    layer: null
};


/* =========================================================
   SHARED UI HELPERS
========================================================= */

function museumSetText(id, value) {
    const element = document.getElementById(id);
    if (element) element.textContent = value;
}

function museumSetHTML(id, value) {
    const element = document.getElementById(id);
    if (element) element.innerHTML = value;
}

function museumSetProgress(completed) {
    museumSetText("progress-text", `${completed} / 4`);

    const fill = document.getElementById("progress-fill");

    if (fill) {
        fill.style.width = `${completed * 25}%`;
    }
}

function museumSetTimeline(stage) {

    const times = ["23:30", "23:45", "00:00", "00:15"];

    museumSetHTML(
        "timeline",
        times.map((time, index) => {

            if (index < stage) {
                return `<div class="timeline-step done">✓ ${time}</div>`;
            }

            if (index === stage && stage < 4) {
                return `<div class="timeline-step active">${time}</div>`;
            }

            if (stage === 4) {
                return `<div class="timeline-step done">✓ ${time}</div>`;
            }

            return `<div class="timeline-step">🔒 ${time}</div>`;

        }).join("")
    );
}

function museumSetEvidenceList(completed) {

    const names = [
        "Camera blind spot identified",
        "Suspect identified",
        "Escape route verified",
        "Hideout identified"
    ];

    const times = ["23:30", "23:45", "00:00", "00:15"];

    museumSetHTML(
        "evidence-list",
        names.map((name, index) => {

            if (index < completed) {
                return `
                    <div class="evidence-item done">
                        ✓ ${times[index]} — ${name}
                    </div>
                `;
            }

            return `
                <div class="evidence-item">
                    🔒 ${times[index]} — EVIDENCE LOCKED
                </div>
            `;

        }).join("")
    );
}

function museumSetMission(stage, title, description, objective) {

    museumSetText(
        "stage-number",
        `MISSION ${String(stage + 1).padStart(2, "0")} / 04`
    );

    museumSetText("mission-title", title);
    museumSetText("mission-description", description);
    museumSetText("mission-objective", objective);
    museumSetText("feedback", "");

    museumSetTimeline(stage);
    museumSetEvidenceList(stage);
}

function museumSetActions(message, buttonLabel, handler) {

    museumSetHTML("mission-actions", `
        <div class="selection-info" id="museum-selection">
            ${message}
        </div>

        <button
            class="primary-btn"
            id="museum-verify"
            type="button"
            disabled
        >
            ${buttonLabel}
        </button>
    `);

    document.getElementById("museum-verify")
        .addEventListener("click", handler);
}

function museumUpdateSelection(message) {

    museumSetText("museum-selection", message);

    const button = document.getElementById("museum-verify");

    if (button) button.disabled = false;

    museumSetText("feedback", "");
}

function museumWrongAnswer(message) {

    const failed = penalizeMuseumTime();

    if (!failed) {
        museumSetText(
            "feedback",
            `${message} −30 seconds.`
        );
    }
}


/* =========================================================
   TIMER
========================================================= */

function startMuseumTimer() {

    if (museumGame.interval !== null) {
        clearInterval(museumGame.interval);
    }

    museumGame.interval = setInterval(() => {

        if (museumGame.finished) return;

        museumGame.seconds = Math.max(
            0,
            museumGame.seconds - 1
        );

        updateMuseumTimer();

        if (museumGame.seconds === 0) {
            failMuseumInvestigation();
        }

    }, 1000);
}

function stopMuseumInvestigation() {

    if (museumGame.interval !== null) {
        clearInterval(museumGame.interval);
        museumGame.interval = null;
    }

    museumGame.finished = true;
}

function updateMuseumTimer() {

    const minutes = Math.floor(museumGame.seconds / 60);
    const seconds = museumGame.seconds % 60;

    museumSetText(
        "timer",
        `${String(minutes).padStart(2, "0")}:` +
        `${String(seconds).padStart(2, "0")}`
    );
}

function penalizeMuseumTime() {

    museumGame.mistakes++;

    museumGame.seconds = Math.max(
        0,
        museumGame.seconds - 30
    );

    updateMuseumTimer();

    if (museumGame.seconds === 0) {
        failMuseumInvestigation();
        return true;
    }

    return false;
}

function failMuseumInvestigation() {

    stopMuseumInvestigation();

    museumSetText("mission-title", "CASE FAILED");

    museumSetText(
        "feedback",
        "Time is up. The thief escaped."
    );

    museumSetHTML("mission-actions", `
        <div class="selection-info">
            Investigation failed.
        </div>
    `);
}


/* =========================================================
   CAMERA SECTOR — ORIGINAL BLUE DESIGN
========================================================= */

function createCameraSector(camera) {

    const points = [camera.point];

    const start = camera.bearing - camera.fov / 2;
    const end = camera.bearing + camera.fov / 2;

    for (let angle = start; angle <= end; angle += 3) {

        const radians = angle * Math.PI / 180;

        points.push(
            MuseumCase.offset(
                camera.point,
                Math.sin(radians) * camera.range,
                Math.cos(radians) * camera.range
            )
        );
    }

    const radians = end * Math.PI / 180;

    points.push(
        MuseumCase.offset(
            camera.point,
            Math.sin(radians) * camera.range,
            Math.cos(radians) * camera.range
        )
    );

    return L.polygon(points, {
        color: "#4fa8ff",
        fillColor: "#4fa8ff",
        fillOpacity: 0.22,
        weight: 2,
        interactive: false
    });
}


/* =========================================================
   CAMERA ICON — ORIGINAL SVG
========================================================= */

function createMuseumCameraIcon(camera) {

    const rotation = camera.bearing - 90;

    return L.divIcon({
        className: "museum-camera-marker",

        html: `
            <div style="
                width:42px;
                height:42px;
                display:flex;
                align-items:center;
                justify-content:center;
                transform:rotate(${rotation}deg);
                transform-origin:center;
                pointer-events:auto;
            ">
                <svg
                    width="40"
                    height="40"
                    viewBox="0 0 48 48"
                    xmlns="http://www.w3.org/2000/svg"
                    style="
                        display:block;
                        pointer-events:auto;
                        filter:drop-shadow(
                            0 2px 3px rgba(0,0,0,.65)
                        );
                    "
                >
                    <path
                        d="M10 29 L6 36 L6 41"
                        fill="none"
                        stroke="#16283a"
                        stroke-width="4"
                        stroke-linecap="round"
                    />

                    <rect
                        x="7"
                        y="15"
                        width="27"
                        height="15"
                        rx="3"
                        fill="#f1f4f7"
                        stroke="#16283a"
                        stroke-width="2.5"
                    />

                    <path
                        d="M34 17 L43 20 L43 25 L34 28 Z"
                        fill="#23374c"
                        stroke="#16283a"
                        stroke-width="2"
                    />

                    <circle
                        cx="14"
                        cy="19"
                        r="2.5"
                        fill="#ff4545"
                    />
                </svg>
            </div>
        `,

        iconSize: [42, 42],
        iconAnchor: [21, 21]
    });
}


/* =========================================================
   MAP INITIALIZATION
========================================================= */

function initializeMuseumMap() {

    if (museumGame.map) {
        museumGame.map.remove();
        museumGame.map = null;
    }

    if (
        typeof detectiveMap !== "undefined" &&
        detectiveMap
    ) {
        detectiveMap.remove();
        detectiveMap = null;
    }

    const museum = museumGame.scenario.museum;

    museumGame.map = L.map("map").setView(
        museum.point,
        17
    );

    L.tileLayer(
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        {
            attribution: "&copy; OpenStreetMap contributors",
            maxZoom: 19
        }
    ).addTo(museumGame.map);

    museumGame.layer = L.layerGroup().addTo(
        museumGame.map
    );

    setTimeout(() => {
        if (museumGame.map) {
            museumGame.map.invalidateSize();
        }
    }, 150);
}


/* =========================================================
   START INVESTIGATION
========================================================= */

function startMuseumInvestigation() {

    stopMuseumInvestigation();

    museumGame.stage = 0;
    museumGame.seconds = 420;
    museumGame.scenario = MuseumCase.generateScenario();

    museumGame.selectedCamera = null;
    museumGame.selectedSuspect = null;
    museumGame.selectedRoute = null;
    museumGame.selectedHideout = null;

    museumGame.mistakes = 0;
    museumGame.finished = false;

    const s = museumGame.scenario;

    museumSetText("case-title", "Midnight at the Museum");
    museumSetText("case-district", s.district.toUpperCase());

    museumSetProgress(0);
    updateMuseumTimer();

    initializeMuseumMap();

    startMuseumCameraMission();
    startMuseumTimer();
}


/* =========================================================
   MISSION 1 — SECURITY CAMERA INVESTIGATION
========================================================= */

function startMuseumCameraMission() {

    const s = museumGame.scenario;

    museumGame.stage = 0;
    museumGame.selectedCamera = null;

    museumSetMission(
        0,
        "The Security Breach",
        `A valuable artifact has been stolen from the ${s.museum.name}. Four security cameras surround the museum.`,
        "Three cameras monitor museum entrances, while one faces away. Select the camera facing away from the museum."
    );

    museumSetHTML("evidence-documents", `
        <div class="document-card">
            <h4>SECURITY CAMERA REPORT</h4>
            <p>
                Four cameras are installed around the museum.
                Each blue sector represents a camera's
                viewing direction and range.
            </p>
        </div>

        <div class="document-card">
            <h4>INVESTIGATION NOTE</h4>
            <p>
                Three cameras monitor museum entrances.
                One camera faces away from the building.
                Identify that camera.
            </p>
        </div>
    `);

    museumSetActions(
        "No camera selected. Click a camera on the map.",
        "VERIFY CAMERA",
        verifyMuseumCamera
    );

    renderMuseumMap();
}

function renderMuseumMap() {

    const s = museumGame.scenario;
    const layer = museumGame.layer;

    layer.clearLayers();

    L.marker(s.museum.point)
        .addTo(layer)
        .bindPopup(s.museum.name);

    const cameraSectors = [];

    s.cameras.forEach(camera => {

        const sector = createCameraSector(camera);
        sector.addTo(layer);
        cameraSectors.push(sector);

        const marker = L.marker(camera.point, {
            icon: createMuseumCameraIcon(camera),
            zIndexOffset: 1000,
            interactive: true
        }).addTo(layer);

        marker.bindTooltip(camera.label, {
            permanent: false,
            direction: "top",
            offset: [0, -18]
        });

        marker.on("click", () => {

            if (
                museumGame.finished ||
                museumGame.stage !== 0
            ) return;

            cameraSectors.forEach(item => {
                item.setStyle({
                    color: "#4fa8ff",
                    fillColor: "#4fa8ff",
                    fillOpacity: 0.22,
                    weight: 2
                });
            });

            sector.setStyle({
                color: "#ffd166",
                fillColor: "#ffd166",
                fillOpacity: 0.4,
                weight: 3
            });

            museumGame.selectedCamera = camera;

            museumUpdateSelection(
                `Selected: ${camera.label}`
            );
        });
    });

    museumGame.map.fitBounds(
        [
            s.museum.point,
            ...s.cameras.map(camera => camera.point)
        ],
        {
            padding: [65, 65],
            maxZoom: 17
        }
    );
}

function verifyMuseumCamera() {

    if (
        museumGame.finished ||
        museumGame.stage !== 0 ||
        !museumGame.selectedCamera
    ) return;

    const correct =
        museumGame.selectedCamera.monitorsEntrance === null;

    if (!correct) {

        museumWrongAnswer(
            "Incorrect camera. This camera monitors a museum entrance."
        );

        return;
    }

    museumSetProgress(1);

    // Automatically start Mission 2
    startMuseumSuspectMission();
}


/* =========================================================
   MISSION 2 — SUSPECT TRACKING
========================================================= */

function createMuseumSuspectIcon(label, selected = false) {

    const number = label.replace(/\D/g, "");

    return L.divIcon({
        className: "museum-suspect-marker",

        html: `
            <div style="
                width:38px;
                height:38px;
                border-radius:50%;
                background:${selected ? "#ffd166" : "#213d5a"};
                color:${selected ? "#172638" : "#ffffff"};
                border:3px solid ${selected ? "#ffffff" : "#79c7ff"};
                display:flex;
                align-items:center;
                justify-content:center;
                font-weight:800;
                font-size:16px;
                box-sizing:border-box;
                cursor:pointer;
                box-shadow:0 3px 9px rgba(0,0,0,.55);
            ">
                ${number}
            </div>
        `,

        iconSize: [38, 38],
        iconAnchor: [19, 19]
    });
}

function createMuseumSuspectLabel(suspect) {

    return `
        <div style="
            min-width:130px;
            color:#182c43;
            font-family:Arial,sans-serif;
            line-height:1.5;
            text-align:left;
        ">
            <div style="
                font-size:12px;
                font-weight:800;
                color:#173e65;
                margin-bottom:3px;
            ">
                ${suspect.label.toUpperCase()}
            </div>

            <div style="font-size:11px;">
                Time: <strong>${suspect.time}</strong>
            </div>

            <div style="font-size:11px;">
                Direction: <strong>${suspect.direction}</strong>
            </div>

            <div style="font-size:11px;">
                Package: <strong>YES</strong>
            </div>
        </div>
    `;
}

function createMuseumDirectionArrow(suspect, layer) {

    const angle = suspect.angle;
    const start = suspect.point;

    const end = MuseumCase.pointAt(
        start,
        angle,
        75
    );

    L.polyline([start, end], {
        color: "#ffcc66",
        weight: 3,
        opacity: 0.95,
        interactive: false
    }).addTo(layer);

    const leftAngle = (angle + 155) * Math.PI / 180;
    const rightAngle = (angle - 155) * Math.PI / 180;

    const leftPoint = MuseumCase.offset(
        end,
        Math.sin(leftAngle) * 18,
        Math.cos(leftAngle) * 18
    );

    const rightPoint = MuseumCase.offset(
        end,
        Math.sin(rightAngle) * 18,
        Math.cos(rightAngle) * 18
    );

    L.polyline(
        [leftPoint, end, rightPoint],
        {
            color: "#ffcc66",
            weight: 3,
            opacity: 0.95,
            interactive: false
        }
    ).addTo(layer);
}

function startMuseumSuspectMission() {

    if (
        museumGame.finished ||
        museumGame.seconds <= 0
    ) return;

    museumGame.stage = 1;
    museumGame.selectedSuspect = null;

    const s = museumGame.scenario;

    museumSetMission(
        1,
        "Suspect Tracking",
        `The ${s.museum.artifact} was stolen at ${s.theftTime}. Three people carrying packages were recorded near the museum.`,
        "Identify the suspect whose recorded time, location and direction match the witness report."
    );

    museumSetHTML("evidence-documents", `
        <div class="document-card">
            <h4>WITNESS REPORT</h4>

            <p>
                <strong>Artifact:</strong>
                ${s.museum.artifact}
            </p>

            <p>
                <strong>Theft time:</strong>
                ${s.theftTime}
            </p>

            <p>
                <strong>Escape direction:</strong>
                ${s.escapeDirection.name}
            </p>

            <p>
                <strong>Last known location:</strong>
                ${s.breachedEntrance.name}
            </p>
        </div>

        <div class="document-card">
            <h4>INVESTIGATION INSTRUCTIONS</h4>

            <p>
                Hover over each suspect marker to
                examine the observation details.
            </p>

            <p>
                Compare the observation time,
                movement direction and location
                with the witness report.
            </p>

            <p>
                Click the suspect who matches
                the evidence.
            </p>
        </div>
    `);

    museumSetActions(
        "No suspect selected. Click a suspect on the map.",
        "VERIFY SUSPECT",
        verifyMuseumSuspect
    );

    renderMuseumSuspectMap();
}

function renderMuseumSuspectMap() {

    const s = museumGame.scenario;
    const layer = museumGame.layer;

    layer.clearLayers();

    L.marker(s.museum.point)
        .addTo(layer)
        .bindPopup(s.museum.name);

    L.circle(s.breachedEntrance.point, {
        radius: 600,
        color: "#4fa8ff",
        weight: 2,
        fillColor: "#4fa8ff",
        fillOpacity: 0.06,
        dashArray: "7,7",
        interactive: false
    }).addTo(layer);

    // Green entrance marker without permanent text
    L.circleMarker(s.breachedEntrance.point, {
        radius: 11,
        color: "#ffffff",
        fillColor: "#22c55e",
        fillOpacity: 1,
        weight: 3,
        interactive: false
    }).addTo(layer);

    const suspectMarkers = [];

    s.suspectRecords.forEach(suspect => {

        createMuseumDirectionArrow(suspect, layer);

        const marker = L.marker(suspect.point, {
            icon: createMuseumSuspectIcon(suspect.label),
            zIndexOffset: 1000,
            interactive: true
        }).addTo(layer);

        marker.bindTooltip(
            createMuseumSuspectLabel(suspect),
            {
                permanent: false,
                sticky: false,
                direction: "top",
                offset: [0, -20],
                opacity: 0.98,
                interactive: false,
                className: "museum-suspect-info"
            }
        );

        suspectMarkers.push({ suspect, marker });

        marker.on("click", () => {

            if (
                museumGame.finished ||
                museumGame.stage !== 1
            ) return;

            museumGame.selectedSuspect = suspect;

            suspectMarkers.forEach(item => {

                const selected =
                    item.suspect.id === suspect.id;

                item.marker.setIcon(
                    createMuseumSuspectIcon(
                        item.suspect.label,
                        selected
                    )
                );

                item.marker.setZIndexOffset(
                    selected ? 1500 : 1000
                );
            });

            museumUpdateSelection(
                `Selected: ${suspect.label}`
            );
        });
    });

    const bounds = L.latLngBounds([
        s.museum.point,
        s.breachedEntrance.point,
        ...s.suspectRecords.map(suspect => suspect.point)
    ]);

    museumGame.map.fitBounds(bounds.pad(0.55), {
        padding: [45, 45],
        maxZoom: 15
    });

    setTimeout(() => {
        if (museumGame.map) {
            museumGame.map.invalidateSize();
        }
    }, 150);
}

function verifyMuseumSuspect() {

    if (
        museumGame.finished ||
        museumGame.stage !== 1 ||
        !museumGame.selectedSuspect
    ) return;

    const s = museumGame.scenario;

    if (
        museumGame.selectedSuspect.id !==
        s.correctSuspect.id
    ) {

        museumWrongAnswer(
            "Incorrect suspect. Check the observation time, location and escape direction."
        );

        return;
    }

    museumSetProgress(2);

    // Automatically start Mission 3
    startMuseumRouteMission();
}


/* =========================================================
   MISSION 3 — ESCAPE ROUTE ANALYSIS
========================================================= */

function createMuseumRouteIcon(number, selected = false) {

    return L.divIcon({
        className: "museum-route-marker",

        html: `
            <div style="
                width:38px;
                height:38px;
                border-radius:50%;
                background:${selected ? "#ffd166" : "#213d5a"};
                color:${selected ? "#172638" : "#ffffff"};
                border:3px solid ${selected ? "#ffffff" : "#79c7ff"};
                display:flex;
                align-items:center;
                justify-content:center;
                font-size:16px;
                font-weight:800;
                box-sizing:border-box;
                cursor:pointer;
                box-shadow:0 3px 9px rgba(0,0,0,.5);
            ">
                ${number}
            </div>
        `,

        iconSize: [38, 38],
        iconAnchor: [19, 19]
    });
}

function startMuseumRouteMission() {

    if (
        museumGame.finished ||
        museumGame.seconds <= 0
    ) return;

    museumGame.stage = 2;
    museumGame.selectedRoute = null;

    const s = museumGame.scenario;

    if (!s.routeEvidence) {

        const departureMinute =
            s.correctSuspect.minute + 2;

        s.routeEvidence = s.routes.map((route, index) => {

            const distance =
                MuseumCase.distance(
                    s.correctSuspect.point,
                    route.waypoint
                ) +
                MuseumCase.distance(
                    route.waypoint,
                    route.destination
                );

            const travelMinutes = Math.max(
                3,
                Math.ceil(distance / 250)
            );

            const closureMinute = route.blocked
                ? departureMinute - (index + 1)
                : null;

            return {
                route,
                distance,
                travelMinutes,
                closureMinute,
                departureMinute
            };
        });
    }

    museumSetMission(
        2,
        "Escape Route Analysis",
        `The suspect was last seen at ${s.correctSuspect.time}. Three possible escape routes have been reconstructed.`,
        "Compare route distances, estimated travel times and road closure records. Identify the route the suspect could have used."
    );

    const departure = MuseumCase.formatTime(
        s.correctSuspect.minute + 2
    );

    const rows = s.routeEvidence.map((record, index) => {

        const closure = record.closureMinute === null
            ? "No closure recorded"
            : `Closed at ${MuseumCase.formatTime(
                record.closureMinute
            )}`;

        return `
            <p style="margin:6px 0;">
                <strong>Route ${index + 1}</strong><br>
                Distance: ${Math.round(record.distance)} m<br>
                Estimated travel: ${record.travelMinutes} min<br>
                Road record: ${closure}
            </p>
        `;
    }).join("");

    museumSetHTML("evidence-documents", `
        <div class="document-card">
            <h4>CCTV MOVEMENT REPORT</h4>

            <p>
                Last observation:
                <strong>${s.correctSuspect.time}</strong>
            </p>

            <p>
                Estimated departure:
                <strong>${departure}</strong>
            </p>

            <p>
                The suspect departed shortly after
                the final CCTV observation.
            </p>
        </div>

        <div class="document-card">
            <h4>ROAD ACCESS & TRAVEL REPORT</h4>

            ${rows}

            <p>
                Compare the departure time with
                the road closure records.
            </p>
        </div>
    `);

    museumSetActions(
        "No route selected. Click a numbered route.",
        "VERIFY ROUTE",
        verifyMuseumRoute
    );

    renderMuseumRouteMap();
}

function renderMuseumRouteMap() {

    const s = museumGame.scenario;
    const layer = museumGame.layer;

    layer.clearLayers();

    L.circleMarker(s.correctSuspect.point, {
        radius: 9,
        color: "#ffffff",
        fillColor: "#22c55e",
        fillOpacity: 1,
        weight: 3
    })
    .addTo(layer)
    .bindTooltip("LAST CCTV LOCATION", {
        direction: "top"
    });

    const displayedRoutes = [];

    s.routes.forEach((route, index) => {

        const points = [
            s.correctSuspect.point,
            route.waypoint,
            route.destination
        ];

        const line = L.polyline(points, {
            color: "#4fa8ff",
            weight: 5,
            opacity: 0.85
        }).addTo(layer);

        const marker = L.marker(route.destination, {
            icon: createMuseumRouteIcon(index + 1),
            zIndexOffset: 1000
        }).addTo(layer);

        marker.bindTooltip(
            `ROUTE ${index + 1}`,
            {
                direction: "top",
                offset: [0, -20]
            }
        );

        displayedRoutes.push({
            route,
            line,
            marker,
            index
        });

        const selectRoute = () => {

            if (
                museumGame.finished ||
                museumGame.stage !== 2
            ) return;

            museumGame.selectedRoute = route;

            displayedRoutes.forEach(item => {

                const selected =
                    item.route.id === route.id;

                item.line.setStyle({
                    color: selected ? "#ffd166" : "#4fa8ff",
                    weight: selected ? 7 : 5
                });

                item.marker.setIcon(
                    createMuseumRouteIcon(
                        item.index + 1,
                        selected
                    )
                );

                item.marker.setZIndexOffset(
                    selected ? 1500 : 1000
                );
            });

            museumUpdateSelection(
                `Selected: Route ${index + 1}`
            );
        };

        marker.on("click", selectRoute);
        line.on("click", selectRoute);
    });

    const bounds = L.latLngBounds([
        s.correctSuspect.point,
        ...s.routes.flatMap(route => [
            route.waypoint,
            route.destination
        ])
    ]);

    museumGame.map.fitBounds(bounds.pad(0.25), {
        padding: [45, 45],
        maxZoom: 15
    });
}

function verifyMuseumRoute() {

    if (
        museumGame.finished ||
        museumGame.stage !== 2 ||
        !museumGame.selectedRoute
    ) return;

    const s = museumGame.scenario;

    if (
        museumGame.selectedRoute.id !==
        s.correctRoute.id
    ) {

        museumWrongAnswer(
            "Incorrect route. The road access records contradict this escape path."
        );

        return;
    }

    museumSetProgress(3);

    // Automatically start Mission 4
    startMuseumHideoutMission();
}


/* =========================================================
   MISSION 4 — FIND THE HIDEOUT
========================================================= */


/* =========================================================
   MISSION 4 — FIND THE HIDEOUT
========================================================= */

function createMuseumHideoutIcon(number, selected = false) {

    return L.divIcon({
        className: "museum-hideout-marker",
        html: `
            <div style="
                width:40px;
                height:40px;
                border-radius:10px;
                background:${selected ? "#ffd166" : "#213d5a"};
                color:${selected ? "#172638" : "#ffffff"};
                border:3px solid ${selected ? "#ffffff" : "#79c7ff"};
                display:flex;
                align-items:center;
                justify-content:center;
                font-weight:800;
                font-size:17px;
                box-sizing:border-box;
                cursor:pointer;
                box-shadow:0 3px 9px rgba(0,0,0,.5);
            ">
                ${number}
            </div>
        `,
        iconSize: [40, 40],
        iconAnchor: [20, 20]
    });
}


/* =========================================================
   GENERATE HIDEOUT EVIDENCE
========================================================= */

function prepareMuseumHideoutEvidence() {

    const s = museumGame.scenario;
    const center = s.correctRoute.destination;

    const angles = [35, 155, 275];

    const distances = [85, 115, 145];

    // Place all three buildings inside the search radius.
    s.hideouts.forEach((hideout, index) => {

        hideout.point = MuseumCase.pointAt(
            center,
            angles[index],
            distances[index]
        );
    });

    // Keep the correct building randomized.
    const correctIndex = s.hideouts.findIndex(
        hideout => hideout.id === s.correctHideout.id
    );

    const arrivalMinute =
        s.correctSuspect.minute +
        Math.max(
            3,
            Math.ceil(
                (
                    MuseumCase.distance(
                        s.correctSuspect.point,
                        s.correctRoute.waypoint
                    ) +
                    MuseumCase.distance(
                        s.correctRoute.waypoint,
                        s.correctRoute.destination
                    )
                ) / 250
            )
        );

    s.hideoutArrivalTime =
        MuseumCase.formatTime(arrivalMinute);

    const evidence = [
        {
            electricity: "Normal",
            camera: "No vehicle activity recorded",
            arrival: "No arrival recorded",
            vehicle: "No matching vehicle"
        },
        {
            electricity: "Sudden increase",
            camera: "Suspicious van recorded",
            arrival: s.hideoutArrivalTime,
            vehicle: "Matches the suspect vehicle"
        },
        {
            electricity: "Sudden increase",
            camera: "Delivery vehicle recorded",
            arrival: MuseumCase.formatTime(
                arrivalMinute + 35
            ),
            vehicle: "Does not match the suspect vehicle"
        }
    ];

    const correctEvidence = evidence[1];

    const decoyEvidence = [evidence[0], evidence[2]];

    let decoyIndex = 0;

    s.hideouts.forEach((hideout, index) => {

        hideout.evidence =
            index === correctIndex
                ? correctEvidence
                : decoyEvidence[decoyIndex++];
    });
}


/* =========================================================
   START MISSION 4
========================================================= */

function startMuseumHideoutMission() {

    if (
        museumGame.finished ||
        museumGame.seconds <= 0
    ) return;

    museumGame.stage = 3;
    museumGame.selectedHideout = null;

    const s = museumGame.scenario;

    prepareMuseumHideoutEvidence();

    museumSetMission(
        3,
        "Find the Hideout",
        "The escape route has been confirmed. Three buildings are located inside the final search area.",
        "Examine the electricity records, CCTV observations and vehicle information. Identify the building where the suspect is hiding."
    );

    museumSetHTML("evidence-documents", `
        <div class="document-card">
            <h4>FINAL CCTV REPORT</h4>

            <p>
                <strong>Expected arrival:</strong>
                ${s.hideoutArrivalTime}
            </p>

            <p>
                <strong>Search radius:</strong>
                180 meters
            </p>

            <p>
                The suspect was driving a van.
                Investigators believe the vehicle
                entered a building near the final
                escape route location.
            </p>
        </div>

        <div class="document-card">
            <h4>BUILDING INVESTIGATION</h4>

            <p>
                All three buildings are inside
                the search radius.
            </p>

            <p>
                Click a building on the map
                to examine its evidence.
            </p>

            <div id="hideout-evidence-details">
                No building selected.
            </div>
        </div>
    `);

    museumSetActions(
        "No building selected. Click a building on the map.",
        "VERIFY HIDEOUT",
        verifyMuseumHideout
    );

    renderMuseumHideoutMap();
}


/* =========================================================
   SHOW BUILDING EVIDENCE
========================================================= */

function showMuseumHideoutEvidence(hideout, index) {

    const evidence = hideout.evidence;

    museumSetHTML("hideout-evidence-details", `
        <div style="
            margin-top:12px;
            padding:12px;
            border:1px solid #6b8ba5;
            border-radius:8px;
        ">

            <h4>
                BUILDING ${index + 1}
            </h4>

            <p>
                <strong>Location:</strong>
                ${hideout.name}
            </p>

            <p>
                <strong>Electricity consumption:</strong>
                ${evidence.electricity}
            </p>

            <p>
                <strong>CCTV observation:</strong>
                ${evidence.camera}
            </p>

            <p>
                <strong>Vehicle arrival:</strong>
                ${evidence.arrival}
            </p>

            <p>
                <strong>Vehicle identification:</strong>
                ${evidence.vehicle}
            </p>

        </div>
    `);
}


/* =========================================================
   RENDER HIDEOUT MAP
========================================================= */

function renderMuseumHideoutMap() {

    const s = museumGame.scenario;
    const layer = museumGame.layer;

    layer.clearLayers();

    const center = s.correctRoute.destination;

    // 180-meter buffer
    L.circle(center, {
        radius: 180,
        color: "#22c55e",
        weight: 3,
        fillColor: "#22c55e",
        fillOpacity: 0.12,
        dashArray: "8,6",
        interactive: false
    }).addTo(layer);

    // Last CCTV location
    L.circleMarker(center, {
        radius: 8,
        color: "#ffffff",
        fillColor: "#22c55e",
        fillOpacity: 1,
        weight: 3
    })
    .addTo(layer)
    .bindTooltip("FINAL CCTV LOCATION");

    const displayedHideouts = [];

    s.hideouts.forEach((hideout, index) => {

        const marker = L.marker(hideout.point, {
            icon: createMuseumHideoutIcon(index + 1),
            zIndexOffset: 1000
        }).addTo(layer);

        
marker.bindTooltip(
    `
    <div style="
        min-width:200px;
        padding:5px;
        font-family:Arial,sans-serif;
        line-height:1.6;
        text-align:left;
    ">
        <div style="
            font-weight:800;
            font-size:13px;
            color:#173e65;
            margin-bottom:5px;
        ">
            BUILDING ${index + 1}
        </div>

        <div><strong>Location:</strong> ${hideout.name}</div>

        <div>
            <strong>Electricity:</strong>
            ${hideout.evidence.electricity}
        </div>

        <div>
            <strong>CCTV:</strong>
            ${hideout.evidence.camera}
        </div>

        <div>
            <strong>Arrival:</strong>
            ${hideout.evidence.arrival}
        </div>

        <div>
            <strong>Vehicle:</strong>
            ${hideout.evidence.vehicle}
        </div>
    </div>
    `,
    {
        permanent: false,
        direction: "top",
        offset: [0, -20],
        opacity: 0.98,
        interactive: false,
        className: "museum-hideout-info"
    }
);


        displayedHideouts.push({
            hideout,
            marker,
            index
        });

        marker.on("click", () => {

            if (
                museumGame.finished ||
                museumGame.stage !== 3
            ) return;

            museumGame.selectedHideout = hideout;

            displayedHideouts.forEach(item => {

                const selected =
                    item.hideout.id === hideout.id;

                item.marker.setIcon(
                    createMuseumHideoutIcon(
                        item.index + 1,
                        selected
                    )
                );

                item.marker.setZIndexOffset(
                    selected ? 1500 : 1000
                );
            });

            showMuseumHideoutEvidence(
                hideout,
                index
            );

            museumUpdateSelection(
                `Selected: Building ${index + 1} — ${hideout.name}`
            );
        });
    });

    const bounds = L.latLngBounds([
        center,
        ...s.hideouts.map(hideout => hideout.point)
    ]);

    museumGame.map.fitBounds(bounds.pad(0.5), {
        padding: [50, 50],
        maxZoom: 17
    });
}


/* =========================================================
   VERIFY HIDEOUT
========================================================= */

function verifyMuseumHideout() {

    if (
        museumGame.finished ||
        museumGame.stage !== 3 ||
        !museumGame.selectedHideout
    ) return;

    const s = museumGame.scenario;

    if (
        museumGame.selectedHideout.id !==
        s.correctHideout.id
    ) {

        museumWrongAnswer(
            "Incorrect hideout. Compare the CCTV arrival time, electricity records and vehicle identification."
        );

        return;
    }

    completeMuseumInvestigation();
}


/* =========================================================
   CASE COMPLETED
========================================================= */

function completeMuseumInvestigation() {

    if (museumGame.finished) return;

    stopMuseumInvestigation();

    museumGame.stage = 4;

    museumSetProgress(4);
    museumSetTimeline(4);
    museumSetEvidenceList(4);

    museumSetText("stage-number", "CASE COMPLETED");

    museumSetText(
        "mission-title",
        "CASE SOLVED"
    );

    museumSetText(
        "mission-description",
        "The suspect's hideout has been identified. Investigators recovered the stolen artifact."
    );

    museumSetText(
        "mission-objective",
        "All four missions have been completed successfully."
    );

    museumSetText(
        "feedback",
        "Excellent detective work! The museum investigation is complete."
    );

    const s = museumGame.scenario;

    museumSetHTML("evidence-documents", `
        <div class="document-card">
            <h4>FINAL INVESTIGATION REPORT</h4>

            <p>
                <strong>Status:</strong> CASE SOLVED
            </p>

            <p>
                <strong>Museum:</strong>
                ${s.museum.name}
            </p>

            <p>
                <strong>Recovered artifact:</strong>
                ${s.museum.artifact}
            </p>

            <p>
                <strong>Hideout:</strong>
                ${s.correctHideout.name}
            </p>

            <p>
                <strong>Time remaining:</strong>
                ${Math.floor(museumGame.seconds / 60)} min
                ${museumGame.seconds % 60} sec
            </p>

            <p>
                <strong>Incorrect answers:</strong>
                ${museumGame.mistakes}
            </p>
        </div>
    `);

    museumSetHTML("mission-actions", `
        <div class="selection-info">
            ✓ ALL FOUR MISSIONS COMPLETED
        </div>
    `);

    // Highlight the recovered artifact location.
    if (museumGame.layer) {

        L.circleMarker(s.correctHideout.point, {
            radius: 14,
            color: "#ffffff",
            fillColor: "#22c55e",
            fillOpacity: 1,
            weight: 4,
            interactive: false
        }).addTo(museumGame.layer);
    }
}

/* =========================================================
   END OF museum.js
========================================================= */
