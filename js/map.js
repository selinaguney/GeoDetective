
/* =========================================
   GEODETECTIVE — RANDOM MAP ENGINE
========================================= */

let detectiveMap = null;
let investigationLayer = null;
let selectionLayer = null;

const ANKARA_AREAS = [
    { name: "Kızılay", center: [39.9208, 32.8541] },
    { name: "Bahçelievler", center: [39.9250, 32.8265] },
    { name: "Çankaya", center: [39.8915, 32.8580] },
    { name: "Dikmen", center: [39.8840, 32.8350] },
    { name: "Cebeci", center: [39.9250, 32.8750] },
    { name: "Ayrancı", center: [39.9010, 32.8560] }
];

const BUILDING_TYPES = [
    {
        name: "University Research Office",
        category: "academic",
        clue: "academic research",
        description: "University administration and research offices"
    },
    {
        name: "Municipal Records Center",
        category: "municipal",
        clue: "municipal archives",
        description: "Municipal records and public administration"
    },
    {
        name: "Private Research Laboratory",
        category: "laboratory",
        clue: "private laboratory",
        description: "Independent scientific testing facility"
    },
    {
        name: "Historical Library",
        category: "library",
        clue: "historical manuscripts",
        description: "Library and manuscript collections"
    },
    {
        name: "Geospatial Data Center",
        category: "geospatial",
        clue: "geospatial datasets",
        description: "Geographic information and mapping facility"
    },
    {
        name: "Museum Conservation Lab",
        category: "museum",
        clue: "museum restoration",
        description: "Artifact conservation and restoration"
    },
    {
        name: "Environmental Research Center",
        category: "environmental",
        clue: "environmental samples",
        description: "Environmental monitoring and analysis"
    },
    {
        name: "Urban Planning Archive",
        category: "planning",
        clue: "urban planning documents",
        description: "City planning records and development plans"
    }
];

const FINAL_BUILDINGS = [
    "Old Archive",
    "Abandoned Observatory",
    "Underground Records Vault",
    "Historic Storage Hall",
    "Former Surveying Station",
    "Disused Research Annex",
    "Old Communications Building",
    "Historic Map Repository"
];

const DIRECTIONS = [
    { name: "North", east: 0, north: 1 },
    { name: "South", east: 0, north: -1 },
    { name: "East", east: 1, north: 0 },
    { name: "West", east: -1, north: 0 }
];

function randomNumber(min, max) {
    return min + Math.random() * (max - min);
}

function randomInteger(min, max) {
    return Math.floor(randomNumber(min, max + 1));
}

function randomItem(array) {
    return array[randomInteger(0, array.length - 1)];
}

function shuffleArray(array) {
    const result = [...array];

    for (let i = result.length - 1; i > 0; i--) {
        const j = randomInteger(0, i);

        [result[i], result[j]] = [result[j], result[i]];
    }

    return result;
}

function offsetPoint(point, east, north) {
    const lat = point[0];

    return [
        lat + north / 111320,
        point[1] + east /
            (111320 * Math.cos(lat * Math.PI / 180))
    ];
}

function distanceMeters(a, b) {
    const R = 6371000;

    const lat1 = a[0] * Math.PI / 180;
    const lat2 = b[0] * Math.PI / 180;

    const dLat = (b[0] - a[0]) * Math.PI / 180;
    const dLon = (b[1] - a[1]) * Math.PI / 180;

    const h =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(lat1) * Math.cos(lat2) *
        Math.sin(dLon / 2) ** 2;

    return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
}

function timeString(minutes) {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;

    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

/* =========================================
   PROCEDURAL CASE GENERATION
========================================= */

function generateScenario() {

    const area = randomItem(ANKARA_AREAS);

    const center = offsetPoint(
        area.center,
        randomNumber(-180, 180),
        randomNumber(-180, 180)
    );

    /* FIRST MISSION:
       Random building identities and positions */

    const selectedBuildings =
        shuffleArray(BUILDING_TYPES).slice(0, 3);

    const correctBuilding = randomItem(selectedBuildings);

    const firstPositions = shuffleArray([
        offsetPoint(center, -850, -600),
        offsetPoint(center, 850, -450),
        offsetPoint(center, -100, 850)
    ]);

    const firstSites = selectedBuildings.map(
        (building, index) => ({
            ...building,
            id: `building-${index}`,
            point: firstPositions[index]
        })
    );

    const office = firstSites.find(
        site => site.category === correctBuilding.category
    );

    /* SECOND MISSION:
       Randomized coverage circles */

    const signalCenter = offsetPoint(
        center,
        randomNumber(-250, 250),
        randomNumber(-250, 250)
    );

    const towerRadius = randomItem([950, 1050, 1150, 1250]);

    const rotation = randomNumber(0, Math.PI * 2);

    const towers = [0, 1, 2].map(index => {
        const angle = rotation + index * 2 * Math.PI / 3;

        return offsetPoint(
            signalCenter,
            Math.cos(angle) * 650,
            Math.sin(angle) * 650
        );
    });

    /* THIRD MISSION:
       Random target direction and camera records */

    const targetDirection = randomItem(DIRECTIONS);

    const correctCameraPoint = offsetPoint(
        signalCenter,
        targetDirection.east * 800,
        targetDirection.north * 800
    );

    const otherDirections = shuffleArray(
        DIRECTIONS.filter(
            direction => direction.name !== targetDirection.name
        )
    );

    const correctTime = randomItem([19 * 60 + 34, 19 * 60 + 38, 19 * 60 + 40, 19 * 60 + 43]);

    const cameraRecords = shuffleArray([
        {
            id: "correct",
            time: timeString(correctTime),
            direction: targetDirection.name,
            point: correctCameraPoint
        },
        {
            id: "decoy-1",
            time: timeString(correctTime - randomInteger(8, 13)),
            direction: otherDirections[0].name,
            point: offsetPoint(
                signalCenter,
                otherDirections[0].east * 900,
                otherDirections[0].north * 900
            )
        },
        {
            id: "decoy-2",
            time: timeString(correctTime + randomInteger(8, 13)),
            direction: otherDirections[1].name,
            point: offsetPoint(
                signalCenter,
                otherDirections[1].east * 900,
                otherDirections[1].north * 900
            )
        }
    ]).map((camera, index) => ({
        ...camera,
        label: `Camera ${String.fromCharCode(65 + index)}`
    }));

    const correctCamera = cameraRecords.find(
        camera => camera.id === "correct"
    );

    /* FOURTH MISSION:
       Randomized final site and decoys */

    const finalNames = shuffleArray(FINAL_BUILDINGS).slice(0, 3);

    const finalDirection = randomItem(DIRECTIONS);

    const finalPoint = offsetPoint(
        correctCamera.point,
        finalDirection.east * 700 +
            (finalDirection.east === 0 ? 250 : 0),
        finalDirection.north * 700 +
            (finalDirection.north === 0 ? 250 : 0)
    );

    const finalSites = shuffleArray([
        {
            id: "correct",
            name: finalNames[0],
            point: finalPoint
        },
        {
            id: "decoy-1",
            name: finalNames[1],
            point: offsetPoint(
                correctCamera.point,
                2300,
                950
            )
        },
        {
            id: "decoy-2",
            name: finalNames[2],
            point: offsetPoint(
                correctCamera.point,
                -2200,
                -1200
            )
        }
    ]);

    return {
        district: area.name,
        center,
        firstSites,
        correctBuilding: office,
        signalCenter,
        towers,
        towerRadius,
        targetDirection,
        correctTime: timeString(correctTime),
        cameraRecords,
        correctCamera,
        finalSites,
        finalDirection
    };
}

/* =========================================
   LEAFLET INITIALIZATION
========================================= */

function initializeMap() {

    if (!detectiveMap) {

        detectiveMap = L.map("map").setView(
            [39.9208, 32.8541],
            13
        );

        L.tileLayer(
            "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
            {
                attribution: "&copy; OpenStreetMap contributors",
                maxZoom: 19
            }
        ).addTo(detectiveMap);

        investigationLayer = L.layerGroup().addTo(detectiveMap);
        selectionLayer = L.layerGroup().addTo(detectiveMap);

        detectiveMap.on("mousemove", event => {
            displayCoordinates(event.latlng);
        });

        detectiveMap.on("click", event => {
            handleMapClick(event.latlng);
        });
    }

    setTimeout(() => {
        detectiveMap.invalidateSize();
        renderStageMap();
    }, 80);
}

function displayCoordinates(latlng) {
    document.getElementById("map-coordinates").textContent =
        `LAT: ${latlng.lat.toFixed(5)} | LNG: ${latlng.lng.toFixed(5)}`;
}

function showSelectedPoint(point) {

    selectionLayer.clearLayers();

    L.circleMarker(point, {
        radius: 9,
        color: "#ffffff",
        fillColor: "#e9b74e",
        fillOpacity: 1,
        weight: 3
    }).addTo(selectionLayer);
}

function addMarker(point, title, details) {

    const marker = L.marker(point)
        .addTo(investigationLayer)
        .bindPopup(
            `<strong>${title}</strong><p>${details}</p>`
        );

    marker.on("click", () => {
        handleMapClick(L.latLng(point[0], point[1]));
    });

    return marker;
}

/* =========================================
   MISSION MAPS
========================================= */

function renderStageMap() {

    if (!detectiveMap || !gameState.scenario) return;

    investigationLayer.clearLayers();
    selectionLayer.clearLayers();

    const s = gameState.scenario;

    const modes = [
        "Building Investigation",
        "Cell Tower Analysis",
        "CCTV Investigation",
        "Final Search"
    ];

    document.getElementById("map-mode").textContent =
        modes[gameState.stage] || "Investigation Complete";

    if (gameState.stage === 0) {

        s.firstSites.forEach((site, index) => {
            addMarker(
                site.point,
                `Location ${index + 1}`,
                site.name
            );
        });

        detectiveMap.fitBounds(
            s.firstSites.map(site => site.point),
            { padding: [55, 55], maxZoom: 14 }
        );
    }

    else if (gameState.stage === 1) {

        s.towers.forEach((point, index) => {

            L.circle(point, {
                radius: s.towerRadius,
                color: "#d7b779",
                fillColor: "#d7b779",
                fillOpacity: 0.10,
                weight: 2
            }).addTo(investigationLayer);

            L.circleMarker(point, {
                radius: 7,
                color: "#ffffff",
                fillColor: "#d7b779",
                fillOpacity: 1
            }).addTo(investigationLayer)
              .bindPopup(
                  `Tower ${index + 1}<br>Radius: ${s.towerRadius} m`
              );
        });

        detectiveMap.fitBounds(
            s.towers,
            { padding: [100, 100], maxZoom: 14 }
        );
    }

    else if (gameState.stage === 2) {

        s.cameraRecords.forEach(camera => {

            addMarker(
                camera.point,
                camera.label,
                "Surveillance camera location. Review the CCTV recordings."
            );
        });

    detectiveMap.fitBounds(
        s.cameraRecords.map(camera => camera.point),
        { padding: [60, 60], maxZoom: 14 }
    );
}


    else if (gameState.stage === 3) {

        const origin = s.correctCamera.point;

        L.circle(origin, {
            radius: 1500,
            color: "#72b9de",
            fillColor: "#72b9de",
            fillOpacity: 0.07,
            weight: 2
        }).addTo(investigationLayer);

        L.circleMarker(origin, {
            radius: 7,
            color: "#ffffff",
            fillColor: "#72b9de",
            fillOpacity: 1
        }).addTo(investigationLayer)
          .bindPopup("Last confirmed CCTV position");

        s.finalSites.forEach((site, index) => {

            addMarker(
                site.point,
                `Site ${index + 1}`,
                site.name
            );
        });

        detectiveMap.fitBounds(
            [
                origin,
                ...s.finalSites.map(site => site.point)
            ],
            { padding: [55, 55], maxZoom: 14 }
        );
    }
}

/* =========================================
   PLAYER MAP SELECTION
========================================= */

function handleMapClick(latlng) {

    if (!gameState.scenario || gameState.finished) return;

    const point = [latlng.lat, latlng.lng];

    gameState.selectedPoint = point;

    showSelectedPoint(point);
    updateSelectionDisplay();
}
