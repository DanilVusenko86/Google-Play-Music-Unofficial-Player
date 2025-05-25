let albums = [];

fetch('json/music.json')
  .then(response => {
    if (!response.ok) throw new Error(`Failed to fetch music.json: ${response.statusText}`);
    return response.json();
  })
  .then(data => {
    if (!Array.isArray(data)) throw new Error('music.json is not an array');
    albums = data;
  })
  .catch(err => console.error('Error loading albums:', err));

document.getElementById('search-results').addEventListener('click', (event) => {
  event.stopPropagation();
});

document.getElementById('search').addEventListener('click', (event) => {
  event.stopPropagation();
});

document.body.addEventListener('click', () => {
  const resultsContainer = document.getElementById('search-results');
  if (resultsContainer) {
    resultsContainer.style.display = 'none';
  }
});

document.getElementById('search').addEventListener('input', (event) => {
  const query = event.target.value.toLowerCase().trim();
  const resultsContainer = document.getElementById('search-results');
  if (!resultsContainer) {
    console.error('Search results container not found');
    return;
  }

  resultsContainer.style.display = query ? 'block' : 'none';
  resultsContainer.innerHTML = ''; 

  if (!query || albums.length === 0) {
    if (query && albums.length === 0) {
      resultsContainer.innerHTML = '<p>No albums loaded. Please try again later.</p>';
    }
    return;
  }

  const matchingAlbums = albums.filter(album =>
    album.name.toLowerCase().includes(query) || album.artist.toLowerCase().includes(query)
  );
  const matchingSongs = [];
  albums.forEach(album => {
    const matchedTracks = album.tracks.filter(track =>
      track.title.toLowerCase().includes(query) || track.artist.toLowerCase().includes(query)
    );
    if (matchedTracks.length > 0) {
      matchingSongs.push(...matchedTracks.map(track => ({ ...track, albumName: album.name, albumCover: album.cover })));
    }
  });

  if (matchingAlbums.length > 0) {
    const albumSection = document.createElement('div');
    albumSection.innerHTML = `<h3 style="margin: 10px 0; color: #333;">Albums</h3>`;
    matchingAlbums.forEach(album => {
      const albumDiv = document.createElement('div');
      albumDiv.className = 'album-item z-depth-1';
      albumDiv.style.marginRight = '10px'
      albumDiv.style.marginBottom = '10px'
      albumDiv.innerHTML = `
        <img src="${album.cover || 'default-cover.png'}" alt="Album Cover" class="album-cover">
        <div class="album-text">
          <h1 class="album-name">${album.name}</h1>
          <p class="album-artist">${album.artist}</p>
        </div>
      `;
      albumDiv.onclick = (event) => {
        event.stopPropagation();
        showAlbumTracks(album);
      };
      albumSection.appendChild(albumDiv);
    });
    resultsContainer.appendChild(albumSection);
  }

  if (matchingSongs.length > 0) {
    const songSection = document.createElement('div');
    songSection.innerHTML = `<h3 style="margin: 10px 0; color: #333;">Songs</h3>`;
    matchingSongs.forEach((song, index) => {
      const songDiv = document.createElement('div');
      songDiv.className = 'track';
      songDiv.innerHTML = `
        <img src="${song.albumCover || 'default-cover.png'}" class="track-cover">
        <div class="text-box">
          <h1 class="album-name">${song.title}</h1>
          <p class="album-artist">${song.artist}</p>
        </div>
      `;
      songDiv.onclick = (event) => {
        event.stopPropagation();
        const album = albums.find(a => a.name === song.albumName);
        if (album) {
          const trackIndex = album.tracks.findIndex(t => t.title === song.title);
          startPlayer(album.cover, song.path, song.title, song.artist, trackIndex, album);
        }
      };
      songSection.appendChild(songDiv);
    });
    resultsContainer.appendChild(songSection);
  }

  if (matchingAlbums.length === 0 && matchingSongs.length === 0) {
    resultsContainer.innerHTML = '<p style="margin: 10px; color: #666;">No results found.</p>';
  }
});

function showAlbumTracks(album) {
  const trackList = document.getElementById('AlbumTracks');
  const trackListPanel = document.getElementById('openedAlbum');
  const naviPanel = document.getElementById('navigation');
  const albumNameEl = document.getElementById('AlbumName');
  const albumArtistEl = document.getElementById('AlbumArtist');
  const miniNameEl = document.getElementById('MiniName');
  const miniArtistEl = document.getElementById('MiniArtist');
  const songsCoverEl = document.getElementById('songsCover');
  const miniCoverEl = document.getElementById('MiniCover');
  const albumList = document.getElementById('albumList');

  if (!trackList || !trackListPanel || !naviPanel || !albumNameEl || !albumArtistEl || !miniNameEl || !miniArtistEl || !songsCoverEl || !miniCoverEl || !albumList) {
    console.error('One or more album display elements not found');
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

  albumList.style.display = 'none';

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

    const miniTrackDiv = document.createElement('div');
    miniTrackDiv.className = 'track';
    miniTrackDiv.innerHTML = `
      <div class="equalizer"></div>
      <div class="text-box">
        <h1 class="album-name">${track.title}</h1>
        <p class="album-artist">${track.artist}</p>
      </div>
    `;

    trackDiv.onclick = () => {
      const allEqualizers = document.querySelectorAll('.equalizer');
      allEqualizers.forEach(eq => eq.innerHTML = '');
      const threeBars = trackDiv.querySelector('.equalizer');
      threeBars.innerHTML = `
        <div class="bar"></div>
        <div class="bar"></div>
        <div class="bar"></div>
      `;
      startPlayer(album.cover, track.path, track.title, track.artist, index, album);
    };

    miniTrackDiv.onclick = () => {
      const allEqualizers = document.querySelectorAll('.equalizer');
      allEqualizers.forEach(eq => eq.innerHTML = '');
      const threeBars = miniTrackDiv.querySelector('.equalizer');
      threeBars.innerHTML = `
        <div class="bar"></div>
        <div class="bar"></div>
        <div class="bar"></div>
      `;
      startPlayer(album.cover, track.path, track.title, track.artist, index, album);
    };

    trackList.appendChild(trackDiv);
    document.getElementById('miniAllTracks').appendChild(miniTrackDiv);
  });
}

function startPlayer(cover, trackPath, name, artist, trackIndex, album) {
  window.clicked = true;

  const playIcon = document.getElementById('playICon');
  const songName = document.getElementById('songName');
  const songArtist = document.getElementById('songArtist');
  const playerCover = document.getElementById('playerCover');
  const audio = document.getElementById('audio');

  if (!playIcon || !songName || !songArtist || !playerCover || !audio) {
    console.error('Player elements not found in the DOM');
    return;
  }

  window.updatePlayIcon('pause');
  songName.textContent = name;
  songArtist.textContent = artist;
  playerCover.src = cover;

  audio.src = trackPath;
  audio.play().catch(err => console.error('Error playing audio:', err));

  window.currentAlbum = album;
  window.currentTrackIndex = trackIndex;

  audio.removeEventListener('timeupdate', window.updateProgressBar);
  audio.addEventListener('timeupdate', window.updateProgressBar);
}