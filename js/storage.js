const STORAGE_KEY = "daylog_events";
const DAY_DATA_KEY = "daylog_day_data";

// ---------- 일정(events) ----------

function loadEvents() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return [];
  try {
    return JSON.parse(saved);
  } catch (error) {
    return [];
  }
}

function saveEvents(events) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
}

function getEventsByDate(dateStr) {
  return loadEvents()
    .filter((ev) => ev.date === dateStr)
    .sort((a, b) => a.time.localeCompare(b.time));
}

function addEvent(date, time, title) {
  const events = loadEvents();
  events.push({ id: Date.now().toString(), date, time, title });
  saveEvents(events);
}

function updateEvent(id, date, time, title) {
  const events = loadEvents();
  const target = events.find((ev) => ev.id === id);
  if (target) {
    target.date = date;
    target.time = time;
    target.title = title;
    saveEvents(events);
  }
}

function deleteEvent(id) {
  const events = loadEvents().filter((ev) => ev.id !== id);
  saveEvents(events);
}

function makeDateString(year, month, day) {
  const mm = String(month + 1).padStart(2, "0");
  const dd = String(day).padStart(2, "0");
  return `${year}-${mm}-${dd}`;
}

// ---------- 날짜별 기분 + 기록(day data) ----------
// 구조: { "2026-09-21": { mood: "😊", journal: "오늘은..." }, ... }

function loadDayData() {
  const saved = localStorage.getItem(DAY_DATA_KEY);
  if (!saved) return {};
  try {
    return JSON.parse(saved);
  } catch (error) {
    return {};
  }
}

function saveDayData(allData) {
  localStorage.setItem(DAY_DATA_KEY, JSON.stringify(allData));
}

function getDayData(dateStr) {
  const all = loadDayData();
  return all[dateStr] || { mood: null, journal: "" };
}

function saveMood(dateStr, mood) {
  const all = loadDayData();
  if (!all[dateStr]) all[dateStr] = { mood: null, journal: "" };
  all[dateStr].mood = mood;
  saveDayData(all);
}

function saveJournal(dateStr, journal) {
  const all = loadDayData();
  if (!all[dateStr]) all[dateStr] = { mood: null, journal: "" };
  all[dateStr].journal = journal;
  saveDayData(all);
}