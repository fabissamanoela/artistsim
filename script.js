// --- SAVE & LOAD SYSTEM ---
window.onload = () => {
if (localStorage.getItem('popstar_save')) {
    document.getElementById('continue-btn').style.display = 'block';
}
};

function saveGame() {
localStorage.setItem('popstar_save', JSON.stringify(player));
alert("💾 Game Saved Successfully! You can safely close the app.");
}

function loadGame() {
let savedData = localStorage.getItem('popstar_save');
if (savedData) {
    player = JSON.parse(savedData);
    updateMainUI();
    showScreen('game-ui');
}
// --- GAME STATE & DATA ---
let player = {
name: "", origin: "", money: 0, age: 18, week: 1, totalWeeks: 1,
stats: { charisma: 0, mediaTraining: 0, songwriting: 0, production: 0, vocals: 0, liveVocals: 0, stagePresence: 0 },
label: null, labelRelationship: 50,
discography: [], pendingReleases: [], activeReleases: []
};

let selectedOriginId = null;
let selectedLabelId = null;
let currentProject = {}; 
let currentTour = {}; // NEW: Holds tour data

const origins = {
childActor: { title: "Child Actor", money: 50000, stats: { charisma: 75, mediaTraining: 80, songwriting: 15, production: 10, vocals: 40, liveVocals: 30, stagePresence: 65 } },
bedroomProducer: { title: "Bedroom Producer", money: 2000, stats: { charisma: 20, mediaTraining: 10, songwriting: 60, production: 85, vocals: 30, liveVocals: 10, stagePresence: 15 } },
realityTV: { title: "Reality TV", money: 5000, stats: { charisma: 60, mediaTraining: 40, songwriting: 20, production: 5, vocals: 85, liveVocals: 70, stagePresence: 50 } },
indieGrinder: { title: "Indie Grinder", money: 500, stats: { charisma: 45, mediaTraining: 20, songwriting: 70, production: 30, vocals: 55, liveVocals: 55, stagePresence: 80 } }
};

const labels = {
megaCorp: { name: "MegaCorp Records", desc: "Huge budgets, extreme control.", control: 8, promoMultiplier: 50000, minScore: 7 },
trendsetters: { name: "Trendsetters", desc: "Moderate budget, balanced control.", control: 5, promoMultiplier: 25000, minScore: 5 },
basementIndie: { name: "Basement Indie", desc: "Low budget, total freedom.", control: 2, promoMultiplier: 5000, minScore: 2 }
};

// --- SETUP UI ---
function showScreen(id) { document.querySelectorAll('.screen').forEach(s => s.classList.remove('active')); document.getElementById(id).classList.add('active'); }
function switchTab(id, btn) { document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active-tab')); document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('selected-nav')); document.getElementById(id).classList.add('active-tab'); if(btn) btn.classList.add('selected-nav'); }
function selectOrigin(id) { selectedOriginId = id; document.querySelectorAll('.origin-btn').forEach(b => b.classList.remove('selected')); event.target.classList.add('selected'); document.getElementById('to-label-btn').disabled = false; }

function goToLabelSelection() {
if (!document.getElementById('artist-name').value) return alert("Enter a name!");
if (parseInt(document.getElementById('artist-age').value) < 14) return alert("Min age is 14!");
const container = document.getElementById('label-options');
container.innerHTML = "";
for (const [key, label] of Object.entries(labels)) {
    container.innerHTML += `<div class="label-card" id="card-${key}"><h4>${label.name}</h4><p>${label.desc}</p><p>Control: ${label.control}/10 | Min Quality: ${label.minScore}/10</p><button class="action-btn" style="margin-top:10px; padding:10px;" onclick="selectLabel('${key}')">Tap to Select</button></div>`;
}
showScreen('label-screen');
}

function selectLabel(id) { selectedLabelId = id; document.querySelectorAll('.label-card').forEach(c => c.classList.remove('selected')); document.getElementById(`card-${id}`).classList.add('selected'); document.getElementById('start-career-btn').disabled = false; }

function startCareer() {
const o = origins[selectedOriginId];
player.name = document.getElementById('artist-name').value;
player.age = parseInt(document.getElementById('artist-age').value);
player.origin = o.title; player.money = o.money; player.stats = { ...o.stats }; player.label = labels[selectedLabelId];
updateMainUI(); showScreen('game-ui');
}

function updateMainUI() {
document.getElementById('ui-name').innerText = player.name; document.getElementById('ui-money').innerText = player.money.toLocaleString(); document.getElementById('ui-age').innerText = player.age; document.getElementById('ui-week').innerText = player.week; document.getElementById('ui-label-name').innerText = player.label.name; document.getElementById('ui-relationship').innerText = player.labelRelationship;
const grid = document.getElementById('stats-grid'); grid.innerHTML = "";
const L = { charisma: "Charisma", mediaTraining: "Media", songwriting: "Songwriting", production: "Production", vocals: "Vocals", liveVocals: "Live Vocals", stagePresence: "Stage" };
for (const [k, v] of Object.entries(player.stats)) grid.innerHTML += `<div class="stat-box"><div class="stat-name">${L[k]}</div><div class="stat-value">${v}/100</div></div>`;
}

// --- STUDIO UI ---
// --- STUDIO UI ---

// Shows/Hides the vibe selector based on project type
function toggleProjectType() {
const type = document.getElementById('project-type').value;
document.getElementById('single-vibe-group').style.display = (type === 'single') ? 'block' : 'none';
}

function goToPhase2() {
const title = document.getElementById('album-title').value; 
const type = document.getElementById('project-type').value;
if (!title) return alert("Title required!");

currentProject = { title, type, tracks: [], hype: 0, budget: 0 };
document.getElementById('studio-phase-1').style.display = 'none';

if (type === 'single') {
    // Automatically create a 1-song tracklist for singles with the chosen vibe!
    const vibe = document.getElementById('single-vibe').value;
    currentProject.tracks.push({ name: title, vibe: vibe, isSingle: true });
    submitToLabel(); 
} else {
    document.getElementById('studio-phase-2').style.display = 'block';
    if(document.getElementById('tracklist-container').children.length === 0) addTrack();
}
}

function addTrack() {
const div = document.createElement('div'); div.className = 'track-row';
div.innerHTML = `<input type="text" class="track-name" placeholder="Song Name" style="flex-grow:1; padding:8px;"><select class="track-vibe"><option value="upbeat">Upbeat</option><option value="ballad">Ballad</option><option value="interlude">Interlude</option><option value="experimental">Experimental</option></select><button onclick="this.parentElement.remove()">X</button>`;
document.getElementById('tracklist-container').appendChild(div);
}

function addExistingSingle() {
// Find standalone singles that haven't been put on an album yet
let availableSingles = player.discography.filter(d => d.type === 'single' && !d.includedInAlbum);
if (availableSingles.length === 0) return alert("You have no available standalone singles to add!");

const div = document.createElement('div'); div.className = 'track-row';

// Create dropdown options
let options = availableSingles.map(s => {
    let vibe = (s.tracks && s.tracks[0]) ? s.tracks[0].vibe : 'upbeat';
    return `<option value="${s.title}" data-vibe="${vibe}">${s.title}</option>`;
}).join('');

// Inject a special row where the input is a select dropdown
div.innerHTML = `
    <select class="track-name" style="flex-grow:1; padding:8px; border-radius:5px; border:1px solid #ddd;" onchange="this.nextElementSibling.value = this.options[this.selectedIndex].dataset.vibe">
        ${options}
    </select>
    <select class="track-vibe" disabled style="background:#eee; padding:8px; border-radius:5px; border:1px solid #ddd;">
        <option value="upbeat">Upbeat</option>
        <option value="ballad">Ballad</option>
        <option value="experimental">Experimental</option>
    </select>
    <button onclick="this.parentElement.remove()">X</button>
`;
document.getElementById('tracklist-container').appendChild(div);

// Trigger the change event instantly to set the initial vibe lock
div.querySelector('.track-name').dispatchEvent(new Event('change'));
}

function submitToLabel() {
if (currentProject.type === 'album') {
    const rows = document.querySelectorAll('.track-row'); if (rows.length === 0) return alert("Need tracks!");
    rows.forEach(r => {
        let inputEl = r.querySelector('.track-name');
        currentProject.tracks.push({ 
            name: inputEl.value || "Track", 
            vibe: r.querySelector('.track-vibe').value, 
            isSingle: inputEl.tagName === 'SELECT' // If it's a dropdown, it's an existing single!
        });
    });
}

let rawQ = (player.stats.songwriting + player.stats.production + player.stats.vocals) / 3;
let execScore = Math.floor(rawQ / 10); currentProject.quality = rawQ;
document.getElementById('studio-phase-2').style.display = 'none'; document.getElementById('studio-phase-3').style.display = 'block';

if (execScore < player.label.minScore) {
    player.labelRelationship = Math.max(0, player.labelRelationship - 10);
    document.getElementById('exec-feedback').innerHTML = `<span style="color:red">Execs rated it ${execScore}/10. Rejected! (Rel -10)</span>`;
    document.getElementById('promo-section').style.display = "none"; document.getElementById('scrap-btn').style.display = "block";
} else {
    player.labelRelationship = Math.min(100, player.labelRelationship + 5);
    currentProject.budget = player.label.promoMultiplier * (execScore || 1);
    document.getElementById('exec-feedback').innerHTML = `<span style="color:green">Approved! Score: ${execScore}/10. Budget: $${currentProject.budget.toLocaleString()}</span>`;
    document.getElementById('ui-promo-budget').innerText = currentProject.budget.toLocaleString(); document.getElementById('ui-hype-built').innerText = "0";
    document.getElementById('promo-section').style.display = "block"; document.getElementById('scrap-btn').style.display = "none";
}
}

function scheduleRelease() {
currentProject.releaseWeek = player.totalWeeks + parseInt(document.getElementById('release-delay').value);

// If this is an album, find any existing singles we attached and mark them as "included in an album"
if (currentProject.type === 'album') {
    currentProject.tracks.forEach(t => {
        let existing = player.discography.find(d => d.type === 'single' && d.title === t.name);
        if (existing) existing.includedInAlbum = true;
    });
}

player.pendingReleases.push(currentProject); 
alert(`Scheduled! "${currentProject.title}" will drop soon.`); 
resetStudio(); 
switchTab('tab-dashboard', document.querySelectorAll('.nav-btn')[0]);
}

// --- TOUR ENGINE (NEW) ---

// Gets all unique songs the player has ever released
function getAllReleasedSongs() {
let songs = [];
player.discography.forEach(release => {
    if (release.type === 'single') {
        if (!songs.some(s => s.name === release.title)) songs.push({ name: release.title, album: "Single" });
    } else if (release.type === 'album') {
        release.tracklist.forEach(track => {
            if (track.vibe !== 'interlude' && !songs.some(s => s.name === track.name)) {
                songs.push({ name: track.name, album: release.title });
            }
        });
    }
});
return songs;
}

function setupTour(type) {
const songs = getAllReleasedSongs();
if (songs.length < 10) return alert(`You only have ${songs.length} released songs! You need at least 10 to tour.`);

currentTour.type = type;
currentTour.weeks = type === 'national' ? 4 : 10;

// Populate Album Promo Dropdown
const select = document.getElementById('tour-promo-album');
select.innerHTML = `<option value="none">Just promoting myself (Blank Setlist)</option>`;
player.discography.filter(d => d.type === 'album').forEach(album => {
    select.innerHTML += `<option value="${album.title}">${album.title}</option>`;
});

document.getElementById('tour-phase-1').style.display = 'none';
document.getElementById('tour-phase-2').style.display = 'block';
}

function goToSetlistBuilder() {
currentTour.name = document.getElementById('tour-name').value || "The Untitled Tour";
currentTour.promoAlbum = document.getElementById('tour-promo-album').value;

const container = document.getElementById('setlist-container');
container.innerHTML =
