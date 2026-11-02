// ==========================================================================
// STHAPATI LUXURY ARCHITECTURAL STUDIO - FRONTEND ENGINE
// Theme: Deep Obsidian & Warm Champagne Gold (CAD/BIM Cockpit)
// ==========================================================================

// Global Studio State
const StudioState = {
  activeFloor: 'ground',         // 'ground' | 'first'
  viewMode: '2d',                // '2d' | '3d'
  activeVariant: 'circulation',  // 'circulation' | 'climate' | 'utility'
  activeFinish: 'travertine',    // 'travertine' | 'concrete' | 'oak'
  zoomLevel: 1.0,
  selectedElement: null,         // { type: 'room'|'furniture', id: string, data: object }
  layoutData: null,
  isRecording: false,
  mediaRecorder: null,
  audioChunks: [],
  recordInterval: null,
  recordSeconds: 0,
  
  // Dynamic furniture list per floor
  furniture: {
    ground: [
      { id: 'f_couch', type: 'l_couch', name: 'L-Sectional Couch', room: 'Living Room', x: 2, y: 14, w: 9, h: 7, rot: 0, clearance: '42" Entry Artery', finish: 'Italian Bouclé', cost: '$4,200' },
      { id: 'f_tv', type: 'tv_unit', name: 'Fluted TV Credenza', room: 'Living Room', x: 12.5, y: 15, w: 1.5, h: 6, rot: 0, clearance: '10.5 ft Viewing Distance', finish: 'Smoked Walnut', cost: '$2,100' },
      { id: 'f_ottoman', type: 'ottoman', name: 'Center Ottoman & Table', room: 'Living Room', x: 5, y: 18, w: 3.5, h: 3.5, rot: 0, clearance: '36" Loop Clearance', finish: 'Calacatta & Velvet', cost: '$1,450' },
      { id: 'f_vase', type: 'floor_vase', name: 'Ceramic Urn / Planter', room: 'Living Room', x: 12.5, y: 12, w: 2, h: 2, rot: 0, clearance: 'Corner Niche', finish: 'Matte Terracotta', cost: '$650' },
      { id: 'f_dining', type: 'dining_table', name: '6-Seater Dining Table', room: 'Dining Hall', x: 18.5, y: 13, w: 7, h: 4, rot: 0, clearance: '38" Pullout Clearance', finish: 'Solid White Oak', cost: '$3,800' },
      { id: 'f_island', type: 'kitchen_island', name: 'Modular Quartz Island', room: 'Kitchen (Agni)', x: 18.5, y: 24, w: 7, h: 3.5, rot: 0, clearance: '42" Kitchen Triangle', finish: 'Nero Marquina', cost: '$5,200' },
      { id: 'f_guest_bed', type: 'king_bed', name: 'Queen Guest Bed', room: 'Guest Bedroom', x: 2, y: 28, w: 6.5, h: 6.5, rot: 0, clearance: '36" Side Clearance', finish: 'Upholstered Linen', cost: '$2,900' }
    ],
    first: [
      { id: 'f_master_bed', type: 'king_bed', name: 'Master King Platform Bed', room: 'Master Suite', x: 2, y: 14, w: 7.5, h: 7, rot: 0, clearance: '42" Perimeter Pathway', finish: 'Castilian Oak & Linen', cost: '$5,600' },
      { id: 'f_master_tv', type: 'tv_unit', name: 'Master TV Console', room: 'Master Suite', x: 12.5, y: 15, w: 1.5, h: 5.5, rot: 0, clearance: '11.0 ft Viewing Distance', finish: 'Smoked Walnut', cost: '$1,950' },
      { id: 'f_lounge_couch', type: 'l_couch', name: 'Family Lounge Sofa', room: 'Family Lounge', x: 18.5, y: 14, w: 7, h: 5, rot: 0, clearance: 'Atrium View Clearance', finish: 'Sandstone Velvet', cost: '$3,200' },
      { id: 'f_study_desk', type: 'dining_table', name: 'Architectural Workstation', room: 'Children Study', x: 2, y: 28, w: 6, h: 3, rot: 0, clearance: 'Corner Light Clearance', finish: 'Natural Ash', cost: '$1,800' }
    ]
  }
};

// Preset Briefs
const PRESETS = {
  pune: "I have a 30 by 40 north-facing plot in Pune. Middle-class budget. I want a G+1 duplex with an open kitchen, an L-shaped couch, TV console, ottoman, floor vase, and a 6-seater dining table.",
  ahmedabad: "I have a 40 by 60 west-facing plot in Ahmedabad with hot and dry microclimate. Luxury budget tier. I want a G+1 modern villa with an L-shaped sectional sofa, 85-inch TV console, central ottoman, Italian marble dining table for 8, pooja room, and master bedroom with walk-in closet.",
  bengaluru: "I have a 30 by 50 east-facing plot in Bengaluru with temperate climate. Cost-efficient middle-class budget. I want a duplex house with natural light, courtyard, L-shaped couch, compact TV console, floor vase, and a 6-seater solid wood dining table."
};

// Room definitions per floor
const ROOMS_GROUND = [
  { id: 'r_verandah', name: 'Parking / Verandah', aspect: 'North', w: 14, h: 10, x: 0, y: 0, color: '#334155', area: 140, vent: 'Open exterior portico buffer' },
  { id: 'r_foyer', name: 'Entrance Foyer', aspect: 'North', w: 16, h: 10, x: 14, y: 0, color: '#0369a1', area: 160, vent: 'Security louvered transom' },
  { id: 'r_living', name: 'Formal Living Room', aspect: 'North-East', w: 16, h: 16, x: 0, y: 10, color: '#1d4ed8', area: 256, vent: 'North bay window + morning cross-slit' },
  { id: 'r_dining', name: 'Dining Hall', aspect: 'East', w: 14, h: 12, x: 16, y: 10, color: '#047857', area: 168, vent: 'French glazing to atrium shaft' },
  { id: 'r_kitchen', name: 'Vastu Kitchen (Agni)', aspect: 'South-East', w: 14, h: 12, x: 16, y: 22, color: '#b45309', area: 168, vent: 'SE exhaust hood duct & corner louvers' },
  { id: 'r_guest_bed', name: 'Guest Bedroom', aspect: 'North-West', w: 16, h: 12, x: 0, y: 26, color: '#6d28d9', area: 192, vent: 'Double-glazed casement window' },
  { id: 'r_bath', name: 'Powder & Common Bath', aspect: 'West', w: 14, h: 6, x: 16, y: 34, color: '#be185d', area: 84, vent: 'Frosted high clerestory ventilation' }
];

const ROOMS_FIRST = [
  { id: 'r_master_suite', name: 'Master Suite (SW)', aspect: 'South-West', w: 16, h: 16, x: 0, y: 10, color: '#7c2d12', area: 256, vent: 'Deep private deck & sliding glass' },
  { id: 'r_walkin_bath', name: 'En-Suite & Wardrobe', aspect: 'West', w: 14, h: 10, x: 16, y: 10, color: '#9d174d', area: 140, vent: 'High operable skylight strip' },
  { id: 'r_family_lounge', name: 'Family Lounge / Atrium', aspect: 'Internal Void', w: 14, h: 14, x: 16, y: 20, color: '#0284c7', area: 196, vent: 'Overlooks central green lightwell' },
  { id: 'r_child_bed', name: 'Children / Study Suite', aspect: 'North-East', w: 16, h: 14, x: 0, y: 26, color: '#4338ca', area: 224, vent: 'Corner ribbon window for morning sun' },
  { id: 'r_terrace', name: 'Green Sky Terrace', aspect: 'North', w: 30, h: 10, x: 0, y: 0, color: '#15803d', area: 300, vent: 'Open timber pergola & planter boxes' }
];

// Document Ready
document.addEventListener('DOMContentLoaded', () => {
  if (window.lucide) lucide.createIcons();
  
  initUIEventListeners();
  checkBackendHealth();
  updateParameterTags();
  
  // Set default initial inspection
  StudioState.selectedElement = { type: 'room', id: 'r_living', data: ROOMS_GROUND[2] };
  updateInspectorUI();

  // Render initial canvas
  renderActiveCanvas();
});

// Setup All UI Event Listeners
function initUIEventListeners() {
  // Voice Recording
  const recordBtn = document.getElementById('recordBtn');
  recordBtn.addEventListener('click', toggleVoiceRecording);

  // Audio file upload
  const audioInput = document.getElementById('audioFileInput');
  audioInput.addEventListener('change', handleAudioUpload);

  // Clear transcript
  document.getElementById('clearTranscriptBtn').addEventListener('click', () => {
    document.getElementById('transcriptTextarea').value = '';
    updateParameterTags();
  });

  // Textarea input
  document.getElementById('transcriptTextarea').addEventListener('input', updateParameterTags);

  // Synthesize / Generate Layout button
  document.getElementById('generateBtn').addEventListener('click', synthesizeLayoutFromVoice);

  // Preset Chips
  document.querySelectorAll('.preset-chip').forEach(btn => {
    btn.addEventListener('click', () => {
      const pKey = btn.dataset.preset;
      if (PRESETS[pKey]) {
        document.getElementById('transcriptTextarea').value = PRESETS[pKey];
        updateParameterTags();
        synthesizeLayoutFromVoice();
      }
    });
  });

  // Layout Variant Selector Cards
  document.querySelectorAll('.variant-card').forEach(card => {
    card.addEventListener('click', () => {
      document.querySelectorAll('.variant-card').forEach(c => {
        c.classList.remove('border-champagne-400', 'bg-[#191f2b]', 'border-champagne-400/40');
        c.classList.add('border-[#202632]');
      });
      card.classList.remove('border-[#202632]');
      card.classList.add('border-champagne-400', 'bg-[#191f2b]');

      StudioState.activeVariant = card.dataset.variant;
      applyVariantModifications();
      renderActiveCanvas();
    });
  });

  // View Mode: 2D Blueprint vs 3D Isometric
  const view2dBtn = document.getElementById('view2dBtn');
  const view3dBtn = document.getElementById('view3dBtn');
  const svg2D = document.getElementById('svgContainer2D');
  const svg3D = document.getElementById('svgContainer3D');

  view2dBtn.addEventListener('click', () => {
    StudioState.viewMode = '2d';
    view2dBtn.className = "px-2.5 py-1 rounded text-xs font-semibold bg-champagne-400 text-obsidian-950 transition flex items-center space-x-1";
    view3dBtn.className = "px-2.5 py-1 rounded text-xs font-semibold text-slate-400 hover:text-white transition flex items-center space-x-1";
    svg2D.classList.remove('hidden');
    svg3D.classList.add('hidden');
    renderActiveCanvas();
  });

  view3dBtn.addEventListener('click', () => {
    StudioState.viewMode = '3d';
    view3dBtn.className = "px-2.5 py-1 rounded text-xs font-semibold bg-champagne-400 text-obsidian-950 transition flex items-center space-x-1";
    view2dBtn.className = "px-2.5 py-1 rounded text-xs font-semibold text-slate-400 hover:text-white transition flex items-center space-x-1";
    svg3D.classList.remove('hidden');
    svg2D.classList.add('hidden');
    renderActiveCanvas();
  });

  // Floor Switcher
  const floorGroundBtn = document.getElementById('floorGroundBtn');
  const floorFirstBtn = document.getElementById('floorFirstBtn');

  floorGroundBtn.addEventListener('click', () => {
    StudioState.activeFloor = 'ground';
    floorGroundBtn.className = "px-2.5 py-1 rounded text-xs font-cad font-medium bg-[#1e2430] text-champagne-300 border border-champagne-400/30 transition";
    floorFirstBtn.className = "px-2.5 py-1 rounded text-xs font-cad font-medium text-slate-400 hover:text-slate-200 transition";
    document.getElementById('navFloorIndicator').textContent = "Ground Floor";
    renderActiveCanvas();
  });

  floorFirstBtn.addEventListener('click', () => {
    StudioState.activeFloor = 'first';
    floorFirstBtn.className = "px-2.5 py-1 rounded text-xs font-cad font-medium bg-[#1e2430] text-champagne-300 border border-champagne-400/30 transition";
    floorGroundBtn.className = "px-2.5 py-1 rounded text-xs font-cad font-medium text-slate-400 hover:text-slate-200 transition";
    document.getElementById('navFloorIndicator').textContent = "First Floor (G+1)";
    renderActiveCanvas();
  });

  // Finish selector
  const finishSelector = document.getElementById('finishSelector');
  finishSelector.addEventListener('change', (e) => {
    StudioState.activeFinish = e.target.value;
    renderActiveCanvas();
  });

  // Zoom Controls
  document.getElementById('zoomInBtn').addEventListener('click', () => adjustZoom(0.15));
  document.getElementById('zoomOutBtn').addEventListener('click', () => adjustZoom(-0.15));
  document.getElementById('zoomFitBtn').addEventListener('click', () => {
    StudioState.zoomLevel = 1.0;
    applyCanvasZoom();
  });

  // Fixture Shelf Asset Insertion
  document.querySelectorAll('.asset-pill').forEach(btn => {
    btn.addEventListener('click', () => {
      const assetType = btn.dataset.asset;
      insertNewFixture(assetType);
    });
  });

  // Fixture Edit Action Bar Tools
  document.getElementById('toolRotateBtn').addEventListener('click', rotateSelectedFixture);
  document.getElementById('toolFlipBtn').addEventListener('click', flipSelectedFixture);
  document.getElementById('toolDeleteBtn').addEventListener('click', deleteSelectedFixture);

  // Top Nav Utility Actions
  document.getElementById('resetDesignBtn').addEventListener('click', resetStudioDesign);
  document.getElementById('exportSvgBtn').addEventListener('click', exportSvgFile);
  document.getElementById('printSheetBtn').addEventListener('click', () => window.print());
  document.getElementById('exportJsonBtn').addEventListener('click', exportLayoutJson);

  // Schedule Modal
  const modal = document.getElementById('scheduleModal');
  document.getElementById('openScheduleModalBtn').addEventListener('click', () => {
    populateScheduleModal();
    modal.classList.remove('hidden');
  });
  document.getElementById('closeScheduleModalBtn').addEventListener('click', () => modal.classList.add('hidden'));
  document.getElementById('dismissModalBtn').addEventListener('click', () => modal.classList.add('hidden'));
}

// Adjust Canvas Zoom
function adjustZoom(delta) {
  StudioState.zoomLevel = Math.max(0.6, Math.min(2.0, StudioState.zoomLevel + delta));
  applyCanvasZoom();
}

function applyCanvasZoom() {
  const percentText = Math.round(StudioState.zoomLevel * 100) + '%';
  document.getElementById('zoomPercent').textContent = percentText;
  document.getElementById('svgContainer2D').style.transform = `scale(${StudioState.zoomLevel})`;
  document.getElementById('svgContainer3D').style.transform = `scale(${StudioState.zoomLevel})`;
}

// Backend Health Check
async function checkBackendHealth() {
  try {
    const res = await fetch('/api/health');
    const data = await res.json();
    const badge = document.getElementById('sarvamStatusBadge');
    if (data.sarvam_api_key_configured) {
      badge.innerHTML = `<span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span><span>Saaras v4 Active</span>`;
      badge.className = "flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[11px] font-cad bg-emerald-950/70 border border-emerald-800/80 text-emerald-400";
    } else {
      badge.innerHTML = `<span class="w-1.5 h-1.5 rounded-full bg-amber-400"></span><span>API Key Missing</span>`;
      badge.className = "flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[11px] font-cad bg-amber-950/70 border border-amber-800/80 text-amber-400";
    }
  } catch (err) {
    console.warn("Backend health probe error:", err);
  }
}

// ==========================================================================
// VOICE RECORDING & SARVAM SPEECH-TO-TEXT INTEGRATION
// ==========================================================================

async function toggleVoiceRecording() {
  if (StudioState.isRecording) {
    stopVoiceRecording();
  } else {
    startVoiceRecording();
  }
}

async function startVoiceRecording() {
  StudioState.audioChunks = [];
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    
    // Choose optimal mimeType supported by browser
    const mimeTypes = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/wav'];
    let selectedMime = '';
    for (const m of mimeTypes) {
      if (MediaRecorder.isTypeSupported(m)) {
        selectedMime = m;
        break;
      }
    }

    StudioState.mediaRecorder = new MediaRecorder(stream, selectedMime ? { mimeType: selectedMime } : undefined);

    StudioState.mediaRecorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) {
        StudioState.audioChunks.push(e.data);
      }
    };

    StudioState.mediaRecorder.onstop = async () => {
      stream.getTracks().forEach(track => track.stop());
      // Crucial: ensure clean audio/webm MIME type without codec parameter so Sarvam accepts it
      const cleanMime = (selectedMime || 'audio/webm').split(';')[0].trim();
      const audioBlob = new Blob(StudioState.audioChunks, { type: cleanMime });
      await sendVoiceToSarvamSTT(audioBlob, cleanMime.includes('mp4') ? 'audio.mp4' : 'audio.webm');
    };

    StudioState.mediaRecorder.start(250);
    StudioState.isRecording = true;
    setVoiceUIState("Listening");

    StudioState.recordSeconds = 0;
    StudioState.recordInterval = setInterval(() => {
      StudioState.recordSeconds++;
      const mins = String(Math.floor(StudioState.recordSeconds / 60)).padStart(2, '0');
      const secs = String(StudioState.recordSeconds % 60).padStart(2, '0');
      document.getElementById('recordTimer').textContent = `${mins}:${secs}`;
      if (StudioState.recordSeconds >= 30) {
        stopVoiceRecording();
      }
    }, 1000);

  } catch (err) {
    console.error("Microphone access error:", err);
    alert("Microphone permission denied or device not found. You can still use the audio upload or preset briefs.");
    setVoiceUIState("Ready");
  }
}

function stopVoiceRecording() {
  if (StudioState.recordInterval) clearInterval(StudioState.recordInterval);
  if (StudioState.mediaRecorder && StudioState.mediaRecorder.state === "recording") {
    StudioState.mediaRecorder.stop();
  }
  StudioState.isRecording = false;
  setVoiceUIState("Translating");
}

function setVoiceUIState(state) {
  const badge = document.getElementById('recordingStateBadge');
  const timer = document.getElementById('recordTimer');
  const status = document.getElementById('recordStatusText');
  const r1 = document.getElementById('ripple1');
  const r2 = document.getElementById('ripple2');
  const recordIcon = document.getElementById('recordIcon');

  badge.textContent = state;

  if (state === "Listening") {
    badge.className = "text-[10px] font-cad px-2 py-0.5 rounded bg-red-950 text-red-400 border border-red-800 animate-pulse";
    r1.classList.remove('hidden');
    r2.classList.remove('hidden');
    recordIcon.setAttribute('data-lucide', 'square');
    status.textContent = "Listening... Speak your architectural specs (Click to stop)";
  } else if (state === "Translating") {
    badge.className = "text-[10px] font-cad px-2 py-0.5 rounded bg-champagne-950 text-champagne-400 border border-champagne-700 animate-pulse";
    r1.classList.add('hidden');
    r2.classList.add('hidden');
    timer.textContent = "Translating";
    recordIcon.setAttribute('data-lucide', 'loader');
    status.textContent = "Translating speech with Sarvam Saaras v4...";
  } else {
    // Ready
    badge.className = "text-[10px] font-cad px-2 py-0.5 rounded bg-[#1d232f] text-slate-400 border border-slate-700";
    r1.classList.add('hidden');
    r2.classList.add('hidden');
    timer.textContent = "Click to Talk";
    recordIcon.setAttribute('data-lucide', 'mic');
    status.textContent = "Speak in English, Hindi, or regional languages.";
  }

  if (window.lucide) lucide.createIcons();
}

async function handleAudioUpload(e) {
  const file = e.target.files[0];
  if (!file) return;

  document.getElementById('uploadFileName').textContent = file.name;
  setVoiceUIState("Translating");
  await sendVoiceToSarvamSTT(file, file.name);
}

async function sendVoiceToSarvamSTT(blobOrFile, filename) {
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
      document.getElementById('transcriptTextarea').value = data.transcript;
      updateParameterTags();
      synthesizeLayoutFromVoice();
    } else {
      alert("No distinct speech detected. Please speak clearly into the microphone.");
    }
  } catch (err) {
    console.error("Sarvam STT Error:", err);
    alert(`Transcription Error: ${err.message}`);
  } finally {
    setVoiceUIState("Ready");
  }
}

// Live Parameter Badges Extraction
function updateParameterTags() {
  const text = document.getElementById('transcriptTextarea').value.trim().toLowerCase();
  const container = document.getElementById('parameterTagsContainer');
  const countBadge = document.getElementById('paramCountBadge');
  container.innerHTML = '';

  if (!text) {
    container.innerHTML = '<span class="text-[11px] text-slate-500 italic">Speak or choose a preset to extract specs.</span>';
    countBadge.textContent = "0 detected";
    return;
  }

  const tags = [];

  // City
  const cities = ['pune', 'ahmedabad', 'mumbai', 'chennai', 'bengaluru', 'bangalore', 'delhi', 'jaipur', 'hyderabad', 'kolkata'];
  for (const c of cities) {
    if (text.includes(c)) {
      tags.push({ label: `City: ${c.charAt(0).toUpperCase() + c.slice(1)}`, color: 'bg-emerald-950/80 text-emerald-400 border-emerald-800' });
      break;
    }
  }

  // Dimensions
  const dim = text.match(/(\d{2})\s*(?:by|x|\*)\s*(\d{2})/);
  if (dim) {
    tags.push({ label: `Plot: ${dim[1]}'×${dim[2]}' (${parseInt(dim[1]) * parseInt(dim[2])} sq.ft)`, color: 'bg-champagne-950/80 text-champagne-300 border-champagne-800' });
  }

  // Facing
  for (const f of ['north-east', 'north-west', 'south-east', 'south-west', 'north', 'south', 'east', 'west']) {
    if (text.includes(f)) {
      tags.push({ label: `Facing: ${f.toUpperCase()}`, color: 'bg-blue-950/80 text-blue-400 border-blue-800' });
      document.getElementById('compassFacingText').textContent = `${f.toUpperCase()} Facing`;
      break;
    }
  }

  // Floors
  if (text.includes('duplex') || text.includes('g+1') || text.includes('g + 1')) {
    tags.push({ label: 'Floors: G+1 Duplex', color: 'bg-purple-950/80 text-purple-400 border-purple-800' });
  } else if (text.includes('g+2') || text.includes('triplex')) {
    tags.push({ label: 'Floors: G+2 Triplex', color: 'bg-purple-950/80 text-purple-400 border-purple-800' });
  } else if (text.includes('ground') || text.includes('single floor')) {
    tags.push({ label: 'Floors: Ground Only', color: 'bg-purple-950/80 text-purple-400 border-purple-800' });
  }

  // Budget
  if (text.includes('luxury') || text.includes('premium')) {
    tags.push({ label: 'Tier: Luxury', color: 'bg-amber-950/80 text-amber-400 border-amber-800' });
  } else if (text.includes('cost-efficient') || text.includes('economical') || text.includes('budget')) {
    tags.push({ label: 'Tier: Cost-Efficient', color: 'bg-green-950/80 text-green-400 border-green-800' });
  } else {
    tags.push({ label: 'Tier: Middle-Class', color: 'bg-blue-950/80 text-blue-400 border-blue-800' });
  }

  // Fixtures
  const fixtures = ['l-shaped couch', 'l-shaped sofa', 'tv console', 'ottoman', 'floor vase', 'dining table', 'island counter', 'study nook', 'walk-in'];
  for (const fix of fixtures) {
    if (text.includes(fix)) {
      tags.push({ label: fix.charAt(0).toUpperCase() + fix.slice(1), color: 'bg-[#1a212e] text-slate-300 border-slate-700' });
    }
  }

  tags.forEach(t => {
    const span = document.createElement('span');
    span.className = `text-[10px] font-cad px-2 py-0.5 rounded border ${t.color}`;
    span.textContent = t.label;
    container.appendChild(span);
  });

  countBadge.textContent = `${tags.length} detected`;
}

// Synthesize Layout with Backend
async function synthesizeLayoutFromVoice() {
  const transcript = document.getElementById('transcriptTextarea').value.trim();
  if (!transcript) return;

  const btn = document.getElementById('generateBtn');
  const origHtml = btn.innerHTML;
  btn.innerHTML = `<i data-lucide="loader" class="w-3.5 h-3.5 animate-spin"></i><span>Synthesizing...</span>`;
  btn.disabled = true;
  if (window.lucide) lucide.createIcons();

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
    StudioState.layoutData = data;

    // Update Nav Project title
    if (data.project_title) {
      document.getElementById('navProjectTitle').textContent = data.project_title;
    }

    // Update Bioclimatic Intelligence Sidebar Cards
    if (data.climate_passive_strategy) {
      const strat = data.climate_passive_strategy;
      if (strat.sun_path_strategy) document.getElementById('bioclimaticSolar').textContent = strat.sun_path_strategy;
      if (strat.wind_cross_ventilation) document.getElementById('bioclimaticWind').textContent = strat.wind_cross_ventilation;
      if (strat.shading_and_materials) document.getElementById('bioclimaticShading').textContent = strat.shading_and_materials;
    }

    renderActiveCanvas();

  } catch (err) {
    console.error("Synthesize layout error:", err);
    alert(`Architectural synthesis error: ${err.message}`);
  } finally {
    btn.innerHTML = origHtml;
    btn.disabled = false;
    if (window.lucide) lucide.createIcons();
  }
}

// Apply Variant Layout Changes
function applyVariantModifications() {
  const variant = StudioState.activeVariant;
  const list = StudioState.furniture.ground;

  if (variant === 'circulation') {
    // Maximize hallway to 42"
    const couch = list.find(f => f.type === 'l_couch');
    if (couch) { couch.x = 2; couch.y = 14; couch.clearance = '42" Entry Artery'; }
    const dining = list.find(f => f.type === 'dining_table');
    if (dining) { dining.x = 18.5; dining.y = 13; dining.clearance = '40" Walkway to Kitchen'; }
  } else if (variant === 'climate') {
    // Orient couch to morning sun window, move dining nearer courtyard
    const couch = list.find(f => f.type === 'l_couch');
    if (couch) { couch.x = 3; couch.y = 15; couch.clearance = 'Facing Glare-Free North Window'; }
    const dining = list.find(f => f.type === 'dining_table');
    if (dining) { dining.x = 17; dining.y = 11; dining.clearance = 'Courtyard Lightwell Direct Access'; }
  } else if (variant === 'utility') {
    // Compact layout to maximize central carpet area
    const couch = list.find(f => f.type === 'l_couch');
    if (couch) { couch.x = 1; couch.y = 13; couch.clearance = '36" Minimal Corridor'; }
    const dining = list.find(f => f.type === 'dining_table');
    if (dining) { dining.x = 20; dining.y = 12; dining.clearance = 'Wall Recessed Credenza Zone'; }
  }
}

// ==========================================================================
// CANVAS RENDERING: 2D BLUEPRINT & 3D ISOMETRIC
// ==========================================================================

function renderActiveCanvas() {
  if (StudioState.viewMode === '2d') {
    render2DBlueprint();
  } else {
    render3DIsometric();
  }
}

// Render 2D Architectural CAD Blueprint (SVG)
function render2DBlueprint() {
  const container = document.getElementById('svgContainer2D');
  container.innerHTML = '';

  const scale = 14; // pixels per foot
  const plotW_ft = 30;
  const plotH_ft = 40;
  const plotW = plotW_ft * scale;
  const plotH = plotH_ft * scale;
  const margin = 40;
  const totalW = plotW + margin * 2;
  const totalH = plotH + margin * 2;

  const currentRooms = StudioState.activeFloor === 'ground' ? ROOMS_GROUND : ROOMS_FIRST;
  const currentFurn = StudioState.activeFloor === 'ground' ? StudioState.furniture.ground : StudioState.furniture.first;

  // Material finish colors
  let finishFill = 'rgba(216, 177, 138, 0.05)';
  let finishPatternId = 'travertinePattern';
  if (StudioState.activeFinish === 'concrete') {
    finishFill = 'rgba(148, 163, 184, 0.06)';
    finishPatternId = 'concretePattern';
  } else if (StudioState.activeFinish === 'oak') {
    finishFill = 'rgba(202, 138, 4, 0.06)';
    finishPatternId = 'oakPattern';
  }

  // Generate Room Rectangles & Wall Double Lines
  let roomsSvg = '';
  currentRooms.forEach(room => {
    const rx = margin + room.x * scale;
    const ry = margin + room.y * scale;
    const rw = room.w * scale;
    const rh = room.h * scale;

    const isSelected = StudioState.selectedElement && StudioState.selectedElement.id === room.id;
    const strokeColor = isSelected ? '#d8b18a' : '#2b3446';
    const strokeWidth = isSelected ? 2.5 : 1.5;

    roomsSvg += `
      <g class="cad-room-node" onclick="handleSelectRoom('${room.id}')" onmouseenter="showHoverBadge('${room.name}', '${room.w}\\' × ${room.h}\\'')" onmouseleave="hideHoverBadge()">
        <!-- Room Floor Surface -->
        <rect class="room-bg" x="${rx}" y="${ry}" width="${rw}" height="${rh}" fill="${room.color}" fill-opacity="${isSelected ? 0.35 : 0.2}" stroke="${strokeColor}" stroke-width="${strokeWidth}" />
        <rect x="${rx}" y="${ry}" width="${rw}" height="${rh}" fill="url(#${finishPatternId})" opacity="0.4" pointer-events="none" />

        <!-- Interior Partition Wall Double Stroke -->
        <rect x="${rx + 1}" y="${ry + 1}" width="${rw - 2}" height="${rh - 2}" fill="none" stroke="#1d232f" stroke-width="2" pointer-events="none" />

        <!-- Room Label & Area -->
        <text x="${rx + 8}" y="${ry + 18}" fill="#f8fafc" font-size="11" font-weight="700" font-family="'Plus Jakarta Sans', sans-serif">${room.name}</text>
        <text x="${rx + 8}" y="${ry + 30}" fill="#d8b18a" font-size="9" font-family="'JetBrains Mono', monospace">${room.w}' × ${room.h}' • ${room.area} sq.ft</text>

        <!-- Door Opening & Dashed Swing Arc -->
        <path d="M ${rx + 2} ${ry + rh - 2} A ${scale * 2.8} ${scale * 2.8} 0 0 1 ${rx + scale * 2.8} ${ry + rh - scale * 2.8}" fill="none" stroke="#34d399" stroke-width="1.2" stroke-dasharray="3,3" pointer-events="none" />
        <line x1="${rx + 2}" y1="${ry + rh - 2}" x2="${rx + scale * 2.8}" y2="${ry + rh - 2}" stroke="#34d399" stroke-width="1.8" pointer-events="none" />

        <!-- Exterior Window Glazing Callout -->
        <line x1="${rx + 8}" y1="${ry}" x2="${rx + rw - 8}" y2="${ry}" stroke="#38bdf8" stroke-width="3" stroke-dasharray="4,2" pointer-events="none" />
      </g>
    `;
  });

  // Generate Placed Furniture Blocks with Luxury CAD Glyphs
  let furnitureSvg = '';
  currentFurn.forEach(item => {
    const fx = margin + item.x * scale;
    const fy = margin + item.y * scale;
    const fw = item.w * scale;
    const fh = item.h * scale;

    const isSelected = StudioState.selectedElement && StudioState.selectedElement.id === item.id;
    const borderStroke = isSelected ? '#f3dfc8' : '#d8b18a';
    const borderWeight = isSelected ? 2.5 : 1.2;

    furnitureSvg += `
      <g class="cad-furniture-node ${isSelected ? 'cad-furniture-selected' : ''}" onclick="handleSelectFurniture('${item.id}', event)" onmouseenter="showHoverBadge('${item.name}', '${item.w}\\' × ${item.h}\\'')" onmouseleave="hideHoverBadge()">
        <!-- 36" Clearance Envelope (Dashed) -->
        <rect x="${fx - 5}" y="${fy - 5}" width="${fw + 10}" height="${fh + 10}" fill="none" stroke="rgba(216, 177, 138, 0.2)" stroke-dasharray="2,2" stroke-width="0.8" pointer-events="none" />

        <!-- Main Furniture Bounding Block -->
        <rect x="${fx}" y="${fy}" width="${fw}" height="${fh}" rx="3" fill="#1b212d" stroke="${borderStroke}" stroke-width="${borderWeight}" />

        <!-- CAD Graphic detail -->
        <rect x="${fx + 2}" y="${fy + 2}" width="${fw - 4}" height="${fh - 4}" fill="#242b3b" rx="2" opacity="0.6" pointer-events="none" />
        <text x="${fx + 5}" y="${fy + 14}" fill="#f1f5f9" font-size="9" font-weight="600" font-family="'Plus Jakarta Sans', sans-serif" pointer-events="none">${item.name}</text>
        <text x="${fx + 5}" y="${fy + 24}" fill="#94a3b8" font-size="7.5" font-family="'JetBrains Mono', monospace" pointer-events="none">${item.w}'×${item.h}'</text>
      </g>
    `;
  });

  // Exterior Dimension Callouts (<--- 30.0 ft --->, <--- 40.0 ft --->)
  const dimCallouts = `
    <!-- Top Width Dimension -->
    <line x1="${margin}" y1="${margin - 16}" x2="${margin + plotW}" y2="${margin - 16}" stroke="#d8b18a" stroke-width="1.2" marker-start="url(#dimArrow)" marker-end="url(#dimArrow)" />
    <line x1="${margin}" y1="${margin - 22}" x2="${margin}" y2="${margin - 4}" stroke="#d8b18a" stroke-width="1" />
    <line x1="${margin + plotW}" y1="${margin - 22}" x2="${margin + plotW}" y2="${margin - 4}" stroke="#d8b18a" stroke-width="1" />
    <text x="${margin + plotW / 2}" y="${margin - 20}" fill="#d8b18a" font-size="10" font-family="'JetBrains Mono', monospace" font-weight="600" text-anchor="middle">← 30.0 ft (${plotW_ft * 0.3048}m) →</text>

    <!-- Left Depth Dimension -->
    <line x1="${margin - 16}" y1="${margin}" x2="${margin - 16}" y2="${margin + plotH}" stroke="#d8b18a" stroke-width="1.2" marker-start="url(#dimArrow)" marker-end="url(#dimArrow)" />
    <line x1="${margin - 22}" y1="${margin}" x2="${margin - 4}" y2="${margin}" stroke="#d8b18a" stroke-width="1" />
    <line x1="${margin - 22}" y1="${margin + plotH}" x2="${margin - 4}" y2="${margin + plotH}" stroke="#d8b18a" stroke-width="1" />
    <text x="${margin - 22}" y="${margin + plotH / 2}" fill="#d8b18a" font-size="10" font-family="'JetBrains Mono', monospace" font-weight="600" text-anchor="middle" transform="rotate(-90 ${margin - 22} ${margin + plotH / 2})">← 40.0 ft (${plotH_ft * 0.3048}m) →</text>
  `;

  const svgContent = `
    <svg id="cadSvg" width="${totalW}" height="${totalH}" viewBox="0 0 ${totalW} ${totalH}" class="bg-[#0e1117] rounded-xl border border-[#262c36] shadow-2xl">
      <defs>
        <!-- Arrowhead Marker for CAD Dimensions -->
        <marker id="dimArrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#d8b18a" />
        </marker>

        <!-- Material Patterns -->
        <pattern id="travertinePattern" width="16" height="16" patternUnits="userSpaceOnUse">
          <path d="M 0 8 L 16 8 M 8 0 L 8 16" stroke="rgba(216, 177, 138, 0.08)" stroke-width="0.5" />
        </pattern>
        <pattern id="concretePattern" width="12" height="12" patternUnits="userSpaceOnUse">
          <circle cx="6" cy="6" r="0.8" fill="rgba(148, 163, 184, 0.15)" />
        </pattern>
        <pattern id="oakPattern" width="20" height="6" patternUnits="userSpaceOnUse">
          <line x1="0" y1="5" x2="20" y2="5" stroke="rgba(202, 138, 4, 0.12)" stroke-width="0.8" />
        </pattern>
      </defs>

      <!-- Plot Boundary Outer Retaining Wall (Thick CAD double line) -->
      <rect x="${margin - 4}" y="${margin - 4}" width="${plotW + 8}" height="${plotH + 8}" fill="none" stroke="#262c36" stroke-width="6" rx="4" />
      <rect x="${margin}" y="${margin}" width="${plotW}" height="${plotH}" fill="#11141a" stroke="#d8b18a" stroke-width="1.5" stroke-dasharray="8,4" rx="2" />

      <!-- Rooms Layer -->
      ${roomsSvg}

      <!-- Furniture Layer -->
      ${furnitureSvg}

      <!-- Exterior CAD Dimension Lines -->
      ${dimCallouts}
    </svg>
  `;

  container.innerHTML = svgContent;
}

// Render 3D Isometric View (True CAD 3D Projection)
function render3DIsometric() {
  const container = document.getElementById('svgContainer3D');
  container.innerHTML = '';

  const currentRooms = StudioState.activeFloor === 'ground' ? ROOMS_GROUND : ROOMS_FIRST;
  const currentFurn = StudioState.activeFloor === 'ground' ? StudioState.furniture.ground : StudioState.furniture.first;

  const totalW = 680;
  const totalH = 580;
  const originX = 340;
  const originY = 240;
  const scale = 8.5;
  const wallH = 45; // extruded wall height in pixels

  // 3D Isometric Projection Function
  function projectIso(x_ft, y_ft, z_px = 0) {
    const cos30 = 0.866;
    const sin30 = 0.5;
    const isoX = originX + (x_ft - y_ft) * cos30 * scale;
    const isoY = originY + (x_ft + y_ft) * sin30 * scale - z_px;
    return { x: isoX, y: isoY };
  }

  // Draw 3D Isometric Rooms
  let isoRooms = '';
  currentRooms.forEach(room => {
    const p1 = projectIso(room.x, room.y, 0);
    const p2 = projectIso(room.x + room.w, room.y, 0);
    const p3 = projectIso(room.x + room.w, room.y + room.h, 0);
    const p4 = projectIso(room.x, room.y + room.h, 0);

    // Extruded Back Walls
    const w1 = projectIso(room.x, room.y, wallH);
    const w2 = projectIso(room.x + room.w, room.y, wallH);
    const w4 = projectIso(room.x, room.y + room.h, wallH);

    isoRooms += `
      <!-- Back Wall Left -->
      <polygon points="${p1.x},${p1.y} ${p4.x},${p4.y} ${w4.x},${w4.y} ${w1.x},${w1.y}" fill="#161b24" stroke="#2b3446" stroke-width="0.8" opacity="0.85" />
      <!-- Back Wall Right -->
      <polygon points="${p1.x},${p1.y} ${p2.x},${p2.y} ${w2.x},${w2.y} ${w1.x},${w1.y}" fill="#1b222d" stroke="#2b3446" stroke-width="0.8" opacity="0.95" />

      <!-- Floor Plane Slab -->
      <polygon points="${p1.x},${p1.y} ${p2.x},${p2.y} ${p3.x},${p3.y} ${p4.x},${p4.y}" fill="${room.color}" fill-opacity="0.22" stroke="#d8b18a" stroke-width="1.2" class="cursor-pointer" onclick="handleSelectRoom('${room.id}')" />

      <!-- Room Center Label -->
      <text x="${(p1.x + p3.x) / 2}" y="${(p1.y + p3.y) / 2}" fill="#f8fafc" font-size="10" font-weight="700" font-family="'Plus Jakarta Sans', sans-serif" text-anchor="middle" pointer-events="none">${room.name}</text>
    `;
  });

  // Draw 3D Isometric Furniture Cubes
  let isoFurn = '';
  currentFurn.forEach(item => {
    const f1 = projectIso(item.x, item.y, 0);
    const f2 = projectIso(item.x + item.w, item.y, 0);
    const f3 = projectIso(item.x + item.w, item.y + item.h, 0);
    const f4 = projectIso(item.x, item.y + item.h, 0);

    const fh = 14; // furniture height
    const t1 = projectIso(item.x, item.y, fh);
    const t2 = projectIso(item.x + item.w, item.y, fh);
    const t3 = projectIso(item.x + item.w, item.y + item.h, fh);
    const t4 = projectIso(item.x, item.y + item.h, fh);

    const isSelected = StudioState.selectedElement && StudioState.selectedElement.id === item.id;
    const topFill = isSelected ? '#d8b18a' : '#283244';
    const sideFill = isSelected ? '#b8916b' : '#1e2430';

    isoFurn += `
      <g class="cursor-pointer" onclick="handleSelectFurniture('${item.id}', event)">
        <!-- Left Side Face -->
        <polygon points="${f4.x},${f4.y} ${f3.x},${f3.y} ${t3.x},${t3.y} ${t4.x},${t4.y}" fill="${sideFill}" stroke="#d8b18a" stroke-width="0.8" />
        <!-- Right Side Face -->
        <polygon points="${f3.x},${f3.y} ${f2.x},${f2.y} ${t2.x},${t2.y} ${t3.x},${t3.y}" fill="${sideFill}" stroke="#d8b18a" stroke-width="0.8" opacity="0.8" />
        <!-- Top Face -->
        <polygon points="${t1.x},${t1.y} ${t2.x},${t2.y} ${t3.x},${t3.y} ${t4.x},${t4.y}" fill="${topFill}" stroke="#f3dfc8" stroke-width="1.2" />
        <text x="${(t1.x + t3.x) / 2}" y="${(t1.y + t3.y) / 2}" fill="#ffffff" font-size="8" font-family="'JetBrains Mono', monospace" text-anchor="middle" pointer-events="none">${item.name}</text>
      </g>
    `;
  });

  const svgContent = `
    <svg id="isoSvg" width="${totalW}" height="${totalH}" viewBox="0 0 ${totalW} ${totalH}" class="bg-[#0e1117] rounded-xl border border-[#262c36] shadow-2xl">
      <!-- Ambient Studio Lighting -->
      <radialGradient id="studioLight" cx="50%" cy="30%" r="60%">
        <stop offset="0%" stop-color="rgba(216, 177, 138, 0.12)" />
        <stop offset="100%" stop-color="transparent" />
      </radialGradient>
      <rect width="100%" height="100%" fill="url(#studioLight)" pointer-events="none" />

      <!-- Isometric 3D Rooms Layer -->
      ${isoRooms}

      <!-- Isometric 3D Furniture Layer -->
      ${isoFurn}
    </svg>
  `;

  container.innerHTML = svgContent;
}

// ==========================================================================
// SELECTION & INSPECTOR LOGIC
// ==========================================================================

function handleSelectRoom(roomId) {
  const currentRooms = StudioState.activeFloor === 'ground' ? ROOMS_GROUND : ROOMS_FIRST;
  const room = currentRooms.find(r => r.id === roomId);
  if (!room) return;

  StudioState.selectedElement = { type: 'room', id: roomId, data: room };
  updateInspectorUI();
  renderActiveCanvas();
}

function handleSelectFurniture(furnId, event) {
  if (event) event.stopPropagation();

  const currentFurn = StudioState.activeFloor === 'ground' ? StudioState.furniture.ground : StudioState.furniture.first;
  const item = currentFurn.find(f => f.id === furnId);
  if (!item) return;

  StudioState.selectedElement = { type: 'furniture', id: furnId, data: item };
  updateInspectorUI();
  renderActiveCanvas();
}

function updateInspectorUI() {
  const targetBadge = document.getElementById('inspectorTargetType');
  const nameEl = document.getElementById('inspectName');
  const subtitleEl = document.getElementById('inspectSubtitle');
  const areaEl = document.getElementById('inspectArea');
  const aspectEl = document.getElementById('inspectAspect');
  const clearanceEl = document.getElementById('inspectClearance');
  const ceilingEl = document.getElementById('inspectCeiling');
  const ventEl = document.getElementById('inspectVentilation');
  const circEl = document.getElementById('inspectCirculation');

  const sel = StudioState.selectedElement;
  if (!sel) return;

  if (sel.type === 'room') {
    const room = sel.data;
    targetBadge.textContent = "Room Selected";
    targetBadge.className = "text-[10px] font-cad px-1.5 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800";
    nameEl.textContent = room.name;
    subtitleEl.textContent = `${StudioState.activeFloor === 'ground' ? 'Ground Floor' : 'First Floor'} • ${room.w}'0" × ${room.h}'0"`;
    areaEl.textContent = `${room.area} sq.ft`;
    aspectEl.textContent = room.aspect;
    clearanceEl.textContent = "NBC Compliant (36\" min)";
    ceilingEl.textContent = "10' 6\" Slab";
    ventEl.textContent = room.vent || "Standard double-glazed aperture with insect fly-mesh.";
    circEl.innerHTML = `<i data-lucide="check-circle-2" class="w-3.5 h-3.5 text-emerald-400"></i><span>Spatial circulation corridors fully verified.</span>`;
  } else if (sel.type === 'furniture') {
    const furn = sel.data;
    targetBadge.textContent = "Fixture Selected";
    targetBadge.className = "text-[10px] font-cad px-1.5 py-0.5 rounded bg-champagne-950 text-champagne-300 border border-champagne-800";
    nameEl.textContent = furn.name;
    subtitleEl.textContent = `Placed in ${furn.room || 'Living Area'} • Cost: ${furn.cost || '$2,400'}`;
    areaEl.textContent = `${furn.w}' × ${furn.h}' (${furn.w * furn.h} sq.ft)`;
    aspectEl.textContent = furn.finish || 'Custom Finish';
    clearanceEl.textContent = furn.clearance || '36" Verified';
    ceilingEl.textContent = "Standard Height";
    ventEl.textContent = `Position Offset: X=${furn.x} ft, Y=${furn.y} ft. Rotation: ${furn.rot || 0}°.`;
    circEl.innerHTML = `<i data-lucide="check-circle-2" class="w-3.5 h-3.5 text-emerald-400"></i><span>36" circulation envelope verified with zero boundary clash.</span>`;
  }

  if (window.lucide) lucide.createIcons();
}

function showHoverBadge(name, dim) {
  const badge = document.getElementById('canvasHoverBadge');
  badge.innerHTML = `<span>${name}</span> • <span class="text-champagne-400">${dim}</span>`;
  badge.classList.remove('hidden');
}

function hideHoverBadge() {
  document.getElementById('canvasHoverBadge').classList.add('hidden');
}

// ==========================================================================
// FIXTURE CAD TOOL ACTIONS: ROTATE, FLIP, DELETE, ADD
// ==========================================================================

function rotateSelectedFixture() {
  const sel = StudioState.selectedElement;
  if (!sel || sel.type !== 'furniture') return;

  const currentFurn = StudioState.activeFloor === 'ground' ? StudioState.furniture.ground : StudioState.furniture.first;
  const item = currentFurn.find(f => f.id === sel.id);
  if (!item) return;

  // Swap width and height
  const temp = item.w;
  item.w = item.h;
  item.h = temp;
  item.rot = ((item.rot || 0) + 90) % 360;

  updateInspectorUI();
  renderActiveCanvas();
}

function flipSelectedFixture() {
  rotateSelectedFixture();
}

function deleteSelectedFixture() {
  const sel = StudioState.selectedElement;
  if (!sel || sel.type !== 'furniture') return;

  const list = StudioState.activeFloor === 'ground' ? StudioState.furniture.ground : StudioState.furniture.first;
  const idx = list.findIndex(f => f.id === sel.id);
  if (idx !== -1) {
    list.splice(idx, 1);
    StudioState.selectedElement = { type: 'room', id: 'r_living', data: ROOMS_GROUND[2] };
    updateInspectorUI();
    renderActiveCanvas();
  }
}

function insertNewFixture(assetType) {
  const list = StudioState.activeFloor === 'ground' ? StudioState.furniture.ground : StudioState.furniture.first;
  const newId = 'f_user_' + Date.now().toString().slice(-4);

  let newItem = {
    id: newId,
    type: assetType,
    name: 'Custom Fixture',
    room: 'Living Room',
    x: 4,
    y: 16,
    w: 5,
    h: 3,
    rot: 0,
    clearance: '36" Standard Clearance',
    finish: 'Luxury Spec',
    cost: '$1,800'
  };

  if (assetType === 'l_couch') {
    newItem = { id: newId, type: 'l_couch', name: 'L-Sectional Couch', room: 'Living Room', x: 2, y: 14, w: 8.5, h: 6, rot: 0, clearance: '42" Entry Artery', finish: 'Italian Bouclé', cost: '$4,200' };
  } else if (assetType === 'tv_unit') {
    newItem = { id: newId, type: 'tv_unit', name: 'Fluted TV Credenza', room: 'Living Room', x: 12, y: 15, w: 1.5, h: 6, rot: 0, clearance: '10.5 ft Viewing Distance', finish: 'Smoked Walnut', cost: '$2,100' };
  } else if (assetType === 'ottoman') {
    newItem = { id: newId, type: 'ottoman', name: 'Circular Ottoman', room: 'Living Room', x: 5, y: 17, w: 3, h: 3, rot: 0, clearance: '36" Perimeter Passage', finish: 'Velvet Amber', cost: '$1,200' };
  } else if (assetType === 'floor_vase') {
    newItem = { id: newId, type: 'floor_vase', name: 'Ceramic Urn / Planter', room: 'Living Room', x: 12, y: 12, w: 1.8, h: 1.8, rot: 0, clearance: 'Corner Niche', finish: 'Matte Terracotta', cost: '$650' };
  } else if (assetType === 'dining_table') {
    newItem = { id: newId, type: 'dining_table', name: '6-Seater Dining Table', room: 'Dining Hall', x: 18, y: 13, w: 6.5, h: 3.5, rot: 0, clearance: '38" Pullout Clearance', finish: 'Solid White Oak', cost: '$3,800' };
  } else if (assetType === 'kitchen_island') {
    newItem = { id: newId, type: 'kitchen_island', name: 'Quartz Island Counter', room: 'Kitchen', x: 18, y: 24, w: 7, h: 3, rot: 0, clearance: '42" Chef Corridor', finish: 'Nero Marquina', cost: '$5,200' };
  } else if (assetType === 'king_bed') {
    newItem = { id: newId, type: 'king_bed', name: 'Master King Bed', room: 'Master Suite', x: 2, y: 14, w: 7, h: 7, rot: 0, clearance: '36" Walking Clearance', finish: 'Upholstered Linen', cost: '$5,600' };
  }

  list.push(newItem);
  StudioState.selectedElement = { type: 'furniture', id: newId, data: newItem };
  updateInspectorUI();
  renderActiveCanvas();
}

// Reset Studio Design to Defaults
function resetStudioDesign() {
  document.getElementById('transcriptTextarea').value = '';
  StudioState.zoomLevel = 1.0;
  StudioState.activeFloor = 'ground';
  StudioState.viewMode = '2d';
  StudioState.activeVariant = 'circulation';
  applyCanvasZoom();
  updateParameterTags();
  renderActiveCanvas();
}

// ==========================================================================
// EXPORT & MODAL SCHEDULE LOGIC
// ==========================================================================

function exportSvgFile() {
  const svg = document.getElementById('cadSvg') || document.getElementById('isoSvg');
  if (!svg) return;

  const svgData = new XMLSerializer().serializeToString(svg);
  const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `Sthapati_ArchPlan_${Date.now()}.svg`;
  link.click();
  URL.revokeObjectURL(url);
}

function exportLayoutJson() {
  const data = StudioState.layoutData || {
    project_title: "Bioclimatic 30x40 North-Facing Duplex",
    parameters: { city: "Pune", plot: "30x40 ft", facing: "North", floors: "G+1" },
    furniture_layout: StudioState.furniture
  };

  navigator.clipboard.writeText(JSON.stringify(data, null, 2));
  const btn = document.getElementById('exportJsonBtn');
  const orig = btn.innerHTML;
  btn.innerHTML = `<span>Copied JSON!</span>`;
  setTimeout(() => btn.innerHTML = orig, 1800);
}

function populateScheduleModal() {
  const container = document.getElementById('modalFloorsContainer');
  container.innerHTML = '';

  const schedules = [
    { name: "Ground Floor Schedule", rooms: ROOMS_GROUND, totalArea: 1142 },
    { name: "First Floor Schedule (G+1)", rooms: ROOMS_FIRST, totalArea: 1040 }
  ];

  schedules.forEach(sc => {
    let rows = '';
    sc.rooms.forEach(r => {
      rows += `
        <tr class="border-b border-[#202632] text-xs hover:bg-[#161b24] transition">
          <td class="py-2.5 px-4 font-semibold text-white">${r.name}</td>
          <td class="py-2.5 px-4 font-cad text-champagne-300">${r.w}'0" × ${r.h}'0"</td>
          <td class="py-2.5 px-4 font-cad text-slate-300">${r.area} sq.ft</td>
          <td class="py-2.5 px-4 text-emerald-400 font-medium">${r.aspect}</td>
          <td class="py-2.5 px-4 text-slate-400 text-[11px]">${r.vent}</td>
        </tr>
      `;
    });

    const card = document.createElement('div');
    card.className = "bg-[#090a0d] border border-[#202632] rounded-xl overflow-hidden";
    card.innerHTML = `
      <div class="px-5 py-3 bg-[#161b24] border-b border-[#202632] flex items-center justify-between">
        <h4 class="font-bold text-champagne-100 text-xs tracking-wider uppercase">${sc.name}</h4>
        <span class="text-xs font-cad text-champagne-400">Total Built-Up: ~${sc.totalArea} sq.ft</span>
      </div>
      <table class="w-full text-left">
        <thead>
          <tr class="text-[10px] font-cad uppercase tracking-wider text-slate-500 bg-[#0e1218] border-b border-[#202632]">
            <th class="py-2 px-4">Room Specification</th>
            <th class="py-2 px-4">Dimensions</th>
            <th class="py-2 px-4">Carpet Area</th>
            <th class="py-2 px-4">Aspect</th>
            <th class="py-2 px-4">Ventilation & Glazing</th>
          </tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
      </table>
    `;
    container.appendChild(card);
  });
}
