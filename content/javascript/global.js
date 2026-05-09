const DEFAULT_KIBUN = '気分を登録';
const KIBUN_ICONS = ['😊', '😎', '😭', '🏃‍♂️'];

const calendarCells = document.querySelectorAll("td");
calendarCells.forEach((cell) => {
  cell.addEventListener("click", selectKibun);

  const kibun = cell.querySelector(".kibun");
  if (!localStorage.getItem(cell.dataset.day)) {
    kibun.textContent = DEFAULT_KIBUN;
  } else {
    kibun.textContent = localStorage.getItem(cell.dataset.day);
  }
});


function selectKibun(event) {
  const clickedCell = event.currentTarget;
  const selectedDayKibun = clickedCell.querySelector(".kibun");
  const currentKibunIndex = KIBUN_ICONS.indexOf(selectedDayKibun.textContent);

  let nextKibun
  if (currentKibunIndex === -1) {
    nextKibun = KIBUN_ICONS[0];
  } else if (currentKibunIndex === KIBUN_ICONS.length - 1) {
    nextKibun = DEFAULT_KIBUN;
  } else {
    nextKibun = KIBUN_ICONS[currentKibunIndex + 1];
  }

  selectedDayKibun.textContent = nextKibun
  localStorage.setItem(clickedCell.dataset.day, nextKibun)
}
