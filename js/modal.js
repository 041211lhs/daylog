let editingEventId = null;

function openEventModal(defaultDate, eventToEdit) {
  const dateInput = document.getElementById("event-date");
  const timeInput = document.getElementById("event-time");
  const titleInput = document.getElementById("event-title");
  const deleteBtn = document.getElementById("delete-event-btn");

  document.getElementById("modal-error").textContent = "";

  if (eventToEdit) {
    editingEventId = eventToEdit.id;
    document.getElementById("modal-title").textContent = "일정 수정";
    dateInput.value = eventToEdit.date;
    timeInput.value = eventToEdit.time;
    titleInput.value = eventToEdit.title;
    deleteBtn.classList.remove("hidden");
  } else {
    editingEventId = null;
    document.getElementById("modal-title").textContent = "일정 추가";
    dateInput.value = defaultDate;
    timeInput.value = "";
    titleInput.value = "";
    deleteBtn.classList.add("hidden");
  }

  document.getElementById("event-modal").classList.remove("hidden");
  titleInput.focus();
}

function closeEventModal() {
  document.getElementById("event-modal").classList.add("hidden");
}

function handleSaveEvent() {
  const date = document.getElementById("event-date").value;
  const time = document.getElementById("event-time").value;
  const title = document.getElementById("event-title").value.trim();

  if (!date || !title) {
    document.getElementById("modal-error").textContent = "날짜와 제목을 입력해주세요.";
    return;
  }

  if (editingEventId) {
    updateEvent(editingEventId, date, time, title);
  } else {
    addEvent(date, time, title);
  }

  closeEventModal();
  refreshViews();
}

function handleDeleteEvent() {
  if (!confirm("이 일정을 삭제할까요?")) return;
  deleteEvent(editingEventId);
  closeEventModal();
  refreshViews();
}

function setupModal() {
  const modal = document.getElementById("event-modal");

  document.getElementById("save-event-btn").addEventListener("click", handleSaveEvent);
  document.getElementById("cancel-event-btn").addEventListener("click", closeEventModal);
  document.getElementById("delete-event-btn").addEventListener("click", handleDeleteEvent);

  modal.addEventListener("click", (event) => {
    if (event.target === modal) closeEventModal();
  });
}