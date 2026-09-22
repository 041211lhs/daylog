console.log("DAYLOG main.js loaded");

// 일정이 바뀔 때마다 화면을 다시 그리는 함수. 나중에 주간/하루 화면도 여기에 추가합니다.
function refreshViews() {
  renderCalendar();
}

document.getElementById("prev-month-btn").addEventListener("click", goToPrevMonth);
document.getElementById("next-month-btn").addEventListener("click", goToNextMonth);
document.getElementById("today-btn").addEventListener("click", goToToday);

document.getElementById("add-event-btn").addEventListener("click", () => {
  const t = new Date();
  openEventModal(makeDateString(t.getFullYear(), t.getMonth(), t.getDate()), null);
});

setupModal();
renderCalendar();