const minimize = document.querySelector('.minimize');
const maximize = document.querySelector('.maximize');

minimize.addEventListener("click", () => {
    window.electronAPI.minimize();
});

maximize.addEventListener("click", async () => {
    const isMaximized = await window.electronAPI.isMaximized();
    if (isMaximized) {
        window.electronAPI.unmaximize();
    } else {
        window.electronAPI.maximize();
    }
});