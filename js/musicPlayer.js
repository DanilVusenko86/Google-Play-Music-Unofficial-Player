/* ╔════════════════════════════════╗
   ║ Music Player Class             ║
   ╚════════════════════════════════╝
*/

class MusicPlayer {
    constructor(playlist = []) {
        this.audio = new Audio();
        
        this.playlist = playlist;
        this.currentIndex = -1;
        this.currentTrack = null;
        
        this.isPlaying = false;
        this.isMuted = false;
        this.volume = 1.0;
        this.repeat = false;
        this.shuffle = false;

        this.onPlay = null;
        this.onPause = null;
        this.onTrackChange = null;
        this.onTimeUpdate = null;
        this.onEnded = null;
        this.onStarted = null;
        this.onError = null;

        this._setupAudioEvents();
    }

    _setupAudioEvents() {
        this.audio.addEventListener('play', () => {
            this.isPlaying = true;
            this.onPlay?.(this.currentTrack, this.currentIndex);
        });

        this.audio.addEventListener('pause', () => {
            this.isPlaying = false;
            this.onPause?.(this.currentTrack, this.currentIndex);
        });

        this.audio.addEventListener('timeupdate', () => {
            this.onTimeUpdate?.({
                currentTime: this.audio.currentTime,
                duration: this.audio.duration || 0,
                progress: this.audio.duration ? this.audio.currentTime / this.audio.duration : 0
            });
        });

        this.audio.addEventListener('ended', () => {
            this._handleTrackEnd();
        });

        this.audio.addEventListener('play', () => {
            this._handleTrackStart()
        });

        this.audio.addEventListener('error', (e) => {
            console.error("Audio error:", e);
            this.onError?.(e, this.currentTrack);
        });

        this.audio.volume = this.volume;
        this.audio.muted = this.isMuted;
    }

    play(track = null) {
        if (track) {
            const index = this.playlist.findIndex(t => t.path === track.path);
            if (index === -1) {
                console.warn("Track not found in playlist");
                return;
            }
            this.currentIndex = index;
            this.currentTrack = track;
            this.audio.src = track.path;
            this.audio.load();
        }

        if (this.currentIndex === -1 && this.playlist.length > 0) {
            this.currentIndex = 0;
            this.currentTrack = this.playlist[0];
            this.audio.src = this.currentTrack.path;
            this.audio.load();
        }

        this.audio.play().catch(err => {
            console.error("Play failed:", err);
        });
    }

    pause() {
        this.audio.pause();
    }

    togglePlay() {
        if (this.isPlaying) {
            this.pause();
        } else {
            this.play();
        }
    }

    next() {
        if (this.playlist.length === 0) return;

        let nextIndex;

        if (this.shuffle) {
            nextIndex = Math.floor(Math.random() * this.playlist.length);
        } else {
            nextIndex = this.currentIndex + 1;
            if (nextIndex >= this.playlist.length) {
                nextIndex = this.repeat ? 0 : -1;
            }
        }

        if (nextIndex === -1) {
            this.pause();
            return;
        }

        this.currentIndex = nextIndex;
        this.currentTrack = this.playlist[nextIndex];
        this.audio.src = this.currentTrack.path;
        this.audio.load();
        this.play();
        this.onTrackChange?.(this.currentTrack, this.currentIndex);
    }

    previous() {
        if (this.playlist.length === 0 || this.currentIndex <= 0) {
            this.seek(0);
            return;
        }

        this.currentIndex--;
        this.currentTrack = this.playlist[this.currentIndex];
        this.audio.src = this.currentTrack.path;
        this.audio.load();
        this.play();
        this.onTrackChange?.(this.currentTrack, this.currentIndex);
    }

    seek(seconds) {
        if (isNaN(seconds)) return;
        this.audio.currentTime = Math.max(0, Math.min(seconds, this.audio.duration || 0));
    }

    setVolume(value) {
        this.volume = Math.max(0, Math.min(1, value));
        this.audio.volume = this.volume;
    }

    toggleMute() {
        this.isMuted = !this.isMuted;
        this.audio.muted = this.isMuted;
    }

    toggleRepeat() {
        if (!this.repeat) {
            this.repeat = 'all';
        } else if (this.repeat === 'all') {
            this.repeat = 'one';
        } else {
            this.repeat = false;
        }
    }

    toggleShuffle() {
        this.shuffle = !this.shuffle;
    }

    _handleTrackEnd() {
        if (this.repeat === 'one') {
            this.seek(0);
            this.play();
        } else {
            this.next();
        }

        this.onEnded?.(this.currentTrack, this.currentIndex);
    }

    _handleTrackStart() {
        this.onStarted?.(this.currentTrack, this.currentIndex);
    }

    getCurrentTime() {
        return this.audio.currentTime;
    }

    getDuration() {
        return this.audio.duration || 0;
    }

    setPlaylist(newPlaylist) {
        this.playlist = newPlaylist;
        this.currentIndex = -1;
        this.currentTrack = null;
        this.audio.src = "";
        this.pause();
    }

    addTrack(track) {
        this.playlist.push(track);
    }
}