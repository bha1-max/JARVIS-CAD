const STORAGE_KEY = "dispatchDesk.v2";
const OPERATOR_NUMBER = "17249";

const defaultData = {
  operatorNumber: OPERATOR_NUMBER,
  stationAssignment: "Set Station",
  asoStatus: "Not in Service",
  beltLineStatus: "Not in Service",
  breakTimes: [
    { time: "", taken: false },
    { time: "", taken: false }
  ],
  selectedCategory: "Adults",
  phraseCategoryOrder: ["Adults", "Children", "Elderly", "Fall / On Ground"],
  selectedNoteId: null,
  customNotes: [
    {
      id: crypto.randomUUID(),
      title: "REPO Calls",
      body: "- Location\n- Caller Name\n  - Company Name\n- Callback Number\n- Vehicle CYMBALS\n- Is the vehicle owner aware of tow?\n- Who is the lien holder?"
    },
    {
      id: crypto.randomUUID(),
      title: "Street Parking",
      body: "- Location\n- Vehicle CYMBALS\n- Issue: blocked driveway, fire hydrant, abandoned, no-parking zone, timed restriction, or hazard\n- Ask how long the vehicle has been there\n- Confirm whether the caller wants contact or is only reporting"
    },
    {
      id: crypto.randomUUID(),
      title: "Private Parking",
      body: "- Location\n  - Location of vehicle on property\n- Ask whether the caller is the property owner, manager, resident, employee, or visitor\n- Vehicle CYMBALS\n- \"Are you wanting the vehicle to be ticketed or towed?\"\n- \"Are you authorized for the ticket or tow process?\""
    },
    {
      id: crypto.randomUUID(),
      title: "Traffic Complaints",
      body: "- Location, DOT/LSH\n- Vehicle CYMBALS\n- Behavior: AOTR, speeding, reckless driving, DUI suspicion, road rage, racing, wrong-way, or hazard\n- \"Do you want contact from an officer regarding this incident?\"\n- Confirm whether the caller is following the vehicle and remind them to stay safe if needed per policy"
    },
    {
      id: crypto.randomUUID(),
      title: "TOT State Patrol",
      body: "- \"I'm going to connect us with state patrol. I'm going to talk at the beginning and will prompt you when you are okay to proceed with your information\"\n\n- \"Hey State it's Dane with a caller on the line. Location is [LOCATION], caller is reporting a [COMPLAINT], callers name and number is [NAME & NUMBER]. [CALLER] you can continue the conversation with state patrol now.\""
    },
    {
      id: crypto.randomUUID(),
      title: "DP-Stations",
      body: "**MPD Dispatchers**\nDP4 (West, Midtown, South)\nDP5 (Central, North, East)\nDP3 (Primary TAC (Fire+PD) / covers MPD breaks / CT)\n\n**Sub-Law Dispatchers**\nDP6 (County-wide)\nDP2 (Sub-Law Backup / CT)\nDP3 (Primary TAC (Fire+PD) and covers MPD breaks / CT)\n\n**Fire Dispatchers**\nDP10 (County-wide Fire/EMS)\nDP9 (City Fire/EMS)\nDP3 (Primary TAC (Fire+PD) and covers MPD breaks / CT)\n\n**Data**\nDP14\nDP13 (Data backup / CT)\n\n**TAC Dispatchers**\nDP3 (Primary TAC (Fire+PD) and covers MPD breaks / CT)\n\n**Calltakers**\nDP1\nDP2 (Sub-Law Backup / CT)\nDP3 (Primary TAC (Fire+PD) / covers MPD breaks / CT)\nDP7 (Fire Backup)\nDP8\nDP13 (Data Backup)\nDP15\nDP16\nDP17\nDP18\nDP19\nDP20\nDP21\n\n**Supervisors**\nDP11\nDP12"
    }
  ],
  phrases: {
    Adults: [
      { id: crypto.randomUUID(), text: "I am still here with you. Keep your phone nearby and let me know right away if anything changes." },
      { id: crypto.randomUUID(), text: "You are doing the right thing by staying on the line. I am listening and will keep updating the call notes." },
      { id: crypto.randomUUID(), text: "Take a slow breath if you can. Tell me what you are seeing or hearing right now." }
    ],
    Children: [
      { id: crypto.randomUUID(), text: "You are doing a good job talking with me. Can you tell me your name and where you are in the house?" },
      { id: crypto.randomUUID(), text: "Stay where you are safe. Keep the phone with you and answer my questions one at a time." },
      { id: crypto.randomUUID(), text: "I know this feels scary. I am going to stay on the phone and listen while help is being sent." }
    ],
    Elderly: [
      { id: crypto.randomUUID(), text: "I am right here with you. Please do not try to move unless it is necessary for your immediate safety." },
      { id: crypto.randomUUID(), text: "Keep taking comfortable breaths. Tell me if your pain, breathing, or alertness changes." },
      { id: crypto.randomUUID(), text: "If someone is nearby, let me know their name and whether they can come to the phone." }
    ],
    "Fall / On Ground": [
      { id: crypto.randomUUID(), text: "Try to stay as still and comfortable as you can. Let me know if you feel any new pain or dizziness." },
      { id: crypto.randomUUID(), text: "Do not rush to get up right now. I want to make sure we keep track of how you are feeling." },
      { id: crypto.randomUUID(), text: "Can you wiggle your fingers and toes for me? Tell me if anything feels numb, weak, or different." }
    ]
  },
  prcfsStatuses: [],
  channelUses: [],
  echoCalls: [],
  dispatcherAlerts: []
};

let data = loadData();
let pendingDialogAction = null;
let activeBreakIndex = null;
const acknowledgedBreakAlerts = new Set();

const els = {
  operatorNumber: document.querySelector("#operatorNumber"),
  stationButton: document.querySelector("#stationButton"),
  stationAssignment: document.querySelector("#stationAssignment"),
  asoButton: document.querySelector("#asoButton"),
  asoStatus: document.querySelector("#asoStatus"),
  beltLineButton: document.querySelector("#beltLineButton"),
  beltLineStatus: document.querySelector("#beltLineStatus"),
  breakTimesButton: document.querySelector("#breakTimesButton"),
  breakTimes: document.querySelector("#breakTimes"),
  resetBreakTimesButton: document.querySelector("#resetBreakTimesButton"),
  breakOverlay: document.querySelector("#breakOverlay"),
  returnBreakButton: document.querySelector("#returnBreakButton"),
  breakDueOverlay: document.querySelector("#breakDueOverlay"),
  ackBreakButton: document.querySelector("#ackBreakButton"),
  echoAlert: document.querySelector("#echoAlert"),
  echoAlertSummary: document.querySelector("#echoAlertSummary"),
  echoAlertList: document.querySelector("#echoAlertList"),
  addEchoButton: document.querySelector("#addEchoButton"),
  echoForm: document.querySelector("#echoForm"),
  echoCallInput: document.querySelector("#echoCallInput"),
  echoList: document.querySelector("#echoList"),
  prcfsAlert: document.querySelector("#prcfsAlert"),
  prcfsAlertSummary: document.querySelector("#prcfsAlertSummary"),
  prcfsAlertList: document.querySelector("#prcfsAlertList"),
  channelUseAlert: document.querySelector("#channelUseAlert"),
  channelUseAlertSummary: document.querySelector("#channelUseAlertSummary"),
  channelUseAlertList: document.querySelector("#channelUseAlertList"),
  addNoteTabButton: document.querySelector("#addNoteTabButton"),
  noteSelector: document.querySelector("#noteSelector"),
  editNoteButton: document.querySelector("#editNoteButton"),
  deleteNoteButton: document.querySelector("#deleteNoteButton"),
  noteView: document.querySelector("#noteView"),
  saveBackupButton: document.querySelector("#saveBackupButton"),
  addPhraseButton: document.querySelector("#addPhraseButton"),
  addPhraseSectionButton: document.querySelector("#addPhraseSectionButton"),
  deletePhraseSectionButton: document.querySelector("#deletePhraseSectionButton"),
  categoryTabs: document.querySelector("#categoryTabs"),
  phraseList: document.querySelector("#phraseList"),
  weatherForm: document.querySelector("#weatherForm"),
  weatherAddressInput: document.querySelector("#weatherAddressInput"),
  weatherAddressChoice: document.querySelector("#weatherAddressChoice"),
  weatherSearchButton: document.querySelector("#weatherSearchButton"),
  weatherResult: document.querySelector("#weatherResult"),
  addPrcfsButton: document.querySelector("#addPrcfsButton"),
  prcfsForm: document.querySelector("#prcfsForm"),
  prcfsChannelInput: document.querySelector("#prcfsChannelInput"),
  prcfsStatusInput: document.querySelector("#prcfsStatusInput"),
  prcfsList: document.querySelector("#prcfsList"),
  addChannelUseButton: document.querySelector("#addChannelUseButton"),
  channelUseForm: document.querySelector("#channelUseForm"),
  channelUseInput: document.querySelector("#channelUseInput"),
  callIdInput: document.querySelector("#callIdInput"),
  channelUseList: document.querySelector("#channelUseList"),
  addDispatcherAlertButton: document.querySelector("#addDispatcherAlertButton"),
  dispatcherAlertForm: document.querySelector("#dispatcherAlertForm"),
  dispatcherAlertInput: document.querySelector("#dispatcherAlertInput"),
  dispatcherAlertList: document.querySelector("#dispatcherAlertList"),
  dispatcherAlertBanner: document.querySelector("#dispatcherAlertBanner"),
  dispatcherAlertSummary: document.querySelector("#dispatcherAlertSummary"),
  dialog: document.querySelector("#editDialog"),
  dialogForm: document.querySelector("#dialogForm"),
  dialogTitle: document.querySelector("#dialogTitle"),
  dialogFields: document.querySelector("#dialogFields")
};

function loadData() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return prepareData(structuredClone(defaultData));

  try {
    const parsed = JSON.parse(saved);
    return prepareData({
      ...structuredClone(defaultData),
      ...parsed,
      phrases: {
        ...structuredClone(defaultData.phrases),
        ...(parsed.phrases || {})
      },
      phraseCategoryOrder: parsed.phraseCategoryOrder || Object.keys(parsed.phrases || defaultData.phrases)
    });
  } catch {
    return prepareData(structuredClone(defaultData));
  }
}

function prepareData(nextData) {
  delete nextData.bolos;
  nextData.operatorNumber = OPERATOR_NUMBER;
  if (!Array.isArray(nextData.customNotes) || !nextData.customNotes.length) {
    nextData.customNotes = structuredClone(defaultData.customNotes);
  }
  syncDefaultCustomNotes(nextData);
  if (!nextData.selectedNoteId || !nextData.customNotes.some((note) => note.id === nextData.selectedNoteId)) {
    nextData.selectedNoteId = nextData.customNotes[0]?.id || null;
  }
  if (!nextData.stationAssignment) nextData.stationAssignment = "Set Station";
  if (!nextData.asoStatus) nextData.asoStatus = "Not in Service";
  if (!nextData.beltLineStatus) nextData.beltLineStatus = "Not in Service";
  nextData.breakTimes = normalizeBreakTimes(nextData.breakTimes);
  if (!Array.isArray(nextData.echoCalls)) nextData.echoCalls = [];
  if (!Array.isArray(nextData.prcfsStatuses)) nextData.prcfsStatuses = [];
  if (!Array.isArray(nextData.channelUses)) nextData.channelUses = [];
  if (!Array.isArray(nextData.dispatcherAlerts)) nextData.dispatcherAlerts = [];
  nextData.phraseCategoryOrder = normalizePhraseOrder(nextData.phraseCategoryOrder, nextData.phrases);
  if (!nextData.phrases[nextData.selectedCategory]) {
    nextData.selectedCategory = nextData.phraseCategoryOrder[0];
  }
  return nextData;
}

function normalizeBreakTimes(breakTimes) {
  const normalized = Array.isArray(breakTimes) ? breakTimes.slice(0, 2) : [];
  while (normalized.length < 2) normalized.push({ time: "", taken: false });
  return normalized.map((item) => {
    if (typeof item === "string") return { time: item, taken: false };
    return {
      time: normalizeMilitaryTime(item?.time || ""),
      taken: Boolean(item?.taken)
    };
  });
}

function syncDefaultCustomNotes(nextData) {
  defaultData.customNotes.forEach((defaultNote) => {
    const existingNote = nextData.customNotes.find((note) => note.title === defaultNote.title);
    if (!existingNote) {
      nextData.customNotes.push(structuredClone(defaultNote));
    }
  });
}

function normalizePhraseOrder(order, phrases) {
  const phraseKeys = Object.keys(phrases || {});
  const ordered = Array.isArray(order) ? order.filter((key) => phraseKeys.includes(key)) : [];
  phraseKeys.forEach((key) => {
    if (!ordered.includes(key)) ordered.push(key);
  });
  return ordered;
}

function saveData() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function saveBackupFile() {
  saveData();
  showBackupSavedState();
}

function showBackupSavedState() {
  const originalText = els.saveBackupButton.textContent;
  els.saveBackupButton.textContent = "Saved";
  window.setTimeout(() => {
    els.saveBackupButton.textContent = originalText;
  }, 1400);
}

function render() {
  data.operatorNumber = OPERATOR_NUMBER;
  els.operatorNumber.textContent = OPERATOR_NUMBER;
  els.stationAssignment.textContent = data.stationAssignment || "Set Station";
  els.asoStatus.textContent = data.asoStatus;
  els.beltLineStatus.textContent = data.beltLineStatus;
  renderBreakTimes();
  els.asoButton.classList.toggle("is-service-active", data.asoStatus === "In-Service");
  els.beltLineButton.classList.toggle("is-service-active", data.beltLineStatus === "In-Service");
  renderEchoAlert();
  renderPrcfsAlert();
  renderChannelUseAlert();
  renderCustomNotes();
  renderCategories();
  renderPhrases();
  renderDispatcherAlerts();
  renderEchoCalls();
  renderPrcfsStatuses();
  renderChannelUses();
}

function renderBreakTimes() {
  const breaks = normalizeBreakTimes(data.breakTimes);
  data.breakTimes = breaks;
  const now = getWisconsinNow();
  const states = breaks.map((item) => getBreakState(item, now));
  const labels = breaks
    .map((item, index) => {
      if (!item.time) return "";
      const state = states[index];
      const prefix = item.taken ? "\u2713 " : state.due ? "! " : "";
      return `${prefix}${item.time}`;
    })
    .filter(Boolean);

  els.breakTimes.textContent = labels.length ? labels.join(" / ") : "Set Breaks";
  els.breakTimesButton.classList.toggle("is-break-due", states.some((state) => state.due));
  els.breakTimesButton.classList.toggle("is-breaks-complete", breaks.every((item) => item.time && item.taken));
  els.breakTimesButton.classList.toggle("has-break-taken", breaks.some((item) => item.taken) && !breaks.every((item) => item.time && item.taken));
  renderBreakDueOverlay(states);
}

function renderBreakDueOverlay(states) {
  const dueIndex = states.findIndex((state, index) => state.due && !acknowledgedBreakAlerts.has(index));
  const shouldShow = dueIndex >= 0 && els.breakOverlay.hidden;
  els.breakDueOverlay.hidden = !shouldShow;
  document.body.classList.toggle("has-break-alert", shouldShow);
  if (shouldShow) els.ackBreakButton.focus();
}

function getWisconsinNow() {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Chicago",
    hour12: false,
    hour: "2-digit",
    minute: "2-digit"
  }).formatToParts(new Date());
  const hour = Number(parts.find((part) => part.type === "hour")?.value || 0);
  const minute = Number(parts.find((part) => part.type === "minute")?.value || 0);
  return { hour: hour === 24 ? 0 : hour, minute };
}

function getBreakState(item, now) {
  const target = parseBreakTime(item.time);
  if (!target || item.taken) return { due: false };
  const nowMinutes = now.hour * 60 + now.minute;
  const targetMinutes = target.hour * 60 + target.minute;
  return { due: nowMinutes >= targetMinutes };
}

function parseBreakTime(value) {
  const text = normalizeMilitaryTime(value);
  if (!text) return null;
  const match = text.match(/^(\d{2}):(\d{2})$/);
  if (!match) return null;
  const hour = Number(match[1]);
  const minute = Number(match[2]);
  if (hour > 23 || minute > 59) return null;
  return { hour, minute };
}

function normalizeMilitaryTime(value) {
  const digits = String(value || "").replace(/\D/g, "").slice(0, 4);
  if (!digits) return "";
  if (digits.length <= 2) return digits;
  if (digits.length === 3 && Number(digits.slice(0, 2)) > 23) return `0${digits.slice(0, 1)}:${digits.slice(1)}`;
  if (digits.length === 3) return `${digits.slice(0, 2)}:${digits.slice(2)}`;
  return `${digits.slice(0, 2)}:${digits.slice(2)}`;
}

function completeMilitaryTime(value) {
  const rawDigits = String(value || "").replace(/\D/g, "");
  let digits = rawDigits.padStart(4, "0").slice(-4);
  if (rawDigits.length === 3) {
    digits = Number(rawDigits.slice(0, 2)) > 23 ? `0${rawDigits}` : `${rawDigits}0`;
  }
  const hour = Number(digits.slice(0, 2));
  const minute = Number(digits.slice(2));
  if (hour > 23 || minute > 59) return "";
  return `${digits.slice(0, 2)}:${digits.slice(2)}`;
}

function renderEchoAlert() {
  els.echoAlertList.innerHTML = "";

  if (!data.echoCalls.length) {
    els.echoAlert.classList.remove("is-active");
    els.echoAlert.open = false;
    els.echoAlertSummary.textContent = "No Active ECHOs";
    els.echoAlertList.append(emptyState("No active ECHOs."));
    return;
  }

  const chips = data.echoCalls
    .map((item) => `<span>#${escapeHtml(item.callId)}</span>`)
    .join("");

  els.echoAlert.classList.add("is-active");
  els.echoAlertSummary.innerHTML = `<strong>ACTIVE ECHOS:</strong><span class="banner-chips">${chips}</span>`;
  data.echoCalls.forEach((item) => {
    els.echoAlertList.append(statusBannerRow(`#${item.callId}`, () => deleteEchoCall(item.id)));
  });
}

function renderPrcfsAlert() {
  const activeStatuses = data.prcfsStatuses.filter((item) => item.status !== "Clear");
  els.prcfsAlertList.innerHTML = "";

  if (!activeStatuses.length) {
    els.prcfsAlert.classList.remove("is-active");
    els.prcfsAlert.open = false;
    els.prcfsAlertSummary.textContent = "No PRCFS";
    els.prcfsAlertList.append(emptyState("No active PRCFS."));
    return;
  }

  const chips = activeStatuses
    .map((item) => `<span>${escapeHtml(item.channel)}${item.status === "Holding" ? " - HOLDING" : ""}</span>`)
    .join("");

  els.prcfsAlert.classList.add("is-active");
  els.prcfsAlertSummary.innerHTML = `<strong>PRCFS IN PROGRESS:</strong><span class="banner-chips">${chips}</span>`;
  activeStatuses.forEach((item) => {
    const label = `${item.channel}${item.status === "Holding" ? " - Holding" : ""}`;
    els.prcfsAlertList.append(statusBannerRow(label, () => deletePrcfsStatus(item.id)));
  });
}

function renderChannelUseAlert() {
  els.channelUseAlertList.innerHTML = "";

  if (!data.channelUses.length) {
    els.channelUseAlert.classList.remove("is-active");
    els.channelUseAlert.open = false;
    els.channelUseAlertSummary.textContent = "No channels in use";
    els.channelUseAlertList.append(emptyState("No channels in use."));
    return;
  }

  const chips = data.channelUses
    .map((item) => `<span>${escapeHtml(item.channel)} #${escapeHtml(item.callId)}</span>`)
    .join("");

  els.channelUseAlert.classList.add("is-active");
  els.channelUseAlertSummary.innerHTML = `<strong>CHANNELS IN USE:</strong><span class="banner-chips">${chips}</span>`;
  data.channelUses.forEach((item) => {
    els.channelUseAlertList.append(statusBannerRow(`${item.channel} #${item.callId}`, () => deleteChannelUse(item.id)));
  });
}

function statusBannerRow(text, onClear) {
  const row = document.createElement("article");
  row.className = "banner-item";
  const label = document.createElement("span");
  label.textContent = text;
  row.append(label, iconButton("-", "tool-icon delete-button", "Clear item", onClear));
  return row;
}

function renderCustomNotes() {
  els.noteSelector.innerHTML = "";
  els.noteView.innerHTML = "";

  if (!data.customNotes.length) {
    els.editNoteButton.disabled = true;
    els.deleteNoteButton.disabled = true;
    els.noteView.append(emptyState("No custom notes yet."));
    return;
  }

  const activeNote = data.customNotes.find((note) => note.id === data.selectedNoteId) || data.customNotes[0];
  data.selectedNoteId = activeNote.id;
  data.customNotes.forEach((note) => {
    const option = document.createElement("option");
    option.value = note.id;
    option.textContent = note.title;
    option.selected = note.id === activeNote.id;
    els.noteSelector.append(option);
  });
  els.editNoteButton.disabled = false;
  els.deleteNoteButton.disabled = false;

  const noteCard = document.createElement("article");
  noteCard.className = "note-card";

  const body = renderNoteBody(activeNote.body);

  noteCard.append(body);
  els.noteView.append(noteCard);
}

function renderNoteBody(text) {
  const body = document.createElement("div");
  body.className = "note-body";

  String(text || "").split("\n").forEach((line) => {
    const row = document.createElement(line.trim() ? "p" : "div");
    const heading = line.trim().match(/^\*\*(.+)\*\*$/);
    if (heading) {
      const strong = document.createElement("strong");
      strong.textContent = heading[1];
      row.append(strong);
    } else {
      row.textContent = line || "\u00a0";
    }
    body.append(row);
  });

  return body;
}

function renderCategories() {
  els.categoryTabs.innerHTML = "";

  data.phraseCategoryOrder.forEach((category) => {
    const tab = document.createElement("button");
    tab.className = "tab-button";
    tab.type = "button";
    tab.role = "tab";
    tab.draggable = true;
    tab.textContent = category;
    tab.setAttribute("aria-selected", String(category === data.selectedCategory));
    tab.addEventListener("click", () => {
      data.selectedCategory = category;
      saveData();
      render();
    });
    tab.addEventListener("dragstart", (event) => {
      event.dataTransfer.setData("text/plain", category);
      event.dataTransfer.effectAllowed = "move";
    });
    tab.addEventListener("dragover", (event) => {
      event.preventDefault();
      event.dataTransfer.dropEffect = "move";
    });
    tab.addEventListener("drop", (event) => {
      event.preventDefault();
      const draggedCategory = event.dataTransfer.getData("text/plain");
      reorderPhraseCategory(draggedCategory, category);
    });
    els.categoryTabs.append(tab);
  });
}

function renderPhrases() {
  els.phraseList.innerHTML = "";
  const phrases = data.phrases[data.selectedCategory] || [];

  if (!phrases.length) {
    els.phraseList.append(emptyState("No phrases in this category yet."));
    return;
  }

  phrases.forEach((phrase) => {
    const card = document.createElement("article");
    card.className = "phrase-card";

    const text = document.createElement("p");
    text.className = "phrase-text";
    text.textContent = phrase.text;

    const actions = document.createElement("div");
    actions.className = "card-actions";
    actions.append(
      button("Copy", "text-button", () => copyText(phrase.text)),
      iconButton("\u270e", "tool-icon edit-button", "Edit phrase", () => editPhrase(phrase.id)),
      iconButton("-", "tool-icon delete-button", "Delete phrase", () => deletePhrase(phrase.id))
    );

    card.append(text, actions);
    els.phraseList.append(card);
  });
}

function renderDispatcherAlerts() {
  els.dispatcherAlertList.innerHTML = "";

  if (!data.dispatcherAlerts.length) {
    els.dispatcherAlertBanner.classList.remove("is-active");
    els.dispatcherAlertBanner.open = false;
    els.dispatcherAlertSummary.textContent = "No Dispatcher Alerts";
    els.dispatcherAlertList.append(emptyState("No dispatcher alerts."));
    return;
  }

  els.dispatcherAlertBanner.classList.add("is-active");
  const chips = data.dispatcherAlerts
    .map((item) => `<span>${escapeHtml(item.text)}</span>`)
    .join("");
  els.dispatcherAlertSummary.innerHTML = `<strong>DISPATCHER ALERTS:</strong><span class="banner-chips">${chips}</span>`;
  data.dispatcherAlerts.forEach((item) => {
    const card = document.createElement("article");
    card.className = "status-card micro-card";
    const label = document.createElement("div");
    label.className = "alert-note";
    label.textContent = item.text;
    card.append(label, iconButton("-", "tool-icon delete-button", "Clear dispatcher alert", () => deleteDispatcherAlert(item.id)));
    els.dispatcherAlertList.append(card);
  });
}

function renderEchoCalls() {
  els.echoList.innerHTML = "";

  if (!data.echoCalls.length) {
    els.echoList.append(emptyState("No active ECHOs."));
    return;
  }

  data.echoCalls.forEach((item) => {
    const card = document.createElement("article");
    card.className = "status-card";
    card.innerHTML = `
      <div>
        <div class="status-channel">#${escapeHtml(item.callId)}</div>
      </div>
    `;
    card.append(iconButton("-", "tool-icon delete-button", "Clear ECHO call", () => deleteEchoCall(item.id)));
    els.echoList.append(card);
  });
}

function renderPrcfsStatuses() {
  els.prcfsList.innerHTML = "";

  if (!data.prcfsStatuses.length) {
    els.prcfsList.append(emptyState("No PRCFS channels added."));
    return;
  }

  data.prcfsStatuses.forEach((item) => {
    const card = document.createElement("article");
    card.className = "status-card";
    card.innerHTML = `
      <div>
        <div class="status-channel">${escapeHtml(item.channel)}</div>
        ${item.status === "Holding" ? `<div class="status-pill">Holding</div>` : ""}
      </div>
    `;
    card.append(iconButton("-", "tool-icon delete-button", "Clear PRCFS status", () => deletePrcfsStatus(item.id)));
    els.prcfsList.append(card);
  });
}

function renderChannelUses() {
  els.channelUseList.innerHTML = "";

  if (!data.channelUses.length) {
    els.channelUseList.append(emptyState("No channels in use."));
    return;
  }

  data.channelUses.forEach((item) => {
    const card = document.createElement("article");
    card.className = "status-card";
    card.innerHTML = `
      <div>
        <div class="status-channel">${escapeHtml(item.channel)}</div>
        <div class="call-id">#${escapeHtml(item.callId)}</div>
      </div>
    `;
    card.append(iconButton("-", "tool-icon delete-button", "Clear channel in use", () => deleteChannelUse(item.id)));
    els.channelUseList.append(card);
  });
}

function openDialog(title, fields, onSave) {
  els.dialogTitle.textContent = title;
  els.dialogFields.innerHTML = "";
  pendingDialogAction = onSave;

  fields.forEach((field) => {
    const label = document.createElement("label");
    const span = document.createElement("span");
    const input = field.multiline ? document.createElement("textarea") : document.createElement("input");

    span.textContent = field.label;
    input.name = field.name;
    if (field.type === "checkbox") {
      input.type = "checkbox";
      input.checked = Boolean(field.checked);
      label.className = "checkbox-field";
    } else {
      input.type = field.type || "text";
      input.value = field.value || "";
    }
    input.required = Boolean(field.required);
    if (field.maxLength) input.maxLength = field.maxLength;
    if (field.inputMode) input.inputMode = field.inputMode;
    if (field.pattern) input.pattern = field.pattern;
    if (field.placeholder) input.placeholder = field.placeholder;
    if (field.className) input.className = field.className;

    label.append(span, input);
    els.dialogFields.append(label);
  });

  els.dialog.showModal();
  const firstInput = els.dialogFields.querySelector("input, textarea");
  firstInput?.focus();
}

function editStationAssignment() {
  openDialog(
    "Station Assignment",
    [{ label: "Station Assignment", name: "stationAssignment", value: data.stationAssignment === "Set Station" ? "" : data.stationAssignment, required: true }],
    (values) => {
      data.stationAssignment = values.stationAssignment.trim();
      saveData();
      render();
    }
  );
}

function toggleServiceStatus(key) {
  data[key] = data[key] === "In-Service" ? "Not in Service" : "In-Service";
  saveData();
  render();
}

function editBreakTimes() {
  const breaks = normalizeBreakTimes(data.breakTimes);
  openDialog(
    "Break Times",
    [
      { label: "Break 1", name: "break1", value: breaks[0].time, placeholder: "HH:MM", maxLength: 5, inputMode: "numeric", pattern: "[0-9]{2}:[0-9]{2}", className: "military-time-input" },
      { label: "Break 1 Taken", name: "break1Taken", type: "checkbox", checked: breaks[0].taken },
      { label: "Break 2", name: "break2", value: breaks[1].time, placeholder: "HH:MM", maxLength: 5, inputMode: "numeric", pattern: "[0-9]{2}:[0-9]{2}", className: "military-time-input" },
      { label: "Break 2 Taken", name: "break2Taken", type: "checkbox", checked: breaks[1].taken }
    ],
    (values) => {
      const break1 = completeMilitaryTime(values.break1);
      const break2 = completeMilitaryTime(values.break2);
      data.breakTimes = [
        { time: break1, taken: values.break1Taken === "on" },
        { time: break2, taken: values.break2Taken === "on" }
      ];
      saveData();
      render();
    }
  );
  wireBreakTimeDialog();
}

function handleBreakTimesClick() {
  const now = getWisconsinNow();
  const dueIndex = data.breakTimes.findIndex((item) => getBreakState(item, now).due);
  if (dueIndex >= 0) {
    startBreak(dueIndex);
    return;
  }
  editBreakTimes();
}

function wireBreakTimeDialog() {
  els.dialogFields.querySelectorAll(".military-time-input").forEach((input) => {
    input.addEventListener("input", () => {
      input.value = normalizeMilitaryTime(input.value);
    });
    input.addEventListener("blur", () => {
      input.value = completeMilitaryTime(input.value) || input.value;
    });
  });

  const forceButton = document.createElement("button");
  forceButton.type = "button";
  forceButton.className = "force-break-button";
  forceButton.textContent = "Force Break";
  forceButton.addEventListener("click", () => {
    pendingDialogAction = null;
    els.dialog.close();
    startBreak(null);
  });
  els.dialogFields.append(forceButton);
}

function startBreak(index) {
  activeBreakIndex = Number.isInteger(index) ? index : null;
  els.breakDueOverlay.hidden = true;
  document.body.classList.remove("has-break-alert");
  els.breakOverlay.hidden = false;
  document.body.classList.add("is-on-break");
  els.returnBreakButton.focus();
}

function returnFromBreak() {
  if (activeBreakIndex !== null && data.breakTimes[activeBreakIndex]) {
    data.breakTimes[activeBreakIndex].taken = true;
    acknowledgedBreakAlerts.delete(activeBreakIndex);
  }
  activeBreakIndex = null;
  els.breakOverlay.hidden = true;
  document.body.classList.remove("is-on-break");
  saveData();
  render();
}

function acknowledgeBreakAlert() {
  const now = getWisconsinNow();
  const dueIndex = data.breakTimes.findIndex((item, index) => getBreakState(item, now).due && !acknowledgedBreakAlerts.has(index));
  if (dueIndex >= 0) acknowledgedBreakAlerts.add(dueIndex);
  els.breakDueOverlay.hidden = true;
  document.body.classList.remove("has-break-alert");
  renderBreakTimes();
}

function resetBreakTimes(event) {
  event.stopPropagation();
  acknowledgedBreakAlerts.clear();
  data.breakTimes = [
    { time: "", taken: false },
    { time: "", taken: false }
  ];
  saveData();
  render();
  editBreakTimes();
}

function addNoteTab() {
  openDialog(
    "Add Custom Note",
    [
      { label: "Tab Name", name: "title", required: true, placeholder: "Noise Complaint, Tow Info, Alarm Call" },
      { label: "Notes", name: "body", required: true, multiline: true }
    ],
    (values) => {
      const note = { id: crypto.randomUUID(), title: values.title.trim(), body: values.body.trim() };
      data.customNotes.push(note);
      data.selectedNoteId = note.id;
      saveData();
      render();
    }
  );
}

function editNoteTab(id) {
  const note = data.customNotes.find((item) => item.id === id);
  if (!note) return;

  openDialog(
    "Edit Custom Note",
    [
      { label: "Tab Name", name: "title", value: note.title, required: true },
      { label: "Notes", name: "body", value: note.body, required: true, multiline: true }
    ],
    (values) => {
      note.title = values.title.trim();
      note.body = values.body.trim();
      saveData();
      render();
    }
  );
}

function deleteNoteTab(id) {
  data.customNotes = data.customNotes.filter((note) => note.id !== id);
  data.selectedNoteId = data.customNotes[0]?.id || null;
  saveData();
  render();
}

function addPhrase() {
  openDialog(
    `Add Phrase: ${data.selectedCategory}`,
    [{ label: "Phrase", name: "text", required: true, multiline: true }],
    (values) => {
      data.phrases[data.selectedCategory].push({ id: crypto.randomUUID(), text: values.text.trim() });
      saveData();
      render();
    }
  );
}

function addPhraseSection() {
  openDialog(
    "Add Phrase Section",
    [{ label: "Section Name", name: "sectionName", required: true, placeholder: "Spanish, Domestic, Mental Health" }],
    (values) => {
      const sectionName = values.sectionName.trim();
      if (!sectionName || data.phrases[sectionName]) return;

      data.phrases[sectionName] = [];
      data.phraseCategoryOrder.push(sectionName);
      data.selectedCategory = sectionName;
      saveData();
      render();
    }
  );
}

function deletePhraseSection() {
  if (data.phraseCategoryOrder.length <= 1) return;

  const category = data.selectedCategory;
  delete data.phrases[category];
  data.phraseCategoryOrder = data.phraseCategoryOrder.filter((item) => item !== category);
  data.selectedCategory = data.phraseCategoryOrder[0];
  saveData();
  render();
}

function reorderPhraseCategory(draggedCategory, targetCategory) {
  if (!draggedCategory || draggedCategory === targetCategory) return;

  const nextOrder = data.phraseCategoryOrder.filter((category) => category !== draggedCategory);
  const targetIndex = nextOrder.indexOf(targetCategory);
  nextOrder.splice(targetIndex, 0, draggedCategory);
  data.phraseCategoryOrder = nextOrder;
  saveData();
  renderCategories();
}

function editPhrase(id) {
  const phrase = data.phrases[data.selectedCategory].find((item) => item.id === id);
  if (!phrase) return;

  openDialog(
    "Edit Phrase",
    [{ label: "Phrase", name: "text", value: phrase.text, required: true, multiline: true }],
    (values) => {
      phrase.text = values.text.trim();
      saveData();
      render();
    }
  );
}

function deletePhrase(id) {
  data.phrases[data.selectedCategory] = data.phrases[data.selectedCategory].filter((phrase) => phrase.id !== id);
  saveData();
  render();
}

function addEchoCall() {
  const callId = els.echoCallInput.value.trim();

  if (!/^\d{1,3}$/.test(callId)) {
    els.echoCallInput.reportValidity();
    return;
  }

  data.echoCalls.unshift({ id: crypto.randomUUID(), callId });
  els.echoForm.reset();
  els.echoCallInput.focus();
  saveData();
  renderEchoAlert();
  renderEchoCalls();
}

function deleteEchoCall(id) {
  data.echoCalls = data.echoCalls.filter((item) => item.id !== id);
  saveData();
  renderEchoAlert();
  renderEchoCalls();
}

function addPrcfsStatus() {
  const channel = els.prcfsChannelInput.value.trim().toUpperCase();
  const status = els.prcfsStatusInput.value;

  if (!channel) {
    els.prcfsChannelInput.reportValidity();
    return;
  }

  data.prcfsStatuses.unshift({ id: crypto.randomUUID(), channel, status });
  els.prcfsForm.reset();
  els.prcfsChannelInput.focus();
  saveData();
  renderPrcfsAlert();
  renderPrcfsStatuses();
}

function deletePrcfsStatus(id) {
  data.prcfsStatuses = data.prcfsStatuses.filter((item) => item.id !== id);
  saveData();
  renderPrcfsAlert();
  renderPrcfsStatuses();
}

function addChannelUse() {
  const channel = els.channelUseInput.value.trim().toUpperCase();
  const callId = els.callIdInput.value.trim();

  if (!channel || !/^\d{1,3}$/.test(callId)) {
    els.channelUseInput.reportValidity();
    els.callIdInput.reportValidity();
    return;
  }

  data.channelUses.unshift({ id: crypto.randomUUID(), channel, callId });
  els.channelUseForm.reset();
  els.channelUseInput.focus();
  saveData();
  renderChannelUseAlert();
  renderChannelUses();
}

function deleteChannelUse(id) {
  data.channelUses = data.channelUses.filter((item) => item.id !== id);
  saveData();
  renderChannelUseAlert();
  renderChannelUses();
}

function addDispatcherAlert() {
  const text = els.dispatcherAlertInput.value.trim();

  if (!text) {
    els.dispatcherAlertInput.reportValidity();
    return;
  }

  data.dispatcherAlerts.unshift({ id: crypto.randomUUID(), text });
  els.dispatcherAlertForm.reset();
  els.dispatcherAlertInput.focus();
  saveData();
  renderDispatcherAlerts();
}

function deleteDispatcherAlert(id) {
  data.dispatcherAlerts = data.dispatcherAlerts.filter((item) => item.id !== id);
  saveData();
  renderDispatcherAlerts();
}

async function searchWeather() {
  if (window.location.protocol === "file:") {
    els.weatherResult.className = "weather-result is-error";
    els.weatherResult.textContent = "Weather lookup needs the site opened from GitHub Pages or http://127.0.0.1, not the file folder.";
    return;
  }

  const address = els.weatherAddressInput.value.trim();
  if (!address) {
    els.weatherAddressInput.reportValidity();
    return;
  }

  els.weatherResult.className = "weather-result is-loading";
  els.weatherResult.textContent = "Checking current observed weather...";

  try {
    const location = await geocodeDaneCountyAddress(address);
    const weather = await getCurrentWeather(location);
    els.weatherResult.className = "weather-result";
    els.weatherResult.innerHTML = `
      <div class="weather-main">
        <strong>${escapeHtml(weather.temperature)}</strong>
        <span>${escapeHtml(weather.observedAt)}</span>
      </div>
      <div class="weather-grid">
        <span>Humidity</span><strong>${escapeHtml(weather.humidity)}</strong>
        <span>Wind</span><strong>${escapeHtml(weather.wind)}</strong>
        <span>Station</span><strong>${escapeHtml(weather.station)}</strong>
      </div>
      <div class="weather-footer">
        <p>${escapeHtml(location.matchedAddress)}</p>
        <button class="weather-copy-button" id="copyWeatherButton" type="button" title="Copy weather for CAD">Copy</button>
      </div>
    `;
    els.weatherResult.querySelector("#copyWeatherButton").addEventListener("click", () => copyWeatherForCad(weather));
  } catch (error) {
    els.weatherResult.className = "weather-result is-error";
    els.weatherResult.textContent = getWeatherErrorMessage(error);
  }
}

function copyWeatherForCad(weather) {
  const message = `TEMPURATURE: ${weather.temperature}, HUMIDITY: ${weather.humidity}, WIND: ${weather.wind}, WEATHER STATION: ${weather.station}, WEATHER AS OF ${weather.asOf}`.toUpperCase();
  copyText(message);
  const button = els.weatherResult.querySelector("#copyWeatherButton");
  if (!button) return;
  button.textContent = "Copied";
  window.setTimeout(() => {
    button.textContent = "Copy";
  }, 1400);
}

function getWeatherErrorMessage(error) {
  if (String(error?.message || "").includes("Failed to fetch")) {
    return "Weather lookup reached the address step, but could not reach weather.gov for live conditions. Confirm the network allows api.weather.gov.";
  }
  return error.message || "Weather lookup failed.";
}

async function geocodeDaneCountyAddress(address) {
  const selectedPlaceId = els.weatherAddressChoice.hidden ? "" : els.weatherAddressChoice.value;
  const existingMatches = getStoredWeatherMatches();
  const selectedMatch = existingMatches.find((match) => String(match.place_id) === selectedPlaceId);
  const match = selectedMatch || (await lookupDaneCountyAddresses(address))[0];
  if (!match) throw new Error("No address match found in Dane County.");

  return {
    latitude: match.lat,
    longitude: match.lon,
    matchedAddress: match.display_name
  };
}

async function lookupDaneCountyAddresses(address) {
  const lookupAddress = /\bwi\b|\bwisconsin\b/i.test(address) ? address : `${address}, Dane County, WI`;
  const params = new URLSearchParams({
    q: lookupAddress,
    format: "jsonv2",
    addressdetails: "1",
    countrycodes: "us",
    layer: "address",
    limit: "5",
    viewbox: "-89.84,43.31,-89.00,42.84",
    bounded: "1"
  });
  const matches = await fetchJsonp(`https://nominatim.openstreetmap.org/search?${params.toString()}`);
  const daneMatches = matches.filter(isDaneCountyMatch);
  setWeatherAddressChoices(daneMatches);
  return daneMatches;
}

function isDaneCountyMatch(match) {
  const address = match.address || {};
  const county = `${address.county || ""} ${match.display_name || ""}`;
  const state = `${address.state || ""} ${match.display_name || ""}`;
  return /Dane/i.test(county) && /Wisconsin|, WI,| WI /i.test(state);
}

function setWeatherAddressChoices(matches) {
  els.weatherAddressChoice.innerHTML = "";
  els.weatherAddressChoice.hidden = matches.length <= 1;
  els.weatherAddressChoice.dataset.matches = JSON.stringify(matches);

  matches.forEach((match) => {
    const option = document.createElement("option");
    option.value = match.place_id;
    option.textContent = match.display_name;
    els.weatherAddressChoice.append(option);
  });
}

function getStoredWeatherMatches() {
  try {
    return JSON.parse(els.weatherAddressChoice.dataset.matches || "[]");
  } catch {
    return [];
  }
}

function fetchJsonp(url) {
  return new Promise((resolve, reject) => {
    const callbackName = `dispatchWeather_${crypto.randomUUID().replaceAll("-", "")}`;
    const script = document.createElement("script");
    const separator = url.includes("?") ? "&" : "?";
    const timeout = window.setTimeout(() => {
      cleanup();
      reject(new Error("Address lookup could not reach OpenStreetMap."));
    }, 9000);

    function cleanup() {
      window.clearTimeout(timeout);
      script.remove();
      delete window[callbackName];
    }

    window[callbackName] = (payload) => {
      cleanup();
      resolve(payload);
    };

    script.addEventListener("error", () => {
      cleanup();
      reject(new Error("Address lookup could not reach OpenStreetMap."));
    });
    script.src = `${url}${separator}json_callback=${callbackName}`;
    document.body.append(script);
  });
}

async function getCurrentWeather(location) {
  const pointResponse = await fetch(`https://api.weather.gov/points/${location.latitude},${location.longitude}`, {
    headers: { Accept: "application/geo+json" }
  });
  if (!pointResponse.ok) throw new Error("Weather point lookup is unavailable right now.");
  const point = await pointResponse.json();
  const stationsUrl = point.properties?.observationStations;
  if (!stationsUrl) throw new Error("No observation station found for that address.");

  const stationsResponse = await fetch(stationsUrl, { headers: { Accept: "application/geo+json" } });
  if (!stationsResponse.ok) throw new Error("Weather station lookup is unavailable right now.");
  const stations = await stationsResponse.json();
  const stationId = stations.features?.[0]?.properties?.stationIdentifier;
  const stationName = stations.features?.[0]?.properties?.name || stationId;
  if (!stationId) throw new Error("No observation station found for that address.");

  const obsResponse = await fetch(`https://api.weather.gov/stations/${stationId}/observations/latest`, {
    headers: { Accept: "application/geo+json" }
  });
  if (!obsResponse.ok) throw new Error("Current observation is unavailable right now.");
  const observation = await obsResponse.json();
  const props = observation.properties || {};

  return {
    temperature: formatTemperature(props.temperature?.value),
    humidity: formatPercent(props.relativeHumidity?.value),
    wind: `${formatWindSpeed(props.windSpeed?.value)} ${formatWindDirection(props.windDirection?.value)}`,
    observedAt: formatObservationTime(props.timestamp),
    asOf: formatWeatherAsOf(props.timestamp),
    station: stationName || stationId
  };
}

function formatTemperature(celsius) {
  if (typeof celsius !== "number") return "Temp unavailable";
  return `${Math.round((celsius * 9) / 5 + 32)}\u00b0F`;
}

function formatPercent(value) {
  if (typeof value !== "number") return "Unavailable";
  return `${Math.round(value)}%`;
}

function formatWindSpeed(metersPerSecond) {
  if (typeof metersPerSecond !== "number") return "Wind speed unavailable";
  return `${Math.round(metersPerSecond * 2.23694)} mph`;
}

function formatWindDirection(degrees) {
  if (typeof degrees !== "number") return "";
  const directions = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];
  return directions[Math.round(degrees / 22.5) % 16];
}

function formatObservationTime(timestamp) {
  if (!timestamp) return "Observation time unavailable";
  return `Observed ${new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Chicago",
    hour: "numeric",
    minute: "2-digit",
    month: "short",
    day: "numeric"
  }).format(new Date(timestamp))}`;
}

function formatWeatherAsOf(timestamp) {
  if (!timestamp) return "UNKNOWN TIME";
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Chicago",
    hour: "numeric",
    minute: "2-digit"
  }).format(new Date(timestamp));
}

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    const temp = document.createElement("textarea");
    temp.value = text;
    document.body.append(temp);
    temp.select();
    document.execCommand("copy");
    temp.remove();
  }
}

function emptyState(text) {
  const div = document.createElement("div");
  div.className = "empty-state";
  div.textContent = text;
  return div;
}

function button(text, className, onClick) {
  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = className;
  btn.textContent = text;
  btn.addEventListener("click", onClick);
  return btn;
}

function iconButton(text, className, label, onClick) {
  const btn = button(text, className, onClick);
  btn.setAttribute("aria-label", label);
  btn.title = label;
  return btn;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

els.stationButton.addEventListener("click", editStationAssignment);
els.asoButton.addEventListener("click", () => toggleServiceStatus("asoStatus"));
els.beltLineButton.addEventListener("click", () => toggleServiceStatus("beltLineStatus"));
els.breakTimesButton.addEventListener("click", handleBreakTimesClick);
els.resetBreakTimesButton.addEventListener("click", resetBreakTimes);
els.returnBreakButton.addEventListener("click", returnFromBreak);
els.ackBreakButton.addEventListener("click", acknowledgeBreakAlert);
els.addNoteTabButton.addEventListener("click", addNoteTab);
els.noteSelector.addEventListener("change", () => {
  data.selectedNoteId = els.noteSelector.value;
  saveData();
  renderCustomNotes();
});
els.editNoteButton.addEventListener("click", () => editNoteTab(data.selectedNoteId));
els.deleteNoteButton.addEventListener("click", () => deleteNoteTab(data.selectedNoteId));
els.saveBackupButton.addEventListener("click", saveBackupFile);
els.addPhraseButton.addEventListener("click", addPhrase);
els.addPhraseSectionButton.addEventListener("click", addPhraseSection);
els.deletePhraseSectionButton.addEventListener("click", deletePhraseSection);
els.weatherSearchButton.addEventListener("click", searchWeather);
els.weatherForm.addEventListener("submit", (event) => {
  event.preventDefault();
  searchWeather();
});
els.weatherForm.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    event.preventDefault();
    searchWeather();
  }
});
els.addEchoButton.addEventListener("click", addEchoCall);
els.echoForm.addEventListener("submit", (event) => {
  event.preventDefault();
  addEchoCall();
});
els.echoForm.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    event.preventDefault();
    addEchoCall();
  }
});
els.addPrcfsButton.addEventListener("click", addPrcfsStatus);
els.prcfsForm.addEventListener("submit", (event) => {
  event.preventDefault();
  addPrcfsStatus();
});
els.prcfsForm.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    event.preventDefault();
    addPrcfsStatus();
  }
});
els.addChannelUseButton.addEventListener("click", addChannelUse);
els.channelUseForm.addEventListener("submit", (event) => {
  event.preventDefault();
  addChannelUse();
});
els.channelUseForm.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    event.preventDefault();
    addChannelUse();
  }
});
els.addDispatcherAlertButton.addEventListener("click", addDispatcherAlert);
els.dispatcherAlertForm.addEventListener("submit", (event) => {
  event.preventDefault();
  addDispatcherAlert();
});
els.dispatcherAlertForm.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    event.preventDefault();
    addDispatcherAlert();
  }
});
els.dialogForm.addEventListener("submit", (event) => {
  if (event.submitter?.value === "cancel") {
    pendingDialogAction = null;
    return;
  }

  event.preventDefault();
  const formData = new FormData(els.dialogForm);
  const values = Object.fromEntries(formData.entries());
  pendingDialogAction?.(values);
  pendingDialogAction = null;
  els.dialog.close();
});

saveData();
render();
window.setInterval(renderBreakTimes, 30000);
