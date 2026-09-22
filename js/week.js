let currentWeekDate = new Date();

const WEEKDAY_LABELS = ["일", "월", "화", "수", "목", "금", "토"];

function getWeekStart(date) {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  d.setDate(d.getDate() - d.getDay());
  return d;
}

function renderWeek() {
  const start = getWeekStart(currentWeekDate);
  const end = new Date(start);
  end.setDate(end.getDate() + 6);

  document.getElementById("current-week-label").textContent =
    `${start.getMonth() + 1}월 ${start.getDate()}일 - ${end.getMonth() + 1}월 ${end.getDate()}일`;

  const grid = document.getElementById("week-grid");
  grid.innerHTML = "";

  const today = new Date();

  for (let i = 0; i < 7; i++) {
    const day = new Date(start);
    day.setDate(start.getDate() + i);
    const dateStr = makeDateString(day.getFullYear(), day.getMonth(), day.getDate());
    const events = getEventsByDate(dateStr);
    const weekday = day.getDay();

    const col = document.createElement("div");
    col.className = "week-day-col";
    if (weekday === 0) col.classList.add("sun");
    if (weekday === 6) col.classList.add("sat");

    const today_ =
      today.getFullYear() === day.getFullYear() &&
      today.getMonth() === day.getMonth() &&
      today.getDate() === day.getDate();
    if (today_) col.classList.add("today");

    const header = document.createElement("button");
    header.className = "week-day-header";
    header.innerHTML = `
      <span class="week-day-name">${WEEKDAY_LABELS[weekday]}</span>
      <span class="week-day-num">${day.getDate()}</span>
      <span class="week-day-count">${events.length > 0 ? `일정 ${events.length}개` : "일정 없음"}</span>
      <span class="week-toggle-icon">▼</span>
    `;

    const detailBtn = document.createElement("button");
    detailBtn.className = "week-detail-btn";
    detailBtn.textContent = "자세히 보기";
    detailBtn.addEventListener("click", (event) => {
      event.stopPropagation();
      showDayView(dateStr);
    });

    const list = document.createElement("div");
    list.className = "week-day-list hidden";

    if (events.length === 0) {
      const empty = document.createElement("p");
      empty.className = "week-day-empty";
      empty.textContent = "일정 없음";
      list.appendChild(empty);
    } else {
      events.forEach((ev) => {
        const item = document.createElement("div");
        item.className = "week-event-item";
        item.textContent = ev.time ? `${ev.time} ${ev.title}` : ev.title;
        item.addEventListener("click", () => openEventModal(dateStr, ev));
        list.appendChild(item);
      });
    }

    header.addEventListener("click", () => {
      list.classList.toggle("hidden");
      header.classList.toggle("open");
    });

    col.appendChild(header);
    col.appendChild(detailBtn);
    col.appendChild(list);
    grid.appendChild(col);
  }
}

function goToPrevWeek() {
  currentWeekDate = new Date(
    currentWeekDate.getFullYear(),
    currentWeekDate.getMonth(),
    currentWeekDate.getDate() - 7
  );
  renderWeek();
}

function goToNextWeek() {
  currentWeekDate = new Date(
    currentWeekDate.getFullYear(),
    currentWeekDate.getMonth(),
    currentWeekDate.getDate() + 7
  );
  renderWeek();
}

function setWeekTo(dateStr) {
  const [y, m, d] = dateStr.split("-").map(Number);
  currentWeekDate = new Date(y, m - 1, d);
  renderWeek();
}