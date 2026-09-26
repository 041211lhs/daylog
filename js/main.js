console.log("DAYLOG main.js loaded");

function showMonthView() {
  document.getElementById("calendar-view").classList.remove("hidden");
  document.getElementById("week-view").classList.add("hidden");
  document.getElementById("day-view").classList.add("hidden");
  setActiveTab("month");
  renderCalendar();
}

function showWeekView() {
  document.getElementById("calendar-view").classList.add("hidden");
  document.getElementById("week-view").classList.remove("hidden");
  document.getElementById("day-view").classList.add("hidden");
  setActiveTab("week");
  renderWeek();
}

function showDayView() {
  document.getElementById("calendar-view").classList.add("hidden");
  document.getElementById("week-view").classList.add("hidden");
  document.getElementById("day-view").classList.remove("hidden");
  setActiveTab("day");
  renderDay();
}

function setActiveTab(view) {
  document.querySelectorAll(".view-tab-btn").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.view === view);
  });
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

document.getElementById("back-to-week-btn").addEventListener("click", showWeekView);
document.getElementById("day-add-event-btn").addEventListener("click", () => openEventModal(getFocusDateStr(), null));

document.getElementById("save-journal-btn").addEventListener("click", handleSaveJournal);
document.getElementById("reflect-btn").addEventListener("click", handleReflect);

document.getElementById("tab-month-btn").addEventListener("click", showMonthView);
document.getElementById("tab-week-btn").addEventListener("click", showWeekView);
document.getElementById("tab-day-btn").addEventListener("click", showDayView);

setupModal();
showMonthView();

// 스플래시 화면: 잠깐 보여줬다가 부드럽게 사라지게 함
const splash = document.getElementById("splash-screen");
if (splash) {
  setTimeout(() => {
    splash.classList.add("splash-hide");
    setTimeout(() => splash.remove(), 500);
  }, 900);
}