// --- GAME STATE ---
let player = {
name: "",
origin: "",
money: 0,
stats: {
    charisma: 0,
    mediaTraining: 0,
    songwriting: 0,
    production: 0,
    vocals: 0,
    liveVocals: 0,
    stagePresence: 0
}
};

let selectedOriginId = null;

// --- ORIGIN STORIES DATA ---
const origins = {
childActor: {
    title: "Child Actor",
    desc: "You grew up on TV. You know how to work a camera, but real musicians don't take you seriously yet.",
    money: 50000,
    stats: { charisma: 75, mediaTraining: 80, songwriting: 15, production: 10, vocals: 40, liveVocals: 30, stagePresence: 65 }
},
bedroomProducer: {
    title: "Bedroom Producer",
    desc: "You make crazy beats in your room. You're a musical genius, but you're terrified of the spotlight.",
    money: 2000,
    stats: { charisma: 20, mediaTraining: 10, songwriting: 60, production: 85, vocals: 30, liveVocals: 10, stagePresence: 15 }
},
realityTV: {
    title: "Reality TV Contestant",
    desc: "You came 2nd on a singing show. Huge voice, instant fame, but terrible industry knowledge.",
    money: 5000,
    stats: { charisma: 60, mediaTraining: 40, songwriting: 20, production: 5, vocals: 85, liveVocals: 70, stagePresence: 50 }
},
indieGrinder: {
    title: "Indie Gig Grinder",
    desc: "You've been playing dive bars for years. You know how to put on a show and write a song, but you're broke.",
    money: 500,
    stats: { charisma: 45, mediaTraining: 20, songwriting: 70, production: 30, vocals: 55, liveVocals: 65, stagePresence: 80 }
}
};

// --- CORE FUNCTIONS ---

// Switches between HTML screens
function showScreen(screenId) {
document.querySelectorAll('.screen').forEach(screen => {
    screen.classList.remove('active');
});
document.getElementById(screenId).classList.add('active');
}

// Handles selecting an origin during creation
function selectOrigin(originId) {
selectedOriginId = originId;

// Update UI buttons
document.querySelectorAll('.origin-btn').forEach(btn => btn.classList.remove('selected'));
event.target.classList.add('selected');

// Show description
document.getElementById('origin-description').innerText = origins[originId].desc;

// Enable Start button
document.getElementById('start-career-btn').disabled = false;
}

// Finalizes character and starts game
function startCareer() {
const nameInput = document.getElementById('artist-name').value;
if (nameInput.trim() === "") {
    alert("Please enter a stage name!");
    return;
}

// Set player data based on origin
const originData = origins[selectedOriginId];
player.name = nameInput;
player.origin = originData.title;
player.money = originData.money;

// Copy stats over
player.stats = { ...originData.stats };

updateMainUI();
showScreen('main-screen');
}

// Refreshes the main dashboard with current stats
function updateMainUI() {
document.getElementById('ui-name').innerText = player.name;
// Format money with commas
document.getElementById('ui-money').innerText = player.money.toLocaleString();

// Generate Stats Grid
const statsGrid = document.getElementById('stats-grid');
statsGrid.innerHTML = ""; // Clear old stats

const statLabels = {
    charisma: "Charisma",
    mediaTraining: "Media",
    songwriting: "Songwriting",
    production: "Production",
    vocals: "Vocals",
    liveVocals: "Live Vocals",
    stagePresence: "Stage Presence"
};

for (const [key, value] of Object.entries(player.stats)) {
    const statBox = document.createElement('div');
    statBox.className = 'stat-box';
    statBox.innerHTML = `
        <div class="stat-name">${statLabels[key]}</div>
        <div class="stat-value">${value}/100</div>
    `;
    statsGrid.appendChild(statBox);
}
}
