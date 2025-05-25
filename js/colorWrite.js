document.getElementById("saveColor").addEventListener("click", () => {
    const pickedColor = document.getElementById("colorPicker").value;
    window.electronAPI.saveColor(pickedColor);
});