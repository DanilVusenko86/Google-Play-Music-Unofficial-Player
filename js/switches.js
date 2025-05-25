document.addEventListener('DOMContentLoaded', () => {
    async function switches() {
        const closeAlbum = document.getElementById('AlbumName');
        const openAlbums = document.getElementById('AlbumsTab');
        const openSongs = document.getElementById('SongsTab');
        const playlistbtn = document.getElementById('playlistbtn');

        const sideAlbums = document.getElementById('sideAlbum');
        const sideSnogs = document.getElementById('sideSongs');

        const albumPanel = document.getElementById('openedAlbum');
        const albumList = document.getElementById('albumList');
        const songsList = document.getElementById('trackList');
        const navigationPanel = document.getElementById('navigation');

        const response = await fetch('json/theme.json');
        const data = await response.json();

        let clicked = false;

        closeAlbum.addEventListener('click', () => {
            albumPanel.style.display = 'none';
            navigationPanel.style.background = '';
            navigationPanel.style.backgroundColor = data.highlight;
            albumList.style.display = '';
        });

        openSongs.addEventListener('click', () => {
            openAlbums.classList.remove("active");
            openSongs.classList.add("active");

            albumList.style.display = 'none';
            songsList.style.display = 'block';
        });
        openAlbums.addEventListener('click', () => {
            openAlbums.classList.add("active");
            openSongs.classList.remove("active");

            albumList.style.display = '';
            songsList.style.display = 'none';
        });

        sideSnogs.addEventListener('click', () => {
            openAlbums.classList.remove("active");
            openSongs.classList.add("active");

            albumList.style.display = 'none';
            songsList.style.display = 'block';
        });
        sideAlbums.addEventListener('click', () => {
            openAlbums.classList.add("active");
            openSongs.classList.remove("active");

            albumList.style.display = '';
            songsList.style.display = 'none';
        });

        playlistbtn.addEventListener('click', () => {
            if(clicked === false) {
                document.getElementById('miniplaylist').style.display = 'block';
                clicked = true;
            } else {
                document.getElementById('miniplaylist').style.display = 'none';
                clicked = false;
            }
        });
    }
    switches();
});