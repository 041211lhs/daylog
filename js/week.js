function getWeekStart(date) {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  d.setDate(d.getDate() - d.getDay());
  return d;
}

function renderWeek() {
  const start = getWeekStart(focusDate);
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
    const allEvents = getEventsByDate(dateStr);
    const multiDayEvents = allEvents.filter(isMultiDay);
    const singleDayCount = allEvents.length - multiDayEvents.length;

    const col = document.createElement("div");
    col.className = "week-day-col";
    if (i === 0) col.classList.add("sun");
    if (i === 6) col.classList.add("sat");

    const isToday =
      today.getFullYear() === day.getFullYear() &&
      today.getMonth() === day.getMonth() &&
      today.getDate() === day.getDate();
    if (isToday) col.classList.add("today");

    const header = document.createElement("button");
    header.className = "week-day-header";
    header.innerHTML = `
      <span class="week-day-name">${WEEKDAY_LABELS[i]}</span>
      <span class="week-day-num">${day.getDate()}</span>
      <span class="week-day-count">${singleDayCount > 0 ? `일정 ${singleDayCount}개` : "일정 없음"}</span>
      <span class="week-toggle-icon">▼</span>
    `;
    col.appendChild(header);

    if (multiDayEvents.length > 0) {
      const bar = document.createElement("div");
      bar.className = "week-multiday-bar";
      bar.textContent =
        multiDayEvents.length > 1
          ? `${multiDayEvents[0].title} 외 ${multiDayEvents.length - 1}건`
          : multiDayEvents[0].title;
      bar.addEventListener("click", (event) => {
        event.stopPropagation();
        openEventModal(dateStr, multiDayEvents[0]);
      });
      col.appendChild(bar);
    }

    const detailBtn = document.createElement("button");
    detailBtn.className = "week-detail-btn";
    detailBtn.textContent = "자세히 보기";
    detailBtn.addEventListener("click", (event) => {
      event.stopPropagation();
      focusDate = day;
      showDayView();
    });

    const list = document.createElement("div");
    list.className = "week-day-list hidden";

    if (allEvents.length === 0) {
      const empty = document.createElement("p");
      empty.className = "week-day-empty";
      empty.textContent = "일정 없음";
      list.appendChild(empty);
    } else {
      allEvents.forEach((ev) => {
        const item = document.createElement("div");
        item.className = "week-event-item";
        item.textContent = isMultiDay(ev)
          ? `${ev.title} (${ev.date} ~ ${ev.endDate})`
          : ev.time
          ? `${ev.time} ${ev.title}`
          : ev.title;
        item.addEventListener("click", () => openEventModal(dateStr, ev));
        list.appendChild(item);
      });
    }

    header.addEventListener("click", () => {
      list.classList.toggle("hidden");
      header.classList.toggle("open");
    });

    col.appendChild(detailBtn);
    col.appendChild(list);
    grid.appendChild(col);
  }
}

function goToPrevWeek() {
  focusDate = new Date(focusDate.getFullYear(), focusDate.getMonth(), focusDate.getDate() - 7);
  renderWeek();
}

function goToNextWeek() {
  focusDate = new Date(focusDate.getFullYear(), focusDate.getMonth(), focusDate.getDate() + 7);
  renderWeek();
}