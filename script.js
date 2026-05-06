### 2. The Complete `script.js`
Copy this entire block and replace everything in `script.js`. (I fixed the variables so Albums, Singles, and Tours all play perfectly together).

```javascript
// --- SAVE & LOAD SYSTEM ---
window.onload = () => {
if (localStorage.getItem('popstar_save')) {
    document.getElementById('continue-btn').style.display = 'block';
}
};

function saveGame() {
localStorage.setItem('popstar_save', JSON.stringify(player));
alert("💾 Game Saved! You can safely close the app.");
}

function loadGame() {
let savedData = localStorage.getItem('popstar_save');
if (savedData) {
    player = JSON.parse(savedData);
    updateMainUI();
    showScreen('game-ui');
}
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
let currentTour = {};

const origins = {
childActor: { title: "Child Actor", money: 50000, stats: { charisma: 75, mediaTraining: 80, songwriting: 15, production: 10, vocals: 40, liveVocals: 30, stagePresence: 65 } },
bedroomProducer: { title: "Bedroom Producer", money: 2000, stats: { charisma: 20, mediaTraining: 10, songwriting: 60, production: 85, vocals: 30, liveVocals: 10, stagePresence: 15 } },
realityTV: { title: "Reality TV", money: 5000, stats: { charisma: 60, mediaTraining: 40, songwriting: 20, production: 5, vocals: 85, liveVocals: 70, stagePresence: 50 } },
indieGrinder: { title: "Indie Grinder", money: 500, stats: { charisma: 45, mediaTraining: 20, songwriting: 70, production: 30, vocals: 55, liveVocals: 55, stagePresence: 80 } }
};

const labels = {
megaCorp: { name: "MegaCorp", desc: "Huge budgets, extreme control.", control: 8, promoMultiplier: 50000, minScore: 7 },
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
let availableSingles = player.discography.filter(d => d.type === 'single' && !d.includedInAlbum);
if (availableSingles.length === 0) return alert("No available standalone singles to add!");
const div = document.createElement('div'); div.className = 'track-row';
let options = availableSingles.map(s => {
    let vibe = (s.tracks && s.tracks[0]) ? s.tracks[0].vibe : 'upbeat';
    return `<option value="${s.title}" data-vibe="${vibe}">${s.title}</option>`;
}).join('');
div.innerHTML = `<select class="track-name" style="flex-grow:1; padding:8px;" onchange="this.nextElementSibling.value = this.options[this.selectedIndex].dataset.vibe">${options}</select><select class="track-vibe" disabled style="background:#eee; padding:8px;"><option value="upbeat">Upbeat</option><option value="ballad">Ballad</option><option value="experimental">Experimental</option></select><button onclick="this.parentElement.remove()">X</button>`;
document.getElementById('tracklist-container').appendChild(div);
div.querySelector('.track-name').dispatchEvent(new Event('change'));
}

function submitToLabel() {
if (currentProject.type === 'album') {
    const rows = document.querySelectorAll('.track-row'); if (rows.length === 0) return alert("Need tracks!");
    rows.forEach(r => {
        let inputEl = r.querySelector('.track-name');
        currentProject.tracks.push({ name: inputEl.value || "Track", vibe: r.querySelector('.track-vibe').value, isSingle: inputEl.tagName === 'SELECT' });
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

function buyPromo(t, cost, hype) {
if (currentProject.budget < cost) return alert("Not enough budget!");
currentProject.budget -= cost; currentProject.hype += hype;
document.getElementById('ui-promo-budget').innerText = currentProject.budget.toLocaleString(); document.getElementById('ui-hype-built').innerText = currentProject.hype;
}
function scrapProject() { resetStudio(); }

function scheduleRelease() {
currentProject.releaseWeek = player.totalWeeks + parseInt(document.getElementById('release-delay').value);
if (currentProject.type === 'album') {
    currentProject.tracks.forEach(t => {
        let existing = player.discography.find(d => d.type === 'single' && d.title === t.name);
        if (existing) existing.includedInAlbum = true;
    });
}
player.pendingReleases.push(currentProject); 
alert(`Scheduled! "${currentProject.title}" drops soon.`); 
resetStudio(); switchTab('tab-dashboard', document.querySelectorAll('.nav-btn')[0]);
}

function resetStudio() { document.getElementById('album-title').value = ""; document.getElementById('tracklist-container').innerHTML = ""; document.getElementById('studio-phase-3').style.display = 'none'; document.getElementById('studio-phase-1').style.display = 'block'; updateMainUI(); }

// --- TOUR ENGINE ---
function getAllReleasedSongs() {
let songs = [];
player.discography.forEach(release => {
    if (release.type === 'single') {
        if (!songs.some(s => s.name === release.title)) songs.push({ name: release.title, album: "Single" });
    } else if (release.type === 'album') {
        if (release.tracks) {
            release.tracks.forEach(track => {
                if (track.vibe !== 'interlude' && !songs.some(s => s.name === track.name)) songs.push({ name: track.name, album: release.title });
            });
        }
    }
});
return songs;
}

function setupTour(type) {
const songs = getAllReleasedSongs();
if (songs.length < 10) return alert(`You only have ${songs.length} released songs! You need at least 10 to tour.`);

currentTour.type = type; currentTour.weeks = type === 'national' ? 4 : 10;
const select = document.getElementById('tour-promo-album');
select.innerHTML = `<option value="none">Just promoting myself (Blank Setlist)</option>`;
player.discography.filter(d => d.type === 'album').forEach(a => select.innerHTML += `<option value="${a.title}">${a.title}</option>`);

document.getElementById('tour-phase-1').style.display = 'none'; document.getElementById('tour-phase-2').style.display = 'block';
}

function goToSetlistBuilder() {
currentTour.name = document.getElementById('tour-name').value || "The Tour";
currentTour.promoAlbum = document.getElementById('tour-promo-album').value;

const container = document.getElementById('setlist-container'); container.innerHTML = "";
getAllReleasedSongs().forEach((song, index) => {
    let isChecked = (currentTour.promoAlbum === song.album) ? "checked" : "";
    container.innerHTML += `<div class="setlist-row"><input type="checkbox" class="setlist-check" id="song-${index}" value="${song.name}" ${isChecked} onchange="updateSetlistCount()"><label for="song-${index}"><strong>${song.name}</strong> <span style="color:#666; font-size:0.8rem;">(${song.album})</span></label></div>`;
});

document.getElementById('tour-phase-2').style.display = 'none'; document.getElementById('tour-phase-3').style.display = 'block';
updateSetlistCount(); 
}

function updateSetlistCount() {
const count = document.querySelectorAll('.setlist-check:checked').length;
document.getElementById('setlist-counter').innerText = `${count} / 20`;
document.getElementById('start-tour-btn').disabled = (count < 10 || count > 20);
}

function startTour() {
let base = currentTour.type === 'national' ? 5000 : 15000;
let statBonus = (player.stats.stagePresence + player.stats.liveVocals + player.stats.charisma) / 300;
let totalRev = Math.floor(base + (base * statBonus)) * currentTour.weeks;

player.money += totalRev;
player.stats.liveVocals = Math.min(player.stats.vocals, player.stats.liveVocals + (currentTour.weeks * 2));
player.stats.stagePresence = Math.min(100, player.stats.stagePresence + currentTour.weeks);

for (let i = 0; i < currentTour.weeks; i++) nextWeek(true); 

updateMainUI();
alert(`🚐 TOUR COMPLETE! 🚐\n\nFinished the ${currentTour.weeks}-week ${currentTour.name}!\nGross Revenue: $${totalRev.toLocaleString()}`);
cancelTour(); 
}

function cancelTour() { document.getElementById('tour-name').value = ""; document.getElementById('tour-phase-3').style.display = 'none'; document.getElementById('tour-phase-2').style.display = 'none'; document.getElementById('tour-phase-1').style.display = 'block'; }

// --- TIME ENGINE & CHARTS ---
function nextWeek(silent = false) {
player.week++; player.totalWeeks++;
if (player.week > 52) { player.week = 1; player.age++; if(!silent) alert("Happy Birthday! You are " + player.age); }
player.money -= 150; 

let chartReport = "";

for (let i = player.pendingReleases.length - 1; i >= 0; i--) {
    let rel = player.pendingReleases[i];
    if (rel.releaseWeek === player.totalWeeks) {
        let HypeBonus = rel.hype + (player.stats.charisma / 10);
        let pts = rel.quality + HypeBonus + (player.label.control * 2);
        rel.weeklySales = Math.floor(pts * 2500 * (Math.random() * 0.5 + 0.8));
        rel.totalSales = rel.weeklySales; rel.firstWeekSales = rel.weeklySales; rel.weeksOnChart = 1;
        rel.peakChart = getChartPos(rel.weeklySales);
        player.activeReleases.push(rel); player.discography.push(rel); player.pendingReleases.splice(i, 1);
        chartReport += `🚨 NEW RELEASE: ${rel.title} debuted at #${rel.peakChart} (${rel.weeklySales.toLocaleString()} sales)\n\n`;
    }
}

for (let i = player.activeReleases.length - 1; i >= 0; i--) {
    let rel = player.activeReleases[i];
    rel.weeklySales = Math.floor(rel.weeklySales * (Math.random() * 0.3 + 0.5));
    if (rel.weeklySales < 500) { player.activeReleases.splice(i, 1); } 
    else {
        rel.totalSales += rel.weeklySales; rel.weeksOnChart++;
        let currentChart = getChartPos(rel.weeklySales);
        if (currentChart < rel.peakChart || rel.peakChart === "N/A") rel.peakChart = currentChart;
        chartReport += `🎵 ${rel.title}: #${currentChart} (${rel.weeklySales.toLocaleString()} sales)\n`;
    }
}

if (!silent) {
    updateMainUI();
    if (chartReport !== "") {
        document.getElementById('weekly-report-list').innerText = chartReport;
        document.getElementById('weekly-modal').classList.add('active');
    }
}
}

function getChartPos(s) {
if (s > 200000) return Math.floor(Math.random()*3)+1; if (s > 80000) return Math.floor(Math.random()*7)+4;
if (s > 30000) return Math.floor(Math.random()*30)+11; if (s > 10000) return Math.floor(Math.random()*50)+41;
if (s > 2000) return Math.floor(Math.random()*100)+100; return "N/A";
}

function closeWeeklyReport() { document.getElementById('weekly-modal').classList.remove('active'); }

// --- MISC ---
function openDiscography() {
const list = document.getElementById('disco-list'); list.innerHTML = "";
player.discography.forEach(rel => {
    let cert = "";
    if (rel.totalSales >= 10000000) cert = `<span class="cert-badge cert-diamond">DIAMOND</span>`;
    else if (rel.totalSales >= 1000000) cert = `<span class="cert-badge cert-platinum">PLATINUM</span>`;
    else if (rel.totalSales >= 500000) cert = `<span class="cert-badge cert-gold">GOLD</span>`;
    list.innerHTML += `<div style="border:1px solid #ddd; padding:10px; margin-bottom:10px; border-radius:8px; background:#f8f9fa; text-align:left;"><h4 style="color:#ff3366; margin:0;">${rel.title} ${cert}</h4><p style="font-size:0.85rem; color:#666; margin-bottom:0;">Type: ${rel.type.toUpperCase()} | Peak: #${rel.peakChart} <br>1st Week: ${rel.firstWeekSales.toLocaleString()} | Total: ${rel.totalSales.toLocaleString()}</p></div>`;
});
document.getElementById('disco-modal').classList.add('active');
}
function trainSkill(stat, cost) { if (player.money < cost) return alert("Not enough money!"); player.money -= cost; player.stats[stat] = Math.min(100, player.stats[stat] + Math.floor(Math.random() * 4) + 2); nextWeek(false); }
function playLocalGig() { player.money += 150; player.stats.liveVocals = Math.min(player.stats.vocals, player.stats.liveVocals + 2); nextWeek(false); }
