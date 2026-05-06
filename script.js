// --- GAME STATE ---
let player = {
name: "", origin: "", money: 0, age: 18, week: 1,
stats: { charisma: 0, mediaTraining: 0, songwriting: 0, production: 0, vocals: 0, liveVocals: 0, stagePresence: 0 },
discography: [] // NEW: Stores all released music!
};

let selectedOriginId = null;

// --- ORIGINS AND EVENTS ---
const origins = {
childActor: { title: "Child Actor", desc: "Grew up on TV. Great camera skills, poor music skills.", money: 50000, age: 16, stats: { charisma: 75, mediaTraining: 80, songwriting: 15, production: 10, vocals: 40, liveVocals: 30, stagePresence: 65 } },
bedroomProducer: { title: "Bedroom Producer", desc: "Musical genius, terrified of the spotlight.", money: 2000, age: 18, stats: { charisma: 20, mediaTraining: 10, songwriting: 60, production: 85, vocals: 30, liveVocals: 10, stagePresence: 15 } },
realityTV: { title: "Reality TV Contestant", desc: "Huge voice, instant fame, terrible industry knowledge.", money: 5000, age: 20, stats: { charisma: 60, mediaTraining: 40, songwriting: 20, production: 5, vocals: 85, liveVocals: 70, stagePresence: 50 } },
indieGrinder: { title: "Indie Gig Grinder", desc: "Been playing dive bars for years. You know how to put on a show.", money: 500, age: 24, stats: { charisma: 45, mediaTraining: 20, songwriting: 70, production: 30, vocals: 55, liveVocals: 55, stagePresence: 80 } }
};

const randomEvents = [
{ title: "Paparazzi Ambush!", desc: "A reporter asks a rude question about your ex.", choices: [{ text: "Smile and answer", effect: () => { adjustStat('mediaTraining', 5); } }, { text: "Yell at them", effect: () => { adjustStat('mediaTraining', -10); adjustStat('charisma', 5); } }] },
{ title: "TikTok Trend", desc: "An old demo goes viral.", choices: [{ text: "Do the dance", effect: () => { adjustStat('charisma', 8); player.money += 1500; } }, { text: "Ignore it", effect: () => { adjustStat('mediaTraining', -2); } }] }
];

// --- CORE UI FUNCTIONS ---

function showScreen(screenId) {
document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
document.getElementById(screenId).classList.add('active');
}

function switchTab(tabId, btnElement) {
// Hide all tabs
document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active-tab'));
// Remove selected class from all nav buttons
document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('selected-nav'));

// Show new tab and highlight button
document.getElementById(tabId).classList.add('active-tab');
if (btnElement) btnElement.classList.add('selected-nav');
}

function selectOrigin(originId) {
selectedOriginId = originId;
document.querySelectorAll('.origin-btn').forEach(btn => btn.classList.remove('selected'));
event.target.classList.add('selected');
document.getElementById('origin-description').innerText = origins[originId].desc;
document.getElementById('start-career-btn').disabled = false;
}

function startCareer() {
const nameInput = document.getElementById('artist-name').value;
if (nameInput.trim() === "") return alert("Please enter a stage name!");

const o = origins[selectedOriginId];
player.name = nameInput; player.origin = o.title; player.money = o.money; player.age = o.age; player.week = 1;
player.stats = { ...o.stats };

updateMainUI();
showScreen('game-ui');
}

function updateMainUI() {
document.getElementById('ui-name').innerText = player.name;
document.getElementById('ui-money').innerText = player.money.toLocaleString();
document.getElementById('ui-age').innerText = player.age;
document.getElementById('ui-week').innerText = player.week;

const statsGrid = document.getElementById('stats-grid');
statsGrid.innerHTML = ""; 
const statLabels = { charisma: "Charisma", mediaTraining: "Media", songwriting: "Songwriting", production: "Production", vocals: "Vocals", liveVocals: "Live Vocals", stagePresence: "Stage Presence" };

for (const [key, value] of Object.entries(player.stats)) {
    statsGrid.innerHTML += `<div class="stat-box"><div class="stat-name">${statLabels[key]}</div><div class="stat-value">${value}/100</div></div>`;
}
}

// --- STAT LOGIC (Enforcing the Live Vocals rule) ---

function adjustStat(statName, amount) {
player.stats[statName] += amount;

// Hard caps at 0 and 100
if (player.stats[statName] > 100) player.stats[statName] = 100;
if (player.stats[statName] < 0) player.stats[statName] = 0;

// YOUR RULE: Live Vocals can NEVER be higher than Vocals
if (player.stats.liveVocals > player.stats.vocals) {
    player.stats.liveVocals = player.stats.vocals;
}
}

// --- TRAINING & TOURING ---

function trainSkill(statName, cost) {
if (player.money < cost) {
    alert("You don't have enough money for this training!");
    return;
}

player.money -= cost;
// Increase stat by a random amount between 2 and 5
let increase = Math.floor(Math.random() * 4) + 2; 
adjustStat(statName, increase);

alert(`Training complete! You spent $${cost} and improved ${statName} by ${increase} points.`);
nextWeek(); // Training takes time!
}

function playLocalGig() {
// You earn more if your stage presence is good
let earnings = 100 + (player.stats.stagePresence * 2);
player.money += earnings;

// Improve Live Vocals (and slightly Stage Presence)
let liveVocalIncrease = Math.floor(Math.random() * 3) + 1;
adjustStat('liveVocals', liveVocalIncrease);
adjustStat('stagePresence', 1);

// Provide feedback based on the Live Vocals cap
if (player.stats.liveVocals === player.stats.vocals) {
    alert(`You earned $${earnings}. Your live vocals have peaked based on your current studio vocal ability! Improve your raw vocals to get better live.`);
} else {
    alert(`You earned $${earnings}. Playing live helped your Live Vocals improve!`);
}

nextWeek();
}

// --- TIME AND EVENT ENGINE ---

function nextWeek() {
player.week += 1;
if (player.week > 52) {
    player.week = 1;
    player.age += 1;
    alert("Happy Birthday! You are now " + player.age + " years old.");
}

player.money -= 150; // Weekly living expenses
if (player.money < 0) player.money = 0; 

updateMainUI();

if (Math.random() < 0.15) triggerRandomEvent();
}

function triggerRandomEvent() {
const event = randomEvents[Math.floor(Math.random() * randomEvents.length)];
document.getElementById('event-title').innerText = event.title;
document.getElementById('event-desc').innerText = event.desc;

const choicesContainer = document.getElementById('event-choices');
choicesContainer.innerHTML = ""; 

event.choices.forEach(choice => {
    const btn = document.createElement('button');
    btn.className = "choice-btn";
    btn.innerText = choice.text;
    btn.onclick = () => {
        choice.effect(); 
        document.getElementById('event-modal').classList.remove('active'); 
        updateMainUI(); 
    };
    choicesContainer.appendChild(btn);
});
document.getElementById('event-modal').classList.add('active');
    // --- STUDIO & ALBUM CREATION ---

function goToPhase2() {
const title = document.getElementById('album-title').value;
if (title.trim() === "") return alert("Your album needs a title!");

document.getElementById('studio-phase-1').style.display = 'none';
document.getElementById('studio-phase-2').style.display = 'block';

// Add one empty track by default
if(document.getElementById('tracklist-container').children.length === 0) {
    addTrack();
}
}

function addTrack() {
const container = document.getElementById('tracklist-container');
const trackNum = container.children.length + 1;

const div = document.createElement('div');
div.className = 'track-row';
div.innerHTML = `
    <span>${trackNum}.</span>
    <input type="text" class="track-name" placeholder="Song Name">
    <select class="track-vibe">
        <option value="upbeat">Upbeat</option>
        <option value="ballad">Ballad</option>
        <option value="experimental">Experimental</option>
        <option value="interlude">Interlude</option>
    </select>
    <button onclick="this.parentElement.remove()">X</button>
`;
container.appendChild(div);
}

function goToPhase3() {
const tracks = document.querySelectorAll('.track-row');
if (tracks.length === 0) return alert("You need at least one track!");

document.getElementById('studio-phase-2').style.display = 'none';
document.getElementById('studio-phase-3').style.display = 'block';
}

function releaseAlbum() {
// 1. Check Marketing Mix
const checks = document.querySelectorAll('.promo-check:checked');
if (checks.length !== 3) return alert("The label demands you choose exactly 3 marketing focuses.");

// 2. Gather Album Data
const title = document.getElementById('album-title').value;
const concept = document.getElementById('album-concept').value;

let tracks = [];
document.querySelectorAll('.track-row').forEach(row => {
    tracks.push({
        name: row.querySelector('.track-name').value || "Untitled Track",
        vibe: row.querySelector('.track-vibe').value,
        isSingle: false // Will be used in Step 4!
    });
});

// 3. Calculate Album Quality (Based on stats)
let baseQuality = (player.stats.songwriting + player.stats.production + player.stats.vocals) / 3;
let hypeBonus = (player.stats.charisma + player.stats.mediaTraining) / 10;

// The "Magic" chart formula
let finalScore = Math.floor(baseQuality + hypeBonus + (Math.random() * 15)); 

// 4. Determine Chart Position based on score
let chartPosition = 200;
if (finalScore > 90) chartPosition = Math.floor(Math.random() * 5) + 1; // Top 5!
else if (finalScore > 70) chartPosition = Math.floor(Math.random() * 40) + 10; // Top 50
else if (finalScore > 50) chartPosition = Math.floor(Math.random() * 100) + 50; // Top 150
else chartPosition = "Did Not Chart";

// 5. Save to Discography
player.discography.push({
    title: title,
    concept: concept,
    tracklist: tracks,
    peakChart: chartPosition,
    score: finalScore
});

// 6. Output Result
alert(`🎉 ALBUM RELEASED: "${title}" 🎉\n\nConcept: ${concept || 'None'}\nTracks: ${tracks.length}\n\nBillboard 200 Debut: #${chartPosition}`);

// Reset Studio UI for the next album
document.getElementById('album-title').value = "";
document.getElementById('album-concept').value = "";
document.getElementById('tracklist-container').innerHTML = "";
document.querySelectorAll('.promo-check').forEach(c => c.checked = false);

document.getElementById('studio-phase-3').style.display = 'none';
document.getElementById('studio-phase-1').style.display = 'block';

// Pass time and return to dashboard
player.money += (10000 - (chartPosition === "Did Not Chart" ? 8000 : chartPosition * 20)); // Make money based on charts
nextWeek();
switchTab('tab-dashboard', document.querySelectorAll('.nav-btn')[0]);
}
