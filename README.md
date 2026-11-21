# GeoDetective
A time-based interactive Web GIS detective game.
# 🕵️ GeoDetective

**GeoDetective** is an interactive, web-based geographic detective game that combines mystery-solving with Geographic Information Systems (GIS).

Players investigate cases, explore interactive maps, analyze spatial evidence, and solve location-based puzzles before time runs out.

## 🎮 Game Cases

### Case 1 — The Missing Professor
Investigate the disappearance of a professor in Ankara using geographic clues and interactive map exploration.

### Case 2 — Midnight at the Museum
Solve a museum theft by investigating security cameras, identifying suspects, and analyzing escape routes.

**Key features:**
- Interactive security camera investigation
- Suspect identification
- Escape route analysis
- Timed missions

### Case 3 — The Coordinate Cipher
Follow the clues left by a missing researcher and solve four geographic challenges across Türkiye.

**Mission 1 — The Hidden Coordinates**
Convert geographic coordinates from Degrees, Minutes, and Seconds (DMS) to Decimal Degrees (DD).

**Mission 2 — The Distance Cipher**
Analyze distances from three reference locations and identify the correct candidate.

**Mission 3 — The Overlay Puzzle**
Use spatial overlay analysis to identify a location inside the search and forest areas but outside the restricted zone.

**Mission 4 — The Final Cipher**
Analyze three types of evidence using an interactive network:

- **SIGNAL:** Distance from the communication tower
- **TERRAIN:** Elevation constraints
- **TIMELINE:** Travel distance based on speed and available time

Connect evidence nodes to matching candidates and identify the final location.

**Key features:**
- Randomly generated geographic scenarios
- Interactive Leaflet maps
- Distance calculations using Turf.js
- Spatial overlay analysis
- Chart.js distance visualization
- D3.js interactive evidence network
- Randomized signal, terrain, and timeline constraints
- Six-minute countdown
- Four progressive missions

## 🛠️ Technologies

- **HTML5** — Page structure
- **CSS3** — Interface design
- **JavaScript** — Game logic and interactions
- **Leaflet.js** — Interactive maps
- **Turf.js** — Spatial calculations and geographic analysis
- **Chart.js** — Data visualization
- **D3.js** — Interactive evidence networks
- **OpenStreetMap** — Map tiles

## 🚀 How to Run

1. Clone the repository.
2. Open the project folder in Visual Studio Code.
3. Run the project using the Live Server extension.
4. Open the game in your browser.
5. Select a case and start investigating.

```bash
git clone https://github.com/selinaguney/GeoDetective.git
```

## 🎯 Project Objectives

GeoDetective aims to demonstrate how Web GIS technologies can be integrated into interactive games to support spatial reasoning, geographic problem-solving, and map-based decision-making.

## 📚 Academic Project

Developed as part of the **GMT458 — Internet-Based GIS** course at Hacettepe University, Department of Geomatics Engineering.

## 👩‍💻 Developer

Selina Güney

**GitHub:** https://github.com/selinaguneygit # 🕵️ GeoDetective — Traces of Time

**An Interactive Web GIS Detective Game**

GeoDetective is a browser-based geographic investigation game developed for **GMT 458 – Internet-Based Geographic Information Systems** at Hacettepe University, Department of Geomatics Engineering.

The game combines detective storytelling, interactive maps, spatial reasoning, and geographic analysis. Players investigate mysterious cases by examining evidence, interpreting spatial information, and solving location-based puzzles before time runs out.

**Play the Game:** https://selinaguney.github.io/GeoDetective/

**GitHub Repository:** https://github.com/selinaguney/GeoDetective

---

## 1. Game Description

### 1.1 Game Concept

GeoDetective is a detective-themed educational Web GIS game where geographic information is essential to solving investigations.

Players must use spatial clues rather than relying only on traditional detective reasoning.

The game consists of three investigation cases with different stories, difficulty levels, and geographic challenges.

Each case includes four missions that must be completed in sequence.

### 1.2 Main Objectives

The main objectives of GeoDetective are to:

- Demonstrate the use of geographic information in interactive web applications.
- Improve spatial reasoning and map interpretation skills.
- Introduce players to geographic concepts through gameplay.
- Combine GIS technologies with interactive storytelling.
- Create a responsive, accessible, and engaging browser-based game.

### 1.3 Target Audience

GeoDetective is designed for students, geography enthusiasts, GIS beginners, and players interested in detective games.

The game is particularly suitable for introducing Web GIS concepts through practical, interactive challenges.

---

## 2. Functional Requirements

The game was designed around the following functional requirements:

| ID | Requirement | Description |
|---|---|---|
| FR-01 | Case Selection | Players can explore investigation cases from the main menu. |
| FR-02 | Interactive Case Cards | Case cards flip to display descriptions, difficulty levels, and time limits. |
| FR-03 | Investigation Start | Players can start an available investigation. |
| FR-04 | Interactive Map | Players interact with geographic locations using Leaflet. |
| FR-05 | Mission Progression | Each case contains four sequential missions. |
| FR-06 | Evidence Analysis | Players interpret documents, geographic clues, and spatial information. |
| FR-07 | Answer Verification | The game evaluates player decisions and provides feedback. |
| FR-08 | Countdown Timer | Each investigation has a predefined time limit. |
| FR-09 | Progress Tracking | A progress indicator displays completed missions. |
| FR-10 | Case Completion | Players complete an investigation by solving its final mission. |
| FR-11 | Restart | Players can retry an investigation after failure. |
| FR-12 | Main Menu Navigation | Players can return to the main menu. |
| FR-13 | Dynamic Scenarios | The Coordinate Cipher generates randomized geographic challenges. |

---

## 3. Game Cases and Progression

### Case 1 — The Missing Professor

**Difficulty:** Medium  
**Time Limit:** 3 minutes  
**Number of Missions:** 4  
**Study Area:** Ankara, Türkiye

A professor has mysteriously disappeared. The player must investigate geographic clues and reconstruct the professor's movements.

The investigation involves examining records, interpreting phone signal information, analyzing CCTV evidence, and identifying the professor's location.

**Gameplay objectives:**

- Examine evidence related to the disappearance.
- Interpret geographic information and map locations.
- Analyze surveillance and movement clues.
- Identify the correct location to complete the investigation.

### Case 2 — Midnight at the Museum

**Difficulty:** Medium  
**Time Limit:** 4 minutes  
**Number of Missions:** 4

A valuable museum artifact has disappeared. The player must investigate the theft by examining security cameras, identifying suspects, and analyzing possible escape routes.

**Mission 1 — Security Camera Investigation**

Players examine security camera locations and their viewing directions to identify a surveillance blind spot.

**Mission 2 — Suspect Analysis**

Players compare suspect information and identify the individual associated with the theft.

**Mission 3 — Escape Route Investigation**

Players examine possible escape routes and use spatial clues to determine the relevant route.

**Mission 4 — Final Location**

Players combine the collected evidence to locate the thief's hideout.

The case emphasizes visual map interpretation, spatial relationships, and evidence-based decisions.

### Case 3 — The Coordinate Cipher

**Difficulty:** Hard  
**Time Limit:** 6 minutes  
**Number of Missions:** 4  
**Study Area:** Türkiye

The Coordinate Cipher is the most advanced case in GeoDetective. It combines coordinate calculations, distance analysis, spatial overlay, and interactive evidence networks.

Unlike the other cases, geographic scenarios and candidate locations are generated dynamically.

**Mission 1 — The Hidden Coordinates**

Players receive coordinates in Degrees, Minutes, and Seconds (DMS) format.

They must convert the coordinates into decimal degrees using:

\[
DD = D + \frac{M}{60} + \frac{S}{3600}
\]

The game checks the entered coordinates against the generated target location.

**Mission 2 — The Distance Cipher**

Players reveal three distance clues associated with geographic reference points.

Distance circles are displayed on the map, and a Chart.js visualization presents the measurements.

Players compare three candidate locations and identify the candidate consistent with all three distances.

**Mission 3 — The Overlay Puzzle**

Players analyze three geographic layers:

- Search Area
- Forest Area
- Restricted Zone

The correct candidate must be inside both the search and forest areas while remaining outside the restricted zone.

The spatial condition is:

**Valid Location = Search Area ∩ Forest Area − Restricted Zone**

Turf.js is used to evaluate geographic relationships and point-in-polygon conditions.

**Mission 4 — The Final Cipher**

Players investigate three possible hideouts using an interactive D3.js evidence network.

The available evidence consists of:

- **SIGNAL:** Maximum permitted distance from a communication tower.
- **TERRAIN:** Required elevation interval.
- **TIMELINE:** Maximum travel distance based on speed and available time.

Players connect evidence nodes to all candidates satisfying the corresponding conditions.

After analyzing the connections, they must identify the correct final location.

Elevation values in this mission are simulated gameplay data rather than measured terrain elevations.

---

## 4. Game Rules and Mechanics

### 4.1 Time System

Each case has a countdown timer.

| Case | Difficulty | Time Limit | Missions |
|---|---|---|---|
| The Missing Professor | Medium | 3 minutes | 4 |
| Midnight at the Museum | Medium | 4 minutes | 4 |
| The Coordinate Cipher | Hard | 6 minutes | 4 |

The countdown begins when the investigation starts.

Players must complete the required missions before the timer expires.

If time runs out, the investigation fails.

### 4.2 Mission Progression

Each investigation consists of four missions.

The interface displays the current mission, evidence, objectives, and overall progress.

Progress is represented using a four-stage indicator.

In the Coordinate Cipher, players continue to the next mission after completing the current one.

### 4.3 Lives and Scoring

The primary performance measure is successful completion within the time limit.

The Coordinate Cipher does not use a traditional lives system or numerical score. Incorrect answers provide feedback and allow players to reconsider their decisions while the countdown continues.

The main objective is to complete all four missions before time expires.

No global leaderboard or high-score database is implemented for the Coordinate Cipher.

### 4.4 Randomization

The Coordinate Cipher generates new scenarios when an investigation starts.

Randomized elements include geographic coordinates, reference locations, candidate locations, signal limits, elevation requirements, and travel conditions.

The game uses geographic validation to ensure generated locations satisfy the relevant spatial constraints.

---

## 5. Frontend Design and Screenshots

GeoDetective uses a detective-themed interface with a dark navy background, gold accents, interactive case cards, and map-based investigation panels.

The layout is designed to keep geographic information and investigation evidence visible together.

### 5.1 Main Menu

![GeoDetective Main Menu](screenshots/main-menu.png)

The main menu introduces the game and displays three interactive investigation cards.

### 5.2 Case Details

![GeoDetective Case Details](screenshots/case-details.png)

Flipping a case card reveals its description, difficulty level, time limit, and investigation button.

### 5.3 Case 1 — The Missing Professor

![The Missing Professor](screenshots/case1.png)

The investigation interface includes an interactive map, mission objectives, evidence documents, a countdown timer, and a progress indicator.

### 5.4 Case 2 — Midnight at the Museum

![Midnight at the Museum](screenshots/case2.png)

The museum investigation uses interactive camera markers and viewing sectors to support spatial reasoning and surveillance analysis.

### 5.5 Interface Structure

The main investigation screen is organized into:

1. **Top Navigation:** Case title, countdown timer, and return button.
2. **Interactive Map:** Geographic locations, markers, layers, and spatial clues.
3. **Investigation Panel:** Mission descriptions, objectives, and evidence.
4. **Mission Actions:** Interactive controls for completing the current challenge.
5. **Evidence Board:** Progress indicators and completed investigation stages.

---

## 6. Technologies and Libraries

GeoDetective was developed using HTML, CSS, and JavaScript.

| Technology | Purpose |
|---|---|
| HTML5 | Structure of the game interface |
| CSS3 | Layout, visual design, animations, and responsive styling |
| JavaScript | Game logic, interactions, state management, and mission progression |
| Leaflet.js | Interactive web maps, markers, circles, and geographic layers |
| Turf.js | Spatial calculations, buffers, distances, and point-in-polygon analysis |
| Chart.js | Visualization of geographic distance clues |
| D3.js | Interactive evidence network visualization |
| GeoJSON | Representation of geographic boundaries |
| OpenStreetMap | Basemap tiles |
| Git | Version control |
| GitHub | Source code hosting |
| GitHub Pages | Online deployment |

### 6.1 Geographic Data

**OpenStreetMap**

OpenStreetMap provides the geographic basemap used in the investigation interface.

Website: https://www.openstreetmap.org/

**GeoJSON Boundary**

The Coordinate Cipher uses a Türkiye boundary GeoJSON file stored at:

`data/turkey-boundary.geojson`

This boundary is used to validate generated geographic locations.

**Simulated Scenario Data**

Some game elements, including fictional investigation evidence and elevation values, are generated for gameplay.

These values should not be interpreted as authoritative geographic measurements.

---

## 7. Project Structure

```text
GeoDetective/
├── css/
│   └── style.css
├── data/
│   ├── cases.json
│   └── turkey-boundary.geojson
├── img/
├── js/
│   ├── cipher.js
│   ├── game.js
│   ├── main.js
│   ├── map.js
│   └── museum.js
├── screenshots/
│   ├── main-menu.png
│   ├── case-details.png
│   ├── case1.png
│   └── case2.png
├── index.html
└── README.md
```

### Main Files

**index.html**

Defines the main menu, investigation screen, map container, evidence panel, and JavaScript dependencies.

**css/style.css**

Defines the visual appearance of the game, including cards, buttons, panels, and investigation layouts.

**js/main.js**

Controls the main menu, case selection, card flipping, and navigation between investigations.

**js/game.js**

Implements the gameplay logic for The Missing Professor.

**js/museum.js**

Implements the museum investigation, including security camera analysis and suspect-related interactions.

**js/cipher.js**

Implements the Coordinate Cipher, including coordinate conversion, distance analysis, spatial overlay, scenario generation, and D3.js evidence connections.

**js/map.js**

Contains mapping functionality used by the game.

---

## 8. JavaScript Implementation

### 8.1 Event Handler Example 1 — Button Click

In the Coordinate Cipher, the Verify Coordinates button is connected to an event handler:

```javascript
cipherEl("cipher-verify").addEventListener(
    "click",
    verifyCipherCoordinates
);
```

When the player clicks the button, the game reads the coordinate inputs and checks whether they correspond to the target location.

This demonstrates event-driven interaction between HTML elements and JavaScript game logic.

### 8.2 Event Handler Example 2 — Leaflet Marker Click

Candidate markers respond to player selections:

```javascript
cipherMarker(
    candidate.point,
    candidate.label,
    "#e2e8f0"
)
.on("click", () => {
    selectCipherCandidate(index);
});
```

When a player clicks a candidate marker, the associated candidate is selected for analysis.

This demonstrates interaction with geographic objects on an interactive map.

### 8.3 Event Handler Example 3 — Checkbox Change

In the spatial overlay mission, players can control layer visibility:

```javascript
.addEventListener("change", event => {
    if (event.target.checked) {
        cipherGame.layer.addLayer(layer);
    } else {
        cipherGame.layer.removeLayer(layer);
    }
});
```

This event handler allows the player to show or hide a geographic layer.

It demonstrates dynamic map manipulation based on user input.

### 8.4 JavaScript Closures

Closures are used in the game's event-driven architecture.

For example:

```javascript
mission.candidates.forEach(
    (candidate, index) => {
        cipherMarker(
            candidate.point,
            candidate.label,
            "#e2e8f0"
        ).on("click", () => {
            selectCipherCandidate(index);
        });
    }
);
```

The arrow function registered as a click handler retains access to the `index` variable from its surrounding scope.

Even after the surrounding iteration finishes, the event handler can still use the correct candidate index when the marker is clicked.

This is an example of a JavaScript closure.

### 8.5 DOM Manipulation

GeoDetective dynamically updates the HTML interface using JavaScript.

**Updating text content:**

```javascript
function cipherSet(id, value) {
    const element = document.getElementById(id);

    if (element) {
        element.textContent = value;
    }
}
```

**Updating HTML content:**

```javascript
function cipherHTML(id, html) {
    const element = document.getElementById(id);

    if (element) {
        element.innerHTML = html;
    }
}
```

**Creating a new element:**

```javascript
const clue = document.createElement("div");

clue.className = "document-card";
```

These operations allow mission objectives, evidence, controls, and feedback to change without reloading the webpage.

---

## 9. Development Process

### 9.1 Planning

The project began with the idea of combining geographic reasoning with detective storytelling.

Three cases were designed to introduce different geographic investigation methods.

### 9.2 Interface Development

The frontend was implemented using HTML, CSS, and JavaScript.

Interactive case cards, navigation controls, map containers, and investigation panels were developed.

### 9.3 Geographic Functionality

Leaflet was integrated to provide interactive maps.

Geographic operations were implemented using Turf.js, while Chart.js and D3.js were used for data visualization and evidence analysis.

### 9.4 Gameplay Development

Mission progression, timers, answer verification, feedback messages, and randomized scenarios were implemented.

### 9.5 Testing and Improvements

The game was tested locally using Live Server and deployed through GitHub Pages.

During development, issues involving navigation, map initialization, button behavior, mission progression, and timer consistency were addressed.

---

## 10. AI-Assisted Learning

ChatGPT was used as a learning and development assistant during the project.

AI assistance supported:

- Understanding JavaScript concepts and event-driven programming.
- Learning how to structure interactive Web GIS applications.
- Exploring approaches for integrating Leaflet, Turf.js, Chart.js, and D3.js.
- Debugging errors and improving mission progression.
- Reviewing game logic and user interactions.
- Improving the organization and documentation of the project.

The AI-generated suggestions were reviewed, adapted, and tested during development.

The project also provided practical experience in understanding and modifying JavaScript code, debugging browser-based applications, and integrating multiple geographic visualization libraries.

---

## 11. Installation and Running the Game

### Option 1 — Play Online

Open:

https://selinaguney.github.io/GeoDetective/

### Option 2 — Run Locally

1. Clone the repository:

```bash
git clone https://github.com/selinaguney/GeoDetective.git
```

2. Open the project folder in Visual Studio Code.

3. Start a local web server using the Live Server extension.

4. Open the local URL provided by Live Server.

A local web server is recommended because the game loads geographic data using JavaScript `fetch()` requests.

---

## 12. Version Control and Deployment

Git was used to track development changes throughout the project.

GitHub was used to store and manage the source code.

GitHub Pages was used to publish the game online so that it can be accessed directly through a web browser.

**Repository:** https://github.com/selinaguney/GeoDetective

**Live Application:** https://selinaguney.github.io/GeoDetective/

---

## 13. Future Improvements

Potential improvements include:

- Additional investigation cases and geographic challenges.
- More advanced spatial analysis tasks.
- A numerical scoring and leaderboard system.
- Additional geographic datasets and real-world terrain information.
- More detailed investigation animations.
- Expanded mobile interface support.
- Additional difficulty settings.

---

## 14. Conclusion

GeoDetective demonstrates how Web GIS technologies can be combined with interactive storytelling and game development.

The project integrates geographic visualization, spatial analysis, event-driven programming, and dynamic user interfaces into a single browser-based application.

Through three investigation cases, players use geographic information to solve problems and complete detective missions.

The project highlights the educational potential of interactive geographic games and provides practical experience with modern web mapping technologies.

---

## 15. Project Information

**Project:** GeoDetective — Traces of Time

**Course:** GMT 458 — Internet-Based Geographic Information Systems

**Department:** Geomatics Engineering

**University:** Hacettepe University

**Academic Year:** 2026–2027

**Developer:** Selina Güney

**GitHub:** https://github.com/selinaguney/GeoDetective

**Game:** https://selinaguney.github.io/GeoDetective/