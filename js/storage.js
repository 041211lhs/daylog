const STORAGE_KEY = "daylog_events";
const DAY_DATA_KEY = "daylog_day_data";

// ---------- 일정(events) ----------
// event: { id, date, endDate, time, title }
// endDate가 date와 같으면 "하루짜리" 일정, 다르면 "기간" 일정입니다.

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

function isMultiDay(ev) {
  return !!ev.endDate && ev.endDate !== ev.date;
}

// 특정 날짜가 포함된 모든 일정 (하루짜리 + 기간 일정 둘 다 포함)
function getEventsByDate(dateStr) {
  return loadEvents()
    .filter((ev) => ev.date <= dateStr && (ev.endDate || ev.date) >= dateStr)
    .sort((a, b) => (a.time || "").localeCompare(b.time || ""));
}

// startStr ~ endStr 범위와 겹치는 "기간 일정"만 (달력에 막대로 그릴 때 사용)
function getMultiDayEventsInRange(startStr, endStr) {
  return loadEvents().filter(
    (ev) => isMultiDay(ev) && ev.date <= endStr && (ev.endDate || ev.date) >= startStr
  );
}

function addEvent(date, endDate, time, title) {
  const events = loadEvents();
  events.push({ id: Date.now().toString(), date, endDate: endDate || date, time, title });
  saveEvents(events);
}

function updateEvent(id, date, endDate, time, title) {
  const events = loadEvents();
  const target = events.find((ev) => ev.id === id);
  if (target) {
    target.date = date;
    target.endDate = endDate || date;
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