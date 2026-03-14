/* ╔════════════════════════════════╗
   ║ Theme Controller               ║
   ╚════════════════════════════════╝
*/

// Load Theme on launch
if (localStorage.getItem("theme")) {
    document.documentElement.style.setProperty("--GPMUP-base", localStorage.getItem("theme"));
    document.querySelector(".modal__settings .modal-content #apparence .apparence__accent").value = localStorage.getItem("theme");
} else {
    localStorage.setItem("theme", "#ef6c00");
    document.querySelector(".modal__settings .modal-content #apparence .apparence__accent").value = "#ef6c00";
}

// Apply Theme
function applyTheme(color) {
    localStorage.setItem("theme", color);
    document.documentElement.style.setProperty("--GPMUP-base", color);
    document.querySelector(".modal__settings .modal-content #apparence .apparence__accent").value = color;
}