/* ╔════════════════════════════════╗
   ║ Load Music to Player Ui        ║
   ╚════════════════════════════════╝
*/

// Elements
const albumsList = document.querySelector(".page__albums");
const tracksList = document.querySelector(".page__songs .songs__card .card__list");
const artistsList = document.querySelector(".page__artists .artists__list");
const openedAlbum = document.querySelector(".page__openedMedia");
const playList = document.querySelector(".playlist .card__list");
const searchPanel = document.querySelector(".page__search");

// Player Elements
const playerElement = document.querySelector(".player");
const trackInfo = document.querySelector(".player .player__info");

// Variables
let music = [];
let albums = new Map();

let currentPlaylist = null;
let currentPlaylistHash = null;

let folderss = JSON.parse(localStorage.getItem("settings_folders"));
let musicPlayer = new MusicPlayer();

(async () => {
   if (folderss) {
      let pathes = new ScanMusic(folderss, true);

      document.querySelector(".player .action__loading").style.display = 'flex';

      const musicFiles = await pathes.scan();
      music = musicFiles;

      for (track of music) {
         const key = track.album;

         if (!albums.has(key)) {
            albums.set(key, {
               album: track.album,
               artist: track.artist,
               thumbnail: track.thumbnail,
               year: track.year,
               tracks: []
            });
         }

         albums.get(key).tracks.push(track);
      };

      allAlbums = Array.from(albums.values());

      for (track of albums.values()) {
         console.log("[Music Loader] Tracks Loaded!");

         // Album items
         let albumItem = document.createElement("div");

         albumItem.classList.add("album");
         albumItem.innerHTML = `
         <div class="album__thumbnail image" style="background-image: url('data:image/png;base64,${track.thumbnail}')">
                <div class="album__isPlaying" style="visibility: hidden;">
                    <div class="thumbnail__bars">
                        <div class="bar bar__white"></div>
                        <div class="bar bar__white"></div>
                        <div class="bar bar__white"></div>
                    </div>
                </div>
            </div>
            <div class="album__info">
                <h1 class="album__title">${track.album}</h1>
                <p class="album__artist">${track.artist}</p>
            </div>
         `;

         albumItem.addEventListener("click", ((currentTrack) => {
            return () => {
               updateAlbum(albums, currentTrack.album);
               openAlbum();
            }
         })(track));

         albumsList.appendChild(albumItem);
      };

      tracksList.innerHTML = '';

      music.forEach(item => {
         let trackItem = document.createElement("li");
         trackItem.classList.add("list__item", "waves-effect", "waves-dark");
         trackItem.innerHTML = `
         <div class="bars" style="display: none;">
            <div class="bar bar__black"></div>
            <div class="bar bar__black"></div>
            <div class="bar bar__black"></div>
         </div>
         <div class="item__thumbnail image" style="background-image: url('data:image/png;base64,${item.thumbnail}');"></div>
         <p class="item__text text__name">${item.name}</p>
         <p class="item__text text__duration">${formatDuration(item.duration)}</p>
         <p class="item__text text__artist">${item.artist}</p>
         <p class="item__text text__album">${item.album}</p>
         <p class="item__text">0</p>
         `;

         trackItem.addEventListener("click", () => {
            musicPlayer.setPlaylist(music);
            musicPlayer.play(item);

            musicPlayer.onTimeUpdate = ({ currentTime, duration, progress }) => {
               const percent = progress * 100;
               updateProgressBar(percent);
            };

            updatePlayerInfo(musicPlayer.currentTrack);
            updatePlaylist(music, item);
            showBars(track);
         });

         tracksList.appendChild(trackItem);

      });

      document.querySelector(".player .action__loading").style.display = 'none';
   }
})();

/* =========================== */
/*    Update Album Function    */
/* =========================== */

function updateAlbum(albums, albumName) {

   var album = albums.get(albumName);

   // Adding Info to the components
   openedAlbum.querySelector(".list__header .album__thumbnail").style.backgroundImage = `url('data:image/png;base64,${album.thumbnail}')`;

   openedAlbum.querySelector(".banner").style.backgroundImage = `url('data:image/png;base64,${album.thumbnail}')`;

   openedAlbum.querySelector(".list__header .album__info .album__name").textContent = album.album;

   openedAlbum.querySelector(".list__header .album__info .album__artist").textContent = album.artist;

   openedAlbum.querySelector(".list__header .album__info .album__metadata").textContent = `${album.year}  ${album.year ? "•" : ""}  ${album.tracks.length} ${album.tracks.length <= 1 ? "song" : "songs"}`;

   // Add tracks
   openedAlbum.querySelector(".card__list").innerHTML = "";
   let order = 1; // Variable for track order

   album.tracks.forEach(track => {
      const trackItem = document.createElement("li");

      trackItem.classList.add("list__item", "waves-effect", "waves-dark");
      trackItem.innerHTML = `<div class="bars" style="display: none;">
         <div class="bar bar__black"></div>
         <div class="bar bar__black"></div>
         <div class="bar bar__black"></div>
      </div>
      <p class="item__text text__order">${order}</p>
      <p class="item__text text__name">${track.name}</p>
      <p class="item__text text__duration">${formatDuration(track.duration)}</p>
      <p class="item__text">0</p>`;

      trackItem.addEventListener("click", () => {
         musicPlayer.setPlaylist(album.tracks);
         musicPlayer.play(track);
         updateAlbumBars(album);
         updatePlaylist(album.tracks, track);
         showBars(track);
      });

      openedAlbum.querySelector(".card__list").appendChild(trackItem);
      order++;
   });

   openedAlbum.querySelector(".card__play").addEventListener("click", () => {
      showBars(album.tracks[0]);
      musicPlayer.setPlaylist(album.tracks);
      musicPlayer.play(album.tracks[0]);
      updateAlbumBars(album);
   });
}

/* =============== */
/*    Show Bars    */
/* =============== */

function showBars(track) {
   openedAlbum.querySelectorAll(".card__list .list__item").forEach(item => {
      if(item.querySelector(".text__name").textContent === track.name && openedAlbum.querySelector(".list__header .album__info .album__name").textContent === track.album) {
         item.querySelector(".bars").style.display = 'flex';
         item.querySelector(".text__order").style.display = 'none';
      } else {
         item.querySelector(".bars").style.display = 'none';
         item.querySelector(".text__order").style.display = 'block';
      }
   });

   tracksList.querySelectorAll(".list__item").forEach(item => {
      if(item.querySelector(".text__name").textContent === track.name) {
         item.querySelector(".bars").style.display = 'flex';
         item.querySelector(".item__thumbnail").style.display = 'none';
      } else {
         item.querySelector(".bars").style.display = 'none';
         item.querySelector(".item__thumbnail").style.display = 'block';
      }
   });

   playList.querySelectorAll(".list__item").forEach(item => {
      if(item.querySelector(".text__name").textContent === track.name) {
         item.querySelector(".bars").style.display = 'flex';
         item.querySelector(".item__thumbnail").style.display = 'none';
      } else {
         item.querySelector(".bars").style.display = 'none';
         item.querySelector(".item__thumbnail").style.display = 'block';
      }
   });
}

/* ===================== */
/*    Format Duration    */
/* ===================== */

function formatDuration(duration) {
   if (!duration || isNaN(duration)) return "0:00";

   const totalSeconds = Math.floor(Number(duration));
   const minutes = Math.floor(totalSeconds / 60);
   const seconds = totalSeconds % 60;

   return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

/* ======================== */
/*    Update Player Info    */
/* ======================== */

function updatePlayerInfo(track) {

   // Load Track Info
   trackInfo.style.visibility = 'visible';

   trackInfo.querySelector(".player__thumbnail").style.backgroundImage = `url('data:image/png;base64,${track.thumbnail}')`;

   trackInfo.querySelector(".track__names .info__name").textContent = track.name;

   trackInfo.querySelector(".track__names .info__artist").textContent = track.artist;
}

/* ========================= */
/*    Update Progress Bar    */
/* ========================= */

function updateProgressBar(progress) {
   const safePercent = Math.max(0, Math.min(100, progress || 0));
   playerElement.querySelector(".player__progress .player__progressbar").style.width = `${safePercent}%`;
   playerElement.querySelector(".player__progress .player__dot").style.left = `${safePercent}%`;

   playerElement.querySelector(".player__progress").addEventListener('click', (e) => {
      if (!musicPlayer.getDuration() || musicPlayer.getDuration() <= 0) return;

      const rect = playerElement.querySelector(".player__progress").getBoundingClientRect();
      const percent = (e.clientX - rect.left) / rect.width;

      const seekTime = percent * musicPlayer.getDuration();
      musicPlayer.seek(seekTime);
   });
}

/* ======================== */
/*    Clear Progress Bar    */
/* ======================== */

function clearProgressBar() {
   playerElement.querySelector(".player__progress .player__progressbar").style.width = '0%';
   playerElement.querySelector(".player__progress .player__dot").style.left = '0%';
}

/* ======================= */
/*    Update Album Bars    */
/* ======================= */

function updateAlbumBars(album) {
   albumsList.querySelectorAll(".album").forEach(item => {
      item.querySelector(".album__thumbnail .album__isPlaying").style.visibility = 'hidden';
      
      if (album.album === item.querySelector(".album__info .album__title").textContent) {
         item.querySelector(".album__thumbnail .album__isPlaying").style.visibility = 'visible';
      }
   });
}

/* ============================== */
/*    Update Playlist Function    */
/* ============================== */

function updatePlaylist(playlist, currentTrack) {
   if (!playlist || !playlist.length) return null;

   document.querySelector(".playlist .playlist__thumbnail").style.backgroundImage = `linear-gradient(rgb(0 0 0 / 62%), rgb(0 0 0 / 62%)), url('data:image/png;base64,${currentTrack.thumbnail}')`;
   
   document.querySelector(".playlist .playlist__thumbnail .thumbnail__content").style.display = 'block';
   document.querySelector(".playlist .playlist__thumbnail .thumbnail__content .album__name").textContent = currentTrack.album;

   const newHash = getPlaylistHash(playlist);

   if (newHash === currentPlaylistHash) {
      console.log("[Playlist] No changes detected");
      return;
   }

   currentPlaylist = playlist;
   currentPlaylistHash = newHash;

   document.querySelector(".playlist .card__list").innerHTML = "";

   playlist.forEach(track => {
      let trackItem = document.createElement("li");
      trackItem.classList.add("list__item", "waves-effect", "waves-dark");
      trackItem.innerHTML = `
      <div class="bars" style="display: none;">
         <div class="bar bar__black"></div>
         <div class="bar bar__black"></div>
         <div class="bar bar__black"></div>
      </div>
      <div class="item__thumbnail image" style="background-image: url('data:image/png;base64,${track.thumbnail}');"></div>
      <div class="item__box">
         <p class="item__text text__name">${track.name}</p>
         <p class="item__text text__artist">${track.artist}</p>
      </div>
      <p class="item__text text__duration">${formatDuration(track.duration)}</p>
      <p class="item__text">0</p>
      `;

      trackItem.addEventListener("click", () => {
         musicPlayer.setPlaylist(playlist);
         musicPlayer.play(track);

         musicPlayer.onTimeUpdate = ({ currentTime, duration, progress }) => {
         const percent = progress * 100;
            updateProgressBar(percent);
         };

         updatePlayerInfo(musicPlayer.currentTrack);
         showBars(track);
      });

      document.querySelector(".playlist .card__list").appendChild(trackItem);
   });
}

/* ============================== */
/*    Generates Playlist Hash     */
/* ============================== */

function getPlaylistHash(playlist) {
   if (!playlist || !playlist.length) return null;
   return playlist.map(track => track.path || track.name + track.artist + track.album).join('|');
}

/* ======================== */
/*    Add Player Buttons    */
/* ======================== */

playerElement.querySelector(".player__controls .controls__play").addEventListener("click", () => {

   if (!musicPlayer.playlist || !musicPlayer.currentTrack) return;

   musicPlayer.togglePlay();

   if (!musicPlayer.isPlaying) {
      playerElement.querySelector(".player__controls .controls__play .play__icon").textContent = 'pause';
   } else {
      playerElement.querySelector(".player__controls .controls__play .play__icon").textContent = 'play_arrow';
   }
   
});

playerElement.querySelector(".player__controls .controls__repeat").addEventListener("click", () => {

   musicPlayer.toggleRepeat();

   if (musicPlayer.repeat === 'all') {

      playerElement.querySelector(".player__controls .controls__repeat .repeat__icon").style.color = 'var(--GPMUP-base)';

      playerElement.querySelector(".player__controls .controls__repeat .repeat__icon").textContent = 'repeat';

   } else if(musicPlayer.repeat === 'one') {

      playerElement.querySelector(".player__controls .controls__repeat .repeat__icon").style.color = 'var(--GPMUP-base)';

      playerElement.querySelector(".player__controls .controls__repeat .repeat__icon").textContent = 'repeat_one';

   } else if(!musicPlayer.repeat) {

      playerElement.querySelector(".player__controls .controls__repeat .repeat__icon").style.color = '#000';

      playerElement.querySelector(".player__controls .controls__repeat .repeat__icon").textContent = 'repeat';

   }
});

playerElement.querySelector(".player__controls .controls__shuffle").addEventListener("click", () => {
   musicPlayer.toggleShuffle()

   if(musicPlayer.shuffle) {
      playerElement.querySelector(".player__controls .controls__shuffle").style.color = 'var(--GPMUP-base)';
   } else {
      playerElement.querySelector(".player__controls .controls__shuffle").style.color = '#000';
   }

});

playerElement.querySelector(".player__controls .controls__previous").addEventListener("click", () => {
   
   if (!musicPlayer.playlist || !musicPlayer.currentTrack) return;

   musicPlayer.previous();
   updatePlayerInfo(musicPlayer.currentTrack);
   showBars(musicPlayer.currentTrack);
   updatePlaylist(musicPlayer.playlist, musicPlayer.currentTrack);
});

playerElement.querySelector(".player__controls .controls__next").addEventListener("click", () => {
   
   if (!musicPlayer.playlist || !musicPlayer.currentTrack) return;

   musicPlayer.playlist.forEach((item, index) => {
      if (musicPlayer.currentTrack === item && index === musicPlayer.playlist.length -1) {
         clearProgressBar()
         playerElement.querySelector(".player__controls .controls__play .play__icon").textContent = 'play_arrow';
      }
   });

   musicPlayer.next();
   updatePlayerInfo(musicPlayer.currentTrack);
   showBars(musicPlayer.currentTrack);
   updatePlaylist(musicPlayer.playlist, musicPlayer.currentTrack);
});

playerElement.querySelector(".controls__right .controls__mute").addEventListener("click", () => {
   musicPlayer.toggleMute();

   if (musicPlayer.isMuted) {
      playerElement.querySelector(".controls__right .controls__mute .mute__icon").textContent = 'volume_off';
   } else {
      playerElement.querySelector(".controls__right .controls__mute .mute__icon").textContent = 'volume_up';
   }
});

playerElement.querySelector(".controls_playlist").addEventListener("click", () => {
   openPlaylist();
});

musicPlayer.onEnded = (track) => {
   musicPlayer.playlist.forEach((item, index) => {
      if (track === item && index === musicPlayer.playlist.length -1) {
         clearProgressBar()
         playerElement.querySelector(".player__controls .controls__play .play__icon").textContent = 'play_arrow';
      }
   });

   updatePlayerInfo(track);
   showBars(track);
   updatePlaylist(musicPlayer.playlist, track);
};

musicPlayer.onStarted = (track) => {
   
   musicPlayer.onTimeUpdate = ({ currentTime, duration, progress }) => {
      const percent = progress * 100;
      updateProgressBar(percent);
   };

   updatePlayerInfo(track);
   showBars(track);
   updatePlaylist(musicPlayer.playlist, track);
   playerElement.querySelector(".player__controls .controls__play .play__icon").textContent = 'pause';
};

/* =================== */
/*    Search Logic     */
/* =================== */

document.querySelector(".navigation .navigation__searchbar .searchbar__input").addEventListener("keydown", (e) => {
   if (e.key === "Enter") {
      e.preventDefault();
      showSearchResults(document.querySelector(".navigation .navigation__searchbar .searchbar__input").value.trim().toLowerCase());
   }
});

function showSearchResults(query) {
   if (!query) {
      searchPanel.style.visibility = "hidden";
      return;
   }

   searchPanel.style.visibility = "visible";

   const matchedAlbums = Array.from(albums.values()).filter(album =>
      album.album?.toLowerCase().includes(query) ||
      album.artist?.toLowerCase().includes(query)
   );

   const matchedTracks = music.filter(track =>
      track.name?.toLowerCase().includes(query) ||
      track.artist?.toLowerCase().includes(query) ||
      track.album?.toLowerCase().includes(query)
   );

   searchPanel.querySelector(".search__albums").innerHTML = '';
   searchPanel.querySelector(".songs__card .card__list").innerHTML = '';

   if (matchedAlbums.length === 0) {
      searchPanel.querySelector(".search__albums").innerHTML = '';
   } else {
      matchedAlbums.forEach(album => {
         const albumItem = document.createElement("div");
         albumItem.className = "album";
         albumItem.innerHTML = `
            <div class="album__thumbnail image" style="background-image: url('data:image/png;base64,${album.thumbnail}')">
               <div class="album__isPlaying" style="visibility: hidden;">
                  <div class="thumbnail__bars">
                     <div class="bar bar__white"></div>
                     <div class="bar bar__white"></div>
                     <div class="bar bar__white"></div>
                  </div>
               </div>
            </div>
            <div class="album__info">
               <h1 class="album__title">${album.album}</h1>
               <p class="album__artist">${album.artist}</p>
            </div>
         `;

         albumItem.addEventListener("click", () => {
            updateAlbum(albums, album.album);
            openAlbum();

            searchPanel.style.visibility = "hidden";
            document.querySelector(".navigation .navigation__searchbar .searchbar__input").value = "";
         });

         searchPanel.querySelector(".search__albums").appendChild(albumItem);
      });
   }

   if (matchedTracks.length === 0) {
      searchPanel.querySelector(".songs__card .card__list").innerHTML = '';
   } else {
      matchedTracks.forEach(track => {
         const item = document.createElement("li");
         item.className = "list__item waves-effect waves-dark";
         item.innerHTML = `
            <div class="item__thumbnail image" style="background-image: url('data:image/png;base64,${track.thumbnail}')"></div>
            <p class="item__text text__name">${track.name}</p>
            <p class="item__text text__duration">${formatDuration(track.duration)}</p>
            <p class="item__text text__artist">${track.artist}</p>
            <p class="item__text text__album">${track.album}</p>
            <p class="item__text text__album">0</p>
         `;

         item.addEventListener("click", () => {
            musicPlayer.setPlaylist(albums.get(track.album).tracks);
            musicPlayer.play(track);

            updatePlayerInfo(track);
            updatePlaylist(music, track);
            showBars(track);

            searchPanel.style.visibility = "hidden";
            document.querySelector(".navigation .navigation__searchbar .searchbar__input").value = "";
         });

         searchPanel.querySelector(".songs__card .card__list").appendChild(item);
      });
   }
}