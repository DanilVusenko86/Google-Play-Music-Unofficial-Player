/* ╔════════════════════════════════╗
   ║ Scan Music Class               ║
   ╚════════════════════════════════╝
*/

class ScanMusic {
    constructor(path, subfolders) {
        this.path = path;
        this.subfolders = subfolders;
    }

    async scan() {
        const scannedMusic = await window.modules.scanFolder(this.path, this.subfolders);

        const musicPromises = scannedMusic.map(async (track) => {
            const metadata = await window.modules.getMetadata(track);
            return metadata;
        });
        
        const music = await Promise.all(musicPromises);
        const validMusic = music.filter(Boolean);

        return validMusic;
    }
}