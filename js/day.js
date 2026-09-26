let isReflecting = false;

const MOOD_OPTIONS = ["😄", "😊", "😐", "😞", "😫"];

function renderDay() {
  const weekdayNames = ["일", "월", "화", "수", "목", "금", "토"];

  document.getElementById("current-day-label").textContent =
    `${focusDate.getFullYear()}년 ${focusDate.getMonth() + 1}월 ${focusDate.getDate()}일 (${weekdayNames[focusDate.getDay()]})`;

  renderDayEvents();
  renderMood();
  renderJournal();
  clearReflectResult();
}

function renderDayEvents() {
  const dateStr = getFocusDateStr();
  const list = document.getElementById("day-event-list");
  list.innerHTML = "";

  const events = getEventsByDate(dateStr);

  if (events.length === 0) {
    const empty = document.createElement("p");
    empty.className = "day-event-empty";
    empty.textContent = "일정이 없습니다.";
    list.appendChild(empty);
    return;
  }

  events.forEach((ev) => {
    const item = document.createElement("div");
    item.className = "day-event-item";
    if (isMultiDay(ev)) item.classList.add("multi-day");

    const label = isMultiDay(ev) ? `${ev.date} ~ ${ev.endDate}` : ev.time || "";

    item.innerHTML = `
      <span class="day-event-time">${label}</span>
      <span class="day-event-title">${ev.title}</span>
    `;
    item.addEventListener("click", () => openEventModal(dateStr, ev));
    list.appendChild(item);
  });
}

function renderMood() {
  const dateStr = getFocusDateStr();
  const container = document.getElementById("mood-options");
  container.innerHTML = "";
  const data = getDayData(dateStr);

  MOOD_OPTIONS.forEach((mood) => {
    const btn = document.createElement("button");
    btn.className = "mood-btn";
    btn.textContent = mood;
    if (data.mood === mood) btn.classList.add("selected");
    btn.addEventListener("click", () => {
      saveMood(dateStr, mood);
      renderMood();
    });
    container.appendChild(btn);
  });
}

function renderJournal() {
  const dateStr = getFocusDateStr();
  const data = getDayData(dateStr);
  document.getElementById("journal-input").value = data.journal || "";
  document.getElementById("journal-saved-msg").textContent = "";
}

function handleSaveJournal() {
  const dateStr = getFocusDateStr();
  const text = document.getElementById("journal-input").value;
  saveJournal(dateStr, text);
  const msg = document.getElementById("journal-saved-msg");
  msg.textContent = "저장되었습니다.";
  setTimeout(() => {
    msg.textContent = "";
  }, 2000);
}

function clearReflectResult() {
  document.getElementById("reflect-error").textContent = "";
  const resultEl = document.getElementById("reflect-result");
  resultEl.classList.add("hidden");
  resultEl.innerHTML = "";
}

async function handleReflect() {
  if (isReflecting) return;

  const dateStr = getFocusDateStr();
  const journal = document.getElementById("journal-input").value.trim();
  const errorEl = document.getElementById("reflect-error");
  const resultEl = document.getElementById("reflect-result");
  const btn = document.getElementById("reflect-btn");

  errorEl.textContent = "";
  resultEl.classList.add("hidden");
  resultEl.innerHTML = "";

  if (!journal) {
    errorEl.textContent = "오늘의 기록을 먼저 작성해주세요.";
    return;
  }

  saveJournal(dateStr, journal);

  isReflecting = true;
  btn.disabled = true;
  btn.textContent = "AI가 정리하는 중...";

  const events = getEventsByDate(dateStr);

  try {
    const response = await fetch("/api/reflect", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ journal, events }),
    });

    const data = await response.json();

    if (!response.ok) {
      errorEl.textContent = data.error || "AI 응답을 가져오지 못했습니다. 잠시 후 다시 시도해주세요.";
      return;
    }

    resultEl.innerHTML = `
      <p class="reflect-summary">${data.summary}</p>
      <div class="reflect-keywords">
        ${data.keywords.map((k) => `<span class="keyword-chip">#${k}</span>`).join("")}
      </div>
    `;
    resultEl.classList.remove("hidden");
  } catch (error) {
    errorEl.textContent = "AI 응답을 가져오지 못했습니다. 잠시 후 다시 시도해주세요.";
  } finally {
    isReflecting = false;
    btn.disabled = false;
    btn.textContent = "AI 하루 회고 요청";
  }
}