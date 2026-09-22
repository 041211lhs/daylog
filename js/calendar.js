let currentDate = new Date();

function renderCalendar() {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  document.getElementById("current-month-label").textContent = `${year}년 ${month + 1}월`;

  const grid = document.getElementById("calendar-grid");
  grid.innerHTML = "";

  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const startWeekday = firstDayOfMonth.getDay();
  const totalDays = lastDayOfMonth.getDate();

  for (let i = 0; i < startWeekday; i++) {
    const emptyCell = document.createElement("div");
    emptyCell.className = "day-cell empty";
    grid.appendChild(emptyCell);
  }

  const today = new Date();

  for (let day = 1; day <= totalDays; day++) {
    const dateStr = makeDateString(year, month, day);
    const weekday = new Date(year, month, day).getDay(); // 0=일, 6=토

    const cell = document.createElement("div");
    cell.className = "day-cell";

    const isToday =
      today.getFullYear() === year &&
      today.getMonth() === month &&
      today.getDate() === day;
    if (isToday) cell.classList.add("today");

    const number = document.createElement("span");
    number.className = "day-number";
    if (weekday === 0) number.classList.add("sun");
    if (weekday === 6) number.classList.add("sat");
    number.textContent = day;
    cell.appendChild(number);

    const events = getEventsByDate(dateStr);
    events.slice(0, 2).forEach((ev) => {
      const chip = document.createElement("div");
      chip.className = "event-chip";
      if (weekday === 0) chip.classList.add("sun");
      if (weekday === 6) chip.classList.add("sat");
      chip.textContent = ev.time ? `${ev.time} ${ev.title}` : ev.title;
      chip.addEventListener("click", (event) => {
        event.stopPropagation();
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

    cell.addEventListener("click", () => showWeekView(dateStr));

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