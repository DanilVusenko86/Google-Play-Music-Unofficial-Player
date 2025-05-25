let clicked = false;
let muted = false;
let currentAlbum = null;
let isRepeating = false;
export let isShuffling = false;
let currentTrackIndex = -1;
const audioPlayer = document.getElementById('audio');
let miniPlayerWindow = null;

// Expose functions to window for search.js
window.startPlayer = startPlayer;
window.updatePlayIcon = updatePlayIcon;
window.updateShuffleIcon = updateShuffleIcon;
window.updateRepeatIcon = updateRepeatIcon;
window.updateProgressBar = updateProgressBar;

fetch('json/music.json')
  .then(response => {
    if (!response.ok) throw new Error(`Failed to fetch music.json: ${response.statusText}`);
    return response.json();
  })
  .then(albums => {
    if (!Array.isArray(albums)) throw new Error('music.json is not an array');
    displayAlbums(albums);
  })
  .catch(err => console.error('Error loading albums:', err));

function displayAlbums(albums) {
  const allTracksList = document.getElementById('AllTracks');
  if (!allTracksList) {
    console.error('Element with ID "AllTracks" not found in the DOM');
    return;
  }
  allTracksList.innerHTML = '';

  albums.forEach((album, albumIndex) => {
    if (!album.tracks || !Array.isArray(album.tracks)) {
      console.warn(`Album "${album.name || 'Unknown'}" at index ${albumIndex} has no valid tracks array`);
      return;
    }
    album.tracks.forEach((track, index) => {
      if (!track.title || !track.path || !track.artist) {
        console.warn(`Track at index ${index} in album "${album.name || 'Unknown'}" is missing required fields`);
        return;
      }
      const trackDiv = document.createElement('div');
      trackDiv.className = 'track';
      trackDiv.innerHTML = `
        <img src="${album.cover || 'default-cover.png'}" class="track-cover" id="cover-${albumIndex}-${index}">
        <div class="equalizer" style="display:none"></div>
        <div class="text-box">
          <h1 class="album-name">${track.title}</h1>
          <p class="album-artist">${track.artist}</p>
        </div>
      `;

      trackDiv.onclick = () => {
        startPlayer(album.cover || 'default-cover.png', track.path, track.title, track.artist, index, album);

        document.querySelectorAll('.track').forEach(t => {
          const cover = t.querySelector('.track-cover');
          const equalizer = t.querySelector('.equalizer');
          if (cover && equalizer) {
            cover.style.display = 'block';
            equalizer.style.display = 'none';
            equalizer.innerHTML = '';
          }
        });

        const cover = trackDiv.querySelector('.track-cover');
        const equalizer = trackDiv.querySelector('.equalizer');
        if (cover && equalizer) {
          cover.style.display = 'none';
          equalizer.style.display = 'flex';
          equalizer.innerHTML = `
            <div class="bar"></div>
            <div class="bar"></div>
            <div class="bar"></div>
          `;
        } else {
          console.error('Track cover or equalizer element not found in track div');
        }
      };

      allTracksList.appendChild(trackDiv);
    });
  });

  const container = document.getElementById('albumList');
  if (!container) {
    console.error('Element with ID "albumList" not found in the DOM');
    return;
  }
  container.innerHTML = '';

  albums.forEach((album, albumIndex) => {
    if (!album.name || !album.artist || !album.cover) {
      console.warn(`Album at index ${albumIndex} is missing required fields`);
      return;
    }
    const albumDiv = document.createElement('div');
    albumDiv.className = 'album-item z-depth-1';
    albumDiv.innerHTML = `
      <img src="${album.cover}" alt="Album Cover" class="album-cover">
      <div class="album-text">
        <h1 class="album-name">${album.name}</h1>
        <p class="album-artist">${album.artist}</p>
      </div>
    `;

    albumDiv.onclick = () => {
      const trackList = document.getElementById('AlbumTracks');
      const trackListPanel = document.getElementById('openedAlbum');
      const naviPanel = document.getElementById('navigation');
      const albumNameEl = document.getElementById('AlbumName');
      const albumArtistEl = document.getElementById('AlbumArtist');
      const miniNameEl = document.getElementById('MiniName');
      const miniArtistEl = document.getElementById('MiniArtist');
      const songsCoverEl = document.getElementById('songsCover');
      const miniCoverEl = document.getElementById('MiniCover');

      if (!trackList || !trackListPanel || !naviPanel || !albumNameEl || !albumArtistEl || !miniNameEl || !miniArtistEl || !songsCoverEl || !miniCoverEl) {
        console.error('One or more album display elements not found in the DOM');
        return;
      }

      albumNameEl.textContent = album.name;
      albumArtistEl.textContent = album.artist;
      miniNameEl.textContent = album.name;
      miniArtistEl.textContent = album.artist;
      songsCoverEl.src = album.cover;
      miniCoverEl.style.backgroundImage = `linear-gradient(90deg, rgba(0,0,0,0.88) 0%, rgba(255,255,255,0) 100%), url(${album.cover})`;

      trackListPanel.style.backgroundImage = `url(${album.cover})`;
      trackListPanel.style.display = 'flex';
      naviPanel.style.backgroundColor = '';
      naviPanel.style.background = 'linear-gradient(180deg, rgba(0,0,0,0.8800770308123249) 0%, rgba(255,255,255,0) 100%)';

      container.style.display = 'none';

      trackList.innerHTML = '';
      document.getElementById('miniAllTracks').innerHTML = '';

      album.tracks.forEach((track, index) => {
        const trackDiv = document.createElement('div');
        trackDiv.className = 'track';
        trackDiv.innerHTML = `
          <div class="equalizer"></div>
          <div class="text-box">
            <h1 class="album-name">${track.title}</h1>
            <p class="album-artist">${track.artist}</p>
          </div>
        `;

        const MinitrackDiv = document.createElement('div');
        MinitrackDiv.className = 'track';
        MinitrackDiv.innerHTML = `
          <div class="equalizer"></div>
          <div class="text-box">
            <h1 class="album-name">${track.title}</h1>
            <p class="album-artist">${track.artist}</p>
          </div>
        `;

        trackDiv.onclick = () => {
          const allEqualizers = document.querySelectorAll('.equalizer');
          allEqualizers.forEach(eq => eq.innerHTML = '');

          const threebars = trackDiv.querySelector('.equalizer');
          threebars.innerHTML = `
            <div class="bar"></div>
            <div class="bar"></div>
            <div class="bar"></div>
          `;

          startPlayer(album.cover, track.path, track.title, track.artist, index, album);
        };

        MinitrackDiv.onclick = () => {
          const allEqualizers = document.querySelectorAll('.equalizer');
          allEqualizers.forEach(eq => eq.innerHTML = '');

          const threebars = MinitrackDiv.querySelector('.equalizer');
          threebars.innerHTML = `
            <div class="bar"></div>
            <div class="bar"></div>
            <div class="bar"></div>
          `;

          startPlayer(album.cover, track.path, track.title, track.artist, index, album);
        };

        trackList.appendChild(trackDiv);
        document.getElementById('miniAllTracks').appendChild(MinitrackDiv);
      });
    };

    container.appendChild(albumDiv);
  });
}

function startPlayer(cover, trackPath, name, artist, trackIndex, album) {
  clicked = true;

  const playIcon = document.getElementById('playICon');
  const songName = document.getElementById('songName');
  const songArtist = document.getElementById('songArtist');
  const playerCover = document.getElementById('playerCover');

  if (!playIcon || !songName || !songArtist || !playerCover) {
    console.error('Player elements not found in the DOM');
    return;
  }

  updatePlayIcon('pause');
  songName.textContent = name;
  songArtist.textContent = artist;
  playerCover.src = cover;

  audioPlayer.src = trackPath;
  audioPlayer.play().catch(err => console.error('Error playing audio:', err));

  currentAlbum = album;
  currentTrackIndex = trackIndex;

  audioPlayer.removeEventListener('timeupdate', updateProgressBar);
  audioPlayer.addEventListener('timeupdate', updateProgressBar);
}

function updatePlayIcon(icon) {
  const mainPlayIcon = document.getElementById('playICon');
  if (mainPlayIcon) {
    mainPlayIcon.textContent = icon;
  }
  if (miniPlayerWindow && !miniPlayerWindow.closed) {
    const miniPlayIcon = miniPlayerWindow.document.getElementById('playICon');
    if (miniPlayIcon) {
      miniPlayIcon.textContent = icon;
    }
  }
}

function updateShuffleIcon() {
  const mainShuffleIcon = document.getElementById('shuffleIcon');
  if (mainShuffleIcon) {
    mainShuffleIcon.style.color = isShuffling ? '#ef6c00' : 'black';
  }
  if (miniPlayerWindow && !miniPlayerWindow.closed) {
    const miniShuffleIcon = miniPlayerWindow.document.getElementById('shuffleIcon');
    if (miniShuffleIcon) {
      miniShuffleIcon.style.color = isShuffling ? '#ef6c00' : 'black';
    }
  }
}

function updateRepeatIcon() {
  const mainRepeatIcon = document.getElementById('repeatIcon');
  if (mainRepeatIcon) {
    mainRepeatIcon.textContent = isRepeating ? 'repeat_one' : 'repeat';
  }
  if (miniPlayerWindow && !miniPlayerWindow.closed) {
    const miniRepeatIcon = miniPlayerWindow.document.getElementById('repeatIcon');
    if (miniRepeatIcon) {
      miniRepeatIcon.textContent = isRepeating ? 'repeat_one' : 'repeat';
    }
  }
}

function updateProgressBar() {
  if (!isDragging && audioPlayer.duration) {
    const progressPercent = (audioPlayer.currentTime / audioPlayer.duration) * 100;
    const progressBar = document.getElementById('progressBar');
    if (progressBar) {
      progressBar.style.width = `${progressPercent}%`;
    }

    if (miniPlayerWindow && !miniPlayerWindow.closed) {
      const miniProgressBar = miniPlayerWindow.document.getElementById('progressBar');
      if (miniProgressBar) {
        miniProgressBar.style.width = `${progressPercent}%`;
      }
    }
  }
}

document.getElementById('playFirst').addEventListener('click', () => {
  if (currentAlbum && currentAlbum.tracks.length > 0) {
    startPlayer(
      currentAlbum.cover,
      currentAlbum.tracks[0].path,
      currentAlbum.tracks[0].title,
      currentAlbum.tracks[0].artist,
      0,
      currentAlbum
    );
  } else {
    console.error('No album or tracks available to play');
  }
});

const playBTN = document.getElementById('play');
playBTN.addEventListener('click', play);

function play() {
  if (!clicked) {
    audioPlayer.play().catch(err => console.error('Error playing audio:', err));
    clicked = true;
    updatePlayIcon('pause');
  } else {
    audioPlayer.pause();
    clicked = false;
    updatePlayIcon('play_arrow');
  }
}

document.addEventListener('keydown', function(event) {
  if (event.code === 'Space') {
    event.preventDefault();
    play();
  }
});

document.getElementById('nextbtn').addEventListener('click', playNextTrack);
document.getElementById('prevbtn').addEventListener('click', playPreviousTrack);

function playNextTrack() {
  if (!currentAlbum || currentTrackIndex === -1) return;

  if (isShuffling) {
    currentTrackIndex = Math.floor(Math.random() * currentAlbum.tracks.length);
  } else {
    currentTrackIndex = (currentTrackIndex + 1) % currentAlbum.tracks.length;
  }

  const nextTrack = currentAlbum.tracks[currentTrackIndex];
  startPlayer(currentAlbum.cover, nextTrack.path, nextTrack.title, nextTrack.artist, currentTrackIndex, currentAlbum);
}

function playPreviousTrack() {
  if (!currentAlbum || currentTrackIndex === -1) return;

  if (isShuffling) {
    currentTrackIndex = Math.floor(Math.random() * currentAlbum.tracks.length);
  } else {
    currentTrackIndex = (currentTrackIndex - 1 + currentAlbum.tracks.length) % currentAlbum.tracks.length;
  }

  const prevTrack = currentAlbum.tracks[currentTrackIndex];
  startPlayer(currentAlbum.cover, prevTrack.path, prevTrack.title, nextTrack.artist, currentTrackIndex, currentAlbum);
}

const muteBTN = document.getElementById('mutebtn');
muteBTN.addEventListener('click', () => {
  if (!muted) {
    audioPlayer.muted = true;
    muted = true;
    document.getElementById('muteIcon').textContent = 'volume_off';
  } else {
    audioPlayer.muted = false;
    muted = false;
    document.getElementById('muteIcon').textContent = 'volume_up';
  }
});

const shuffleBTN = document.getElementById('shuffle');
shuffleBTN.addEventListener('click', shuffle);

function shuffle() {
  isShuffling = !isShuffling;
  updateShuffleIcon();
}

const repeatBTN = document.getElementById('repeat');
repeatBTN.addEventListener('click', repeat);

function repeat() {
  isRepeating = !isRepeating;
  updateRepeatIcon();
}

audioPlayer.addEventListener('ended', () => {
  if (isRepeating) {
    startPlayer(
      currentAlbum.cover,
      currentAlbum.tracks[currentTrackIndex].path,
      currentAlbum.tracks[currentTrackIndex].title,
      currentAlbum.tracks[currentTrackIndex].artist,
      currentTrackIndex,
      currentAlbum
    );
  } else {
    playNextTrack();
  }
});

const progressContainer = document.getElementById('progressContainer');
let isDragging = false;

progressContainer.addEventListener('mousedown', startDrag);
progressContainer.addEventListener('mousemove', dragProgress);
progressContainer.addEventListener('mouseup', endDrag);

function startDrag(e) {
  isDragging = true;
  setProgress(e);
}

function dragProgress(e) {
  if (isDragging) {
    setProgress(e);
  }
}

function endDrag() {
  isDragging = false;
}

function setProgress(e) {
  const width = progressContainer.clientWidth;
  const clickX = e.offsetX;
  const duration = audioPlayer.duration;

  if (duration) {
    audioPlayer.currentTime = (clickX / width) * duration;
  }
}

document.getElementById('miniplayer').addEventListener('click', () => {
  if (!currentAlbum || currentTrackIndex === -1) {
    console.error('No track selected for mini-player');
    return;
  }

  const track = currentAlbum.tracks[currentTrackIndex];
  miniPlayerWindow = window.open('', `${track.title}`, 'width=300,height=300,resizable=no,autoHideMenuBar=true');
  if (!miniPlayerWindow) {
    console.error('Failed to open mini-player window');
    return;
  }

  miniPlayerWindow.document.write(`
    <html>
      <head>
        <title>${track.title}</title>
        <style>
          body {
            background-image: url('${currentAlbum.cover}');
            background-size: cover;
            user-select: none;
            margin: 0;
          }
          .names {
            width: 100%;
            height: 50px;
            background: linear-gradient(180deg, rgba(0,0,0,0.8940826330532213) 0%, rgba(13,13,13,0.8744747899159664) 19%, rgba(28,28,28,0.8632703081232493) 28%, rgba(255,255,255,0) 91%);
            position: absolute;
            top: 0;
            left: 0;
            padding: 10px;
          }
          .names .name {
            font-size: 25px;
            color: white;
            margin-top: -4px;
          }
          .names .artist {
            font-size: 15px;
            color: white;
            margin-top: -30px;
          }
          .player {
            background-color: rgba(255, 255, 255, 0.92);
            height: 65px;
            position: absolute;
            bottom: 5px;
            left: 5px;
            right: 5px;
            border-radius: 2px;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .audio-controls {
            display: flex;
            align-items: center;
            justify-content: space-around;
            width: 280px;
          }
          #play {
            border: none;
            z-index: 5000;
            width: 45px;
            height: 45px;
            border-radius: 50%;
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;
            line-height: 40px;
            padding: 0;
            cursor: pointer;
            background-color: #ef6c00;
          }
          button {
            border: none;
            background: none;
          }
          .progress-container {
            width: 100%;
            height: 4px;
            position: absolute;
            right: 0;
            z-index: 5000;
            margin-bottom: 60px;
          }
          .progress-container div {
            width: 0;
            height: 4px;
            background-color: #ef6c00;
          }
        </style>
        <link rel="stylesheet" href="css/icon.css">
        <link rel="stylesheet" href="css/materialize.css">
      </head>
      <body>
        <div class="names">
          <p class="name">${track.title}</p>
          <p class="artist">${track.artist}</p>
        </div>
        <div class="player">
          <div class="progress-container">
            <div class="progress-bar" id="progressBar"></div>
          </div>
          <div class="audio-controls">
            <button id="repeat">
              <i class="material-icons" id="repeatIcon">${isRepeating ? 'repeat_one' : 'repeat'}</i>
            </button>
            <div style="display: flex; width: 117px;">
              <button id="prevbtn">
                <i class="material-icons">skip_previous</i>
              </button>
              <button id="play">
                <i class="material-icons" id="playICon">${clicked ? 'pause' : 'play_arrow'}</i>
              </button>
              <button id="nextbtn">
                <i class="material-icons">skip_next</i>
              </button>
            </div>
            <button id="shuffle">
              <i id="shuffleIcon" class="material-icons" style="color: ${isShuffling ? '#ef6c00' : 'black'}">shuffle</i>
            </button>
          </div>
        </div>
        <script>
          function callOpenerFunction(funcName) {
            if (window.opener && !window.opener.closed) {
              try {
                window.opener[funcName]();
              } catch (e) {
                console.error('Error calling ' + funcName + ':', e);
              }
            } else {
              console.error('Main window is closed or inaccessible');
            }
          }

          document.getElementById('play').addEventListener('click', () => {
            callOpenerFunction('playBTNmin');
          });

          document.getElementById('repeat').addEventListener('click', () => {
            callOpenerFunction('repeatSong');
          });

          document.getElementById('shuffle').addEventListener('click', () => {
            callOpenerFunction('shuffleSongs');
          });

          document.getElementById('prevbtn').addEventListener('click', () => {
            callOpenerFunction('prevSong');
          });

          document.getElementById('nextbtn').addEventListener('click', () => {
            callOpenerFunction('nextSong');
          });
        </script>
      </body>
    </html>
  `);
  miniPlayerWindow.document.close();
});

window.prevSong = function() {
  playPreviousTrack();
};

window.nextSong = function() {
  playNextTrack();
};

window.repeatSong = function() {
  repeat();
};

window.shuffleSongs = function() {
  shuffle();
};

window.playBTNmin = function() {
  play();
};