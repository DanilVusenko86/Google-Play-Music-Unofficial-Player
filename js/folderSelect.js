document.addEventListener('DOMContentLoaded', function() {
    var elems = document.querySelectorAll('.modal');
    var instances = M.Modal.init(elems);

    document.getElementById('saveFolder').addEventListener('click', async () => {
        try {
            const folderPath = await window.electronAPI.selectFolder();

            if (folderPath) {
                localStorage.setItem('musicFolder', folderPath);

                window.electronAPI.scanMusicFolder(folderPath);
                
                window.location.reload();
            } else {
                alert('No folder selected.');
            }
        } catch (error) {
            console.error('Error selecting folder:', error);
        }
    });
});
