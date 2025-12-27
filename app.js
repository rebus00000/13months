const calendar = document.getElementById("calendar");
const monthName = document.getElementById("monthName");
const themePicker = document.getElementById("themePicker");

const MONTHS = [
  "Aurora","Borealis","Cetus","Draco","Equinox","Fenix","Gaia",
  "Helios","Ion","Janus","Kronos","Luna","Nova"
];

// THEME
const savedTheme = localStorage.getItem("theme") || "dark";
document.body.className = savedTheme;
themePicker.value = savedTheme;
themePicker.onchange = () => {
  document.body.className = themePicker.value;
  localStorage.setItem("theme", themePicker.value);
};

// DATE CALCULATION
const today = new Date();
const year = today.getFullYear();
const start = new Date(year, 0, 1);
const dayOfYear = Math.floor((today - start) / 86400000) + 1;
const isLeap = new Date(year, 1, 29).getMonth() === 1;

function getIFC(day) {
  if (day === 365 && !isLeap) return { type: "year" };
  if (day === 366) return { type: "year" };
  if (isLeap && day === 169) return { type: "leap" };

  let d = isLeap && day > 169 ? day - 1 : day;
  return {
    month: Math.floor((d - 1) / 28),
    day: ((d - 1) % 28) + 1
  };
}

const ifcToday = getIFC(dayOfYear);
let currentMonth = ifcToday.month || 0;

// RENDER
function render(month) {
  calendar.innerHTML = "";
  monthName.textContent = MONTHS[month];

  for (let i = 1; i <= 28; i++) {
    const d = document.createElement("div");
    d.className = "day";
    d.textContent = i;

    const key = `${year}-${month}-${i}`;
    if (localStorage.getItem(key)) {
      d.style.border = "2px solid var(--accent)";
    }

    if (ifcToday.month === month && ifcToday.day === i) {
      d.classList.add("today");
    }

    d.onclick = () => {
      const txt = prompt("Event:", localStorage.getItem(key) || "");
      if (txt) localStorage.setItem(key, txt);
      else localStorage.removeItem(key);
      render(month);
    };

    calendar.appendChild(d);
  }

  if (month === 5 && isLeap) {
    const leap = document.createElement("div");
    leap.className = "special";
    leap.textContent = "Leap Day";
    calendar.appendChild(leap);
  }

  if (month === 12) {
    const yd = document.createElement("div");
    yd.className = "special";
    yd.textContent = "Year Day";
    calendar.appendChild(yd);
  }
}

render(currentMonth);

// SWIPE
let startX = 0;
document.addEventListener("touchstart", e => startX = e.touches[0].clientX);
document.addEventListener("touchend", e => {
  const endX = e.changedTouches[0].clientX;
  if (startX - endX > 50) currentMonth = (currentMonth + 1) % 13;
  if (endX - startX > 50) currentMonth = (currentMonth + 12) % 13;
  render(currentMonth);
});

// NOTIFICATION
if ("Notification" in window) {
  Notification.requestPermission();
  if (Notification.permission === "granted" && ifcToday.day) {
    new Notification("📅 Today", {
      body: `${MONTHS[ifcToday.month]} ${ifcToday.day}`
    });
  }
}

// SERVICE WORKER
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("sw.js");
}
