let currentDate = new Date();

function renderCalendar() {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth(); // 0(1월) ~ 11(12월)

  document.getElementById("current-month-label").textContent = `${year}년 ${month + 1}월`;

  const grid = document.getElementById("calendar-grid");
  grid.innerHTML = "";

  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const startWeekday = firstDayOfMonth.getDay(); // 0=일요일 시작
  const totalDays = lastDayOfMonth.getDate();

  // 이번 달 1일 이전의 빈 칸 채우기
  for (let i = 0; i < startWeekday; i++) {
    const emptyCell = document.createElement("div");
    emptyCell.className = "day-cell empty";
    grid.appendChild(emptyCell);
  }

  const today = new Date();

  for (let day = 1; day <= totalDays; day++) {
    const dateStr = makeDateString(year, month, day);

    const cell = document.createElement("div");
    cell.className = "day-cell";

    const isToday =
      today.getFullYear() === year &&
      today.getMonth() === month &&
      today.getDate() === day;
    if (isToday) cell.classList.add("today");

    const number = document.createElement("span");
    number.className = "day-number";
    number.textContent = day;
    cell.appendChild(number);

    // 이 날짜의 일정을 최대 2개까지 표시하고, 나머지는 "+N개"로 표시
    const events = getEventsByDate(dateStr);
    events.slice(0, 2).forEach((ev) => {
      const chip = document.createElement("div");
      chip.className = "event-chip";
      chip.textContent = ev.time ? `${ev.time} ${ev.title}` : ev.title;
      chip.addEventListener("click", (event) => {
        event.stopPropagation(); // 칸 전체의 클릭 이벤트가 같이 실행되지 않게 막음
        openEventModal(dateStr, ev);
      });
      cell.appendChild(chip);
    });

    if (events.length > 2) {
      const more = document.createElement("div");
      more.className = "event-more";
      more.textContent = `+${events.length - 2}개`;
      cell.appendChild(more);
    }

    // 임시 동작: 칸을 클릭하면 그 날짜로 일정 추가 (5단계에서 주간 화면 이동으로 바뀝니다)
    cell.addEventListener("click", () => openEventModal(dateStr, null));

    grid.appendChild(cell);
  }
}

function goToPrevMonth() {
  currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
  renderCalendar();
}

function goToNextMonth() {
  currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
  renderCalendar();
}

function goToToday() {
  currentDate = new Date();
  renderCalendar();
}