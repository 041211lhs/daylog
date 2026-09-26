// 달력 전체(월/주/하루)가 함께 바라보는 "기준 날짜"
let focusDate = new Date();

const WEEKDAY_LABELS = ["일", "월", "화", "수", "목", "금", "토"];
const MAX_BAR_LANES = 3; // 한 주에 동시에 보여줄 기간 일정 막대 최대 줄 수

function getFocusDateStr() {
  return makeDateString(focusDate.getFullYear(), focusDate.getMonth(), focusDate.getDate());
}

function renderCalendar() {
  const year = focusDate.getFullYear();
  const month = focusDate.getMonth();

  document.getElementById("current-month-label").textContent = `${year}년 ${month + 1}월`;

  const grid = document.getElementById("calendar-grid");
  grid.innerHTML = "";

  const weeks = getMonthGridWeeks(year, month);
  const today = new Date();

  weeks.forEach((week) => {
    grid.appendChild(buildWeekRow(week, month, today));
  });
}

// 이번 달을 그리기 위한 "주 단위" 날짜 묶음을 만듭니다.
// 예: 9월 1일이 화요일이면, 그 주의 일요일(8월 30일)부터 시작합니다.
function getMonthGridWeeks(year, month) {
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const startWeekday = firstDayOfMonth.getDay();
  const totalDays = lastDayOfMonth.getDate();
  const totalCells = Math.ceil((startWeekday + totalDays) / 7) * 7;

  const gridStart = new Date(year, month, 1 - startWeekday);

  const weeks = [];
  for (let w = 0; w < totalCells / 7; w++) {
    const week = [];
    for (let d = 0; d < 7; d++) {
      const cellDate = new Date(gridStart);
      cellDate.setDate(gridStart.getDate() + w * 7 + d);
      week.push(cellDate);
    }
    weeks.push(week);
  }
  return weeks;
}

function buildWeekRow(week, currentMonth, today) {
  const weekStart = makeDateString(week[0].getFullYear(), week[0].getMonth(), week[0].getDate());
  const weekEnd = makeDateString(week[6].getFullYear(), week[6].getMonth(), week[6].getDate());

  const row = document.createElement("div");
  row.className = "month-week";

  // 1) 날짜 숫자 줄
  const numbersRow = document.createElement("div");
  numbersRow.className = "month-week-numbers";

  week.forEach((cellDate, i) => {
    const dateStr = makeDateString(cellDate.getFullYear(), cellDate.getMonth(), cellDate.getDate());
    const isOtherMonth = cellDate.getMonth() !== currentMonth;
    const isToday =
      cellDate.getFullYear() === today.getFullYear() &&
      cellDate.getMonth() === today.getMonth() &&
      cellDate.getDate() === today.getDate();

    const cell = document.createElement("div");
    cell.className = "month-day-num-cell";
    if (isOtherMonth) cell.classList.add("other-month");
    cell.addEventListener("click", () => {
      focusDate = cellDate;
      showWeekView();
    });

    const badge = document.createElement("span");
    badge.className = "day-number";
    if (i === 0) badge.classList.add("sun");
    if (i === 6) badge.classList.add("sat");
    if (isToday) badge.classList.add("today");
    badge.textContent = cellDate.getDate();
    cell.appendChild(badge);

    numbersRow.appendChild(cell);
  });

  row.appendChild(numbersRow);

  // 2) 여러 날 이어지는 일정 막대 줄
  const multiDayEvents = getMultiDayEventsInRange(weekStart, weekEnd).sort((a, b) => a.date.localeCompare(b.date));
  const { bars, overflowCount } = layoutBarsForWeek(multiDayEvents, week);

  const barsRow = document.createElement("div");
  barsRow.className = "month-week-bars";

  bars.forEach(({ ev, lane, startCol, endCol }) => {
    const bar = document.createElement("div");
    bar.className = "month-bar";
    bar.style.gridColumn = `${startCol + 1} / ${endCol + 2}`;
    bar.style.gridRow = `${lane + 1}`;
    bar.textContent = ev.title;
    bar.addEventListener("click", () => openEventModal(ev.date, ev));
    barsRow.appendChild(bar);
  });

  row.appendChild(barsRow);

  if (overflowCount > 0) {
    const more = document.createElement("div");
    more.className = "month-week-bars-more";
    more.textContent = `기간 일정 +${overflowCount}개`;
    row.appendChild(more);
  }

  // 3) 하루짜리 일정 칩 줄
  const chipsRow = document.createElement("div");
  chipsRow.className = "month-week-chips";

  week.forEach((cellDate) => {
    const dateStr = makeDateString(cellDate.getFullYear(), cellDate.getMonth(), cellDate.getDate());
    const cell = document.createElement("div");
    cell.className = "month-day-chip-cell";

    const singleDayEvents = getEventsByDate(dateStr).filter((ev) => !isMultiDay(ev));

    singleDayEvents.slice(0, 2).forEach((ev) => {
      const chip = document.createElement("div");
      chip.className = "event-chip";
      chip.textContent = ev.time ? `${ev.time} ${ev.title}` : ev.title;
      chip.addEventListener("click", (event) => {
        event.stopPropagation();
        openEventModal(dateStr, ev);
      });
      cell.appendChild(chip);
    });

    if (singleDayEvents.length > 2) {
      const more = document.createElement("div");
      more.className = "event-more";
      more.textContent = `+${singleDayEvents.length - 2}개`;
      cell.appendChild(more);
    }

    chipsRow.appendChild(cell);
  });

  row.appendChild(chipsRow);

  return row;
}

// 한 주(7일) 안에서 기간 일정들이 서로 겹치지 않게 "줄(레인)"을 배정합니다.
// 기차 시간표처럼, 겹치는 일정은 다른 줄에 놓고 안 겹치면 같은 줄을 재사용해요.
function layoutBarsForWeek(events, week) {
  const weekDates = week.map((d) => makeDateString(d.getFullYear(), d.getMonth(), d.getDate()));
  const laneEndCol = [];
  const bars = [];
  let overflowCount = 0;

  events.forEach((ev) => {
    const startCol = ev.date < weekDates[0] ? 0 : weekDates.indexOf(ev.date);
    const endCol = ev.endDate > weekDates[6] ? 6 : weekDates.indexOf(ev.endDate);

    let lane = laneEndCol.findIndex((occupiedUntil) => occupiedUntil < startCol);
    if (lane === -1) lane = laneEndCol.length;

    if (lane >= MAX_BAR_LANES) {
      overflowCount += 1;
      return;
    }

    laneEndCol[lane] = endCol;
    bars.push({ ev, lane, startCol, endCol });
  });

  return { bars, overflowCount };
}

function goToPrevMonth() {
  focusDate = new Date(focusDate.getFullYear(), focusDate.getMonth() - 1, 1);
  renderCalendar();
}

function goToNextMonth() {
  focusDate = new Date(focusDate.getFullYear(), focusDate.getMonth() + 1, 1);
  renderCalendar();
}

function goToToday() {
  focusDate = new Date();
  renderCalendar();
}