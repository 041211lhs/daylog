console.log("DAYLOG main.js loaded");

function showMonthView() {
  document.getElementById("calendar-view").classList.remove("hidden");
  document.getElementById("week-view").classList.add("hidden");
  renderCalendar();
}

function showWeekView(dateStr) {
  document.getElementById("calendar-view").classList.add("hidden");
  document.getElementById("week-view").classList.remove("hidden");
  setWeekTo(dateStr);
}

// 현재 보이는 화면이 어디든, 그 화면만 다시 그림
function refreshViews() {
  const weekVisible = !document.getElementById("week-view").classList.contains("hidden");
  if (weekVisible) {
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

setupModal();
showMonthView();