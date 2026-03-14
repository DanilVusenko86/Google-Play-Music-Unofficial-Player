/* ╔════════════════════════════════╗
   ║ Controls Ui Elements           ║
   ╚════════════════════════════════╝
*/

// Elements
const tabButtons = document.querySelector(".navigation__bottom .navigation__tabs");
const playlistsPage = document.querySelector(".page__playlists");
const albumsPage = document.querySelector(".page__albums");
const songsPage = document.querySelector(".page__songs");
const artistsPage = document.querySelector(".page__artists");
const playlistCard = document.querySelector(".playlist");

/* ======================== */
/*    Tab Buttons Switch    */
/* ======================== */

tabButtons.querySelector(".tab__playlists").addEventListener("click", () => {
    pageSwitcher(playlistsPage, tabButtons.querySelector(".tab__playlists"));
});

tabButtons.querySelector(".tab__albums").addEventListener("click", () => {
    pageSwitcher(albumsPage, tabButtons.querySelector(".tab__albums"));
});

tabButtons.querySelector(".tab__songs").addEventListener("click", () => {
    pageSwitcher(songsPage, tabButtons.querySelector(".tab__songs"));
});

tabButtons.querySelector(".tab__artists").addEventListener("click", () => {
    pageSwitcher(artistsPage, tabButtons.querySelector(".tab__artists"));
});

/* ========================= */
/*    Open Album Function    */
/* ========================= */

function openAlbum() {
    openedAlbum.style.visibility = 'visible';

    // Turn off color for nav
    document.querySelector(".navigation").style.background = 'linear-gradient(180deg,rgba(0, 0, 0, 0.85) 1%, rgba(0, 0, 0, 0.76) 14%, rgba(255, 255, 255, 0) 100%)';

    openedAlbum.querySelector(".list__header .album__info .album__name").addEventListener("click", () => {
        clsoeAlbum();
    });
}

/* ============================ */
/*    Open Playlist Function    */
/* ============================ */

function openPlaylist() {
    let isVisible = getComputedStyle(playlistCard).visibility;
    
    if (isVisible === 'visible') {
        playlistCard.style.visibility = 'hidden';
    } else {
        playlistCard.style.visibility = 'visible';
    }
}

/* ========================== */
/*    Close Album Function    */
/* ========================== */

function clsoeAlbum() {
   openedAlbum.style.visibility = 'hidden';
   document.querySelector(".navigation").style.background = 'var(--GPMUP-base)';
   openedAlbum.querySelector(".card__list").innerHTML = "";
}

/* ================ */
/*    Switch Tabs   */
/* ================ */

function pageSwitcher(page, button) {
    document.querySelectorAll(".tab").forEach(item => {
        item.classList.remove("active");
        if (button === item) {
            item.classList.add("active");
            clsoeAlbum();
        }
    });

    document.querySelectorAll(".page").forEach(item => {
        item.style.visibility = 'hidden';
        if (page === item) {
            page.style.visibility = 'visible';
        }
    });
}

/* ==================== */
/*    Settings Apply    */
/* ==================== */

document.querySelector(".modal__settings .modal-footer .settings__apply").addEventListener("click", () => {
    applyTheme(document.querySelector(".modal__settings .modal-content #apparence .apparence__accent").value);
    if (localStorage.getItem("settings_folders")) {
        window.location.reload();
    }
});