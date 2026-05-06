// --- GAME STATE & DATA ---
let player = {
name: "", origin: "", money: 0, age: 18, week: 1, totalWeeks: 1,
stats: { charisma: 0, mediaTraining: 0, songwriting: 0, production: 0, vocals: 0, liveVocals: 0, stagePresence: 0 },
label: null, labelRelationship: 50,
discography: [], pendingReleases: [], activeReleases: []
};

let selectedOriginId = null;
let selectedLabelId = null;
let currentProject = {}; // Temporarily holds the album being made

const origins = {
childActor: { title: "Child Actor", money: 50000, age: 16, stats: { charisma: 75, mediaTraining: 80, songwriting: 15, production: 10, vocals: 40, liveVocals: 30, stagePresence: 65 } },
bedroomProducer: { title: "Bedroom Producer", money: 2000, age: 18, stats: { charisma: 20, mediaTraining: 10, songwriting: 60, production: 85, vocals: 30, liveVocals: 10, stagePresence: 15 } },
realityTV: { title: "Reality TV", money: 5000, age: 20, stats: { charisma: 60, mediaTraining: 40, songwriting: 20, production: 5, vocals: 85, liveVocals: 70, stagePresence: 50 } },
indieGrinder: { title: "Indie Grinder", money: 500, age: 24, stats: { charisma: 45, mediaTraining: 20, songwriting: 70, production: 30, vocals: 55, liveVocals: 55, stagePresence: 80 } }
};

const labels = {
megaCorp: { name: "MegaCorp Records", desc: "Huge budgets, extreme control.", control: 8, promoMultiplier: 50000, minScore: 7 },
trendsetters: { name: "Trendsetters", desc: "Moderate budget, balanced control.", control: 5, promoMultiplier: 25000, minScore: 5 },
basementIndie: { name: "Basement Indie", desc: "Low budget, total creative freedom.", control: 2, promoMultiplier: 5000, minScore: 2 }
};

// --- SETUP & UI FLOW ---

function showScreen(screenId) {
document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
document.getElementById(screenId).classList.add('active');
}

function switchTab(tabId, btnElement) {
document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active-tab'));
document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('selected-nav'));
document.getElementById(tabId).classList.add('active-tab');
if (btnElement) btnElement.classList.add('selected-nav');
}

function selectOrigin(id) {
selectedOriginId = id;
document.querySelectorAll('.origin-btn').forEach(b => b.classList.remove('selected'));
event.target.classList.add('selected');
document.getElementById('to-label-btn').disabled = false;
}

function goToLabelSelection() {
if (!document.getElementById('artist-name').value) return alert("Enter a name!");
const container = document.getElementById('label-options');
container.innerHTML = "";
for (const [key, label] of Object.entries(labels)) {
    container.innerHTML += `
        <div class="label-card" onclick="selectLabel('${key}', this)">
            <h4>${label.name}</h4>
            <p>${label.desc}</p>
            <p><strong>Control:</strong> ${label.control}/10 | <strong>Minimum Quality:</strong> ${label.minScore}/10</p>
        </div>`;
}
showScreen('label-screen');
}

function selectLabel(id, el) {
selectedLabelId = id;
document.querySelectorAll('.label-card').forEach(c => c.classList.remove('selected'));
el.classList.add('selected');
document.getElementById('start-career-btn').disabled = false;
}

function startCareer() {
const o = origins[selectedOriginId];
player.name = document.getElementById('artist-name').value;
player.origin = o.title; player.money = o.money; player.age = o.age;
player.stats = { ...o.stats };
player.label = labels[selectedLabelId];
updateMainUI();
showScreen('game-ui');
}

function updateMainUI() {
document.getElementById('ui-name').innerText = player.name;
document.getElementById('ui-money').innerText = player.money.toLocaleString();
document.getElementById('ui-age').innerText = player.age;
document.getElementById('ui-week').innerText = player.week;
document.getElementById('ui-label-name').innerText = player.label.name;
document.getElementById('ui-relationship').innerText = player.labelRelationship;

const statsGrid = document.getElementById('stats-grid');
statsGrid.innerHTML = ""; 
const labelsDict = { charisma: "Charisma", mediaTraining: "Media", songwriting: "Songwriting", production: "Production", vocals: "Vocals", liveVocals: "Live Vocals", stagePresence: "Stage Presence" };
for (const [key, value] of Object.entries(player.stats)) {
    statsGrid.innerHTML += `<div class="stat-box"><div class="stat-name">${labelsDict[key]}</div><div class="stat-value">${value}/100</div></div>`;
}
}

// --- STUDIO: CREATION TO SCHEDULING ---

function goToPhase2() {
const title = document.getElementById('album-title').value;
const type = document.getElementById('project-type').value;
if (!title) return alert("Title required!");

currentProject = { title, type, tracks: [], hype: 0, budget: 0 };
document.getElementById('studio-phase-1').style.display = 'none';

if (type === 'single') submitToLabel(); // Skip tracks for singles
else {
    document.getElementById('studio-phase-2').style.display = 'block';
    if(document.getElementById('tracklist-container').children.length === 0) addTrack();
}
}

function addTrack() {
const container = document.getElementById('tracklist-container');
const div = document.createElement('div');
div.className = 'track-row';
div.innerHTML = `
    <input type="text" class="track-name" placeholder="Song Name">
    <select class="track-vibe"><option value="upbeat">Upbeat</option><option value="ballad">Ballad</option><option value="interlude">Interlude</option></select>
    <button onclick="this.parentElement.remove()">X</button>
`;
container.appendChild(div);
}

function submitToLabel() {
if (currentProject.type === 'album') {
    const rows = document.querySelectorAll('.track-row');
    if (rows.length === 0) return alert("Need at least one track!");
    rows.forEach(r => currentProject.tracks.push({ name: r.querySelector('.track-name').value || "Track", vibe: r.querySelector('.track-vibe').value, isSingle: false }));
}

// Calculate quality score (0-10 scale for Execs)
let rawQuality = (player.stats.songwriting + player.stats.production + player.stats.vocals) / 3;
let execScore = Math.floor(rawQuality / 10); 
currentProject.quality = rawQuality; // Save raw quality for sales later

document.getElementById('studio-phase-2').style.display = 'none';
document.getElementById('studio-phase-3').style.display = 'block';

const feedbackEl = document.getElementById('exec-feedback');
const promoSec = document.getElementById('promo-section');
const scrapBtn = document.getElementById('scrap-btn');

// Exec Review Logic
if (execScore < player.label.minScore) {
    player.labelRelationship = Math.max(0, player.labelRelationship - 10);
    feedbackEl.innerText = `Execs rated it ${execScore}/10. "This is garbage. We aren't releasing this." (Relationship -10)`;
    feedbackEl.style.color = "red";
    promoSec.style.display = "none";
    scrapBtn.style.display = "block";
} else {
    player.labelRelationship = Math.min(100, player.labelRelationship + 5);
    currentProject.budget = player.label.promoMultiplier * (execScore || 1);
    feedbackEl.innerText = `Execs rated it ${execScore}/10. "Good work. Here is your marketing budget."`;
    feedbackEl.style.color = "green";
    document.getElementById('ui-promo-budget').innerText = currentProject.budget.toLocaleString();
    document.getElementById('ui-hype-built').innerText = "0";
    promoSec.style.display = "block";
    scrapBtn.style.display = "none";
}
}

function buyPromo(type, cost, hypeBoost) {
if (currentProject.budget < cost) return alert("Not enough budget!");
currentProject.budget -= cost;
currentProject.hype += hypeBoost;
document.getElementById('ui-promo-budget').innerText = currentProject.budget.toLocaleString();
document.getElementById('ui-hype-built').innerText = currentProject.hype;
}

function scrapProject() {
resetStudio();
}

function scheduleRelease() {
const delay = parseInt(document.getElementById('release-delay').value);
currentProject.releaseWeek = player.totalWeeks + delay;

player.pendingReleases.push(currentProject);
alert(`Scheduled! "${currentProject.title}" will drop in ${delay} week(s).`);
resetStudio();
switchTab('tab-dashboard', document.querySelectorAll('.nav-btn')[0]);
}

function resetStudio() {
document.getElementById('album-title').value = "";
document.getElementById('tracklist-container').innerHTML = "";
document.getElementById('studio-phase-3').style.display = 'none';
document.getElementById('studio-phase-1').style.display = 'block';
updateMainUI();
}

// --- TIME ENGINE & CHARTS ---

function nextWeek() {
player.week++; player.totalWeeks++;
if (player.week > 52) { player.week = 1; player.age++; }
player.money -= 150; 

let chartReport = "";

// 1. Drop Scheduled Music
let droppedThisWeek = false;
for (let i = player.pendingReleases.length - 1; i >= 0; i--) {
    let release = player.pendingReleases[i];
    if (release.releaseWeek === player.totalWeeks) {
        // It drops today! Calculate initial sales based on Quality + Hype + Label Power
        let HypeBonus = release.hype + (player.stats.charisma / 10);
        let totalPoints = release.quality + HypeBonus + (player.label.control * 2);
        
        // Calculate actual Week 1 Sales
        release.weeklySales = Math.floor(totalPoints * 2500 * (Math.random() * 0.5 + 0.8));
        release.totalSales = release.weeklySales;
        release.firstWeekSales = release.weeklySales;
        release.peakChart = getChartPos(release.weeklySales);
        release.weeksOnChart = 1;

        player.activeReleases.push(release);
        player.discography.push(release); // Add to permanent record
        player.pendingReleases.splice(i, 1);
        
        chartReport += `🚨 NEW RELEASE: ${release.title} debuted at #${release.peakChart} with ${release.weeklySales.toLocaleString()} sales!\n\n`;
        droppedThisWeek = true;
    }
}

// 2. Process Active Charts (Decay)
for (let i = player.activeReleases.length - 1; i >= 0; i--) {
    let release = player.activeReleases[i];
    
    // Decay sales by 20% to 50% each week
    release.weeklySales = Math.floor(release.weeklySales * (Math.random() * 0.3 + 0.5));
    
    if (release.weeklySales < 500) {
        // Fell off the charts
        player.activeReleases.splice(i, 1);
    } else {
        release.totalSales += release.weeklySales;
        release.weeksOnChart++;
        let currentChart = getChartPos(release.weeklySales);
        
        // Update Peak
        if (currentChart < release.peakChart || release.peakChart === "N/A") release.peakChart = currentChart;
        
        chartReport += `🎵 ${release.title}: #${currentChart} (${release.weeklySales.toLocaleString()} sales)\n`;
    }
}

updateMainUI();

// Show weekly report if anything is charting
if (chartReport !== "") {
    document.getElementById('weekly-report-list').innerText = chartReport;
    document.getElementById('weekly-modal').classList.add('active');
}
}

function getChartPos(sales) {
if (sales > 200000) return Math.floor(Math.random() * 3) + 1;
if (sales > 80000) return Math.floor(Math.random() * 7) + 4;
if (sales > 30000) return Math.floor(Math.random() * 30) + 11;
if (sales > 10000) return Math.floor(Math.random() * 50) + 41;
if (sales > 2000) return Math.floor(Math.random() * 100) + 100;
return "N/A"; // Fell off
}

function closeWeeklyReport() {
document.getElementById('weekly-modal').classList.remove('active');
}

// --- DISCOGRAPHY & RIAA ---

function openDiscography() {
const list = document.getElementById('disco-list');
list.innerHTML = "";

player.discography.forEach(release => {
    let certHtml = "";
    if (release.totalSales >= 10000000) certHtml = `<span class="cert-badge cert-diamond">DIAMOND</span>`;
    else if (release.totalSales >= 1000000) certHtml = `<span class="cert-badge cert-platinum">PLATINUM</span>`;
    else if (release.totalSales >= 500000) certHtml = `<span class="cert-badge cert-gold">GOLD</span>`;

    list.innerHTML += `
    <div style="border: 1px solid #ddd; padding: 10px; margin-bottom: 10px; border-radius: 8px; background: #f8f9fa; text-align:left;">
        <h4 style="color:#ff3366; margin:0;">${release.title} ${certHtml}</h4>
        <p style="font-size:0.85rem; color:#666; margin-bottom:5px;">
            Type: ${release.type.toUpperCase()} | Peak: #${release.peakChart} <br>
            1st Week: ${release.firstWeekSales.toLocaleString()} | Total: ${release.totalSales.toLocaleString()}
        </p>
    </div>`;
});

document.getElementById('disco-modal').classList.add('active');
}

function trainSkill(stat, cost) {
if (player.money < cost) return alert("Not enough money!");
player.money -= cost;
player.stats[stat] = Math.min(100, player.stats[stat] + Math.floor(Math.random() * 4) + 2);
nextWeek();
}
function playLocalGig() {
player.money += 150;
player.stats.liveVocals = Math.min(player.stats.vocals, player.stats.liveVocals + 2);
nextWeek();
}
