let currentWeekDate = new Date();

const WEEKDAY_LABELS = ["일", "월", "화", "수", "목", "금", "토"];

// 이 날짜가 속한 주의 "일요일"을 구함
function getWeekStart(date) {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  d.setDate(d.getDate() - d.getDay()); // getDay(): 0=일요일
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

    const col = document.createElement("div");
    col.className = "week-day-col";

    const isToday =
      today.getFullYear() === day.getFullYear() &&
      today.getMonth() === day.getMonth() &&
      today.getDate() === day.getDate();
    if (isToday) col.classList.add("today");

    // 토글 버튼 역할을 하는 헤더 (요일/날짜/일정개수/화살표)
    const header = document.createElement("button");
    header.className = "week-day-header";
    header.innerHTML = `
      <span class="week-day-name">${WEEKDAY_LABELS[day.getDay()]}</span>
      <span class="week-day-num">${day.getDate()}</span>
      <span class="week-day-count">${events.length > 0 ? `일정 ${events.length}개` : "일정 없음"}</span>
      <span class="week-toggle-icon">▼</span>
    `;

    // 펼쳤을 때 보이는 일정 목록
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

// 월간 달력에서 특정 날짜를 클릭했을 때, 그 날짜가 속한 주로 이동
function setWeekTo(dateStr) {
  const [y, m, d] = dateStr.split("-").map(Number);
  currentWeekDate = new Date(y, m - 1, d);
  renderWeek();
}