console.log("DAYLOG main.js loaded");

function showMonthView() {
  document.getElementById("calendar-view").classList.remove("hidden");
  document.getElementById("week-view").classList.add("hidden");
  document.getElementById("day-view").classList.add("hidden");
  renderCalendar();
}

function showWeekView(dateStr) {
  document.getElementById("calendar-view").classList.add("hidden");
  document.getElementById("week-view").classList.remove("hidden");
  document.getElementById("day-view").classList.add("hidden");
  setWeekTo(dateStr);
}

function showDayView(dateStr) {
  document.getElementById("calendar-view").classList.add("hidden");
  document.getElementById("week-view").classList.add("hidden");
  document.getElementById("day-view").classList.remove("hidden");
  currentDayStr = dateStr;
  renderDay();
}

function refreshViews() {
  if (!document.getElementById("day-view").classList.contains("hidden")) {
    renderDayEvents();
  } else if (!document.getElementById("week-view").classList.contains("hidden")) {
    renderWeek();
  } else {
    renderCalendar();
  }
}

document.getElementById("prev-month-btn").addEventListener("click", goToPrevMonth);
document.getElementById("next-month-btn").addEventListener("click", goToNextMonth);
document.getElementById("today-btn").addEventListener("click", goToToday);

document.getElementById("add-event-btn").addEventListener("click", () => {
  const t = new Date();
  openEventModal(makeDateString(t.getFullYear(), t.getMonth(), t.getDate()), null);
});

document.getElementById("back-to-month-btn").addEventListener("click", showMonthView);
document.getElementById("prev-week-btn").addEventListener("click", goToPrevWeek);
document.getElementById("next-week-btn").addEventListener("click", goToNextWeek);

document.getElementById("back-to-week-btn").addEventListener("click", () => showWeekView(currentDayStr));
document.getElementById("day-add-event-btn").addEventListener("click", () => openEventModal(currentDayStr, null));

document.getElementById("save-journal-btn").addEventListener("click", handleSaveJournal);
document.getElementById("reflect-btn").addEventListener("click", handleReflect);

setupModal();
showMonthView();