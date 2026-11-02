// Voice-Driven Architectural House Layout Planner
// Frontend Application Logic

let mediaRecorder = null;
let audioChunks = [];
let recordingInterval = null;
let recordingSeconds = 0;
let currentLayoutData = null;

// Presets
const PRESETS = {
  pune: "I have a 30 by 40 north-facing plot in Pune. Middle-class budget. I want a G+1 duplex with an open kitchen, an L-shaped couch, TV console, ottoman, floor vase, and a 6-seater dining table.",
  ahmedabad: "I have a 40 by 60 west-facing plot in Ahmedabad with hot and dry microclimate. Luxury budget tier. I want a G+1 modern villa with an L-shaped sectional sofa, 85-inch TV console, central ottoman, Italian marble dining table for 8, pooja room, and master bedroom with walk-in closet.",
  bengaluru: "I have a 30 by 50 east-facing plot in Bengaluru with temperate climate. Cost-efficient middle-class budget. I want a duplex house with natural light, courtyard, L-shaped couch, compact TV console, floor vase, and a 6-seater solid wood dining table."
};

// DOM Elements
const recordBtn = document.getElementById('recordBtn');
const recordIcon = document.getElementById('recordIcon');
const recordTimer = document.getElementById('recordTimer');
const recordRing = document.getElementById('recordRing');
const recordStatusText = document.getElementById('recordStatusText');
const recordingStateBadge = document.getElementById('recordingStateBadge');
const audioFileInput = document.getElementById('audioFileInput');
const uploadFileName = document.getElementById('uploadFileName');

const transcriptTextarea = document.getElementById('transcriptTextarea');
const clearTranscriptBtn = document.getElementById('clearTranscriptBtn');
const parameterTagsContainer = document.getElementById('parameterTagsContainer');
const paramCountBadge = document.getElementById('paramCountBadge');
const generateBtn = document.getElementById('generateBtn');

const loadingIndicator = document.getElementById('loadingIndicator');
const layoutResultsSection = document.getElementById('layoutResultsSection');

const resultProjectTitle = document.getElementById('resultProjectTitle');
const resultSubtitle = document.getElementById('resultSubtitle');
const resultBudgetBadge = document.getElementById('resultBudgetBadge');

const stratSunPath = document.getElementById('stratSunPath');
const stratWind = document.getElementById('stratWind');
const stratWindows = document.getElementById('stratWindows');
const stratShading = document.getElementById('stratShading');

const floorsScheduleContainer = document.getElementById('floorsScheduleContainer');
const furnitureLayoutContainer = document.getElementById('furnitureLayoutContainer');

const viewInteractiveBtn = document.getElementById('viewInteractiveBtn');
const viewAsciiBtn = document.getElementById('viewAsciiBtn');
const blueprintContainer = document.getElementById('blueprintContainer');
const asciiContainer = document.getElementById('asciiContainer');
const asciiOutput = document.getElementById('asciiOutput');
const schematicCanvasContainer = document.getElementById('schematicCanvasContainer');

const copyJsonBtn = document.getElementById('copyJsonBtn');
const copyAsciiBtn = document.getElementById('copyAsciiBtn');
const printBtn = document.getElementById('printBtn');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  if (window.lucide) lucide.createIcons();
  setupEventListeners();
  checkBackendHealth();
  updateParameterTags();
});

function setupEventListeners() {
  recordBtn.addEventListener('click', toggleRecording);
  audioFileInput.addEventListener('change', handleAudioFileUpload);
  clearTranscriptBtn.addEventListener('click', () => {
    transcriptTextarea.value = '';
    updateParameterTags();
  });

  transcriptTextarea.addEventListener('input', () => {
    updateParameterTags();
  });

  document.querySelectorAll('.preset-chip').forEach(btn => {
    btn.addEventListener('click', () => {
      const key = btn.dataset.preset;
      if (PRESETS[key]) {
        transcriptTextarea.value = PRESETS[key];
        updateParameterTags();
        transcriptTextarea.focus();
      }
    });
  });

  generateBtn.addEventListener('click', handleGenerateLayout);

  viewInteractiveBtn.addEventListener('click', () => {
    viewInteractiveBtn.className = "px-3 py-1 rounded-lg text-xs font-semibold bg-cyan-500 text-slate-950 transition";
    viewAsciiBtn.className = "px-3 py-1 rounded-lg text-xs font-semibold text-slate-400 hover:text-white transition";
    blueprintContainer.classList.remove('hidden');
    asciiContainer.classList.add('hidden');
  });

  viewAsciiBtn.addEventListener('click', () => {
    viewAsciiBtn.className = "px-3 py-1 rounded-lg text-xs font-semibold bg-cyan-500 text-slate-950 transition";
    viewInteractiveBtn.className = "px-3 py-1 rounded-lg text-xs font-semibold text-slate-400 hover:text-white transition";
    asciiContainer.classList.remove('hidden');
    blueprintContainer.classList.add('hidden');
  });

  copyJsonBtn.addEventListener('click', () => {
    if (currentLayoutData) {
      navigator.clipboard.writeText(JSON.stringify(currentLayoutData, null, 2));
      const orig = copyJsonBtn.innerHTML;
      copyJsonBtn.innerHTML = `<span>Copied!</span>`;
      setTimeout(() => copyJsonBtn.innerHTML = orig, 1800);
    }
  });

  copyAsciiBtn.addEventListener('click', () => {
    if (asciiOutput.textContent) {
      navigator.clipboard.writeText(asciiOutput.textContent);
      const orig = copyAsciiBtn.innerHTML;
      copyAsciiBtn.innerHTML = `<span>Copied!</span>`;
      setTimeout(() => copyAsciiBtn.innerHTML = orig, 1800);
    }
  });

  printBtn.addEventListener('click', () => window.print());
}

async function checkBackendHealth() {
  try {
    const res = await fetch('/api/health');
    const data = await res.json();
    const badge = document.getElementById('apiKeyBadge');
    if (data.sarvam_api_key_configured) {
      badge.innerHTML = `<span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span><span>Sarvam API Active</span>`;
      badge.className = "flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs bg-emerald-950/80 border border-emerald-800/80 text-emerald-400 font-medium";
    } else {
      badge.innerHTML = `<span class="w-2 h-2 rounded-full bg-amber-400"></span><span>API Key Missing</span>`;
      badge.className = "flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs bg-amber-950/80 border border-amber-800/80 text-amber-400 font-medium";
    }
  } catch (err) {
    console.warn("Health check error:", err);
  }
}

// Recording Logic
async function toggleRecording() {
  if (mediaRecorder && mediaRecorder.state === "recording") {
    stopRecording();
  } else {
    startRecording();
  }
}

async function startRecording() {
  audioChunks = [];
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    
    // Choose optimal mimeType
    const mimeTypes = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/wav'];
    let selectedMime = '';
    for (const m of mimeTypes) {
      if (MediaRecorder.isTypeSupported(m)) {
        selectedMime = m;
        break;
      }
    }

    mediaRecorder = new MediaRecorder(stream, selectedMime ? { mimeType: selectedMime } : undefined);

    mediaRecorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) {
        audioChunks.push(e.data);
      }
    };

    mediaRecorder.onstop = async () => {
      stream.getTracks().forEach(track => track.stop());
      const cleanMime = (selectedMime || 'audio/webm').split(';')[0].trim();
      const audioBlob = new Blob(audioChunks, { type: cleanMime });
      await sendAudioToTranscribe(audioBlob, cleanMime.includes('mp4') ? 'audio.mp4' : 'audio.webm');
    };

    mediaRecorder.start(250); // Slice every 250ms
    setRecordingUIState("Listening");

    recordingSeconds = 0;
    recordingInterval = setInterval(() => {
      recordingSeconds++;
      const mins = String(Math.floor(recordingSeconds / 60)).padStart(2, '0');
      const secs = String(recordingSeconds % 60).padStart(2, '0');
      recordTimer.textContent = `${mins}:${secs}`;

      // Max 30 seconds for quick voice brief
      if (recordingSeconds >= 30) {
        stopRecording();
      }
    }, 1000);

  } catch (err) {
    console.error("Microphone error:", err);
    alert("Could not access microphone. Please check permissions or use the file upload / presets.");
    setRecordingUIState("Idle");
  }
}

function stopRecording() {
  if (recordingInterval) clearInterval(recordingInterval);
  if (mediaRecorder && mediaRecorder.state === "recording") {
    mediaRecorder.stop();
  }
  setRecordingUIState("Processing");
}

function setRecordingUIState(state) {
  recordingStateBadge.textContent = state;

  if (state === "Listening") {
    recordingStateBadge.className = "text-xs px-2.5 py-1 rounded-md font-mono bg-red-950 text-red-400 border border-red-800 animate-pulse";
    recordBtn.className = "relative z-10 w-24 h-24 rounded-full bg-red-600 text-white flex flex-col items-center justify-center shadow-xl shadow-red-600/50 transition-all duration-200 focus:outline-none recording-pulse";
    recordIcon.setAttribute('data-lucide', 'square');
    recordRing.classList.add('recording-pulse');
    recordStatusText.textContent = "Listening... Speak your architectural specs (Click to stop)";
  } else if (state === "Processing") {
    recordingStateBadge.className = "text-xs px-2.5 py-1 rounded-md font-mono bg-amber-950 text-amber-400 border border-amber-800 animate-pulse";
    recordBtn.className = "relative z-10 w-24 h-24 rounded-full bg-amber-600 text-white flex flex-col items-center justify-center shadow-xl shadow-amber-600/40 opacity-75 cursor-wait";
    recordTimer.textContent = "Transcribing";
    recordIcon.setAttribute('data-lucide', 'loader');
    recordRing.classList.remove('recording-pulse');
    recordStatusText.textContent = "Uploading & translating with Sarvam Saaras v4...";
  } else {
    // Idle
    recordingStateBadge.className = "text-xs px-2.5 py-1 rounded-md font-mono bg-slate-800 text-slate-400 border border-slate-700";
    recordBtn.className = "relative z-10 w-24 h-24 rounded-full bg-gradient-to-tr from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white flex flex-col items-center justify-center shadow-xl shadow-cyan-600/30 transition-all duration-200 focus:outline-none active:scale-95";
    recordTimer.textContent = "Click to Talk";
    recordIcon.setAttribute('data-lucide', 'mic');
    recordRing.classList.remove('recording-pulse');
    recordStatusText.textContent = "Click to start recording your architectural requirements";
  }

  if (window.lucide) lucide.createIcons();
}

async function handleAudioFileUpload(e) {
  const file = e.target.files[0];
  if (!file) return;

  uploadFileName.textContent = file.name;
  setRecordingUIState("Processing");
  await sendAudioToTranscribe(file, file.name);
}

async function sendAudioToTranscribe(blobOrFile, filename) {
  try {
    const formData = new FormData();
    formData.append("file", blobOrFile, filename);

    const res = await fetch("/api/transcribe", {
      method: "POST",
      body: formData
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || "Transcription failed");
    }

    const data = await res.json();
    if (data.transcript) {
      transcriptTextarea.value = data.transcript;
      updateParameterTags();
    } else {
      alert("No speech detected. Please speak clearly into the microphone.");
    }
  } catch (err) {
    console.error("Transcribe error:", err);
    alert(`Transcription Error: ${err.message}`);
  } finally {
    setRecordingUIState("Idle");
  }
}

// Live Parameter Extraction
function updateParameterTags() {
  const text = transcriptTextarea.value.trim().toLowerCase();
  parameterTagsContainer.innerHTML = '';

  if (!text) {
    parameterTagsContainer.innerHTML = '<span class="text-xs text-slate-400 italic self-center px-1">Parameters will be dynamically extracted from the voice brief.</span>';
    paramCountBadge.textContent = "0 tags identified";
    generateBtn.disabled = true;
    return;
  }

  generateBtn.disabled = false;
  const tags = [];

  // City
  const cities = ['pune', 'ahmedabad', 'mumbai', 'chennai', 'bengaluru', 'bangalore', 'delhi', 'jaipur', 'hyderabad', 'kolkata'];
  for (const c of cities) {
    if (text.includes(c)) {
      tags.push({ label: `City: ${c.charAt(0).toUpperCase() + c.slice(1)}`, color: 'bg-emerald-950 text-emerald-400 border-emerald-800' });
      break;
    }
  }

  // Plot Dimensions
  const dimMatch = text.match(/(\d{2})\s*(?:by|x|\*)\s*(\d{2})/);
  if (dimMatch) {
    tags.push({ label: `Plot: ${dimMatch[1]}' x ${dimMatch[2]}' (${parseInt(dimMatch[1]) * parseInt(dimMatch[2])} sq.ft)`, color: 'bg-cyan-950 text-cyan-400 border-cyan-800' });
  }

  // Facing
  for (const f of ['north-east', 'north-west', 'south-east', 'south-west', 'north', 'south', 'east', 'west']) {
    if (text.includes(f)) {
      tags.push({ label: `Facing: ${f.toUpperCase()}`, color: 'bg-blue-950 text-blue-400 border-blue-800' });
      break;
    }
  }

  // Floors
  if (text.includes('duplex') || text.includes('g+1') || text.includes('g + 1')) {
    tags.push({ label: 'Floors: G+1 Duplex', color: 'bg-purple-950 text-purple-400 border-purple-800' });
  } else if (text.includes('g+2') || text.includes('triplex')) {
    tags.push({ label: 'Floors: G+2 Triplex', color: 'bg-purple-950 text-purple-400 border-purple-800' });
  } else if (text.includes('ground') || text.includes('single floor')) {
    tags.push({ label: 'Floors: Ground Only', color: 'bg-purple-950 text-purple-400 border-purple-800' });
  }

  // Budget
  if (text.includes('luxury') || text.includes('premium')) {
    tags.push({ label: 'Budget: Luxury', color: 'bg-amber-950 text-amber-400 border-amber-800' });
  } else if (text.includes('cost-efficient') || text.includes('economical') || text.includes('low budget')) {
    tags.push({ label: 'Budget: Cost-Efficient', color: 'bg-green-950 text-green-400 border-green-800' });
  } else {
    tags.push({ label: 'Budget: Middle-Class', color: 'bg-blue-950 text-blue-400 border-blue-800' });
  }

  // Fixtures
  const fixtures = ['l-shaped couch', 'l-shaped sofa', 'tv console', 'ottoman', 'floor vase', 'dining table', 'island counter', 'study nook', 'walk-in'];
  for (const fix of fixtures) {
    if (text.includes(fix)) {
      tags.push({ label: fix.charAt(0).toUpperCase() + fix.slice(1), color: 'bg-slate-800 text-slate-300 border-slate-700' });
    }
  }

  tags.forEach(t => {
    const span = document.createElement('span');
    span.className = `text-xs px-2.5 py-1 rounded-md font-mono border ${t.color} flex items-center space-x-1`;
    span.textContent = t.label;
    parameterTagsContainer.appendChild(span);
  });

  paramCountBadge.textContent = `${tags.length} tags identified`;
}

// Generate Layout Action
async function handleGenerateLayout() {
  const transcript = transcriptTextarea.value.trim();
  if (!transcript) return;

  loadingIndicator.classList.remove('hidden');
  layoutResultsSection.classList.add('hidden');
  generateBtn.disabled = true;

  try {
    const res = await fetch("/api/generate-layout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ transcript })
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || "Layout generation failed");
    }

    const data = await res.json();
    currentLayoutData = data;
    renderLayoutResults(data);

    layoutResultsSection.classList.remove('hidden');
    layoutResultsSection.scrollIntoView({ behavior: 'smooth' });

  } catch (err) {
    console.error("Layout generation error:", err);
    alert(`Failed to generate architectural layout: ${err.message}`);
  } finally {
    loadingIndicator.classList.add('hidden');
    generateBtn.disabled = false;
  }
}

// Render Results
function renderLayoutResults(data) {
  // Title & Metadata
  resultProjectTitle.textContent = data.project_title || "Modern Bioclimatic Residential Layout";
  const params = data.extracted_parameters || {};
  resultSubtitle.textContent = `City: ${params.city || 'Pune'} • Micro-Climate: ${params.micro_climate || 'Semi-Arid'} • Plot: ${params.plot_dimensions || "30' x 40'"} (${params.plot_facing || 'North'} Facing)`;
  resultBudgetBadge.textContent = params.budget_tier || "Middle-Class";

  // Passive Strategies
  const strat = data.climate_passive_strategy || {};
  stratSunPath.textContent = strat.sun_path_strategy || "Optimized for glare-free North daylight and deep shading on South/West.";
  stratWind.textContent = strat.wind_cross_ventilation || "Natural cross ventilation channeled through open living corridors into a double-height stairwell.";
  stratWindows.textContent = strat.window_placement || "Generous double-glazed openings on North/East; high clerestory ventilation on West.";
  stratShading.textContent = strat.shading_and_materials || "Deep RCC cantilever chajjas (overhangs), fly-ash cavity masonry, and reflective terrace finish.";

  // Floors Schedule
  floorsScheduleContainer.innerHTML = '';
  const floors = data.floors_schedule || [];
  floors.forEach((fl, idx) => {
    const card = document.createElement('div');
    card.className = "bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-lg";

    let rowsHtml = '';
    (fl.rooms || []).forEach(r => {
      rowsHtml += `
        <tr class="border-b border-slate-800/60 hover:bg-slate-800/30 transition text-xs">
          <td class="py-3 px-4 font-semibold text-slate-200">${r.name}</td>
          <td class="py-3 px-4 font-mono text-cyan-300">${r.dimensions}</td>
          <td class="py-3 px-4 font-mono text-slate-300">${r.area_sqft} sq.ft</td>
          <td class="py-3 px-4 text-slate-400">${r.aspect || 'Interior'}</td>
          <td class="py-3 px-4 text-slate-400">${r.ventilation || 'Standard Window'}</td>
        </tr>
      `;
    });

    card.innerHTML = `
      <div class="bg-slate-800/60 px-5 py-3.5 border-b border-slate-800 flex items-center justify-between">
        <div class="flex items-center space-x-2">
          <span class="w-2.5 h-2.5 rounded-full bg-cyan-400"></span>
          <h4 class="font-bold text-white text-sm">${fl.floor_name}</h4>
        </div>
        <span class="text-xs font-mono text-cyan-400">Built-Up Area: ~${fl.total_area_sqft || 800} sq.ft</span>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full text-left">
          <thead>
            <tr class="text-[11px] uppercase tracking-wider text-slate-400 bg-slate-950/60 border-b border-slate-800">
              <th class="py-2.5 px-4">Room Name</th>
              <th class="py-2.5 px-4">Dimensions</th>
              <th class="py-2.5 px-4">Carpet Area</th>
              <th class="py-2.5 px-4">Aspect / Orientation</th>
              <th class="py-2.5 px-4">Ventilation & Daylighting</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml}
          </tbody>
        </table>
      </div>
    `;
    floorsScheduleContainer.appendChild(card);
  });

  // Furniture Layout
  furnitureLayoutContainer.innerHTML = '';
  const furn = data.furniture_layout || [];
  furn.forEach(room => {
    const card = document.createElement('div');
    card.className = "bg-slate-900/80 border border-slate-800/90 rounded-2xl p-5 shadow-lg flex flex-col justify-between";

    let itemsHtml = '';
    (room.furnishings || []).forEach(item => {
      itemsHtml += `
        <li class="space-y-1">
          <div class="flex items-start justify-between text-xs">
            <strong class="text-slate-200 font-semibold flex items-center space-x-1.5">
              <span class="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
              <span>${item.item}</span>
            </strong>
          </div>
          <p class="text-[11px] text-slate-400 pl-3"><strong>Placement:</strong> ${item.placement}</p>
          <p class="text-[11px] text-cyan-400/90 pl-3 font-mono"><strong>Clearance:</strong> ${item.clearance}</p>
        </li>
      `;
    });

    card.innerHTML = `
      <div>
        <div class="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
          <div>
            <h4 class="font-bold text-white text-sm">${room.room}</h4>
            <span class="text-[11px] font-mono text-slate-400">${room.floor || 'Ground'} • ${room.dimensions || ''}</span>
          </div>
          <span class="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800">NBC Clearances</span>
        </div>
        <ul class="space-y-3 mb-4">
          ${itemsHtml}
        </ul>
      </div>
      <div class="pt-3 border-t border-slate-800/70 text-[11px] text-slate-400">
        <strong class="text-slate-300">Circulation Note:</strong> ${room.circulation_notes || 'Provides clean 3-foot minimum circulation pathways throughout.'}
      </div>
    `;
    furnitureLayoutContainer.appendChild(card);
  });

  // ASCII Plan
  asciiOutput.textContent = (data.ascii_floor_plan || "No ASCII plan generated.").trim();

  // Vector Blueprint
  renderVectorBlueprint(data);

  if (window.lucide) lucide.createIcons();
}

// Interactive Vector Blueprint Renderer
function renderVectorBlueprint(data) {
  schematicCanvasContainer.innerHTML = '';

  const schem = data.schematic_2d || {};
  const rooms = schem.rooms || [
    { name: "Verandah / Parking", x: 0, y: 0, w: 12, h: 10, color: "#475569" },
    { name: "Entrance Foyer", x: 12, y: 0, w: 6, h: 10, color: "#0284c7" },
    { name: "Living Room", x: 0, y: 10, w: 18, h: 16, color: "#2563eb", furniture: ["L-Couch", "TV Unit", "Ottoman"] },
    { name: "Dining Hall", x: 18, y: 10, w: 12, h: 12, color: "#059669", furniture: ["6-Seater Table"] },
    { name: "Kitchen (Agni)", x: 18, y: 22, w: 12, h: 14, color: "#d97706", furniture: ["Modular Island"] },
    { name: "Guest Bedroom", x: 0, y: 26, w: 18, h: 12, color: "#7c3aed", furniture: ["Bed", "Wardrobe"] },
    { name: "Powder / Bath", x: 18, y: 0, w: 12, h: 10, color: "#db2777" }
  ];

  const scale = 14; // pixels per foot
  const plotW = (schem.plot_width_ft || 30) * scale;
  const plotH = (schem.plot_depth_ft || 40) * scale;

  let roomsSvg = '';
  rooms.forEach(r => {
    const rx = (r.x || 0) * scale + 15;
    const ry = (r.y || 0) * scale + 15;
    const rw = (r.w || 10) * scale;
    const rh = (r.h || 10) * scale;
    const color = r.color || "#2563eb";

    let furnLabels = '';
    if (r.furniture && r.furniture.length > 0) {
      furnLabels = r.furniture.map((f, i) => 
        `<text x="${rx + 8}" y="${ry + 38 + i * 14}" fill="#cbd5e1" font-size="10" font-family="monospace">• ${f}</text>`
      ).join('');
    }

    roomsSvg += `
      <g class="room-group">
        <rect x="${rx}" y="${ry}" width="${rw}" height="${rh}" fill="${color}" fill-opacity="0.22" stroke="${color}" stroke-width="2" rx="4" />
        <rect x="${rx}" y="${ry}" width="${rw}" height="${rh}" fill="url(#gridPattern)" opacity="0.3" pointer-events="none" />
        <text x="${rx + 8}" y="${ry + 18}" fill="#ffffff" font-size="12" font-weight="bold" font-family="sans-serif">${r.name}</text>
        <text x="${rx + 8}" y="${ry + 30}" fill="#94a3b8" font-size="9" font-family="monospace">${r.w}' x ${r.h}' (~${r.w * r.h} sq.ft)</text>
        ${furnLabels}
        <!-- Door indicator -->
        <circle cx="${rx + 6}" cy="${ry + rh - 6}" r="3" fill="#10b981" />
        <!-- Window indicator -->
        <line x1="${rx + 10}" y1="${ry}" x2="${rx + rw - 10}" y2="${ry}" stroke="#38bdf8" stroke-width="3" stroke-dasharray="4,2" />
      </g>
    `;
  });

  const svgHtml = `
    <svg width="${plotW + 30}" height="${plotH + 30}" viewBox="0 0 ${plotW + 30} ${plotH + 30}" class="bg-slate-950 rounded-xl border border-slate-800 shadow-inner">
      <defs>
        <pattern id="gridPattern" width="${scale}" height="${scale}" patternUnits="userSpaceOnUse">
          <path d="M ${scale} 0 L 0 0 0 ${scale}" fill="none" stroke="rgba(255,255,255,0.08)" stroke-width="0.5"/>
        </pattern>
      </defs>

      <!-- Plot boundary -->
      <rect x="15" y="15" width="${plotW}" height="${plotH}" fill="#090d16" stroke="#475569" stroke-width="3" stroke-dasharray="6,4" rx="6" />

      <!-- North Compass Indicator -->
      <g transform="translate(${plotW - 25}, 35)">
        <circle cx="0" cy="0" r="16" fill="#1e293b" stroke="#0ea5e9" stroke-width="1.5" />
        <polygon points="0,-12 4,4 0,2 -4,4" fill="#ef4444" />
        <polygon points="0,12 4,2 0,0 -4,2" fill="#64748b" />
        <text x="0" y="-14" fill="#ef4444" font-size="9" font-weight="bold" text-anchor="middle" font-family="sans-serif">N</text>
      </g>

      ${roomsSvg}

      <!-- Dimension legends -->
      <text x="${plotW / 2 + 15}" y="10" fill="#94a3b8" font-size="10" font-family="monospace" text-anchor="middle">Width: ${schem.plot_width_ft || 30} ft</text>
      <text x="8" y="${plotH / 2 + 15}" fill="#94a3b8" font-size="10" font-family="monospace" text-anchor="middle" transform="rotate(-90 8 ${plotH / 2 + 15})">Depth: ${schem.plot_depth_ft || 40} ft</text>
    </svg>
  `;

  schematicCanvasContainer.innerHTML = svgHtml;
}
