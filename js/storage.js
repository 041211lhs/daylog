const STORAGE_KEY = "daylog_events";

// localStorage는 문자열만 저장할 수 있어서, 저장할 때 JSON.stringify, 꺼낼 때 JSON.parse를 씁니다.
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

// 특정 날짜("2026-09-21")의 일정만 시간순으로 가져오기
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

// 연/월/일 숫자를 "2026-09-05" 형태 문자열로 바꾸기 (month는 0부터 시작하므로 +1)
function makeDateString(year, month, day) {
  const mm = String(month + 1).padStart(2, "0");
  const dd = String(day).padStart(2, "0");
  return `${year}-${mm}-${dd}`;
}